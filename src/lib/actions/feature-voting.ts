"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { requireAuth } from "./auth-helper";
import { randomBytes } from "crypto";
import type {
  FeatureRequestStatus,
  FeatureRequestCategory,
} from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface PublicRoadmapPhase {
  id: string;
  name: string;
  title: string;
  description: string;
  status: string;
  order: number;
  targetStartDate: Date | null;
  targetEndDate: Date | null;
  items: PublicRoadmapItem[];
}

export interface PublicRoadmapItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  order: number;
  featureRequestId: string | null;
  voteCount: number;
}

export interface PublicFeatureRequest {
  id: string;
  title: string;
  description: string;
  category: FeatureRequestCategory;
  status: FeatureRequestStatus;
  userVoteCount: number;
  communityVoteCount: number;
  totalVoteCount: number;
  hasVoted: boolean;
  createdAt: Date;
}

// ============================================================================
// PUBLIC ROADMAP (No auth required)
// ============================================================================

/**
 * Get the public roadmap with phases and items
 */
export async function getPublicRoadmap(): Promise<
  ActionResult<PublicRoadmapPhase[]>
> {
  try {
    const phases = await prisma.roadmapPhase.findMany({
      where: {
        isVisible: true,
      },
      orderBy: { order: "asc" },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            featureRequest: {
              select: {
                totalVoteCount: true,
              },
            },
          },
        },
      },
    });

    return ok(
      phases.map((phase) => ({
        id: phase.id,
        name: phase.name,
        title: phase.title,
        description: phase.description,
        status: phase.status,
        order: phase.order,
        targetStartDate: phase.targetStartDate,
        targetEndDate: phase.targetEndDate,
        items: phase.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          status: item.status,
          order: item.order,
          featureRequestId: item.featureRequestId,
          voteCount: item.featureRequest?.totalVoteCount || 0,
        })),
      }))
    );
  } catch (error) {
    console.error("Error getting public roadmap:", error);
    return fail("Failed to load roadmap");
  }
}

/**
 * Get approved feature requests for voting
 */
export async function getApprovedFeatureRequests(options?: {
  category?: FeatureRequestCategory;
  status?: FeatureRequestStatus;
  userId?: string;
  voterId?: string;
}): Promise<ActionResult<PublicFeatureRequest[]>> {
  try {
    const features = await prisma.featureRequest.findMany({
      where: {
        status: options?.status || { in: ["approved", "planned", "in_progress"] },
        ...(options?.category && { category: options.category }),
      },
      orderBy: { totalVoteCount: "desc" },
      include: {
        votes: {
          where: {
            OR: [
              ...(options?.userId ? [{ userId: options.userId }] : []),
              ...(options?.voterId ? [{ voterId: options.voterId }] : []),
            ],
          },
          take: 1,
        },
      },
    });

    return ok(
      features.map((feature) => ({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        category: feature.category,
        status: feature.status,
        userVoteCount: feature.userVoteCount,
        communityVoteCount: feature.communityVoteCount,
        totalVoteCount: feature.totalVoteCount,
        hasVoted: feature.votes.length > 0,
        createdAt: feature.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error getting feature requests:", error);
    return fail("Failed to load features");
  }
}

// ============================================================================
// AUTHENTICATED USER VOTING
// ============================================================================

/**
 * Cast a vote on a feature request (authenticated user)
 */
export async function castVoteAsUser(
  featureRequestId: string
): Promise<ActionResult<{ voted: boolean }>> {
  try {
    const auth = await requireAuth();
    const { userId } = auth;

    // Check if already voted
    const existingVote = await prisma.featureVote.findUnique({
      where: {
        featureRequestId_userId: {
          featureRequestId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Remove vote
      await prisma.featureVote.delete({
        where: { id: existingVote.id },
      });

      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          userVoteCount: { decrement: 1 },
          totalVoteCount: { decrement: 1 },
        },
      });

      revalidatePath("/roadmap");
      return ok({ voted: false });
    }

    // Add vote
    await prisma.featureVote.create({
      data: {
        featureRequestId,
        userId,
      },
    });

    await prisma.featureRequest.update({
      where: { id: featureRequestId },
      data: {
        userVoteCount: { increment: 1 },
        totalVoteCount: { increment: 1 },
      },
    });

    // Award XP for first vote (gamification)
    // Check if this is the user's first vote today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysVotes = await prisma.featureVote.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    if (todaysVotes === 1) {
      // First vote today - award 5 XP
      await prisma.gamificationProfile.upsert({
        where: { userId },
        create: { userId, totalXp: 5 },
        update: { totalXp: { increment: 5 } },
      });
    }

    revalidatePath("/roadmap");
    return ok({ voted: true });
  } catch (error) {
    console.error("Error casting vote:", error);
    return fail("Failed to cast vote");
  }
}

/**
 * Submit a feature request (authenticated user)
 */
export async function submitFeatureRequestAsUser(data: {
  title: string;
  description: string;
  category: FeatureRequestCategory;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const auth = await requireAuth();
    const { userId } = auth;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return fail("User not found");
    }

    const feature = await prisma.featureRequest.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        status: "pending",
        submittedByUserId: userId,
        submittedByEmail: user.email,
      },
    });

    // Award XP for submitting (even if rejected)
    await prisma.gamificationProfile.upsert({
      where: { userId },
      create: { userId, totalXp: 10 },
      update: { totalXp: { increment: 10 } },
    });

    revalidatePath("/roadmap");
    return ok({ id: feature.id });
  } catch (error) {
    console.error("Error submitting feature request:", error);
    return fail("Failed to submit feature request");
  }
}

