"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { BookingStatus, RecurrencePattern } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { nanoid } from "nanoid";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

// Input types
export interface CreateBookingInput {
  title: string;
  description?: string;
  clientId?: string;
  serviceId?: string;
  startTime: Date;
  endTime: Date;
  timezone?: string;
  location?: string;
  locationNotes?: string;
  notes?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  // Recurrence options
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceInterval?: number;
  recurrenceEndDate?: Date;
  recurrenceCount?: number;
  recurrenceDaysOfWeek?: number[];
}

export interface UpdateBookingInput {
  id: string;
  title?: string;
  description?: string;
  clientId?: string;
  serviceId?: string;
  status?: BookingStatus;
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  location?: string;
  locationNotes?: string;
  notes?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

/**
 * Get a single booking by ID with full details
 */
export async function getBooking(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: true,
        service: true,
        bookingType: true,
        assignedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        locationRef: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            formattedAddress: true,
          },
        },
      },
    });

    if (!booking) {
      return null;
    }

    return booking;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
}

/**
 * Get all bookings for the organization
 */
export async function getBookings(filters?: {
  status?: BookingStatus;
  clientId?: string;
  fromDate?: Date;
  toDate?: Date;
}) {
  try {
    const organizationId = await getOrganizationId();

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.fromDate && { startTime: { gte: filters.fromDate } }),
        ...(filters?.toDate && { startTime: { lte: filters.toDate } }),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            company: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            priceCents: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

/**
 * Create a new booking
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    const booking = await prisma.booking.create({
      data: {
        organizationId,
        title: input.title,
        description: input.description,
        clientId: input.clientId,
        serviceId: input.serviceId,
        startTime: input.startTime,
        endTime: input.endTime,
        timezone: input.timezone || "America/New_York",
        location: input.location,
        locationNotes: input.locationNotes,
        notes: input.notes,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        status: "pending",
      },
    });

    revalidatePath("/scheduling");
    revalidatePath("/dashboard");

    return { success: true, data: { id: booking.id } };
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create booking" };
  }
}

/**
 * Update an existing booking
 */
export async function updateBooking(
  input: UpdateBookingInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify booking exists and belongs to organization
    const existing = await prisma.booking.findFirst({
      where: {
        id: input.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Booking not found" };
    }

    const { id, ...updateData } = input;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.clientId !== undefined && { clientId: updateData.clientId }),
        ...(updateData.serviceId !== undefined && { serviceId: updateData.serviceId }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.startTime && { startTime: updateData.startTime }),
        ...(updateData.endTime && { endTime: updateData.endTime }),
        ...(updateData.timezone && { timezone: updateData.timezone }),
        ...(updateData.location !== undefined && { location: updateData.location }),
        ...(updateData.locationNotes !== undefined && { locationNotes: updateData.locationNotes }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
        ...(updateData.clientName !== undefined && { clientName: updateData.clientName }),
        ...(updateData.clientEmail !== undefined && { clientEmail: updateData.clientEmail }),
        ...(updateData.clientPhone !== undefined && { clientPhone: updateData.clientPhone }),
      },
    });

    revalidatePath("/scheduling");
    revalidatePath(`/scheduling/${id}`);
    revalidatePath(`/scheduling/${id}/edit`);
    revalidatePath("/dashboard");

    return { success: true, data: { id: booking.id } };
  } catch (error) {
    console.error("Error updating booking:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update booking" };
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.booking.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Booking not found" };
    }

    await prisma.booking.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/scheduling");
    revalidatePath(`/scheduling/${id}`);
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating booking status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update booking status" };
  }
}

/**
 * Delete a booking
 */
export async function deleteBooking(id: string): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify booking exists and belongs to organization
    const existing = await prisma.booking.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Booking not found" };
    }

    // Delete reminders first
    await prisma.bookingReminder.deleteMany({
      where: { bookingId: id },
    });

    // Delete the booking
    await prisma.booking.delete({
      where: { id },
    });

    revalidatePath("/scheduling");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting booking:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete booking" };
  }
}

/**
 * Get clients for booking dropdown
 */
