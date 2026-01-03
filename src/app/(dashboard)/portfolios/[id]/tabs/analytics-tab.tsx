"use client";

import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { PortfolioWebsite } from "../portfolio-editor-client";
import { getPortfolioAnalytics } from "@/lib/actions/portfolio-websites";

interface AnalyticsTabProps {
  website: PortfolioWebsite;
  isPending: boolean;
}

type TimeRange = "7d" | "30d" | "90d" | "all";

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  avgDuration: number;
  avgScrollDepth: number;
  viewsByDate: { date: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
  recentViews: {
    id: string;
    visitorId: string | null;
    pagePath: string | null;
    referrer: string | null;
    duration: number | null;
    createdAt: Date;
  }[];
}

export function AnalyticsTab({ website, isPending: parentPending }: AnalyticsTabProps) {
  const [isPending, startTransition] = useTransition();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = isPending || parentPending;

  useEffect(() => {
    startTransition(async () => {
      const result = await getPortfolioAnalytics(website.id, timeRange);
      if (result.success && result.data) {
        setAnalytics(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to load analytics");
      }
    });
  }, [website.id, timeRange]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getMaxViews = () => {
    if (!analytics?.viewsByDate.length) return 1;
    return Math.max(...analytics.viewsByDate.map((d) => d.views), 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
          <p className="text-sm text-foreground-muted">
            Track views and engagement on your portfolio.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-1">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                timeRange === range
                  ? "bg-[var(--background-secondary)] text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {range === "7d"
                ? "7 Days"
                : range === "30d"
                ? "30 Days"
                : range === "90d"
                ? "90 Days"
                : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6 text-center">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      ) : loading && !analytics ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : analytics ? (
        <>
          {/* Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Views"
              value={analytics.totalViews.toLocaleString()}
              icon={<EyeIcon className="h-5 w-5" />}
            />
            <MetricCard
              label="Unique Visitors"
              value={analytics.uniqueVisitors.toLocaleString()}
              icon={<UsersIcon className="h-5 w-5" />}
            />
            <MetricCard
              label="Avg. Duration"
              value={formatDuration(analytics.avgDuration)}
              icon={<ClockIcon className="h-5 w-5" />}
            />
            <MetricCard
              label="Avg. Scroll Depth"
              value={`${analytics.avgScrollDepth}%`}
              icon={<ScrollIcon className="h-5 w-5" />}
            />
          </div>

          {/* Views Chart */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h4 className="text-sm font-medium text-foreground">
              Views Over Time
            </h4>
            {analytics.viewsByDate.length === 0 ? (
              <div className="mt-6 py-12 text-center text-sm text-foreground-muted">
                No views in this time period
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex h-40 items-end gap-1">
                  {analytics.viewsByDate.map((item) => {
                    const height = (item.views / getMaxViews()) * 100;
                    return (
                      <div
                        key={item.date}
                        className="group relative flex-1"
                        title={`${formatDate(item.date)}: ${item.views} views`}
                      >
                        <div
                          className="w-full rounded-t bg-[var(--primary)] transition-all hover:bg-[var(--primary)]/80"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--background-elevated)] px-2 py-1 text-xs text-foreground shadow-lg group-hover:block">
                          {item.views} views
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-foreground-muted">
                  <span>{formatDate(analytics.viewsByDate[0]?.date || "")}</span>
                  <span>
                    {formatDate(
                      analytics.viewsByDate[analytics.viewsByDate.length - 1]?.date || ""
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Referrers */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h4 className="text-sm font-medium text-foreground">
                Top Referrers
              </h4>
              {analytics.topReferrers.length === 0 ? (
                <p className="mt-4 text-sm text-foreground-muted">
                  No referrer data yet
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {analytics.topReferrers.slice(0, 5).map((referrer) => (
                    <div
                      key={referrer.referrer}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate text-sm text-foreground">
                        {referrer.referrer}
                      </span>
                      <span className="ml-2 text-sm font-medium text-foreground-muted">
                        {referrer.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Views */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h4 className="text-sm font-medium text-foreground">
                Recent Views
              </h4>
              {analytics.recentViews.length === 0 ? (
                <p className="mt-4 text-sm text-foreground-muted">
                  No views yet
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {analytics.recentViews.slice(0, 5).map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                        <span className="text-foreground">
                          {view.referrer || "Direct"}
                        </span>
                      </div>
                      <span className="text-foreground-muted">
                        {new Date(view.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Empty State for New Portfolios */}
          {analytics.totalViews === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-12 text-center">
              <ChartIcon className="mx-auto h-10 w-10 text-foreground-muted" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No analytics data yet
              </p>
              <p className="mt-1 text-sm text-foreground-muted">
                Share your portfolio link to start tracking views.
              </p>
              <div className="mt-4">
                <code className="rounded bg-[var(--background)] px-3 py-1.5 text-sm text-foreground">
                  {typeof window !== "undefined" ? window.location.origin : ""}/portfolio/{website.slug}
                </code>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground-muted">{label}</span>
        <span className="text-foreground-muted">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

// Icons
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ScrollIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <path d="M12 18V6" />
      <path d="m9 15 3 3 3-3" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}
