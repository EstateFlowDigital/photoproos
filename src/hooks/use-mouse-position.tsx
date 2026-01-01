"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
}

/**
 * Track mouse position globally or relative to an element
 */
export function useMousePosition(elementRef?: React.RefObject<HTMLElement>) {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
  });

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const element = elementRef?.current;

      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          x: e.clientX,
          y: e.clientY,
          elementX: e.clientX - rect.left,
          elementY: e.clientY - rect.top,
        });
      } else {
        setPosition({
          x: e.clientX,
          y: e.clientY,
          elementX: e.clientX,
          elementY: e.clientY,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [elementRef]);

  return position;
}

/**
 * Cursor spotlight effect - follows mouse with a gradient glow
 */
interface SpotlightOptions {
  size?: number;
  color?: string;
  opacity?: number;
  blur?: number;
}

export function useCursorSpotlight(
  containerRef: React.RefObject<HTMLElement>,
  options: SpotlightOptions = {}
) {
  const {
    size = 400,
    color = "rgba(59, 130, 246, 0.15)",
    opacity = 1,
    blur = 100,
  } = options;

  const position = useMousePosition(containerRef);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleEnter = () => setIsVisible(true);
    const handleLeave = () => setIsVisible(false);

    element.addEventListener("mouseenter", handleEnter);
    element.addEventListener("mouseleave", handleLeave);

    return () => {
      element.removeEventListener("mouseenter", handleEnter);
      element.removeEventListener("mouseleave", handleLeave);
    };
  }, [containerRef]);

  const spotlightStyle: React.CSSProperties = {
    position: "absolute",
    left: position.elementX - size / 2,
    top: position.elementY - size / 2,
    width: size,
    height: size,
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    opacity: isVisible ? opacity : 0,
    filter: `blur(${blur}px)`,
    pointerEvents: "none",
    transition: "opacity 300ms ease-out",
    zIndex: 0,
  };

  return { spotlightStyle, isVisible, position };
}
