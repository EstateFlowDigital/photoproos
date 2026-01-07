"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect user's prefers-reduced-motion preference
 * Returns true if the user prefers reduced motion
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * const animationConfig = prefersReducedMotion ? {} : { scale: [1, 1.05, 1] };
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns animation props that respect reduced motion preferences
 * Use this for Framer Motion components
 *
 * @example
 * const { animate, transition } = useMotionProps({
 *   animate: { scale: [1, 1.05, 1] },
 *   transition: { repeat: Infinity, duration: 2 }
 * });
 */
export function useMotionProps<T extends Record<string, unknown>>({
  animate,
  transition,
}: {
  animate: T;
  transition?: Record<string, unknown>;
}): {
  animate: T | Record<string, never>;
  transition: Record<string, unknown> | undefined;
} {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return {
      animate: {} as Record<string, never>,
      transition: undefined,
    };
  }

  return { animate, transition };
}
