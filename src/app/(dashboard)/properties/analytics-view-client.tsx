"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MetricType = "pageViews" | "uniqueVisitors" | "tourClicks";
type TimeRange = 7 | 14 | 30;

interface PropertyStat {
  id: string;
  address: string;
  city: string;
  state: string;
  slug: string;
  viewCount: number;
  leadCount: number;
  isPublished: boolean;
}

interface DailyData {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  tourClicks: number;
  photoViews: number;
  socialShares: number;
}

interface AggregateAnalytics {
  totals: {
    pageViews: number;
    uniqueVisitors: number;
    tourClicks: number;
    photoViews: number;
    socialShares: number;
  };
  dailyData: DailyData[];
  propertyStats: PropertyStat[];
  totalProperties: number;
  publishedProperties: number;
  totalLeads: number;
}

interface AnalyticsViewClientProps {
  analytics: AggregateAnalytics;
}

const METRIC_LABELS: Record<MetricType, string> = {
  pageViews: "Page Views",
  uniqueVisitors: "Unique Visitors",
  tourClicks: "Tour Clicks",
};

const METRIC_COLORS: Record<MetricType, string> = {
  pageViews: "var(--primary)",
  uniqueVisitors: "var(--success)",
  tourClicks: "var(--warning)",
};

export function AnalyticsViewClient({ analytics }: AnalyticsViewClientProps) {
  const [sortBy, setSortBy] = useState<"views" | "leads">("views");
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [chartMetric, setChartMetric] = useState<MetricType>("pageViews");

  const sortedProperties = [...analytics.propertyStats].sort((a, b) => {
    if (sortBy === "views") return b.viewCount - a.viewCount;
    return b.leadCount - a.leadCount;
  });

  // Filter daily data by time range
  const filteredDailyData = useMemo(() => {
    const cutoff = analytics.dailyData.length - timeRange;
    return analytics.dailyData.slice(Math.max(0, cutoff));
  }, [analytics.dailyData, timeRange]);

  // Calculate totals for the selected time range
  const rangeTotals = useMemo(() => {
    return filteredDailyData.reduce(
      (acc, day) => ({
        pageViews: acc.pageViews + day.pageViews,
        uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
        tourClicks: acc.tourClicks + day.tourClicks,
        photoViews: acc.photoViews + day.photoViews,
        socialShares: acc.socialShares + day.socialShares,
      }),
      { pageViews: 0, uniqueVisitors: 0, tourClicks: 0, photoViews: 0, socialShares: 0 }
    );
  }, [filteredDailyData]);

  // Calculate trend (compare first half to second half of time range)
  const calculateTrend = (metric: keyof typeof rangeTotals): { value: number; isUp: boolean } => {
    if (filteredDailyData.length < 2) return { value: 0, isUp: true };

    const midpoint = Math.floor(filteredDailyData.length / 2);
    const firstHalf = filteredDailyData.slice(0, midpoint);
    const secondHalf = filteredDailyData.slice(midpoint);

    const firstSum = firstHalf.reduce((sum, d) => sum + d[metric], 0);
    const secondSum = secondHalf.reduce((sum, d) => sum + d[metric], 0);

    if (firstSum === 0) return { value: secondSum > 0 ? 100 : 0, isUp: true };
    const change = ((secondSum - firstSum) / firstSum) * 100;
    return { value: Math.abs(change), isUp: change >= 0 };
  };

  const viewsTrend = calculateTrend("pageViews");
  const visitorsTrend = calculateTrend("uniqueVisitors");
  const leadsTrend = { value: 0, isUp: true }; // Leads don't have daily tracking

  // Calculate conversion rate
  const totalViews = analytics.propertyStats.reduce((sum, p) => sum + p.viewCount, 0);
  const conversionRate = totalViews > 0 ? ((analytics.totalLeads / totalViews) * 100).toFixed(1) : "0.0";

  // Get max values for bar chart scaling
  const maxViews = Math.max(...analytics.propertyStats.map((p) => p.viewCount), 1);
  const maxLeads = Math.max(...analytics.propertyStats.map((p) => p.leadCount), 1);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Total Views</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">
              {analytics.totals.pageViews.toLocaleString()}
            </p>
            {viewsTrend.value > 0 && (
              <span className={`flex items-center text-xs font-medium ${viewsTrend.isUp ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                {viewsTrend.isUp ? <TrendUpIcon className="h-3 w-3 mr-0.5" /> : <TrendDownIcon className="h-3 w-3 mr-0.5" />}
                {viewsTrend.value.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Unique Visitors</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">
              {analytics.totals.uniqueVisitors.toLocaleString()}
            </p>
            {visitorsTrend.value > 0 && (
              <span className={`flex items-center text-xs font-medium ${visitorsTrend.isUp ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                {visitorsTrend.isUp ? <TrendUpIcon className="h-3 w-3 mr-0.5" /> : <TrendDownIcon className="h-3 w-3 mr-0.5" />}
                {visitorsTrend.value.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Total Leads</p>
          <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
            {analytics.totalLeads}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Conversion Rate</p>
          <p className="mt-1 text-2xl font-bold text-[var(--success)]">
            {conversionRate}%
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Tour Clicks</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {analytics.totals.tourClicks.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Social Shares</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {analytics.totals.socialShares.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      {analytics.dailyData.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Activity Over Time</h3>
            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Selector */}
              <div className="flex gap-1">
                {(["pageViews", "uniqueVisitors", "tourClicks"] as MetricType[]).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setChartMetric(metric)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      chartMetric === metric
                        ? "text-white"
                        : "bg-[var(--background)] text-foreground-muted hover:text-foreground"
                    )}
                    style={chartMetric === metric ? { backgroundColor: METRIC_COLORS[metric] } : {}}
                  >
                    {METRIC_LABELS[metric]}
                  </button>
                ))}
              </div>
              <div className="h-4 w-px bg-[var(--card-border)]" />
              {/* Time Range Selector */}
              <div className="flex gap-1">
                {([7, 14, 30] as TimeRange[]).map((days) => (
                  <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      timeRange === days
                        ? "bg-foreground text-background"
                        : "bg-[var(--background)] text-foreground-muted hover:text-foreground"
                    )}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-48 flex items-end gap-1">
            {filteredDailyData.map((day) => {
              const maxDayValue = Math.max(...filteredDailyData.map((d) => d[chartMetric]), 1);
              const height = (day[chartMetric] / maxDayValue) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 min-w-0 group relative"
                >
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${Math.max(height, 2)}%`,
                      backgroundColor: `color-mix(in srgb, ${METRIC_COLORS[chartMetric]} 40%, transparent)`,
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = `color-mix(in srgb, ${METRIC_COLORS[chartMetric]} 60%, transparent)`;
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = `color-mix(in srgb, ${METRIC_COLORS[chartMetric]} 40%, transparent)`;
                    }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                      <p className="font-medium text-foreground">{day[chartMetric]} {METRIC_LABELS[chartMetric].toLowerCase()}</p>
                      <p className="text-foreground-muted">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-foreground-muted">
            <span>{filteredDailyData.length > 0 ? new Date(filteredDailyData[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
            <span>{filteredDailyData.length > 0 ? new Date(filteredDailyData[filteredDailyData.length - 1].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
          </div>
        </div>
      )}

      {/* Property Performance */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground">Property Performance</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("views")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                sortBy === "views"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background)] text-foreground-muted hover:text-foreground"
              )}
            >
              By Views
            </button>
            <button
              onClick={() => setSortBy("leads")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                sortBy === "leads"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background)] text-foreground-muted hover:text-foreground"
              )}
            >
              By Leads
            </button>
          </div>
        </div>

        {sortedProperties.length > 0 ? (
          <div className="divide-y divide-[var(--card-border)]">
            {sortedProperties.map((property, index) => (
              <div
                key={property.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--background-hover)] transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)] text-sm font-medium text-foreground-muted">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/properties/${property.id}`}
                      className="font-medium text-foreground hover:text-[var(--primary)] truncate"
                    >
                      {property.address}
                    </Link>
                    {!property.isPublished && (
                      <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground-muted">
                    {property.city}, {property.state}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{property.viewCount.toLocaleString()}</p>
                    <p className="text-xs text-foreground-muted">views</p>
                  </div>
                  <div className="w-24 hidden sm:block">
                    <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary)] rounded-full"
                        style={{ width: `${(property.viewCount / maxViews) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--primary)]">{property.leadCount}</p>
                    <p className="text-xs text-foreground-muted">leads</p>
                  </div>
                  <div className="w-16 hidden sm:block">
                    <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--success)] rounded-full"
                        style={{ width: `${(property.leadCount / maxLeads) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/properties/${property.id}`}
                    className="rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground transition-colors"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <ChartIcon className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No property data yet</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Create and publish property websites to see analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 0 1 1.06 0L7 9.942l3.768-3.769a.75.75 0 0 1 1.113.058 20.908 20.908 0 0 1 3.813 7.254l1.574-2.727a.75.75 0 0 1 1.3.75l-2.475 4.286a.75.75 0 0 1-1.025.275l-4.287-2.475a.75.75 0 0 1 .75-1.3l2.71 1.565a19.422 19.422 0 0 0-3.013-6.024L7.53 11.533a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
