"use server";

import { NextRequest, NextResponse } from "next/server";

/**
 * Railway Webhook Handler
 *
 * This endpoint receives deployment notifications from Railway.
 * When a build fails, it triggers the GitHub Action to auto-fix errors.
 *
 * Setup:
 * 1. In Railway project settings, add a webhook URL:
 *    https://your-domain.com/api/webhooks/railway
 * 2. Add RAILWAY_WEBHOOK_SECRET to your Railway environment
 * 3. Add GITHUB_PAT (Personal Access Token) with repo and workflow permissions
 *
 * Railway webhook payload structure:
 * {
 *   type: "DEPLOY",
 *   status: "SUCCESS" | "FAILED" | "BUILDING" | etc,
 *   environment: { name: "production" },
 *   deployment: { id, meta: { ... } },
 *   ...
 * }
 */

interface RailwayWebhookPayload {
  type: string;
  status: string;
  timestamp: string;
  environment?: {
    name: string;
  };
  deployment?: {
    id: string;
    meta?: Record<string, unknown>;
  };
  project?: {
    name: string;
  };
  // Build logs may be included or need to be fetched
  logs?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional but recommended)
    const webhookSecret = process.env.RAILWAY_WEBHOOK_SECRET;
    const signature = request.headers.get("x-railway-signature");

    if (webhookSecret && signature !== webhookSecret) {
      console.error("Invalid Railway webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: RailwayWebhookPayload = await request.json();

    console.log("Railway webhook received:", {
      type: payload.type,
      status: payload.status,
      environment: payload.environment?.name,
    });

    // Only trigger on deploy failures
    if (payload.type !== "DEPLOY" || payload.status !== "FAILED") {
      return NextResponse.json({
        message: "Webhook received, no action needed",
        status: payload.status,
      });
    }

    // Check if we have the required GitHub PAT
    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) {
      console.error("GITHUB_PAT not configured");
      return NextResponse.json(
        { error: "GitHub integration not configured" },
        { status: 500 }
      );
    }

    // Get the repo info from environment or hardcode
    const repoOwner = process.env.GITHUB_REPO_OWNER || "EstateFlowDigital";
    const repoName = process.env.GITHUB_REPO_NAME || "photoproos";

    // Prepare the error logs
    // Note: Railway may not include full logs in webhook, you might need
    // to fetch them via Railway API or include a summary
    const errorLogs = payload.logs || `Build failed for deployment ${payload.deployment?.id}`;

    // Trigger GitHub repository_dispatch event
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "railway-build-failed",
          client_payload: {
            logs: errorLogs,
            deployment_id: payload.deployment?.id,
            environment: payload.environment?.name,
            timestamp: payload.timestamp,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to trigger GitHub Action:", error);
      return NextResponse.json(
        { error: "Failed to trigger auto-fix workflow" },
        { status: 500 }
      );
    }

    console.log("Successfully triggered GitHub Action for build fix");

    return NextResponse.json({
      message: "Auto-fix workflow triggered",
      deployment_id: payload.deployment?.id,
    });
  } catch (error) {
    console.error("Error processing Railway webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Railway webhook handler",
    actions: ["Triggers GitHub Action on build failure"],
  });
}