// ============================================================================
// COMMUNITY VOTER (Email verification)
// ============================================================================

/**
 * Send verification email for community voting
 */
export async function sendVoterVerificationEmail(
  email: string
): Promise<ActionResult<void>> {
  try {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail("Invalid email format");
    }

    // Generate token
    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Upsert voter
    await prisma.verifiedVoter.upsert({
      where: { email },
      create: {
        email,
        verificationToken: token,
        verificationTokenExpiry: expiry,
      },
      update: {
        verificationToken: token,
        verificationTokenExpiry: expiry,
      },
    });

    // Send email (using your email service)
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/roadmap/verify?token=${token}`;

    // TODO: Implement email sending
    console.log(`Verification email to ${email}: ${verifyUrl}`);

    return success();
  } catch (error) {
    console.error("Error sending verification email:", error);
    return fail("Failed to send verification email");
  }
}

/**
 * Verify email token
 */
export async function verifyVoterEmail(
  token: string
): Promise<ActionResult<{ voterId: string }>> {
  try {
    const voter = await prisma.verifiedVoter.findUnique({
      where: { verificationToken: token },
    });

    if (!voter) {
      return fail("Invalid verification token");
    }

    if (voter.verificationTokenExpiry && voter.verificationTokenExpiry < new Date()) {
      return fail("Verification token expired");
    }

    // Mark as verified
    await prisma.verifiedVoter.update({
      where: { id: voter.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return ok({ voterId: voter.id });
  } catch (error) {
    console.error("Error verifying email:", error);
    return fail("Failed to verify email");
  }
}

/**
 * Cast a vote as verified community voter
 */
export async function castVoteAsVoter(
  featureRequestId: string,
  voterId: string
): Promise<ActionResult<{ voted: boolean }>> {
  try {
    // Verify voter exists and is verified
    const voter = await prisma.verifiedVoter.findUnique({
      where: { id: voterId },
    });

    if (!voter || !voter.isVerified) {
      return fail("Voter not verified");
    }

    if (voter.isBlocked) {
      return fail("Voting privileges have been revoked");
    }

    // Check daily vote limit (max 5 votes per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (voter.lastVoteDate && voter.lastVoteDate >= today) {
      if (voter.dailyVoteCount >= 5) {
        return fail("Daily vote limit reached. Please try again tomorrow.");
      }
    } else {
      // Reset daily count
      await prisma.verifiedVoter.update({
        where: { id: voterId },
        data: {
          dailyVoteCount: 0,
          lastVoteDate: today,
        },
      });
    }

    // Check if already voted
    const existingVote = await prisma.featureVote.findUnique({
      where: {
        featureRequestId_voterId: {
          featureRequestId,
          voterId,
        },
      },
    });

    if (existingVote) {
      // Remove vote
      await prisma.featureVote.delete({
        where: { id: existingVote.id },
      });

      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          communityVoteCount: { decrement: 1 },
          totalVoteCount: { decrement: 1 },
        },
      });

      revalidatePath("/roadmap");
      return ok({ voted: false });
    }

    // Add vote
    await prisma.featureVote.create({
      data: {
        featureRequestId,
        voterId,
      },
    });

    await prisma.$transaction([
      prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          communityVoteCount: { increment: 1 },
          totalVoteCount: { increment: 1 },
        },
      }),
      prisma.verifiedVoter.update({
        where: { id: voterId },
        data: {
          dailyVoteCount: { increment: 1 },
          lastVoteDate: today,
        },
      }),
    ]);

    revalidatePath("/roadmap");
    return ok({ voted: true });
  } catch (error) {
    console.error("Error casting vote:", error);
    return fail("Failed to cast vote");
  }
}

/**
 * Submit a feature request as verified community voter
 */
export async function submitFeatureRequestAsVoter(
  voterId: string,
  data: {
    title: string;
    description: string;
    category: FeatureRequestCategory;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const voter = await prisma.verifiedVoter.findUnique({
      where: { id: voterId },
    });

    if (!voter || !voter.isVerified) {
      return fail("Voter not verified");
    }

    if (voter.isBlocked) {
      return fail("Submission privileges have been revoked");
    }

    const feature = await prisma.featureRequest.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        status: "pending",
        submittedByVoterId: voterId,
        submittedByEmail: voter.email,
      },
    });

    revalidatePath("/roadmap");
    return ok({ id: feature.id });
  } catch (error) {
    console.error("Error submitting feature request:", error);
    return fail("Failed to submit feature request");
  }
}

// ============================================================================
// ADMIN ACTIONS (for moderation)
// ============================================================================

/**
 * Get pending feature requests for moderation
 */
export async function getPendingFeatureRequests(): Promise<
  ActionResult<PublicFeatureRequest[]>
> {
  try {
    // TODO: Add super admin auth check
    const features = await prisma.featureRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    return ok(
      features.map((feature) => ({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        category: feature.category,
        status: feature.status,
        userVoteCount: feature.userVoteCount,
        communityVoteCount: feature.communityVoteCount,
        totalVoteCount: feature.totalVoteCount,
        hasVoted: false,
        createdAt: feature.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error getting pending features:", error);
    return fail("Failed to load pending features");
  }
}

/**
 * Approve a feature request
 */
export async function approveFeatureRequest(
  featureId: string,
  roadmapPhase?: string
): Promise<ActionResult<void>> {
  try {
    // TODO: Add super admin auth check
    const feature = await prisma.featureRequest.update({
      where: { id: featureId },
      data: {
        status: "approved",
        reviewedAt: new Date(),
        roadmapPhase,
      },
    });

    // Award bonus XP if submitted by user
    if (feature.submittedByUserId) {
      await prisma.gamificationProfile.upsert({
        where: { userId: feature.submittedByUserId },
        create: { userId: feature.submittedByUserId, totalXp: 50 },
        update: { totalXp: { increment: 50 } },
      });
    }

    revalidatePath("/roadmap");
    revalidatePath("/super-admin/roadmap");
    return success();
  } catch (error) {
    console.error("Error approving feature:", error);
    return fail("Failed to approve feature");
  }
}

/**
 * Reject a feature request
 */
export async function rejectFeatureRequest(
  featureId: string,
  reason: string
): Promise<ActionResult<void>> {
  try {
    // TODO: Add super admin auth check
    await prisma.featureRequest.update({
      where: { id: featureId },
      data: {
        status: "rejected",
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    revalidatePath("/super-admin/roadmap");
    return success();
  } catch (error) {
    console.error("Error rejecting feature:", error);
    return fail("Failed to reject feature");
  }
}

/**
 * Mark a feature as implemented
 */
export async function markFeatureImplemented(
  featureId: string
): Promise<ActionResult<void>> {
  try {
    // TODO: Add super admin auth check
    const feature = await prisma.featureRequest.update({
      where: { id: featureId },
      data: { status: "completed" },
    });

    // Award bonus XP for implemented feature
    if (feature.submittedByUserId) {
      await prisma.gamificationProfile.upsert({
        where: { userId: feature.submittedByUserId },
        create: { userId: feature.submittedByUserId, totalXp: 200 },
        update: { totalXp: { increment: 200 } },
      });
    }

    revalidatePath("/roadmap");
    revalidatePath("/super-admin/roadmap");
    return success();
  } catch (error) {
    console.error("Error marking feature implemented:", error);
    return fail("Failed to update feature");
  }
}
