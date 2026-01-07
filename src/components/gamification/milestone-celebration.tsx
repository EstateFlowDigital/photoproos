"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Confetti, confettiPresets } from "@/components/ui/confetti";
import { X } from "lucide-react";
import type { Milestone } from "@/lib/gamification/milestones";

interface MilestoneCelebrationProps {
  milestone: Milestone | null;
  onDismiss: () => void;
  className?: string;
}

export function MilestoneCelebration({
  milestone,
  onDismiss,
  className,
}: MilestoneCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (milestone) {
      setShowConfetti(true);
    }
  }, [milestone]);

  const getConfettiConfig = () => {
    if (!milestone) return confettiPresets.standard;

    switch (milestone.celebrationType) {
      case "subtle":
        return confettiPresets.subtle;
      case "big":
        return confettiPresets.celebration;
      default:
        return confettiPresets.standard;
    }
  };

  if (!milestone) return null;

  return (
    <>
      <Confetti
        trigger={showConfetti}
        {...getConfettiConfig()}
        onComplete={() => setShowConfetti(false)}
      />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "milestone-celebration relative max-w-sm w-full mx-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center shadow-2xl",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute right-4 top-4 rounded-lg p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.1, damping: 12 }}
              className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-5xl mb-4"
            >
              {milestone.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-[var(--foreground)] mb-2"
            >
              {milestone.name}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[var(--foreground-muted)] mb-6"
            >
              {milestone.description}
            </motion.p>

            {/* Celebration badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <span>Milestone Achieved!</span>
            </motion.div>

            {/* Dismiss button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onDismiss}
              className="mt-6 w-full rounded-lg bg-[var(--background-secondary)] py-3 font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors"
            >
              Keep Going!
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// Hook for managing milestone celebrations
interface UseMilestoneCelebrationReturn {
  currentMilestone: Milestone | null;
  celebrate: (milestone: Milestone) => void;
  dismiss: () => void;
}

export function useMilestoneCelebration(): UseMilestoneCelebrationReturn {
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);

  const celebrate = useCallback((milestone: Milestone) => {
    setCurrentMilestone(milestone);
  }, []);

  const dismiss = useCallback(() => {
    setCurrentMilestone(null);
  }, []);

  return {
    currentMilestone,
    celebrate,
    dismiss,
  };
}

// Inline milestone toast for less intrusive celebrations
interface MilestoneToastProps {
  milestone: Milestone;
  onDismiss: () => void;
  className?: string;
}

export function MilestoneToast({ milestone, onDismiss, className }: MilestoneToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "milestone-toast fixed bottom-4 right-4 z-[9998] flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 shadow-xl",
        className
      )}
    >
      <span className="text-2xl">{milestone.icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-[var(--foreground)]">{milestone.name}</p>
        <p className="text-sm text-[var(--foreground-muted)]">{milestone.description}</p>
      </div>
      <button
        onClick={onDismiss}
        className="rounded-lg p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
