"use server";

import { db } from "@/lib/db";
import { isSuperAdmin, currentUser } from "@/lib/auth/super-admin";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";
import { randomBytes } from "crypto";
import type { CMSWebhook, CMSWebhookLog, CMSWebhookEvent } from "@prisma/client";
import { testWebhook, retryWebhook, getWebhookStats, cleanupWebhookLogs } from "@/lib/cms/webhooks";

/**
 * Generate a secure webhook secret
 */
function generateSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

/**
 * Get all webhooks
 */
export async function getWebhooks(): Promise<ActionResult<CMSWebhook[]>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const webhooks = await db.cMSWebhook.findMany({
      orderBy: { createdAt: "desc" },
    });

    return ok(webhooks);
  } catch (error) {
    console.error("Failed to get webhooks:", error);
    return fail("Failed to load webhooks");
  }
}

/**
 * Get a single webhook by ID
 */
export async function getWebhook(id: string): Promise<ActionResult<CMSWebhook>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const webhook = await db.cMSWebhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      return fail("Webhook not found");
    }

    return ok(webhook);
  } catch (error) {
    console.error("Failed to get webhook:", error);
    return fail("Failed to load webhook");
  }
}

/**
 * Create a new webhook
 */
export async function createWebhook(params: {
  name: string;
  description?: string;
  url: string;
  events: CMSWebhookEvent[];
  entityTypes?: string[];
  headers?: Record<string, string>;
}): Promise<ActionResult<CMSWebhook>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  const user = await currentUser();
  if (!user) {
    return fail("Not authenticated");
  }

  // Validate URL
  try {
    new URL(params.url);
  } catch {
    return fail("Invalid URL format");
  }

  // Validate events
  if (!params.events || params.events.length === 0) {
    return fail("At least one event must be selected");
  }

  try {
    const webhook = await db.cMSWebhook.create({
      data: {
        name: params.name,
        description: params.description,
        url: params.url,
        secret: generateSecret(),
        events: params.events,
        entityTypes: params.entityTypes || [],
        headers: params.headers || {},
        createdBy: user.id,
      },
    });

    return ok(webhook);
  } catch (error) {
    console.error("Failed to create webhook:", error);
    return fail("Failed to create webhook");
  }
}

/**
 * Update a webhook
 */
export async function updateWebhook(
  id: string,
  params: {
    name?: string;
    description?: string;
    url?: string;
    events?: CMSWebhookEvent[];
    entityTypes?: string[];
    headers?: Record<string, string>;
    isActive?: boolean;
  }
): Promise<ActionResult<CMSWebhook>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  // Validate URL if provided
  if (params.url) {
    try {
      new URL(params.url);
    } catch {
      return fail("Invalid URL format");
    }
  }

  // Validate events if provided
  if (params.events !== undefined && params.events.length === 0) {
    return fail("At least one event must be selected");
  }

  try {
    const webhook = await db.cMSWebhook.update({
      where: { id },
      data: {
        name: params.name,
        description: params.description,
        url: params.url,
        events: params.events,
        entityTypes: params.entityTypes,
        headers: params.headers,
        isActive: params.isActive,
      },
    });

    return ok(webhook);
  } catch (error) {
    console.error("Failed to update webhook:", error);
    return fail("Failed to update webhook");
  }
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(id: string): Promise<ActionResult<void>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    await db.cMSWebhook.delete({
      where: { id },
    });

    return ok(undefined);
  } catch (error) {
    console.error("Failed to delete webhook:", error);
    return fail("Failed to delete webhook");
  }
}

/**
 * Regenerate webhook secret
 */
export async function regenerateWebhookSecret(id: string): Promise<ActionResult<string>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const newSecret = generateSecret();

    await db.cMSWebhook.update({
      where: { id },
      data: { secret: newSecret },
    });

    return ok(newSecret);
  } catch (error) {
    console.error("Failed to regenerate secret:", error);
    return fail("Failed to regenerate secret");
  }
}

/**
 * Toggle webhook active status
 */
export async function toggleWebhookActive(id: string): Promise<ActionResult<boolean>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const webhook = await db.cMSWebhook.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!webhook) {
      return fail("Webhook not found");
    }

    const updated = await db.cMSWebhook.update({
      where: { id },
      data: { isActive: !webhook.isActive },
    });

    return ok(updated.isActive);
  } catch (error) {
    console.error("Failed to toggle webhook:", error);
    return fail("Failed to toggle webhook");
  }
}

/**
 * Get webhook logs
 */
