"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { isSuperAdmin } from "@/lib/auth/super-admin";

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
        achievements: {
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
      achievements: user.achievements.map((a) => ({
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
  userId: string
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Get user's clerk ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clerkUserId: true },
    });

    if (!user) {
      return fail("User not found");
    }

    // For now, return a redirect URL - actual impersonation would need
    // Clerk's impersonation feature or a custom session system
    return ok({ redirectUrl: `/super-admin/impersonate/${userId}` });
  } catch (error) {
    console.error("Error starting impersonation:", error);
    return fail("Failed to start impersonation");
  }
}
