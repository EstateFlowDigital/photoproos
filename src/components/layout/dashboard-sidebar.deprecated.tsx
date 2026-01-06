"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { getFilteredNavigation } from "@/lib/modules/gating";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { QuickThemeSwitcher } from "@/components/ui/quick-theme-switcher";
import { useStableOrgProfile } from "@/hooks/use-stable-org-profile";

interface NavItem {
  id: string;
  name?: string;
  label?: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
  category?: string;
}

type SubLink = {
  label: string;
  href: string;
};

interface DashboardSidebarProps {
  className?: string;
  enabledModules: string[];
  industries: string[];
  notificationCount?: number;
  defaultCollapsed?: boolean;
}

// Secondary menu entries per primary nav id
const subNav: Record<string, SubLink[]> = {
  dashboard: [{ label: "Overview", href: "/dashboard" }],
  projects: [
    { label: "All Projects", href: "/projects" },
    { label: "Analytics", href: "/projects/analytics" },
    { label: "Tasks", href: "/projects/tasks" },
  ],
  forms: [
    { label: "Forms", href: "/forms" },
    { label: "Templates", href: "/questionnaires/templates/new" },
    { label: "Submissions", href: "/questionnaires/assigned" },
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
  orders: [
    { label: "Orders", href: "/orders" },
    { label: "Order Pages", href: "/order-pages" },
    { label: "Analytics", href: "/orders/analytics" },
  ],
  clients: [
    { label: "All Clients", href: "/clients" },
    { label: "New Client", href: "/clients/new" },
    { label: "Merge", href: "/clients/merge" },
    { label: "Import", href: "/clients/import" },
  ],
  invoices: [
    { label: "Overview", href: "/billing" },
    { label: "Invoices", href: "/invoices" },
    { label: "Recurring", href: "/invoices/recurring" },
    { label: "Estimates", href: "/billing/estimates" },
    { label: "Credit Notes", href: "/billing/credit-notes" },
    { label: "Retainers", href: "/billing/retainers" },
    { label: "Payments", href: "/payments" },
    { label: "Analytics", href: "/billing/analytics" },
    { label: "Tax Reports", href: "/billing/reports" },
    { label: "Payouts", href: "/settings/payouts" },
  ],
  contracts: [
    { label: "Contracts", href: "/contracts" },
    { label: "Templates", href: "/contracts/templates" },
    { label: "Signing", href: "/sign/[token]" },
  ],
  services: [
    { label: "Services", href: "/services" },
    { label: "Addons", href: "/services/addons" },
    { label: "Bundles", href: "/services/bundles" },
  ],
  products: [{ label: "Catalogs", href: "/products" }],
  properties: [
    { label: "All Properties", href: "/properties" },
    { label: "New Property", href: "/properties/new" },
  ],
  questionnaires: [
    { label: "Assigned", href: "/questionnaires" },
    { label: "Templates", href: "/questionnaires/templates/new" },
  ],
  leads: [{ label: "Leads", href: "/leads" }],
  inbox: [{ label: "Inbox", href: "/inbox" }],
  licensing: [{ label: "Licensing", href: "/licensing" }],
  "mini-sessions": [{ label: "Mini Sessions", href: "/mini-sessions" }],
  portfolio: [{ label: "Portfolios", href: "/portfolios" }],
};

/**
 * Unified sidebar (desktop + mobile). Collapses to icons automatically on small screens,
 * with a single toggle button to expand/collapse. Secondary pane shows sub-links for the
 * selected primary item.
 */
export function DashboardSidebar({
  className,
  enabledModules,
  industries,
  notificationCount = 0,
  defaultCollapsed = false,
}: DashboardSidebarProps) {
  const pathname = usePathname() || "";
  const { user, organization } = useStableOrgProfile();

  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [identityOpen, setIdentityOpen] = React.useState(false);
  const [viewportVH, setViewportVH] = React.useState<number | null>(null);
  const [activeParent, setActiveParent] = React.useState<string | null>(null);

  const navItems = getFilteredNavigation({ enabledModules, industries });
  // Payments is now part of the Billing section subNav, no longer a separate primary nav item
  const sidebarNav: NavItem[] = navItems;

  const userDisplayName = React.useMemo(() => {
    if (!user) return "Signed in";
    const anyUser: any = user;
    return (
      anyUser.fullName ||
      anyUser.username ||
      anyUser.firstName ||
      anyUser.emailAddress ||
      "Signed in"
    );
  }, [user]);

  const userSecondary = React.useMemo(() => {
    const anyUser: any = user;
    const email =
      anyUser?.primaryEmailAddress?.emailAddress || anyUser?.emailAddress || null;
    return organization?.name || email || "Workspace";
  }, [organization, user]);

  // Load collapsed state from storage; default to collapsed on small screens
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const storedCollapsed = window.localStorage.getItem("ppos_sidebar_collapsed");
    if (storedCollapsed) {
      setCollapsed(storedCollapsed === "true");
    } else if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ppos_sidebar_collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  // Track real viewport height to avoid mobile 100vh issues
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      setViewportVH(vh);
      document.documentElement.style.setProperty("--shell-vh", `${vh}px`);
    };
    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);
    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  const categoryLabels: Record<string, { title: string; defaultOpen: boolean }> = {
    core: { title: "Workspace", defaultOpen: true },
    operations: { title: "Operations", defaultOpen: true },
    client: { title: "Clients", defaultOpen: false },
    advanced: { title: "Advanced", defaultOpen: false },
  };

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;
  const [sectionState, setSectionState] = React.useState<Record<string, boolean>>(
    () =>
      categories.reduce(
        (acc, id) => ({ ...acc, [id]: categoryLabels[id].defaultOpen }),
        {} as Record<string, boolean>
      )
  );

  const categorizedNav = categories.map((category) => {
    const items = sidebarNav.filter((item) => item.category === category);
    return { category, items };
  });

  const renderNavItem = (item: NavItem, options?: { showLabel?: boolean }) => {
    const isActive =
      pathname === item.href || (pathname ? pathname.startsWith(`${item.href}/`) : false);
    const IconComponent = item.icon;
    const showLabel = options?.showLabel ?? true;
    const hasChildren = subNav[item.id]?.length;
    const isSelected = activeParent ? activeParent === item.id : isActive;

    return (
      <button
        key={item.href}
        onClick={() => {
          setActiveParent(item.id);
          if (collapsed && hasChildren) {
            setCollapsed(false);
          }
        }}
        className={cn(
          "group flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
          showLabel ? "gap-3" : "gap-0 justify-center",
          isActive || isSelected
            ? "bg-[var(--primary)] text-white"
            : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
        )}
        title={item.name || item.label}
      >
        <IconComponent
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            isActive || isSelected ? "text-white" : "text-foreground-muted group-hover:text-foreground"
          )}
        />
        {showLabel ? (
          <span className="flex-1 truncate">{item.name || item.label}</span>
        ) : (
          <span className="sr-only">{item.name || item.label}</span>
        )}
        {item.badge !== undefined && item.badge > 0 && (
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
              isActive || isSelected
                ? "bg-white/20 text-white"
                : "bg-[var(--primary)]/10 text-[var(--primary)]"
            )}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const toggleSection = (key: string) => {
    setSectionState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeChildren = activeParent ? subNav[activeParent] ?? [] : [];

  return (
    <div
      className={cn(
        "flex min-h-screen min-h-0 w-full bg-[var(--card)]",
        className
      )}
      style={
        viewportVH
          ? {
              height: `calc(var(--shell-vh, 1vh) * 100)`,
              maxHeight: `calc(var(--shell-vh, 1vh) * 100)`,
            }
          : undefined
      }
    >
      <aside
        className={cn(
          "flex min-h-full min-h-0 flex-col border-r border-[var(--card-border)] overflow-hidden sticky top-0 self-start",
          collapsed ? "w-[88px]" : "w-[260px]"
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="flex h-16 items-center gap-3 border-b border-[var(--card-border)] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <CameraIcon className="h-4 w-4 text-white" />
            </div>
            {!collapsed && <span className="text-lg font-semibold text-foreground">PhotoProOS</span>}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--card-border)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse to icons"}
            >
              {collapsed ? <ExpandIcon className="h-4 w-4" /> : <CollapseIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav
          className={cn(
            "flex-1 min-h-0 overflow-y-auto pb-6 pt-4",
            collapsed ? "px-2" : "px-4"
          )}
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)",
          }}
        >
          {collapsed ? (
            <div className="space-y-1">
              {sidebarNav.map((item) => renderNavItem(item, { showLabel: false }))}
            </div>
          ) : (
            <div className="space-y-3">
              {categorizedNav.map(({ category, items }) => {
                if (!items.length) return null;
                const label = categoryLabels[category]?.title ?? "More";
                const open = sectionState[category] ?? false;
                return (
                  <div
                    key={category}
                    className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(category)}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-foreground hover:bg-[var(--background-hover)]"
                    >
                      <span>{label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          open ? "rotate-180" : "rotate-0"
                        )}
                      />
                    </button>
                    {open && (
                      <div className="space-y-1 border-t border-[var(--card-border)] p-2">
                        {items.map((item) => renderNavItem(item))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom Navigation */}
        <div
          className={cn(
            "sticky bottom-0 border-t border-[var(--card-border)] bg-[var(--card)]",
            collapsed ? "p-3" : "p-4"
          )}
        >
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              {(() => {
                const isActive =
                  pathname === "/notifications" ||
                  (pathname ? pathname.startsWith("/notifications/") : false);
                return (
                  <Link
                    href="/notifications"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "bg-[var(--primary)] text-white"
                        : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                    )}
                    title="Notifications"
                  >
                    <NotificationIcon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-white" : "text-foreground-muted"
                      )}
                    />
                  </Link>
                );
              })()}
              <div className="flex items-center justify-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {/* Notifications Link */}
                {(() => {
                  const isActive =
                    pathname === "/notifications" ||
                    (pathname ? pathname.startsWith("/notifications/") : false);
                  return (
                    <Link
                      href="/notifications"
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-[var(--primary)] text-white"
                          : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                      )}
                    >
                      <NotificationIcon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive ? "text-white" : "text-foreground-muted group-hover:text-foreground"
                        )}
                      />
                      <span className="flex-1">Notifications</span>
                      {notificationCount > 0 && (
                        <span
                          className={cn(
                            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[var(--primary)]/10 text-[var(--primary)]"
                          )}
                        >
                          {notificationCount > 99 ? "99+" : notificationCount}
                        </span>
                      )}
                    </Link>
                  );
                })()}
              </div>

              {/* Identity / org card */}
              <div className="mt-4 space-y-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-2">
                <button
                  type="button"
                  onClick={() => setIdentityOpen((o) => !o)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-[var(--background-hover)]"
                >
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9",
                      },
                    }}
                    afterSignOutUrl="/"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {userDisplayName}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">
                      {userSecondary}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-foreground-muted transition-transform",
                      identityOpen ? "rotate-180" : "rotate-0"
                    )}
                  />
                </button>

                {identityOpen && (
                  <div className="space-y-3 rounded-md border border-[var(--card-border)] bg-[var(--card)] p-3">
                    <OrganizationSwitcher
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          organizationSwitcherTrigger:
                            "w-full justify-between rounded-md border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-foreground",
                          organizationSwitcherTriggerIcon: "text-foreground-muted",
                          organizationSwitcherOrganizationName: "text-sm font-semibold truncate",
                        },
                      }}
                      afterSelectOrganizationUrl="/dashboard"
                      afterCreateOrganizationUrl="/dashboard"
                    />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Link
                        href="/settings"
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-md border border-[var(--card-border)] px-3 py-2 font-semibold transition-colors",
                          pathname.startsWith("/settings")
                            ? "border-transparent bg-[var(--primary)] text-white"
                            : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                        )}
                      >
                        <SettingsIcon className="h-4 w-4" />
                        Settings
                      </Link>
                      <Link
                        href="/settings/team?invite=1"
                        className="flex items-center justify-center gap-2 rounded-md border border-[var(--card-border)] px-3 py-2 font-semibold text-foreground-secondary transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                      >
                        <InviteIcon className="h-4 w-4" />
                        Invite
                      </Link>
                      <Link
                        href="/settings/billing"
                        className="flex items-center justify-center gap-2 rounded-md border border-[var(--card-border)] px-3 py-2 font-semibold text-foreground-secondary transition-colors hover:bg-[var(--background-hover)] hover:text-foreground col-span-2"
                      >
                        <PaymentsIcon className="h-4 w-4" />
                        Billing
                      </Link>
                      <Link
                        href="/portal"
                        className="flex items-center justify-center gap-2 rounded-md border border-[var(--card-border)] px-3 py-2 font-semibold text-foreground-secondary transition-colors hover:bg-[var(--background-hover)] hover:text-foreground col-span-2"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View as client
                      </Link>
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-[var(--card-border)] bg-[var(--background)] px-3 py-2">
                      <span className="text-xs font-semibold text-foreground-secondary">Appearance</span>
                      <div className="flex items-center gap-2">
                        <QuickThemeSwitcher />
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Secondary pane */}
      <aside
        className={cn(
          "hidden md:flex min-h-full min-h-0 w-[260px] flex-col border-r border-[var(--card-border)] bg-[var(--background)]",
          collapsed && "md:hidden"
        )}
      >
        <div className="flex h-16 items-center border-b border-[var(--card-border)] px-4">
          <p className="text-sm font-semibold text-foreground">
            {activeParent
              ? sidebarNav.find((n) => n.id === activeParent)?.name ||
                sidebarNav.find((n) => n.id === activeParent)?.label ||
                "Menu"
              : "Menu"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeChildren.length === 0 ? (
            <p className="text-sm text-foreground-muted">Select a section to see shortcuts.</p>
          ) : (
            activeChildren.map((child) => {
              const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                      : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                  )}
                >
                  {child.label}
                </Link>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}

// Icons
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 3A1.5 1.5 0 0 0 1 4.5v4A1.5 1.5 0 0 0 2.5 10h6A1.5 1.5 0 0 0 10 8.5v-4A1.5 1.5 0 0 0 8.5 3h-6Zm11 2A1.5 1.5 0 0 0 12 6.5v7a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 5h-4Zm-10 7A1.5 1.5 0 0 0 2 13.5v2A1.5 1.5 0 0 0 3.5 17h6a1.5 1.5 0 0 0 1.5-1.5v-2A1.5 1.5 0 0 0 9.5 12h-6Z" clipRule="evenodd" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PaymentsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
    </svg>
  );
}

function PropertyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function ServicesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
      <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
    </svg>
  );
}

function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h6.5A2.25 2.25 0 0 1 13 4.25V5.5H9.25A3.75 3.75 0 0 0 5.5 9.25V13H4.25A2.25 2.25 0 0 1 2 10.75v-6.5Z" />
      <path d="M9.25 7A2.25 2.25 0 0 0 7 9.25v6.5A2.25 2.25 0 0 0 9.25 18h6.5A2.25 2.25 0 0 0 18 15.75v-6.5A2.25 2.25 0 0 0 15.75 7h-6.5Z" />
    </svg>
  );
}

function ContractsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Zm10.857 5.691a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function NotificationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function CollapseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m3.22 8.97 6.53-6.52a.75.75 0 0 1 1.06 0l6.53 6.52a.75.75 0 1 1-1.06 1.06L11 4.81V17a.75.75 0 0 1-1.5 0V4.81l-5.28 5.22a.75.75 0 0 1-1.06-1.06Z" />
    </svg>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m16.78 11.03-6.53 6.52a.75.75 0 0 1-1.06 0l-6.53-6.52a.75.75 0 0 1 1.06-1.06L9 15.19V3a.75.75 0 0 1 1.5 0v12.19l5.28-5.22a.75.75 0 0 1 1.06 1.06Z" />
    </svg>
  );
}

function InviteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.046 15.253c-.058.468.172.92.57 1.175A9.953 9.953 0 0 0 8 18c1.982 0 3.83-.578 5.384-1.573.398-.254.628-.707.57-1.175a6.001 6.001 0 0 0-11.908 0ZM16.75 5.75a.75.75 0 0 0-1.5 0v2h-2a.75.75 0 0 0 0 1.5h2v2a.75.75 0 0 0 1.5 0v-2h2a.75.75 0 0 0 0-1.5h-2v-2Z" />
    </svg>
  );
}
