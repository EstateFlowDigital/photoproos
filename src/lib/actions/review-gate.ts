"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type {
  ReviewPlatformType,
  ReviewRequestStatus,
  ReviewRequestSource,
} from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { sendReviewRequestEmail } from "@/lib/email/send";
import { createNotification } from "./notifications";

// =============================================================================
// Types
// =============================================================================

interface ReviewPlatformInput {
  type: ReviewPlatformType;
  name: string;
  url: string;
  iconUrl?: string;
  priority?: number;
}

interface UpdateReviewPlatformInput {
  name?: string;
  url?: string;
  iconUrl?: string;
  isActive?: boolean;
  priority?: number;
}

interface ReviewGateSettings {
  reviewGateEnabled: boolean;
  reviewGateDeliveryEmailEnabled: boolean;
  reviewGateFollowupEnabled: boolean;
  reviewGateFollowupDays: number;
  reviewGateChatEnabled: boolean;
  reviewGateGalleryPromptEnabled: boolean;
}

interface CreateReviewRequestInput {
  projectId?: string;
  clientId?: string;
  clientEmail?: string;
  clientName?: string;
  source?: ReviewRequestSource;
  preferredPlatformId?: string;
  expiresAt?: Date;
}

interface SubmitReviewResponseInput {
  token: string;
  rating: number;
  feedback?: string;
  feedbackCategory?: string;
  redirectedToPlatformId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ReviewStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  averageRating: number;
  responseRate: number;
  platformClicks: number;
  ratingDistribution: { rating: number; count: number }[];
  recentResponses: {
    id: string;
    rating: number;
    feedback: string | null;
    submittedAt: Date;
    clientName: string | null;
    projectName: string | null;
  }[];
}

// =============================================================================
// Review Platform CRUD
// =============================================================================

/**
 * Get all review platforms for the organization
 */
export async function getReviewPlatforms(options?: {
  includeInactive?: boolean;
}): Promise<ActionResult<Array<{
  id: string;
  type: ReviewPlatformType;
  name: string;
  url: string;
  iconUrl: string | null;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}>>> {
  try {
    const organizationId = await requireOrganizationId();

    const platforms = await prisma.reviewPlatform.findMany({
      where: {
        organizationId,
        ...(options?.includeInactive ? {} : { isActive: true }),
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    return success(platforms);
  } catch (error) {
    console.error("Failed to get review platforms:", error);
    return fail("Failed to get review platforms");
  }
}

/**
 * Create a new review platform
 */
export async function createReviewPlatform(
  input: ReviewPlatformInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Check for duplicate platform type
    const existing = await prisma.reviewPlatform.findFirst({
      where: {
        organizationId,
        type: input.type,
      },
    });

    if (existing) {
      return fail(`A ${input.type.replace("_", " ")} platform is already configured`);
    }

    const platform = await prisma.reviewPlatform.create({
      data: {
        organizationId,
        type: input.type,
        name: input.name,
        url: input.url,
        iconUrl: input.iconUrl,
        priority: input.priority ?? 0,
      },
    });

    revalidatePath("/settings/reviews");
    return success({ id: platform.id });
  } catch (error) {
    console.error("Failed to create review platform:", error);
    return fail("Failed to create review platform");
  }
}

/**
 * Update a review platform
 */
export async function updateReviewPlatform(
  platformId: string,
  input: UpdateReviewPlatformInput
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify ownership
    const existing = await prisma.reviewPlatform.findFirst({
      where: { id: platformId, organizationId },
    });

    if (!existing) {
      return fail("Platform not found");
    }

    await prisma.reviewPlatform.update({
      where: { id: platformId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.url !== undefined && { url: input.url }),
        ...(input.iconUrl !== undefined && { iconUrl: input.iconUrl }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.priority !== undefined && { priority: input.priority }),
      },
    });

    revalidatePath("/settings/reviews");
    return ok();
  } catch (error) {
    console.error("Failed to update review platform:", error);
    return fail("Failed to update review platform");
  }
}

