"use server";

import { prisma } from "@/lib/db";
import { sendGalleryReminderEmail } from "@/lib/email/send";
import { logEmailSent } from "@/lib/actions/email-logs";
import { EmailStatus, EmailType } from "@prisma/client";

const MAX_REMINDERS = 3; // Maximum number of reminders per gallery
const REMINDER_INTERVAL_DAYS = 3; // Days between reminders
const INITIAL_REMINDER_DELAY_DAYS = 2; // Days after delivery before first reminder

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
      return { success: false, error: "Organization not found", data: { sent: 0, failed: 0 } };
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

    return {
      success: true,
      data: { sent, failed, results },
    };
  } catch (error) {
    console.error("Error in sendBatchGalleryReminders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: { sent: 0, failed: 0 },
    };
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
    return { success: true };
  } catch (error) {
    console.error("Error disabling gallery reminders:", error);
    return { success: false, error: "Failed to disable reminders" };
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
    return { success: true };
  } catch (error) {
    console.error("Error enabling gallery reminders:", error);
    return { success: false, error: "Failed to enable reminders" };
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
    return { success: true };
  } catch (error) {
    console.error("Error resetting gallery reminders:", error);
    return { success: false, error: "Failed to reset reminders" };
  }
}
