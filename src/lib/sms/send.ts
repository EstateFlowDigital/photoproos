import { prisma } from "@/lib/db";
import { getTwilioClient, createOrgTwilioClient, formatToE164, isValidPhoneNumber, TwilioCredentials } from "./twilio";
import { interpolateTemplate } from "./templates";
import type { SMSDeliveryStatus, SMSTemplateType } from "@prisma/client";

export interface SendSMSOptions {
  organizationId: string;
  to: string;
  message: string;
  templateId?: string;
  bookingId?: string;
  clientId?: string;
  userId?: string;
}

export interface SendSMSResult {
  success: boolean;
  smsLogId?: string;
  twilioMessageSid?: string;
  error?: string;
}

/**
 * Send an SMS message using organization's Twilio credentials or global credentials
 */
export async function sendSMS(options: SendSMSOptions): Promise<SendSMSResult> {
  const { organizationId, to, message, templateId, bookingId, clientId, userId } = options;

  // Format the phone number
  const formattedTo = formatToE164(to);
  if (!isValidPhoneNumber(formattedTo)) {
    return { success: false, error: "Invalid phone number format" };
  }

  try {
    // Get organization's SMS settings
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        smsEnabled: true,
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioPhoneNumber: true,
      },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    if (!org.smsEnabled) {
      return { success: false, error: "SMS is not enabled for this organization" };
    }

    // Determine which Twilio credentials to use
    let twilioClient;
    let fromNumber: string;

    if (org.twilioAccountSid && org.twilioAuthToken && org.twilioPhoneNumber) {
      // Use organization's own Twilio credentials
      const credentials: TwilioCredentials = {
        accountSid: org.twilioAccountSid,
        authToken: org.twilioAuthToken,
        phoneNumber: org.twilioPhoneNumber,
      };
      twilioClient = createOrgTwilioClient(credentials);
      fromNumber = org.twilioPhoneNumber;
    } else {
      // Use global Twilio credentials
      twilioClient = getTwilioClient();
      fromNumber = process.env.TWILIO_PHONE_NUMBER!;

      if (!fromNumber) {
        return { success: false, error: "No Twilio phone number configured" };
      }
    }

    // Create SMS log entry first
    const smsLog = await prisma.sMSLog.create({
      data: {
        organizationId,
        templateId,
        toPhone: formattedTo,
        fromPhone: fromNumber,
        content: message,
        bookingId,
        clientId,
        userId,
        deliveryStatus: "queued",
      },
    });

    // Send the SMS via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status`,
    });

    // Update log with Twilio message SID
    await prisma.sMSLog.update({
      where: { id: smsLog.id },
      data: {
        twilioMessageSid: twilioMessage.sid,
        deliveryStatus: "sent",
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      smsLogId: smsLog.id,
      twilioMessageSid: twilioMessage.sid,
    };
  } catch (err) {
    console.error("Failed to send SMS:", err);

    // Log the failure if we have an organization
    try {
      await prisma.sMSLog.create({
        data: {
          organizationId,
          templateId,
          toPhone: formattedTo,
          fromPhone: "unknown",
          content: message,
          bookingId,
          clientId,
          userId,
          deliveryStatus: "failed",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
          failedAt: new Date(),
        },
      });
    } catch {
      // Ignore logging errors
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send SMS",
    };
  }
}

/**
 * Send an SMS using a template
 */
export async function sendTemplatedSMS(options: {
  organizationId: string;
  to: string;
  templateType: SMSTemplateType;
  variables: Record<string, string>;
  bookingId?: string;
  clientId?: string;
  userId?: string;
}): Promise<SendSMSResult> {
  const { organizationId, to, templateType, variables, bookingId, clientId, userId } = options;

  try {
    // Find the template
    const template = await prisma.sMSTemplate.findFirst({
      where: {
        organizationId,
        templateType,
        isActive: true,
      },
      orderBy: {
        isDefault: "desc", // Prefer default templates
      },
    });

    if (!template) {
      return { success: false, error: `No active template found for type: ${templateType}` };
    }

    // Interpolate variables in template
    const message = interpolateTemplate(template.content, variables);

    return sendSMS({
      organizationId,
      to,
      message,
      templateId: template.id,
      bookingId,
      clientId,
      userId,
    });
  } catch (err) {
    console.error("Failed to send templated SMS:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send templated SMS",
    };
  }
}

/**
 * Update SMS delivery status (called by webhook)
 */
export async function updateSMSStatus(
  twilioMessageSid: string,
  status: string,
  errorCode?: string,
  errorMessage?: string
): Promise<void> {
  // Map Twilio status to our enum
  const statusMap: Record<string, SMSDeliveryStatus> = {
    queued: "queued",
    sent: "sent",
    delivered: "delivered",
    failed: "failed",
    undelivered: "undelivered",
  };

  const deliveryStatus = statusMap[status] || "failed";

  const updateData: {
    deliveryStatus: SMSDeliveryStatus;
    errorCode?: string;
    errorMessage?: string;
    deliveredAt?: Date;
    failedAt?: Date;
  } = {
    deliveryStatus,
  };

  if (errorCode) updateData.errorCode = errorCode;
  if (errorMessage) updateData.errorMessage = errorMessage;
  if (deliveryStatus === "delivered") updateData.deliveredAt = new Date();
  if (deliveryStatus === "failed" || deliveryStatus === "undelivered") {
    updateData.failedAt = new Date();
  }

  await prisma.sMSLog.updateMany({
    where: { twilioMessageSid },
    data: updateData,
  });
}
