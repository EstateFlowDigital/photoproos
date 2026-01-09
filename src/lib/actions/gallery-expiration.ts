"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { addDays, differenceInDays } from "date-fns";
import { ok, fail, success } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

interface ExpiringGallery {
  id: string;
  name: string;
  clientEmail: string;
  clientName: string;
  expiresAt: Date;
  daysUntilExpiration: number;
  deliverySlug: string;
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
// Gallery Expiration Actions
// =============================================================================

/**
 * Get galleries expiring soon (for dashboard alerts)
 */
export async function getExpiringSoonGalleries(daysAhead: number = 7) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const now = new Date();
    const futureDate = addDays(now, daysAhead);

    const galleries = await prisma.project.findMany({
      where: {
        organizationId,
        status: "delivered",
        expiresAt: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        client: {
          select: { email: true, fullName: true },
        },
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
          take: 1,
        },
      },
      orderBy: { expiresAt: "asc" },
    });

    const expiring: ExpiringGallery[] = galleries.map((g) => ({
      id: g.id,
      name: g.name,
      clientEmail: g.client?.email || "",
      clientName: g.client?.fullName || "Unknown",
      expiresAt: g.expiresAt!,
      daysUntilExpiration: differenceInDays(g.expiresAt!, now),
      deliverySlug: g.deliveryLinks[0]?.slug || g.id,
    }));

    return success(expiring);
  } catch (error) {
    console.error("[Gallery Expiration] Error fetching:", error);
    return fail("Failed to fetch expiring galleries");
  }
}

/**
 * Schedule expiration notifications for a gallery
 */
export async function scheduleExpirationNotifications(
  projectId: string,
  clientEmail: string,
  expiresAt: Date
) {
  try {
    // Schedule notifications for 7 days, 3 days, and 1 day before expiry
    const notificationDays = [7, 3, 1];

    const notifications = notificationDays
      .filter((days) => differenceInDays(expiresAt, new Date()) >= days)
      .map((days) => ({
        projectId,
        daysBeforeExpiry: days,
        recipientEmail: clientEmail,
        emailType: "expiry_warning",
      }));

    // Use upsert to avoid duplicates
    for (const notification of notifications) {
      await prisma.expirationNotification.upsert({
        where: {
          projectId_daysBeforeExpiry: {
            projectId: notification.projectId,
            daysBeforeExpiry: notification.daysBeforeExpiry,
          },
        },
        create: notification,
        update: { recipientEmail: notification.recipientEmail },
      });
    }

    return ok();
  } catch (error) {
    console.error("[Gallery Expiration] Error scheduling notifications:", error);
    return fail("Failed to schedule notifications");
  }
}

/**
 * Get notifications that need to be sent today
 */
export async function getPendingExpirationNotifications() {
  try {
    const now = new Date();

    // Find galleries with unsent notifications that are due
    const notifications = await prisma.expirationNotification.findMany({
      where: {
        sentAt: null,
      },
    });

    // Filter to only include notifications that are due today
    const pending: Array<{
      notification: typeof notifications[0];
      project: {
        id: string;
        name: string;
        expiresAt: Date;
        daysUntilExpiry: number;
        clientEmail: string | null | undefined;
        clientName: string | null | undefined;
        organizationName: string;
        deliverySlug: string;
      };
    }> = [];

    for (const notification of notifications) {
      const project = await prisma.project.findUnique({
        where: { id: notification.projectId },
        include: {
          client: { select: { email: true, fullName: true } },
          organization: { select: { name: true } },
          deliveryLinks: {
            where: { isActive: true },
            select: { slug: true },
            take: 1,
          },
        },
      });

      if (!project || !project.expiresAt) continue;

      const daysUntilExpiry = differenceInDays(project.expiresAt, now);

      // Check if this notification should be sent today
      if (daysUntilExpiry <= notification.daysBeforeExpiry) {
        pending.push({
          notification,
          project: {
            id: project.id,
            name: project.name,
            expiresAt: project.expiresAt,
            daysUntilExpiry,
            clientEmail: project.client?.email,
            clientName: project.client?.fullName,
            organizationName: project.organization.name,
            deliverySlug: project.deliveryLinks[0]?.slug || project.id,
          },
        });
      }
    }

    return success(pending);
  } catch (error) {
    console.error("[Gallery Expiration] Error fetching pending:", error);
    return fail("Failed to fetch pending notifications");
  }
}

