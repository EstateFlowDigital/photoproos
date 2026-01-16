"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { sendGalleryReminderEmail } from "@/lib/email/send";
import { ok, fail, success } from "@/lib/types/action-result";
import { logEmailSent } from "@/lib/actions/email-logs";
import { EmailStatus, EmailType } from "@prisma/client";
import { addDays, differenceInDays, isBefore, isAfter, startOfDay } from "date-fns";

const MAX_REMINDERS = 3; // Maximum number of reminders per gallery
const REMINDER_INTERVAL_DAYS = 3; // Days between reminders
const INITIAL_REMINDER_DELAY_DAYS = 2; // Days after delivery before first reminder

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

interface ReminderResult {
  galleryId: string;
  galleryName: string;
  clientEmail: string;
  type: "not_viewed" | "not_paid";
  success: boolean;
  error?: string;
}

/**
 * Send batch gallery reminders for an organization
 * Called by the cron job to process all eligible galleries
 */
export async function sendBatchGalleryReminders(organizationId: string) {
  const now = new Date();
  const results: ReminderResult[] = [];
  let sent = 0;
  let failed = 0;

  try {
    // Get organization details for sender info
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        publicName: true,
        publicEmail: true,
        name: true,
      },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const photographerName = org.publicName || org.name;
    const photographerEmail = org.publicEmail || undefined;

    // Find galleries that need reminders
    // Criteria:
    // 1. Status is "delivered"
    // 2. Has a client with email and emailOptIn true
    // 3. Reminder is enabled for the gallery
    // 4. Has not exceeded max reminders
    // 5. Enough time has passed since delivery or last reminder
    const eligibleGalleries = await prisma.project.findMany({
      where: {
        organizationId,
        status: "delivered",
        reminderEnabled: true,
        reminderCount: { lt: MAX_REMINDERS },
        deliveredAt: { not: null },
        client: {
          is: {
            emailOptIn: true,
          },
        },
        // Either no reminders sent yet, or last reminder was REMINDER_INTERVAL_DAYS ago
        OR: [
          { lastReminderSentAt: null },
          {
            lastReminderSentAt: {
              lte: new Date(now.getTime() - REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
            company: true,
          },
        },
        _count: {
          select: { assets: true },
        },
        payments: {
          where: { status: "paid" },
          select: { id: true },
        },
      },
    });

    for (const gallery of eligibleGalleries) {
      // Skip if no client email
      if (!gallery.client?.email) continue;

      const deliveredAt = gallery.deliveredAt!;
      const daysSinceDelivery = Math.floor(
        (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Skip if not enough time has passed since delivery for first reminder
      if (gallery.reminderCount === 0 && daysSinceDelivery < INITIAL_REMINDER_DELAY_DAYS) {
        continue;
      }

      // Determine reminder type
      const hasPaid = gallery.payments.length > 0;
      const hasViewed = gallery.viewCount > 0;

      // Skip if gallery has been paid (no reminder needed)
      if (hasPaid && gallery.priceCents > 0) continue;

      // Determine what type of reminder to send
      let reminderType: "not_viewed" | "not_paid";
      if (gallery.priceCents > 0 && !hasPaid) {
        reminderType = "not_paid";
      } else if (!hasViewed) {
        reminderType = "not_viewed";
      } else {
        // Gallery has been viewed and either paid or free, no reminder needed
        continue;
      }

      const clientName = gallery.client.fullName || gallery.client.company || "there";
      const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/g/${gallery.id}`;

      try {
        // Send the reminder email
        const emailResult = await sendGalleryReminderEmail({
          to: gallery.client.email,
          clientName,
          galleryName: gallery.name,
          galleryUrl,
          photographerName,
          photographerEmail,
          photoCount: gallery._count.assets,
          priceCents: gallery.priceCents,
          reminderType,
          daysSinceDelivery,
        });

        if (emailResult.success) {
          // Update gallery reminder tracking
          await prisma.project.update({
            where: { id: gallery.id },
            data: {
              lastReminderSentAt: now,
              reminderCount: { increment: 1 },
            },
          });

          // Log the email
          await logEmailSent({
            organizationId,
            clientId: gallery.client.id,
            projectId: gallery.id,
            emailType: EmailType.gallery_reminder,
            toEmail: gallery.client.email,
            subject: reminderType === "not_paid"
              ? `Complete your purchase: ${gallery.name}`
              : `Your photos are waiting: ${gallery.name}`,
            status: EmailStatus.sent,
          });

          results.push({
            galleryId: gallery.id,
            galleryName: gallery.name,
            clientEmail: gallery.client.email,
            type: reminderType,
            success: true,
          });
          sent++;
        } else {
          results.push({
            galleryId: gallery.id,
            galleryName: gallery.name,
            clientEmail: gallery.client.email,
            type: reminderType,
            success: false,
            error: emailResult.error,
          });
          failed++;
        }
      } catch (error) {
        console.error(`Error sending gallery reminder for ${gallery.id}:`, error);
        results.push({
          galleryId: gallery.id,
          galleryName: gallery.name,
          clientEmail: gallery.client.email,
          type: reminderType,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        failed++;
      }
    }

    return success({ sent, failed, results });
  } catch (error) {
    console.error("Error in sendBatchGalleryReminders:", error);
    return fail(error instanceof Error ? error.message : "Unknown error");
  }
}

/**
 * Disable reminders for a specific gallery
 */
export async function disableGalleryReminders(galleryId: string) {
  try {
    await prisma.project.update({
      where: { id: galleryId },
      data: { reminderEnabled: false },
    });
    return ok();
  } catch (error) {
    console.error("Error disabling gallery reminders:", error);
    return fail("Failed to disable reminders");
  }
}

/**
 * Enable reminders for a specific gallery
 */
export async function enableGalleryReminders(galleryId: string) {
  try {
    await prisma.project.update({
      where: { id: galleryId },
      data: { reminderEnabled: true },
    });
    return ok();
  } catch (error) {
    console.error("Error enabling gallery reminders:", error);
    return fail("Failed to enable reminders");
  }
}

/**
 * Reset reminder count for a gallery (e.g., after re-delivering)
 */
export async function resetGalleryReminders(galleryId: string) {
  try {
    await prisma.project.update({
      where: { id: galleryId },
      data: {
        reminderCount: 0,
        lastReminderSentAt: null,
        reminderEnabled: true,
      },
    });
    return ok();
  } catch (error) {
    console.error("Error resetting gallery reminders:", error);
    return fail("Failed to reset reminders");
  }
}

// =============================================================================
// Manual Reminder Functions
// =============================================================================

/**
 * Send a manual reminder email for a specific gallery
 */
export async function sendManualGalleryReminder(
  galleryId: string,
  options?: { customMessage?: string }
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const gallery = await prisma.project.findFirst({
      where: { id: galleryId, organizationId },
      include: {
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
          take: 1,
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
          },
        },
        organization: {
          select: {
            name: true,
            publicName: true,
            publicEmail: true,
          },
        },
        _count: {
          select: { assets: true },
        },
        payments: {
          where: { status: "paid" },
          select: { id: true },
        },
      },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    if (!gallery.client?.email) {
      return fail("No client email associated with this gallery");
    }

    if (gallery.status !== "delivered") {
      return fail("Gallery must be delivered before sending reminders");
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
    const deliverySlug = gallery.deliveryLinks[0]?.slug;
    const galleryUrl = deliverySlug
      ? `${baseUrl}/g/${deliverySlug}`
      : `${baseUrl}/galleries/${galleryId}/view`;

    const clientName = gallery.client.fullName || gallery.client.company || "there";
    const photographerName = gallery.organization.publicName || gallery.organization.name;
    const photographerEmail = gallery.organization.publicEmail || undefined;

    // Determine reminder type
    const hasPaid = gallery.payments.length > 0;
    const reminderType = gallery.priceCents > 0 && !hasPaid ? "not_paid" : "not_viewed";

    const daysSinceDelivery = gallery.deliveredAt
      ? differenceInDays(new Date(), gallery.deliveredAt)
      : 0;

    // Send the email
    const emailResult = await sendGalleryReminderEmail({
      to: gallery.client.email,
      clientName,
      galleryName: gallery.name,
      galleryUrl,
      photographerName,
      photographerEmail,
      photoCount: gallery._count.assets,
      priceCents: gallery.priceCents,
      reminderType,
      daysSinceDelivery,
    });

    if (emailResult.success) {
      // Update gallery reminder tracking
      await prisma.project.update({
        where: { id: galleryId },
        data: {
          lastReminderSentAt: new Date(),
          reminderCount: { increment: 1 },
        },
      });

      // Log the email
      await logEmailSent({
        organizationId,
        clientId: gallery.client.id,
        projectId: galleryId,
        emailType: EmailType.gallery_reminder,
        toEmail: gallery.client.email,
        subject: `Reminder: ${gallery.name}`,
        status: EmailStatus.sent,
      });

      // Log to activity
      await prisma.activityLog.create({
        data: {
          organizationId,
          projectId: galleryId,
          type: "email_sent",
          description: `Manual reminder sent to ${gallery.client.email}`,
          metadata: {
            reminderType: "manual",
            recipientEmail: gallery.client.email,
            customMessage: options?.customMessage,
          },
        },
      });

      return success({
        sentTo: gallery.client.email,
        sentAt: new Date().toISOString(),
      });
    }

    return fail(emailResult.error || "Failed to send email");
  } catch (error) {
    console.error("[Gallery Reminders] Error sending manual reminder:", error);
    return fail("Failed to send reminder");
  }
}

/**
 * Get reminder history for a gallery
 */
export async function getGalleryReminderHistory(galleryId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const reminders = await prisma.activityLog.findMany({
      where: {
        projectId: galleryId,
        organizationId,
        type: "email_sent",
        OR: [
          { description: { contains: "reminder" } },
          { description: { contains: "Reminder" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        description: true,
        createdAt: true,
        metadata: true,
      },
    });

    return success(
      reminders.map((r) => {
        const metadata = r.metadata as {
          reminderType?: string;
          recipientEmail?: string;
          customMessage?: string;
        } | null;
        return {
          id: r.id,
          type: metadata?.reminderType || "auto",
          sentAt: r.createdAt.toISOString(),
          description: r.description,
          recipientEmail: metadata?.recipientEmail || "Unknown",
        };
      })
    );
  } catch (error) {
    console.error("[Gallery Reminders] Error fetching history:", error);
    return fail("Failed to fetch reminder history");
  }
}

// =============================================================================
// Expiration Management
// =============================================================================

/**
 * Update gallery expiration date
 */
export async function updateGalleryExpiration(
  galleryId: string,
  expiresAt: Date | null
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    // Validate expiration date is in the future
    if (expiresAt && isBefore(expiresAt, new Date())) {
      return fail("Expiration date must be in the future");
    }

    await prisma.project.update({
      where: { id: galleryId },
      data: { expiresAt },
    });

    // Log the change
    await prisma.activityLog.create({
      data: {
        organizationId,
        projectId: galleryId,
        type: "settings_updated",
        description: expiresAt
          ? `Gallery expiration set to ${expiresAt.toLocaleDateString()}`
          : "Gallery expiration removed",
        metadata: { expiresAt: expiresAt?.toISOString() },
      },
    });

    return ok();
  } catch (error) {
    console.error("[Gallery Reminders] Error updating expiration:", error);
    return fail("Failed to update expiration");
  }
}

/**
 * Extend gallery expiration by a number of days
 */
export async function extendGalleryExpiration(galleryId: string, days: number) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const gallery = await prisma.project.findFirst({
      where: { id: galleryId, organizationId },
      select: { expiresAt: true },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    const baseDate =
      gallery.expiresAt && isAfter(gallery.expiresAt, new Date())
        ? gallery.expiresAt
        : new Date();

    const newExpiresAt = addDays(baseDate, days);

    await prisma.project.update({
      where: { id: galleryId },
      data: { expiresAt: newExpiresAt },
    });

    // Log the extension
    await prisma.activityLog.create({
      data: {
        organizationId,
        projectId: galleryId,
        type: "settings_updated",
        description: `Gallery expiration extended by ${days} days`,
        metadata: {
          extendedBy: days,
          newExpiresAt: newExpiresAt.toISOString(),
        },
      },
    });

    return success({ expiresAt: newExpiresAt.toISOString() });
  } catch (error) {
    console.error("[Gallery Reminders] Error extending expiration:", error);
    return fail("Failed to extend expiration");
  }
}

/**
 * Get galleries expiring soon
 */
export async function getExpiringGalleries(withinDays: number = 7) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const today = startOfDay(new Date());
    const endDate = addDays(today, withinDays);

    const galleries = await prisma.project.findMany({
      where: {
        organizationId,
        status: "delivered",
        expiresAt: {
          gte: today,
          lte: endDate,
        },
      },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { expiresAt: "asc" },
    });

    return success(
      galleries.map((g) => ({
        id: g.id,
        name: g.name,
        expiresAt: g.expiresAt?.toISOString(),
        daysUntilExpiration: g.expiresAt ? differenceInDays(g.expiresAt, today) : null,
        client: g.client
          ? { name: g.client.fullName, email: g.client.email }
          : null,
        photoCount: g._count.assets,
      }))
    );
  } catch (error) {
    console.error("[Gallery Reminders] Error fetching expiring galleries:", error);
    return fail("Failed to fetch expiring galleries");
  }
}

/**
 * Get recently delivered galleries that haven't been viewed
 */
export async function getUnviewedGalleries(withinDays: number = 7) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const cutoffDate = addDays(new Date(), -withinDays);

    const galleries = await prisma.project.findMany({
      where: {
        organizationId,
        status: "delivered",
        deliveredAt: { gte: cutoffDate },
        viewCount: 0,
      },
      select: {
        id: true,
        name: true,
        deliveredAt: true,
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { deliveredAt: "desc" },
    });

    return success(
      galleries.map((g) => ({
        id: g.id,
        name: g.name,
        deliveredAt: g.deliveredAt?.toISOString(),
        daysSinceDelivery: g.deliveredAt
          ? differenceInDays(new Date(), g.deliveredAt)
          : null,
        client: g.client
          ? { name: g.client.fullName, email: g.client.email }
          : null,
        photoCount: g._count.assets,
      }))
    );
  } catch (error) {
    console.error("[Gallery Reminders] Error fetching unviewed galleries:", error);
    return fail("Failed to fetch unviewed galleries");
  }
}

/**
 * Get gallery reminder status for a specific gallery
 */
export async function getGalleryReminderStatus(galleryId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const gallery = await prisma.project.findFirst({
      where: { id: galleryId, organizationId },
      select: {
        reminderEnabled: true,
        reminderCount: true,
        lastReminderSentAt: true,
        expiresAt: true,
        deliveredAt: true,
        viewCount: true,
        downloadCount: true,
      },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    const today = new Date();
    const daysUntilExpiration = gallery.expiresAt
      ? differenceInDays(gallery.expiresAt, today)
      : null;
    const daysSinceDelivery = gallery.deliveredAt
      ? differenceInDays(today, gallery.deliveredAt)
      : null;
    const daysSinceLastReminder = gallery.lastReminderSentAt
      ? differenceInDays(today, gallery.lastReminderSentAt)
      : null;

    return success({
      reminderEnabled: gallery.reminderEnabled,
      reminderCount: gallery.reminderCount,
      maxReminders: MAX_REMINDERS,
      lastReminderSentAt: gallery.lastReminderSentAt?.toISOString() || null,
      daysSinceLastReminder,
      expiresAt: gallery.expiresAt?.toISOString() || null,
      daysUntilExpiration,
      isExpiringSoon: daysUntilExpiration !== null && daysUntilExpiration <= 7,
      daysSinceDelivery,
      hasBeenViewed: gallery.viewCount > 0,
      downloadCount: gallery.downloadCount,
    });
  } catch (error) {
    console.error("[Gallery Reminders] Error fetching reminder status:", error);
    return fail("Failed to fetch reminder status");
  }
}
