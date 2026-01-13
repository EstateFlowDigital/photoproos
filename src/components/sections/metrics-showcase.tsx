"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// ============================================
// ANIMATED COUNTER HOOK
// ============================================

function useAnimatedCounter(
  end: number,
  duration: number = 2000,
  start: boolean = true
) {
  const [count, setCount] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);

  React.useEffect(() => {
    if (!start || hasStarted) return;
    setHasStarted(true);

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, start, hasStarted]);

  return count;
}

// ============================================
// METRICS SHOWCASE SECTION
// ============================================

export function MetricsShowcaseSection() {
  const { ref, isVisible } = useScrollAnimation();

  const photographerCount = useAnimatedCounter(2500, 2000, isVisible);
  const processedAmount = useAnimatedCounter(2.0, 2000, isVisible);
  const galleriesCount = useAnimatedCounter(50000, 2500, isVisible);

  return (
    <section ref={ref} className="relative z-10 py-20 lg:py-28 overflow-hidden">
      {/* Subtle grid background - uses CSS variables for theme-aware colors */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--grid-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        {/* Main stat */}
        <div
          className="text-center mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
          }}
        >
          <p className="text-sm font-medium uppercase tracking-wider text-foreground-muted mb-4">
            Trusted by photographers worldwide
          </p>
          <div className="relative inline-block">
            <span className="text-[56px] sm:text-[80px] lg:text-[120px] font-bold leading-none tracking-tight">
              <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent">
                {photographerCount.toLocaleString()}+
              </span>
            </span>
            {/* Glow effect */}
            <div
              className="absolute inset-0 blur-3xl opacity-20"
              style={{
                background: "linear-gradient(90deg, var(--primary), var(--ai))",
              }}
            />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl text-foreground-secondary mt-2">
            Photographers trust PhotoProOS
          </p>
        </div>

        {/* Supporting stats */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "200ms",
          }}
        >
          <MetricCard
            value={`$${processedAmount.toFixed(1)}M+`}
            label="Processed Monthly"
            description="In photographer payments"
            icon={<DollarIcon />}
            color="blue"
          />
          <MetricCard
            value={`${galleriesCount.toLocaleString()}+`}
            label="Galleries Delivered"
            description="Photos shared with clients"
            icon={<GalleryIcon />}
            color="purple"
          />
          <MetricCard
            value="99.9%"
            label="Uptime"
            description="Enterprise-grade reliability"
            icon={<ShieldIcon />}
            color="green"
          />
        </div>
      </div>
    </section>
  );
}

// ============================================
// METRIC CARD COMPONENT
// ============================================

interface MetricCardProps {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green";
}

function MetricCard({ value, label, description, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: "text-[var(--primary)] bg-[var(--primary)]/10",
    purple: "text-[var(--ai)] bg-[var(--ai)]/10",
    green: "text-[var(--success)] bg-[var(--success)]/10",
  };

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 lg:p-8 text-center transition-all duration-200 hover:border-[var(--border-hover)]">
      <div className={cn(
        "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
        colorClasses[color]
      )}>
        {icon}
      </div>
      <p className="text-3xl lg:text-4xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground-secondary">{label}</p>
      <p className="mt-1 text-xs text-foreground-muted">{description}</p>
    </div>
  );
}

// ============================================
// ICONS
// ============================================

function DollarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}
