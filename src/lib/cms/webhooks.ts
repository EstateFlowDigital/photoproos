"use server";

import { db } from "@/lib/db";
import { createHmac } from "crypto";
import type { CMSWebhookEvent, WebhookLogStatus } from "@prisma/client";

/**
 * Webhook payload structure
 */
interface WebhookPayload {
  event: CMSWebhookEvent;
  timestamp: string;
  data: {
    entityType: string;
    entityId: string;
    entityName?: string;
    action: string;
    changes?: Record<string, unknown>;
    actor?: {
      id: string;
      name: string;
    };
  };
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Dispatch webhooks for a CMS event
 */
export async function dispatchWebhooks(params: {
  event: CMSWebhookEvent;
  entityType: string;
  entityId: string;
  entityName?: string;
  changes?: Record<string, unknown>;
  actorId?: string;
  actorName?: string;
}): Promise<{ dispatched: number; failed: number }> {
  const { event, entityType, entityId, entityName, changes, actorId, actorName } = params;

  // Find all active webhooks that subscribe to this event
  const webhooks = await db.cMSWebhook.findMany({
    where: {
      isActive: true,
      events: { has: event },
      OR: [
        { entityTypes: { isEmpty: true } },
        { entityTypes: { has: entityType } },
      ],
    },
  });

  if (webhooks.length === 0) {
    return { dispatched: 0, failed: 0 };
  }

  // Build payload
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: {
      entityType,
      entityId,
      entityName,
      action: event.replace(/_/g, " "),
      changes,
      actor: actorId && actorName ? { id: actorId, name: actorName } : undefined,
    },
  };

  const payloadString = JSON.stringify(payload);

  let dispatched = 0;
  let failed = 0;

  // Send to each webhook
  await Promise.all(
    webhooks.map(async (webhook) => {
      const signature = generateSignature(payloadString, webhook.secret);

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Webhook-Event": event,
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": payload.timestamp,
        ...(webhook.headers as Record<string, string> || {}),
      };

      // Create log entry
      const log = await db.cMSWebhookLog.create({
        data: {
          webhookId: webhook.id,
          event,
          entityType,
          entityId,
          entityName,
          requestUrl: webhook.url,
          requestHeaders: headers,
          requestBody: payload,
          status: "pending",
        },
      });

      const startTime = Date.now();

      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: payloadString,
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        const duration = Date.now() - startTime;
        const responseBody = await response.text().catch(() => null);

        if (response.ok) {
          // Success
          await db.cMSWebhookLog.update({
            where: { id: log.id },
            data: {
              status: "success",
              responseStatus: response.status,
              responseBody: responseBody?.substring(0, 10000), // Limit response size
              duration,
            },
          });

          await db.cMSWebhook.update({
            where: { id: webhook.id },
            data: {
              lastTriggeredAt: new Date(),
              successCount: { increment: 1 },
            },
          });

          dispatched++;
        } else {
          // HTTP error
          await db.cMSWebhookLog.update({
            where: { id: log.id },
            data: {
              status: "failed",
              responseStatus: response.status,
              responseBody: responseBody?.substring(0, 10000),
              duration,
              error: `HTTP ${response.status}: ${response.statusText}`,
            },
          });

          await db.cMSWebhook.update({
            where: { id: webhook.id },
            data: {
              lastTriggeredAt: new Date(),
              failureCount: { increment: 1 },
            },
          });

          failed++;
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        await db.cMSWebhookLog.update({
          where: { id: log.id },
          data: {
            status: "failed",
            duration,
            error: errorMessage,
          },
        });

        await db.cMSWebhook.update({
          where: { id: webhook.id },
          data: {
            lastTriggeredAt: new Date(),
            failureCount: { increment: 1 },
          },
        });

        failed++;
      }
    })
  );

  return { dispatched, failed };
}

/**
 * Retry a failed webhook
 */
