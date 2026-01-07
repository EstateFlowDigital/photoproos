"use client";

import { cn } from "@/lib/utils";
import { formatCurrencyWhole } from "@/lib/utils/units";
import { Trophy, Zap, Calendar, Flame, Rocket } from "lucide-react";
import type { PersonalBests } from "@/lib/actions/gamification";

interface PersonalBestsCardProps {
  bests: PersonalBests;
  className?: string;
}

export function PersonalBestsCard({ bests, className }: PersonalBestsCardProps) {
  const records = [
    {
      label: "Best Month Revenue",
      value: bests.bestMonthRevenue.amountCents > 0
        ? formatCurrencyWhole(bests.bestMonthRevenue.amountCents)
        : "No record yet",
      date: bests.bestMonthRevenue.date,
      icon: Trophy,
      color: "text-[var(--reward-text)]",
      bgColor: "bg-[var(--reward-muted)]",
    },
    {
      label: "Fastest Delivery",
      value: bests.fastestDelivery.hours !== null
        ? formatDeliveryTime(bests.fastestDelivery.hours)
        : "No record yet",
      date: bests.fastestDelivery.date,
      icon: Zap,
      color: "text-[var(--primary)]",
      bgColor: "bg-[var(--primary)]/15",
    },
    {
      label: "Best Week Deliveries",
      value: bests.bestWeekDeliveries.count > 0
        ? `${bests.bestWeekDeliveries.count} galleries`
        : "No record yet",
      date: bests.bestWeekDeliveries.date,
      icon: Calendar,
      color: "text-[var(--success)]",
      bgColor: "bg-[var(--success)]/15",
    },
    {
      label: "Longest Login Streak",
      value: bests.longestLoginStreak > 0
        ? `${bests.longestLoginStreak} days`
        : "No record yet",
      date: null,
      icon: Flame,
      color: "text-[var(--warning)]",
      bgColor: "bg-[var(--warning-muted)]",
    },
    {
      label: "Longest Delivery Streak",
      value: bests.longestDeliveryStreak > 0
        ? `${bests.longestDeliveryStreak} days`
        : "No record yet",
      date: null,
      icon: Rocket,
      color: "text-[var(--ai)]",
      bgColor: "bg-[var(--ai)]/15",
    },
  ];

  const hasAnyRecord = records.some((r) => !r.value.includes("No record"));

  return (
    <div className={cn("personal-bests-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--reward-gradient)" }}>
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">Personal Bests</h3>
          <p className="text-xs text-[var(--foreground-muted)]">Your all-time records</p>
        </div>
      </div>

      {hasAnyRecord ? (
        <div className="space-y-3">
          {records.map((record) => (
            <RecordItem key={record.label} {...record} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--foreground-muted)]">
            Start using the platform to set your personal records!
          </p>
        </div>
      )}
    </div>
  );
}

function RecordItem({
  label,
  value,
  date,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  date: Date | null;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}) {
  const hasRecord = !value.includes("No record");

  return (
    <div className={cn(
      "record-item flex items-center gap-3 rounded-lg p-3 transition-colors",
      hasRecord ? bgColor : "bg-[var(--background-secondary)]"
    )}>
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg",
        hasRecord ? "bg-white/20" : "bg-[var(--background-tertiary)]"
      )}>
        <Icon className={cn("h-5 w-5", hasRecord ? color : "text-[var(--foreground-muted)]")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--foreground-muted)]">{label}</p>
        <p className={cn(
          "font-semibold truncate",
          hasRecord ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
        )}>
          {value}
        </p>
      </div>
      {date && (
        <span className="text-xs text-[var(--foreground-muted)]">
          {formatRecordDate(date)}
        </span>
      )}
    </div>
  );
}

function formatDeliveryTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  }
  if (hours < 24) {
    return hours === 1 ? "1 hour" : `${Math.round(hours)} hours`;
  }
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day" : `${days} days`;
}

function formatRecordDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Compact version for dashboard
export function PersonalBestsCompact({ bests, className }: PersonalBestsCardProps) {
  const highlights = [
    {
      label: "Best Month",
      value: bests.bestMonthRevenue.amountCents > 0
        ? formatCurrencyWhole(bests.bestMonthRevenue.amountCents)
        : "—",
      hasRecord: bests.bestMonthRevenue.amountCents > 0,
    },
    {
      label: "Fastest Delivery",
      value: bests.fastestDelivery.hours !== null
        ? formatDeliveryTime(bests.fastestDelivery.hours)
        : "—",
      hasRecord: bests.fastestDelivery.hours !== null,
    },
    {
      label: "Login Streak",
      value: bests.longestLoginStreak > 0
        ? `${bests.longestLoginStreak}d`
        : "—",
      hasRecord: bests.longestLoginStreak > 0,
    },
  ];

  return (
    <div className={cn("personal-bests-compact flex items-center gap-4", className)}>
      {highlights.map((h) => (
        <div key={h.label} className="text-center">
          <p className="text-xs text-[var(--foreground-muted)]">{h.label}</p>
          <p className={cn(
            "font-bold",
            h.hasRecord ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
          )}>
            {h.value}
          </p>
        </div>
      ))}
    </div>
  );
}
