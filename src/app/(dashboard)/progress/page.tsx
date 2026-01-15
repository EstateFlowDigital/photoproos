import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress | PhotoProOS",
  description: "Track your business growth and achievements.",
};

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/clerk";
import { getGamificationState, getAllAchievements } from "@/lib/actions/gamification";
import { PageHeader } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import {
  Flame,
  Trophy,
  ChevronRight,
  Calendar,
  Zap,
  Star,
  TrendingUp,
  Sparkles,
  Award,
  Target,
} from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/gamification/achievements";
import type { AchievementCategory } from "@prisma/client";

export default async function ProgressPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [stateResult, achievementsResult] = await Promise.all([
    getGamificationState(),
    getAllAchievements(),
  ]);

  if (!stateResult.success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error)]/10 mb-4">
          <Zap className="h-8 w-8 text-[var(--error)]" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Unable to load progress</h2>
        <p className="mt-2 text-foreground-muted">Please try again later.</p>
      </div>
    );
  }

  const state = stateResult.data;
  const achievements = achievementsResult.success ? achievementsResult.data : [];

  // Use the xpProgress from the state (properly calculated)
  const levelProgress = state.xpProgress.percent;
  const xpCurrent = state.xpProgress.current;
  const xpRequired = state.xpProgress.required;

  // Group achievements by category and get recent unlocks
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const recentUnlocks = unlockedAchievements
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 4);

  // Group by category for summary
  const categorySummary = achievements.reduce(
    (acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) {
        acc[category] = { total: 0, unlocked: 0 };
      }
      acc[category].total++;
      if (achievement.unlocked) {
        acc[category].unlocked++;
      }
      return acc;
    },
    {} as Record<AchievementCategory, { total: number; unlocked: number }>
  );

  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = achievements.length;
  const completionPercent = totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0;

  // Calculate streak status
  const hasActiveStreak = state.currentLoginStreak > 0;
  const isOnFire = state.currentLoginStreak >= 7;
  const streakEmoji = isOnFire ? "🔥" : hasActiveStreak ? "✨" : "💤";

  return (
    <div className="flex flex-col gap-8" data-element="progress-page">
      {/* Hero Section with Level */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card)] to-[var(--ai)]/10">
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[var(--primary)]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[var(--ai)]/20 blur-3xl" />

        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Level Display */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {/* Animated ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] animate-pulse opacity-30 blur-md" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] shadow-lg shadow-[var(--primary)]/25">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--card)]">
                    <span className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] bg-clip-text text-transparent">
                      {state.level}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Your Level</p>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">{state.levelTitle}</h1>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  {state.totalXp.toLocaleString()} total XP earned
                </p>
              </div>
            </div>

            {/* Progress to Next Level */}
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Progress to Level {state.level + 1}
                </span>
                <span className="text-sm font-bold text-[var(--primary)]">{levelProgress}%</span>
              </div>
              <div className="relative h-4 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_100%] animate-shimmer"
                  style={{ width: `${levelProgress}%` }}
                />
                {/* Glow effect on progress bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] blur-sm opacity-50"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-2">
                {xpCurrent.toLocaleString()} / {xpRequired.toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Streak Card */}
        <div className={cn(
          "relative overflow-hidden rounded-xl border p-6 transition-all",
          isOnFire
            ? "border-[var(--error)]/50 bg-gradient-to-br from-[var(--error)]/10 to-orange-500/5"
            : "border-[var(--card-border)] bg-[var(--card)]"
        )}>
          {isOnFire && (
            <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-[var(--error)]/20 blur-2xl" />
          )}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  isOnFire ? "bg-[var(--error)]/20" : "bg-[var(--error)]/10"
                )}>
                  <Flame className={cn(
                    "h-6 w-6",
                    isOnFire ? "text-[var(--error)] animate-pulse" : "text-[var(--error)]"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">Active Streak</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-[var(--foreground)]">{state.currentLoginStreak}</span>
                    <span className="text-lg text-[var(--foreground-muted)]">days</span>
                    <span className="text-xl">{streakEmoji}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-[var(--foreground-muted)]" />
              <span className="text-[var(--foreground-muted)]">
                Best: <span className="font-semibold text-[var(--foreground)]">{state.longestLoginStreak} days</span>
              </span>
            </div>
          </div>
        </div>

        {/* Milestones Card */}
        <div className="relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--warning)]/10">
                <Trophy className="h-6 w-6 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Milestones</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[var(--foreground)]">{totalUnlocked}</span>
                  <span className="text-lg text-[var(--foreground-muted)]">/ {totalAchievements}</span>
                </div>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--background-secondary)]">
              <span className={cn(
                "text-lg font-bold",
                completionPercent === 100 ? "text-[var(--success)]" : "text-[var(--foreground)]"
              )}>
                {completionPercent}%
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                completionPercent === 100
                  ? "bg-[var(--success)]"
                  : "bg-gradient-to-r from-[var(--warning)] to-[var(--success)]"
              )}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Delivery Stats Card */}
        <div className="relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--success)]/10">
              <Target className="h-6 w-6 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Delivery Streak</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--foreground)]">{state.currentDeliveryStreak}</span>
                <span className="text-lg text-[var(--foreground-muted)]">days</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-[var(--foreground-muted)]" />
            <span className="text-[var(--foreground-muted)]">
              Best: <span className="font-semibold text-[var(--foreground)]">{state.longestDeliveryStreak} days</span>
            </span>
          </div>
        </div>
      </div>

      {/* Business Stats */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-xl font-bold text-[var(--foreground)]">Your Journey</h2>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Galleries"
            value={state.stats.totalGalleries}
            icon="📸"
            colorClass="text-[var(--primary)]"
          />
          <StatCard
            label="Deliveries"
            value={state.stats.totalDeliveries}
            icon="📦"
            colorClass="text-[var(--success)]"
          />
          <StatCard
            label="Clients"
            value={state.stats.totalClients}
            icon="👥"
            colorClass="text-[var(--ai)]"
          />
          <StatCard
            label="Bookings"
            value={state.stats.totalBookings}
            icon="📅"
            colorClass="text-[var(--warning)]"
          />
          <StatCard
            label="Payments"
            value={state.stats.totalPayments}
            icon="💳"
            colorClass="text-[var(--success)]"
          />
          <StatCard
            label="Revenue"
            value={`$${(state.stats.totalRevenueCents / 100).toLocaleString()}`}
            icon="💰"
            colorClass="text-[var(--success)]"
          />
        </div>
      </section>

      {/* Year in Review Banner */}
      <Link
        href="/progress/year-in-review"
        className="group relative overflow-hidden rounded-2xl border border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--ai)]/10 to-[var(--primary)]/10 p-6 transition-all hover:border-[var(--primary)]/50 hover:shadow-lg hover:shadow-[var(--primary)]/10"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 via-[var(--ai)]/10 to-[var(--primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] animate-pulse opacity-30 blur-md" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-[var(--ai)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ai)]">Annual Review</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                {new Date().getFullYear()} Year in Review
              </h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                Discover your top accomplishments, stats, and highlights
              </p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-[var(--foreground-muted)] transition-transform group-hover:translate-x-2 group-hover:text-[var(--primary)]" />
        </div>
      </Link>

      {/* Recent Milestones */}
      {recentUnlocks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-[var(--warning)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Recent Milestones</h2>
            </div>
            <Link
              href="/progress/milestones"
              className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentUnlocks.map((achievement, index) => (
              <div
                key={achievement.id}
                className="group relative overflow-hidden rounded-xl border border-[var(--success)]/30 bg-gradient-to-br from-[var(--success)]/5 to-transparent p-5 transition-all hover:border-[var(--success)]/50 hover:shadow-lg hover:shadow-[var(--success)]/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -top-8 -right-8 h-16 w-16 rounded-full bg-[var(--success)]/10 blur-xl" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)] text-3xl shadow-sm">
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--foreground)] truncate">{achievement.name}</h3>
                    <p className="text-xs text-[var(--success)] font-medium mt-1">
                      Unlocked {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Milestone Categories */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="h-5 w-5 text-[var(--warning)]" />
          <h2 className="text-xl font-bold text-[var(--foreground)]">Milestone Categories</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(categorySummary)
            .sort(([, a], [, b]) => (b.unlocked / b.total) - (a.unlocked / a.total))
            .map(([category, stats]) => {
              const icon = CATEGORY_ICONS[category as AchievementCategory] || "🏆";
              const label = CATEGORY_LABELS[category as AchievementCategory] || category;
              const progress = Math.round((stats.unlocked / stats.total) * 100);
              const isComplete = progress === 100;

              return (
                <Link
                  key={category}
                  href={`/progress/milestones?category=${category}`}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-lg",
                    isComplete
                      ? "border-[var(--success)]/30 bg-gradient-to-br from-[var(--success)]/5 to-transparent hover:border-[var(--success)]/50"
                      : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--primary)]/30"
                  )}
                >
                  {isComplete && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xl">✅</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl text-3xl transition-transform group-hover:scale-110",
                      isComplete ? "bg-[var(--success)]/10" : "bg-[var(--background-secondary)]"
                    )}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--foreground)]">{label}</h3>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {stats.unlocked} of {stats.total} unlocked
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--foreground-muted)]">Progress</span>
                      <span className={cn(
                        "font-semibold",
                        isComplete ? "text-[var(--success)]" : "text-[var(--foreground)]"
                      )}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isComplete
                            ? "bg-[var(--success)]"
                            : "bg-gradient-to-r from-[var(--primary)] to-[var(--ai)]"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: string | number;
  icon: string;
  colorClass: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--primary)]/30 hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">{label}</p>
          <p className={cn("text-xl font-bold truncate", colorClass)}>{value}</p>
        </div>
      </div>
    </div>
  );
}
