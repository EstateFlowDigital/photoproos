"use server";

import { ok, fail, success, type VoidActionResult, type ActionResult } from "@/lib/types/action-result";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";
import {
  type DashboardConfig,
  type DashboardSectionId,
  type DashboardWidgetConfig,
  type WidgetInstance,
  type WidgetType,
  type WidgetSize,
  DASHBOARD_SECTIONS,
  DEFAULT_DASHBOARD_CONFIG,
  DEFAULT_WIDGET_CONFIG,
  normalizeConfig,
  generateWidgetId,
  isLegacyConfig,
} from "@/lib/dashboard-types";
import { WIDGET_REGISTRY, isValidWidgetType, isAllowedSize, getDefaultSize } from "@/lib/widget-registry";

// ============================================================================
// WIDGET-BASED DASHBOARD ACTIONS
// ============================================================================

/**
 * Get user's dashboard widget configuration (normalized to v2)
 */
const getDashboardWidgetsCached = unstable_cache(
  async (clerkUserId: string) => {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return null;
    }

    // Always normalize to widget config format
    return normalizeConfig(user.dashboardConfig);
  },
  ["dashboard-widgets"],
  { revalidate: 60 }
);

export async function getDashboardWidgets(): Promise<ActionResult<DashboardWidgetConfig>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const config = await getDashboardWidgetsCached(userId);
    if (!config) {
      return fail("User not found");
    }

    return success(config);
  } catch (error) {
    console.error("Error fetching dashboard widgets:", error);
    return fail("Failed to fetch dashboard widgets");
  }
}

/**
 * Save entire widget layout (positions and sizes)
 */
export async function saveDashboardLayout(
  widgets: WidgetInstance[]
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Validate all widgets
    for (const widget of widgets) {
      if (!isValidWidgetType(widget.type)) {
        return fail(`Invalid widget type: ${widget.type}`);
      }
      if (!isAllowedSize(widget.type, widget.size)) {
        return fail(`Invalid size ${widget.size} for widget ${widget.type}`);
      }
    }

    const config: DashboardWidgetConfig = {
      version: 2,
      widgets,
      gridColumns: 4,
    };

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardConfig: config as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error saving dashboard layout:", error);
    return fail("Failed to save dashboard layout");
  }
}

/**
 * Add a new widget to the dashboard
 */
export async function addWidget(
  type: WidgetType,
  position?: { x: number; y: number }
): Promise<ActionResult<WidgetInstance>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    if (!isValidWidgetType(type)) {
      return fail(`Invalid widget type: ${type}`);
    }

    const widgetDef = WIDGET_REGISTRY[type];

    // Check max instances
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const currentConfig = normalizeConfig(user.dashboardConfig);

    if (widgetDef.maxInstances) {
      const existingCount = currentConfig.widgets.filter((w) => w.type === type).length;
      if (existingCount >= widgetDef.maxInstances) {
        return fail(`Maximum ${widgetDef.maxInstances} instance(s) of ${widgetDef.label} allowed`);
      }
    }

    // Find next available position if not specified
    const finalPosition = position || findNextAvailablePosition(currentConfig, widgetDef.defaultSize);

    const newWidget: WidgetInstance = {
      id: generateWidgetId(),
      type,
      size: widgetDef.defaultSize,
      position: finalPosition,
    };

    const updatedConfig: DashboardWidgetConfig = {
      ...currentConfig,
      widgets: [...currentConfig.widgets, newWidget],
    };

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardConfig: updatedConfig as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard");
    return success(newWidget);
  } catch (error) {
    console.error("Error adding widget:", error);
    return fail("Failed to add widget");
  }
}

/**
 * Remove a widget from the dashboard
 */
export async function removeWidget(widgetId: string): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const currentConfig = normalizeConfig(user.dashboardConfig);

    const widgetIndex = currentConfig.widgets.findIndex((w) => w.id === widgetId);
    if (widgetIndex === -1) {
      return fail("Widget not found");
    }

    const updatedConfig: DashboardWidgetConfig = {
      ...currentConfig,
      widgets: currentConfig.widgets.filter((w) => w.id !== widgetId),
    };

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardConfig: updatedConfig as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error removing widget:", error);
    return fail("Failed to remove widget");
  }
}

