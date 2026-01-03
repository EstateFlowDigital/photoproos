import { prisma } from "@/lib/db";
import { sendOrgSMS, formatPhoneNumber, type SendSMSResult } from "./twilio";
import type { SMSTemplateType, SMSDeliveryStatus } from "@prisma/client";

/**
 * Template variable definitions for each template type
 */
export const TEMPLATE_VARIABLES: Record<SMSTemplateType, string[]> = {
  booking_confirmation: [
    "clientName",
    "bookingDate",
    "bookingTime",
    "serviceName",
    "photographerName",
    "locationAddress",
  ],
  booking_reminder: [
    "clientName",
    "bookingDate",
    "bookingTime",
    "serviceName",
    "photographerName",
    "locationAddress",
  ],
  photographer_en_route: [
    "clientName",
    "photographerName",
    "etaMinutes",
    "trackingLink",
  ],
  photographer_arrived: [
    "clientName",
    "photographerName",
  ],
  gallery_ready: [
    "clientName",
    "galleryName",
    "galleryLink",
    "photographerName",
  ],
  invoice_sent: [
    "clientName",
    "invoiceNumber",
    "invoiceAmount",
    "dueDate",
    "paymentLink",
  ],
  payment_received: [
    "clientName",
    "invoiceNumber",
    "paymentAmount",
    "photographerName",
  ],
  custom: [],
};

/**
 * Default template content for each template type
 */
export const DEFAULT_TEMPLATES: Record<SMSTemplateType, string> = {
  booking_confirmation:
    "Hi {{clientName}}! Your {{serviceName}} session is confirmed for {{bookingDate}} at {{bookingTime}}. Location: {{locationAddress}}. See you then!",
  booking_reminder:
    "Reminder: Your photo session with {{photographerName}} is tomorrow at {{bookingTime}}. Location: {{locationAddress}}. Reply STOP to opt out.",
  photographer_en_route:
    "{{photographerName}} is on the way! ETA: {{etaMinutes}} minutes. Track live: {{trackingLink}}",
  photographer_arrived:
    "{{photographerName}} has arrived at the property and is ready to begin.",
  gallery_ready:
    "Hi {{clientName}}! Your photos from {{galleryName}} are ready to view: {{galleryLink}}",
  invoice_sent:
    "Hi {{clientName}}, invoice #{{invoiceNumber}} for {{invoiceAmount}} is ready. Due: {{dueDate}}. Pay here: {{paymentLink}}",
  payment_received:
    "Thank you {{clientName}}! We received your payment of {{paymentAmount}} for invoice #{{invoiceNumber}}.",
  custom: "",
};

/**
 * Interpolate template variables into content
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number | undefined>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Options for sending an SMS to a client
 */
export interface SendSMSToClientOptions {
  organizationId: string;
  clientId: string;
  templateType: SMSTemplateType;
  variables: Record<string, string | number | undefined>;
  bookingId?: string;
  customContent?: string; // For custom template type
}

/**
 * Send an SMS to a client using organization's Twilio credentials
 */
export async function sendSMSToClient(
  options: SendSMSToClientOptions
): Promise<SendSMSResult & { smsLogId?: string }> {
  const {
    organizationId,
    clientId,
    templateType,
    variables,
    bookingId,
    customContent,
  } = options;

  // Get organization with Twilio credentials
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      smsEnabled: true,
      twilioAccountSid: true,
      twilioAuthToken: true,
      twilioPhoneNumber: true,
    },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  if (!organization.smsEnabled) {
    return { success: false, error: "SMS is not enabled for this organization" };
  }

  if (
    !organization.twilioAccountSid ||
    !organization.twilioAuthToken ||
    !organization.twilioPhoneNumber
  ) {
    return {
      success: false,
      error: "Twilio credentials not configured for this organization",
    };
  }

  // Get client phone number
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, phone: true, fullName: true, smsOptIn: true },
  });

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  if (!client.phone) {
    return { success: false, error: "Client does not have a phone number" };
  }

  if (client.smsOptIn === false) {
    return { success: false, error: "Client has opted out of SMS" };
  }

  // Format phone number
  const formattedPhone = formatPhoneNumber(client.phone);
  if (!formattedPhone) {
    return {
      success: false,
      error: `Invalid client phone number: ${client.phone}`,
    };
  }

  // Get or use default template
  let messageContent: string;

  if (templateType === "custom" && customContent) {
    messageContent = interpolateTemplate(customContent, variables);
  } else {
    // Look for organization's custom template
    const template = await prisma.sMSTemplate.findFirst({
      where: {
        organizationId,
        templateType,
        isActive: true,
      },
    });

    const templateContent =
      template?.content || DEFAULT_TEMPLATES[templateType];
    messageContent = interpolateTemplate(templateContent, variables);
  }

  // Create SMS log entry (optimistic)
  const smsLog = await prisma.sMSLog.create({
    data: {
      organizationId,
      toPhone: formattedPhone,
      fromPhone: organization.twilioPhoneNumber,
      content: messageContent,
      bookingId,
      clientId,
      deliveryStatus: "queued",
    },
  });

  // Build webhook URL for status updates
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const statusCallback = baseUrl
    ? `${baseUrl}/api/webhooks/twilio/status?logId=${smsLog.id}`
    : undefined;

  // Send the SMS
  const result = await sendOrgSMS(
    organization.twilioAccountSid,
    organization.twilioAuthToken,
    {
      to: formattedPhone,
      body: messageContent,
      from: organization.twilioPhoneNumber,
      statusCallback,
    }
  );

  // Update SMS log with result
  if (result.success && result.messageSid) {
    await prisma.sMSLog.update({
      where: { id: smsLog.id },
      data: {
        twilioMessageSid: result.messageSid,
        deliveryStatus: "sent",
        sentAt: new Date(),
      },
    });
  } else {
    await prisma.sMSLog.update({
      where: { id: smsLog.id },
      data: {
        deliveryStatus: "failed",
        errorCode: result.errorCode,
        errorMessage: result.error,
        failedAt: new Date(),
      },
    });
  }

  return {
    ...result,
    smsLogId: smsLog.id,
  };
}

