"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// =============================================================================
// Types
// =============================================================================

interface LogDownloadInput {
  projectId: string;
  assetId?: string;
  format: "original" | "web_size" | "high_res" | "zip_all";
  fileCount?: number;
  totalBytes?: number;
  clientEmail?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DownloadAnalytics {
  totalDownloads: number;
  uniqueClients: number;
  downloadsByFormat: Record<string, number>;
  downloadsByDay: { date: string; count: number }[];
  topPhotos: { assetId: string; filename: string; count: number }[];
}

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
// Download Tracking Actions
// =============================================================================

/**
 * Log a download event
 */
export async function logDownload(input: LogDownloadInput) {
  try {
    // Get organization from project
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    await prisma.downloadLog.create({
      data: {
        organizationId: project.organizationId,
        projectId: input.projectId,
        assetId: input.assetId,
        format: input.format,
        fileCount: input.fileCount || 1,
        totalBytes: input.totalBytes ? BigInt(input.totalBytes) : null,
        clientEmail: input.clientEmail,
        sessionId: input.sessionId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    // Update project download count
    await prisma.project.update({
      where: { id: input.projectId },
      data: { downloadCount: { increment: input.fileCount || 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error("[Download Tracking] Error logging:", error);
    return { success: false, error: "Failed to log download" };
  }
}

/**
 * Get download analytics for a gallery
 */
export async function getGalleryDownloadAnalytics(
  projectId: string
): Promise<{ success: boolean; data?: DownloadAnalytics; error?: string }> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify gallery belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });

    if (!project) {
      return { success: false, error: "Gallery not found" };
    }

    // Get all downloads for this gallery
    const downloads = await prisma.downloadLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate analytics
    const totalDownloads = downloads.reduce((sum, d) => sum + d.fileCount, 0);

    // Unique clients (by email or sessionId)
    const uniqueIdentifiers = new Set<string>();
    downloads.forEach((d) => {
      if (d.clientEmail) uniqueIdentifiers.add(d.clientEmail);
      else if (d.sessionId) uniqueIdentifiers.add(d.sessionId);
    });
    const uniqueClients = uniqueIdentifiers.size;

    // Downloads by format
    const downloadsByFormat: Record<string, number> = {};
    downloads.forEach((d) => {
      downloadsByFormat[d.format] = (downloadsByFormat[d.format] || 0) + d.fileCount;
    });

    // Downloads by day (last 30 days)
    const downloadsByDay: { date: string; count: number }[] = [];
    const dayMap = new Map<string, number>();
    downloads.forEach((d) => {
      const dateKey = d.createdAt.toISOString().split("T")[0];
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + d.fileCount);
    });
    dayMap.forEach((count, date) => {
      downloadsByDay.push({ date, count });
    });
    downloadsByDay.sort((a, b) => a.date.localeCompare(b.date));

    // Top photos
    const photoMap = new Map<string, number>();
    downloads
      .filter((d) => d.assetId)
      .forEach((d) => {
        photoMap.set(d.assetId!, (photoMap.get(d.assetId!) || 0) + 1);
      });

    // Get asset filenames
    const assetIds = Array.from(photoMap.keys());
    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, filename: true },
    });

    const assetMap = new Map(assets.map((a) => [a.id, a.filename]));

    const topPhotos = Array.from(photoMap.entries())
      .map(([assetId, count]) => ({
        assetId,
        filename: assetMap.get(assetId) || "Unknown",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      success: true,
      data: {
        totalDownloads,
        uniqueClients,
        downloadsByFormat,
        downloadsByDay,
        topPhotos,
      },
    };
  } catch (error) {
    console.error("[Download Tracking] Error fetching analytics:", error);
    return { success: false, error: "Failed to fetch download analytics" };
  }
}

/**
 * Get download history for a gallery
 */
export async function getDownloadHistory(
  projectId: string,
  options?: { limit?: number; offset?: number }
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const [downloads, total] = await Promise.all([
      prisma.downloadLog.findMany({
        where: {
          projectId,
          organizationId,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.downloadLog.count({
        where: { projectId, organizationId },
      }),
    ]);

    return {
      success: true,
      data: {
        downloads,
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("[Download Tracking] Error fetching history:", error);
    return { success: false, error: "Failed to fetch download history" };
  }
}

/**
 * Export download history as CSV
 */
export async function exportDownloadHistory(projectId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const downloads = await prisma.downloadLog.findMany({
      where: { projectId, organizationId },
      orderBy: { createdAt: "desc" },
    });

    // Get asset filenames
    const assetIds = downloads
      .filter((d) => d.assetId)
      .map((d) => d.assetId!);

    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, filename: true },
    });

    const assetMap = new Map(assets.map((a) => [a.id, a.filename]));

    // Generate CSV
    const headers = [
      "Date",
      "Time",
      "Format",
      "File Count",
      "Photo",
      "Client Email",
      "IP Address",
    ];

    const rows = downloads.map((d) => [
      d.createdAt.toISOString().split("T")[0],
      d.createdAt.toISOString().split("T")[1].slice(0, 8),
      d.format,
      d.fileCount.toString(),
      d.assetId ? assetMap.get(d.assetId) || "" : "Batch/ZIP",
      d.clientEmail || "",
      d.ipAddress || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    return { success: true, data: csv };
  } catch (error) {
    console.error("[Download Tracking] Error exporting:", error);
    return { success: false, error: "Failed to export download history" };
  }
}

/**
 * Get organization-wide download stats
 */
export async function getOrganizationDownloadStats(
  dateRange?: { from: Date; to: Date }
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const where = {
      organizationId,
      ...(dateRange && {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      }),
    };

    const [totalDownloads, downloadsByProject] = await Promise.all([
      prisma.downloadLog.aggregate({
        where,
        _sum: { fileCount: true },
      }),
      prisma.downloadLog.groupBy({
        by: ["projectId"],
        where,
        _sum: { fileCount: true },
        orderBy: { _sum: { fileCount: "desc" } },
        take: 10,
      }),
    ]);

    // Get project names
    const projectIds = downloadsByProject.map((d) => d.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true },
    });

    const projectMap = new Map(projects.map((p) => [p.id, p.name]));

    return {
      success: true,
      data: {
        totalDownloads: totalDownloads._sum.fileCount || 0,
        topGalleries: downloadsByProject.map((d) => ({
          projectId: d.projectId,
          name: projectMap.get(d.projectId) || "Unknown",
          downloads: d._sum.fileCount || 0,
        })),
      },
    };
  } catch (error) {
    console.error("[Download Tracking] Error fetching org stats:", error);
    return { success: false, error: "Failed to fetch organization download stats" };
  }
}

/**
 * Get gallery heat map data - photo engagement for visualization
 */
export async function getGalleryHeatMapData(projectId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Verify gallery belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
      include: {
        assets: {
          select: {
            id: true,
            filename: true,
            thumbnailUrl: true,
            mediumUrl: true,
          },
        },
        favorites: {
          select: {
            assetId: true,
          },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Gallery not found" };
    }

    // Get download counts by asset
    const downloads = await prisma.downloadLog.findMany({
      where: {
        projectId,
        assetId: { not: null },
      },
      select: {
        assetId: true,
      },
    });

    // Get ratings by asset
    const ratings = await prisma.photoRating.findMany({
      where: {
        projectId,
      },
      select: {
        assetId: true,
        rating: true,
      },
    });

    // Aggregate data per photo
    const downloadCounts = new Map<string, number>();
    downloads.forEach((d) => {
      if (d.assetId) {
        downloadCounts.set(d.assetId, (downloadCounts.get(d.assetId) || 0) + 1);
      }
    });

    const favoriteCounts = new Map<string, number>();
    project.favorites.forEach((f) => {
      favoriteCounts.set(f.assetId, (favoriteCounts.get(f.assetId) || 0) + 1);
    });

    const ratingData = new Map<string, { sum: number; count: number }>();
    ratings.forEach((r) => {
      const existing = ratingData.get(r.assetId) || { sum: 0, count: 0 };
      ratingData.set(r.assetId, {
        sum: existing.sum + r.rating,
        count: existing.count + 1,
      });
    });

    // Build heat map data
    const heatMapData = project.assets.map((asset) => {
      const ratingInfo = ratingData.get(asset.id);
      const avgRating = ratingInfo ? ratingInfo.sum / ratingInfo.count : null;

      return {
        id: asset.id,
        filename: asset.filename,
        thumbnailUrl: asset.thumbnailUrl || asset.mediumUrl || "",
        views: 0, // Views aren't tracked per-photo currently
        downloads: downloadCounts.get(asset.id) || 0,
        favorites: favoriteCounts.get(asset.id) || 0,
        comments: 0, // Comments not tracked per-asset
        rating: avgRating,
      };
    });

    return {
      success: true,
      data: {
        galleryName: project.name,
        photos: heatMapData,
        summary: {
          totalPhotos: project.assets.length,
          totalDownloads: Array.from(downloadCounts.values()).reduce((a: number, b: number) => a + b, 0),
          totalFavorites: project.favorites.length,
          totalComments: 0, // Comments not tracked at project level
        },
      },
    };
  } catch (error) {
    console.error("[Download Tracking] Error fetching heat map data:", error);
    return { success: false, error: "Failed to fetch heat map data" };
  }
}
