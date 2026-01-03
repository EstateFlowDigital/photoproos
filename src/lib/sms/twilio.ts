import twilio from "twilio";

// Lazy initialization to avoid build-time errors when env vars are not set
let _twilioClient: twilio.Twilio | null = null;

export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

/**
 * Get the global Twilio client (for system-level operations)
 */
export function getTwilioClient(): twilio.Twilio {
  if (!_twilioClient) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials are not configured");
    }
    _twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return _twilioClient;
}

/**
 * Create a Twilio client with organization-specific credentials
 */
export function createOrgTwilioClient(credentials: TwilioCredentials): twilio.Twilio {
  return twilio(credentials.accountSid, credentials.authToken);
}

/**
 * Check if global Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

/**
 * Get the default Twilio phone number
 */
export function getDefaultTwilioNumber(): string | undefined {
  return process.env.TWILIO_PHONE_NUMBER;
}

/**
 * Validate a phone number format (basic E.164 validation)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number], max 15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * Format a phone number to E.164 format (US numbers)
 */
export function formatToE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it's 11 digits and starts with 1, add +
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // If it already has the right format, just add +
  if (digits.length > 10) {
    return `+${digits}`;
  }

  // Return as-is if we can't determine format
  return phone;
}
