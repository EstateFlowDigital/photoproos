/**
 * Late Fee Application Cron Endpoint
 *
 * Automatically applies late fees to overdue invoices.
 *
 * Schedule Recommendation: Run once daily (e.g., 12 AM midnight)
 *
 * Features:
 * - Applies late fees to invoices that are overdue
 * - Only applies if late fees are enabled for the invoice
 * - Prevents multiple fees within 30 days (configurable)
 * - Supports percentage-based or fixed late fees
 * - Tracks when late fees were applied
 */

import { NextRequest, NextResponse } from "next/server";
import { applyBatchLateFees } from "@/lib/actions/invoice-payments";
import { updateAllOverdueInvoices } from "@/lib/actions/invoices";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First, update all invoices to overdue status if past due date
    const overdueResult = await updateAllOverdueInvoices();
    const overdueCount = overdueResult.success ? overdueResult.data.count : 0;

    // Then apply late fees to eligible invoices
    const lateFeeResult = await applyBatchLateFees();

    if (!lateFeeResult.success) {
      console.error("[Late Fees Cron] Error:", lateFeeResult.error);
      return NextResponse.json(
        { error: lateFeeResult.error },
        { status: 500 }
      );
    }

    console.log(
      `[Late Fees Cron] Marked ${overdueCount} invoices as overdue, ` +
        `applied late fees to ${lateFeeResult.data.processed} invoices, ` +
        `total fees: $${(lateFeeResult.data.totalFeesApplied / 100).toFixed(2)}`
    );

    return NextResponse.json({
      success: true,
      overdueMarked: overdueCount,
      lateFeesApplied: lateFeeResult.data.processed,
      totalFeesAppliedCents: lateFeeResult.data.totalFeesApplied,
      totalFeesFormatted: `$${(lateFeeResult.data.totalFeesApplied / 100).toFixed(2)}`,
    });
  } catch (error) {
    console.error("Error in late-fees cron:", error);
    return NextResponse.json(
      { error: "Failed to process late fees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
