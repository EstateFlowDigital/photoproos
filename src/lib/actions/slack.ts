"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import { formatCurrency } from "@/lib/utils/units";
import { ok, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// TYPES
// ============================================================================

export type SlackConfig = {
  id: string;
  organizationId: string;
  teamId: string;
  teamName: string;
  isActive: boolean;
  incomingWebhookUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Extended fields for UI compatibility
  webhookUrl?: string | null;
  channelName?: string | null;
  isEnabled?: boolean;
  notifyNewBooking?: boolean;
  notifyCancellation?: boolean;
  notifyPayment?: boolean;
  notifyGalleryDelivery?: boolean;
  notifyClientMessage?: boolean;
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getSlackConfig(): Promise<ActionResult<SlackConfig | null>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.slackIntegration.findFirst({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        organizationId: true,
        teamId: true,
        teamName: true,
        isActive: true,
        incomingWebhookUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!config) {
      return { success: true, data: null };
    }

    // Map to extended config for UI compatibility
    const extendedConfig: SlackConfig = {
      ...config,
      webhookUrl: config.incomingWebhookUrl,
      isEnabled: config.isActive,
      notifyNewBooking: true,
      notifyCancellation: true,
      notifyPayment: true,
      notifyGalleryDelivery: false,
      notifyClientMessage: false,
    };

    return { success: true, data: extendedConfig };
  } catch (error) {
    console.error("Error getting Slack config:", error);
    return { success: false, error: "Failed to get Slack configuration" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function saveSlackConfig(data: {
  webhookUrl: string;
  channelName?: string;
  notifyNewBooking?: boolean;
  notifyCancellation?: boolean;
  notifyPayment?: boolean;
  notifyGalleryDelivery?: boolean;
  notifyClientMessage?: boolean;
}): Promise<ActionResult<SlackConfig>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate webhook URL format
    if (!data.webhookUrl.startsWith("https://hooks.slack.com/")) {
      return { success: false, error: "Invalid Slack webhook URL" };
    }

    const existing = await prisma.slackIntegration.findFirst({
      where: { organizationId: auth.organizationId },
    });

    let config;
    if (existing) {
      config = await prisma.slackIntegration.update({
        where: { id: existing.id },
        data: {
          incomingWebhookUrl: data.webhookUrl,
        },
      });
    } else {
      config = await prisma.slackIntegration.create({
        data: {
          organizationId: auth.organizationId,
          teamId: "webhook-only",
          teamName: "Webhook",
          accessToken: "webhook-only",
          incomingWebhookUrl: data.webhookUrl,
          isActive: true,
        },
      });
    }

    const extendedConfig: SlackConfig = {
      id: config.id,
      organizationId: config.organizationId,
      teamId: config.teamId,
      teamName: config.teamName,
      isActive: config.isActive,
      incomingWebhookUrl: config.incomingWebhookUrl,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      webhookUrl: config.incomingWebhookUrl,
      channelName: data.channelName,
      isEnabled: config.isActive,
      notifyNewBooking: data.notifyNewBooking ?? true,
      notifyCancellation: data.notifyCancellation ?? true,
      notifyPayment: data.notifyPayment ?? true,
      notifyGalleryDelivery: data.notifyGalleryDelivery ?? false,
      notifyClientMessage: data.notifyClientMessage ?? false,
    };

    revalidatePath("/settings/slack");
    return { success: true, data: extendedConfig };
  } catch (error) {
    console.error("Error saving Slack config:", error);
    return { success: false, error: "Failed to save Slack configuration" };
  }
}

export async function toggleSlackIntegration(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.slackIntegration.findFirst({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return { success: false, error: "Slack integration not configured" };
    }

    await prisma.slackIntegration.update({
      where: { id: config.id },
      data: { isActive: !config.isActive },
    });

    revalidatePath("/settings/slack");
    return ok();
  } catch (error) {
    console.error("Error toggling Slack integration:", error);
    return { success: false, error: "Failed to toggle integration" };
  }
}

export async function testSlackConnection(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.slackIntegration.findFirst({
      where: { organizationId: auth.organizationId },
    });

    if (!config?.incomingWebhookUrl) {
      return { success: false, error: "Slack webhook not configured" };
    }

    // Send a test message to verify the webhook works
    const response = await fetch(config.incomingWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "✅ PhotoProOS connection test successful!",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*✅ PhotoProOS Connected*\nYour Slack integration is working correctly. You'll receive notifications for new bookings, payments, and cancellations.",
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to send test message to Slack" };
    }

    return ok();
  } catch (error) {
    console.error("Error testing Slack connection:", error);
    return { success: false, error: "Failed to test connection" };
  }
}

export async function deleteSlackIntegration(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.slackIntegration.deleteMany({
      where: { organizationId: auth.organizationId },
    });

    revalidatePath("/settings/slack");
    return ok();
  } catch (error) {
    console.error("Error deleting Slack integration:", error);
    return { success: false, error: "Failed to delete integration" };
  }
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

interface SlackBookingNotification {
  organizationId: string;
  bookingId: string;
  title: string;
  clientName: string | null;
  clientEmail: string | null;
  startTime: Date;
  endTime: Date;
  location?: string | null;
  serviceName?: string | null;
}

interface SlackPaymentNotification {
  organizationId: string;
  paymentId: string;
  amountCents: number;
  clientName: string | null;
  clientEmail: string | null;
  description?: string | null;
  invoiceNumber?: string | null;
}

interface SlackCancellationNotification {
  organizationId: string;
  bookingId: string;
  title: string;
  clientName: string | null;
  clientEmail: string | null;
  startTime: Date;
  reason?: string | null;
}

interface SlackGalleryDeliveryNotification {
  organizationId: string;
  galleryId: string;
  galleryName: string;
  clientName: string | null;
  clientEmail: string | null;
  photoCount: number;
  deliveryLink: string;
}

/**
 * Helper function to send a message to Slack webhook
 */
async function sendSlackMessage(
  webhookUrl: string,
  message: { text: string; blocks?: unknown[] }
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    return response.ok;
  } catch (error) {
    console.error("Error sending Slack message:", error);
    return false;
  }
}

