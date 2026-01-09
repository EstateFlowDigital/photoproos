"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// GAMIFICATION WIDGET SKELETON
// ============================================================================

export function GamificationWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        className
      )}
      role="status"
      aria-label="Loading gamification data"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-1">
            <Skeleton width={80} height={16} />
            <Skeleton width={120} height={12} />
          </div>
        </div>
        <Skeleton width={60} height={24} className="rounded-full" />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Skeleton height={8} className="rounded-full" />
      </div>

      {/* Streaks */}
      <div className="flex gap-3 mb-4">
        <Skeleton width={80} height={36} className="rounded-lg" />
        <Skeleton width={80} height={36} className="rounded-lg" />
      </div>

      {/* Recent Achievements */}
      <div className="space-y-2">
        <Skeleton width={120} height={14} />
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="circular" width={32} height={32} delay={i * 50} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ACHIEVEMENT BADGE SKELETON
// ============================================================================

export function AchievementBadgeSkeleton({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeStyles = {
    sm: { container: 48, icon: 24 },
    md: { container: 64, icon: 32 },
    lg: { container: 80, icon: 40 },
  };

  const { container, icon } = sizeStyles[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Skeleton variant="circular" width={container} height={container} />
      <Skeleton width={icon + 20} height={12} />
    </div>
  );
}

// ============================================================================
// PERSONAL BESTS SKELETON
// ============================================================================

export function PersonalBestsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        className
      )}
      role="status"
      aria-label="Loading personal bests"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="space-y-1">
          <Skeleton width={100} height={16} />
          <Skeleton width={80} height={12} />
        </div>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg bg-[var(--background-secondary)] p-3"
          >
            <Skeleton variant="circular" width={36} height={36} delay={i * 50} />
            <div className="flex-1 space-y-1">
              <Skeleton width={80} height={12} />
              <Skeleton width={60} height={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// QUEST CARD SKELETON
// ============================================================================

export function QuestCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
      role="status"
      aria-label="Loading quest"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Skeleton width={40} height={40} className="rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={18} />
          <Skeleton width="80%" height={14} />
        </div>
        <Skeleton width={50} height={24} className="rounded-full" />
      </div>

      {/* Progress */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton height={8} className="flex-1 rounded-full" />
          <Skeleton width={30} height={14} />
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton variant="circular" width={20} height={20} delay={i * 50} />
              <Skeleton width="70%" height={14} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHALLENGE CARD SKELETON
// ============================================================================

export function ChallengeCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
      role="status"
      aria-label="Loading challenge"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={24} height={24} className="rounded" />
            <Skeleton width="50%" height={18} />
          </div>
          <Skeleton width="80%" height={14} />
        </div>
        <Skeleton width={50} height={24} className="rounded-full" />
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
          <Skeleton width={60} height={14} />
          <Skeleton width={40} height={14} />
        </div>
        <Skeleton height={8} className="rounded-full" />
      </div>

      {/* Footer */}
      <div className="mt-3">
        <Skeleton width={80} height={14} />
      </div>
    </div>
  );
}

// ============================================================================
// DAILY BONUS SKELETON
// ============================================================================

export function DailyBonusSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
      role="status"
      aria-label="Loading daily bonus"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="space-y-1">
            <Skeleton width={80} height={16} />
            <Skeleton width={100} height={12} />
          </div>
        </div>
      </div>

      {/* Week Progress */}
      <div className="flex items-center justify-between gap-1 mb-4">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton variant="circular" width={36} height={36} delay={i * 30} />
            <Skeleton width={20} height={10} />
          </div>
        ))}
      </div>

      {/* Claim Button */}
      <Skeleton height={44} className="rounded-lg" />
    </div>
  );
}

// ============================================================================
// SKILL TREE SKELETON
// ============================================================================

export function SkillTreeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        className
      )}
      role="status"
      aria-label="Loading skill tree"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="space-y-1">
          <Skeleton width={80} height={16} />
          <Skeleton width={120} height={12} />
        </div>
      </div>

      {/* Skill Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <Skeleton variant="circular" width={40} height={40} delay={i * 50} />
              <div className="flex-1 space-y-1">
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={12} />
              </div>
            </div>
            <Skeleton height={6} className="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LEADERBOARD SKELETON
// ============================================================================

export function LeaderboardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        className
      )}
      role="status"
      aria-label="Loading leaderboard"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton width={100} height={18} />
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg bg-[var(--background-secondary)] p-3"
          >
            <Skeleton width={24} height={24} className="rounded" delay={i * 50} />
            <Skeleton variant="circular" width={36} height={36} />
            <div className="flex-1 space-y-1">
              <Skeleton width="50%" height={14} />
              <Skeleton width="30%" height={12} />
            </div>
            <Skeleton width={50} height={20} className="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ACHIEVEMENTS PAGE SKELETON
// ============================================================================

export function AchievementsPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading achievements">
      {/* Stats Bar */}
      <div className="flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 text-center">
            <Skeleton width={40} height={24} className="mx-auto mb-1" />
            <Skeleton width={60} height={12} className="mx-auto" />
          </div>
        ))}
      </div>

      {/* Category Sections */}
      {[0, 1, 2].map((section) => (
        <div key={section} className="space-y-3">
          <Skeleton width={120} height={20} delay={section * 100} />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((badge) => (
              <AchievementBadgeSkeleton
                key={badge}
                size="md"
                className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)]"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// STREAK DISPLAY SKELETON
// ============================================================================

export function StreakDisplaySkeleton({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeStyles = {
    sm: { width: 60, height: 28 },
    md: { width: 80, height: 36 },
    lg: { width: 100, height: 44 },
  };

  return (
    <Skeleton
      width={sizeStyles[size].width}
      height={sizeStyles[size].height}
      className={cn("rounded-lg", className)}
    />
  );
}
