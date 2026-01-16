/**
 * CMS Media Library Utilities
 * Handles file upload, processing, and storage abstraction
 */

import { prisma } from "@/lib/db";
import type { MediaAsset, MediaAssetType, MediaFolder } from "@prisma/client";
import crypto from "crypto";

// ============================================================================
// TYPES
// ============================================================================

export interface UploadOptions {
  folderId?: string;
  tags?: string[];
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  credit?: string;
  isPublic?: boolean;
  uploadedBy?: string;
  uploadedByName?: string;
}

export interface ProcessedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: MediaAssetType;
  url: string;
  storageKey: string;
  provider: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  blurhash?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  variants?: Record<string, string>;
  exifData?: Record<string, unknown>;
}

export interface MediaSearchOptions {
  query?: string;
  type?: MediaAssetType;
  folderId?: string | null; // null for root folder
  tags?: string[];
  isPublic?: boolean;
  isFavorite?: boolean;
  uploadedBy?: string;
  sortBy?: "createdAt" | "name" | "size" | "usageCount";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface MediaStats {
  totalAssets: number;
  totalSize: number;
  byType: Record<string, number>;
  recentUploads: number;
  favorites: number;
}

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
// UTILITY FUNCTIONS
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
 * Generate a unique filename
 */
export function generateFilename(originalName: string): string {
  const ext = originalName.split(".").pop() || "";
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  const baseName = originalName
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[^a-zA-Z0-9]/g, "-") // Replace special chars
    .replace(/-+/g, "-") // Replace multiple dashes
    .substring(0, 50) // Limit length
    .toLowerCase();

  return `${baseName}-${timestamp}-${random}.${ext}`;
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
 * Get icon name for asset type
 */
export function getAssetIcon(type: MediaAssetType): string {
  switch (type) {
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "audio":
      return "Music";
    case "document":
      return "FileText";
    case "archive":
      return "Archive";
    default:
      return "File";
  }
}

/**
 * Generate slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ============================================================================
// FOLDER OPERATIONS
// ============================================================================

/**
 * Get folder path (breadcrumb)
 */
export async function getFolderPath(
  folderId: string
): Promise<{ id: string; name: string; slug: string }[]> {
  const path: { id: string; name: string; slug: string }[] = [];

  let currentId: string | null = folderId;

  while (currentId) {
    const folder = await prisma.mediaFolder.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, slug: true, parentId: true },
    });

    if (!folder) break;

    path.unshift({
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
    });

    currentId = folder.parentId;
  }

  return path;
}

/**
 * Get folder tree structure
 */
export async function getFolderTree(): Promise<
  (MediaFolder & { children?: MediaFolder[]; assetCount: number })[]
> {
  // Get all folders
  const folders = await prisma.mediaFolder.findMany({
    orderBy: { name: "asc" },
  });

  // Get asset counts per folder
  const assetCounts = await prisma.mediaAsset.groupBy({
    by: ["folderId"],
    _count: { id: true },
  });

  const countMap = new Map(
    assetCounts.map((c) => [c.folderId, c._count.id])
  );

  // Build tree structure
  const folderMap = new Map<
    string,
    MediaFolder & { children: MediaFolder[]; assetCount: number }
  >();

  // Initialize all folders
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      ...folder,
      children: [],
      assetCount: countMap.get(folder.id) || 0,
    });
  });

  // Build parent-child relationships
  const rootFolders: (MediaFolder & {
    children: MediaFolder[];
    assetCount: number;
  })[] = [];

  folders.forEach((folder) => {
    const folderWithChildren = folderMap.get(folder.id)!;
    if (folder.parentId) {
      const parent = folderMap.get(folder.parentId);
      if (parent) {
        parent.children.push(folderWithChildren);
      }
    } else {
      rootFolders.push(folderWithChildren);
    }
  });

  return rootFolders;
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

/**
 * Search media assets
 */
