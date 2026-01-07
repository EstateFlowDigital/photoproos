"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type SparklineVariant = "bar" | "line" | "area";

interface SparklineProps {
  /** Array of numeric values to display */
  data: number[];
  /** Width of the sparkline (default: 60) */
  width?: number;
  /** Height of the sparkline (default: 24) */
  height?: number;
  /** Color for the sparkline (default: var(--primary)) */
  color?: string;
  /** Show trend indicator arrow */
  showTrend?: boolean;
  /** Sparkline variant: 'bar' | 'line' | 'area' */
  variant?: SparklineVariant;
  /** Additional class names */
  className?: string;
  /** Minimum bar height percentage (for bar variant) */
  minBarHeight?: number;
}

export function Sparkline({
  data,
  width = 60,
  height = 24,
  color = "var(--primary)",
  showTrend = false,
  variant = "bar",
  className,
  minBarHeight = 15,
}: SparklineProps) {
  const { max, min, range, trend, trendPercent } = useMemo(() => {
    if (data.length === 0) return { max: 0, min: 0, range: 1, trend: "neutral" as const, trendPercent: 0 };

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const rangeVal = maxVal - minVal || 1;

    // Calculate trend from first half to second half
    const midpoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midpoint);
    const secondHalf = data.slice(midpoint);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trendDir = secondAvg > firstAvg ? "up" : secondAvg < firstAvg ? "down" : "neutral";
    const trendPct = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return { max: maxVal, min: minVal, range: rangeVal, trend: trendDir, trendPercent: trendPct };
  }, [data]);

  if (data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ width, height }}
      >
        <span className="text-xs text-foreground-muted">No data</span>
      </div>
    );
  }

  // Trend colors
  const trendColor = trend === "up" ? "var(--success)" : trend === "down" ? "var(--error)" : "var(--foreground-muted)";

  if (variant === "bar") {
    return (
      <div className={cn("flex items-end", className)} style={{ gap: 1 }}>
        <div className="flex items-end gap-0.5" style={{ width, height }}>
          {data.map((value, index) => {
            const heightPercent = ((value - min) / range) * 100;
            const isLast = index === data.length - 1;

            return (
              <div
                key={index}
                className="flex-1 rounded-sm transition-all duration-300"
                style={{
                  height: `${Math.max(heightPercent, minBarHeight)}%`,
                  backgroundColor: isLast ? color : `color-mix(in srgb, ${color} 40%, transparent)`,
                }}
              />
            );
          })}
        </div>
        {showTrend && (
          <TrendIndicator trend={trend} color={trendColor} />
        )}
      </div>
    );
  }

  if (variant === "line" || variant === "area") {
    const padding = 2;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    // Generate SVG path
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth;
      const y = padding + innerHeight - ((value - min) / range) * innerHeight;
      return { x, y };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

    return (
      <div className={cn("flex items-center", className)} style={{ gap: 4 }}>
        <svg width={width} height={height} className="overflow-visible">
          {variant === "area" && (
            <path
              d={areaPath}
              fill={`color-mix(in srgb, ${color} 15%, transparent)`}
            />
          )}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* End point dot */}
          <circle
            cx={points[points.length - 1]?.x}
            cy={points[points.length - 1]?.y}
            r={2.5}
            fill={color}
          />
        </svg>
        {showTrend && (
          <TrendIndicator trend={trend} color={trendColor} />
        )}
      </div>
    );
  }

  return null;
}

function TrendIndicator({ trend, color }: { trend: "up" | "down" | "neutral"; color: string }) {
  if (trend === "neutral") return null;

  return (
    <div className="flex items-center" style={{ color }}>
      {trend === "up" ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 2L10 7H2L6 2Z" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 10L2 5H10L6 10Z" />
        </svg>
      )}
    </div>
  );
}

// Convenience component for view trends on gallery cards
interface ViewSparklineProps {
  /** 7 days of view counts */
  data: number[];
  /** Additional class names */
  className?: string;
}

export function ViewSparkline({ data, className }: ViewSparklineProps) {
  return (
    <Sparkline
      data={data}
      width={50}
      height={20}
      color="var(--primary)"
      showTrend={true}
      variant="bar"
      className={className}
    />
  );
}

// Convenience component for compact metrics display
interface MetricSparklineProps {
  /** Array of values */
  data: number[];
  /** Current value to display */
  value: string | number;
  /** Label for the metric */
  label: string;
  /** Trend direction override */
  trend?: "up" | "down" | "neutral";
  /** Additional class names */
  className?: string;
}

export function MetricSparkline({ data, value, label, trend, className }: MetricSparklineProps) {
  // Calculate trend if not provided
  const calculatedTrend = trend || (() => {
    if (data.length < 2) return "neutral";
    const first = data[0];
    const last = data[data.length - 1];
    return last > first ? "up" : last < first ? "down" : "neutral";
  })();

  const trendColor = calculatedTrend === "up" ? "var(--success)" : calculatedTrend === "down" ? "var(--error)" : "var(--foreground-muted)";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1">
        <p className="text-xs text-foreground-muted">{label}</p>
        <p className="text-lg font-semibold text-foreground" style={{ color: trendColor }}>
          {value}
        </p>
      </div>
      <Sparkline
        data={data}
        width={48}
        height={24}
        color={trendColor}
        variant="area"
      />
    </div>
  );
}
