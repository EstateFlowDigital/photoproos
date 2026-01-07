"use client";

import { cn } from "@/lib/utils";
import { LevelProgress, LevelBadge } from "./level-progress";
import { StreakDisplay, StreakBadge } from "./streak-display";
import { AchievementBadge, RarityLabel } from "./achievement-badge";
import Link from "next/link";
import type { AchievementRarity } from "@prisma/client";

interface RecentAchievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
  unlockedAt: Date;
}

interface GamificationWidgetProps {
  level: number;
  totalXp: number;
  currentLoginStreak: number;
  longestLoginStreak: number;
  currentDeliveryStreak: number;
  longestDeliveryStreak: number;
  recentAchievements: RecentAchievement[];
  totalAchievements: number;
  unlockedAchievements: number;
  className?: string;
}

export function GamificationWidget({
  level,
  totalXp,
  currentLoginStreak,
  longestLoginStreak,
  currentDeliveryStreak,
  longestDeliveryStreak,
  recentAchievements,
  totalAchievements,
  unlockedAchievements,
  className,
}: GamificationWidgetProps) {
  return (
    <div
      className={cn(
        "gamification-widget rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--foreground)]">Your Progress</h3>
        <Link
          href="/achievements"
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Level progress */}
      <div className="mt-4">
        <LevelProgress level={level} totalXp={totalXp} />
      </div>

      {/* Streaks */}
      <div className="mt-4 flex flex-wrap gap-3">
        <StreakDisplay
          count={currentLoginStreak}
          type="login"
          longestStreak={longestLoginStreak}
          size="sm"
        />
        <StreakDisplay
          count={currentDeliveryStreak}
          type="delivery"
          longestStreak={longestDeliveryStreak}
          size="sm"
        />
      </div>

      {/* Achievement progress */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-[var(--foreground-muted)]">Achievements</span>
        <span className="font-medium text-[var(--foreground)]">
          {unlockedAchievements} / {totalAchievements}
        </span>
      </div>

      {/* Recent achievements */}
      {recentAchievements.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
            Recently Unlocked
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentAchievements.slice(0, 4).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-2 rounded-lg bg-[var(--background-secondary)] px-2 py-1.5"
                title={`${achievement.name}: ${achievement.description}`}
              >
                <AchievementBadge
                  icon={achievement.icon}
                  name={achievement.name}
                  rarity={achievement.rarity}
                  isUnlocked
                  size="sm"
                  showGlow={false}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">
                    {achievement.name}
                  </p>
                  <RarityLabel rarity={achievement.rarity} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar or smaller spaces
export function GamificationWidgetCompact({
  level,
  totalXp,
  currentLoginStreak,
  currentDeliveryStreak,
  unlockedAchievements,
  totalAchievements,
  className,
}: {
  level: number;
  totalXp: number;
  currentLoginStreak: number;
  currentDeliveryStreak: number;
  unlockedAchievements: number;
  totalAchievements: number;
  className?: string;
}) {
  return (
    <Link
      href="/achievements"
      className={cn(
        "gamification-widget-compact flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 transition-colors hover:bg-[var(--background-hover)]",
        className
      )}
    >
      <LevelBadge level={level} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Level {level}</span>
          <span className="text-xs text-[var(--foreground-muted)]">
            {totalXp.toLocaleString()} XP
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <StreakBadge count={currentLoginStreak} type="login" size="sm" />
          <StreakBadge count={currentDeliveryStreak} type="delivery" size="sm" />
          <span className="text-xs text-[var(--foreground-muted)]">
            {unlockedAchievements}/{totalAchievements}
          </span>
        </div>
      </div>
    </Link>
  );
}
