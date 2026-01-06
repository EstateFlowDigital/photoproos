"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  href?: string;
}

export interface FilterPillsProps {
  options: FilterOption[];
  value: string;
  onChange?: (value: string) => void;
  /** Use Next.js Links instead of buttons (for URL-based filtering) */
  asLinks?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Size variant */
  size?: "sm" | "default";
}

/**
 * FilterPills - A shared component for status/category filter pills.
 * Supports both button-based (onChange) and link-based (href) filtering.
 *
 * @example
 * // Link-based filtering (URL params)
 * <FilterPills
 *   options={[
 *     { value: "all", label: "All", count: 10, href: "/invoices" },
 *     { value: "draft", label: "Draft", count: 3, href: "/invoices?status=draft" },
 *   ]}
 *   value={currentFilter}
 *   asLinks
 * />
 *
 * @example
 * // Button-based filtering (state)
 * <FilterPills
 *   options={[
 *     { value: "all", label: "All", count: galleries.length },
 *     { value: "delivered", label: "Delivered", count: 5 },
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 */
export function FilterPills({
  options,
  value,
  onChange,
  asLinks = false,
  className,
  size = "default",
}: FilterPillsProps) {
  const pillClasses = cn(
    "inline-flex items-center gap-2 rounded-lg font-medium transition-colors",
    size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
  );

  const activePillClasses = "bg-[var(--primary)] text-white";
  const inactivePillClasses =
    "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)]";

  const countClasses = cn(
    "rounded-full text-xs",
    size === "sm" ? "px-1 py-0.5" : "px-1.5 py-0.5"
  );

  const activeCountClasses = "bg-white/20";
  const inactiveCountClasses = "bg-[var(--background-tertiary)]";

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist">
      {options.map((option) => {
        const isActive = value === option.value;

        const content = (
          <>
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  countClasses,
                  isActive ? activeCountClasses : inactiveCountClasses
                )}
              >
                {option.count}
              </span>
            )}
          </>
        );

        if (asLinks && option.href) {
          return (
            <Link
              key={option.value}
              href={option.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                pillClasses,
                isActive ? activePillClasses : inactivePillClasses
              )}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(option.value)}
            className={cn(
              pillClasses,
              isActive ? activePillClasses : inactivePillClasses
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
