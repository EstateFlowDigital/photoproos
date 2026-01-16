"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getGalleryHeatMapData, getGalleryDownloadAnalytics, getDownloadHistory } from "./download-tracking";
import { ok, fail } from "@/lib/types/action-result";

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

interface GalleryAnalyticsOverview {
  totalViews: number;
  uniqueVisitors: number;
  totalDownloads: number;
  totalFavorites: number;
  avgEngagementRate: number;
  deliveredAt: string | null;
  lastViewedAt: string | null;
}

interface PhotoEngagementData {
  id: string;
  filename: string;
  thumbnailUrl: string;
  downloads: number;
  favorites: number;
  rating: number | null;
  engagementScore: number; // Normalized 0-100 score for heat map
}

interface DownloadLogEntry {
  id: string;
  format: string;
  fileCount: number;
  clientEmail: string | null;
  createdAt: Date;
  assetFilename: string | null;
}

interface ViewingSession {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime: Date | null;
  pageViews: number;
  photosViewed: number;
  device: string | null;
  location: string | null;
}

// =============================================================================
// Gallery Analytics Actions
// =============================================================================

/**
 * Get comprehensive gallery analytics including heat map, download history, and sessions
 */
export async function getComprehensiveGalleryAnalytics(projectId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    // Fetch gallery with basic stats
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
      select: {
        id: true,
        name: true,
        viewCount: true,
        downloadCount: true,
        deliveredAt: true,
        status: true,
        _count: {
          select: {
            assets: true,
            favorites: true,
          },
        },
      },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Get heat map data, download analytics, and download history in parallel
    const [heatMapResult, downloadAnalyticsResult, downloadHistoryResult] = await Promise.all([
      getGalleryHeatMapData(projectId),
      getGalleryDownloadAnalytics(projectId),
      getDownloadHistory(projectId, { limit: 50 }),
    ]);

    // Get recent activity logs for this gallery
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        projectId,
        type: { in: ["gallery_viewed", "file_downloaded"] },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        type: true,
        createdAt: true,
        metadata: true,
      },
    });

    // Calculate unique sessions from activity logs
    const sessions = new Set<string>();
    let lastViewedAt: Date | null = null;

    for (const log of activityLogs) {
      const metadata = log.metadata as { sessionId?: string } | null;
      if (metadata?.sessionId) {
        sessions.add(metadata.sessionId);
      }
      if (log.type === "gallery_viewed") {
        if (!lastViewedAt || log.createdAt > lastViewedAt) {
          lastViewedAt = log.createdAt;
        }
      }
    }

    // Process heat map data into engagement scores
    const photoEngagement: PhotoEngagementData[] = [];
    if (heatMapResult.success && heatMapResult.data) {
      const maxDownloads = Math.max(...heatMapResult.data.photos.map((p) => p.downloads), 1);
      const maxFavorites = Math.max(...heatMapResult.data.photos.map((p) => p.favorites), 1);

      heatMapResult.data.photos.forEach((photo) => {
        // Calculate normalized engagement score (0-100)
        const downloadScore = (photo.downloads / maxDownloads) * 50;
        const favoriteScore = (photo.favorites / maxFavorites) * 30;
        const ratingScore = photo.rating ? (photo.rating / 5) * 20 : 0;
        const engagementScore = Math.min(100, Math.round(downloadScore + favoriteScore + ratingScore));

        photoEngagement.push({
          id: photo.id,
          filename: photo.filename,
          thumbnailUrl: photo.thumbnailUrl,
          downloads: photo.downloads,
          favorites: photo.favorites,
          rating: photo.rating,
          engagementScore,
        });
      });

      // Sort by engagement score descending
      photoEngagement.sort((a, b) => b.engagementScore - a.engagementScore);
    }

    // Process download history
    const downloadHistory: DownloadLogEntry[] = [];
    if (downloadHistoryResult.success && downloadHistoryResult.data) {
      // Get asset filenames for the downloads
      const assetIds = downloadHistoryResult.data.downloads
        .filter((d) => d.assetId)
        .map((d) => d.assetId as string);

      const assets = await prisma.asset.findMany({
        where: { id: { in: assetIds } },
        select: { id: true, filename: true },
      });

      const assetMap = new Map(assets.map((a) => [a.id, a.filename]));

      downloadHistoryResult.data.downloads.forEach((download) => {
        downloadHistory.push({
          id: download.id,
          format: download.format,
          fileCount: download.fileCount,
          clientEmail: download.clientEmail,
          createdAt: download.createdAt,
          assetFilename: download.assetId ? assetMap.get(download.assetId) || null : null,
        });
      });
    }

    // Calculate overview metrics
    const totalDownloads = downloadAnalyticsResult.success
      ? downloadAnalyticsResult.data?.totalDownloads || 0
      : gallery.downloadCount;

    const uniqueClients = downloadAnalyticsResult.success
      ? downloadAnalyticsResult.data?.uniqueClients || 0
      : sessions.size;

    const avgEngagementRate =
      gallery.viewCount > 0 ? Math.round((totalDownloads / gallery.viewCount) * 100) : 0;

    const overview: GalleryAnalyticsOverview = {
      totalViews: gallery.viewCount,
      uniqueVisitors: uniqueClients,
      totalDownloads,
      totalFavorites: gallery._count.favorites,
      avgEngagementRate,
      deliveredAt: gallery.deliveredAt?.toISOString() || null,
      lastViewedAt: lastViewedAt?.toISOString() || null,
    };

    // Get downloads by day for chart
    const downloadsByDay = downloadAnalyticsResult.success
      ? downloadAnalyticsResult.data?.downloadsByDay || []
      : [];

    // Get downloads by format for pie chart
    const downloadsByFormat = downloadAnalyticsResult.success
      ? downloadAnalyticsResult.data?.downloadsByFormat || {}
      : {};

    return {
      success: true,
      data: {
        overview,
        photoEngagement,
        downloadHistory,
        downloadsByDay,
        downloadsByFormat,
        photoCount: gallery._count.assets,
      },
    };
  } catch (error) {
    console.error("[Gallery Analytics] Error fetching analytics:", error);
    return fail("Failed to fetch gallery analytics");
  }
}

