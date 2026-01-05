import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncEmailAccount } from "@/lib/services/email-sync";

/**
 * Email Sync Cron Job
 *
 * This endpoint should be called periodically (e.g., every 5 minutes) by a cron service.
 * It syncs emails for all active email accounts.
 *
 * Railway/Vercel cron configuration:
 * - Path: /api/cron/email-sync
 * - Schedule: "star-slash-5 * * * *" (every 5 minutes)
 * - Method: GET
 * - Header: Authorization: Bearer ${CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active email accounts that need syncing
    const accounts = await prisma.emailAccount.findMany({
      where: {
        isActive: true,
        syncEnabled: true,
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        lastSyncAt: "asc", // Sync oldest first
      },
      take: 50, // Limit to prevent timeout
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No accounts to sync",
        processed: 0,
      });
    }

    const results = [];
    const errors = [];

    for (const account of accounts) {
      try {
        const result = await syncEmailAccount(account.id, {
          maxThreads: 20, // Limit per account for cron
        });

        const { accountId: _ignoredAccountId, email: _ignoredEmail, ...resultRest } = result;

        results.push({
          accountId: account.id,
          email: account.email,
          organization: account.organization.name,
          ...resultRest,
        });
      } catch (error) {
        console.error(`Error syncing ${account.email}:`, error);
        errors.push({
          accountId: account.id,
          email: account.email,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Log summary
    const successCount = results.filter((r) => r.success).length;
    const totalThreads = results.reduce((sum, r) => sum + r.threadsProcessed, 0);
    const totalMessages = results.reduce((sum, r) => sum + r.messagesProcessed, 0);

    console.log(
      `Email sync completed: ${successCount}/${accounts.length} accounts, ` +
        `${totalThreads} threads, ${totalMessages} messages`
    );

    return NextResponse.json({
      success: true,
      summary: {
        accountsProcessed: accounts.length,
        successfulSyncs: successCount,
        failedSyncs: errors.length,
        totalThreads,
        totalMessages,
      },
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Email sync cron error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual sync trigger
 * Can be called from the dashboard to force a sync
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for manual triggers too
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, fullSync = false } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    const result = await syncEmailAccount(accountId, {
      maxThreads: 100, // Allow more for manual sync
      fullSync,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Manual email sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
