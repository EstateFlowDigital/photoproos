/**
 * Walkthrough & Tutorial System Types
 * Defines the structure for page walkthroughs and user preferences
 */

import type { ComponentType } from "react";

/**
 * Walkthrough states matching the Prisma enum
 */
export type WalkthroughState = "open" | "minimized" | "hidden" | "dismissed";

/**
 * Page identifiers for walkthroughs
 */
export type WalkthroughPageId =
  | "dashboard"
  | "galleries"
  | "gallery-detail"
  | "clients"
  | "client-detail"
  | "invoices"
  | "invoice-detail"
  | "estimates"
  | "contracts"
  | "contract-detail"
  | "calendar"
  | "bookings"
  | "settings"
  | "integrations"
  | "team"
  | "analytics"
  | "reports"
  | "property-websites"
  | "marketing-kit"
  | "messages"
  | "projects"
  | "questionnaires"
  | "products"
  | "inbox"
  | "leads";

/**
 * Position for spotlight tooltip
 */
export type SpotlightPosition = "top" | "bottom" | "left" | "right" | "auto";

/**
 * Single step in a walkthrough
 */
export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  /** Image URL to display for this step (screenshot/illustration) */
  image?: string;
  /** Alt text for the step image */
  imageAlt?: string;
  /** CSS selector for the element to highlight (e.g., "[data-tour='quick-actions']") */
  targetSelector?: string;
  /** Padding around the highlighted element in pixels */
  highlightPadding?: number;
  /** Position of the tooltip relative to the highlighted element */
  tooltipPosition?: SpotlightPosition;
  /** Action button text (e.g., "Try it now") */
  actionLabel?: string;
  /** Action button href or callback */
  actionHref?: string;
}

/**
 * Walkthrough configuration for a page
 */
export interface WalkthroughConfig {
  pageId: WalkthroughPageId;
  title: string;
  description: string;
  steps: WalkthroughStep[];
  videoPlaceholder?: boolean;
  videoUrl?: string | null;
  estimatedTime?: string; // e.g., "2 min read"
}

/**
 * User's walkthrough preference (from database)
 */
