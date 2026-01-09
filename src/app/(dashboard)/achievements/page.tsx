export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/clerk";
import { getGamificationState, getAllAchievements, getPersonalBests } from "@/lib/actions/gamification";
import { PageHeader } from "@/components/dashboard";
import {
  AchievementBadge,
  RarityLabel,
  LevelProgress,
  StreakDisplay,
  XpDisplay,
} from "@/components/gamification";
import { cn } from "@/lib/utils";
import { RARITY_ORDER, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/gamification/achievements";
import { Calendar, ChevronRight, Sparkles } from "lucide-react";
import type { AchievementRarity, AchievementCategory } from "@prisma/client";

export default async function AchievementsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [stateResult, achievementsResult, personalBestsResult] = await Promise.all([
    getGamificationState(),
    getAllAchievements(),
    getPersonalBests(),
  ]);

  if (!stateResult.success || !achievementsResult.success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load achievements</h2>
        <p className="mt-2 text-foreground-muted">Please try again later.</p>
      </div>
    );
  }

  const state = stateResult.data;
  const achievements = achievementsResult.data;
  const personalBests = personalBestsResult.success ? personalBestsResult.data : null;

  // Group achievements by category
  const groupedAchievements = achievements.reduce(
    (acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(achievement);
      return acc;
    },
    {} as Record<AchievementCategory, typeof achievements>
  );

  // Sort categories by label
  const sortedCategories = Object.keys(groupedAchievements).sort((a, b) => {
    const labelA = CATEGORY_LABELS[a as AchievementCategory] || a;
    const labelB = CATEGORY_LABELS[b as AchievementCategory] || b;
    return labelA.localeCompare(labelB);
  }) as AchievementCategory[];

  // Calculate stats
  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;
  const percentComplete = Math.round((totalUnlocked / totalAchievements) * 100);

  return (
    <div className="flex flex-col density-gap-section" data-element="achievements-page">
      <PageHeader
        title="Achievements"
        subtitle="Track your progress and unlock achievements as you use the platform."
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Level Card */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Your Level</h3>
          <div className="mt-3">
            <LevelProgress
              level={state.level}
              totalXp={state.totalXp}
              size="lg"
            />
          </div>
        </div>

        {/* Streaks Card */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Active Streaks</h3>
          <div className="mt-3 flex flex-col gap-3">
            <StreakDisplay
              count={state.currentLoginStreak}
              type="login"
              longestStreak={state.longestLoginStreak}
              size="md"
            />
            <StreakDisplay
              count={state.currentDeliveryStreak}
              type="delivery"
              longestStreak={state.longestDeliveryStreak}
              size="md"
            />
          </div>
        </div>

        {/* Progress Card */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Achievement Progress</h3>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--foreground)]">{totalUnlocked}</span>
              <span className="text-lg text-[var(--foreground-muted)]">/ {totalAchievements}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-secondary)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {percentComplete}% complete
            </p>
          </div>
        </div>

        {/* Personal Bests Card (Compact) */}
        {personalBests && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Personal Records</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-xs text-[var(--foreground-muted)]">Best Month</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {personalBests.bestMonthRevenue.amountCents > 0
                    ? `$${Math.round(personalBests.bestMonthRevenue.amountCents / 100).toLocaleString()}`
                    : "—"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-xs text-[var(--foreground-muted)]">Fastest Delivery</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {personalBests.fastestDelivery.hours !== null
                    ? personalBests.fastestDelivery.hours < 24
                      ? `${Math.round(personalBests.fastestDelivery.hours)}h`
                      : `${Math.round(personalBests.fastestDelivery.hours / 24)}d`
                    : "—"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-xs text-[var(--foreground-muted)]">Best Week</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {personalBests.bestWeekDeliveries.count > 0
                    ? `${personalBests.bestWeekDeliveries.count} deliveries`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Banners */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Year in Review Banner */}
        <Link
          href="/achievements/year-in-review"
          className="group rounded-xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--ai)]/5 p-5 transition-all hover:border-[var(--card-border-hover)] hover:from-[var(--primary)]/10 hover:to-[var(--ai)]/10"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)]">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  {new Date().getFullYear()} Year in Review
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Your annual accomplishments
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)] transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Skill Trees Banner */}
        <Link
          href="/skills"
          className="group rounded-xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--warning)]/5 to-[var(--success)]/5 p-5 transition-all hover:border-[var(--card-border-hover)] hover:from-[var(--warning)]/10 hover:to-[var(--success)]/10"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--warning)] to-[var(--success)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  Skill Trees
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Unlock perks and bonuses
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)] transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Achievements by Category */}
      <div className="flex flex-col gap-8">
        {sortedCategories.map((category) => {
          const categoryAchievements = groupedAchievements[category];
          const icon = CATEGORY_ICONS[category] || "🏆";
          const label = CATEGORY_LABELS[category] || category;
          const unlockedInCategory = categoryAchievements.filter((a) => a.unlocked).length;

          // Sort achievements within category: unlocked first, then by rarity, then by order
          const sortedAchievements = [...categoryAchievements].sort((a, b) => {
            // Unlocked first
            if (a.unlocked !== b.unlocked) {
              return a.unlocked ? -1 : 1;
            }
            // Then by rarity (higher rarity first)
            const rarityDiff =
              RARITY_ORDER.indexOf(b.rarity as AchievementRarity) -
              RARITY_ORDER.indexOf(a.rarity as AchievementRarity);
            if (rarityDiff !== 0) return rarityDiff;
            // Then by order
            return (a.order || 0) - (b.order || 0);
          });

          return (
            <section key={category}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">{label}</h2>
                <span className="text-sm text-[var(--foreground-muted)]">
                  {unlockedInCategory} / {categoryAchievements.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AchievementCard({
  achievement,
}: {
  achievement: {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
    rarity: AchievementRarity;
    xpReward: number;
    unlocked: boolean;
    unlockedAt?: Date;
    progress?: number;
    isHidden: boolean;
    order: number;
    progressHint?: {
      current: number;
      target: number;
      percentComplete: number;
    };
  };
}) {
  // Hide details of hidden achievements that aren't unlocked
  const showDetails = !achievement.isHidden || achievement.unlocked;
  const showProgressHint = !achievement.unlocked && showDetails && achievement.progressHint;

  return (
    <div
      className={cn(
        "achievement-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all duration-200",
        achievement.unlocked
          ? "hover:border-[var(--card-border-hover)] hover:shadow-md"
          : "opacity-70"
      )}
    >
      <div className="flex items-start gap-4">
        <AchievementBadge
          icon={showDetails ? achievement.icon : "❓"}
          name={showDetails ? achievement.name : "Hidden Achievement"}
          rarity={achievement.rarity}
          isUnlocked={achievement.unlocked}
          size="lg"
          showGlow={achievement.unlocked}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--foreground)] truncate">
              {showDetails ? achievement.name : "???"}
            </h3>
            <RarityLabel rarity={achievement.rarity} />
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)] line-clamp-2">
            {showDetails ? achievement.description : "Keep playing to discover this achievement!"}
          </p>

          {/* Progress hint for locked achievements */}
          {showProgressHint && (
            <div className="mt-2">
              <div className="flex items-start justify-between gap-4 flex-wrap text-xs mb-1">
                <span className="text-[var(--foreground-muted)]">Progress</span>
                <span className="text-[var(--foreground-secondary)]">
                  {achievement.progressHint!.current.toLocaleString()} / {achievement.progressHint!.target.toLocaleString()}
                </span>
              </div>
              <div
                className="h-1.5 w-full rounded-full bg-[var(--background-secondary)] overflow-hidden"
                role="progressbar"
                aria-valuenow={achievement.progressHint!.percentComplete}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${achievement.progressHint!.percentComplete}% progress toward ${achievement.name}`}
              >
                <div
                  className="h-full rounded-full bg-[var(--foreground-muted)] transition-all duration-300"
                  style={{ width: `${achievement.progressHint!.percentComplete}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center gap-3">
            <XpDisplay xp={achievement.xpReward} size="sm" />
            {achievement.unlocked && achievement.unlockedAt && (
              <span className="text-xs text-[var(--foreground-muted)]">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            )}
            {showProgressHint && achievement.progressHint!.percentComplete >= 75 && (
              <span className="text-xs font-medium text-[var(--warning)]">
                Almost there!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
