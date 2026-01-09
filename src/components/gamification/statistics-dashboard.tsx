"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Flame,
  Calendar,
  Target,
  Zap,
  Star,
  Clock,
  Users,
  Camera,
  DollarSign,
} from "lucide-react";
import type { AchievementRarity, AchievementCategory } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface GamificationStats {
  // Level & XP
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  xpProgress: number;
  prestigeLevel?: number;

  // Streaks
  currentLoginStreak: number;
  longestLoginStreak: number;
  currentDeliveryStreak: number;
  longestDeliveryStreak: number;

  // Achievements
  totalAchievements: number;
  unlockedAchievements: number;
  achievementsByRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
  achievementsByCategory: Record<AchievementCategory, { total: number; unlocked: number }>;

  // Activity metrics
  totalGalleries: number;
  totalDeliveries: number;
  totalClients: number;
  totalBookings: number;
  totalPayments: number;

  // Personal Bests
  bestMonthRevenueCents: number;
  fastestDeliveryHours: number | null;
  bestWeekDeliveries: number;

  // Time-based
  memberSinceDays: number;
  totalBonusesClaimed: number;
  consecutiveBonusDays: number;
}

interface StatisticsDashboardProps {
  stats: GamificationStats;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StatisticsDashboard({ stats, className }: StatisticsDashboardProps) {
  // Calculate achievement completion percentage
  const achievementCompletion = useMemo(
    () =>
      stats.totalAchievements > 0
        ? Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)
        : 0,
    [stats.unlockedAchievements, stats.totalAchievements]
  );

  // Calculate average XP earned per day
  const avgXpPerDay = stats.totalXp / Math.max(stats.memberSinceDays, 1);

