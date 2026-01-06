"use server";

import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type { PlanName, ExperimentStatus } from "@prisma/client";
import { ok, type ActionResult } from "@/lib/types/action-result";

export interface SubscriptionPlanInput {
  name: string;
  slug: string;
  plan: PlanName;
  description?: string | null;
  tagline?: string | null;
  badgeText?: string | null;
  displayOrder?: number;
  isHighlighted?: boolean;
  highlightColor?: string | null;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  trialDays?: number;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface PlanFeatureInput {
  planId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  featureKey: string;
  featureValue: string;
  displayOrder?: number;
  isHighlighted?: boolean;
  tooltip?: string | null;
}

export interface PricingExperimentInput {
  name: string;
  slug: string;
  description?: string | null;
  hypothesis?: string | null;
  trafficPercent?: number;
  landingPagePaths?: string[];
}

export interface PricingVariantInput {
  experimentId?: string | null;
  planId: string;
  name: string;
  description?: string | null;
  isControl?: boolean;
  monthlyPriceCents?: number | null;
  yearlyPriceCents?: number | null;
  trialDays?: number | null;
  badgeText?: string | null;
  isHighlighted?: boolean | null;
}

// =============================================================================
// Subscription Plans CRUD
// =============================================================================

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        features: {
          orderBy: { displayOrder: "asc" },
        },
        pricingVariants: {
          where: { isActive: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return { success: true as const, data: plans };
  } catch (error) {
    console.error("[SubscriptionPlans] Error fetching plans:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch plans",
    };
  }
}

/**
 * Get a single subscription plan by ID or slug
 */
export async function getSubscriptionPlan(idOrSlug: string) {
  try {
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        features: {
          orderBy: { displayOrder: "asc" },
        },
        pricingVariants: true,
      },
    });

    if (!plan) {
      return { success: false as const, error: "Plan not found" };
    }

    return { success: true as const, data: plan };
  } catch (error) {
    console.error("[SubscriptionPlans] Error fetching plan:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch plan",
    };
  }
}

/**
 * Create a new subscription plan
 */
export async function createSubscriptionPlan(
  input: SubscriptionPlanInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate slug is unique
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { slug: input.slug },
    });

    if (existing) {
      return { success: false, error: "A plan with this slug already exists" };
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: input.name,
        slug: input.slug,
        plan: input.plan,
        description: input.description,
        tagline: input.tagline,
        badgeText: input.badgeText,
        displayOrder: input.displayOrder ?? 0,
        isHighlighted: input.isHighlighted ?? false,
        highlightColor: input.highlightColor,
        monthlyPriceCents: input.monthlyPriceCents,
        yearlyPriceCents: input.yearlyPriceCents,
        trialDays: input.trialDays ?? 14,
        isActive: input.isActive ?? true,
        isPublic: input.isPublic ?? true,
      },
    });

    return { success: true, data: { id: plan.id } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error creating plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create plan",
    };
  }
}

/**
 * Update a subscription plan
 */
export async function updateSubscriptionPlan(
  id: string,
  input: Partial<SubscriptionPlanInput>
): Promise<ActionResult<{ id: string }>> {
  try {
    // Check if plan exists
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Plan not found" };
    }

    // If updating slug, check it's unique
    if (input.slug && input.slug !== existing.slug) {
      const slugExists = await prisma.subscriptionPlan.findUnique({
        where: { slug: input.slug },
      });
      if (slugExists) {
        return { success: false, error: "A plan with this slug already exists" };
      }
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.plan !== undefined && { plan: input.plan }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.tagline !== undefined && { tagline: input.tagline }),
        ...(input.badgeText !== undefined && { badgeText: input.badgeText }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.isHighlighted !== undefined && { isHighlighted: input.isHighlighted }),
        ...(input.highlightColor !== undefined && { highlightColor: input.highlightColor }),
        ...(input.monthlyPriceCents !== undefined && { monthlyPriceCents: input.monthlyPriceCents }),
        ...(input.yearlyPriceCents !== undefined && { yearlyPriceCents: input.yearlyPriceCents }),
        ...(input.trialDays !== undefined && { trialDays: input.trialDays }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
      },
    });

    return { success: true, data: { id: plan.id } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error updating plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update plan",
    };
  }
}

/**
 * Delete a subscription plan
 */
