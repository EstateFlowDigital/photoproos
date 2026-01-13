"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BrowserMockup } from "./device-mockup";
import { MetricCard, useAnimatedCounter } from "./metric-card";
import { RevenueChart, Sparkline } from "./revenue-chart";
import { PhotoProOSLogo } from "@/components/ui/photoproos-logo";

// ============================================
// TYPES
// ============================================

interface AnalyticsDashboardMockupProps {
  className?: string;
  animate?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function AnalyticsDashboardMockup({
  className,
  animate = true,
}: AnalyticsDashboardMockupProps) {
  const [isVisible, setIsVisible] = React.useState(!animate);
  const mockupRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!animate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (mockupRef.current) {
      observer.observe(mockupRef.current);
    }

    return () => observer.disconnect();
  }, [animate]);

  return (
    <div ref={mockupRef} className={cn("relative w-full", className)}>
      <BrowserMockup url="app.photoproos.com/dashboard" height="h-[480px] lg:h-[540px]">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-14 shrink-0 border-r border-[var(--card-border)] bg-[var(--background-secondary)] py-4 lg:w-52">
            {/* Logo */}
            <div className="mb-6 px-3 lg:px-4">
              <div className="hidden lg:block">
                <PhotoProOSLogo size="sm" />
              </div>
              <div className="flex justify-center lg:hidden">
                <PhotoProOSLogo variant="icon" size="sm" />
              </div>
            </div>

            {/* Nav items */}
            <nav className="space-y-1 px-2">
              {sidebarItems.map((item, index) => (
                <button
                  key={item.label}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium transition-all duration-200 lg:px-3",
                    index === 0
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Header */}
            <div
              className={cn(
                "mb-6 flex items-center justify-between transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <div>
                <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
                <p className="text-xs text-foreground-muted">Welcome back, Jessica</p>
              </div>
              <span className="text-xs text-foreground-muted">January 2026</span>
            </div>

            {/* Stats grid */}
            <div
              className={cn(
                "grid grid-cols-2 gap-3 lg:grid-cols-4 mb-4 transition-all duration-500 delay-100",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <MetricCard
                label="Monthly Revenue"
                value="$12,450"
                change="+23%"
                changeType="positive"
                size="sm"
                animate={isVisible}
              />
              <MetricCard
                label="Active Galleries"
                value="18"
                change="+5"
                changeType="positive"
                size="sm"
                animate={isVisible}
              />
              <MetricCard
                label="Total Clients"
                value="47"
                change="+12"
                changeType="positive"
                size="sm"
                animate={isVisible}
              />
              <MetricCard
                label="Pending Payments"
                value="$2,340"
                size="sm"
              />
            </div>

            {/* Charts row */}
            <div
              className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-500 delay-200",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              {/* Revenue chart */}
              <RevenueChart animate={isVisible} />

              {/* Activity feed */}
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
                <h4 className="mb-3 text-sm font-medium text-foreground">Recent Activity</h4>
                <div className="space-y-3">
                  {activityItems.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-2 transition-all duration-300",
                        item.highlight && "bg-[var(--success)]/5"
                      )}
                      style={{ transitionDelay: isVisible ? `${300 + index * 100}ms` : "0ms" }}
                    >
                      <div
                        className={cn(
                          "mt-0.5 rounded-md p-1.5",
                          item.highlight
                            ? "bg-[var(--success)]/10 text-[var(--success)]"
                            : "bg-[var(--background-elevated)] text-foreground-muted"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.text}</p>
                        <p className="text-xs text-foreground-muted">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </BrowserMockup>

      {/* Floating notifications */}
      <div
        className={cn(
          "absolute -right-2 lg:-right-6 top-1/4 hidden md:block transition-all duration-700 delay-500",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        )}
      >
        <FloatingNotification
          icon={<CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />}
          title="Payment received"
          subtitle="+$450.00"
          subtitleColor="text-[var(--success)]"
        />
      </div>

      <div
        className={cn(
          "absolute -left-2 lg:-left-6 bottom-1/3 hidden md:block transition-all duration-700 delay-700",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        )}
      >
        <FloatingNotification
          icon={<GalleryIcon className="h-4 w-4 text-[var(--primary)]" />}
          title="Gallery delivered"
          subtitle="24 photos • Premier Realty"
        />
      </div>

      <div
        className={cn(
          "absolute -right-2 lg:-right-6 bottom-1/4 hidden lg:block transition-all duration-700 delay-900",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        )}
      >
        <FloatingNotification
          icon={<CalendarIcon className="h-4 w-4 text-[var(--ai)]" />}
          title="Booking confirmed"
          subtitle="Tomorrow, 2:00 PM"
        />
      </div>
    </div>
  );
}

// ============================================
// FLOATING NOTIFICATION
// ============================================

interface FloatingNotificationProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  subtitleColor?: string;
}

function FloatingNotification({
  icon,
  title,
  subtitle,
  subtitleColor = "text-foreground-muted",
}: FloatingNotificationProps) {
  return (
    <div className="animate-float rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-foreground">{title}</span>
      </div>
      <p className={cn("mt-1 text-sm font-semibold", subtitleColor)}>{subtitle}</p>
    </div>
  );
}

// ============================================
// DATA
// ============================================

const sidebarItems = [
  { label: "Dashboard", icon: DashboardIcon },
  { label: "Galleries", icon: GalleryIcon },
  { label: "Clients", icon: ClientIcon },
  { label: "Payments", icon: PaymentIcon },
  { label: "Calendar", icon: CalendarIcon },
];

const activityItems = [
  {
    icon: PaymentIcon,
    text: "Sarah M. paid $450 for wedding gallery",
    time: "2 min ago",
    highlight: true,
  },
  {
    icon: GalleryIcon,
    text: "New gallery created: Downtown Loft Shoot",
    time: "1 hour ago",
    highlight: false,
  },
  {
    icon: ClientIcon,
    text: "New client added: Berkshire Properties",
    time: "3 hours ago",
    highlight: false,
  },
];

// ============================================
// ICONS
// ============================================

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7a1 1 0 0 0 1.414 1.414L4 10.414V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-7-7Z" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}
