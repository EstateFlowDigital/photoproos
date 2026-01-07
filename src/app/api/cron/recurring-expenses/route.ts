import { NextResponse } from "next/server";
import { processRecurringExpenses } from "@/lib/actions/project-expenses";

// Vercel Cron job endpoint
// This should be called once per day (e.g., at 6 AM)
// Add to vercel.json: { "crons": [{ "path": "/api/cron/recurring-expenses", "schedule": "0 6 * * *" }] }

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, allow without auth
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processRecurringExpenses();

    if (!result.success) {
      console.error("Failed to process recurring expenses:", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(
      `Recurring expenses processed: ${result.data?.processed} created, ${result.data?.failed} failed`
    );

    return NextResponse.json({
      success: true,
      processed: result.data?.processed,
      failed: result.data?.failed,
      details: result.data?.details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in recurring expenses cron:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow POST for manual triggering
export async function POST(request: Request) {
  return GET(request);
}
