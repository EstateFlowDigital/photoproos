/**
 * Dashboard Widget System Types
 * Defines the structure for user dashboard widget preferences
 */

// ============================================================================
// WIDGET TYPES
// ============================================================================

/**
 * All available widget types
 */
export type WidgetType =
  // Core Stats (1x1 size)
  | "stats-revenue"
  | "stats-galleries"
  | "stats-clients"
  | "stats-invoices"
  // Content Widgets
  | "quick-actions"
  | "calendar"
  | "recent-galleries"
  | "upcoming-bookings"
  | "recent-activity"
  | "overdue-invoices"
  | "expiring-galleries"
  // Analytics Widgets
  | "revenue-chart"
  | "client-growth"
  | "contract-status"
  | "deadlines"
  // Productivity Widgets
  | "todo-list"
  | "notes"
  | "weather"
  // Engagement Widgets
  | "gamification"
  | "daily-bonus"
  | "referral-widget"
  | "onboarding"
  // Communication Widgets
  | "messages";

/**
 * Widget size options (columns x rows)
 */
export type WidgetSize = "1x1" | "2x1" | "2x2" | "3x1" | "3x2" | "4x1" | "4x2";

/**
 * Widget category for grouping in add widget modal
 */
export type WidgetCategory = "core" | "content" | "analytics" | "productivity" | "engagement";

/**
 * Individual widget instance in the dashboard
 */
export interface WidgetInstance {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  position: { x: number; y: number };
}

/**
 * Full widget-based dashboard configuration
 */
export interface DashboardWidgetConfig {
  version: 2;
  widgets: WidgetInstance[];
  gridColumns: number;
}

// ============================================================================
// LEGACY SECTION TYPES (for migration)
// ============================================================================

/**
 * @deprecated Use WidgetType instead - kept for migration
 */
export type DashboardSectionId =
  | "stats"
  | "quick-actions"
  | "calendar"
  | "recent-galleries"
  | "upcoming-bookings"
  | "recent-activity"
  | "referral-widget";

/**
 * @deprecated Use WidgetInstance instead - kept for migration
 */
export interface DashboardSectionConfig {
  id: DashboardSectionId;
  visible: boolean;
  collapsed: boolean;
}

/**
 * @deprecated Use DashboardWidgetConfig instead - kept for migration
 */
export interface LegacyDashboardConfig {
  version: 1;
  sections: DashboardSectionConfig[];
}

/**
 * Union type for any dashboard config format
 */
export type DashboardConfig = DashboardWidgetConfig | LegacyDashboardConfig;

// ============================================================================
// WIDGET SIZE UTILITIES
// ============================================================================

/**
 * Parse widget size into columns and rows
 */
export function parseWidgetSize(size: WidgetSize): { cols: number; rows: number } {
  const [cols, rows] = size.split("x").map(Number);
  return { cols, rows };
}

/**
 * Get CSS grid span classes for a widget size
 */
