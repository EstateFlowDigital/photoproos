"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useRecentSettings,
  type RecentSettingsItem,
} from "@/hooks/use-recent-settings";
import { ChevronRightIcon, ClockIcon, XIcon } from "lucide-react";
import { SETTINGS_ICON_MAP } from "@/components/settings/settings-icon-map";
import type { SettingsIconName } from "@/lib/constants/settings-navigation";
import { findSettingsItemByHref } from "@/lib/constants/settings-navigation";

// ============================================================================
// Settings Visit Tracker
// ============================================================================

interface SettingsVisitTrackerProps {
  href: string;
  label: string;
  iconName: string;
}

/**
 * Invisible component that tracks visits to settings pages.
 * Place this in your settings page layouts to track navigation.
 */
export function SettingsVisitTracker({
  href,
  label,
  iconName,
}: SettingsVisitTrackerProps) {
  const { trackVisit } = useRecentSettings();
  const pathname = usePathname();

  useEffect(() => {
    // Only track if we're on the exact page (not a sub-page)
    if (pathname === href) {
      trackVisit({ href, label, iconName });
    }
  }, [pathname, href, label, iconName, trackVisit]);

  return null;
}

// ============================================================================
// Auto Settings Tracker
// ============================================================================

/**
 * Automatically tracks visits to settings pages based on the current pathname.
 * Uses the SETTINGS_NAVIGATION structure to find page metadata.
 */
export function SettingsAutoTracker() {
  const { trackVisit } = useRecentSettings();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === "/settings") return;

    // Find the settings item for this path
    const item = findSettingsItemByHref(pathname);

    if (item) {
      trackVisit({
        href: item.href,
        label: item.label,
        iconName: item.iconName,
      });
    }
  }, [pathname, trackVisit]);

  return null;
}

// ============================================================================
// Recent Settings Section
// ============================================================================

interface RecentSettingsSectionProps {
  className?: string;
}

export function RecentSettingsSection({ className }: RecentSettingsSectionProps) {
  const { recentItems, clearRecent, isLoaded } = useRecentSettings();

  // Don't render anything until loaded (prevents hydration mismatch)
  if (!isLoaded || recentItems.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-foreground-muted" />
          <h2 className="text-base font-semibold text-foreground">
            Recently Visited
          </h2>
        </div>
        <button
          onClick={clearRecent}
          className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          <XIcon className="h-3 w-3" />
          Clear
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recentItems.map((item) => (
          <RecentSettingCard key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// Recent Setting Card
// ============================================================================

interface RecentSettingCardProps {
  item: RecentSettingsItem;
}

function RecentSettingCard({ item }: RecentSettingCardProps) {
  const IconComponent = SETTINGS_ICON_MAP[item.iconName as SettingsIconName];

  return (
    <Link
      href={item.href}
      className="group flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 transition-all duration-200 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)] text-foreground-muted transition-colors duration-200 group-hover:bg-[var(--primary)]/15 group-hover:text-[var(--primary)]">
        {IconComponent && <IconComponent className="h-4 w-4" />}
      </div>
      <span className="flex-1 text-sm font-medium text-foreground group-hover:text-[var(--primary)] transition-colors truncate">
        {item.label}
      </span>
      <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-foreground-muted opacity-0 transition-all duration-200 group-hover:opacity-100" />
    </Link>
  );
}

// ============================================================================
// Helper: Get relative time string
// ============================================================================

export function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
