/**
 * Dashboard Widget System Types
 * Defines the structure for customizable dashboard widgets
 */

import type { ComponentType, ReactNode } from "react";

/**
 * Photography types matching the Prisma enum
 */
export type PhotographyType =
  | "real_estate"
  | "wedding"
  | "commercial"
  | "portrait"
  | "events"
  | "architecture"
  | "food_hospitality"
  | "general";

/**
 * Widget size options
 */
export type WidgetSize = "small" | "medium" | "large" | "full";

/**
 * Widget category for organization
 */
export type WidgetCategory =
  | "analytics"
  | "financial"
  | "scheduling"
  | "projects"
  | "communication"
  | "productivity"
  | "marketing"
  | "other";

/**
 * Widget identifiers
 */
export type WidgetId =
  // Core widgets
  | "key-metrics"
  | "quick-actions"
  | "recent-activity"
  | "upcoming-bookings"
  | "overdue-invoices"
  | "expiring-galleries"
  | "onboarding-checklist"
  // Extended widgets - Analytics
  | "revenue-overview"
  | "revenue-chart"
  | "monthly-comparison"
  | "client-growth"
  | "booking-trends"
  | "revenue-goals"
  | "revenue-by-service"
  // Extended widgets - Financial
  | "payment-activity"
  | "outstanding-balance"
  | "invoice-aging"
  | "expense-tracker"
  // Extended widgets - Scheduling
  | "calendar-preview"
  | "availability-status"
  | "weather-forecast"
  | "travel-schedule"
  // Extended widgets - Projects
  | "recent-galleries"
  | "pending-deliveries"
  | "contract-status"
  | "questionnaire-status"
  // Extended widgets - Communication
  | "unread-messages"
  | "client-birthdays"
  | "follow-up-reminders"
  // Extended widgets - Productivity
  | "to-do-list"
  | "deadlines"
  | "equipment-checklist"
  | "notes"
  // Extended widgets - Marketing
  | "referral-program"
  | "social-stats"
  | "property-websites"
  // Other
  | "custom";

/**
 * Widget definition with metadata
 */
export interface WidgetDefinition {
  id: WidgetId;
  name: string;
  description: string;
  category: WidgetCategory;
  defaultSize: WidgetSize;
  minSize?: WidgetSize;
  maxSize?: WidgetSize;
  icon: string;
  configurable: boolean;
  defaultConfig?: Record<string, unknown>;
  requiredPlan?: "free" | "pro" | "studio" | "enterprise";
}

/**
 * Widget instance configuration
 */
export interface WidgetConfig {
  id: string; // Unique instance ID
  widgetId: WidgetId;
  size: WidgetSize;
  visible: boolean;
  collapsed: boolean;
  settings: Record<string, unknown>;
}

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  version: number;
  widgets: WidgetConfig[];
  order: string[]; // Widget instance IDs in order
  layoutPreset: PhotographyType | "custom";
}

/**
 * Widget library - All available widgets
 */
