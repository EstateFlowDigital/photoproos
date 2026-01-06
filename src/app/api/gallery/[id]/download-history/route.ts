/**
 * Client Download History API
 *
 * Allows clients to view their download history for a gallery.
 * Uses session ID or email to identify the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Get client identifier from query params
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");
    const clientEmail = searchParams.get("email");

    if (!sessionId && !clientEmail) {
      return NextResponse.json(
        { error: "Session ID or email required" },
        { status: 400 }
      );
    }

    // Verify gallery exists and is accessible
    const gallery = await prisma.project.findFirst({
      where: {
        id: projectId,
        status: "delivered",
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Build where clause based on available identifiers
    const whereClause: {
      projectId: string;
      sessionId?: string;
      clientEmail?: string;
    } = {
      projectId,
    };

    if (sessionId) {
      whereClause.sessionId = sessionId;
    }
    if (clientEmail) {
      whereClause.clientEmail = clientEmail;
    }

    // Fetch download history for this client
    const downloads = await prisma.downloadLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        assetId: true,
        format: true,
        fileCount: true,
        createdAt: true,
      },
    });

    // Get asset details for single-file downloads
    const assetIds = downloads
      .map((d) => d.assetId)
      .filter((id): id is string => id !== null);

    const assets = await prisma.asset.findMany({
      where: {
        id: { in: assetIds },
      },
      select: {
        id: true,
        filename: true,
        thumbnailUrl: true,
      },
    });

    const assetMap = new Map(assets.map((a) => [a.id, a]));

    // Combine download history with asset details
    const downloadHistory = downloads.map((download) => ({
      id: download.id,
      type: download.assetId ? "single" : "batch",
      filename: download.assetId
        ? assetMap.get(download.assetId)?.filename || "Unknown file"
        : `${download.fileCount} photos`,
      thumbnailUrl: download.assetId
        ? assetMap.get(download.assetId)?.thumbnailUrl
        : null,
      format: download.format,
      fileCount: download.fileCount,
      downloadedAt: download.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      galleryName: gallery.name,
      downloads: downloadHistory,
    });
  } catch (error) {
    console.error("[Download History] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch download history" },
      { status: 500 }
    );
  }
}
