"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData, formatCurrency } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import { TrendingUp, TrendingDown, DollarSign, Images, Users, Clock } from "lucide-react";

export function MetricsRowMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);

  const metrics = [
    {
      label: "Monthly Revenue",
      value: formatCurrency((data.metric1Value as number) || industryData.metrics.monthlyRevenue),
      change: (data.metric1Change as string) || "+23%",
      positive: true,
      icon: DollarSign,
    },
    {
      label: "Active Galleries",
      value: ((data.metric2Value as number) || industryData.metrics.activeGalleries).toString(),
      change: "+5",
      positive: true,
      icon: Images,
    },
    {
      label: "Total Clients",
      value: ((data.metric3Value as number) || industryData.metrics.clients).toString(),
      change: "+12",
      positive: true,
      icon: Users,
    },
    {
      label: "Pending Payments",
      value: formatCurrency((data.metric4Value as number) || industryData.metrics.pendingPayments),
      change: null,
      positive: null,
      icon: Clock,
    },
  ];

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  return (
    <div
      className={cn(
        "metrics-row-mockup grid grid-cols-4 gap-4",
        className
      )}
      style={primaryStyle}
    >
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={cn(
            "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
            theme === "light" && "bg-white border-gray-200"
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className={cn(
                "rounded-lg p-2",
                "bg-[var(--primary)]/10 text-[var(--primary)]"
              )}
            >
              <metric.icon className="h-4 w-4" />
            </div>
            {metric.change && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  metric.positive
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : "bg-[var(--error)]/10 text-[var(--error)]"
                )}
              >
                {metric.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {metric.change}
              </div>
            )}
          </div>
          <p className="text-xs text-foreground-muted mb-1">{metric.label}</p>
          <p className="text-2xl font-bold text-foreground">{metric.value}</p>

          {/* Mini sparkline */}
          <div className="mt-3 flex items-end gap-0.5 h-8">
            {[30, 45, 35, 60, 50, 70, 55, 80, 65, 90, 75, 100].map((h, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-sm",
                  metric.positive !== false
                    ? "bg-[var(--success)]/40"
                    : "bg-foreground/20"
                )}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
