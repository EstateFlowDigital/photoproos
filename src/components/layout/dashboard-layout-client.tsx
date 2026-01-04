"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { MobileNav, MobileMenuButton } from "./mobile-nav";
import { getRedirectForDisabledModule } from "@/lib/modules/gating";
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

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar with mobile menu button */}
        <header className="flex h-16 items-center border-b border-[var(--card-border)] bg-[var(--card)] px-4 lg:px-6">
          {/* Mobile menu button */}
          <MobileMenuButton onClick={handleOpenMenu} className="mr-3" />

          {/* Desktop topbar content */}
          <div className="flex-1 min-w-0">
            <DashboardTopbar className="h-full border-0 px-0" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-[var(--background)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Developer Tools - Only visible to developer email */}
      <ResponsiveTester />
    </div>
  );
}