/**
 * Delete a review platform
 */
export async function deleteReviewPlatform(
  platformId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify ownership
    const existing = await prisma.reviewPlatform.findFirst({
      where: { id: platformId, organizationId },
    });

    if (!existing) {
      return fail("Platform not found");
    }

    await prisma.reviewPlatform.delete({
      where: { id: platformId },
    });

    revalidatePath("/settings/reviews");
    return ok();
  } catch (error) {
    console.error("Failed to delete review platform:", error);
    return fail("Failed to delete review platform");
  }
}

// =============================================================================
// Review Gate Settings
// =============================================================================

/**
 * Get review gate settings for the organization
 */
export async function getReviewGateSettings(): Promise<ActionResult<ReviewGateSettings>> {
  try {
    const organizationId = await requireOrganizationId();

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        reviewGateEnabled: true,
        reviewGateDeliveryEmailEnabled: true,
        reviewGateFollowupEnabled: true,
        reviewGateFollowupDays: true,
        reviewGateChatEnabled: true,
        reviewGateGalleryPromptEnabled: true,
      },
    });

    if (!org) {
      return fail("Organization not found");
    }

    return success(org);
  } catch (error) {
    console.error("Failed to get review gate settings:", error);
    return fail("Failed to get review gate settings");
  }
}

/**
 * Update review gate settings
 */
export async function updateReviewGateSettings(
  settings: Partial<ReviewGateSettings>
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Validate followup days if provided
    if (settings.reviewGateFollowupDays !== undefined) {
      if (settings.reviewGateFollowupDays < 1 || settings.reviewGateFollowupDays > 30) {
        return fail("Follow-up days must be between 1 and 30");
      }
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(settings.reviewGateEnabled !== undefined && {
          reviewGateEnabled: settings.reviewGateEnabled,
        }),
        ...(settings.reviewGateDeliveryEmailEnabled !== undefined && {
          reviewGateDeliveryEmailEnabled: settings.reviewGateDeliveryEmailEnabled,
        }),
        ...(settings.reviewGateFollowupEnabled !== undefined && {
          reviewGateFollowupEnabled: settings.reviewGateFollowupEnabled,
        }),
        ...(settings.reviewGateFollowupDays !== undefined && {
          reviewGateFollowupDays: settings.reviewGateFollowupDays,
        }),
        ...(settings.reviewGateChatEnabled !== undefined && {
          reviewGateChatEnabled: settings.reviewGateChatEnabled,
        }),
        ...(settings.reviewGateGalleryPromptEnabled !== undefined && {
          reviewGateGalleryPromptEnabled: settings.reviewGateGalleryPromptEnabled,
        }),
      },
    });

    revalidatePath("/settings/reviews");
    return ok();
  } catch (error) {
    console.error("Failed to update review gate settings:", error);
    return fail("Failed to update review gate settings");
  }
}

// =============================================================================
// Review Requests
// =============================================================================

/**
 * Create a new review request
 */
export async function createReviewRequest(
  input: CreateReviewRequestInput
): Promise<ActionResult<{ id: string; token: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // If clientId provided, get client details
    let clientEmail = input.clientEmail;
    let clientName = input.clientName;

    if (input.clientId && (!clientEmail || !clientName)) {
      const client = await prisma.client.findFirst({
        where: { id: input.clientId, organizationId },
        select: { email: true, fullName: true },
      });
      if (client) {
        clientEmail = clientEmail || client.email;
        clientName = clientName || client.fullName || undefined;
      }
    }

    // If projectId provided and no client, try to get from project
    if (input.projectId && !input.clientId && (!clientEmail || !clientName)) {
      const project = await prisma.project.findFirst({
        where: { id: input.projectId, organizationId },
        include: { client: { select: { email: true, fullName: true } } },
      });
      if (project?.client) {
        clientEmail = clientEmail || project.client.email;
        clientName = clientName || project.client.fullName || undefined;
      }
    }

    if (!clientEmail) {
      return fail("Client email is required");
    }

    const request = await prisma.reviewRequest.create({
      data: {
        organizationId,
        projectId: input.projectId,
        clientId: input.clientId,
        clientEmail,
        clientName,
        source: input.source || "manual",
        preferredPlatformId: input.preferredPlatformId,
        expiresAt: input.expiresAt,
      },
    });

    return success({ id: request.id, token: request.token });
  } catch (error) {
    console.error("Failed to create review request:", error);
    return fail("Failed to create review request");
  }
}