/**
 * Get the Slack webhook URL for an organization
 */
async function getWebhookUrl(organizationId: string): Promise<string | null> {
  const config = await prisma.slackIntegration.findFirst({
    where: { organizationId, isActive: true },
    select: { incomingWebhookUrl: true },
  });
  return config?.incomingWebhookUrl || null;
}

/**
 * Format date for display
 */
function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Notify Slack of a new booking
 */
export async function notifySlackNewBooking(
  data: SlackBookingNotification
): Promise<void> {
  const webhookUrl = await getWebhookUrl(data.organizationId);
  if (!webhookUrl) return;

  const clientDisplay = data.clientName || data.clientEmail || "Unknown Client";
  const timeDisplay = `${formatDateTime(data.startTime)} - ${formatDateTime(data.endTime)}`;

  await sendSlackMessage(webhookUrl, {
    text: `📅 New Booking: ${data.title}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📅 New Booking",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Title:*\n${data.title}`,
          },
          {
            type: "mrkdwn",
            text: `*Client:*\n${clientDisplay}`,
          },
          {
            type: "mrkdwn",
            text: `*When:*\n${timeDisplay}`,
          },
          ...(data.location
            ? [
                {
                  type: "mrkdwn",
                  text: `*Location:*\n${data.location}`,
                },
              ]
            : []),
          ...(data.serviceName
            ? [
                {
                  type: "mrkdwn",
                  text: `*Service:*\n${data.serviceName}`,
                },
              ]
            : []),
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Booking ID: ${data.bookingId}`,
          },
        ],
      },
    ],
  });
}

/**
 * Notify Slack of a payment received
 */
export async function notifySlackPayment(
  data: SlackPaymentNotification
): Promise<void> {
  const webhookUrl = await getWebhookUrl(data.organizationId);
  if (!webhookUrl) return;

  const clientDisplay = data.clientName || data.clientEmail || "Unknown Client";
  const amountDisplay = formatCurrency(data.amountCents);

  await sendSlackMessage(webhookUrl, {
    text: `💰 Payment Received: ${amountDisplay}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "💰 Payment Received",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Amount:*\n${amountDisplay}`,
          },
          {
            type: "mrkdwn",
            text: `*Client:*\n${clientDisplay}`,
          },
          ...(data.invoiceNumber
            ? [
                {
                  type: "mrkdwn",
                  text: `*Invoice:*\n#${data.invoiceNumber}`,
                },
              ]
            : []),
          ...(data.description
            ? [
                {
                  type: "mrkdwn",
                  text: `*Description:*\n${data.description}`,
                },
              ]
            : []),
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Payment ID: ${data.paymentId}`,
          },
        ],
      },
    ],
  });
}

/**
 * Notify Slack of a booking cancellation
 */
export async function notifySlackCancellation(
  data: SlackCancellationNotification
): Promise<void> {
  const webhookUrl = await getWebhookUrl(data.organizationId);
  if (!webhookUrl) return;

  const clientDisplay = data.clientName || data.clientEmail || "Unknown Client";

  await sendSlackMessage(webhookUrl, {
    text: `❌ Booking Cancelled: ${data.title}`,
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
          {
            type: "mrkdwn",
            text: `*Title:*\n${data.title}`,
          },
          {
            type: "mrkdwn",
            text: `*Client:*\n${clientDisplay}`,
          },
          {
            type: "mrkdwn",
            text: `*Originally Scheduled:*\n${formatDateTime(data.startTime)}`,
          },
          ...(data.reason
            ? [
                {
                  type: "mrkdwn",
                  text: `*Reason:*\n${data.reason}`,
                },
              ]
            : []),
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Booking ID: ${data.bookingId}`,
          },
        ],
      },
    ],
  });
}

/**
 * Notify Slack of a gallery delivery
 */
export async function notifySlackGalleryDelivery(
  data: SlackGalleryDeliveryNotification
): Promise<void> {
  const webhookUrl = await getWebhookUrl(data.organizationId);
  if (!webhookUrl) return;

  const clientDisplay = data.clientName || data.clientEmail || "Unknown Client";

  await sendSlackMessage(webhookUrl, {
    text: `🖼️ Gallery Delivered: ${data.galleryName}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🖼️ Gallery Delivered",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Gallery:*\n${data.galleryName}`,
          },
          {
            type: "mrkdwn",
            text: `*Client:*\n${clientDisplay}`,
          },
          {
            type: "mrkdwn",
            text: `*Photos:*\n${data.photoCount} images`,
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Gallery",
              emoji: true,
            },
            url: data.deliveryLink,
            style: "primary",
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Gallery ID: ${data.galleryId}`,
          },
        ],
      },
    ],
  });
}
