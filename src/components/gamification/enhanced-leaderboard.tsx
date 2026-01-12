"use client";

import { useState, useCallback, useTransition, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Medal,
  Flame,
  Target,
  Zap,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LevelBadge, StreakBadge } from "@/components/gamification";
import type {
  LeaderboardTimeFilter,
  LeaderboardRankBy,
  EnhancedLeaderboardEntry,
  LeaderboardFilters,
} from "@/lib/actions/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedLeaderboardProps {
  initialData: EnhancedLeaderboardEntry[];
  currentUserId?: string;
  onFetchData: (filters: LeaderboardFilters) => Promise<EnhancedLeaderboardEntry[]>;
  showFilters?: boolean;
  className?: string;
}

interface LeaderboardRowProps {
  entry: EnhancedLeaderboardEntry;
  rank: number;
  rankBy: LeaderboardRankBy;
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

const timeFilterOptions: { value: LeaderboardTimeFilter; label: string }[] = [
  { value: "all_time", label: "All Time" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
];

const rankByOptions: { value: LeaderboardRankBy; label: string; icon: typeof Trophy }[] = [
  { value: "xp", label: "XP", icon: Zap },
  { value: "achievements", label: "Achievements", icon: Trophy },
  { value: "login_streak", label: "Login Streak", icon: Flame },
  { value: "delivery_streak", label: "Delivery Streak", icon: Target },
  { value: "deliveries", label: "Deliveries", icon: Calendar },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EnhancedLeaderboard = memo(function EnhancedLeaderboard({
  initialData,
  onFetchData,
  showFilters = true,
  className,
}: EnhancedLeaderboardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<EnhancedLeaderboardEntry[]>(initialData);
  const [timeFilter, setTimeFilter] = useState<LeaderboardTimeFilter>("all_time");
  const [rankBy, setRankBy] = useState<LeaderboardRankBy>("xp");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showRankDropdown, setShowRankDropdown] = useState(false);

  const handleFilterChange = useCallback(
    (newTimeFilter?: LeaderboardTimeFilter, newRankBy?: LeaderboardRankBy) => {
      const nextTimeFilter = newTimeFilter ?? timeFilter;
      const nextRankBy = newRankBy ?? rankBy;

      if (newTimeFilter) setTimeFilter(newTimeFilter);
      if (newRankBy) setRankBy(newRankBy);

      startTransition(async () => {
        try {
          const result = await onFetchData({
            timeFilter: nextTimeFilter,
            rankBy: nextRankBy,
          });
          setData(result);
        } catch (error) {
          console.error("Failed to fetch leaderboard:", error);
        }
      });
    },
    [timeFilter, rankBy, onFetchData]
  );

  const selectedTimeOption = timeFilterOptions.find((o) => o.value === timeFilter);
  const selectedRankOption = rankByOptions.find((o) => o.value === rankBy);
  const RankIcon = selectedRankOption?.icon ?? Trophy;

  return (
    <div className={cn("enhanced-leaderboard", className)}>
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Time Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTimeDropdown(!showTimeDropdown);
                setShowRankDropdown(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                "border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--background-hover)]",
                showTimeDropdown && "border-[var(--primary)]"
              )}
              aria-expanded={showTimeDropdown}
              aria-haspopup="listbox"
            >
              <Calendar className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
              <span className="text-[var(--foreground)]">{selectedTimeOption?.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[var(--foreground-muted)] transition-transform",
                  showTimeDropdown && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence>
              {showTimeDropdown && (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg"
                  role="listbox"
                >
                  {timeFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleFilterChange(option.value, undefined);
                        setShowTimeDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm transition-colors",
                        option.value === timeFilter
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                      )}
                      role="option"
                      aria-selected={option.value === timeFilter}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rank By Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRankDropdown(!showRankDropdown);
                setShowTimeDropdown(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                "border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--background-hover)]",
                showRankDropdown && "border-[var(--primary)]"
              )}
              aria-expanded={showRankDropdown}
              aria-haspopup="listbox"
            >
              <RankIcon className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
              <span className="text-[var(--foreground)]">By {selectedRankOption?.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[var(--foreground-muted)] transition-transform",
                  showRankDropdown && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence>
              {showRankDropdown && (
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg"
                  role="listbox"
                >
                  {rankByOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleFilterChange(undefined, option.value);
                          setShowRankDropdown(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                          option.value === rankBy
                            ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                            : "text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                        )}
                        role="option"
                        aria-selected={option.value === rankBy}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {option.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Loading indicator */}
          {isPending && (
            <span className="text-xs text-[var(--foreground-muted)]">Updating...</span>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div
        className={cn(
          "rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto",
          isPending && "opacity-60"
        )}
      >
        {/* Header */}
        <div className="grid min-w-[600px] grid-cols-[60px_1fr_100px_100px_120px] gap-4 border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">
          <div>Rank</div>
          <div>Member</div>
          <div className="text-center">Level</div>
          <div className="text-right">
            {rankBy === "xp" && "XP"}
            {rankBy === "achievements" && "Achievements"}
            {rankBy === "login_streak" && "Login"}
            {rankBy === "delivery_streak" && "Delivery"}
            {rankBy === "deliveries" && "Deliveries"}
          </div>
          <div className="text-right">Streaks</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--card-border)]">
          {data.length > 0 ? (
            data.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                rank={entry.rank}
                rankBy={rankBy}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <Trophy className="mx-auto h-10 w-10 text-[var(--foreground-muted)] mb-3" />
              <p className="text-[var(--foreground-muted)]">No team members on the leaderboard yet.</p>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Start using the platform to appear here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// LEADERBOARD ROW
// ============================================================================

const LeaderboardRow = memo(function LeaderboardRow({
  entry,
  rank,
  rankBy,
}: LeaderboardRowProps) {
  const prefersReducedMotion = useReducedMotion();

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

  // Get rank icon for top 3
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4" aria-hidden="true" />;
      case 2:
        return <Medal className="h-4 w-4" aria-hidden="true" />;
      case 3:
        return <Medal className="h-4 w-4" aria-hidden="true" />;
      default:
        return null;
    }
  };

  // Get the main metric value based on rankBy
  const getMetricValue = () => {
    switch (rankBy) {
      case "achievements":
        return entry.achievementsCount;
      case "login_streak":
        return entry.currentLoginStreak;
      case "delivery_streak":
        return entry.currentDeliveryStreak;
      case "deliveries":
        return entry.deliveriesThisPeriod ?? 0;
      case "xp":
      default:
        return entry.totalXp;
    }
  };

  // Get metric label/suffix
  const getMetricSuffix = () => {
    switch (rankBy) {
      case "xp":
        return "XP";
      case "login_streak":
      case "delivery_streak":
        return "days";
      default:
        return "";
    }
  };

  // Change indicator
  const changeIcon = entry.changeFromPrevious
    ? entry.changeFromPrevious > 0
      ? <TrendingUp className="h-3 w-3 text-[var(--success)]" aria-label="Moved up" />
      : entry.changeFromPrevious < 0
        ? <TrendingDown className="h-3 w-3 text-[var(--error)]" aria-label="Moved down" />
        : <Minus className="h-3 w-3 text-[var(--foreground-muted)]" aria-label="No change" />
    : null;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
      className={cn(
        "grid min-w-[600px] grid-cols-[60px_1fr_100px_100px_120px] gap-4 px-4 py-3 items-center transition-colors",
        entry.isCurrentUser
          ? "bg-[var(--primary)]/5 border-l-2 border-l-[var(--primary)]"
          : "hover:bg-[var(--background-hover)]"
      )}
    >
      {/* Rank */}
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
            getRankStyle(rank)
          )}
        >
          {rank <= 3 ? getRankIcon(rank) : rank}
        </span>
        {changeIcon}
      </div>

      {/* Member */}
      <div className="flex items-center gap-3 min-w-0">
        {entry.userAvatar ? (
          <img
            src={entry.userAvatar}
            alt={`${entry.userName || "Team Member"}'s avatar`}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)] text-sm font-medium text-[var(--foreground-muted)]">
            {entry.userName?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-medium",
              entry.isCurrentUser ? "text-[var(--primary)]" : "text-[var(--foreground)]"
            )}
          >
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

      {/* Metric Value */}
      <div className="text-right">
        <span className="font-semibold text-[var(--foreground)]">
          {getMetricValue().toLocaleString()}
        </span>
        {getMetricSuffix() && (
          <span className="ml-1 text-xs text-[var(--foreground-muted)]">{getMetricSuffix()}</span>
        )}
      </div>

      {/* Streaks */}
      <div className="flex justify-end gap-2">
        <StreakBadge count={entry.currentLoginStreak} type="login" size="sm" />
        <StreakBadge count={entry.currentDeliveryStreak} type="delivery" size="sm" />
      </div>
    </motion.div>
  );
});

// ============================================================================
// COMPACT LEADERBOARD WIDGET
// ============================================================================

interface LeaderboardWidgetProps {
  data: EnhancedLeaderboardEntry[];
  myRank?: { rank: number; total: number; percentile: number };
  className?: string;
}

export const LeaderboardWidget = memo(function LeaderboardWidget({
  data,
  myRank,
  className,
}: LeaderboardWidgetProps) {
  const topEntries = data.slice(0, 5);

  return (
    <div
      className={cn(
        "leaderboard-widget rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
          <h3 className="font-semibold text-[var(--foreground)]">Leaderboard</h3>
        </div>
        {myRank && (
          <div className="flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2.5 py-1">
            <span className="text-xs font-medium text-[var(--primary)]">
              #{myRank.rank} of {myRank.total}
            </span>
          </div>
        )}
      </div>

      {/* Top Entries */}
      <div className="space-y-2">
        {topEntries.map((entry, index) => (
          <LeaderboardWidgetRow key={entry.userId} entry={entry} rank={index + 1} />
        ))}
      </div>

      {/* My Percentile */}
      {myRank && myRank.rank > 5 && (
        <div className="mt-3 pt-3 border-t border-[var(--card-border)] text-center">
          <p className="text-sm text-[var(--foreground-muted)]">
            You&apos;re in the top <span className="font-semibold text-[var(--primary)]">{myRank.percentile}%</span>
          </p>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// WIDGET ROW
// ============================================================================

interface LeaderboardWidgetRowProps {
  entry: EnhancedLeaderboardEntry;
  rank: number;
}

const LeaderboardWidgetRow = memo(function LeaderboardWidgetRow({
  entry,
  rank,
}: LeaderboardWidgetRowProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-300";
      case 3:
        return "text-orange-400";
      default:
        return "text-[var(--foreground-muted)]";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-2 transition-colors",
        entry.isCurrentUser
          ? "bg-[var(--primary)]/10"
          : "hover:bg-[var(--background-hover)]"
      )}
    >
      {/* Rank */}
      <span className={cn("w-5 text-center text-sm font-bold", getRankColor(rank))}>
        {rank}
      </span>

      {/* Avatar */}
      {entry.userAvatar ? (
        <img src={entry.userAvatar} alt={`${entry.userName || "Team Member"}'s avatar`} className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)] text-xs font-medium text-[var(--foreground-muted)]">
          {entry.userName?.[0]?.toUpperCase() || "?"}
        </div>
      )}

      {/* Name */}
      <span
        className={cn(
          "flex-1 truncate text-sm",
          entry.isCurrentUser ? "font-medium text-[var(--primary)]" : "text-[var(--foreground)]"
        )}
      >
        {entry.userName}
        {entry.isCurrentUser && " (You)"}
      </span>

      {/* XP */}
      <span className="text-xs font-medium text-[var(--foreground-muted)]">
        {entry.totalXp.toLocaleString()} XP
      </span>
    </div>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { EnhancedLeaderboardProps, LeaderboardWidgetProps };
