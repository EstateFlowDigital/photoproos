"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { updateIndustries, updateModules } from "@/lib/actions/onboarding";
import {
  Building2,
  Briefcase,
  PartyPopper,
  Camera,
  Utensils,
  Package,
  Check,
  Star,
  type LucideIcon,
} from "lucide-react";

interface IndustryOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  modules: string[];
}

interface ModuleOption {
  id: string;
  name: string;
  description: string;
  industries: string[];
  category: string;
}

interface FeaturesSettingsFormProps {
  organizationId: string;
  initialIndustries: string[];
  initialPrimaryIndustry: string;
  initialEnabledModules: string[];
  allIndustries: IndustryOption[];
  allModules: ModuleOption[];
}

const industryIcons: Record<string, LucideIcon> = {
  Building2,
  Briefcase,
  PartyPopper,
  Camera,
  Utensils,
  Package,
};

export function FeaturesSettingsForm({
  organizationId,
  initialIndustries,
  initialPrimaryIndustry,
  initialEnabledModules,
  allIndustries,
  allModules,
}: FeaturesSettingsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(initialIndustries);
  const [primaryIndustry, setPrimaryIndustry] = useState<string>(initialPrimaryIndustry);
  const [enabledModules, setEnabledModules] = useState<string[]>(initialEnabledModules);

  const highlightModuleId = (searchParams?.get("module") || "").trim();
  const highlightFromPath = (searchParams?.get("from") || "").trim();
  const highlightedModule = highlightModuleId
    ? allModules.find((module) => module.id === highlightModuleId)
    : null;

  // Get available modules based on selected industries
  const availableModules = allModules.filter((module) => {
    if (module.industries.includes("*")) return true;
    return module.industries.some((ind) => selectedIndustries.includes(ind));
  });

  const highlightAvailable = highlightedModule
    ? availableModules.some((module) => module.id === highlightedModule.id)
    : false;
  const highlightIndustryNames = highlightedModule
    ? highlightedModule.industries
        .filter((industryId) => industryId !== "*")
        .map((industryId) => allIndustries.find((ind) => ind.id === industryId)?.name)
        .filter((name): name is string => Boolean(name))
    : [];

  useEffect(() => {
    if (!highlightModuleId || !highlightedModule) return;
    const label = highlightedModule.name;
    const message = highlightAvailable
      ? `Enable "${label}" to access that module.`
      : `"${label}" isn't available for your current industries.`;
    showToast(message, "info");

    const target = document.getElementById(`module-${highlightModuleId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightAvailable, highlightModuleId, highlightedModule, showToast]);

  // Get modules grouped by category
  const modulesByCategory = availableModules.reduce(
    (acc, module) => {
      const category = module.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(module);
      return acc;
    },
    {} as Record<string, ModuleOption[]>
  );

  const handleIndustryToggle = (industryId: string) => {
    setSelectedIndustries((prev) => {
      const isSelected = prev.includes(industryId);
      if (isSelected) {
        // If removing the primary industry, set a new primary
        if (primaryIndustry === industryId) {
          const remaining = prev.filter((id) => id !== industryId);
          if (remaining.length > 0) {
            setPrimaryIndustry(remaining[0]);
          }
        }
        return prev.filter((id) => id !== industryId);
      } else {
        // If this is the first industry, make it primary
        if (prev.length === 0) {
          setPrimaryIndustry(industryId);
        }
        return [...prev, industryId];
      }
    });
  };

  const handleModuleToggle = (moduleId: string) => {
    setEnabledModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      }
      return [...prev, moduleId];
    });
  };

  const handleSave = () => {
    if (selectedIndustries.length === 0) {
      showToast("Please select at least one industry", "error");
      return;
    }

    startTransition(async () => {
      try {
        // Update industries
        const industriesResult = await updateIndustries(
          organizationId,
          selectedIndustries,
          primaryIndustry
        );

        if (!industriesResult.success) {
          showToast(industriesResult.error || "Failed to update industries", "error");
          return;
        }

        // Update modules
        const modulesResult = await updateModules(organizationId, enabledModules);

        if (!modulesResult.success) {
          showToast(modulesResult.error || "Failed to update modules", "error");
          return;
        }

        showToast("Settings saved successfully", "success");
        router.refresh();
      } catch (error) {
        showToast("An unexpected error occurred", "error");
      }
    });
  };

  const categoryLabels: Record<string, string> = {
    operations: "Operations",
    client: "Client Management",
    advanced: "Industry-Specific",
  };

  return (
    <div className="space-y-8">
      {/* Industries Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Photography Industries</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Select the types of photography you offer. This helps us tailor your dashboard and features.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allIndustries.map((industry) => {
            const isSelected = selectedIndustries.includes(industry.id);
            const isPrimary = primaryIndustry === industry.id;
            const IconComponent = industryIcons[industry.icon] || Camera;

            return (
              <div key={industry.id} className="relative">
                <button
                  type="button"
                  onClick={() => handleIndustryToggle(industry.id)}
                  className={cn(
                    "w-full rounded-xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">{industry.name}</h3>
                        {isPrimary && isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                            <Star className="h-3 w-3" />
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-foreground-muted line-clamp-2">
                        {industry.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Make Primary Button */}
                {isSelected && !isPrimary && selectedIndustries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPrimaryIndustry(industry.id)}
                    className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-2 py-1 text-xs font-medium text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors shadow-sm"
                  >
                    <Star className="h-3 w-3" />
                    Make Primary
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modules Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Features & Modules</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Enable or disable features based on your workflow needs. Available options depend on your selected industries.
        </p>

        {highlightedModule && (
          <div className="mb-4 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 text-sm text-foreground">
            <p className="font-medium">
              {highlightAvailable
                ? `Enable "${highlightedModule.name}" to access this module.`
                : `"${highlightedModule.name}" isn't available for your current industries.`}
            </p>
            {highlightAvailable ? (
              <p className="mt-1 text-xs text-foreground-muted">
                Toggle it on below, save changes, and return to {highlightFromPath || "the module"}.
              </p>
            ) : (
              <p className="mt-1 text-xs text-foreground-muted">
                {highlightIndustryNames.length > 0
                  ? `Add one of these industries to unlock it: ${highlightIndustryNames.join(", ")}.`
                  : "Add the relevant industry to unlock it."}
              </p>
            )}
          </div>
        )}

        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="text-sm font-medium text-foreground-muted mb-3">
              {categoryLabels[category] || category}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {modules.map((module) => {
                const isEnabled = enabledModules.includes(module.id);
                const isHighlighted = module.id === highlightModuleId;

                return (
                  <button
                    key={module.id}
                    type="button"
                    id={`module-${module.id}`}
                    onClick={() => handleModuleToggle(module.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                      isHighlighted && "ring-2 ring-[var(--primary)]/40 border-[var(--primary)]/60",
                      isEnabled
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        isEnabled
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border-visible)]"
                      )}
                    >
                      {isEnabled && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{module.name}</h4>
                      <p className="text-xs text-foreground-muted line-clamp-1">
                        {module.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {availableModules.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            <p>Select at least one industry to see available modules.</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || selectedIndustries.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        >
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
