import type { ComponentType } from "react";
import { Bell, Settings } from "lucide-react";
import { getFilteredNavigation, type GatingContext } from "@/lib/modules/gating";
import { INDUSTRIES, type IndustryDefinition } from "@/lib/constants/industries";
import { MODULES } from "@/lib/constants/modules";

export type DashboardNavCategory = "core" | "operations" | "client" | "advanced" | "admin" | "industry";

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
  id: string;
  label: string;
  items: DashboardNavItem[];
  industryId?: string;
  industryColor?: string;
  industryIcon?: ComponentType<{ className?: string }>;
  isIndustrySection?: boolean;
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

/**
 * Core workspace modules that appear in the main Workspace section
 */
const WORKSPACE_MODULES = ["dashboard", "projects", "forms", "messages", "achievements"];

/**
 * Client-facing modules that appear in the Clients section
 */
const CLIENT_MODULES = ["inbox", "leads", "clients", "questionnaires", "reviews"];

/**
 * Modules that should appear under each industry (operations + industry-specific)
 * These are the non-core, non-client modules that relate to actual work
 */
const INDUSTRY_OPERATION_MODULES = [
  "galleries",
  "scheduling",
  "invoices",
  "services",
  "analytics",
  "orders",
  "payments",
  "contracts",
  "properties",
  "brokerages",
  "portfolio_websites",
  "mini_sessions",
  "online_booking",
  "licensing",
  "batch_processing",
  "product_catalogs",
  "ai_assistant",
  "marketing_kit",
  "referrals",
  "integrations",
  "team_management",
  "tax_prep",
  "expenses",
];

export const DASHBOARD_SUB_NAV: Record<string, DashboardNavSubItem[]> = {
  dashboard: [
    { label: "Overview", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
  ],
  achievements: [
    { label: "Overview", href: "/achievements" },
    { label: "Quests", href: "/quests" },
    { label: "Skill Trees", href: "/skills" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Year in Review", href: "/achievements/year-in-review" },
  ],
  projects: [
    { label: "All Projects", href: "/projects" },
    { label: "Analytics", href: "/projects/analytics" },
  ],
  messages: [
    { label: "Inbox", href: "/messages" },
    { label: "Chat Requests", href: "/messages/requests" },
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
  const allItems = (getFilteredNavigation({ enabledModules, industries }) as DashboardNavItem[])
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

  // Build sections based on new structure:
  // 1. Workspace (core modules)
  // 2. Clients (client-facing modules)
  // 3. Industry sections (one per selected industry)
  // 4. Settings

  const sections: DashboardNavSection[] = [];

  // 1. Workspace Section
  const workspaceItems = allItems.filter((item) => WORKSPACE_MODULES.includes(item.id));
  if (workspaceItems.length > 0) {
    sections.push({
      id: "workspace",
      label: "Workspace",
      items: workspaceItems.sort((a, b) => WORKSPACE_MODULES.indexOf(a.id) - WORKSPACE_MODULES.indexOf(b.id)),
    });
  }

  // 2. Clients Section
  const clientItems = allItems.filter((item) => CLIENT_MODULES.includes(item.id));
  if (clientItems.length > 0) {
    sections.push({
      id: "clients",
      label: "Clients",
      items: clientItems.sort((a, b) => CLIENT_MODULES.indexOf(a.id) - CLIENT_MODULES.indexOf(b.id)),
    });
  }

  // 3. Industry Sections (one dropdown per selected industry)
  const selectedIndustries = industries
    .map((id) => INDUSTRIES[id])
    .filter((ind): ind is IndustryDefinition => ind !== undefined)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (const industry of selectedIndustries) {
    // Get modules that are both enabled AND available for this industry
    const industryModules = industry.modules.filter(
      (moduleId) =>
        INDUSTRY_OPERATION_MODULES.includes(moduleId) &&
        allItems.some((item) => item.id === moduleId)
    );

    const industryItems = industryModules
      .map((moduleId) => allItems.find((item) => item.id === moduleId))
      .filter((item): item is DashboardNavItem => item !== undefined);

    if (industryItems.length > 0) {
      sections.push({
        id: `industry-${industry.id}`,
        label: industry.shortName,
        items: industryItems,
        industryId: industry.id,
        industryColor: industry.color,
        industryIcon: industry.icon,
        isIndustrySection: true,
      });
    }
  }

  // 4. Settings Section
  sections.push({
    id: "admin",
    label: "Settings",
    items: adminItems,
  });

  return {
    topItems,
    sections,
    items: [...allItems, ...adminItems],
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
