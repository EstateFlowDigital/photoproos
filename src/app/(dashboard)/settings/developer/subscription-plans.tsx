"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
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
} from "@/lib/actions/subscription-plans";
import type { PlanName, ExperimentStatus } from "@prisma/client";

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
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);
  const [experiments, setExperiments] = useState<PricingExperiment[]>(initialExperiments);
  const [activeTab, setActiveTab] = useState<"plans" | "features" | "experiments" | "new">("plans");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);
  const [showNewExperimentForm, setShowNewExperimentForm] = useState(false);

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
          window.location.reload();
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
          window.location.reload();
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
          window.location.reload();
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
          window.location.reload();
        } else {
          showToast(result.error || "Failed to add feature", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to add feature", "error");
      }
    });
  };

  const handleDeleteFeature = (featureId: string, featureName: string) => {
    if (!confirm(`Delete feature "${featureName}"?`)) return;

    startTransition(async () => {
      try {
        const result = await deletePlanFeature(featureId);
        if (result.success) {
          showToast("Feature deleted", "success");
          window.location.reload();
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
          window.location.reload();
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
          window.location.reload();
        } else {
          showToast(result.error || "Failed to update experiment", "error");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to update experiment", "error");
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
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

        <button
          onClick={handleSyncAllPlans}
          disabled={isPending || plans.length === 0}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          <SyncIcon className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          Sync All to Stripe
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-[var(--background)] rounded-lg overflow-x-auto">
        {(["plans", "features", "experiments", "new"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="space-y-4">
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
                  <div className="flex items-start justify-between">
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
                <button
                  onClick={handleAddFeature}
                  disabled={isPending}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Feature
                </button>
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
                <button
                  onClick={handleCreateExperiment}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  Create Experiment
                </button>
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
                  <div className="flex items-start justify-between">
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
                  {experiment.variants.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                      <p className="text-xs font-medium text-foreground-muted mb-2">
                        Variants
                      </p>
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
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

          <button
            onClick={handleCreatePlan}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            Create Plan
          </button>
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
