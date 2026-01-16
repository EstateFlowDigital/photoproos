"use server";

import { db } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";
import {
  evaluateAllPolicies,
  evaluatePolicy,
  recordViolation,
  resolveViolation,
  getAllPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  togglePolicyActive,
  seedDefaultPolicies,
  DEFAULT_POLICIES,
  type ContentToCheck,
  type GovernanceCheckResult,
  type GovernanceRule,
  type RuleViolation,
} from "@/lib/cms/governance-engine";
import type { GovernancePolicyType, GovernanceAction, CMSGovernancePolicy } from "@prisma/client";

// ============================================================================
// TYPES FOR ACTIONS
// ============================================================================

export interface PolicySummary {
  id: string;
  name: string;
  description: string | null;
  type: GovernancePolicyType;
  targetTypes: string[];
  action: GovernanceAction;
  ruleCount: number;
  violationCount: number;
  isActive: boolean;
  priority: number;
}

export interface GovernanceStats {
  totalPolicies: number;
  activePolicies: number;
  totalViolations: number;
  unresolvedViolations: number;
  blockedPublishes: number;
  byType: Record<GovernancePolicyType, number>;
}

// ============================================================================
// POLICY CRUD ACTIONS
// ============================================================================

/**
 * Get all governance policies with violation counts
 */
export async function getGovernancePolicies(): Promise<
  ActionResult<PolicySummary[]>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const policies = await db.cMSGovernancePolicy.findMany({
      include: {
        _count: {
          select: {
            violations: {
              where: { resolvedAt: null },
            },
          },
        },
      },
      orderBy: [{ priority: "desc" }, { name: "asc" }],
    });

    return ok(
      policies.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        type: p.type,
        targetTypes: p.targetTypes,
        action: p.action,
        ruleCount: Array.isArray(p.rules) ? (p.rules as unknown[]).length : 0,
        violationCount: p._count.violations,
        isActive: p.isActive,
        priority: p.priority,
      }))
    );
  } catch (error) {
    console.error("Error fetching governance policies:", error);
    return fail("Failed to fetch policies");
  }
}

/**
 * Get a single policy with all details
 */
export async function getGovernancePolicy(
  policyId: string
): Promise<
  ActionResult<{
    policy: CMSGovernancePolicy;
    rules: GovernanceRule[];
    recentViolations: Array<{
      id: string;
      entityType: string;
      entityId: string;
      severity: string;
      blocked: boolean;
      createdAt: Date;
    }>;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const policy = await db.cMSGovernancePolicy.findUnique({
      where: { id: policyId },
      include: {
        violations: {
          where: { resolvedAt: null },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!policy) {
      return fail("Policy not found");
    }

    return ok({
      policy,
      rules: (policy.rules as unknown as GovernanceRule[]) || [],
      recentViolations: policy.violations.map((v) => ({
        id: v.id,
        entityType: v.entityType,
        entityId: v.entityId,
        severity: v.severity,
        blocked: v.blocked,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching governance policy:", error);
    return fail("Failed to fetch policy");
  }
}

/**
 * Create a new governance policy
 */
export async function createGovernancePolicy(data: {
  name: string;
  description?: string;
  type: GovernancePolicyType;
  targetTypes: string[];
  rules: GovernanceRule[];
  action?: GovernanceAction;
  priority?: number;
}): Promise<ActionResult<CMSGovernancePolicy>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const policy = await createPolicy({
      ...data,
      isActive: true,
    });

    return ok(policy);
  } catch (error) {
    console.error("Error creating governance policy:", error);
    return fail("Failed to create policy");
  }
}

/**
 * Update a governance policy
 */
export async function updateGovernancePolicy(
  policyId: string,
  data: Partial<{
    name: string;
    description: string | null;
    type: GovernancePolicyType;
    targetTypes: string[];
    rules: GovernanceRule[];
    action: GovernanceAction;
    priority: number;
  }>
): Promise<ActionResult<CMSGovernancePolicy>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const policy = await updatePolicy(policyId, data);
    return ok(policy);
  } catch (error) {
    console.error("Error updating governance policy:", error);
    return fail("Failed to update policy");
  }
}

/**
 * Delete a governance policy
 */
export async function deleteGovernancePolicy(
  policyId: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await deletePolicy(policyId);
    return ok(undefined);
  } catch (error) {
    console.error("Error deleting governance policy:", error);
    return fail("Failed to delete policy");
  }
}

/**
 * Toggle policy active status
 */
export async function toggleGovernancePolicyActive(
  policyId: string,
  isActive: boolean
): Promise<ActionResult<CMSGovernancePolicy>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const policy = await togglePolicyActive(policyId, isActive);
    return ok(policy);
  } catch (error) {
    console.error("Error toggling policy:", error);
    return fail("Failed to toggle policy");
  }
}

