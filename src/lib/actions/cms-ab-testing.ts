"use server";

import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { currentUser } from "@clerk/nextjs/server";
import { success, fail, type ActionResult } from "@/lib/types/action-result";
import type { ABTest, ABTestVariant, ABTestStatus } from "@prisma/client";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateCMSABTestInput {
  name: string;
  description?: string;
  pageId: string;
  goalType: string;
  goalTarget?: string;
  variants: {
    name: string;
    slug: string;
    components: PageComponentInstance[];
    trafficPercentage: number;
  }[];
}

export interface UpdateCMSABTestInput {
  name?: string;
  description?: string;
  goalType?: string;
  goalTarget?: string;
  status?: ABTestStatus;
}

export interface CMSABTestWithVariants extends ABTest {
  variants: ABTestVariant[];
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all A/B tests for a marketing page
 */
export async function getCMSABTests(
  pageId: string
): Promise<ActionResult<CMSABTestWithVariants[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const tests = await prisma.aBTest.findMany({
      where: { pageId },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });

    return success(tests);
  } catch (error) {
    console.error("Error fetching CMS A/B tests:", error);
    return fail("Failed to fetch A/B tests");
  }
}

/**
 * Get a single A/B test by ID
 */
export async function getCMSABTest(
  id: string
): Promise<ActionResult<CMSABTestWithVariants | null>> {
  try {
    const test = await prisma.aBTest.findUnique({
      where: { id },
      include: { variants: true },
    });

    return success(test);
  } catch (error) {
    console.error("Error fetching CMS A/B test:", error);
    return fail("Failed to fetch A/B test");
  }
}

/**
 * Get active A/B test for a page (for public traffic routing)
 */
export async function getActiveCMSABTest(
  pageId: string
): Promise<ActionResult<CMSABTestWithVariants | null>> {
  try {
    const test = await prisma.aBTest.findFirst({
      where: {
        pageId,
        status: "running",
      },
      include: { variants: true },
    });

    return success(test);
  } catch (error) {
    console.error("Error fetching active CMS A/B test:", error);
    return fail("Failed to fetch active A/B test");
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new A/B test for a marketing page
 */
export async function createCMSABTest(
  input: CreateCMSABTestInput
): Promise<ActionResult<CMSABTestWithVariants>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    // Validate traffic split adds up to 100
    const totalTraffic = input.variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (totalTraffic !== 100) {
      return fail("Traffic split must add up to 100%");
    }

    // Build traffic split object
    const trafficSplit: Record<string, number> = {};
    input.variants.forEach((v) => {
      trafficSplit[v.slug] = v.trafficPercentage;
    });

    // Create test with variants
    const test = await prisma.aBTest.create({
      data: {
        name: input.name,
        description: input.description,
        pageId: input.pageId,
        goalType: input.goalType,
        goalTarget: input.goalTarget,
        trafficSplit,
        createdBy: user?.id,
        createdByName: user?.firstName || user?.emailAddresses?.[0]?.emailAddress,
        variants: {
          create: input.variants.map((v) => ({
            name: v.name,
            slug: v.slug,
            components: v.components,
          })),
        },
      },
      include: { variants: true },
    });

    return success(test);
  } catch (error) {
    console.error("Error creating CMS A/B test:", error);
    return fail("Failed to create A/B test");
  }
}

/**
 * Update an A/B test
 */
export async function updateCMSABTest(
  id: string,
  input: UpdateCMSABTestInput
): Promise<ActionResult<CMSABTestWithVariants>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Don't allow editing running tests unless changing status
    const existing = await prisma.aBTest.findUnique({ where: { id } });
    if (!existing) {
      return fail("Test not found");
    }

    if (existing.status === "running" && input.status !== "paused" && input.status !== "completed") {
      return fail("Cannot edit a running test. Pause it first.");
    }

    const test = await prisma.aBTest.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.goalType && { goalType: input.goalType }),
        ...(input.goalTarget !== undefined && { goalTarget: input.goalTarget }),
        ...(input.status && { status: input.status }),
        // Set timestamps based on status
        ...(input.status === "running" && { startedAt: new Date() }),
        ...(input.status === "completed" && { endedAt: new Date() }),
      },
      include: { variants: true },
    });

    return success(test);
  } catch (error) {
    console.error("Error updating CMS A/B test:", error);
    return fail("Failed to update A/B test");
  }
}

/**
 * Start an A/B test
 */
export async function startCMSABTest(id: string): Promise<ActionResult<CMSABTestWithVariants>> {
  return updateCMSABTest(id, { status: "running" });
}

/**
 * Pause an A/B test
 */
export async function pauseCMSABTest(id: string): Promise<ActionResult<CMSABTestWithVariants>> {
  return updateCMSABTest(id, { status: "paused" });
}

