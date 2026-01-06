import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import archiver from "archiver";
import { batchDownloadRatelimit, checkRateLimit, getClientIP } from "@/lib/ratelimit";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/storage";
import { getClientSession } from "@/lib/actions/client-auth";
import { logDownload } from "@/lib/actions/download-tracking";
import { applyWatermark, type WatermarkSettings } from "@/lib/watermark";
import { resizeForMls, updateFilenameForMls, type MlsResizeOptions } from "@/lib/image-processing";
import { PassThrough } from "stream";

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

interface FailedAsset {
  filename: string;
  error: string;
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
 * POST /api/download/batch
 *
 * Downloads multiple photos as a ZIP file with true streaming support.
 * Features:
 * - Parallel asset fetching with configurable concurrency
 * - True streaming response (no buffering entire ZIP in memory)
 * - 30-second timeout per asset with retry logic
 * - Continues on individual failures, includes error report
 * - Watermark support
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
    const { galleryId, assetIds, deliverySlug, mlsPresetId } = body;

    if (!galleryId || !assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        { error: "Gallery ID and at least one asset ID are required" },
        { status: 400 }
      );
    }

    // Load MLS preset if specified
    let mlsPreset: {
      id: string;
      name: string;
      width: number;
      height: number;
      quality: number;
      format: string;
      maxFileSizeKb: number | null;
      maintainAspect: boolean;
      letterbox: boolean;
      letterboxColor: string | null;
    } | null = null;

    if (mlsPresetId) {
      mlsPreset = await prisma.mlsPreset.findUnique({
        where: { id: mlsPresetId },
        select: {
          id: true,
          name: true,
          width: true,
          height: true,
          quality: true,
          format: true,
          maxFileSizeKb: true,
          maintainAspect: true,
          letterbox: true,
          letterboxColor: true,
        },
      });

      if (!mlsPreset) {
        return NextResponse.json(
          { error: "Invalid MLS preset" },
          { status: 400 }
        );
      }
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
      select: {
        id: true,
        name: true,
        status: true,
        priceCents: true,
        expiresAt: true,
        allowDownloads: true,
        showWatermark: true,
        downloadRequiresPayment: true, // For paylock bypass feature
        clientId: true,
        payments: {
          where: { status: "paid" },
          take: 1,
          select: { id: true },
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

    // Check payment status (if gallery has a price and requires payment for downloads)
    const isPaid = gallery.payments.length > 0;
    const isFree = !gallery.priceCents || gallery.priceCents === 0;
    const requiresPayment = gallery.downloadRequiresPayment !== false;

    if (!isFree && !isPaid && requiresPayment) {
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

    // Create a PassThrough stream to pipe archive data
    const passThrough = new PassThrough();

    // Create a ZIP archive with streaming
    const archive = archiver("zip", {
      zlib: { level: 5 }, // Moderate compression for speed/size balance
    });

    // Pipe archive to the passthrough stream
    archive.pipe(passThrough);

    // Track results for logging
    const failedAssets: FailedAsset[] = [];
    let successCount = 0;

    // Process assets with concurrency control
    const processAssets = async () => {
      const queue = [...gallery.assets];
      const inProgress: Promise<void>[] = [];

      while (queue.length > 0 || inProgress.length > 0) {
        // Start new fetches up to concurrency limit
        while (inProgress.length < CONCURRENT_FETCHES && queue.length > 0) {
          const asset = queue.shift()!;
          const promise = (async () => {
            const result = await fetchAssetWithRetry(asset);

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

              // Apply MLS preset resizing if specified
              if (mlsPreset) {
                try {
                  const mlsOptions: MlsResizeOptions = {
                    width: mlsPreset.width,
                    height: mlsPreset.height,
                    quality: mlsPreset.quality,
                    format: mlsPreset.format as "jpeg" | "png" | "webp",
                    maintainAspect: mlsPreset.maintainAspect,
                    letterbox: mlsPreset.letterbox,
                    letterboxColor: mlsPreset.letterboxColor || "#ffffff",
                    maxFileSizeKb: mlsPreset.maxFileSizeKb || undefined,
                  };

                  const resized = await resizeForMls(finalBuffer, mlsOptions);
                  finalBuffer = resized.buffer;
                  filename = updateFilenameForMls(filename, resized.format);
                } catch (err) {
                  console.error(`Failed to apply MLS preset to ${result.filename}:`, err);
                  // Use previous buffer on MLS resize failure
                }
              }

              archive.append(finalBuffer, { name: filename });
              successCount++;
            } else {
              failedAssets.push({ filename: result.filename, error: result.error || "Unknown error" });
            }
          })().finally(() => {
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

      // Add error report if there were failures
      if (failedAssets.length > 0) {
        const errorReport = [
          "# Download Report",
          `# Generated: ${new Date().toISOString()}`,
          `# Gallery: ${gallery.name}`,
          "",
          `# Successfully downloaded: ${successCount} files`,
          `# Failed to download: ${failedAssets.length} files`,
          "",
          "# Failed files:",
          ...failedAssets.map(f => `- ${f.filename}: ${f.error}`),
          "",
          "# Please try downloading these files individually or contact support.",
        ].join("\n");

        archive.append(errorReport, { name: "_download_report.txt" });
      }

      // Finalize the archive
      await archive.finalize();

      // Record analytics (fire and forget)
      Promise.all([
        prisma.project.update({
          where: { id: gallery.id },
          data: { downloadCount: { increment: successCount } },
        }),
        prisma.activityLog.create({
          data: {
            organizationId: gallery.organizationId,
            type: "file_downloaded",
            description: mlsPreset
              ? `Batch download (${mlsPreset.name}): ${successCount}/${gallery.assets.length} photos`
              : `Batch download: ${successCount}/${gallery.assets.length} photos`,
            projectId: gallery.id,
            metadata: {
              assetCount: successCount,
              failedCount: failedAssets.length,
              ...(mlsPreset && {
                mlsPreset: mlsPreset.name,
                mlsPresetId: mlsPreset.id,
                mlsDimensions: `${mlsPreset.width}x${mlsPreset.height}`,
              }),
            },
          },
        }),
        // Log download for client history (always use zip_all format, MLS details in activity log metadata)
        logDownload({
          projectId: gallery.id,
          assetIds: gallery.assets.map(a => a.id),
          format: "zip_all",
          fileCount: successCount,
          clientEmail: clientSession?.client.email,
          clientName: clientSession?.client.fullName || undefined,
          sessionId: clientSession?.clientId,
          ipAddress: clientIP,
          userAgent: request.headers.get("user-agent") || undefined,
        }),
      ]).catch(err => {
        console.error("Failed to record download analytics:", err);
      });
    };

    // Start processing in the background (don't await)
    processAssets().catch(err => {
      console.error("[Batch Download] Stream processing error:", err);
      archive.abort();
    });

    // Convert Node.js stream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        passThrough.on("end", () => {
          controller.close();
        });
        passThrough.on("error", (err) => {
          console.error("[Batch Download] Stream error:", err);
          controller.error(err);
        });
      },
      cancel() {
        passThrough.destroy();
        archive.abort();
      },
    });

    // Generate ZIP filename (include MLS preset name if applicable)
    const zipFilename = mlsPreset
      ? `${gallery.name}-${mlsPreset.name.toLowerCase().replace(/\s+/g, "-")}-photos.zip`
      : `${gallery.name}-photos.zip`;

    // Return streaming response
    return new Response(readableStream, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(zipFilename)}"`,
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
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
