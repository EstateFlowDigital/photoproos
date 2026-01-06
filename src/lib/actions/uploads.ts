"use server";

import { ok, fail, type VoidActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import {
  generateFileKey,
  generatePresignedUploadUrl,
  generateBatchPresignedUrls,
  deleteFile,
  deleteFiles,
  isAllowedImageType,
  isValidFileSize,
  getPublicUrl,
  extractKeyFromUrl,
  type PresignedUrlResponse,
} from "@/lib/storage";
import { requireOrganizationId } from "./auth-helper";

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
 * organizationId is optional - will be fetched from session if not provided
 */
export async function getUploadPresignedUrls(
  galleryId: string,
  files: UploadRequestFile[]
): Promise<UploadPresignedUrlResult> {
  try {
    // Get organizationId from session
    const organizationId = await requireOrganizationId();

    // Validate inputs
    if (!galleryId) {
      return fail("Missing gallery ID");
    }

    if (!files || files.length === 0) {
      return fail("No files provided");
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
        return fail(`File "${file.filename}" exceeds maximum size of 50MB`);
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
      return fail("Gallery not found");
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
    return fail("Failed to generate upload URLs. Please try again.",);
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
      return fail("Gallery not found");
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
        exifData: input.exifData as Prisma.InputJsonValue | undefined,
        sortOrder: gallery._count.assets, // Add at end
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "file_uploaded",
        description: `Uploaded file: ${input.filename}`,
        projectId: input.projectId,
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
    return fail("Failed to save photo. Please try again.",);
  }
}

/**
 * Create multiple asset records in the database after successful batch upload
 */
export async function createAssets(
  projectId: string,
  assets: Array<Omit<CreateAssetInput, "projectId">>
): Promise<BulkCreateAssetsResult> {
  try {
    // Get organizationId from session
    const organizationId = await requireOrganizationId();

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
      return fail("Gallery not found");
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
            exifData: asset.exifData as Prisma.InputJsonValue | undefined,
            sortOrder: startingSortOrder + index,
          },
        })
      )
    );

    // Log activity for batch upload
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "file_uploaded",
        description: `Uploaded ${assets.length} file${assets.length !== 1 ? "s" : ""} to gallery`,
        projectId,
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
    return fail("Failed to save photos. Please try again.",);
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
): Promise<VoidActionResult> {
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
      return fail("Asset not found");
    }

    // Extract keys from URLs and delete from R2
    const urlsToDelete = [
      asset.originalUrl,
      asset.thumbnailUrl,
      asset.mediumUrl,
      asset.watermarkedUrl,
    ].filter(Boolean) as string[];

    // Convert URLs to keys (handles custom/public endpoints)
    const keysToDelete = urlsToDelete
      .map((url) => extractKeyFromUrl(url))
      .filter((key): key is string => Boolean(key));

    // Delete from R2
    if (keysToDelete.length > 0) {
      await deleteFiles(keysToDelete);
    }

    // Delete from database
    await prisma.asset.delete({
      where: { id: assetId },
    });

    // Revalidate gallery pages
    revalidatePath(`/galleries/${asset.projectId}`);

    return ok();
  } catch (error) {
    console.error("[Upload] Error deleting asset:", error);
    return fail("Failed to delete photo. Please try again.",);
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
): Promise<VoidActionResult> {
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
      return fail("Asset not found");
    }

    await prisma.asset.update({
      where: { id: assetId },
      data: urls,
    });

    return ok();
  } catch (error) {
    console.error("[Upload] Error updating asset URLs:", error);
    return fail("Failed to update photo. Please try again.",);
  }
}
