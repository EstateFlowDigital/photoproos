"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { currentUser } from "@clerk/nextjs/server";
import type { FeatureFlagCategory, AdminActionType, AnnouncementType, AnnouncementPriority, AnnouncementAudience, DiscountType, DiscountScope, DiscountAppliesTo } from "@prisma/client";

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
  // Enhanced stats
  totalGalleries: number;
  totalClients: number;
  galleriesDeliveredThisMonth: number;
  revenueThisMonth: number;
  averageRating: number;
  feedbackCount: number;
  pendingFeedback: number;
  // Growth metrics (7-day data for sparklines)
  userGrowth: number[];
  revenueGrowth: number[];
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
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalOrganizations,
      openTickets,
      revenueResult,
      newUsersThisWeek,
      totalGalleries,
      totalClients,
      galleriesDeliveredThisMonth,
      revenueThisMonthResult,
      feedbackStats,
      pendingFeedback,
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
      prisma.gallery.count(),
      prisma.client.count(),
      prisma.gallery.count({
        where: {
          status: "delivered",
          deliveredAt: { gte: monthAgo },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amountCents: true },
        where: {
          status: "succeeded",
          createdAt: { gte: monthAgo },
        },
      }),
      prisma.platformFeedback.aggregate({
        _avg: { rating: true },
        _count: true,
      }),
      prisma.platformFeedback.count({
        where: { isReviewed: false },
      }),
    ]);

    // Get 7-day growth data for sparklines
    const userGrowth: number[] = [];
    const revenueGrowth: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const [usersOnDay, revenueOnDay] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        }),
        prisma.payment.aggregate({
          _sum: { amountCents: true },
          where: {
            status: "succeeded",
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        }),
      ]);

      userGrowth.push(usersOnDay);
      revenueGrowth.push((revenueOnDay._sum.amountCents || 0) / 100);
    }

    return ok({
      totalUsers,
      activeUsers,
      totalOrganizations,
      openTickets,
      totalRevenueCents: revenueResult._sum.amountCents || 0,
      newUsersThisWeek,
      totalGalleries,
      totalClients,
      galleriesDeliveredThisMonth,
      revenueThisMonth: revenueThisMonthResult._sum.amountCents || 0,
      averageRating: feedbackStats._avg.rating || 0,
      feedbackCount: feedbackStats._count,
      pendingFeedback,
      userGrowth,
      revenueGrowth,
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
  actionType?: AdminActionType | string;
}): Promise<ActionResult<{ logs: unknown[]; total: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Build where clause
    const where: { actionType?: AdminActionType } = {};
    if (options?.actionType && options.actionType !== "all") {
      where.actionType = options.actionType as AdminActionType;
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit ?? 50,
        skip: options?.offset ?? 0,
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    // Fetch admin user info for each log
    const adminUserIds = [...new Set(logs.map((log) => log.adminUserId))];
    const adminUsers = await prisma.user.findMany({
      where: { clerkUserId: { in: adminUserIds } },
      select: {
        clerkUserId: true,
        email: true,
        fullName: true,
      },
    });

    const adminUserMap = new Map(adminUsers.map((u) => [u.clerkUserId, u]));

    const logsWithAdminInfo = logs.map((log) => ({
      ...log,
      adminUser: adminUserMap.get(log.adminUserId) || null,
    }));

    return ok({ logs: logsWithAdminInfo, total });
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

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export interface AnnouncementListItem {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  targetOrgIds: string[];
  dismissible: boolean;
  showBanner: boolean;
  bannerColor: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  publishedAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    readStatuses: number;
  };
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  targetOrgIds?: string[];
  dismissible?: boolean;
  showBanner?: boolean;
  bannerColor?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  publishedAt?: Date;
  expiresAt?: Date;
}

export interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> {
  isActive?: boolean;
}

/**
 * Get all announcements for admin view
 */
export async function getAnnouncements(options?: {
  limit?: number;
  offset?: number;
  type?: AnnouncementType | "all";
  audience?: AnnouncementAudience | "all";
  activeOnly?: boolean;
}): Promise<ActionResult<{ announcements: AnnouncementListItem[]; total: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const { limit = 20, offset = 0, type, audience, activeOnly } = options || {};

    // Build where clause
    const where: {
      type?: AnnouncementType;
      audience?: AnnouncementAudience;
      isActive?: boolean;
    } = {};

    if (type && type !== "all") {
      where.type = type;
    }
    if (audience && audience !== "all") {
      where.audience = audience;
    }
    if (activeOnly) {
      where.isActive = true;
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: { readStatuses: true },
          },
        },
      }),
      prisma.announcement.count({ where }),
    ]);

    return ok({ announcements: announcements as AnnouncementListItem[], total });
  } catch (error) {
    console.error("[SuperAdmin] Error fetching announcements:", error);
    return fail("Failed to fetch announcements");
  }
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncementById(
  id: string
): Promise<ActionResult<AnnouncementListItem & { readStatuses: { userId: string; readAt: Date; isDismissed: boolean }[] }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        _count: {
          select: { readStatuses: true },
        },
        readStatuses: {
          take: 100,
          orderBy: { readAt: "desc" },
          select: {
            userId: true,
            readAt: true,
            isDismissed: true,
          },
        },
      },
    });

    if (!announcement) {
      return fail("Announcement not found");
    }

    return ok(announcement as AnnouncementListItem & { readStatuses: { userId: string; readAt: Date; isDismissed: boolean }[] });
  } catch (error) {
    console.error("[SuperAdmin] Error fetching announcement:", error);
    return fail("Failed to fetch announcement");
  }
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(
  input: CreateAnnouncementInput
): Promise<ActionResult<AnnouncementListItem>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("No user found");
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        priority: input.priority,
        audience: input.audience,
        targetOrgIds: input.targetOrgIds || [],
        dismissible: input.dismissible ?? true,
        showBanner: input.showBanner ?? true,
        bannerColor: input.bannerColor,
        ctaLabel: input.ctaLabel,
        ctaUrl: input.ctaUrl,
        publishedAt: input.publishedAt || new Date(),
        expiresAt: input.expiresAt,
        createdByUserId: user.id,
      },
      include: {
        _count: {
          select: { readStatuses: true },
        },
      },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: "other",
        description: `Created announcement: "${input.title}"`,
        targetId: announcement.id,
        targetType: "announcement",
        newValue: {
          title: input.title,
          type: input.type,
          audience: input.audience,
        },
      },
    });

    revalidatePath("/super-admin/announcements");
    return ok(announcement as AnnouncementListItem);
  } catch (error) {
    console.error("[SuperAdmin] Error creating announcement:", error);
    return fail("Failed to create announcement");
  }
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(
  id: string,
  input: UpdateAnnouncementInput
): Promise<ActionResult<AnnouncementListItem>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("No user found");
    }

    // Get existing announcement
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return fail("Announcement not found");
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.audience !== undefined && { audience: input.audience }),
        ...(input.targetOrgIds !== undefined && { targetOrgIds: input.targetOrgIds }),
        ...(input.dismissible !== undefined && { dismissible: input.dismissible }),
        ...(input.showBanner !== undefined && { showBanner: input.showBanner }),
        ...(input.bannerColor !== undefined && { bannerColor: input.bannerColor }),
        ...(input.ctaLabel !== undefined && { ctaLabel: input.ctaLabel }),
        ...(input.ctaUrl !== undefined && { ctaUrl: input.ctaUrl }),
        ...(input.publishedAt !== undefined && { publishedAt: input.publishedAt }),
        ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: {
          select: { readStatuses: true },
        },
      },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: "other",
        description: `Updated announcement: "${announcement.title}"`,
        targetId: announcement.id,
        targetType: "announcement",
        previousValue: {
          title: existing.title,
          isActive: existing.isActive,
        },
        newValue: input,
      },
    });

    revalidatePath("/super-admin/announcements");
    return ok(announcement as AnnouncementListItem);
  } catch (error) {
    console.error("[SuperAdmin] Error updating announcement:", error);
    return fail("Failed to update announcement");
  }
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("No user found");
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return fail("Announcement not found");
    }

    await prisma.announcement.delete({
      where: { id },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: "other",
        description: `Deleted announcement: "${announcement.title}"`,
        targetId: id,
        targetType: "announcement",
        previousValue: {
          title: announcement.title,
          type: announcement.type,
        },
      },
    });

    revalidatePath("/super-admin/announcements");
    return success();
  } catch (error) {
    console.error("[SuperAdmin] Error deleting announcement:", error);
    return fail("Failed to delete announcement");
  }
}

