"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { EngagementStats, AtRiskUser } from "@/lib/actions/super-admin";

// Icons
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TrendingDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UserXIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" x2="22" y1="8" y2="13" />
      <line x1="22" x2="17" y1="8" y2="13" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

// Mini chart components
function MiniBarChart({
  data,
  height = 60,
  color = "var(--primary)",
}: {
  data: Array<{ date: string; count: number }>;
  height?: number;
  color?: string;
}) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.count / max) * height;
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-all hover:opacity-80"
            style={{
              height: Math.max(barHeight, 2),
              backgroundColor: color,
              opacity: 0.6 + (i / data.length) * 0.4,
            }}
            title={`${item.date}: ${item.count}`}
          />
        );
      })}
    </div>
  );
}

function HourlyChart({
  data,
  height = 60,
}: {
  data: Array<{ hour: number; count: number }>;
  height?: number;
}) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-px" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.count / max) * height;
        const isWorkHours = item.hour >= 9 && item.hour <= 17;
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-all hover:opacity-80"
            style={{
              height: Math.max(barHeight, 2),
              backgroundColor: isWorkHours ? "var(--primary)" : "var(--foreground-muted)",
              opacity: 0.7,
            }}
            title={`${item.hour}:00 - ${item.count} activities`}
          />
        );
      })}
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

// Plan badge component
function PlanBadge({ plan }: { plan: string | null }) {
  const config: Record<string, { bg: string; text: string }> = {
    free: { bg: "bg-[var(--foreground)]/10", text: "text-[var(--foreground-muted)]" },
    pro: { bg: "bg-[var(--primary)]/10", text: "text-[var(--primary)]" },
    studio: { bg: "bg-[var(--ai)]/10", text: "text-[var(--ai)]" },
    enterprise: { bg: "bg-[var(--success)]/10", text: "text-[var(--success)]" },
  };

  const { bg, text } = config[plan?.toLowerCase() || "free"] || config.free;

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", bg, text)}>
      {plan || "Free"}
    </span>
  );
}

interface EngagementPageClientProps {
  stats: EngagementStats | null;
  atRiskUsers: AtRiskUser[];
}

