/**
 * Widget Registry
 * Central registry of all available dashboard widgets
 */

import type { WidgetType, WidgetSize, WidgetCategory } from "./dashboard-types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Widget definition with metadata
 */
export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;
  category: WidgetCategory;
  defaultSize: WidgetSize;
  allowedSizes: WidgetSize[];
  minWidth: number; // Minimum columns
  minHeight: number; // Minimum rows
  maxInstances?: number; // Maximum instances allowed (undefined = unlimited)
}

/**
 * Widget render props passed to widget components
 */
export interface WidgetRenderProps {
  widgetId: string;
  size: WidgetSize;
  isEditing?: boolean;
  // Data props will be passed separately based on widget type
}

// ============================================================================
// WIDGET REGISTRY
// ============================================================================

/**
 * Complete registry of all available widgets
 */
export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  // ---------------------------------------------------------------------------
  // CORE STATS WIDGETS (1x1)
  // ---------------------------------------------------------------------------
  "stats-revenue": {
    type: "stats-revenue",
    label: "Revenue",
    description: "Monthly revenue with trend",
    icon: "dollar-sign",
    category: "core",
    defaultSize: "1x1",
    allowedSizes: ["1x1"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },
  "stats-galleries": {
    type: "stats-galleries",
    label: "Galleries",
    description: "Total galleries count",
    icon: "image",
    category: "core",
    defaultSize: "1x1",
    allowedSizes: ["1x1"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },
  "stats-clients": {
    type: "stats-clients",
    label: "Clients",
    description: "Total clients count",
    icon: "users",
    category: "core",
    defaultSize: "1x1",
    allowedSizes: ["1x1"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },
  "stats-invoices": {
    type: "stats-invoices",
    label: "Invoices",
    description: "Pending invoices count",
    icon: "file-text",
    category: "core",
    defaultSize: "1x1",
    allowedSizes: ["1x1"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },

  // ---------------------------------------------------------------------------
  // CONTENT WIDGETS
  // ---------------------------------------------------------------------------
  "quick-actions": {
    type: "quick-actions",
    label: "Quick Actions",
    description: "Shortcuts to common tasks",
    icon: "zap",
    category: "content",
    defaultSize: "2x1",
    allowedSizes: ["2x1", "3x1", "4x1"],
    minWidth: 2,
    minHeight: 1,
    maxInstances: 1,
  },
  calendar: {
    type: "calendar",
    label: "Calendar",
    description: "Schedule and upcoming events",
    icon: "calendar",
    category: "content",
    defaultSize: "2x2",
    allowedSizes: ["2x2", "3x2", "4x2"],
    minWidth: 2,
    minHeight: 2,
    maxInstances: 1,
  },
  "recent-galleries": {
    type: "recent-galleries",
    label: "Recent Galleries",
    description: "Your latest photo galleries",
    icon: "image",
    category: "content",
    defaultSize: "2x2",
    allowedSizes: ["2x1", "2x2", "3x2", "4x2"],
    minWidth: 2,
    minHeight: 1,
    maxInstances: 1,
  },
  "upcoming-bookings": {
    type: "upcoming-bookings",
    label: "Upcoming Bookings",
    description: "Scheduled sessions",
    icon: "clock",
    category: "content",
    defaultSize: "2x1",
    allowedSizes: ["1x1", "2x1", "2x2"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },
  "recent-activity": {
    type: "recent-activity",
    label: "Recent Activity",
    description: "Latest events and updates",
    icon: "activity",
    category: "content",
    defaultSize: "2x1",
    allowedSizes: ["2x1", "2x2", "3x2"],
    minWidth: 2,
    minHeight: 1,
    maxInstances: 1,
  },
  "overdue-invoices": {
    type: "overdue-invoices",
    label: "Overdue Invoices",
    description: "Invoices needing attention",
    icon: "alert-circle",
    category: "content",
    defaultSize: "2x1",
    allowedSizes: ["1x1", "2x1", "2x2"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },
  "expiring-galleries": {
    type: "expiring-galleries",
    label: "Expiring Galleries",
    description: "Galleries expiring soon",
    icon: "clock",
    category: "content",
    defaultSize: "2x1",
    allowedSizes: ["1x1", "2x1", "2x2"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },

  // ---------------------------------------------------------------------------
  // ANALYTICS WIDGETS
  // ---------------------------------------------------------------------------
  "revenue-chart": {
    type: "revenue-chart",
    label: "Revenue Chart",
    description: "Revenue trends over time",
    icon: "trending-up",
    category: "analytics",
    defaultSize: "2x2",
    allowedSizes: ["2x2", "3x2", "4x2"],
    minWidth: 2,
    minHeight: 2,
    maxInstances: 1,
  },
  "client-growth": {
    type: "client-growth",
    label: "Client Growth",
    description: "Client acquisition trends",
    icon: "users",
    category: "analytics",
    defaultSize: "2x2",
    allowedSizes: ["2x2", "3x2"],
    minWidth: 2,
    minHeight: 2,
    maxInstances: 1,
  },
  "contract-status": {
    type: "contract-status",
    label: "Contract Status",
    description: "Contract signing progress",
    icon: "file-check",
    category: "analytics",
    defaultSize: "2x1",
    allowedSizes: ["2x1", "2x2"],
    minWidth: 2,
    minHeight: 1,
    maxInstances: 1,
  },
  deadlines: {
    type: "deadlines",
    label: "Deadlines",
    description: "Upcoming project deadlines",
    icon: "alert-triangle",
    category: "analytics",
    defaultSize: "2x1",
    allowedSizes: ["1x1", "2x1", "2x2"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },

  // ---------------------------------------------------------------------------
  // PRODUCTIVITY WIDGETS
  // ---------------------------------------------------------------------------
  "todo-list": {
    type: "todo-list",
    label: "To-Do List",
    description: "Personal task list",
    icon: "check-square",
    category: "productivity",
    defaultSize: "2x2",
    allowedSizes: ["1x1", "2x1", "2x2"],
    minWidth: 1,
    minHeight: 1,
  },
  notes: {
    type: "notes",
    label: "Quick Notes",
    description: "Scratch pad for notes",
    icon: "edit-3",
    category: "productivity",
    defaultSize: "2x2",
    allowedSizes: ["1x1", "2x1", "2x2"],
    minWidth: 1,
    minHeight: 1,
  },
  weather: {
    type: "weather",
    label: "Weather",
    description: "Local weather forecast",
    icon: "cloud",
    category: "productivity",
    defaultSize: "1x1",
    allowedSizes: ["1x1", "2x1"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },

  // ---------------------------------------------------------------------------
  // ENGAGEMENT WIDGETS
  // ---------------------------------------------------------------------------
  gamification: {
    type: "gamification",
    label: "Progress & Level",
    description: "Your achievements and level",
    icon: "award",
    category: "engagement",
    defaultSize: "2x1",
    allowedSizes: ["1x1", "2x1", "2x2"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },
  "daily-bonus": {
    type: "daily-bonus",
    label: "Daily Bonus",
    description: "Claim daily rewards",
    icon: "gift",
    category: "engagement",
    defaultSize: "1x1",
    allowedSizes: ["1x1", "2x1"],
    minWidth: 1,
    minHeight: 1,
    maxInstances: 1,
  },
  "referral-widget": {
    type: "referral-widget",
    label: "Referral Program",
    description: "Earn rewards by referring",
    icon: "share-2",
    category: "engagement",
    defaultSize: "2x1",
    allowedSizes: ["2x1", "2x2", "4x1"],
    minWidth: 2,
    minHeight: 1,
    maxInstances: 1,
  },
  onboarding: {
    type: "onboarding",
    label: "Getting Started",
    description: "Setup checklist",
    icon: "check-circle",
    category: "engagement",
    defaultSize: "4x1",
    allowedSizes: ["2x1", "3x1", "4x1", "4x2"],
    minWidth: 2,
    minHeight: 1,
    maxInstances: 1,
  },

  // ---------------------------------------------------------------------------
  // COMMUNICATION WIDGETS
  // ---------------------------------------------------------------------------
  messages: {
    type: "messages",
    label: "Messages",
    description: "Recent message feed",
    icon: "message-square",
    category: "content",
    defaultSize: "2x2",
    allowedSizes: ["2x1", "2x2", "3x2", "4x2"],
    minWidth: 2,
    minHeight: 1,
    maxInstances: 1,
  },
};

// ============================================================================
// CATEGORY METADATA
// ============================================================================

export interface CategoryMeta {
  id: WidgetCategory;
  label: string;
  description: string;
  icon: string;
}

export const WIDGET_CATEGORIES: CategoryMeta[] = [
  {
    id: "core",
    label: "Key Metrics",
    description: "Essential business statistics",
    icon: "bar-chart-2",
  },
  {
    id: "content",
    label: "Content",
    description: "Galleries, bookings, and activity",
    icon: "layout",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Charts and trends",
    icon: "trending-up",
  },
  {
    id: "productivity",
    label: "Productivity",
    description: "Tasks and notes",
    icon: "check-square",
  },
  {
    id: "engagement",
    label: "Engagement",
    description: "Rewards and progress",
    icon: "award",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get widget definition by type
 */
export function getWidgetDefinition(type: WidgetType): WidgetDefinition {
  return WIDGET_REGISTRY[type];
}

/**
 * Get all widgets in a category
 */
export function getWidgetsByCategory(category: WidgetCategory): WidgetDefinition[] {
  return Object.values(WIDGET_REGISTRY).filter((w) => w.category === category);
}

/**
 * Get all widget types
 */
export function getAllWidgetTypes(): WidgetType[] {
  return Object.keys(WIDGET_REGISTRY) as WidgetType[];
}

/**
 * Check if a widget type is valid
 */
export function isValidWidgetType(type: string): type is WidgetType {
  return type in WIDGET_REGISTRY;
}

/**
 * Check if a size is allowed for a widget type
 */
export function isAllowedSize(type: WidgetType, size: WidgetSize): boolean {
  const def = WIDGET_REGISTRY[type];
  return def?.allowedSizes.includes(size) ?? false;
}

/**
 * Get the default size for a widget type
 */
export function getDefaultSize(type: WidgetType): WidgetSize {
  return WIDGET_REGISTRY[type]?.defaultSize ?? "1x1";
}

/**
 * Get category metadata
 */
export function getCategoryMeta(category: WidgetCategory): CategoryMeta | undefined {
  return WIDGET_CATEGORIES.find((c) => c.id === category);
}
