"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { currentUser } from "@clerk/nextjs/server";
import type { FeatureFlagCategory, AdminActionType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface UserListItem {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  hasLifetimeLicense: boolean;
  totalSessions: number;
  organization: {
    id: string;
    name: string;
    plan: string | null;
    hasLifetimeLicense: boolean;
  } | null;
  gamification: {
    totalXp: number;
    level: number;
    currentLoginStreak: number;
  } | null;
  stats: {
    totalGalleries: number;
    totalClients: number;
    totalRevenueCents: number;
  };
}

export interface UserDetailData extends UserListItem {
  memberships: {
    role: string;
    organization: {
      id: string;
      name: string;
      plan: string | null;
    };
  }[];
  achievements: {
    id: string;
    unlockedAt: Date;
    achievement: {
      name: string;
      description: string;
      rarity: string;
      icon: string;
    };
  }[];
  recentTickets: {
    id: string;
    subject: string;
    status: string;
    createdAt: Date;
  }[];
  customChallenges: {
    id: string;
    title: string;
    isCompleted: boolean;
    expiresAt: Date | null;
  }[];
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  openTickets: number;
  totalRevenueCents: number;
  newUsersThisWeek: number;
}

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Get super admin dashboard stats
 */
export async function getSuperAdminDashboardStats(): Promise<
  ActionResult<DashboardStats>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalOrganizations,
      openTickets,
      revenueResult,
      newUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: { gte: dayAgo },
        },
      }),
      prisma.organization.count(),
      prisma.supportTicket.count({
        where: { status: { in: ["open", "in_progress"] } },
      }),
      prisma.payment.aggregate({
        _sum: { amountCents: true },
        where: { status: "succeeded" },
      }),
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      }),
    ]);

    return ok({
      totalUsers,
      activeUsers,
      totalOrganizations,
      openTickets,
      totalRevenueCents: revenueResult._sum.amountCents || 0,
      newUsersThisWeek,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return fail("Failed to load dashboard stats");
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get all users with filtering and pagination
 */
export async function getAllUsers(options?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "totalXp" | "revenue";
  sortOrder?: "asc" | "desc";
}): Promise<ActionResult<{ users: UserListItem[]; total: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = options?.search
      ? {
          OR: [
            { email: { contains: options.search, mode: "insensitive" as const } },
            { fullName: { contains: options.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          memberships: {
            take: 1,
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  plan: true,
                  hasLifetimeLicense: true,
                },
              },
            },
          },
          gamificationProfile: {
            select: {
              totalXp: true,
              level: true,
              currentLoginStreak: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Get stats for each user
    const userIds = users.map((u) => u.id);
    const orgIds = users
      .map((u) => u.memberships[0]?.organization?.id)
      .filter(Boolean) as string[];

    const [galleryCounts, clientCounts, revenueSums] = await Promise.all([
      prisma.gallery.groupBy({
        by: ["organizationId"],
        where: { organizationId: { in: orgIds } },
        _count: true,
      }),
      prisma.client.groupBy({
        by: ["organizationId"],
        where: { organizationId: { in: orgIds } },
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ["organizationId"],
        where: { organizationId: { in: orgIds }, status: "succeeded" },
        _sum: { amountCents: true },
      }),
    ]);

    const galleryMap = new Map(galleryCounts.map((g) => [g.organizationId, g._count]));
    const clientMap = new Map(clientCounts.map((c) => [c.organizationId, c._count]));
    const revenueMap = new Map(
      revenueSums.map((r) => [r.organizationId, r._sum.amountCents || 0])
    );

    const userList: UserListItem[] = users.map((user) => {
      const org = user.memberships[0]?.organization;
      const orgId = org?.id;

      return {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        hasLifetimeLicense: user.hasLifetimeLicense,
        totalSessions: user.totalSessions,
        organization: org
          ? {
              id: org.id,
              name: org.name,
              plan: org.plan,
              hasLifetimeLicense: org.hasLifetimeLicense,
            }
          : null,
        gamification: user.gamificationProfile
          ? {
              totalXp: user.gamificationProfile.totalXp,
              level: user.gamificationProfile.level,
              currentLoginStreak: user.gamificationProfile.currentLoginStreak,
            }
          : null,
        stats: {
          totalGalleries: orgId ? galleryMap.get(orgId) || 0 : 0,
          totalClients: orgId ? clientMap.get(orgId) || 0 : 0,
          totalRevenueCents: orgId ? revenueMap.get(orgId) || 0 : 0,
        },
      };
    });

    return ok({ users: userList, total });
  } catch (error) {
    console.error("Error getting users:", error);
    return fail("Failed to load users");
  }
}

/**
 * Get detailed user information
 */
export async function getUserDetails(
  userId: string
): Promise<ActionResult<UserDetailData>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                plan: true,
                hasLifetimeLicense: true,
              },
            },
          },
        },
        gamificationProfile: true,
        userAchievements: {
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: "desc" },
          take: 10,
        },
        supportTickets: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            subject: true,
            status: true,
            createdAt: true,
          },
        },
        customChallenges: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return fail("User not found");
    }

    const org = user.memberships[0]?.organization;
    const orgId = org?.id;

    // Get stats
    const [galleryCount, clientCount, revenueSum] = orgId
      ? await Promise.all([
          prisma.gallery.count({ where: { organizationId: orgId } }),
          prisma.client.count({ where: { organizationId: orgId } }),
          prisma.payment.aggregate({
            where: { organizationId: orgId, status: "succeeded" },
            _sum: { amountCents: true },
          }),
        ])
      : [0, 0, { _sum: { amountCents: 0 } }];

    return ok({
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      hasLifetimeLicense: user.hasLifetimeLicense,
      totalSessions: user.totalSessions,
      organization: org
        ? {
            id: org.id,
            name: org.name,
            plan: org.plan,
            hasLifetimeLicense: org.hasLifetimeLicense,
          }
        : null,
      gamification: user.gamificationProfile
        ? {
            totalXp: user.gamificationProfile.totalXp,
            level: user.gamificationProfile.level,
            currentLoginStreak: user.gamificationProfile.currentLoginStreak,
          }
        : null,
      stats: {
        totalGalleries: galleryCount,
        totalClients: clientCount,
        totalRevenueCents: revenueSum._sum.amountCents || 0,
      },
      memberships: user.memberships.map((m) => ({
        role: m.role,
        organization: {
          id: m.organization.id,
          name: m.organization.name,
          plan: m.organization.plan,
        },
      })),
      achievements: user.userAchievements.map((a) => ({
        id: a.id,
        unlockedAt: a.unlockedAt,
        achievement: {
          name: a.achievement.name,
          description: a.achievement.description,
          rarity: a.achievement.rarity,
          icon: a.achievement.icon,
        },
      })),
      recentTickets: user.supportTickets,
      customChallenges: user.customChallenges.map((c) => ({
        id: c.id,
        title: c.title,
        isCompleted: c.isCompleted,
        expiresAt: c.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Error getting user details:", error);
    return fail("Failed to load user details");
  }
}

// ============================================================================
// USER ACTIONS
// ============================================================================

/**
 * Award XP to a user
 */
export async function awardXp(
  userId: string,
  amount: number,
  reason?: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    if (amount <= 0) {
      return fail("Amount must be positive");
    }

    // Update gamification profile
    await prisma.gamificationProfile.upsert({
      where: { userId },
      create: { userId, totalXp: amount },
      update: { totalXp: { increment: amount } },
    });

    // Log the award
    await prisma.adminXpAward.create({
      data: {
        userId,
        amount,
        reason,
      },
    });

    revalidatePath("/super-admin/users");
    revalidatePath(`/super-admin/users/${userId}`);
    return success();
  } catch (error) {
    console.error("Error awarding XP:", error);
    return fail("Failed to award XP");
  }
}

/**
 * Grant lifetime license to user/organization
 */
export async function grantLifetimeLicense(
  userId: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Get user's organization
    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
      select: { organizationId: true },
    });

    if (!membership) {
      return fail("User has no organization");
    }

    // Update both user and organization
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { hasLifetimeLicense: true },
      }),
      prisma.organization.update({
        where: { id: membership.organizationId },
        data: { hasLifetimeLicense: true },
      }),
    ]);

    revalidatePath("/super-admin/users");
    revalidatePath(`/super-admin/users/${userId}`);
    return success();
  } catch (error) {
    console.error("Error granting lifetime license:", error);
    return fail("Failed to grant license");
  }
}

