/**
 * Onboarding Reminders Cron Endpoint
 *
 * This endpoint is called by a cron job to send reminder emails to users
 * who have incomplete onboarding checklists.
 *
 * Authentication:
 * - Requires CRON_SECRET in Authorization header: "Bearer <CRON_SECRET>"
 *
 * Logic:
 * - Sends reminders to organizations that:
 *   - Have not completed onboarding
 *   - Have not opted out of reminders
 *   - Were created more than 3 days ago
 *   - Have not received a reminder in the last 7 days
 *
 * Schedule Recommendation: Run daily at 10:00 AM
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { OnboardingReminderEmail } from "@/emails/onboarding-reminder";

// Lazy initialization for Resend
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

const CRON_SECRET = process.env.CRON_SECRET;

// Configuration
const DAYS_BEFORE_FIRST_REMINDER = 3; // Wait 3 days after signup
const DAYS_BETWEEN_REMINDERS = 7; // Send reminders weekly
const MAX_REMINDERS = 3; // Stop after 3 reminders

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const minCreatedDate = new Date(
      now.getTime() - DAYS_BEFORE_FIRST_REMINDER * 24 * 60 * 60 * 1000
    );
    const lastReminderCutoff = new Date(
      now.getTime() - DAYS_BETWEEN_REMINDERS * 24 * 60 * 60 * 1000
    );

    // Find organizations eligible for reminders
    const organizations = await prisma.organization.findMany({
      where: {
        // Not completed onboarding
        onboardingCompleted: false,
        // Not opted out of reminders
        onboardingRemindersDisabled: false,
        // Created more than 3 days ago
        createdAt: {
          lte: minCreatedDate,
        },
        // No reminder sent in last 7 days
        OR: [
          { onboardingReminderSentAt: null },
          { onboardingReminderSentAt: { lte: lastReminderCutoff } },
        ],
      },
      include: {
        members: {
          where: { role: "owner" },
          include: { user: true },
        },
        onboardingChecklistItems: {
          where: { isEnabled: true },
          orderBy: { order: "asc" },
        },
      },
      take: 100, // Process in batches
    });

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const org of organizations) {
      try {
        // Find owner's email
        const owner = org.members.find((m) => m.role === "owner");
        if (!owner?.user?.email) {
          skipped++;
          continue;
        }

        // Get checklist status
        const checklistItems = org.onboardingChecklistItems;
        if (checklistItems.length === 0) {
          skipped++;
          continue;
        }

        // Calculate completion status for each item
        const orgCounts = await prisma.organization.findUnique({
          where: { id: org.id },
          select: {
            logoUrl: true,
            primaryColor: true,
            stripeConnectOnboarded: true,
            _count: {
              select: {
                clients: true,
                services: true,
                projects: true,
                recurringExpenseTemplates: true,
                bookingForms: true,
                bookingSlots: true,
                contractTemplates: true,
                invoiceTemplates: true,
              },
            },
          },
        });

        if (!orgCounts) {
          skipped++;
          continue;
        }

        // Count property websites
        const propertyWebsitesCount = await prisma.propertyWebsite.count({
          where: { project: { organizationId: org.id } },
        });

        // Calculate completion status
        const completionStatus: Record<string, boolean> = {
          hasClients: orgCounts._count.clients > 0,
          hasServices: orgCounts._count.services > 0,
          hasGalleries: orgCounts._count.projects > 0,
          hasProperties: propertyWebsitesCount > 0,
          hasBranding: !!(
            orgCounts.logoUrl || orgCounts.primaryColor !== "#3b82f6"
          ),
          hasPaymentMethod: orgCounts.stripeConnectOnboarded,
          hasExpenseSettings: orgCounts._count.recurringExpenseTemplates > 0,
          hasExpenseTemplates: orgCounts._count.recurringExpenseTemplates > 0,
          hasBookingForms: orgCounts._count.bookingForms > 0,
          hasAvailability: orgCounts._count.bookingSlots > 0,
          hasContractTemplates: orgCounts._count.contractTemplates > 0,
          hasInvoiceTemplates: orgCounts._count.invoiceTemplates > 0,
        };

        // Calculate completed/incomplete items
        const itemsWithStatus = checklistItems.map((item) => {
          const isSkipped = item.skippedAt !== null;
          const isCompleted = item.completionType
            ? completionStatus[item.completionType] ?? item.completed
            : item.completed;
          return {
            ...item,
            isCompleted: isCompleted || isSkipped,
          };
        });

        const completedCount = itemsWithStatus.filter(
          (i) => i.isCompleted
        ).length;
        const totalCount = itemsWithStatus.length;
        const incompleteItems = itemsWithStatus.filter((i) => !i.isCompleted);

        // Don't send if already complete
        if (completedCount >= totalCount) {
          // Mark as completed
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              onboardingCompleted: true,
              onboardingCompletedAt: new Date(),
            },
          });
          skipped++;
          continue;
        }

        // Build dashboard URL
        const dashboardUrl = `https://app.photoproos.com/dashboard`;
        const unsubscribeUrl = `https://app.photoproos.com/settings/notifications`;

        // Send email
        await getResend().emails.send({
          from: `PhotoProOS <noreply@${process.env.EMAIL_DOMAIN || "photoproos.com"}>`,
          to: owner.user.email,
          subject: `Finish setting up ${org.name} - ${totalCount - completedCount} steps left`,
          react: OnboardingReminderEmail({
            userName: owner.user.fullName || "there",
            organizationName: org.name,
            completedCount,
            totalCount,
            incompleteSteps: incompleteItems.slice(0, 5).map((item) => ({
              label: item.label,
              description: item.description,
              href: item.href,
            })),
            dashboardUrl,
            unsubscribeUrl,
          }),
        });

        // Update reminder sent timestamp
        await prisma.organization.update({
          where: { id: org.id },
          data: { onboardingReminderSentAt: new Date() },
        });

        sent++;
      } catch (error) {
        console.error(
          `Failed to send onboarding reminder for org ${org.id}:`,
          error
        );
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: organizations.length,
      sent,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("Error in onboarding-reminders cron:", error);
    return NextResponse.json(
      { error: "Failed to process onboarding reminders" },
      { status: 500 }
    );
  }
}

// Also allow POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
