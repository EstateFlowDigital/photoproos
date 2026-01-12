"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Minimize2,
  Maximize2,
  Eye,
  EyeOff,
  Play,
  HelpCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  MousePointer2,
  Sparkles,
} from "lucide-react";
import { Spotlight } from "./spotlight";
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
 * Supports four states: open, minimized, hidden, and dismissed.
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
  const [currentStep, setCurrentStep] = React.useState(0);
  const [showDismissWarning, setShowDismissWarning] = React.useState(false);
  const [interactiveMode, setInteractiveMode] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const walkthroughId = `walkthrough-${pageId}`;

  // Check if any steps have interactive targets
  const hasInteractiveSteps = config.steps.some((step) => step.targetSelector);
  const currentStepConfig = config.steps[currentStep];
  const showSpotlight = interactiveMode && currentStepConfig?.targetSelector;

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if walkthrough is focused or active
      if (!cardRef.current?.contains(document.activeElement)) return;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          if (currentStep < config.steps.length - 1) {
            event.preventDefault();
            setCurrentStep(currentStep + 1);
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
          if (currentStep > 0) {
            event.preventDefault();
            setCurrentStep(currentStep - 1);
          }
          break;
        case "Escape":
          event.preventDefault();
          if (interactiveMode) {
            setInteractiveMode(false);
          } else {
            onStateChange("minimized");
          }
          break;
        case "Home":
          event.preventDefault();
          setCurrentStep(0);
          break;
        case "End":
          event.preventDefault();
          setCurrentStep(config.steps.length - 1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, config.steps.length, interactiveMode, onStateChange]);

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

  const handleNextStep = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

  // Open state - full walkthrough card
  return (
    <>
      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Step {currentStep + 1} of {config.steps.length}: {currentStepConfig?.title}
      </div>

      <Card
        ref={cardRef}
        id={walkthroughId}
        role="region"
        aria-label={`${config.title} tutorial - Step ${currentStep + 1} of ${config.steps.length}`}
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

          {/* Steps */}
          <div className="walkthrough-steps space-y-3" role="group" aria-label="Tutorial steps">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h4 className="text-sm font-medium text-foreground" id={`${walkthroughId}-steps-label`}>
                Quick Guide
              </h4>
              <span className="text-xs text-foreground-muted" aria-live="polite">
                Step {currentStep + 1} of {config.steps.length}
              </span>
            </div>
            {/* Screen reader instructions */}
            <p className="sr-only">
              Use arrow keys to navigate between steps. Press Escape to minimize.
            </p>

            {/* Step Progress */}
            <div
              className="flex gap-1"
              role="progressbar"
              aria-valuenow={currentStep + 1}
              aria-valuemin={1}
              aria-valuemax={config.steps.length}
              aria-label="Tutorial progress"
            >
              {config.steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    index <= currentStep
                      ? "bg-[var(--primary)]"
                      : "bg-[var(--border)]"
                  )}
                />
              ))}
            </div>

            {/* Current Step */}
            <div
              className={cn(
                "rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4",
                transitionClasses
              )}
            >
              <WalkthroughStepContent
                step={config.steps[currentStep]}
                isActive
              />
            </div>

            {/* Step Navigation */}
            <div className="flex items-start justify-between gap-4 flex-wrap pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                aria-label="Previous step"
              >
                <ChevronUp className="mr-1 h-4 w-4" />
                Previous
              </Button>

              {currentStep < config.steps.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextStep}
                  aria-label="Next step"
                >
                  Next
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMinimize}
                  aria-label="Complete tutorial"
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Got it!
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Mode Toggle */}
          {hasInteractiveSteps && (
            <div className="flex items-start justify-between gap-4 flex-wrap rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-3">
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm font-medium text-foreground">
                  Interactive Mode
                </span>
              </div>
              <Button
                variant={interactiveMode ? "primary" : "secondary"}
                size="sm"
                onClick={() => setInteractiveMode(!interactiveMode)}
                aria-pressed={interactiveMode}
              >
                {interactiveMode ? (
                  <>
                    <Eye className="mr-1 h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1 h-3 w-3" />
                    Try It
                  </>
                )}
              </Button>
            </div>
          )}

          {/* All Steps Overview */}
          <details className="walkthrough-all-steps">
            <summary className="cursor-pointer text-sm font-medium text-foreground-secondary hover:text-foreground">
              View all steps
            </summary>
            <ul className="mt-3 space-y-2" role="list">
              {config.steps.map((step, index) => (
                <li key={step.id}>
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors",
                      "hover:bg-[var(--ghost-hover)]",
                      index === currentStep && "bg-[var(--primary)]/5"
                    )}
                    aria-current={index === currentStep ? "step" : undefined}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs",
                        index < currentStep
                          ? "bg-[var(--success)] text-white"
                          : index === currentStep
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--border)] text-foreground-muted"
                      )}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          index === currentStep
                            ? "text-foreground"
                            : "text-foreground-secondary"
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-foreground-muted line-clamp-1">
                        {step.description}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </CardContent>
      </Card>

      <DismissWarningModal
        isOpen={showDismissWarning}
        onConfirm={handleConfirmDismiss}
        onCancel={handleCancelDismiss}
        pageTitle={config.title}
      />

      {/* Spotlight Overlay for Interactive Mode */}
      {showSpotlight && currentStepConfig?.targetSelector && (
        <Spotlight
          targetSelector={currentStepConfig.targetSelector}
          isActive={true}
          padding={currentStepConfig.highlightPadding ?? 8}
          position={currentStepConfig.tooltipPosition ?? "auto"}
          onClickOutside={() => setInteractiveMode(false)}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {currentStepConfig.icon && (
                <currentStepConfig.icon className="h-5 w-5 text-[var(--primary)]" />
              )}
              <h4 className="font-semibold text-foreground">
                {currentStepConfig.title}
              </h4>
            </div>
            <p className="text-sm text-foreground-secondary">
              {currentStepConfig.description}
            </p>
            <div className="flex items-start justify-between gap-4 flex-wrap gap-2 pt-1">
              <span className="text-xs text-foreground-muted">
                Step {currentStep + 1} of {config.steps.length}
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="mr-1 h-3 w-3" />
                    Back
                  </Button>
                )}
                {currentStepConfig.actionLabel && currentStepConfig.actionHref && (
                  <Link href={currentStepConfig.actionHref}>
                    <Button variant="secondary" size="sm">
                      {currentStepConfig.actionLabel}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                )}
                {currentStep < config.steps.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNextStep}
                  >
                    Next
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setInteractiveMode(false)}
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Done
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Spotlight>
      )}
    </>
  );
}

/**
 * Individual step content component
 */
interface WalkthroughStepContentProps {
  step: WalkthroughStep;
  isActive?: boolean;
}

function WalkthroughStepContent({
  step,
  isActive,
}: WalkthroughStepContentProps) {
  const StepIcon = step.icon;

  return (
    <div className="flex items-start gap-3">
      {StepIcon ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
          <StepIcon className="h-4 w-4 text-[var(--primary)]" />
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
          <ArrowRight className="h-4 w-4 text-[var(--primary)]" />
        </div>
      )}
      <div>
        <h5 className="font-medium text-foreground">{step.title}</h5>
        <p className="mt-1 text-sm text-foreground-secondary">
          {step.description}
        </p>
      </div>
    </div>
  );
}

PageWalkthrough.displayName = "PageWalkthrough";
