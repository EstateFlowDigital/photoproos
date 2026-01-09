"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  addPlanFeature,
  deletePlanFeature,
  syncPlanToStripe,
  syncAllPlansToStripe,
  createPricingExperiment,
  createPricingVariant,
  updateExperimentStatus,
  syncVariantToStripe,
  seedDefaultPlans,
  cloneSubscriptionPlan,
  deletePricingVariant,
  checkEnvironmentStatus,
  type EnvironmentStatus,
} from "@/lib/actions/subscription-plans";
import type { PlanName, ExperimentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

// =============================================================================
// Types
// =============================================================================

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  plan: PlanName;
  description: string | null;
  tagline: string | null;
  badgeText: string | null;
  displayOrder: number;
  isHighlighted: boolean;
  highlightColor: string | null;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  trialDays: number;
  isActive: boolean;
  isPublic: boolean;
  isLegacy?: boolean;
  stripeProductId: string | null;
  stripeMonthlyPriceId: string | null;
  stripeYearlyPriceId: string | null;
  stripeSyncedAt: Date | null;
  features: PlanFeature[];
  pricingVariants: PricingVariant[];
}

interface PlanFeature {
  id: string;
  planId: string;
  name: string;
  description: string | null;
  category: string | null;
  featureKey: string;
  featureValue: string;
  displayOrder: number;
  isHighlighted: boolean;
  tooltip: string | null;
}

interface PricingVariant {
  id: string;
  experimentId: string | null;
  planId: string;
  name: string;
  description: string | null;
  isControl: boolean;
  monthlyPriceCents: number | null;
  yearlyPriceCents: number | null;
  trialDays: number | null;
  stripeMonthlyPriceId: string | null;
  stripeYearlyPriceId: string | null;
  stripeSyncedAt: Date | null;
  badgeText: string | null;
  isHighlighted: boolean | null;
  impressions: number;
  conversions: number;
  isActive: boolean;
}

interface PricingExperiment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  hypothesis: string | null;
  status: ExperimentStatus;
  startDate: Date | null;
  endDate: Date | null;
  trafficPercent: number;
  landingPagePaths: string[];
  controlConversions: number;
  controlImpressions: number;
  variantConversions: number;
  variantImpressions: number;
  winningVariantId: string | null;
  statisticalSignificance: number | null;
  variants: (PricingVariant & { plan: { id: string; name: string; slug: string } })[];
}

interface SubscriptionPlansProps {
  initialPlans: SubscriptionPlan[];
  initialExperiments: PricingExperiment[];
}

const PLAN_TYPES: { value: PlanName; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "studio", label: "Studio" },
  { value: "enterprise", label: "Enterprise" },
];

const FEATURE_CATEGORIES = [
  "Core",
  "Storage",
  "Team",
  "Support",
  "Integrations",
  "Branding",
  "Analytics",
];

// =============================================================================
// Component
// =============================================================================