export const WIDGET_LIBRARY: WidgetDefinition[] = [
  // Core Widgets (Always Available)
  {
    id: "key-metrics",
    name: "Key Metrics",
    description: "Revenue, projects, clients, and invoices at a glance",
    category: "analytics",
    defaultSize: "full",
    minSize: "large",
    icon: "bar-chart-2",
    configurable: true,
    defaultConfig: {
      showRevenue: true,
      showProjects: true,
      showClients: true,
      showInvoices: true,
      period: "30d",
    },
  },
  {
    id: "quick-actions",
    name: "Quick Actions",
    description: "Shortcuts to common tasks",
    category: "productivity",
    defaultSize: "medium",
    icon: "zap",
    configurable: true,
    defaultConfig: {
      actions: ["new-gallery", "new-client", "new-invoice", "new-booking"],
    },
  },
  {
    id: "recent-activity",
    name: "Recent Activity",
    description: "Timeline of recent actions and events",
    category: "other",
    defaultSize: "large",
    icon: "activity",
    configurable: true,
    defaultConfig: {
      limit: 10,
      showTypes: ["all"],
    },
  },
  {
    id: "upcoming-bookings",
    name: "Upcoming Bookings",
    description: "Next scheduled sessions and appointments",
    category: "scheduling",
    defaultSize: "medium",
    icon: "calendar-clock",
    configurable: true,
    defaultConfig: {
      limit: 5,
      daysAhead: 7,
    },
  },
  {
    id: "overdue-invoices",
    name: "Overdue Invoices",
    description: "Invoices requiring attention",
    category: "financial",
    defaultSize: "medium",
    icon: "alert-triangle",
    configurable: true,
    defaultConfig: {
      limit: 5,
    },
  },
  {
    id: "expiring-galleries",
    name: "Expiring Galleries",
    description: "Galleries expiring soon",
    category: "projects",
    defaultSize: "medium",
    icon: "clock",
    configurable: true,
    defaultConfig: {
      limit: 5,
      daysAhead: 14,
    },
  },
  {
    id: "onboarding-checklist",
    name: "Onboarding Checklist",
    description: "Setup progress tracker for new users",
    category: "productivity",
    defaultSize: "medium",
    icon: "check-square",
    configurable: false,
  },

  // Analytics Widgets
  {
    id: "revenue-overview",
    name: "Revenue Overview",
    description: "Monthly revenue summary with trends",
    category: "analytics",
    defaultSize: "large",
    icon: "dollar-sign",
    configurable: true,
    defaultConfig: {
      period: "monthly",
      showTrend: true,
    },
  },
  {
    id: "revenue-chart",
    name: "Revenue Chart",
    description: "Visual revenue breakdown over time",
    category: "analytics",
    defaultSize: "large",
    icon: "trending-up",
    configurable: true,
    defaultConfig: {
      chartType: "line",
      period: "6m",
    },
  },
  {
    id: "monthly-comparison",
    name: "Monthly Comparison",
    description: "Compare this month to previous periods",
    category: "analytics",
    defaultSize: "medium",
    icon: "git-compare",
    configurable: true,
    defaultConfig: {
      compareTo: "lastMonth",
    },
  },
  {
    id: "client-growth",
    name: "Client Growth",
    description: "New clients over time",
    category: "analytics",
    defaultSize: "medium",
    icon: "user-plus",
    configurable: true,
    defaultConfig: {
      period: "3m",
    },
  },
  {
    id: "booking-trends",
    name: "Booking Trends",
    description: "Booking patterns and peak times",
    category: "analytics",
    defaultSize: "medium",
    icon: "trending-up",
    configurable: true,
    defaultConfig: {
      period: "3m",
    },
  },
  {
    id: "revenue-goals",
    name: "Revenue Goals",
    description: "Track progress toward monthly/yearly targets",
    category: "analytics",
    defaultSize: "medium",
    icon: "target",
    configurable: true,
    defaultConfig: {
      goalType: "monthly",
      targetAmount: null,
    },
  },
  {
    id: "revenue-by-service",
    name: "Revenue by Service",
    description: "Breakdown of revenue by service type",
    category: "analytics",
    defaultSize: "medium",
    icon: "pie-chart",
    configurable: true,
    defaultConfig: {
      period: "30d",
      chartType: "pie",
    },
  },

  // Financial Widgets
  {
    id: "payment-activity",
    name: "Payment Activity",
    description: "Recent payments received",
    category: "financial",
    defaultSize: "medium",
    icon: "credit-card",
    configurable: true,
    defaultConfig: {
      limit: 5,
    },
  },
  {
    id: "outstanding-balance",
    name: "Outstanding Balance",
    description: "Total unpaid invoice amount",
    category: "financial",
    defaultSize: "small",
    icon: "wallet",
    configurable: false,
  },
  {
    id: "invoice-aging",
    name: "Invoice Aging",
    description: "Invoices by age category",
    category: "financial",
    defaultSize: "medium",
    icon: "hourglass",
    configurable: true,
    defaultConfig: {
      showBreakdown: true,
    },
  },
  {
    id: "expense-tracker",
    name: "Expense Tracker",
    description: "Track business expenses",
    category: "financial",
    defaultSize: "medium",
    icon: "receipt",
    configurable: true,
    requiredPlan: "pro",
    defaultConfig: {
      period: "monthly",
    },
  },

  // Scheduling Widgets
  {
    id: "calendar-preview",
    name: "Calendar Preview",
    description: "Mini calendar with upcoming events",
    category: "scheduling",
    defaultSize: "large",
    icon: "calendar",
    configurable: true,
    defaultConfig: {
      view: "week",
    },
  },
  {
    id: "availability-status",
    name: "Availability Status",
    description: "Your current booking availability",
    category: "scheduling",
    defaultSize: "small",
    icon: "check-circle",
    configurable: true,
    defaultConfig: {
      showNextSlots: true,
    },
  },
  {
    id: "weather-forecast",
    name: "Weather Forecast",
    description: "3-day weather forecast for outdoor shoots",
    category: "scheduling",
    defaultSize: "small",
    icon: "cloud-sun",
    configurable: true,
    defaultConfig: {
      location: "auto",
      days: 3,
    },
  },
  {
    id: "travel-schedule",
    name: "Travel Schedule",
    description: "Upcoming travel and distances",
    category: "scheduling",
    defaultSize: "medium",
    icon: "map-pin",
    configurable: true,
    defaultConfig: {
      daysAhead: 7,
    },
  },

  // Project Widgets
  {
    id: "recent-galleries",
    name: "Recent Galleries",
    description: "Your latest photo galleries",
    category: "projects",
    defaultSize: "large",
    icon: "images",
    configurable: true,
    defaultConfig: {
      limit: 4,
      showThumbnails: true,
    },
  },
  {
    id: "pending-deliveries",
    name: "Pending Deliveries",
    description: "Galleries awaiting delivery",
    category: "projects",
    defaultSize: "medium",
    icon: "package",
    configurable: true,
    defaultConfig: {
      limit: 5,
    },
  },
  {
    id: "contract-status",
    name: "Contract Status",
    description: "Contracts awaiting signatures",
    category: "projects",
    defaultSize: "medium",
    icon: "file-signature",
    configurable: true,
    defaultConfig: {
      limit: 5,
    },
  },
  {
    id: "questionnaire-status",
    name: "Questionnaire Status",
    description: "Pending client questionnaires",
    category: "projects",
    defaultSize: "medium",
    icon: "clipboard-list",
    configurable: true,
    defaultConfig: {
      limit: 5,
    },
  },

  // Communication Widgets
  {
    id: "unread-messages",
    name: "Unread Messages",
    description: "Messages awaiting response",
    category: "communication",
    defaultSize: "medium",
    icon: "message-square",
    configurable: true,
    defaultConfig: {
      limit: 5,
    },
  },
  {
    id: "client-birthdays",
    name: "Client Birthdays",
    description: "Upcoming client milestones",
    category: "communication",
    defaultSize: "small",
    icon: "cake",
    configurable: true,
    defaultConfig: {
      daysAhead: 30,
    },
  },
  {
    id: "follow-up-reminders",
    name: "Follow-up Reminders",
    description: "Clients needing follow-up",
    category: "communication",
    defaultSize: "medium",
    icon: "bell",
    configurable: true,
    defaultConfig: {
      limit: 5,
    },
  },

  // Productivity Widgets
  {
    id: "to-do-list",
    name: "To-Do List",
    description: "Personal task checklist",
    category: "productivity",
    defaultSize: "medium",
    icon: "check-circle",
    configurable: true,
    defaultConfig: {
      showCompleted: false,
      limit: 10,
    },
  },
  {
    id: "deadlines",
    name: "Deadlines",
    description: "Upcoming due dates",
    category: "productivity",
    defaultSize: "medium",
    icon: "alarm-clock",
    configurable: true,
    defaultConfig: {
      daysAhead: 14,
      limit: 5,
    },
  },
  {
    id: "equipment-checklist",
    name: "Equipment Checklist",
    description: "Gear preparation for shoots",
    category: "productivity",
    defaultSize: "medium",
    icon: "camera",
    configurable: true,
    defaultConfig: {
      template: "default",
    },
  },
  {
    id: "notes",
    name: "Notes",
    description: "Quick notes and reminders",
    category: "productivity",
    defaultSize: "medium",
    icon: "sticky-note",
    configurable: true,
    defaultConfig: {
      maxNotes: 5,
    },
  },

  // Marketing Widgets
  {
    id: "referral-program",
    name: "Referral Program",
    description: "Your referral stats and sharing link",
    category: "marketing",
    defaultSize: "full",
    maxSize: "full",
    icon: "gift",
    configurable: false,
  },
  {
    id: "social-stats",
    name: "Social Stats",
    description: "Connected social media metrics",
    category: "marketing",
    defaultSize: "small",
    icon: "share-2",
    configurable: true,
    requiredPlan: "pro",
    defaultConfig: {
      platforms: ["instagram", "facebook"],
    },
  },
  {
    id: "property-websites",
    name: "Property Websites",
    description: "Recent property website activity",
    category: "marketing",
    defaultSize: "medium",
    icon: "globe",
    configurable: true,
    defaultConfig: {
      limit: 3,
      showViews: true,
    },
  },
];