/**
 * Send a manual review request email to a client
 * Creates the review request and sends the email immediately
 */
export async function sendManualReviewRequest(input: {
  clientId?: string;
  projectId?: string;
  clientEmail?: string;
  clientName?: string;
}): Promise<ActionResult<{ id: string; token: string; emailSent: boolean }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get organization details for the email
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        publicName: true,
        logoUrl: true,
        primaryColor: true,
        reviewGateEnabled: true,
      },
    });

    if (!organization) {
      return fail("Organization not found");
    }

    if (!organization.reviewGateEnabled) {
      return fail("Review gate is not enabled for this organization");
    }

    // Get client details
    let clientEmail = input.clientEmail;
    let clientName = input.clientName;
    let projectName: string | undefined;

    if (input.clientId && (!clientEmail || !clientName)) {
      const client = await prisma.client.findFirst({
        where: { id: input.clientId, organizationId },
        select: { email: true, fullName: true },
      });
      if (client) {
        clientEmail = clientEmail || client.email;
        clientName = clientName || client.fullName || undefined;
      }
    }

    if (input.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: input.projectId, organizationId },
        include: { client: { select: { id: true, email: true, fullName: true } } },
      });
      if (project) {
        projectName = project.name;
        if (!input.clientId && project.client) {
          clientEmail = clientEmail || project.client.email;
          clientName = clientName || project.client.fullName || undefined;
        }
      }
    }

    if (!clientEmail) {
      return fail("Client email is required");
    }

    // Create the review request
    const request = await prisma.reviewRequest.create({
      data: {
        organizationId,
        projectId: input.projectId,
        clientId: input.clientId,
        clientEmail,
        clientName,
        source: "manual",
        status: "pending",
      },
    });

    // Build review URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
    const reviewUrl = `${baseUrl}/review/${request.token}`;

    // Send the email
    const emailResult = await sendReviewRequestEmail({
      to: clientEmail,
      clientName: clientName || "there",
      photographerName: organization.publicName || organization.name,
      photographerLogo: organization.logoUrl,
      reviewUrl,
      projectName,
      primaryColor: organization.primaryColor || undefined,
    });

    // Update request status based on email result
    if (emailResult.success) {
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: {
          status: "sent",
          emailSentAt: new Date(),
        },
      });
    }

    revalidatePath("/settings/reviews");
    revalidatePath("/settings/reviews/requests");

    return success({
      id: request.id,
      token: request.token,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Failed to send manual review request:", error);
    return fail("Failed to send review request");
  }
}

/**
 * Get a review request by token (public - no auth required)
 */
