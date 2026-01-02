"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { AvailabilityBlockType } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { RRule, RRuleSet, rrulestr } from "rrule";

// =============================================================================
// Types
// =============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateAvailabilityBlockInput {
  title: string;
  description?: string;
  blockType?: AvailabilityBlockType;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string;
  recurrenceEnd?: Date;
  userId?: string;
}

export interface UpdateAvailabilityBlockInput {
  id: string;
  title?: string;
  description?: string;
  blockType?: AvailabilityBlockType;
  startDate?: Date;
  endDate?: Date;
  allDay?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string;
  recurrenceEnd?: Date;
}

export interface CreateBookingBufferInput {
  serviceId?: string;
  bufferBefore?: number;
  bufferAfter?: number;
  minAdvanceHours?: number;
  maxAdvanceDays?: number;
}

export interface UpdateBookingBufferInput {
  id: string;
  bufferBefore?: number;
  bufferAfter?: number;
  minAdvanceHours?: number;
  maxAdvanceDays?: number;
}

// =============================================================================
// Availability Block Actions
// =============================================================================

/**
 * Get all availability blocks for the organization
 */
export async function getAvailabilityBlocks(filters?: {
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  blockType?: AvailabilityBlockType;
}) {
  try {
    const organizationId = await requireOrganizationId();

    const blocks = await prisma.availabilityBlock.findMany({
      where: {
        organizationId,
        ...(filters?.userId !== undefined && { userId: filters.userId }),
        ...(filters?.blockType && { blockType: filters.blockType }),
        ...(filters?.fromDate && { startDate: { gte: filters.fromDate } }),
        ...(filters?.toDate && { endDate: { lte: filters.toDate } }),
      },
      orderBy: { startDate: "asc" },
    });

    return { success: true as const, data: blocks };
  } catch (error) {
    console.error("[Availability] Error fetching blocks:", error);
    return { success: false as const, error: "Failed to fetch availability blocks" };
  }
}

/**
 * Get a single availability block by ID
 */
export async function getAvailabilityBlock(id: string) {
  try {
    const organizationId = await requireOrganizationId();

    const block = await prisma.availabilityBlock.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!block) {
      return { success: false as const, error: "Availability block not found" };
    }

    return { success: true as const, data: block };
  } catch (error) {
    console.error("[Availability] Error fetching block:", error);
    return { success: false as const, error: "Failed to fetch availability block" };
  }
}

/**
 * Create a new availability block (time off, holiday, etc.)
 */
export async function createAvailabilityBlock(
  input: CreateAvailabilityBlockInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Validate recurrence rule if provided
    if (input.isRecurring && input.recurrenceRule) {
      try {
        rrulestr(input.recurrenceRule);
      } catch {
        return { success: false, error: "Invalid recurrence rule format" };
      }
    }

    const block = await prisma.availabilityBlock.create({
      data: {
        organizationId,
        userId: input.userId,
        title: input.title,
        description: input.description,
        blockType: input.blockType || "time_off",
        startDate: input.startDate,
        endDate: input.endDate,
        allDay: input.allDay ?? true,
        isRecurring: input.isRecurring ?? false,
        recurrenceRule: input.recurrenceRule,
        recurrenceEnd: input.recurrenceEnd,
      },
    });

    revalidatePath("/scheduling");
    revalidatePath("/scheduling/availability");

    return { success: true, data: { id: block.id } };
  } catch (error) {
    console.error("[Availability] Error creating block:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create availability block" };
  }
}

/**
 * Update an existing availability block
 */
