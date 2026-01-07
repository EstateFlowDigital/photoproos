"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SettingsSidebar } from "@/components/layout/settings-sidebar";
import {
  SettingsMobileNav,
  SettingsMobileMenuButton,
} from "@/components/layout/settings-mobile-nav";
import { ArrowLeftIcon } from "@/components/ui/settings-icons";
import Link from "next/link";
import { SettingsAutoTracker } from "@/components/settings/recent-settings";
import { SettingsBreadcrumbs } from "@/components/settings/settings-breadcrumbs";
import { UnsavedChangesProvider } from "@/components/settings/unsaved-changes-provider";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isLandingPage = pathname === "/settings";

  const handleOpenMenu = React.useCallback(() => setMobileMenuOpen(true), []);
  const handleCloseMenu = React.useCallback(() => setMobileMenuOpen(false), []);

  return (
    <UnsavedChangesProvider>
    <div className="flex h-full min-h-0">
      {/* Track visits to settings pages */}
      <SettingsAutoTracker />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SettingsSidebar />
      </div>

      {/* Mobile Navigation */}
      <SettingsMobileNav isOpen={mobileMenuOpen} onClose={handleCloseMenu} />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header with menu button - hide back arrow on landing page */}
        <div className="flex items-center gap-3 border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3 lg:hidden">
          <SettingsMobileMenuButton onClick={handleOpenMenu} />
          <div className="flex items-center gap-2">
            {!isLandingPage && (
              <Link
                href="/settings"
                className="text-foreground-muted hover:text-foreground"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            )}
            <span className="text-sm font-medium text-foreground">Settings</span>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
          {/* Desktop breadcrumbs */}
          <SettingsBreadcrumbs className="hidden lg:flex" />
          {children}
        </div>
      </div>
    </div>
    </UnsavedChangesProvider>
  );
}
