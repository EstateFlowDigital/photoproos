"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData, formatCurrency } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import {
  LayoutDashboard,
  Images,
  Users,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Galleries", icon: Images },
  { label: "Clients", icon: Users },
  { label: "Payments", icon: CreditCard },
  { label: "Calendar", icon: Calendar },
];

export function FullDashboardMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);
  const userName = (data.userName as string) || "Jessica";
  const monthlyRevenue = (data.monthlyRevenue as number) || industryData.metrics.monthlyRevenue;
  const activeGalleries = (data.activeGalleries as number) || industryData.metrics.activeGalleries;
  const totalClients = (data.totalClients as number) || industryData.metrics.clients;
  const pendingPayments = industryData.metrics.pendingPayments;

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  return (
    <div
      className={cn(
        "full-dashboard-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden shadow-xl",
        theme === "light" && "bg-white border-gray-200",
        className
      )}
      style={primaryStyle}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-3">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-4 flex flex-1 items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-1.5 max-w-xs">
          <LockIcon className="h-3.5 w-3.5 text-[var(--success)]" />
          <span className="text-xs text-foreground-muted">app.photoproos.com/dashboard</span>
        </div>
      </div>

      <div className="flex h-[420px]">
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-r border-[var(--card-border)] bg-[var(--background-secondary)] py-4">
          {/* Logo */}
          <div className="mb-6 px-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                <span className="text-xs font-bold text-white">P</span>
              </div>
              <span className="text-sm font-semibold text-foreground">PhotoProOS</span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                  item.active
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
              <p className="text-xs text-foreground-muted">Welcome back, {userName}</p>
            </div>
            <span className="text-xs text-foreground-muted">January 2026</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Monthly Revenue"
              value={formatCurrency(monthlyRevenue)}
              change="+23%"
              positive
            />
            <StatCard
              label="Active Galleries"
              value={activeGalleries.toString()}
              change="+5"
              positive
            />
            <StatCard
              label="Total Clients"
              value={totalClients.toString()}
              change="+12"
              positive
            />
            <StatCard
              label="Pending Payments"
              value={formatCurrency(pendingPayments)}
            />
          </div>

          {/* Content row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Revenue chart */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
              <h4 className="mb-3 text-sm font-medium text-foreground">Revenue</h4>
              <div className="h-32 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 70, 90, 75, 85, 60, 95, 100].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-[var(--primary)]/80"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
              <h4 className="mb-3 text-sm font-medium text-foreground">Recent Activity</h4>
              <div className="space-y-3">
                {industryData.recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-2",
                      item.highlight && "bg-[var(--success)]/5"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 rounded-md p-1.5",
                        item.highlight
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--background-elevated)] text-foreground-muted"
                      )}
                    >
                      <CreditCard className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{item.detail}</p>
                      <p className="text-[10px] text-foreground-muted">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
      <p className="text-[10px] text-foreground-muted mb-1">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      {change && (
        <div className="flex items-center gap-1 mt-1">
          {positive ? (
            <TrendingUp className="h-3 w-3 text-[var(--success)]" />
          ) : (
            <TrendingDown className="h-3 w-3 text-[var(--error)]" />
          )}
          <span
            className={cn(
              "text-[10px] font-medium",
              positive ? "text-[var(--success)]" : "text-[var(--error)]"
            )}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