/**
 * Get announcement statistics
 */
export async function getAnnouncementStats(): Promise<
  ActionResult<{
    total: number;
    active: number;
    expired: number;
    byType: Record<AnnouncementType, number>;
    byPriority: Record<AnnouncementPriority, number>;
    totalReads: number;
    totalDismissals: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const now = new Date();

    const [
      total,
      active,
      expired,
      byTypeResults,
      byPriorityResults,
      totalReads,
      totalDismissals,
    ] = await Promise.all([
      prisma.announcement.count(),
      prisma.announcement.count({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      prisma.announcement.count({
        where: {
          OR: [{ isActive: false }, { expiresAt: { lte: now } }],
        },
      }),
      prisma.announcement.groupBy({
        by: ["type"],
        _count: true,
      }),
      prisma.announcement.groupBy({
        by: ["priority"],
        _count: true,
      }),
      prisma.announcementRead.count(),
      prisma.announcementRead.count({
        where: { isDismissed: true },
      }),
    ]);

    // Convert grouped results to record format
    const byType = {
      info: 0,
      feature: 0,
      maintenance: 0,
      warning: 0,
      success: 0,
      update: 0,
      promotion: 0,
    } as Record<AnnouncementType, number>;

    for (const result of byTypeResults) {
      byType[result.type] = result._count;
    }

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    } as Record<AnnouncementPriority, number>;

    for (const result of byPriorityResults) {
      byPriority[result.priority] = result._count;
    }

    return ok({
      total,
      active,
      expired,
      byType,
      byPriority,
      totalReads,
      totalDismissals,
    });
  } catch (error) {
    console.error("[SuperAdmin] Error fetching announcement stats:", error);
    return fail("Failed to fetch announcement stats");
  }
}

