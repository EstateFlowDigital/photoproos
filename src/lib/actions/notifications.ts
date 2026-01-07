"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: Date;
}

/**
 * Fetches notifications for the current organization
 */
export async function getNotifications(
  limit: number = 10
): Promise<ActionResult<{ notifications: NotificationData[]; unreadCount: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { organizationId },
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
      prisma.notification.count({
        where: { organizationId, read: false },
      }),
    ]);

    return {
      success: true,
      data: { notifications, unreadCount },
    };
  } catch (error) {
    console.error("[Notifications] Error fetching notifications:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch notifications");
  }
}

/**
 * Marks a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.notification.update({
      where: {
        id: notificationId,
        organizationId, // Ensure user owns this notification
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/");
    return ok();
  } catch (error) {
    console.error("[Notifications] Error marking notification as read:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to mark notification as read");
  }
}

/**
 * Gets just the unread notification count (lightweight query for badges)
 */
export async function getUnreadNotificationCount(): Promise<ActionResult<number>> {
  try {
    const organizationId = await requireOrganizationId();

    const count = await prisma.notification.count({
      where: { organizationId, read: false },
    });

    return success(count);
  } catch (error) {
    console.error("[Notifications] Error getting unread count:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get unread count");
  }
}

/**
 * Marks all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.notification.updateMany({
      where: {
        organizationId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/");
    return ok();
  } catch (error) {
    console.error("[Notifications] Error marking all notifications as read:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to mark all notifications as read");
  }
}

/**
 * Notification types that can be created
 */
export type NotificationType =
  | "payment_received"
  | "payment_failed"
  | "gallery_viewed"
  | "gallery_delivered"
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_reminder"
  | "contract_sent"
  | "contract_signed"
  | "invoice_sent"
  | "invoice_paid"
  | "invoice_overdue"
  | "questionnaire_assigned"
  | "questionnaire_completed"
  | "questionnaire_reminder"
  | "lead_received"
  | "client_added"
  | "task_automation"
  | "expense_approval_required"
  | "expense_approved"
  | "expense_rejected"
  | "system";

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  organizationId: string;
}

/**
 * Creates a notification for an organization
 * This is a helper function that can be called from other server actions
 * when events occur that should trigger notifications.
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const notification = await prisma.notification.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        title: input.title,
        message: input.message,
        linkUrl: input.linkUrl || null,
        read: false,
      },
    });

    // Revalidate to update notification counts in UI
    revalidatePath("/");

    return {
      success: true,
      data: { id: notification.id },
    };
  } catch (error) {
    console.error("[Notifications] Error creating notification:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create notification");
  }
}

/**
 * Deletes a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    await prisma.notification.delete({
      where: {
        id: notificationId,
        organizationId, // Ensure user owns this notification
      },
    });

    revalidatePath("/");
    return ok();
  } catch (error) {
    console.error("[Notifications] Error deleting notification:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete notification");
  }
}

/**
 * Deletes all read notifications (cleanup)
 */
export async function deleteReadNotifications(): Promise<ActionResult<{ count: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    const result = await prisma.notification.deleteMany({
      where: {
        organizationId,
        read: true,
      },
    });

    revalidatePath("/");
    return success({ count: result.count });
  } catch (error) {
    console.error("[Notifications] Error deleting read notifications:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete read notifications");
  }
}
