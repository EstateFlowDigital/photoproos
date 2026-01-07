"use client";

import Link from "next/link";
import {
  usePinnedSettings,
  type PinnedSettingsItem,
} from "@/hooks/use-pinned-settings";
import { ChevronRightIcon, PinIcon, XIcon, StarIcon } from "lucide-react";
import { SETTINGS_ICON_MAP } from "@/components/settings/settings-icon-map";
import type { SettingsIconName } from "@/lib/constants/settings-navigation";
import { cn } from "@/lib/utils";

// ============================================================================
// Pinned Settings Section
// ============================================================================

interface PinnedSettingsSectionProps {
  className?: string;
}

export function PinnedSettingsSection({ className }: PinnedSettingsSectionProps) {
  const { pinnedItems, unpin, isLoaded } = usePinnedSettings();

  // Don't render anything until loaded (prevents hydration mismatch)
  if (!isLoaded || pinnedItems.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StarIcon className="h-4 w-4 text-amber-400" />
          <h2 className="text-base font-semibold text-foreground">
            Pinned Settings
          </h2>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {pinnedItems.map((item) => (
          <PinnedSettingCard
            key={item.href}
            item={item}
            onUnpin={() => unpin(item.href)}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// Pinned Setting Card
// ============================================================================

interface PinnedSettingCardProps {
  item: PinnedSettingsItem;
  onUnpin: () => void;
}

function PinnedSettingCard({ item, onUnpin }: PinnedSettingCardProps) {
  const IconComponent = SETTINGS_ICON_MAP[item.iconName as SettingsIconName];

  return (
    <div className="group relative">
      <Link
        href={item.href}
        className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 transition-all duration-200 hover:border-amber-500/40 hover:bg-amber-500/10"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition-colors duration-200 group-hover:bg-amber-500/20">
          {IconComponent && <IconComponent className="h-4 w-4" />}
        </div>
        <span className="flex-1 text-sm font-medium text-foreground transition-colors truncate">
          {item.label}
        </span>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-foreground-muted opacity-0 transition-all duration-200 group-hover:opacity-100" />
      </Link>
      {/* Unpin button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onUnpin();
        }}
        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--background)] border border-[var(--card-border)] text-foreground-muted hover:text-[var(--error)] hover:border-[var(--error)]/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Unpin"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

// ============================================================================
// Pin Button
// ============================================================================

interface PinButtonProps {
  href: string;
  label: string;
  iconName: string;
  className?: string;
  size?: "sm" | "md";
}

export function PinButton({
  href,
  label,
  iconName,
  className,
  size = "md",
}: PinButtonProps) {
  const { isPinned, togglePin, canPin } = usePinnedSettings();
  const pinned = isPinned(href);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePin({ href, label, iconName });
      }}
      disabled={!pinned && !canPin}
      className={cn(
        "flex items-center justify-center rounded-md transition-colors",
        size === "sm" ? "h-6 w-6" : "h-8 w-8",
        pinned
          ? "text-amber-400 hover:text-amber-300"
          : "text-foreground-muted hover:text-foreground",
        !pinned && !canPin && "opacity-50 cursor-not-allowed",
        className
      )}
      title={
        pinned
          ? "Unpin"
          : canPin
            ? "Pin to favorites"
            : "Maximum pinned items reached"
      }
    >
      {pinned ? (
        <StarIcon className={cn("fill-current", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      ) : (
        <StarIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
    </button>
  );
}

// ============================================================================
// Pin Toggle for Settings Cards
// ============================================================================

interface SettingsPinToggleProps {
  href: string;
  label: string;
  iconName: string;
}

export function SettingsPinToggle({ href, label, iconName }: SettingsPinToggleProps) {
  const { isPinned, togglePin, canPin, isLoaded } = usePinnedSettings();

  if (!isLoaded) return null;

  const pinned = isPinned(href);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePin({ href, label, iconName });
      }}
      disabled={!pinned && !canPin}
      className={cn(
        "absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
        pinned
          ? "text-amber-400 bg-amber-400/10"
          : "text-foreground-muted bg-transparent opacity-0 group-hover:opacity-100 hover:bg-[var(--background-hover)]",
        !pinned && !canPin && "opacity-50 cursor-not-allowed"
      )}
      title={pinned ? "Unpin" : canPin ? "Pin" : "Maximum pinned items reached"}
    >
      <StarIcon className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
    </button>
  );
}
