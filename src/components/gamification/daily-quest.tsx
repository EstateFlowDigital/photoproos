"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Scroll,
  Upload,
  MessageSquare,
  Target,
  LogIn,
  Star,
  Check,
  Clock,
  Zap,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { DailyQuest } from "@/lib/actions/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface DailyQuestCardProps {
  quest: DailyQuest;
  onClaim?: () => void;
  className?: string;
}

interface DailyQuestListProps {
  quests: DailyQuest[];
  onClaim?: (questId: string) => void;
  className?: string;
}

interface DailyQuestWidgetProps {
  quests: DailyQuest[];
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const questIcons: Record<DailyQuest["type"], typeof Scroll> = {
  upload: Upload,
  message: MessageSquare,
  delivery: Target,
  login: LogIn,
  review: Star,
};

function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = new Date(expiresAt).getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ============================================================================
// DAILY QUEST CARD
// ============================================================================

export const DailyQuestCard = memo(function DailyQuestCard({
  quest,
  onClaim,
  className,
}: DailyQuestCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = questIcons[quest.type];
  const progress = Math.min((quest.currentProgress / quest.targetValue) * 100, 100);

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "daily-quest-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        quest.isCompleted && "opacity-75",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shrink-0",
            quest.isCompleted
              ? "bg-[var(--success)]/15 text-[var(--success)]"
              : "bg-[var(--primary)]/15 text-[var(--primary)]"
          )}
        >
          {quest.isCompleted ? (
            <Check className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Icon className="h-5 w-5" aria-hidden="true" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap gap-2">
            <h4 className="font-medium text-[var(--foreground)]">{quest.name}</h4>
            <span className="flex items-center gap-1 text-sm text-[var(--warning)]">
              <Zap className="h-3 w-3" aria-hidden="true" />
              +{quest.xpReward}
            </span>
          </div>
          <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
            {quest.description}
          </p>

          {/* Progress */}
          {!quest.isCompleted && (
            <div className="mt-3">
              <div className="flex items-start justify-between gap-4 flex-wrap text-xs mb-1">
                <span className="text-[var(--foreground-muted)]">
                  {quest.currentProgress} / {quest.targetValue}
                </span>
                <span className="flex items-center gap-1 text-[var(--foreground-muted)]">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatTimeRemaining(quest.expiresAt)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
                  className="h-full rounded-full bg-[var(--primary)]"
                />
              </div>
            </div>
          )}

          {/* Claim Button */}
          {quest.isCompleted && onClaim && (
            <button
              onClick={onClaim}
              className="mt-3 w-full rounded-lg bg-[var(--success)] py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Claim Reward
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// ============================================================================
// DAILY QUEST LIST
// ============================================================================

export const DailyQuestList = memo(function DailyQuestList({
  quests,
  onClaim,
  className,
}: DailyQuestListProps) {
  const completedCount = quests.filter((q) => q.isCompleted).length;
  const totalXp = quests.reduce((sum, q) => sum + q.xpReward, 0);

  return (
    <div className={cn("daily-quest-list", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Scroll className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <h3 className="font-semibold text-[var(--foreground)]">Daily Quests</h3>
        </div>
        <div className="text-sm text-[var(--foreground-muted)]">
          {completedCount}/{quests.length} completed · {totalXp} XP
        </div>
      </div>

      {/* Quests */}
      <div className="space-y-3">
        {quests.map((quest) => (
          <DailyQuestCard
            key={quest.id}
            quest={quest}
            onClaim={onClaim ? () => onClaim(quest.id) : undefined}
          />
        ))}
      </div>

      {quests.length === 0 && (
        <div className="text-center py-8">
          <Scroll className="mx-auto h-10 w-10 text-[var(--foreground-muted)] mb-3" />
          <p className="text-[var(--foreground-muted)]">No daily quests available.</p>
          <p className="text-sm text-[var(--foreground-muted)]">Check back tomorrow!</p>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// DAILY QUEST WIDGET
// ============================================================================

export const DailyQuestWidget = memo(function DailyQuestWidget({
  quests,
  className,
}: DailyQuestWidgetProps) {
  const completedCount = quests.filter((q) => q.isCompleted).length;
  const allCompleted = completedCount === quests.length && quests.length > 0;

  return (
    <div
      className={cn(
        "daily-quest-widget rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <Scroll className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <h3 className="font-semibold text-[var(--foreground)]">Daily Quests</h3>
        </div>
        <span
          className={cn(
            "text-sm font-medium",
            allCompleted ? "text-[var(--success)]" : "text-[var(--foreground-muted)]"
          )}
        >
          {completedCount}/{quests.length}
        </span>
      </div>

      {/* Progress Overview */}
      <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
          style={{ width: `${(completedCount / Math.max(quests.length, 1)) * 100}%` }}
        />
      </div>

      {/* Quest Summary */}
      <div className="space-y-2">
        {quests.slice(0, 3).map((quest) => {
          const Icon = questIcons[quest.type];
          return (
            <div
              key={quest.id}
              className="flex items-center gap-3 text-sm"
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded",
                  quest.isCompleted
                    ? "bg-[var(--success)]/15 text-[var(--success)]"
                    : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                )}
              >
                {quest.isCompleted ? (
                  <Check className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Icon className="h-3 w-3" aria-hidden="true" />
                )}
              </div>
              <span
                className={cn(
                  "flex-1 truncate",
                  quest.isCompleted
                    ? "text-[var(--foreground-muted)] line-through"
                    : "text-[var(--foreground)]"
                )}
              >
                {quest.name}
              </span>
              <span className="text-xs text-[var(--warning)]">+{quest.xpReward}</span>
            </div>
          );
        })}
      </div>

      {allCompleted && (
        <div className="mt-3 text-center text-sm text-[var(--success)]">
          All quests completed! Great job!
        </div>
      )}
    </div>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export type { DailyQuestCardProps, DailyQuestListProps, DailyQuestWidgetProps };