export function EngagementPageClient({
  stats,
  atRiskUsers,
}: EngagementPageClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "atRisk" | "activity">("overview");

  if (!stats) {
    return (
      <div className="text-center py-12 text-[var(--foreground-muted)]">
        Unable to load engagement statistics
      </div>
    );
  }

  // Primary active user stats
  const activeUserStats = [
    {
      label: "DAU",
      value: stats.dau,
      subtext: "Daily Active",
      icon: UsersIcon,
      color: "text-[var(--primary)]",
      bgColor: "bg-[var(--primary)]/10",
    },
    {
      label: "WAU",
      value: stats.wau,
      subtext: "Weekly Active",
      icon: UsersIcon,
      color: "text-[var(--ai)]",
      bgColor: "bg-[var(--ai)]/10",
    },
    {
      label: "MAU",
      value: stats.mau,
      subtext: "Monthly Active",
      icon: UsersIcon,
      color: "text-[var(--success)]",
      bgColor: "bg-[var(--success)]/10",
    },
    {
      label: "Stickiness",
      value: `${stats.dauWauRatio.toFixed(0)}%`,
      subtext: "DAU/WAU Ratio",
      icon: TrendingUpIcon,
      color: stats.dauWauRatio >= 20 ? "text-[var(--success)]" : "text-[var(--warning)]",
      bgColor: stats.dauWauRatio >= 20 ? "bg-[var(--success)]/10" : "bg-[var(--warning)]/10",
    },
    {
      label: "At Risk",
      value: stats.atRiskUsers,
      subtext: "14+ days inactive",
      icon: AlertTriangleIcon,
      color: stats.atRiskUsers > 10 ? "text-[var(--error)]" : "text-[var(--warning)]",
      bgColor: stats.atRiskUsers > 10 ? "bg-[var(--error)]/10" : "bg-[var(--warning)]/10",
    },
    {
      label: "Churned",
      value: stats.churned30Days,
      subtext: "30+ days inactive",
      icon: UserXIcon,
      color: "text-[var(--error)]",
      bgColor: "bg-[var(--error)]/10",
    },
  ];

  // Secondary engagement metrics
  const engagementMetrics = [
    {
      label: "New This Week",
      value: stats.newUsersThisWeek,
      icon: UserPlusIcon,
    },
    {
      label: "Avg Sessions",
      value: stats.avgSessionsPerUser.toFixed(1),
      icon: ActivityIcon,
    },
    {
      label: "Avg Streak",
      value: `${stats.avgLoginStreak.toFixed(0)} days`,
      icon: FlameIcon,
    },
    {
      label: "7+ Day Streaks",
      value: stats.usersWithStreak7Plus,
      icon: StarIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <nav className="flex items-center gap-1 p-1 rounded-lg bg-[var(--card)] border border-[var(--border)] w-fit" role="tablist">
        {[
          { id: "overview", label: "Overview" },
          { id: "atRisk", label: `At Risk (${atRiskUsers.length})` },
          { id: "activity", label: "Activity" },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.id
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <>
          {/* Primary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" role="region" aria-label="Active user statistics">
            {activeUserStats.map((card) => (
              <div
                key={card.label}
                className={cn(
                  "p-4 rounded-xl",
                  "border border-[var(--border)]",
                  "bg-[var(--card)]"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", card.bgColor)}>
                    <card.icon className={cn("w-4 h-4", card.color)} aria-hidden="true" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[var(--foreground)]">
                  {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                </div>
                <div className="text-xs text-[var(--foreground-muted)]">{card.subtext}</div>
              </div>
            ))}
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {engagementMetrics.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "p-4 rounded-lg",
                  "border border-[var(--border)]",
                  "bg-[var(--card)]"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                  <span className="text-xs text-[var(--foreground-muted)]">{stat.label}</span>
                </div>
                <div className="text-xl font-semibold text-[var(--foreground)]">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Chart */}
          <section
            className={cn(
              "p-5 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
            aria-labelledby="activity-trend-heading"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <h2 id="activity-trend-heading" className="font-semibold text-[var(--foreground)]">
                Activity Trend (30 Days)
              </h2>
              <div className="text-sm text-[var(--foreground-muted)]">
                {stats.activityTrend.reduce((sum, d) => sum + d.count, 0).toLocaleString()} total activities
              </div>
            </div>
            <div className="h-32">
              <MiniBarChart data={stats.activityTrend} height={120} color="var(--primary)" />
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Engaged Users */}
            <section
              className={cn(
                "p-5 rounded-xl",
                "border border-[var(--border)]",
                "bg-[var(--card)]"
              )}
              aria-labelledby="top-users-heading"
            >
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                <h2 id="top-users-heading" className="font-semibold text-[var(--foreground)]">
                  Top Engaged Users
                </h2>
              </div>
              {stats.topEngagedUsers.length > 0 ? (
                <ul className="space-y-2" role="list">
                  {stats.topEngagedUsers.slice(0, 5).map((user, index) => (
                    <li key={user.id}>
                      <Link
                        href={`/super-admin/users/${user.id}`}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-lg",
                          "bg-[var(--background-tertiary)]",
                          "hover:bg-[var(--background-elevated)]",
                          "transition-colors"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)] truncate max-w-[200px]">
                              {user.fullName || user.email}
                            </div>
                            <div className="text-xs text-[var(--foreground-muted)]">
                              Level {user.level}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[var(--foreground)]">
                            {user.totalSessions} sessions
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[var(--warning)]">
                            <FlameIcon className="w-3 h-3" />
                            {user.loginStreak} day streak
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-[var(--foreground-muted)] text-sm">
                  No user data yet
                </div>
              )}
            </section>

            {/* Hourly Activity Distribution */}
            <section
              className={cn(
                "p-5 rounded-xl",
                "border border-[var(--border)]",
                "bg-[var(--card)]"
              )}
              aria-labelledby="hourly-activity-heading"
            >
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                <h2 id="hourly-activity-heading" className="font-semibold text-[var(--foreground)]">
                  Activity by Hour
                </h2>
              </div>
              <div className="h-32 mb-3">
                <HourlyChart data={stats.loginsByHour} height={120} />
              </div>
              <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>12 AM</span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[var(--primary)]" />
                  Business hours (9-5)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[var(--foreground-muted)]" />
                  Off hours
                </span>
              </div>
            </section>
          </div>

          {/* Activity by Type */}
          {stats.activityByType.length > 0 && (
            <section
              className={cn(
                "p-5 rounded-xl",
                "border border-[var(--border)]",
                "bg-[var(--card)]"
              )}
              aria-labelledby="activity-breakdown-heading"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChartIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                <h2 id="activity-breakdown-heading" className="font-semibold text-[var(--foreground)]">
                  Activity Breakdown
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {stats.activityByType.map((activity) => (
                  <div
                    key={activity.type}
                    className={cn(
                      "p-3 rounded-lg",
                      "bg-[var(--background-tertiary)]"
                    )}
                  >
                    <div className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide mb-1">
                      {activity.type.replace(/_/g, " ")}
                    </div>
                    <div className="text-lg font-semibold text-[var(--foreground)]">
                      {activity.count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Churn Summary */}
          <section
            className={cn(
              "p-5 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
            aria-labelledby="churn-summary-heading"
          >
            <div className="flex items-center gap-2 mb-4">
              <UserXIcon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
              <h2 id="churn-summary-heading" className="font-semibold text-[var(--foreground)]">
                Churn Analysis
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-[var(--background-tertiary)]">
                <div className="text-2xl font-bold text-[var(--foreground)]">{stats.totalUsers}</div>
                <div className="text-xs text-[var(--foreground-muted)]">Total Users</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--warning)]/10">
                <div className="text-2xl font-bold text-[var(--warning)]">{stats.atRiskUsers}</div>
                <div className="text-xs text-[var(--foreground-muted)]">At Risk (14+ days)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--error)]/10">
                <div className="text-2xl font-bold text-[var(--error)]">{stats.churned30Days}</div>
                <div className="text-xs text-[var(--foreground-muted)]">Churned (30+ days)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--error)]/20">
                <div className="text-2xl font-bold text-[var(--error)]">{stats.churned90Days}</div>
                <div className="text-xs text-[var(--foreground-muted)]">Long-term Churned (90+)</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-[var(--foreground-muted)]">
              Churn rate (30 days): {stats.totalUsers > 0 ? ((stats.churned30Days / stats.totalUsers) * 100).toFixed(1) : 0}%
            </div>
          </section>
        </>
      )}

      {activeTab === "atRisk" && (
        <section
          className={cn(
            "p-5 rounded-xl",
            "border border-[var(--error)]/30",
            "bg-[var(--error)]/5"
          )}
          aria-labelledby="at-risk-users-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangleIcon className="w-5 h-5 text-[var(--error)]" aria-hidden="true" />
            <h2 id="at-risk-users-heading" className="font-semibold text-[var(--error)]">
              At-Risk Users (14+ Days Inactive)
            </h2>
          </div>
          {atRiskUsers.length > 0 ? (
            <ul className="space-y-2" role="list">
              {atRiskUsers.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/super-admin/users/${user.id}`}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg",
                      "bg-[var(--card)] border border-[var(--border)]",
                      "hover:bg-[var(--background-tertiary)]",
                      "transition-colors"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-[var(--foreground)] truncate">
                          {user.fullName || user.email}
                        </span>
                        <PlanBadge plan={user.plan} />
                      </div>
                      <div className="text-xs text-[var(--foreground-muted)]">
                        {user.organizationName || "No organization"} &middot; {user.totalSessions} sessions
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-semibold text-[var(--error)]">
                        {user.daysSinceLogin} days ago
                      </div>
                      <div className="text-xs text-[var(--foreground-muted)]">
                        {user.totalRevenueCents > 0 && (
                          <span className="text-[var(--success)]">
                            {formatCurrency(user.totalRevenueCents)} revenue
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-[var(--foreground-muted)]">
              No at-risk users found. Great job on retention!
            </div>
          )}
        </section>
      )}

      {activeTab === "activity" && (
        <div className="space-y-6">
          {/* Activity Trend Large */}
          <section
            className={cn(
              "p-5 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
            aria-labelledby="activity-detailed-heading"
          >
            <h2 id="activity-detailed-heading" className="font-semibold text-[var(--foreground)] mb-4">
              Daily Activity (Last 30 Days)
            </h2>
            <div className="h-48">
              <MiniBarChart data={stats.activityTrend} height={180} color="var(--primary)" />
            </div>
            <div className="mt-4 flex justify-between text-xs text-[var(--foreground-muted)]">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </section>

          {/* All Activity Types */}
          <section
            className={cn(
              "p-5 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
            aria-labelledby="all-activities-heading"
          >
            <h2 id="all-activities-heading" className="font-semibold text-[var(--foreground)] mb-4">
              All Activity Types
            </h2>
            {stats.activityByType.length > 0 ? (
              <div className="space-y-3">
                {stats.activityByType.map((activity) => {
                  const totalActivities = stats.activityByType.reduce((sum, a) => sum + a.count, 0);
                  const percentage = totalActivities > 0 ? (activity.count / totalActivities) * 100 : 0;

                  return (
                    <div key={activity.type}>
                      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
                        <span className="text-sm capitalize text-[var(--foreground)]">
                          {activity.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm text-[var(--foreground-muted)]">
                          {activity.count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--primary)] transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-[var(--foreground-muted)] text-sm">
                No activity data available
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
