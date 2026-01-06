"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { CapabilityLevel } from "@prisma/client";
import { ok, type ActionResult } from "@/lib/types/action-result";

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

const capabilityLevelSchema = z.enum(["learning", "capable", "expert"]);

const serviceCapabilitySchema = z.object({
  userId: z.string().cuid(),
  serviceId: z.string().cuid(),
  level: capabilityLevelSchema.default("capable"),
  notes: z.string().max(500).optional().nullable(),
});

// ============================================================================
// SERVICE CAPABILITY OPERATIONS
// ============================================================================

/**
 * Assign a service capability to a team member
 */
export async function assignServiceCapability(
  input: z.infer<typeof serviceCapabilitySchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = serviceCapabilitySchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: validated.userId,
        organizationId,
      },
    });

    if (!membership) {
      return { success: false, error: "User is not a member of this organization" };
    }

    // Verify service belongs to organization
    const service = await prisma.service.findFirst({
      where: {
        id: validated.serviceId,
        organizationId,
      },
    });

    if (!service) {
      return { success: false, error: "Service not found" };
    }

    // Create or update capability
    const capability = await prisma.userServiceCapability.upsert({
      where: {
        userId_serviceId: {
          userId: validated.userId,
          serviceId: validated.serviceId,
        },
      },
      create: {
        userId: validated.userId,
        serviceId: validated.serviceId,
        level: validated.level as CapabilityLevel,
        notes: validated.notes || null,
      },
      update: {
        level: validated.level as CapabilityLevel,
        notes: validated.notes || null,
      },
    });

    revalidatePath(`/settings/team/${validated.userId}`);
    revalidatePath(`/settings/team/${validated.userId}/capabilities`);

    return { success: true, data: { id: capability.id } };
  } catch (error) {
    console.error("Error assigning service capability:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to assign capability" };
  }
}

/**
 * Update a service capability level
 */
export async function updateServiceCapability(
  userId: string,
  serviceId: string,
  level: "learning" | "capable" | "expert",
  notes?: string
): Promise<ActionResult> {
  try {
    await prisma.userServiceCapability.update({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
      data: {
        level: level as CapabilityLevel,
        notes: notes || null,
      },
    });

    revalidatePath(`/settings/team/${userId}`);
    revalidatePath(`/settings/team/${userId}/capabilities`);

    return ok();
  } catch (error) {
    console.error("Error updating service capability:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update capability" };
  }
}

/**
 * Remove a service capability from a team member
 */
export async function removeServiceCapability(
  userId: string,
  serviceId: string
): Promise<ActionResult> {
  try {
    await prisma.userServiceCapability.delete({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
    });

    revalidatePath(`/settings/team/${userId}`);
    revalidatePath(`/settings/team/${userId}/capabilities`);

    return ok();
  } catch (error) {
    console.error("Error removing service capability:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove capability" };
  }
}

/**
 * Get all service capabilities for a team member
 */
