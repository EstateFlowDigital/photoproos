"use client";

import { useState } from "react";
import { Palette, ArrowRight, ArrowLeft, User, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../onboarding-wizard";
import { saveOnboardingStep } from "@/lib/actions/onboarding";

interface BrandingStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
}

export function BrandingStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  organizationId,
}: BrandingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.publicName.trim()) {
      newErrors.publicName = "Display name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await saveOnboardingStep(organizationId, 3, {
        displayMode: formData.displayMode,
        publicName: formData.publicName,
        publicEmail: formData.publicEmail,
        publicPhone: formData.publicPhone,
        website: formData.website,
        primaryColor: formData.primaryColor,
      });
      onNext();
    } catch (error) {
      console.error("Error saving branding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      // Use defaults when skipping - use company name or full name
      const defaultName =
        formData.companyName ||
        `${formData.firstName} ${formData.lastName}`.trim() ||
        "My Business";

      await saveOnboardingStep(organizationId, 3, {
        displayMode: formData.displayMode || "company",
        publicName: formData.publicName || defaultName,
        publicEmail: formData.publicEmail || "",
        publicPhone: formData.publicPhone || "",
        website: formData.website || "",
        primaryColor: formData.primaryColor || "#3b82f6",
      });
      onNext();
    } catch (error) {
      console.error("Error skipping branding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-update public name when display mode changes
  const handleDisplayModeChange = (mode: "personal" | "company") => {
    updateFormData({
      displayMode: mode,
      publicName:
        mode === "personal"
          ? `${formData.firstName} ${formData.lastName}`.trim()
          : formData.companyName || formData.publicName,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <Palette className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Your public presence
        </h2>
        <p className="text-[var(--foreground-secondary)]">
          How would you like clients to see you?
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Display Mode */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Branding Style
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleDisplayModeChange("personal")}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border text-center transition-all",
                formData.displayMode === "personal"
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full",
                  formData.displayMode === "personal"
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                )}
              >
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="font-medium text-[var(--foreground)]">
                  Personal Brand
                </div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  Use your name
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDisplayModeChange("company")}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border text-center transition-all",
                formData.displayMode === "company"
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full",
                  formData.displayMode === "company"
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                )}
              >
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="font-medium text-[var(--foreground)]">
                  Company Brand
                </div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  Use business name
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Public Name */}
        <div className="space-y-2">
          <label
            htmlFor="publicName"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Display Name <span className="text-[var(--error)]">*</span>
          </label>
          <input
            id="publicName"
            type="text"
            value={formData.publicName}
            onChange={(e) => updateFormData({ publicName: e.target.value })}
            placeholder={
              formData.displayMode === "personal"
                ? "John Doe"
                : "Acme Photography"
            }
            className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
          <p className="text-xs text-[var(--foreground-muted)]">
            This is what clients will see on invoices, galleries, and contracts
          </p>
          {errors.publicName && (
            <p className="text-sm text-[var(--error)]">{errors.publicName}</p>
          )}
        </div>

        {/* Contact Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="publicEmail"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Public Email
            </label>
            <input
              id="publicEmail"
              type="email"
              value={formData.publicEmail}
              onChange={(e) => updateFormData({ publicEmail: e.target.value })}
              placeholder="hello@example.com"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="publicPhone"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Public Phone
            </label>
            <input
              id="publicPhone"
              type="tel"
              value={formData.publicPhone}
              onChange={(e) => updateFormData({ publicPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label
            htmlFor="website"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Website <span className="text-[var(--foreground-muted)]">(optional)</span>
          </label>
          <input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => updateFormData({ website: e.target.value })}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        {/* Brand Color */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Brand Color
          </label>
          <p className="text-xs text-[var(--foreground-muted)]">
            Used for buttons and highlights on your client-facing pages
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { color: "#3b82f6", name: "Blue" },
              { color: "#8b5cf6", name: "Purple" },
              { color: "#22c55e", name: "Green" },
              { color: "#f97316", name: "Orange" },
              { color: "#ef4444", name: "Red" },
              { color: "#ec4899", name: "Pink" },
              { color: "#14b8a6", name: "Teal" },
              { color: "#000000", name: "Black" },
            ].map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => updateFormData({ primaryColor: preset.color })}
                className={cn(
                  "w-10 h-10 rounded-lg border-2 transition-all relative",
                  formData.primaryColor === preset.color
                    ? "border-[var(--foreground)] scale-110"
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              >
                {formData.primaryColor === preset.color && (
                  <svg
                    className="absolute inset-0 m-auto w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
            <div className="relative">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                title="Custom color"
              />
              <div
                className={cn(
                  "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all",
                  !["#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444", "#ec4899", "#14b8a6", "#000000"].includes(formData.primaryColor)
                    ? "border-[var(--foreground)]"
                    : "border-[var(--border)]"
                )}
                style={{
                  backgroundColor: !["#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444", "#ec4899", "#14b8a6", "#000000"].includes(formData.primaryColor)
                    ? formData.primaryColor
                    : "transparent"
                }}
              >
                <svg
                  className={cn(
                    "w-5 h-5",
                    !["#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444", "#ec4899", "#14b8a6", "#000000"].includes(formData.primaryColor)
                      ? "text-white"
                      : "text-[var(--foreground-muted)]"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
          <p className="text-xs text-[var(--foreground-muted)] mb-3">Preview</p>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white"
              style={{ backgroundColor: formData.primaryColor }}
            >
              {formData.publicName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="font-medium text-[var(--foreground)]">
                {formData.publicName || "Your Name"}
              </div>
              <div className="text-sm text-[var(--foreground-muted)]">
                {formData.publicEmail || "email@example.com"}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 w-full py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: formData.primaryColor }}
          >
            Sample Button
          </button>
        </div>
      </div>

      {/* Skip Info */}
      <div className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-[var(--foreground-muted)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--foreground-muted)]">
            <p className="font-medium text-[var(--foreground-secondary)]">
              Want to customize more later?
            </p>
            <p className="mt-1">
              You can upload your logo, set brand colors, and customize your
              client portal in <strong>Settings → Branding</strong> at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors disabled:opacity-50"
          >
            Skip for now
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
    </div>
  );
}