/**
 * Mark a notification as sent
 */
export async function markNotificationSent(notificationId: string) {
  try {
    await prisma.expirationNotification.update({
      where: { id: notificationId },
      data: { sentAt: new Date() },
    });

    return ok();
  } catch (error) {
    console.error("[Gallery Expiration] Error marking sent:", error);
    return fail("Failed to mark notification as sent");
  }
}

/**
 * Extend gallery expiration date
 */
export async function extendGalleryExpiration(
  projectId: string,
  additionalDays: number
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });

    if (!project) {
      return fail("Gallery not found");
    }

    const currentExpiry = project.expiresAt || new Date();
    const newExpiry = addDays(currentExpiry, additionalDays);

    await prisma.project.update({
      where: { id: projectId },
      data: { expiresAt: newExpiry },
    });

    // Re-schedule notifications
    if (project.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: project.clientId },
        select: { email: true },
      });

      if (client?.email) {
        // Clear old notifications
        await prisma.expirationNotification.deleteMany({
          where: { projectId },
        });

        // Schedule new ones
        await scheduleExpirationNotifications(projectId, client.email, newExpiry);
      }
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard");
    revalidatePath("/galleries");
    revalidatePath(`/galleries/${projectId}`);

    return success({ newExpiresAt: newExpiry });
  } catch (error) {
    console.error("[Gallery Expiration] Error extending:", error);
    return fail("Failed to extend gallery expiration");
  }
}

/**
 * Send expiration warning email
 */
export async function sendExpirationWarningEmail(
  notificationId: string,
  projectData: {
    name: string;
    daysUntilExpiry: number;
    clientEmail: string;
    clientName: string;
    organizationName: string;
    deliverySlug: string;
  }
) {
  try {
    // Import email sending utility
    const { sendGalleryExpirationEmail } = await import("@/lib/email/send");

    const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/g/${projectData.deliverySlug}`;

    await sendGalleryExpirationEmail({
      to: projectData.clientEmail,
      clientName: projectData.clientName,
      galleryName: projectData.name,
      galleryUrl,
      daysRemaining: projectData.daysUntilExpiry,
      photographerName: projectData.organizationName,
    });

    // Mark notification as sent
    await markNotificationSent(notificationId);

    return ok();
  } catch (error) {
    console.error("[Gallery Expiration] Error sending email:", error);
    return fail("Failed to send expiration warning email");
  }
}

/**
 * Process all pending expiration notifications (for cron job)
 */
export async function processExpirationNotifications() {
  try {
    const result = await getPendingExpirationNotifications();
    if (!result.success || !result.data) {
      return fail("error" in result ? result.error : "Failed to get notifications");
    }

    let sent = 0;
    let failed = 0;

    for (const { notification, project } of result.data) {
      if (!project.clientEmail) continue;

      const sendResult = await sendExpirationWarningEmail(notification.id, {
        name: project.name,
        daysUntilExpiry: project.daysUntilExpiry,
        clientEmail: project.clientEmail,
        clientName: project.clientName || "there",
        organizationName: project.organizationName,
        deliverySlug: project.deliverySlug,
      });

      if (sendResult.success) {
        sent++;
      } else {
        failed++;
      }
    }

    return {
      success: true,
      data: { sent, failed, total: result.data.length },
    };
  } catch (error) {
    console.error("[Gallery Expiration] Error processing:", error);
    return fail("Failed to process expiration notifications");
  }
}
