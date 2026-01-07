import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import archiver from "archiver";
import { batchDownloadRatelimit, checkRateLimit, getClientIP } from "@/lib/ratelimit";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/storage";
import { getClientSession } from "@/lib/actions/client-auth";
import { PassThrough } from "stream";

// Configuration
const CONCURRENT_FETCHES = 5;
const FETCH_TIMEOUT_MS = 30000;
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
 * Fetch a single marketing asset with timeout and retry logic
 */
async function fetchAssetWithRetry(
  asset: { id: string; name: string; fileUrl: string },
  retries: number = MAX_RETRIES
): Promise<FetchResult> {
  // Marketing assets may have direct URLs or storage keys
  const key = extractKeyFromUrl(asset.fileUrl);
  const isDirectUrl = asset.fileUrl.startsWith("http");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch(fetchUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (attempt === retries) {
          return { assetId: asset.id, filename: asset.name, buffer: null, error: `HTTP ${response.status}` };
        }
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      return { assetId: asset.id, filename: asset.name, buffer: Buffer.from(arrayBuffer) };
    } catch (error) {
      if (attempt === retries) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { assetId: asset.id, filename: asset.name, buffer: null, error: errorMessage };
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return { assetId: asset.id, filename: asset.name, buffer: null, error: "Max retries exceeded" };
}

/**
 * POST /api/download/marketing-kit
 *
 * Downloads marketing materials as a ZIP file.
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
    const { galleryId, assetIds } = body;

    if (!galleryId || !assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        { error: "Gallery ID and at least one asset ID are required" },
        { status: 400 }
      );
    }

    // Limit batch size
    if (assetIds.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 marketing assets per download" },
        { status: 400 }
      );
    }

    // Get the gallery (project) with its property website and marketing assets
    const project = await prisma.project.findUnique({
      where: { id: galleryId },
      select: {
        id: true,
        name: true,
        clientId: true,
        organizationId: true,
        propertyWebsite: {
          select: {
            id: true,
            address: true,
            marketingAssets: {
              where: {
                id: { in: assetIds },
                status: "ready",
              },
              select: {
                id: true,
                name: true,
                type: true,
                fileUrl: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Authorization: Check if the client has access
    const clientSession = await getClientSession();
    if (!clientSession || project.clientId !== clientSession.clientId) {
      return NextResponse.json(
        { error: "Unauthorized to download marketing materials" },
        { status: 403 }
      );
    }

    // Get marketing assets
    const marketingAssets = project.propertyWebsite?.marketingAssets || [];

    if (marketingAssets.length === 0) {
      return NextResponse.json(
        { error: "No marketing materials found" },
        { status: 404 }
      );
    }

    // Create a PassThrough stream to pipe archive data
    const passThrough = new PassThrough();

    // Create a ZIP archive with streaming
    const archive = archiver("zip", {
      zlib: { level: 5 },
    });

    // Pipe archive to the passthrough stream
    archive.pipe(passThrough);

    // Track results for logging
    const failedAssets: FailedAsset[] = [];
    let successCount = 0;

    // Process assets with concurrency control
    const processAssets = async () => {
      const queue = [...marketingAssets];
      const inProgress: Promise<void>[] = [];

      while (queue.length > 0 || inProgress.length > 0) {
        // Start new fetches up to concurrency limit
        while (inProgress.length < CONCURRENT_FETCHES && queue.length > 0) {
          const asset = queue.shift()!;
          const promise = (async () => {
            const result = await fetchAssetWithRetry(asset);

            if (result.buffer) {
              // Determine file extension from type or name
              let filename = result.filename;
              if (!filename.includes(".")) {
                // Add extension based on content type detection
                const signature = result.buffer.slice(0, 4).toString("hex");
                if (signature.startsWith("89504e47")) {
                  filename += ".png";
                } else if (signature.startsWith("ffd8ff")) {
                  filename += ".jpg";
                } else if (signature.startsWith("25504446")) {
                  filename += ".pdf";
                } else {
                  filename += ".bin";
                }
              }

              // Organize files by type in the ZIP
              const typeFolder = getAssetTypeFolder(asset.type);
              const zipPath = typeFolder ? `${typeFolder}/${filename}` : filename;

              archive.append(result.buffer, { name: zipPath });
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

      // Add a README file
      const readmeContent = [
        `# Marketing Kit`,
        ``,
        `Property: ${project.propertyWebsite?.address || project.name}`,
        `Downloaded: ${new Date().toISOString()}`,
        ``,
        `## Contents`,
        ``,
        `This marketing kit contains ${successCount} professional marketing materials:`,
        ``,
        ...marketingAssets.map(a => `- ${getAssetTypeLabel(a.type)}: ${a.name}`),
        ``,
        `## Usage`,
        ``,
        `These materials are ready to use for:`,
        `- Social media posts (Instagram, Facebook, LinkedIn)`,
        `- Email marketing`,
        `- Print materials (flyers, postcards)`,
        `- Website and listing sites`,
        ``,
        `For best results, use the materials at their intended dimensions.`,
      ].join("\n");

      archive.append(readmeContent, { name: "README.txt" });

      // Add error report if there were failures
      if (failedAssets.length > 0) {
        const errorReport = [
          "# Download Report",
          `# Generated: ${new Date().toISOString()}`,
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
        prisma.activityLog.create({
          data: {
            organizationId: project.organizationId,
            type: "file_downloaded",
            description: `Marketing kit download: ${successCount} materials`,
            projectId: project.id,
            metadata: {
              assetCount: successCount,
              failedCount: failedAssets.length,
              propertyAddress: project.propertyWebsite?.address,
            },
          },
        }),
      ]).catch(err => {
        console.error("Failed to record download analytics:", err);
      });
    };

    // Start processing in the background (don't await)
    processAssets().catch(err => {
      console.error("[Marketing Kit Download] Stream processing error:", err);
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
          console.error("[Marketing Kit Download] Stream error:", err);
          controller.error(err);
        });
      },
      cancel() {
        passThrough.destroy();
        archive.abort();
      },
    });

    // Generate ZIP filename
    const address = project.propertyWebsite?.address;
    const zipFilename = address
      ? `${address.replace(/[^a-zA-Z0-9]/g, "-")}-marketing-kit.zip`
      : `${project.name}-marketing-kit.zip`;

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
    console.error("[Marketing Kit Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to create download" },
      { status: 500 }
    );
  }
}

/**
 * Get folder name for organizing assets by type
 */
function getAssetTypeFolder(type: string): string {
  const folders: Record<string, string> = {
    // Social media
    social_square: "Social Media",
    social_landscape: "Social Media",
    social_story: "Social Media",
    social_pinterest: "Social Media",
    social_linkedin: "Social Media",
    social_twitter: "Social Media",
    // Tiles
    tile_just_listed: "Social Tiles",
    tile_just_sold: "Social Tiles",
    tile_open_house: "Social Tiles",
    tile_price_reduced: "Social Tiles",
    tile_coming_soon: "Social Tiles",
    tile_under_contract: "Social Tiles",
    tile_back_on_market: "Social Tiles",
    tile_new_price: "Social Tiles",
    tile_virtual_tour: "Social Tiles",
    tile_featured: "Social Tiles",
    // Print
    flyer_portrait: "Print Materials",
    flyer_landscape: "Print Materials",
    postcard_4x6: "Print Materials",
    postcard_5x7: "Print Materials",
    feature_sheet: "Print Materials",
    brochure: "Print Materials",
    window_sign: "Print Materials",
    yard_sign_rider: "Print Materials",
    door_hanger: "Print Materials",
    // Video
    video_slideshow: "Videos",
    video_reel: "Videos",
    video_tour_teaser: "Videos",
    video_neighborhood: "Videos",
    video_stats_animation: "Videos",
    // Email
    email_banner: "Email",
    email_template: "Email",
    // Other
    qr_code: "Other",
    virtual_tour_poster: "Print Materials",
  };

  return folders[type] || "Other";
}

/**
 * Get human-readable label for asset type
 */
function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    flyer_portrait: "Portrait Flyer",
    flyer_landscape: "Landscape Flyer",
    postcard_4x6: "4x6 Postcard",
    postcard_5x7: "5x7 Postcard",
    feature_sheet: "Feature Sheet",
    brochure: "Brochure",
    window_sign: "Window Sign",
    yard_sign_rider: "Yard Sign Rider",
    door_hanger: "Door Hanger",
    social_square: "Square Social Post",
    social_landscape: "Landscape Social Post",
    social_pinterest: "Pinterest Pin",
    social_linkedin: "LinkedIn Post",
    social_twitter: "Twitter/X Post",
    social_story: "Story Format",
    tile_just_listed: "Just Listed",
    tile_just_sold: "Just Sold",
    tile_open_house: "Open House",
    tile_price_reduced: "Price Reduced",
    tile_coming_soon: "Coming Soon",
    tile_under_contract: "Under Contract",
    tile_back_on_market: "Back on Market",
    tile_new_price: "New Price",
    tile_virtual_tour: "Virtual Tour",
    tile_featured: "Featured Property",
    video_slideshow: "Photo Slideshow",
    video_reel: "Instagram Reel",
    video_tour_teaser: "Tour Teaser",
    video_neighborhood: "Neighborhood Tour",
    video_stats_animation: "Stats Animation",
    email_banner: "Email Banner",
    email_template: "Email Template",
    qr_code: "QR Code",
    virtual_tour_poster: "Virtual Tour Poster",
  };

  return labels[type] || type;
}