export async function deleteSubscriptionPlan(
  id: string
): Promise<ActionResult> {
  try {
    await prisma.subscriptionPlan.delete({
      where: { id },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[SubscriptionPlans] Error deleting plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete plan",
    };
  }
}

// =============================================================================
// Plan Features CRUD
// =============================================================================

/**
 * Add a feature to a plan
 */
export async function addPlanFeature(
  input: PlanFeatureInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const feature = await prisma.planFeature.create({
      data: {
        planId: input.planId,
        name: input.name,
        description: input.description,
        category: input.category,
        featureKey: input.featureKey,
        featureValue: input.featureValue,
        displayOrder: input.displayOrder ?? 0,
        isHighlighted: input.isHighlighted ?? false,
        tooltip: input.tooltip,
      },
    });

    return { success: true, data: { id: feature.id } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error adding feature:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add feature",
    };
  }
}

/**
 * Update a plan feature
 */
export async function updatePlanFeature(
  id: string,
  input: Partial<PlanFeatureInput>
): Promise<ActionResult<{ id: string }>> {
  try {
    const feature = await prisma.planFeature.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.featureKey !== undefined && { featureKey: input.featureKey }),
        ...(input.featureValue !== undefined && { featureValue: input.featureValue }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.isHighlighted !== undefined && { isHighlighted: input.isHighlighted }),
        ...(input.tooltip !== undefined && { tooltip: input.tooltip }),
      },
    });

    return { success: true, data: { id: feature.id } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error updating feature:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update feature",
    };
  }
}

/**
 * Delete a plan feature
 */
export async function deletePlanFeature(id: string): Promise<ActionResult> {
  try {
    await prisma.planFeature.delete({
      where: { id },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[SubscriptionPlans] Error deleting feature:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete feature",
    };
  }
}

// =============================================================================
// Stripe Sync
// =============================================================================

/**
 * Sync a subscription plan to Stripe
 */
export async function syncPlanToStripe(
  planId: string
): Promise<ActionResult<{ stripeProductId: string }>> {
  try {
    const stripe = getStripe();

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { features: true },
    });

    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    let stripeProductId = plan.stripeProductId;

    // Create or update Stripe Product
    if (stripeProductId) {
      // Update existing product
      await stripe.products.update(stripeProductId, {
        name: plan.name,
        description: plan.description || undefined,
        metadata: {
          listinglens_plan_id: plan.id,
          plan_type: plan.plan,
        },
      });
    } else {
      // Create new product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description || undefined,
        metadata: {
          listinglens_plan_id: plan.id,
          plan_type: plan.plan,
          type: "subscription_plan",
        },
      });
      stripeProductId = product.id;
    }

    // Create/update monthly price
    let stripeMonthlyPriceId = plan.stripeMonthlyPriceId;
    if (plan.monthlyPriceCents > 0) {
      // Check if we need a new price (Stripe prices are immutable)
      if (stripeMonthlyPriceId) {
        const existingPrice = await stripe.prices.retrieve(stripeMonthlyPriceId);
        if (existingPrice.unit_amount !== plan.monthlyPriceCents) {
          // Archive old price and create new one
          await stripe.prices.update(stripeMonthlyPriceId, { active: false });
          stripeMonthlyPriceId = null;
        }
      }

      if (!stripeMonthlyPriceId) {
        const monthlyPrice = await stripe.prices.create({
          product: stripeProductId,
          currency: "usd",
          unit_amount: plan.monthlyPriceCents,
          recurring: { interval: "month" },
          metadata: {
            listinglens_plan_id: plan.id,
            billing_interval: "monthly",
          },
        });
        stripeMonthlyPriceId = monthlyPrice.id;
      }
    }

    // Create/update yearly price
    let stripeYearlyPriceId = plan.stripeYearlyPriceId;
    if (plan.yearlyPriceCents > 0) {
      if (stripeYearlyPriceId) {
        const existingPrice = await stripe.prices.retrieve(stripeYearlyPriceId);
        if (existingPrice.unit_amount !== plan.yearlyPriceCents) {
          await stripe.prices.update(stripeYearlyPriceId, { active: false });
          stripeYearlyPriceId = null;
        }
      }

      if (!stripeYearlyPriceId) {
        const yearlyPrice = await stripe.prices.create({
          product: stripeProductId,
          currency: "usd",
          unit_amount: plan.yearlyPriceCents,
          recurring: { interval: "year" },
          metadata: {
            listinglens_plan_id: plan.id,
            billing_interval: "yearly",
          },
        });
        stripeYearlyPriceId = yearlyPrice.id;
      }
    }

    // Update plan with Stripe IDs
    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        stripeProductId,
        stripeMonthlyPriceId,
        stripeYearlyPriceId,
        stripeSyncedAt: new Date(),
      },
    });

    return { success: true, data: { stripeProductId } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error syncing to Stripe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync to Stripe",
    };
  }
}

