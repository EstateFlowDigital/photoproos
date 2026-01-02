import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePresignedDownloadUrl } from "@/lib/storage/r2";

/**
 * GET /api/download/[assetId]
 *
 * Downloads a single photo from a gallery.
 * Verifies payment status and gallery access before allowing download.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Get the asset with its gallery and payment info
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        project: {
          include: {
            payments: {
              where: { status: "paid" },
              take: 1,
            },
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    const gallery = asset.project;

    // Check if gallery is expired
    if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This gallery has expired" },
        { status: 403 }
      );
    }

    // Check if downloads are allowed
    if (!gallery.allowDownloads) {
      return NextResponse.json(
        { error: "Downloads are not enabled for this gallery" },
        { status: 403 }
      );
    }

    // Check payment status (if gallery has a price)
    const isPaid = gallery.payments.length > 0;
    const isFree = !gallery.priceCents || gallery.priceCents === 0;

    if (!isFree && !isPaid) {
      return NextResponse.json(
        { error: "Payment required to download photos" },
        { status: 402 }
      );
    }

    // Extract the key from the originalUrl
    // URL format: https://bucket.r2.dev/key or custom domain/key
    const originalUrl = asset.originalUrl;
    let key: string;

    if (originalUrl.includes(".r2.dev/")) {
      key = originalUrl.split(".r2.dev/")[1];
    } else if (originalUrl.includes(".r2.cloudflarestorage.com/")) {
      key = originalUrl.split(".r2.cloudflarestorage.com/")[1];
    } else {
      // Assume it's a custom domain URL, extract path after domain
      const url = new URL(originalUrl);
      key = url.pathname.slice(1); // Remove leading /
    }

    // Generate a presigned download URL (valid for 5 minutes)
    const downloadUrl = await generatePresignedDownloadUrl(key, 300);

    // Record the download (fire and forget)
    prisma.project.update({
      where: { id: gallery.id },
      data: { downloadCount: { increment: 1 } },
    }).catch((err) => {
      console.error("Failed to record download:", err);
    });

    // Log activity
    prisma.activityLog.create({
      data: {
        organizationId: gallery.organizationId,
        type: "file_downloaded",
        description: `Photo downloaded: ${asset.filename}`,
        projectId: gallery.id,
        metadata: {
          assetId: asset.id,
          filename: asset.filename,
        },
      },
    }).catch((err) => {
      console.error("Failed to log download activity:", err);
    });

    // Redirect to the presigned download URL
    // Set content-disposition header to trigger download with original filename
    const response = NextResponse.redirect(downloadUrl);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(asset.filename)}"`
    );

    return response;
  } catch (error) {
    console.error("[Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate download" },
      { status: 500 }
    );
  }
}
