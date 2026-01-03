import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPhotographerDigestEmail } from "@/lib/email/send";
import { createEmailLog, updateEmailLogStatus } from "@/lib/actions/email-logs";

// This route is designed to be called by a cron job (e.g., Vercel Cron, Railway, etc.)
// Recommended schedule: Run daily at 8 AM

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all organizations with their owner emails
    const organizations = await prisma.organization.findMany({
      where: {
        // Only active orgs with questionnaires module enabled
        enabledModules: { has: "questionnaires" },
      },
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
    });

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const org of organizations) {
      results.processed++;

      const ownerUser = org.members[0]?.user;
      if (!ownerUser?.email) {
        results.skipped++;
        continue;
      }

      // Get questionnaire stats for this organization
      const [pending, inProgress, overdue, completedToday, questionnaires] = await Promise.all([
        prisma.clientQuestionnaire.count({
          where: { organizationId: org.id, status: "pending" },
        }),
        prisma.clientQuestionnaire.count({
          where: { organizationId: org.id, status: "in_progress" },
        }),
        prisma.clientQuestionnaire.count({
          where: {
            organizationId: org.id,
            status: { in: ["pending", "in_progress"] },
            dueDate: { lt: now },
          },
        }),
        prisma.clientQuestionnaire.count({
          where: {
            organizationId: org.id,
            status: "completed",
            completedAt: { gte: startOfToday },
          },
        }),
        prisma.clientQuestionnaire.findMany({
          where: {
            organizationId: org.id,
            status: { in: ["pending", "in_progress"] },
          },
          include: {
            client: { select: { fullName: true } },
            template: { select: { name: true } },
            booking: { select: { title: true } },
          },
          orderBy: [
            { dueDate: "asc" },
            { createdAt: "desc" },
          ],
          take: 10,
        }),
      ]);

      // Skip if no pending questionnaires (no need for digest)
      if (pending === 0 && inProgress === 0 && overdue === 0 && completedToday === 0) {
        results.skipped++;
        continue;
      }

      // Format questionnaires for email
      const formattedQuestionnaires = questionnaires.map((q) => {
        const isOverdue = q.dueDate ? q.dueDate < now : false;
        return {
          id: q.id,
          clientName: q.client.fullName || "Unknown Client",
          questionnaireName: q.template.name,
          dueDate: q.dueDate || undefined,
          status: (isOverdue ? "overdue" : q.status) as "pending" | "in_progress" | "overdue",
          bookingTitle: q.booking?.title,
        };
      });

      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/questionnaires`;
      const emailSubject = `Daily Digest: ${overdue > 0 ? `${overdue} overdue, ` : ""}${pending} pending questionnaires`;

      // Create email log
      const logResult = await createEmailLog({
        organizationId: org.id,
        toEmail: ownerUser.email,
        toName: ownerUser.fullName || undefined,
        emailType: "photographer_digest",
        subject: emailSubject,
      });

      try {
        const emailResult = await sendPhotographerDigestEmail({
          to: ownerUser.email,
          photographerName: ownerUser.fullName || "there",
          organizationName: org.name,
          dashboardUrl,
          pendingCount: pending,
          inProgressCount: inProgress,
          overdueCount: overdue,
          completedTodayCount: completedToday,
          questionnaires: formattedQuestionnaires,
        });

        if (logResult.success && logResult.logId) {
          await updateEmailLogStatus(
            logResult.logId,
            emailResult.success ? "sent" : "failed",
            emailResult.resendId,
            emailResult.error
          );
        }

        if (emailResult.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`Failed to send to ${ownerUser.email}: ${emailResult.error}`);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Error sending to ${ownerUser.email}: ${errorMessage}`);

        if (logResult.success && logResult.logId) {
          await updateEmailLogStatus(logResult.logId, "failed", undefined, errorMessage);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} organizations`,
      results,
    });
  } catch (error) {
    console.error("Digest cron job error:", error);
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
