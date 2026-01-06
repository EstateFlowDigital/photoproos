import type { ComponentType } from "react";
import { Bell, Settings } from "lucide-react";
import { getFilteredNavigation, type GatingContext } from "@/lib/modules/gating";

export type DashboardNavCategory = "core" | "operations" | "client" | "advanced" | "admin";

export type DashboardNavSubItem = {
  label: string;
  href: string;
};

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  category?: DashboardNavCategory;
  badge?: number;
  subNav?: DashboardNavSubItem[];
};

export type DashboardNavSection = {
  id: DashboardNavCategory;
  label: string;
  items: DashboardNavItem[];
};

export type DashboardNavData = {
  topItems: DashboardNavItem[];
  sections: DashboardNavSection[];
  items: DashboardNavItem[];
};

export type DashboardNavContext = GatingContext & {
  notificationCount?: number;
  badgeCounts?: Partial<Record<string, number>>;
};

export const DASHBOARD_SECTION_LABELS: Array<{
  id: DashboardNavCategory;
  label: string;
}> = [
  { id: "core", label: "Workspace" },
  { id: "operations", label: "Operations" },
  { id: "client", label: "Clients" },
  { id: "advanced", label: "Advanced" },
  { id: "admin", label: "Admin" },
];

export const DASHBOARD_SUB_NAV: Record<string, DashboardNavSubItem[]> = {
  dashboard: [
    { label: "Overview", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
  ],
  projects: [
    { label: "All Projects", href: "/projects" },
    { label: "Analytics", href: "/projects/analytics" },
  ],
  galleries: [
    { label: "All Galleries", href: "/galleries" },
    { label: "New Gallery", href: "/galleries/new" },
    { label: "Services", href: "/galleries/services" },
  ],
  scheduling: [
    { label: "Calendar", href: "/scheduling" },
    { label: "New Booking", href: "/scheduling/new" },
    { label: "Availability", href: "/scheduling/availability" },
    { label: "Time Off", href: "/scheduling/time-off" },
    { label: "Booking Forms", href: "/scheduling/booking-forms" },
    { label: "Booking Types", href: "/scheduling/types" },
  ],
  invoices: [
    { label: "Billing Overview", href: "/billing" },
    { label: "Invoices", href: "/invoices" },
    { label: "Recurring", href: "/invoices/recurring" },
    { label: "Estimates", href: "/billing/estimates" },
    { label: "Credit Notes", href: "/billing/credit-notes" },
    { label: "Retainers", href: "/billing/retainers" },
    { label: "Payments", href: "/payments" },
    { label: "Analytics", href: "/billing/analytics" },
    { label: "Reports", href: "/billing/reports" },
  ],
  services: [
    { label: "Services", href: "/services" },
    { label: "Add-ons", href: "/services/addons" },
    { label: "Bundles", href: "/services/bundles" },
  ],
  clients: [
    { label: "All Clients", href: "/clients" },
    { label: "New Client", href: "/clients/new" },
    { label: "Import", href: "/clients/import" },
    { label: "Merge", href: "/clients/merge" },
  ],
  contracts: [
    { label: "All Contracts", href: "/contracts" },
    { label: "New Contract", href: "/contracts/new" },
    { label: "Templates", href: "/contracts/templates" },
  ],
  questionnaires: [
    { label: "Assigned", href: "/questionnaires" },
    { label: "New Template", href: "/questionnaires/templates/new" },
  ],
  properties: [
    { label: "All Properties", href: "/properties" },
    { label: "New Property", href: "/properties/new" },
  ],
  portfolio_websites: [
    { label: "Portfolios", href: "/portfolios" },
    { label: "New Portfolio", href: "/portfolios/new" },
  ],
  product_catalogs: [{ label: "Catalogs", href: "/products" }],
  admin: [
    { label: "Settings", href: "/settings" },
    { label: "Billing & plan", href: "/settings/billing" },
    { label: "Invite team", href: "/settings/team?invite=1" },
    { label: "View client portal", href: "/portal" },
  ],
};

export function buildDashboardNav({
  enabledModules,
  industries,
  notificationCount = 0,
  badgeCounts = {},
}: DashboardNavContext): DashboardNavData {
  const primaryItems = (getFilteredNavigation({ enabledModules, industries }) as DashboardNavItem[])
    .map((item) => ({
      ...item,
      badge: badgeCounts[item.id],
      subNav: DASHBOARD_SUB_NAV[item.id] ?? [],
    }));

  const adminItems: DashboardNavItem[] = [
    {
      id: "admin",
      label: "Admin",
      href: "/settings",
      icon: Settings,
      category: "admin",
      subNav: DASHBOARD_SUB_NAV.admin ?? [],
    },
  ];

  const topItems: DashboardNavItem[] =
    notificationCount > 0
      ? [
          {
            id: "notifications",
            label: "Notifications",
            href: "/notifications",
            icon: Bell,
            badge: notificationCount,
          },
        ]
      : [];

  const sections = DASHBOARD_SECTION_LABELS.map((section) => ({
    ...section,
    items:
      section.id === "admin"
        ? adminItems
        : primaryItems.filter((item) => item.category === section.id),
  })).filter((section) => section.items.length > 0);

  return {
    topItems,
    sections,
    items: [...primaryItems, ...adminItems],
  };
}

export function isActiveRoute(pathname: string, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveDashboardNav(pathname: string, items: DashboardNavItem[]) {
  for (const item of items) {
    if (isActiveRoute(pathname, item.href)) {
      return { activeItem: item, activeSubItem: undefined };
    }
    const subMatch = item.subNav?.find((sub) => isActiveRoute(pathname, sub.href));
    if (subMatch) {
      return { activeItem: item, activeSubItem: subMatch };
    }
  }
  return { activeItem: undefined, activeSubItem: undefined };
}
