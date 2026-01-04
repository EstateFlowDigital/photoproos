"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface SqftAnalytics {
  summary: {
    totalSqft: number;
    totalRevenue: number;
    totalOrders: number;
    avgSqftPerOrder: number;
    revenuePerSqft: number;
    recentSqft: number;
    recentRevenue: number;
    sqftTrend: number;
  };
  tiers: Array<{
    name: string;
    count: number;
    sqft: number;
    revenue: number;
    avgPricePerSqft: number;
  }>;
  distribution: Array<{
    label: string;
    count: number;
    sqft: number;
    revenue: number;
  }>;
  monthly: Array<{
    month: string;
    monthLabel: string;
    sqft: number;
    revenue: number;
    count: number;
  }>;
}

interface SqftAnalyticsClientProps {
  analytics: SqftAnalytics;
  totalOrders: number;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function SqftAnalyticsClient({ analytics, totalOrders }: SqftAnalyticsClientProps) {
  const { summary, tiers, distribution, monthly } = analytics;

  // Calculate what percentage of orders have sqft data
  const sqftOrderPercent = totalOrders > 0
    ? Math.round((summary.totalOrders / totalOrders) * 100)
    : 0;

  // Get max values for chart scaling
  const maxMonthlySqft = useMemo(
    () => Math.max(...monthly.map((m) => m.sqft), 1),
    [monthly]
  );
  const maxMonthlyRevenue = useMemo(
    () => Math.max(...monthly.map((m) => m.revenue), 1),
    [monthly]
  );
  const maxDistributionCount = useMemo(
    () => Math.max(...distribution.map((d) => d.count), 1),
    [distribution]
  );
  const maxTierRevenue = useMemo(
    () => Math.max(...tiers.map((t) => t.revenue), 1),
    [tiers]
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Sqft Booked</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-foreground">
              {formatNumber(summary.totalSqft)}
            </p>
            {summary.sqftTrend !== 0 && (
              <span
                className={cn(
                  "flex items-center text-xs font-medium",
                  summary.sqftTrend > 0
                    ? "text-[var(--success)]"
                    : "text-[var(--error)]"
                )}
              >
                {summary.sqftTrend > 0 ? (
                  <TrendUpIcon className="mr-0.5 h-3 w-3" />
                ) : (
                  <TrendDownIcon className="mr-0.5 h-3 w-3" />
                )}
                {Math.abs(summary.sqftTrend)}%
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            Last 30 days: {formatNumber(summary.recentSqft)} sqft
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Sqft Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Last 30 days: {formatCurrency(summary.recentRevenue)}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Avg Sqft/Order</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatNumber(summary.avgSqftPerOrder)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {sqftOrderPercent}% of orders include sqft
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Revenue/Sqft</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
            {formatCurrency(summary.revenuePerSqft)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Across {summary.totalOrders} orders
          </p>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {monthly.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground">Monthly Sqft Trend</h3>
          <div className="mt-6 flex items-end gap-2" style={{ height: "160px" }}>
            {monthly.map((month) => {
              const sqftHeight = (month.sqft / maxMonthlySqft) * 100;
              return (
                <div
                  key={month.month}
                  className="group relative flex-1 min-w-0"
                >
                  <div className="flex h-full flex-col justify-end gap-1">
                    {/* Sqft bar */}
                    <div
                      className="w-full rounded-t bg-[var(--primary)]/40 transition-colors group-hover:bg-[var(--primary)]/60"
                      style={{ height: `${Math.max(sqftHeight, 4)}%` }}
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                    <div className="whitespace-nowrap rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-foreground">{month.monthLabel}</p>
                      <p className="text-foreground-muted">
                        {formatNumber(month.sqft)} sqft
                      </p>
                      <p className="text-foreground-muted">
                        {formatCurrency(month.revenue)} revenue
                      </p>
                      <p className="text-foreground-muted">
                        {month.count} order{month.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-foreground-muted">
            {monthly.length > 0 && (
              <>
                <span>{monthly[0].monthLabel}</span>
                <span>{monthly[monthly.length - 1].monthLabel}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing Tier Breakdown */}
        {tiers.length > 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
            <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Revenue by Pricing Tier</h3>
            </div>
            <div className="divide-y divide-[var(--card-border)]">
              {tiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)] text-sm font-medium text-foreground-muted">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-foreground">{tier.name}</p>
                      <p className="shrink-0 font-semibold text-[var(--success)]">
                        {formatCurrency(tier.revenue)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-foreground-muted">
                      <span>{formatNumber(tier.sqft)} sqft</span>
                      <span>{tier.count} order{tier.count !== 1 ? "s" : ""}</span>
                      <span>{formatCurrency(tier.avgPricePerSqft)}/sqft</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--background-secondary)]">
                        <div
                          className="h-full rounded-full bg-[var(--primary)]"
                          style={{ width: `${(tier.revenue / maxTierRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sqft Size Distribution */}
        {distribution.length > 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
            <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Property Size Distribution</h3>
            </div>
            <div className="divide-y divide-[var(--card-border)]">
              {distribution.map((range) => (
                <div
                  key={range.label}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)] text-xs font-medium text-foreground-muted">
                    <SquareIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{range.label} sqft</p>
                      <p className="shrink-0 text-sm text-foreground-muted">
                        {range.count} order{range.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-foreground-muted">
                      <span>{formatNumber(range.sqft)} total sqft</span>
                      <span>{formatCurrency(range.revenue)}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--background-secondary)]">
                        <div
                          className="h-full rounded-full bg-[var(--warning)]"
                          style={{ width: `${(range.count / maxDistributionCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty state if no data */}
      {summary.totalOrders === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <SquareIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No sqft-based orders yet
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Analytics will appear here once you have paid orders with square footage data.
          </p>
        </div>
      )}
    </div>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M1.22 5.222a.75.75 0 0 1 1.06 0L7 9.942l3.768-3.769a.75.75 0 0 1 1.113.058 20.908 20.908 0 0 1 3.813 7.254l1.574-2.727a.75.75 0 0 1 1.3.75l-2.475 4.286a.75.75 0 0 1-1.025.275l-4.287-2.475a.75.75 0 0 1 .75-1.3l2.71 1.565a19.422 19.422 0 0 0-3.013-6.024L7.53 11.533a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M3.75 3A.75.75 0 0 0 3 3.75v12.5c0 .414.336.75.75.75h12.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75H3.75Z" />
    </svg>
  );
}