/**
 * Get widget definition by ID
 */
export function getWidgetDefinition(
  widgetId: WidgetId
): WidgetDefinition | undefined {
  return WIDGET_LIBRARY.find((w) => w.id === widgetId);
}

/**
 * Get widgets by category
 */
export function getWidgetsByCategory(
  category: WidgetCategory
): WidgetDefinition[] {
  return WIDGET_LIBRARY.filter((w) => w.category === category);
}

/**
 * Widget category labels for display
 */
export const WIDGET_CATEGORY_LABELS: Record<WidgetCategory, string> = {
  analytics: "Analytics & Insights",
  financial: "Financial",
  scheduling: "Scheduling",
  projects: "Projects & Galleries",
  communication: "Communication",
  productivity: "Productivity",
  marketing: "Marketing",
  other: "Other",
};

/**
 * Default widgets for each photography type
 */
export const DEFAULT_WIDGETS_BY_TYPE: Record<PhotographyType, WidgetId[]> = {
  real_estate: [
    "key-metrics",
    "upcoming-bookings",
    "weather-forecast",
    "quick-actions",
    "recent-galleries",
    "pending-deliveries",
    "property-websites",
  ],
  wedding: [
    "key-metrics",
    "calendar-preview",
    "contract-status",
    "client-birthdays",
    "revenue-goals",
    "questionnaire-status",
    "to-do-list",
  ],
  commercial: [
    "key-metrics",
    "revenue-goals",
    "deadlines",
    "contract-status",
    "revenue-by-service",
    "invoice-aging",
    "recent-galleries",
  ],
  portrait: [
    "key-metrics",
    "quick-actions",
    "upcoming-bookings",
    "recent-activity",
    "client-birthdays",
    "follow-up-reminders",
    "recent-galleries",
  ],
  events: [
    "key-metrics",
    "calendar-preview",
    "weather-forecast",
    "upcoming-bookings",
    "equipment-checklist",
    "contract-status",
    "to-do-list",
  ],
  architecture: [
    "key-metrics",
    "deadlines",
    "recent-galleries",
    "weather-forecast",
    "pending-deliveries",
    "revenue-goals",
    "travel-schedule",
  ],
  food_hospitality: [
    "key-metrics",
    "quick-actions",
    "recent-galleries",
    "client-birthdays",
    "follow-up-reminders",
    "revenue-by-service",
    "notes",
  ],
  general: [
    "key-metrics",
    "quick-actions",
    "upcoming-bookings",
    "recent-activity",
    "recent-galleries",
    "overdue-invoices",
    "expiring-galleries",
  ],
};