/**
 * Update a widget's size
 */
export async function updateWidgetSize(
  widgetId: string,
  size: WidgetSize
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const currentConfig = normalizeConfig(user.dashboardConfig);

    const widget = currentConfig.widgets.find((w) => w.id === widgetId);
    if (!widget) {
      return fail("Widget not found");
    }

    if (!isAllowedSize(widget.type, size)) {
      return fail(`Size ${size} is not allowed for ${widget.type}`);
    }

    const updatedConfig: DashboardWidgetConfig = {
      ...currentConfig,
      widgets: currentConfig.widgets.map((w) =>
        w.id === widgetId ? { ...w, size } : w
      ),
    };

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardConfig: updatedConfig as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error updating widget size:", error);
    return fail("Failed to update widget size");
  }
}

/**
 * Update a widget's position
 */
export async function updateWidgetPosition(
  widgetId: string,
  position: { x: number; y: number }
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const currentConfig = normalizeConfig(user.dashboardConfig);

    const widgetIndex = currentConfig.widgets.findIndex((w) => w.id === widgetId);
    if (widgetIndex === -1) {
      return fail("Widget not found");
    }

    const updatedConfig: DashboardWidgetConfig = {
      ...currentConfig,
      widgets: currentConfig.widgets.map((w) =>
        w.id === widgetId ? { ...w, position } : w
      ),
    };

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardConfig: updatedConfig as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error updating widget position:", error);
    return fail("Failed to update widget position");
  }
}

/**
 * Reset dashboard to default widget configuration
 */
export async function resetDashboardWidgets(): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Generate fresh IDs for default widgets
    const freshConfig: DashboardWidgetConfig = {
      ...DEFAULT_WIDGET_CONFIG,
      widgets: DEFAULT_WIDGET_CONFIG.widgets.map((w) => ({
        ...w,
        id: generateWidgetId(),
      })),
    };

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardConfig: freshConfig as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error resetting dashboard widgets:", error);
    return fail("Failed to reset dashboard widgets");
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find the next available position for a new widget
 */
function findNextAvailablePosition(
  config: DashboardWidgetConfig,
  size: WidgetSize
): { x: number; y: number } {
  const [cols] = size.split("x").map(Number);

  // Find the maximum y position
  let maxY = 0;
  for (const widget of config.widgets) {
    const [, wRows] = widget.size.split("x").map(Number);
    const bottom = widget.position.y + wRows;
    if (bottom > maxY) {
      maxY = bottom;
    }
  }

  // Try to find a spot at each y level
  for (let y = 0; y <= maxY + 1; y++) {
    for (let x = 0; x <= config.gridColumns - cols; x++) {
      if (!hasCollision(config, { x, y }, size)) {
        return { x, y };
      }
    }
  }

  // Default to next row
  return { x: 0, y: maxY };
}

/**
 * Check if a position would collide with existing widgets
 */
function hasCollision(
  config: DashboardWidgetConfig,
  position: { x: number; y: number },
  size: WidgetSize
): boolean {
  const [newCols, newRows] = size.split("x").map(Number);
  const newRight = position.x + newCols;
  const newBottom = position.y + newRows;

  for (const widget of config.widgets) {
    const [wCols, wRows] = widget.size.split("x").map(Number);
    const wRight = widget.position.x + wCols;
    const wBottom = widget.position.y + wRows;

    // Check for overlap
    const overlapsX = position.x < wRight && newRight > widget.position.x;
    const overlapsY = position.y < wBottom && newBottom > widget.position.y;

    if (overlapsX && overlapsY) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// LEGACY SECTION-BASED ACTIONS (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use getDashboardWidgets instead
 */
const getDashboardConfigCached = unstable_cache(
  async (clerkUserId: string) => {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return null;
    }

    // Return raw config for legacy compatibility
    const raw = user.dashboardConfig as DashboardConfig | null;
    if (raw && isLegacyConfig(raw)) {
      return raw;
    }

    // If it's widget config, return legacy default for old code paths
    return DEFAULT_DASHBOARD_CONFIG;
  },
  ["dashboard-config"],
  { revalidate: 60 }
);

/**
 * @deprecated Use getDashboardWidgets instead
 */
export async function getDashboardConfig(): Promise<{
  success: boolean;
  data?: DashboardConfig;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const config = await getDashboardConfigCached(userId);
    if (!config) {
      return fail("User not found");
    }

    return success(config);
  } catch (error) {
    console.error("Error fetching dashboard config:", error);
    return fail("Failed to fetch dashboard config");
  }
}

