"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { ok } from "@/lib/types/action-result";

// ============================================================================
// WEBHOOK ENDPOINT ACTIONS
// ============================================================================

/**
 * Available webhook event types
 */
export const WEBHOOK_EVENT_TYPES = [
  // Gallery events
  { id: "gallery_created", label: "Gallery Created", category: "Gallery" },
  { id: "gallery_delivered", label: "Gallery Delivered", category: "Gallery" },
  { id: "gallery_viewed", label: "Gallery Viewed", category: "Gallery" },
  { id: "gallery_paid", label: "Gallery Paid", category: "Gallery" },
  // Booking events
  { id: "booking_created", label: "Booking Created", category: "Booking" },
  { id: "booking_confirmed", label: "Booking Confirmed", category: "Booking" },
  { id: "booking_cancelled", label: "Booking Cancelled", category: "Booking" },
  { id: "booking_completed", label: "Booking Completed", category: "Booking" },
  // Invoice events
  { id: "invoice_created", label: "Invoice Created", category: "Invoice" },
  { id: "invoice_sent", label: "Invoice Sent", category: "Invoice" },
  { id: "invoice_paid", label: "Invoice Paid", category: "Invoice" },
  { id: "invoice_overdue", label: "Invoice Overdue", category: "Invoice" },
  // Payment events
  { id: "payment_received", label: "Payment Received", category: "Payment" },
  { id: "payment_failed", label: "Payment Failed", category: "Payment" },
  { id: "payment_refunded", label: "Payment Refunded", category: "Payment" },
  // Client events
  { id: "client_created", label: "Client Created", category: "Client" },
  { id: "client_updated", label: "Client Updated", category: "Client" },
  // Contract events
  { id: "contract_sent", label: "Contract Sent", category: "Contract" },
  { id: "contract_signed", label: "Contract Signed", category: "Contract" },
  // Project events
  { id: "project_created", label: "Project Created", category: "Project" },
  { id: "project_completed", label: "Project Completed", category: "Project" },
] as const;

export type WebhookEventId = (typeof WEBHOOK_EVENT_TYPES)[number]["id"];

/**
 * Generate a cryptographically secure webhook signing secret
 */
function generateWebhookSecret(): string {
  const bytes = crypto.randomBytes(24);
  return `whsec_${bytes.toString("base64url")}`;
}

/**
 * Get all webhook endpoints for the current organization
 */
export async function getWebhookEndpoints() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        description: true,
        events: true,
        isActive: true,
        lastDeliveryAt: true,
        failureCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    });

    return { success: true, webhooks };
  } catch (error) {
    console.error("Failed to get webhook endpoints:", error);
    return { success: false, error: "Failed to fetch webhook endpoints" };
  }
}

/**
 * Create a new webhook endpoint
 */
export async function createWebhookEndpoint(params: {
  url: string;
  description?: string;
  events: string[];
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  // Validate URL
  try {
    const url = new URL(params.url);
    if (!["https:", "http:"].includes(url.protocol)) {
      return { success: false, error: "URL must use HTTP or HTTPS" };
    }
  } catch {
    return { success: false, error: "Invalid URL format" };
  }

  // Validate events
  if (!params.events || params.events.length === 0) {
    return { success: false, error: "At least one event must be selected" };
  }

  const validEventIds = WEBHOOK_EVENT_TYPES.map((e) => e.id);
  const invalidEvents = params.events.filter((e) => !validEventIds.includes(e as WebhookEventId));
  if (invalidEvents.length > 0) {
    return { success: false, error: `Invalid events: ${invalidEvents.join(", ")}` };
  }

  try {
    const secret = generateWebhookSecret();

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        organizationId: organization.id,
        url: params.url,
        description: params.description,
        secret,
        events: params.events,
      },
    });

    revalidatePath("/settings/integrations");

    // Return the secret ONLY on creation - this is the only time it's visible
    return {
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        description: webhook.description,
        events: webhook.events,
        secret, // Only returned once, on creation
        createdAt: webhook.createdAt,
      },
    };
  } catch (error) {
    console.error("Failed to create webhook endpoint:", error);
    return { success: false, error: "Failed to create webhook endpoint" };
  }
}

/**
 * Update a webhook endpoint
 */
