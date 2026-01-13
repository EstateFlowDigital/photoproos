"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  X,
  Minimize2,
  Maximize2,
  EyeOff,
  Play,
  HelpCircle,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DismissWarningModal } from "./dismiss-warning-modal";
import type {
  WalkthroughState,
  WalkthroughPageId,
  WalkthroughStep,
  WalkthroughConfig,
} from "@/lib/walkthrough-types";

interface PageWalkthroughProps {
  /** Page identifier for this walkthrough */
  pageId: WalkthroughPageId;
  /** Walkthrough configuration */
  config: WalkthroughConfig;
  /** Current walkthrough state */
  state: WalkthroughState;
  /** Callback when state changes */
  onStateChange: (newState: WalkthroughState) => void;
  /** Additional className */
  className?: string;
  /** Whether the user prefers reduced motion */
  reduceMotion?: boolean;
}

/**
 * PageWalkthrough Component
 *
 * A tutorial/guide component that appears on pages to help users learn features.
 * Uses an accordion-style layout where all steps are visible and expandable.
 * Each step can include an optional image/screenshot.
 *
 * @example
 * <PageWalkthrough
 *   pageId="dashboard"
 *   config={dashboardWalkthrough}
 *   state={walkthroughState}
 *   onStateChange={handleStateChange}
 * />
 */
