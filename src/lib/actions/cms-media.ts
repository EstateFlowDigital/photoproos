"use server";

import { db } from "@/lib/db";
import { isSuperAdmin, currentUser } from "@/lib/auth/super-admin";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import type { MediaAsset, MediaFolder, MediaAssetType } from "@prisma/client";
import {
  generateSlug,
  generateFilename,
  getAssetType,
  searchAssets,
  getMediaStats,
  getFolderTree,
  getFolderPath,
} from "@/lib/cms/media";

// ============================================================================
// FOLDER ACTIONS
// ============================================================================

/**
 * Get all folders (tree structure)
 */
export async function getMediaFolders(): Promise<
  ActionResult<(MediaFolder & { children?: MediaFolder[]; assetCount: number })[]>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const folders = await getFolderTree();
    return success(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return fail("Failed to fetch folders");
  }
}

/**
 * Get folder by ID
 */
export async function getMediaFolder(
  id: string
): Promise<ActionResult<MediaFolder & { path: { id: string; name: string; slug: string }[] }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const folder = await db.mediaFolder.findUnique({
      where: { id },
    });

    if (!folder) {
      return fail("Folder not found");
    }

    const path = await getFolderPath(id);

    return success({ ...folder, path });
  } catch (error) {
    console.error("Error fetching folder:", error);
    return fail("Failed to fetch folder");
  }
}

/**
 * Create a new folder
 */
export async function createMediaFolder(params: {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
}): Promise<ActionResult<MediaFolder>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    // Generate unique slug
    let slug = generateSlug(params.name);
    let suffix = 0;

    while (await db.mediaFolder.findUnique({ where: { slug } })) {
      suffix++;
      slug = `${generateSlug(params.name)}-${suffix}`;
    }

    const folder = await db.mediaFolder.create({
      data: {
        name: params.name,
        description: params.description,
        slug,
        parentId: params.parentId,
        color: params.color,
        createdBy: user?.id,
        createdByName: user?.firstName || user?.emailAddresses?.[0]?.emailAddress,
      },
    });

    return success(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    return fail("Failed to create folder");
  }
}

/**
 * Update a folder
 */
export async function updateMediaFolder(
  id: string,
  params: {
    name?: string;
    description?: string;
    parentId?: string | null;
    color?: string;
  }
): Promise<ActionResult<MediaFolder>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Check for circular reference
    if (params.parentId) {
      const path = await getFolderPath(params.parentId);
      if (path.some((p) => p.id === id)) {
        return fail("Cannot move folder into its own subfolder");
      }
    }

    const folder = await db.mediaFolder.update({
      where: { id },
      data: {
        ...(params.name && { name: params.name }),
        ...(params.description !== undefined && { description: params.description }),
        ...(params.parentId !== undefined && { parentId: params.parentId }),
        ...(params.color !== undefined && { color: params.color }),
      },
    });

    return success(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    return fail("Failed to update folder");
  }
}

/**
 * Delete a folder (moves contents to parent or root)
 */
export async function deleteMediaFolder(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const folder = await db.mediaFolder.findUnique({
      where: { id },
      include: { children: true, assets: true },
    });

    if (!folder) {
      return fail("Folder not found");
    }

    // Move children to parent folder
    if (folder.children.length > 0) {
      await db.mediaFolder.updateMany({
        where: { parentId: id },
        data: { parentId: folder.parentId },
      });
    }

    // Move assets to parent folder
    if (folder.assets.length > 0) {
      await db.mediaAsset.updateMany({
        where: { folderId: id },
        data: { folderId: folder.parentId },
      });
    }

    // Delete the folder
    await db.mediaFolder.delete({ where: { id } });

    return success(undefined);
  } catch (error) {
    console.error("Error deleting folder:", error);
    return fail("Failed to delete folder");
  }
}

// ============================================================================
// ASSET ACTIONS
// ============================================================================

/**
 * Get media assets with search/filter
 */
export async function getMediaAssets(options?: {
  query?: string;
  type?: MediaAssetType;
  folderId?: string | null;
  tags?: string[];
  isPublic?: boolean;
  isFavorite?: boolean;
  sortBy?: "createdAt" | "name" | "size" | "usageCount";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}): Promise<ActionResult<{ assets: MediaAsset[]; total: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const result = await searchAssets(options || {});
    return success(result);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return fail("Failed to fetch assets");
  }
}

/**
 * Get single asset by ID
 */
export async function getMediaAsset(
  id: string
): Promise<ActionResult<MediaAsset & { folder?: MediaFolder | null }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const asset = await db.mediaAsset.findUnique({
      where: { id },
      include: { folder: true },
    });

    if (!asset) {
      return fail("Asset not found");
    }

    return success(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return fail("Failed to fetch asset");
  }
}

/**
 * Create/register a new media asset (called after upload)
 */
export async function createMediaAsset(params: {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  storageKey: string;
  provider?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  blurhash?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  variants?: Record<string, string>;
  exifData?: Record<string, unknown>;
  folderId?: string;
  tags?: string[];
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  credit?: string;
  isPublic?: boolean;
}): Promise<ActionResult<MediaAsset>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    const type = getAssetType(params.mimeType);

    const asset = await db.mediaAsset.create({
      data: {
        filename: params.filename,
        originalName: params.originalName,
        mimeType: params.mimeType,
        size: params.size,
        type,
        url: params.url,
        storageKey: params.storageKey,
        provider: params.provider || "local",
        width: params.width,
        height: params.height,
        aspectRatio: params.aspectRatio,
        blurhash: params.blurhash,
        thumbnailUrl: params.thumbnailUrl,
        mediumUrl: params.mediumUrl,
        largeUrl: params.largeUrl,
        variants: params.variants,
        exifData: params.exifData,
        folderId: params.folderId,
        tags: params.tags || [],
        title: params.title,
        alt: params.alt,
        caption: params.caption,
        description: params.description,
        credit: params.credit,
        isPublic: params.isPublic ?? true,
        uploadedBy: user?.id,
        uploadedByName: user?.firstName || user?.emailAddresses?.[0]?.emailAddress,
      },
    });

    return success(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    return fail("Failed to create asset");
  }
}

