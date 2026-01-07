"use client";

import { cn } from "@/lib/utils";
import { getLevelTitle, getXpProgress, MAX_LEVEL } from "@/lib/gamification/achievements";

interface LevelProgressProps {
  level: number;
  totalXp: number;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: {
    badge: "h-6 w-6 text-xs",
    bar: "h-1.5",
    text: "text-xs",
  },
  md: {
    badge: "h-8 w-8 text-sm",
    bar: "h-2",
    text: "text-sm",
  },
  lg: {
    badge: "h-10 w-10 text-base",
    bar: "h-2.5",
    text: "text-base",
  },
};

export function LevelProgress({
  level,
  totalXp,
  showTitle = true,
  size = "md",
  className,
}: LevelProgressProps) {
  const { current: currentXp, required: requiredXp, percent: progressPercent } = getXpProgress(totalXp, level);
  const title = getLevelTitle(level);
  const styles = sizeStyles[size];
  const isMaxLevel = level >= MAX_LEVEL;

  return (
    <div className={cn("level-progress flex items-center gap-3", className)}>
      {/* Level badge */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] font-bold text-white",
          styles.badge
        )}
      >
        {level}
      </div>

      {/* Progress info */}
      <div className="flex-1 min-w-0">
        {showTitle && (
          <div className="flex items-center justify-between gap-2">
            <span className={cn("font-medium text-[var(--foreground)]", styles.text)}>
              {title}
            </span>
            {!isMaxLevel && (
              <span className={cn("text-[var(--foreground-muted)]", styles.text)}>
                {currentXp.toLocaleString()} / {requiredXp.toLocaleString()} XP
              </span>
            )}
            {isMaxLevel && (
              <span className={cn("text-[var(--success)]", styles.text)}>
                Max Level
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        {!isMaxLevel && (
          <div className={cn("mt-1 w-full overflow-hidden rounded-full bg-[var(--background-secondary)]", styles.bar)}>
            <div
              className={cn("h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all duration-500")}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Max level indicator */}
        {isMaxLevel && (
          <div className={cn("mt-1 w-full rounded-full bg-gradient-to-r from-[var(--success)] to-[var(--primary)]", styles.bar)} />
        )}
      </div>
    </div>
  );
}

// Compact level badge for tight spaces
export function LevelBadge({ level, size = "md" }: { level: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = {
    sm: "h-5 w-5 text-[10px]",
    md: "h-6 w-6 text-xs",
    lg: "h-8 w-8 text-sm",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] font-bold text-white",
        sizeClass[size]
      )}
      title={`Level ${level}`}
    >
      {level}
    </div>
  );
}

// XP display for showing earned XP
export function XpDisplay({ xp, size = "md" }: { xp: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span className={cn("font-semibold text-[var(--ai)]", sizeClass[size])}>
      +{xp} XP
    </span>
  );
}