/**
 * Options for sending SMS to a phone number directly
 */
export interface SendSMSDirectOptions {
  organizationId: string;
  toPhone: string;
  content: string;
  bookingId?: string;
  clientId?: string;
}

/**
 * Send an SMS directly to a phone number (for custom messages)
 */
export async function sendSMSDirect(
  options: SendSMSDirectOptions
): Promise<SendSMSResult & { smsLogId?: string }> {
  const { organizationId, toPhone, content, bookingId, clientId } = options;

  // Get organization with Twilio credentials
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      smsEnabled: true,
      twilioAccountSid: true,
      twilioAuthToken: true,
      twilioPhoneNumber: true,
    },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  if (!organization.smsEnabled) {
    return { success: false, error: "SMS is not enabled for this organization" };
  }

  if (
    !organization.twilioAccountSid ||
    !organization.twilioAuthToken ||
    !organization.twilioPhoneNumber
  ) {
    return {
      success: false,
      error: "Twilio credentials not configured for this organization",
    };
  }

  // Format phone number
  const formattedPhone = formatPhoneNumber(toPhone);
  if (!formattedPhone) {
    return { success: false, error: `Invalid phone number: ${toPhone}` };
  }

  // Create SMS log entry
  const smsLog = await prisma.sMSLog.create({
    data: {
      organizationId,
      toPhone: formattedPhone,
      fromPhone: organization.twilioPhoneNumber,
      content,
      bookingId,
      clientId,
      deliveryStatus: "queued",
    },
  });

  // Build webhook URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const statusCallback = baseUrl
    ? `${baseUrl}/api/webhooks/twilio/status?logId=${smsLog.id}`
    : undefined;

  // Send the SMS
  const result = await sendOrgSMS(
    organization.twilioAccountSid,
    organization.twilioAuthToken,
    {
      to: formattedPhone,
      body: content,
      from: organization.twilioPhoneNumber,
      statusCallback,
    }
  );

  // Update SMS log with result
  if (result.success && result.messageSid) {
    await prisma.sMSLog.update({
      where: { id: smsLog.id },
      data: {
        twilioMessageSid: result.messageSid,
        deliveryStatus: "sent",
        sentAt: new Date(),
      },
    });
  } else {
    await prisma.sMSLog.update({
      where: { id: smsLog.id },
      data: {
        deliveryStatus: "failed",
        errorCode: result.errorCode,
        errorMessage: result.error,
        failedAt: new Date(),
      },
    });
  }

  return {
    ...result,
    smsLogId: smsLog.id,
  };
}

/**
 * Update SMS delivery status from webhook
 */
export async function updateSMSDeliveryStatus(
  logId: string,
  status: SMSDeliveryStatus,
  errorCode?: string,
  errorMessage?: string
): Promise<void> {
  const updateData: {
    deliveryStatus: SMSDeliveryStatus;
    errorCode?: string;
    errorMessage?: string;
    deliveredAt?: Date;
    failedAt?: Date;
  } = {
    deliveryStatus: status,
  };

  if (status === "delivered") {
    updateData.deliveredAt = new Date();
  } else if (status === "failed" || status === "undelivered") {
    updateData.failedAt = new Date();
    if (errorCode) updateData.errorCode = errorCode;
    if (errorMessage) updateData.errorMessage = errorMessage;
  }

  await prisma.sMSLog.update({
    where: { id: logId },
    data: updateData,
  });
}
