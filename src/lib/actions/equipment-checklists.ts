"use server";

/**
 * Equipment Checklist Actions
 *
 * Manages equipment requirements per booking type and equipment checklists per booking.
 * Allows photographers to define what equipment is needed for each type of shoot,
 * and track which items they've packed for each individual booking.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

// =============================================================================
// Booking Type Equipment Requirements
// =============================================================================

export interface EquipmentRequirementInput {
  equipmentId: string;
  isRequired?: boolean;
  quantity?: number;
  notes?: string;
}

/**
 * Get all equipment requirements for a booking type
 */
export async function getBookingTypeEquipmentRequirements(
  bookingTypeId: string
): Promise<
  ActionResult<
    Array<{
      id: string;
      equipmentId: string;
      isRequired: boolean;
      quantity: number;
      notes: string | null;
      equipment: {
        id: string;
        name: string;
        category: string;
        description: string | null;
      };
    }>
  >
> {
  try {
    const organizationId = await getOrganizationId();

    // Verify booking type belongs to organization
    const bookingType = await prisma.bookingType.findUnique({
      where: { id: bookingTypeId, organizationId },
    });

    if (!bookingType) {
      return { success: false, error: "Booking type not found" };
    }

    const requirements = await prisma.bookingTypeEquipmentRequirement.findMany({
      where: { bookingTypeId },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
          },
        },
      },
      orderBy: [{ isRequired: "desc" }, { equipment: { name: "asc" } }],
    });

    return { success: true, data: requirements };
  } catch (error) {
    console.error("Error fetching equipment requirements:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch equipment requirements" };
  }
}

/**
 * Set equipment requirements for a booking type
 */
export async function setBookingTypeEquipmentRequirements(
  bookingTypeId: string,
  requirements: EquipmentRequirementInput[]
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify booking type belongs to organization
    const bookingType = await prisma.bookingType.findUnique({
      where: { id: bookingTypeId, organizationId },
    });

    if (!bookingType) {
      return { success: false, error: "Booking type not found" };
    }

    // Verify all equipment belongs to organization
    const equipmentIds = requirements.map((r) => r.equipmentId);
    const equipment = await prisma.equipment.findMany({
      where: {
        id: { in: equipmentIds },
        organizationId,
      },
    });

    if (equipment.length !== equipmentIds.length) {
      return { success: false, error: "Some equipment items not found" };
    }

    // Replace all requirements in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing requirements
      await tx.bookingTypeEquipmentRequirement.deleteMany({
        where: { bookingTypeId },
      });

      // Create new requirements
      if (requirements.length > 0) {
        await tx.bookingTypeEquipmentRequirement.createMany({
          data: requirements.map((r) => ({
            bookingTypeId,
            equipmentId: r.equipmentId,
            isRequired: r.isRequired ?? true,
            quantity: r.quantity ?? 1,
            notes: r.notes || null,
          })),
        });
      }
    });

    revalidatePath("/scheduling/types");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error setting equipment requirements:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set equipment requirements" };
  }
}

/**
 * Add a single equipment requirement to a booking type
 */
export async function addEquipmentRequirement(
  bookingTypeId: string,
  requirement: EquipmentRequirementInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify booking type and equipment belong to organization
    const [bookingType, equipment] = await Promise.all([
      prisma.bookingType.findUnique({
        where: { id: bookingTypeId, organizationId },
      }),
      prisma.equipment.findUnique({
        where: { id: requirement.equipmentId, organizationId },
      }),
    ]);

    if (!bookingType) {
      return { success: false, error: "Booking type not found" };
    }
    if (!equipment) {
      return { success: false, error: "Equipment not found" };
    }

    const created = await prisma.bookingTypeEquipmentRequirement.create({
      data: {
        bookingTypeId,
        equipmentId: requirement.equipmentId,
        isRequired: requirement.isRequired ?? true,
        quantity: requirement.quantity ?? 1,
        notes: requirement.notes || null,
      },
    });

    revalidatePath("/scheduling/types");
    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error("Error adding equipment requirement:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add equipment requirement" };
  }
}

/**
 * Remove an equipment requirement from a booking type
 */
