export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/clerk";
import { getQuestState, getGamificationState } from "@/lib/actions/gamification";
import { PageHeader } from "@/components/dashboard";
import { QuestCard, LevelProgress } from "@/components/gamification";
import { ArrowLeft, Trophy, Sparkles, Target } from "lucide-react";

export default async function QuestsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [questStateResult, stateResult] = await Promise.all([
    getQuestState(),
    getGamificationState(),
  ]);

  if (!questStateResult.success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load quests</h2>
        <p className="mt-2 text-foreground-muted">Please try again later.</p>
      </div>
    );
  }

  const questState = questStateResult.data;
  const gamificationState = stateResult.success ? stateResult.data : null;

  return (
    <div className="flex flex-col density-gap-section">
      {/* Back link */}
      <Link
        href="/achievements"
        className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Achievements
      </Link>

      <PageHeader
        title="Your Journey"
        subtitle="Complete quests to master the platform and earn XP rewards."
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Level Card */}
        {gamificationState && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Your Level</h3>
            <div className="mt-3">
              <LevelProgress
                level={gamificationState.level}
                totalXp={gamificationState.totalXp}
                size="lg"
              />
            </div>
          </div>
        )}

        {/* Progress Card */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Quest Progress</h3>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--foreground)]">
                {questState.completedQuestIds.length}
              </span>
              <span className="text-lg text-[var(--foreground-muted)]">
                / {questState.categories.reduce((sum, c) => sum + c.totalCount, 0)}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-secondary)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all duration-500"
                style={{ width: `${questState.overallProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {questState.overallProgress}% complete
            </p>
          </div>
        </div>

        {/* XP Earned Card */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Quest XP Earned</h3>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--ai)]">
                {questState.xpEarned.toLocaleString()}
              </span>
              <span className="text-lg text-[var(--foreground-muted)]">XP</span>
            </div>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              of {questState.totalXpAvailable.toLocaleString()} available
            </p>
          </div>
        </div>
      </div>

      {/* Active Quest Banner */}
      {questState.currentQuest && (
        <div className="rounded-xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--ai)]/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Current Quest</h2>
          </div>
          <QuestCard
            quest={{
              ...questState.currentQuest,
              status: "in_progress",
              objectiveProgress: questState.objectiveProgress,
            }}
          />
        </div>
      )}

      {/* Quest Categories */}
      <div className="space-y-8">
        {questState.categories.map((category) => (
          <section key={category.category}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    {category.name}
                  </h2>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: category.color }}>
                  {category.completedCount}/{category.totalCount}
                </span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--background-secondary)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(category.completedCount / category.totalCount) * 100}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.quests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} compact />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Completion Banner */}
      {questState.overallProgress === 100 && (
        <div className="rounded-xl border border-[var(--success)]/30 bg-gradient-to-br from-[var(--success)]/5 to-[var(--ai)]/5 p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto text-[var(--success)] mb-4" />
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Journey Complete!
          </h2>
          <p className="mt-2 text-[var(--foreground-muted)]">
            You've completed all quests! You earned {questState.xpEarned.toLocaleString()} XP on your journey.
          </p>
        </div>
      )}
    </div>
  );
}