/**
 * Revoke lifetime license
 */
export async function revokeLifetimeLicense(
  userId: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
      select: { organizationId: true },
    });

    if (!membership) {
      return fail("User has no organization");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { hasLifetimeLicense: false },
      }),
      prisma.organization.update({
        where: { id: membership.organizationId },
        data: { hasLifetimeLicense: false },
      }),
    ]);

    revalidatePath("/super-admin/users");
    revalidatePath(`/super-admin/users/${userId}`);
    return success();
  } catch (error) {
    console.error("Error revoking license:", error);
    return fail("Failed to revoke license");
  }
}

/**
 * Apply discount to organization
 */
export async function applyDiscount(
  organizationId: string,
  percent: number,
  daysValid: number
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    if (percent < 0 || percent > 100) {
      return fail("Percent must be between 0 and 100");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        activeDiscountPercent: percent,
        discountExpiresAt: expiresAt,
      },
    });

    revalidatePath("/super-admin/users");
    return success();
  } catch (error) {
    console.error("Error applying discount:", error);
    return fail("Failed to apply discount");
  }
}

/**
 * Create a custom challenge for a user
 */
export async function createCustomChallenge(
  userId: string,
  data: {
    title: string;
    description: string;
    objectives: { name: string; target: number }[];
    xpReward: number;
    daysValid?: number;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const expiresAt = data.daysValid
      ? new Date(Date.now() + data.daysValid * 24 * 60 * 60 * 1000)
      : null;

    const challenge = await prisma.customChallenge.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        objectives: data.objectives,
        xpReward: data.xpReward,
        expiresAt,
      },
    });

    revalidatePath(`/super-admin/users/${userId}`);
    return ok({ id: challenge.id });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return fail("Failed to create challenge");
  }
}