export async function updateWebhookEndpoint(
  webhookId: string,
  params: {
    url?: string;
    description?: string;
    events?: string[];
    isActive?: boolean;
  }
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify the webhook belongs to this organization
    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.organizationId !== organization.id) {
      return { success: false, error: "Webhook endpoint not found" };
    }

    // Validate URL if provided
    if (params.url) {
      try {
        const url = new URL(params.url);
        if (!["https:", "http:"].includes(url.protocol)) {
          return { success: false, error: "URL must use HTTP or HTTPS" };
        }
      } catch {
        return { success: false, error: "Invalid URL format" };
      }
    }

    // Validate events if provided
    if (params.events) {
      if (params.events.length === 0) {
        return { success: false, error: "At least one event must be selected" };
      }
      const validEventIds = WEBHOOK_EVENT_TYPES.map((e) => e.id);
      const invalidEvents = params.events.filter((e) => !validEventIds.includes(e as WebhookEventId));
      if (invalidEvents.length > 0) {
        return { success: false, error: `Invalid events: ${invalidEvents.join(", ")}` };
      }
    }

    const updated = await prisma.webhookEndpoint.update({
      where: { id: webhookId },
      data: {
        url: params.url,
        description: params.description,
        events: params.events,
        isActive: params.isActive,
      },
    });

    revalidatePath("/settings/integrations");
    return { success: true, webhook: updated };
  } catch (error) {
    console.error("Failed to update webhook endpoint:", error);
    return { success: false, error: "Failed to update webhook endpoint" };
  }
}

/**
 * Delete a webhook endpoint
 */
export async function deleteWebhookEndpoint(webhookId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify the webhook belongs to this organization
    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.organizationId !== organization.id) {
      return { success: false, error: "Webhook endpoint not found" };
    }

    await prisma.webhookEndpoint.delete({
      where: { id: webhookId },
    });

    revalidatePath("/settings/integrations");
    return ok();
  } catch (error) {
    console.error("Failed to delete webhook endpoint:", error);
    return { success: false, error: "Failed to delete webhook endpoint" };
  }
}

/**
 * Regenerate webhook signing secret
 */
export async function regenerateWebhookSecret(webhookId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify the webhook belongs to this organization
    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.organizationId !== organization.id) {
      return { success: false, error: "Webhook endpoint not found" };
    }

    const newSecret = generateWebhookSecret();

    await prisma.webhookEndpoint.update({
      where: { id: webhookId },
      data: { secret: newSecret },
    });

    revalidatePath("/settings/integrations");
    return { success: true, secret: newSecret };
  } catch (error) {
    console.error("Failed to regenerate webhook secret:", error);
    return { success: false, error: "Failed to regenerate webhook secret" };
  }
}

/**
 * Test a webhook endpoint by sending a test payload
 */