export async function retryWebhook(logId: string): Promise<boolean> {
  const log = await db.cMSWebhookLog.findUnique({
    where: { id: logId },
    include: { webhook: true },
  });

  if (!log || log.status === "success") {
    return false;
  }

  if (log.retryCount >= 3) {
    return false; // Max retries reached
  }

  // Update status to retrying
  await db.cMSWebhookLog.update({
    where: { id: logId },
    data: {
      status: "retrying",
      retryCount: { increment: 1 },
    },
  });

  const startTime = Date.now();
  const payloadString = JSON.stringify(log.requestBody);

  try {
    const response = await fetch(log.requestUrl, {
      method: "POST",
      headers: log.requestHeaders as Record<string, string>,
      body: payloadString,
      signal: AbortSignal.timeout(30000),
    });

    const duration = Date.now() - startTime;
    const responseBody = await response.text().catch(() => null);

    if (response.ok) {
      await db.cMSWebhookLog.update({
        where: { id: logId },
        data: {
          status: "success",
          responseStatus: response.status,
          responseBody: responseBody?.substring(0, 10000),
          duration,
          error: null,
        },
      });

      await db.cMSWebhook.update({
        where: { id: log.webhookId },
        data: { successCount: { increment: 1 } },
      });

      return true;
    } else {
      await db.cMSWebhookLog.update({
        where: { id: logId },
        data: {
          status: "failed",
          responseStatus: response.status,
          responseBody: responseBody?.substring(0, 10000),
          duration,
          error: `HTTP ${response.status}: ${response.statusText}`,
        },
      });

      return false;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await db.cMSWebhookLog.update({
      where: { id: logId },
      data: {
        status: "failed",
        duration,
        error: errorMessage,
      },
    });

    return false;
  }
}

/**
 * Verify webhook signature from incoming request
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = generateSignature(payload, secret);
  return signature === expectedSignature;
}

/**
 * Get webhook delivery stats
 */
export async function getWebhookStats(webhookId: string) {
  const [webhook, recentLogs, statusCounts] = await Promise.all([
    db.cMSWebhook.findUnique({
      where: { id: webhookId },
      select: {
        successCount: true,
        failureCount: true,
        lastTriggeredAt: true,
      },
    }),
    db.cMSWebhookLog.findMany({
      where: { webhookId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        event: true,
        status: true,
        responseStatus: true,
        duration: true,
        error: true,
        createdAt: true,
      },
    }),
    db.cMSWebhookLog.groupBy({
      by: ["status"],
      where: {
        webhookId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      _count: true,
    }),
  ]);

  const statusMap = statusCounts.reduce(
    (acc, { status, _count }) => {
      acc[status] = _count;
      return acc;
    },
    {} as Record<WebhookLogStatus, number>
  );

  return {
    totalSuccess: webhook?.successCount || 0,
    totalFailure: webhook?.failureCount || 0,
    lastTriggeredAt: webhook?.lastTriggeredAt,
    last7Days: {
      success: statusMap.success || 0,
      failed: statusMap.failed || 0,
      pending: statusMap.pending || 0,
      retrying: statusMap.retrying || 0,
    },
    recentLogs,
  };
}

/**
 * Clean up old webhook logs (older than 30 days)
 */
export async function cleanupWebhookLogs(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await db.cMSWebhookLog.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
    },
  });

  return result.count;
}

/**
 * Test a webhook by sending a test event
 */
export async function testWebhook(webhookId: string): Promise<{
  success: boolean;
  status?: number;
  duration?: number;
  error?: string;
}> {
  const webhook = await db.cMSWebhook.findUnique({
    where: { id: webhookId },
  });

  if (!webhook) {
    return { success: false, error: "Webhook not found" };
  }

  const payload: WebhookPayload = {
    event: "page_updated" as CMSWebhookEvent,
    timestamp: new Date().toISOString(),
    data: {
      entityType: "test",
      entityId: "test-123",
      entityName: "Test Webhook Delivery",
      action: "test",
    },
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, webhook.secret);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Webhook-Event": "test",
    "X-Webhook-Signature": signature,
    "X-Webhook-Timestamp": payload.timestamp,
    ...(webhook.headers as Record<string, string> || {}),
  };

  const startTime = Date.now();

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout for test
    });

    const duration = Date.now() - startTime;

    return {
      success: response.ok,
      status: response.status,
      duration,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
