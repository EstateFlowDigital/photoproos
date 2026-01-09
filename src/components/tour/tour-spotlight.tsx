"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TourStep } from "./tour-provider";

interface TourSpotlightProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourSpotlight({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: TourSpotlightProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Wait for mount to access document
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find and track target element
  useEffect(() => {
    if (!mounted) return;

    const updatePosition = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      } else {
        // Element not found, reset
        setTargetRect(null);
      }
    };

    // Initial position
    updatePosition();

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    // Poll for element (in case it's dynamically rendered)
    const interval = setInterval(updatePosition, 500);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      clearInterval(interval);
    };
  }, [step.target, mounted]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        onNext();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onSkip]);

  if (!mounted) return null;

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const placement = step.placement || "bottom";

    switch (placement) {
      case "top":
        return {
          top: targetRect.top - tooltipHeight - padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
      case "bottom":
        return {
          top: targetRect.top + targetRect.height + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.left - tooltipWidth - padding,
        };
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.left + targetRect.width + padding,
        };
      default:
        return {
          top: targetRect.top + targetRect.height + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Overlay with cutout for target */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          style={{
            clipPath: targetRect
              ? `polygon(
                  0% 0%,
                  0% 100%,
                  ${targetRect.left - 8}px 100%,
                  ${targetRect.left - 8}px ${targetRect.top - 8}px,
                  ${targetRect.left + targetRect.width + 8}px ${targetRect.top - 8}px,
                  ${targetRect.left + targetRect.width + 8}px ${targetRect.top + targetRect.height + 8}px,
                  ${targetRect.left - 8}px ${targetRect.top + targetRect.height + 8}px,
                  ${targetRect.left - 8}px 100%,
                  100% 100%,
                  100% 0%
                )`
              : "none",
          }}
          onClick={onSkip}
        />

        {/* Highlight ring around target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute rounded-lg ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-transparent"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute w-80 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-2xl"
          style={{
            ...tooltipPosition,
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute right-3 top-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="pr-6">
            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
              {step.content}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i === stepIndex
                      ? "bg-[var(--primary)]"
                      : i < stepIndex
                        ? "bg-[var(--primary)]/40"
                        : "bg-[var(--border-visible)]"
                  )}
                />
              ))}
              <span className="ml-2 text-xs text-foreground-muted">
                {stepIndex + 1} of {totalSteps}
              </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={onPrev}
                  className="flex h-8 items-center gap-1 rounded-lg border border-[var(--card-border)] px-3 text-sm font-medium text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <button
                onClick={onNext}
                className="flex h-8 items-center gap-1 rounded-lg bg-[var(--primary)] px-3 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
