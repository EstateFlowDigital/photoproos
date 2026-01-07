"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { XpDisplay } from "./level-progress";

interface ChallengeCardProps {
  id: string;
  name: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  endsAt: Date;
  completed: boolean;
  className?: string;
}

export function ChallengeCard({
  name,
  description,
  targetCount,
  currentCount,
  xpReward,
  endsAt,
  completed,
  className,
}: ChallengeCardProps) {
  const progressPercent = useMemo(
    () => Math.min((currentCount / targetCount) * 100, 100),
    [currentCount, targetCount]
  );
  const timeRemaining = useMemo(() => getTimeRemaining(endsAt), [endsAt]);

  return (
    <article
      className={cn(
        "challenge-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        completed && "border-[var(--success)]/30 bg-[var(--success)]/5",
        className
      )}
      aria-label={`Challenge: ${name}${completed ? " - Completed" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🎯</span>
            <h4 className="font-semibold text-[var(--foreground)]">{name}</h4>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
        </div>
        <XpDisplay xp={xpReward} size="sm" />
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--foreground-muted)]">Progress</span>
          <span className="font-medium text-[var(--foreground)]" aria-hidden="true">
            {currentCount} / {targetCount}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentCount}
          aria-valuemin={0}
          aria-valuemax={targetCount}
          aria-label={`Challenge progress: ${currentCount} of ${targetCount} (${Math.round(progressPercent)}%)${completed ? " - Completed" : ""}`}
          className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-secondary)]"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              completed
                ? "bg-[var(--success)]"
                : "bg-gradient-to-r from-[var(--primary)] to-[var(--ai)]"
            )}
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        {completed ? (
          <div
            role="status"
            aria-label="Challenge completed"
            className="flex items-center gap-1.5 text-sm text-[var(--success)]"
          >
            <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium">Completed!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)]">
            <ClockIcon className="h-4 w-4" aria-hidden="true" />
            <span aria-label={`Time remaining: ${timeRemaining}`}>{timeRemaining}</span>
          </div>
        )}
      </div>
    </article>
  );
}

// Challenge list for the dashboard widget
export function ChallengeList({
  challenges,
  className,
}: {
  challenges: ChallengeCardProps[];
  className?: string;
}) {
  if (challenges.length === 0) {
    return (
      <div className={cn("text-center py-6", className)} role="status">
        <p className="text-sm text-[var(--foreground-muted)]">No active challenges</p>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Check back next week for new challenges!
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Active challenges"
      className={cn("flex flex-col gap-3", className)}
    >
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} {...challenge} />
      ))}
    </section>
  );
}

// Helper function to format time remaining
function getTimeRemaining(endsAt: Date): string {
  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  if (hours > 0) {
    return `${hours}h left`;
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m left`;
}

// Icons
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
