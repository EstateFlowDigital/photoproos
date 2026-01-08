"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { SpotlightPosition } from "@/lib/walkthrough-types";

interface SpotlightProps {
  /** CSS selector for the target element */
  targetSelector: string;
  /** Whether the spotlight is active */
  isActive: boolean;
  /** Padding around the highlighted element */
  padding?: number;
  /** Position of the tooltip */
  position?: SpotlightPosition;
  /** Content to show in the tooltip */
  children?: React.ReactNode;
  /** Callback when clicking outside the spotlight */
  onClickOutside?: () => void;
  /** Whether to scroll the element into view */
  scrollIntoView?: boolean;
}

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Spotlight Component
 *
 * Creates a spotlight overlay that highlights a specific element on the page.
 * Used for interactive walkthroughs and tutorials.
 */
export function Spotlight({
  targetSelector,
  isActive,
  padding = 8,
  position = "auto",
  children,
  onClickOutside,
  scrollIntoView = true,
}: SpotlightProps) {
  const [targetRect, setTargetRect] = React.useState<ElementRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState<SpotlightPosition>(position);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  // Client-side only
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when spotlight is active
  React.useEffect(() => {
    if (!isActive || !mounted) return;

    // Save current scroll position and prevent scrolling
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore scroll position
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isActive, mounted]);

  // Find and track the target element
  React.useEffect(() => {
    if (!isActive || !mounted) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Use viewport-relative coordinates (no scrollY) since overlay is fixed
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });

        // Scroll element into view if needed (before locking scroll)
        if (scrollIntoView) {
          const viewportHeight = window.innerHeight;
          const elementTop = rect.top;
          const elementBottom = rect.bottom;

          if (elementTop < 100 || elementBottom > viewportHeight - 100) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Update rect after scroll animation
            setTimeout(updateRect, 500);
          }
        }
      } else {
        setTargetRect(null);
      }
    };

    // Initial update with delay to let any scroll settle
    const timer = setTimeout(updateRect, 100);

    // Update on resize only (scroll is locked)
    window.addEventListener("resize", updateRect, { passive: true });

    // Also observe DOM changes
    const observer = new MutationObserver(updateRect);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      observer.disconnect();
    };
  }, [targetSelector, isActive, scrollIntoView, mounted]);

  // Calculate tooltip position
  React.useEffect(() => {
    if (!targetRect || !tooltipRef.current || position !== "auto") {
      setTooltipPosition(position);
      return;
    }

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available space in each direction
    const spaceAbove = targetRect.top - padding;
    const spaceBelow = viewportHeight - (targetRect.top + targetRect.height + padding);
    const spaceLeft = targetRect.left - padding;
    const spaceRight = viewportWidth - (targetRect.left + targetRect.width + padding);

    // Prefer bottom, then top, then right, then left
    if (spaceBelow >= tooltipRect.height + 20) {
      setTooltipPosition("bottom");
    } else if (spaceAbove >= tooltipRect.height + 20) {
      setTooltipPosition("top");
    } else if (spaceRight >= tooltipRect.width + 20) {
      setTooltipPosition("right");
    } else if (spaceLeft >= tooltipRect.width + 20) {
      setTooltipPosition("left");
    } else {
      setTooltipPosition("bottom");
    }
  }, [targetRect, position, padding]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClickOutside) {
      onClickOutside();
    }
  };

  // Handle keyboard events
  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClickOutside) {
        e.preventDefault();
        onClickOutside();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onClickOutside]);

  if (!mounted || !isActive || !targetRect) {
    return null;
  }

  // Calculate spotlight cutout position
  const spotlightStyle = {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  };

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const gap = 12;
    switch (tooltipPosition) {
      case "top":
        return {
          bottom: `calc(100% - ${targetRect.top - padding - gap}px)`,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          top: targetRect.top + targetRect.height + padding + gap,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2,
          right: `calc(100% - ${targetRect.left - padding - gap}px)`,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left + targetRect.width + padding + gap,
          transform: "translateY(-50%)",
        };
      default:
        return {
          top: targetRect.top + targetRect.height + padding + gap,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
    }
  };

  return createPortal(
    <div
      className="spotlight-overlay fixed inset-0 z-[9999]"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial spotlight - highlighting an element"
    >
      {/* Background overlay with cutout */}
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlightStyle.left}
              y={spotlightStyle.top}
              width={spotlightStyle.width}
              height={spotlightStyle.height}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight ring/border */}
      <div
        className="absolute rounded-lg ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-transparent"
        style={{
          top: spotlightStyle.top,
          left: spotlightStyle.left,
          width: spotlightStyle.width,
          height: spotlightStyle.height,
        }}
      >
        {/* Pulse animation */}
        <div className="absolute inset-0 animate-pulse rounded-lg ring-2 ring-[var(--primary)]/50" />
      </div>

      {/* Tooltip */}
      {children && (
        <div
          ref={tooltipRef}
          role="tooltip"
          aria-live="polite"
          className={cn(
            "spotlight-tooltip absolute z-10 max-w-sm rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "focus-within:ring-2 focus-within:ring-[var(--primary)]/50"
          )}
          style={getTooltipStyle()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          <div
            className={cn(
              "absolute h-3 w-3 rotate-45 border border-[var(--card-border)] bg-[var(--card)]",
              tooltipPosition === "bottom" && "-top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0",
              tooltipPosition === "top" && "-bottom-1.5 left-1/2 -translate-x-1/2 border-l-0 border-t-0",
              tooltipPosition === "left" && "-right-1.5 top-1/2 -translate-y-1/2 border-b-0 border-l-0",
              tooltipPosition === "right" && "-left-1.5 top-1/2 -translate-y-1/2 border-r-0 border-t-0"
            )}
          />
          {children}
        </div>
      )}
    </div>,
    document.body
  );
}

/**
 * Hook to add data-tour attribute to an element ref
 */
export function useTourTarget(tourId: string) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute("data-tour", tourId);
    }
    return () => {
      if (ref.current) {
        ref.current.removeAttribute("data-tour");
      }
    };
  }, [tourId]);

  return ref;
}

export default Spotlight;
