/**
 * Slack Integration Module
 *
 * This module handles all Slack API interactions for PhotoProOS.
 * It supports sending notifications for bookings, payments, and other events.
 */

export interface SlackWebhookPayload {
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

export interface SlackBlock {
  type: "section" | "divider" | "header" | "context" | "actions";
  text?: {
    type: "plain_text" | "mrkdwn";
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: "plain_text" | "mrkdwn";
    text: string;
  }>;
  accessory?: {
    type: "button" | "image";
    text?: {
      type: "plain_text";
      text: string;
    };
    url?: string;
    image_url?: string;
    alt_text?: string;
  };
}

export interface SlackAttachment {
  color?: string;
  fallback?: string;
  title?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
}

export interface SlackNotificationConfig {
  webhookUrl: string;
  channel?: string;
  enabled: boolean;
  events: {
    newBooking: boolean;
    bookingCancelled: boolean;
    paymentReceived: boolean;
    galleryDelivered: boolean;
    clientMessage: boolean;
  };
}

/**
 * Send a message to Slack via webhook
 */
export async function sendSlackWebhook(
  webhookUrl: string,
  payload: SlackWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Slack webhook failed: ${text}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending Slack webhook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build a notification for a new booking
 */
export function buildNewBookingNotification(booking: {
  clientName: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  address?: string;
  totalCents: number;
}): SlackWebhookPayload {
  const formattedTotal = (booking.totalCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📸 New Booking Received!",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Client:*\n${booking.clientName}` },
          { type: "mrkdwn", text: `*Service:*\n${booking.serviceName}` },
          { type: "mrkdwn", text: `*Date:*\n${booking.scheduledDate}` },
          { type: "mrkdwn", text: `*Time:*\n${booking.scheduledTime}` },
          { type: "mrkdwn", text: `*Total:*\n${formattedTotal}` },
          ...(booking.address
            ? [{ type: "mrkdwn" as const, text: `*Location:*\n${booking.address}` }]
            : []),
        ],
      },
      { type: "divider" },
    ],
  };
}

/**
 * Build a notification for a payment received
 */
export function buildPaymentNotification(payment: {
  clientName: string;
  amountCents: number;
  invoiceNumber?: string;
  galleryName?: string;
}): SlackWebhookPayload {
  const formattedAmount = (payment.amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "💰 Payment Received!",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Client:*\n${payment.clientName}` },
          { type: "mrkdwn", text: `*Amount:*\n${formattedAmount}` },
          ...(payment.invoiceNumber
            ? [{ type: "mrkdwn" as const, text: `*Invoice:*\n#${payment.invoiceNumber}` }]
            : []),
          ...(payment.galleryName
            ? [{ type: "mrkdwn" as const, text: `*Gallery:*\n${payment.galleryName}` }]
            : []),
        ],
      },
      { type: "divider" },
    ],
  };
}

/**
 * Build a notification for a cancelled booking
 */
export function buildCancellationNotification(booking: {
  clientName: string;
  serviceName: string;
  scheduledDate: string;
  reason?: string;
}): SlackWebhookPayload {
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "❌ Booking Cancelled",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Client:*\n${booking.clientName}` },
          { type: "mrkdwn", text: `*Service:*\n${booking.serviceName}` },
          { type: "mrkdwn", text: `*Date:*\n${booking.scheduledDate}` },
          ...(booking.reason
            ? [{ type: "mrkdwn" as const, text: `*Reason:*\n${booking.reason}` }]
            : []),
        ],
      },
      { type: "divider" },
    ],
  };
}

/**
 * Test a Slack webhook URL
 */
export async function testSlackWebhook(
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  return sendSlackWebhook(webhookUrl, {
    text: "✅ PhotoProOS Slack integration is working! You'll receive notifications here.",
  });
}