// ============================================================================
// IMPERSONATION
// ============================================================================

/**
 * Start impersonation session
 * Note: This should set a cookie/session that the app can use to detect impersonation
 */
export async function startImpersonation(
  userId: string,
  reason?: string
): Promise<ActionResult<{ redirectUrl: string; sessionId: string }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not logged in");
    }

    // Get user's clerk ID
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { clerkUserId: true },
    });

    if (!targetUser) {
      return fail("User not found");
    }

    // End any active impersonation sessions for this admin
    await prisma.impersonationSession.updateMany({
      where: {
        adminUserId: user.id,
        isActive: true,
      },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });

    // Create new impersonation session
    const session = await prisma.impersonationSession.create({
      data: {
        adminUserId: user.id,
        targetUserId: userId,
        reason,
      },
    });

    // Log the action
    await logAdminAction({
      actionType: "user_impersonate",
      description: `Started impersonating user`,
      targetUserId: userId,
      metadata: { reason, sessionId: session.id },
    });

    return ok({ redirectUrl: `/super-admin/impersonate/${userId}`, sessionId: session.id });
  } catch (error) {
    console.error("Error starting impersonation:", error);
    return fail("Failed to start impersonation");
  }
}

/**
 * End impersonation session
 */
export async function endImpersonation(): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not logged in");
    }

    const session = await prisma.impersonationSession.findFirst({
      where: {
        adminUserId: user.id,
        isActive: true,
      },
    });

    if (!session) {
      return fail("No active impersonation session");
    }

    await prisma.impersonationSession.update({
      where: { id: session.id },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });

    await logAdminAction({
      actionType: "user_impersonate",
      description: `Ended impersonation session`,
      targetUserId: session.targetUserId,
      metadata: { sessionId: session.id, actionsPerformed: session.actionsPerformed },
    });

    return success();
  } catch (error) {
    console.error("Error ending impersonation:", error);
    return fail("Failed to end impersonation");
  }
}

/**
 * Get active impersonation session
 */
export async function getActiveImpersonation(): Promise<
  ActionResult<{ userId: string; reason: string | null } | null>