/**
 * Toggle announcement active status
 */
export async function toggleAnnouncementActive(
  id: string
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("No user found");
    }

    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return fail("Announcement not found");
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: "other",
        description: `${announcement.isActive ? "Activated" : "Deactivated"} announcement: "${announcement.title}"`,
        targetId: id,
        targetType: "announcement",
        previousValue: { isActive: existing.isActive },
        newValue: { isActive: announcement.isActive },
      },
    });

    revalidatePath("/super-admin/announcements");
    return ok({ isActive: announcement.isActive });
  } catch (error) {
    console.error("[SuperAdmin] Error toggling announcement:", error);
    return fail("Failed to toggle announcement");
  }
}

// ============================================================================
// DISCOUNT CODES
// ============================================================================

export interface DiscountCodeListItem {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  scope: DiscountScope;
  appliesTo: DiscountAppliesTo;
  maxUses: number | null;
  usedCount: number;
  usagePerUser: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
  isPublic: boolean;
  shareableSlug: string | null;
  qrCodeUrl: string | null;
  totalSavings: number;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: string | null;
  organizationId: string | null;
  _count: {
    usages: number;
  };
}

export interface CreateDiscountInput {
  code: string;
  name?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  scope: DiscountScope;
  appliesTo?: DiscountAppliesTo;
  maxUses?: number;
  usagePerUser?: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
  isPublic?: boolean;
  shareableSlug?: string;
}

export interface UpdateDiscountInput extends Partial<CreateDiscountInput> {
  id: string;
}

/**
 * Generate a unique shareable slug for a discount
 */
function generateSlug(code: string): string {
  const base = code.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

/**
 * Get all platform-level discount codes
 */
export async function getPlatformDiscounts(options?: {
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
  search?: string;
}): Promise<ActionResult<{ discounts: DiscountCodeListItem[]; total: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const { limit = 20, offset = 0, activeOnly, search } = options || {};

    // Build where clause for platform-level discounts
    const where: {
      scope: DiscountScope;
      organizationId: null;
      isActive?: boolean;
      OR?: Array<{ code?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" } }>;
    } = {
      scope: "platform",
      organizationId: null,
    };

    if (activeOnly) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [discounts, total] = await Promise.all([
      prisma.discountCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: { usages: true },
          },
        },
      }),
      prisma.discountCode.count({ where }),
    ]);

    return ok({ discounts: discounts as DiscountCodeListItem[], total });
  } catch (error) {
    console.error("[SuperAdmin] Error fetching platform discounts:", error);
    return fail("Failed to fetch discounts");
  }
}

/**
 * Get a single discount code by ID
 */
