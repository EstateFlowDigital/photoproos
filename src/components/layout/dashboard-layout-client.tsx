"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { MobileNav, MobileMenuButton } from "./mobile-nav";
import { getRedirectForDisabledModule } from "@/lib/modules/gating";
import { getFilteredNavigation } from "@/lib/modules/gating";
import { ResponsiveTester } from "@/components/dev/responsive-tester";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  enabledModules: string[];
  industries: string[];
  unreadNotificationCount?: number;
}

export function DashboardLayoutClient({
  children,
  enabledModules,
  industries,
  unreadNotificationCount = 0,
}: DashboardLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navMode, setNavMode] = useState<"sidebar" | "top">("sidebar");

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

  // Persist nav mode preference
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("ppos-nav-mode") : null;
    if (stored === "top" || stored === "sidebar") {
      setNavMode(stored);
    }
  }, []);

  const handleNavModeChange = (mode: "sidebar" | "top") => {
    setNavMode(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ppos-nav-mode", mode);
    }
  };

  return (
    <ResponsiveTester>
      <div className="shell-container flex h-screen bg-[var(--background)]">
        {/* Desktop Sidebar - hidden on mobile or when in top-nav mode */}
        {navMode !== "top" && (
          <div className="shell-sidebar hidden lg:block">
            <DashboardSidebar
              enabledModules={enabledModules}
              industries={industries}
              notificationCount={unreadNotificationCount}
            />
          </div>
        )}

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
          <header className="flex h-16 items-center border-b border-[var(--card-border)] bg-[var(--card)] px-4 lg:px-6">
            {/* Mobile menu button */}
            <MobileMenuButton onClick={handleOpenMenu} className="mr-3 shell-mobile-trigger" />

            {/* Desktop topbar content */}
            <div className="flex-1 min-w-0">
              <DashboardTopbar
                className="h-full border-0 px-0"
                navLinks={getFilteredNavigation({ enabledModules, industries })}
                navMode={navMode}
                onNavModeChange={handleNavModeChange}
              />
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
