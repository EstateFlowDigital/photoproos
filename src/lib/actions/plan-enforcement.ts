"use server";

/**
 * Plan Enforcement Actions
 *
 * Server actions for checking and enforcing plan limits.
 * Use these before creating resources that have limits.
 */

import { prisma } from "@/lib/db";
import { requireOrganizationId, getOrganizationId } from "@/lib/actions/auth-helper";
import {
  checkLimit,
  canPerformAction,
  hasFeature,
  getLimit,
  isUnlimited,
  type LimitKey,
  type FeatureKey,
  LIMIT_METADATA,
  FEATURE_METADATA,
} from "@/lib/plan-limits";
import type { PlanName } from "@prisma/client";
import { fail, ok, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// TYPES
// =============================================================================

interface LimitCheckResult {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
  isUnlimited: boolean;
  message?: string;
  upgradeRequired?: boolean;
}

interface FeatureCheckResult {
  allowed: boolean;
  feature: string;
  message?: string;
  upgradeRequired?: boolean;
}

interface UsageStats {
  plan: PlanName;
  hasLifetimeLicense: boolean;
  limits: Record<
    string,
    {
      current: number;
      limit: number;
      remaining: number;
      isUnlimited: boolean;
      percentUsed: number;
    }
  >;
}

// =============================================================================
// CORE LIMIT CHECKING
// =============================================================================

/**
 * Get the current organization's plan
 */
export async function getOrganizationPlan(): Promise<ActionResult<{ plan: PlanName; hasLifetimeLicense: boolean }>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, hasLifetimeLicense: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Lifetime license holders get enterprise-level access
    const effectivePlan = org.hasLifetimeLicense ? "enterprise" : org.plan;

    return success({ plan: effectivePlan as PlanName, hasLifetimeLicense: org.hasLifetimeLicense });
  } catch (error) {
    console.error("[PlanEnforcement] Error getting plan:", error);
    return fail("Failed to get organization plan");
  }
}

/**
 * Check if user can perform an action based on their plan limits
 * This is the main function to call before creating resources
 */
export async function checkPlanLimit(limitKey: LimitKey): Promise<ActionResult<LimitCheckResult>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, hasLifetimeLicense: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Lifetime license holders get enterprise-level access
    const effectivePlan = (org.hasLifetimeLicense ? "enterprise" : org.plan) as PlanName;

    // Get current usage
    const currentUsage = await getCurrentUsage(organizationId, limitKey);

    // Check the limit
    const result = checkLimit(effectivePlan, limitKey, currentUsage);
    const actionCheck = canPerformAction(effectivePlan, limitKey, currentUsage, 1);

    return success({
      ...result,
      message: actionCheck.message,
      upgradeRequired: actionCheck.upgradeRequired,
    });
  } catch (error) {
    console.error("[PlanEnforcement] Error checking limit:", error);
    return fail("Failed to check plan limit");
  }
}

/**
 * Check if a feature is available on the user's plan
 */
export async function checkPlanFeature(featureKey: FeatureKey): Promise<ActionResult<FeatureCheckResult>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, hasLifetimeLicense: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const effectivePlan = (org.hasLifetimeLicense ? "enterprise" : org.plan) as PlanName;
    const allowed = hasFeature(effectivePlan, featureKey);
    const metadata = FEATURE_METADATA[featureKey];

    if (allowed) {
      return success({
        allowed: true,
        feature: metadata.name,
      });
    }

    return success({
      allowed: false,
      feature: metadata.name,
      message: `${metadata.name} is not available on your current plan. Upgrade to unlock this feature.`,
      upgradeRequired: true,
    });
  } catch (error) {
    console.error("[PlanEnforcement] Error checking feature:", error);
    return fail("Failed to check plan feature");
  }
}

/**
 * Enforce a limit - returns error result if limit exceeded
 * Use this as a guard before creating resources
 */
export async function enforcePlanLimit(limitKey: LimitKey): Promise<ActionResult<void>> {
  const result = await checkPlanLimit(limitKey);

  if (!result.success) {
    return fail(result.error);
  }

  if (!result.data.allowed) {
    return fail(result.data.message || `You've reached your ${LIMIT_METADATA[limitKey].name.toLowerCase()} limit.`);
  }

  return ok(undefined);
}

/**
 * Enforce a feature - returns error result if feature not available
 */
export async function enforcePlanFeature(featureKey: FeatureKey): Promise<ActionResult<void>> {
  const result = await checkPlanFeature(featureKey);

  if (!result.success) {
    return fail(result.error);
  }

  if (!result.data.allowed) {
    return fail(result.data.message || `${FEATURE_METADATA[featureKey].name} is not available on your current plan.`);
  }

  return ok(undefined);
}

