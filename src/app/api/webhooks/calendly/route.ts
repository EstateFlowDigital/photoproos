/**
 * Calendly Webhook Handler
 *
 * Handles incoming webhook events from Calendly:
 * - invitee.created: New booking created
 * - invitee.canceled: Booking canceled
 *
 * Webhooks can be verified using HMAC-SHA256 signature if a signing key is configured.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processCalendlyEvent } from "@/lib/actions/calendly";
import crypto from "crypto";

interface CalendlyWebhookPayload {
  event: "invitee.created" | "invitee.canceled";
  created_at: string;
  created_by: string;
  payload: {
    uri: string;
    email: string;
    name: string;
    event: string;
    status: "active" | "canceled";
    timezone: string;
    questions_and_answers?: Array<{
      question: string;
      answer: string;
    }>;
    scheduled_event: {
      uri: string;
      name: string;
      status: "active" | "canceled";
      start_time: string;
      end_time: string;
      event_type: string;
      location?: {
        type: string;
        location?: string;
      };
    };
  };
}

/**
 * Verify Calendly webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  signingKey: string
): boolean {
  try {
    // Calendly signature format: t=timestamp,v1=signature
    const parts = signature.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const signaturePart = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !signaturePart) {
      return false;
    }

    const timestamp = timestampPart.split("=")[1];
    const receivedSignature = signaturePart.split("=")[1];

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", signingKey)
      .update(signedPayload, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("calendly-webhook-signature");

  let payload: CalendlyWebhookPayload;

  try {
    payload = JSON.parse(body);
  } catch {
    console.error("Calendly webhook: Invalid JSON payload");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Extract the user URI from the webhook to find the integration
  const userUri =
    payload.payload?.scheduled_event?.event_type?.split("/event_types")[0] ||
    null;

  if (!userUri) {
    console.error("Calendly webhook: Could not extract user URI");
    return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
  }

  // Extract user identifier from the URI (last segment)
  const userIdentifier = userUri.split("/").pop();

  if (!userIdentifier) {
    console.error("Calendly webhook: Could not extract user identifier from URI");
    return NextResponse.json({ error: "Invalid user URI" }, { status: 400 });
  }

  // Find the integration by user URI (must be active and match the user)
  const integration = await prisma.calendlyIntegration.findFirst({
    where: {
      userUri: { contains: userIdentifier },
      isActive: true,
    },
  });

  if (!integration) {
    console.error("Calendly webhook: No matching integration found");
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  // Verify webhook signature if signing key is configured
  if (integration.webhookSigningKey && signature) {
    const isValid = verifySignature(body, signature, integration.webhookSigningKey);
    if (!isValid) {
      console.error("Calendly webhook: Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    // Process the webhook event
    const result = await processCalendlyEvent(
      integration.organizationId,
      payload.event,
      {
        uri: payload.payload.uri,
        email: payload.payload.email,
        name: payload.payload.name,
        event: payload.payload.event,
        scheduled_event: payload.payload.scheduled_event,
        questions_and_answers: payload.payload.questions_and_answers,
      }
    );

    if (!result.success) {
      console.error("Calendly webhook: Processing failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Log the webhook event
    await prisma.integrationLog.create({
      data: {
        organizationId: integration.organizationId,
        provider: "calendly",
        eventType: "webhook_received",
        message: `Received ${payload.event} webhook`,
        details: {
          eventType: payload.event,
          inviteeEmail: payload.payload.email,
          eventName: payload.payload.scheduled_event.name,
        },
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Calendly webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: "ok", service: "calendly-webhook" });
}
