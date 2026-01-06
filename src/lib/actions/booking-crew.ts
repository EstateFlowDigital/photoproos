"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { BookingCrewRole, CapabilityLevel } from "@prisma/client";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// Suggestion reason types
type SuggestionReason =
  | { type: "expert"; serviceName: string }
  | { type: "capable"; serviceName: string }
  | { type: "learning"; serviceName: string }
  | { type: "available" }
  | { type: "has_equipment"; equipmentNames: string[] };

interface CrewSuggestion {
  userId: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  reasons: SuggestionReason[];
  capabilityLevel: CapabilityLevel | null;
  score: number; // Higher is better
}

interface AddCrewMemberInput {
  bookingId: string;
  userId: string;
  role?: BookingCrewRole;
  notes?: string;
  hourlyRate?: number;
}

interface UpdateCrewMemberInput {
  crewId: string;
  role?: BookingCrewRole;
  notes?: string;
  hourlyRate?: number;
  confirmed?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id ?? null;
}

async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findFirst({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  return user?.id ?? null;
}

// ============================================================================
// CREW ACTIONS
// ============================================================================

/**
 * Get crew members assigned to a booking
 */
export async function getBookingCrew(bookingId: string): Promise<ActionResult<{
  crew: {
    id: string;
    userId: string;
    role: BookingCrewRole;
    notes: string | null;
    hourlyRate: number | null;
    confirmed: boolean;
    confirmedAt: Date | null;
    declinedAt: Date | null;
    declineNote: string | null;
    user: {
      id: string;
      fullName: string | null;
      email: string;
      avatarUrl: string | null;
      phone: string | null;
    };
  }[];
}>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    // Verify booking belongs to organization
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
      select: { id: true },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    const crew = await prisma.bookingCrew.findMany({
      where: { bookingId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "asc" },
      ],
    });

    return success({ crew });
  } catch (error) {
    console.error("Error getting booking crew:", error);
    return fail("Failed to get crew members");
  }
}

/**
 * Get available team members for crew assignment
 */
export async function getAvailableCrewMembers(
  bookingId: string
): Promise<ActionResult<{
  members: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
    isAlreadyAssigned: boolean;
  }[];
}>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    // Get all org members
    const orgMembers = await prisma.organizationMember.findMany({
      where: { organizationId },
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
    });

    // Get already assigned crew
    const assignedCrew = await prisma.bookingCrew.findMany({
      where: { bookingId },
      select: { userId: true },
    });

    // Get the booking's assigned user
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, organizationId },
      select: { assignedUserId: true },
    });

    const assignedUserIds = new Set(assignedCrew.map((c) => c.userId));
    if (booking?.assignedUserId) {
      assignedUserIds.add(booking.assignedUserId);
    }

    const members = orgMembers.map((m) => ({
      id: m.user.id,
      fullName: m.user.fullName,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      isAlreadyAssigned: assignedUserIds.has(m.user.id),
    }));

    return success({ members });
  } catch (error) {
    console.error("Error getting available crew members:", error);
    return fail("Failed to get team members");
  }
}

/**
 * Add a crew member to a booking
 */
export async function addCrewMember(
  input: AddCrewMemberInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    // Verify booking belongs to organization
    const booking = await prisma.booking.findFirst({
      where: {
        id: input.bookingId,
        organizationId,
      },
      select: { id: true },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    // Verify user is in the organization
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: input.userId,
      },
    });

    if (!member) {
      return fail("User is not a member of this organization");
    }

    // Check if already assigned
    const existing = await prisma.bookingCrew.findUnique({
      where: {
        bookingId_userId: {
          bookingId: input.bookingId,
          userId: input.userId,
        },
      },
    });

    if (existing) {
      return fail("User is already assigned to this booking");
    }

    const crew = await prisma.bookingCrew.create({
      data: {
        bookingId: input.bookingId,
        userId: input.userId,
        role: input.role ?? "second_shooter",
        notes: input.notes,
        hourlyRate: input.hourlyRate,
      },
    });

    revalidatePath(`/scheduling/${input.bookingId}`);
    revalidatePath("/scheduling");

    return {
      success: true,
      data: { id: crew.id },
    };
  } catch (error) {
    console.error("Error adding crew member:", error);
    return fail("Failed to add crew member");
  }
}

/**
 * Update a crew member assignment
 */
