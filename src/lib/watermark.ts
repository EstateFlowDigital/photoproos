/**
 * Watermark Application Module
 *
 * Applies text or image watermarks to photos using Sharp.
 * Supports multiple positions including tiled and diagonal patterns.
 */

import sharp from "sharp";

// =============================================================================
// Types
// =============================================================================

export type WatermarkPosition =
  | "top_left"
  | "top_center"
  | "top_right"
  | "center"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right"
  | "tiled"
  | "diagonal";

export interface WatermarkSettings {
  enabled: boolean;
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
  position: WatermarkPosition;
  opacity: number; // 0-1
  scale: number; // 0-1
}

export interface WatermarkResult {
  buffer: Buffer;
  format: "jpeg" | "png" | "webp";
}

// =============================================================================
// Position Calculations
// =============================================================================

interface Position {
  left: number;
  top: number;
}

function calculatePosition(
  imageWidth: number,
  imageHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: WatermarkPosition,
  padding: number = 0.05 // 5% padding from edges
): Position {
  const paddingX = Math.round(imageWidth * padding);
  const paddingY = Math.round(imageHeight * padding);

  switch (position) {
    case "top_left":
      return { left: paddingX, top: paddingY };
    case "top_center":
      return { left: Math.round((imageWidth - watermarkWidth) / 2), top: paddingY };
    case "top_right":
      return { left: imageWidth - watermarkWidth - paddingX, top: paddingY };
    case "center":
      return {
        left: Math.round((imageWidth - watermarkWidth) / 2),
        top: Math.round((imageHeight - watermarkHeight) / 2),
      };
    case "bottom_left":
      return { left: paddingX, top: imageHeight - watermarkHeight - paddingY };
    case "bottom_center":
      return {
        left: Math.round((imageWidth - watermarkWidth) / 2),
        top: imageHeight - watermarkHeight - paddingY,
      };
    case "bottom_right":
    default:
      return {
        left: imageWidth - watermarkWidth - paddingX,
        top: imageHeight - watermarkHeight - paddingY,
      };
  }
}

// =============================================================================
// Text Watermark Generation
// =============================================================================

