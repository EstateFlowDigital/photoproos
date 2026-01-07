"use client";

import { useState, useCallback, useRef } from "react";
import type { ComponentProps } from "react";
import type { Confetti } from "@/components/ui/confetti";

type ConfettiProps = ComponentProps<typeof Confetti>;

interface CelebrationConfig {
  particleCount?: number;
  duration?: number;
  colors?: string[];
  origin?: "center" | "top" | "bottom";
  spread?: number;
  gravity?: number;
}

interface UseCelebrationReturn {
  /** Current trigger state for the confetti component */
  trigger: boolean;
  /** Function to trigger a celebration */
  celebrate: (config?: CelebrationConfig) => void;
  /** Props to spread onto the Confetti component */
  confettiProps: Partial<ConfettiProps>;
  /** Whether a celebration is currently playing */
  isPlaying: boolean;
}

/**
 * Hook for managing confetti celebrations
 *
 * @example
 * ```tsx
 * function PaymentSuccess() {
 *   const { trigger, celebrate, confettiProps } = useCelebration();
 *
 *   useEffect(() => {
 *     if (paymentSuccessful) {
 *       celebrate({ particleCount: 60, colors: ["#22c55e", "#3b82f6"] });
 *     }
 *   }, [paymentSuccessful]);
 *
 *   return (
 *     <>
 *       <Confetti {...confettiProps} />
 *       <div>Payment successful!</div>
 *     </>
 *   );
 * }
 * ```
 */
export function useCelebration(): UseCelebrationReturn {
  const [trigger, setTrigger] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [config, setConfig] = useState<CelebrationConfig>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const celebrate = useCallback((newConfig?: CelebrationConfig) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset trigger to false first, then set to true
    setTrigger(false);
    setConfig(newConfig || {});
    setIsPlaying(true);

    // Use microtask to ensure state updates before retriggering
    queueMicrotask(() => {
      setTrigger(true);
    });

    // Set timeout to reset playing state
    const duration = newConfig?.duration || 3000;
    timeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      setTrigger(false);
    }, duration);
  }, []);

  const handleComplete = useCallback(() => {
    setIsPlaying(false);
    setTrigger(false);
  }, []);

  const confettiProps: Partial<ConfettiProps> = {
    trigger,
    onComplete: handleComplete,
    ...config,
  };

  return {
    trigger,
    celebrate,
    confettiProps,
    isPlaying,
  };
}

// Pre-configured celebration functions for common scenarios
export const celebrations = {
  /** Subtle celebration for small wins */
  subtle: (): CelebrationConfig => ({
    particleCount: 20,
    duration: 2000,
    gravity: 0.3,
  }),

  /** Standard celebration */
  standard: (): CelebrationConfig => ({
    particleCount: 50,
    duration: 3000,
    gravity: 0.5,
  }),

  /** Big celebration for major achievements */
  big: (): CelebrationConfig => ({
    particleCount: 100,
    duration: 4000,
    gravity: 0.6,
  }),

  /** Payment success celebration */
  payment: (): CelebrationConfig => ({
    particleCount: 60,
    duration: 3500,
    colors: ["#22c55e", "#3b82f6", "#eab308", "#8b5cf6"],
    origin: "center",
    gravity: 0.5,
  }),

  /** Gallery delivered celebration */
  delivery: (): CelebrationConfig => ({
    particleCount: 50,
    duration: 3000,
    colors: ["#3b82f6", "#8b5cf6", "#22c55e"],
    origin: "top",
    gravity: 0.4,
  }),

  /** Milestone reached celebration */
  milestone: (): CelebrationConfig => ({
    particleCount: 80,
    duration: 3500,
    colors: ["#eab308", "#f97316", "#ec4899", "#8b5cf6"],
    origin: "center",
    spread: 120,
    gravity: 0.5,
  }),
};