export interface WalkthroughPreference {
  id: string;
  userId: string;
  pageId: WalkthroughPageId;
  state: WalkthroughState;
  dismissedAt: Date | null;
  hiddenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Walkthrough metadata for display in settings
 */
export interface WalkthroughMeta {
  pageId: WalkthroughPageId;
  label: string;
  description: string;
  icon: string;
  category: WalkthroughCategory;
}

/**
 * Walkthrough categories for organization
 */
export type WalkthroughCategory =
  | "core"
  | "clients"
  | "financial"
  | "scheduling"
  | "marketing"
  | "settings";

/**
 * All available walkthroughs with metadata
 */
export const WALKTHROUGH_PAGES: WalkthroughMeta[] = [
  // Core
  {
    pageId: "dashboard",
    label: "Dashboard",
    description: "Overview of your business metrics and quick actions",
    icon: "layout-dashboard",
    category: "core",
  },
  {
    pageId: "galleries",
    label: "Galleries",
    description: "Create and manage photo galleries",
    icon: "images",
    category: "core",
  },
  {
    pageId: "gallery-detail",
    label: "Gallery Details",
    description: "Upload, organize, and share photos",
    icon: "image",
    category: "core",
  },
  // Clients
  {
    pageId: "clients",
    label: "Clients",
    description: "Manage your client database",
    icon: "users",
    category: "clients",
  },
  {
    pageId: "client-detail",
    label: "Client Details",
    description: "View client history and communication",
    icon: "user",
    category: "clients",
  },
  // Financial
  {
    pageId: "invoices",
    label: "Invoices",
    description: "Create and track invoices",
    icon: "receipt",
    category: "financial",
  },
  {
    pageId: "invoice-detail",
    label: "Invoice Details",
    description: "Manage payments and send reminders",
    icon: "file-text",
    category: "financial",
  },
  {
    pageId: "estimates",
    label: "Estimates",
    description: "Create and send quotes to clients",
    icon: "calculator",
    category: "financial",
  },
  {
    pageId: "contracts",
    label: "Contracts",
    description: "Create and manage contracts",
    icon: "file-signature",
    category: "financial",
  },
  {
    pageId: "contract-detail",
    label: "Contract Details",
    description: "Track signatures and contract status",
    icon: "pen-tool",
    category: "financial",
  },
  // Scheduling
  {
    pageId: "calendar",
    label: "Calendar",
    description: "View and manage your schedule",
    icon: "calendar",
    category: "scheduling",
  },
  {
    pageId: "bookings",
    label: "Bookings",
    description: "Manage booking requests and confirmations",
    icon: "calendar-check",
    category: "scheduling",
  },
  // Marketing
  {
    pageId: "property-websites",
    label: "Property Websites",
    description: "Create single-property marketing sites",
    icon: "globe",
    category: "marketing",
  },
  {
    pageId: "marketing-kit",
    label: "Marketing Kit",
    description: "Generate marketing materials automatically",
    icon: "palette",
    category: "marketing",
  },
  // Settings
  {
    pageId: "settings",
    label: "Settings",
    description: "Configure your account and preferences",
    icon: "settings",
    category: "settings",
  },
  {
    pageId: "integrations",
    label: "Integrations",
    description: "Connect third-party services",
    icon: "plug",
    category: "settings",
  },
  {
    pageId: "team",
    label: "Team",
    description: "Manage team members and permissions",
    icon: "users-2",
    category: "settings",
  },
  {
    pageId: "analytics",
    label: "Analytics",
    description: "View reports and business insights",
    icon: "bar-chart-3",
    category: "settings",
  },
  {
    pageId: "reports",
    label: "Reports",
    description: "Generate and export business reports",
    icon: "file-bar-chart",
    category: "settings",
  },
  // Communication
  {
    pageId: "messages",
    label: "Messages",
    description: "Communicate with team and clients",
    icon: "message-square",
    category: "clients",
  },
  {
    pageId: "inbox",
    label: "Inbox",
    description: "Manage email communication",
    icon: "inbox",
    category: "clients",
  },
  // Projects & Leads
  {
    pageId: "projects",
    label: "Projects",
    description: "Manage projects and tasks",
    icon: "kanban",
    category: "core",
  },
  {
    pageId: "leads",
    label: "Leads",
    description: "Track and convert leads",
    icon: "user-plus",
    category: "clients",
  },
  // Products & Questionnaires
  {
    pageId: "products",
    label: "Products",
    description: "Manage product catalogs",
    icon: "shopping-bag",
    category: "financial",
  },
  {
    pageId: "questionnaires",
    label: "Questionnaires",
    description: "Create and manage questionnaires",
    icon: "clipboard-list",
    category: "clients",
  },
];

/**
 * Get walkthrough metadata by page ID
 */
export function getWalkthroughMeta(
  pageId: WalkthroughPageId
): WalkthroughMeta | undefined {
  return WALKTHROUGH_PAGES.find((w) => w.pageId === pageId);
}

/**
 * Get walkthroughs by category
 */
export function getWalkthroughsByCategory(
  category: WalkthroughCategory
): WalkthroughMeta[] {
  return WALKTHROUGH_PAGES.filter((w) => w.category === category);
}

/**
 * Category labels for display
 */
export const WALKTHROUGH_CATEGORY_LABELS: Record<WalkthroughCategory, string> = {
  core: "Core Features",
  clients: "Client Management",
  financial: "Financial",
  scheduling: "Scheduling",
  marketing: "Marketing",
  settings: "Settings & Admin",
};

/**
 * Default walkthrough state for new users
 */
export const DEFAULT_WALKTHROUGH_STATE: WalkthroughState = "open";

/**
 * Check if a walkthrough state allows restoration
 * Note: All states can now be restored via Settings
 */
export function isWalkthroughRestorable(state: WalkthroughState): boolean {
  return state === "hidden" || state === "dismissed";
}

/**
 * State transition helpers
 * Dismissed walkthroughs can now be restored to "open" via Settings
 */
export const WALKTHROUGH_TRANSITIONS: Record<
  WalkthroughState,
  WalkthroughState[]
> = {
  open: ["minimized", "hidden", "dismissed"],
  minimized: ["open", "hidden", "dismissed"],
  hidden: ["open", "dismissed"],
  dismissed: ["open"], // Can be restored via Settings
};

/**
 * Check if a state transition is valid
 */
export function canTransitionTo(
  from: WalkthroughState,
  to: WalkthroughState
): boolean {
  return WALKTHROUGH_TRANSITIONS[from].includes(to);
}
