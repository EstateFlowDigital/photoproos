"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { requireAuth } from "./auth-helper";
import { isSuperAdmin } from "@/lib/auth/super-admin";

// ============================================================================
// TYPES
// ============================================================================

interface PlatformFeedbackData {
  id: string;
  source: string;
  rating: number | null;
  likedFeatures: string[];
  dislikedFeatures: string[];
  comment: string | null;
  sessionCount: number | null;
  xpAwarded: number;
  isReviewed: boolean;
  createdAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
  organization: {
    id: string;
    name: string;
  } | null;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  pendingReview: number;
  thisWeek: number;
  likedFeatures: { feature: string; count: number }[];
  dislikedFeatures: { feature: string; count: number }[];
}

// ============================================================================
// USER ACTIONS
// ============================================================================

/**
 * Submit platform feedback
 */
export async function submitPlatformFeedback(data: {
  rating?: number;
  likedFeatures?: string[];
  dislikedFeatures?: string[];
  comment?: string;
  source?: string;
}): Promise<ActionResult<{ id: string; xpAwarded: number }>> {
  try {
    const auth = await requireAuth();
    const { organizationId, userId } = auth;

    // Get user's session count
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalSessions: true },
    });

    // Determine XP based on feedback completeness
    let xpAward = 50; // Base XP
    if (data.comment && data.comment.length > 50) xpAward += 25;
    if ((data.likedFeatures?.length || 0) > 0) xpAward += 15;
    if ((data.dislikedFeatures?.length || 0) > 0) xpAward += 10;

    const feedback = await prisma.platformFeedback.create({
      data: {
        organizationId,
        userId,
        source: data.source || "session_modal",
        rating: data.rating,
        likedFeatures: data.likedFeatures || [],
        dislikedFeatures: data.dislikedFeatures || [],
        comment: data.comment,
        sessionCount: user?.totalSessions,
        xpAwarded: xpAward,
      },
    });

    // Award XP to user
    await prisma.gamificationProfile.upsert({
      where: { userId },
      create: { userId, totalXp: xpAward },
      update: { totalXp: { increment: xpAward } },
    });

    // Create XP record
    await prisma.xpActivityLog.create({
      data: {
        userId,
        amount: xpAward,
        type: "admin_award",
        description: "Platform feedback submitted",
      },
    });

    return ok({ id: feedback.id, xpAwarded: xpAward });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return fail("Failed to submit feedback");
  }
}

/**
 * Check if user should see feedback modal
 */
export async function shouldShowFeedbackModal(): Promise<
  ActionResult<{ show: boolean; sessionCount: number }>
> {
  try {
    const auth = await requireAuth();
    const { userId } = auth;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalSessions: true },
    });

    if (!user) {
      return ok({ show: false, sessionCount: 0 });
    }

    // Check for recent feedback (within last 50 sessions)
    const recentFeedback = await prisma.platformFeedback.findFirst({
      where: {
        userId,
        sessionCount: {
          gte: user.totalSessions - 50,
        },
      },
    });

    // Show modal if:
    // 1. User has 10+ sessions
    // 2. User has no recent feedback
    const shouldShow =
      user.totalSessions >= 10 &&
      !recentFeedback &&
      user.totalSessions % 10 === 0; // Every 10 sessions

    return ok({ show: shouldShow, sessionCount: user.totalSessions });
  } catch (error) {
    console.error("Error checking feedback modal:", error);
    return ok({ show: false, sessionCount: 0 });
  }
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

/**
 * Get all platform feedback (admin)
 */