/**
 * Sync all subscription plans to Stripe
 */
export async function syncAllPlansToStripe(): Promise<
  ActionResult<{ synced: number; failed: number; errors: string[] }>
> {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
    });

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const plan of plans) {
      const result = await syncPlanToStripe(plan.id);
      if (result.success) {
        synced++;
      } else {
        failed++;
        errors.push(`${plan.name}: ${"error" in result ? result.error : "Unknown error"}`);
      }
    }

    return { success: true, data: { synced, failed, errors } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error syncing all plans:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync plans",
    };
  }
}

// =============================================================================
// Pricing Experiments
// =============================================================================

/**
 * Get all pricing experiments
 */
export async function getPricingExperiments() {
  try {
    const experiments = await prisma.pricingExperiment.findMany({
      include: {
        variants: {
          include: {
            plan: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, data: experiments };
  } catch (error) {
    console.error("[SubscriptionPlans] Error fetching experiments:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch experiments",
    };
  }
}

/**
 * Create a pricing experiment
 */
export async function createPricingExperiment(
  input: PricingExperimentInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const experiment = await prisma.pricingExperiment.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        hypothesis: input.hypothesis,
        trafficPercent: input.trafficPercent ?? 50,
        landingPagePaths: input.landingPagePaths ?? [],
      },
    });

    return { success: true, data: { id: experiment.id } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error creating experiment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create experiment",
    };
  }
}

/**
 * Update experiment status
 */
export async function updateExperimentStatus(
  id: string,
  status: ExperimentStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const updateData: Record<string, unknown> = { status };

    if (status === "active") {
      updateData.startDate = new Date();
    } else if (status === "completed" || status === "archived") {
      updateData.endDate = new Date();
    }

    const experiment = await prisma.pricingExperiment.update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: { id: experiment.id } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error updating experiment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update experiment",
    };
  }
}

// =============================================================================
// Pricing Variants
// =============================================================================

/**
 * Create a pricing variant
 */
export async function createPricingVariant(
  input: PricingVariantInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const variant = await prisma.pricingVariant.create({
      data: {
        experimentId: input.experimentId,
        planId: input.planId,
        name: input.name,
        description: input.description,
        isControl: input.isControl ?? false,
        monthlyPriceCents: input.monthlyPriceCents,
        yearlyPriceCents: input.yearlyPriceCents,
        trialDays: input.trialDays,
        badgeText: input.badgeText,
        isHighlighted: input.isHighlighted,
      },
    });

    return { success: true, data: { id: variant.id } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error creating variant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create variant",
    };
  }
}

/**
 * Sync a pricing variant to Stripe (creates separate prices for the variant)
 */
export async function syncVariantToStripe(
  variantId: string
): Promise<ActionResult<{ stripeMonthlyPriceId?: string; stripeYearlyPriceId?: string }>> {
  try {
    const stripe = getStripe();

    const variant = await prisma.pricingVariant.findUnique({
      where: { id: variantId },
      include: { plan: true },
    });

    if (!variant) {
      return { success: false, error: "Variant not found" };
    }

    if (!variant.plan.stripeProductId) {
      return { success: false, error: "Plan must be synced to Stripe first" };
    }

    const monthlyPrice = variant.monthlyPriceCents ?? variant.plan.monthlyPriceCents;
    const yearlyPrice = variant.yearlyPriceCents ?? variant.plan.yearlyPriceCents;

    let stripeMonthlyPriceId = variant.stripeMonthlyPriceId;
    let stripeYearlyPriceId = variant.stripeYearlyPriceId;

    // Create monthly price for variant
    if (monthlyPrice > 0 && !stripeMonthlyPriceId) {
      const price = await stripe.prices.create({
        product: variant.plan.stripeProductId,
        currency: "usd",
        unit_amount: monthlyPrice,
        recurring: { interval: "month" },
        metadata: {
          listinglens_plan_id: variant.planId,
          listinglens_variant_id: variant.id,
          billing_interval: "monthly",
          is_variant: "true",
        },
      });
      stripeMonthlyPriceId = price.id;
    }

    // Create yearly price for variant
    if (yearlyPrice > 0 && !stripeYearlyPriceId) {
      const price = await stripe.prices.create({
        product: variant.plan.stripeProductId,
        currency: "usd",
        unit_amount: yearlyPrice,
        recurring: { interval: "year" },
        metadata: {
          listinglens_plan_id: variant.planId,
          listinglens_variant_id: variant.id,
          billing_interval: "yearly",
          is_variant: "true",
        },
      });
      stripeYearlyPriceId = price.id;
    }

    // Update variant with Stripe IDs
    await prisma.pricingVariant.update({
      where: { id: variantId },
      data: {
        stripeMonthlyPriceId,
        stripeYearlyPriceId,
        stripeSyncedAt: new Date(),
      },
    });

    return { success: true, data: { stripeMonthlyPriceId: stripeMonthlyPriceId ?? undefined, stripeYearlyPriceId: stripeYearlyPriceId ?? undefined } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error syncing variant to Stripe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync variant",
    };
  }
}

