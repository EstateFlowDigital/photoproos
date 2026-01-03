"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createBundleSchema,
  updateBundleSchema,
  deleteBundleSchema,
  duplicateBundleSchema,
  bundleServicesSchema,
  reorderBundleItemsSchema,
  type CreateBundleInput,
  type UpdateBundleInput,
  type BundleFilters,
  type BundleServicesInput,
} from "@/lib/validations/bundles";
import type { BundleType } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import {
  syncBundleToStripe,
  archiveStripeProduct,
  reactivateStripeProduct,
} from "@/lib/stripe/product-sync";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/**
 * Create a new service bundle
 */
export async function createBundle(
  input: CreateBundleInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const validated = createBundleSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Generate slug if not provided
    const slug = validated.slug || generateSlug(validated.name);

    // Check for duplicate slug
    const existing = await prisma.serviceBundle.findFirst({
      where: {
        organizationId,
        slug,
      },
    });

    if (existing) {
      return { success: false, error: "A bundle with this slug already exists" };
    }

    const bundle = await prisma.serviceBundle.create({
      data: {
        organizationId,
        name: validated.name,
        slug,
        description: validated.description,
        priceCents: validated.priceCents,
        bundleType: validated.bundleType as BundleType,
        imageUrl: validated.imageUrl,
        badgeText: validated.badgeText,
        isActive: validated.isActive,
        isPublic: validated.isPublic,
      },
    });

    // Sync to Stripe Product Catalog (non-blocking)
    syncBundleToStripe(bundle, organizationId).catch((err) => {
      console.error("Failed to sync bundle to Stripe:", err);
    });

    revalidatePath("/services/bundles");
    revalidatePath("/order-pages");

    return { success: true, data: { id: bundle.id, slug: bundle.slug } };
  } catch (error) {
    console.error("Error creating bundle:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create bundle" };
  }
}

/**
 * Update an existing bundle
 */
