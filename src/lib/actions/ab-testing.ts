"use server";

import { ok, type VoidActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";
import type { PortfolioABTestStatus, ABTestGoalType, PortfolioTemplate } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateABTestInput {
  portfolioWebsiteId: string;
  name: string;
  description?: string;
  controlTrafficPercent?: number;
  variantTrafficPercent?: number;
  variantHeroTitle?: string;
  variantHeroSubtitle?: string;
  variantPrimaryColor?: string;
  variantTemplate?: PortfolioTemplate;
  goalType?: ABTestGoalType;
  targetMetric?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateABTestInput {
  name?: string;
  description?: string;
  controlTrafficPercent?: number;
  variantTrafficPercent?: number;
  variantHeroTitle?: string;
  variantHeroSubtitle?: string;
  variantPrimaryColor?: string;
  variantTemplate?: PortfolioTemplate;
  goalType?: ABTestGoalType;
  targetMetric?: number;
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getABTests(portfolioId?: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const where: { organizationId: string; portfolioWebsiteId?: string } = { organizationId };
    if (portfolioId) {
      where.portfolioWebsiteId = portfolioId;
    }

    const tests = await prisma.portfolioABTest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        portfolioWebsite: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    return { success: true, tests };
  } catch (error) {
    console.error("Error fetching A/B tests:", error);
    return { success: false, error: "Failed to fetch A/B tests" };
  }
}

export async function getABTest(testId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const test = await prisma.portfolioABTest.findFirst({
      where: { id: testId, organizationId },
      include: {
        portfolioWebsite: {
          select: {
            id: true,
            name: true,
            slug: true,
            heroTitle: true,
            heroSubtitle: true,
            primaryColor: true,
            template: true,
          },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!test) {
      return { success: false, error: "A/B test not found" };
    }

    return { success: true, test };
  } catch (error) {
    console.error("Error fetching A/B test:", error);
    return { success: false, error: "Failed to fetch A/B test" };
  }
}

export async function createABTest(input: CreateABTestInput) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify portfolio belongs to org
    const portfolio = await prisma.portfolioWebsite.findFirst({
      where: { id: input.portfolioWebsiteId, organizationId },
    });

    if (!portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    // Check for existing active test
    const existingTest = await prisma.portfolioABTest.findFirst({
      where: {
        portfolioWebsiteId: input.portfolioWebsiteId,
        status: { in: ["running", "paused"] },
      },
    });

    if (existingTest) {
      return { success: false, error: "Portfolio already has an active A/B test. Complete or delete it first." };
    }

    // Validate traffic split
    const controlPercent = input.controlTrafficPercent ?? 50;
    const variantPercent = input.variantTrafficPercent ?? 50;

    if (controlPercent + variantPercent !== 100) {
      return { success: false, error: "Traffic percentages must add up to 100" };
    }

    const test = await prisma.portfolioABTest.create({
      data: {
        organizationId,
        portfolioWebsiteId: input.portfolioWebsiteId,
        name: input.name,
        description: input.description,
        controlTrafficPercent: controlPercent,
        variantTrafficPercent: variantPercent,
        variantHeroTitle: input.variantHeroTitle,
        variantHeroSubtitle: input.variantHeroSubtitle,
        variantPrimaryColor: input.variantPrimaryColor,
        variantTemplate: input.variantTemplate,
        goalType: input.goalType || "views",
        targetMetric: input.targetMetric,
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });

    revalidatePath("/portfolios");
    return { success: true, test };
  } catch (error) {
    console.error("Error creating A/B test:", error);
    return { success: false, error: "Failed to create A/B test" };
  }
}

export async function updateABTest(testId: string, input: UpdateABTestInput) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const existing = await prisma.portfolioABTest.findFirst({
      where: { id: testId, organizationId },
    });

    if (!existing) {
      return { success: false, error: "A/B test not found" };
    }

    // Can only update draft tests
    if (existing.status !== "draft") {
      return { success: false, error: "Cannot update a running or completed test" };
    }

    // Validate traffic split if provided
    if (input.controlTrafficPercent !== undefined || input.variantTrafficPercent !== undefined) {
      const controlPercent = input.controlTrafficPercent ?? existing.controlTrafficPercent;
      const variantPercent = input.variantTrafficPercent ?? existing.variantTrafficPercent;

      if (controlPercent + variantPercent !== 100) {
        return { success: false, error: "Traffic percentages must add up to 100" };
      }
    }

    const test = await prisma.portfolioABTest.update({
      where: { id: testId },
      data: input,
    });

    revalidatePath("/portfolios");
    return { success: true, test };
  } catch (error) {
    console.error("Error updating A/B test:", error);
    return { success: false, error: "Failed to update A/B test" };
  }
}

export async function deleteABTest(testId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const test = await prisma.portfolioABTest.findFirst({
      where: { id: testId, organizationId },
    });

    if (!test) {
      return { success: false, error: "A/B test not found" };
    }

    await prisma.portfolioABTest.delete({
      where: { id: testId },
    });

    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error deleting A/B test:", error);
    return { success: false, error: "Failed to delete A/B test" };
  }
}

// ============================================================================
// STATUS MANAGEMENT
// ============================================================================

export async function startABTest(testId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const test = await prisma.portfolioABTest.findFirst({
      where: { id: testId, organizationId },
    });

    if (!test) {
      return { success: false, error: "A/B test not found" };
    }

    if (test.status !== "draft" && test.status !== "paused") {
      return { success: false, error: "Can only start draft or paused tests" };
    }

    await prisma.portfolioABTest.update({
      where: { id: testId },
      data: {
        status: "running",
        startDate: test.startDate || new Date(),
      },
    });

    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error starting A/B test:", error);
    return { success: false, error: "Failed to start A/B test" };
  }
}

