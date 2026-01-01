"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { EquipmentCategory } from "@prisma/client";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID
async function getOrganizationId(): Promise<string> {
  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!org) {
    throw new Error("No organization found");
  }

  return org.id;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const equipmentCategorySchema = z.enum([
  "camera",
  "lens",
  "lighting",
  "drone",
  "tripod",
  "audio",
  "stabilizer",
  "backdrop",
  "other",
]);

const equipmentSchema = z.object({
  name: z.string().min(1, "Equipment name is required").max(200),
  category: equipmentCategorySchema,
  description: z.string().max(2000).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  purchaseDate: z.date().optional().nullable(),
  valueCents: z.number().min(0).optional().nullable(),
});

const createEquipmentSchema = equipmentSchema;

const updateEquipmentSchema = equipmentSchema.partial().extend({
  id: z.string().cuid(),
});

// ============================================================================
// EQUIPMENT CRUD OPERATIONS
// ============================================================================

/**
 * Create a new piece of equipment
 */
export async function createEquipment(
  input: z.infer<typeof createEquipmentSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createEquipmentSchema.parse(input);
    const organizationId = await getOrganizationId();

    const equipment = await prisma.equipment.create({
      data: {
        organizationId,
        name: validated.name,
        category: validated.category as EquipmentCategory,
        description: validated.description || null,
        serialNumber: validated.serialNumber || null,
        purchaseDate: validated.purchaseDate || null,
        valueCents: validated.valueCents || null,
      },
    });

    revalidatePath("/settings/equipment");

    return { success: true, data: { id: equipment.id } };
  } catch (error) {
    console.error("Error creating equipment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create equipment" };
  }
}

/**
 * Update an existing piece of equipment
 */
export async function updateEquipment(
  input: z.infer<typeof updateEquipmentSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateEquipmentSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify equipment exists and belongs to organization
    const existing = await prisma.equipment.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Equipment not found" };
    }

    const { id, ...updateData } = validated;

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.category && { category: updateData.category as EquipmentCategory }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.serialNumber !== undefined && { serialNumber: updateData.serialNumber }),
        ...(updateData.purchaseDate !== undefined && { purchaseDate: updateData.purchaseDate }),
        ...(updateData.valueCents !== undefined && { valueCents: updateData.valueCents }),
      },
    });

    revalidatePath("/settings/equipment");

    return { success: true, data: { id: equipment.id } };
  } catch (error) {
    console.error("Error updating equipment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update equipment" };
  }
}

/**
 * Delete a piece of equipment
 */
export async function deleteEquipment(id: string): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify equipment exists and belongs to organization
    const existing = await prisma.equipment.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Equipment not found" };
    }

    await prisma.equipment.delete({
      where: { id },
    });

    revalidatePath("/settings/equipment");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting equipment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete equipment" };
  }
}

/**
 * Get a single piece of equipment by ID
 */
export async function getEquipment(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const equipment = await prisma.equipment.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        userAssignments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        serviceRequirements: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return equipment;
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return null;
  }
}

/**
 * Get all equipment for the organization
 */
