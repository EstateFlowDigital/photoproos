"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createServiceSchema,
  updateServiceSchema,
  deleteServiceSchema,
  duplicateServiceSchema,
  createServicePricingTiersSchema,
  calculateServicePriceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
  type ServiceFilters,
  type CreateServicePricingTiersInput,
  type CalculateServicePriceInput,
} from "@/lib/validations/services";
import type { ServiceCategory, ServicePricingMethod } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import {
  syncServiceToStripe,
  archiveStripeProduct,
  reactivateStripeProduct,
} from "@/lib/stripe/product-sync";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

/**
 * Create a new service
 */
export async function createService(
  input: CreateServiceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createServiceSchema.parse(input);
    const organizationId = await getOrganizationId();

    const service = await prisma.service.create({
      data: {
        organizationId,
        name: validated.name,
        category: validated.category as ServiceCategory,
        description: validated.description,
        priceCents: validated.priceCents,
        duration: validated.duration,
        deliverables: validated.deliverables,
        isActive: validated.isActive,
        isDefault: false,
      },
    });

    // Sync to Stripe Product Catalog (non-blocking)
    syncServiceToStripe(service, organizationId).catch((err) => {
      console.error("Failed to sync service to Stripe:", err);
    });

    revalidatePath("/services");
    revalidatePath("/galleries");

    return success({ id: service.id });
  } catch (error) {
    console.error("Error creating service:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create service");
  }
}

/**
 * Update an existing service
 */
export async function updateService(
  input: UpdateServiceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateServiceSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify service exists and belongs to organization
    const existing = await prisma.service.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return fail("Service not found");
    }

    const { id, ...updateData } = validated;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.category && { category: updateData.category as ServiceCategory }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.priceCents !== undefined && { priceCents: updateData.priceCents }),
        ...(updateData.duration !== undefined && { duration: updateData.duration }),
        ...(updateData.deliverables && { deliverables: updateData.deliverables }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
      },
    });

    // Sync to Stripe if name, description, or price changed
    const needsStripeSync =
      updateData.name !== undefined ||
      updateData.description !== undefined ||
      updateData.priceCents !== undefined;

    if (needsStripeSync) {
      syncServiceToStripe(service, organizationId).catch((err) => {
        console.error("Failed to sync service to Stripe:", err);
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

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);
    revalidatePath("/galleries");

    return success({ id: service.id });
  } catch (error) {
    console.error("Error updating service:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update service");
  }
}

/**
 * Delete a service (or archive if in use)
 */
export async function deleteService(
  id: string,
  force: boolean = false
): Promise<ActionResult> {
  try {
    deleteServiceSchema.parse({ id, force });
    const organizationId = await getOrganizationId();

    // Verify service exists and belongs to organization
    const existing = await prisma.service.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            projects: true,
            bookings: true,
          },
        },
      },
    });

    if (!existing) {
      return fail("Service not found");
    }

    const usageCount = existing._count.projects + existing._count.bookings;

    if (usageCount > 0 && !force) {
      // Archive instead of delete if in use
      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      // Archive in Stripe
      if (existing.stripeProductId) {
        archiveStripeProduct(existing.stripeProductId, existing.stripePriceId).catch(
          (err) => console.error("Failed to archive Stripe product:", err)
        );
      }

      revalidatePath("/services");
      return {
        success: true,
        data: undefined,
      };
    }

    // Archive in Stripe before deleting locally
    if (existing.stripeProductId) {
      archiveStripeProduct(existing.stripeProductId, existing.stripePriceId).catch(
        (err) => console.error("Failed to archive Stripe product:", err)
      );
    }

    // Actually delete if not in use or force is true
    await prisma.service.delete({
      where: { id },
    });

    revalidatePath("/services");
    revalidatePath("/galleries");

    return ok();
  } catch (error) {
    console.error("Error deleting service:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete service");
  }
}

/**
 * Duplicate a service
 */
