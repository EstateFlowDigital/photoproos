import { NextRequest, NextResponse } from "next/server";
import { updateSMSStatus } from "@/lib/sms/send";
import twilio from "twilio";

/**
 * Twilio SMS Status Callback Webhook
 * Receives delivery status updates for sent SMS messages
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string | null;
    const errorMessage = formData.get("ErrorMessage") as string | null;

    if (!messageSid || !messageStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate the request is from Twilio (optional but recommended)
    const twilioSignature = request.headers.get("x-twilio-signature");
    if (twilioSignature && process.env.TWILIO_AUTH_TOKEN) {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status`;
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
        console.warn("Invalid Twilio signature for status webhook");
        // Continue anyway for now - production should return 403
      }
    }

    // Update the SMS status in our database
    await updateSMSStatus(
      messageSid,
      messageStatus.toLowerCase(),
      errorCode || undefined,
      errorMessage || undefined
    );

    // Return 200 to acknowledge receipt
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("Error processing Twilio status webhook:", err);
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