export async function getWebhookLogs(params: {
  webhookId?: string;
  status?: CMSWebhookLog["status"];
  event?: CMSWebhookEvent;
  limit?: number;
  offset?: number;
}): Promise<ActionResult<{ logs: CMSWebhookLog[]; total: number }>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  const { webhookId, status, event, limit = 50, offset = 0 } = params;

  try {
    const where = {
      ...(webhookId && { webhookId }),
      ...(status && { status }),
      ...(event && { event }),
    };

    const [logs, total] = await Promise.all([
      db.cMSWebhookLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          webhook: {
            select: { name: true },
          },
        },
      }),
      db.cMSWebhookLog.count({ where }),
    ]);

    return ok({ logs, total });
  } catch (error) {
    console.error("Failed to get webhook logs:", error);
    return fail("Failed to load webhook logs");
  }
}

/**
 * Get a single webhook log by ID
 */
export async function getWebhookLog(id: string): Promise<ActionResult<CMSWebhookLog>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const log = await db.cMSWebhookLog.findUnique({
      where: { id },
      include: {
        webhook: {
          select: { name: true, url: true },
        },
      },
    });

    if (!log) {
      return fail("Log not found");
    }

    return ok(log);
  } catch (error) {
    console.error("Failed to get webhook log:", error);
    return fail("Failed to load webhook log");
  }
}

/**
 * Retry a failed webhook delivery
 */
export async function retryWebhookDelivery(logId: string): Promise<ActionResult<boolean>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const success = await retryWebhook(logId);
    return ok(success);
  } catch (error) {
    console.error("Failed to retry webhook:", error);
    return fail("Failed to retry webhook");
  }
}

/**
 * Test a webhook
 */
export async function testWebhookDelivery(webhookId: string): Promise<
  ActionResult<{
    success: boolean;
    status?: number;
    duration?: number;
    error?: string;
  }>
> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const result = await testWebhook(webhookId);
    return ok(result);
  } catch (error) {
    console.error("Failed to test webhook:", error);
    return fail("Failed to test webhook");
  }
}

/**
 * Get webhook statistics
 */
export async function getWebhookStatistics(webhookId: string): Promise<
  ActionResult<{
    totalSuccess: number;
    totalFailure: number;
    lastTriggeredAt: Date | null;
    last7Days: {
      success: number;
      failed: number;
      pending: number;
      retrying: number;
    };
    recentLogs: Array<{
      id: string;
      event: CMSWebhookEvent;
      status: CMSWebhookLog["status"];
      responseStatus: number | null;
      duration: number | null;
      error: string | null;
      createdAt: Date;
    }>;
  }>
> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const stats = await getWebhookStats(webhookId);
    return ok(stats);
  } catch (error) {
    console.error("Failed to get webhook stats:", error);
    return fail("Failed to load webhook statistics");
  }
}

/**
 * Clean up old webhook logs
 */
export async function cleanupOldWebhookLogs(): Promise<ActionResult<number>> {
  if (!(await isSuperAdmin())) {
    return fail("Unauthorized");
  }

  try {
    const count = await cleanupWebhookLogs();
    return ok(count);
  } catch (error) {
    console.error("Failed to cleanup logs:", error);
    return fail("Failed to cleanup logs");
  }
}

/**
 * Available webhook events with descriptions
 */
export const WEBHOOK_EVENTS: Array<{
  value: CMSWebhookEvent;
  label: string;
  description: string;
  category: string;
}> = [
  // Page events
  { value: "page_created", label: "Page Created", description: "When a new marketing page is created", category: "Pages" },
  { value: "page_updated", label: "Page Updated", description: "When a page's content is saved", category: "Pages" },
  { value: "page_published", label: "Page Published", description: "When a page goes live", category: "Pages" },
  { value: "page_unpublished", label: "Page Unpublished", description: "When a page is taken offline", category: "Pages" },
  { value: "page_deleted", label: "Page Deleted", description: "When a page is deleted", category: "Pages" },
  { value: "page_scheduled", label: "Page Scheduled", description: "When a page is scheduled for publishing", category: "Pages" },
  { value: "draft_saved", label: "Draft Saved", description: "When a draft is auto-saved", category: "Pages" },
  { value: "version_restored", label: "Version Restored", description: "When a previous version is restored", category: "Pages" },

  // FAQ events
  { value: "faq_created", label: "FAQ Created", description: "When a new FAQ is created", category: "FAQs" },
  { value: "faq_updated", label: "FAQ Updated", description: "When an FAQ is modified", category: "FAQs" },
  { value: "faq_deleted", label: "FAQ Deleted", description: "When an FAQ is deleted", category: "FAQs" },

  // Blog events
  { value: "blog_published", label: "Blog Published", description: "When a blog post goes live", category: "Blog" },
  { value: "blog_unpublished", label: "Blog Unpublished", description: "When a blog post is taken offline", category: "Blog" },

  // Approval events
  { value: "content_approved", label: "Content Approved", description: "When content is approved", category: "Workflow" },
  { value: "content_rejected", label: "Content Rejected", description: "When content is rejected", category: "Workflow" },
];
