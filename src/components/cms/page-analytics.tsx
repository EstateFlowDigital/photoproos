"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  getAnalyticsDashboardData,
  getPageAnalyticsData,
  getConversionFunnel,
  getRealTimeVisitorCount,
} from "@/lib/actions/cms-analytics";
import type { AnalyticsSummary, PageAnalyticsData } from "@/lib/cms/analytics";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Target,
  RefreshCw,
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ArrowRight,
  Activity,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface PageAnalyticsDashboardProps {
  className?: string;
}

interface PageAnalyticsViewProps {
  pageId: string;
  pageSlug: string;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  className?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}m ${secs}s`;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ============================================================================
// METRIC CARD
// ============================================================================

function MetricCard({ title, value, change, icon: Icon, className }: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        "p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[var(--foreground-secondary)]">{title}</span>
        <Icon className="w-4 h-4 text-[var(--foreground-muted)]" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {change !== undefined && (
          <span
            className={cn(
              "flex items-center text-sm",
              isPositive && "text-green-500",
              isNegative && "text-red-500",
              !isPositive && !isNegative && "text-[var(--foreground-muted)]"
            )}
          >
            {isPositive && <TrendingUp className="w-4 h-4 mr-1" />}
            {isNegative && <TrendingDown className="w-4 h-4 mr-1" />}
            {formatPercentage(Math.abs(change))}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SIMPLE LINE CHART
// ============================================================================

interface LineChartProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  height?: number;
  className?: string;
}

function SimpleLineChart({
  data,
  color = "var(--primary)",
  height = 120,
  className,
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-sm text-[var(--foreground-muted)]",
          className
        )}
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = ((d.value - minValue) / range) * 100;
      return `${x},${100 - y}`;
    })
    .join(" ");

  return (
    <div className={cn("relative", className)} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Grid lines */}
        <line
          x1="0"
          y1="25"
          x2="100"
          y2="25"
          stroke="var(--border)"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke="var(--border)"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="75"
          x2="100"
          y2="75"
          stroke="var(--border)"
          strokeWidth="0.5"
        />

        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />

        {/* Area fill */}
        <polygon
          fill={color}
          fillOpacity="0.1"
          points={`0,100 ${points} 100,100`}
        />
      </svg>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-[var(--foreground-muted)] -ml-8 w-6 text-right">
        <span>{formatNumber(maxValue)}</span>
        <span>{formatNumber(minValue)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// HORIZONTAL BAR CHART
// ============================================================================

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  className?: string;
}

function HorizontalBarChart({
  data,
  color = "var(--primary)",
  className,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-sm text-[var(--foreground-muted)] py-4",
          className
        )}
      >
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="capitalize">{item.label}</span>
            <span className="text-[var(--foreground-secondary)]">
              {formatNumber(item.value)}
            </span>
          </div>
          <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// FUNNEL CHART
// ============================================================================

interface FunnelChartProps {
  data: Array<{ label: string; value: number }>;
  className?: string;
}

function FunnelChart({ data, className }: FunnelChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-sm text-[var(--foreground-muted)] py-4",
          className
        )}
      >
        No data available
      </div>
    );
  }

  const maxValue = data[0]?.value || 1;

  return (
    <div className={cn("space-y-2", className)}>
      {data.map((item, index) => {
        const percentage = ((item.value / maxValue) * 100).toFixed(1);
        const prevValue = index > 0 ? data[index - 1].value : item.value;
        const dropRate =
          index > 0 && prevValue > 0
            ? (((prevValue - item.value) / prevValue) * 100).toFixed(1)
            : null;

        return (
          <div key={index}>
            <div className="flex items-center gap-3">
              <div
                className="h-10 rounded flex items-center justify-center transition-all duration-500"
                style={{
                  width: `${Math.max(20, (item.value / maxValue) * 100)}%`,
                  backgroundColor: `hsl(217, 91%, ${50 + index * 10}%)`,
                }}
              >
                <span className="text-sm font-medium text-white px-2">
                  {formatNumber(item.value)}
                </span>
              </div>
              <div className="flex-1 text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-[var(--foreground-muted)] ml-2">
                  ({percentage}%)
                </span>
              </div>
            </div>
            {dropRate && index < data.length && (
              <div className="ml-4 my-1 flex items-center text-xs text-[var(--foreground-muted)]">
                <ArrowRight className="w-3 h-3 mr-1" />
                {dropRate}% drop-off
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// DEVICE ICONS
// ============================================================================

function getDeviceIcon(device: string): React.ElementType {
  switch (device.toLowerCase()) {
    case "desktop":
      return Monitor;
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    default:
      return Monitor;
  }
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export function PageAnalyticsDashboard({ className }: PageAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyTrend, setDailyTrend] = useState<
    Array<{ date: string; pageviews: number; uniqueVisitors: number }>
  >([]);
  const [topPages, setTopPages] = useState<Array<{ pageSlug: string; pageviews: number }>>([]);
  const [sources, setSources] = useState<Record<string, number>>({});
  const [devices, setDevices] = useState<Record<string, number>>({});
  const [realTimeVisitors, setRealTimeVisitors] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getAnalyticsDashboardData(days);
    if (result.success && result.data) {
      setSummary(result.data.summary);
      setDailyTrend(result.data.dailyTrend);
      setTopPages(result.data.topPages);
      setSources(result.data.sources);
      setDevices(result.data.devices);
      setRealTimeVisitors(result.data.realTimeVisitors);
    }
    setLoading(false);
  }, [days]);

  // Load data on mount and when days change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh real-time visitors every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await getRealTimeVisitorCount();
      if (result.success && result.data !== undefined) {
        setRealTimeVisitors(result.data);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const chartData = dailyTrend.map((d) => ({
    date: d.date,
    value: d.pageviews,
  }));

  const sourcesData = Object.entries(sources)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const devicesData = Object.entries(devices)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analytics Overview</h2>
          <p className="text-sm text-[var(--foreground-secondary)]">
            Track your marketing page performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            <span className="text-sm text-green-500 font-medium">
              {realTimeVisitors} online
            </span>
          </div>

          {/* Date range selector */}
          <div className="flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-lg p-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  "px-3 py-1 text-sm rounded transition-colors",
                  days === d
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-[var(--background-hover)]"
                )}
              >
                {d}d
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && !summary && (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Key Metrics */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Pageviews"
            value={formatNumber(summary.totalPageviews)}
            icon={Eye}
          />
          <MetricCard
            title="Unique Visitors"
            value={formatNumber(summary.totalVisitors)}
            icon={Users}
          />
          <MetricCard
            title="Avg. Time on Page"
            value={formatDuration(summary.avgTimeOnPage)}
            icon={Clock}
          />
          <MetricCard
            title="Conversion Rate"
            value={formatPercentage(summary.conversionRate)}
            icon={Target}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Trend */}
        <div className="lg:col-span-2 p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Traffic Trend</h3>
            <Calendar className="w-4 h-4 text-[var(--foreground-muted)]" />
          </div>
          <SimpleLineChart data={chartData} height={200} />
        </div>

        {/* Traffic Sources */}
        <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Traffic Sources</h3>
            <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
          </div>
          <HorizontalBarChart data={sourcesData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <h3 className="font-semibold mb-4">Top Pages</h3>
          <div className="space-y-3">
            {topPages.length > 0 ? (
              topPages.map((page, index) => (
                <div
                  key={page.pageSlug}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="text-sm truncate max-w-[150px]">
                      /{page.pageSlug}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--foreground-secondary)]">
                    {formatNumber(page.pageviews)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--foreground-muted)] text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <h3 className="font-semibold mb-4">Devices</h3>
          <div className="space-y-3">
            {devicesData.length > 0 ? (
              devicesData.map((device) => {
                const Icon = getDeviceIcon(device.label);
                const total = devicesData.reduce((sum, d) => sum + d.value, 0);
                const percentage = total > 0 ? (device.value / total) * 100 : 0;

                return (
                  <div
                    key={device.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[var(--foreground-muted)]" />
                      <span className="text-sm capitalize">{device.label}</span>
                    </div>
                    <span className="text-sm text-[var(--foreground-secondary)]">
                      {formatPercentage(percentage)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[var(--foreground-muted)] text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>

        {/* Additional Metrics */}
        {summary && (
          <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <h3 className="font-semibold mb-4">Engagement</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground-secondary)]">
                  Bounce Rate
                </span>
                <span className="text-sm font-medium">
                  {formatPercentage(summary.avgBounceRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground-secondary)]">
                  Avg. Scroll Depth
                </span>
                <span className="text-sm font-medium">
                  {formatPercentage(summary.avgScrollDepth)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground-secondary)]">
                  Total Conversions
                </span>
                <span className="text-sm font-medium">
                  {formatNumber(summary.totalConversions)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE-SPECIFIC ANALYTICS VIEW
// ============================================================================

export function PageAnalyticsView({ pageId, pageSlug, className }: PageAnalyticsViewProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<PageAnalyticsData[]>([]);
  const [funnel, setFunnel] = useState<{
    visitors: number;
    engaged: number;
    ctaClicks: number;
    conversions: number;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [analyticsResult, funnelResult] = await Promise.all([
        getPageAnalyticsData(pageId, 30),
        getConversionFunnel(pageId, 30),
      ]);

      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
      }
      if (funnelResult.success && funnelResult.data) {
        setFunnel(funnelResult.data);
      }
      setLoading(false);
    }

    loadData();
  }, [pageId]);

  const chartData = analytics.map((a) => ({
    date: a.date.toISOString().split("T")[0],
    value: a.pageviews,
  }));

  const funnelData = funnel
    ? [
        { label: "Visitors", value: funnel.visitors },
        { label: "Engaged", value: funnel.engaged },
        { label: "CTA Clicks", value: funnel.ctaClicks },
        { label: "Conversions", value: funnel.conversions },
      ]
    : [];

  const totalPageviews = analytics.reduce((sum, a) => sum + a.pageviews, 0);
  const totalVisitors = analytics.reduce((sum, a) => sum + a.uniqueVisitors, 0);
  const avgTime =
    analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.avgTimeOnPage, 0) / analytics.length
      : 0;

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-24 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-pulse" />
        <div className="h-48 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="font-semibold mb-1">Analytics for /{pageSlug}</h3>
        <p className="text-sm text-[var(--foreground-secondary)]">Last 30 days</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Pageviews"
          value={formatNumber(totalPageviews)}
          icon={Eye}
        />
        <MetricCard
          title="Visitors"
          value={formatNumber(totalVisitors)}
          icon={Users}
        />
        <MetricCard
          title="Avg. Time"
          value={formatDuration(avgTime)}
          icon={Clock}
        />
      </div>

      {/* Traffic Chart */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
        <h4 className="text-sm font-medium mb-4">Traffic Over Time</h4>
        <SimpleLineChart data={chartData} height={150} />
      </div>

      {/* Conversion Funnel */}
      {funnel && (
        <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <h4 className="text-sm font-medium mb-4">Conversion Funnel</h4>
          <FunnelChart data={funnelData} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT ANALYTICS BADGE
// ============================================================================

interface AnalyticsBadgeProps {
  pageviews: number;
  className?: string;
}

export function AnalyticsBadge({ pageviews, className }: AnalyticsBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[var(--background-tertiary)]",
        className
      )}
    >
      <Eye className="w-3 h-3" />
      {formatNumber(pageviews)}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  MetricCard,
  SimpleLineChart,
  HorizontalBarChart,
  FunnelChart,
};