export function PageWalkthrough({
  pageId,
  config,
  state,
  onStateChange,
  className,
  reduceMotion = false,
}: PageWalkthroughProps) {
  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(
    new Set([config.steps[0]?.id]) // First step expanded by default
  );
  const [showDismissWarning, setShowDismissWarning] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const walkthroughId = `walkthrough-${pageId}`;

  // Don't render if dismissed or hidden
  if (state === "dismissed" || state === "hidden") {
    return null;
  }

  const isMinimized = state === "minimized";

  const handleMinimize = () => {
    onStateChange("minimized");
  };

  const handleExpand = () => {
    onStateChange("open");
  };

  const handleHide = () => {
    onStateChange("hidden");
  };

  const handleDismissClick = () => {
    setShowDismissWarning(true);
  };

  const handleConfirmDismiss = () => {
    setShowDismissWarning(false);
    onStateChange("dismissed");
  };

  const handleCancelDismiss = () => {
    setShowDismissWarning(false);
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const transitionClasses = reduceMotion
    ? ""
    : "transition-all duration-300 ease-in-out";

  // Minimized state - compact bar
  if (isMinimized) {
    return (
      <div
        id={walkthroughId}
        role="region"
        aria-label={`${config.title} tutorial`}
        className={cn(
          "walkthrough-minimized",
          "flex flex-wrap items-center justify-between gap-3 rounded-xl",
          "border border-[var(--card-border)] bg-[var(--card)]",
          "px-4 py-3",
          "shadow-sm",
          transitionClasses,
          className
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <HelpCircle className="h-4 w-4 text-[var(--primary)]" aria-hidden />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm font-medium text-foreground">
              {config.title}
            </span>
            {config.estimatedTime && (
              <span className="text-xs text-foreground-muted">
                {config.estimatedTime}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleExpand}
            aria-label="Expand tutorial"
            aria-expanded="false"
            aria-controls={`${walkthroughId}-content`}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleHide}
            aria-label="Hide tutorial (can restore in Settings)"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDismissClick}
            aria-label="Dismiss tutorial permanently"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <DismissWarningModal
          isOpen={showDismissWarning}
          onConfirm={handleConfirmDismiss}
          onCancel={handleCancelDismiss}
          pageTitle={config.title}
        />
      </div>
    );
  }

  // Open state - full walkthrough card with accordion
  return (
    <>
      <Card
        ref={cardRef}
        id={walkthroughId}
        role="region"
        aria-label={`${config.title} tutorial`}
        aria-describedby={`${walkthroughId}-description`}
        tabIndex={0}
        className={cn(
          "walkthrough-card",
          "border border-[var(--card-border)] bg-gradient-to-br from-[var(--primary)]/5 to-transparent",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)]",
          transitionClasses,
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                <HelpCircle className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <CardDescription
                  id={`${walkthroughId}-description`}
                  className="mt-1"
                >
                  {config.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleMinimize}
                aria-label="Minimize tutorial"
                aria-expanded="true"
                aria-controls={`${walkthroughId}-content`}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleHide}
                aria-label="Hide tutorial (can restore in Settings)"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDismissClick}
                aria-label="Dismiss tutorial permanently"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent
          id={`${walkthroughId}-content`}
          ref={contentRef}
          className="space-y-4"
        >
          {/* Video Placeholder */}
          {config.videoPlaceholder && (
            <div className="walkthrough-video-placeholder">
              <div
                className="relative flex aspect-video items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)]"
                role="img"
                aria-label="Video tutorial placeholder"
              >
                {config.videoUrl ? (
                  <video
                    src={config.videoUrl}
                    controls
                    className="h-full w-full rounded-lg"
                    aria-label={`${config.title} video tutorial`}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                      <Play className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Video Coming Soon
                      </p>
                      <p className="text-xs text-foreground-muted">
                        A detailed tutorial will be available here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Steps Accordion */}
          <div className="walkthrough-steps space-y-2" role="group" aria-label="Tutorial steps">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Quick Guide
            </h4>

            {config.steps.map((step, index) => (
              <WalkthroughAccordionItem
                key={step.id}
                step={step}
                index={index}
                isExpanded={expandedSteps.has(step.id)}
                onToggle={() => toggleStep(step.id)}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>

          {/* Got it button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleMinimize}
              aria-label="Complete tutorial"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>

      <DismissWarningModal
        isOpen={showDismissWarning}
        onConfirm={handleConfirmDismiss}
        onCancel={handleCancelDismiss}
        pageTitle={config.title}
      />
    </>
  );
}

/**
 * Accordion item for a single walkthrough step
 */
interface WalkthroughAccordionItemProps {
  step: WalkthroughStep;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  reduceMotion?: boolean;
}

function WalkthroughAccordionItem({
  step,
  index,
  isExpanded,
  onToggle,
  reduceMotion = false,
}: WalkthroughAccordionItemProps) {
  const StepIcon = step.icon;
  const transitionClasses = reduceMotion ? "" : "transition-all duration-200 ease-in-out";

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        transitionClasses
      )}
    >
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 p-3 text-left",
          "hover:bg-[var(--ghost-hover)]",
          transitionClasses
        )}
        aria-expanded={isExpanded}
        aria-controls={`step-${step.id}-content`}
      >
        {/* Step Number */}
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
            "bg-[var(--primary)] text-white"
          )}
        >
          {index + 1}
        </span>

        {/* Step Icon */}
        {StepIcon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <StepIcon className="h-4 w-4 text-[var(--primary)]" />
          </div>
        )}

        {/* Step Title */}
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-foreground text-sm">{step.title}</h5>
        </div>

        {/* Expand/Collapse Icon */}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-foreground-muted",
            transitionClasses,
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Accordion Content */}
      <div
        id={`step-${step.id}-content`}
        className={cn(
          "grid",
          transitionClasses,
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-0 space-y-3">
            {/* Description */}
            <p className="text-sm text-foreground-secondary pl-9">
              {step.description}
            </p>

            {/* Step Image */}
            <div className="pl-9">
              {step.image ? (
                <div className="relative aspect-video rounded-lg border border-[var(--card-border)] overflow-hidden bg-[var(--background-tertiary)]">
                  <Image
                    src={step.image}
                    alt={step.imageAlt || `${step.title} screenshot`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative flex aspect-video items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background-tertiary)]">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <ImageIcon className="h-8 w-8 text-foreground-muted" />
                    <p className="text-xs text-foreground-muted">
                      Screenshot coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button (if provided) */}
            {step.actionLabel && step.actionHref && (
              <div className="pl-9">
                <a
                  href={step.actionHref}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  {step.actionLabel}
                  <ChevronDown className="h-3 w-3 -rotate-90" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

PageWalkthrough.displayName = "PageWalkthrough";
