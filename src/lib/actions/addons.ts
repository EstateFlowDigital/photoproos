"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createAddonSchema,
  updateAddonSchema,
  deleteAddonSchema,
  addonCompatibilitySchema,
  type CreateAddonInput,
  type UpdateAddonInput,
  type AddonFilters,
  type AddonCompatibilityInput,
} from "@/lib/validations/addons";
import type { AddonTrigger } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

/**
 * Create a new service addon
 */
export async function createAddon(
  input: CreateAddonInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createAddonSchema.parse(input);
    const organizationId = await getOrganizationId();

    const addon = await prisma.serviceAddon.create({
      data: {
        organizationId,
        name: validated.name,
        description: validated.description,
        priceCents: validated.priceCents,
        imageUrl: validated.imageUrl,
        iconName: validated.iconName,
        triggerType: validated.triggerType as AddonTrigger,
        triggerValue: validated.triggerValue,
        isActive: validated.isActive,
        isOneTime: validated.isOneTime,
      },
    });

    revalidatePath("/services/addons");
    revalidatePath("/order-pages");

    return { success: true, data: { id: addon.id } };
  } catch (error) {
    console.error("Error creating addon:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create addon");
  }
}

/**
 * Update an existing addon
 */
export async function updateAddon(
  input: UpdateAddonInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateAddonSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify addon exists and belongs to organization
    const existing = await prisma.serviceAddon.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return fail("Addon not found");
    }

    const { id, ...updateData } = validated;

    const addon = await prisma.serviceAddon.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.priceCents !== undefined && { priceCents: updateData.priceCents }),
        ...(updateData.imageUrl !== undefined && { imageUrl: updateData.imageUrl }),
        ...(updateData.iconName !== undefined && { iconName: updateData.iconName }),
        ...(updateData.triggerType && { triggerType: updateData.triggerType as AddonTrigger }),
        ...(updateData.triggerValue !== undefined && { triggerValue: updateData.triggerValue }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        ...(updateData.isOneTime !== undefined && { isOneTime: updateData.isOneTime }),
      },
    });

    revalidatePath("/services/addons");
    revalidatePath(`/services/addons/${id}`);
    revalidatePath("/order-pages");

    return { success: true, data: { id: addon.id } };
  } catch (error) {
    console.error("Error updating addon:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update addon");
  }
}

/**
 * Delete an addon
 */
export async function deleteAddon(
  id: string,
  force: boolean = false
): Promise<ActionResult> {
  try {
    deleteAddonSchema.parse({ id, force });
    const organizationId = await getOrganizationId();

    // Verify addon exists and belongs to organization
    const existing = await prisma.serviceAddon.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!existing) {
      return fail("Addon not found");
    }

    if (existing._count.orderItems > 0 && !force) {
      // Archive instead of delete if in use
      await prisma.serviceAddon.update({
        where: { id },
        data: { isActive: false },
      });

      revalidatePath("/services/addons");
      return ok();
    }

    // Actually delete if not in use or force is true
    await prisma.serviceAddon.delete({
      where: { id },
    });

    revalidatePath("/services/addons");
    revalidatePath("/order-pages");

    return ok();
  } catch (error) {
    console.error("Error deleting addon:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete addon");
  }
}

/**
 * Toggle addon active status
 */
export async function toggleAddonStatus(
  id: string
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.serviceAddon.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return fail("Addon not found");
    }

    const updated = await prisma.serviceAddon.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/services/addons");
    revalidatePath(`/services/addons/${id}`);

    return { success: true, data: { isActive: updated.isActive } };
  } catch (error) {
    console.error("Error toggling addon status:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to toggle addon status");
  }
}

/**
 * Set compatible services for an addon (replaces all existing)
 */
export async function setAddonCompatibility(
  input: AddonCompatibilityInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const validated = addonCompatibilitySchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify addon exists and belongs to organization
    const addon = await prisma.serviceAddon.findFirst({
      where: {
        id: validated.addonId,
        organizationId,
      },
    });

    if (!addon) {
      return fail("Addon not found");
    }

    // Verify all services exist and belong to organization
    const services = await prisma.service.findMany({
      where: {
        id: { in: validated.serviceIds },
        organizationId,
      },
    });

    if (services.length !== validated.serviceIds.length) {
      return fail("One or more services not found");
    }

    // Replace all addon compatibility
    await prisma.$transaction([
      // Delete existing
      prisma.serviceAddonCompat.deleteMany({
        where: { addonId: validated.addonId },
      }),
      // Create new
      prisma.serviceAddonCompat.createMany({
        data: validated.serviceIds.map((serviceId) => ({
          addonId: validated.addonId,
          serviceId,
        })),
      }),
    ]);

    revalidatePath("/services/addons");
    revalidatePath(`/services/addons/${validated.addonId}`);

    return { success: true, data: { count: validated.serviceIds.length } };
  } catch (error) {
    console.error("Error setting addon compatibility:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to set addon compatibility");
  }
}

// Type for compatible addon response
interface CompatibleAddon {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  iconName: string | null;
  triggerType: AddonTrigger;
  triggerValue: string | null;
  isOneTime: boolean;
  compatibleServiceIds: string[];
}

