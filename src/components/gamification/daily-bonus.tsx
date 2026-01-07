"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { claimDailyBonus, DAILY_BONUS_XP } from "@/lib/actions/gamification";
import type { DailyBonusState } from "@/lib/actions/gamification";
import { Gift, Sparkles, Check, Star } from "lucide-react";

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

  const handleClaim = () => {
    if (!state.canClaim || isPending) return;

    startTransition(async () => {
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

        // Reset animation after delay
        setTimeout(() => setJustClaimed(false), 3000);
      }
    });
  };

  return (
    <div className={cn("daily-bonus-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
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
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            Available
          </span>
        )}
      </div>

      {/* Week Progress */}
      <div className="flex items-center justify-between gap-1 mb-4">
        {DAILY_BONUS_XP.map((xp, index) => {
          const dayNum = index + 1;
          const isClaimed = state.weekProgress[index];
          const isToday = !isClaimed && state.canClaim && index === state.currentDay - 1;
          const isFuture = !isClaimed && !isToday;
          const isDay7 = dayNum === 7;

          return (
            <div
              key={dayNum}
              className={cn(
                "daily-bonus-day relative flex flex-col items-center gap-1 flex-1",
              )}
            >
              {/* Day Circle */}
              <motion.div
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all",
                  isClaimed && "bg-[var(--success)] text-white",
                  isToday && "bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-2 ring-amber-500/50",
                  isFuture && "bg-[var(--background-secondary)] text-[var(--foreground-muted)]",
                  isDay7 && !isClaimed && "ring-2 ring-[var(--ai)]/30"
                )}
                animate={isToday ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
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
                isClaimed ? "text-[var(--success)]" : isToday ? "text-amber-500" : "text-[var(--foreground-muted)]"
              )}>
                +{xp}
              </span>
            </div>
          );
        })}
      </div>

      {/* Claim Button */}
      <AnimatePresence mode="wait">
        {justClaimed ? (
          <motion.div
            key="claimed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--success)]/15 py-3 text-[var(--success)]"
          >
            <Sparkles className="h-4 w-4" />
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
            className={cn(
              "w-full rounded-lg py-3 font-semibold transition-all",
              state.canClaim
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 active:scale-[0.98]"
                : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] cursor-not-allowed"
            )}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Claiming...
              </span>
            ) : state.canClaim ? (
              <span className="flex items-center justify-center gap-2">
                <Gift className="h-4 w-4" />
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
  if (!canClaim) return null;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "daily-bonus-badge inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow",
        className
      )}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <Gift className="h-3.5 w-3.5" />
      <span>Claim +{nextXp} XP</span>
    </motion.button>
  );
}
