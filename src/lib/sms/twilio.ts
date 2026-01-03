import Twilio from "twilio";

// Lazy initialization to avoid build-time errors when env vars are not set
let _twilioClient: Twilio.Twilio | null = null;

/**
 * Get the global Twilio client (uses platform-level credentials)
 * This is only for platform-owned operations, not per-org SMS
 */
export function getTwilio(): Twilio.Twilio {
  if (!_twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
    }

    _twilioClient = Twilio(accountSid, authToken);
  }
  return _twilioClient;
}

/**
 * Get a Twilio client for a specific organization
 * Organizations can have their own Twilio credentials
 */
export function getOrgTwilioClient(
  accountSid: string,
  authToken: string
): Twilio.Twilio {
  return Twilio(accountSid, authToken);
}

/**
 * Validate a phone number format (basic E.164 validation)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number], 8-15 digits total
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  return e164Regex.test(phone);
}

/**
 * Format a phone number to E.164 format (US numbers)
 */
export function formatPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle US numbers
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Already has country code
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // Check if it's already in E.164 format
  if (phone.startsWith("+") && isValidPhoneNumber(phone)) {
    return phone;
  }

  return null;
}

/**
 * Get the default platform Twilio phone number
 */
export function getPlatformPhoneNumber(): string {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!phoneNumber) {
    throw new Error("TWILIO_PHONE_NUMBER is not set");
  }
  return phoneNumber;
}

/**
 * SMS message options interface
 */
export interface SendSMSOptions {
  to: string;
  body: string;
  from?: string;
  statusCallback?: string;
  mediaUrl?: string[];
}

/**
 * SMS send result interface
 */
export interface SendSMSResult {
  success: boolean;
  messageSid?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Send an SMS using platform credentials
 */
export async function sendSMS(options: SendSMSOptions): Promise<SendSMSResult> {
  const { to, body, from, statusCallback, mediaUrl } = options;

  try {
    const client = getTwilio();
    const fromNumber = from || getPlatformPhoneNumber();

    // Validate and format the recipient number
    const formattedTo = formatPhoneNumber(to);
    if (!formattedTo) {
      return {
        success: false,
        error: `Invalid phone number format: ${to}`,
        errorCode: "INVALID_PHONE",
      };
    }

    const message = await client.messages.create({
      to: formattedTo,
      from: fromNumber,
      body,
      statusCallback,
      mediaUrl,
    });

    return {
      success: true,
      messageSid: message.sid,
    };
  } catch (err) {
    console.error("[Twilio] Failed to send SMS:", err);

    // Extract Twilio error details
    const twilioError = err as {
      code?: number;
      message?: string;
      moreInfo?: string;
    };

    return {
      success: false,
      error: twilioError.message || "Failed to send SMS",
      errorCode: twilioError.code?.toString(),
    };
  }
}

/**
 * Send an SMS using organization-specific credentials
 */
export async function sendOrgSMS(
  accountSid: string,
  authToken: string,
  options: SendSMSOptions
): Promise<SendSMSResult> {
  const { to, body, from, statusCallback, mediaUrl } = options;

  if (!from) {
    return {
      success: false,
      error: "Organization phone number is required",
      errorCode: "MISSING_FROM_NUMBER",
    };
  }

  try {
    const client = getOrgTwilioClient(accountSid, authToken);

    // Validate and format the recipient number
    const formattedTo = formatPhoneNumber(to);
    if (!formattedTo) {
      return {
        success: false,
        error: `Invalid phone number format: ${to}`,
        errorCode: "INVALID_PHONE",
      };
    }

    const message = await client.messages.create({
      to: formattedTo,
      from,
      body,
      statusCallback,
      mediaUrl,
    });

    return {
      success: true,
      messageSid: message.sid,
    };
  } catch (err) {
    console.error("[Twilio] Failed to send org SMS:", err);

    const twilioError = err as {
      code?: number;
      message?: string;
      moreInfo?: string;
    };

    return {
      success: false,
      error: twilioError.message || "Failed to send SMS",
      errorCode: twilioError.code?.toString(),
    };
  }
}

/**
 * Verify Twilio webhook signature
 */
export function verifyTwilioWebhook(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.error("[Twilio] Cannot verify webhook: TWILIO_AUTH_TOKEN not set");
    return false;
  }

  return Twilio.validateRequest(authToken, signature, url, params);
}

/**
 * SMS delivery status type
 */
export type TwilioMessageStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "undelivered"
  | "failed"
  | "read"; // For WhatsApp
