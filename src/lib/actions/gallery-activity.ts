"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ok, fail, success } from "@/lib/types/action-result";

// =============================================================================
// Helper Functions
// =============================================================================

async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findFirst({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id || null;
}

// =============================================================================
// Types
// =============================================================================

type ActivityEventType =
  | "gallery_created"
  | "gallery_delivered"
  | "gallery_viewed"
  | "gallery_paid"
  | "photo_downloaded"
  | "batch_downloaded"
  | "photo_favorited"
  | "selection_submitted"
  | "photo_rated"
  | "comment_added";

interface ActivityTimelineEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    clientEmail?: string | null;
    photoFilename?: string | null;
    photoCount?: number;
    format?: string;
    rating?: number;
    amount?: number;
  };
}

// =============================================================================
// Gallery Activity Timeline
// =============================================================================

/**
 * Get activity timeline for a specific gallery
 * Combines ActivityLog, DownloadLog, and GalleryFavorite events
 */
export async function getGalleryActivityTimeline(
  projectId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  try {
    // Verify gallery belongs to organization
    const gallery = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: { id: true, name: true, createdAt: true, deliveredAt: true },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Fetch all activity sources in parallel
    const [activityLogs, downloadLogs, favorites, payments] = await Promise.all([
      // Activity logs for this project
      prisma.activityLog.findMany({
        where: {
          organizationId,
          projectId,
          type: {
            in: [
              "gallery_created",
              "gallery_delivered",
              "gallery_viewed",
              "gallery_paid",
              "selections_submitted",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          description: true,
          metadata: true,
          createdAt: true,
        },
      }),

      // Download logs
      prisma.downloadLog.findMany({
        where: {
          projectId,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          assetId: true,
          format: true,
          fileCount: true,
          clientEmail: true,
          createdAt: true,
        },
      }),

      // Favorites/selections
      prisma.galleryFavorite.findMany({
        where: {
          projectId,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          assetId: true,
          clientEmail: true,
          selectionType: true,
          status: true,
          submittedAt: true,
          createdAt: true,
          asset: {
            select: {
              filename: true,
            },
          },
        },
      }),

      // Payments for this gallery
      prisma.payment.findMany({
        where: {
          projectId,
          status: "paid",
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amountCents: true,
          clientEmail: true,
          createdAt: true,
        },
      }),
    ]);

    // Get asset filenames for downloads
    const assetIds = downloadLogs
      .map((d) => d.assetId)
      .filter((id): id is string => id !== null);

    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, filename: true },
    });
    const assetMap = new Map(assets.map((a) => [a.id, a.filename]));

    // Transform to unified timeline events
    const events: ActivityTimelineEvent[] = [];

    // Add activity log events
    for (const log of activityLogs) {
      const metadata = log.metadata as Record<string, unknown> | null;
      events.push({
        id: log.id,
        type: log.type as ActivityEventType,
        title: getActivityTitle(log.type),
        description: log.description,
        timestamp: log.createdAt,
        metadata: {
          clientEmail: metadata?.clientEmail as string | undefined,
        },
      });
    }

    // Add download events
    for (const download of downloadLogs) {
      const isBatch = !download.assetId;
      events.push({
        id: `download-${download.id}`,
        type: isBatch ? "batch_downloaded" : "photo_downloaded",
        title: isBatch
          ? `Downloaded ${download.fileCount} photos`
          : "Photo downloaded",
        description: isBatch
          ? `Batch download (${download.format})`
          : `${download.assetId ? assetMap.get(download.assetId) || "Photo" : "Photo"} downloaded`,
        timestamp: download.createdAt,
        metadata: {
          clientEmail: download.clientEmail,
          photoFilename: download.assetId
            ? assetMap.get(download.assetId)
            : null,
          photoCount: download.fileCount,
          format: download.format,
        },
      });
    }

    // Add favorite events (group by session to avoid spam)
    const favoritesBySession = new Map<
      string,
      { count: number; firstAt: Date; lastAt: Date; clientEmail: string | null }
    >();
    for (const fav of favorites) {
      const key = fav.clientEmail || fav.id;
      const existing = favoritesBySession.get(key);
      if (existing) {
        existing.count++;
        if (fav.createdAt < existing.firstAt) existing.firstAt = fav.createdAt;
        if (fav.createdAt > existing.lastAt) existing.lastAt = fav.createdAt;
      } else {
        favoritesBySession.set(key, {
          count: 1,
          firstAt: fav.createdAt,
          lastAt: fav.createdAt,
          clientEmail: fav.clientEmail,
        });
      }
    }

    for (const [key, data] of favoritesBySession) {
      events.push({
        id: `favorites-${key}`,
        type: "photo_favorited",
        title:
          data.count === 1
            ? "Photo favorited"
            : `${data.count} photos favorited`,
        description: data.clientEmail
          ? `by ${data.clientEmail}`
          : "by anonymous visitor",
        timestamp: data.lastAt,
        metadata: {
          clientEmail: data.clientEmail,
          photoCount: data.count,
        },
      });
    }

    // Add payment events
    for (const payment of payments) {
      events.push({
        id: `payment-${payment.id}`,
        type: "gallery_paid",
        title: "Payment received",
        description: `$${(payment.amountCents / 100).toFixed(2)} from ${payment.clientEmail || "client"}`,
        timestamp: payment.createdAt,
        metadata: {
          clientEmail: payment.clientEmail,
          amount: payment.amountCents,
        },
      });
    }

    // Sort all events by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const paginatedEvents = events.slice(offset, offset + limit);
    const hasMore = events.length > offset + limit;

    return success({
      events: paginatedEvents,
      total: events.length,
      hasMore,
    });
  } catch (error) {
    console.error("[Gallery Activity] Error fetching timeline:", error);
    return fail("Failed to fetch activity timeline");
  }
}

function getActivityTitle(type: string): string {
  switch (type) {
    case "gallery_created":
      return "Gallery created";
    case "gallery_delivered":
      return "Gallery delivered";
    case "gallery_viewed":
      return "Gallery viewed";
    case "gallery_paid":
      return "Payment received";
    case "selections_submitted":
      return "Selections submitted";
    default:
      return type.replace(/_/g, " ");
  }
}

/**
 * Get activity summary stats for a gallery
 */
export async function getGalleryActivitySummary(projectId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const [
      viewCount,
      downloadCount,
      favoriteCount,
      paymentTotal,
      uniqueClients,
    ] = await Promise.all([
      // Count views
      prisma.activityLog.count({
        where: {
          projectId,
          type: "gallery_viewed",
        },
      }),

      // Count downloads
      prisma.downloadLog.count({
        where: { projectId },
      }),

      // Count favorites
      prisma.galleryFavorite.count({
        where: { projectId },
      }),

      // Sum payments
      prisma.payment.aggregate({
        where: {
          projectId,
          status: "paid",
        },
        _sum: { amountCents: true },
      }),

      // Count unique clients
      prisma.downloadLog
        .findMany({
          where: {
            projectId,
            clientEmail: { not: null },
          },
          select: { clientEmail: true },
          distinct: ["clientEmail"],
        })
        .then((results) => results.length),
    ]);

    return success({
      views: viewCount,
      downloads: downloadCount,
      favorites: favoriteCount,
      revenue: paymentTotal._sum?.amountCents || 0,
      uniqueClients,
    });
  } catch (error) {
    console.error("[Gallery Activity] Error fetching summary:", error);
    return fail("Failed to fetch activity summary");
  }
}