export async function updateCrewMember(
  input: UpdateCrewMemberInput
): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    // Verify crew assignment belongs to org's booking
    const crew = await prisma.bookingCrew.findFirst({
      where: {
        id: input.crewId,
        booking: { organizationId },
      },
    });

    if (!crew) {
      return fail("Crew assignment not found");
    }

    await prisma.bookingCrew.update({
      where: { id: input.crewId },
      data: {
        role: input.role,
        notes: input.notes,
        hourlyRate: input.hourlyRate,
        confirmed: input.confirmed,
        confirmedAt: input.confirmed ? new Date() : undefined,
      },
    });

    revalidatePath(`/scheduling/${crew.bookingId}`);
    revalidatePath("/scheduling");

    return ok();
  } catch (error) {
    console.error("Error updating crew member:", error);
    return fail("Failed to update crew member");
  }
}

/**
 * Remove a crew member from a booking
 */
export async function removeCrewMember(crewId: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    // Verify crew assignment belongs to org's booking
    const crew = await prisma.bookingCrew.findFirst({
      where: {
        id: crewId,
        booking: { organizationId },
      },
    });

    if (!crew) {
      return fail("Crew assignment not found");
    }

    await prisma.bookingCrew.delete({
      where: { id: crewId },
    });

    revalidatePath(`/scheduling/${crew.bookingId}`);
    revalidatePath("/scheduling");

    return ok();
  } catch (error) {
    console.error("Error removing crew member:", error);
    return fail("Failed to remove crew member");
  }
}

/**
 * Crew member confirms availability for a booking
 */
export async function confirmCrewAssignment(crewId: string): Promise<ActionResult<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return fail("Not authenticated");
    }

    const crew = await prisma.bookingCrew.findFirst({
      where: {
        id: crewId,
        userId,
      },
    });

    if (!crew) {
      return fail("Assignment not found");
    }

    await prisma.bookingCrew.update({
      where: { id: crewId },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
        declinedAt: null,
        declineNote: null,
      },
    });

    revalidatePath(`/scheduling/${crew.bookingId}`);
    revalidatePath("/scheduling");

    return ok();
  } catch (error) {
    console.error("Error confirming crew assignment:", error);
    return fail("Failed to confirm assignment");
  }
}

/**
 * Crew member declines a booking assignment
 */
export async function declineCrewAssignment(
  crewId: string,
  reason?: string
): Promise<ActionResult<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return fail("Not authenticated");
    }

    const crew = await prisma.bookingCrew.findFirst({
      where: {
        id: crewId,
        userId,
      },
    });

    if (!crew) {
      return fail("Assignment not found");
    }

    await prisma.bookingCrew.update({
      where: { id: crewId },
      data: {
        confirmed: false,
        declinedAt: new Date(),
        declineNote: reason,
        confirmedAt: null,
      },
    });

    revalidatePath(`/scheduling/${crew.bookingId}`);
    revalidatePath("/scheduling");

    return ok();
  } catch (error) {
    console.error("Error declining crew assignment:", error);
    return fail("Failed to decline assignment");
  }
}

/**
 * Get all crew assignments for the current user
 */
export async function getMyCrewAssignments(): Promise<ActionResult<{
  assignments: {
    id: string;
    role: BookingCrewRole;
    notes: string | null;
    confirmed: boolean;
    booking: {
      id: string;
      title: string;
      startTime: Date;
      endTime: Date;
      status: string;
      location: string | null;
      client: {
        fullName: string | null;
      } | null;
    };
  }[];
}>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return fail("Not authenticated");
    }

    const assignments = await prisma.bookingCrew.findMany({
      where: {
        userId,
        booking: {
          status: { notIn: ["cancelled", "completed"] },
          startTime: { gte: new Date() },
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
            location: true,
            client: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        booking: { startTime: "asc" },
      },
    });

    return {
      success: true,
      data: { assignments },
    };
  } catch (error) {
    console.error("Error getting crew assignments:", error);
    return fail("Failed to get assignments");
  }
}

/**
 * Get smart crew suggestions based on service, capabilities, and availability
 */