export function SubscriptionPlansSection({
  initialPlans,
  initialExperiments,
}: SubscriptionPlansProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);
  const [experiments, setExperiments] = useState<PricingExperiment[]>(initialExperiments);
  const [activeTab, setActiveTab] = useState<"plans" | "features" | "experiments" | "new" | "environment">("plans");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);
  const [showNewExperimentForm, setShowNewExperimentForm] = useState(false);
  const [showNewVariantForm, setShowNewVariantForm] = useState<string | null>(null); // experimentId
  const [envStatus, setEnvStatus] = useState<EnvironmentStatus | null>(null);

  // Form state for new plan
  const [newPlan, setNewPlan] = useState({
    name: "",
    slug: "",
    plan: "pro" as PlanName,
    description: "",
    tagline: "",
    badgeText: "",
    monthlyPrice: "",
    yearlyPrice: "",
    trialDays: "14",
  });

  // Form state for new feature
  const [newFeature, setNewFeature] = useState({
    planId: "",
    name: "",
    featureKey: "",
    featureValue: "",
    category: "Core",
    tooltip: "",
  });

  // Form state for new experiment
  const [newExperiment, setNewExperiment] = useState({
    name: "",
    slug: "",
    description: "",
    hypothesis: "",
    trafficPercent: "50",
    landingPagePaths: "",
  });

  // Form state for new variant
  const [newVariant, setNewVariant] = useState({
    planId: "",
    name: "",
    description: "",
    isControl: false,
    monthlyPrice: "",
    yearlyPrice: "",
    trialDays: "",
  });

  // =============================================================================
  // Handlers
  // =============================================================================

  const handleCreatePlan = () => {
    if (!newPlan.name || !newPlan.slug || !newPlan.monthlyPrice || !newPlan.yearlyPrice) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createSubscriptionPlan({
          name: newPlan.name,
          slug: newPlan.slug,
          plan: newPlan.plan,
          description: newPlan.description || null,
          tagline: newPlan.tagline || null,
          badgeText: newPlan.badgeText || null,
          monthlyPriceCents: Math.round(parseFloat(newPlan.monthlyPrice) * 100),
          yearlyPriceCents: Math.round(parseFloat(newPlan.yearlyPrice) * 100),
          trialDays: parseInt(newPlan.trialDays) || 14,
        });

        if (result.success) {
          showToast("Plan created successfully", "success");
          setShowNewPlanForm(false);
          setNewPlan({
            name: "",
            slug: "",
            plan: "pro",
            description: "",
            tagline: "",
            badgeText: "",
            monthlyPrice: "",
            yearlyPrice: "",
            trialDays: "14",
          });
          // Refresh the page to get updated data
          router.refresh();
        } else {
          showToast(result.error || "Failed to create plan", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to create plan", "error");
      }
    });
  };

  const handleSyncPlan = (planId: string, planName: string) => {
    startTransition(async () => {
      try {
        const result = await syncPlanToStripe(planId);
        if (result.success) {
          showToast(`${planName} synced to Stripe`, "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to sync plan", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to sync plan", "error");
      }
    });
  };

  const handleSyncAllPlans = () => {
    startTransition(async () => {
      try {
        const result = await syncAllPlansToStripe();
        if (result.success) {
          const { synced, failed, errors } = result.data;
          if (failed > 0) {
            showToast(`Synced ${synced} plans, ${failed} failed`, "warning");
          } else {
            showToast(`All ${synced} plans synced to Stripe`, "success");
          }
          router.refresh();
        } else {
          showToast(result.error || "Failed to sync plans", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to sync plans", "error");
      }
    });
  };

  const handleAddFeature = () => {
    if (!newFeature.planId || !newFeature.name || !newFeature.featureKey || !newFeature.featureValue) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addPlanFeature({
          planId: newFeature.planId,
          name: newFeature.name,
          featureKey: newFeature.featureKey,
          featureValue: newFeature.featureValue,
          category: newFeature.category,
          tooltip: newFeature.tooltip || null,
        });

        if (result.success) {
          showToast("Feature added successfully", "success");
          setNewFeature({
            planId: newFeature.planId,
            name: "",
            featureKey: "",
            featureValue: "",
            category: "Core",
            tooltip: "",
          });
          router.refresh();
        } else {
          showToast(result.error || "Failed to add feature", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to add feature", "error");
      }
    });
  };

  const handleDeleteFeature = async (featureId: string, featureName: string) => {
    const confirmed = await confirm({
      title: "Delete feature",
      description: `Delete feature "${featureName}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const result = await deletePlanFeature(featureId);
        if (result.success) {
          showToast("Feature deleted", "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to delete feature", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to delete feature", "error");
      }
    });
  };

  const handleCreateExperiment = () => {
    if (!newExperiment.name || !newExperiment.slug) {
      showToast("Please fill in name and slug", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPricingExperiment({
          name: newExperiment.name,
          slug: newExperiment.slug,
          description: newExperiment.description || null,
          hypothesis: newExperiment.hypothesis || null,
          trafficPercent: parseInt(newExperiment.trafficPercent) || 50,
          landingPagePaths: newExperiment.landingPagePaths
            ? newExperiment.landingPagePaths.split(",").map((p) => p.trim())
            : [],
        });

        if (result.success) {
          showToast("Experiment created", "success");
          setShowNewExperimentForm(false);
          setNewExperiment({
            name: "",
            slug: "",
            description: "",
            hypothesis: "",
            trafficPercent: "50",
            landingPagePaths: "",
          });
          router.refresh();
        } else {
          showToast(result.error || "Failed to create experiment", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to create experiment", "error");
      }
    });
  };

  const handleUpdateExperimentStatus = (experimentId: string, status: ExperimentStatus) => {
    startTransition(async () => {
      try {
        const result = await updateExperimentStatus(experimentId, status);
        if (result.success) {
          showToast(`Experiment ${status}`, "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to update experiment", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to update experiment", "error");
      }
    });
  };

  const handleSeedDefaultPlans = () => {
    startTransition(async () => {
      try {
        const result = await seedDefaultPlans();
        if (result.success) {
          const { created, skipped } = result.data;
          if (created === 0) {
            showToast(`All default plans already exist (${skipped} skipped)`, "info");
          } else {
            showToast(`Created ${created} plans${skipped > 0 ? `, ${skipped} skipped` : ""}`, "success");
          }
          router.refresh();
        } else {
          showToast(result.error || "Failed to seed plans", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to seed plans", "error");
      }
    });
  };

  const handleClonePlan = (planId: string, planName: string) => {
    startTransition(async () => {
      try {
        const result = await cloneSubscriptionPlan(planId);
        if (result.success) {
          showToast(`${planName} cloned successfully`, "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to clone plan", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to clone plan", "error");
      }
    });
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    const confirmed = await confirm({
      title: "Delete plan",
      description: `Delete plan "${planName}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const result = await deleteSubscriptionPlan(planId);
        if (result.success) {
          showToast(`${planName} deleted`, "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to delete plan", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to delete plan", "error");
      }
    });
  };

  const handleCreateVariant = (experimentId: string) => {
    if (!newVariant.planId || !newVariant.name) {
      showToast("Please select a plan and enter a variant name", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPricingVariant({
          experimentId,
          planId: newVariant.planId,
          name: newVariant.name,
          description: newVariant.description || null,
          isControl: newVariant.isControl,
          monthlyPriceCents: newVariant.monthlyPrice ? Math.round(parseFloat(newVariant.monthlyPrice) * 100) : null,
          yearlyPriceCents: newVariant.yearlyPrice ? Math.round(parseFloat(newVariant.yearlyPrice) * 100) : null,
          trialDays: newVariant.trialDays ? parseInt(newVariant.trialDays) : null,
        });

        if (result.success) {
          showToast("Variant created", "success");
          setShowNewVariantForm(null);
          setNewVariant({
            planId: "",
            name: "",
            description: "",
            isControl: false,
            monthlyPrice: "",
            yearlyPrice: "",
            trialDays: "",
          });
          router.refresh();
        } else {
          showToast(result.error || "Failed to create variant", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to create variant", "error");
      }
    });
  };

  const handleDeleteVariant = async (variantId: string, variantName: string) => {
    const confirmed = await confirm({
      title: "Delete variant",
      description: `Delete variant "${variantName}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const result = await deletePricingVariant(variantId);
        if (result.success) {
          showToast("Variant deleted", "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to delete variant", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to delete variant", "error");
      }
    });
  };

  const handleLoadEnvStatus = () => {
    startTransition(async () => {
      try {
        const status = await checkEnvironmentStatus();
        setEnvStatus(status);
      } catch (error) {
        showToast("Failed to load environment status", "error");
      }
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStripeProductUrl = (stripeProductId: string | null) => {
    if (!stripeProductId) return null;
    return `https://dashboard.stripe.com/products/${stripeProductId}`;
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border-2 border-[var(--card-border)]">
            <CreditCardIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Subscription Plans
            </h2>
            <p className="text-sm text-foreground-muted">
              Manage application pricing tiers and A/B tests
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleSyncAllPlans}
          disabled={isPending || plans.length === 0}
        >
          <SyncIcon className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          Sync All to Stripe
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-[var(--background)] rounded-lg overflow-x-auto">
        {(["plans", "features", "experiments", "new", "environment"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "environment" && !envStatus) {
                handleLoadEnvStatus();
              }
            }}
            className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-[var(--card)] text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {tab === "plans" && "Plans"}
            {tab === "features" && "Features"}
            {tab === "experiments" && "A/B Tests"}
            {tab === "new" && "New Plan"}
            {tab === "environment" && "Env Status"}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          {/* Seed Default Plans Button */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background)]">
            <div>
              <p className="text-sm font-medium text-foreground">Quick Start</p>
              <p className="text-xs text-foreground-muted">Seed Pro, Studio, and Enterprise plans with default features</p>
            </div>
            <button
              onClick={handleSeedDefaultPlans}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              <SparklesIcon className="h-4 w-4" />
              Seed Default Plans
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12 text-foreground-muted">
              <CreditCardIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No subscription plans configured yet.</p>
              <p className="text-sm mt-2">
                Click "New Plan" to create your first pricing tier.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap flex-wrap">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          plan.isHighlighted
                            ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                            : "bg-[var(--background-tertiary)] text-foreground-muted"
                        }`}
                      >
                        <span className="text-lg font-bold">
                          {plan.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {plan.name}
                          </h3>
                          {plan.badgeText && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                              {plan.badgeText}
                            </span>
                          )}
                          {!plan.isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--error)]/10 text-[var(--error)]">
                              Inactive
                            </span>
                          )}
                          {plan.isLegacy && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--warning)]/10 text-[var(--warning)]">
                              Legacy
                            </span>
                          )}
                        </div>
                        {plan.tagline && (
                          <p className="text-sm text-foreground-muted mt-0.5">
                            {plan.tagline}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-foreground">
                            {formatPrice(plan.monthlyPriceCents)}/mo
                          </span>
                          <span className="text-foreground-muted">
                            or {formatPrice(plan.yearlyPriceCents)}/yr
                          </span>
                          <span className="text-foreground-muted">
                            {plan.trialDays} day trial
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Sync Status */}
                      {plan.stripeProductId ? (
                        <span className="flex items-center gap-1.5 text-xs text-[var(--success)]">
                          <div className="h-2 w-2 rounded-full bg-[var(--success)]" />
                          Synced
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-[var(--warning)]">
                          <div className="h-2 w-2 rounded-full bg-[var(--warning)]" />
                          Not synced
                        </span>
                      )}

                      {/* Actions */}
                      {plan.stripeProductId && (
                        <a
                          href={getStripeProductUrl(plan.stripeProductId) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md text-foreground-muted hover:text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                          title="View in Stripe"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleSyncPlan(plan.id, plan.name)}
                        disabled={isPending}
                        className="p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
                        title="Sync to Stripe"
                      >
                        <SyncIcon className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleClonePlan(plan.id, plan.name)}
                        disabled={isPending}
                        className="p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
                        title="Clone Plan"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        disabled={isPending}
                        className="p-2 rounded-md text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
                        title="Delete Plan"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Features Preview */}
                  {plan.features.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                      <p className="text-xs font-medium text-foreground-muted mb-2">
                        Features ({plan.features.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {plan.features.slice(0, 6).map((feature) => (
                          <span
                            key={feature.id}
                            className="px-2 py-1 text-xs rounded-md bg-[var(--background-tertiary)] text-foreground-muted"
                          >
                            {feature.name}
                          </span>
                        ))}
                        {plan.features.length > 6 && (
                          <span className="px-2 py-1 text-xs rounded-md bg-[var(--background-tertiary)] text-foreground-muted">
                            +{plan.features.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Features Tab */}
      {activeTab === "features" && (
        <div className="space-y-6">
          {/* Plan Selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Plan
            </label>
            <select
              value={selectedPlanId || ""}
              onChange={(e) => {
                setSelectedPlanId(e.target.value || null);
                setNewFeature({ ...newFeature, planId: e.target.value });
              }}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
            >
              <option value="">Choose a plan...</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.features.length} features)
                </option>
              ))}
            </select>
          </div>

          {selectedPlan && (
            <>
              {/* Existing Features */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Current Features
                </h4>
                {selectedPlan.features.length === 0 ? (
                  <p className="text-sm text-foreground-muted">
                    No features configured yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedPlan.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {feature.name}
                            </span>
                            {feature.category && (
                              <span className="px-1.5 py-0.5 text-xs rounded bg-[var(--background-tertiary)] text-foreground-muted">
                                {feature.category}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-foreground-muted mt-0.5">
                            {feature.featureKey}: {feature.featureValue}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFeature(feature.id, feature.name)}
                          disabled={isPending}
                          className="p-1 rounded text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Feature */}
              <div className="pt-4 border-t border-[var(--card-border)]">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Add Feature
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newFeature.name}
                      onChange={(e) =>
                        setNewFeature({ ...newFeature, name: e.target.value })
                      }
                      placeholder="Unlimited Galleries"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Category
                    </label>
                    <select
                      value={newFeature.category}
                      onChange={(e) =>
                        setNewFeature({ ...newFeature, category: e.target.value })
                      }
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                    >
                      {FEATURE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Key *
                    </label>
                    <input
                      type="text"
                      value={newFeature.featureKey}
                      onChange={(e) =>
                        setNewFeature({ ...newFeature, featureKey: e.target.value })
                      }
                      placeholder="galleries_limit"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Value *
                    </label>
                    <input
                      type="text"
                      value={newFeature.featureValue}
                      onChange={(e) =>
                        setNewFeature({ ...newFeature, featureValue: e.target.value })
                      }
                      placeholder="unlimited"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Tooltip
                    </label>
                    <input
                      type="text"
                      value={newFeature.tooltip}
                      onChange={(e) =>
                        setNewFeature({ ...newFeature, tooltip: e.target.value })
                      }
                      placeholder="Create as many galleries as you need"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                    />
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddFeature}
                  disabled={isPending}
                  className="mt-4"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Feature
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Experiments Tab */}
      {activeTab === "experiments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Pricing Experiments
            </h4>
            <button
              onClick={() => setShowNewExperimentForm(true)}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <PlusIcon className="h-4 w-4" />
              New Experiment
            </button>
          </div>

          {showNewExperimentForm && (
            <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
              <h4 className="text-sm font-medium text-foreground mb-4">
                Create A/B Test Experiment
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newExperiment.name}
                    onChange={(e) =>
                      setNewExperiment({ ...newExperiment, name: e.target.value })
                    }
                    placeholder="Q1 2025 Pricing Test"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={newExperiment.slug}
                    onChange={(e) =>
                      setNewExperiment({ ...newExperiment, slug: e.target.value })
                    }
                    placeholder="q1-2025-test"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground-muted mb-1">
                    Hypothesis
                  </label>
                  <input
                    type="text"
                    value={newExperiment.hypothesis}
                    onChange={(e) =>
                      setNewExperiment({ ...newExperiment, hypothesis: e.target.value })
                    }
                    placeholder="Lowering Pro price by 20% will increase conversions by 15%"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">
                    Traffic %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newExperiment.trafficPercent}
                    onChange={(e) =>
                      setNewExperiment({ ...newExperiment, trafficPercent: e.target.value })
                    }
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">
                    Landing Pages (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newExperiment.landingPagePaths}
                    onChange={(e) =>
                      setNewExperiment({ ...newExperiment, landingPagePaths: e.target.value })
                    }
                    placeholder="/pricing, /enterprise"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={handleCreateExperiment}
                  disabled={isPending}
                >
                  Create Experiment
                </Button>
                <button
                  onClick={() => setShowNewExperimentForm(false)}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {experiments.length === 0 && !showNewExperimentForm ? (
            <div className="text-center py-8 text-foreground-muted">
              <BeakerIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pricing experiments yet.</p>
              <p className="text-sm mt-2">
                Create an experiment to A/B test different price points.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">
                          {experiment.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            experiment.status === "active"
                              ? "bg-[var(--success)]/10 text-[var(--success)]"
                              : experiment.status === "draft"
                              ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                              : experiment.status === "completed"
                              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                              : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                          }`}
                        >
                          {experiment.status}
                        </span>
                      </div>
                      {experiment.hypothesis && (
                        <p className="text-sm text-foreground-muted mt-1">
                          {experiment.hypothesis}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-foreground-muted">
                        <span>{experiment.trafficPercent}% traffic</span>
                        <span>{experiment.variants.length} variants</span>
                        {experiment.startDate && (
                          <span>Started: {formatDate(experiment.startDate)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {experiment.status === "draft" && (
                        <button
                          onClick={() => handleUpdateExperimentStatus(experiment.id, "active")}
                          disabled={isPending}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--success)] text-white hover:bg-[var(--success)]/90 disabled:opacity-50"
                        >
                          Start
                        </button>
                      )}
                      {experiment.status === "active" && (
                        <>
                          <button
                            onClick={() => handleUpdateExperimentStatus(experiment.id, "paused")}
                            disabled={isPending}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--warning)] text-white hover:bg-[var(--warning)]/90 disabled:opacity-50"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => handleUpdateExperimentStatus(experiment.id, "completed")}
                            disabled={isPending}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
                          >
                            Complete
                          </button>
                        </>
                      )}
                      {experiment.status === "paused" && (
                        <button
                          onClick={() => handleUpdateExperimentStatus(experiment.id, "active")}
                          disabled={isPending}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--success)] text-white hover:bg-[var(--success)]/90 disabled:opacity-50"
                        >
                          Resume
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-foreground-muted">
                        Variants ({experiment.variants.length})
                      </p>
                      <button
                        onClick={() => setShowNewVariantForm(experiment.id)}
                        className="flex items-center gap-1 text-xs text-[var(--primary)] hover:text-[var(--primary)]/80"
                      >
                        <PlusIcon className="h-3 w-3" />
                        Add Variant
                      </button>
                    </div>

                    {/* New Variant Form */}
                    {showNewVariantForm === experiment.id && (
                      <div className="mb-4 p-3 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-foreground-muted mb-1">
                              Plan *
                            </label>
                            <select
                              value={newVariant.planId}
                              onChange={(e) => setNewVariant({ ...newVariant, planId: e.target.value })}
                              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground"
                            >
                              <option value="">Select a plan...</option>
                              {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-foreground-muted mb-1">
                              Variant Name *
                            </label>
                            <input
                              type="text"
                              value={newVariant.name}
                              onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                              placeholder="Control / Variant A"
                              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-muted"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-foreground-muted mb-1">
                              Monthly Price ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={newVariant.monthlyPrice}
                              onChange={(e) => setNewVariant({ ...newVariant, monthlyPrice: e.target.value })}
                              placeholder="Leave blank to use plan price"
                              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-muted"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-foreground-muted mb-1">
                              Yearly Price ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={newVariant.yearlyPrice}
                              onChange={(e) => setNewVariant({ ...newVariant, yearlyPrice: e.target.value })}
                              placeholder="Leave blank to use plan price"
                              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-muted"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-foreground-muted mb-1">
                              Trial Days
                            </label>
                            <input
                              type="number"
                              value={newVariant.trialDays}
                              onChange={(e) => setNewVariant({ ...newVariant, trialDays: e.target.value })}
                              placeholder="Leave blank to use plan trial"
                              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-muted"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-5">
                            <Checkbox
                              id="isControl"
                              checked={newVariant.isControl}
                              onCheckedChange={(checked) => setNewVariant({ ...newVariant, isControl: checked === true })}
                            />
                            <label htmlFor="isControl" className="text-sm text-foreground">
                              Is Control Group
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="primary"
                            onClick={() => handleCreateVariant(experiment.id)}
                            disabled={isPending}
                            className="text-xs px-3 py-1.5"
                          >
                            Add Variant
                          </Button>
                          <button
                            onClick={() => {
                              setShowNewVariantForm(null);
                              setNewVariant({
                                planId: "",
                                name: "",
                                description: "",
                                isControl: false,
                                monthlyPrice: "",
                                yearlyPrice: "",
                                trialDays: "",
                              });
                            }}
                            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {experiment.variants.length > 0 ? (
                      <div className="space-y-2">
                        {experiment.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex items-center justify-between text-sm bg-[var(--background-tertiary)] rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-foreground">{variant.name}</span>
                              <span className="text-foreground-muted">
                                ({variant.plan.name})
                              </span>
                              {variant.isControl && (
                                <span className="px-1.5 py-0.5 text-xs rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                                  Control
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-foreground-muted">
                              <span>{variant.impressions} views</span>
                              <span>{variant.conversions} converts</span>
                              {variant.impressions > 0 && (
                                <span className="font-medium text-foreground">
                                  {((variant.conversions / variant.impressions) * 100).toFixed(1)}%
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteVariant(variant.id, variant.name)}
                                disabled={isPending}
                                className="p-1 rounded text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-foreground-muted">No variants yet. Add a variant to start testing.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Plan Tab */}
      {activeTab === "new" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                placeholder="Pro"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={newPlan.slug}
                onChange={(e) => setNewPlan({ ...newPlan, slug: e.target.value })}
                placeholder="pro"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Plan Type *
              </label>
              <select
                value={newPlan.plan}
                onChange={(e) => setNewPlan({ ...newPlan, plan: e.target.value as PlanName })}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              >
                {PLAN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={newPlan.badgeText}
                onChange={(e) => setNewPlan({ ...newPlan, badgeText: e.target.value })}
                placeholder="Most Popular"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Monthly Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPlan.monthlyPrice}
                onChange={(e) => setNewPlan({ ...newPlan, monthlyPrice: e.target.value })}
                placeholder="49.00"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Yearly Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPlan.yearlyPrice}
                onChange={(e) => setNewPlan({ ...newPlan, yearlyPrice: e.target.value })}
                placeholder="490.00"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Trial Days
              </label>
              <input
                type="number"
                min="0"
                value={newPlan.trialDays}
                onChange={(e) => setNewPlan({ ...newPlan, trialDays: e.target.value })}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={newPlan.tagline}
                onChange={(e) => setNewPlan({ ...newPlan, tagline: e.target.value })}
                placeholder="For growing photographers"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                placeholder="Everything you need to run a professional photography business"
                rows={3}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted resize-none"
              />
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleCreatePlan}
            disabled={isPending}
          >
            <PlusIcon className="h-4 w-4" />
            Create Plan
          </Button>
        </div>
      )}

      {/* Environment Status Tab */}
      {activeTab === "environment" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">
              Check which integrations and services are configured.
            </p>
            <button
              onClick={handleLoadEnvStatus}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              <SyncIcon className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {!envStatus ? (
            <div className="text-center py-12 text-foreground-muted">
              <SettingsIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading environment status...</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Stripe */}
              <div className={`rounded-lg border p-4 ${envStatus.stripe.configured ? "border-[var(--success)] bg-[var(--success)]/5" : "border-[var(--error)] bg-[var(--error)]/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#635bff]/10 flex items-center justify-center">
                      <span className="text-[#635bff] font-bold text-sm">S</span>
                    </div>
                    <span className="font-medium text-foreground">Stripe</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${envStatus.stripe.configured ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--error)]/10 text-[var(--error)]"}`}>
                    {envStatus.stripe.configured ? "Configured" : "Missing"}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  {envStatus.stripe.configured
                    ? `Mode: ${envStatus.stripe.mode === "live" ? "Live" : "Test"}`
                    : "STRIPE_SECRET_KEY not set"}
                </p>
              </div>

              {/* Clerk */}
              <div className={`rounded-lg border p-4 ${envStatus.clerk.configured ? "border-[var(--success)] bg-[var(--success)]/5" : "border-[var(--error)] bg-[var(--error)]/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#6c47ff]/10 flex items-center justify-center">
                      <span className="text-[#6c47ff] font-bold text-sm">C</span>
                    </div>
                    <span className="font-medium text-foreground">Clerk</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${envStatus.clerk.configured ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--error)]/10 text-[var(--error)]"}`}>
                    {envStatus.clerk.configured ? "Configured" : "Missing"}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  {envStatus.clerk.configured
                    ? "Authentication ready"
                    : "CLERK_SECRET_KEY not set"}
                </p>
              </div>

              {/* Database */}
              <div className={`rounded-lg border p-4 ${envStatus.database.configured ? "border-[var(--success)] bg-[var(--success)]/5" : "border-[var(--error)] bg-[var(--error)]/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                      <DatabaseIcon className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <span className="font-medium text-foreground">Database</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${envStatus.database.configured ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--error)]/10 text-[var(--error)]"}`}>
                    {envStatus.database.configured ? "Configured" : "Missing"}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  {envStatus.database.configured
                    ? "PostgreSQL connected"
                    : "DATABASE_URL not set"}
                </p>
              </div>

              {/* Storage */}
              <div className={`rounded-lg border p-4 ${envStatus.storage.configured ? "border-[var(--success)]/30 bg-[var(--success)]/5" : "border-[var(--warning)]/30 bg-[var(--warning)]/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                      <CloudIcon className="h-4 w-4 text-[var(--warning)]" />
                    </div>
                    <span className="font-medium text-foreground">Storage</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${envStatus.storage.configured ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
                    {envStatus.storage.configured ? "Configured" : "Optional"}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  {envStatus.storage.configured
                    ? `Provider: ${envStatus.storage.provider}`
                    : "No storage provider configured"}
                </p>
              </div>

              {/* Resend (Email) */}
              <div className={`rounded-lg border p-4 ${envStatus.resend.configured ? "border-[var(--success)]/30 bg-[var(--success)]/5" : "border-[var(--warning)]/30 bg-[var(--warning)]/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                      <MailIcon className="h-4 w-4 text-[#00d4ff]" />
                    </div>
                    <span className="font-medium text-foreground">Email (Resend)</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${envStatus.resend.configured ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
                    {envStatus.resend.configured ? "Configured" : "Optional"}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  {envStatus.resend.configured
                    ? "Email notifications ready"
                    : "RESEND_API_KEY not set"}
                </p>
              </div>

              {/* Twilio (SMS) */}
              <div className={`rounded-lg border p-4 ${envStatus.twilio.configured ? "border-[var(--success)]/30 bg-[var(--success)]/5" : "border-[var(--warning)]/30 bg-[var(--warning)]/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#f22f46]/10 flex items-center justify-center">
                      <PhoneIcon className="h-4 w-4 text-[#f22f46]" />
                    </div>
                    <span className="font-medium text-foreground">SMS (Twilio)</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${envStatus.twilio.configured ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
                    {envStatus.twilio.configured ? "Configured" : "Optional"}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  {envStatus.twilio.configured
                    ? "SMS notifications ready"
                    : "TWILIO_* variables not set"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Icons
// =============================================================================

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function SyncIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0v2.43l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.5 3.528v4.644c0 .729-.29 1.428-.805 1.944l-1.217 1.216a8.75 8.75 0 0 1 3.55.621l.502.201a7.25 7.25 0 0 0 4.178.365l-2.403-2.403a2.75 2.75 0 0 1-.805-1.944V3.528a40.205 40.205 0 0 0-3 0Zm4.5.084V7.63c0 .463.18.91.505 1.24l3.428 3.428a.75.75 0 0 1-.375 1.277l-.67.148a8.75 8.75 0 0 1-4.994-.367l-.502-.201a7.25 7.25 0 0 0-3.814-.468l-.6.118a.75.75 0 0 1-.83-1.07l.173-.345a8.75 8.75 0 0 0 .676-5.098l-.09-.516a.75.75 0 0 1 .737-.878h.05c2.384 0 4.769-.133 7.145-.398a.75.75 0 0 1 .161.528ZM5 3.5a.5.5 0 0 0-.5.5v.002a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H5Z" clipRule="evenodd" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.993 6.993 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4Zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.21-3.134 4-7 4s-7-1.79-7-4V8.178c.396.37.842.688 1.306.953C5.838 10.006 7.854 10.5 10 10.5s4.162-.494 5.694-1.37ZM3 13.179V15c0 2.21 3.134 4 7 4s7-1.79 7-4v-1.822c-.396.37-.842.688-1.306.953-1.532.875-3.548 1.369-5.694 1.369s-4.162-.494-5.694-1.37A7.009 7.009 0 0 1 3 13.179Z" clipRule="evenodd" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.5 16a3.5 3.5 0 0 1-.369-6.98 4 4 0 1 1 7.753-1.977A4.5 4.5 0 1 1 13.5 16h-8Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
    </svg>
  );
}
