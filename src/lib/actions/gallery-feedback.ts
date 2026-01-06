"use server";

import { ok, type VoidActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// =============================================================================
// Types
// =============================================================================

interface FeedbackItem {
  id: string;
  projectId: string;
  projectName: string;
  type: string;
  message: string;
  clientName: string | null;
  clientEmail: string | null;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
}

interface FeedbackStats {
  total: number;
  unread: number;
  resolved: number;
  byType: Record<string, number>;
}

// =============================================================================
// Helper Functions
// =============================================================================

async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findFirst({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id || null;
}

// =============================================================================
// Feedback Actions
// =============================================================================

/**
 * Get all feedback for the organization
 */
export async function getAllFeedback(options?: {
  limit?: number;
  offset?: number;
  filter?: "all" | "unread" | "resolved";
  type?: string;
}): Promise<{ success: boolean; data?: { feedback: FeedbackItem[]; total: number }; error?: string }> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const where: Prisma.GalleryFeedbackWhereInput = {
      organizationId,
    };

    if (options?.filter === "unread") {
      where.isRead = false;
    } else if (options?.filter === "resolved") {
      where.isResolved = true;
    }

    if (options?.type) {
      where.type = options.type;
    }

    const [feedbackRecords, total] = await Promise.all([
      prisma.galleryFeedback.findMany({
        where,
        include: {
          project: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.galleryFeedback.count({ where }),
    ]);

    const feedback: FeedbackItem[] = feedbackRecords.map((f) => ({
      id: f.id,
      projectId: f.projectId,
      projectName: f.project.name,
      type: f.type,
      message: f.message,
      clientName: f.clientName,
      clientEmail: f.clientEmail,
      isRead: f.isRead,
      isResolved: f.isResolved,
      createdAt: f.createdAt,
    }));

    return { success: true, data: { feedback, total } };
  } catch (error) {
    console.error("[Gallery Feedback] Error fetching feedback:", error);
    return { success: false, error: "Failed to fetch feedback" };
  }
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(): Promise<{ success: boolean; data?: FeedbackStats; error?: string }> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const [total, unread, resolved, byTypeRaw] = await Promise.all([
      prisma.galleryFeedback.count({ where: { organizationId } }),
      prisma.galleryFeedback.count({ where: { organizationId, isRead: false } }),
      prisma.galleryFeedback.count({ where: { organizationId, isResolved: true } }),
      prisma.galleryFeedback.groupBy({
        by: ["type"],
        where: { organizationId },
        _count: { type: true },
      }),
    ]);

    const byType: Record<string, number> = {};
    for (const item of byTypeRaw) {
      byType[item.type] = item._count.type;
    }

    return {
      success: true,
      data: { total, unread, resolved, byType },
    };
  } catch (error) {
    console.error("[Gallery Feedback] Error fetching stats:", error);
    return { success: false, error: "Failed to fetch feedback stats" };
  }
}

/**
 * Mark feedback as read
 */
export async function markFeedbackAsRead(feedbackId: string): Promise<VoidActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    await prisma.galleryFeedback.update({
      where: {
        id: feedbackId,
        organizationId,
      },
      data: { isRead: true },
    });

    revalidatePath("/feedback");
    return ok();
  } catch (error) {
    console.error("[Gallery Feedback] Error marking as read:", error);
    return { success: false, error: "Failed to mark feedback as read" };
  }
}

/**
 * Mark feedback as resolved
 */
export async function markFeedbackAsResolved(feedbackId: string): Promise<VoidActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    await prisma.galleryFeedback.update({
      where: {
        id: feedbackId,
        organizationId,
      },
      data: { isResolved: true, isRead: true },
    });

    revalidatePath("/feedback");
    return ok();
  } catch (error) {
    console.error("[Gallery Feedback] Error marking as resolved:", error);
    return { success: false, error: "Failed to mark feedback as resolved" };
  }
}

/**
 * Mark all unread feedback as read
 */
export async function markAllFeedbackAsRead(): Promise<VoidActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    await prisma.galleryFeedback.updateMany({
      where: {
        organizationId,
        isRead: false,
      },
      data: { isRead: true },
    });

    revalidatePath("/feedback");
    return ok();
  } catch (error) {
    console.error("[Gallery Feedback] Error marking all as read:", error);
    return { success: false, error: "Failed to mark all feedback as read" };
  }
}

/**
 * Delete feedback
 */
export async function deleteFeedback(feedbackId: string): Promise<VoidActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    await prisma.galleryFeedback.delete({
      where: {
        id: feedbackId,
        organizationId,
      },
    });

    revalidatePath("/feedback");
    return ok();
  } catch (error) {
    console.error("[Gallery Feedback] Error deleting feedback:", error);
    return { success: false, error: "Failed to delete feedback" };
  }
}