export async function updateAvailabilityBlock(
  input: UpdateAvailabilityBlockInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify block exists and belongs to organization
    const existing = await prisma.availabilityBlock.findFirst({
      where: {
        id: input.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Availability block not found" };
    }

    // Validate recurrence rule if provided
    if (input.isRecurring && input.recurrenceRule) {
      try {
        rrulestr(input.recurrenceRule);
      } catch {
        return { success: false, error: "Invalid recurrence rule format" };
      }
    }

    const { id, ...updateData } = input;

    const block = await prisma.availabilityBlock.update({
      where: { id },
      data: {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.blockType && { blockType: updateData.blockType }),
        ...(updateData.startDate && { startDate: updateData.startDate }),
        ...(updateData.endDate && { endDate: updateData.endDate }),
        ...(updateData.allDay !== undefined && { allDay: updateData.allDay }),
        ...(updateData.isRecurring !== undefined && { isRecurring: updateData.isRecurring }),
        ...(updateData.recurrenceRule !== undefined && { recurrenceRule: updateData.recurrenceRule }),
        ...(updateData.recurrenceEnd !== undefined && { recurrenceEnd: updateData.recurrenceEnd }),
      },
    });

    revalidatePath("/scheduling");
    revalidatePath("/scheduling/availability");

    return { success: true, data: { id: block.id } };
  } catch (error) {
    console.error("[Availability] Error updating block:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update availability block" };
  }
}

/**
 * Delete an availability block
 */
export async function deleteAvailabilityBlock(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify block exists and belongs to organization
    const existing = await prisma.availabilityBlock.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Availability block not found" };
    }

    await prisma.availabilityBlock.delete({
      where: { id },
    });

    revalidatePath("/scheduling");
    revalidatePath("/scheduling/availability");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Availability] Error deleting block:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete availability block" };
  }
}

// =============================================================================
// Booking Buffer Actions
// =============================================================================

/**
 * Get all booking buffers for the organization
 */
export async function getBookingBuffers() {
  try {
    const organizationId = await requireOrganizationId();

    const buffers = await prisma.bookingBuffer.findMany({
      where: { organizationId },
    });

    return { success: true as const, data: buffers };
  } catch (error) {
    console.error("[BookingBuffer] Error fetching buffers:", error);
    return { success: false as const, error: "Failed to fetch booking buffers" };
  }
}

/**
 * Get or create the default booking buffer for the organization
 */
export async function getDefaultBookingBuffer() {
  try {
    const organizationId = await requireOrganizationId();

    // Look for the org-wide default (no serviceId)
    let buffer = await prisma.bookingBuffer.findFirst({
      where: {
        organizationId,
        serviceId: null,
      },
    });

    // Create default if not exists
    if (!buffer) {
      buffer = await prisma.bookingBuffer.create({
        data: {
          organizationId,
          serviceId: null,
          bufferBefore: 0,
          bufferAfter: 0,
        },
      });
    }

    return { success: true as const, data: buffer };
  } catch (error) {
    console.error("[BookingBuffer] Error fetching default buffer:", error);
    return { success: false as const, error: "Failed to fetch default booking buffer" };
  }
}

/**
 * Get booking buffer for a specific service
 */
export async function getBookingBufferForService(serviceId: string) {
  try {
    const organizationId = await requireOrganizationId();

    // First try to find service-specific buffer
    let buffer = await prisma.bookingBuffer.findFirst({
      where: {
        organizationId,
        serviceId,
      },
    });

    // Fall back to org default if no service-specific buffer
    if (!buffer) {
      buffer = await prisma.bookingBuffer.findFirst({
        where: {
          organizationId,
          serviceId: null,
        },
      });
    }

    if (!buffer) {
      // Return default values if no buffer exists
      return {
        success: true as const,
        data: {
          bufferBefore: 0,
          bufferAfter: 0,
          minAdvanceHours: null,
          maxAdvanceDays: null,
        },
      };
    }

    return { success: true as const, data: buffer };
  } catch (error) {
    console.error("[BookingBuffer] Error fetching buffer for service:", error);
    return { success: false as const, error: "Failed to fetch booking buffer" };
  }
}

/**
 * Create or update a booking buffer
 */
export async function upsertBookingBuffer(
  input: CreateBookingBufferInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Find existing buffer or create new one
    const existingBuffer = await prisma.bookingBuffer.findFirst({
      where: {
        organizationId,
        serviceId: input.serviceId ?? null,
      },
    });

    let buffer;
    if (existingBuffer) {
      buffer = await prisma.bookingBuffer.update({
        where: { id: existingBuffer.id },
        data: {
          bufferBefore: input.bufferBefore ?? existingBuffer.bufferBefore,
          bufferAfter: input.bufferAfter ?? existingBuffer.bufferAfter,
          minAdvanceHours: input.minAdvanceHours,
          maxAdvanceDays: input.maxAdvanceDays,
        },
      });
    } else {
      buffer = await prisma.bookingBuffer.create({
        data: {
          organizationId,
          serviceId: input.serviceId,
          bufferBefore: input.bufferBefore ?? 0,
          bufferAfter: input.bufferAfter ?? 0,
          minAdvanceHours: input.minAdvanceHours,
          maxAdvanceDays: input.maxAdvanceDays,
        },
      });
    }

    revalidatePath("/scheduling");
    revalidatePath("/settings/scheduling");

    return { success: true, data: { id: buffer.id } };
  } catch (error) {
    console.error("[BookingBuffer] Error upserting buffer:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update booking buffer" };
  }
}

