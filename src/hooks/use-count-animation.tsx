"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountAnimationOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  easing?: "linear" | "easeOut" | "easeInOut";
}

// Easing functions defined outside component to avoid recreation
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * Custom hook for animating number counting
 * Respects reduced motion preference
 */
export function useCountAnimation({
  start = 0,
  end,
  duration = 2000,
  decimals = 0,
  suffix = "",
  prefix = "",
  easing = "easeOut",
}: UseCountAnimationOptions) {
  const [count, setCount] = useState(start);
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const startAnimation = useCallback(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setCount(end);
      setIsComplete(true);
      return;
    }

    // Reset start time for new animation
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](progress);
      const currentCount = start + (end - start) * easedProgress;

      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setIsComplete(true);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  }, [start, end, duration, easing]);

  const reset = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    startTimeRef.current = undefined;
    setCount(start);
    setIsComplete(false);
  }, [start]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const formattedCount = `${prefix}${count.toFixed(decimals)}${suffix}`;

  return {
    count,
    formattedCount,
    isComplete,
    startAnimation,
    reset,
  };
}

/**
 * Component for animated counting numbers
 * Automatically starts animation when visible
 */
interface AnimatedCounterProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  isVisible?: boolean;
}

export function AnimatedCounter({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
  isVisible = true,
}: AnimatedCounterProps) {
  const { formattedCount, startAnimation, reset } = useCountAnimation({
    start,
    end,
    duration,
    decimals,
    suffix,
    prefix,
  });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isVisible && !hasStarted.current) {
      hasStarted.current = true;
      startAnimation();
    }
  }, [isVisible, startAnimation]);

  useEffect(() => {
    // Reset when visibility changes to allow re-animation
    if (!isVisible) {
      hasStarted.current = false;
      reset();
    }
  }, [isVisible, reset]);

  return <span className={className}>{formattedCount}</span>;
}