// ============================================================================
// CONTENT CHECKING ACTIONS
// ============================================================================

/**
 * Check content against all applicable governance policies
 */
export async function checkContentGovernance(
  content: ContentToCheck
): Promise<
  ActionResult<{
    canPublish: boolean;
    results: GovernanceCheckResult[];
    errors: GovernanceCheckResult[];
    warnings: GovernanceCheckResult[];
    blockedBy: GovernanceCheckResult[];
    totalViolations: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const result = await evaluateAllPolicies(content);

    const totalViolations = result.results.reduce(
      (sum, r) => sum + r.violations.length,
      0
    );

    return ok({
      ...result,
      totalViolations,
    });
  } catch (error) {
    console.error("Error checking content governance:", error);
    return fail("Failed to check content");
  }
}

/**
 * Check a marketing page against governance policies
 */
export async function checkMarketingPageGovernance(
  pageId: string
): Promise<
  ActionResult<{
    canPublish: boolean;
    results: GovernanceCheckResult[];
    errors: GovernanceCheckResult[];
    warnings: GovernanceCheckResult[];
    blockedBy: GovernanceCheckResult[];
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await db.marketingPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return fail("Page not found");
    }

    // Convert page to ContentToCheck format
    const content: ContentToCheck = {
      type: "MarketingPage",
      id: page.id,
      title: page.title,
      metaTitle: page.metaTitle || undefined,
      metaDescription: page.metaDescription || undefined,
      content: page.content,
      status: page.status,
      updatedAt: page.updatedAt,
      publishedAt: page.publishedAt || undefined,
    };

    const result = await evaluateAllPolicies(content);
    return ok(result);
  } catch (error) {
    console.error("Error checking marketing page governance:", error);
    return fail("Failed to check page");
  }
}

/**
 * Check content and record violations
 */
export async function checkAndRecordViolations(
  content: ContentToCheck
): Promise<ActionResult<GovernanceCheckResult[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const policies = await getAllPolicies();
    const results: GovernanceCheckResult[] = [];

    for (const policy of policies) {
      if (!policy.isActive) continue;
      if (!policy.targetTypes.includes(content.type)) continue;

      const result = await evaluatePolicy(policy, content);
      results.push(result);

      // Record violations if any
      if (result.violations.length > 0) {
        await recordViolation(
          policy.id,
          content.type,
          content.id,
          result.violations,
          result.action === "block"
        );
      }
    }

    return ok(results);
  } catch (error) {
    console.error("Error checking and recording violations:", error);
    return fail("Failed to check content");
  }
}

// ============================================================================
// VIOLATION MANAGEMENT ACTIONS
// ============================================================================

/**
 * Get all unresolved violations for an entity
 */