export async function getEquipmentList(filters?: {
  category?: EquipmentCategory;
  search?: string;
}) {
  try {
    const organizationId = await getOrganizationId();

    const equipment = await prisma.equipment.findMany({
      where: {
        organizationId,
        ...(filters?.category && { category: filters.category }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            { serialNumber: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        userAssignments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            serviceRequirements: true,
          },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return equipment;
  } catch (error) {
    console.error("Error fetching equipment list:", error);
    return [];
  }
}

/**
 * Get equipment grouped by category
 */
export async function getEquipmentByCategory() {
  try {
    const organizationId = await getOrganizationId();

    const equipment = await prisma.equipment.findMany({
      where: { organizationId },
      include: {
        userAssignments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Group by category
    const grouped: Record<string, typeof equipment> = {};
    for (const item of equipment) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }

    return grouped;
  } catch (error) {
    console.error("Error fetching equipment by category:", error);
    return {};
  }
}

// ============================================================================
// USER EQUIPMENT ASSIGNMENTS
// ============================================================================

/**
 * Assign equipment to a user
 */
export async function assignEquipmentToUser(
  userId: string,
  equipmentId: string,
  notes?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify equipment belongs to organization
    const equipment = await prisma.equipment.findFirst({
      where: {
        id: equipmentId,
        organizationId,
      },
    });

    if (!equipment) {
      return { success: false, error: "Equipment not found" };
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!membership) {
      return { success: false, error: "User is not a member of this organization" };
    }

    // Create assignment (upsert to handle duplicates)
    const assignment = await prisma.userEquipment.upsert({
      where: {
        userId_equipmentId: {
          userId,
          equipmentId,
        },
      },
      create: {
        userId,
        equipmentId,
        notes: notes || null,
      },
      update: {
        notes: notes || null,
      },
    });

    revalidatePath("/settings/equipment");
    revalidatePath(`/settings/team/${userId}`);

    return { success: true, data: { id: assignment.id } };
  } catch (error) {
    console.error("Error assigning equipment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to assign equipment" };
  }
}

/**
 * Remove equipment assignment from a user
 */
export async function unassignEquipmentFromUser(
  userId: string,
  equipmentId: string
): Promise<ActionResult> {
  try {
    await prisma.userEquipment.delete({
      where: {
        userId_equipmentId: {
          userId,
          equipmentId,
        },
      },
    });

    revalidatePath("/settings/equipment");
    revalidatePath(`/settings/team/${userId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error unassigning equipment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to unassign equipment" };
  }
}

/**
 * Get all equipment assigned to a user
 */
export async function getUserEquipment(userId: string) {
  try {
    const assignments = await prisma.userEquipment.findMany({
      where: { userId },
      include: {
        equipment: true,
      },
      orderBy: {
        equipment: {
          category: "asc",
        },
      },
    });

    return assignments.map((a) => ({
      ...a.equipment,
      assignedAt: a.assignedAt,
      notes: a.notes,
    }));
  } catch (error) {
    console.error("Error fetching user equipment:", error);
    return [];
  }
}

// ============================================================================
// SERVICE EQUIPMENT REQUIREMENTS
// ============================================================================

/**
 * Add equipment requirement to a service
 */
export async function addServiceEquipmentRequirement(
  serviceId: string,
  equipmentId: string,
  isRequired: boolean = true
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify service and equipment belong to organization
    const [service, equipment] = await Promise.all([
      prisma.service.findFirst({
        where: { id: serviceId, organizationId },
      }),
      prisma.equipment.findFirst({
        where: { id: equipmentId, organizationId },
      }),
    ]);

    if (!service) {
      return { success: false, error: "Service not found" };
    }
    if (!equipment) {
      return { success: false, error: "Equipment not found" };
    }

    // Create requirement (upsert to handle duplicates)
    const requirement = await prisma.serviceEquipmentRequirement.upsert({
      where: {
        serviceId_equipmentId: {
          serviceId,
          equipmentId,
        },
      },
      create: {
        serviceId,
        equipmentId,
        isRequired,
      },
      update: {
        isRequired,
      },
    });

    revalidatePath("/galleries/services");
    revalidatePath(`/galleries/services/${serviceId}`);

    return { success: true, data: { id: requirement.id } };
  } catch (error) {
    console.error("Error adding service equipment requirement:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add equipment requirement" };
  }
}

/**
 * Remove equipment requirement from a service
 */
export async function removeServiceEquipmentRequirement(
  serviceId: string,
  equipmentId: string
): Promise<ActionResult> {
  try {
    await prisma.serviceEquipmentRequirement.delete({
      where: {
        serviceId_equipmentId: {
          serviceId,
          equipmentId,
        },
      },
    });

    revalidatePath("/galleries/services");
    revalidatePath(`/galleries/services/${serviceId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing service equipment requirement:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove equipment requirement" };
  }
}

/**
 * Get equipment requirements for a service
 */
export async function getServiceEquipmentRequirements(serviceId: string) {
  try {
    const requirements = await prisma.serviceEquipmentRequirement.findMany({
      where: { serviceId },
      include: {
        equipment: true,
      },
      orderBy: [{ isRequired: "desc" }, { equipment: { name: "asc" } }],
    });

    return requirements.map((r) => ({
      ...r.equipment,
      isRequired: r.isRequired,
    }));
  } catch (error) {
    console.error("Error fetching service equipment requirements:", error);
    return [];
  }
}

// Type exports
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
