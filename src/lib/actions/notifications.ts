"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch notifications" };
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
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Notifications] Error marking notification as read:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to mark notification as read" };
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
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Notifications] Error marking all notifications as read:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}
