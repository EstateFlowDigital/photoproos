import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import archiver from "archiver";
import { batchDownloadRatelimit, checkRateLimit, getClientIP } from "@/lib/ratelimit";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/storage";
import { getClientSession } from "@/lib/actions/client-auth";
import { applyWatermark, type WatermarkSettings } from "@/lib/watermark";

// Configuration
const CONCURRENT_FETCHES = 5;
const FETCH_TIMEOUT_MS = 30000; // 30 seconds per asset
const MAX_RETRIES = 2;

interface FetchResult {
  assetId: string;
  filename: string;
  buffer: Buffer | null;
  error?: string;
}

/**
 * Fetch a single asset with timeout and retry logic
 */
async function fetchAssetWithRetry(
  asset: { id: string; filename: string; originalUrl: string },
  retries: number = MAX_RETRIES
): Promise<FetchResult> {
  const key = extractKeyFromUrl(asset.originalUrl);
  if (!key) {
    return { assetId: asset.id, filename: asset.filename, buffer: null, error: "Could not extract storage key" };
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const signedUrl = await generatePresignedDownloadUrl(key, 300);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch(signedUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (attempt === retries) {
          return { assetId: asset.id, filename: asset.filename, buffer: null, error: `HTTP ${response.status}` };
        }
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      return { assetId: asset.id, filename: asset.filename, buffer: Buffer.from(arrayBuffer) };
    } catch (error) {
      if (attempt === retries) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { assetId: asset.id, filename: asset.filename, buffer: null, error: errorMessage };
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return { assetId: asset.id, filename: asset.filename, buffer: null, error: "Max retries exceeded" };
}

/**
 * Process assets with concurrency limit
 */
async function fetchAssetsWithConcurrency(
  assets: Array<{ id: string; filename: string; originalUrl: string }>,
  concurrency: number
): Promise<FetchResult[]> {
  const results: FetchResult[] = [];
  const queue = [...assets];
  const inProgress: Promise<void>[] = [];

  while (queue.length > 0 || inProgress.length > 0) {
    // Start new fetches up to concurrency limit
    while (inProgress.length < concurrency && queue.length > 0) {
      const asset = queue.shift()!;
      const promise = fetchAssetWithRetry(asset).then(result => {
        results.push(result);
        const index = inProgress.indexOf(promise);
        if (index > -1) inProgress.splice(index, 1);
      });
      inProgress.push(promise);
    }

    // Wait for at least one to complete
    if (inProgress.length > 0) {
      await Promise.race(inProgress);
    }
  }

  return results;
}

/**
 * POST /api/download/batch
 *
 * Downloads multiple photos as a ZIP file with streaming support.
 * Features:
 * - Parallel asset fetching with configurable concurrency
 * - 30-second timeout per asset with retry logic
 * - Continues on individual failures, includes error report
 * - Streaming response for large galleries
 *
 * Body: { galleryId: string, assetIds: string[], deliverySlug?: string }
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

    // Get the gallery with payment info and organization watermark settings
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
          select: {
            id: true,
            filename: true,
            originalUrl: true,
          },
        },
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true, isActive: true },
        },
        client: {
          select: { id: true },
        },
        organization: {
          select: {
            watermarkEnabled: true,
            watermarkType: true,
            watermarkText: true,
            watermarkImageUrl: true,
            watermarkPosition: true,
            watermarkOpacity: true,
            watermarkScale: true,
          },
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

    // Fetch all assets in parallel with concurrency limit
    const fetchResults = await fetchAssetsWithConcurrency(gallery.assets, CONCURRENT_FETCHES);

    // Separate successful and failed fetches
    const successfulFetches = fetchResults.filter(r => r.buffer !== null);
    const failedFetches = fetchResults.filter(r => r.buffer === null);

    if (successfulFetches.length === 0) {
      return NextResponse.json(
        { error: "Failed to fetch any photos. Please try again." },
        { status: 500 }
      );
    }

    // Determine if watermarks should be applied
    const shouldApplyWatermark = gallery.showWatermark && gallery.organization?.watermarkEnabled;
    const watermarkSettings: WatermarkSettings | null = shouldApplyWatermark && gallery.organization
      ? {
          enabled: true,
          type: (gallery.organization.watermarkType as "text" | "image") || "text",
          text: gallery.organization.watermarkText || undefined,
          imageUrl: gallery.organization.watermarkImageUrl || undefined,
          position: (gallery.organization.watermarkPosition as WatermarkSettings["position"]) || "bottom_right",
          opacity: gallery.organization.watermarkOpacity ?? 0.5,
          scale: gallery.organization.watermarkScale ?? 1.0,
        }
      : null;

    // Create a ZIP archive with streaming
    const archive = archiver("zip", {
      zlib: { level: 5 }, // Moderate compression for speed/size balance
    });

    // Collect chunks for the response
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Add successful files to archive (with optional watermarking)
    for (const result of successfulFetches) {
      if (result.buffer) {
        let finalBuffer = result.buffer;
        let filename = result.filename;

        // Apply watermark if enabled
        if (watermarkSettings) {
          try {
            const watermarked = await applyWatermark(result.buffer, watermarkSettings);
            finalBuffer = watermarked.buffer;
            // Update extension if format changed
            if (watermarked.format === "jpeg" && !filename.toLowerCase().endsWith(".jpg") && !filename.toLowerCase().endsWith(".jpeg")) {
              filename = filename.replace(/\.[^.]+$/, ".jpg");
            }
          } catch (err) {
            console.error(`Failed to apply watermark to ${result.filename}:`, err);
            // Use original buffer on watermark failure
          }
        }

        archive.append(finalBuffer, { name: filename });
      }
    }

    // If there were errors, include an error report
    if (failedFetches.length > 0) {
      const errorReport = [
        "# Download Report",
        `# Generated: ${new Date().toISOString()}`,
        `# Gallery: ${gallery.name}`,
        "",
        `# Successfully downloaded: ${successfulFetches.length} files`,
        `# Failed to download: ${failedFetches.length} files`,
        "",
        "# Failed files:",
        ...failedFetches.map(f => `- ${f.filename}: ${f.error}`),
        "",
        "# Please try downloading these files individually or contact support.",
      ].join("\n");

      archive.append(errorReport, { name: "_download_report.txt" });
    }

    // Finalize and wait for completion
    await archive.finalize();

    await new Promise<void>((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    const zipBuffer = Buffer.concat(chunks);

    // Record the downloads and log activity (fire and forget to not block response)
    Promise.all([
      prisma.project.update({
        where: { id: gallery.id },
        data: { downloadCount: { increment: successfulFetches.length } },
      }),
      prisma.activityLog.create({
        data: {
          organizationId: gallery.organizationId,
          type: "file_downloaded",
          description: `Batch download: ${successfulFetches.length}/${gallery.assets.length} photos`,
          projectId: gallery.id,
          metadata: {
            assetCount: successfulFetches.length,
            failedCount: failedFetches.length,
            assetIds: successfulFetches.map(f => f.assetId),
          },
        },
      }),
    ]).catch(err => {
      console.error("Failed to record download analytics:", err);
    });

    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(gallery.name)}-photos.zip"`,
        "Content-Length": zipBuffer.length.toString(),
        "X-Download-Success-Count": String(successfulFetches.length),
        "X-Download-Failed-Count": String(failedFetches.length),
      },
    });
  } catch (error) {
    console.error("[Batch Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to create download" },
      { status: 500 }
    );
  }
}
