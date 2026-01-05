/**
 * Dashboard Customization Types
 * Defines the structure for user dashboard preferences
 */

/**
 * Dashboard section identifiers
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
 * Section configuration
 */
export interface DashboardSectionConfig {
  id: DashboardSectionId;
  visible: boolean;
  collapsed: boolean;
}

/**
 * Full dashboard configuration
 */
export interface DashboardConfig {
  version: number;
  sections: DashboardSectionConfig[];
}

/**
 * Section metadata for display
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
 * Available dashboard sections with metadata
 */
export const DASHBOARD_SECTIONS: DashboardSectionMeta[] = [
  {
    id: "stats",
    label: "Statistics",
    description: "Revenue, galleries, clients, and invoices overview",
    icon: "chart-bar",
    canHide: false, // Core section, always visible
    canCollapse: false,
  },
  {
    id: "quick-actions",
    label: "Quick Actions",
    description: "Shortcuts to common tasks",
    icon: "lightning-bolt",
    canHide: true,
    canCollapse: true,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Unified view of tasks, bookings, and events",
    icon: "calendar",
    canHide: true,
    canCollapse: true,
  },
  {
    id: "recent-galleries",
    label: "Recent Galleries",
    description: "Your latest photo galleries",
    icon: "photo",
    canHide: true,
    canCollapse: true,
  },
  {
    id: "upcoming-bookings",
    label: "Upcoming Bookings",
    description: "Scheduled sessions and appointments",
    icon: "clock",
    canHide: true,
    canCollapse: true,
  },
  {
    id: "recent-activity",
    label: "Recent Activity",
    description: "Latest events and updates",
    icon: "activity",
    canHide: true,
    canCollapse: true,
  },
  {
    id: "referral-widget",
    label: "Referral Program",
    description: "Earn rewards by referring others",
    icon: "gift",
    canHide: true,
    canCollapse: true,
  },
];

/**
 * Default dashboard configuration
 */
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  version: 1,
  sections: DASHBOARD_SECTIONS.map((section) => ({
    id: section.id,
    visible: true,
    collapsed: false,
  })),
};

/**
 * Get section configuration by ID
 */
export function getSectionConfig(
  config: DashboardConfig,
  sectionId: DashboardSectionId
): DashboardSectionConfig | undefined {
  return config.sections.find((s) => s.id === sectionId);
}

/**
 * Get section metadata by ID
 */
export function getSectionMeta(
  sectionId: DashboardSectionId
): DashboardSectionMeta | undefined {
  return DASHBOARD_SECTIONS.find((s) => s.id === sectionId);
}

/**
 * Check if a section is visible
 */
export function isSectionVisible(
  config: DashboardConfig,
  sectionId: DashboardSectionId
): boolean {
  const section = getSectionConfig(config, sectionId);
  return section?.visible ?? true;
}

/**
 * Check if a section is collapsed
 */
export function isSectionCollapsed(
  config: DashboardConfig,
  sectionId: DashboardSectionId
): boolean {
  const section = getSectionConfig(config, sectionId);
  return section?.collapsed ?? false;
}

/**
 * Merge user config with defaults (handles missing sections after updates)
 */
export function mergeDashboardConfig(
  userConfig: Partial<DashboardConfig> | null
): DashboardConfig {
  if (!userConfig) {
    return DEFAULT_DASHBOARD_CONFIG;
  }

  const defaultSections = DEFAULT_DASHBOARD_CONFIG.sections;
  const userSections = userConfig.sections || [];

  // Create a map of user sections for quick lookup
  const userSectionMap = new Map(userSections.map((s) => [s.id, s]));

  // Merge: use user settings where available, default for missing
  const mergedSections = defaultSections.map((defaultSection) => {
    const userSection = userSectionMap.get(defaultSection.id);
    if (userSection) {
      return userSection;
    }
    return defaultSection;
  });

  return {
    version: DEFAULT_DASHBOARD_CONFIG.version,
    sections: mergedSections,
  };
}