/**
 * Update asset metadata
 */
export async function updateMediaAsset(
  id: string,
  params: {
    folderId?: string | null;
    tags?: string[];
    title?: string;
    alt?: string;
    caption?: string;
    description?: string;
    credit?: string;
    isPublic?: boolean;
    isFavorite?: boolean;
  }
): Promise<ActionResult<MediaAsset>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const asset = await db.mediaAsset.update({
      where: { id },
      data: {
        ...(params.folderId !== undefined && { folderId: params.folderId }),
        ...(params.tags !== undefined && { tags: params.tags }),
        ...(params.title !== undefined && { title: params.title }),
        ...(params.alt !== undefined && { alt: params.alt }),
        ...(params.caption !== undefined && { caption: params.caption }),
        ...(params.description !== undefined && { description: params.description }),
        ...(params.credit !== undefined && { credit: params.credit }),
        ...(params.isPublic !== undefined && { isPublic: params.isPublic }),
        ...(params.isFavorite !== undefined && { isFavorite: params.isFavorite }),
      },
    });

    return success(asset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return fail("Failed to update asset");
  }
}

/**
 * Delete an asset
 */
export async function deleteMediaAsset(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // TODO: Also delete from storage provider
    await db.mediaAsset.delete({ where: { id } });

    return success(undefined);
  } catch (error) {
    console.error("Error deleting asset:", error);
    return fail("Failed to delete asset");
  }
}

/**
 * Bulk delete assets
 */
export async function deleteMediaAssets(ids: string[]): Promise<ActionResult<{ deleted: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // TODO: Also delete from storage provider
    const result = await db.mediaAsset.deleteMany({
      where: { id: { in: ids } },
    });

    return success({ deleted: result.count });
  } catch (error) {
    console.error("Error deleting assets:", error);
    return fail("Failed to delete assets");
  }
}

/**
 * Move assets to folder
 */
export async function moveMediaAssets(
  ids: string[],
  folderId: string | null
): Promise<ActionResult<{ moved: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const result = await db.mediaAsset.updateMany({
      where: { id: { in: ids } },
      data: { folderId },
    });

    return success({ moved: result.count });
  } catch (error) {
    console.error("Error moving assets:", error);
    return fail("Failed to move assets");
  }
}

/**
 * Toggle favorite status
 */
export async function toggleMediaFavorite(id: string): Promise<ActionResult<MediaAsset>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const asset = await db.mediaAsset.findUnique({
      where: { id },
      select: { isFavorite: true },
    });

    if (!asset) {
      return fail("Asset not found");
    }

    const updated = await db.mediaAsset.update({
      where: { id },
      data: { isFavorite: !asset.isFavorite },
    });

    return success(updated);
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return fail("Failed to toggle favorite");
  }
}

/**
 * Add tags to assets
 */
export async function addMediaTags(
  ids: string[],
  tags: string[]
): Promise<ActionResult<{ updated: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Get current assets and their tags
    const assets = await db.mediaAsset.findMany({
      where: { id: { in: ids } },
      select: { id: true, tags: true },
    });

    // Update each asset with merged tags
    const updatePromises = assets.map((asset) => {
      const currentTags = asset.tags || [];
      const newTags = [...new Set([...currentTags, ...tags])];

      return db.mediaAsset.update({
        where: { id: asset.id },
        data: { tags: newTags },
      });
    });

    await Promise.all(updatePromises);

    return success({ updated: assets.length });
  } catch (error) {
    console.error("Error adding tags:", error);
    return fail("Failed to add tags");
  }
}

/**
 * Remove tags from assets
 */
export async function removeMediaTags(
  ids: string[],
  tags: string[]
): Promise<ActionResult<{ updated: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const assets = await db.mediaAsset.findMany({
      where: { id: { in: ids } },
      select: { id: true, tags: true },
    });

    const updatePromises = assets.map((asset) => {
      const currentTags = asset.tags || [];
      const newTags = currentTags.filter((t) => !tags.includes(t));

      return db.mediaAsset.update({
        where: { id: asset.id },
        data: { tags: newTags },
      });
    });

    await Promise.all(updatePromises);

    return success({ updated: assets.length });
  } catch (error) {
    console.error("Error removing tags:", error);
    return fail("Failed to remove tags");
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get media library statistics
 */
export async function getMediaStatistics(): Promise<
  ActionResult<{
    totalAssets: number;
    totalSize: number;
    byType: Record<string, number>;
    recentUploads: number;
    favorites: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const stats = await getMediaStats();
    return success(stats);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return fail("Failed to fetch statistics");
  }
}

/**
 * Get all unique tags
 */
export async function getAllMediaTags(): Promise<ActionResult<{ tag: string; count: number }[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const assets = await db.mediaAsset.findMany({
      select: { tags: true },
    });

    const tagCounts = new Map<string, number>();
    assets.forEach((asset) => {
      asset.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const tags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return success(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return fail("Failed to fetch tags");
  }
}

// ============================================================================
// DUPLICATE FILENAME HELPER
// ============================================================================

/**
 * Generate unique filename (avoiding collisions)
 */
export async function getUniqueFilename(originalName: string): Promise<ActionResult<string>> {
  try {
    const filename = generateFilename(originalName);
    return success(filename);
  } catch (error) {
    console.error("Error generating filename:", error);
    return fail("Failed to generate filename");
  }
}