export async function pauseABTest(testId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const test = await prisma.portfolioABTest.findFirst({
      where: { id: testId, organizationId },
    });

    if (!test) {
      return { success: false, error: "A/B test not found" };
    }

    if (test.status !== "running") {
      return { success: false, error: "Can only pause running tests" };
    }

    await prisma.portfolioABTest.update({
      where: { id: testId },
      data: { status: "paused" },
    });

    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error pausing A/B test:", error);
    return { success: false, error: "Failed to pause A/B test" };
  }
}

export async function completeABTest(testId: string, winningVariant?: "control" | "variant") {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const test = await prisma.portfolioABTest.findFirst({
      where: { id: testId, organizationId },
    });

    if (!test) {
      return { success: false, error: "A/B test not found" };
    }

    await prisma.portfolioABTest.update({
      where: { id: testId },
      data: {
        status: "completed",
        endDate: new Date(),
        winningVariant,
      },
    });

    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error completing A/B test:", error);
    return { success: false, error: "Failed to complete A/B test" };
  }
}

// ============================================================================
// VISITOR ASSIGNMENT (Public)
// ============================================================================

export async function getABTestVariant(
  portfolioSlug: string,
  visitorId: string
): Promise<{
  success: boolean;
  variant?: "control" | "variant";
  testId?: string;
  variantSettings?: {
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    primaryColor?: string | null;
    template?: PortfolioTemplate | null;
  };
  error?: string;
}> {
  try {
    // Find the portfolio
    const portfolio = await prisma.portfolioWebsite.findUnique({
      where: { slug: portfolioSlug },
      select: { id: true },
    });

    if (!portfolio) {
      return { success: false, error: "Portfolio not found" };
    }

    // Check for active A/B test
    const test = await prisma.portfolioABTest.findFirst({
      where: {
        portfolioWebsiteId: portfolio.id,
        status: "running",
      },
    });

    if (!test) {
      // No active test, return control
      return { success: true, variant: "control" };
    }

    // Check for existing assignment
    const existingAssignment = await prisma.aBTestAssignment.findUnique({
      where: {
        testId_visitorId: {
          testId: test.id,
          visitorId,
        },
      },
    });

    if (existingAssignment) {
      const variant = existingAssignment.variant as "control" | "variant";
      return {
        success: true,
        variant,
        testId: test.id,
        variantSettings: variant === "variant" ? {
          heroTitle: test.variantHeroTitle,
          heroSubtitle: test.variantHeroSubtitle,
          primaryColor: test.variantPrimaryColor,
          template: test.variantTemplate,
        } : undefined,
      };
    }

    // Assign visitor to a variant based on traffic split
    const random = Math.random() * 100;
    const variant: "control" | "variant" = random < test.controlTrafficPercent ? "control" : "variant";

    // Create assignment
    await prisma.aBTestAssignment.create({
      data: {
        testId: test.id,
        visitorId,
        variant,
      },
    });

    // Increment view count
    const updateField = variant === "control" ? "controlViews" : "variantViews";
    await prisma.portfolioABTest.update({
      where: { id: test.id },
      data: { [updateField]: { increment: 1 } },
    });

    return {
      success: true,
      variant,
      testId: test.id,
      variantSettings: variant === "variant" ? {
        heroTitle: test.variantHeroTitle,
        heroSubtitle: test.variantHeroSubtitle,
        primaryColor: test.variantPrimaryColor,
        template: test.variantTemplate,
      } : undefined,
    };
  } catch (error) {
    console.error("Error getting A/B test variant:", error);
    return { success: false, error: "Failed to get variant" };
  }
}

