"use client";

import { Target, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../onboarding-wizard";
import { saveOnboardingStep } from "@/lib/actions/onboarding";

interface GoalsStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
}

const goals = [
  {
    id: "more_bookings",
    label: "Get more bookings",
    description: "Fill your calendar with new clients",
  },
  {
    id: "faster_payments",
    label: "Get paid faster",
    description: "Streamline invoicing and collections",
  },
  {
    id: "better_organization",
    label: "Stay organized",
    description: "Keep track of clients, projects, and deadlines",
  },
  {
    id: "professional_galleries",
    label: "Impress clients with galleries",
    description: "Deliver photos in beautiful, branded galleries",
  },
  {
    id: "save_time",
    label: "Save time on admin work",
    description: "Automate repetitive tasks",
  },
  {
    id: "grow_revenue",
    label: "Grow my revenue",
    description: "Increase average order value and client retention",
  },
];

export function GoalsStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  organizationId,
}: GoalsStepProps) {
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await saveOnboardingStep(organizationId, 6, {
        selectedGoals: formData.selectedGoals,
      });
      onNext();
    } catch (error) {
      console.error("Error saving goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    const isSelected = formData.selectedGoals.includes(goalId);
    if (isSelected) {
      updateFormData({
        selectedGoals: formData.selectedGoals.filter((id) => id !== goalId),
      });
    } else {
      updateFormData({
        selectedGoals: [...formData.selectedGoals, goalId],
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <Target className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          What are your goals?
        </h2>
        <p className="text-[var(--foreground-secondary)]">
          Select all that apply. This helps us personalize your experience.
        </p>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {goals.map((goal) => {
          const isSelected = formData.selectedGoals.includes(goal.id);

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]"
                    : "border-[var(--border)]"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="font-medium text-[var(--foreground)]">
                  {goal.label}
                </div>
                <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
                  {goal.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Skip hint */}
      <p className="text-center text-sm text-[var(--foreground-muted)]">
        This step is optional. Skip if you&apos;re not sure yet.
      </p>

      {/* Navigation */}
      <div className="flex items-start justify-between gap-4 flex-wrap pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Saving..."
              : formData.selectedGoals.length === 0
              ? "Skip"
              : "Continue"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
