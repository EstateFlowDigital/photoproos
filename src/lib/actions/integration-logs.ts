"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

// ============================================================================
// INTEGRATION LOG ACTIONS
// ============================================================================

/**
 * Integration providers
 */
export const INTEGRATION_PROVIDERS = [
  "google_calendar",
  "dropbox",
  "slack",
  "stripe",
  "quickbooks",
  "mailchimp",
  "google_drive",
  "calendly",
  "notion",
  "zapier",
] as const;

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

/**
 * Integration event types
 */
export const INTEGRATION_EVENT_TYPES = [
  "connected",
  "disconnected",
  "sync_started",
  "sync_completed",
  "sync_failed",
  "token_refreshed",
  "token_expired",
  "error",
  "webhook_received",
  "data_exported",
  "data_imported",
] as const;

export type IntegrationEventType = (typeof INTEGRATION_EVENT_TYPES)[number];

/**
 * Log an integration event (for internal use by other actions)
 */
export async function logIntegrationEvent(params: {
  organizationId: string;
  provider: IntegrationProvider | string;
  eventType: IntegrationEventType | string;
  message: string;
  details?: Record<string, unknown>;
}) {
  try {
    const log = await prisma.integrationLog.create({
      data: {
        organizationId: params.organizationId,
        provider: params.provider,
        eventType: params.eventType,
        message: params.message,
        ...(params.details !== undefined
          ? { details: params.details as Prisma.InputJsonValue }
          : {}),
      },
    });

    return { success: true, logId: log.id };
  } catch (error) {
    console.error("Failed to log integration event:", error);
    return { success: false, error: "Failed to log integration event" };
  }
}

/**
 * Get integration logs for the current organization
 */
export async function getIntegrationLogs(options?: {
  provider?: IntegrationProvider | string;
  eventType?: IntegrationEventType | string;
  limit?: number;
  offset?: number;
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

  try {
    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId: organization.id,
    };

    if (options?.provider) where.provider = options.provider;
    if (options?.eventType) where.eventType = options.eventType;

    const [logs, total] = await Promise.all([
      prisma.integrationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.integrationLog.count({ where }),
    ]);

    return { success: true, logs, total };
  } catch (error) {
    console.error("Failed to get integration logs:", error);
    return { success: false, error: "Failed to fetch integration logs" };
  }
}

/**
 * Get integration logs for a specific provider
 */
export async function getProviderLogs(
  provider: IntegrationProvider | string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  return getIntegrationLogs({
    provider,
    limit: options?.limit,
    offset: options?.offset,
  });
}

/**
 * Get recent activity summary across all integrations
 */
export async function getIntegrationActivitySummary() {
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get counts by provider
    const byProvider = await prisma.integrationLog.groupBy({
      by: ["provider"],
      where: {
        organizationId: organization.id,
        createdAt: { gte: sevenDaysAgo },
      },
      _count: { id: true },
    });

    // Get counts by event type
    const byEventType = await prisma.integrationLog.groupBy({
      by: ["eventType"],
      where: {
        organizationId: organization.id,
        createdAt: { gte: sevenDaysAgo },
      },
      _count: { id: true },
    });

    // Get error count
    const errorCount = await prisma.integrationLog.count({
      where: {
        organizationId: organization.id,
        eventType: "error",
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Get most recent logs
    const recentLogs = await prisma.integrationLog.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      success: true,
      summary: {
        byProvider: byProvider.map((p) => ({
          provider: p.provider,
          count: p._count.id,
        })),
        byEventType: byEventType.map((e) => ({
          eventType: e.eventType,
          count: e._count.id,
        })),
        errorCount,
        recentLogs,
      },
    };
  } catch (error) {
    console.error("Failed to get integration activity summary:", error);
    return { success: false, error: "Failed to fetch activity summary" };
  }
}

/**
 * Get the last sync status for each integration
 */
export async function getIntegrationSyncStatus() {
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
    // Get the most recent log for each provider
    const results: Record<string, { lastSync: Date | null; status: string; message: string }> = {};

    for (const provider of INTEGRATION_PROVIDERS) {
      const lastLog = await prisma.integrationLog.findFirst({
        where: {
          organizationId: organization.id,
          provider,
        },
        orderBy: { createdAt: "desc" },
      });

      if (lastLog) {
        results[provider] = {
          lastSync: lastLog.createdAt,
          status: lastLog.eventType,
          message: lastLog.message,
        };
      }
    }

    return { success: true, status: results };
  } catch (error) {
    console.error("Failed to get integration sync status:", error);
    return { success: false, error: "Failed to fetch sync status" };
  }
}

/**
 * Clear old integration logs (older than 30 days)
 */
export async function cleanupOldIntegrationLogs(organizationId: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.integrationLog.deleteMany({
      where: {
        organizationId,
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    return { success: true, deletedCount: result.count };
  } catch (error) {
    console.error("Failed to cleanup old integration logs:", error);
    return { success: false, error: "Failed to cleanup old logs" };
  }
}
