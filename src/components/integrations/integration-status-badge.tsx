"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { IntegrationStatus } from "@/lib/integrations/registry";
import { CheckCircleIcon, XIcon, WarningIcon } from "@/components/ui/settings-icons";

// ============================================================================
// Integration Status Badge
// ============================================================================

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
  comingSoon?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function IntegrationStatusBadge({
  status,
  comingSoon = false,
  showIcon = true,
  className,
}: IntegrationStatusBadgeProps) {
  if (comingSoon) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
          "bg-[var(--background-secondary)] text-foreground-muted",
          className
        )}
      >
        Coming Soon
      </span>
    );
  }

  const statusConfig = {
    connected: {
      label: "Connected",
      icon: CheckCircleIcon,
      className: "bg-[var(--success)]/10 text-[var(--success)]",
    },
    disconnected: {
      label: "Not Connected",
      icon: null,
      className: "bg-[var(--background-secondary)] text-foreground-muted",
    },
    error: {
      label: "Error",
      icon: WarningIcon,
      className: "bg-[var(--error)]/10 text-[var(--error)]",
    },
    pending: {
      label: "Pending",
      icon: null,
      className: "bg-[var(--warning)]/10 text-[var(--warning)]",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        config.className,
        className
      )}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}

// ============================================================================
// Integration Sync Status
// ============================================================================

interface IntegrationSyncStatusProps {
  lastSync?: Date | null;
  nextSync?: Date | null;
  isActive?: boolean;
  className?: string;
}

export function IntegrationSyncStatus({
  lastSync,
  nextSync,
  isActive = true,
  className,
}: IntegrationSyncStatusProps) {
  if (!isActive) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-foreground-muted", className)}>
        <XIcon className="h-3 w-3" />
        <span>Sync paused</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1 text-xs text-foreground-muted", className)}>
      {lastSync && (
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-3 w-3 text-[var(--success)]" />
          <span>Last synced {formatRelativeTime(lastSync)}</span>
        </div>
      )}
      {nextSync && (
        <div className="flex items-center gap-2">
          <span className="ml-5">Next sync in {formatTimeUntil(nextSync)}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function formatTimeUntil(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs < 0) return "now";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"}`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  return date.toLocaleDateString();
}
