/**
 * Backfill Script: Generate blurDataUrl for existing assets
 *
 * This script processes all assets that don't have a blurDataUrl and generates
 * a low-quality image placeholder (LQIP) for blur-up loading effect.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-blur-placeholders.ts
 *
 * Or add to package.json scripts:
 *   "backfill:blur": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' scripts/backfill-blur-placeholders.ts"
 */

import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = 50; // Process in batches to avoid memory issues
const CONCURRENT_LIMIT = 5; // Process 5 images concurrently

interface AssetToProcess {
  id: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  originalUrl: string | null;
  filename: string;
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

async function generateBlurDataUrl(imageBuffer: Buffer): Promise<string | null> {
  try {
    const blurBuffer = await sharp(imageBuffer)
      .resize(10, 10, { fit: "inside" })
      .blur(2)
      .webp({ quality: 20 })
      .toBuffer();

    return `data:image/webp;base64,${blurBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error generating blur placeholder:", error);
    return null;
  }
}

async function processAsset(asset: AssetToProcess): Promise<boolean> {
  // Try thumbnail first (smallest), then medium, then original
  const imageUrl = asset.thumbnailUrl || asset.mediumUrl || asset.originalUrl;

  if (!imageUrl) {
    console.log(`  [SKIP] ${asset.filename} - No URL available`);
    return false;
  }

  const imageBuffer = await fetchImageBuffer(imageUrl);
  if (!imageBuffer) {
    console.log(`  [FAIL] ${asset.filename} - Could not fetch image`);
    return false;
  }

  const blurDataUrl = await generateBlurDataUrl(imageBuffer);
  if (!blurDataUrl) {
    console.log(`  [FAIL] ${asset.filename} - Could not generate blur`);
    return false;
  }

  // Update the asset in database
  await prisma.asset.update({
    where: { id: asset.id },
    data: { blurDataUrl },
  });

  console.log(`  [OK] ${asset.filename}`);
  return true;
}

async function processBatch(assets: AssetToProcess[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // Process in chunks of CONCURRENT_LIMIT
  for (let i = 0; i < assets.length; i += CONCURRENT_LIMIT) {
    const chunk = assets.slice(i, i + CONCURRENT_LIMIT);
    const results = await Promise.all(chunk.map(processAsset));

    results.forEach((result) => {
      if (result) success++;
      else failed++;
    });
  }

  return { success, failed };
}

async function main() {
  console.log("=== Blur Placeholder Backfill Script ===\n");

  // Count total assets without blurDataUrl
  const totalCount = await prisma.asset.count({
    where: { blurDataUrl: null },
  });

  if (totalCount === 0) {
    console.log("All assets already have blur placeholders. Nothing to do.");
    return;
  }

  console.log(`Found ${totalCount} assets without blur placeholders.\n`);

  let processed = 0;
  let totalSuccess = 0;
  let totalFailed = 0;

  // Process in batches
  while (processed < totalCount) {
    const assets = await prisma.asset.findMany({
      where: { blurDataUrl: null },
      select: {
        id: true,
        thumbnailUrl: true,
        mediumUrl: true,
        originalUrl: true,
        filename: true,
      },
      take: BATCH_SIZE,
    });

    if (assets.length === 0) break;

    console.log(`Processing batch ${Math.floor(processed / BATCH_SIZE) + 1} (${assets.length} assets)...`);

    const { success, failed } = await processBatch(assets);
    totalSuccess += success;
    totalFailed += failed;
    processed += assets.length;

    console.log(`  Batch complete: ${success} success, ${failed} failed\n`);
  }

  console.log("=== Summary ===");
  console.log(`Total processed: ${processed}`);
  console.log(`Successful: ${totalSuccess}`);
  console.log(`Failed: ${totalFailed}`);
}

main()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
