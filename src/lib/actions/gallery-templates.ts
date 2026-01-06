"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ok } from "@/lib/types/action-result";

export interface GalleryTemplateInput {
  name: string;
  description?: string | null;
  serviceId?: string | null;
  defaultPriceCents?: number;
  currency?: string;
  isPasswordProtected?: boolean;
  defaultPassword?: string | null;
  allowDownloads?: boolean;
  allowFavorites?: boolean;
  showWatermark?: boolean;
  sendNotifications?: boolean;
  expirationDays?: number | null;
  isDefault?: boolean;
}

// Get all gallery templates for the current organization
export async function getGalleryTemplates() {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    const templates = await prisma.galleryTemplate.findMany({
      where: { organizationId: org.id },
      include: {
        service: {
          select: { id: true, name: true, priceCents: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error("Error fetching gallery templates:", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

// Get a single gallery template by ID
export async function getGalleryTemplate(id: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    const template = await prisma.galleryTemplate.findFirst({
      where: { id, organizationId: org.id },
      include: {
        service: {
          select: { id: true, name: true, priceCents: true },
        },
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, data: template };
  } catch (error) {
    console.error("Error fetching gallery template:", error);
    return { success: false, error: "Failed to fetch template" };
  }
}

// Create a new gallery template
export async function createGalleryTemplate(input: GalleryTemplateInput) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // If this is set as default, unset other defaults
    if (input.isDefault) {
      await prisma.galleryTemplate.updateMany({
        where: { organizationId: org.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.galleryTemplate.create({
      data: {
        organizationId: org.id,
        name: input.name,
        description: input.description || null,
        serviceId: input.serviceId || null,
        defaultPriceCents: input.defaultPriceCents ?? 0,
        currency: input.currency || "USD",
        isPasswordProtected: input.isPasswordProtected ?? false,
        defaultPassword: input.defaultPassword || null,
        allowDownloads: input.allowDownloads ?? true,
        allowFavorites: input.allowFavorites ?? true,
        showWatermark: input.showWatermark ?? false,
        sendNotifications: input.sendNotifications ?? true,
        expirationDays: input.expirationDays || null,
        isDefault: input.isDefault ?? false,
      },
    });

    revalidatePath("/settings/templates");
    revalidatePath("/galleries/new");

    return { success: true, data: template };
  } catch (error) {
    console.error("Error creating gallery template:", error);
    return { success: false, error: "Failed to create template" };
  }
}

// Update an existing gallery template
export async function updateGalleryTemplate(id: string, input: Partial<GalleryTemplateInput>) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify template belongs to this organization
    const existing = await prisma.galleryTemplate.findFirst({
      where: { id, organizationId: org.id },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    // If this is set as default, unset other defaults
    if (input.isDefault) {
      await prisma.galleryTemplate.updateMany({
        where: { organizationId: org.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const template = await prisma.galleryTemplate.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        serviceId: input.serviceId,
        defaultPriceCents: input.defaultPriceCents,
        currency: input.currency,
        isPasswordProtected: input.isPasswordProtected,
        defaultPassword: input.defaultPassword,
        allowDownloads: input.allowDownloads,
        allowFavorites: input.allowFavorites,
        showWatermark: input.showWatermark,
        sendNotifications: input.sendNotifications,
        expirationDays: input.expirationDays,
        isDefault: input.isDefault,
      },
    });

    revalidatePath("/settings/templates");
    revalidatePath("/galleries/new");

    return { success: true, data: template };
  } catch (error) {
    console.error("Error updating gallery template:", error);
    return { success: false, error: "Failed to update template" };
  }
}

// Delete a gallery template
export async function deleteGalleryTemplate(id: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify template belongs to this organization
    const existing = await prisma.galleryTemplate.findFirst({
      where: { id, organizationId: org.id },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    await prisma.galleryTemplate.delete({
      where: { id },
    });

    revalidatePath("/settings/templates");
    revalidatePath("/galleries/new");

    return ok();
  } catch (error) {
    console.error("Error deleting gallery template:", error);
    return { success: false, error: "Failed to delete template" };
  }
}

// Increment usage count for a template
export async function incrementTemplateUsage(id: string) {
  try {
    await prisma.galleryTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  } catch (error) {
    console.error("Error incrementing template usage:", error);
    // Non-critical error, don't throw
  }
}
