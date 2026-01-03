"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export function AnalyticsViewClient({ analytics }: AnalyticsViewClientProps) {
  const [sortBy, setSortBy] = useState<"views" | "leads">("views");

  const sortedProperties = [...analytics.propertyStats].sort((a, b) => {
    if (sortBy === "views") return b.viewCount - a.viewCount;
    return b.leadCount - a.leadCount;
  });

  // Calculate conversion rate
  const totalViews = analytics.propertyStats.reduce((sum, p) => sum + p.viewCount, 0);
  const conversionRate = totalViews > 0 ? ((analytics.totalLeads / totalViews) * 100).toFixed(1) : "0.0";

  // Get max values for bar chart scaling
  const maxViews = Math.max(...analytics.propertyStats.map((p) => p.viewCount), 1);
  const maxLeads = Math.max(...analytics.propertyStats.map((p) => p.leadCount), 1);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Total Views</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {analytics.totals.pageViews.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Unique Visitors</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {analytics.totals.uniqueVisitors.toLocaleString()}
          </p>
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
          <h3 className="text-sm font-semibold text-foreground mb-4">Views Over Time (Last 30 Days)</h3>
          <div className="h-48 flex items-end gap-1">
            {analytics.dailyData.map((day, index) => {
              const maxDayViews = Math.max(...analytics.dailyData.map((d) => d.pageViews), 1);
              const height = (day.pageViews / maxDayViews) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 min-w-0 group relative"
                >
                  <div
                    className="w-full bg-[var(--primary)]/30 hover:bg-[var(--primary)]/50 rounded-t transition-all"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                      <p className="font-medium text-foreground">{day.pageViews} views</p>
                      <p className="text-foreground-muted">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-foreground-muted">
            <span>{analytics.dailyData.length > 0 ? new Date(analytics.dailyData[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
            <span>{analytics.dailyData.length > 0 ? new Date(analytics.dailyData[analytics.dailyData.length - 1].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
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
                    className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground transition-colors"
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
