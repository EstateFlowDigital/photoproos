import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { EmailStatus } from "@prisma/client";
import crypto from "crypto";

/**
 * Resend Webhook Event Types
 * https://resend.com/docs/webhooks
 */
type ResendEventType =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.complained"
  | "email.bounced"
  | "email.opened"
  | "email.clicked";

interface ResendWebhookEvent {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Additional fields depending on event type
    click?: { link: string; timestamp: string };
    bounce?: { type: string; message: string };
  };
}

/**
 * Map Resend event type to our EmailStatus enum
 */
function mapResendStatus(eventType: ResendEventType): EmailStatus | null {
  const statusMap: Record<ResendEventType, EmailStatus | null> = {
    "email.sent": "sent",
    "email.delivered": "delivered",
    "email.delivery_delayed": "pending", // Keep as pending, will retry
    "email.complained": "bounced", // Spam complaint
    "email.bounced": "bounced",
    "email.opened": null, // Don't change status, just track
    "email.clicked": null, // Don't change status, just track
  };
  return statusMap[eventType];
}

/**
 * Verify Resend webhook signature
 * https://resend.com/docs/webhooks#verify-webhook-signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Resend Email Webhook
 * Receives delivery status updates for sent emails
 *
 * Configure in Resend Dashboard:
 * Webhook URL: https://your-domain.com/api/webhooks/resend
 * Events: email.sent, email.delivered, email.bounced, email.complained
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("resend-signature");
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret && !verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.warn("[ResendWebhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: ResendWebhookEvent = JSON.parse(payload);
    const { type, data } = event;

    console.log(`[ResendWebhook] Received ${type} for email ${data.email_id}`);

    // Find the email log by resendId
    const emailLog = await prisma.emailLog.findFirst({
      where: { resendId: data.email_id },
    });

    if (!emailLog) {
      // Not an error - might be an email we didn't log (e.g., test emails)
      console.log(`[ResendWebhook] No log found for email ${data.email_id}`);
      return NextResponse.json({ status: "ok", message: "No matching log" });
    }

    // Determine new status
    const newStatus = mapResendStatus(type);
    const now = new Date();

    // Update based on event type
    switch (type) {
      case "email.sent":
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: newStatus!,
            sentAt: now,
          },
        });
        break;

      case "email.delivered":
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: newStatus!,
            deliveredAt: now,
          },
        });
        break;

      case "email.bounced":
      case "email.complained":
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: newStatus!,
            failedAt: now,
            errorMessage:
              type === "email.bounced"
                ? `Bounced: ${data.bounce?.type || "unknown"} - ${data.bounce?.message || ""}`
                : "Marked as spam by recipient",
          },
        });
        break;

      case "email.opened":
        // Track open in metadata (could add openedAt field in future)
        console.log(`[ResendWebhook] Email ${data.email_id} opened`);
        break;

      case "email.clicked":
        // Track click in metadata (could add clickedAt field in future)
        console.log(
          `[ResendWebhook] Email ${data.email_id} clicked: ${data.click?.link}`
        );
        break;

      case "email.delivery_delayed":
        // Keep as pending, Resend will retry
        console.log(`[ResendWebhook] Email ${data.email_id} delayed`);
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[ResendWebhook] Error processing webhook:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Resend may send GET requests to verify the webhook URL
export async function GET() {
  return NextResponse.json({ status: "ok", service: "resend-webhook" });
}
