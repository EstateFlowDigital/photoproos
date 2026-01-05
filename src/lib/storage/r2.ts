import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// =============================================================================
// R2 Configuration
// =============================================================================

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "photoproos";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

// Initialize R2 Client (S3-compatible)
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// =============================================================================
// Types
// =============================================================================

export interface UploadedFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface PresignedUrlOptions {
  key: string;
  contentType: string;
  contentLength?: number;
  expiresIn?: number; // seconds, default 3600 (1 hour)
  metadata?: Record<string, string>;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresAt: Date;
}

// Allowed file types for photo uploads
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

// Max file size: 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a unique key for file storage
 * Format: {organizationId}/{galleryId}/{timestamp}-{random}.{extension}
 */
export function generateFileKey(
  organizationId: string,
  galleryId: string,
  filename: string,
  variant?: "original" | "thumbnail" | "medium" | "watermarked"
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  const variantSuffix = variant && variant !== "original" ? `-${variant}` : "";

  return `${organizationId}/${galleryId}/${timestamp}-${random}${variantSuffix}.${extension}`;
}

/**
 * Get the public URL for a file
 */
export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }
  // Fallback to R2.dev URL pattern
  return `https://${R2_BUCKET_NAME}.r2.dev/${key}`;
}

/**
 * Extract the object key from a public R2 URL.
 * Supports custom public URLs, r2.dev, and direct bucket endpoints.
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url) return null;

  const trimmedPublic = R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (trimmedPublic && url.startsWith(trimmedPublic)) {
    return url.slice(trimmedPublic.length + 1);
  }

  const devMatch = url.match(/https?:\/\/[^/]+\.r2\.dev\/(.+)/);
  if (devMatch?.[1]) {
    return devMatch[1];
  }

  const cfMatch = url.match(/https?:\/\/[^/]+\.cloudflarestorage\.com\/(.+)/);
  if (cfMatch?.[1]) {
    return cfMatch[1];
  }

  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, "") || null;
  } catch {
    return null;
  }
}

/**
 * Validate file type
 */
export function isAllowedImageType(contentType: string): contentType is AllowedImageType {
  return ALLOWED_IMAGE_TYPES.includes(contentType as AllowedImageType);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

// =============================================================================
// Presigned URL Operations
// =============================================================================

/**
 * Generate a presigned URL for uploading a file directly to R2
 * This allows the browser to upload directly without going through our server
 */
export async function generatePresignedUploadUrl(
  options: PresignedUrlOptions
): Promise<PresignedUrlResponse> {
  const { key, contentType, contentLength, expiresIn = 3600, metadata = {} } = options;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
    CacheControl: "public, max-age=31536000, immutable", // Cache for 1 year (images are immutable)
    Metadata: metadata,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return {
    uploadUrl,
    publicUrl: getPublicUrl(key),
    key,
    expiresAt,
  };
}

/**
 * Generate a presigned URL for downloading/viewing a file
 * Use this for private files that shouldn't be publicly accessible
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

// =============================================================================
// Direct Upload/Delete Operations (Server-side only)
// =============================================================================

/**
 * Upload a file directly from the server
 * Use this for processed images (thumbnails, watermarked versions)
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  contentType: string,
  metadata?: Record<string, string>
): Promise<UploadedFile> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable", // Cache for 1 year
    Metadata: metadata,
  });

  await r2Client.send(command);

  // Get file info after upload
  const headCommand = new HeadObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  const headResult = await r2Client.send(headCommand);

  return {
    key,
    url: getPublicUrl(key),
    size: headResult.ContentLength || 0,
    contentType,
  };
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Delete multiple files from R2
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  // R2 doesn't support batch delete, so we delete one by one
  await Promise.all(keys.map((key) => deleteFile(key)));
}

/**
 * Delete all files in a folder (e.g., all photos for a gallery)
 */
export async function deleteFolder(prefix: string): Promise<void> {
  // List all objects with the prefix
  const listCommand = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
  });

  const result = await r2Client.send(listCommand);

  if (result.Contents && result.Contents.length > 0) {
    const keys = result.Contents.map((obj) => obj.Key!).filter(Boolean);
    await deleteFiles(keys);
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(key: string): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
  metadata: Record<string, string>;
} | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    const result = await r2Client.send(command);

    return {
      size: result.ContentLength || 0,
      contentType: result.ContentType || "application/octet-stream",
      lastModified: result.LastModified || new Date(),
      metadata: result.Metadata || {},
    };
  } catch {
    return null;
  }
}

// =============================================================================
// Batch Operations
// =============================================================================

/**
 * Generate presigned URLs for multiple files
 * Use this when uploading multiple photos at once
 */
export async function generateBatchPresignedUrls(
  files: Array<{
    key: string;
    contentType: string;
    contentLength?: number;
  }>,
  expiresIn: number = 3600
): Promise<PresignedUrlResponse[]> {
  return Promise.all(
    files.map((file) =>
      generatePresignedUploadUrl({
        key: file.key,
        contentType: file.contentType,
        contentLength: file.contentLength,
        expiresIn,
      })
    )
  );
}