/**
 * Record an impression for a variant (for A/B testing tracking)
 */
export async function recordVariantImpression(variantId: string): Promise<void> {
  try {
    await prisma.pricingVariant.update({
      where: { id: variantId },
      data: { impressions: { increment: 1 } },
    });
  } catch (error) {
    console.error("[SubscriptionPlans] Error recording impression:", error);
  }
}

/**
 * Record a conversion for a variant (for A/B testing tracking)
 */
export async function recordVariantConversion(variantId: string): Promise<void> {
  try {
    await prisma.pricingVariant.update({
      where: { id: variantId },
      data: { conversions: { increment: 1 } },
    });
  } catch (error) {
    console.error("[SubscriptionPlans] Error recording conversion:", error);
  }
}

// =============================================================================
// Public API for Pricing Page
// =============================================================================

/**
 * Get active plans for the public pricing page
 * Optionally applies A/B testing variants based on experiment
 */
export async function getPublicPricingPlans(experimentSlug?: string) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true, isPublic: true },
      include: {
        features: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    // If experiment provided, check for active variants
    if (experimentSlug) {
      const experiment = await prisma.pricingExperiment.findFirst({
        where: { slug: experimentSlug, status: "active" },
        include: {
          variants: {
            where: { isActive: true },
            include: { plan: true },
          },
        },
      });

      if (experiment && experiment.variants.length > 0) {
        // Apply variant pricing overrides
        type VariantType = (typeof experiment.variants)[number];
        const variantMap = new Map<string, VariantType>(
          experiment.variants.map((v) => [v.planId, v])
        );

        const plansWithVariants = plans.map((plan) => {
          const variant = variantMap.get(plan.id);
          if (variant) {
            return {
              ...plan,
              monthlyPriceCents: variant.monthlyPriceCents ?? plan.monthlyPriceCents,
              yearlyPriceCents: variant.yearlyPriceCents ?? plan.yearlyPriceCents,
              trialDays: variant.trialDays ?? plan.trialDays,
              badgeText: variant.badgeText ?? plan.badgeText,
              isHighlighted: variant.isHighlighted ?? plan.isHighlighted,
              _variantId: variant.id, // For tracking
            };
          }
          return plan;
        });

        return { success: true as const, data: plansWithVariants, experiment };
      }
    }

    return { success: true as const, data: plans };
  } catch (error) {
    console.error("[SubscriptionPlans] Error fetching public plans:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch plans",
    };
  }
}

// =============================================================================
// Seed Default Plans
// =============================================================================

