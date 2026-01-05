/**
 * Gallery Reminders Cron Endpoint
 *
 * Sends automated reminders for galleries that haven't been viewed or paid.
 *
 * Schedule Recommendation: Run once daily (e.g., 10 AM)
 *
 * Features:
 * - Sends reminders 2 days after delivery, then every 3 days
 * - Maximum 3 reminders per gallery
 * - Respects client email opt-in preferences
 * - Tracks reminder history per gallery
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBatchGalleryReminders } from "@/lib/actions/gallery-reminders";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all organizations
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true },
    });

    let totalSent = 0;
    let totalFailed = 0;
    const results: Array<{ org: string; sent: number; failed: number }> = [];

    for (const org of organizations) {
      const result = await sendBatchGalleryReminders(org.id);

      if (result.success && result.data) {
        totalSent += result.data.sent;
        totalFailed += result.data.failed;

        if (result.data.sent > 0 || result.data.failed > 0) {
          results.push({
            org: org.name,
            sent: result.data.sent,
            failed: result.data.failed,
          });
        }
      }
    }

    console.log(`[Gallery Reminders] Sent: ${totalSent}, Failed: ${totalFailed}`);

    return NextResponse.json({
      success: true,
      totalSent,
      totalFailed,
      organizationsProcessed: organizations.length,
      details: results,
    });
  } catch (error) {
    console.error("Error in gallery-reminders cron:", error);
    return NextResponse.json(
      { error: "Failed to process gallery reminders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