export async function recordABTestConversion(
  testId: string,
  visitorId: string
): Promise<VoidActionResult> {
  try {
    const assignment = await prisma.aBTestAssignment.findUnique({
      where: {
        testId_visitorId: { testId, visitorId },
      },
    });

    if (!assignment || assignment.converted) {
      return ok(); // Already converted or not assigned
    }

    // Mark as converted
    await prisma.aBTestAssignment.update({
      where: { id: assignment.id },
      data: {
        converted: true,
        convertedAt: new Date(),
      },
    });

    // Increment conversion count
    const updateField = assignment.variant === "control" ? "controlConversions" : "variantConversions";
    await prisma.portfolioABTest.update({
      where: { id: testId },
      data: { [updateField]: { increment: 1 } },
    });

    return ok();
  } catch (error) {
    console.error("Error recording conversion:", error);
    return { success: false, error: "Failed to record conversion" };
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getABTestStats(testId: string) {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const test = await prisma.portfolioABTest.findFirst({
      where: { id: testId, organizationId },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!test) {
      return { success: false, error: "A/B test not found" };
    }

    // Calculate conversion rates
    const controlConversionRate = test.controlViews > 0
      ? (test.controlConversions / test.controlViews) * 100
      : 0;
    const variantConversionRate = test.variantViews > 0
      ? (test.variantConversions / test.variantViews) * 100
      : 0;

    // Simple statistical significance calculation
    // Using pooled proportion for standard error
    const totalViews = test.controlViews + test.variantViews;
    const totalConversions = test.controlConversions + test.variantConversions;
    const pooledRate = totalViews > 0 ? totalConversions / totalViews : 0;

    let zScore = 0;
    let pValue = 1;
    let isSignificant = false;

    if (test.controlViews > 0 && test.variantViews > 0 && pooledRate > 0 && pooledRate < 1) {
      const p1 = test.controlConversions / test.controlViews;
      const p2 = test.variantConversions / test.variantViews;
      const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1 / test.controlViews + 1 / test.variantViews));

      if (se > 0) {
        zScore = Math.abs(p1 - p2) / se;
        // Approximate p-value from z-score
        pValue = 2 * (1 - normalCDF(zScore));
        isSignificant = pValue < (1 - test.confidenceLevel);
      }
    }

    // Determine winner if significant
    let suggestedWinner: "control" | "variant" | null = null;
    if (isSignificant) {
      suggestedWinner = variantConversionRate > controlConversionRate ? "variant" : "control";
    }

    // Calculate relative improvement
    const relativeImprovement = controlConversionRate > 0
      ? ((variantConversionRate - controlConversionRate) / controlConversionRate) * 100
      : 0;

    return {
      success: true,
      stats: {
        control: {
          views: test.controlViews,
          conversions: test.controlConversions,
          conversionRate: controlConversionRate,
        },
        variant: {
          views: test.variantViews,
          conversions: test.variantConversions,
          conversionRate: variantConversionRate,
        },
        totalVisitors: test._count.assignments,
        relativeImprovement,
        zScore,
        pValue,
        isSignificant,
        suggestedWinner,
        confidenceLevel: test.confidenceLevel * 100,
      },
    };
  } catch (error) {
    console.error("Error fetching A/B test stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

// Helper: Standard normal CDF approximation
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}
