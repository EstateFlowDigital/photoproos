"use server";

/**
 * Team Availability Calendar
 *
 * Manages team member availability, time-off, and scheduling visibility.
 * Provides a unified view of who is available and when.
 */

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// =============================================================================
// Types
// =============================================================================

export interface TeamMemberAvailability {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  availability: {
    date: string; // YYYY-MM-DD
    slots: AvailabilitySlot[];
    bookings: BookingSlot[];
    timeOff: TimeOffSlot[];
    isAvailable: boolean;
    availableHours: number;
  }[];
}

interface AvailabilitySlot {
  startTime: string; // HH:MM
  endTime: string;
  isRecurring: boolean;
}

interface BookingSlot {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  clientName: string | null;
  status: string;
}

interface TimeOffSlot {
  id: string;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  isApproved: boolean;
}

interface DayAvailability {
  date: string;
  teamMembers: {
    userId: string;
    userName: string;
    isAvailable: boolean;
    bookingCount: number;
    availableSlots: string[];
  }[];
  totalAvailable: number;
  totalBooked: number;
}

// =============================================================================
// Team Availability Functions
// =============================================================================

/**
 * Get team availability for a date range
 */
export async function getTeamAvailability(
  startDate: Date,
  endDate: Date,
  options?: { userId?: string; serviceId?: string }
): Promise<ActionResult<TeamMemberAvailability[]>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get team members
    const teamFilter = options?.userId ? { id: options.userId } : {};

    const teamMembers = await prisma.user.findMany({
      where: teamFilter,
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    // Get bookings for all team members in the date range
    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        assignedUserId: options?.userId
          ? options.userId
          : { in: teamMembers.map((m) => m.id) },
        startTime: { gte: startDate },
        endTime: { lte: endDate },
        status: { notIn: ["cancelled"] },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
        assignedUserId: true,
        client: {
          select: { fullName: true },
        },
      },
    });

    // Get time-off requests for team members from AvailabilityBlock model
    const timeOffBlocks = await prisma.availabilityBlock.findMany({
      where: {
        organizationId,
        blockType: "time_off",
        userId: options?.userId
          ? options.userId
          : { in: teamMembers.map((m) => m.id) },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        requestStatus: true,
      },
    });

    // Transform to expected format
    const timeOff = timeOffBlocks
      .filter((block) => block.userId !== null)
      .map((block) => ({
        id: block.id,
        userId: block.userId as string,
        type: "time_off",
        startDate: block.startDate,
        endDate: block.endDate,
        reason: block.description,
        status: block.requestStatus,
      }));

    // Build availability for each team member
    const result: TeamMemberAvailability[] = teamMembers.map((member) => {
      const memberBookings = bookings.filter(
        (b) => b.assignedUserId === member.id
      );
      const memberTimeOff = timeOff.filter((t) => t.userId === member.id);

      // Generate availability for each day in range
      const days: TeamMemberAvailability["availability"] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];

        // Get bookings for this day
        const dayBookings = memberBookings.filter((b) => {
          const bookingDate = b.startTime.toISOString().split("T")[0];
          return bookingDate === dateStr;
        });

        // Get time-off for this day
        const dayTimeOff = memberTimeOff.filter((t) => {
          const start = t.startDate.toISOString().split("T")[0];
          const end = t.endDate.toISOString().split("T")[0];
          return dateStr >= start && dateStr <= end;
        });

        // Check if approved time-off
        const hasApprovedTimeOff = dayTimeOff.some(
          (t) => t.status === "approved"
        );

        // Calculate available hours (assuming 8-hour workday, minus bookings)
        const bookedHours = dayBookings.reduce((sum, b) => {
          const duration =
            (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
          return sum + duration;
        }, 0);

        const availableHours = hasApprovedTimeOff ? 0 : Math.max(0, 8 - bookedHours);

        // Default working hours (9 AM - 5 PM)
        const defaultSlots: AvailabilitySlot[] = hasApprovedTimeOff
          ? []
          : [{ startTime: "09:00", endTime: "17:00", isRecurring: true }];

        days.push({
          date: dateStr,
          slots: defaultSlots,
          bookings: dayBookings.map((b) => ({
            id: b.id,
            title: b.title,
            startTime: b.startTime,
            endTime: b.endTime,
            clientName: b.client?.fullName || null,
            status: b.status,
          })),
          timeOff: dayTimeOff.map((t) => ({
            id: t.id,
            type: t.type,
            startDate: t.startDate,
            endDate: t.endDate,
            reason: t.reason,
            isApproved: t.status === "approved",
          })),
          isAvailable: availableHours > 0 && !hasApprovedTimeOff,
          availableHours,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        userId: member.id,
        userName: member.fullName || member.email,
        userEmail: member.email,
        userRole: "member", // Role not implemented in User model
        availability: days,
      };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("[TeamAvailability] Error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get team availability" };
  }
}

/**
 * Get daily team availability summary
 */
export async function getDailyTeamSummary(
  date: Date
): Promise<ActionResult<DayAvailability>> {
  try {
    const organizationId = await requireOrganizationId();
    const dateStr = date.toISOString().split("T")[0];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get team members (fallback: all users, organization scoping handled at booking level)
    const teamMembers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    // Get bookings for this day
    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
        status: { notIn: ["cancelled"] },
      },
      select: {
        assignedUserId: true,
        startTime: true,
        endTime: true,
      },
    });

    // Get approved time-off for this day from AvailabilityBlock
    const timeOffBlocks = await prisma.availabilityBlock.findMany({
      where: {
        organizationId,
        blockType: "time_off",
        requestStatus: "approved",
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      select: { userId: true },
    });

    const timeOffUserIds = new Set(
      timeOffBlocks
        .filter((t) => t.userId !== null)
        .map((t) => t.userId as string)
    );

    // Calculate availability for each member
    const memberAvailability = teamMembers.map((member) => {
      const memberBookings = bookings.filter(
        (b) => b.assignedUserId === member.id
      );
      const hasTimeOff = timeOffUserIds.has(member.id);
      const isAvailable = !hasTimeOff && memberBookings.length < 4; // Max 4 bookings per day

      // Calculate available time slots
      const bookedTimes = memberBookings.map((b) => ({
        start: b.startTime.getHours(),
        end: b.endTime.getHours(),
      }));

      const availableSlots: string[] = [];
      if (!hasTimeOff) {
        // Check standard time slots (9, 11, 14, 16)
        [9, 11, 14, 16].forEach((hour) => {
          const isBooked = bookedTimes.some(
            (t) => hour >= t.start && hour < t.end
          );
          if (!isBooked) {
            availableSlots.push(
              `${hour}:00 ${hour < 12 ? "AM" : "PM"}`.replace("13", "1").replace("14", "2").replace("15", "3").replace("16", "4")
            );
          }
        });
      }

      return {
        userId: member.id,
        userName: member.fullName || member.email,
        isAvailable,
        bookingCount: memberBookings.length,
        availableSlots,
      };
    });

    return {
      success: true,
      data: {
        date: dateStr,
        teamMembers: memberAvailability,
        totalAvailable: memberAvailability.filter((m) => m.isAvailable).length,
        totalBooked: bookings.length,
      },
    };
  } catch (error) {
    console.error("[TeamAvailability] Error getting daily summary:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get daily summary" };
  }
}

