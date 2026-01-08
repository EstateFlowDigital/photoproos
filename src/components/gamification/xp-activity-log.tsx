"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Gift,
  Zap,
  Flame,
  Target,
  Camera,
  Scroll,
  Users,
  TrendingUp,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { XpActivityEntry, XpActivityType } from "@/lib/actions/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface XpActivityLogProps {
  activities: XpActivityEntry[];
  className?: string;
}

interface XpActivityItemProps {
  activity: XpActivityEntry;
  index: number;
}

interface XpActivityWidgetProps {
  activities: XpActivityEntry[];
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const activityIcons: Record<XpActivityType, typeof Trophy> = {
  achievement: Trophy,
  daily_bonus: Gift,
  level_up: TrendingUp,
  streak_milestone: Flame,
  delivery: Target,
  gallery: Camera,
  quest: Scroll,
  challenge: Zap,
  referral: Users,
};

const activityColors: Record<XpActivityType, string> = {
  achievement: "text-[var(--primary)] bg-[var(--primary)]/15",
  daily_bonus: "text-[var(--warning)] bg-[var(--warning)]/15",
  level_up: "text-[var(--success)] bg-[var(--success)]/15",
  streak_milestone: "text-[var(--error)] bg-[var(--error)]/15",
  delivery: "text-[var(--ai)] bg-[var(--ai)]/15",
  gallery: "text-[var(--foreground-muted)] bg-[var(--background-secondary)]",
  quest: "text-[var(--primary)] bg-[var(--primary)]/15",
  challenge: "text-[var(--warning)] bg-[var(--warning)]/15",
  referral: "text-[var(--success)] bg-[var(--success)]/15",
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case "legendary":
      return "text-[var(--warning)]";
    case "epic":
      return "text-[var(--ai)]";
    case "rare":
      return "text-[var(--primary)]";
    case "uncommon":
      return "text-[var(--success)]";
    default:
      return "text-[var(--foreground-muted)]";
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const XpActivityLog = memo(function XpActivityLog({
  activities,
  className,
}: XpActivityLogProps) {
  if (activities.length === 0) {
    return (
      <div
        className={cn(
          "xp-activity-log rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center",
          className
        )}
      >
        <Zap className="mx-auto h-10 w-10 text-[var(--foreground-muted)] mb-3" />
        <p className="text-[var(--foreground-muted)]">No XP activity yet.</p>
        <p className="text-sm text-[var(--foreground-muted)]">
          Complete actions to earn XP!
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "xp-activity-log rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
          <h3 className="font-semibold text-[var(--foreground)]">XP Activity</h3>
        </div>
        <span className="text-sm text-[var(--foreground-muted)]">
          {activities.length} entries
        </span>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-[var(--card-border)] max-h-[400px] overflow-y-auto">
        {activities.map((activity, index) => (
          <XpActivityItem key={activity.id} activity={activity} index={index} />
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// ACTIVITY ITEM
// ============================================================================

const XpActivityItem = memo(function XpActivityItem({
  activity,
  index,
}: XpActivityItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = activityIcons[activity.type];
  const colorClass = activityColors[activity.type];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.03 }}
      className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--background-hover)] transition-colors"
    >
      {/* Icon */}
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", colorClass)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--foreground)] truncate">
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--foreground-muted)]">
            {formatTimestamp(activity.timestamp)}
          </span>
          {activity.metadata?.achievementRarity && (
            <span className={cn("text-xs font-medium", getRarityColor(activity.metadata.achievementRarity))}>
              {activity.metadata.achievementRarity}
            </span>
          )}
        </div>
      </div>

      {/* XP Amount */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm font-semibold text-[var(--warning)]">
          +{activity.amount}
        </span>
        <span className="text-xs text-[var(--foreground-muted)]">XP</span>
      </div>
    </motion.div>
  );
});

// ============================================================================
// COMPACT WIDGET
// ============================================================================

export const XpActivityWidget = memo(function XpActivityWidget({
  activities,
  className,
}: XpActivityWidgetProps) {
  const recentActivities = activities.slice(0, 5);
  const totalXp = activities.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div
      className={cn(
        "xp-activity-widget rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
          <h3 className="font-semibold text-[var(--foreground)]">Recent XP</h3>
        </div>
        <span className="text-sm font-medium text-[var(--warning)]">
          +{totalXp.toLocaleString()} XP
        </span>
      </div>

      {/* Recent Items */}
      <div className="space-y-2">
        {recentActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 rounded-lg bg-[var(--background-secondary)] p-2"
            >
              <Icon className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
              <span className="flex-1 text-xs text-[var(--foreground)] truncate">
                {activity.description}
              </span>
              <span className="text-xs font-medium text-[var(--warning)]">
                +{activity.amount}
              </span>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <p className="text-center text-sm text-[var(--foreground-muted)] py-4">
          No recent activity
        </p>
      )}
    </div>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { XpActivityLogProps, XpActivityWidgetProps };
