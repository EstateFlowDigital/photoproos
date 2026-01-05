"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { MobileNav, MobileMenuButton } from "./mobile-nav";
import { getRedirectForDisabledModule } from "@/lib/modules/gating";
import { getFilteredNavigation } from "@/lib/modules/gating";
import { ResponsiveTester } from "@/components/dev/responsive-tester";
import { BugProbe } from "@/components/dev/bug-probe";
import { useTheme } from "@/components/theme-provider";

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
  sidebarPosition?: "left" | "right";
  autoTheme?: AutoThemeConfig;
}

export function DashboardLayoutClient({
  children,
  enabledModules,
  industries,
  unreadNotificationCount = 0,
  sidebarPosition = "left",
  autoTheme,
}: DashboardLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);

  const handleOpenMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false);
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

  // Ensure nav edit mode is cleared on load
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ppos_nav_edit_mode", JSON.stringify(false));
    window.dispatchEvent(new CustomEvent("ppos-nav-edit", { detail: false }));
  }, []);

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

  return (
    <ResponsiveTester>
      <BugProbe />
      <div
        ref={shellRef}
        className={`shell-container flex min-h-screen bg-[var(--background)] ${sidebarPosition === "right" ? "flex-row-reverse" : ""}`}
      >
        {/* Desktop Sidebar */}
        <div className="shell-sidebar hidden lg:block">
          <DashboardSidebar
            enabledModules={enabledModules}
            industries={industries}
            notificationCount={unreadNotificationCount}
          />
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={handleCloseMenu}
          enabledModules={enabledModules}
          industries={industries}
          notificationCount={unreadNotificationCount}
        />

        {/* Main content area */}
        <div className="shell-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Topbar with mobile menu button */}
          <header className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--card)]">
            <div className="flex items-center gap-3 px-4 py-3 sm:h-16 sm:py-0 lg:px-6">
              <MobileMenuButton onClick={handleOpenMenu} className="shell-mobile-trigger shrink-0" />

              <div className="flex-1 min-w-0">
                <DashboardTopbar
                  className="border-0 px-0 py-0"
                  navLinks={getFilteredNavigation({ enabledModules, industries })}
                  navMode="sidebar"
                  navAutoForced={false}
                />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-[var(--background)] p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ResponsiveTester>
  );
}
