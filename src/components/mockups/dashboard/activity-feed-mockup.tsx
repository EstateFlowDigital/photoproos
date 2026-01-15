"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import { CreditCard, Images, Users, Calendar, CheckCircle } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Payment received": CreditCard,
  "Final payment": CreditCard,
  "Gallery delivered": Images,
  "Gallery approved": Images,
  "Gallery viewed": Images,
  "New booking": Calendar,
  "Session booked": Calendar,
  "Contract signed": CheckCircle,
  "New client": Users,
  "New inquiry": Users,
  default: CreditCard,
};

export function ActivityFeedMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  return (
    <div
      className={cn(
        "activity-feed-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        theme === "light" && "bg-white border-gray-200",
        className
      )}
      style={primaryStyle}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <button className="text-xs text-[var(--primary)] hover:underline">View all</button>
      </div>

      <div className="space-y-3">
        {industryData.recentActivity.map((item, index) => {
          const Icon = iconMap[item.action] || iconMap.default;

          return (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3 transition-colors",
                item.highlight
                  ? "bg-[var(--success)]/5 border border-[var(--success)]/20"
                  : "hover:bg-[var(--background-hover)]"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 rounded-lg p-2",
                  item.highlight
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : "bg-[var(--background-elevated)] text-foreground-muted"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.action}</p>
                <p className="text-xs text-foreground-muted mt-0.5">{item.detail}</p>
              </div>
              <span className="text-xs text-foreground-muted shrink-0">{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
