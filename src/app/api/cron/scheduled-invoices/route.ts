/**
 * Scheduled Invoice Send Cron Endpoint
 *
 * Automatically sends invoices that have been scheduled for a specific date/time.
 *
 * Schedule Recommendation: Run every 15 minutes or hourly
 *
 * Features:
 * - Processes all draft invoices with scheduledSendAt <= now
 * - Sends invoice email to client
 * - Updates invoice status to "sent"
 * - Logs activity for audit trail
 */

import { NextRequest, NextResponse } from "next/server";
import { processScheduledInvoices } from "@/lib/actions/invoices";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processScheduledInvoices();

    if (!result.success) {
      console.error("[Scheduled Invoices Cron] Error:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(
      `[Scheduled Invoices Cron] Processed ${result.data.processed} invoices, ${result.data.errors} errors`
    );

    return NextResponse.json({
      success: true,
      processed: result.data.processed,
      errors: result.data.errors,
    });
  } catch (error) {
    console.error("Error in scheduled-invoices cron:", error);
    return NextResponse.json(
      { error: "Failed to process scheduled invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
