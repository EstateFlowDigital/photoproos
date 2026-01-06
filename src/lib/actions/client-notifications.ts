"use server";

/**
 * Client Portal Notifications
 *
 * Manages notifications for clients in their portal interface.
 * These are separate from organization-level notifications and
 * are displayed in the client-facing portal.
 */

import { prisma } from "@/lib/db";
import { ClientNotificationType } from "@prisma/client";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";

export interface ClientNotificationData {
  id: string;
  type: ClientNotificationType;
  title: string;
  message: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: Date;
}

// =============================================================================
// Client-Facing Functions (for use in client portal)
// =============================================================================

/**
 * Get notifications for a client by their portal access token
 */
export async function getClientNotifications(
  accessToken: string,
  limit: number = 20
): Promise<ActionResult<{ notifications: ClientNotificationData[]; unreadCount: number }>> {
  try {
    // Find client by access token
    const client = await prisma.client.findUnique({
      where: { portalAccessToken: accessToken },
      select: { id: true },
    });

    if (!client) {
      return fail("Invalid access token");
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.clientNotification.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          linkUrl: true,
          read: true,
          createdAt: true,
        },
      }),
      prisma.clientNotification.count({
        where: { clientId: client.id, read: false },
      }),
    ]);

    return {
      success: true,
      data: { notifications, unreadCount },
    };
  } catch (error) {
    console.error("[ClientNotifications] Error fetching notifications:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch notifications");
  }
}

/**
 * Get unread notification count for a client
 */