> {
  try {
    const user = await currentUser();
    if (!user) return ok(null);

    const isAdmin = user.publicMetadata?.isSuperAdmin === true;
    if (!isAdmin) return ok(null);

    const session = await prisma.impersonationSession.findFirst({
      where: {
        adminUserId: user.id,
        isActive: true,
      },
    });

    if (!session) return ok(null);

    return ok({ userId: session.targetUserId, reason: session.reason });
  } catch (error) {
    console.error("Error getting active impersonation:", error);
    return fail("Failed to get impersonation");
  }
}

// ============================================================================
// ADMIN AUDIT LOGGING
// ============================================================================

interface AuditLogInput {
  actionType: AdminActionType;
  description: string;
  targetUserId?: string;
  targetOrgId?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  previousValue?: unknown;
  newValue?: unknown;
}

export async function logAdminAction(input: AuditLogInput): Promise<ActionResult<void>> {
  try {
    const user = await currentUser();
    if (!user) {
      return fail("Not logged in");
    }

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: input.actionType,
        description: input.description,
        targetUserId: input.targetUserId,
        targetOrgId: input.targetOrgId,
        targetId: input.targetId,
        targetType: input.targetType,
        metadata: input.metadata as object | undefined,
        previousValue: input.previousValue as object | undefined,
        newValue: input.newValue as object | undefined,
      },
    });

    return success();
  } catch (error) {
    console.error("[SuperAdmin] Error logging action:", error);
    return fail("Failed to log action");
  }
}

export async function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  actionType?: AdminActionType;
}): Promise<ActionResult<{ logs: unknown[]; total: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const where = options?.actionType ? { actionType: options.actionType } : {};

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit ?? 50,
        skip: options?.offset ?? 0,
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return ok({ logs, total });
  } catch (error) {
    console.error("[SuperAdmin] Error fetching audit logs:", error);
    return fail("Failed to fetch audit logs");
  }
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export async function getFeatureFlags(): Promise<ActionResult<unknown[]>> {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    return ok(flags);
  } catch (error) {
    console.error("[SuperAdmin] Error fetching feature flags:", error);
    return fail("Failed to fetch feature flags");
  }
}

interface CreateFeatureFlagInput {
  slug: string;
  name: string;
  description: string;
  category: FeatureFlagCategory;
  enabled?: boolean;
  rolloutPercentage?: number;
  icon?: string;
  order?: number;
  isSystem?: boolean;
}

export async function createFeatureFlag(
  input: CreateFeatureFlagInput
): Promise<ActionResult<unknown>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    const flag = await prisma.featureFlag.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        category: input.category,
        enabled: input.enabled ?? false,
        rolloutPercentage: input.rolloutPercentage ?? 100,
        icon: input.icon,
        order: input.order ?? 0,
        isSystem: input.isSystem ?? false,
        createdBy: user?.id,
      },
    });

    await logAdminAction({
      actionType: "feature_flag_toggle",
      description: `Created feature flag: ${input.name}`,
      targetId: flag.id,
      targetType: "feature_flag",
      newValue: flag,
    });

    revalidatePath("/super-admin/config");
    return ok(flag);
  } catch (error) {
    console.error("[SuperAdmin] Error creating feature flag:", error);
    return fail("Failed to create feature flag");
  }
}

export async function toggleFeatureFlag(
  slugOrId: string,
  enabled: boolean
): Promise<ActionResult<unknown>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const existing = await prisma.featureFlag.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
    });

    if (!existing) {
      return fail("Feature flag not found");
    }

    const flag = await prisma.featureFlag.update({
      where: { id: existing.id },
      data: { enabled },
    });

    await logAdminAction({
      actionType: "feature_flag_toggle",
      description: `${enabled ? "Enabled" : "Disabled"} feature flag: ${flag.name}`,
      targetId: flag.id,
      targetType: "feature_flag",
      previousValue: { enabled: existing.enabled },
      newValue: { enabled: flag.enabled },
    });

    revalidatePath("/super-admin/config");
    return ok(flag);
  } catch (error) {
    console.error("[SuperAdmin] Error toggling feature flag:", error);
    return fail("Failed to toggle feature flag");
  }
}

