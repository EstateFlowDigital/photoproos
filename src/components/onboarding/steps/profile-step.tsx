"use client";

import { useState } from "react";
import { User, ArrowRight, ArrowLeft } from "lucide-react";
import type { OnboardingData } from "../onboarding-wizard";
import { saveOnboardingStep } from "@/lib/actions/onboarding";

interface ProfileStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
  userEmail: string;
}

export function ProfileStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  organizationId,
  userEmail,
}: ProfileStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await saveOnboardingStep(organizationId, 1, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      onNext();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <User className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Tell us about yourself
        </h2>
        <p className="text-[var(--foreground-secondary)]">
          This helps us personalize your experience
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* First Name */}
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              First Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              placeholder="John"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            {errors.firstName && (
              <p className="text-sm text-[var(--error)]">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Last Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              placeholder="Doe"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            {errors.lastName && (
              <p className="text-sm text-[var(--error)]">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Phone Number <span className="text-[var(--foreground-muted)]">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <div className="px-4 py-3 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground-secondary)]">
            {userEmail}
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            Managed through your account settings
          </p>
        </div>
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
