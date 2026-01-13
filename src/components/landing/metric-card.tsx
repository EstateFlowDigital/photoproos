"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

// ============================================
// ANIMATED COUNTER HOOK
// ============================================

function useAnimatedCounter(
  end: number,
  duration: number = 2000,
  startOnMount: boolean = true
) {
  const [count, setCount] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);

  React.useEffect(() => {
    if (!startOnMount || hasStarted) return;
    setHasStarted(true);

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, startOnMount, hasStarted]);

  return count;
}

// ============================================
// COMPONENT
// ============================================

export function MetricCard({
  label,
  value,
  change,
  changeType = "neutral",
  size = "md",
  icon,
  className,
  animate = false,
}: MetricCardProps) {
  // Parse numeric value for animation
  const numericValue = typeof value === "number" ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ""));
  const prefix = typeof value === "string" ? value.match(/^[^0-9]*/)?.[0] || "" : "";
  const suffix = typeof value === "string" ? value.match(/[^0-9]*$/)?.[0] || "" : "";

  const animatedValue = useAnimatedCounter(
    isNaN(numericValue) ? 0 : numericValue,
    2000,
    animate
  );

  const displayValue = animate && !isNaN(numericValue)
    ? `${prefix}${animatedValue.toLocaleString()}${suffix}`
    : value;

  const changeColors = {
    positive: "text-[var(--success)]",
    negative: "text-[var(--error)]",
    neutral: "text-foreground-muted",
  };

  const changeIcons = {
    positive: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    negative: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: null,
  };

  const sizeClasses = {
    sm: {
      card: "p-3",
      label: "text-xs",
      value: "text-lg font-bold",
      change: "text-xs",
    },
    md: {
      card: "p-4",
      label: "text-xs",
      value: "text-2xl font-bold",
      change: "text-sm",
    },
    lg: {
      card: "p-6",
      label: "text-sm",
      value: "text-4xl font-bold",
      change: "text-sm",
    },
  };

  return (
    <div
      className={cn(
        "metric-card rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)]",
        "transition-all duration-200 hover:border-[var(--border-hover)]",
        sizeClasses[size].card,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-foreground-muted", sizeClasses[size].label)}>
          {label}
        </p>
        {icon && (
          <div className="text-foreground-muted">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={cn("text-foreground", sizeClasses[size].value)}>
          {displayValue}
        </span>
        {change && (
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              sizeClasses[size].change,
              changeColors[changeType]
            )}
          >
            {changeIcons[changeType]}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export { useAnimatedCounter };
