"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { claimDailyBonus } from "@/lib/actions/gamification";
import type { DailyBonusState } from "@/lib/actions/gamification";
import { DAILY_BONUS_XP } from "@/lib/gamification/constants";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Gift, Sparkles, Check, Star, AlertCircle } from "lucide-react";

interface DailyBonusCardProps {
  initialState: DailyBonusState;
  onClaim?: (xpAwarded: number, leveledUp: boolean) => void;
  className?: string;
}

export function DailyBonusCard({ initialState, onClaim, className }: DailyBonusCardProps) {
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();
  const [justClaimed, setJustClaimed] = useState(false);
  const [claimedXp, setClaimedXp] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Track timeout IDs for cleanup
  const claimAnimationTimeout = useRef<NodeJS.Timeout | null>(null);
  const errorTimeout = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (claimAnimationTimeout.current) clearTimeout(claimAnimationTimeout.current);
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, []);

  const handleClaim = useCallback(() => {
    if (!state.canClaim || isPending) return;

    setError(null);
    // Clear any existing error timeout
    if (errorTimeout.current) clearTimeout(errorTimeout.current);

    startTransition(async () => {
      try {
        const result = await claimDailyBonus();
        if (result.success) {
          setClaimedXp(result.data.xpAwarded);
          setJustClaimed(true);
          setState((prev) => ({
            ...prev,
            canClaim: false,
            currentDay: result.data.dayNumber,
            weekProgress: prev.weekProgress.map((_, i) => i < result.data.dayNumber),
          }));
          onClaim?.(result.data.xpAwarded, result.data.leveledUp);

          // Reset animation after delay (with cleanup)
          if (claimAnimationTimeout.current) clearTimeout(claimAnimationTimeout.current);
          claimAnimationTimeout.current = setTimeout(() => setJustClaimed(false), 3000);
        } else {
          setError(result.error || "Failed to claim bonus");
          if (errorTimeout.current) clearTimeout(errorTimeout.current);
          errorTimeout.current = setTimeout(() => setError(null), 5000);
        }
      } catch {
        setError("Failed to claim bonus. Please try again.");
        if (errorTimeout.current) clearTimeout(errorTimeout.current);
        errorTimeout.current = setTimeout(() => setError(null), 5000);
      }
    });
  }, [state.canClaim, isPending, onClaim]);

  return (
    <div className={cn("daily-bonus-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--reward-gradient)" }}>
            <Gift className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Daily Bonus</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              {state.totalClaimed} bonuses claimed
            </p>
          </div>
        </div>
        {state.canClaim && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-xs font-medium text-[var(--success)]"
            aria-live="polite"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" aria-hidden="true" />
            Available
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-3 py-2 text-sm text-[var(--error)]">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Week Progress - scrollable on mobile */}
      <nav aria-label="Daily bonus week progress" className="mb-4 -mx-1 px-1 overflow-x-auto">
        <ol className="flex items-center justify-between gap-2 min-w-[320px] sm:min-w-0" role="list">
          {DAILY_BONUS_XP.map((xp, index) => {
            const dayNum = index + 1;
            const isClaimed = state.weekProgress[index];
            const isToday = !isClaimed && state.canClaim && index === state.currentDay - 1;
            const isFuture = !isClaimed && !isToday;
            const isDay7 = dayNum === 7;

            const statusText = isClaimed ? "Claimed" : isToday ? "Today - Available" : "Upcoming";

            return (
              <li
                key={dayNum}
                className={cn(
                  "daily-bonus-day relative flex flex-col items-center gap-1 flex-1",
                )}
                aria-label={`Day ${dayNum}: ${xp} XP - ${statusText}`}
              >
                {/* Day Circle */}
                <motion.div
                  className={cn(
                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                    isClaimed && "bg-[var(--success)] text-white",
                    isToday && "text-white ring-2 ring-[var(--reward-ring)]",
                    isFuture && "bg-[var(--background-secondary)] text-[var(--foreground-muted)]",
                    isDay7 && !isClaimed && "ring-2 ring-[var(--ai)]/30"
                  )}
                  style={isToday ? { background: "var(--reward-gradient)" } : undefined}
                  animate={isToday && !prefersReducedMotion ? { scale: [1, 1.05, 1] } : {}}
                  transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 2 }}
                  aria-hidden="true"
                >
                  {isClaimed ? (
                    <Check className="h-4 w-4" />
                  ) : isDay7 ? (
                    <Star className="h-4 w-4" />
                  ) : (
                    dayNum
                  )}
                  {isDay7 && !isClaimed && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-3 w-3 text-[var(--ai)]" />
                    </div>
                  )}
                </motion.div>

                {/* XP Label */}
                <span className={cn(
                  "text-[10px] font-medium",
                  isClaimed ? "text-[var(--success)]" : isToday ? "text-[var(--reward-text)]" : "text-[var(--foreground-muted)]"
                )} aria-hidden="true">
                  +{xp}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Claim Button */}
      <AnimatePresence mode="wait">
        {justClaimed ? (
          <motion.div
            key="claimed"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--success)]/15 py-3 text-[var(--success)]"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold">+{claimedXp} XP Claimed!</span>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleClaim}
            disabled={!state.canClaim || isPending}
            aria-label={
              isPending
                ? "Claiming daily bonus..."
                : state.canClaim
                ? `Claim daily bonus for ${state.nextBonusXp} XP`
                : "Daily bonus already claimed, come back tomorrow"
            }
            className={cn(
              "w-full rounded-lg py-3 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--reward)] focus:ring-offset-2 focus:ring-offset-[var(--card)]",
              state.canClaim
                ? "text-white hover:opacity-90 active:scale-[0.98]"
                : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] cursor-not-allowed"
            )}
            style={state.canClaim ? { background: "var(--reward-gradient)" } : undefined}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                Claiming...
              </span>
            ) : state.canClaim ? (
              <span className="flex items-center justify-center gap-2">
                <Gift className="h-4 w-4" aria-hidden="true" />
                Claim +{state.nextBonusXp} XP
              </span>
            ) : (
              "Come back tomorrow!"
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for dashboard widget
interface DailyBonusBadgeProps {
  canClaim: boolean;
  nextXp: number;
  onClick?: () => void;
  className?: string;
}

export function DailyBonusBadge({ canClaim, nextXp, onClick, className }: DailyBonusBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!canClaim) return null;

  return (
    <motion.button
      onClick={onClick}
      aria-label={`Claim daily bonus for ${nextXp} XP`}
      className={cn(
        "daily-bonus-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-[var(--reward-shadow)] hover:shadow-[var(--reward-shadow)] transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--reward)] focus:ring-offset-2",
        className
      )}
      style={{ background: "var(--reward-gradient)" }}
      animate={prefersReducedMotion ? {} : { scale: [1, 1.02, 1] }}
      transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 2 }}
    >
      <Gift className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Claim +{nextXp} XP</span>
    </motion.button>
  );
}