/**
 * Find available team members for a specific time slot
 */
export async function findAvailableTeamMembers(
  startTime: Date,
  endTime: Date,
  serviceId?: string
): Promise<
  ActionResult<{
    available: {
      userId: string;
      userName: string;
      userEmail: string;
      canPerformService: boolean;
    }[];
    unavailable: {
      userId: string;
      userName: string;
      reason: string;
    }[];
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Get all team members
    const teamMembers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        serviceCapabilities: serviceId
          ? {
              where: { serviceId },
              select: { serviceId: true },
            }
          : undefined,
      },
    });

    // Check for conflicts
    const conflicts = await prisma.booking.findMany({
      where: {
        organizationId,
        status: { notIn: ["cancelled"] },
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
      select: { assignedUserId: true },
    });

    const conflictingUserIds = new Set(
      conflicts.map((c) => c.assignedUserId).filter((id): id is string => !!id)
    );

    // Get approved time-off that overlaps with the requested time slot
    const timeOffBlocks = await prisma.availabilityBlock.findMany({
      where: {
        organizationId,
        blockType: "time_off",
        requestStatus: "approved",
        startDate: { lte: endTime },
        endDate: { gte: startTime },
      },
      select: { userId: true },
    });

    const timeOffUserIds = new Set(
      timeOffBlocks
        .filter((t) => t.userId !== null)
        .map((t) => t.userId as string)
    );

    // Categorize members
    const available: {
      userId: string;
      userName: string;
      userEmail: string;
      canPerformService: boolean;
    }[] = [];
    const unavailable: {
      userId: string;
      userName: string;
      reason: string;
    }[] = [];

    teamMembers.forEach((member) => {
      const name = member.fullName || member.email;

      if (timeOffUserIds.has(member.id)) {
        unavailable.push({
          userId: member.id,
          userName: name,
          reason: "Time off",
        });
      } else if (conflictingUserIds.has(member.id)) {
        unavailable.push({
          userId: member.id,
          userName: name,
          reason: "Conflicting booking",
        });
      } else {
        const canPerformService = serviceId
          ? (member.serviceCapabilities?.length || 0) > 0
          : true;

        available.push({
          userId: member.id,
          userName: name,
          userEmail: member.email,
          canPerformService,
        });
      }
    });

    return {
      success: true,
      data: { available, unavailable },
    };
  } catch (error) {
    console.error("[TeamAvailability] Error finding available members:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to find available team members" };
  }
}

