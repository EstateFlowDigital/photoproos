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
  createPricingTiersSchema,
  updatePricingTierSchema,
  calculateBundlePriceSchema,
  type CreateBundleInput,
  type UpdateBundleInput,
  type BundleFilters,
  type BundleServicesInput,
  type CreatePricingTiersInput,
  type UpdatePricingTierInput,
  type CalculateBundlePriceInput,
} from "@/lib/validations/bundles";
import type { BundleType, BundlePricingMethod } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import {
  syncBundleToStripe,
  archiveStripeProduct,
  reactivateStripeProduct,
} from "@/lib/stripe/product-sync";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

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
      return fail("A bundle with this slug already exists");
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

    return success({ id: bundle.id, slug: bundle.slug });
  } catch (error) {
    console.error("Error creating bundle:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create bundle");
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
      return fail("Bundle not found");
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
        return fail("A bundle with this slug already exists");
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

    return success({ id: bundle.id });
  } catch (error) {
    console.error("Error updating bundle:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update bundle");
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
      return fail("Bundle not found");
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
      return ok();
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

    return ok();
  } catch (error) {
    console.error("Error deleting bundle:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete bundle");
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
      return fail("Bundle not found");
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
      return fail("A bundle with this slug already exists");
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

    return success({ id: duplicate.id, slug: duplicate.slug });
  } catch (error) {
    console.error("Error duplicating bundle:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to duplicate bundle");
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
      return fail("Bundle not found");
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

    return success({ isActive: updated.isActive });
  } catch (error) {
    console.error("Error toggling bundle status:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to toggle bundle status");
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
      return fail("Bundle not found");
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
      return fail("One or more services not found");
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

    return success({ count: validated.services.length });
  } catch (error) {
    console.error("Error setting bundle services:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to set bundle services");
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
      return fail("Bundle not found");
    }

    if (!service) {
      return fail("Service not found");
    }

    // Check if already added
    const existing = await prisma.serviceBundleItem.findFirst({
      where: { bundleId, serviceId },
    });

    if (existing) {
      return fail("Service already in bundle");
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

    return ok();
  } catch (error) {
    console.error("Error adding service to bundle:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to add service to bundle");
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
      return fail("Bundle not found");
    }

    await prisma.serviceBundleItem.deleteMany({
      where: { bundleId, serviceId },
    });

    // Recalculate savings
    await calculateBundleSavings(bundleId);

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${bundleId}`);

    return ok();
  } catch (error) {
    console.error("Error removing service from bundle:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to remove service from bundle");
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
      return fail("Bundle not found");
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

    return ok();
  } catch (error) {
    console.error("Error reordering bundle items:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to reorder bundle items");
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
      return fail("Bundle not found");
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

    return success({
      originalPriceCents,
      savingsPercent: Math.round(savingsPercent * 100) / 100,
    });
  } catch (error) {
    console.error("Error calculating bundle savings:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to calculate bundle savings");
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
        pricingTiers: {
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
      pricingMethod: bundle.pricingMethod,
      pricePerSqftCents: bundle.pricePerSqftCents,
      minSqft: bundle.minSqft,
      maxSqft: bundle.maxSqft,
      sqftIncrements: bundle.sqftIncrements,
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
      pricingTiers: bundle.pricingTiers.map((tier) => ({
        id: tier.id,
        minSqft: tier.minSqft,
        maxSqft: tier.maxSqft,
        priceCents: tier.priceCents,
        tierName: tier.tierName,
        sortOrder: tier.sortOrder,
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

// =============================================================================
// PRICING TIERS (for tiered_sqft bundles - BICEP pricing)
// =============================================================================

/**
 * Set pricing tiers for a bundle (replaces all existing)
 */
export async function setBundlePricingTiers(
  input: CreatePricingTiersInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const validated = createPricingTiersSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify bundle exists and belongs to organization
    const bundle = await prisma.serviceBundle.findFirst({
      where: {
        id: validated.bundleId,
        organizationId,
      },
    });

    if (!bundle) {
      return fail("Bundle not found");
    }

    // Validate tier ranges don't overlap
    const sortedTiers = [...validated.tiers].sort((a, b) => a.minSqft - b.minSqft);
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const currentTier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];
      if (currentTier.maxSqft && currentTier.maxSqft >= nextTier.minSqft) {
        return fail(`Tier ranges overlap: ${currentTier.minSqft}-${currentTier.maxSqft} and ${nextTier.minSqft}-${nextTier.maxSqft}`);
      }
    }

    // Replace all pricing tiers
    await prisma.$transaction([
      // Delete existing
      prisma.bundlePricingTier.deleteMany({
        where: { bundleId: validated.bundleId },
      }),
      // Create new
      prisma.bundlePricingTier.createMany({
        data: validated.tiers.map((tier, index) => ({
          bundleId: validated.bundleId,
          minSqft: tier.minSqft,
          maxSqft: tier.maxSqft,
          priceCents: tier.priceCents,
          tierName: tier.tierName,
          sortOrder: tier.sortOrder ?? index,
        })),
      }),
      // Update bundle type to tiered_sqft and pricing method to tiered
      prisma.serviceBundle.update({
        where: { id: validated.bundleId },
        data: {
          bundleType: "tiered_sqft",
          pricingMethod: "tiered",
        },
      }),
    ]);

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${validated.bundleId}`);

    return success({ count: validated.tiers.length });
  } catch (error) {
    console.error("Error setting bundle pricing tiers:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to set pricing tiers");
  }
}

