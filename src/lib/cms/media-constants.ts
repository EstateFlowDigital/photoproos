/**
 * CMS Media Library Constants and Client-Safe Utilities
 *
 * This file contains constants and utility functions that can be safely
 * imported in client components (no database or server-only dependencies).
 */

import type { MediaAssetType } from "@prisma/client";

// ============================================================================
// CONSTANTS
// ============================================================================

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
];

export const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

export const SUPPORTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];

export const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
];

export const SUPPORTED_ARCHIVE_TYPES = [
  "application/zip",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-7z-compressed",
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB default

// Image variant sizes
export const IMAGE_VARIANTS = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 320 },
  medium: { width: 800, height: 800 },
  large: { width: 1920, height: 1920 },
};

// ============================================================================
// UTILITY FUNCTIONS (Client-Safe)
// ============================================================================

/**
 * Determine asset type from MIME type
 */
export function getAssetType(mimeType: string): MediaAssetType {
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) return "image";
  if (SUPPORTED_VIDEO_TYPES.includes(mimeType)) return "video";
  if (SUPPORTED_AUDIO_TYPES.includes(mimeType)) return "audio";
  if (SUPPORTED_DOCUMENT_TYPES.includes(mimeType)) return "document";
  if (SUPPORTED_ARCHIVE_TYPES.includes(mimeType)) return "archive";
  return "other";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if file type is supported
 */
export function isSupportedType(mimeType: string): boolean {
  return (
    SUPPORTED_IMAGE_TYPES.includes(mimeType) ||
    SUPPORTED_VIDEO_TYPES.includes(mimeType) ||
    SUPPORTED_AUDIO_TYPES.includes(mimeType) ||
    SUPPORTED_DOCUMENT_TYPES.includes(mimeType) ||
    SUPPORTED_ARCHIVE_TYPES.includes(mimeType)
  );
}

/**
 * Get file extension from filename
 */
export function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Get accept string for file input based on asset types
 */
export function getAcceptString(types?: MediaAssetType[]): string {
  if (!types || types.length === 0) {
    return [
      ...SUPPORTED_IMAGE_TYPES,
      ...SUPPORTED_VIDEO_TYPES,
      ...SUPPORTED_AUDIO_TYPES,
      ...SUPPORTED_DOCUMENT_TYPES,
      ...SUPPORTED_ARCHIVE_TYPES,
    ].join(",");
  }

  const mimeTypes: string[] = [];
  if (types.includes("image")) mimeTypes.push(...SUPPORTED_IMAGE_TYPES);
  if (types.includes("video")) mimeTypes.push(...SUPPORTED_VIDEO_TYPES);
  if (types.includes("audio")) mimeTypes.push(...SUPPORTED_AUDIO_TYPES);
  if (types.includes("document")) mimeTypes.push(...SUPPORTED_DOCUMENT_TYPES);
  if (types.includes("archive")) mimeTypes.push(...SUPPORTED_ARCHIVE_TYPES);

  return mimeTypes.join(",");
}
