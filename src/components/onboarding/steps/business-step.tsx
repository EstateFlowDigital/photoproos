"use client";

import { useState } from "react";
import { Building2, ArrowRight, ArrowLeft, User, Users, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../onboarding-wizard";
import { saveOnboardingStep } from "@/lib/actions/onboarding";

interface BusinessStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
}

const businessTypes = [
  {
    id: "solo",
    icon: User,
    title: "Solo Photographer",
    description: "Just me, running my own business",
  },
  {
    id: "team",
    icon: Users,
    title: "Small Team",
    description: "A few photographers working together",
  },
  {
    id: "agency",
    icon: Building,
    title: "Agency / Studio",
    description: "Larger team with multiple clients",
  },
];

const teamSizes = ["1", "2-5", "6-10", "11-25", "25+"];

export function BusinessStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  organizationId,
}: BusinessStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessType) {
      newErrors.businessType = "Please select a business type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await saveOnboardingStep(organizationId, 2, {
        companyName: formData.companyName,
        businessType: formData.businessType,
        teamSize: formData.teamSize,
      });
      onNext();
    } catch (error) {
      console.error("Error saving business:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          About your business
        </h2>
        <p className="text-[var(--foreground-secondary)]">
          Help us tailor PhotoProOS to your needs
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Business / Company Name{" "}
            <span className="text-[var(--foreground-muted)]">(optional)</span>
          </label>
          <input
            id="companyName"
            type="text"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            placeholder="Your Photography Business"
            className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        {/* Business Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Business Type <span className="text-[var(--error)]">*</span>
          </label>
          <div className="grid gap-3">
            {businessTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  updateFormData({
                    businessType: type.id as OnboardingData["businessType"],
                    teamSize: type.id === "solo" ? "1" : formData.teamSize,
                  })
                }
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                  formData.businessType === type.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg",
                    formData.businessType === type.id
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                  )}
                >
                  <type.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[var(--foreground)]">
                    {type.title}
                  </div>
                  <div className="text-sm text-[var(--foreground-muted)]">
                    {type.description}
                  </div>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    formData.businessType === type.id
                      ? "border-[var(--primary)]"
                      : "border-[var(--border)]"
                  )}
                >
                  {formData.businessType === type.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {errors.businessType && (
            <p className="text-sm text-[var(--error)]">{errors.businessType}</p>
          )}
        </div>

        {/* Team Size (shown if not solo) */}
        {formData.businessType && formData.businessType !== "solo" && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Team Size
            </label>
            <div className="flex flex-wrap gap-2">
              {teamSizes.slice(1).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateFormData({ teamSize: size })}
                  className={cn(
                    "px-4 py-2 rounded-lg border font-medium transition-colors",
                    formData.teamSize === size
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--border-hover)]"
                  )}
                >
                  {size} {size === "25+" ? "people" : "people"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Continue"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