export async function getClientUnreadCount(
  accessToken: string
): Promise<ActionResult<number>> {
  try {
    const client = await prisma.client.findUnique({
      where: { portalAccessToken: accessToken },
      select: { id: true },
    });

    if (!client) {
      return fail("Invalid access token");
    }

    const count = await prisma.clientNotification.count({
      where: { clientId: client.id, read: false },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error("[ClientNotifications] Error getting unread count:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get unread count");
  }
}

/**
 * Mark a notification as read
 */
export async function markClientNotificationAsRead(
  accessToken: string,
  notificationId: string
): Promise<ActionResult> {
  try {
    const client = await prisma.client.findUnique({
      where: { portalAccessToken: accessToken },
      select: { id: true },
    });

    if (!client) {
      return fail("Invalid access token");
    }

    await prisma.clientNotification.update({
      where: {
        id: notificationId,
        clientId: client.id, // Ensure notification belongs to this client
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return ok();
  } catch (error) {
    console.error("[ClientNotifications] Error marking notification as read:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to mark notification as read");
  }
}

/**
 * Mark all notifications as read for a client
 */
export async function markAllClientNotificationsAsRead(
  accessToken: string
): Promise<ActionResult> {
  try {
    const client = await prisma.client.findUnique({
      where: { portalAccessToken: accessToken },
      select: { id: true },
    });

    if (!client) {
      return fail("Invalid access token");
    }

    await prisma.clientNotification.updateMany({
      where: {
        clientId: client.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return ok();
  } catch (error) {
    console.error("[ClientNotifications] Error marking all notifications as read:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to mark all notifications as read");
  }
}

// =============================================================================
// Server-Side Functions (for creating notifications from other actions)
// =============================================================================

interface CreateClientNotificationInput {
  clientId: string;
  type: ClientNotificationType;
  title: string;
  message: string;
  linkUrl?: string;
}

/**
 * Create a notification for a client
 * Used by other server actions when events occur that should notify the client
 */
export async function createClientNotification(
  input: CreateClientNotificationInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const notification = await prisma.clientNotification.create({
      data: {
        clientId: input.clientId,
        type: input.type,
        title: input.title,
        message: input.message,
        linkUrl: input.linkUrl || null,
        read: false,
      },
    });

    return {
      success: true,
      data: { id: notification.id },
    };
  } catch (error) {
    console.error("[ClientNotifications] Error creating notification:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create notification");
  }
}

/**
 * Create multiple notifications for a client (batch)
 */
export async function createClientNotificationsBatch(
  notifications: CreateClientNotificationInput[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const result = await prisma.clientNotification.createMany({
      data: notifications.map((n) => ({
        clientId: n.clientId,
        type: n.type,
        title: n.title,
        message: n.message,
        linkUrl: n.linkUrl || null,
        read: false,
      })),
    });

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error("[ClientNotifications] Error creating batch notifications:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create batch notifications");
  }
}

/**
 * Delete old read notifications for cleanup (optional maintenance)
 */
export async function cleanupOldClientNotifications(
  daysOld: number = 30
): Promise<ActionResult<{ count: number }>> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.clientNotification.deleteMany({
      where: {
        read: true,
        createdAt: { lt: cutoffDate },
      },
    });

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    console.error("[ClientNotifications] Error cleaning up notifications:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to cleanup notifications");
  }
}

// =============================================================================
// Notification Helper Functions
// =============================================================================

/**
 * Notify client that their gallery is ready
 */
export async function notifyGalleryReady(
  clientId: string,
  galleryName: string,
  galleryUrl: string
): Promise<ActionResult<{ id: string }>> {
  return createClientNotification({
    clientId,
    type: "gallery_ready",
    title: "Your Gallery is Ready!",
    message: `Your photos from "${galleryName}" are now available for viewing.`,
    linkUrl: galleryUrl,
  });
}

/**
 * Notify client that their gallery is expiring soon
 */
export async function notifyGalleryExpiring(
  clientId: string,
  galleryName: string,
  daysRemaining: number,
  galleryUrl: string
): Promise<ActionResult<{ id: string }>> {
  return createClientNotification({
    clientId,
    type: "gallery_expiring",
    title: `Gallery Expires in ${daysRemaining} Day${daysRemaining === 1 ? "" : "s"}`,
    message: `Your gallery "${galleryName}" will expire soon. Download your photos now!`,
    linkUrl: galleryUrl,
  });
}

/**
 * Notify client about a new invoice
 */
export async function notifyInvoiceSent(
  clientId: string,
  invoiceNumber: string,
  amount: string,
  invoiceUrl: string
): Promise<ActionResult<{ id: string }>> {
  return createClientNotification({
    clientId,
    type: "invoice_sent",
    title: "New Invoice",
    message: `Invoice ${invoiceNumber} for ${amount} is ready for payment.`,
    linkUrl: invoiceUrl,
  });
}

/**
 * Notify client about successful payment
 */
export async function notifyPaymentConfirmed(
  clientId: string,
  amount: string,
  description: string
): Promise<ActionResult<{ id: string }>> {
  return createClientNotification({
    clientId,
    type: "payment_confirmed",
    title: "Payment Confirmed",
    message: `Your payment of ${amount} for ${description} was successful.`,
  });
}

/**
 * Notify client that a contract is ready for signing
 */
export async function notifyContractReady(
  clientId: string,
  contractName: string,
  contractUrl: string
): Promise<ActionResult<{ id: string }>> {
  return createClientNotification({
    clientId,
    type: "contract_ready",
    title: "Contract Ready for Signature",
    message: `"${contractName}" is ready for your signature.`,
    linkUrl: contractUrl,
  });
}

/**
 * Notify client that their booking is confirmed
 */
export async function notifyBookingConfirmed(
  clientId: string,
  bookingTitle: string,
  bookingDate: string
): Promise<ActionResult<{ id: string }>> {
  return createClientNotification({
    clientId,
    type: "booking_confirmed",
    title: "Booking Confirmed",
    message: `Your ${bookingTitle} on ${bookingDate} has been confirmed.`,
  });
}

/**
 * Notify client about an upcoming booking
 */
export async function notifyBookingReminder(
  clientId: string,
  bookingTitle: string,
  bookingDate: string,
  timeUntil: string
): Promise<ActionResult<{ id: string }>> {
  return createClientNotification({
    clientId,
    type: "booking_reminder",
    title: "Upcoming Session Reminder",
    message: `Your ${bookingTitle} is coming up ${timeUntil} on ${bookingDate}.`,
  });
}

/**
 * Notify client about a questionnaire to complete
 */
export async function notifyQuestionnaireReady(
  clientId: string,
  questionnaireName: string,
  questionnaireUrl: string
): Promise<ActionResult<{ id: string }>> {
  return createClientNotification({
    clientId,
    type: "questionnaire_ready",
    title: "Questionnaire Ready",
    message: `Please complete the "${questionnaireName}" questionnaire at your earliest convenience.`,
    linkUrl: questionnaireUrl,
  });
}