/**
 * Photography type labels for display
 */
export const PHOTOGRAPHY_TYPE_LABELS: Record<PhotographyType, string> = {
  real_estate: "Real Estate",
  wedding: "Wedding & Events",
  commercial: "Commercial",
  portrait: "Portrait & Headshots",
  events: "Events & Corporate",
  architecture: "Architecture & Interiors",
  food_hospitality: "Food & Hospitality",
  general: "General / Mixed",
};

/**
 * Photography type descriptions
 */
export const PHOTOGRAPHY_TYPE_DESCRIPTIONS: Record<PhotographyType, string> = {
  real_estate:
    "Optimized for fast turnaround and property management workflows",
  wedding:
    "Focused on long-term planning, contracts, and client relationships",
  commercial: "Project-based work with emphasis on deadlines and revenue",
  portrait: "High-volume sessions with quick client turnaround",
  events: "Event preparation, weather tracking, and equipment management",
  architecture: "Project delivery focus with detailed tracking",
  food_hospitality: "Client relationship focused with repeat business emphasis",
  general: "Balanced setup for versatile photography businesses",
};

/**
 * Photography type icons (Lucide icon names)
 */
export const PHOTOGRAPHY_TYPE_ICONS: Record<PhotographyType, string> = {
  real_estate: "home",
  wedding: "heart",
  commercial: "building-2",
  portrait: "user",
  events: "party-popper",
  architecture: "landmark",
  food_hospitality: "utensils",
  general: "camera",
};

/**
 * Create default dashboard layout for a photography type
 */
export function createDefaultLayout(type: PhotographyType): DashboardLayout {
  const widgetIds = DEFAULT_WIDGETS_BY_TYPE[type];

  const widgets: WidgetConfig[] = widgetIds.map((widgetId, index) => {
    const definition = getWidgetDefinition(widgetId);
    return {
      id: `${widgetId}-${index}`,
      widgetId,
      size: definition?.defaultSize || "medium",
      visible: true,
      collapsed: false,
      settings: definition?.defaultConfig || {},
    };
  });

  return {
    version: 2,
    widgets,
    order: widgets.map((w) => w.id),
    layoutPreset: type,
  };
}

/**
 * Default layout for new users
 */
export const DEFAULT_DASHBOARD_LAYOUT = createDefaultLayout("general");

/**
 * Merge user layout with defaults (handles new widgets after updates)
 */
export function mergeDashboardLayout(
  userLayout: Partial<DashboardLayout> | null
): DashboardLayout {
  if (!userLayout) {
    return DEFAULT_DASHBOARD_LAYOUT;
  }

  // If version matches, use user layout as-is
  if (userLayout.version === DEFAULT_DASHBOARD_LAYOUT.version) {
    return userLayout as DashboardLayout;
  }

  // Migration: preserve user widget order and settings where possible
  return {
    version: DEFAULT_DASHBOARD_LAYOUT.version,
    widgets: userLayout.widgets || DEFAULT_DASHBOARD_LAYOUT.widgets,
    order: userLayout.order || DEFAULT_DASHBOARD_LAYOUT.order,
    layoutPreset: userLayout.layoutPreset || "custom",
  };
}
