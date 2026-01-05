import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { processImage } from "@/lib/image-processing";
import { extractKeyFromUrl } from "@/lib/storage";

/**
 * POST /api/images/process
 *
 * Process uploaded images to generate thumbnail and medium versions.
 * Called after upload completes to generate optimized versions.
 *
 * Body: { assetIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assetIds } = body as { assetIds: string[] };

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        { error: "assetIds array is required" },
        { status: 400 }
      );
    }

    // Limit to 10 images per request to avoid timeout
    const idsToProcess = assetIds.slice(0, 10);

    // Get assets that need processing
    const assets = await prisma.asset.findMany({
      where: {
        id: { in: idsToProcess },
        // Only process if thumbnail or medium is missing
        OR: [
          { thumbnailUrl: null },
          { mediumUrl: null },
        ],
      },
      select: {
        id: true,
        originalUrl: true,
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (assets.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No assets need processing",
      });
    }

    // Process each asset
    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const asset of assets) {
      try {
        // Extract the R2 key from the original URL
        const originalKey = extractKeyFromUrl(asset.originalUrl);
        if (!originalKey) {
          results.push({
            id: asset.id,
            success: false,
            error: "Could not extract key from URL",
          });
          continue;
        }

        // Process the image
        const processed = await processImage(asset.originalUrl, originalKey);

        // Update the asset with the new URLs and dimensions
        await prisma.asset.update({
          where: { id: asset.id },
          data: {
            thumbnailUrl: processed.thumbnailUrl,
            mediumUrl: processed.mediumUrl,
            width: processed.width,
            height: processed.height,
          },
        });

        results.push({ id: asset.id, success: true });
      } catch (error) {
        console.error(`Failed to process asset ${asset.id}:`, error);
        results.push({
          id: asset.id,
          success: false,
          error: error instanceof Error ? error.message : "Processing failed",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      processed: successCount,
      failed: failCount,
      results,
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