export async function duplicateService(
  id: string,
  newName?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    duplicateServiceSchema.parse({ id, newName });
    const organizationId = await getOrganizationId();

    // Get original service
    const original = await prisma.service.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!original) {
      return fail("Service not found");
    }

    // Create duplicate (without Stripe IDs - will get new ones)
    const duplicate = await prisma.service.create({
      data: {
        organizationId,
        name: newName || `${original.name} (Copy)`,
        category: original.category,
        description: original.description,
        priceCents: original.priceCents,
        duration: original.duration,
        deliverables: original.deliverables,
        isActive: true,
        isDefault: false, // Copies are always custom
      },
    });

    // Sync duplicate to Stripe (non-blocking)
    syncServiceToStripe(duplicate, organizationId).catch((err) => {
      console.error("Failed to sync duplicated service to Stripe:", err);
    });

    revalidatePath("/services");

    return success({ id: duplicate.id });
  } catch (error) {
    console.error("Error duplicating service:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to duplicate service");
  }
}

/**
 * Toggle service active status
 */
export async function toggleServiceStatus(
  id: string
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.service.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return fail("Service not found");
    }

    const updated = await prisma.service.update({
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

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);

    return success({ isActive: updated.isActive });
  } catch (error) {
    console.error("Error toggling service status:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to toggle service status");
  }
}

/**
 * Get all services for the organization
 */
export async function getServices(filters?: ServiceFilters) {
  try {
    const organizationId = await getOrganizationId();

    const services = await prisma.service.findMany({
      where: {
        organizationId,
        ...(filters?.category && { category: filters.category as ServiceCategory }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.isDefault !== undefined && { isDefault: filters.isDefault }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            projects: true,
            bookings: true,
          },
        },
      },
      orderBy: [
        { isDefault: "asc" }, // Custom services first
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      priceCents: service.priceCents,
      duration: service.duration,
      deliverables: service.deliverables,
      isActive: service.isActive,
      isDefault: service.isDefault,
      usageCount: service._count.projects + service._count.bookings,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

/**
 * Get a single service by ID
 */
export async function getService(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            projects: true,
            bookings: true,
          },
        },
      },
    });

    if (!service) {
      return null;
    }

    return {
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      priceCents: service.priceCents,
      duration: service.duration,
      deliverables: service.deliverables,
      isActive: service.isActive,
      isDefault: service.isDefault,
      usageCount: service._count.projects + service._count.bookings,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
}

/**
 * Seed default services for an organization
 * Called when organization is created or to reset templates
 */
export async function seedDefaultServices(): Promise<ActionResult<{ count: number }>> {
  try {
    const organizationId = await getOrganizationId();

    // Import predefined services from lib
    const { photographyServices } = await import("@/lib/services");

    // Check if defaults already exist
    const existingDefaults = await prisma.service.count({
      where: {
        organizationId,
        isDefault: true,
      },
    });

    if (existingDefaults > 0) {
      return fail("Default services already exist");
    }

    // Create all default services
    const result = await prisma.service.createMany({
      data: photographyServices.map((service, index) => ({
        organizationId,
        name: service.name,
        category: service.category as ServiceCategory,
        description: service.description,
        priceCents: service.basePrice,
        duration: service.estimatedDuration,
        deliverables: service.deliverables,
        isActive: true,
        isDefault: true,
        sortOrder: index,
      })),
    });

    revalidatePath("/services");

    return success({ count: result.count });
  } catch (error) {
    console.error("Error seeding default services:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to seed default services");
  }
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

/**
 * Toggle status for multiple services
 */
export async function bulkToggleServiceStatus(
  ids: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    if (!ids.length) {
      return fail("No services selected");
    }

    const organizationId = await getOrganizationId();

    // Get current status of all services
    const services = await prisma.service.findMany({
      where: {
        id: { in: ids },
        organizationId,
      },
      select: { id: true, isActive: true },
    });

    if (services.length === 0) {
      return fail("No services found");
    }

    // Determine action: if ANY are active, deactivate all; otherwise activate all
    const anyActive = services.some((s) => s.isActive);
    const newStatus = !anyActive;

    const result = await prisma.service.updateMany({
      where: {
        id: { in: ids },
        organizationId,
      },
      data: { isActive: newStatus },
    });

    revalidatePath("/services");
    revalidatePath("/services");

    return success({ count: result.count });
  } catch (error) {
    console.error("Error toggling service statuses:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to toggle service statuses");
  }
}