export function getWidgetGridSpan(size: WidgetSize): string {
  const { cols, rows } = parseWidgetSize(size);
  return `col-span-${cols} row-span-${rows}`;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Generate a unique widget ID
 */
export function generateWidgetId(): string {
  return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Default widgets for a new dashboard
 */
export const DEFAULT_WIDGETS: WidgetInstance[] = [
  // Row 1: Stats (4 x 1x1)
  { id: generateWidgetId(), type: "stats-revenue", size: "1x1", position: { x: 0, y: 0 } },
  { id: generateWidgetId(), type: "stats-galleries", size: "1x1", position: { x: 1, y: 0 } },
  { id: generateWidgetId(), type: "stats-clients", size: "1x1", position: { x: 2, y: 0 } },
  { id: generateWidgetId(), type: "stats-invoices", size: "1x1", position: { x: 3, y: 0 } },
  // Row 2: Quick Actions (2x1) + Upcoming Bookings (2x1)
  { id: generateWidgetId(), type: "quick-actions", size: "2x1", position: { x: 0, y: 1 } },
  { id: generateWidgetId(), type: "upcoming-bookings", size: "2x1", position: { x: 2, y: 1 } },
  // Row 3: Calendar (2x2) + Recent Galleries (2x2)
  { id: generateWidgetId(), type: "calendar", size: "2x2", position: { x: 0, y: 2 } },
  { id: generateWidgetId(), type: "recent-galleries", size: "2x2", position: { x: 2, y: 2 } },
  // Row 5: Recent Activity (2x1) + Gamification (2x1)
  { id: generateWidgetId(), type: "recent-activity", size: "2x1", position: { x: 0, y: 4 } },
  { id: generateWidgetId(), type: "gamification", size: "2x1", position: { x: 2, y: 4 } },
];

/**
 * Default dashboard widget configuration
 */
export const DEFAULT_WIDGET_CONFIG: DashboardWidgetConfig = {
  version: 2,
  widgets: DEFAULT_WIDGETS,
  gridColumns: 4,
};

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Check if config is legacy format
 */
export function isLegacyConfig(config: unknown): config is LegacyDashboardConfig {
  if (!config || typeof config !== "object") return false;
  const c = config as Record<string, unknown>;
  return c.version === 1 && Array.isArray(c.sections);
}

/**
 * Check if config is widget format
 */
export function isWidgetConfig(config: unknown): config is DashboardWidgetConfig {
  if (!config || typeof config !== "object") return false;
  const c = config as Record<string, unknown>;
  return c.version === 2 && Array.isArray(c.widgets);
}

/**
 * Migrate legacy section config to widget config
 */
export function migrateLegacyConfig(legacy: LegacyDashboardConfig): DashboardWidgetConfig {
  const widgets: WidgetInstance[] = [];
  let y = 0;

  // Map old sections to new widgets
  const sectionToWidget: Record<DashboardSectionId, { type: WidgetType; size: WidgetSize }[]> = {
    stats: [
      { type: "stats-revenue", size: "1x1" },
      { type: "stats-galleries", size: "1x1" },
      { type: "stats-clients", size: "1x1" },
      { type: "stats-invoices", size: "1x1" },
    ],
    "quick-actions": [{ type: "quick-actions", size: "2x1" }],
    calendar: [{ type: "calendar", size: "2x2" }],
    "recent-galleries": [{ type: "recent-galleries", size: "2x2" }],
    "upcoming-bookings": [{ type: "upcoming-bookings", size: "2x1" }],
    "recent-activity": [{ type: "recent-activity", size: "2x1" }],
    "referral-widget": [{ type: "referral-widget", size: "2x1" }],
  };

  // Process each visible section
  for (const section of legacy.sections) {
    if (!section.visible) continue;

    const widgetDefs = sectionToWidget[section.id];
    if (!widgetDefs) continue;

    let x = 0;
    for (const def of widgetDefs) {
      widgets.push({
        id: generateWidgetId(),
        type: def.type,
        size: def.size,
        position: { x, y },
      });

      const { cols } = parseWidgetSize(def.size);
      x += cols;
      if (x >= 4) {
        x = 0;
        y++;
      }
    }

    // Move to next row after each section
    if (x > 0) {
      y++;
    }
  }

  return {
    version: 2,
    widgets: widgets.length > 0 ? widgets : DEFAULT_WIDGETS,
    gridColumns: 4,
  };
}

/**
 * Get normalized widget config from any format
 */
export function normalizeConfig(config: unknown): DashboardWidgetConfig {
  if (isWidgetConfig(config)) {
    return config;
  }

  if (isLegacyConfig(config)) {
    return migrateLegacyConfig(config);
  }

  return DEFAULT_WIDGET_CONFIG;
}

// ============================================================================
// WIDGET HELPERS
// ============================================================================

/**
 * Find a widget by ID
 */
export function findWidget(
  config: DashboardWidgetConfig,
  widgetId: string
): WidgetInstance | undefined {
  return config.widgets.find((w) => w.id === widgetId);
}

/**
 * Get widgets by type
 */
export function getWidgetsByType(
  config: DashboardWidgetConfig,
  type: WidgetType
): WidgetInstance[] {
  return config.widgets.filter((w) => w.type === type);
}

/**
 * Check if a widget type exists in config
 */
export function hasWidgetType(config: DashboardWidgetConfig, type: WidgetType): boolean {
  return config.widgets.some((w) => w.type === type);
}

// ============================================================================
// LEGACY HELPERS (for backward compatibility during transition)
// ============================================================================

/**
 * @deprecated Use normalizeConfig instead
 */
export interface DashboardSectionMeta {
  id: DashboardSectionId;
  label: string;
  description: string;
  icon: string;
  canHide: boolean;
  canCollapse: boolean;
}

/**
 * @deprecated Legacy sections - use WIDGET_REGISTRY instead
 */
export const DASHBOARD_SECTIONS: DashboardSectionMeta[] = [
  { id: "stats", label: "Statistics", description: "Overview metrics", icon: "chart-bar", canHide: false, canCollapse: false },
  { id: "quick-actions", label: "Quick Actions", description: "Shortcuts", icon: "lightning-bolt", canHide: true, canCollapse: true },
  { id: "calendar", label: "Calendar", description: "Schedule", icon: "calendar", canHide: true, canCollapse: true },
  { id: "recent-galleries", label: "Recent Galleries", description: "Galleries", icon: "photo", canHide: true, canCollapse: true },
  { id: "upcoming-bookings", label: "Upcoming Bookings", description: "Bookings", icon: "clock", canHide: true, canCollapse: true },
  { id: "recent-activity", label: "Recent Activity", description: "Activity", icon: "activity", canHide: true, canCollapse: true },
  { id: "referral-widget", label: "Referral Program", description: "Referrals", icon: "gift", canHide: true, canCollapse: true },
];

/**
 * @deprecated Use DEFAULT_WIDGET_CONFIG instead
 */
export const DEFAULT_DASHBOARD_CONFIG: LegacyDashboardConfig = {
  version: 1,
  sections: DASHBOARD_SECTIONS.map((s) => ({ id: s.id, visible: true, collapsed: false })),
};

/**
 * @deprecated Use findWidget instead
 */
export function getSectionConfig(
  config: DashboardConfig,
  sectionId: DashboardSectionId
): DashboardSectionConfig | undefined {
  if (isLegacyConfig(config)) {
    return config.sections.find((s) => s.id === sectionId);
  }
  return undefined;
}

/**
 * @deprecated Use WIDGET_REGISTRY instead
 */
export function getSectionMeta(sectionId: DashboardSectionId): DashboardSectionMeta | undefined {
  return DASHBOARD_SECTIONS.find((s) => s.id === sectionId);
}

/**
 * @deprecated Check widget existence instead
 */
export function isSectionVisible(config: DashboardConfig, sectionId: DashboardSectionId): boolean {
  if (isLegacyConfig(config)) {
    const section = config.sections.find((s) => s.id === sectionId);
    return section?.visible ?? true;
  }
  // For widget config, map section to widget types and check if any exist
  const typeMap: Record<DashboardSectionId, WidgetType[]> = {
    stats: ["stats-revenue", "stats-galleries", "stats-clients", "stats-invoices"],
    "quick-actions": ["quick-actions"],
    calendar: ["calendar"],
    "recent-galleries": ["recent-galleries"],
    "upcoming-bookings": ["upcoming-bookings"],
    "recent-activity": ["recent-activity"],
    "referral-widget": ["referral-widget"],
  };
  const types = typeMap[sectionId] || [];
  const widgetConfig = config as DashboardWidgetConfig;
  return types.some((t) => hasWidgetType(widgetConfig, t));
}

/**
 * @deprecated Widget config doesn't have collapsed state
 */
export function isSectionCollapsed(config: DashboardConfig, sectionId: DashboardSectionId): boolean {
  if (isLegacyConfig(config)) {
    const section = config.sections.find((s) => s.id === sectionId);
    return section?.collapsed ?? false;
  }
  return false;
}

/**
 * @deprecated Use normalizeConfig instead
 */
export function mergeDashboardConfig(userConfig: unknown): DashboardConfig {
  return normalizeConfig(userConfig);
}
