"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Target,
  Camera,
  Zap,
  Trophy,
  Flame,
  Users,
  Clock,
  Crown,
  Medal,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type {
  TeamChallenge,
  TeamChallengeParticipant,
  TeamChallengeType,
} from "@/lib/actions/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface TeamChallengeCardProps {
  challenge: TeamChallenge;
  currentUserId?: string;
  className?: string;
}

interface TeamChallengeListProps {
  challenges: TeamChallenge[];
  currentUserId?: string;
  className?: string;
}

interface TeamChallengeWidgetProps {
  challenges: TeamChallenge[];
  currentUserId?: string;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const challengeIcons: Record<TeamChallengeType, typeof Target> = {
  total_deliveries: Target,
  total_galleries: Camera,
  total_xp: Zap,
  most_achievements: Trophy,
  longest_streak: Flame,
};

const challengeColors: Record<TeamChallengeType, string> = {
  total_deliveries: "text-[var(--success)] bg-[var(--success)]/15",
  total_galleries: "text-[var(--ai)] bg-[var(--ai)]/15",
  total_xp: "text-[var(--warning)] bg-[var(--warning)]/15",
  most_achievements: "text-[var(--primary)] bg-[var(--primary)]/15",
  longest_streak: "text-[var(--error)] bg-[var(--error)]/15",
};

function formatTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = new Date(endDate).getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m left`;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

// ============================================================================
// TEAM CHALLENGE CARD
// ============================================================================

export const TeamChallengeCard = memo(function TeamChallengeCard({
  challenge,
  currentUserId,
  className,
}: TeamChallengeCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = challengeIcons[challenge.type];
  const colorClass = challengeColors[challenge.type];

  const progressPercent = Math.min(
    (challenge.currentProgress / challenge.targetValue) * 100,
    100
  );

  const isCompleted = challenge.status === "completed";
  const isGoalReached = challenge.currentProgress >= challenge.targetValue;

  // Find current user in participants
  const myParticipation = currentUserId
    ? challenge.participants.find((p) => p.userId === currentUserId)
    : null;

  // Top 3 participants for competitive challenges
  const topParticipants = !challenge.isTeamGoal
    ? challenge.participants.slice(0, 3)
    : [];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className={cn(
        "team-challenge-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        isCompleted && "opacity-75",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap p-4 border-b border-[var(--card-border)]">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClass)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">{challenge.name}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">{challenge.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {challenge.isTeamGoal ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ai)]/10 px-2.5 py-1 text-xs font-medium text-[var(--ai)]">
              <Users className="h-3 w-3" aria-hidden="true" />
              Team
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning)]/10 px-2.5 py-1 text-xs font-medium text-[var(--warning)]">
              <Trophy className="h-3 w-3" aria-hidden="true" />
              Competitive
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="p-4">
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-[var(--foreground-muted)]">
              {challenge.isTeamGoal ? "Team Progress" : "Leader"}
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {formatNumber(challenge.currentProgress)} / {formatNumber(challenge.targetValue)}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                isGoalReached
                  ? "bg-[var(--success)]"
                  : "bg-gradient-to-r from-[var(--primary)] to-[var(--ai)]"
              )}
            />
          </div>
        </div>

        {/* Time remaining */}
        {challenge.status === "active" && (
          <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] mb-3">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{formatTimeRemaining(challenge.endDate)}</span>
          </div>
        )}

        {/* Reward */}
        <div className="flex items-center justify-between rounded-lg bg-[var(--background-secondary)] p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              {challenge.xpReward} XP Reward
            </span>
          </div>
          {isGoalReached && (
            <span className="text-xs font-medium text-[var(--success)]">Goal Reached!</span>
          )}
        </div>

        {/* My contribution for team challenges */}
        {challenge.isTeamGoal && myParticipation && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-[var(--foreground-muted)]">Your contribution</span>
            <span className="font-medium text-[var(--primary)]">
              {formatNumber(myParticipation.contribution)}
            </span>
          </div>
        )}

        {/* Top 3 for competitive challenges */}
        {!challenge.isTeamGoal && topParticipants.length > 0 && (
          <div className="mt-3 space-y-2">
            {topParticipants.map((participant, index) => (
              <ParticipantRow
                key={participant.userId}
                participant={participant}
                rank={index + 1}
                isCurrentUser={participant.userId === currentUserId}
              />
            ))}
          </div>
        )}

        {/* My rank for competitive (if not in top 3) */}
        {!challenge.isTeamGoal && myParticipation && myParticipation.rank && myParticipation.rank > 3 && (
          <div className="mt-2 pt-2 border-t border-[var(--card-border)]">
            <ParticipantRow
              participant={myParticipation}
              rank={myParticipation.rank}
              isCurrentUser={true}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
});

// ============================================================================
// PARTICIPANT ROW
// ============================================================================

interface ParticipantRowProps {
  participant: TeamChallengeParticipant;
  rank: number;
  isCurrentUser: boolean;
}

const ParticipantRow = memo(function ParticipantRow({
  participant,
  rank,
  isCurrentUser,
}: ParticipantRowProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-400" aria-hidden="true" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-300" aria-hidden="true" />;
      case 3:
        return <Medal className="h-4 w-4 text-orange-400" aria-hidden="true" />;
      default:
        return <span className="text-xs font-medium text-[var(--foreground-muted)]">#{rank}</span>;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-2",
        isCurrentUser ? "bg-[var(--primary)]/10" : "bg-[var(--background-secondary)]"
      )}
    >
      <div className="w-6 flex justify-center">{getRankIcon(rank)}</div>
      {participant.userAvatar ? (
        <img
          src={participant.userAvatar}
          alt=""
          className="h-6 w-6 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card)] text-xs font-medium text-[var(--foreground-muted)]">
          {participant.userName?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      <span
        className={cn(
          "flex-1 text-sm truncate",
          isCurrentUser ? "font-medium text-[var(--primary)]" : "text-[var(--foreground)]"
        )}
      >
        {participant.userName}
        {isCurrentUser && " (You)"}
      </span>
      <span className="text-sm font-medium text-[var(--foreground-muted)]">
        {formatNumber(participant.contribution)}
      </span>
    </div>
  );
});

// ============================================================================
// TEAM CHALLENGE LIST
// ============================================================================

export const TeamChallengeList = memo(function TeamChallengeList({
  challenges,
  currentUserId,
  className,
}: TeamChallengeListProps) {
  const activeChallenges = challenges.filter((c) => c.status === "active");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  return (
    <div className={cn("team-challenge-list space-y-6", className)}>
      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wide">
            Active Challenges
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeChallenges.map((challenge) => (
              <TeamChallengeCard
                key={challenge.id}
                challenge={challenge}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wide">
            Completed This Week
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {completedChallenges.map((challenge) => (
              <TeamChallengeCard
                key={challenge.id}
                challenge={challenge}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="mx-auto h-10 w-10 text-[var(--foreground-muted)] mb-3" />
          <p className="text-[var(--foreground-muted)]">No team challenges available.</p>
          <p className="text-sm text-[var(--foreground-muted)]">
            Check back next week for new challenges!
          </p>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// COMPACT WIDGET
// ============================================================================

export const TeamChallengeWidget = memo(function TeamChallengeWidget({
  challenges,
  currentUserId: _currentUserId,
  className,
}: TeamChallengeWidgetProps) {
  const activeChallenges = challenges.filter((c) => c.status === "active");

  if (activeChallenges.length === 0) {
    return null;
  }

  // Show first active challenge
  const challenge = activeChallenges[0];
  const Icon = challengeIcons[challenge.type];
  const colorClass = challengeColors[challenge.type];
  const progressPercent = Math.min(
    (challenge.currentProgress / challenge.targetValue) * 100,
    100
  );

  return (
    <div
      className={cn(
        "team-challenge-widget rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[var(--ai)]" aria-hidden="true" />
          <h3 className="font-semibold text-[var(--foreground)]">Team Challenge</h3>
        </div>
        <span className="text-xs text-[var(--foreground-muted)]">
          {activeChallenges.length} active
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colorClass)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)] truncate">
            {challenge.name}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">
            {formatTimeRemaining(challenge.endDate)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-[var(--foreground-muted)]">
          {formatNumber(challenge.currentProgress)} / {formatNumber(challenge.targetValue)}
        </span>
        <span className="text-[var(--warning)]">+{challenge.xpReward} XP</span>
      </div>
    </div>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { TeamChallengeCardProps, TeamChallengeListProps, TeamChallengeWidgetProps };