/**
 * Get compatible addons for given services
 * Used to suggest upsells during checkout
 */
export async function getCompatibleAddons(
  serviceIds: string[]
): Promise<ActionResult<CompatibleAddon[]>> {
  try {
    const organizationId = await getOrganizationId();

    // Get addons that are:
    // 1. Compatible with any of the selected services, OR
    // 2. Have triggerType "always"
    const addons = await prisma.serviceAddon.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { triggerType: "always" },
          {
            compatibleWith: {
              some: {
                serviceId: { in: serviceIds },
              },
            },
          },
        ],
      },
      include: {
        compatibleWith: {
          select: {
            serviceId: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return {
      success: true,
      data: addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        description: addon.description,
        priceCents: addon.priceCents,
        imageUrl: addon.imageUrl,
        iconName: addon.iconName,
        triggerType: addon.triggerType,
        triggerValue: addon.triggerValue,
        isOneTime: addon.isOneTime,
        compatibleServiceIds: addon.compatibleWith.map((c) => c.serviceId),
      })),
    };
  } catch (error) {
    console.error("Error getting compatible addons:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get compatible addons");
  }
}

/**
 * Get suggested addons based on cart contents
 */
export async function getSuggestedAddons(params: {
  serviceIds: string[];
  bundleIds: string[];
  cartTotalCents: number;
}) {
  try {
    const organizationId = await getOrganizationId();

    // Get all service IDs from bundles too
    const bundleServices = await prisma.serviceBundleItem.findMany({
      where: {
        bundleId: { in: params.bundleIds },
      },
      select: { serviceId: true },
    });

    const allServiceIds = [
      ...params.serviceIds,
      ...bundleServices.map((bs) => bs.serviceId),
    ];

    // Get relevant addons based on triggers
    const addons = await prisma.serviceAddon.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          // Always show
          { triggerType: "always" },
          // Show with specific service
          {
            triggerType: "with_service",
            triggerValue: { in: allServiceIds },
          },
          // Show when cart exceeds threshold
          {
            triggerType: "cart_threshold",
          },
        ],
      },
      include: {
        compatibleWith: {
          select: {
            serviceId: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Filter cart_threshold addons by actual threshold
    const filteredAddons = addons.filter((addon) => {
      if (addon.triggerType === "cart_threshold" && addon.triggerValue) {
        const threshold = parseInt(addon.triggerValue, 10);
        return !isNaN(threshold) && params.cartTotalCents >= threshold;
      }
      return true;
    });

    return filteredAddons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      description: addon.description,
      priceCents: addon.priceCents,
      imageUrl: addon.imageUrl,
      iconName: addon.iconName,
      triggerType: addon.triggerType,
      isOneTime: addon.isOneTime,
      compatibleServiceIds: addon.compatibleWith.map((c) => c.serviceId),
    }));
  } catch (error) {
    console.error("Error getting suggested addons:", error);
    return [];
  }
}

/**
 * Get all addons for the organization
 */
export async function getAddons(filters?: AddonFilters) {
  try {
    const organizationId = await getOrganizationId();

    const addons = await prisma.serviceAddon.findMany({
      where: {
        organizationId,
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.triggerType && { triggerType: filters.triggerType }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        compatibleWith: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return addons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      description: addon.description,
      priceCents: addon.priceCents,
      imageUrl: addon.imageUrl,
      iconName: addon.iconName,
      triggerType: addon.triggerType,
      triggerValue: addon.triggerValue,
      isActive: addon.isActive,
      isOneTime: addon.isOneTime,
      compatibleServices: addon.compatibleWith.map((c) => ({
        id: c.service.id,
        name: c.service.name,
      })),
      usageCount: addon._count.orderItems,
      createdAt: addon.createdAt,
      updatedAt: addon.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching addons:", error);
    return [];
  }
}

/**
 * Get a single addon by ID
 */
export async function getAddon(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const addon = await prisma.serviceAddon.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        compatibleWith: {
          include: {
            service: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!addon) {
      return null;
    }

    return {
      id: addon.id,
      name: addon.name,
      description: addon.description,
      priceCents: addon.priceCents,
      imageUrl: addon.imageUrl,
      iconName: addon.iconName,
      triggerType: addon.triggerType,
      triggerValue: addon.triggerValue,
      isActive: addon.isActive,
      isOneTime: addon.isOneTime,
      compatibleServices: addon.compatibleWith.map((c) => c.service),
      usageCount: addon._count.orderItems,
      createdAt: addon.createdAt,
      updatedAt: addon.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching addon:", error);
    return null;
  }
}

/**
 * Reorder addons
 */
export async function reorderAddons(
  addonIds: string[]
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify all addons exist and belong to organization
    const addons = await prisma.serviceAddon.findMany({
      where: {
        id: { in: addonIds },
        organizationId,
      },
    });

    if (addons.length !== addonIds.length) {
      return fail("One or more addons not found");
    }

    // Update sort order for each addon
    await prisma.$transaction(
      addonIds.map((id, index) =>
        prisma.serviceAddon.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/services/addons");

    return ok();
  } catch (error) {
    console.error("Error reordering addons:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to reorder addons");
  }
}
