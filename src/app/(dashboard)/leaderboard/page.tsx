export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/clerk";
import { getLeaderboard, getGamificationState } from "@/lib/actions/gamification";
import { PageHeader } from "@/components/dashboard";
import { LevelBadge, StreakBadge } from "@/components/gamification";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function LeaderboardPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const [leaderboardResult, stateResult] = await Promise.all([
    getLeaderboard(),
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
  const myState = stateResult.success ? stateResult.data : null;

  // Find current user's rank
  const myRank = leaderboard.findIndex((entry) => entry.isCurrentUser) + 1;

  return (
    <div className="flex flex-col density-gap-section">
      <PageHeader
        title="Leaderboard"
        subtitle="See how you stack up against your team members."
      />

      {/* My Stats Card */}
      {myState && (
        <div className="rounded-xl border border-[var(--card-border)] bg-gradient-to-r from-[var(--primary)]/10 to-[var(--ai)]/10 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] text-xl font-bold text-white">
                #{myRank || "?"}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Your Ranking</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Level {myState.level} · {myState.totalXp.toLocaleString()} XP
                </p>
              </div>
            </div>
            <Link
              href="/achievements"
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
            >
              View Achievements
            </Link>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_100px_100px_120px] gap-4 border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">
          <div>Rank</div>
          <div>Member</div>
          <div className="text-center">Level</div>
          <div className="text-right">XP</div>
          <div className="text-right">Streaks</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--card-border)]">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <LeaderboardRow
                key={entry.userId}
                rank={index + 1}
                entry={entry}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-[var(--foreground-muted)]">No team members on the leaderboard yet.</p>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Start using the platform to appear here!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Note */}
      <p className="text-center text-xs text-[var(--foreground-muted)]">
        Only your rank and total XP are visible to others. Your detailed achievements are private.
      </p>
    </div>
  );
}

function LeaderboardRow({
  rank,
  entry,
}: {
  rank: number;
  entry: {
    userId: string;
    userName: string;
    userAvatar?: string | null;
    level: number;
    totalXp: number;
    rank: number;
    currentLoginStreak: number;
    currentDeliveryStreak: number;
    isCurrentUser: boolean;
  };
}) {
  // Rank badge styles
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 2:
        return "bg-gray-400/20 text-gray-300 border-gray-400/30";
      case 3:
        return "bg-orange-600/20 text-orange-400 border-orange-600/30";
      default:
        return "bg-[var(--background-secondary)] text-[var(--foreground-muted)]";
    }
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[60px_1fr_100px_100px_120px] gap-4 px-4 py-3 items-center transition-colors",
        entry.isCurrentUser
          ? "bg-[var(--primary)]/5 border-l-2 border-l-[var(--primary)]"
          : "hover:bg-[var(--background-hover)]"
      )}
    >
      {/* Rank */}
      <div>
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold",
            getRankStyle(rank)
          )}
        >
          {rank}
        </span>
      </div>

      {/* Member */}
      <div className="flex items-center gap-3 min-w-0">
        {entry.userAvatar ? (
          <img
            src={entry.userAvatar}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background-secondary)] text-sm font-medium text-[var(--foreground-muted)]">
            {entry.userName?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0">
          <p className={cn(
            "truncate font-medium",
            entry.isCurrentUser ? "text-[var(--primary)]" : "text-[var(--foreground)]"
          )}>
            {entry.userName || "Team Member"}
            {entry.isCurrentUser && (
              <span className="ml-2 text-xs text-[var(--foreground-muted)]">(You)</span>
            )}
          </p>
        </div>
      </div>

      {/* Level */}
      <div className="flex justify-center">
        <LevelBadge level={entry.level} size="md" />
      </div>

      {/* XP */}
      <div className="text-right">
        <span className="font-semibold text-[var(--foreground)]">
          {entry.totalXp.toLocaleString()}
        </span>
        <span className="ml-1 text-xs text-[var(--foreground-muted)]">XP</span>
      </div>

      {/* Streaks */}
      <div className="flex justify-end gap-2">
        <StreakBadge count={entry.currentLoginStreak} type="login" size="sm" />
        <StreakBadge count={entry.currentDeliveryStreak} type="delivery" size="sm" />
      </div>
    </div>
  );
}