/**
 * Delete a booking buffer
 */
export async function deleteBookingBuffer(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify buffer exists and belongs to organization
    const existing = await prisma.bookingBuffer.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Booking buffer not found" };
    }

    await prisma.bookingBuffer.delete({
      where: { id },
    });

    revalidatePath("/scheduling");
    revalidatePath("/settings/scheduling");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[BookingBuffer] Error deleting buffer:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete booking buffer" };
  }
}

// =============================================================================
// Conflict Detection
// =============================================================================

/**
 * Check if a proposed booking time conflicts with availability blocks or existing bookings
 */
export async function checkBookingConflicts(
  startTime: Date,
  endTime: Date,
  userId?: string,
  excludeBookingId?: string
): Promise<ActionResult<{
  hasConflict: boolean;
  conflictingBlocks: Array<{ id: string; title: string; startDate: Date; endDate: Date }>;
  conflictingBookings: Array<{ id: string; title: string; startTime: Date; endTime: Date }>;
}>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get availability blocks that might conflict
    const blocks = await prisma.availabilityBlock.findMany({
      where: {
        organizationId,
        OR: [
          { userId: null }, // Org-wide blocks
          { userId }, // User-specific blocks
        ],
      },
    });

    // Check which blocks actually conflict
    const conflictingBlocks: Array<{ id: string; title: string; startDate: Date; endDate: Date }> = [];

    for (const block of blocks) {
      const conflicts = await checkBlockConflict(block, startTime, endTime);
      if (conflicts) {
        conflictingBlocks.push({
          id: block.id,
          title: block.title,
          startDate: block.startDate,
          endDate: block.endDate,
        });
      }
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        organizationId,
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        status: { in: ["pending", "confirmed"] },
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
      },
    });

    return {
      success: true,
      data: {
        hasConflict: conflictingBlocks.length > 0 || conflictingBookings.length > 0,
        conflictingBlocks,
        conflictingBookings,
      },
    };
  } catch (error) {
    console.error("[Availability] Error checking conflicts:", error);
    return { success: false, error: "Failed to check booking conflicts" };
  }
}

/**
 * Helper to check if a single block conflicts with a time range
 * Handles both one-time and recurring blocks
 */
async function checkBlockConflict(
  block: {
    startDate: Date;
    endDate: Date;
    isRecurring: boolean;
    recurrenceRule: string | null;
    recurrenceEnd: Date | null;
  },
  proposedStart: Date,
  proposedEnd: Date
): Promise<boolean> {
  if (!block.isRecurring || !block.recurrenceRule) {
    // Simple one-time block - check for overlap
    return (
      (block.startDate <= proposedStart && block.endDate > proposedStart) ||
      (block.startDate < proposedEnd && block.endDate >= proposedEnd) ||
      (block.startDate >= proposedStart && block.endDate <= proposedEnd)
    );
  }

  // Recurring block - use rrule to expand occurrences
  try {
    const rule = rrulestr(block.recurrenceRule, { dtstart: block.startDate });
    const duration = block.endDate.getTime() - block.startDate.getTime();

    // Get occurrences in the relevant time window
    const checkStart = new Date(proposedStart.getTime() - duration);
    const checkEnd = proposedEnd;

    const occurrences = rule.between(checkStart, checkEnd, true);

    // Check if any occurrence overlaps with proposed time
    for (const occurrence of occurrences) {
      const occurrenceEnd = new Date(occurrence.getTime() + duration);

      if (
        (occurrence <= proposedStart && occurrenceEnd > proposedStart) ||
        (occurrence < proposedEnd && occurrenceEnd >= proposedEnd) ||
        (occurrence >= proposedStart && occurrenceEnd <= proposedEnd)
      ) {
        return true;
      }
    }

    return false;
  } catch {
    console.error("[Availability] Error parsing recurrence rule");
    return false;
  }
}

