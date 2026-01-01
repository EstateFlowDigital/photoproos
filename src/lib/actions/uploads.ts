"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  generateFileKey,
  generatePresignedUploadUrl,
  generateBatchPresignedUrls,
  deleteFile,
  deleteFiles,
  isAllowedImageType,
  isValidFileSize,
  getPublicUrl,
  type PresignedUrlResponse,
} from "@/lib/storage";

// =============================================================================
// Types
// =============================================================================

export interface UploadRequestFile {
  filename: string;
  contentType: string;
  size: number;
}

export interface UploadPresignedUrlResult {
  success: boolean;
  data?: {
    files: Array<{
      filename: string;
      key: string;
      uploadUrl: string;
      publicUrl: string;
      expiresAt: string;
    }>;
  };
  error?: string;
}

export interface CreateAssetInput {
  projectId: string;
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  exifData?: Record<string, unknown>;
}

export interface CreateAssetResult {
  success: boolean;
  data?: {
    id: string;
    originalUrl: string;
  };
  error?: string;
}

export interface BulkCreateAssetsResult {
  success: boolean;
  data?: {
    assets: Array<{
      id: string;
      originalUrl: string;
      filename: string;
    }>;
  };
  error?: string;
}

// =============================================================================
// Generate Presigned URLs for Upload
// =============================================================================

/**
 * Generate presigned URLs for uploading files to R2
 * Called before the client-side upload begins
 */
