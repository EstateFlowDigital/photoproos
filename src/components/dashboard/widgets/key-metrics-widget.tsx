"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole } from "@/lib/utils/units";

// ============================================================================
// Types
// ============================================================================

interface KeyMetric {
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  href?: string;
}

interface KeyMetricsWidgetProps {
  revenue?: {
    current: number;
    previous: number;
  };
  galleries?: {
    active: number;
    previous: number;
  };
  clients?: {
    total: number;
    previous: number;
  };
  invoices?: {
    pending: number;
  };
  showRevenue?: boolean;
  showGalleries?: boolean;
  showClients?: boolean;
  showInvoices?: boolean;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculatePercentChange(
  current: number,
  previous: number
): { value: string; positive: boolean } | undefined {
  if (previous === 0) {
    if (current > 0) return { value: "+100%", positive: true };
    return undefined;
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return undefined;
  return {
    value: `${change > 0 ? "+" : ""}${change}%`,
    positive: change > 0,
  };
}

function calculateCountChange(
  current: number,
  previous: number
): { value: string; positive: boolean } | undefined {
  const diff = current - previous;
  if (diff === 0) return undefined;
  return {
    value: `${diff > 0 ? "+" : ""}${diff}`,
    positive: diff > 0,
  };
}

// ============================================================================
// Metric Card Component
// ============================================================================

function MetricCard({ metric }: { metric: KeyMetric }) {
  const content = (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-foreground-muted">{metric.label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{metric.value}</span>
        {metric.change && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
              metric.change.positive
                ? "bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--error)]/10 text-[var(--error)]"
            )}
          >
            {metric.change.positive ? (
              <svg
                className="h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {metric.change.value}
          </span>
        )}
      </div>
    </div>
  );

  if (metric.href) {
    return (
      <Link
        href={metric.href}
        className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 transition-colors hover:bg-[var(--background-elevated)]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
      {content}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function KeyMetricsWidget({
  revenue = { current: 0, previous: 0 },
  galleries = { active: 0, previous: 0 },
  clients = { total: 0, previous: 0 },
  invoices = { pending: 0 },
  showRevenue = true,
  showGalleries = true,
  showClients = true,
  showInvoices = true,
  className,
}: KeyMetricsWidgetProps) {
  const metrics: KeyMetric[] = [];

  if (showRevenue) {
    metrics.push({
      label: "Monthly Revenue",
      value: formatCurrencyWhole(revenue.current),
      change: calculatePercentChange(revenue.current, revenue.previous),
      href: "/payments",
    });
  }

  if (showGalleries) {
    metrics.push({
      label: "Active Galleries",
      value: galleries.active.toString(),
      change: calculateCountChange(galleries.active, galleries.previous),
      href: "/galleries",
    });
  }

  if (showClients) {
    metrics.push({
      label: "Total Clients",
      value: clients.total.toString(),
      change: calculateCountChange(clients.total, clients.previous),
      href: "/clients",
    });
  }

  if (showInvoices) {
    metrics.push({
      label: "Pending Invoices",
      value: formatCurrencyWhole(invoices.pending),
      href: "/invoices?status=sent",
    });
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        metrics.length === 4
          ? "grid-cols-2 lg:grid-cols-4"
          : metrics.length === 3
          ? "grid-cols-3"
          : metrics.length === 2
          ? "grid-cols-2"
          : "grid-cols-1",
        className
      )}
    >
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </div>
  );
}

export default KeyMetricsWidget;