export async function removeEquipmentRequirement(
  requirementId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify requirement belongs to organization via booking type
    const requirement = await prisma.bookingTypeEquipmentRequirement.findUnique({
      where: { id: requirementId },
      include: { bookingType: true },
    });

    if (!requirement || requirement.bookingType.organizationId !== organizationId) {
      return { success: false, error: "Requirement not found" };
    }

    await prisma.bookingTypeEquipmentRequirement.delete({
      where: { id: requirementId },
    });

    revalidatePath("/scheduling/types");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing equipment requirement:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove equipment requirement" };
  }
}

// =============================================================================
// Booking Equipment Checklist
// =============================================================================

/**
 * Get the equipment checklist for a booking
 * Creates checklist items from booking type requirements if they don't exist
 */
export async function getBookingEquipmentChecklist(
  bookingId: string
): Promise<
  ActionResult<
    Array<{
      id: string;
      equipmentId: string;
      isChecked: boolean;
      checkedAt: Date | null;
      notes: string | null;
      isRequired: boolean;
      quantity: number;
      equipment: {
        id: string;
        name: string;
        category: string;
        description: string | null;
      };
      checkedBy: {
        id: string;
        fullName: string | null;
      } | null;
    }>
  >
> {
  try {
    const organizationId = await getOrganizationId();

    // Get booking with booking type
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, organizationId },
      include: {
        bookingType: {
          include: {
            equipmentRequirements: {
              include: {
                equipment: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        equipmentChecklist: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true,
              },
            },
            checkedBy: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Get requirements from booking type
    const requirements = booking.bookingType?.equipmentRequirements || [];

    // Create a map of existing checklist items
    const existingChecks = new Map(
      booking.equipmentChecklist.map((c) => [c.equipmentId, c])
    );

    // Build combined checklist
    const checklist = requirements.map((req) => {
      const existingCheck = existingChecks.get(req.equipmentId);
      if (existingCheck) {
        return {
          id: existingCheck.id,
          equipmentId: existingCheck.equipmentId,
          isChecked: existingCheck.isChecked,
          checkedAt: existingCheck.checkedAt,
          notes: existingCheck.notes,
          isRequired: req.isRequired,
          quantity: req.quantity,
          equipment: existingCheck.equipment,
          checkedBy: existingCheck.checkedBy,
        };
      }
      // Return requirement info without a check record (will be created on first check)
      return {
        id: `temp_${req.equipmentId}`, // Temporary ID until created
        equipmentId: req.equipmentId,
        isChecked: false,
        checkedAt: null,
        notes: req.notes,
        isRequired: req.isRequired,
        quantity: req.quantity,
        equipment: req.equipment,
        checkedBy: null,
      };
    });

    // Sort by required first, then by equipment name
    checklist.sort((a, b) => {
      if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
      return a.equipment.name.localeCompare(b.equipment.name);
    });

    return { success: true, data: checklist };
  } catch (error) {
    console.error("Error fetching equipment checklist:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch equipment checklist" };
  }
}

/**
 * Toggle equipment check status for a booking
 */
export async function toggleEquipmentCheck(
  bookingId: string,
  equipmentId: string,
  isChecked: boolean
): Promise<ActionResult<{ id: string; checkedAt: Date | null }>> {
  try {
    const organizationId = await getOrganizationId();
    const auth = await getAuthContext();

    // Verify booking belongs to organization
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, organizationId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Verify equipment belongs to organization
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId, organizationId },
    });

    if (!equipment) {
      return { success: false, error: "Equipment not found" };
    }

    // Get current user
    const user = auth?.userId
      ? await prisma.user.findUnique({
          where: { clerkUserId: auth.userId },
          select: { id: true },
        })
      : null;

    // Upsert the check record
    const check = await prisma.bookingEquipmentCheck.upsert({
      where: {
        bookingId_equipmentId: {
          bookingId,
          equipmentId,
        },
      },
      create: {
        bookingId,
        equipmentId,
        isChecked,
        checkedAt: isChecked ? new Date() : null,
        checkedById: isChecked ? user?.id || null : null,
      },
      update: {
        isChecked,
        checkedAt: isChecked ? new Date() : null,
        checkedById: isChecked ? user?.id || null : null,
      },
    });

    revalidatePath(`/scheduling/${bookingId}`);
    return {
      success: true,
      data: { id: check.id, checkedAt: check.checkedAt },
    };
  } catch (error) {
    console.error("Error toggling equipment check:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to toggle equipment check" };
  }
}

