/**
 * Review Follow-ups Cron Job
 *
 * Sends automated review request emails to clients X days after gallery delivery.
 * The number of days is configurable per organization (reviewGateFollowupDays).
 *
 * Only sends to clients who:
 * - Have not already received a review request for this project
 * - Have email opt-in enabled
 * - Belong to organizations with review gate and follow-up enabled
 *
 * Runs daily via Railway cron or external scheduler.
 *
 * Security: Requires CRON_SECRET Bearer token
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReviewRequestEmail } from "@/lib/email/send";
import { createReviewRequest, markReviewRequestSent } from "@/lib/actions/review-gate";

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === process.env.CRON_SECRET;
}

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

  console.log("[Review Followups] Starting cron job...");

  const now = new Date();
  let totalSent = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  try {
    // Find organizations with review gate and follow-up enabled
    const organizations = await prisma.organization.findMany({
      where: {
        reviewGateEnabled: true,
        reviewGateFollowupEnabled: true,
      },
      select: {
        id: true,
        name: true,
        publicName: true,
        logoUrl: true,
        primaryColor: true,
        reviewGateFollowupDays: true,
      },
    });

    console.log(
      `[Review Followups] Found ${organizations.length} organizations with follow-up enabled`
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";

    for (const org of organizations) {
      // Calculate the target date (deliveredAt should be X days ago)
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - org.reviewGateFollowupDays);
      targetDate.setHours(0, 0, 0, 0);

      const endOfTargetDate = new Date(targetDate);
      endOfTargetDate.setHours(23, 59, 59, 999);

      // Find delivered projects from the target date that don't have review requests
      const eligibleProjects = await prisma.project.findMany({
        where: {
          organizationId: org.id,
          status: "delivered",
          deliveredAt: {
            gte: targetDate,
            lte: endOfTargetDate,
          },
          clientId: { not: null },
          // No existing review request for this project
          reviewRequests: { none: {} },
        },
        select: {
          id: true,
          name: true,
          client: {
            select: {
              id: true,
              email: true,
              fullName: true,
              emailOptIn: true,
            },
          },
        },
      });

      console.log(
        `[Review Followups] ${org.name}: Found ${eligibleProjects.length} eligible projects`
      );

      for (const project of eligibleProjects) {
        // Skip if no client or client opted out of emails
        if (!project.client?.email || project.client.emailOptIn === false) {
          totalSkipped++;
          continue;
        }

        try {
          // Create a review request using the server action (bypasses auth for cron)
          const reviewRequest = await prisma.reviewRequest.create({
            data: {
              organizationId: org.id,
              projectId: project.id,
              clientId: project.client.id,
              clientEmail: project.client.email,
              clientName: project.client.fullName,
              source: "followup",
              status: "pending",
            },
          });

          // Build review URL
          const reviewUrl = `${baseUrl}/review/${reviewRequest.token}`;

          // Send the email
          const result = await sendReviewRequestEmail({
            to: project.client.email,
            clientName: project.client.fullName || "there",
            photographerName: org.publicName || org.name,
            photographerLogo: org.logoUrl,
            reviewUrl,
            projectName: project.name,
            primaryColor: org.primaryColor || undefined,
          });

          if (result.success) {
            // Mark as sent
            await prisma.reviewRequest.update({
              where: { id: reviewRequest.id },
              data: {
                status: "sent",
                emailSentAt: new Date(),
              },
            });
            totalSent++;
            console.log(
              `[Review Followups] Sent to ${project.client.email} for project ${project.name}`
            );
          } else {
            console.error(
              `[Review Followups] Failed to send to ${project.client.email}:`,
              result.error
            );
            totalFailed++;
          }
        } catch (error) {
          console.error(
            `[Review Followups] Error processing project ${project.id}:`,
            error
          );
          totalFailed++;
        }
      }
    }

    console.log(
      `[Review Followups] Completed: ${totalSent} sent, ${totalFailed} failed, ${totalSkipped} skipped`
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalSent,
        totalFailed,
        totalSkipped,
        organizationsProcessed: organizations.length,
      },
    });
  } catch (error) {
    console.error("[Review Followups] Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process review followups" },
      { status: 500 }
    );
  }
}
