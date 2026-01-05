"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import type { ActivityData } from "@/lib/utils/activity";
import { ActivityType } from "@prisma/client";

// Note: Types can be re-exported but functions cannot from "use server" files
// Import getActivityLinkUrl and getActivityIcon directly from "@/lib/utils/activity"
export type { ActivityData } from "@/lib/utils/activity";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Activity feed filters
export interface ActivityFeedFilters {
  types?: ActivityType[];
  userId?: string;
  clientId?: string;
  projectId?: string;
  bookingId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Activity summary stats
export interface ActivitySummary {
  totalActivities: number;
  todayCount: number;
  weekCount: number;
  byType: { type: ActivityType; count: number }[];
  recentUsers: { userId: string; fullName: string | null; count: number }[];
}

/**
 * Fetches activity logs for the current organization
 */
export async function getActivityLogs(
  limit: number = 50,
  offset: number = 0
): Promise<ActionResult<{ activities: ActivityData[]; total: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          description: true,
          metadata: true,
          createdAt: true,
          projectId: true,
          clientId: true,
          paymentId: true,
          bookingId: true,
          invoiceId: true,
          contractId: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.activityLog.count({
        where: { organizationId },
      }),
    ]);

    return {
      success: true,
      data: {
        activities: activities.map((a) => ({
          ...a,
          metadata: a.metadata as Record<string, unknown> | null,
        })),
        total,
      },
    };
  } catch (error) {
    console.error("[Activity] Error fetching activity logs:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch activity logs" };
  }
}

/**
 * Fetches activity feed with advanced filtering
 */
export async function getActivityFeed(
  filters?: ActivityFeedFilters,
  pagination?: { limit?: number; offset?: number }
): Promise<ActionResult<{ activities: ActivityData[]; total: number; hasMore: boolean }>> {
  try {
    const organizationId = await requireOrganizationId();
    const limit = pagination?.limit || 25;
    const offset = pagination?.offset || 0;

    // Build where clause
    const where: Parameters<typeof prisma.activityLog.findMany>[0]["where"] = {
      organizationId,
    };

    if (filters?.types && filters.types.length > 0) {
      where.type = { in: filters.types };
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.bookingId) {
      where.bookingId = filters.bookingId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit + 1, // Fetch one extra to check hasMore
        skip: offset,
        select: {
          id: true,
          type: true,
          description: true,
          metadata: true,
          createdAt: true,
          projectId: true,
          clientId: true,
          paymentId: true,
          bookingId: true,
          invoiceId: true,
          contractId: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    const hasMore = activities.length > limit;
    const returnActivities = hasMore ? activities.slice(0, limit) : activities;

    return {
      success: true,
      data: {
        activities: returnActivities.map((a) => ({
          ...a,
          metadata: a.metadata as Record<string, unknown> | null,
        })),
        total,
        hasMore,
      },
    };
  } catch (error) {
    console.error("[Activity] Error fetching activity feed:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch activity feed" };
  }
}

/**
 * Get activity summary statistics
 */
export async function getActivitySummary(): Promise<ActionResult<ActivitySummary>> {
  try {
    const organizationId = await requireOrganizationId();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const [totalActivities, todayCount, weekCount, byType, recentUserActivities] =
      await Promise.all([
        prisma.activityLog.count({
          where: { organizationId },
        }),
        prisma.activityLog.count({
          where: {
            organizationId,
            createdAt: { gte: todayStart },
          },
        }),
        prisma.activityLog.count({
          where: {
            organizationId,
            createdAt: { gte: weekStart },
          },
        }),
        prisma.activityLog.groupBy({
          by: ["type"],
          where: { organizationId },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
        prisma.activityLog.groupBy({
          by: ["userId"],
          where: {
            organizationId,
            userId: { not: null },
            createdAt: { gte: weekStart },
          },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 5,
        }),
      ]);

    // Get user names for recent users
    const userIds = recentUserActivities
      .map((u) => u.userId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u.fullName]));

    return {
      success: true,
      data: {
        totalActivities,
        todayCount,
        weekCount,
        byType: byType.map((t) => ({
          type: t.type,
          count: t._count.id,
        })),
        recentUsers: recentUserActivities.map((u) => ({
          userId: u.userId || "",
          fullName: userMap.get(u.userId || "") || null,
          count: u._count.id,
        })),
      },
    };
  } catch (error) {
    console.error("[Activity] Error fetching activity summary:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch activity summary" };
  }
}

/**
 * Get activity timeline grouped by date
 */
export async function getActivityTimeline(
  days: number = 7
): Promise<
  ActionResult<{
    timeline: { date: string; activities: ActivityData[] }[];
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const activities = await prisma.activityLog.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true,
        projectId: true,
        clientId: true,
        paymentId: true,
        bookingId: true,
        invoiceId: true,
        contractId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Group by date
    const groupedByDate = new Map<string, ActivityData[]>();

    activities.forEach((activity) => {
      const dateKey = activity.createdAt.toISOString().split("T")[0];
      const existing = groupedByDate.get(dateKey) || [];
      existing.push({
        ...activity,
        metadata: activity.metadata as Record<string, unknown> | null,
      });
      groupedByDate.set(dateKey, existing);
    });

    // Convert to array sorted by date
    const timeline = Array.from(groupedByDate.entries())
      .map(([date, activities]) => ({ date, activities }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      success: true,
      data: { timeline },
    };
  } catch (error) {
    console.error("[Activity] Error fetching activity timeline:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch activity timeline" };
  }
}

/**
 * Search activities by description
 */
export async function searchActivities(
  query: string,
  limit: number = 20
): Promise<ActionResult<ActivityData[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const activities = await prisma.activityLog.findMany({
      where: {
        organizationId,
        description: {
          contains: query,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true,
        projectId: true,
        clientId: true,
        paymentId: true,
        bookingId: true,
        invoiceId: true,
        contractId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: activities.map((a) => ({
        ...a,
        metadata: a.metadata as Record<string, unknown> | null,
      })),
    };
  } catch (error) {
    console.error("[Activity] Error searching activities:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to search activities" };
  }
}

/**
 * Get activities for a specific entity
 */
export async function getEntityActivities(
  entityType: "client" | "project" | "booking" | "invoice" | "contract",
  entityId: string,
  limit: number = 50
): Promise<ActionResult<ActivityData[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const whereField = {
      client: "clientId",
      project: "projectId",
      booking: "bookingId",
      invoice: "invoiceId",
      contract: "contractId",
    }[entityType];

    const activities = await prisma.activityLog.findMany({
      where: {
        organizationId,
        [whereField]: entityId,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true,
        projectId: true,
        clientId: true,
        paymentId: true,
        bookingId: true,
        invoiceId: true,
        contractId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: activities.map((a) => ({
        ...a,
        metadata: a.metadata as Record<string, unknown> | null,
      })),
    };
  } catch (error) {
    console.error("[Activity] Error fetching entity activities:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch entity activities" };
  }
}