export async function deleteFeatureFlag(slugOrId: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const existing = await prisma.featureFlag.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
    });

    if (!existing) {
      return fail("Feature flag not found");
    }

    if (existing.isSystem) {
      return fail("Cannot delete system feature flags");
    }

    await prisma.featureFlag.delete({
      where: { id: existing.id },
    });

    await logAdminAction({
      actionType: "feature_flag_toggle",
      description: `Deleted feature flag: ${existing.name}`,
      targetId: existing.id,
      targetType: "feature_flag",
      previousValue: existing,
    });

    revalidatePath("/super-admin/config");
    return success();
  } catch (error) {
    console.error("[SuperAdmin] Error deleting feature flag:", error);
    return fail("Failed to delete feature flag");
  }
}

/**
 * Check if a feature is enabled for a specific organization
 */
export async function isFeatureEnabled(
  slug: string,
  organizationId?: string
): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { slug },
    });

    if (!flag) return false;
    if (!flag.enabled) return false;

    // Check org-specific overrides
    if (organizationId) {
      if (flag.disabledForOrgs.includes(organizationId)) return false;
      if (flag.enabledForOrgs.length > 0) {
        return flag.enabledForOrgs.includes(organizationId);
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100 && organizationId) {
      const hash = organizationId.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const percentage = Math.abs(hash % 100);
      return percentage < flag.rolloutPercentage;
    }

    return true;
  } catch (error) {
    console.error("[SuperAdmin] Error checking feature flag:", error);
    return false;
  }
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export async function getSystemSettings(): Promise<ActionResult<unknown[]>> {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    return ok(settings);
  } catch (error) {
    console.error("[SuperAdmin] Error fetching system settings:", error);
    return fail("Failed to fetch system settings");
  }
}

interface CreateSystemSettingInput {
  key: string;
  name: string;
  description: string;
  value: string;
  valueType?: string;
  isSecret?: boolean;
  category?: string;
}

export async function createSystemSetting(
  input: CreateSystemSettingInput
): Promise<ActionResult<unknown>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    const setting = await prisma.systemSetting.create({
      data: {
        key: input.key,
        name: input.name,
        description: input.description,
        value: input.value,
        valueType: input.valueType ?? "boolean",
        isSecret: input.isSecret ?? false,
        category: input.category ?? "general",
        updatedBy: user?.id,
      },
    });

    await logAdminAction({
      actionType: "system_setting_change",
      description: `Created system setting: ${input.name}`,
      targetId: setting.id,
      targetType: "system_setting",
      newValue: setting,
    });

    revalidatePath("/super-admin/config");
    return ok(setting);
  } catch (error) {
    console.error("[SuperAdmin] Error creating system setting:", error);
    return fail("Failed to create system setting");
  }
}

export async function updateSystemSetting(
  key: string,
  value: string
): Promise<ActionResult<unknown>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    const existing = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!existing) {
      return fail("System setting not found");
    }

    const setting = await prisma.systemSetting.update({
      where: { key },
      data: {
        value,
        updatedBy: user?.id,
      },
    });

    await logAdminAction({
      actionType: "system_setting_change",
      description: `Updated system setting: ${setting.name}`,
      targetId: setting.id,
      targetType: "system_setting",
      previousValue: { value: existing.value },
      newValue: { value: setting.value },
    });

    revalidatePath("/super-admin/config");
    return ok(setting);
  } catch (error) {
    console.error("[SuperAdmin] Error updating system setting:", error);
    return fail("Failed to update system setting");
  }
}

/**
 * Get a system setting value with type coercion
 */
export async function getSystemSettingValue<T = string>(
  key: string,
  defaultValue: T
): Promise<T> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) return defaultValue;

    switch (setting.valueType) {
      case "boolean":
        return (setting.value === "true") as unknown as T;
      case "number":
        return parseFloat(setting.value) as unknown as T;
      case "json":
        return JSON.parse(setting.value) as T;
      default:
        return setting.value as unknown as T;
    }
  } catch {
    return defaultValue;
  }
}

// ============================================================================
// SEED DEFAULTS
// ============================================================================

