import { NextRequest, NextResponse } from "next/server";
import { processDueScheduledMessages } from "@/lib/actions/scheduled-messages";

// Verify cron secret to prevent unauthorized calls
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Cron endpoint to process scheduled messages
 *
 * This should be called every minute by your cron service (Vercel Cron, Railway Cron, etc.)
 *
 * Example Vercel cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/scheduled-messages",
 *     "schedule": "* * * * *"
 *   }]
 * }
 *
 * Or call via Railway cron, GitHub Actions, or any external cron service
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if configured
    if (CRON_SECRET) {
      const authHeader = request.headers.get("authorization");
      const providedSecret = authHeader?.replace("Bearer ", "");

      if (providedSecret !== CRON_SECRET) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // Process due scheduled messages
    const result = await processDueScheduledMessages();

    if (!result.success) {
      console.error("[Cron] Failed to process scheduled messages:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      processed: result.data.processed,
      failed: result.data.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Scheduled messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
