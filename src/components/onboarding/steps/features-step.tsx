"use client";

import { useState, useEffect } from "react";
import { Puzzle, ArrowRight, ArrowLeft, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getModulesByCategory,
  MODULES,
  type ModuleDefinition,
} from "@/lib/constants/modules";
import {
  getModulesForIndustries,
  getDefaultModulesForIndustries,
} from "@/lib/constants/industries";
import type { OnboardingData } from "../onboarding-wizard";
import { saveOnboardingStep } from "@/lib/actions/onboarding";

interface FeaturesStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
}

const categoryLabels: Record<string, string> = {
  core: "Core Features",
  operations: "Operations",
  client: "Client Management",
  advanced: "Advanced Features",
};

export function FeaturesStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  organizationId,
}: FeaturesStepProps) {
  const modulesByCategory = getModulesByCategory();
  const availableModules = getModulesForIndustries(formData.industries);

  // Initialize with default modules on first load
  useEffect(() => {
    if (formData.enabledModules.length === 0) {
      const defaults = getDefaultModulesForIndustries(formData.industries);
      updateFormData({ enabledModules: defaults });
    }
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await saveOnboardingStep(organizationId, 5, {
        enabledModules: formData.enabledModules,
      });
      onNext();
    } catch (error) {
      console.error("Error saving features:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const module = MODULES[moduleId];
    if (!module || module.isCore) return;

    const isEnabled = formData.enabledModules.includes(moduleId);
    if (isEnabled) {
      updateFormData({
        enabledModules: formData.enabledModules.filter((id) => id !== moduleId),
      });
    } else {
      updateFormData({
        enabledModules: [...formData.enabledModules, moduleId],
      });
    }
  };

  const isModuleAvailable = (moduleId: string) => {
    return availableModules.includes(moduleId);
  };

  const isModuleEnabled = (moduleId: string) => {
    const module = MODULES[moduleId];
    if (module?.isCore) return true;
    return formData.enabledModules.includes(moduleId);
  };

  const renderModule = (module: ModuleDefinition) => {
    const available = isModuleAvailable(module.id);
    const enabled = isModuleEnabled(module.id);
    const isCore = module.isCore;
    const Icon = module.icon;

    return (
      <button
        key={module.id}
        type="button"
        onClick={() => !isCore && available && toggleModule(module.id)}
        disabled={isCore || !available}
        className={cn(
          "relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
          isCore
            ? "border-[var(--border)] bg-[var(--background-tertiary)] cursor-default"
            : available
            ? enabled
              ? "border-[var(--primary)] bg-[var(--primary)]/5 cursor-pointer"
              : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)] cursor-pointer"
            : "border-[var(--border)] bg-[var(--background-tertiary)] opacity-50 cursor-not-allowed"
        )}
      >
        {/* Checkbox */}
        <div
          className={cn(
            "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
            isCore
              ? "border-[var(--success)] bg-[var(--success)]"
              : !available
              ? "border-[var(--border)]"
              : enabled
              ? "border-[var(--primary)] bg-[var(--primary)]"
              : "border-[var(--border)]"
          )}
        >
          {(enabled || isCore) && <Check className="w-3 h-3 text-white" />}
          {!available && !isCore && <Lock className="w-2.5 h-2.5 text-[var(--foreground-muted)]" />}
        </div>

        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg",
            isCore
              ? "bg-[var(--success)]/10 text-[var(--success)]"
              : enabled
              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
              : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-medium",
                enabled || isCore
                  ? "text-[var(--foreground)]"
                  : "text-[var(--foreground-secondary)]"
              )}
            >
              {module.name}
            </span>
            {isCore && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--success)]/10 text-[var(--success)]">
                Always on
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
            {module.description}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <Puzzle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Choose your features
        </h2>
        <p className="text-[var(--foreground-secondary)]">
          We&apos;ve pre-selected recommended features. Customize as needed.
        </p>
      </div>

      {/* Feature Categories */}
      <div className="space-y-6">
        {Object.entries(modulesByCategory).map(([category, modules]) => {
          // Filter to only show modules relevant to selected industries (or core)
          const relevantModules = modules.filter(
            (m) => m.isCore || isModuleAvailable(m.id)
          );

          if (relevantModules.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                {categoryLabels[category]}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {relevantModules.map(renderModule)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
        <p className="text-sm text-[var(--foreground-muted)]">
          <span className="font-medium text-[var(--foreground)]">
            {formData.enabledModules.length + 2}
          </span>{" "}
          features enabled. You can change this anytime in settings.
        </p>
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
