"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * SettingsPageSkeleton
 *
 * Loading skeleton for settings pages with consistent layout.
 */

interface SettingsPageSkeletonProps {
  /** Number of form cards to show */
  cards?: number;
  /** Whether to show a sidebar */
  hasSidebar?: boolean;
  /** Additional className */
  className?: string;
}

export function SettingsPageSkeleton({
  cards = 2,
  hasSidebar = false,
  className,
}: SettingsPageSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Content */}
      {hasSidebar ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: cards }).map((_, i) => (
              <SettingsCardSkeleton key={i} />
            ))}
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            <SettingsCardSkeleton fields={3} />
            <SettingsCardSkeleton fields={3} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from({ length: cards }).map((_, i) => (
            <SettingsCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SettingsCardSkeleton
 *
 * Loading skeleton for a single settings card.
 */

interface SettingsCardSkeletonProps {
  /** Number of fields to show */
  fields?: number;
  /** Additional className */
  className?: string;
}

export function SettingsCardSkeleton({
  fields = 4,
  className,
}: SettingsCardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SettingsRowSkeleton
 *
 * Loading skeleton for a settings toggle row.
 */

interface SettingsRowSkeletonProps {
  /** Additional className */
  className?: string;
}

export function SettingsRowSkeleton({ className }: SettingsRowSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg px-4 py-3",
        className
      )}
    >
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-11 rounded-full" />
    </div>
  );
}

SettingsPageSkeleton.displayName = "SettingsPageSkeleton";
SettingsCardSkeleton.displayName = "SettingsCardSkeleton";
SettingsRowSkeleton.displayName = "SettingsRowSkeleton";