  return (
    <div className={cn("statistics-dashboard space-y-6", className)}>
      {/* Header Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Star}
          iconColor="text-[var(--ai)]"
          label="Level"
          value={`${stats.level}`}
          subtitle={stats.prestigeLevel ? `Prestige ${stats.prestigeLevel}` : undefined}
        />
        <StatCard
          icon={Zap}
          iconColor="text-[var(--warning)]"
          label="Total XP"
          value={formatNumber(stats.totalXp)}
          subtitle={`${Math.round(avgXpPerDay)} avg/day`}
        />
        <StatCard
          icon={Trophy}
          iconColor="text-[var(--primary)]"
          label="Achievements"
          value={`${stats.unlockedAchievements}/${stats.totalAchievements}`}
          subtitle={`${achievementCompletion}% complete`}
        />
        <StatCard
          icon={Flame}
          iconColor="text-[var(--error)]"
          label="Best Streak"
          value={`${stats.longestLoginStreak}`}
          subtitle="days login streak"
        />
      </div>

      {/* Activity Stats */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">
          Activity Overview
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ActivityStat
            icon={Camera}
            label="Galleries"
            value={stats.totalGalleries}
          />
          <ActivityStat
            icon={Target}
            label="Deliveries"
            value={stats.totalDeliveries}
          />
          <ActivityStat
            icon={Users}
            label="Clients"
            value={stats.totalClients}
          />
          <ActivityStat
            icon={Calendar}
            label="Bookings"
            value={stats.totalBookings}
          />
          <ActivityStat
            icon={DollarSign}
            label="Payments"
            value={stats.totalPayments}
          />
        </div>
      </section>

      {/* Streak Section */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">
          Streak Statistics
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <StreakStatCard
            type="Login"
            current={stats.currentLoginStreak}
            longest={stats.longestLoginStreak}
            icon={Flame}
          />
          <StreakStatCard
            type="Delivery"
            current={stats.currentDeliveryStreak}
            longest={stats.longestDeliveryStreak}
            icon={Target}
          />
        </div>
      </section>

      {/* Achievement Breakdown */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">
          Achievements by Rarity
        </h3>
        <div className="grid gap-4 sm:grid-cols-5">
          <RarityProgress
            rarity="common"
            unlocked={stats.achievementsByRarity.common?.unlocked ?? 0}
            total={stats.achievementsByRarity.common?.total ?? 0}
          />
          <RarityProgress
            rarity="uncommon"
            unlocked={stats.achievementsByRarity.uncommon?.unlocked ?? 0}
            total={stats.achievementsByRarity.uncommon?.total ?? 0}
          />
          <RarityProgress
            rarity="rare"
            unlocked={stats.achievementsByRarity.rare?.unlocked ?? 0}
            total={stats.achievementsByRarity.rare?.total ?? 0}
          />
          <RarityProgress
            rarity="epic"
            unlocked={stats.achievementsByRarity.epic?.unlocked ?? 0}
            total={stats.achievementsByRarity.epic?.total ?? 0}
          />
          <RarityProgress
            rarity="legendary"
            unlocked={stats.achievementsByRarity.legendary?.unlocked ?? 0}
            total={stats.achievementsByRarity.legendary?.total ?? 0}
          />
        </div>
      </section>

      {/* Personal Records */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">
          Personal Records
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <RecordCard
            icon={DollarSign}
            label="Best Month Revenue"
            value={
              stats.bestMonthRevenueCents > 0
                ? formatCurrency(stats.bestMonthRevenueCents)
                : "—"
            }
          />
          <RecordCard
            icon={Clock}
            label="Fastest Delivery"
            value={
              stats.fastestDeliveryHours !== null
                ? stats.fastestDeliveryHours < 24
                  ? `${Math.round(stats.fastestDeliveryHours)}h`
                  : `${Math.round(stats.fastestDeliveryHours / 24)}d`
                : "—"
            }
          />
          <RecordCard
            icon={Target}
            label="Best Week Deliveries"
            value={stats.bestWeekDeliveries > 0 ? `${stats.bestWeekDeliveries}` : "—"}
          />
        </div>
      </section>

      {/* Daily Bonus Stats */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">
          Daily Bonus Progress
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {stats.totalBonusesClaimed}
            </p>
            <p className="text-sm text-[var(--foreground-muted)]">Total Bonuses Claimed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {stats.consecutiveBonusDays}/7
            </p>
            <p className="text-sm text-[var(--foreground-muted)]">Current Week Progress</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {stats.memberSinceDays}
            </p>
            <p className="text-sm text-[var(--foreground-muted)]">Days Since Joined</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  value: string;
  subtitle?: string;
}

function StatCard({ icon: Icon, iconColor, label, value, subtitle }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-xs text-[var(--foreground-muted)]">{label}</p>
          <p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
          {subtitle && (
            <p className="text-xs text-[var(--foreground-muted)]">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActivityStatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}

function ActivityStat({ icon: Icon, label, value }: ActivityStatProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--background-secondary)] p-3">
      <Icon className="h-5 w-5 text-[var(--foreground-muted)]" />
      <div>
        <p className="text-lg font-semibold text-[var(--foreground)]">
          {formatNumber(value)}
        </p>
        <p className="text-xs text-[var(--foreground-muted)]">{label}</p>
      </div>
    </div>
  );
}

interface StreakStatCardProps {
  type: string;
  current: number;
  longest: number;
  icon: React.ComponentType<{ className?: string }>;
}

function StreakStatCard({ type, current, longest, icon: Icon }: StreakStatCardProps) {
  const percentOfBest = longest > 0 ? Math.round((current / longest) * 100) : 0;

  return (
    <div className="rounded-lg bg-[var(--background-secondary)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-[var(--primary)]" />
        <span className="font-medium text-[var(--foreground)]">{type} Streak</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-[var(--foreground)]">{current}</span>
        <span className="text-sm text-[var(--foreground-muted)]">days</span>
      </div>
      <div className="flex items-start justify-between gap-4 flex-wrap text-xs mb-1">
        <span className="text-[var(--foreground-muted)]">Personal best: {longest}</span>
        <span className="text-[var(--foreground-secondary)]">{percentOfBest}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
          style={{ width: `${Math.min(percentOfBest, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface RarityProgressProps {
  rarity: AchievementRarity;
  unlocked: number;
  total: number;
}

const rarityColors: Record<AchievementRarity, string> = {
  common: "text-[var(--foreground-muted)] bg-[var(--foreground-muted)]",
  uncommon: "text-[var(--success)] bg-[var(--success)]",
  rare: "text-[var(--primary)] bg-[var(--primary)]",
  epic: "text-[var(--ai)] bg-[var(--ai)]",
  legendary: "text-[var(--warning)] bg-[var(--warning)]",
};

function RarityProgress({ rarity, unlocked, total }: RarityProgressProps) {
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  const [textColor, bgColor] = rarityColors[rarity].split(" ");

  return (
    <div className="text-center">
      <p className={cn("text-xs font-medium uppercase tracking-wide mb-1", textColor)}>
        {rarity}
      </p>
      <p className="text-lg font-bold text-[var(--foreground)]">
        {unlocked}/{total}
      </p>
      <div className="mt-2 h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", bgColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface RecordCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function RecordCard({ icon: Icon, label, value }: RecordCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--background-secondary)] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/15">
        <Icon className="h-5 w-5 text-[var(--warning)]" />
      </div>
      <div>
        <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
        <p className="text-lg font-bold text-[var(--foreground)]">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT TYPE
// ============================================================================

export type { GamificationStats };
