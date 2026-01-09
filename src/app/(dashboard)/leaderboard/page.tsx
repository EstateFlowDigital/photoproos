export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/clerk";
import {
  getEnhancedLeaderboard,
  getMyRank,
  getGamificationState,
} from "@/lib/actions/gamification";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { LeaderboardClient } from "./leaderboard-client";

export default async function LeaderboardPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [leaderboardResult, myRankResult, stateResult] = await Promise.all([
    getEnhancedLeaderboard({ rankBy: "xp", timeFilter: "all_time" }),
    getMyRank("xp"),
    getGamificationState(),
  ]);

  if (!leaderboardResult.success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load leaderboard</h2>
        <p className="mt-2 text-foreground-muted">Please try again later.</p>
      </div>
    );
  }

  const leaderboard = leaderboardResult.data;
  const myRank = myRankResult.success ? myRankResult.data : null;
  const myState = stateResult.success ? stateResult.data : null;

  return (
    <div className="flex flex-col density-gap-section" data-element="leaderboard-page">
      <PageHeader
        title="Leaderboard"
        subtitle="See how you stack up against your team members."
      />

      {/* My Stats Card */}
      {myState && myRank && (
        <div className="rounded-xl border border-[var(--card-border)] bg-gradient-to-r from-[var(--primary)]/10 to-[var(--ai)]/10 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] text-xl font-bold text-white">
                #{myRank.rank}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Your Ranking</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Level {myState.level} · {myState.totalXp.toLocaleString()} XP · Top {myRank.percentile}%
                </p>
              </div>
            </div>
            <Link
              href="/achievements"
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
            >
              View Achievements
            </Link>
          </div>
        </div>
      )}

      {/* Enhanced Leaderboard with Filters */}
      <LeaderboardClient initialData={leaderboard} />

      {/* Privacy Note */}
      <p className="text-center text-xs text-[var(--foreground-muted)]">
        Only your rank and total XP are visible to others. Your detailed achievements are private.
      </p>
    </div>
  );
}
