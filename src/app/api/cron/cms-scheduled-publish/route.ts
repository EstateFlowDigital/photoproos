/**
 * CMS Scheduled Publishing Cron Endpoint
 *
 * Automatically publishes marketing pages that have been scheduled for a specific date/time.
 *
 * Schedule Recommendation: Run every 5-15 minutes for timely publishing
 *
 * Features:
 * - Processes all pages with scheduledPublishAt <= now
 * - Publishes draft content if available
 * - Updates page status to "published"
 * - Clears scheduling fields after successful publish
 * - Invalidates cache for immediate visibility
 * - Logs activity for audit trail
 *
 * Endpoint: GET /api/cron/cms-scheduled-publish
 * Authorization: Bearer {CRON_SECRET}
 */

import { NextRequest, NextResponse } from "next/server";
import { processScheduledPublishes } from "@/lib/actions/marketing-cms";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processScheduledPublishes();

    if (!result.success) {
      console.error("[CMS Scheduled Publish Cron] Error:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const { processed, errors, details } = result.data;

    console.log(
      `[CMS Scheduled Publish Cron] Processed ${processed} pages, ${errors} errors`
    );

    if (details.length > 0) {
      console.log("[CMS Scheduled Publish Cron] Details:", details);
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cms-scheduled-publish cron:", error);
    return NextResponse.json(
      { error: "Failed to process scheduled publishes" },
      { status: 500 }
    );
  }
}

// Allow POST for flexibility (some cron services use POST)
export async function POST(request: NextRequest) {
  return GET(request);
}
