"use server";

import { auth } from "@clerk/nextjs/server";
import {
  generatePresignedUploadUrl,
  isAllowedImageType,
  isValidFileSize,
  getPublicUrl,
} from "@/lib/storage";

// =============================================================================
// Types
// =============================================================================

export interface ServiceImageUploadRequest {
  filename: string;
  contentType: string;
  size: number;
  entityType: "addon" | "bundle" | "service";
  entityId?: string; // Optional for new entities
}

export interface ServiceImageUploadResult {
  success: boolean;
  data?: {
    uploadUrl: string;
    publicUrl: string;
    key: string;
    expiresAt: string;
  };
  error?: string;
}

// =============================================================================
// Generate Presigned URL for Service Image Upload
// =============================================================================

/**
 * Generate a presigned URL for uploading a service image to R2
 */
export async function getServiceImageUploadUrl(
  request: ServiceImageUploadRequest
): Promise<ServiceImageUploadResult> {
  try {
    // Authenticate the request
    const { orgId } = await auth();

    if (!orgId) {
      return { success: false, error: "Organization not found" };
    }

    const { filename, contentType, size, entityType, entityId } = request;

    // Validate file type
    if (!isAllowedImageType(contentType)) {
      return {
        success: false,
        error: "Invalid file type. Allowed: JPEG, PNG, GIF, WEBP",
      };
    }

    // Validate file size
    if (!isValidFileSize(size)) {
      return {
        success: false,
        error: "File too large. Maximum size is 50MB",
      };
    }

    // Generate unique file key
    const timestamp = Date.now();
    const ext = filename.split(".").pop() || "jpg";
    const entityRef = entityId || "new";
    const key = `${orgId}/services/${entityType}s/${entityRef}/${timestamp}.${ext}`;

    // Generate presigned URL
    const result = await generatePresignedUploadUrl({
      key,
      contentType,
      contentLength: size,
      expiresIn: 3600, // 1 hour expiration
    });

    return {
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        publicUrl: result.publicUrl,
        key,
        expiresAt: result.expiresAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[ServiceImages] Error generating presigned URL:", error);
    return {
      success: false,
      error: "Failed to generate upload URL. Please try again.",
    };
  }
}
