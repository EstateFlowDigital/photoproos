"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { WatermarkPosition } from "@prisma/client";

export type WatermarkTemplateInput = {
  name: string;
  watermarkType: "text" | "image";
  watermarkText?: string | null;
  watermarkImageUrl?: string | null;
  watermarkPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  watermarkOpacity: number;
  watermarkScale: number;
  isDefault?: boolean;
};

/**
 * Get organization ID from Clerk auth
 */
async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findFirst({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id ?? null;
}

/**
 * Create a new watermark template
 */
export async function createWatermarkTemplate(data: WatermarkTemplateInput) {
  try {
    const { userId } = await auth();
    const organizationId = await getOrganizationId();

    if (!userId || !organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate watermark type has corresponding data
    if (data.watermarkType === "text" && !data.watermarkText) {
      return { success: false, error: "Text watermarks require watermark text" };
    }
    if (data.watermarkType === "image" && !data.watermarkImageUrl) {
      return { success: false, error: "Image watermarks require an image URL" };
    }

    // Validate opacity and scale ranges
    if (data.watermarkOpacity < 0 || data.watermarkOpacity > 1) {
      return { success: false, error: "Opacity must be between 0 and 1" };
    }
    if (data.watermarkScale <= 0) {
      return { success: false, error: "Scale must be greater than 0" };
    }

    // If setting as default, unset any existing default
    if (data.isDefault) {
      await prisma.watermarkTemplate.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.watermarkTemplate.create({
      data: {
        organizationId,
        name: data.name,
        watermarkType: data.watermarkType,
        watermarkText: data.watermarkText ?? null,
        watermarkImageUrl: data.watermarkImageUrl ?? null,
        watermarkPosition: data.watermarkPosition,
        watermarkOpacity: data.watermarkOpacity,
        watermarkScale: data.watermarkScale,
        isDefault: data.isDefault ?? false,
      },
    });

    revalidatePath("/settings/watermarks");
    revalidatePath("/galleries/new");

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Error creating watermark template:", error);
    return {
      success: false,
      error: "Failed to create watermark template",
    };
  }
}

/**
 * Update an existing watermark template
 */
export async function updateWatermarkTemplate(
  templateId: string,
  data: Partial<WatermarkTemplateInput>
) {
  try {
    const { userId } = await auth();
    const organizationId = await getOrganizationId();

    if (!userId || !organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify template belongs to organization
    const existing = await prisma.watermarkTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    // Validate if type or data is being changed
    const finalType = data.watermarkType ?? existing.watermarkType;
    const finalText = data.watermarkText ?? existing.watermarkText;
    const finalImageUrl = data.watermarkImageUrl ?? existing.watermarkImageUrl;

    if (finalType === "text" && !finalText) {
      return { success: false, error: "Text watermarks require watermark text" };
    }
    if (finalType === "image" && !finalImageUrl) {
      return { success: false, error: "Image watermarks require an image URL" };
    }

    // Validate ranges if provided
    if (data.watermarkOpacity !== undefined) {
      if (data.watermarkOpacity < 0 || data.watermarkOpacity > 1) {
        return { success: false, error: "Opacity must be between 0 and 1" };
      }
    }
    if (data.watermarkScale !== undefined) {
      if (data.watermarkScale <= 0) {
        return { success: false, error: "Scale must be greater than 0" };
      }
    }

    // If setting as default, unset any existing default
    if (data.isDefault === true) {
      await prisma.watermarkTemplate.updateMany({
        where: {
          organizationId,
          isDefault: true,
          id: { not: templateId }, // Don't unset the one we're updating
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.watermarkTemplate.update({
      where: { id: templateId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.watermarkType !== undefined && { watermarkType: data.watermarkType }),
        ...(data.watermarkText !== undefined && { watermarkText: data.watermarkText }),
        ...(data.watermarkImageUrl !== undefined && { watermarkImageUrl: data.watermarkImageUrl }),
        ...(data.watermarkPosition !== undefined && { watermarkPosition: data.watermarkPosition }),
        ...(data.watermarkOpacity !== undefined && { watermarkOpacity: data.watermarkOpacity }),
        ...(data.watermarkScale !== undefined && { watermarkScale: data.watermarkScale }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });

    revalidatePath("/settings/watermarks");
    revalidatePath("/galleries/new");

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Error updating watermark template:", error);
    return {
      success: false,
      error: "Failed to update watermark template",
    };
  }
}

/**
 * Delete a watermark template
 */
export async function deleteWatermarkTemplate(templateId: string) {
  try {
    const { userId } = await auth();
    const organizationId = await getOrganizationId();

    if (!userId || !organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify template belongs to organization
    const existing = await prisma.watermarkTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    await prisma.watermarkTemplate.delete({
      where: { id: templateId },
    });

    revalidatePath("/settings/watermarks");
    revalidatePath("/galleries/new");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting watermark template:", error);
    return {
      success: false,
      error: "Failed to delete watermark template",
    };
  }
}

/**
 * Get all watermark templates for the current organization
 */
export async function listWatermarkTemplates() {
  try {
    const { userId } = await auth();
    const organizationId = await getOrganizationId();

    if (!userId || !organizationId) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const templates = await prisma.watermarkTemplate.findMany({
      where: { organizationId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error("Error listing watermark templates:", error);
    return {
      success: false,
      error: "Failed to list watermark templates",
      data: [],
    };
  }
}

/**
 * Get a specific watermark template by ID
 */
export async function getWatermarkTemplate(templateId: string) {
  try {
    const { userId } = await auth();
    const organizationId = await getOrganizationId();

    if (!userId || !organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const template = await prisma.watermarkTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Error getting watermark template:", error);
    return {
      success: false,
      error: "Failed to get watermark template",
    };
  }
}

/**
 * Set a template as the default (unsets any existing default)
 */
export async function setDefaultTemplate(templateId: string) {
  try {
    const { userId } = await auth();
    const organizationId = await getOrganizationId();

    if (!userId || !organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify template belongs to organization
    const existing = await prisma.watermarkTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    // Unset any existing default
    await prisma.watermarkTemplate.updateMany({
      where: {
        organizationId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set new default
    const template = await prisma.watermarkTemplate.update({
      where: { id: templateId },
      data: { isDefault: true },
    });

    revalidatePath("/settings/watermarks");
    revalidatePath("/galleries/new");

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Error setting default template:", error);
    return {
      success: false,
      error: "Failed to set default template",
    };
  }
}

/**
 * Get the default watermark template for the organization
 */
export async function getDefaultWatermarkTemplate() {
  try {
    const { userId } = await auth();
    const organizationId = await getOrganizationId();

    if (!userId || !organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const template = await prisma.watermarkTemplate.findFirst({
      where: {
        organizationId,
        isDefault: true,
      },
    });

    return {
      success: true,
      data: template ?? null,
    };
  } catch (error) {
    console.error("Error getting default template:", error);
    return {
      success: false,
      error: "Failed to get default template",
    };
  }
}

/**
 * Apply a watermark template to the organization's global watermark settings
 */
export async function applyTemplateToOrganization(templateId: string) {
  try {
    const { userId } = await auth();
    const organizationId = await getOrganizationId();

    if (!userId || !organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the template
    const template = await prisma.watermarkTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    // Map template position format to organization settings format
    const positionMap: Record<string, WatermarkPosition> = {
      "top-left": "top_left",
      "top-right": "top_right",
      "bottom-left": "bottom_left",
      "bottom-right": "bottom_right",
      center: "center",
    };

    // Update organization's watermark settings
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        watermarkEnabled: true,
        watermarkType: template.watermarkType,
        watermarkText: template.watermarkText,
        watermarkImageUrl: template.watermarkImageUrl,
        watermarkPosition:
          positionMap[template.watermarkPosition] ??
          template.watermarkPosition ??
          "bottom_right",
        watermarkOpacity: template.watermarkOpacity,
        watermarkScale: template.watermarkScale,
      },
    });

    revalidatePath("/settings/watermarks");
    revalidatePath("/settings/branding");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error applying template to organization:", error);
    return {
      success: false,
      error: "Failed to apply template",
    };
  }
}
