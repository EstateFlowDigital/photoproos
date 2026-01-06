"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

interface WatermarkSettings {
  watermarkEnabled: boolean;
  watermarkType: "text" | "image";
  watermarkText?: string;
  watermarkImageUrl?: string;
  watermarkPosition:
    | "top_left"
    | "top_center"
    | "top_right"
    | "center"
    | "bottom_left"
    | "bottom_center"
    | "bottom_right"
    | "tiled"
    | "diagonal";
  watermarkOpacity: number; // 0-1
  watermarkScale: number; // 0-1
}

// =============================================================================
// Helper Functions
// =============================================================================

async function getOrganization() {
  const { orgId } = await auth();
  if (!orgId) return null;

  return prisma.organization.findFirst({
    where: { clerkOrganizationId: orgId },
  });
}

// =============================================================================
// Watermark Settings Actions
// =============================================================================

/**
 * Get current watermark settings for the organization
 */
export async function getWatermarkSettings() {
  const org = await getOrganization();
  if (!org) {
    return fail("Organization not found");
  }

  return {
    success: true,
    data: {
      watermarkEnabled: org.watermarkEnabled,
      watermarkType: (org.watermarkType as "text" | "image") || "text",
      watermarkText: org.watermarkText,
      watermarkImageUrl: org.watermarkImageUrl,
      watermarkPosition: org.watermarkPosition,
      watermarkOpacity: org.watermarkOpacity,
      watermarkScale: org.watermarkScale,
    },
  };
}

/**
 * Update watermark settings
 */
export async function updateWatermarkSettings(settings: Partial<WatermarkSettings>) {
  const org = await getOrganization();
  if (!org) {
    return fail("Organization not found");
  }

  try {
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        watermarkEnabled: settings.watermarkEnabled,
        watermarkType: settings.watermarkType,
        watermarkText: settings.watermarkText,
        watermarkImageUrl: settings.watermarkImageUrl,
        watermarkPosition: settings.watermarkPosition,
        watermarkOpacity: settings.watermarkOpacity,
        watermarkScale: settings.watermarkScale,
      },
    });

    revalidatePath("/settings/branding");
    return ok();
  } catch (error) {
    console.error("[Watermark Settings] Error updating:", error);
    return fail("Failed to update watermark settings");
  }
}

/**
 * Enable/disable watermarks quickly
 */
export async function toggleWatermarks(enabled: boolean) {
  const org = await getOrganization();
  if (!org) {
    return fail("Organization not found");
  }

  try {
    await prisma.organization.update({
      where: { id: org.id },
      data: { watermarkEnabled: enabled },
    });

    revalidatePath("/settings/branding");
    return ok();
  } catch (error) {
    console.error("[Watermark Settings] Error toggling:", error);
    return fail("Failed to toggle watermarks");
  }
}

/**
 * Upload watermark image
 * Returns a presigned URL for uploading the watermark image
 */
export async function getWatermarkUploadUrl(filename: string, contentType: string) {
  const org = await getOrganization();
  if (!org) {
    return fail("Organization not found");
  }

  // Validate content type
  if (!["image/png", "image/svg+xml"].includes(contentType)) {
    return fail("Watermark must be PNG or SVG");
  }

  try {
    // Import storage utilities
    const { generatePresignedUploadUrl } = await import("@/lib/storage");

    const key = `watermarks/${org.id}/${Date.now()}-${filename}`;

    const { uploadUrl, publicUrl } = await generatePresignedUploadUrl({
      key,
      contentType,
      contentLength: 1024 * 1024 * 2, // 2MB max
      expiresIn: 3600, // 1 hour expiry
    });

    return {
      success: true,
      data: {
        uploadUrl,
        publicUrl,
        key,
      },
    };
  } catch (error) {
    console.error("[Watermark Settings] Error generating upload URL:", error);
    return fail("Failed to generate upload URL");
  }
}

/**
 * Set watermark image URL after upload
 */
export async function setWatermarkImage(imageUrl: string) {
  const org = await getOrganization();
  if (!org) {
    return fail("Organization not found");
  }

  try {
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        watermarkImageUrl: imageUrl,
        watermarkType: "image",
      },
    });

    revalidatePath("/settings/branding");
    return ok();
  } catch (error) {
    console.error("[Watermark Settings] Error setting image:", error);
    return fail("Failed to set watermark image");
  }
}

/**
 * Preview watermark on an image (returns CSS for preview)
 */
export async function getWatermarkPreviewStyles() {
  const org = await getOrganization();
  if (!org) {
    return fail("Organization not found");
  }

  const positionStyles: Record<string, string> = {
    top_left: "top: 10%; left: 10%;",
    top_center: "top: 10%; left: 50%; transform: translateX(-50%);",
    top_right: "top: 10%; right: 10%;",
    center: "top: 50%; left: 50%; transform: translate(-50%, -50%);",
    bottom_left: "bottom: 10%; left: 10%;",
    bottom_center: "bottom: 10%; left: 50%; transform: translateX(-50%);",
    bottom_right: "bottom: 10%; right: 10%;",
    tiled: "top: 0; left: 0; width: 100%; height: 100%; background-repeat: repeat;",
    diagonal:
      "top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);",
  };

  return {
    success: true,
    data: {
      position: positionStyles[org.watermarkPosition] || positionStyles.bottom_right,
      opacity: org.watermarkOpacity,
      scale: org.watermarkScale,
      type: org.watermarkType || "text",
      text: org.watermarkText || `© ${org.name}`,
      imageUrl: org.watermarkImageUrl,
    },
  };
}

/**
 * Generate default watermark text from organization name
 */
export async function generateDefaultWatermarkText() {
  const org = await getOrganization();
  if (!org) {
    return fail("Organization not found");
  }

  const year = new Date().getFullYear();
  const defaultText = `© ${year} ${org.name}`;

  return {
    success: true,
    data: defaultText,
  };
}