export async function getClientsForBooking() {
  try {
    const organizationId = await getOrganizationId();

    const clients = await prisma.client.findMany({
      where: { organizationId },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
        phone: true,
      },
      orderBy: { fullName: "asc" },
    });

    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

/**
 * Get services for booking dropdown
 */
export async function getServicesForBooking() {
  try {
    const organizationId = await getOrganizationId();

    const services = await prisma.service.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        priceCents: true,
        duration: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });

    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

/**
 * Get schedule statistics for the sidebar
 */
export async function getScheduleStats() {
  try {
    const organizationId = await getOrganizationId();

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Count sessions this week
    const thisWeekCount = await prisma.booking.count({
      where: {
        organizationId,
        startTime: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    // Find next available slot (next pending/confirmed booking)
    const nextBooking = await prisma.booking.findFirst({
      where: {
        organizationId,
        startTime: {
          gte: now,
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
      orderBy: {
        startTime: "asc",
      },
      select: {
        startTime: true,
      },
    });

    // Get day distribution to find busiest day
    const bookingsThisMonth = await prisma.booking.findMany({
      where: {
        organizationId,
        startTime: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
      select: {
        startTime: true,
      },
    });

    // Count bookings per day of week
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    bookingsThisMonth.forEach((booking) => {
      dayCounts[booking.startTime.getDay()]++;
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let busiestDay = "No data";
    let maxCount = 0;
    dayCounts.forEach((count, index) => {
      if (count > maxCount) {
        maxCount = count;
        busiestDay = dayNames[index];
      }
    });

    // Format next available
    let nextAvailable = "No upcoming sessions";
    if (nextBooking) {
      const nextDate = nextBooking.startTime;
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(nextDate);
      nextDay.setHours(0, 0, 0, 0);

      const timeStr = nextDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (nextDay.getTime() === new Date(now.setHours(0, 0, 0, 0)).getTime()) {
        nextAvailable = `Today, ${timeStr}`;
      } else if (nextDay.getTime() === tomorrow.getTime()) {
        nextAvailable = `Tomorrow, ${timeStr}`;
      } else {
        const dayName = nextDate.toLocaleDateString("en-US", { weekday: "long" });
        nextAvailable = `${dayName}, ${timeStr}`;
      }
    }

    return {
      thisWeekCount,
      nextAvailable,
      busiestDay: maxCount > 0 ? busiestDay : "No data",
    };
  } catch (error) {
    console.error("Error fetching schedule stats:", error);
    return {
      thisWeekCount: 0,
      nextAvailable: "No upcoming sessions",
      busiestDay: "No data",
    };
  }
}

// =============================================================================
// RECURRING BOOKING FUNCTIONS
// =============================================================================

/**
 * Generate dates for a recurring booking series
 */
function generateRecurringDates(
  startDate: Date,
  pattern: RecurrencePattern,
  interval: number = 1,
  endDate?: Date,
  maxCount?: number,
  daysOfWeek?: number[]
): Date[] {
  const dates: Date[] = [new Date(startDate)];
  let currentDate = new Date(startDate);
  const maxOccurrences = maxCount || 52; // Default to 1 year of weekly bookings

  // End date defaults to 1 year from start if not specified
  const effectiveEndDate = endDate || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  while (dates.length < maxOccurrences) {
    switch (pattern) {
      case "daily":
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + interval);
        break;

      case "weekly":
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 7 * interval);
        break;

      case "biweekly":
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 14);
        break;

      case "monthly":
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;

      case "custom":
        // For custom, use days of week
        if (daysOfWeek && daysOfWeek.length > 0) {
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
          // Find next matching day
          let attempts = 0;
          while (!daysOfWeek.includes(currentDate.getDay()) && attempts < 7) {
            currentDate.setDate(currentDate.getDate() + 1);
            attempts++;
          }
        } else {
          // Fallback to weekly
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;
    }

    // Check if we've passed the end date
    if (currentDate > effectiveEndDate) break;

    dates.push(new Date(currentDate));
  }

  return dates;
}

/**
 * Create a recurring booking series
 */
export async function createRecurringBooking(
  input: CreateBookingInput
): Promise<ActionResult<{ id: string; seriesId: string; count: number }>> {
  try {
    const organizationId = await getOrganizationId();

    if (!input.isRecurring || !input.recurrencePattern) {
      return { success: false, error: "Recurrence pattern is required" };
    }

    // Generate series ID
    const seriesId = nanoid(12);

    // Calculate duration in milliseconds
    const duration = new Date(input.endTime).getTime() - new Date(input.startTime).getTime();

    // Generate recurring dates
    const dates = generateRecurringDates(
      input.startTime,
      input.recurrencePattern,
      input.recurrenceInterval || 1,
      input.recurrenceEndDate,
      input.recurrenceCount,
      input.recurrenceDaysOfWeek
    );

    // Create the parent booking (first occurrence)
    const parentBooking = await prisma.booking.create({
      data: {
        organizationId,
        title: input.title,
        description: input.description,
        clientId: input.clientId,
        serviceId: input.serviceId,
        startTime: dates[0],
        endTime: new Date(dates[0].getTime() + duration),
        timezone: input.timezone || "America/New_York",
        location: input.location,
        locationNotes: input.locationNotes,
        notes: input.notes,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        status: "pending",
        // Recurrence fields
        isRecurring: true,
        recurrencePattern: input.recurrencePattern,
        recurrenceInterval: input.recurrenceInterval || 1,
        recurrenceEndDate: input.recurrenceEndDate,
        recurrenceCount: input.recurrenceCount,
        recurrenceDaysOfWeek: input.recurrenceDaysOfWeek || [],
        seriesId,
      },
    });

    // Create child bookings for remaining dates
    if (dates.length > 1) {
      const childBookingsData = dates.slice(1).map((date) => ({
        organizationId,
        title: input.title,
        description: input.description,
        clientId: input.clientId,
        serviceId: input.serviceId,
        startTime: date,
        endTime: new Date(date.getTime() + duration),
        timezone: input.timezone || "America/New_York",
        location: input.location,
        locationNotes: input.locationNotes,
        notes: input.notes,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        status: "pending" as const,
        // Recurrence fields
        isRecurring: true,
        recurrencePattern: input.recurrencePattern!,
        recurrenceInterval: input.recurrenceInterval || 1,
        recurrenceEndDate: input.recurrenceEndDate,
        recurrenceCount: input.recurrenceCount,
        recurrenceDaysOfWeek: input.recurrenceDaysOfWeek || [],
        seriesId,
        parentBookingId: parentBooking.id,
      }));

      await prisma.booking.createMany({
        data: childBookingsData,
      });
    }

    revalidatePath("/scheduling");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: parentBooking.id,
        seriesId,
        count: dates.length,
      },
    };
  } catch (error) {
    console.error("Error creating recurring booking:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create recurring booking" };
  }
}

/**
 * Get all bookings in a series
 */
export async function getBookingSeries(seriesId: string) {
  try {
    const organizationId = await getOrganizationId();

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        seriesId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            company: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching booking series:", error);
    return [];
  }
}

/**
 * Update all future bookings in a series
 */
export async function updateBookingSeries(
  seriesId: string,
  updates: {
    title?: string;
    description?: string;
    location?: string;
    locationNotes?: string;
    notes?: string;
    serviceId?: string;
    clientId?: string;
  },
  updateFutureOnly: boolean = true
): Promise<ActionResult<{ updated: number }>> {
  try {
    const organizationId = await getOrganizationId();

    const whereClause: Record<string, unknown> = {
      organizationId,
      seriesId,
    };

    if (updateFutureOnly) {
      whereClause.startTime = { gte: new Date() };
    }

    const result = await prisma.booking.updateMany({
      where: whereClause,
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.location !== undefined && { location: updates.location }),
        ...(updates.locationNotes !== undefined && { locationNotes: updates.locationNotes }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.serviceId !== undefined && { serviceId: updates.serviceId }),
        ...(updates.clientId !== undefined && { clientId: updates.clientId }),
      },
    });

    revalidatePath("/scheduling");
    revalidatePath("/dashboard");

    return { success: true, data: { updated: result.count } };
  } catch (error) {
    console.error("Error updating booking series:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update booking series" };
  }
}

/**
 * Delete a booking series (all or future only)
 */
export async function deleteBookingSeries(
  seriesId: string,
  deleteFutureOnly: boolean = true
): Promise<ActionResult<{ deleted: number }>> {
  try {
    const organizationId = await getOrganizationId();

    const whereClause: Record<string, unknown> = {
      organizationId,
      seriesId,
    };

    if (deleteFutureOnly) {
      whereClause.startTime = { gte: new Date() };
    }

    // First get the booking IDs to delete reminders
    const bookingsToDelete = await prisma.booking.findMany({
      where: whereClause,
      select: { id: true },
    });

    const bookingIds = bookingsToDelete.map((b) => b.id);

    // Delete reminders
    await prisma.bookingReminder.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });

    // Delete bookings
    const result = await prisma.booking.deleteMany({
      where: whereClause,
    });

    revalidatePath("/scheduling");
    revalidatePath("/dashboard");

    return { success: true, data: { deleted: result.count } };
  } catch (error) {
    console.error("Error deleting booking series:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete booking series" };
  }
}

/**
 * Remove a single booking from a series (without affecting others)
 */
export async function removeFromSeries(bookingId: string): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // First delete reminders
    await prisma.bookingReminder.deleteMany({
      where: { bookingId },
    });

    // Delete the booking
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    revalidatePath("/scheduling");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing booking from series:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove booking from series" };
  }
}

// Note: getRecurrenceSummary has been moved to @/lib/utils/bookings
// Import from there for client-side usage
