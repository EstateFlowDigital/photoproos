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
  blurDataUrl?: string; // Base64 LQIP for blur-up loading
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

  // Generate blur placeholder (10x10 tiny image for blur-up effect)
  const blurBuffer = await sharp(imageBuffer)
    .resize(10, 10, { fit: "inside" })
    .blur(2)
    .webp({ quality: 20 })
    .toBuffer();

  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

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
    blurDataUrl,
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

// =============================================================================
// MLS Preset Resizing
// =============================================================================

export interface MlsResizeOptions {
  width: number;
  height: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  maintainAspect?: boolean;
  letterbox?: boolean;
  letterboxColor?: string;
  maxFileSizeKb?: number;
}

export interface MlsResizeResult {
  buffer: Buffer;
  format: "jpeg" | "png" | "webp";
  width: number;
  height: number;
  fileSizeKb: number;
}

/**
 * Resize an image according to MLS preset specifications
 *
 * @param imageBuffer - Original image buffer
 * @param options - MLS resize options
 * @returns Resized image buffer with metadata
 */
export async function resizeForMls(
  imageBuffer: Buffer,
  options: MlsResizeOptions
): Promise<MlsResizeResult> {
  const {
    width: targetWidth,
    height: targetHeight,
    quality = 90,
    format = "jpeg",
    maintainAspect = true,
    letterbox = false,
    letterboxColor = "#ffffff",
    maxFileSizeKb,
  } = options;

  // Get original dimensions
  const metadata = await sharp(imageBuffer).metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  let pipeline = sharp(imageBuffer);

  if (maintainAspect) {
    if (letterbox) {
      // Letterbox: resize to fit within dimensions, then add padding
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: "contain",
        background: letterboxColor,
        withoutEnlargement: true,
      });
    } else {
      // Standard resize: fit within dimensions maintaining aspect ratio
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
  } else {
    // Exact dimensions: crop to fill (cover)
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      fit: "cover",
      position: "centre",
    });
  }

  // Apply format and quality
  let finalBuffer: Buffer;
  let finalFormat: "jpeg" | "png" | "webp" = format;

  switch (format) {
    case "png":
      finalBuffer = await pipeline.png({ quality }).toBuffer();
      break;
    case "webp":
      finalBuffer = await pipeline.webp({ quality }).toBuffer();
      break;
    case "jpeg":
    default:
      finalBuffer = await pipeline
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      finalFormat = "jpeg";
      break;
  }

  // If max file size specified, progressively reduce quality until under limit
  if (maxFileSizeKb && finalBuffer.length > maxFileSizeKb * 1024) {
    let currentQuality = quality;
    const minQuality = 40; // Don't go below 40% quality

    while (
      finalBuffer.length > maxFileSizeKb * 1024 &&
      currentQuality > minQuality
    ) {
      currentQuality -= 5;

      pipeline = sharp(imageBuffer);

      if (maintainAspect) {
        if (letterbox) {
          pipeline = pipeline.resize(targetWidth, targetHeight, {
            fit: "contain",
            background: letterboxColor,
            withoutEnlargement: true,
          });
        } else {
          pipeline = pipeline.resize(targetWidth, targetHeight, {
            fit: "inside",
            withoutEnlargement: true,
          });
        }
      } else {
        pipeline = pipeline.resize(targetWidth, targetHeight, {
          fit: "cover",
          position: "centre",
        });
      }

      switch (format) {
        case "png":
          finalBuffer = await pipeline.png({ quality: currentQuality }).toBuffer();
          break;
        case "webp":
          finalBuffer = await pipeline.webp({ quality: currentQuality }).toBuffer();
          break;
        case "jpeg":
        default:
          finalBuffer = await pipeline
            .jpeg({ quality: currentQuality, mozjpeg: true })
            .toBuffer();
          break;
      }
    }

    // If still too large, reduce dimensions proportionally
    if (finalBuffer.length > maxFileSizeKb * 1024) {
      let scaleFactor = 0.9;

      while (
        finalBuffer.length > maxFileSizeKb * 1024 &&
        scaleFactor > 0.3
      ) {
        const scaledWidth = Math.round(targetWidth * scaleFactor);
        const scaledHeight = Math.round(targetHeight * scaleFactor);

        pipeline = sharp(imageBuffer);

        if (maintainAspect) {
          if (letterbox) {
            pipeline = pipeline.resize(scaledWidth, scaledHeight, {
              fit: "contain",
              background: letterboxColor,
              withoutEnlargement: true,
            });
          } else {
            pipeline = pipeline.resize(scaledWidth, scaledHeight, {
              fit: "inside",
              withoutEnlargement: true,
            });
          }
        } else {
          pipeline = pipeline.resize(scaledWidth, scaledHeight, {
            fit: "cover",
            position: "centre",
          });
        }

        switch (format) {
          case "png":
            finalBuffer = await pipeline.png({ quality: minQuality }).toBuffer();
            break;
          case "webp":
            finalBuffer = await pipeline.webp({ quality: minQuality }).toBuffer();
            break;
          case "jpeg":
          default:
            finalBuffer = await pipeline
              .jpeg({ quality: minQuality, mozjpeg: true })
              .toBuffer();
            break;
        }

        scaleFactor -= 0.1;
      }
    }
  }

  // Get final dimensions
  const finalMetadata = await sharp(finalBuffer).metadata();

  return {
    buffer: finalBuffer,
    format: finalFormat,
    width: finalMetadata.width || targetWidth,
    height: finalMetadata.height || targetHeight,
    fileSizeKb: Math.round(finalBuffer.length / 1024),
  };
}

/**
 * Get file extension for MLS format
 */
export function getMlsFormatExtension(format: string): string {
  switch (format) {
    case "png":
      return ".png";
    case "webp":
      return ".webp";
    case "jpeg":
    default:
      return ".jpg";
  }
}

/**
 * Update filename with MLS format extension
 */
export function updateFilenameForMls(
  originalFilename: string,
  format: string,
  presetName?: string
): string {
  const baseName = originalFilename.replace(/\.[^.]+$/, "");
  const extension = getMlsFormatExtension(format);
  const suffix = presetName ? `-${presetName.toLowerCase().replace(/\s+/g, "-")}` : "";
  return `${baseName}${suffix}${extension}`;
}
