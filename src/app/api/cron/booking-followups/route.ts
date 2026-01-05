/**
 * Booking Follow-ups Cron Job
 *
 * Sends automated follow-up emails after bookings are completed:
 * - Thank you email: 1 day after completion
 * - Review request: 3 days after completion
 * - Rebook reminders: 30, 60, 90 days after completion
 *
 * Runs daily via Railway cron or external scheduler.
 *
 * Security: Requires CRON_SECRET Bearer token
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBookingFollowupEmail } from "@/lib/email/send";

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === process.env.CRON_SECRET;
}

// Follow-up configuration
const FOLLOWUP_SCHEDULE = [
  { type: "thank_you" as const, daysAfter: 1 },
  { type: "review_request" as const, daysAfter: 3 },
  { type: "rebook_reminder" as const, daysAfter: 30 },
  { type: "rebook_reminder" as const, daysAfter: 60 },
  { type: "rebook_reminder" as const, daysAfter: 90 },
];

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  // Verify authentication
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Booking Followups] Starting cron job...");

  const now = new Date();
  let totalSent = 0;
  let totalFailed = 0;
  const results: { type: string; daysAfter: number; sent: number; failed: number }[] = [];

  try {
    for (const schedule of FOLLOWUP_SCHEDULE) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - schedule.daysAfter);
      targetDate.setHours(0, 0, 0, 0);

      const endOfTargetDate = new Date(targetDate);
      endOfTargetDate.setHours(23, 59, 59, 999);

      // Find completed bookings from the target date
      const completedBookings = await prisma.booking.findMany({
        where: {
          status: "completed",
          completedAt: {
            gte: targetDate,
            lte: endOfTargetDate,
          },
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          completedAt: true,
          followupsSent: true,
          client: {
            select: {
              fullName: true,
              email: true,
              emailOptIn: true,
            },
          },
          service: {
            select: {
              name: true,
            },
          },
          organization: {
            select: {
              name: true,
              publicName: true,
              publicEmail: true,
              website: true,
            },
          },
        },
      });

      let scheduleSent = 0;
      let scheduleFailed = 0;

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";

      for (const booking of completedBookings) {
        // Skip if no client email or opted out
        if (!booking.client?.email || booking.client.emailOptIn === false) {
          continue;
        }

        // Check if this followup was already sent
        const followupsSent = (booking.followupsSent as string[]) || [];
        const followupKey = `${schedule.type}_${schedule.daysAfter}`;
        if (followupsSent.includes(followupKey)) {
          continue;
        }

        // Build URLs
        const rebookUrl = booking.organization.website
          ? `${booking.organization.website}/book`
          : `${baseUrl}/book/${booking.organization.name.toLowerCase().replace(/\s+/g, "-")}`;

        // Note: Gallery URL would require a Booking -> Project relationship
        // For now, we don't include gallery links in follow-up emails
        const galleryUrl = undefined;

        try {
          const result = await sendBookingFollowupEmail({
            to: booking.client.email,
            clientName: booking.client.fullName || "Valued Client",
            bookingTitle: booking.title,
            bookingDate: booking.startTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            serviceName: booking.service?.name,
            photographerName:
              booking.organization.publicName || booking.organization.name,
            photographerEmail: booking.organization.publicEmail || undefined,
            rebookUrl,
            galleryUrl,
            followupType: schedule.type,
          });

          if (result.success) {
            // Mark followup as sent
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                followupsSent: [...followupsSent, followupKey],
              },
            });
            scheduleSent++;
            totalSent++;
          } else {
            console.error(
              `[Booking Followups] Failed to send ${schedule.type} for booking ${booking.id}:`,
              result.error
            );
            scheduleFailed++;
            totalFailed++;
          }
        } catch (error) {
          console.error(
            `[Booking Followups] Error sending ${schedule.type} for booking ${booking.id}:`,
            error
          );
          scheduleFailed++;
          totalFailed++;
        }
      }

      results.push({
        type: schedule.type,
        daysAfter: schedule.daysAfter,
        sent: scheduleSent,
        failed: scheduleFailed,
      });
    }

    console.log(
      `[Booking Followups] Completed: ${totalSent} sent, ${totalFailed} failed`
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalSent,
        totalFailed,
        results,
      },
    });
  } catch (error) {
    console.error("[Booking Followups] Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process booking followups" },
      { status: 500 }
    );
  }
}