/**
 * Get pricing tiers for a bundle
 */
export async function getBundlePricingTiers(bundleId: string) {
  try {
    const organizationId = await getOrganizationId();

    const bundle = await prisma.serviceBundle.findFirst({
      where: { id: bundleId, organizationId },
      include: {
        pricingTiers: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!bundle) {
      return null;
    }

    return bundle.pricingTiers.map((tier) => ({
      id: tier.id,
      minSqft: tier.minSqft,
      maxSqft: tier.maxSqft,
      priceCents: tier.priceCents,
      tierName: tier.tierName,
      sortOrder: tier.sortOrder,
    }));
  } catch (error) {
    console.error("Error fetching bundle pricing tiers:", error);
    return null;
  }
}

/**
 * Delete a pricing tier
 */
export async function deletePricingTier(id: string): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify tier exists and bundle belongs to organization
    const tier = await prisma.bundlePricingTier.findFirst({
      where: { id },
      include: {
        bundle: {
          select: { organizationId: true, id: true },
        },
      },
    });

    if (!tier || tier.bundle.organizationId !== organizationId) {
      return fail("Pricing tier not found");
    }

    await prisma.bundlePricingTier.delete({
      where: { id },
    });

    revalidatePath("/services/bundles");
    revalidatePath(`/services/bundles/${tier.bundle.id}`);

    return ok();
  } catch (error) {
    console.error("Error deleting pricing tier:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete pricing tier");
  }
}

// =============================================================================
// SQFT PRICE CALCULATION
// =============================================================================

export type BundlePriceResult = {
  priceCents: number;
  pricingMethod: BundlePricingMethod;
  appliedTier?: {
    id: string;
    name: string | null;
    minSqft: number;
    maxSqft: number | null;
  };
  sqftUsed: number;
};

/**
 * Calculate the price for a bundle based on square footage
 * Supports: fixed, per_sqft, and tiered pricing methods
 */
