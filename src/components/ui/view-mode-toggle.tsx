"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { GridIcon, ListIcon } from "@/components/ui/icons";

export type ViewMode = "grid" | "list";

export interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default";
}

/**
 * A toggle component for switching between grid and list view modes.
 * Used across galleries, services, and other list views.
 */
export function ViewModeToggle({
  value,
  onChange,
  disabled = false,
  className,
  size = "default",
}: ViewModeToggleProps) {
  const buttonClasses = cn(
    "flex items-center justify-center rounded-md transition-colors",
    size === "sm" ? "h-7 w-7" : "h-8 w-8",
    disabled && "opacity-50 cursor-not-allowed"
  );

  const activeClasses = "bg-[var(--primary)] text-white";
  const inactiveClasses = "text-foreground-muted hover:text-foreground";

  return (
    <div
      className={cn(
        "flex rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-1",
        className
      )}
      role="radiogroup"
      aria-label="View mode"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "grid"}
        aria-label="Grid view"
        onClick={() => !disabled && onChange("grid")}
        disabled={disabled}
        className={cn(
          buttonClasses,
          value === "grid" ? activeClasses : inactiveClasses
        )}
      >
        <GridIcon className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "list"}
        aria-label="List view"
        onClick={() => !disabled && onChange("list")}
        disabled={disabled}
        className={cn(
          buttonClasses,
          value === "list" ? activeClasses : inactiveClasses
        )}
      >
        <ListIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
