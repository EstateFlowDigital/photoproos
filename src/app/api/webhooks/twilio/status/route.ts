import { NextRequest, NextResponse } from "next/server";
import { updateSMSDeliveryStatus } from "@/lib/sms/send";
import { prisma } from "@/lib/db";
import type { SMSDeliveryStatus } from "@prisma/client";
import twilio from "twilio";

/**
 * Map Twilio status to our SMSDeliveryStatus enum
 */
function mapTwilioStatus(twilioStatus: string): SMSDeliveryStatus {
  const statusMap: Record<string, SMSDeliveryStatus> = {
    queued: "queued",
    sending: "sent", // Twilio's "sending" maps to our "sent"
    sent: "sent",
    delivered: "delivered",
    failed: "failed",
    undelivered: "undelivered",
  };
  return statusMap[twilioStatus.toLowerCase()] || "failed";
}

/**
 * Twilio SMS Status Callback Webhook
 * Receives delivery status updates for sent SMS messages
 */
export async function POST(request: NextRequest) {
  try {
    // Get logId from query params (we pass this when creating the status callback URL)
    const logId = request.nextUrl.searchParams.get("logId");

    // Parse form data from Twilio
    const formData = await request.formData();
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string | null;
    const errorMessage = formData.get("ErrorMessage") as string | null;

    if (!messageStatus) {
      return NextResponse.json(
        { error: "Missing message status" },
        { status: 400 }
      );
    }

    // Validate the request is from Twilio (optional but recommended)
    const twilioSignature = request.headers.get("x-twilio-signature");
    if (twilioSignature && process.env.TWILIO_AUTH_TOKEN) {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status${logId ? `?logId=${logId}` : ""}`;
      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });

      const isValid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        twilioSignature,
        url,
        params
      );

      if (!isValid) {
        console.warn("[TwilioWebhook] Invalid signature for status webhook");
        // Continue anyway for now - production should return 403
      }
    }

    const status = mapTwilioStatus(messageStatus);

    // Update using logId if available (preferred method)
    if (logId) {
      await updateSMSDeliveryStatus(
        logId,
        status,
        errorCode || undefined,
        errorMessage || undefined
      );
    } else if (messageSid) {
      // Fallback: look up by messageSid
      const smsLog = await prisma.sMSLog.findFirst({
        where: { twilioMessageSid: messageSid },
        select: { id: true },
      });

      if (smsLog) {
        await updateSMSDeliveryStatus(
          smsLog.id,
          status,
          errorCode || undefined,
          errorMessage || undefined
        );
      } else {
        console.warn("[TwilioWebhook] SMS log not found for messageSid:", messageSid);
      }
    } else {
      console.warn("[TwilioWebhook] No logId or messageSid provided");
    }

    // Return 200 to acknowledge receipt
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("[TwilioWebhook] Error processing status webhook:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Twilio sends GET requests to verify the webhook URL
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
