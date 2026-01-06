"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { ok, fail } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

type ActivityType =
  | "gallery_delivered"
  | "gallery_viewed"
  | "invoice_sent"
  | "invoice_paid"
  | "payment_received"
  | "comment_posted"
  | "photo_favorited"
  | "download_completed"
  | "message_received";

interface CreateActivityInput {
  organizationId: string;
  clientId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  projectId?: string;
  invoiceId?: string;
  paymentId?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

async function getClientFromSession(): Promise<{
  clientId: string;
  organizationId: string;
} | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("client_session")?.value;

  if (!sessionToken) return null;

  const session = await prisma.clientSession.findFirst({
    where: {
      token: sessionToken,
      expiresAt: { gt: new Date() },
    },
    include: {
      client: {
        select: { id: true, organizationId: true },
      },
    },
  });

  if (!session) return null;

  return {
    clientId: session.client.id,
    organizationId: session.client.organizationId,
  };
}

// =============================================================================
// Portal Activity Actions
// =============================================================================

/**
 * Create a new portal activity
 */
export async function createPortalActivity(input: CreateActivityInput) {
  try {
    await prisma.portalActivity.create({
      data: {
        organizationId: input.organizationId,
        clientId: input.clientId,
        activityType: input.activityType,
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        invoiceId: input.invoiceId,
        paymentId: input.paymentId,
      },
    });

    return ok();
  } catch (error) {
    console.error("[Portal Activity] Error creating:", error);
    return fail("Failed to create activity");
  }
}

/**
 * Get activities for the current client (from session)
 */
export async function getClientActivities(options?: {
  limit?: number;
  unreadOnly?: boolean;
}) {
  const session = await getClientFromSession();
  if (!session) {
    return fail("Not authenticated");
  }

  try {
    const limit = options?.limit || 20;

    const activities = await prisma.portalActivity.findMany({
      where: {
        clientId: session.clientId,
        ...(options?.unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.portalActivity.count({
      where: {
        clientId: session.clientId,
        isRead: false,
      },
    });

    return {
      success: true,
      data: {
        activities,
        unreadCount,
      },
    };
  } catch (error) {
    console.error("[Portal Activity] Error fetching:", error);
    return fail("Failed to fetch activities");
  }
}

/**
 * Mark activities as read
 */
export async function markActivitiesAsRead(activityIds?: string[]) {
  const session = await getClientFromSession();
  if (!session) {
    return fail("Not authenticated");
  }

  try {
    if (activityIds && activityIds.length > 0) {
      // Mark specific activities as read
      await prisma.portalActivity.updateMany({
        where: {
          id: { in: activityIds },
          clientId: session.clientId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else {
      // Mark all activities as read
      await prisma.portalActivity.updateMany({
        where: {
          clientId: session.clientId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    return ok();
  } catch (error) {
    console.error("[Portal Activity] Error marking read:", error);
    return fail("Failed to mark activities as read");
  }
}

/**
 * Get unread activity count for the current client
 */
export async function getUnreadActivityCount() {
  const session = await getClientFromSession();
  if (!session) {
    return fail("Not authenticated");
  }

  try {
    const count = await prisma.portalActivity.count({
      where: {
        clientId: session.clientId,
        isRead: false,
      },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error("[Portal Activity] Error counting:", error);
    return fail("Failed to count activities");
  }
}

// =============================================================================
// Activity Creation Helpers (called from other actions)
// =============================================================================

/**
 * Log gallery delivery activity
 */
export async function logGalleryDelivered(
  organizationId: string,
  clientId: string,
  projectId: string,
  galleryName: string
) {
  return createPortalActivity({
    organizationId,
    clientId,
    activityType: "gallery_delivered",
    title: "Gallery Delivered",
    description: `Your gallery "${galleryName}" is ready to view`,
    projectId,
  });
}

/**
 * Log invoice sent activity
 */
export async function logInvoiceSent(
  organizationId: string,
  clientId: string,
  invoiceId: string,
  invoiceNumber: string,
  amount: number
) {
  return createPortalActivity({
    organizationId,
    clientId,
    activityType: "invoice_sent",
    title: "Invoice Received",
    description: `Invoice #${invoiceNumber} for $${(amount / 100).toFixed(2)} is ready for payment`,
    invoiceId,
  });
}

/**
 * Log payment received activity
 */
export async function logPaymentReceived(
  organizationId: string,
  clientId: string,
  paymentId: string,
  amount: number,
  projectId?: string
) {
  return createPortalActivity({
    organizationId,
    clientId,
    activityType: "payment_received",
    title: "Payment Confirmed",
    description: `Your payment of $${(amount / 100).toFixed(2)} has been received`,
    projectId,
    paymentId,
  });
}

/**
 * Log download completed activity
 */
export async function logDownloadCompleted(
  organizationId: string,
  clientId: string,
  projectId: string,
  format: string,
  fileCount: number
) {
  return createPortalActivity({
    organizationId,
    clientId,
    activityType: "download_completed",
    title: "Download Complete",
    description: `Downloaded ${fileCount} ${format} photo${fileCount > 1 ? "s" : ""}`,
    projectId,
  });
}