export async function getDiscountById(
  id: string
): Promise<ActionResult<DiscountCodeListItem & { usages: Array<{ id: string; clientEmail: string | null; userId: string | null; discountAmount: number; createdAt: Date; source: string | null }> }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const discount = await prisma.discountCode.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usages: true },
        },
        usages: {
          take: 50,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            clientEmail: true,
            userId: true,
            discountAmount: true,
            createdAt: true,
            source: true,
          },
        },
      },
    });

    if (!discount) {
      return fail("Discount not found");
    }

    return ok(discount as DiscountCodeListItem & { usages: Array<{ id: string; clientEmail: string | null; userId: string | null; discountAmount: number; createdAt: Date; source: string | null }> });
  } catch (error) {
    console.error("[SuperAdmin] Error fetching discount:", error);
    return fail("Failed to fetch discount");
  }
}

/**
 * Create a new platform-level discount code
 */
export async function createPlatformDiscount(
  input: CreateDiscountInput
): Promise<ActionResult<DiscountCodeListItem>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("No user found");
    }

    // Check if code already exists for platform
    const existing = await prisma.discountCode.findFirst({
      where: {
        code: input.code.toUpperCase(),
        organizationId: null,
      },
    });

    if (existing) {
      return fail("A discount with this code already exists");
    }

    // Generate shareable slug if not provided
    const shareableSlug = input.shareableSlug || generateSlug(input.code);

    const discount = await prisma.discountCode.create({
      data: {
        code: input.code.toUpperCase(),
        name: input.name,
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        scope: "platform",
        organizationId: null,
        createdByUserId: user.id,
        appliesTo: input.appliesTo || "subscription",
        maxUses: input.maxUses || 0,
        usagePerUser: input.usagePerUser || 1,
        minPurchase: input.minPurchase || 0,
        maxDiscount: input.maxDiscount,
        validFrom: input.validFrom || new Date(),
        validUntil: input.validUntil,
        isActive: input.isActive ?? true,
        isPublic: input.isPublic ?? false,
        shareableSlug,
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: "other",
        description: `Created platform discount: ${input.code}`,
        targetId: discount.id,
        targetType: "discount",
        newValue: {
          code: input.code,
          discountType: input.discountType,
          discountValue: input.discountValue,
        },
      },
    });

    revalidatePath("/super-admin/discounts");
    return ok(discount as DiscountCodeListItem);
  } catch (error) {
    console.error("[SuperAdmin] Error creating discount:", error);
    return fail("Failed to create discount");
  }
}

/**
 * Update a platform-level discount code
 */
export async function updatePlatformDiscount(
  input: UpdateDiscountInput
): Promise<ActionResult<DiscountCodeListItem>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("No user found");
    }

    const existing = await prisma.discountCode.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return fail("Discount not found");
    }

    // If code is being changed, check for duplicates
    if (input.code && input.code.toUpperCase() !== existing.code) {
      const duplicate = await prisma.discountCode.findFirst({
        where: {
          code: input.code.toUpperCase(),
          organizationId: null,
          id: { not: input.id },
        },
      });

      if (duplicate) {
        return fail("A discount with this code already exists");
      }
    }

    const discount = await prisma.discountCode.update({
      where: { id: input.id },
      data: {
        ...(input.code && { code: input.code.toUpperCase() }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.discountType && { discountType: input.discountType }),
        ...(input.discountValue !== undefined && { discountValue: input.discountValue }),
        ...(input.appliesTo && { appliesTo: input.appliesTo }),
        ...(input.maxUses !== undefined && { maxUses: input.maxUses }),
        ...(input.usagePerUser !== undefined && { usagePerUser: input.usagePerUser }),
        ...(input.minPurchase !== undefined && { minPurchase: input.minPurchase }),
        ...(input.maxDiscount !== undefined && { maxDiscount: input.maxDiscount }),
        ...(input.validFrom && { validFrom: input.validFrom }),
        ...(input.validUntil !== undefined && { validUntil: input.validUntil }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
        ...(input.shareableSlug && { shareableSlug: input.shareableSlug }),
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: "other",
        description: `Updated platform discount: ${discount.code}`,
        targetId: discount.id,
        targetType: "discount",
        previousValue: { code: existing.code, isActive: existing.isActive },
        newValue: input,
      },
    });

    revalidatePath("/super-admin/discounts");
    return ok(discount as DiscountCodeListItem);
  } catch (error) {
    console.error("[SuperAdmin] Error updating discount:", error);
    return fail("Failed to update discount");
  }
}

