/**
 * Image Processing Utility
 *
 * Generates optimized versions of uploaded images:
 * - Thumbnail (400px width) - WebP format for gallery grid
 * - Medium (1600px width) - WebP format for lightbox preview
 * - Original kept as-is for downloads (JPEG)
 */

import sharp from "sharp";
import { uploadFile, extractKeyFromUrl } from "@/lib/storage";

// =============================================================================
// Types
// =============================================================================

export interface ProcessedImage {
  thumbnailUrl: string;
  thumbnailKey: string;
  mediumUrl: string;
  mediumKey: string;
  width: number;
  height: number;
}

export interface ProcessingOptions {
  thumbnailWidth?: number;
  mediumWidth?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<ProcessingOptions> = {
  thumbnailWidth: 400,
  mediumWidth: 1600,
  quality: 85,
};

// =============================================================================
// Image Processing Functions
// =============================================================================

/**
 * Process an image to generate thumbnail and medium versions
 *
 * @param imageUrl - URL of the original image in R2
 * @param originalKey - The R2 key of the original image
 * @param options - Processing options
 * @returns URLs and dimensions of processed images
 */
export async function processImage(
  imageUrl: string,
  originalKey: string,
  options: ProcessingOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Download the original image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  // Generate key paths for variants
  const basePath = originalKey.replace(/\.[^.]+$/, "");
  const thumbnailKey = `${basePath}-thumb.webp`;
  const mediumKey = `${basePath}-medium.webp`;

  // Process thumbnail (only if original is larger)
  const thumbnailBuffer = await sharp(imageBuffer)
    .resize(opts.thumbnailWidth, null, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: opts.quality })
    .toBuffer();

  // Process medium version (only if original is larger)
  const mediumBuffer = await sharp(imageBuffer)
    .resize(opts.mediumWidth, null, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: opts.quality })
    .toBuffer();

  // Upload both versions to R2
  const [thumbnailResult, mediumResult] = await Promise.all([
    uploadFile(thumbnailKey, thumbnailBuffer, "image/webp"),
    uploadFile(mediumKey, mediumBuffer, "image/webp"),
  ]);

  return {
    thumbnailUrl: thumbnailResult.url,
    thumbnailKey,
    mediumUrl: mediumResult.url,
    mediumKey,
    width: originalWidth,
    height: originalHeight,
  };
}

/**
 * Process multiple images in parallel with concurrency limit
 */
export async function processImages(
  images: Array<{ url: string; key: string }>,
  options: ProcessingOptions = {},
  concurrency: number = 3
): Promise<Map<string, ProcessedImage>> {
  const results = new Map<string, ProcessedImage>();
  const queue = [...images];

  const workers = Array(Math.min(concurrency, queue.length))
    .fill(null)
    .map(async () => {
      while (queue.length > 0) {
        const image = queue.shift();
        if (!image) break;

        try {
          const processed = await processImage(image.url, image.key, options);
          results.set(image.key, processed);
        } catch (error) {
          console.error(`Failed to process image ${image.key}:`, error);
        }
      }
    });

  await Promise.all(workers);
  return results;
}

/**
 * Check if an image needs processing (doesn't have thumbnail/medium yet)
 */
export function needsProcessing(asset: {
  thumbnailUrl: string | null;
  mediumUrl: string | null;
}): boolean {
  return !asset.thumbnailUrl || !asset.mediumUrl;
}
