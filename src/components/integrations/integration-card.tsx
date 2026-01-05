"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Integration, IntegrationStatus } from "@/lib/integrations/registry";
import { IntegrationStatusBadge } from "./integration-status-badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  DropboxIcon,
  StripeIcon,
  BankIcon,
  MailIcon,
  MessageIcon,
  PlugIcon,
  LayersIcon,
  ChevronRightIcon,
  SettingsIcon,
} from "@/components/ui/settings-icons";

// ============================================================================
// Icon Mapping
// ============================================================================

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  calendar: CalendarIcon,
  dropbox: DropboxIcon,
  stripe: StripeIcon,
  bank: BankIcon,
  mail: MailIcon,
  message: MessageIcon,
  plug: PlugIcon,
  layers: LayersIcon,
};

// ============================================================================
// Integration Card
// ============================================================================

interface IntegrationCardProps {
  integration: Integration;
  status?: IntegrationStatus;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConfigure?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function IntegrationCard({
  integration,
  status = "disconnected",
  onConnect,
  onDisconnect,
  onConfigure,
  isLoading = false,
  className,
}: IntegrationCardProps) {
  const IconComponent = ICON_MAP[integration.icon] || PlugIcon;
  const isConnected = status === "connected";
  const hasError = status === "error";
  const isComingSoon = integration.comingSoon;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-[var(--card)] p-5 transition-all",
        isComingSoon
          ? "border-[var(--card-border)] opacity-75"
          : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/5",
        hasError && "border-[var(--error)]/50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
              isConnected
                ? "bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--background-secondary)] text-foreground-muted"
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{integration.name}</h3>
            <IntegrationStatusBadge status={status} comingSoon={isComingSoon} />
          </div>
        </div>

        {/* Premium Badge */}
        {integration.isPremium && (
          <span className="rounded-full bg-[var(--ai)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--ai)]">
            Premium
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 flex-1 text-sm text-foreground-muted">{integration.description}</p>

      {/* Features Preview */}
      {integration.features.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {integration.features.slice(0, 2).map((feature) => (
            <span
              key={feature.id}
              className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-[10px] font-medium text-foreground-muted"
            >
              {feature.label}
            </span>
          ))}
          {integration.features.length > 2 && (
            <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-[10px] font-medium text-foreground-muted">
              +{integration.features.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {isComingSoon ? (
          <Button variant="secondary" size="sm" disabled className="flex-1">
            Coming Soon
          </Button>
        ) : isConnected ? (
          <>
            {integration.settingsHref ? (
              <Button variant="secondary" size="sm" className="flex-1" asChild>
                <Link href={integration.settingsHref}>
                  <SettingsIcon className="mr-1.5 h-3.5 w-3.5" />
                  Configure
                </Link>
              </Button>
            ) : onConfigure ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={onConfigure}
                disabled={isLoading}
                className="flex-1"
              >
                <SettingsIcon className="mr-1.5 h-3.5 w-3.5" />
                Configure
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDisconnect}
              disabled={isLoading}
              className="text-foreground-muted hover:text-[var(--error)]"
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={onConnect}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Connecting..." : "Connect"}
            {!isLoading && <ChevronRightIcon className="ml-1.5 h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Connected Integration Card (Compact Version)
// ============================================================================

interface ConnectedIntegrationCardProps {
  integration: Integration;
  lastSync?: Date;
  onConfigure?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export function ConnectedIntegrationCard({
  integration,
  lastSync,
  onConfigure,
  onDisconnect,
  className,
}: ConnectedIntegrationCardProps) {
  const IconComponent = ICON_MAP[integration.icon] || PlugIcon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)]",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/10 text-[var(--success)]">
        <IconComponent className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground">{integration.name}</h3>
        {lastSync && (
          <p className="text-xs text-foreground-muted">
            Last synced {formatRelativeTime(lastSync)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {integration.settingsHref ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={integration.settingsHref}>
              <SettingsIcon className="h-4 w-4" />
            </Link>
          </Button>
        ) : onConfigure ? (
          <Button variant="ghost" size="sm" onClick={onConfigure}>
            <SettingsIcon className="h-4 w-4" />
          </Button>
        ) : null}
        {onDisconnect && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            className="text-foreground-muted hover:text-[var(--error)]"
          >
            Disconnect
          </Button>
        )}
      </div>
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
