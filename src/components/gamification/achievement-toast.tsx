"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AchievementBadge, RarityLabel } from "./achievement-badge";
import { XpDisplay } from "./level-progress";
import { useCelebration, celebrations } from "@/hooks/use-celebration";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Confetti } from "@/components/ui/confetti";
import type { AchievementRarity } from "@prisma/client";

interface UnlockedAchievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
}

interface AchievementToastProps {
  achievements: UnlockedAchievement[];
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
}

export function AchievementToast({ achievements, onDismiss, onDismissAll }: AchievementToastProps) {
  const [visibleAchievements, setVisibleAchievements] = useState<UnlockedAchievement[]>([]);
  const { celebrate, confettiProps } = useCelebration();
  const prefersReducedMotion = useReducedMotion();

  // Track timeout IDs for cleanup
  const queueTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      queueTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Show achievements one at a time with delay
  useEffect(() => {
    if (achievements.length === 0) return;

    // Clear any existing timeouts
    queueTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    queueTimeouts.current = [];

    // Show first achievement immediately
    setVisibleAchievements([achievements[0]]);

    // Trigger celebration based on rarity (skip if reduced motion preferred)
    if (!prefersReducedMotion) {
      const rarity = achievements[0].rarity;
      if (rarity === "legendary" || rarity === "epic") {
        celebrate(celebrations.big());
      } else if (rarity === "rare") {
        celebrate(celebrations.milestone());
      } else {
        celebrate(celebrations.standard());
      }
    }

    // Queue remaining achievements (faster if reduced motion)
    const delay = prefersReducedMotion ? 500 : 1500;
    achievements.slice(1).forEach((achievement, index) => {
      const timeout = setTimeout(() => {
        setVisibleAchievements((prev) => [...prev, achievement]);
      }, (index + 1) * delay);
      queueTimeouts.current.push(timeout);
    });
  }, [achievements, celebrate, prefersReducedMotion]);

  const handleDismiss = useCallback(
    (id: string) => {
      setVisibleAchievements((prev) => prev.filter((a) => a.id !== id));
      onDismiss?.(id);

      // If all dismissed, trigger onDismissAll
      if (visibleAchievements.length === 1) {
        onDismissAll?.();
      }
    },
    [onDismiss, onDismissAll, visibleAchievements.length]
  );

  // Animation variants based on motion preferences
  const toastVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 50, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, x: 100, scale: 0.9 },
      };

  return (
    <>
      {!prefersReducedMotion && <Confetti {...confettiProps} />}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-3"
        role="region"
        aria-label="Achievement notifications"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {visibleAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={toastVariants.initial}
              animate={toastVariants.animate}
              exit={toastVariants.exit}
              transition={
                prefersReducedMotion
                  ? { duration: 0.15 }
                  : { type: "spring", damping: 25, stiffness: 300 }
              }
              className="achievement-toast-item"
            >
              <AchievementToastItem
                achievement={achievement}
                onDismiss={() => handleDismiss(achievement.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function AchievementToastItem({
  achievement,
  onDismiss,
}: {
  achievement: UnlockedAchievement;
  onDismiss: () => void;
}) {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-label={`Achievement unlocked: ${achievement.name}`}
      className={cn(
        "achievement-toast relative flex items-center gap-4 rounded-xl border bg-[var(--card)] p-4 shadow-lg",
        "border-[var(--card-border)] backdrop-blur-sm",
        "min-w-[320px] max-w-[400px]"
      )}
    >
      {/* Close button */}
      <button
        onClick={onDismiss}
        aria-label={`Dismiss ${achievement.name} notification`}
        className="absolute right-2 top-2 rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>

      {/* Achievement badge */}
      <AchievementBadge
        icon={achievement.icon}
        name={achievement.name}
        rarity={achievement.rarity}
        isUnlocked
        size="lg"
        showGlow
      />

      {/* Content */}
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
            Achievement Unlocked
          </span>
          <RarityLabel rarity={achievement.rarity} />
        </div>
        <h4 className="mt-1 font-semibold text-[var(--foreground)]">{achievement.name}</h4>
        <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">{achievement.description}</p>
        <div className="mt-2">
          <XpDisplay xp={achievement.xpReward} size="sm" />
        </div>
      </div>
    </div>
  );
}

// Hook for managing achievement notifications
export function useAchievementNotifications() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);

  const showAchievement = useCallback((achievement: UnlockedAchievement) => {
    setUnlockedAchievements((prev) => [...prev, achievement]);
  }, []);

  const dismissAchievement = useCallback((id: string) => {
    setUnlockedAchievements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setUnlockedAchievements([]);
  }, []);

  return {
    unlockedAchievements,
    showAchievement,
    dismissAchievement,
    dismissAll,
  };
}