const DEFAULT_PLANS = [
  {
    name: "Pro",
    slug: "pro",
    plan: "pro" as PlanName,
    description: "Everything you need to run a professional photography business",
    tagline: "For growing photographers",
    badgeText: null,
    displayOrder: 1,
    isHighlighted: false,
    monthlyPriceCents: 4900, // $49/mo
    yearlyPriceCents: 47000, // $470/yr (save ~$118)
    trialDays: 14,
    features: [
      { name: "Unlimited Galleries", featureKey: "galleries_limit", featureValue: "unlimited", category: "Core" },
      { name: "50GB Storage", featureKey: "storage_gb", featureValue: "50", category: "Storage" },
      { name: "Custom Branding", featureKey: "custom_branding", featureValue: "true", category: "Branding" },
      { name: "Client Portal", featureKey: "client_portal", featureValue: "true", category: "Core" },
      { name: "Online Booking", featureKey: "online_booking", featureValue: "true", category: "Core" },
      { name: "Invoicing & Payments", featureKey: "invoicing", featureValue: "true", category: "Core" },
      { name: "Email Support", featureKey: "support_level", featureValue: "email", category: "Support" },
      { name: "2 Team Members", featureKey: "team_members", featureValue: "2", category: "Team" },
    ],
  },
  {
    name: "Studio",
    slug: "studio",
    plan: "studio" as PlanName,
    description: "Advanced features for established studios with teams",
    tagline: "For professional studios",
    badgeText: "Most Popular",
    displayOrder: 2,
    isHighlighted: true,
    monthlyPriceCents: 9900, // $99/mo
    yearlyPriceCents: 95000, // $950/yr (save ~$238)
    trialDays: 14,
    features: [
      { name: "Unlimited Galleries", featureKey: "galleries_limit", featureValue: "unlimited", category: "Core" },
      { name: "200GB Storage", featureKey: "storage_gb", featureValue: "200", category: "Storage" },
      { name: "Custom Branding", featureKey: "custom_branding", featureValue: "true", category: "Branding" },
      { name: "White-Label Option", featureKey: "white_label", featureValue: "true", category: "Branding" },
      { name: "Client Portal", featureKey: "client_portal", featureValue: "true", category: "Core" },
      { name: "Online Booking", featureKey: "online_booking", featureValue: "true", category: "Core" },
      { name: "Invoicing & Payments", featureKey: "invoicing", featureValue: "true", category: "Core" },
      { name: "Contracts & E-Sign", featureKey: "contracts", featureValue: "true", category: "Core" },
      { name: "Priority Support", featureKey: "support_level", featureValue: "priority", category: "Support" },
      { name: "10 Team Members", featureKey: "team_members", featureValue: "10", category: "Team" },
      { name: "Advanced Analytics", featureKey: "analytics", featureValue: "advanced", category: "Analytics" },
      { name: "API Access", featureKey: "api_access", featureValue: "true", category: "Integrations" },
    ],
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    plan: "enterprise" as PlanName,
    description: "Custom solutions for large teams and agencies",
    tagline: "For agencies & large teams",
    badgeText: null,
    displayOrder: 3,
    isHighlighted: false,
    monthlyPriceCents: 24900, // $249/mo
    yearlyPriceCents: 239000, // $2390/yr (save ~$598)
    trialDays: 30,
    features: [
      { name: "Unlimited Galleries", featureKey: "galleries_limit", featureValue: "unlimited", category: "Core" },
      { name: "Unlimited Storage", featureKey: "storage_gb", featureValue: "unlimited", category: "Storage" },
      { name: "Custom Branding", featureKey: "custom_branding", featureValue: "true", category: "Branding" },
      { name: "Full White-Label", featureKey: "white_label", featureValue: "full", category: "Branding" },
      { name: "Custom Domain", featureKey: "custom_domain", featureValue: "true", category: "Branding" },
      { name: "Client Portal", featureKey: "client_portal", featureValue: "true", category: "Core" },
      { name: "Online Booking", featureKey: "online_booking", featureValue: "true", category: "Core" },
      { name: "Invoicing & Payments", featureKey: "invoicing", featureValue: "true", category: "Core" },
      { name: "Contracts & E-Sign", featureKey: "contracts", featureValue: "true", category: "Core" },
      { name: "Dedicated Support", featureKey: "support_level", featureValue: "dedicated", category: "Support" },
      { name: "Unlimited Team Members", featureKey: "team_members", featureValue: "unlimited", category: "Team" },
      { name: "Advanced Analytics", featureKey: "analytics", featureValue: "advanced", category: "Analytics" },
      { name: "Full API Access", featureKey: "api_access", featureValue: "full", category: "Integrations" },
      { name: "SSO/SAML", featureKey: "sso", featureValue: "true", category: "Integrations" },
      { name: "Custom Integrations", featureKey: "custom_integrations", featureValue: "true", category: "Integrations" },
      { name: "SLA Guarantee", featureKey: "sla", featureValue: "99.9", category: "Support" },
    ],
  },
];

/**
 * Seed default subscription plans (Pro, Studio, Enterprise)
 */
export async function seedDefaultPlans(): Promise<
  ActionResult<{ created: number; skipped: number }>