export async function getAllPlatformFeedback(options?: {
  isReviewed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ActionResult<PlatformFeedbackData[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const where: Record<string, unknown> = {};
    if (options?.isReviewed !== undefined) {
      where.isReviewed = options.isReviewed;
    }

    const feedback = await prisma.platformFeedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 100,
      skip: options?.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return ok(
      feedback.map((f) => ({
        id: f.id,
        source: f.source,
        rating: f.rating,
        likedFeatures: f.likedFeatures,
        dislikedFeatures: f.dislikedFeatures,
        comment: f.comment,
        sessionCount: f.sessionCount,
        xpAwarded: f.xpAwarded,
        isReviewed: f.isReviewed,
        createdAt: f.createdAt,
        user: f.user
          ? {
              id: f.user.id,
              fullName: f.user.fullName,
              email: f.user.email,
              avatarUrl: f.user.avatarUrl,
            }
          : null,
        organization: f.organization
          ? {
              id: f.organization.id,
              name: f.organization.name,
            }
          : null,
      }))
    );
  } catch (error) {
    console.error("Error getting feedback:", error);
    return fail("Failed to get feedback");
  }
}

/**
 * Get feedback statistics (admin)
 */
export async function getFeedbackStats(): Promise<ActionResult<FeedbackStats>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalFeedback, avgRating, pendingReview, thisWeek, allFeedback] =
      await Promise.all([
        prisma.platformFeedback.count(),
        prisma.platformFeedback.aggregate({
          _avg: { rating: true },
          where: { rating: { not: null } },
        }),
        prisma.platformFeedback.count({
          where: { isReviewed: false },
        }),
        prisma.platformFeedback.count({
          where: { createdAt: { gte: weekAgo } },
        }),
        prisma.platformFeedback.findMany({
          select: {
            likedFeatures: true,
            dislikedFeatures: true,
          },
        }),
      ]);

    // Aggregate feature counts
    const likedCounts = new Map<string, number>();
    const dislikedCounts = new Map<string, number>();

    allFeedback.forEach((f) => {
      f.likedFeatures.forEach((feat) => {
        likedCounts.set(feat, (likedCounts.get(feat) || 0) + 1);
      });
      f.dislikedFeatures.forEach((feat) => {
        dislikedCounts.set(feat, (dislikedCounts.get(feat) || 0) + 1);
      });
    });

    const likedFeatures = Array.from(likedCounts.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const dislikedFeatures = Array.from(dislikedCounts.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return ok({
      totalFeedback,
      averageRating: avgRating._avg.rating || 0,
      pendingReview,
      thisWeek,
      likedFeatures,
      dislikedFeatures,
    });
  } catch (error) {
    console.error("Error getting feedback stats:", error);
    return fail("Failed to get stats");
  }
}

/**
 * Mark feedback as reviewed (admin)
 */
export async function markFeedbackReviewed(
  feedbackId: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await prisma.platformFeedback.update({
      where: { id: feedbackId },
      data: { isReviewed: true },
    });

    revalidatePath("/super-admin/feedback");
    return success();
  } catch (error) {
    console.error("Error marking feedback reviewed:", error);
    return fail("Failed to update feedback");
  }
}

/**
 * Award additional XP for feedback (admin)
 */
export async function awardFeedbackXp(
  feedbackId: string,
  amount: number,
  reason?: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const feedback = await prisma.platformFeedback.findUnique({
      where: { id: feedbackId },
      select: { userId: true },
    });

    if (!feedback?.userId) {
      return fail("Feedback not found");
    }

    await prisma.$transaction([
      prisma.platformFeedback.update({
        where: { id: feedbackId },
        data: { xpAwarded: { increment: amount } },
      }),
      prisma.gamificationProfile.upsert({
        where: { userId: feedback.userId },
        create: { userId: feedback.userId, totalXp: amount },
        update: { totalXp: { increment: amount } },
      }),
      prisma.adminXpAward.create({
        data: {
          userId: feedback.userId,
          amount,
          reason: reason || "Feedback bonus",
        },
      }),
    ]);

    revalidatePath("/super-admin/feedback");
    return success();
  } catch (error) {
    console.error("Error awarding feedback XP:", error);
    return fail("Failed to award XP");
  }
}