/**
 * Log a gallery view event
 */
export async function logGalleryView(
  projectId: string,
  data?: {
    sessionId?: string;
    device?: string;
    referrer?: string;
  }
) {
  try {
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Increment view count
    await prisma.project.update({
      where: { id: projectId },
      data: { viewCount: { increment: 1 } },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        organizationId: gallery.organizationId,
        projectId,
        type: "gallery_viewed",
        description: "Gallery viewed",
        metadata: {
          sessionId: data?.sessionId,
          device: data?.device,
          referrer: data?.referrer,
        },
      },
    });

    return ok();
  } catch (error) {
    console.error("[Gallery Analytics] Error logging view:", error);
    return fail("Failed to log view");
  }
}

/**
 * Log a photo view event (for heat map tracking)
 */
export async function logPhotoView(
  projectId: string,
  assetId: string,
  sessionId?: string
) {
  try {
    // Check if PhotoView table exists (might need migration)
    // For now, we'll update the activity log
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Log to activity
    await prisma.activityLog.create({
      data: {
        organizationId: gallery.organizationId,
        projectId,
        type: "photo_viewed",
        description: "Photo viewed",
        metadata: {
          assetId,
          sessionId,
        },
      },
    });

    return ok();
  } catch (error) {
    console.error("[Gallery Analytics] Error logging photo view:", error);
    return fail("Failed to log photo view");
  }
}

/**
 * Export gallery analytics as a detailed report
 */
export async function exportGalleryAnalyticsReport(
  projectId: string,
  format: "csv" | "json" = "csv"
) {
  const analyticsResult = await getComprehensiveGalleryAnalytics(projectId);

  if (!analyticsResult.success || !analyticsResult.data) {
    return fail("error" in analyticsResult ? analyticsResult.error : "Failed to fetch analytics");
  }

  const { overview, photoEngagement, downloadHistory, downloadsByDay, downloadsByFormat } =
    analyticsResult.data;

  if (format === "json") {
    return {
      success: true,
      data: JSON.stringify(
        {
          overview,
          photoEngagement,
          downloadHistory: downloadHistory.map((d) => ({
            ...d,
            createdAt: d.createdAt.toISOString(),
          })),
          downloadsByDay,
          downloadsByFormat,
        },
        null,
        2
      ),
      filename: `gallery-analytics-${projectId}.json`,
    };
  }

  // CSV format
  const sections: string[] = [];

  // Overview section
  sections.push("=== GALLERY ANALYTICS REPORT ===");
  sections.push("");
  sections.push("Overview");
  sections.push(`Total Views,${overview.totalViews}`);
  sections.push(`Unique Visitors,${overview.uniqueVisitors}`);
  sections.push(`Total Downloads,${overview.totalDownloads}`);
  sections.push(`Total Favorites,${overview.totalFavorites}`);
  sections.push(`Engagement Rate,${overview.avgEngagementRate}%`);
  sections.push(`Delivered At,${overview.deliveredAt || "Not delivered"}`);
  sections.push(`Last Viewed,${overview.lastViewedAt || "Never"}`);
  sections.push("");

  // Photo engagement section
  sections.push("Photo Engagement");
  sections.push("Filename,Downloads,Favorites,Rating,Engagement Score");
  photoEngagement.forEach((photo) => {
    sections.push(
      `"${photo.filename}",${photo.downloads},${photo.favorites},${photo.rating || "N/A"},${photo.engagementScore}`
    );
  });
  sections.push("");

  // Downloads by day
  sections.push("Downloads by Day");
  sections.push("Date,Count");
  downloadsByDay.forEach((day) => {
    sections.push(`${day.date},${day.count}`);
  });
  sections.push("");

  // Downloads by format
  sections.push("Downloads by Format");
  sections.push("Format,Count");
  Object.entries(downloadsByFormat).forEach(([format, count]) => {
    sections.push(`${format},${count}`);
  });
  sections.push("");

  // Download history
  sections.push("Download History");
  sections.push("Date,Format,File Count,Client Email,Filename");
  downloadHistory.forEach((download) => {
    sections.push(
      `${download.createdAt.toISOString()},${download.format},${download.fileCount},"${download.clientEmail || "Anonymous"}","${download.assetFilename || "Batch/ZIP"}"`
    );
  });

  return {
    success: true,
    data: sections.join("\n"),
    filename: `gallery-analytics-${projectId}.csv`,
  };
}