/**
 * Get team utilization metrics
 */
export async function getTeamUtilization(
  startDate: Date,
  endDate: Date
): Promise<
  ActionResult<{
    overall: {
      totalCapacityHours: number;
      bookedHours: number;
      utilizationPercent: number;
    };
    byMember: {
      userId: string;
      userName: string;
      capacityHours: number;
      bookedHours: number;
      utilizationPercent: number;
      bookingCount: number;
    }[];
    byDay: {
      date: string;
      bookedHours: number;
      capacityHours: number;
      utilizationPercent: number;
    }[];
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Get team members
    const teamMembers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    // Calculate working days in range (excluding weekends)
    const workingDays: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays.push(currentDate.toISOString().split("T")[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get all bookings in range
    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
        status: { notIn: ["cancelled"] },
      },
      select: {
        assignedUserId: true,
        startTime: true,
        endTime: true,
      },
    });

    // Get approved time-off in the date range
    const timeOffBlocks = await prisma.availabilityBlock.findMany({
      where: {
        organizationId,
        blockType: "time_off",
        requestStatus: "approved",
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: {
        userId: true,
        startDate: true,
        endDate: true,
      },
    });

    const timeOff = timeOffBlocks
      .filter((t) => t.userId !== null)
      .map((t) => ({
        userId: t.userId as string,
        startDate: t.startDate,
        endDate: t.endDate,
      }));

    // Calculate per-member utilization
    const hoursPerDay = 8;
    const byMember = teamMembers.map((member) => {
      const memberBookings = bookings.filter(
        (b) => b.assignedUserId === member.id
      );
      const bookedHours = memberBookings.reduce((sum, b) => {
        const duration =
          (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

      // Calculate capacity (working days minus time-off)
      const memberTimeOff = timeOff.filter((t) => t.userId === member.id);
      const timeOffDays = memberTimeOff.reduce((sum, t) => {
        if (!t.startDate || !t.endDate) return sum;
        const start = new Date(Math.max(t.startDate.getTime(), startDate.getTime()));
        const end = new Date(Math.min(t.endDate.getTime(), endDate.getTime()));
        const days = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        return sum + days;
      }, 0);

      const capacityHours = (workingDays.length - timeOffDays) * hoursPerDay;

      return {
        userId: member.id,
        userName: member.fullName || member.email,
        capacityHours,
        bookedHours: Math.round(bookedHours * 10) / 10,
        utilizationPercent:
          capacityHours > 0
            ? Math.round((bookedHours / capacityHours) * 100)
            : 0,
        bookingCount: memberBookings.length,
      };
    });

    // Calculate overall
    const totalCapacity = byMember.reduce((sum, m) => sum + m.capacityHours, 0);
    const totalBooked = byMember.reduce((sum, m) => sum + m.bookedHours, 0);

    // Calculate by day
    const byDay = workingDays.map((dateStr) => {
      const dayBookings = bookings.filter(
        (b) => b.startTime.toISOString().split("T")[0] === dateStr
      );
      const dayBookedHours = dayBookings.reduce((sum, b) => {
        const duration =
          (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

      const dayCapacity = teamMembers.length * hoursPerDay;

      return {
        date: dateStr,
        bookedHours: Math.round(dayBookedHours * 10) / 10,
        capacityHours: dayCapacity,
        utilizationPercent:
          dayCapacity > 0
            ? Math.round((dayBookedHours / dayCapacity) * 100)
            : 0,
      };
    });

    return {
      success: true,
      data: {
        overall: {
          totalCapacityHours: totalCapacity,
          bookedHours: Math.round(totalBooked * 10) / 10,
          utilizationPercent:
            totalCapacity > 0
              ? Math.round((totalBooked / totalCapacity) * 100)
              : 0,
        },
        byMember,
        byDay,
      },
    };
  } catch (error) {
    console.error("[TeamAvailability] Error getting utilization:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get team utilization" };
  }
}

/**
 * Get suggested optimal booking times based on team availability
 */
export async function getSuggestedBookingTimes(
  date: Date,
  durationMinutes: number,
  serviceId?: string
): Promise<
  ActionResult<{
    suggestions: {
      startTime: Date;
      endTime: Date;
      availableTeamMembers: { userId: string; userName: string }[];
      confidence: number; // 0-100
    }[];
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0);

    // Get team members (with service capability if specified)
    const teamMembers = await prisma.user.findMany({
      where: serviceId
        ? {
            serviceCapabilities: {
              some: { serviceId },
            },
          }
        : undefined,
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    // Get existing bookings
    const existingBookings = await prisma.booking.findMany({
      where: {
        organizationId,
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
        status: { notIn: ["cancelled"] },
      },
      select: {
        assignedUserId: true,
        startTime: true,
        endTime: true,
      },
    });

    // Get approved time-off for this day
    const timeOffBlocks = await prisma.availabilityBlock.findMany({
      where: {
        organizationId,
        blockType: "time_off",
        requestStatus: "approved",
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      select: { userId: true },
    });

    const timeOffUserIds = new Set(
      timeOffBlocks
        .filter((t) => t.userId !== null)
        .map((t) => t.userId as string)
    );

    // Generate time slots (every 30 minutes)
    const suggestions: {
      startTime: Date;
      endTime: Date;
      availableTeamMembers: { userId: string; userName: string }[];
      confidence: number;
    }[] = [];

    const slotDuration = 30 * 60 * 1000; // 30 minutes
    let currentSlot = new Date(startOfDay);

    while (currentSlot.getTime() + durationMinutes * 60 * 1000 <= endOfDay.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + durationMinutes * 60 * 1000);

      // Find available team members for this slot
      const availableMembers = teamMembers.filter((member) => {
        if (timeOffUserIds.has(member.id)) return false;

        // Check for conflicts
        const hasConflict = existingBookings.some(
          (b) =>
            b.assignedUserId === member.id &&
            b.startTime < slotEnd &&
            b.endTime > currentSlot
        );

        return !hasConflict;
      });

      if (availableMembers.length > 0) {
        // Calculate confidence based on availability
        const confidence = Math.min(
          100,
          Math.round((availableMembers.length / teamMembers.length) * 100)
        );

        suggestions.push({
          startTime: new Date(currentSlot),
          endTime: slotEnd,
          availableTeamMembers: availableMembers.map((m) => ({
            userId: m.id,
            userName: m.fullName || m.email,
          })),
          confidence,
        });
      }

      currentSlot = new Date(currentSlot.getTime() + slotDuration);
    }

    // Sort by confidence (highest first), then by number of available members
    suggestions.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return b.availableTeamMembers.length - a.availableTeamMembers.length;
    });

    return {
      success: true,
      data: { suggestions: suggestions.slice(0, 10) }, // Top 10 suggestions
    };
  } catch (error) {
    console.error("[TeamAvailability] Error getting suggestions:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get booking suggestions" };
  }
}
