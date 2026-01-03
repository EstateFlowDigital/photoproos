"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createServiceSchema,
  updateServiceSchema,
  deleteServiceSchema,
  duplicateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
  type ServiceFilters,
} from "@/lib/validations/services";
import type { ServiceCategory } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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

    revalidatePath("/services");
    revalidatePath("/galleries");

    return { success: true, data: { id: service.id } };
  } catch (error) {
    console.error("Error creating service:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create service" };
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
      return { success: false, error: "Service not found" };
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

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);
    revalidatePath("/galleries");

    return { success: true, data: { id: service.id } };
  } catch (error) {
    console.error("Error updating service:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update service" };
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
      return { success: false, error: "Service not found" };
    }

    const usageCount = existing._count.projects + existing._count.bookings;

    if (usageCount > 0 && !force) {
      // Archive instead of delete if in use
      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      revalidatePath("/services");
      return {
        success: true,
        data: undefined,
      };
    }

    // Actually delete if not in use or force is true
    await prisma.service.delete({
      where: { id },
    });

    revalidatePath("/services");
    revalidatePath("/galleries");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting service:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete service" };
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
      return { success: false, error: "Service not found" };
    }

    // Create duplicate
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

    revalidatePath("/services");

    return { success: true, data: { id: duplicate.id } };
  } catch (error) {
    console.error("Error duplicating service:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to duplicate service" };
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
      return { success: false, error: "Service not found" };
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);

    return { success: true, data: { isActive: updated.isActive } };
  } catch (error) {
    console.error("Error toggling service status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to toggle service status" };
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
      return { success: false, error: "Default services already exist" };
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

    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error seeding default services:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to seed default services" };
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
      return { success: false, error: "No services selected" };
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
      return { success: false, error: "No services found" };
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

    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error toggling service statuses:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to toggle service statuses" };
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
      return { success: false, error: "No services selected" };
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

    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error archiving services:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to archive services" };
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
      return { success: false, error: "No services selected" };
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
      return { success: false, error: "No services found" };
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

    return { success: true, data: { count: deletedCount + archivedCount } };
  } catch (error) {
    console.error("Error deleting services:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete services" };
  }
}
