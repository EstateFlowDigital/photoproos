"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  Star,
  Flame,
  Trophy,
  Gift,
  Target,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { LevelBadge, StreakBadge } from "@/components/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface GamificationHubProps {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  xpProgress: number;
  currentLoginStreak: number;
  currentDeliveryStreak: number;
  recentAchievementsCount: number;
  canClaimDailyBonus: boolean;
  activeChallengesCount: number;
  className?: string;
}

interface QuickStatProps {
  icon: typeof Star;
  label: string;
  value: string | number;
  href?: string;
  color: string;
}

// ============================================================================
// GAMIFICATION HUB (UNIFIED DASHBOARD WIDGET)
// ============================================================================

export const GamificationHub = memo(function GamificationHub({
  level,
  totalXp,
  xpToNextLevel,
  xpProgress,
  currentLoginStreak,
  currentDeliveryStreak,
  recentAchievementsCount,
  canClaimDailyBonus,
  activeChallengesCount,
  className,
}: GamificationHubProps) {
  return (
    <div
      className={cn(
        "gamification-hub rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        className
      )}
    >
      {/* Header with Level */}
      <div className="p-5 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--ai)]/10 border-b border-[var(--card-border)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <LevelBadge level={level} size="lg" showTitle />
            <div>
              <p className="text-lg font-bold text-[var(--foreground)]">
                {totalXp.toLocaleString()} XP
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {xpToNextLevel.toLocaleString()} XP to level {level + 1}
              </p>
            </div>
          </div>
          <Link
            href="/achievements"
            className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
          >
            View All
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 p-5">
        {/* Login Streak */}
        <QuickStat
          icon={Flame}
          label="Login Streak"
          value={`${currentLoginStreak} days`}
          color="text-[var(--error)]"
        />

        {/* Delivery Streak */}
        <QuickStat
          icon={Target}
          label="Delivery Streak"
          value={`${currentDeliveryStreak} days`}
          color="text-[var(--primary)]"
        />

        {/* Achievements */}
        <QuickStat
          icon={Trophy}
          label="Recent Achievements"
          value={recentAchievementsCount}
          href="/achievements"
          color="text-[var(--warning)]"
        />

        {/* Active Challenges */}
        <QuickStat
          icon={TrendingUp}
          label="Active Challenges"
          value={activeChallengesCount}
          color="text-[var(--ai)]"
        />
      </div>

      {/* Daily Bonus CTA */}
      {canClaimDailyBonus && (
        <div className="px-5 pb-5">
          <Link
            href="/settings/gamification"
            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-[var(--warning)]/10 to-[var(--warning)]/5 border border-[var(--warning)]/30 px-4 py-3 hover:from-[var(--warning)]/15 hover:to-[var(--warning)]/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Daily Bonus Available!
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Claim your daily XP reward
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// QUICK STAT
// ============================================================================

const QuickStat = memo(function QuickStat({
  icon: Icon,
  label,
  value,
  href,
  color,
}: QuickStatProps) {
  const content = (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--background-secondary)] p-3">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--card)]", color)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-lg font-bold text-[var(--foreground)]">{value}</p>
        <p className="text-xs text-[var(--foreground-muted)]">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
});

// ============================================================================
// COMPACT VERSION
// ============================================================================

interface GamificationHubCompactProps {
  level: number;
  totalXp: number;
  xpProgress: number;
  currentLoginStreak: number;
  className?: string;
}

export const GamificationHubCompact = memo(function GamificationHubCompact({
  level,
  totalXp,
  xpProgress,
  currentLoginStreak,
  className,
}: GamificationHubCompactProps) {
  return (
    <div
      className={cn(
        "gamification-hub-compact rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Level & XP */}
        <div className="flex items-center gap-3">
          <LevelBadge level={level} size="md" />
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              {totalXp.toLocaleString()} XP
            </p>
            <div className="mt-1 h-1.5 w-24 rounded-full bg-[var(--background-secondary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <StreakBadge count={currentLoginStreak} type="login" size="md" />

        {/* View More */}
        <Link
          href="/achievements"
          className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] transition-colors"
          aria-label="View achievements"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { GamificationHubProps, GamificationHubCompactProps };