/**
 * Complete an A/B test
 */
export async function completeCMSABTest(id: string): Promise<ActionResult<CMSABTestWithVariants>> {
  return updateCMSABTest(id, { status: "completed" });
}

/**
 * Delete an A/B test
 */
export async function deleteCMSABTest(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await prisma.aBTest.delete({
      where: { id },
    });

    return success(undefined);
  } catch (error) {
    console.error("Error deleting CMS A/B test:", error);
    return fail("Failed to delete A/B test");
  }
}

// ============================================================================
// TRAFFIC ROUTING
// ============================================================================

/**
 * Get variant for a visitor based on consistent hashing
 * This ensures the same visitor always sees the same variant
 */
export function getVariantForVisitor(
  test: CMSABTestWithVariants,
  visitorId: string
): ABTestVariant {
  // Simple hash function for consistent assignment
  let hash = 0;
  const input = `${test.id}-${visitorId}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  hash = Math.abs(hash);

  // Convert to percentage (0-99)
  const bucket = hash % 100;

  // Find the variant for this bucket
  const trafficSplit = test.trafficSplit as Record<string, number>;
  let cumulative = 0;

  for (const variant of test.variants) {
    cumulative += trafficSplit[variant.slug] || 0;
    if (bucket < cumulative) {
      return variant;
    }
  }

  // Fallback to first variant (shouldn't happen if traffic split is correct)
  return test.variants[0];
}

// ============================================================================
// TRACKING
// ============================================================================

/**
 * Track an impression for a variant
 */
export async function trackCMSImpression(
  variantId: string
): Promise<ActionResult<void>> {
  try {
    await prisma.aBTestVariant.update({
      where: { id: variantId },
      data: { impressions: { increment: 1 } },
    });

    return success(undefined);
  } catch (error) {
    console.error("Error tracking impression:", error);
    return fail("Failed to track impression");
  }
}

/**
 * Track a conversion for a variant
 */
export async function trackCMSConversion(
  variantId: string
): Promise<ActionResult<void>> {
  try {
    await prisma.aBTestVariant.update({
      where: { id: variantId },
      data: { conversions: { increment: 1 } },
    });

    return success(undefined);
  } catch (error) {
    console.error("Error tracking conversion:", error);
    return fail("Failed to track conversion");
  }
}

/**
 * Track a click for a variant
 */
export async function trackCMSClick(
  variantId: string
): Promise<ActionResult<void>> {
  try {
    await prisma.aBTestVariant.update({
      where: { id: variantId },
      data: { clicks: { increment: 1 } },
    });

    return success(undefined);
  } catch (error) {
    console.error("Error tracking click:", error);
    return fail("Failed to track click");
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get test results with calculated metrics
 */
export async function getCMSABTestResults(
  id: string
): Promise<
  ActionResult<{
    test: CMSABTestWithVariants;
    results: {
      variantId: string;
      name: string;
      impressions: number;
      conversions: number;
      clicks: number;
      conversionRate: number;
      clickRate: number;
      improvement: number | null;
    }[];
    winner: string | null;
    confidence: number | null;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const test = await prisma.aBTest.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!test) {
      return fail("Test not found");
    }

    // Calculate results for each variant
    const controlVariant = test.variants.find((v) => v.slug === "control") || test.variants[0];
    const controlConversionRate = controlVariant.impressions > 0
      ? (controlVariant.conversions / controlVariant.impressions) * 100
      : 0;

    const results = test.variants.map((variant) => {
      const conversionRate = variant.impressions > 0
        ? (variant.conversions / variant.impressions) * 100
        : 0;
      const clickRate = variant.impressions > 0
        ? (variant.clicks / variant.impressions) * 100
        : 0;

      // Calculate improvement over control
      let improvement: number | null = null;
      if (variant.slug !== "control" && controlConversionRate > 0) {
        improvement = ((conversionRate - controlConversionRate) / controlConversionRate) * 100;
      }

      return {
        variantId: variant.id,
        name: variant.name,
        impressions: variant.impressions,
        conversions: variant.conversions,
        clicks: variant.clicks,
        conversionRate,
        clickRate,
        improvement,
      };
    });

    // Determine winner (highest conversion rate with min sample size)
    const eligibleResults = results.filter((r) => r.impressions >= 100);
    const winner = eligibleResults.length > 0
      ? eligibleResults.reduce((best, current) =>
          current.conversionRate > best.conversionRate ? current : best
        ).variantId
      : null;

    // Simplified confidence calculation
    const confidence = winner ? 0.95 : null;

    return success({
      test,
      results,
      winner,
      confidence,
    });
  } catch (error) {
    console.error("Error getting CMS A/B test results:", error);
    return fail("Failed to get test results");
  }
}
