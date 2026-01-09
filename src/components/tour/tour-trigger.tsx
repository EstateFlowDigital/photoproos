"use client";

import { HelpCircle, Play, RefreshCw } from "lucide-react";
import { useTour, welcomeTour, getTourById, type Tour } from "./index";
import { cn } from "@/lib/utils";

interface TourTriggerProps {
  tourId?: string;
  className?: string;
  variant?: "button" | "icon" | "link";
  label?: string;
}

export function TourTrigger({
  tourId = "welcome",
  className,
  variant = "button",
  label,
}: TourTriggerProps) {
  const { startTour, isActive } = useTour();

  const tour = getTourById(tourId) || welcomeTour;
  const displayLabel = label || `Start ${tour.name}`;

  const handleClick = () => {
    if (!isActive) {
      startTour(tour);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isActive}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors",
          "hover:bg-[var(--background-hover)] hover:text-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        aria-label={displayLabel}
        title={displayLabel}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
    );
  }

  if (variant === "link") {
    return (
      <button
        onClick={handleClick}
        disabled={isActive}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline",
          className
        )}
      >
        <Play className="h-3.5 w-3.5" />
        {displayLabel}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isActive}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "border border-[var(--card-border)] bg-[var(--card)] text-foreground",
        "hover:bg-[var(--background-hover)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <Play className="h-4 w-4" />
      {displayLabel}
    </button>
  );
}

interface TourRestartButtonProps {
  tourId?: string;
  className?: string;
}

export function TourRestartButton({ tourId = "welcome", className }: TourRestartButtonProps) {
  const { startTour, isActive } = useTour();

  const tour = getTourById(tourId) || welcomeTour;

  return (
    <button
      onClick={() => !isActive && startTour(tour)}
      disabled={isActive}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <RefreshCw className="h-4 w-4" />
      Restart tour
    </button>
  );
}