export async function getUploadPresignedUrls(
  organizationId: string,
  galleryId: string,
  files: UploadRequestFile[]
): Promise<UploadPresignedUrlResult> {
  try {
    // Validate inputs
    if (!organizationId || !galleryId) {
      return { success: false, error: "Missing organization or gallery ID" };
    }

    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" };
    }

    // Validate each file
    for (const file of files) {
      if (!isAllowedImageType(file.contentType)) {
        return {
          success: false,
          error: `Invalid file type: ${file.contentType}. Allowed: JPEG, PNG, GIF, WEBP, HEIC`,
        };
      }

      if (!isValidFileSize(file.size)) {
        return {
          success: false,
          error: `File "${file.filename}" exceeds maximum size of 50MB`,
        };
      }
    }

    // Verify gallery exists and belongs to organization
    const gallery = await prisma.project.findFirst({
      where: {
        id: galleryId,
        organizationId,
      },
      select: { id: true },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Generate keys and presigned URLs for each file
    const filesWithKeys = files.map((file) => ({
      ...file,
      key: generateFileKey(organizationId, galleryId, file.filename),
    }));

    const presignedUrls = await generateBatchPresignedUrls(
      filesWithKeys.map((f) => ({
        key: f.key,
        contentType: f.contentType,
        contentLength: f.size,
      })),
      3600 // 1 hour expiration
    );

    // Combine file info with presigned URLs
    const result = filesWithKeys.map((file, index) => ({
      filename: file.filename,
      key: file.key,
      uploadUrl: presignedUrls[index].uploadUrl,
      publicUrl: presignedUrls[index].publicUrl,
      expiresAt: presignedUrls[index].expiresAt.toISOString(),
    }));

    return {
      success: true,
      data: { files: result },
    };
  } catch (error) {
    console.error("[Upload] Error generating presigned URLs:", error);
    return {
      success: false,
      error: "Failed to generate upload URLs. Please try again.",
    };
  }
}

// =============================================================================
// Create Asset Records After Upload
// =============================================================================

/**
 * Create a single asset record in the database after successful upload
 */
export async function createAsset(
  organizationId: string,
  input: CreateAssetInput
): Promise<CreateAssetResult> {
  try {
    // Verify gallery exists and belongs to organization
    const gallery = await prisma.project.findFirst({
      where: {
        id: input.projectId,
        organizationId,
      },
      select: {
        id: true,
        _count: { select: { assets: true } },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Create the asset record
    const asset = await prisma.asset.create({
      data: {
        projectId: input.projectId,
        filename: input.filename,
        originalUrl: getPublicUrl(input.key),
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        width: input.width,
        height: input.height,
        exifData: input.exifData,
        sortOrder: gallery._count.assets, // Add at end
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        action: "file_uploaded",
        resourceType: "asset",
        resourceId: asset.id,
        metadata: {
          filename: input.filename,
          galleryId: input.projectId,
          sizeBytes: input.sizeBytes,
        },
      },
    });

    // Revalidate gallery pages
    revalidatePath(`/galleries/${input.projectId}`);

    return {
      success: true,
      data: {
        id: asset.id,
        originalUrl: asset.originalUrl,
      },
    };
  } catch (error) {
    console.error("[Upload] Error creating asset:", error);
    return {
      success: false,
      error: "Failed to save photo. Please try again.",
    };
  }
}

/**
 * Create multiple asset records in the database after successful batch upload
 */
export async function createAssets(
  organizationId: string,
  projectId: string,
  assets: Array<Omit<CreateAssetInput, "projectId">>
): Promise<BulkCreateAssetsResult> {
  try {
    // Verify gallery exists and belongs to organization
    const gallery = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
        _count: { select: { assets: true } },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    const startingSortOrder = gallery._count.assets;

    // Create all assets in a transaction
    const createdAssets = await prisma.$transaction(
      assets.map((asset, index) =>
        prisma.asset.create({
          data: {
            projectId,
            filename: asset.filename,
            originalUrl: getPublicUrl(asset.key),
            mimeType: asset.mimeType,
            sizeBytes: asset.sizeBytes,
            width: asset.width,
            height: asset.height,
            exifData: asset.exifData,
            sortOrder: startingSortOrder + index,
          },
        })
      )
    );

    // Log activity for batch upload
    await prisma.activityLog.create({
      data: {
        organizationId,
        action: "file_uploaded",
        resourceType: "project",
        resourceId: projectId,
        metadata: {
          count: assets.length,
          filenames: assets.map((a) => a.filename),
        },
      },
    });

    // Revalidate gallery pages
    revalidatePath(`/galleries/${projectId}`);

    return {
      success: true,
      data: {
        assets: createdAssets.map((asset) => ({
          id: asset.id,
          originalUrl: asset.originalUrl,
          filename: asset.filename,
        })),
      },
    };
  } catch (error) {
    console.error("[Upload] Error creating assets:", error);
    return {
      success: false,
      error: "Failed to save photos. Please try again.",
    };
  }
}

// =============================================================================
// Delete Assets
// =============================================================================

/**
 * Delete an asset from both R2 and the database
 */
export async function deleteAsset(
  organizationId: string,
  assetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the asset and verify ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        project: {
          organizationId,
        },
      },
      select: {
        id: true,
        originalUrl: true,
        thumbnailUrl: true,
        mediumUrl: true,
        watermarkedUrl: true,
        projectId: true,
      },
    });

    if (!asset) {
      return { success: false, error: "Asset not found" };
    }

    // Extract keys from URLs and delete from R2
    const urlsToDelete = [
      asset.originalUrl,
      asset.thumbnailUrl,
      asset.mediumUrl,
      asset.watermarkedUrl,
    ].filter(Boolean) as string[];

    // Convert URLs to keys
    const keysToDelete = urlsToDelete.map((url) => {
      // Extract key from URL (everything after the bucket domain)
      const match = url.match(/\.r2\.dev\/(.+)$/) || url.match(/R2_PUBLIC_URL\/(.+)$/);
      return match ? match[1] : url;
    });

    // Delete from R2
    await deleteFiles(keysToDelete);

    // Delete from database
    await prisma.asset.delete({
      where: { id: assetId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        action: "file_deleted",
        resourceType: "asset",
        resourceId: assetId,
        metadata: {
          galleryId: asset.projectId,
        },
      },
    });

    // Revalidate gallery pages
    revalidatePath(`/galleries/${asset.projectId}`);

    return { success: true };
  } catch (error) {
    console.error("[Upload] Error deleting asset:", error);
    return {
      success: false,
      error: "Failed to delete photo. Please try again.",
    };
  }
}

/**
 * Delete multiple assets
 */
export async function deleteAssets(
  organizationId: string,
  assetIds: string[]
): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    let deleted = 0;

    for (const assetId of assetIds) {
      const result = await deleteAsset(organizationId, assetId);
      if (result.success) {
        deleted++;
      }
    }

    return { success: true, deleted };
  } catch (error) {
    console.error("[Upload] Error deleting assets:", error);
    return {
      success: false,
      deleted: 0,
      error: "Failed to delete photos. Please try again.",
    };
  }
}

// =============================================================================
// Update Asset
// =============================================================================

/**
 * Update asset metadata (e.g., after generating thumbnails)
 */
export async function updateAssetUrls(
  organizationId: string,
  assetId: string,
  urls: {
    thumbnailUrl?: string;
    mediumUrl?: string;
    watermarkedUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        project: {
          organizationId,
        },
      },
    });

    if (!asset) {
      return { success: false, error: "Asset not found" };
    }

    await prisma.asset.update({
      where: { id: assetId },
      data: urls,
    });

    return { success: true };
  } catch (error) {
    console.error("[Upload] Error updating asset URLs:", error);
    return {
      success: false,
      error: "Failed to update photo. Please try again.",
    };
  }
}
