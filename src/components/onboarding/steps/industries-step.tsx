"use client";

import { useState } from "react";
import { Briefcase, ArrowRight, ArrowLeft, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIndustriesArray } from "@/lib/constants/industries";
import type { OnboardingData } from "../onboarding-wizard";
import { saveOnboardingStep } from "@/lib/actions/onboarding";

interface IndustriesStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
}

export function IndustriesStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  organizationId,
}: IndustriesStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const industries = getIndustriesArray();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.industries.length === 0) {
      newErrors.industries = "Please select at least one industry";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await saveOnboardingStep(organizationId, 4, {
        industries: formData.industries,
        primaryIndustry: formData.primaryIndustry,
      });
      onNext();
    } catch (error) {
      console.error("Error saving industries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIndustry = (industryId: string) => {
    const isSelected = formData.industries.includes(industryId);

    if (isSelected) {
      // Remove industry
      const newIndustries = formData.industries.filter((id) => id !== industryId);
      const newPrimary =
        formData.primaryIndustry === industryId
          ? newIndustries[0] || ""
          : formData.primaryIndustry;
      updateFormData({
        industries: newIndustries,
        primaryIndustry: newPrimary,
      });
    } else {
      // Add industry
      const newIndustries = [...formData.industries, industryId];
      // If this is the first industry, make it primary
      const newPrimary = formData.industries.length === 0 ? industryId : formData.primaryIndustry;
      updateFormData({
        industries: newIndustries,
        primaryIndustry: newPrimary,
      });
    }
  };

  const setPrimaryIndustry = (industryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (formData.industries.includes(industryId)) {
      updateFormData({ primaryIndustry: industryId });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          What do you photograph?
        </h2>
        <p className="text-[var(--foreground-secondary)]">
          Select all that apply. We&apos;ll customize your experience.
        </p>
      </div>

      {/* Industry Selection */}
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {industries.map((industry) => {
            const isSelected = formData.industries.includes(industry.id);
            const isPrimary = formData.primaryIndustry === industry.id;
            const Icon = industry.icon;

            return (
              <button
                key={industry.id}
                type="button"
                onClick={() => toggleIndustry(industry.id)}
                className={cn(
                  "relative flex items-start gap-4 p-4 rounded-xl border text-left transition-all group",
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
                )}
              >
                {/* Selection indicator */}
                <div
                  className={cn(
                    "absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]"
                      : "border-[var(--border)] group-hover:border-[var(--border-hover)]"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                    isSelected
                      ? "text-[var(--primary)]"
                      : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                  )}
                  style={{
                    backgroundColor: isSelected
                      ? `${industry.color}20`
                      : undefined,
                    color: isSelected ? industry.color : undefined,
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--foreground)]">
                      {industry.name}
                    </span>
                    {isPrimary && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--warning)]/10 text-[var(--warning)]">
                        <Star className="w-3 h-3" />
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    {industry.description}
                  </p>

                  {/* Set as primary button (shown when selected but not primary) */}
                  {isSelected && !isPrimary && (
                    <button
                      type="button"
                      onClick={(e) => setPrimaryIndustry(industry.id, e)}
                      className="mt-2 text-xs text-[var(--primary)] hover:underline"
                    >
                      Set as primary
                    </button>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {errors.industries && (
          <p className="text-sm text-[var(--error)] text-center">
            {errors.industries}
          </p>
        )}

        {/* Selection summary */}
        {formData.industries.length > 0 && (
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
            <p className="text-sm text-[var(--foreground-muted)]">
              <span className="font-medium text-[var(--foreground)]">
                {formData.industries.length}
              </span>{" "}
              {formData.industries.length === 1 ? "industry" : "industries"} selected
              {formData.primaryIndustry && (
                <>
                  {" "}
                  &bull;{" "}
                  <span className="text-[var(--foreground)]">
                    {industries.find((i) => i.id === formData.primaryIndustry)?.name}
                  </span>{" "}
                  is your primary focus
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-start justify-between gap-4 flex-wrap pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || formData.industries.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Continue"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