export async function updateBundle(
  input: UpdateBundleInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateBundleSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify bundle exists and belongs to organization
    const existing = await prisma.serviceBundle.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Bundle not found" };
    }

    // Check for duplicate slug if slug is being updated
    if (validated.slug && validated.slug !== existing.slug) {
      const duplicateSlug = await prisma.serviceBundle.findFirst({
        where: {
          organizationId,
          slug: validated.slug,
          id: { not: validated.id },
        },
      });

      if (duplicateSlug) {
        return { success: false, error: "A bundle with this slug already exists" };
      }
    }

    const { id, ...updateData } = validated;

    const bundle = await prisma.serviceBundle.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.slug && { slug: updateData.slug }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.priceCents !== undefined && { priceCents: updateData.priceCents }),
        ...(updateData.bundleType && { bundleType: updateData.bundleType as BundleType }),
        ...(updateData.imageUrl !== undefined && { imageUrl: updateData.imageUrl }),
        ...(updateData.badgeText !== undefined && { badgeText: updateData.badgeText }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        ...(updateData.isPublic !== undefined && { isPublic: updateData.isPublic }),
      },
    });

    // Sync to Stripe if name, description, or price changed
    const needsStripeSync =
      updateData.name !== undefined ||
      updateData.description !== undefined ||
      updateData.priceCents !== undefined;

    if (needsStripeSync) {
      syncBundleToStripe(bundle, organizationId).catch((err) => {
        console.error("Failed to sync bundle to Stripe:", err);
      });
    }

    // Handle Stripe product active status change
    if (updateData.isActive !== undefined && existing.stripeProductId) {
      if (updateData.isActive) {
        reactivateStripeProduct(existing.stripeProductId, existing.stripePriceId).catch(
          (err) => console.error("Failed to reactivate Stripe product:", err)
        );
      } else {
        archiveStripeProduct(existing.stripeProductId, existing.stripePriceId).catch(
          (err) => console.error("Failed to archive Stripe product:", err)
        );
      }
    }

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${id}`);
    revalidatePath("/order-pages");

    return { success: true, data: { id: bundle.id } };
  } catch (error) {
    console.error("Error updating bundle:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update bundle" };
  }
}

/**
 * Delete a bundle
 */
export async function deleteBundle(
  id: string,
  force: boolean = false
): Promise<ActionResult> {
  try {
    deleteBundleSchema.parse({ id, force });
    const organizationId = await getOrganizationId();

    // Verify bundle exists and belongs to organization
    const existing = await prisma.serviceBundle.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            orderItems: true,
            orderPages: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Bundle not found" };
    }

    const usageCount = existing._count.orderItems + existing._count.orderPages;

    if (usageCount > 0 && !force) {
      // Archive instead of delete if in use
      await prisma.serviceBundle.update({
        where: { id },
        data: { isActive: false },
      });

      // Archive in Stripe
      if (existing.stripeProductId) {
        archiveStripeProduct(existing.stripeProductId, existing.stripePriceId).catch(
          (err) => console.error("Failed to archive Stripe product:", err)
        );
      }

      revalidatePath("/services/bundles");
      return { success: true, data: undefined };
    }

    // Archive in Stripe before deleting locally
    if (existing.stripeProductId) {
      archiveStripeProduct(existing.stripeProductId, existing.stripePriceId).catch(
        (err) => console.error("Failed to archive Stripe product:", err)
      );
    }

    // Actually delete if not in use or force is true
    await prisma.serviceBundle.delete({
      where: { id },
    });

    revalidatePath("/services/bundles");
    revalidatePath("/order-pages");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting bundle:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete bundle" };
  }
}

/**
 * Duplicate a bundle
 */
export async function duplicateBundle(
  id: string,
  newName?: string,
  newSlug?: string
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    duplicateBundleSchema.parse({ id, newName, newSlug });
    const organizationId = await getOrganizationId();

    // Get original bundle with services
    const original = await prisma.serviceBundle.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        services: true,
      },
    });

    if (!original) {
      return { success: false, error: "Bundle not found" };
    }

    const name = newName || `${original.name} (Copy)`;
    const slug = newSlug || generateSlug(name);

    // Check for duplicate slug
    const existingSlug = await prisma.serviceBundle.findFirst({
      where: {
        organizationId,
        slug,
      },
    });

    if (existingSlug) {
      return { success: false, error: "A bundle with this slug already exists" };
    }

    // Create duplicate with services (without Stripe IDs - will get new ones)
    const duplicate = await prisma.serviceBundle.create({
      data: {
        organizationId,
        name,
        slug,
        description: original.description,
        priceCents: original.priceCents,
        bundleType: original.bundleType,
        imageUrl: original.imageUrl,
        badgeText: original.badgeText,
        originalPriceCents: original.originalPriceCents,
        savingsPercent: original.savingsPercent,
        isActive: true,
        isPublic: original.isPublic,
        services: {
          create: original.services.map((item) => ({
            serviceId: item.serviceId,
            isRequired: item.isRequired,
            quantity: item.quantity,
            sortOrder: item.sortOrder,
          })),
        },
      },
    });

    // Sync duplicate to Stripe (non-blocking)
    syncBundleToStripe(duplicate, organizationId).catch((err) => {
      console.error("Failed to sync duplicated bundle to Stripe:", err);
    });

    revalidatePath("/services/bundles");

    return { success: true, data: { id: duplicate.id, slug: duplicate.slug } };
  } catch (error) {
    console.error("Error duplicating bundle:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to duplicate bundle" };
  }
}

/**
 * Toggle bundle active status
 */
export async function toggleBundleStatus(
  id: string
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.serviceBundle.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Bundle not found" };
    }

    const updated = await prisma.serviceBundle.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    // Update Stripe product active status
    if (existing.stripeProductId) {
      if (updated.isActive) {
        reactivateStripeProduct(existing.stripeProductId, existing.stripePriceId).catch(
          (err) => console.error("Failed to reactivate Stripe product:", err)
        );
      } else {
        archiveStripeProduct(existing.stripeProductId, existing.stripePriceId).catch(
          (err) => console.error("Failed to archive Stripe product:", err)
        );
      }
    }

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${id}`);

    return { success: true, data: { isActive: updated.isActive } };
  } catch (error) {
    console.error("Error toggling bundle status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to toggle bundle status" };
  }
}

/**
 * Set services for a bundle (replaces all existing)
 */
