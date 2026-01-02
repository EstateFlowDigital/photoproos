/**
 * Page Context Navigation Configuration
 *
 * Defines the quick actions and integrations for each main page.
 * This creates a consistent navigation pattern where related features
 * are easily accessible from the page header area.
 */

export interface PageContextItem {
  label: string;
  href: string;
  iconName?: string;
}

export interface PageContextIntegration {
  label: string;
  href: string;
  iconName: string;
  /** Key to check in integrations data (e.g., "google_calendar") */
  integrationKey?: string;
}

export interface PageContextConfig {
  items: PageContextItem[];
  integrations?: PageContextIntegration[];
}

export const PAGE_CONTEXT_NAV: Record<string, PageContextConfig> = {
  scheduling: {
    items: [
      { label: "Calendar", href: "/scheduling", iconName: "calendar" },
      { label: "Availability", href: "/scheduling/availability", iconName: "clock" },
    ],
    integrations: [
      {
        label: "Google Calendar",
        href: "/settings/integrations",
        iconName: "google",
        integrationKey: "google_calendar",
      },
    ],
  },

  clients: {
    items: [
      { label: "All Clients", href: "/clients", iconName: "users" },
      { label: "Tags", href: "/clients?view=tags", iconName: "tag" },
    ],
  },

  invoices: {
    items: [
      { label: "All Invoices", href: "/invoices", iconName: "document" },
      { label: "Payments", href: "/payments", iconName: "currency" },
    ],
    integrations: [
      {
        label: "Stripe",
        href: "/settings/payments",
        iconName: "stripe",
        integrationKey: "stripe",
      },
    ],
  },

  contracts: {
    items: [
      { label: "All Contracts", href: "/contracts", iconName: "document" },
      { label: "Templates", href: "/contracts?view=templates", iconName: "document" },
    ],
  },

  galleries: {
    items: [
      { label: "All Galleries", href: "/galleries", iconName: "photo" },
      { label: "Delivery Settings", href: "/settings/branding", iconName: "settings" },
    ],
    integrations: [
      {
        label: "Dropbox",
        href: "/settings/integrations",
        iconName: "dropbox",
        integrationKey: "dropbox",
      },
    ],
  },

  properties: {
    items: [
      { label: "All Properties", href: "/properties", iconName: "home" },
      { label: "Leads", href: "/properties?view=leads", iconName: "users" },
      { label: "Analytics", href: "/properties?view=analytics", iconName: "chart" },
    ],
  },

  services: {
    items: [
      { label: "All Services", href: "/services", iconName: "document" },
    ],
  },

  projects: {
    items: [
      { label: "All Projects", href: "/projects", iconName: "document" },
      { label: "Tasks", href: "/projects?view=tasks", iconName: "task" },
    ],
  },
};

/**
 * Get the context nav config for a given page
 */
export function getPageContextNav(page: string): PageContextConfig | null {
  return PAGE_CONTEXT_NAV[page] || null;
}