export async function getEntityViolations(
  entityType: string,
  entityId: string
): Promise<
  ActionResult<
    Array<{
      id: string;
      policyId: string;
      policyName: string;
      violations: RuleViolation[];
      severity: string;
      blocked: boolean;
      createdAt: Date;
    }>
  >
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const violations = await db.cMSGovernanceViolation.findMany({
      where: {
        entityType,
        entityId,
        resolvedAt: null,
      },
      include: {
        policy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(
      violations.map((v) => ({
        id: v.id,
        policyId: v.policyId,
        policyName: v.policy.name,
        violations: v.violations as unknown as RuleViolation[],
        severity: v.severity,
        blocked: v.blocked,
        createdAt: v.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching entity violations:", error);
    return fail("Failed to fetch violations");
  }
}

/**
 * Resolve a violation
 */
export async function resolveGovernanceViolation(
  violationId: string,
  resolution: "fixed" | "overridden" | "dismissed",
  overrideReason?: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // For now, use a placeholder for userId
    await resolveViolation(violationId, "super-admin", resolution, overrideReason);
    return ok(undefined);
  } catch (error) {
    console.error("Error resolving violation:", error);
    return fail("Failed to resolve violation");
  }
}

/**
 * Get all unresolved violations across all content
 */
export async function getAllUnresolvedViolations(
  options?: {
    limit?: number;
    offset?: number;
    severity?: string;
    entityType?: string;
  }
): Promise<
  ActionResult<{
    violations: Array<{
      id: string;
      policyId: string;
      policyName: string;
      entityType: string;
      entityId: string;
      severity: string;
      blocked: boolean;
      violationCount: number;
      createdAt: Date;
    }>;
    total: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const where = {
      resolvedAt: null,
      ...(options?.severity && { severity: options.severity }),
      ...(options?.entityType && { entityType: options.entityType }),
    };

    const [violations, total] = await Promise.all([
      db.cMSGovernanceViolation.findMany({
        where,
        include: {
          policy: {
            select: { name: true },
          },
        },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      db.cMSGovernanceViolation.count({ where }),
    ]);

    return ok({
      violations: violations.map((v) => ({
        id: v.id,
        policyId: v.policyId,
        policyName: v.policy.name,
        entityType: v.entityType,
        entityId: v.entityId,
        severity: v.severity,
        blocked: v.blocked,
        violationCount: Array.isArray(v.violations)
          ? (v.violations as unknown[]).length
          : 0,
        createdAt: v.createdAt,
      })),
      total,
    });
  } catch (error) {
    console.error("Error fetching all violations:", error);
    return fail("Failed to fetch violations");
  }
}

// ============================================================================
// STATISTICS & DASHBOARD
// ============================================================================

/**
 * Get governance statistics
 */
export async function getGovernanceStats(): Promise<ActionResult<GovernanceStats>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const [
      totalPolicies,
      activePolicies,
      totalViolations,
      unresolvedViolations,
      blockedPublishes,
    ] = await Promise.all([
      db.cMSGovernancePolicy.count(),
      db.cMSGovernancePolicy.count({ where: { isActive: true } }),
      db.cMSGovernanceViolation.count(),
      db.cMSGovernanceViolation.count({ where: { resolvedAt: null } }),
      db.cMSGovernanceViolation.count({ where: { blocked: true } }),
    ]);

    // Count by type
    const policies = await db.cMSGovernancePolicy.findMany({
      select: { type: true },
    });

    const byType: Record<GovernancePolicyType, number> = {
      brand_voice: 0,
      legal_compliance: 0,
      accessibility: 0,
      seo: 0,
      freshness: 0,
      approval_gates: 0,
      publishing_windows: 0,
    };

    policies.forEach((p) => {
      byType[p.type]++;
    });

    return ok({
      totalPolicies,
      activePolicies,
      totalViolations,
      unresolvedViolations,
      blockedPublishes,
      byType,
    });
  } catch (error) {
    console.error("Error fetching governance stats:", error);
    return fail("Failed to fetch stats");
  }
}

/**
 * Get governance dashboard data
 */
export async function getGovernanceDashboardData(): Promise<
  ActionResult<{
    stats: GovernanceStats;
    policies: PolicySummary[];
    recentViolations: Array<{
      id: string;
      policyName: string;
      entityType: string;
      entityId: string;
      severity: string;
      createdAt: Date;
    }>;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const [statsResult, policiesResult] = await Promise.all([
      getGovernanceStats(),
      getGovernancePolicies(),
    ]);

    if (!statsResult.success || !policiesResult.success) {
      return fail("Failed to fetch dashboard data");
    }

    const recentViolations = await db.cMSGovernanceViolation.findMany({
      where: { resolvedAt: null },
      include: {
        policy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return ok({
      stats: statsResult.data,
      policies: policiesResult.data,
      recentViolations: recentViolations.map((v) => ({
        id: v.id,
        policyName: v.policy.name,
        entityType: v.entityType,
        entityId: v.entityId,
        severity: v.severity,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching governance dashboard:", error);
    return fail("Failed to fetch dashboard data");
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize default policies
 */
export async function initializeGovernancePolicies(): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await seedDefaultPolicies();
    return ok(undefined);
  } catch (error) {
    console.error("Error initializing policies:", error);
    return fail("Failed to initialize policies");
  }
}

/**
 * Get available default policy templates
 */
export async function getDefaultPolicyTemplates(): Promise<
  ActionResult<
    Array<{
      key: string;
      name: string;
      description: string;
      type: GovernancePolicyType;
      ruleCount: number;
    }>
  >
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const templates = Object.entries(DEFAULT_POLICIES).map(([key, policy]) => ({
      key,
      name: policy.name,
      description: policy.description,
      type: policy.type,
      ruleCount: policy.rules.length,
    }));

    return ok(templates);
  } catch (error) {
    console.error("Error fetching default templates:", error);
    return fail("Failed to fetch templates");
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Note: Type exports (ContentToCheck, GovernanceCheckResult, GovernanceRule, RuleViolation)
// are available from "@/lib/actions/cms-governance-types" - this is separated because
// "use server" files can only export async functions.
