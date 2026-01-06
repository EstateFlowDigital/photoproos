"use server";

import { ok, fail, success, type VoidActionResult } from "@/lib/types/action-result";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";
import {
  type DashboardConfig,
  type DashboardSectionId,
  DASHBOARD_SECTIONS,
  DEFAULT_DASHBOARD_CONFIG,
  mergeDashboardConfig,
} from "@/lib/dashboard-types";

/**
 * Get user's dashboard configuration
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

    return mergeDashboardConfig(user.dashboardConfig as Partial<DashboardConfig> | null);
  },
  ["dashboard-config"],
  { revalidate: 60 } // refresh every 60s; revalidated explicitly on updates
);

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
 * Update user's dashboard configuration
 */
export async function updateDashboardConfig(
  config: DashboardConfig
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
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
 * Toggle section visibility
 */
export async function toggleSectionVisibility(
  sectionId: DashboardSectionId
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Validate section ID
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

    const currentConfig = mergeDashboardConfig(
      user.dashboardConfig as Partial<DashboardConfig> | null
    );

    // Toggle visibility
    const updatedSections = currentConfig.sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        dashboardConfig: { ...currentConfig, sections: updatedSections } as unknown as Prisma.InputJsonValue,
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
 * Toggle section collapsed state
 */
export async function toggleSectionCollapsed(
  sectionId: DashboardSectionId
): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    // Validate section ID
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

    const currentConfig = mergeDashboardConfig(
      user.dashboardConfig as Partial<DashboardConfig> | null
    );

    // Toggle collapsed
    const updatedSections = currentConfig.sections.map((s) =>
      s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s
    );

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        dashboardConfig: { ...currentConfig, sections: updatedSections } as unknown as Prisma.InputJsonValue,
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
 * Reset dashboard configuration to defaults
 */
export async function resetDashboardConfig(): Promise<VoidActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized");
    }

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardConfig: DEFAULT_DASHBOARD_CONFIG as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    console.error("Error resetting dashboard config:", error);
    return fail("Failed to reset dashboard config");
  }
}
