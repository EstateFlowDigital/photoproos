"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  isCompleted && "bg-[var(--success)] text-white",
                  isCurrent && "bg-[var(--primary)] text-white",
                  isUpcoming && "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium hidden sm:block",
                  isCurrent && "text-[var(--foreground)]",
                  !isCurrent && "text-[var(--foreground-muted)]"
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  index < currentStep
                    ? "bg-[var(--success)]"
                    : "bg-[var(--background-secondary)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
