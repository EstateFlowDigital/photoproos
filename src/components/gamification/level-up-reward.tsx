"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, Gift, Zap, Shield, Crown, ChevronUp, X } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useCelebration, celebrations } from "@/hooks/use-celebration";
import { Confetti } from "@/components/ui/confetti";

// ============================================================================
// TYPES
// ============================================================================

export interface LevelUpReward {
  type: "xp_bonus" | "streak_freeze" | "skill_point" | "title" | "badge";
  name: string;
  description: string;
  value?: number; // For XP bonus or count
  icon?: string;
}

export interface LevelUpData {
  previousLevel: number;
  newLevel: number;
  rewards: LevelUpReward[];
  newTitle?: string;
  isMilestone: boolean; // Levels 10, 25, 50, 100, etc.
}

// ============================================================================
// LEVEL MILESTONES & REWARDS CONFIG
// ============================================================================

export const LEVEL_MILESTONES = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200];

export const LEVEL_TITLES: Record<number, string> = {
  1: "Newcomer",
  5: "Rising Star",
  10: "Professional",
  15: "Specialist",
  20: "Expert",
  25: "Master",
  30: "Grandmaster",
  40: "Elite",
  50: "Champion",
  75: "Legend",
  100: "Mythic",
  150: "Transcendent",
  200: "Immortal",
};

export function getLevelTitle(level: number): string {
  const milestones = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const milestone of milestones) {
    if (level >= milestone) {
      return LEVEL_TITLES[milestone];
    }
  }

  return "Newcomer";
}

export function getLevelRewards(newLevel: number): LevelUpReward[] {
  const rewards: LevelUpReward[] = [];

  // Check if it's a milestone level
  const isMilestone = LEVEL_MILESTONES.includes(newLevel);

  // Skill point for every level
  rewards.push({
    type: "skill_point",
    name: "Skill Point",
    description: "Unlock new perks in the skill tree",
    value: 1,
  });

  // Streak freeze every 10 levels
  if (newLevel % 10 === 0) {
    rewards.push({
      type: "streak_freeze",
      name: "Streak Freeze",
      description: "Protect your streaks from breaking",
      value: 1,
    });
  }

  // Bonus XP at milestones
  if (isMilestone) {
    rewards.push({
      type: "xp_bonus",
      name: "Milestone Bonus",
      description: `Bonus XP for reaching level ${newLevel}`,
      value: newLevel * 10,
    });
  }

  // Title at certain levels
  if (LEVEL_TITLES[newLevel]) {
    rewards.push({
      type: "title",
      name: "New Title",
      description: `You've earned the title "${LEVEL_TITLES[newLevel]}"`,
    });
  }

  return rewards;
}

// ============================================================================
// LEVEL UP MODAL COMPONENT
// ============================================================================

interface LevelUpModalProps {
  data: LevelUpData;
  isOpen: boolean;
  onClose: () => void;
}

export function LevelUpModal({ data, isOpen, onClose }: LevelUpModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const { celebrate, confettiProps } = useCelebration();

  // Trigger celebration when modal opens
  useEffect(() => {
    if (isOpen && !prefersReducedMotion) {
      if (data.isMilestone) {
        celebrate(celebrations.big());
      } else {
        celebrate(celebrations.milestone());
      }
    }
  }, [isOpen, prefersReducedMotion, data.isMilestone, celebrate]);

  const overlayVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const modalVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {!prefersReducedMotion && <Confetti {...confettiProps} />}

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
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-up-title"
          >
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] px-6 py-8 text-center">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute right-3 top-3 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Level badge */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", damping: 15, stiffness: 200, delay: 0.2 }
                  }
                  className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-4"
                >
                  <span className="text-4xl font-bold text-white">{data.newLevel}</span>
                </motion.div>

                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 text-white/80">
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">LEVEL UP!</span>
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h2 id="level-up-title" className="mt-2 text-2xl font-bold text-white">
                    {data.isMilestone ? "Milestone Reached!" : "Congratulations!"}
                  </h2>
                  {data.newTitle && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5">
                      <Crown className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
                      <span className="text-sm font-medium text-white">{data.newTitle}</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Rewards */}
              {data.rewards.length > 0 && (
                <div className="px-6 py-5">
                  <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                    You earned:
                  </h3>
                  <div className="space-y-3">
                    {data.rewards.map((reward, index) => (
                      <RewardItem key={index} reward={reward} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-[var(--card-border)] px-6 py-4">
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// REWARD ITEM COMPONENT
// ============================================================================

interface RewardItemProps {
  reward: LevelUpReward;
  index: number;
}

const rewardIcons: Record<LevelUpReward["type"], typeof Star> = {
  xp_bonus: Zap,
  streak_freeze: Shield,
  skill_point: Star,
  title: Crown,
  badge: Gift,
};

const rewardColors: Record<LevelUpReward["type"], string> = {
  xp_bonus: "text-[var(--warning)] bg-[var(--warning)]/15",
  streak_freeze: "text-[var(--ai)] bg-[var(--ai)]/15",
  skill_point: "text-[var(--success)] bg-[var(--success)]/15",
  title: "text-[var(--primary)] bg-[var(--primary)]/15",
  badge: "text-[var(--foreground)] bg-[var(--background-secondary)]",
};

function RewardItem({ reward, index }: RewardItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = rewardIcons[reward.type];
  const colorClass = rewardColors[reward.type];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { delay: 0.4 + index * 0.1 }
      }
      className="flex items-center gap-3 rounded-xl bg-[var(--background-secondary)] p-3"
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--foreground)]">{reward.name}</p>
          {reward.value && (
            <span className="text-xs font-semibold text-[var(--primary)]">
              +{reward.value}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">{reward.description}</p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// HOOK FOR MANAGING LEVEL UP MODALS
// ============================================================================

export function useLevelUpRewards() {
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showLevelUp = useCallback((previousLevel: number, newLevel: number) => {
    const rewards = getLevelRewards(newLevel);
    const newTitle = LEVEL_TITLES[newLevel];
    const isMilestone = LEVEL_MILESTONES.includes(newLevel);

    setLevelUpData({
      previousLevel,
      newLevel,
      rewards,
      newTitle: newTitle || undefined,
      isMilestone,
    });
    setIsOpen(true);
  }, []);

  const closeLevelUp = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation
    setTimeout(() => setLevelUpData(null), 300);
  }, []);

  return {
    levelUpData,
    isLevelUpOpen: isOpen,
    showLevelUp,
    closeLevelUp,
  };
}

// ============================================================================
// COMPACT LEVEL UP TOAST
// ============================================================================

interface LevelUpToastProps {
  level: number;
  onClose: () => void;
}

export function LevelUpToast({ level, onClose }: LevelUpToastProps) {
  const prefersReducedMotion = useReducedMotion();
  const title = getLevelTitle(level);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", damping: 25, stiffness: 300 }}
      className="level-up-toast relative flex items-center gap-4 rounded-xl border border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--ai)]/10 p-4 shadow-lg backdrop-blur-sm"
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)]">
        <span className="text-xl font-bold text-white">{level}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">Level {level}!</p>
        <p className="text-xs text-[var(--foreground-muted)]">{title}</p>
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)] transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
