export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/clerk";
import { getSkillTreeState, getGamificationState } from "@/lib/actions/gamification";
import { PageHeader } from "@/components/dashboard";
import { SkillTree, LevelProgress } from "@/components/gamification";
import { ArrowLeft } from "lucide-react";

export default async function SkillsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [skillTreeResult, stateResult] = await Promise.all([
    getSkillTreeState(),
    getGamificationState(),
  ]);

  if (!skillTreeResult.success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load skill trees</h2>
        <p className="mt-2 text-foreground-muted">Please try again later.</p>
      </div>
    );
  }

  const skillTreeState = skillTreeResult.data;
  const gamificationState = stateResult.success ? stateResult.data : null;

  return (
    <div className="flex flex-col density-gap-section" data-element="skills-page">
      {/* Back link */}
      <Link
        href="/achievements"
        className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Achievements
      </Link>

      <PageHeader
        title="Skill Trees"
        subtitle="Spend skill points to unlock perks and bonuses. Earn 1 skill point per level."
      />

      {/* Level info */}
      {gamificationState && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Your Level</h3>
              <div className="mt-2">
                <LevelProgress
                  level={gamificationState.level}
                  totalXp={gamificationState.totalXp}
                  size="lg"
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--foreground-muted)]">Total Skill Points</div>
              <div className="text-3xl font-bold text-[var(--foreground)]">
                {skillTreeState.totalSkillPoints}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">
                {skillTreeState.spentSkillPoints} spent, {skillTreeState.availableSkillPoints} available
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Tree Component */}
      <SkillTree initialState={skillTreeState} />
    </div>
  );
}
