"use client";

import { useState, useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Shield, ShieldPlus, Snowflake, AlertCircle, Check } from "lucide-react";
import { purchaseStreakFreeze, type StreakFreezeState } from "@/lib/actions/gamification";
import { STREAK_FREEZE_CONFIG } from "@/lib/gamification/constants";

interface StreakFreezeDisplayProps {
  freezeState: StreakFreezeState;
  userXp: number;
  onPurchase?: (newState: { newFreezes: number; xpRemaining: number }) => void;
  className?: string;
  compact?: boolean;
}

export function StreakFreezeDisplay({
  freezeState,
  userXp,
  onPurchase,
  className,
  compact = false,
}: StreakFreezeDisplayProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canPurchase =
    userXp >= STREAK_FREEZE_CONFIG.xpCost &&
    freezeState.available < freezeState.maxFreezes;

  const handlePurchase = useCallback(() => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await purchaseStreakFreeze();
        if (result.success) {
          setSuccess(true);
          onPurchase?.(result.data);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          setError(result.error || "Failed to purchase");
          setTimeout(() => setError(null), 5000);
        }
      } catch {
        setError("Failed to purchase streak freeze");
        setTimeout(() => setError(null), 5000);
      }
    });
  }, [onPurchase]);

  if (compact) {
    return (
      <div
        className={cn(
          "streak-freeze-compact flex items-center gap-2",
          className
        )}
        aria-label={`${freezeState.available} of ${freezeState.maxFreezes} streak freezes available`}
      >
        <Snowflake className="h-4 w-4 text-[var(--ai)]" aria-hidden="true" />
        <span className="text-sm font-medium text-[var(--foreground)]">
          {freezeState.available}/{freezeState.maxFreezes}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "streak-freeze-display rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/15">
            <Shield className="h-5 w-5 text-[var(--ai)]" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--foreground)]">
              Streak Freezes
            </h4>
            <p className="text-xs text-[var(--foreground-muted)]">
              Protect your streak when you miss a day
            </p>
          </div>
        </div>

        {/* Freeze count */}
        <div
          className="flex items-center gap-1"
          aria-label={`${freezeState.available} of ${freezeState.maxFreezes} streak freezes available`}
        >
          {Array.from({ length: freezeState.maxFreezes }).map((_, i) => (
            <Snowflake
              key={i}
              className={cn(
                "h-5 w-5 transition-colors",
                i < freezeState.available
                  ? "text-[var(--ai)]"
                  : "text-[var(--background-secondary)]"
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-3 py-2 text-sm text-[var(--error)]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 px-3 py-2 text-sm text-[var(--success)]"
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Streak freeze purchased!</span>
        </div>
      )}

      {/* Info text */}
      <p className="mt-3 text-sm text-[var(--foreground-muted)]">
        {freezeState.available > 0 ? (
          <>
            Your streak will be protected for up to{" "}
            <strong className="text-[var(--foreground)]">
              {freezeState.available} missed day{freezeState.available !== 1 ? "s" : ""}
            </strong>
            .
          </>
        ) : (
          "You have no streak freezes. Purchase one or complete 7 consecutive daily bonuses to earn one."
        )}
      </p>

      {/* Purchase section */}
      {freezeState.available < freezeState.maxFreezes && (
        <div className="mt-4 flex items-start justify-between gap-4 flex-wrap rounded-lg bg-[var(--background-secondary)] p-3">
          <div className="flex items-center gap-2">
            <ShieldPlus
              className="h-5 w-5 text-[var(--foreground-muted)]"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Buy Streak Freeze
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">
                Cost: {STREAK_FREEZE_CONFIG.xpCost} XP
              </p>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={!canPurchase || isPending}
            aria-label={
              isPending
                ? "Purchasing streak freeze"
                : canPurchase
                ? `Purchase streak freeze for ${STREAK_FREEZE_CONFIG.xpCost} XP`
                : userXp < STREAK_FREEZE_CONFIG.xpCost
                ? `Not enough XP (need ${STREAK_FREEZE_CONFIG.xpCost}, have ${userXp})`
                : "Maximum streak freezes reached"
            }
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2",
              canPurchase && !isPending
                ? "bg-[var(--ai)] text-white hover:opacity-90 active:scale-[0.98]"
                : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] cursor-not-allowed"
            )}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
                Buying...
              </span>
            ) : (
              "Buy"
            )}
          </button>
        </div>
      )}

      {/* Freeze usage stats */}
      {freezeState.totalUsed > 0 && (
        <p className="mt-3 text-xs text-[var(--foreground-muted)]">
          You've used {freezeState.totalUsed} streak freeze
          {freezeState.totalUsed !== 1 ? "s" : ""} total
          {freezeState.lastUsedDate && (
            <>
              , last on{" "}
              {new Date(freezeState.lastUsedDate).toLocaleDateString()}
            </>
          )}
          .
        </p>
      )}
    </div>
  );
}

// Small indicator for showing freeze count in other contexts (e.g., streak display)
interface StreakFreezeIndicatorProps {
  count: number;
  maxCount?: number;
  className?: string;
}

export function StreakFreezeIndicator({
  count,
  maxCount = STREAK_FREEZE_CONFIG.maxFreezes,
  className,
}: StreakFreezeIndicatorProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "streak-freeze-indicator inline-flex items-center gap-1 rounded-full bg-[var(--ai)]/15 px-2 py-0.5",
        className
      )}
      aria-label={`${count} streak freeze${count !== 1 ? "s" : ""} available`}
      title={`${count} streak freeze${count !== 1 ? "s" : ""} available`}
    >
      <Snowflake className="h-3 w-3 text-[var(--ai)]" aria-hidden="true" />
      <span className="text-xs font-medium text-[var(--ai)]">
        {count}/{maxCount}
      </span>
    </div>
  );
}
