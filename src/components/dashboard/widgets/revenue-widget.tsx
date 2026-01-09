"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole } from "@/lib/utils/units";

// ============================================================================
// Types
// ============================================================================

interface RevenueWidgetProps {
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  yearToDateRevenue: number;
  monthlyGoal?: number;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function RevenueWidget({
  currentMonthRevenue,
  previousMonthRevenue,
  yearToDateRevenue,
  monthlyGoal,
  className,
}: RevenueWidgetProps) {
  // Calculate change
  const percentChange =
    previousMonthRevenue > 0
      ? Math.round(
          ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
            100
        )
      : currentMonthRevenue > 0
      ? 100
      : 0;

  const isPositive = percentChange >= 0;

  // Calculate goal progress
  const goalProgress =
    monthlyGoal && monthlyGoal > 0
      ? Math.min(100, Math.round((currentMonthRevenue / monthlyGoal) * 100))
      : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Revenue */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {formatCurrencyWhole(currentMonthRevenue)}
          </span>
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              isPositive
                ? "bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--error)]/10 text-[var(--error)]"
            )}
          >
            {isPositive ? (
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
            {Math.abs(percentChange)}%
          </span>
        </div>
        <p className="text-xs text-foreground-muted">This month</p>
      </div>

      {/* Goal Progress */}
      {goalProgress !== null && monthlyGoal && (
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap text-xs">
            <span className="text-foreground-muted">Monthly goal</span>
            <span className="font-medium text-foreground">
              {goalProgress}% of {formatCurrencyWhole(monthlyGoal)}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-x-auto rounded-full bg-[var(--background-secondary)]">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                goalProgress >= 100
                  ? "bg-[var(--success)]"
                  : goalProgress >= 75
                  ? "bg-[var(--primary)]"
                  : goalProgress >= 50
                  ? "bg-[var(--warning)]"
                  : "bg-[var(--error)]"
              )}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--card-border)]">
        <div>
          <p className="text-xs text-foreground-muted">Last month</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrencyWhole(previousMonthRevenue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-foreground-muted">Year to date</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrencyWhole(yearToDateRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RevenueWidget;
