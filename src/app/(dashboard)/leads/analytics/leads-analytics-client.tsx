"use client";

import { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LeadsAnalytics } from "@/lib/actions/leads-analytics";

interface LeadsAnalyticsClientProps {
  analytics: LeadsAnalytics;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(num));
}

function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

function formatHours(hours: number | null): string {
  if (hours === null) return "N/A";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

const SOURCE_TYPE_COLORS = {
  portfolio: "bg-purple-500",
  chat: "bg-cyan-500",
  booking: "bg-orange-500",
};

const SOURCE_TYPE_BG_COLORS = {
  portfolio: "bg-purple-500/10 text-purple-400",
  chat: "bg-cyan-500/10 text-cyan-400",
  booking: "bg-orange-500/10 text-orange-400",
};

const STATUS_COLORS = {
  new: "bg-[var(--primary)]",
  contacted: "bg-[var(--warning)]",
  qualified: "bg-[var(--success)]",
  closed: "bg-[var(--foreground-muted)]",
};

export function LeadsAnalyticsClient({ analytics }: LeadsAnalyticsClientProps) {
  const { summary, bySource, byStatus, monthly, funnel, recentConversions } = analytics;

  // Calculate max values for chart scaling
  const maxMonthlyTotal = useMemo(
    () => Math.max(...monthly.map((m) => m.total), 1),
    [monthly]
  );

  const maxSourceCount = useMemo(
    () => Math.max(...bySource.map((s) => s.count), 1),
    [bySource]
  );

  // Funnel stage values
  const funnelMax = Math.max(funnel.new, 1);

  return (
    <div className="space-y-6" role="region" aria-label="Leads Analytics Dashboard">
      {/* Summary Stats */}
      <div className="auto-grid grid-min-180 grid-gap-4" role="group" aria-label="Summary statistics">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Leads</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-foreground">
              {formatNumber(summary.totalLeads)}
            </p>
            {summary.monthOverMonthChange !== 0 && (
              <span
                className={cn(
                  "flex items-center text-xs font-medium",
                  summary.monthOverMonthChange > 0
                    ? "text-[var(--success)]"
                    : "text-[var(--error)]"
                )}
                aria-label={`${summary.monthOverMonthChange > 0 ? "Up" : "Down"} ${Math.abs(summary.monthOverMonthChange).toFixed(0)}% from last month`}
              >
                {summary.monthOverMonthChange > 0 ? (
                  <TrendUpIcon className="mr-0.5 h-3 w-3" aria-hidden="true" />
                ) : (
                  <TrendDownIcon className="mr-0.5 h-3 w-3" aria-hidden="true" />
                )}
                <span aria-hidden="true">{Math.abs(summary.monthOverMonthChange).toFixed(0)}%</span>
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            {summary.leadsThisMonth} this month
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Conversion Rate</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatPercent(summary.conversionRate)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {summary.convertedToClients} converted to clients
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Avg Response Time</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
            {formatHours(summary.avgResponseTimeHours)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Time to first contact
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">New Leads</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--warning)]">
            {formatNumber(summary.newLeads)}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Awaiting response
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6" role="figure" aria-labelledby="funnel-heading">
          <h3 id="funnel-heading" className="text-sm font-semibold text-foreground">Conversion Funnel</h3>
          <div className="mt-6 space-y-4" role="list" aria-label="Lead conversion stages">
            {/* New */}
            <div className="space-y-1" role="listitem" aria-label={`New leads: ${funnel.new}, 100% of total`}>
              <div className="flex items-start justify-between gap-4 flex-wrap text-sm">
                <span className="text-foreground">New</span>
                <span className="font-medium text-foreground">{funnel.new}</span>
              </div>
              <div className="h-8 overflow-x-auto rounded-lg bg-[var(--background-secondary)]" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-[var(--primary)] px-3 transition-all"
                  style={{ width: `${(funnel.new / funnelMax) * 100}%` }}
                >
                  <span className="text-xs font-medium text-white" aria-hidden="true">100%</span>
                </div>
              </div>
            </div>

            {/* Contacted */}
            <div className="space-y-1" role="listitem" aria-label={`Contacted leads: ${funnel.contacted}, ${funnel.new > 0 ? ((funnel.contacted / funnel.new) * 100).toFixed(0) : 0}% of total`}>
              <div className="flex items-start justify-between gap-4 flex-wrap text-sm">
                <span className="text-foreground">Contacted</span>
                <span className="font-medium text-foreground">{funnel.contacted}</span>
              </div>
              <div className="h-8 overflow-x-auto rounded-lg bg-[var(--background-secondary)]" role="progressbar" aria-valuenow={funnel.new > 0 ? Math.round((funnel.contacted / funnel.new) * 100) : 0} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-[var(--warning)] px-3 transition-all"
                  style={{ width: `${(funnel.contacted / funnelMax) * 100}%` }}
                >
                  {funnel.new > 0 && (
                    <span className="text-xs font-medium text-white" aria-hidden="true">
                      {((funnel.contacted / funnel.new) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Qualified */}
            <div className="space-y-1" role="listitem" aria-label={`Qualified leads: ${funnel.qualified}, ${funnel.new > 0 ? ((funnel.qualified / funnel.new) * 100).toFixed(0) : 0}% of total`}>
              <div className="flex items-start justify-between gap-4 flex-wrap text-sm">
                <span className="text-foreground">Qualified</span>
                <span className="font-medium text-foreground">{funnel.qualified}</span>
              </div>
              <div className="h-8 overflow-x-auto rounded-lg bg-[var(--background-secondary)]" role="progressbar" aria-valuenow={funnel.new > 0 ? Math.round((funnel.qualified / funnel.new) * 100) : 0} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-[var(--success)] px-3 transition-all"
                  style={{ width: `${(funnel.qualified / funnelMax) * 100}%` }}
                >
                  {funnel.new > 0 && (
                    <span className="text-xs font-medium text-white" aria-hidden="true">
                      {((funnel.qualified / funnel.new) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Converted */}
            <div className="space-y-1" role="listitem" aria-label={`Converted leads: ${funnel.converted}, ${funnel.new > 0 ? ((funnel.converted / funnel.new) * 100).toFixed(0) : 0}% of total`}>
              <div className="flex items-start justify-between gap-4 flex-wrap text-sm">
                <span className="text-foreground">Converted</span>
                <span className="font-medium text-foreground">{funnel.converted}</span>
              </div>
              <div className="h-8 overflow-x-auto rounded-lg bg-[var(--background-secondary)]" role="progressbar" aria-valuenow={funnel.new > 0 ? Math.round((funnel.converted / funnel.new) * 100) : 0} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-[var(--ai)] px-3 transition-all"
                  style={{ width: `${(funnel.converted / funnelMax) * 100}%` }}
                >
                  {funnel.new > 0 && (
                    <span className="text-xs font-medium text-white" aria-hidden="true">
                      {((funnel.converted / funnel.new) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Source Attribution */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6" role="figure" aria-labelledby="source-heading">
          <h3 id="source-heading" className="text-sm font-semibold text-foreground">Leads by Source</h3>
          <div className="mt-6 space-y-3" role="list" aria-label="Lead sources ranked by count">
            {bySource.slice(0, 6).map((source) => (
              <div key={source.source} className="space-y-1" role="listitem" aria-label={`${source.source}: ${source.count} leads, ${formatPercent(source.conversionRate)} conversion rate`}>
                <div className="flex items-start justify-between gap-4 flex-wrap text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        SOURCE_TYPE_BG_COLORS[source.sourceType]
                      )}
                    >
                      {source.sourceType === "portfolio" ? "Portfolio" : source.sourceType === "chat" ? "Chat" : "Booking"}
                    </span>
                    <span className="text-foreground truncate max-w-[120px]" title={source.source}>
                      {source.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{source.count}</span>
                    <span className="text-xs text-foreground-muted">
                      ({formatPercent(source.conversionRate)} conv)
                    </span>
                  </div>
                </div>
                <div className="h-2 overflow-x-auto rounded-full bg-[var(--background-secondary)]" role="progressbar" aria-valuenow={Math.round((source.count / maxSourceCount) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${source.count} leads`}>
                  <div
                    className={cn("h-full rounded-full transition-all", SOURCE_TYPE_COLORS[source.sourceType])}
                    style={{ width: `${(source.count / maxSourceCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {bySource.length === 0 && (
              <p className="py-8 text-center text-sm text-foreground-muted">No lead sources yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6" role="figure" aria-labelledby="trend-heading">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h3 id="trend-heading" className="text-sm font-semibold text-foreground">Leads Over Time</h3>
          <div className="flex items-center gap-4 text-xs" role="list" aria-label="Chart legend">
            <span className="flex items-center gap-1.5" role="listitem">
              <span className="h-2 w-2 rounded-full bg-purple-500" aria-hidden="true" />
              Portfolio
            </span>
            <span className="flex items-center gap-1.5" role="listitem">
              <span className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
              Chat
            </span>
            <span className="flex items-center gap-1.5" role="listitem">
              <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
              Booking
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-end gap-2" style={{ height: "200px" }} role="img" aria-label={`Bar chart showing leads over the last 6 months. ${monthly.map(m => `${m.monthLabel}: ${m.total} total`).join(', ')}`}>
          {monthly.map((month) => {
            const portfolioHeight = maxMonthlyTotal > 0 ? (month.portfolio / maxMonthlyTotal) * 100 : 0;
            const chatHeight = maxMonthlyTotal > 0 ? (month.chat / maxMonthlyTotal) * 100 : 0;
            const bookingHeight = maxMonthlyTotal > 0 ? (month.booking / maxMonthlyTotal) * 100 : 0;

            return (
              <div key={month.month} className="group relative flex-1 min-w-0">
                {/* Stacked bars */}
                <div className="flex h-full flex-col-reverse justify-start gap-0.5">
                  {month.booking > 0 && (
                    <div
                      className="w-full rounded-t bg-orange-500 transition-all group-hover:opacity-80"
                      style={{ height: `${bookingHeight}%` }}
                    />
                  )}
                  {month.chat > 0 && (
                    <div
                      className="w-full bg-cyan-500 transition-all group-hover:opacity-80"
                      style={{ height: `${chatHeight}%` }}
                    />
                  )}
                  {month.portfolio > 0 && (
                    <div
                      className="w-full rounded-b bg-purple-500 transition-all group-hover:opacity-80"
                      style={{ height: `${portfolioHeight}%` }}
                    />
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--foreground)] px-3 py-2 text-xs text-[var(--background)] shadow-lg group-hover:block z-10">
                  <div className="font-medium">{month.monthLabel}</div>
                  <div className="mt-1 space-y-0.5 text-[var(--background)]/80">
                    <div>Portfolio: {month.portfolio}</div>
                    <div>Chat: {month.chat}</div>
                    <div>Booking: {month.booking}</div>
                    <div className="border-t border-[var(--background)]/20 pt-0.5">
                      Total: {month.total}
                    </div>
                  </div>
                </div>

                {/* Month label */}
                <div className="mt-2 text-center text-xs text-foreground-muted">
                  {month.monthLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6" role="figure" aria-labelledby="status-heading">
          <h3 id="status-heading" className="text-sm font-semibold text-foreground">Status Distribution</h3>
          <div className="mt-6">
            {/* Visual bar */}
            <div className="flex h-8 overflow-x-auto rounded-lg" role="img" aria-label={`Status distribution: ${byStatus.map(s => `${s.status} ${formatPercent(s.percentage)}`).join(', ')}`}>
              {byStatus.map((status) => (
                <div
                  key={status.status}
                  className={cn(
                    "flex items-center justify-center transition-all",
                    STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] || "bg-[var(--foreground-muted)]"
                  )}
                  style={{ width: `${status.percentage}%` }}
                  title={`${status.status}: ${status.count} (${formatPercent(status.percentage)})`}
                  aria-hidden="true"
                />
              ))}
            </div>
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4" role="list" aria-label="Status legend">
              {byStatus.map((status) => (
                <div key={status.status} className="flex items-center gap-2" role="listitem">
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full",
                      STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] || "bg-[var(--foreground-muted)]"
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-sm text-foreground capitalize">{status.status}</span>
                  <span className="text-sm text-foreground-muted">
                    {status.count} ({formatPercent(status.percentage)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6" role="region" aria-labelledby="conversions-heading">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h3 id="conversions-heading" className="text-sm font-semibold text-foreground">Recent Conversions</h3>
            <Link
              href="/clients"
              className="text-xs text-[var(--primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 rounded"
            >
              View all clients
            </Link>
          </div>
          <div className="mt-4 space-y-3" role="list" aria-label="Recently converted leads">
            {recentConversions.length > 0 ? (
              recentConversions.map((conversion) => (
                <div
                  key={conversion.id}
                  role="listitem"
                  className="flex items-start justify-between gap-4 flex-wrap rounded-lg bg-[var(--background-secondary)] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{conversion.name}</p>
                    <p className="text-xs text-foreground-muted truncate">{conversion.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        SOURCE_TYPE_BG_COLORS[conversion.sourceType]
                      )}
                    >
                      {conversion.sourceType}
                    </span>
                    <span className="text-xs text-foreground-muted whitespace-nowrap">
                      {new Date(conversion.convertedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <ConvertIcon className="mx-auto h-8 w-8 text-foreground-muted" />
                <p className="mt-2 text-sm text-foreground-muted">No conversions yet</p>
                <p className="text-xs text-foreground-muted">
                  Convert leads to clients to see them here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
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
        d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06l5.25-5.25a.75.75 0 0 1 1.06 0l3.046 3.046a20.904 20.904 0 0 1 5.441-5.049l-2.93-.785a.75.75 0 0 1-.53-.919Z"
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

function ConvertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
      />
    </svg>
  );
}
