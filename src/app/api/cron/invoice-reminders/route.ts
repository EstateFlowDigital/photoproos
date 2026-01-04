/**
 * Invoice Payment Reminders Cron Endpoint
 *
 * Sends automated payment reminders for overdue invoices.
 *
 * Schedule Recommendation: Run once daily (e.g., 9 AM)
 *
 * Features:
 * - Sends reminders every 3 days for overdue invoices
 * - Maximum 5 reminders per invoice
 * - Auto-updates invoice status to "overdue"
 * - Tracks reminder history
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBatchInvoiceReminders } from "@/lib/actions/invoices";

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
      const result = await sendBatchInvoiceReminders(org.id);

      if (result.success) {
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

    console.log(`[Invoice Reminders] Sent: ${totalSent}, Failed: ${totalFailed}`);

    return NextResponse.json({
      success: true,
      totalSent,
      totalFailed,
      organizationsProcessed: organizations.length,
      details: results,
    });
  } catch (error) {
    console.error("Error in invoice-reminders cron:", error);
    return NextResponse.json(
      { error: "Failed to process invoice reminders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