export async function getSmartCrewSuggestions(
  bookingId: string
): Promise<ActionResult<{ suggestions: CrewSuggestion[] }>> {
  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return fail("Not authenticated");
    }

    // Get the booking with its service
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
      select: {
        id: true,
        serviceId: true,
        startTime: true,
        endTime: true,
        assignedUserId: true,
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    // Get all org members (excluding already assigned to this booking)
    const existingCrew = await prisma.bookingCrew.findMany({
      where: { bookingId },
      select: { userId: true },
    });

    const excludeUserIds = new Set([
      ...existingCrew.map((c) => c.userId),
      booking.assignedUserId, // Exclude the primary assigned photographer
    ].filter(Boolean) as string[]);

    const orgMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId,
        userId: { notIn: Array.from(excludeUserIds) },
      },
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
    });

    // Get service capabilities for these users
    const userIds = orgMembers.map((m) => m.user.id);

    const capabilities = booking.serviceId
      ? await prisma.userServiceCapability.findMany({
          where: {
            userId: { in: userIds },
            serviceId: booking.serviceId,
          },
          include: {
            service: { select: { name: true } },
          },
        })
      : [];

    const capabilityMap = new Map(
      capabilities.map((c) => [
        c.userId,
        { level: c.level, serviceName: c.service.name },
      ])
    );

    // Get required equipment for the service
    const requiredEquipment = booking.serviceId
      ? await prisma.serviceEquipmentRequirement.findMany({
          where: {
            serviceId: booking.serviceId,
            isRequired: true,
          },
          include: {
            equipment: { select: { id: true, name: true } },
          },
        })
      : [];

    const requiredEquipmentIds = requiredEquipment.map((r) => r.equipmentId);

    // Get user equipment assignments
    const userEquipment = requiredEquipmentIds.length > 0
      ? await prisma.userEquipment.findMany({
          where: {
            userId: { in: userIds },
            equipmentId: { in: requiredEquipmentIds },
          },
          include: {
            equipment: { select: { name: true } },
          },
        })
      : [];

    // Group equipment by user
    const userEquipmentMap = new Map<string, string[]>();
    for (const ue of userEquipment) {
      const existing = userEquipmentMap.get(ue.userId) || [];
      existing.push(ue.equipment.name);
      userEquipmentMap.set(ue.userId, existing);
    }

    // Check availability (no conflicting bookings)
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        organizationId,
        status: { in: ["confirmed", "pending"] },
        id: { not: bookingId },
        OR: [
          {
            // Booking as primary photographer
            assignedUserId: { in: userIds },
          },
        ],
        // Time overlap check
        startTime: { lt: booking.endTime },
        endTime: { gt: booking.startTime },
      },
      select: { assignedUserId: true },
    });

    // Also check crew assignments on other bookings
    const conflictingCrew = await prisma.bookingCrew.findMany({
      where: {
        userId: { in: userIds },
        booking: {
          status: { in: ["confirmed", "pending"] },
          id: { not: bookingId },
          startTime: { lt: booking.endTime },
          endTime: { gt: booking.startTime },
        },
      },
      select: { userId: true },
    });

    const unavailableUserIds = new Set([
      ...conflictingBookings.map((b) => b.assignedUserId).filter(Boolean) as string[],
      ...conflictingCrew.map((c) => c.userId),
    ]);

    // Build suggestions with scoring
    const suggestions: CrewSuggestion[] = [];

    for (const member of orgMembers) {
      const user = member.user;
      const reasons: SuggestionReason[] = [];
      let score = 0;

      // Check capability
      const capability = capabilityMap.get(user.id);
      if (capability) {
        if (capability.level === "expert") {
          reasons.push({ type: "expert", serviceName: capability.serviceName });
          score += 100;
        } else if (capability.level === "capable") {
          reasons.push({ type: "capable", serviceName: capability.serviceName });
          score += 50;
        } else if (capability.level === "learning") {
          reasons.push({ type: "learning", serviceName: capability.serviceName });
          score += 10;
        }
      }

      // Check equipment
      const equipment = userEquipmentMap.get(user.id);
      if (equipment && equipment.length > 0) {
        reasons.push({ type: "has_equipment", equipmentNames: equipment });
        score += equipment.length * 5;
      }

      // Check availability
      if (!unavailableUserIds.has(user.id)) {
        reasons.push({ type: "available" });
        score += 25;
      } else {
        score -= 50; // Penalize unavailable users
      }

      suggestions.push({
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        reasons,
        capabilityLevel: capability?.level || null,
        score,
      });
    }

    // Sort by score descending
    suggestions.sort((a, b) => b.score - a.score);

    return success({ suggestions });
  } catch (error) {
    console.error("Error getting smart crew suggestions:", error);
    return fail("Failed to get crew suggestions");
  }
}