export async function getReviewRequestByToken(token: string): Promise<ActionResult<{
  id: string;
  organizationId: string;
  status: ReviewRequestStatus;
  clientName: string | null;
  expiresAt: Date | null;
  organization: {
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
  };
  platforms: Array<{
    id: string;
    type: ReviewPlatformType;
    name: string;
    url: string;
    iconUrl: string | null;
  }>;
  preferredPlatform: {
    id: string;
    type: ReviewPlatformType;
    name: string;
    url: string;
    iconUrl: string | null;
  } | null;
  hasResponded: boolean;
}>> {
  try {
    const request = await prisma.reviewRequest.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            name: true,
            logoUrl: true,
            primaryColor: true,
            reviewPlatforms: {
              where: { isActive: true },
              orderBy: { priority: "desc" },
              select: {
                id: true,
                type: true,
                name: true,
                url: true,
                iconUrl: true,
              },
            },
          },
        },
        preferredPlatform: {
          select: {
            id: true,
            type: true,
            name: true,
            url: true,
            iconUrl: true,
          },
        },
        response: { select: { id: true } },
      },
    });

    if (!request) {
      return fail("Review request not found");
    }

    // Check if expired
    if (request.expiresAt && new Date() > request.expiresAt) {
      return fail("This review request has expired");
    }

    // Update status to viewed if pending/sent
    if (request.status === "pending" || request.status === "sent") {
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: {
          status: "viewed",
          viewedAt: new Date(),
        },
      });
    }

    return success({
      id: request.id,
      organizationId: request.organizationId,
      status: request.status,
      clientName: request.clientName,
      expiresAt: request.expiresAt,
      organization: {
        name: request.organization.name,
        logoUrl: request.organization.logoUrl,
        primaryColor: request.organization.primaryColor,
      },
      platforms: request.organization.reviewPlatforms,
      preferredPlatform: request.preferredPlatform,
      hasResponded: !!request.response,
    });
  } catch (error) {
    console.error("Failed to get review request:", error);
    return fail("Failed to get review request");
  }
}

/**
 * Mark a review request as sent (email delivered)
 */
export async function markReviewRequestSent(
  requestId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const request = await prisma.reviewRequest.findFirst({
      where: { id: requestId, organizationId },
    });

    if (!request) {
      return fail("Review request not found");
    }

    await prisma.reviewRequest.update({
      where: { id: requestId },
      data: {
        status: "sent",
        emailSentAt: new Date(),
      },
    });

    return ok();
  } catch (error) {
    console.error("Failed to mark review request as sent:", error);
    return fail("Failed to mark review request as sent");
  }
}

/**
 * Submit a review response (public - no auth required)
 */
export async function submitReviewResponse(
  input: SubmitReviewResponseInput
): Promise<ActionResult<{ isHighRating: boolean }>> {
  try {
    // Validate rating
    if (input.rating < 1 || input.rating > 5) {
      return fail("Rating must be between 1 and 5");
    }

    const request = await prisma.reviewRequest.findUnique({
      where: { token: input.token },
      include: { response: true },
    });

    if (!request) {
      return fail("Review request not found");
    }

    if (request.response) {
      return fail("You have already submitted a response");
    }

    // Check if expired
    if (request.expiresAt && new Date() > request.expiresAt) {
      return fail("This review request has expired");
    }

    const isHighRating = input.rating >= 4;

    await prisma.$transaction([
      // Create the response
      prisma.reviewResponse.create({
        data: {
          reviewRequestId: request.id,
          rating: input.rating,
          feedback: input.feedback,
          feedbackCategory: input.feedbackCategory,
          redirectedToPlatformId: isHighRating ? input.redirectedToPlatformId : undefined,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      }),
      // Update request status
      prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "completed" },
      }),
    ]);

    // Create a notification for the organization
    const stars = "★".repeat(input.rating) + "☆".repeat(5 - input.rating);
    const clientDisplay = request.clientName || request.clientEmail || "A client";
    const notificationTitle = isHighRating
      ? `${stars} New ${input.rating}-star review!`
      : `${stars} New feedback received`;
    const notificationMessage = isHighRating
      ? `${clientDisplay} left a ${input.rating}-star review${input.feedback ? ` and said: "${input.feedback.substring(0, 100)}${input.feedback.length > 100 ? "..." : ""}"` : "."}`
      : `${clientDisplay} left ${input.rating}-star feedback${input.feedback ? `: "${input.feedback.substring(0, 100)}${input.feedback.length > 100 ? "..." : ""}"` : "."}`;

    await createNotification({
      organizationId: request.organizationId,
      type: "review_feedback_received",
      title: notificationTitle,
      message: notificationMessage,
      linkUrl: "/settings/reviews/requests",
    });

    return success({ isHighRating });
  } catch (error) {
    console.error("Failed to submit review response:", error);
    return fail("Failed to submit review response");
  }
}