// =============================================================================
// USAGE COUNTING
// =============================================================================

/**
 * Get current usage for a specific limit key
 */
async function getCurrentUsage(organizationId: string, limitKey: LimitKey): Promise<number> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (limitKey) {
    // Storage (in GB)
    case "storage_gb": {
      // Sum all file sizes from galleries
      const result = await prisma.galleryPhoto.aggregate({
        where: {
          gallery: { project: { organizationId } },
        },
        _sum: { fileSize: true },
      });
      const bytes = result._sum.fileSize || 0;
      return Math.ceil(bytes / (1024 * 1024 * 1024)); // Convert to GB
    }

    // Active galleries
    case "galleries_active": {
      return prisma.gallery.count({
        where: {
          project: { organizationId },
          status: { in: ["draft", "published"] },
        },
      });
    }

    // Photos per gallery - this is per-gallery, not org-wide
    case "photos_per_gallery":
      return 0; // Checked per-gallery, not here

    // Clients
    case "clients_total": {
      return prisma.client.count({
        where: { organizationId },
      });
    }

    // Leads
    case "leads_total": {
      return prisma.portfolioLead.count({
        where: { organizationId },
      });
    }

    // Team members
    case "team_members": {
      return prisma.organizationMember.count({
        where: { organizationId },
      });
    }

    // Monthly invoices
    case "invoices_per_month": {
      return prisma.invoice.count({
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
      });
    }

    // Monthly contracts
    case "contracts_per_month": {
      return prisma.contract.count({
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
      });
    }

    // Monthly estimates
    case "estimates_per_month": {
      return prisma.estimate.count({
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
      });
    }

    // Monthly emails
    case "emails_per_month": {
      return prisma.emailLog.count({
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
      });
    }

    // Monthly SMS
    case "sms_per_month": {
      return prisma.sMSLog.count({
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
      });
    }

    // Email accounts synced
    case "email_accounts_synced": {
      return prisma.emailAccount.count({
        where: { organizationId },
      });
    }

    // AI credits - check usage meter
    case "ai_credits_per_month": {
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const meter = await prisma.usageMeter.findUnique({
        where: {
          organizationId_month: {
            organizationId,
            month: monthKey,
          },
        },
      });
      return meter?.apiCalls || 0;
    }

    // Marketing generations
    case "marketing_generations_per_month": {
      return prisma.marketingKit.count({
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
      });
    }

    // Active properties
    case "properties_active": {
      return prisma.portfolioWebsite.count({
        where: {
          organizationId,
          type: "property",
          isPublished: true,
        },
      });
    }

    // Portfolio websites
    case "portfolio_websites": {
      return prisma.portfolioWebsite.count({
        where: {
          organizationId,
        },
      });
    }

    // Custom domains - count domains attached to org
    case "custom_domains": {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { customDomain: true },
      });
      // Count org domain + portfolio domains
      const portfolioDomains = await prisma.portfolioWebsite.count({
        where: {
          organizationId,
          customDomain: { not: null },
        },
      });
      return (org?.customDomain ? 1 : 0) + portfolioDomains;
    }

    // Monthly bookings
    case "bookings_per_month": {
      return prisma.booking.count({
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
      });
    }

    // Booking types
    case "booking_types": {
      return prisma.bookingType.count({
        where: { organizationId },
      });
    }

    // Questionnaire templates
    case "questionnaire_templates": {
      return prisma.questionnaireTemplate.count({
        where: { organizationId },
      });
    }

    // Contract templates
    case "contract_templates": {
      return prisma.contractTemplate.count({
        where: { organizationId },
      });
    }

    // Canned responses
    case "canned_responses": {
      return prisma.cannedResponse.count({
        where: { organizationId },
      });
    }

    // Service packages
    case "service_packages": {
      return prisma.service.count({
        where: { organizationId },
      });
    }

    // Discount codes
    case "discount_codes": {
      return prisma.discountCode.count({
        where: {
          organizationId,
          isActive: true,
        },
      });
    }

    default:
      return 0;
  }
}

/**
 * Get photos count for a specific gallery
 */
export async function getGalleryPhotoCount(galleryId: string): Promise<ActionResult<LimitCheckResult>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, hasLifetimeLicense: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const effectivePlan = (org.hasLifetimeLicense ? "enterprise" : org.plan) as PlanName;

    const photoCount = await prisma.galleryPhoto.count({
      where: { galleryId },
    });

    const result = checkLimit(effectivePlan, "photos_per_gallery", photoCount);
    const actionCheck = canPerformAction(effectivePlan, "photos_per_gallery", photoCount, 1);

    return success({
      ...result,
      message: actionCheck.message,
      upgradeRequired: actionCheck.upgradeRequired,
    });
  } catch (error) {
    console.error("[PlanEnforcement] Error checking gallery photos:", error);
    return fail("Failed to check gallery photo limit");
  }
}