export async function setBundleServices(
  input: BundleServicesInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const validated = bundleServicesSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify bundle exists and belongs to organization
    const bundle = await prisma.serviceBundle.findFirst({
      where: {
        id: validated.bundleId,
        organizationId,
      },
    });

    if (!bundle) {
      return { success: false, error: "Bundle not found" };
    }

    // Verify all services exist and belong to organization
    const serviceIds = validated.services.map((s) => s.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId,
      },
    });

    if (services.length !== serviceIds.length) {
      return { success: false, error: "One or more services not found" };
    }

    // Replace all bundle services
    await prisma.$transaction([
      // Delete existing
      prisma.serviceBundleItem.deleteMany({
        where: { bundleId: validated.bundleId },
      }),
      // Create new
      prisma.serviceBundleItem.createMany({
        data: validated.services.map((s, index) => ({
          bundleId: validated.bundleId,
          serviceId: s.serviceId,
          isRequired: s.isRequired,
          quantity: s.quantity,
          sortOrder: s.sortOrder ?? index,
        })),
      }),
    ]);

    // Calculate and update savings
    await calculateBundleSavings(validated.bundleId);

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${validated.bundleId}`);

    return { success: true, data: { count: validated.services.length } };
  } catch (error) {
    console.error("Error setting bundle services:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set bundle services" };
  }
}

/**
 * Add a service to a bundle
 */
export async function addServiceToBundle(
  bundleId: string,
  serviceId: string,
  isRequired: boolean = true,
  quantity: number = 1
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify bundle and service exist and belong to organization
    const [bundle, service] = await Promise.all([
      prisma.serviceBundle.findFirst({
        where: { id: bundleId, organizationId },
      }),
      prisma.service.findFirst({
        where: { id: serviceId, organizationId },
      }),
    ]);

    if (!bundle) {
      return { success: false, error: "Bundle not found" };
    }

    if (!service) {
      return { success: false, error: "Service not found" };
    }

    // Check if already added
    const existing = await prisma.serviceBundleItem.findFirst({
      where: { bundleId, serviceId },
    });

    if (existing) {
      return { success: false, error: "Service already in bundle" };
    }

    // Get current max sort order
    const maxSort = await prisma.serviceBundleItem.aggregate({
      where: { bundleId },
      _max: { sortOrder: true },
    });

    await prisma.serviceBundleItem.create({
      data: {
        bundleId,
        serviceId,
        isRequired,
        quantity,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });

    // Recalculate savings
    await calculateBundleSavings(bundleId);

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${bundleId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error adding service to bundle:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add service to bundle" };
  }
}

/**
 * Remove a service from a bundle
 */
export async function removeServiceFromBundle(
  bundleId: string,
  serviceId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify bundle exists and belongs to organization
    const bundle = await prisma.serviceBundle.findFirst({
      where: { id: bundleId, organizationId },
    });

    if (!bundle) {
      return { success: false, error: "Bundle not found" };
    }

    await prisma.serviceBundleItem.deleteMany({
      where: { bundleId, serviceId },
    });

    // Recalculate savings
    await calculateBundleSavings(bundleId);

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${bundleId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing service from bundle:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove service from bundle" };
  }
}

/**
 * Reorder bundle items
 */
export async function reorderBundleItems(
  bundleId: string,
  itemIds: string[]
): Promise<ActionResult> {
  try {
    reorderBundleItemsSchema.parse({ bundleId, itemIds });
    const organizationId = await getOrganizationId();

    // Verify bundle exists and belongs to organization
    const bundle = await prisma.serviceBundle.findFirst({
      where: { id: bundleId, organizationId },
    });

    if (!bundle) {
      return { success: false, error: "Bundle not found" };
    }

    // Update sort order for each item
    await prisma.$transaction(
      itemIds.map((id, index) =>
        prisma.serviceBundleItem.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${bundleId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reordering bundle items:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reorder bundle items" };
  }
}

/**
 * Calculate and update bundle savings
 */
export async function calculateBundleSavings(
  bundleId: string
): Promise<ActionResult<{ originalPriceCents: number; savingsPercent: number }>> {
  try {
    const bundle = await prisma.serviceBundle.findUnique({
      where: { id: bundleId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!bundle) {
      return { success: false, error: "Bundle not found" };
    }

    // Calculate original price (sum of all services at full price)
    const originalPriceCents = bundle.services.reduce((total, item) => {
      return total + item.service.priceCents * item.quantity;
    }, 0);

    // Calculate savings percentage
    const savingsPercent =
      originalPriceCents > 0
        ? ((originalPriceCents - bundle.priceCents) / originalPriceCents) * 100
        : 0;

    // Update bundle with calculated values
    await prisma.serviceBundle.update({
      where: { id: bundleId },
      data: {
        originalPriceCents,
        savingsPercent: Math.round(savingsPercent * 100) / 100,
      },
    });

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${bundleId}`);

    return {
      success: true,
      data: {
        originalPriceCents,
        savingsPercent: Math.round(savingsPercent * 100) / 100,
      },
    };
  } catch (error) {
    console.error("Error calculating bundle savings:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to calculate bundle savings" };
  }
}