async function createTextWatermark(
  text: string,
  imageWidth: number,
  scale: number,
  opacity: number
): Promise<Buffer> {
  // Calculate font size based on image width and scale
  const baseFontSize = Math.max(16, Math.round(imageWidth * 0.03));
  const fontSize = Math.round(baseFontSize * scale);
  const padding = Math.round(fontSize * 0.5);

  // Estimate text dimensions (approximate)
  const charWidth = fontSize * 0.6;
  const textWidth = Math.round(text.length * charWidth) + padding * 2;
  const textHeight = fontSize + padding * 2;

  // Create SVG with text
  const svg = `
    <svg width="${textWidth}" height="${textHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.3)" rx="4"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="white"
        fill-opacity="${opacity}"
        text-anchor="middle"
        dominant-baseline="central"
        style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);"
      >${escapeXml(text)}</text>
    </svg>
  `;

  return Buffer.from(svg);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// =============================================================================
// Image Watermark Fetching
// =============================================================================

async function fetchWatermarkImage(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch watermark image: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

// =============================================================================
// Tiled Watermark Pattern
// =============================================================================

async function createTiledPattern(
  watermarkBuffer: Buffer,
  imageWidth: number,
  imageHeight: number,
  scale: number,
  opacity: number
): Promise<Buffer> {
  // Get watermark dimensions and resize
  const watermarkMeta = await sharp(watermarkBuffer).metadata();
  const wmWidth = Math.round((watermarkMeta.width || 100) * scale);
  const wmHeight = Math.round((watermarkMeta.height || 100) * scale);

  // Resize watermark
  const resizedWatermark = await sharp(watermarkBuffer)
    .resize(wmWidth, wmHeight, { fit: "inside" })
    .ensureAlpha()
    .toBuffer();

  // Calculate tile spacing (add some gap between tiles)
  const spacingX = Math.round(wmWidth * 1.5);
  const spacingY = Math.round(wmHeight * 1.5);

  // Calculate number of tiles needed
  const tilesX = Math.ceil(imageWidth / spacingX) + 1;
  const tilesY = Math.ceil(imageHeight / spacingY) + 1;

  // Create composites for each tile position
  const composites: sharp.OverlayOptions[] = [];

  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      // Offset every other row for a more natural pattern
      const offsetX = y % 2 === 0 ? 0 : spacingX / 2;
      const left = Math.round(x * spacingX + offsetX - wmWidth / 2);
      const top = Math.round(y * spacingY - wmHeight / 2);

      composites.push({
        input: resizedWatermark,
        left: Math.max(0, left),
        top: Math.max(0, top),
        blend: "over" as const,
      });
    }
  }

  // Create transparent canvas with tiled watermarks
  const tiledCanvas = await sharp({
    create: {
      width: imageWidth,
      height: imageHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  // Apply opacity
  return sharp(tiledCanvas)
    .ensureAlpha()
    .modulate({ brightness: 1 })
    .linear(opacity, 0)
    .toBuffer();
}

// =============================================================================
// Diagonal Watermark Pattern
// =============================================================================

async function createDiagonalPattern(
  watermarkBuffer: Buffer,
  imageWidth: number,
  imageHeight: number,
  scale: number,
  opacity: number
): Promise<Buffer> {
  // Get watermark dimensions and resize larger for diagonal
  const watermarkMeta = await sharp(watermarkBuffer).metadata();
  const baseSize = Math.max(imageWidth, imageHeight) * 0.4 * scale;
  const wmWidth = Math.round((watermarkMeta.width || 100) * (baseSize / (watermarkMeta.width || 100)));
  const wmHeight = Math.round((watermarkMeta.height || 100) * (baseSize / (watermarkMeta.width || 100)));

  // Resize watermark
  const resizedWatermark = await sharp(watermarkBuffer)
    .resize(wmWidth, wmHeight, { fit: "inside" })
    .ensureAlpha()
    .rotate(-45, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Get rotated dimensions
  const rotatedMeta = await sharp(resizedWatermark).metadata();
  const rotatedWidth = rotatedMeta.width || wmWidth;
  const rotatedHeight = rotatedMeta.height || wmHeight;

  // Center the rotated watermark
  const left = Math.round((imageWidth - rotatedWidth) / 2);
  const top = Math.round((imageHeight - rotatedHeight) / 2);

  // Create canvas with diagonal watermark
  const diagonalCanvas = await sharp({
    create: {
      width: imageWidth,
      height: imageHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resizedWatermark,
        left: Math.max(0, left),
        top: Math.max(0, top),
        blend: "over" as const,
      },
    ])
    .png()
    .toBuffer();

  // Apply opacity
  return sharp(diagonalCanvas)
    .ensureAlpha()
    .linear(opacity, 0)
    .toBuffer();
}

// =============================================================================
// Main Watermark Application Function
// =============================================================================

/**
 * Apply a watermark to an image
 *
 * @param imageBuffer - The original image as a buffer
 * @param settings - Watermark settings from organization
 * @returns The watermarked image buffer
 */
export async function applyWatermark(
  imageBuffer: Buffer,
  settings: WatermarkSettings
): Promise<WatermarkResult> {
  if (!settings.enabled) {
    // Return original image if watermarking is disabled
    const metadata = await sharp(imageBuffer).metadata();
    return {
      buffer: imageBuffer,
      format: (metadata.format as "jpeg" | "png" | "webp") || "jpeg",
    };
  }

  // Get image dimensions
  const imageMeta = await sharp(imageBuffer).metadata();
  const imageWidth = imageMeta.width || 1920;
  const imageHeight = imageMeta.height || 1080;

  // Create watermark buffer based on type
  let watermarkBuffer: Buffer;

  if (settings.type === "image" && settings.imageUrl) {
    watermarkBuffer = await fetchWatermarkImage(settings.imageUrl);
  } else {
    // Default to text watermark
    const text = settings.text || "© Protected";
    watermarkBuffer = await createTextWatermark(text, imageWidth, settings.scale, settings.opacity);
  }

  // Handle special positions (tiled, diagonal)
  if (settings.position === "tiled") {
    const tiledOverlay = await createTiledPattern(
      watermarkBuffer,
      imageWidth,
      imageHeight,
      settings.scale,
      settings.opacity
    );

    const result = await sharp(imageBuffer)
      .composite([{ input: tiledOverlay, blend: "over" }])
      .jpeg({ quality: 90 })
      .toBuffer();

    return { buffer: result, format: "jpeg" };
  }

  if (settings.position === "diagonal") {
    const diagonalOverlay = await createDiagonalPattern(
      watermarkBuffer,
      imageWidth,
      imageHeight,
      settings.scale,
      settings.opacity
    );

    const result = await sharp(imageBuffer)
      .composite([{ input: diagonalOverlay, blend: "over" }])
      .jpeg({ quality: 90 })
      .toBuffer();

    return { buffer: result, format: "jpeg" };
  }

  // Standard positioned watermark
  const watermarkMeta = await sharp(watermarkBuffer).metadata();
  const wmWidth = Math.round((watermarkMeta.width || 100) * settings.scale);
  const wmHeight = Math.round((watermarkMeta.height || 100) * settings.scale);

  // Resize watermark
  const resizedWatermark = await sharp(watermarkBuffer)
    .resize(wmWidth, wmHeight, { fit: "inside" })
    .ensureAlpha()
    .toBuffer();

  // Get actual resized dimensions
  const resizedMeta = await sharp(resizedWatermark).metadata();
  const actualWidth = resizedMeta.width || wmWidth;
  const actualHeight = resizedMeta.height || wmHeight;

  // Calculate position
  const pos = calculatePosition(imageWidth, imageHeight, actualWidth, actualHeight, settings.position);

  // Apply opacity to watermark
  const opaqueWatermark = await sharp(resizedWatermark)
    .ensureAlpha()
    .linear(settings.opacity, 0)
    .toBuffer();

  // Composite watermark onto image
  const result = await sharp(imageBuffer)
    .composite([
      {
        input: opaqueWatermark,
        left: pos.left,
        top: pos.top,
        blend: "over" as const,
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  return { buffer: result, format: "jpeg" };
}

/**
 * Apply watermark to multiple images with concurrency limit
 */
export async function applyWatermarkBatch(
  images: Array<{ id: string; buffer: Buffer }>,
  settings: WatermarkSettings,
  concurrency: number = 3
): Promise<Map<string, WatermarkResult>> {
  const results = new Map<string, WatermarkResult>();
  const queue = [...images];

  const workers = Array(Math.min(concurrency, queue.length))
    .fill(null)
    .map(async () => {
      while (queue.length > 0) {
        const image = queue.shift();
        if (!image) break;

        try {
          const result = await applyWatermark(image.buffer, settings);
          results.set(image.id, result);
        } catch (error) {
          console.error(`Failed to apply watermark to image ${image.id}:`, error);
          // Return original on failure
          results.set(image.id, { buffer: image.buffer, format: "jpeg" });
        }
      }
    });

  await Promise.all(workers);
  return results;
}
