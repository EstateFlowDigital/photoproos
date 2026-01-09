"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ClientGrowthWidgetProps {
  totalClients: number;
  newClientsThisMonth: number;
  newClientsLastMonth: number;
  clientsByMonth?: { month: string; count: number }[];
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ClientGrowthWidget({
  totalClients,
  newClientsThisMonth,
  newClientsLastMonth,
  clientsByMonth = [],
  className,
}: ClientGrowthWidgetProps) {
  // Calculate growth
  const growth =
    newClientsLastMonth > 0
      ? Math.round(
          ((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) *
            100
        )
      : newClientsThisMonth > 0
      ? 100
      : 0;

  const isPositive = growth >= 0;

  // Simple sparkline data
  const maxCount = Math.max(...clientsByMonth.map((m) => m.count), 1);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Stats */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {totalClients}
            </span>
          </div>
          <p className="text-xs text-foreground-muted">Total clients</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            <span className="text-lg font-semibold text-foreground">
              +{newClientsThisMonth}
            </span>
            <span
              className={cn(
                "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                isPositive
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--error)]/10 text-[var(--error)]"
              )}
            >
              {isPositive ? "+" : ""}
              {growth}%
            </span>
          </div>
          <p className="text-xs text-foreground-muted">This month</p>
        </div>
      </div>

      {/* Sparkline Chart */}
      {clientsByMonth.length > 0 && (
        <div className="pt-2">
          <div className="flex h-12 items-end justify-between gap-1">
            {clientsByMonth.map((month, index) => (
              <div
                key={index}
                className="relative flex-1 group"
                title={`${month.month}: ${month.count} new clients`}
              >
                <div
                  className={cn(
                    "w-full rounded-t transition-colors",
                    index === clientsByMonth.length - 1
                      ? "bg-[var(--primary)]"
                      : "bg-[var(--background-secondary)] hover:bg-[var(--primary)]/50"
                  )}
                  style={{
                    height: `${Math.max(4, (month.count / maxCount) * 100)}%`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-foreground-muted">
            {clientsByMonth.length > 0 && (
              <>
                <span>{clientsByMonth[0]?.month}</span>
                <span>{clientsByMonth[clientsByMonth.length - 1]?.month}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="flex items-center gap-4 pt-2 border-t border-[var(--card-border)]">
        <div className="flex-1">
          <p className="text-xs text-foreground-muted">Last month</p>
          <p className="text-sm font-semibold text-foreground">
            +{newClientsLastMonth}
          </p>
        </div>
        <div className="h-8 w-px bg-[var(--card-border)]" />
        <div className="flex-1">
          <p className="text-xs text-foreground-muted">Avg. per month</p>
          <p className="text-sm font-semibold text-foreground">
            {clientsByMonth.length > 0
              ? Math.round(
                  clientsByMonth.reduce((acc, m) => acc + m.count, 0) /
                    clientsByMonth.length
                )
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClientGrowthWidget;