/**
 * Delete a platform-level discount code
 */
export async function deletePlatformDiscount(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("No user found");
    }

    const discount = await prisma.discountCode.findUnique({
      where: { id },
    });

    if (!discount) {
      return fail("Discount not found");
    }

    await prisma.discountCode.delete({
      where: { id },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: "other",
        description: `Deleted platform discount: ${discount.code}`,
        targetId: id,
        targetType: "discount",
        previousValue: { code: discount.code, discountValue: discount.discountValue },
      },
    });

    revalidatePath("/super-admin/discounts");
    return success();
  } catch (error) {
    console.error("[SuperAdmin] Error deleting discount:", error);
    return fail("Failed to delete discount");
  }
}

/**
 * Toggle discount active status
 */
export async function toggleDiscountActive(
  id: string
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("No user found");
    }

    const existing = await prisma.discountCode.findUnique({
      where: { id },
    });

    if (!existing) {
      return fail("Discount not found");
    }

    const discount = await prisma.discountCode.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: user.id,
        actionType: "other",
        description: `${discount.isActive ? "Activated" : "Deactivated"} discount: ${discount.code}`,
        targetId: id,
        targetType: "discount",
        previousValue: { isActive: existing.isActive },
        newValue: { isActive: discount.isActive },
      },
    });

    revalidatePath("/super-admin/discounts");
    return ok({ isActive: discount.isActive });
  } catch (error) {
    console.error("[SuperAdmin] Error toggling discount:", error);
    return fail("Failed to toggle discount");
  }
}

/**
 * Get discount statistics
 */
export async function getDiscountStats(): Promise<
  ActionResult<{
    totalPlatformDiscounts: number;
    activePlatformDiscounts: number;
    totalRedemptions: number;
    totalSavings: number;
    topDiscounts: Array<{ code: string; usedCount: number; totalSavings: number }>;
    recentRedemptions: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalPlatformDiscounts,
      activePlatformDiscounts,
      totalRedemptions,
      savingsAggregate,
      topDiscounts,
      recentRedemptions,
    ] = await Promise.all([
      prisma.discountCode.count({
        where: { scope: "platform", organizationId: null },
      }),
      prisma.discountCode.count({
        where: { scope: "platform", organizationId: null, isActive: true },
      }),
      prisma.discountCodeUsage.count({
        where: {
          discountCode: { scope: "platform", organizationId: null },
        },
      }),
      prisma.discountCode.aggregate({
        where: { scope: "platform", organizationId: null },
        _sum: { totalSavings: true },
      }),
      prisma.discountCode.findMany({
        where: { scope: "platform", organizationId: null },
        orderBy: { usedCount: "desc" },
        take: 5,
        select: { code: true, usedCount: true, totalSavings: true },
      }),
      prisma.discountCodeUsage.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          discountCode: { scope: "platform", organizationId: null },
        },
      }),
    ]);

    return ok({
      totalPlatformDiscounts,
      activePlatformDiscounts,
      totalRedemptions,
      totalSavings: savingsAggregate._sum.totalSavings || 0,
      topDiscounts,
      recentRedemptions,
    });
  } catch (error) {
    console.error("[SuperAdmin] Error fetching discount stats:", error);
    return fail("Failed to fetch discount stats");
  }
}

/**
 * Generate a QR code URL for a discount
 */
export async function generateDiscountQrCode(
  id: string,
  baseUrl: string
): Promise<ActionResult<{ qrCodeUrl: string; shareableUrl: string }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const discount = await prisma.discountCode.findUnique({
      where: { id },
    });

    if (!discount) {
      return fail("Discount not found");
    }

    // Generate slug if not exists
    let slug = discount.shareableSlug;
    if (!slug) {
      slug = generateSlug(discount.code);
      await prisma.discountCode.update({
        where: { id },
        data: { shareableSlug: slug },
      });
    }

    const shareableUrl = `${baseUrl}/discount/${slug}`;

    // Generate QR code using a simple API (can be replaced with actual QR generation)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareableUrl)}`;

    // Update the discount with QR code URL
    await prisma.discountCode.update({
      where: { id },
      data: { qrCodeUrl },
    });

    revalidatePath("/super-admin/discounts");
    return ok({ qrCodeUrl, shareableUrl });
  } catch (error) {
    console.error("[SuperAdmin] Error generating QR code:", error);
    return fail("Failed to generate QR code");
  }
}