/**
 * Check all equipment items for a booking
 */
export async function checkAllEquipment(
  bookingId: string
): Promise<ActionResult<{ checkedCount: number }>> {
  try {
    const organizationId = await getOrganizationId();
    const auth = await getAuthContext();

    // Get booking with booking type requirements
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, organizationId },
      include: {
        bookingType: {
          include: {
            equipmentRequirements: true,
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const requirements = booking.bookingType?.equipmentRequirements || [];
    if (requirements.length === 0) {
      return { success: true, data: { checkedCount: 0 } };
    }

    // Get current user
    const user = auth?.userId
      ? await prisma.user.findUnique({
          where: { clerkUserId: auth.userId },
          select: { id: true },
        })
      : null;

    const now = new Date();

    // Create or update all check records
    await prisma.$transaction(
      requirements.map((req) =>
        prisma.bookingEquipmentCheck.upsert({
          where: {
            bookingId_equipmentId: {
              bookingId,
              equipmentId: req.equipmentId,
            },
          },
          create: {
            bookingId,
            equipmentId: req.equipmentId,
            isChecked: true,
            checkedAt: now,
            checkedById: user?.id || null,
          },
          update: {
            isChecked: true,
            checkedAt: now,
            checkedById: user?.id || null,
          },
        })
      )
    );

    revalidatePath(`/scheduling/${bookingId}`);
    return { success: true, data: { checkedCount: requirements.length } };
  } catch (error) {
    console.error("Error checking all equipment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to check all equipment" };
  }
}

/**
 * Uncheck all equipment items for a booking
 */
export async function uncheckAllEquipment(
  bookingId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify booking belongs to organization
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, organizationId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Delete all check records for this booking
    await prisma.bookingEquipmentCheck.deleteMany({
      where: { bookingId },
    });

    revalidatePath(`/scheduling/${bookingId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error unchecking all equipment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to uncheck all equipment" };
  }
}

/**
 * Get equipment checklist summary for multiple bookings (e.g., for calendar view)
 */
export async function getBookingChecklistSummaries(
  bookingIds: string[]
): Promise<
  ActionResult<
    Array<{
      bookingId: string;
      totalItems: number;
      checkedItems: number;
      requiredItems: number;
      requiredChecked: number;
    }>
  >
> {
  try {
    const organizationId = await getOrganizationId();

    // Get bookings with their requirements and checks
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        organizationId,
      },
      include: {
        bookingType: {
          include: {
            equipmentRequirements: true,
          },
        },
        equipmentChecklist: true,
      },
    });

    const summaries = bookings.map((booking) => {
      const requirements = booking.bookingType?.equipmentRequirements || [];
      const checks = new Map(
        booking.equipmentChecklist.map((c) => [c.equipmentId, c.isChecked])
      );

      const requiredItems = requirements.filter((r) => r.isRequired);
      const checkedItems = requirements.filter(
        (r) => checks.get(r.equipmentId) === true
      );
      const requiredChecked = requiredItems.filter(
        (r) => checks.get(r.equipmentId) === true
      );

      return {
        bookingId: booking.id,
        totalItems: requirements.length,
        checkedItems: checkedItems.length,
        requiredItems: requiredItems.length,
        requiredChecked: requiredChecked.length,
      };
    });

    return { success: true, data: summaries };
  } catch (error) {
    console.error("Error fetching checklist summaries:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch checklist summaries" };
  }
}

/**
 * Add a note to an equipment check
 */
export async function updateEquipmentCheckNote(
  bookingId: string,
  equipmentId: string,
  notes: string | null
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify booking belongs to organization
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, organizationId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    await prisma.bookingEquipmentCheck.upsert({
      where: {
        bookingId_equipmentId: {
          bookingId,
          equipmentId,
        },
      },
      create: {
        bookingId,
        equipmentId,
        isChecked: false,
        notes,
      },
      update: {
        notes,
      },
    });

    revalidatePath(`/scheduling/${bookingId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating equipment check note:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update equipment check note" };
  }
}
