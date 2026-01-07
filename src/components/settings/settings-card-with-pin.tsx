"use client";

import Link from "next/link";
import { ChevronRightIcon, StarIcon } from "lucide-react";
import { SETTINGS_ICON_MAP } from "@/components/settings/settings-icon-map";
import type { SettingsIconName } from "@/lib/constants/settings-navigation";
import { usePinnedSettings } from "@/hooks/use-pinned-settings";
import { cn } from "@/lib/utils";

interface SettingCardWithPinProps {
  title: string;
  description: string;
  href: string;
  iconName: SettingsIconName;
}

export function SettingCardWithPin({
  title,
  description,
  href,
  iconName,
}: SettingCardWithPinProps) {
  const IconComponent = SETTINGS_ICON_MAP[iconName];
  const { isPinned, togglePin, canPin, isLoaded } = usePinnedSettings();
  const pinned = isLoaded && isPinned(href);

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePin({ href, label: title, iconName });
  };

  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all duration-200 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)] text-foreground-muted transition-colors duration-200 group-hover:bg-[var(--primary)]/15 group-hover:text-[var(--primary)]">
        {IconComponent && <IconComponent className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground group-hover:text-[var(--primary)] transition-colors">
          {title}
        </h3>
        <p className="mt-0.5 text-sm text-foreground-muted line-clamp-1">
          {description}
        </p>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-foreground-muted opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />

      {/* Pin toggle button */}
      {isLoaded && (
        <button
          onClick={handlePinClick}
          disabled={!pinned && !canPin}
          className={cn(
            "absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 z-10",
            pinned
              ? "text-amber-400 bg-amber-400/10"
              : "text-foreground-muted bg-transparent opacity-0 group-hover:opacity-100 hover:bg-[var(--background-hover)]",
            !pinned && !canPin && "opacity-50 cursor-not-allowed"
          )}
          title={
            pinned
              ? "Unpin"
              : canPin
                ? "Pin to favorites"
                : "Maximum pinned items reached"
          }
        >
          <StarIcon
            className={cn("h-3.5 w-3.5", pinned && "fill-current")}
          />
        </button>
      )}
    </Link>
  );
}