> {
  try {
    let created = 0;
    let skipped = 0;

    for (const planData of DEFAULT_PLANS) {
      // Check if plan already exists
      const existing = await prisma.subscriptionPlan.findUnique({
        where: { slug: planData.slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create the plan
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name: planData.name,
          slug: planData.slug,
          plan: planData.plan,
          description: planData.description,
          tagline: planData.tagline,
          badgeText: planData.badgeText,
          displayOrder: planData.displayOrder,
          isHighlighted: planData.isHighlighted,
          monthlyPriceCents: planData.monthlyPriceCents,
          yearlyPriceCents: planData.yearlyPriceCents,
          trialDays: planData.trialDays,
        },
      });

      // Create features for the plan
      for (let i = 0; i < planData.features.length; i++) {
        const feature = planData.features[i];
        await prisma.planFeature.create({
          data: {
            planId: plan.id,
            name: feature.name,
            featureKey: feature.featureKey,
            featureValue: feature.featureValue,
            category: feature.category,
            displayOrder: i,
          },
        });
      }

      created++;
    }

    return { success: true, data: { created, skipped } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error seeding default plans:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to seed plans",
    };
  }
}

// =============================================================================
// Clone Plan
// =============================================================================

/**
 * Clone an existing subscription plan with all its features
 */
export async function cloneSubscriptionPlan(
  planId: string,
  newName?: string,
  newSlug?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // Get the source plan with features
    const sourcePlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { features: true },
    });

    if (!sourcePlan) {
      return { success: false, error: "Source plan not found" };
    }

    // Generate new name and slug if not provided
    const cloneName = newName || `${sourcePlan.name} (Copy)`;
    const cloneSlug = newSlug || `${sourcePlan.slug}-copy-${Date.now()}`;

    // Check slug is unique
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { slug: cloneSlug },
    });

    if (existing) {
      return { success: false, error: "A plan with this slug already exists" };
    }

    // Create the cloned plan
    const clonedPlan = await prisma.subscriptionPlan.create({
      data: {
        name: cloneName,
        slug: cloneSlug,
        plan: sourcePlan.plan,
        description: sourcePlan.description,
        tagline: sourcePlan.tagline,
        badgeText: sourcePlan.badgeText,
        displayOrder: sourcePlan.displayOrder + 1,
        isHighlighted: false, // Don't copy highlighted status
        highlightColor: sourcePlan.highlightColor,
        monthlyPriceCents: sourcePlan.monthlyPriceCents,
        yearlyPriceCents: sourcePlan.yearlyPriceCents,
        trialDays: sourcePlan.trialDays,
        isActive: false, // Start as inactive
        isPublic: false, // Start as private
      },
    });

    // Clone all features
    for (const feature of sourcePlan.features) {
      await prisma.planFeature.create({
        data: {
          planId: clonedPlan.id,
          name: feature.name,
          description: feature.description,
          category: feature.category,
          featureKey: feature.featureKey,
          featureValue: feature.featureValue,
          displayOrder: feature.displayOrder,
          isHighlighted: feature.isHighlighted,
          tooltip: feature.tooltip,
        },
      });
    }

    return { success: true, data: { id: clonedPlan.id } };
  } catch (error) {
    console.error("[SubscriptionPlans] Error cloning plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clone plan",
    };
  }
}

// =============================================================================
// Delete Pricing Variant
// =============================================================================

/**
 * Delete a pricing variant
 */
export async function deletePricingVariant(id: string): Promise<ActionResult> {
  try {
    await prisma.pricingVariant.delete({
      where: { id },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[SubscriptionPlans] Error deleting variant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete variant",
    };
  }
}

// =============================================================================
// Environment Check
// =============================================================================

export interface EnvironmentStatus {
  stripe: { configured: boolean; mode: "live" | "test" | null };
  twilio: { configured: boolean };
  resend: { configured: boolean };
  clerk: { configured: boolean };
  database: { configured: boolean };
  storage: { configured: boolean; provider: string | null };
}

/**
 * Check which integrations are configured
 */
export async function checkEnvironmentStatus(): Promise<EnvironmentStatus> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeMode = stripeKey
    ? stripeKey.startsWith("sk_live_")
      ? "live"
      : "test"
    : null;

  return {
    stripe: {
      configured: !!stripeKey,
      mode: stripeMode,
    },
    twilio: {
      configured: !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      ),
    },
    resend: {
      configured: !!process.env.RESEND_API_KEY,
    },
    clerk: {
      configured: !!(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        process.env.CLERK_SECRET_KEY
      ),
    },
    database: {
      configured: !!process.env.DATABASE_URL,
    },
    storage: {
      configured: !!(
        process.env.AWS_ACCESS_KEY_ID ||
        process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
        process.env.UPLOADTHING_SECRET
      ),
      provider: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
        ? "Cloudflare R2"
        : process.env.AWS_ACCESS_KEY_ID
        ? "AWS S3"
        : process.env.UPLOADTHING_SECRET
        ? "UploadThing"
        : null,
    },
  };
}