export async function testWebhookEndpoint(webhookId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify the webhook belongs to this organization
    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.organizationId !== organization.id) {
      return { success: false, error: "Webhook endpoint not found" };
    }

    // Create test payload
    const testPayload = {
      type: "test.webhook",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook from PhotoProOS",
        organizationId: organization.id,
        webhookEndpointId: webhook.id,
      },
    };

    // Sign the payload
    const payloadString = JSON.stringify(testPayload);
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payloadString}`;
    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(signedPayload)
      .digest("hex");

    // Send the webhook
    const startTime = Date.now();
    let responseStatus: number | undefined;
    let responseBody: string | undefined;
    let success = false;
    let errorMessage: string | undefined;

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": `t=${timestamp},v1=${signature}`,
          "X-Webhook-ID": webhook.id,
        },
        body: payloadString,
      });

      responseStatus = response.status;
      responseBody = await response.text().catch(() => "");

      // Truncate response body if too large
      if (responseBody && responseBody.length > 1000) {
        responseBody = responseBody.substring(0, 1000) + "... (truncated)";
      }

      success = response.ok;
    } catch (fetchError) {
      errorMessage = fetchError instanceof Error ? fetchError.message : "Connection failed";
    }

    const duration = Date.now() - startTime;

    // Record the delivery attempt
    await prisma.webhookDelivery.create({
      data: {
        webhookEndpointId: webhook.id,
        eventType: "test.webhook",
        payload: testPayload,
        responseStatus,
        responseBody,
        success,
        errorMessage,
        deliveredAt: success ? new Date() : null,
      },
    });

    // Update webhook stats
    await prisma.webhookEndpoint.update({
      where: { id: webhookId },
      data: {
        lastDeliveryAt: new Date(),
        failureCount: success ? 0 : webhook.failureCount + 1,
      },
    });

    revalidatePath("/settings/integrations");

    return {
      success: true,
      result: {
        delivered: success,
        duration,
        status: responseStatus,
        error: errorMessage,
      },
    };
  } catch (error) {
    console.error("Failed to test webhook:", error);
    return { success: false, error: "Failed to test webhook" };
  }
}

/**
 * Get webhook delivery history
 */
export async function getWebhookDeliveries(
  webhookId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify the webhook belongs to this organization
    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.organizationId !== organization.id) {
      return { success: false, error: "Webhook endpoint not found" };
    }

    const [deliveries, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where: { webhookEndpointId: webhookId },
        orderBy: { createdAt: "desc" },
        take: options?.limit || 20,
        skip: options?.offset || 0,
        select: {
          id: true,
          eventType: true,
          responseStatus: true,
          success: true,
          errorMessage: true,
          attemptCount: true,
          createdAt: true,
          deliveredAt: true,
        },
      }),
      prisma.webhookDelivery.count({
        where: { webhookEndpointId: webhookId },
      }),
    ]);

    return { success: true, deliveries, total };
  } catch (error) {
    console.error("Failed to get webhook deliveries:", error);
    return { success: false, error: "Failed to fetch webhook deliveries" };
  }
}

/**
 * Get a single webhook delivery with full payload details
 */
export async function getWebhookDelivery(deliveryId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        endpoint: {
          select: {
            organizationId: true,
            url: true,
          },
        },
      },
    });

    if (!delivery || delivery.endpoint.organizationId !== organization.id) {
      return { success: false, error: "Webhook delivery not found" };
    }

    return { success: true, delivery };
  } catch (error) {
    console.error("Failed to get webhook delivery:", error);
    return { success: false, error: "Failed to fetch webhook delivery" };
  }
}

// ============================================================================
// WEBHOOK DISPATCH (For internal use by other actions)
// ============================================================================

/**
 * Dispatch a webhook event to all subscribed endpoints
 * This is called internally when events occur (e.g., gallery created, payment received)
 */
export async function dispatchWebhookEvent(
  organizationId: string,
  eventType: WebhookEventId,
  payload: Record<string, unknown>
) {
  try {
    // Find all active endpoints subscribed to this event
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        organizationId,
        isActive: true,
        events: { has: eventType },
      },
    });

    if (endpoints.length === 0) {
      return { success: true, dispatched: 0 };
    }

    // Prepare the webhook payload
    const webhookPayload: Prisma.InputJsonObject = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data: payload as Prisma.InputJsonValue,
    };

    // Send to all endpoints in parallel
    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const payloadString = JSON.stringify(webhookPayload);
        const timestamp = Math.floor(Date.now() / 1000);
        const signedPayload = `${timestamp}.${payloadString}`;
        const signature = crypto
          .createHmac("sha256", endpoint.secret)
          .update(signedPayload)
          .digest("hex");

        let responseStatus: number | undefined;
        let responseBody: string | undefined;
        let success = false;
        let errorMessage: string | undefined;

        try {
          const response = await fetch(endpoint.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Signature": `t=${timestamp},v1=${signature}`,
              "X-Webhook-ID": endpoint.id,
            },
            body: payloadString,
          });

          responseStatus = response.status;
          responseBody = await response.text().catch(() => "");

          if (responseBody && responseBody.length > 1000) {
            responseBody = responseBody.substring(0, 1000) + "... (truncated)";
          }

          success = response.ok;
        } catch (fetchError) {
          errorMessage = fetchError instanceof Error ? fetchError.message : "Connection failed";
        }

        // Record the delivery
        await prisma.webhookDelivery.create({
          data: {
            webhookEndpointId: endpoint.id,
            eventType,
            payload: webhookPayload,
            responseStatus,
            responseBody,
            success,
            errorMessage,
            deliveredAt: success ? new Date() : null,
          },
        });

        // Update endpoint stats
        await prisma.webhookEndpoint.update({
          where: { id: endpoint.id },
          data: {
            lastDeliveryAt: new Date(),
            failureCount: success ? 0 : { increment: 1 },
          },
        });

        return { endpointId: endpoint.id, success };
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    return {
      success: true,
      dispatched: endpoints.length,
      successful: successCount,
    };
  } catch (error) {
    console.error("Failed to dispatch webhook event:", error);
    return { success: false, error: "Failed to dispatch webhook event" };
  }
}