export async function getUserServiceCapabilities(userId: string) {
  try {
    const capabilities = await prisma.userServiceCapability.findMany({
      where: { userId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            priceCents: true,
          },
        },
      },
      orderBy: [{ level: "desc" }, { service: { name: "asc" } }],
    });

    return capabilities.map((c) => ({
      ...c.service,
      level: c.level,
      notes: c.notes,
      assignedAt: c.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching user service capabilities:", error);
    return [];
  }
}

/**
 * Get team members qualified to perform a service
 */
export async function getQualifiedTeamMembers(
  serviceId: string,
  minLevel?: "learning" | "capable" | "expert"
): Promise<Array<{
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  level: CapabilityLevel;
  hasRequiredEquipment: boolean;
}>> {
  try {
    const organizationId = await getOrganizationId();

    // Get capabilities for this service
    const capabilities = await prisma.userServiceCapability.findMany({
      where: {
        serviceId,
        user: {
          memberships: {
            some: {
              organizationId,
            },
          },
        },
        ...(minLevel && {
          level: {
            in:
              minLevel === "expert"
                ? ["expert"]
                : minLevel === "capable"
                  ? ["capable", "expert"]
                  : ["learning", "capable", "expert"],
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
          include: {
            equipment: {
              include: {
                equipment: true,
              },
            },
          },
        },
      },
      orderBy: [{ level: "desc" }],
    });

    // Get service equipment requirements
    const serviceRequirements = await prisma.serviceEquipmentRequirement.findMany({
      where: {
        serviceId,
        isRequired: true,
      },
      select: {
        equipmentId: true,
      },
    });

    const requiredEquipmentIds = new Set(serviceRequirements.map((r) => r.equipmentId));

    // Map to result format
    return capabilities.map((c) => {
      const userEquipmentIds = new Set(c.user.equipment.map((e) => e.equipmentId));
      const hasRequiredEquipment =
        requiredEquipmentIds.size === 0 ||
        [...requiredEquipmentIds].every((id) => userEquipmentIds.has(id));

      return {
        id: c.user.id,
        fullName: c.user.fullName,
        email: c.user.email,
        avatarUrl: c.user.avatarUrl,
        level: c.level,
        hasRequiredEquipment,
      };
    });
  } catch (error) {
    console.error("Error fetching qualified team members:", error);
    return [];
  }
}

/**
 * Get team members with full capability and equipment details
 */
export async function getTeamMembersWithCapabilities() {
  try {
    const organizationId = await getOrganizationId();

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          include: {
            serviceCapabilities: {
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
            equipment: {
              include: {
                equipment: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                  },
                },
              },
            },
            homeBaseLocation: {
              select: {
                id: true,
                formattedAddress: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
      orderBy: { user: { fullName: "asc" } },
    });

    return members.map((m) => ({
      id: m.user.id,
      fullName: m.user.fullName,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      homeBaseLocation: m.user.homeBaseLocation,
      capabilities: m.user.serviceCapabilities.map((c) => ({
        service: c.service,
        level: c.level,
        notes: c.notes,
      })),
      equipment: m.user.equipment.map((e) => ({
        ...e.equipment,
        assignedAt: e.assignedAt,
        notes: e.notes,
      })),
    }));
  } catch (error) {
    console.error("Error fetching team members with capabilities:", error);
    return [];
  }
}

/**
 * Bulk assign capabilities to a team member
 */
export async function bulkAssignCapabilities(
  userId: string,
  capabilities: Array<{
    serviceId: string;
    level: "learning" | "capable" | "expert";
    notes?: string;
  }>
): Promise<ActionResult<{ count: number }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify user is a member
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!membership) {
      return { success: false, error: "User is not a member of this organization" };
    }

    // Verify all services belong to organization
    const serviceIds = capabilities.map((c) => c.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId,
      },
      select: { id: true },
    });

    const validServiceIds = new Set(services.map((s) => s.id));
    const invalidServices = serviceIds.filter((id) => !validServiceIds.has(id));

    if (invalidServices.length > 0) {
      return { success: false, error: "Some services were not found" };
    }

    // Upsert all capabilities
    let count = 0;
    for (const cap of capabilities) {
      await prisma.userServiceCapability.upsert({
        where: {
          userId_serviceId: {
            userId,
            serviceId: cap.serviceId,
          },
        },
        create: {
          userId,
          serviceId: cap.serviceId,
          level: cap.level as CapabilityLevel,
          notes: cap.notes || null,
        },
        update: {
          level: cap.level as CapabilityLevel,
          notes: cap.notes || null,
        },
      });
      count++;
    }

    revalidatePath(`/settings/team/${userId}`);
    revalidatePath(`/settings/team/${userId}/capabilities`);

    return { success: true, data: { count } };
  } catch (error) {
    console.error("Error bulk assigning capabilities:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to assign capabilities" };
  }
}

/**
 * Set user home base location (for travel calculations)
 */
export async function setUserHomeBase(
  userId: string,
  locationId: string | null
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify user is a member
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!membership) {
      return { success: false, error: "User is not a member of this organization" };
    }

    // If locationId provided, verify it belongs to organization
    if (locationId) {
      const location = await prisma.location.findFirst({
        where: {
          id: locationId,
          organizationId,
        },
      });

      if (!location) {
        return { success: false, error: "Location not found" };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { homeBaseLocationId: locationId },
    });

    revalidatePath(`/settings/team/${userId}`);

    return ok();
  } catch (error) {
    console.error("Error setting user home base:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set home base" };
  }
}

// Type exports
export type ServiceCapabilityInput = z.infer<typeof serviceCapabilitySchema>;