/**
 * Get expanded availability blocks for a date range (expands recurring blocks)
 */
export async function getExpandedAvailabilityBlocks(
  fromDate: Date,
  toDate: Date,
  userId?: string
) {
  try {
    const organizationId = await requireOrganizationId();

    const blocks = await prisma.availabilityBlock.findMany({
      where: {
        organizationId,
        AND: [
          // User filter: org-wide or specific user
          {
            OR: [
              { userId: null }, // Org-wide blocks
              ...(userId ? [{ userId }] : []),
            ],
          },
          // Date range filter
          {
            OR: [
              // Non-recurring blocks that overlap with date range
              {
                isRecurring: false,
                startDate: { lte: toDate },
                endDate: { gte: fromDate },
              },
              // Recurring blocks that might have occurrences in range
              {
                isRecurring: true,
                startDate: { lte: toDate },
                OR: [
                  { recurrenceEnd: null },
                  { recurrenceEnd: { gte: fromDate } },
                ],
              },
            ],
          },
        ],
      },
    });

    // Expand recurring blocks
    const expandedBlocks: Array<{
      id: string;
      title: string;
      blockType: AvailabilityBlockType;
      startDate: Date;
      endDate: Date;
      isRecurrence: boolean;
      originalBlockId: string;
    }> = [];

    for (const block of blocks) {
      if (!block.isRecurring || !block.recurrenceRule) {
        // Add non-recurring block as-is
        expandedBlocks.push({
          id: block.id,
          title: block.title,
          blockType: block.blockType,
          startDate: block.startDate,
          endDate: block.endDate,
          isRecurrence: false,
          originalBlockId: block.id,
        });
      } else {
        // Expand recurring block
        try {
          const rule = rrulestr(block.recurrenceRule, { dtstart: block.startDate });
          const duration = block.endDate.getTime() - block.startDate.getTime();
          const occurrences = rule.between(fromDate, toDate, true);

          for (const occurrence of occurrences) {
            expandedBlocks.push({
              id: `${block.id}-${occurrence.getTime()}`,
              title: block.title,
              blockType: block.blockType,
              startDate: occurrence,
              endDate: new Date(occurrence.getTime() + duration),
              isRecurrence: true,
              originalBlockId: block.id,
            });
          }
        } catch (e) {
          console.error("[Availability] Error expanding recurring block:", e);
        }
      }
    }

    return { success: true as const, data: expandedBlocks };
  } catch (error) {
    console.error("[Availability] Error getting expanded blocks:", error);
    return { success: false as const, error: "Failed to get availability blocks" };
  }
}

// =============================================================================
// Quick Actions
// =============================================================================

/**
 * Quick action to add time off for today
 */
export async function addTimeOffToday(
  title: string = "Time Off"
): Promise<ActionResult<{ id: string }>> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return createAvailabilityBlock({
    title,
    blockType: "time_off",
    startDate: startOfDay,
    endDate: endOfDay,
    allDay: true,
  });
}

/**
 * Quick action to add a recurring weekly block (e.g., every Sunday off)
 */
export async function addWeeklyRecurringBlock(
  title: string,
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6, // 0 = Sunday, 6 = Saturday
  blockType: AvailabilityBlockType = "time_off"
): Promise<ActionResult<{ id: string }>> {
  const dayNames = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const rrule = `FREQ=WEEKLY;BYDAY=${dayNames[dayOfWeek]}`;

  // Start from the next occurrence of this day
  const now = new Date();
  const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + daysUntilTarget);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  return createAvailabilityBlock({
    title,
    blockType,
    startDate,
    endDate,
    allDay: true,
    isRecurring: true,
    recurrenceRule: rrule,
  });
}

/**
 * Quick action to block out a holiday
 */
export async function addHolidayBlock(
  title: string,
  date: Date
): Promise<ActionResult<{ id: string }>> {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  return createAvailabilityBlock({
    title,
    blockType: "holiday",
    startDate: startOfDay,
    endDate: endOfDay,
    allDay: true,
  });
}
