import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Milestones | PhotoProOS",
  description: "Track business milestones and achievements.",
};

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/clerk";
import { getAllAchievements } from "@/lib/actions/gamification";
import { PageHeader } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ICONS, RARITY_ORDER } from "@/lib/gamification/achievements";
import type { AchievementCategory, AchievementRarity } from "@prisma/client";

export default async function MilestonesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const achievementsResult = await getAllAchievements();

  if (!achievementsResult.success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load milestones</h2>
        <p className="mt-2 text-foreground-muted">Please try again later.</p>
      </div>
    );
  }

  const achievements = achievementsResult.data;
  const filterCategory = searchParams.category;

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

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedAchievements)
    .filter((cat) => !filterCategory || cat === filterCategory)
    .sort((a, b) => {
      const labelA = CATEGORY_LABELS[a as AchievementCategory] || a;
      const labelB = CATEGORY_LABELS[b as AchievementCategory] || b;
      return labelA.localeCompare(labelB);
    }) as AchievementCategory[];

  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="flex flex-col gap-6" data-element="milestones-page">
      {/* Back link */}
      <Link
        href="/progress"
        className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Progress
      </Link>

      <PageHeader
        title={filterCategory ? CATEGORY_LABELS[filterCategory as AchievementCategory] || "Milestones" : "All Milestones"}
        subtitle={`${totalUnlocked} of ${totalAchievements} unlocked`}
      />

      {/* Category filter pills */}
      {!filterCategory && (
        <div className="flex flex-wrap gap-2">
          {sortedCategories.map((category) => {
            const icon = CATEGORY_ICONS[category] || "🏆";
            const label = CATEGORY_LABELS[category] || category;
            const count = groupedAchievements[category].filter((a) => a.unlocked).length;
            const total = groupedAchievements[category].length;

            return (
              <Link
                key={category}
                href={`/progress/milestones?category=${category}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm transition-colors hover:border-[var(--primary)]"
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span className="text-[var(--foreground-muted)]">{count}/{total}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Milestones by category */}
      <div className="space-y-8">
        {sortedCategories.map((category) => {
          const categoryAchievements = groupedAchievements[category];
          const icon = CATEGORY_ICONS[category] || "🏆";
          const label = CATEGORY_LABELS[category] || category;
          const unlockedInCategory = categoryAchievements.filter((a) => a.unlocked).length;

          // Sort: unlocked first, then by rarity, then by order
          const sortedAchievements = [...categoryAchievements].sort((a, b) => {
            if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
            const rarityDiff =
              RARITY_ORDER.indexOf(b.rarity as AchievementRarity) -
              RARITY_ORDER.indexOf(a.rarity as AchievementRarity);
            if (rarityDiff !== 0) return rarityDiff;
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sortedAchievements.map((achievement) => {
                  const showDetails = !achievement.isHidden || achievement.unlocked;

                  return (
                    <div
                      key={achievement.id}
                      className={cn(
                        "rounded-xl border bg-[var(--card)] p-4 transition-all",
                        achievement.unlocked
                          ? "border-[var(--success)]/30"
                          : "border-[var(--card-border)] opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-xl",
                          achievement.unlocked ? "bg-[var(--success)]/15" : "bg-[var(--background-secondary)]"
                        )}>
                          {showDetails ? achievement.icon : "❓"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[var(--foreground)] truncate">
                              {showDetails ? achievement.name : "???"}
                            </h3>
                            {achievement.unlocked ? (
                              <CheckCircle className="h-4 w-4 text-[var(--success)] shrink-0" />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-[var(--foreground-muted)] shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
                            {showDetails ? achievement.description : "Keep going to discover this milestone!"}
                          </p>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                          {!achievement.unlocked && showDetails && achievement.progressHint && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-[var(--foreground-muted)]">Progress</span>
                                <span className="text-[var(--foreground-secondary)]">
                                  {achievement.progressHint.current} / {achievement.progressHint.target}
                                </span>
                              </div>
                              <div className="h-1 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--foreground-muted)]"
                                  style={{ width: `${achievement.progressHint.percentComplete}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
