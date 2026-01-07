"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { DashboardMenuButton } from "./dashboard-menu-button";
import { getRedirectForDisabledModule } from "@/lib/modules/gating";
import { useTheme } from "@/components/theme-provider";
import { enableNavGuard } from "@/lib/utils/nav-guard";
import { buildDashboardNav } from "@/lib/navigation/dashboard-nav";
import { updateAppearancePreferences } from "@/lib/actions/appearance";

interface AutoThemeConfig {
  enabled: boolean;
  darkStart: string;
  darkEnd: string;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  enabledModules: string[];
  industries: string[];
  unreadNotificationCount?: number;
  badgeCounts?: Partial<Record<string, number>>;
  sidebarPosition?: "left" | "right";
  sidebarCompact?: boolean;
  autoTheme?: AutoThemeConfig;
}

export function DashboardLayoutClient({
  children,
  enabledModules,
  industries,
  unreadNotificationCount = 0,
  badgeCounts = {},
  sidebarPosition = "left",
  sidebarCompact = false,
  autoTheme,
}: DashboardLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(sidebarCompact);
  const navData = useMemo(
    () =>
      buildDashboardNav({
        enabledModules,
        industries,
        notificationCount: unreadNotificationCount,
        badgeCounts,
      }),
    [enabledModules, industries, unreadNotificationCount, badgeCounts]
  );

  useEffect(() => {
    setIsCompact(sidebarCompact);
  }, [sidebarCompact]);

  const handleOpenMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleToggleCompact = useCallback(() => {
    setIsCompact((prev) => {
      const next = !prev;
      void updateAppearancePreferences({ sidebarCompact: next }).catch(() => {
        // Ignore save errors; UI state already updated optimistically.
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const redirectPath = getRedirectForDisabledModule(
      { enabledModules, industries },
      pathname
    );
    if (redirectPath && redirectPath !== pathname) {
      router.replace(redirectPath);
    }
  }, [enabledModules, industries, pathname, router]);

  // Auto theme switching based on time of day
  const { theme, setResolvedThemeOverride } = useTheme();

  useEffect(() => {
    if (!autoTheme?.enabled || theme !== "system") {
      setResolvedThemeOverride(null);
      return;
    }

    const checkAndApplyTheme = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [darkStartH, darkStartM] = autoTheme.darkStart.split(":").map(Number);
      const [darkEndH, darkEndM] = autoTheme.darkEnd.split(":").map(Number);

      const darkStartMinutes = darkStartH * 60 + darkStartM;
      const darkEndMinutes = darkEndH * 60 + darkEndM;

      let shouldBeDark: boolean;

      if (darkStartMinutes < darkEndMinutes) {
        // e.g., dark from 18:00 to 06:00 (next day)
        shouldBeDark = currentMinutes >= darkStartMinutes || currentMinutes < darkEndMinutes;
      } else {
        // e.g., dark from 06:00 to 18:00 (same day - unlikely but handle it)
        shouldBeDark = currentMinutes >= darkStartMinutes && currentMinutes < darkEndMinutes;
      }

      setResolvedThemeOverride(shouldBeDark ? "dark" : "light");
    };

    // Check immediately and then every minute
    checkAndApplyTheme();
    const interval = setInterval(checkAndApplyTheme, 60000);

    return () => clearInterval(interval);
  }, [autoTheme, setResolvedThemeOverride, theme]);

  // Opt-in navigation debug logger (set localStorage ppos_nav_debug = "true")
  useEffect(() => {
    if (typeof window === "undefined") return;
    const enabled = window.localStorage.getItem("ppos_nav_debug") === "true";
    if (!enabled) return;

    const clickHandler = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement | null;
      const anchor = target?.closest("a");
      const top = document.elementFromPoint(evt.clientX, evt.clientY) as HTMLElement | null;
      const href = anchor?.getAttribute("href");

       
      console.log("[nav-debug click]", {
        href,
        defaultPrevented: evt.defaultPrevented,
        targetTag: target?.tagName,
        targetId: target?.id,
        targetClass: target?.className,
        topTag: top?.tagName,
        topId: top?.id,
        topClass: top?.className,
        point: { x: evt.clientX, y: evt.clientY },
        path: window.location.pathname,
      });

      // Track click start for later duration logging
      (window as any).__ppos_nav_last_click = performance.now();

      // If an href exists and navigation doesn’t happen soon, log and force it.
      if (href && href.startsWith("/")) {
        const startPath = window.location.pathname;
        setTimeout(() => {
          const samePath = window.location.pathname === startPath;
          if (samePath) {
             
            console.warn("[nav-debug stalled]", { href, path: startPath });
            window.location.href = href;
          }
        }, 800);
      }
    };

    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;

    function wrapHistory(
      original: typeof window.history.pushState,
      label: "pushState" | "replaceState"
    ) {
      return function wrapped(this: History, ...args: Parameters<typeof window.history.pushState>) {
         
        console.log(`[nav-debug ${label}]`, {
          from: window.location.href,
          to: args[2],
          path: window.location.pathname,
        });
        return original.apply(this, args);
      };
    }

    window.history.pushState = wrapHistory(origPush, "pushState");
    window.history.replaceState = wrapHistory(origReplace, "replaceState");

    const popHandler = () => {
       
      console.log("[nav-debug popstate]", { path: window.location.pathname });
    };

    document.addEventListener("click", clickHandler, true);
    window.addEventListener("popstate", popHandler);

     
    console.log("[nav-debug enabled]", { path: window.location.pathname });

    return () => {
      document.removeEventListener("click", clickHandler, true);
      window.removeEventListener("popstate", popHandler);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  // Log route updates when debug is enabled
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("ppos_nav_debug") !== "true") return;
    const sinceClickMs =
      typeof (window as any).__ppos_nav_last_click === "number"
        ? Math.round(performance.now() - (window as any).__ppos_nav_last_click)
        : undefined;
     
    console.log("[nav-debug route]", { path: pathname, sinceClickMs: sinceClickMs ?? "n/a" });
  }, [pathname]);

  // Perf markers (only when nav debug is on)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("ppos_nav_debug") !== "true") return;

    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
       
      console.log("[nav-debug perf]", {
        type: nav.type,
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        load: Math.round(nav.loadEventEnd),
        ttfb: Math.round(nav.responseStart),
      });
    }

    const lcpObserver =
      "PerformanceObserver" in window
        ? new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === "largest-contentful-paint") {
                 
                console.log("[nav-debug lcp]", {
                  value: Math.round(entry.startTime),
                  size: (entry as any).size,
                });
              }
            }
          })
        : null;

    if (lcpObserver) {
      try {
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // ignore
      }
    }

    return () => {
      if (lcpObserver) {
        lcpObserver.disconnect();
      }
    };
  }, []);

  // Navigation guard to detect blocked clicks and auto-retry when needed.
  useEffect(() => {
    const cleanup = enableNavGuard();
    return cleanup;
  }, []);

  // Opportunistic prefetch of the most common dashboard routes to reduce perceived latency.
  useEffect(() => {
    const routesToPrefetch = [
      "/dashboard",
      "/projects",
      "/forms",
      "/galleries",
      "/scheduling",
      "/clients",
      "/invoices",
      "/payments",
    ];

    // Defer to idle time so we do not compete with initial render.
    const run = () => {
      for (const href of routesToPrefetch) {
        if (href !== pathname) {
          try {
            router.prefetch(href);
          } catch {
            // Prefetch failures are non-fatal; ignore.
          }
        }
      }
    };

    if ("requestIdleCallback" in window) {
      const id = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(run, { timeout: 2000 });
      return () => (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }

    const handle = globalThis.setTimeout(run, 350);
    return () => globalThis.clearTimeout(handle);
  }, [pathname, router]);

  return (
    <div
      ref={shellRef}
      className={`shell-container flex min-h-screen bg-[var(--background)] ${sidebarPosition === "right" ? "flex-row-reverse" : ""}`}
      data-sidebar-compact={isCompact ? "true" : undefined}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[20000] focus:rounded-md focus:bg-[var(--card)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      {/* Unified Sidebar */}
      <div className="shell-sidebar">
        <DashboardSidebar
          navData={navData}
          isCompact={isCompact}
          onToggleCompact={handleToggleCompact}
          sidebarPosition={sidebarPosition}
        />
      </div>

      {mobileMenuOpen ? (
        <>
          <div
            className="shell-mobile-overlay fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseMenu}
            aria-hidden="true"
          />
          <div className="shell-mobile-panel fixed inset-y-0 left-0 z-50">
            <DashboardSidebar
              navData={navData}
              isCompact={isCompact}
              onToggleCompact={handleToggleCompact}
              sidebarPosition={sidebarPosition}
              variant="overlay"
              onClose={handleCloseMenu}
            />
          </div>
        </>
      ) : null}

      {/* Main content area */}
      <div className="shell-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar with mobile menu button */}
        <header className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--card)]">
          <div className="flex items-center gap-3 px-4 py-3 sm:h-16 sm:py-0 lg:px-6">
            <DashboardMenuButton onClick={handleOpenMenu} />
            <div className="flex-1 min-w-0">
              <DashboardTopbar
                className="border-0 px-0 py-0"
                navLinks={navData.items}
                navMode="sidebar"
                navAutoForced={false}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main"
          className={`flex-1 min-h-0 min-w-0 overflow-y-auto bg-[var(--background)] ${
            pathname?.startsWith("/settings") ? "" : "p-4 sm:p-6 lg:p-8"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