export async function seedDefaultFeatureFlags(): Promise<ActionResult<number>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    const defaultFlags: CreateFeatureFlagInput[] = [
      {
        slug: "ai_assistant",
        name: "AI Business Assistant",
        description: "Claude-powered AI assistant for business queries",
        category: "ai_features",
        enabled: true,
        icon: "sparkles",
        order: 1,
        isSystem: true,
      },
      {
        slug: "gamification",
        name: "Gamification System",
        description: "XP, levels, achievements, and streaks",
        category: "engagement",
        enabled: true,
        icon: "trophy",
        order: 1,
        isSystem: true,
      },
      {
        slug: "feedback_modal",
        name: "Feedback Collection",
        description: "Session-based feedback modal for users",
        category: "engagement",
        enabled: true,
        icon: "message-circle",
        order: 2,
        isSystem: true,
      },
      {
        slug: "email_notifications",
        name: "Email Notifications",
        description: "Transactional and marketing emails",
        category: "communications",
        enabled: true,
        icon: "mail",
        order: 1,
        isSystem: true,
      },
      {
        slug: "slack_notifications",
        name: "Slack Notifications",
        description: "Support ticket notifications to Slack",
        category: "communications",
        enabled: true,
        icon: "bell",
        order: 2,
        isSystem: true,
      },
      {
        slug: "tax_prep",
        name: "Tax Preparation",
        description: "Seasonal tax preparation wizard",
        category: "finance",
        enabled: true,
        icon: "calendar",
        order: 1,
        isSystem: true,
      },
    ];

    let created = 0;
    for (const flag of defaultFlags) {
      const existing = await prisma.featureFlag.findUnique({
        where: { slug: flag.slug },
      });

      if (!existing) {
        await prisma.featureFlag.create({
          data: {
            ...flag,
            createdBy: user?.id,
          },
        });
        created++;
      }
    }

    revalidatePath("/super-admin/config");
    return ok(created);
  } catch (error) {
    console.error("[SuperAdmin] Error seeding feature flags:", error);
    return fail("Failed to seed flags");
  }
}

export async function seedDefaultSystemSettings(): Promise<ActionResult<number>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    const defaultSettings: CreateSystemSettingInput[] = [
      {
        key: "maintenance_mode",
        name: "Maintenance Mode",
        description: "Show maintenance page to all users",
        value: "false",
        valueType: "boolean",
        category: "system",
      },
      {
        key: "new_signups",
        name: "New Signups",
        description: "Allow new user registrations",
        value: "true",
        valueType: "boolean",
        category: "system",
      },
      {
        key: "trial_period",
        name: "Free Trial",
        description: "14-day free trial for new users",
        value: "true",
        valueType: "boolean",
        category: "system",
      },
      {
        key: "trial_days",
        name: "Trial Days",
        description: "Number of days for free trial",
        value: "14",
        valueType: "number",
        category: "system",
      },
    ];

    let created = 0;
    for (const setting of defaultSettings) {
      const existing = await prisma.systemSetting.findUnique({
        where: { key: setting.key },
      });

      if (!existing) {
        await prisma.systemSetting.create({
          data: {
            ...setting,
            updatedBy: user?.id,
          },
        });
        created++;
      }
    }

    revalidatePath("/super-admin/config");
    return ok(created);
  } catch (error) {
    console.error("[SuperAdmin] Error seeding system settings:", error);
    return fail("Failed to seed settings");
  }
}

// ============================================================================
// SYSTEM HEALTH / STATS
// ============================================================================

export async function getSystemHealthStats(): Promise<
  ActionResult<{
    totalUsers: number;
    totalOrganizations: number;
    totalGalleries: number;
    recentLogins: number;
    activeImpersonations: number;
    recentAuditLogs: number;
    featureFlagsEnabled: number;
    featureFlagsTotal: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const [
      totalUsers,
      totalOrganizations,
      totalGalleries,
      recentLogins,
      activeImpersonations,
      recentAuditLogs,
      featureFlagsEnabled,
      featureFlagsTotal,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.gallery.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.impersonationSession.count({
        where: { isActive: true },
      }),
      prisma.adminAuditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.featureFlag.count({
        where: { enabled: true },
      }),
      prisma.featureFlag.count(),
    ]);

    return ok({
      totalUsers,
      totalOrganizations,
      totalGalleries,
      recentLogins,
      activeImpersonations,
      recentAuditLogs,
      featureFlagsEnabled,
      featureFlagsTotal,
    });
  } catch (error) {
    console.error("[SuperAdmin] Error fetching system stats:", error);
    return fail("Failed to fetch stats");
  }
}
