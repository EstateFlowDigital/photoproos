import { NextRequest, NextResponse } from "next/server";
import { processScheduledPortfolioPublishing } from "@/lib/actions/portfolio-websites";

// This route is designed to be called by a cron job (e.g., Vercel Cron, Railway, etc.)
// Recommended schedule: Run every 5-15 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processScheduledPortfolioPublishing();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Published ${result.publishedCount} portfolio(s)`,
      publishedCount: result.publishedCount,
    });
  } catch (error) {
    console.error("Portfolio publish cron job error:", error);
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
