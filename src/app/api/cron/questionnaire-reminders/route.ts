import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendQuestionnaireReminderEmail } from "@/lib/email/send";
import { createEmailLog, updateEmailLogStatus } from "@/lib/actions/email-logs";

// This route is designed to be called by a cron job (e.g., Vercel Cron, Railway, etc.)
// Recommended schedule: Run daily at 9 AM

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find all questionnaires that need reminders:
    // 1. Status is pending or in_progress
    // 2. sendReminders is enabled
    // 3. Due date is within 3 days OR already overdue
    // 4. Haven't sent a reminder in the last 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const questionnaires = await prisma.clientQuestionnaire.findMany({
      where: {
        status: { in: ["pending", "in_progress"] },
        sendReminders: true,
        dueDate: { lte: threeDaysFromNow },
        OR: [
          { lastReminder: null },
          { lastReminder: { lt: oneDayAgo } },
        ],
        // Limit to 5 reminders max
        remindersSent: { lt: 5 },
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        template: {
          select: {
            name: true,
          },
        },
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            members: {
              where: { role: "owner" },
              include: {
                user: {
                  select: {
                    email: true,
                    fullName: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
      take: 100, // Process max 100 at a time to avoid timeouts
    });

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const questionnaire of questionnaires) {
      results.processed++;

      const isOverdue = questionnaire.dueDate
        ? questionnaire.dueDate < now
        : false;

      const ownerUser = questionnaire.organization?.members[0]?.user;
      const photographerName = ownerUser?.fullName || questionnaire.organization?.name || "Your Photographer";
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/questionnaires/${questionnaire.id}`;

      const emailSubject = isOverdue
        ? `Overdue: Please complete your questionnaire for ${photographerName}`
        : `Reminder: Please complete your questionnaire for ${photographerName}`;

      // Create email log
      const logResult = await createEmailLog({
        organizationId: questionnaire.organizationId,
        toEmail: questionnaire.client.email,
        toName: questionnaire.client.fullName || undefined,
        clientId: questionnaire.client.id,
        emailType: "questionnaire_reminder",
        subject: emailSubject,
        questionnaireId: questionnaire.id,
        bookingId: questionnaire.bookingId || undefined,
      });

      try {
        const emailResult = await sendQuestionnaireReminderEmail({
          to: questionnaire.client.email,
          clientName: questionnaire.client.fullName || "there",
          questionnaireName: questionnaire.template.name,
          dueDate: questionnaire.dueDate || undefined,
          isOverdue,
          portalUrl,
          photographerName,
          photographerEmail: ownerUser?.email,
          organizationName: questionnaire.organization?.name || "PhotoProOS",
          bookingTitle: questionnaire.booking?.title,
          bookingDate: questionnaire.booking?.startTime,
          reminderCount: questionnaire.remindersSent + 1,
        });

        // Update log status
        if (logResult.success && logResult.logId) {
          await updateEmailLogStatus(
            logResult.logId,
            emailResult.success ? "sent" : "failed",
            emailResult.resendId,
            emailResult.error
          );
        }

        if (emailResult.success) {
          // Update reminder count
          await prisma.clientQuestionnaire.update({
            where: { id: questionnaire.id },
            data: {
              remindersSent: { increment: 1 },
              lastReminder: now,
            },
          });
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`Failed to send to ${questionnaire.client.email}: ${emailResult.error}`);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Error sending to ${questionnaire.client.email}: ${errorMessage}`);

        if (logResult.success && logResult.logId) {
          await updateEmailLogStatus(logResult.logId, "failed", undefined, errorMessage);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} questionnaires`,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
