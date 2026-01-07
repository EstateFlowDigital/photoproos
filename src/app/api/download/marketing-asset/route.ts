import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { singleDownloadRatelimit, checkRateLimit, getClientIP } from "@/lib/ratelimit";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/storage";
import { getClientSession } from "@/lib/actions/client-auth";

/**
 * GET /api/download/marketing-asset
 *
 * Downloads a single marketing asset.
 * Query params: id (required)
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(singleDownloadRatelimit, clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many download requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(rateLimitResult.remaining || 0),
            "X-RateLimit-Reset": String(rateLimitResult.reset || 0),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("id");

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Get the marketing asset with its property website and project
    const asset = await prisma.marketingAsset.findUnique({
      where: { id: assetId },
      include: {
        propertyWebsite: {
          include: {
            project: {
              select: {
                id: true,
                clientId: true,
                organizationId: true,
              },
            },
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    if (asset.status !== "ready") {
      return NextResponse.json(
        { error: "Asset is not available for download" },
        { status: 400 }
      );
    }

    // Authorization: Check if the client has access
    const clientSession = await getClientSession();
    if (!clientSession || asset.propertyWebsite?.project?.clientId !== clientSession.clientId) {
      return NextResponse.json(
        { error: "Unauthorized to download this asset" },
        { status: 403 }
      );
    }

    // Get the file URL
    const key = extractKeyFromUrl(asset.fileUrl);
    const isDirectUrl = asset.fileUrl.startsWith("http");

    let fetchUrl = asset.fileUrl;

    // If it's a storage key, generate a signed URL
    if (key && !isDirectUrl) {
      fetchUrl = await generatePresignedDownloadUrl(key, 300);
    } else if (key && isDirectUrl) {
      // Try to generate signed URL for S3 URLs
      try {
        fetchUrl = await generatePresignedDownloadUrl(key, 300);
      } catch {
        // Fall back to direct URL
        fetchUrl = asset.fileUrl;
      }
    }

    // Fetch the file
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch asset file" },
        { status: 502 }
      );
    }

    // Get content type and determine filename
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    let filename = asset.name;

    // Add extension if not present
    if (!filename.includes(".")) {
      if (contentType.includes("pdf")) {
        filename += ".pdf";
      } else if (contentType.includes("png")) {
        filename += ".png";
      } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
        filename += ".jpg";
      } else if (contentType.includes("gif")) {
        filename += ".gif";
      } else if (contentType.includes("webp")) {
        filename += ".webp";
      } else if (contentType.includes("mp4")) {
        filename += ".mp4";
      } else if (contentType.includes("webm")) {
        filename += ".webm";
      }
    }

    // Get the file data
    const arrayBuffer = await response.arrayBuffer();

    // Record analytics (fire and forget)
    if (asset.propertyWebsite?.project) {
      prisma.activityLog.create({
        data: {
          organizationId: asset.propertyWebsite.project.organizationId,
          type: "file_downloaded",
          description: `Marketing asset downloaded: ${asset.name}`,
          projectId: asset.propertyWebsite.project.id,
          metadata: {
            assetId: asset.id,
            assetType: asset.type,
            assetName: asset.name,
          },
        },
      }).catch(err => {
        console.error("Failed to record download analytics:", err);
      });
    }

    // Return the file
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("[Marketing Asset Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to download asset" },
      { status: 500 }
    );
  }
}