/**
 * Get all bundles for the organization
 */
export async function getBundles(filters?: BundleFilters) {
  try {
    const organizationId = await getOrganizationId();

    const bundles = await prisma.serviceBundle.findMany({
      where: {
        organizationId,
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.isPublic !== undefined && { isPublic: filters.isPublic }),
        ...(filters?.bundleType && { bundleType: filters.bundleType }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                category: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            orderItems: true,
            orderPages: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return bundles.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      description: bundle.description,
      priceCents: bundle.priceCents,
      bundleType: bundle.bundleType,
      imageUrl: bundle.imageUrl,
      badgeText: bundle.badgeText,
      originalPriceCents: bundle.originalPriceCents,
      savingsPercent: bundle.savingsPercent,
      isActive: bundle.isActive,
      isPublic: bundle.isPublic,
      services: bundle.services.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        serviceName: item.service.name,
        servicePriceCents: item.service.priceCents,
        serviceCategory: item.service.category,
        isRequired: item.isRequired,
        quantity: item.quantity,
        sortOrder: item.sortOrder,
      })),
      usageCount: bundle._count.orderItems + bundle._count.orderPages,
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return [];
  }
}

/**
 * Get a single bundle by ID
 */
export async function getBundle(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const bundle = await prisma.serviceBundle.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        services: {
          include: {
            service: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            orderItems: true,
            orderPages: true,
          },
        },
      },
    });

    if (!bundle) {
      return null;
    }

    return {
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      description: bundle.description,
      priceCents: bundle.priceCents,
      bundleType: bundle.bundleType,
      imageUrl: bundle.imageUrl,
      badgeText: bundle.badgeText,
      originalPriceCents: bundle.originalPriceCents,
      savingsPercent: bundle.savingsPercent,
      isActive: bundle.isActive,
      isPublic: bundle.isPublic,
      services: bundle.services.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        service: item.service,
        isRequired: item.isRequired,
        quantity: item.quantity,
        sortOrder: item.sortOrder,
      })),
      usageCount: bundle._count.orderItems + bundle._count.orderPages,
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return null;
  }
}

/**
 * Get a bundle by slug (for public order pages)
 */
export async function getBundleBySlug(orgSlug: string, bundleSlug: string) {
  try {
    const bundle = await prisma.serviceBundle.findFirst({
      where: {
        slug: bundleSlug,
        organization: { slug: orgSlug },
        isActive: true,
        isPublic: true,
      },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                priceCents: true,
                category: true,
                duration: true,
                deliverables: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        organization: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    if (!bundle) {
      return null;
    }

    return {
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      description: bundle.description,
      priceCents: bundle.priceCents,
      bundleType: bundle.bundleType,
      imageUrl: bundle.imageUrl,
      badgeText: bundle.badgeText,
      originalPriceCents: bundle.originalPriceCents,
      savingsPercent: bundle.savingsPercent,
      services: bundle.services.map((item) => ({
        service: item.service,
        isRequired: item.isRequired,
        quantity: item.quantity,
      })),
      organization: bundle.organization,
    };
  } catch (error) {
    console.error("Error fetching bundle by slug:", error);
    return null;
  }
}
