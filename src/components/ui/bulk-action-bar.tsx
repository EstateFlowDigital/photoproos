"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { XIcon } from "@/components/ui/icons";

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "primary";
  disabled?: boolean;
  /** Tooltip text when disabled */
  disabledReason?: string;
}

export interface BulkActionBarProps {
  /** Number of items selected */
  selectedCount: number;
  /** Label for the items (e.g., "gallery", "service", "photo") - will be pluralized */
  itemLabel?: string;
  /** Called when clear selection button is clicked */
  onClear: () => void;
  /** Array of action buttons to display */
  actions: BulkAction[];
  /** Whether any action is currently loading */
  isLoading?: boolean;
  /** Additional className for the container */
  className?: string;
}

/**
 * A floating action bar that appears when items are selected.
 * Used for bulk actions across galleries, services, clients, etc.
 */
export function BulkActionBar({
  selectedCount,
  itemLabel = "item",
  onClear,
  actions,
  isLoading = false,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const pluralLabel = selectedCount === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "animate-in slide-in-from-bottom-4 fade-in duration-200",
        className
      )}
    >
      <div className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-2 shadow-xl">
        {/* Selection Count */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-[var(--card-border)]">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {pluralLabel} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {actions.map((action, index) => {
            const isDisabled = isLoading || action.disabled;

            return (
              <React.Fragment key={action.label}>
                {/* Add separator before primary actions */}
                {action.variant === "primary" && index > 0 && (
                  <div className="w-px h-6 bg-[var(--card-border)]" />
                )}
                <button
                  type="button"
                  onClick={action.onClick}
                  disabled={isDisabled}
                  title={isDisabled && action.disabledReason ? action.disabledReason : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    action.variant === "danger" && "text-[var(--error)] hover:bg-[var(--error)]/10",
                    action.variant === "primary" && "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
                    action.variant === "default" && "text-foreground hover:bg-[var(--background-hover)]",
                    !action.variant && "text-foreground hover:bg-[var(--background-hover)]",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {action.icon && (
                    <span className="h-4 w-4" aria-hidden="true">
                      {action.icon}
                    </span>
                  )}
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClear}
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
          aria-label="Clear selection"
        >
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
