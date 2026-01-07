"use server";

import { ok, fail, type ActionResult } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { logActivity } from "@/lib/utils/activity";

// ============================================================================
// Types
// ============================================================================

export interface SettingsChange {
  id: string;
  description: string;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  userName: string | null;
  userEmail: string | null;
  createdAt: Date;
}

export interface SettingsHistoryResult {
  changes: SettingsChange[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Fetch Settings History
// ============================================================================

/**
 * Get settings change history for the current organization
 */
export async function getSettingsHistory(
  page = 1,
  pageSize = 10
): Promise<ActionResult<SettingsHistoryResult>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Organization not found");
    }

    const skip = (page - 1) * pageSize;

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          organizationId: auth.organizationId,
          type: "settings_updated",
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize + 1, // Take one extra to check if there's more
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.activityLog.count({
        where: {
          organizationId: auth.organizationId,
          type: "settings_updated",
        },
      }),
    ]);

    const hasMore = activities.length > pageSize;
    const changes: SettingsChange[] = activities.slice(0, pageSize).map((a) => ({
      id: a.id,
      description: a.description,
      changes: a.metadata as Record<string, { from: unknown; to: unknown }> | null,
      userName: a.user?.fullName || null,
      userEmail: a.user?.email || null,
      createdAt: a.createdAt,
    }));

    return ok({
      changes,
      total,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching settings history:", error);
    return fail("Failed to fetch settings history");
  }
}

// ============================================================================
// Log Settings Change
// ============================================================================

/**
 * Log a settings change to the activity log
 *
 * This should be called after any settings update to track changes.
 */
export async function logSettingsChange(params: {
  description: string;
  settingsArea: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
}): Promise<void> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId || !auth?.userId) {
      return;
    }

    await logActivity({
      organizationId: auth.organizationId,
      userId: auth.userId,
      type: "settings_updated",
      description: params.description,
      metadata: {
        settingsArea: params.settingsArea,
        changes: params.changes || {},
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error logging settings change:", error);
    // Don't throw - logging should never break the main operation
  }
}

// NOTE: For tracking changes between old and new values, use the helper in:
// import { trackSettingsChanges } from "@/lib/utils/settings-helpers";
