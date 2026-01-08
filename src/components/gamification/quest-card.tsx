"use client";

import { useState, useTransition, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { startQuest, abandonQuest } from "@/lib/actions/gamification";
import type { QuestWithStatus, Quest } from "@/lib/actions/gamification";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Lock, Check, Play, ChevronRight, Star, Sparkles, AlertCircle } from "lucide-react";

interface QuestCardProps {
  quest: QuestWithStatus;
  onQuestStart?: (quest: Quest) => void;
  onQuestAbandon?: () => void;
  compact?: boolean;
  className?: string;
}

export function QuestCard({
  quest,
  onQuestStart,
  onQuestAbandon,
  compact = false,
  className,
}: QuestCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showStoryline, setShowStoryline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Track timeout IDs for cleanup
  const errorTimeout = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, []);

  const handleStartQuest = useCallback(() => {
    setError(null);
    if (errorTimeout.current) clearTimeout(errorTimeout.current);

    startTransition(async () => {
      try {
        const result = await startQuest(quest.id);
        if (result.success) {
          onQuestStart?.(result.data.quest);
        } else {
          setError(result.error || "Failed to start quest");
          errorTimeout.current = setTimeout(() => setError(null), 5000);
        }
      } catch {
        setError("Failed to start quest. Please try again.");
        errorTimeout.current = setTimeout(() => setError(null), 5000);
      }
    });
  }, [quest.id, onQuestStart]);

  const handleAbandonQuest = useCallback(() => {
    if (!confirm("Abandon this quest? You'll lose your progress.")) return;

    setError(null);
    if (errorTimeout.current) clearTimeout(errorTimeout.current);

    startTransition(async () => {
      try {
        const result = await abandonQuest();
        if (result.success) {
          onQuestAbandon?.();
        } else {
          setError(result.error || "Failed to abandon quest");
          errorTimeout.current = setTimeout(() => setError(null), 5000);
        }
      } catch {
        setError("Failed to abandon quest. Please try again.");
        errorTimeout.current = setTimeout(() => setError(null), 5000);
      }
    });
  }, [onQuestAbandon]);

  // Calculate objective progress (memoized for performance)
  const objectivesCompleted = useMemo(() =>
    quest.status === "in_progress" && quest.objectiveProgress
      ? quest.objectives.filter(
          (obj) => (quest.objectiveProgress?.[obj.id] || 0) >= obj.targetValue
        ).length
      : quest.status === "completed"
      ? quest.objectives.length
      : 0,
    [quest.status, quest.objectiveProgress, quest.objectives]
  );

  const progressPercent = useMemo(() =>
    quest.objectives.length > 0
      ? Math.round((objectivesCompleted / quest.objectives.length) * 100)
      : 0,
    [objectivesCompleted, quest.objectives.length]
  );

  return (
    <motion.div
      className={cn(
        "quest-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all",
        quest.status === "completed" && "border-[var(--success)]/30 opacity-75",
        quest.status === "in_progress" && "border-[var(--primary)]/30 ring-1 ring-[var(--primary)]/20",
        quest.status === "locked" && "opacity-50",
        className
      )}
      layout
    >
      {/* Error Message */}
      {error && (
        <div role="alert" className="mb-3 flex items-center gap-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-3 py-2 text-sm text-[var(--error)]">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg",
            quest.status === "completed" && "bg-[var(--success)]/15",
            quest.status === "in_progress" && "bg-[var(--primary)]/15",
            quest.status === "available" && "bg-[var(--warning)]/15",
            quest.status === "locked" && "bg-[var(--background-secondary)]"
          )}
          aria-hidden="true"
        >
          {quest.status === "completed" ? (
            <Check className="h-5 w-5 text-[var(--success)]" />
          ) : quest.status === "locked" ? (
            <Lock className="h-4 w-4 text-[var(--foreground-muted)]" />
          ) : (
            quest.icon
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-semibold",
                quest.status === "locked"
                  ? "text-[var(--foreground-muted)]"
                  : "text-[var(--foreground)]"
              )}
            >
              {quest.name}
            </h3>
            <span className="rounded-full bg-[var(--ai)]/15 px-2 py-0.5 text-xs font-medium text-[var(--ai)]">
              +{quest.xpReward} XP
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)] line-clamp-2">
            {quest.description}
          </p>

          {/* Show storyline toggle */}
          {!compact && quest.status !== "locked" && (
            <button
              onClick={() => setShowStoryline(!showStoryline)}
              aria-expanded={showStoryline}
              aria-label={showStoryline ? `Hide story for ${quest.name}` : `Read story for ${quest.name}`}
              className="mt-2 text-xs text-[var(--primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 rounded"
            >
              {showStoryline ? "Hide story" : "Read story"}
            </button>
          )}
        </div>
      </div>

      {/* Storyline */}
      <AnimatePresence>
        {showStoryline && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-lg bg-[var(--background-secondary)] p-3 text-sm italic text-[var(--foreground-secondary)]">
              "{quest.storyline}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress for in_progress quests */}
      {quest.status === "in_progress" && (
        <div className="mt-4 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div
              role="progressbar"
              aria-valuenow={objectivesCompleted}
              aria-valuemin={0}
              aria-valuemax={quest.objectives.length}
              aria-label={`Quest progress: ${objectivesCompleted} of ${quest.objectives.length} objectives completed (${progressPercent}%)`}
              className="flex-1 h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden"
            >
              <motion.div
                className="h-full bg-[var(--primary)] rounded-full"
                initial={prefersReducedMotion ? { width: `${progressPercent}%` } : { width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
                aria-hidden="true"
              />
            </div>
            <span className="text-xs text-[var(--foreground-muted)]" aria-hidden="true">
              {objectivesCompleted}/{quest.objectives.length}
            </span>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            {quest.objectives.map((objective) => {
              const current = quest.objectiveProgress?.[objective.id] || 0;
              const isComplete = current >= objective.targetValue;

              return (
                <div
                  key={objective.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full",
                      isComplete
                        ? "bg-[var(--success)] text-white"
                        : "border border-[var(--card-border)]"
                    )}
                  >
                    {isComplete && <Check className="h-3 w-3" />}
                  </div>
                  <span
                    className={cn(
                      isComplete
                        ? "text-[var(--success)] line-through"
                        : "text-[var(--foreground-secondary)]"
                    )}
                  >
                    {objective.description}
                  </span>
                  {!isComplete && objective.targetValue > 1 && (
                    <span className="text-xs text-[var(--foreground-muted)]">
                      ({current}/{objective.targetValue})
                    </span>
                  )}
                  {!isComplete && objective.actionUrl && (
                    <Link
                      href={objective.actionUrl}
                      className="ml-auto text-xs text-[var(--primary)] hover:underline"
                    >
                      Go
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Abandon button */}
          <button
            onClick={handleAbandonQuest}
            disabled={isPending}
            aria-label={`Abandon quest: ${quest.name}`}
            className="text-xs text-[var(--error)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--error)] focus:ring-offset-2 rounded disabled:opacity-50"
          >
            {isPending ? "Abandoning..." : "Abandon Quest"}
          </button>
        </div>
      )}

      {/* Start button for available quests */}
      {quest.status === "available" && (
        <motion.button
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : undefined}
          onClick={handleStartQuest}
          disabled={isPending}
          aria-label={isPending ? `Starting quest: ${quest.name}` : `Start quest: ${quest.name} for ${quest.xpReward} XP`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              Starting...
            </span>
          ) : (
            <>
              <Play className="h-4 w-4" aria-hidden="true" />
              Start Quest
            </>
          )}
        </motion.button>
      )}

      {/* Completed badge */}
      {quest.status === "completed" && (
        <div
          role="status"
          aria-label={`Quest ${quest.name} completed`}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--success)]/15 py-2 text-sm font-medium text-[var(--success)]"
        >
          <Star className="h-4 w-4" aria-hidden="true" />
          Quest Complete!
        </div>
      )}
    </motion.div>
  );
}

// Active quest widget for dashboard
interface ActiveQuestWidgetProps {
  quest: Quest;
  objectiveProgress: Record<string, number>;
  className?: string;
}

export function ActiveQuestWidget({
  quest,
  objectiveProgress,
  className,
}: ActiveQuestWidgetProps) {
  const objectivesCompleted = useMemo(() =>
    quest.objectives.filter(
      (obj) => (objectiveProgress[obj.id] || 0) >= obj.targetValue
    ).length,
    [quest.objectives, objectiveProgress]
  );

  const progressPercent = useMemo(() =>
    Math.round((objectivesCompleted / quest.objectives.length) * 100),
    [objectivesCompleted, quest.objectives.length]
  );

  return (
    <article
      className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5", className)}
      aria-labelledby="active-quest-title"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <h3 id="active-quest-title" className="font-semibold text-[var(--foreground)]">Active Quest</h3>
        </div>
        <span className="text-xs text-[var(--ai)]" aria-label={`Reward: ${quest.xpReward} XP`}>+{quest.xpReward} XP</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl" aria-hidden="true">{quest.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--foreground)] truncate">
            {quest.name}
          </h4>
          <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
            {quest.description}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-valuenow={objectivesCompleted}
          aria-valuemin={0}
          aria-valuemax={quest.objectives.length}
          aria-label={`Active quest progress: ${objectivesCompleted} of ${quest.objectives.length} objectives completed (${progressPercent}%)`}
          className="flex-1 h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden"
        >
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="text-xs text-[var(--foreground-muted)]" aria-hidden="true">
          {objectivesCompleted}/{quest.objectives.length}
        </span>
      </div>

      <Link
        href="/quests"
        aria-label={`View quest: ${quest.name}`}
        className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-[var(--card-border)] py-2 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:border-[var(--card-border-hover)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
      >
        View Quest
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