/**
 * Archive multiple services (set isActive to false)
 */
export async function bulkArchiveServices(
  ids: string[],
  archive: boolean = true
): Promise<ActionResult<{ count: number }>> {
  try {
    if (!ids.length) {
      return fail("No services selected");
    }

    const organizationId = await getOrganizationId();

    const result = await prisma.service.updateMany({
      where: {
        id: { in: ids },
        organizationId,
      },
      data: { isActive: !archive },
    });

    revalidatePath("/services");
    revalidatePath("/services");

    return success({ count: result.count });
  } catch (error) {
    console.error("Error archiving services:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to archive services");
  }
}

/**
 * Delete multiple services (archives if in use)
 */
export async function bulkDeleteServices(
  ids: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    if (!ids.length) {
      return fail("No services selected");
    }

    const organizationId = await getOrganizationId();

    // Get usage counts for all services
    const services = await prisma.service.findMany({
      where: {
        id: { in: ids },
        organizationId,
      },
      include: {
        _count: {
          select: {
            projects: true,
            bookings: true,
          },
        },
      },
    });

    if (services.length === 0) {
      return fail("No services found");
    }

    // Separate into deletable and archivable
    const toDelete: string[] = [];
    const toArchive: string[] = [];

    for (const service of services) {
      const usageCount = service._count.projects + service._count.bookings;
      if (usageCount > 0) {
        toArchive.push(service.id);
      } else {
        toDelete.push(service.id);
      }
    }

    let deletedCount = 0;
    let archivedCount = 0;

    // Delete services not in use
    if (toDelete.length > 0) {
      const deleteResult = await prisma.service.deleteMany({
        where: {
          id: { in: toDelete },
          organizationId,
        },
      });
      deletedCount = deleteResult.count;
    }

    // Archive services that are in use
    if (toArchive.length > 0) {
      const archiveResult = await prisma.service.updateMany({
        where: {
          id: { in: toArchive },
          organizationId,
        },
        data: { isActive: false },
      });
      archivedCount = archiveResult.count;
    }

    revalidatePath("/services");
    revalidatePath("/services");

    return success({ count: deletedCount + archivedCount });
  } catch (error) {
    console.error("Error deleting services:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete services");
  }
}

// =============================================================================
// SQUARE FOOTAGE PRICING
// =============================================================================

export type ServicePriceResult = {
  priceCents: number;
  pricingMethod: ServicePricingMethod;
  appliedTier?: {
    id: string;
    name: string | null;
    minSqft: number;
    maxSqft: number | null;
  };
  sqftUsed: number;
};

/**
 * Set pricing tiers for a service (replaces all existing)
 */
export async function setServicePricingTiers(
  input: CreateServicePricingTiersInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const validated = createServicePricingTiersSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify service exists and belongs to organization
    const service = await prisma.service.findFirst({
      where: {
        id: validated.serviceId,
        organizationId,
      },
    });

    if (!service) {
      return fail("Service not found");
    }

    // Validate tier ranges don't overlap
    const sortedTiers = [...validated.tiers].sort((a, b) => a.minSqft - b.minSqft);
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const currentTier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];
      if (currentTier.maxSqft && currentTier.maxSqft >= nextTier.minSqft) {
        return fail(
          `Tier ranges overlap: ${currentTier.minSqft}-${currentTier.maxSqft} and ${nextTier.minSqft}-${nextTier.maxSqft}`
        );
      }
    }

    // Replace all pricing tiers
    await prisma.$transaction([
      // Delete existing
      prisma.servicePricingTier.deleteMany({
        where: { serviceId: validated.serviceId },
      }),
      // Create new
      prisma.servicePricingTier.createMany({
        data: validated.tiers.map((tier, index) => ({
          serviceId: validated.serviceId,
          minSqft: tier.minSqft,
          maxSqft: tier.maxSqft,
          priceCents: tier.priceCents,
          tierName: tier.tierName,
          sortOrder: tier.sortOrder ?? index,
        })),
      }),
      // Update service pricing method to tiered
      prisma.service.update({
        where: { id: validated.serviceId },
        data: { pricingMethod: "tiered" },
      }),
    ]);

    revalidatePath("/services");
    revalidatePath(`/services/${validated.serviceId}`);

    return success({ count: validated.tiers.length });
  } catch (error) {
    console.error("Error setting service pricing tiers:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to set pricing tiers");
  }
}