/**
 * @deprecated Use saveDashboardLayout instead
 */
export async function updateDashboardConfig(
  config: DashboardConfig
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Only allow legacy config updates
    if (!isLegacyConfig(config)) {
      return fail("Invalid config format");
    }

    // Validate section IDs
    const validSectionIds = DASHBOARD_SECTIONS.map((s) => s.id);
    for (const section of config.sections) {
      if (!validSectionIds.includes(section.id)) {
        return fail(`Invalid section ID: ${section.id}`);
      }
    }

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardConfig: config as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error updating dashboard config:", error);
    return fail("Failed to update dashboard config");
  }
}

/**
 * @deprecated Legacy section visibility toggle
 */
export async function toggleSectionVisibility(
  sectionId: DashboardSectionId
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const sectionMeta = DASHBOARD_SECTIONS.find((s) => s.id === sectionId);
    if (!sectionMeta) {
      return fail("Invalid section ID");
    }

    if (!sectionMeta.canHide) {
      return fail("This section cannot be hidden");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const raw = user.dashboardConfig as DashboardConfig | null;
    if (!raw || !isLegacyConfig(raw)) {
      // Can't toggle sections on widget config
      return fail("Dashboard is using widget layout");
    }

    const updatedSections = raw.sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        dashboardConfig: { ...raw, sections: updatedSections } as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error toggling section visibility:", error);
    return fail("Failed to toggle section visibility");
  }
}

/**
 * @deprecated Legacy section collapsed toggle
 */
export async function toggleSectionCollapsed(
  sectionId: DashboardSectionId
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const sectionMeta = DASHBOARD_SECTIONS.find((s) => s.id === sectionId);
    if (!sectionMeta) {
      return fail("Invalid section ID");
    }

    if (!sectionMeta.canCollapse) {
      return fail("This section cannot be collapsed");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const raw = user.dashboardConfig as DashboardConfig | null;
    if (!raw || !isLegacyConfig(raw)) {
      return fail("Dashboard is using widget layout");
    }

    const updatedSections = raw.sections.map((s) =>
      s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s
    );

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        dashboardConfig: { ...raw, sections: updatedSections } as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error toggling section collapsed state:", error);
    return fail("Failed to toggle section collapsed state");
  }
}

/**
 * @deprecated Use resetDashboardWidgets instead
 */
export async function resetDashboardConfig(): Promise<VoidActionResult> {
  return resetDashboardWidgets();
}

/**
 * @deprecated Legacy section reorder
 */
export async function reorderDashboardSections(
  sectionIds: DashboardSectionId[]
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    const validSectionIds = DASHBOARD_SECTIONS.map((s) => s.id);
    for (const id of sectionIds) {
      if (!validSectionIds.includes(id)) {
        return fail(`Invalid section ID: ${id}`);
      }
    }

    if (sectionIds.length !== validSectionIds.length) {
      return fail("All sections must be included in the reorder");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { dashboardConfig: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const raw = user.dashboardConfig as DashboardConfig | null;
    if (!raw || !isLegacyConfig(raw)) {
      return fail("Dashboard is using widget layout");
    }

    const sectionMap = new Map(raw.sections.map((s) => [s.id, s]));
    const reorderedSections = sectionIds.map((id) => {
      const section = sectionMap.get(id);
      if (!section) {
        return { id, visible: true, collapsed: false };
      }
      return section;
    });

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        dashboardConfig: { ...raw, sections: reorderedSections } as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error reordering dashboard sections:", error);
    return fail("Failed to reorder dashboard sections");
  }
}