export async function calculateBundlePrice(
  input: CalculateBundlePriceInput
): Promise<ActionResult<BundlePriceResult>> {
  try {
    const validated = calculateBundlePriceSchema.parse(input);

    const bundle = await prisma.serviceBundle.findUnique({
      where: { id: validated.bundleId },
      include: {
        pricingTiers: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!bundle) {
      return fail("Bundle not found");
    }

    const sqft = validated.sqft;

    // Handle based on pricing method
    switch (bundle.pricingMethod) {
      case "fixed": {
        // Fixed pricing - sqft doesn't matter
        return success({
          priceCents: bundle.priceCents,
          pricingMethod: "fixed",
          sqftUsed: sqft,
        });
      }

      case "per_sqft": {
        // Price per square foot calculation
        const pricePerSqft = bundle.pricePerSqftCents || 0;
        const minSqft = bundle.minSqft || 0;
        const maxSqft = bundle.maxSqft;
        const increments = bundle.sqftIncrements || 1;

        // Apply min/max bounds
        let adjustedSqft = Math.max(sqft, minSqft);
        if (maxSqft) {
          adjustedSqft = Math.min(adjustedSqft, maxSqft);
        }

        // Round to nearest increment
        adjustedSqft = Math.ceil(adjustedSqft / increments) * increments;

        const priceCents = adjustedSqft * pricePerSqft;

        return success({
          priceCents,
          pricingMethod: "per_sqft",
          sqftUsed: adjustedSqft,
        });
      }

      case "tiered": {
        // Tiered pricing (BICEP-style)
        if (bundle.pricingTiers.length === 0) {
          return fail("No pricing tiers configured for this bundle",);
        }

        // Find the applicable tier
        const applicableTier = bundle.pricingTiers.find((tier) => {
          const inMinRange = sqft >= tier.minSqft;
          const inMaxRange = tier.maxSqft === null || sqft <= tier.maxSqft;
          return inMinRange && inMaxRange;
        });

        if (!applicableTier) {
          // If no tier matches, use the highest tier (for properties larger than defined tiers)
          const highestTier = bundle.pricingTiers[bundle.pricingTiers.length - 1];
          return success({
            priceCents: highestTier.priceCents,
            pricingMethod: "tiered",
            appliedTier: {
              id: highestTier.id,
              name: highestTier.tierName,
              minSqft: highestTier.minSqft,
              maxSqft: highestTier.maxSqft,
            },
            sqftUsed: sqft,
          });
        }

        return success({
          priceCents: applicableTier.priceCents,
          pricingMethod: "tiered",
          appliedTier: {
            id: applicableTier.id,
            name: applicableTier.tierName,
            minSqft: applicableTier.minSqft,
            maxSqft: applicableTier.maxSqft,
          },
          sqftUsed: sqft,
        });
      }

      default:
        return fail("Invalid pricing method");
    }
  } catch (error) {
    console.error("Error calculating bundle price:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to calculate bundle price");
  }
}

/**
 * Get a bundle with full pricing information (for order pages)
 */
export async function getBundleWithPricing(bundleId: string) {
  try {
    const bundle = await prisma.serviceBundle.findUnique({
      where: { id: bundleId },
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
        pricingTiers: {
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
      bundleType: bundle.bundleType,
      pricingMethod: bundle.pricingMethod,

      // Fixed pricing
      priceCents: bundle.priceCents,

      // Per-sqft pricing
      pricePerSqftCents: bundle.pricePerSqftCents,
      minSqft: bundle.minSqft,
      maxSqft: bundle.maxSqft,
      sqftIncrements: bundle.sqftIncrements,

      // Display
      imageUrl: bundle.imageUrl,
      badgeText: bundle.badgeText,
      originalPriceCents: bundle.originalPriceCents,
      savingsPercent: bundle.savingsPercent,

      // Related data
      services: bundle.services.map((item) => ({
        service: item.service,
        isRequired: item.isRequired,
        quantity: item.quantity,
      })),
      pricingTiers: bundle.pricingTiers.map((tier) => ({
        id: tier.id,
        minSqft: tier.minSqft,
        maxSqft: tier.maxSqft,
        priceCents: tier.priceCents,
        tierName: tier.tierName,
      })),
      organization: bundle.organization,

      isActive: bundle.isActive,
      isPublic: bundle.isPublic,
    };
  } catch (error) {
    console.error("Error fetching bundle with pricing:", error);
    return null;
  }
}

// =============================================================================
// Package Builder Analytics & Recommendations
// =============================================================================

interface PackagePerformance {
  bundleId: string;
  bundleName: string;
  totalOrders: number;
  totalRevenueCents: number;
  averageOrderValueCents: number;
  conversionRate: number;
  lastOrderDate: Date | null;
}

interface PackageAnalytics {
  totalPackages: number;
  activePackages: number;
  totalPackageRevenueCents: number;
  topPerformers: PackagePerformance[];
  underperformers: PackagePerformance[];
  revenueByPackage: { bundleId: string; name: string; revenueCents: number }[];
}

/**
 * Get package performance analytics
 */
export async function getPackageAnalytics(
  dateRange?: { startDate: Date; endDate: Date }
): Promise<ActionResult<PackageAnalytics>> {
  try {
    const organizationId = await getOrganizationId();

    // Get all packages with their order data
    const bundles = await prisma.serviceBundle.findMany({
      where: { organizationId },
      include: {
        orderItems: {
          where: dateRange
            ? {
                createdAt: {
                  gte: dateRange.startDate,
                  lte: dateRange.endDate,
                },
              }
            : undefined,
          select: {
            totalCents: true,
            unitCents: true,
            quantity: true,
            createdAt: true,
            order: {
              select: {
                status: true,
                paidAt: true,
              },
            },
          },
        },
        _count: {
          select: { orderItems: true },
        },
      },
    });

    // Calculate performance metrics for each package
    const performanceData: PackagePerformance[] = bundles.map((bundle) => {
      const completedOrders = bundle.orderItems.filter(
        (item) => item.order.status === "completed" || item.order.paidAt
      );
      const totalRevenue = completedOrders.reduce(
        (sum, item) => sum + item.totalCents,
        0
      );
      const lastOrder = completedOrders.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      return {
        bundleId: bundle.id,
        bundleName: bundle.name,
        totalOrders: completedOrders.length,
        totalRevenueCents: totalRevenue,
        averageOrderValueCents:
          completedOrders.length > 0
            ? Math.round(totalRevenue / completedOrders.length)
            : 0,
        conversionRate: bundle._count.orderItems > 0
          ? (completedOrders.length / bundle._count.orderItems) * 100
          : 0,
        lastOrderDate: lastOrder?.createdAt || null,
      };
    });

    // Sort by revenue for top/under performers
    const sortedByRevenue = [...performanceData].sort(
      (a, b) => b.totalRevenueCents - a.totalRevenueCents
    );

    const activePackages = bundles.filter((b) => b.isActive).length;
    const totalRevenue = performanceData.reduce(
      (sum, p) => sum + p.totalRevenueCents,
      0
    );

    return success({
      totalPackages: bundles.length,
      activePackages,
      totalPackageRevenueCents: totalRevenue,
      topPerformers: sortedByRevenue.slice(0, 5),
      underperformers: sortedByRevenue
        .filter((p) => p.totalOrders > 0)
        .slice(-5)
        .reverse(),
      revenueByPackage: sortedByRevenue.map((p) => ({
        bundleId: p.bundleId,
        name: p.bundleName,
        revenueCents: p.totalRevenueCents,
      })),
    });
  } catch (error) {
    console.error("Error getting package analytics:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get package analytics");
  }
}

/**
 * Get service combination recommendations based on booking patterns
 */
export async function getPackageRecommendations(): Promise<
  ActionResult<{
    recommendations: {
      services: { id: string; name: string }[];
      frequency: number;
      suggestedPriceCents: number;
      potentialSavingsPercent: number;
    }[];
  }>
> {
  try {
    const organizationId = await getOrganizationId();

    // Get recent bookings with services to find common combinations
    const recentBookings = await prisma.booking.findMany({
      where: {
        organizationId,
        serviceId: { not: null },
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
      },
      include: {
        service: {
          select: { id: true, name: true, priceCents: true },
        },
        client: {
          select: { id: true },
        },
      },
    });

    // Group by client to find service combinations
    const clientServiceMap = new Map<string, Set<string>>();
    const serviceDetails = new Map<string, { name: string; priceCents: number }>();

    recentBookings.forEach((booking) => {
      if (booking.clientId && booking.serviceId && booking.service) {
        if (!clientServiceMap.has(booking.clientId)) {
          clientServiceMap.set(booking.clientId, new Set());
        }
        clientServiceMap.get(booking.clientId)!.add(booking.serviceId);
        serviceDetails.set(booking.serviceId, {
          name: booking.service.name,
          priceCents: booking.service.priceCents,
        });
      }
    });

    // Find common service combinations (clients who bought multiple services)
    const combinationFrequency = new Map<string, number>();
    clientServiceMap.forEach((services) => {
      if (services.size >= 2) {
        const sortedServices = Array.from(services).sort().join(",");
        combinationFrequency.set(
          sortedServices,
          (combinationFrequency.get(sortedServices) || 0) + 1
        );
      }
    });

    // Convert to recommendations (top 5 combinations)
    const sortedCombinations = Array.from(combinationFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const recommendations = sortedCombinations.map(([combo, frequency]) => {
      const serviceIds = combo.split(",");
      const services = serviceIds.map((id) => ({
        id,
        name: serviceDetails.get(id)?.name || "Unknown",
      }));
      const totalPrice = serviceIds.reduce(
        (sum, id) => sum + (serviceDetails.get(id)?.priceCents || 0),
        0
      );
      const suggestedDiscount = 0.1 + (frequency > 5 ? 0.05 : 0); // 10-15% discount
      const suggestedPriceCents = Math.round(totalPrice * (1 - suggestedDiscount));

      return {
        services,
        frequency,
        suggestedPriceCents,
        potentialSavingsPercent: Math.round(suggestedDiscount * 100),
      };
    });

    return success({ recommendations });
  } catch (error) {
    console.error("Error getting package recommendations:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get package recommendations");
  }
}

/**
 * Quick create a package from a recommendation
 */
export async function createPackageFromRecommendation(
  name: string,
  serviceIds: string[],
  priceCents: number,
  options?: {
    description?: string;
    badgeText?: string;
  }
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify all services exist and belong to org
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId,
      },
    });

    if (services.length !== serviceIds.length) {
      return fail("One or more services not found");
    }

    // Calculate original price for savings display
    const originalPriceCents = services.reduce((sum, s) => sum + s.priceCents, 0);
    const savingsPercent =
      originalPriceCents > 0
        ? Math.round(((originalPriceCents - priceCents) / originalPriceCents) * 100)
        : 0;

    // Generate slug
    const slug = generateSlug(name);

    // Create bundle with services
    const bundle = await prisma.serviceBundle.create({
      data: {
        organizationId,
        name,
        slug,
        description: options?.description,
        priceCents,
        bundleType: "fixed",
        pricingMethod: "fixed",
        badgeText: options?.badgeText || (savingsPercent >= 15 ? "Best Value" : null),
        originalPriceCents,
        savingsPercent,
        isActive: true,
        isPublic: true,
        services: {
          create: serviceIds.map((serviceId, index) => ({
            serviceId,
            isRequired: true,
            quantity: 1,
            sortOrder: index,
          })),
        },
      },
    });

    revalidatePath("/services/bundles");
    revalidatePath("/order-pages");

    return success({ id: bundle.id, slug: bundle.slug });
  } catch (error) {
    console.error("Error creating package from recommendation:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create package");
  }
}

/**
 * Get package templates for quick setup
 */
export async function getPackageTemplates(): Promise<
  ActionResult<{
    templates: {
      id: string;
      name: string;
      description: string;
      suggestedServices: string[];
      industry: string;
      discountPercent: number;
    }[];
  }>
> {
  // Pre-defined templates for common photography package types
  const templates = [
    {
      id: "wedding-complete",
      name: "Complete Wedding Package",
      description: "Full-day coverage with engagement session and albums",
      suggestedServices: ["Wedding Photography", "Engagement Session", "Wedding Album"],
      industry: "Wedding",
      discountPercent: 15,
    },
    {
      id: "corporate-headshots",
      name: "Corporate Headshots Package",
      description: "Team headshots with quick turnaround",
      suggestedServices: ["Headshots", "Retouching", "Digital Delivery"],
      industry: "Corporate",
      discountPercent: 10,
    },
    {
      id: "real-estate-premium",
      name: "Premium Real Estate Package",
      description: "Photos, video, and aerial coverage",
      suggestedServices: ["Real Estate Photos", "Video Tour", "Drone Photography", "Virtual Staging"],
      industry: "Real Estate",
      discountPercent: 20,
    },
    {
      id: "event-full",
      name: "Full Event Coverage",
      description: "Multi-photographer event coverage with same-day preview",
      suggestedServices: ["Event Photography", "Second Photographer", "Same-Day Preview"],
      industry: "Events",
      discountPercent: 12,
    },
    {
      id: "portrait-family",
      name: "Family Portrait Session",
      description: "Extended session with prints and digital files",
      suggestedServices: ["Portrait Session", "Print Package", "Digital Files"],
      industry: "Portrait",
      discountPercent: 10,
    },
  ];

  return success({ templates });
}