/**
 * Record when a user clicks through to a review platform
 */
export async function recordPlatformClick(
  token: string,
  platformId: string
): Promise<ActionResult<void>> {
  try {
    const request = await prisma.reviewRequest.findUnique({
      where: { token },
      include: { response: true },
    });

    if (!request || !request.response) {
      return fail("Review response not found");
    }

    await prisma.reviewResponse.update({
      where: { id: request.response.id },
      data: {
        redirectedToPlatformId: platformId,
        clickedPlatformLink: true,
      },
    });

    return ok();
  } catch (error) {
    console.error("Failed to record platform click:", error);
    return fail("Failed to record platform click");
  }
}

// =============================================================================
// Analytics & Stats
// =============================================================================

/**
 * Get review statistics for the organization
 */
export async function getReviewStats(options?: {
  startDate?: Date;
  endDate?: Date;
}): Promise<ActionResult<ReviewStats>> {
  try {
    const organizationId = await requireOrganizationId();

    const dateFilter = {
      ...(options?.startDate && { gte: options.startDate }),
      ...(options?.endDate && { lte: options.endDate }),
    };

    // Get request counts
    const [totalRequests, pendingRequests, completedRequests] = await Promise.all([
      prisma.reviewRequest.count({
        where: {
          organizationId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      prisma.reviewRequest.count({
        where: {
          organizationId,
          status: { in: ["pending", "sent", "viewed"] },
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      prisma.reviewRequest.count({
        where: {
          organizationId,
          status: "completed",
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
    ]);

    // Get responses with ratings
    const responses = await prisma.reviewResponse.findMany({
      where: {
        reviewRequest: {
          organizationId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      },
      select: {
        rating: true,
        clickedPlatformLink: true,
      },
    });

    // Calculate average rating
    const averageRating =
      responses.length > 0
        ? responses.reduce((sum, r) => sum + r.rating, 0) / responses.length
        : 0;

    // Calculate response rate
    const responseRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    // Count platform clicks
    const platformClicks = responses.filter((r) => r.clickedPlatformLink).length;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: responses.filter((r) => r.rating === rating).length,
    }));

    // Recent responses
    const recentResponses = await prisma.reviewResponse.findMany({
      where: {
        reviewRequest: {
          organizationId,
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
      include: {
        reviewRequest: {
          select: {
            clientName: true,
            project: { select: { name: true } },
          },
        },
      },
    });

    return success({
      totalRequests,
      pendingRequests,
      completedRequests,
      averageRating: Math.round(averageRating * 10) / 10,
      responseRate: Math.round(responseRate * 10) / 10,
      platformClicks,
      ratingDistribution,
      recentResponses: recentResponses.map((r) => ({
        id: r.id,
        rating: r.rating,
        feedback: r.feedback,
        submittedAt: r.submittedAt,
        clientName: r.reviewRequest.clientName,
        projectName: r.reviewRequest.project?.name || null,
      })),
    });
  } catch (error) {
    console.error("Failed to get review stats:", error);
    return fail("Failed to get review stats");
  }
}

/**
 * Get all review requests for the organization (with pagination)
 */
export async function getReviewRequests(options?: {
  status?: ReviewRequestStatus;
  source?: ReviewRequestSource;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<{
  requests: Array<{
    id: string;
    token: string;
    status: ReviewRequestStatus;
    source: ReviewRequestSource;
    clientEmail: string | null;
    clientName: string | null;
    emailSentAt: Date | null;
    viewedAt: Date | null;
    createdAt: Date;
    project: { id: string; name: string } | null;
    response: {
      rating: number;
      feedback: string | null;
      submittedAt: Date;
      clickedPlatformLink: boolean;
    } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
}>> {
  try {
    const organizationId = await requireOrganizationId();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where = {
      organizationId,
      ...(options?.status && { status: options.status }),
      ...(options?.source && { source: options.source }),
    };

    const [requests, total] = await Promise.all([
      prisma.reviewRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          project: { select: { id: true, name: true } },
          response: {
            select: {
              rating: true,
              feedback: true,
              submittedAt: true,
              clickedPlatformLink: true,
            },
          },
        },
      }),
      prisma.reviewRequest.count({ where }),
    ]);

    return success({
      requests,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Failed to get review requests:", error);
    return fail("Failed to get review requests");
  }
}

// =============================================================================
// Bulk Operations
// =============================================================================

/**
 * Reorder review platforms
 */
export async function reorderReviewPlatforms(
  orderedIds: string[]
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify all platforms belong to the organization
    const platforms = await prisma.reviewPlatform.findMany({
      where: { organizationId },
      select: { id: true },
    });

    const orgPlatformIds = new Set(platforms.map((p) => p.id));
    for (const id of orderedIds) {
      if (!orgPlatformIds.has(id)) {
        return fail("Invalid platform ID");
      }
    }

    // Update priorities (higher priority = shown first)
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.reviewPlatform.update({
          where: { id },
          data: { priority: orderedIds.length - index },
        })
      )
    );

    revalidatePath("/settings/reviews");
    return ok();
  } catch (error) {
    console.error("Failed to reorder review platforms:", error);
    return fail("Failed to reorder review platforms");
  }
}

/**
 * Get pending follow-up review requests (for cron job)
 * Returns requests from delivered galleries that haven't had a review request sent
 */
export async function getPendingFollowupRequests(): Promise<ActionResult<Array<{
  projectId: string;
  projectName: string;
  clientId: string;
  clientEmail: string;
  clientName: string | null;
  organizationId: string;
  deliveredAt: Date;
}>>> {
  try {
    // This is an internal function - no auth required (called by cron)
    // Find organizations with follow-up enabled
    const orgsWithFollowup = await prisma.organization.findMany({
      where: {
        reviewGateEnabled: true,
        reviewGateFollowupEnabled: true,
      },
      select: {
        id: true,
        reviewGateFollowupDays: true,
      },
    });

    if (orgsWithFollowup.length === 0) {
      return success([]);
    }

    const pendingRequests: Array<{
      projectId: string;
      projectName: string;
      clientId: string;
      clientEmail: string;
      clientName: string | null;
      organizationId: string;
      deliveredAt: Date;
    }> = [];

    for (const org of orgsWithFollowup) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - org.reviewGateFollowupDays);

      // Find delivered projects without review requests
      const eligibleProjects = await prisma.project.findMany({
        where: {
          organizationId: org.id,
          status: "delivered",
          deliveredAt: {
            lte: cutoffDate,
            gte: new Date(cutoffDate.getTime() - 24 * 60 * 60 * 1000), // Within 24 hours of cutoff
          },
          clientId: { not: null },
          // No existing review request for this project
          reviewRequests: { none: {} },
        },
        include: {
          client: { select: { id: true, email: true, fullName: true } },
        },
      });

      for (const project of eligibleProjects) {
        if (project.client && project.deliveredAt) {
          pendingRequests.push({
            projectId: project.id,
            projectName: project.name,
            clientId: project.client.id,
            clientEmail: project.client.email,
            clientName: project.client.fullName,
            organizationId: org.id,
            deliveredAt: project.deliveredAt,
          });
        }
      }
    }

    return success(pendingRequests);
  } catch (error) {
    console.error("Failed to get pending follow-up requests:", error);
    return fail("Failed to get pending follow-up requests");
  }
}