/**
 * Get pricing tiers for a service
 */
export async function getServicePricingTiers(serviceId: string) {
  try {
    const organizationId = await getOrganizationId();

    const service = await prisma.service.findFirst({
      where: { id: serviceId, organizationId },
      include: {
        pricingTiers: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!service) {
      return null;
    }

    return service.pricingTiers.map((tier) => ({
      id: tier.id,
      minSqft: tier.minSqft,
      maxSqft: tier.maxSqft,
      priceCents: tier.priceCents,
      tierName: tier.tierName,
      sortOrder: tier.sortOrder,
    }));
  } catch (error) {
    console.error("Error fetching service pricing tiers:", error);
    return null;
  }
}

/**
 * Delete a pricing tier
 */
export async function deleteServicePricingTier(id: string): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify tier exists and service belongs to organization
    const tier = await prisma.servicePricingTier.findFirst({
      where: { id },
      include: {
        service: {
          select: { organizationId: true, id: true },
        },
      },
    });

    if (!tier || tier.service.organizationId !== organizationId) {
      return fail("Pricing tier not found");
    }

    await prisma.servicePricingTier.delete({
      where: { id },
    });

    revalidatePath("/services");
    revalidatePath(`/services/${tier.service.id}`);

    return ok();
  } catch (error) {
    console.error("Error deleting pricing tier:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete pricing tier");
  }
}

/**
 * Calculate the price for a service based on square footage
 * Supports: fixed, per_sqft, and tiered pricing methods
 */
export async function calculateServicePrice(
  input: CalculateServicePriceInput
): Promise<ActionResult<ServicePriceResult>> {
  try {
    const validated = calculateServicePriceSchema.parse(input);

    const service = await prisma.service.findUnique({
      where: { id: validated.serviceId },
      include: {
        pricingTiers: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!service) {
      return fail("Service not found");
    }

    const sqft = validated.sqft;

    // Handle based on pricing method
    switch (service.pricingMethod) {
      case "fixed": {
        // Fixed pricing - sqft doesn't matter
        return success({
          priceCents: service.priceCents,
          pricingMethod: "fixed",
          sqftUsed: sqft,
        });
      }

      case "per_sqft": {
        // Price per square foot calculation
        const pricePerSqft = service.pricePerSqftCents || 0;
        const minSqft = service.minSqft || 0;
        const maxSqft = service.maxSqft;
        const increments = service.sqftIncrements || 1;

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
        if (service.pricingTiers.length === 0) {
          return fail("No pricing tiers configured for this service");
        }

        // Find the applicable tier
        const applicableTier = service.pricingTiers.find((tier) => {
          const inMinRange = sqft >= tier.minSqft;
          const inMaxRange = tier.maxSqft === null || sqft <= tier.maxSqft;
          return inMinRange && inMaxRange;
        });

        if (!applicableTier) {
          // If no tier matches, use the highest tier (for properties larger than defined tiers)
          const highestTier = service.pricingTiers[service.pricingTiers.length - 1];
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
    console.error("Error calculating service price:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to calculate service price");
  }
}

/**
 * Get a service with full pricing information
 */
export async function getServiceWithPricing(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        pricingTiers: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            projects: true,
            bookings: true,
          },
        },
      },
    });

    if (!service) {
      return null;
    }

    return {
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      deliverables: service.deliverables,
      isActive: service.isActive,
      isDefault: service.isDefault,

      // Pricing information
      pricingMethod: service.pricingMethod,
      priceCents: service.priceCents,
      pricePerSqftCents: service.pricePerSqftCents,
      minSqft: service.minSqft,
      maxSqft: service.maxSqft,
      sqftIncrements: service.sqftIncrements,

      // Pricing tiers
      pricingTiers: service.pricingTiers.map((tier) => ({
        id: tier.id,
        minSqft: tier.minSqft,
        maxSqft: tier.maxSqft,
        priceCents: tier.priceCents,
        tierName: tier.tierName,
        sortOrder: tier.sortOrder,
      })),

      usageCount: service._count.projects + service._count.bookings,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching service with pricing:", error);
    return null;
  }
}

