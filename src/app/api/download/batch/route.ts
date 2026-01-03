import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import archiver from "archiver";
import { batchDownloadRatelimit, checkRateLimit, getClientIP } from "@/lib/ratelimit";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/storage";
import { getClientSession } from "@/lib/actions/client-auth";

/**
 * POST /api/download/batch
 *
 * Downloads multiple photos as a ZIP file.
 * Body: { galleryId: string, assetIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(batchDownloadRatelimit, clientIP);
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

    const body = await request.json();
    const { galleryId, assetIds, deliverySlug } = body;

    if (!galleryId || !assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        { error: "Gallery ID and at least one asset ID are required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (assetIds.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 photos per batch download" },
        { status: 400 }
      );
    }

    // Get the gallery with payment info
    const gallery = await prisma.project.findUnique({
      where: { id: galleryId },
      include: {
        payments: {
          where: { status: "paid" },
          take: 1,
        },
        assets: {
          where: {
            id: { in: assetIds },
          },
        },
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true, isActive: true },
        },
        client: {
          select: { id: true },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Check if gallery is expired
    if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This gallery has expired" },
        { status: 403 }
      );
    }

    // Only delivered galleries can be downloaded
    if (gallery.status !== "delivered") {
      return NextResponse.json(
        { error: "This gallery is not ready for download" },
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

    // Authorization: either a logged-in client matching the gallery client, or a valid delivery slug
    const clientSession = await getClientSession();
    const hasClientAccess = Boolean(clientSession && gallery.clientId && gallery.clientId === clientSession.clientId);
    const hasDeliveryAccess = Boolean(
      deliverySlug && gallery.deliveryLinks.some((link) => link.slug === deliverySlug && link.isActive)
    );

    if (!hasClientAccess && !hasDeliveryAccess) {
      return NextResponse.json(
        { error: "Unauthorized to download this gallery" },
        { status: 403 }
      );
    }

    // Verify all requested assets belong to this gallery
    if (gallery.assets.length !== assetIds.length) {
      return NextResponse.json(
        { error: "Some photos were not found in this gallery" },
        { status: 400 }
      );
    }

    // Create a ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 5 }, // Moderate compression for speed/size balance
    });

    // Create a readable stream to collect the archive
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Fetch and add each photo to the archive
    for (const asset of gallery.assets) {
      try {
        const key = extractKeyFromUrl(asset.originalUrl);
        if (!key) {
          console.error(`Could not extract key for asset ${asset.id}`);
          continue;
        }

        const signedUrl = await generatePresignedDownloadUrl(key, 300);
        const response = await fetch(signedUrl);
        if (!response.ok) {
          console.error(`Failed to fetch asset ${asset.id}: ${response.status}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Add to archive with original filename
        archive.append(buffer, { name: asset.filename });
      } catch (error) {
        console.error(`Error fetching asset ${asset.id}:`, error);
        // Continue with other files
      }
    }

    // Finalize the archive
    await archive.finalize();

    // Wait for all data to be collected
    await new Promise<void>((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    // Combine all chunks into a single buffer
    const zipBuffer = Buffer.concat(chunks);

    // Record the downloads and log activity (awaited for reliability)
    try {
      await Promise.all([
        prisma.project.update({
          where: { id: gallery.id },
          data: { downloadCount: { increment: gallery.assets.length } },
        }),
        prisma.activityLog.create({
          data: {
            organizationId: gallery.organizationId,
            type: "file_downloaded",
            description: `Batch download: ${gallery.assets.length} photos`,
            projectId: gallery.id,
            metadata: {
              assetCount: gallery.assets.length,
              assetIds: assetIds,
            },
          },
        }),
      ]);
    } catch (err) {
      // Log but don't fail the download
      console.error("Failed to record download analytics:", err);
    }

    // Create the response with the ZIP file
    const response = new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(gallery.name)}-photos.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error("[Batch Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to create download" },
      { status: 500 }
    );
  }
}