// =============================================================================
// USAGE STATS
// =============================================================================

/**
 * Get comprehensive usage stats for the billing page
 */
export async function getUsageStats(): Promise<ActionResult<UsageStats>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, hasLifetimeLicense: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const effectivePlan = (org.hasLifetimeLicense ? "enterprise" : org.plan) as PlanName;

    // Get usage for key metrics shown in billing
    const limitKeys: LimitKey[] = [
      "storage_gb",
      "galleries_active",
      "clients_total",
      "team_members",
      "invoices_per_month",
      "emails_per_month",
      "ai_credits_per_month",
      "properties_active",
    ];

    const limits: UsageStats["limits"] = {};

    for (const key of limitKeys) {
      const current = await getCurrentUsage(organizationId, key);
      const limit = getLimit(effectivePlan, key);
      const unlimited = isUnlimited(effectivePlan, key);

      limits[key] = {
        current,
        limit,
        remaining: unlimited ? -1 : Math.max(0, limit - current),
        isUnlimited: unlimited,
        percentUsed: unlimited ? 0 : Math.min(100, Math.round((current / limit) * 100)),
      };
    }

    return success({
      plan: effectivePlan,
      hasLifetimeLicense: org.hasLifetimeLicense,
      limits,
    });
  } catch (error) {
    console.error("[PlanEnforcement] Error getting usage stats:", error);
    return fail("Failed to get usage stats");
  }
}

// =============================================================================
// USAGE METER UPDATES
// =============================================================================

/**
 * Increment usage meter for a specific metric
 * Call this after creating resources
 */
export async function incrementUsage(
  metric: "storageBytes" | "galleriesCreated" | "emailsSent" | "apiCalls",
  amount: number = 1
): Promise<void> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) return;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    await prisma.usageMeter.upsert({
      where: {
        organizationId_month: {
          organizationId,
          month: monthKey,
        },
      },
      create: {
        organizationId,
        month: monthKey,
        [metric]: BigInt(amount),
      },
      update: {
        [metric]: {
          increment: metric === "storageBytes" ? BigInt(amount) : amount,
        },
      },
    });
  } catch (error) {
    // Don't fail the main operation if metering fails
    console.error("[PlanEnforcement] Error incrementing usage:", error);
  }
}

// =============================================================================
// PROPERTY CUSTOM DOMAIN SPECIAL CASE
// =============================================================================

/**
 * Check if user can add a custom domain to a property website
 * Free users can PURCHASE per-property domains
 * Paid users get included domains based on their plan
 */
export async function checkPropertyDomainAccess(propertyId: string): Promise<
  ActionResult<{
    canAddDomain: boolean;
    requiresPurchase: boolean;
    includedDomainsRemaining: number;
    message?: string;
  }>
> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, hasLifetimeLicense: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const effectivePlan = (org.hasLifetimeLicense ? "enterprise" : org.plan) as PlanName;

    // Check if property custom domains feature is available
    const canPurchase = hasFeature(effectivePlan, "property_custom_domains");

    // Count current custom domains on properties
    const currentPropertyDomains = await prisma.portfolioWebsite.count({
      where: {
        organizationId,
        type: "property",
        customDomain: { not: null },
      },
    });

    // Get included domain limit
    const domainLimit = getLimit(effectivePlan, "custom_domains");
    const includedRemaining = domainLimit === -1 ? -1 : Math.max(0, domainLimit - currentPropertyDomains);

    // Free plan: must purchase each domain
    if (effectivePlan === "free") {
      return success({
        canAddDomain: canPurchase,
        requiresPurchase: true,
        includedDomainsRemaining: 0,
        message: "Custom domains for property websites can be purchased individually.",
      });
    }

    // Paid plans: use included domains first
    if (includedRemaining > 0 || domainLimit === -1) {
      return success({
        canAddDomain: true,
        requiresPurchase: false,
        includedDomainsRemaining: includedRemaining,
        message:
          domainLimit === -1
            ? "Unlimited custom domains included with your plan."
            : `You have ${includedRemaining} included custom domain${includedRemaining === 1 ? "" : "s"} remaining.`,
      });
    }

    // Paid plan but used all included domains
    return success({
      canAddDomain: true,
      requiresPurchase: true,
      includedDomainsRemaining: 0,
      message: "You've used all included custom domains. Additional domains can be purchased.",
    });
  } catch (error) {
    console.error("[PlanEnforcement] Error checking property domain access:", error);
    return fail("Failed to check domain access");
  }
}