/**
 * Update service pricing method
 */
export async function updateServicePricingMethod(
  id: string,
  pricingMethod: ServicePricingMethod,
  options?: {
    priceCents?: number;
    pricePerSqftCents?: number;
    minSqft?: number;
    maxSqft?: number | null;
    sqftIncrements?: number;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify service exists and belongs to organization
    const existing = await prisma.service.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return fail("Service not found");
    }

    // Validate options based on pricing method
    if (pricingMethod === "per_sqft" && (!options?.pricePerSqftCents || options.pricePerSqftCents <= 0)) {
      return fail("Price per sqft is required for per_sqft pricing");
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        pricingMethod,
        ...(options?.priceCents !== undefined && { priceCents: options.priceCents }),
        ...(options?.pricePerSqftCents !== undefined && { pricePerSqftCents: options.pricePerSqftCents }),
        ...(options?.minSqft !== undefined && { minSqft: options.minSqft }),
        ...(options?.maxSqft !== undefined && { maxSqft: options.maxSqft }),
        ...(options?.sqftIncrements !== undefined && { sqftIncrements: options.sqftIncrements }),
      },
    });

    // Sync to Stripe if price changed
    if (options?.priceCents !== undefined) {
      syncServiceToStripe(service, organizationId).catch((err) => {
        console.error("Failed to sync service to Stripe:", err);
      });
    }

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);

    return success({ id: service.id });
  } catch (error) {
    console.error("Error updating service pricing method:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update service pricing method");
  }
}

/**
 * Get all services with pricing tiers included
 */
export async function getServicesWithPricing(filters?: ServiceFilters) {
  try {
    const organizationId = await getOrganizationId();

    const services = await prisma.service.findMany({
      where: {
        organizationId,
        ...(filters?.category && { category: filters.category as ServiceCategory }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.isDefault !== undefined && { isDefault: filters.isDefault }),
        ...(filters?.pricingMethod && { pricingMethod: filters.pricingMethod }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        pricingTiers: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            projects: true,
            bookings: true,
          },
        },
      },
      orderBy: [
        { isDefault: "asc" }, // Custom services first
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      deliverables: service.deliverables,
      isActive: service.isActive,
      isDefault: service.isDefault,
      pricingMethod: service.pricingMethod,
      priceCents: service.priceCents,
      pricePerSqftCents: service.pricePerSqftCents,
      minSqft: service.minSqft,
      maxSqft: service.maxSqft,
      sqftIncrements: service.sqftIncrements,
      pricingTiers: service.pricingTiers.map((tier) => ({
        id: tier.id,
        minSqft: tier.minSqft,
        maxSqft: tier.maxSqft,
        priceCents: tier.priceCents,
        tierName: tier.tierName,
        sortOrder: tier.sortOrder,
      })),
      usageCount: service._count.projects + service._count.bookings,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching services with pricing:", error);
    return [];
  }
}

/**
 * Get formatted price display for a service
 * Returns a human-readable price string based on pricing method
 */
export async function getServicePriceDisplay(id: string): Promise<string | null> {
  try {
    const organizationId = await getOrganizationId();

    const service = await prisma.service.findFirst({
      where: { id, organizationId },
      include: {
        pricingTiers: {
          orderBy: { minSqft: "asc" },
          take: 1,
        },
      },
    });

    if (!service) {
      return null;
    }

    const formatPrice = (cents: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(cents / 100);
    };

    switch (service.pricingMethod) {
      case "fixed":
        return formatPrice(service.priceCents);

      case "per_sqft":
        const perSqft = (service.pricePerSqftCents || 0) / 100;
        return `$${perSqft.toFixed(2)}/sqft`;

      case "tiered":
        if (service.pricingTiers.length > 0) {
          const lowestPrice = service.pricingTiers[0].priceCents;
          return `From ${formatPrice(lowestPrice)}`;
        }
        return "Contact for pricing";

      default:
        return formatPrice(service.priceCents);
    }
  } catch (error) {
    console.error("Error getting service price display:", error);
    return null;
  }
}
