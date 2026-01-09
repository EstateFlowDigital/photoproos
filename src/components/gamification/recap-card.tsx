"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Trophy,
  Flame,
  Target,
  Camera,
  Zap,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  X,
  Gift,
  Sparkles,
} from "lucide-react";
import { AchievementBadge } from "./achievement-badge";
import type { RecapSummary, RecapPeriod } from "@/lib/actions/gamification";

// ============================================================================
// TYPES
// ============================================================================

interface RecapCardProps {
  summary: RecapSummary;
  onClose?: () => void;
  className?: string;
}

interface RecapModalProps {
  summary: RecapSummary;
  isOpen: boolean;
  onClose: () => void;
}

interface RecapWidgetProps {
  hasWeeklyRecap: boolean;
  hasMonthlyRecap: boolean;
  onViewRecap: (period: RecapPeriod) => void;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = new Date(start).toLocaleDateString("en-US", options);
  const endStr = new Date(end).toLocaleDateString("en-US", options);
  return `${startStr} - ${endStr}`;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

// ============================================================================
// RECAP CARD COMPONENT
// ============================================================================

export const RecapCard = memo(function RecapCard({
  summary,
  onClose,
  className,
}: RecapCardProps) {
  const periodLabel = summary.period === "week" ? "Weekly" : "Monthly";

  return (
    <div
      className={cn(
        "recap-card rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] px-5 py-4">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <Calendar className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Your {periodLabel} Recap
            </h3>
            <p className="text-sm text-white/80">
              {formatDateRange(summary.startDate, summary.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 p-5 border-b border-[var(--card-border)]">
        <StatBlock
          icon={Zap}
          label="XP Earned"
          value={formatNumber(summary.xpEarned)}
          change={summary.xpChange}
          iconColor="text-[var(--warning)]"
        />
        <StatBlock
          icon={Trophy}
          label="Achievements"
          value={`${summary.achievementsUnlocked}`}
          iconColor="text-[var(--primary)]"
        />
        <StatBlock
          icon={Camera}
          label="Galleries"
          value={`${summary.galleriesCreated}`}
          iconColor="text-[var(--ai)]"
        />
        <StatBlock
          icon={Target}
          label="Deliveries"
          value={`${summary.deliveriesCompleted}`}
          iconColor="text-[var(--success)]"
        />
      </div>

      {/* Achievement Highlight */}
      {summary.achievementHighlight && (
        <div className="p-5 border-b border-[var(--card-border)]">
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide mb-3">
            Top Achievement
          </p>
          <div className="flex items-center gap-4 rounded-lg bg-[var(--background-secondary)] p-3">
            <AchievementBadge
              achievement={{
                slug: "highlight",
                name: summary.achievementHighlight.name,
                description: summary.achievementHighlight.description,
                icon: summary.achievementHighlight.icon,
                category: "general",
                rarity: summary.achievementHighlight.rarity,
                xpReward: 0,
                trigger: { type: "manual" as const },
              }}
              isUnlocked={true}
              size="sm"
              showName={false}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--foreground)] truncate">
                {summary.achievementHighlight.name}
              </p>
              <p className="text-xs text-[var(--foreground-muted)] truncate">
                {summary.achievementHighlight.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Level Progress */}
      {summary.levelsGained > 0 && (
        <div className="p-5 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-[var(--success)]/10 to-[var(--success)]/5 p-4">
            <Sparkles className="h-6 w-6 text-[var(--success)]" aria-hidden="true" />
            <div>
              <p className="font-medium text-[var(--foreground)]">
                Leveled Up {summary.levelsGained} time{summary.levelsGained !== 1 ? "s" : ""}!
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Level {summary.levelStart} → Level {summary.levelEnd}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Streaks */}
      <div className="p-5 border-b border-[var(--card-border)]">
        <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide mb-3">
          Streaks
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Flame
              className={cn(
                "h-5 w-5",
                summary.loginStreakMaintained ? "text-[var(--error)]" : "text-[var(--foreground-muted)]"
              )}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Login</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {summary.longestLoginStreakThisPeriod} days best
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target
              className={cn(
                "h-5 w-5",
                summary.deliveryStreakMaintained ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]"
              )}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Delivery</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {summary.longestDeliveryStreakThisPeriod} days best
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="p-5 bg-[var(--background-secondary)]">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={summary.message}>
            {summary.emoji}
          </span>
          <p className="text-sm font-medium text-[var(--foreground)]">{summary.message}</p>
        </div>
        {summary.activityChange !== 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
            {summary.activityChange > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-[var(--success)]" aria-hidden="true" />
                <span className="text-[var(--success)]">+{summary.activityChange}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-[var(--error)]" aria-hidden="true" />
                <span className="text-[var(--error)]">{summary.activityChange}%</span>
              </>
            )}
            <span>vs previous {summary.period}</span>
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// STAT BLOCK
// ============================================================================

interface StatBlockProps {
  icon: typeof Zap;
  label: string;
  value: string;
  change?: number;
  iconColor: string;
}

const StatBlock = memo(function StatBlock({
  icon: Icon,
  label,
  value,
  change,
  iconColor,
}: StatBlockProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--background-secondary)] p-3">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--card)]", iconColor)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-lg font-bold text-[var(--foreground)]">{value}</p>
        <div className="flex items-center gap-1">
          <p className="text-xs text-[var(--foreground-muted)]">{label}</p>
          {change !== undefined && change !== 0 && (
            <span
              className={cn(
                "text-xs font-medium",
                change > 0 ? "text-[var(--success)]" : "text-[var(--error)]"
              )}
            >
              {change > 0 ? "+" : ""}{change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// RECAP MODAL
// ============================================================================

export const RecapModal = memo(function RecapModal({
  summary,
  isOpen,
  onClose,
}: RecapModalProps) {
  const prefersReducedMotion = useReducedMotion();

  const overlayVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const modalVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={overlayVariants.initial}
            animate={overlayVariants.animate}
            exit={overlayVariants.exit}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={modalVariants.initial}
            animate={modalVariants.animate}
            exit={modalVariants.exit}
            transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recap-title"
          >
            <RecapCard summary={summary} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ============================================================================
// RECAP WIDGET (for dashboard)
// ============================================================================

export const RecapWidget = memo(function RecapWidget({
  hasWeeklyRecap,
  hasMonthlyRecap,
  onViewRecap,
  className,
}: RecapWidgetProps) {
  if (!hasWeeklyRecap && !hasMonthlyRecap) {
    return null;
  }

  return (
    <div
      className={cn(
        "recap-widget rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Gift className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
        <h3 className="font-semibold text-[var(--foreground)]">Your Recaps</h3>
      </div>
      <div className="space-y-2">
        {hasWeeklyRecap && (
          <button
            onClick={() => onViewRecap("week")}
            className="flex items-center justify-between w-full rounded-lg bg-[var(--background-secondary)] p-3 hover:bg-[var(--background-hover)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                Weekly Recap
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
          </button>
        )}
        {hasMonthlyRecap && (
          <button
            onClick={() => onViewRecap("month")}
            className="flex items-center justify-between w-full rounded-lg bg-[var(--background-secondary)] p-3 hover:bg-[var(--background-hover)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                Monthly Recap
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// HOOK FOR MANAGING RECAPS
// ============================================================================

export function useRecaps() {
  const [selectedPeriod, setSelectedPeriod] = useState<RecapPeriod | null>(null);
  const [summary, setSummary] = useState<RecapSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openRecap = useCallback(async (
    period: RecapPeriod,
    fetchSummary: (period: RecapPeriod) => Promise<RecapSummary | null>
  ) => {
    setIsLoading(true);
    setSelectedPeriod(period);
    try {
      const data = await fetchSummary(period);
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch recap:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeRecap = useCallback(() => {
    setSelectedPeriod(null);
    setSummary(null);
  }, []);

  return {
    selectedPeriod,
    summary,
    isLoading,
    isOpen: selectedPeriod !== null && summary !== null,
    openRecap,
    closeRecap,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { RecapCardProps, RecapModalProps, RecapWidgetProps };
