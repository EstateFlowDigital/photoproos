"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import type { ActivityData } from "@/lib/utils/activity";

// Note: Types can be re-exported but functions cannot from "use server" files
// Import getActivityLinkUrl and getActivityIcon directly from "@/lib/utils/activity"
export type { ActivityData } from "@/lib/utils/activity";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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
