"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface RevenueChartProps {
  className?: string;
  animate?: boolean;
}

interface BarData {
  month: string;
  value: number;
  highlighted?: boolean;
}

// ============================================
// CHART DATA
// ============================================

const chartData: BarData[] = [
  { month: "Jan", value: 65 },
  { month: "Feb", value: 78 },
  { month: "Mar", value: 72 },
  { month: "Apr", value: 85 },
  { month: "May", value: 92 },
  { month: "Jun", value: 88 },
  { month: "Jul", value: 95 },
  { month: "Aug", value: 102, highlighted: true },
  { month: "Sep", value: 98 },
  { month: "Oct", value: 108 },
  { month: "Nov", value: 115 },
  { month: "Dec", value: 124, highlighted: true },
];

// ============================================
// COMPONENT
// ============================================

export function RevenueChart({ className, animate = true }: RevenueChartProps) {
  const [isVisible, setIsVisible] = React.useState(!animate);
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!animate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, [animate]);

  const maxValue = Math.max(...chartData.map((d) => d.value));
  const chartHeight = 160;
  const barWidth = 24;
  const barGap = 8;
  const chartWidth = chartData.length * (barWidth + barGap) - barGap;

  return (
    <div
      ref={chartRef}
      className={cn(
        "revenue-chart rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4",
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">Revenue</h4>
          <p className="text-xs text-foreground-muted">Monthly earnings</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">$12,450</p>
          <p className="text-xs font-medium text-[var(--success)]">+23% from last month</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          width="100%"
          height={chartHeight + 24}
          viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--ai)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
            <linearGradient id="barGradientHighlighted" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--ai)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={chartHeight * (1 - ratio)}
              x2={chartWidth}
              y2={chartHeight * (1 - ratio)}
              stroke="var(--border)"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          ))}

          {/* Bars */}
          {chartData.map((bar, index) => {
            const barHeight = (bar.value / maxValue) * chartHeight;
            const x = index * (barWidth + barGap);
            const y = chartHeight - barHeight;

            return (
              <g key={bar.month}>
                {/* Bar */}
                <rect
                  x={x}
                  y={isVisible ? y : chartHeight}
                  width={barWidth}
                  height={isVisible ? barHeight : 0}
                  rx="4"
                  fill={bar.highlighted ? "url(#barGradientHighlighted)" : "url(#barGradient)"}
                  opacity={bar.highlighted ? 1 : 0.7}
                  className="transition-all duration-700 ease-out"
                  style={{
                    transitionDelay: animate ? `${index * 50}ms` : "0ms",
                  }}
                />

                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className="fill-foreground-muted text-[10px]"
                >
                  {bar.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============================================
// MINI VERSION FOR FEATURE CARDS
// ============================================

interface MiniChartProps {
  data?: number[];
  className?: string;
  color?: "blue" | "purple" | "green";
}

export function MiniChart({
  data = [40, 60, 45, 80, 55, 70, 85, 65, 90, 75],
  className,
  color = "blue",
}: MiniChartProps) {
  const maxValue = Math.max(...data);
  const width = 80;
  const height = 32;
  const barWidth = 6;
  const gap = 2;

  const colorMap = {
    blue: "var(--primary)",
    purple: "var(--ai)",
    green: "var(--success)",
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      {data.slice(0, 10).map((value, index) => {
        const barHeight = (value / maxValue) * height;
        const x = index * (barWidth + gap);
        const y = height - barHeight;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx="1"
            fill={colorMap[color]}
            opacity={0.6 + (index / data.length) * 0.4}
          />
        );
      })}
    </svg>
  );
}

// ============================================
// SPARKLINE COMPONENT
// ============================================

interface SparklineProps {
  data?: number[];
  className?: string;
  color?: "blue" | "purple" | "green" | "orange";
  showArea?: boolean;
}

export function Sparkline({
  data = [20, 35, 25, 45, 30, 55, 40, 60, 50, 70],
  className,
  color = "blue",
  showArea = true,
}: SparklineProps) {
  const width = 100;
  const height = 32;
  const padding = 2;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const colorMap = {
    blue: { stroke: "var(--primary)", fill: "var(--primary)" },
    purple: { stroke: "var(--ai)", fill: "var(--ai)" },
    green: { stroke: "var(--success)", fill: "var(--success)" },
    orange: { stroke: "var(--warning)", fill: "var(--warning)" },
  };

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((maxValue - value) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      {showArea && (
        <path
          d={areaPath}
          fill={colorMap[color].fill}
          opacity="0.1"
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={colorMap[color].stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width - padding}
        cy={padding + ((maxValue - data[data.length - 1]) / range) * (height - padding * 2)}
        r="3"
        fill={colorMap[color].stroke}
      />
    </svg>
  );
}