export async function searchAssets(
  options: MediaSearchOptions
): Promise<{ assets: MediaAsset[]; total: number }> {
  const {
    query,
    type,
    folderId,
    tags,
    isPublic,
    isFavorite,
    uploadedBy,
    sortBy = "createdAt",
    sortOrder = "desc",
    limit = 50,
    offset = 0,
  } = options;

  // Build where clause
  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { filename: { contains: query, mode: "insensitive" } },
      { originalName: { contains: query, mode: "insensitive" } },
      { title: { contains: query, mode: "insensitive" } },
      { alt: { contains: query, mode: "insensitive" } },
      { caption: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (type) {
    where.type = type;
  }

  // folderId can be null (root) or a specific folder
  if (folderId !== undefined) {
    where.folderId = folderId;
  }

  if (tags && tags.length > 0) {
    where.tags = { hasEvery: tags };
  }

  if (isPublic !== undefined) {
    where.isPublic = isPublic;
  }

  if (isFavorite !== undefined) {
    where.isFavorite = isFavorite;
  }

  if (uploadedBy) {
    where.uploadedBy = uploadedBy;
  }

  // Get total count
  const total = await prisma.mediaAsset.count({ where });

  // Get assets
  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    take: limit,
    skip: offset,
  });

  return { assets, total };
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get media library statistics
 */
export async function getMediaStats(): Promise<MediaStats> {
  const [totalAssets, totalSizeResult, byTypeResult, recentUploads, favorites] =
    await Promise.all([
      prisma.mediaAsset.count(),
      prisma.mediaAsset.aggregate({ _sum: { size: true } }),
      prisma.mediaAsset.groupBy({
        by: ["type"],
        _count: { id: true },
      }),
      prisma.mediaAsset.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.mediaAsset.count({ where: { isFavorite: true } }),
    ]);

  const byType: Record<string, number> = {};
  byTypeResult.forEach((item) => {
    byType[item.type] = item._count.id;
  });

  return {
    totalAssets,
    totalSize: totalSizeResult._sum.size || 0,
    byType,
    recentUploads,
    favorites,
  };
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Track asset usage when inserted into content
 */
export async function trackAssetUsage(
  assetId: string,
  entityType: string,
  entityId: string,
  field: string
): Promise<void> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
    select: { usedIn: true },
  });

  if (!asset) return;

  const usedIn = (asset.usedIn as { entityType: string; entityId: string; field: string }[]) || [];

  // Check if already tracked
  const exists = usedIn.some(
    (u) =>
      u.entityType === entityType &&
      u.entityId === entityId &&
      u.field === field
  );

  if (!exists) {
    usedIn.push({ entityType, entityId, field });

    await prisma.mediaAsset.update({
      where: { id: assetId },
      data: {
        usedIn,
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }
}

/**
 * Remove asset usage tracking
 */
export async function removeAssetUsage(
  assetId: string,
  entityType: string,
  entityId: string,
  field?: string
): Promise<void> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
    select: { usedIn: true, usageCount: true },
  });

  if (!asset) return;

  const usedIn = (asset.usedIn as { entityType: string; entityId: string; field: string }[]) || [];

  const filteredUsedIn = usedIn.filter(
    (u) =>
      !(
        u.entityType === entityType &&
        u.entityId === entityId &&
        (field === undefined || u.field === field)
      )
  );

  const removedCount = usedIn.length - filteredUsedIn.length;

  if (removedCount > 0) {
    await prisma.mediaAsset.update({
      where: { id: assetId },
      data: {
        usedIn: filteredUsedIn,
        usageCount: Math.max(0, (asset.usageCount || 0) - removedCount),
      },
    });
  }
}

/**
 * Get all assets used in a specific entity
 */
export async function getEntityAssets(
  entityType: string,
  entityId: string
): Promise<MediaAsset[]> {
  // This requires a JSON query which varies by database
  // For PostgreSQL:
  const assets = await prisma.mediaAsset.findMany({
    where: {
      usedIn: {
        path: [],
        array_contains: { entityType, entityId },
      },
    },
  });

  return assets;
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Find unused assets (not used in any content)
 */
export async function findUnusedAssets(
  olderThanDays: number = 30
): Promise<MediaAsset[]> {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  return prisma.mediaAsset.findMany({
    where: {
      usageCount: 0,
      createdAt: { lt: cutoffDate },
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Get storage usage by provider
 */
export async function getStorageByProvider(): Promise<
  { provider: string; count: number; size: number }[]
> {
  const result = await prisma.mediaAsset.groupBy({
    by: ["provider"],
    _count: { id: true },
    _sum: { size: true },
  });

  return result.map((r) => ({
    provider: r.provider,
    count: r._count.id,
    size: r._sum.size || 0,
  }));
}
