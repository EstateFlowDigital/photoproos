/**
 * Booking Reminders Cron Endpoint
 *
 * This endpoint is called by a cron job (e.g., Vercel Cron, Railway scheduled job)
 * to send pending booking reminder emails.
 *
 * Authentication:
 * - Requires CRON_SECRET in Authorization header: "Bearer <CRON_SECRET>"
 * - Set CRON_SECRET in environment variables
 *
 * Email Integration:
 * - Uses Resend for email delivery
 * - Sends to clients, photographers, or both based on reminder settings
 * - Uses BookingReminderEmail template
 *
 * Schedule Recommendation: Run every 15 minutes
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getPendingReminders, markReminderSent } from "@/lib/actions/bookings";
import { BookingReminderEmail } from "@/emails/booking-reminder";

// Lazy initialization to avoid build-time errors when env vars are not set
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getPendingReminders();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    const reminders = result.data;
    let sent = 0;
    let failed = 0;

    for (const reminder of reminders) {
      try {
        const { booking } = reminder;
        const clientEmail = booking.client?.email;
        const photographerEmail = booking.assignedUser?.email;

        // Determine recipients based on reminder recipient setting
        const recipients: string[] = [];
        if (reminder.recipient === "client" || reminder.recipient === "both") {
          if (clientEmail) recipients.push(clientEmail);
        }
        if (reminder.recipient === "photographer" || reminder.recipient === "both") {
          if (photographerEmail) recipients.push(photographerEmail);
        }

        if (recipients.length === 0) {
          await markReminderSent(reminder.id, "No valid recipients found");
          failed++;
          continue;
        }

        // Format booking time
        const bookingTime = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(booking.startTime);

        // Determine reminder type
        const reminderType = reminder.type === "hours_1" ? "1h" : "24h";

        // Send email to each recipient
        for (const email of recipients) {
          await getResend().emails.send({
            from: `${booking.organization.name} <noreply@${process.env.EMAIL_DOMAIN || "photoproos.com"}>`,
            to: email,
            subject: `Reminder: ${booking.title} ${reminderType === "24h" ? "tomorrow" : "in 1 hour"}`,
            react: BookingReminderEmail({
              clientName: booking.client?.fullName || booking.clientName || "there",
              bookingTitle: booking.title,
              bookingDate: booking.startTime.toISOString(),
              bookingTime,
              location: booking.location || undefined,
              photographerName: booking.assignedUser?.fullName || booking.organization.name,
              reminderType,
              organizationName: booking.organization.name,
            }),
          });
        }

        await markReminderSent(reminder.id);
        sent++;
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await markReminderSent(reminder.id, errorMessage);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      total: reminders.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Error in send-reminders cron:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

// Also allow POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
