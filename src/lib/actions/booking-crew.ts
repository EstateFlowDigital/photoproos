"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { BookingCrewRole } from "@prisma/client";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

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
