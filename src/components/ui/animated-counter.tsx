"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  once?: boolean; // Only animate once when in view
}

export function AnimatedCounter({
  end,
  start = 0,
  duration = 2000,
  delay = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  once = true,
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(start);
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const elementRef = React.useRef<HTMLSpanElement>(null);

  // Intersection observer to trigger animation when in view
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  // Animate the counter
  React.useEffect(() => {
    if (!isVisible || (once && hasAnimated)) return;

    const startTime = Date.now() + delay;
    const endTime = startTime + duration;

    // Easing function (ease-out cubic)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = () => {
      const now = Date.now();

      if (now < startTime) {
        requestAnimationFrame(animate);
        return;
      }

      if (now >= endTime) {
        setCount(end);
        setHasAnimated(true);
        return;
      }

      const progress = (now - startTime) / duration;
      const easedProgress = easeOutCubic(progress);
      const currentCount = start + (end - start) * easedProgress;

      setCount(currentCount);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isVisible, start, end, duration, delay, once, hasAnimated]);

  // Format the number
  const formattedCount = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString();

  return (
    <span ref={elementRef} className={cn("tabular-nums", className)}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
}

// Percentage counter with visual bar
interface PercentageCounterProps {
  value: number;
  label: string;
  color?: string;
  className?: string;
}

export function PercentageCounter({
  value,
  label,
  color = "var(--primary)",
  className,
}: PercentageCounterProps) {
  const [width, setWidth] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      // Slight delay before animating
      const timer = setTimeout(() => setWidth(value), 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, value]);

  return (
    <div ref={elementRef} className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-4 flex-wrap text-sm">
        <span className="text-foreground-secondary">{label}</span>
        <AnimatedCounter
          end={value}
          suffix="%"
          className="font-semibold text-foreground"
        />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--background-elevated)]">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

// Stats counter group
interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

interface StatsCounterProps {
  stats: StatItem[];
  className?: string;
}

export function StatsCounter({ stats, className }: StatsCounterProps) {
  return (
    <div className={cn("grid gap-8 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl font-bold text-foreground lg:text-5xl">
            <AnimatedCounter
              end={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              delay={index * 150}
            />
          </div>
          <div className="mt-2 text-sm text-foreground-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
