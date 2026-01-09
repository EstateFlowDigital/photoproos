"use client";

import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

interface RevenueDataPoint {
  label: string;
  value: number;
  previousValue?: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  className?: string;
}


function formatCompactCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`;
  }
  return `$${dollars.toFixed(0)}`;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.previousValue || 0)));
  const totalCurrent = data.reduce((sum, d) => sum + d.value, 0);
  const totalPrevious = data.reduce((sum, d) => sum + (d.previousValue || 0), 0);
  const percentChange = totalPrevious > 0
    ? ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(0)
    : 0;
  const isPositive = totalCurrent >= totalPrevious;

  return (
    <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-foreground-muted">Revenue Trend</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalCurrent)}
            </span>
            {totalPrevious > 0 && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--error)]/10 text-[var(--error)]"
              )}>
                {isPositive ? "+" : ""}{percentChange}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
            <span className="text-foreground-muted">This period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--background-elevated)]" />
            <span className="text-foreground-muted">Previous</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const currentPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const previousPercent = maxValue > 0 && item.previousValue
            ? (item.previousValue / maxValue) * 100
            : 0;

          return (
            <div key={index} className="group">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-1.5">
                <span className="text-xs font-medium text-foreground">{item.label}</span>
                <span className="text-xs text-foreground-muted">
                  {formatCompactCurrency(item.value)}
                </span>
              </div>
              <div className="relative h-6 rounded-md bg-[var(--background-secondary)] overflow-hidden">
                {/* Previous period bar (background) */}
                {item.previousValue !== undefined && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-md bg-[var(--background-elevated)] transition-all duration-500"
                    style={{ width: `${previousPercent}%` }}
                  />
                )}
                {/* Current period bar (foreground) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-[var(--primary)] transition-all duration-500 group-hover:opacity-90"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-[var(--card-border)]">
        <div className="flex items-start justify-between gap-4 flex-wrap text-xs text-foreground-muted">
          <span>Last 6 months</span>
          <span>vs previous period</span>
        </div>
      </div>
    </div>
  );
}

// Compact sparkline version for smaller spaces
interface SparklineProps {
  data: number[];
  className?: string;
}

export function RevenueSparkline({ data, className }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className={cn("flex items-end gap-0.5 h-8", className)}>
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100;
        const isLast = index === data.length - 1;

        return (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-sm transition-all",
              isLast ? "bg-[var(--primary)]" : "bg-[var(--primary)]/40"
            )}
            style={{ height: `${Math.max(height, 10)}%` }}
          />
        );
      })}
    </div>
  );
}
