"use server";

/**
 * Booking Management Actions
 *
 * This file handles all booking CRUD operations for organizations.
 * Includes support for single bookings, recurring series, and reminders.
 *
 * Email Integration:
 * - confirmBooking(): Sends booking confirmation email to client
 * - Uses sendBookingConfirmationEmail() from @/lib/email/send
 *
 * Related Files:
 * - src/lib/actions/availability.ts - Availability and time-off management
 * - src/lib/actions/booking-types.ts - Booking type configuration
 * - src/emails/booking-confirmation.tsx - Email template
 * - src/app/(dashboard)/scheduling/ - Scheduling UI
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { BookingStatus, type RecurrencePattern } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";
import { nanoid } from "nanoid";
import { sendBookingConfirmationEmail } from "@/lib/email/send";
import { logActivity } from "@/lib/utils/activity";
import { sendSMSToClient } from "@/lib/sms/send";
import { notifySlackNewBooking, notifySlackCancellation } from "@/lib/actions/slack";

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
    const auth = await getAuthContext();

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

    // Log activity
    await logActivity({
      organizationId,
      type: "booking_created",
      description: `New booking "${input.title}" created`,
      userId: auth?.userId,
      bookingId: booking.id,
      clientId: input.clientId || undefined,
      metadata: {
        title: input.title,
        startTime: input.startTime.toISOString(),
      },
    });

    // Send Slack notification (non-blocking)
    try {
      await notifySlackNewBooking({
        organizationId,
        bookingId: booking.id,
        title: input.title,
        clientName: input.clientName || null,
        clientEmail: input.clientEmail || null,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
      });
    } catch (slackError) {
      console.error("[Booking] Failed to send Slack notification:", slackError);
    }

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
 *
 * This action updates the status of a booking. When the status is changed
 * to "confirmed", it automatically sends a confirmation email to the client.
 *
 * Status Flow:
 * - pending → confirmed (sends email) | cancelled
 * - confirmed → completed | cancelled
 * - completed (terminal)
 * - cancelled (terminal)
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Fetch booking with client info for potential email
    const existing = await prisma.booking.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Booking not found" };
    }

    await prisma.booking.update({
      where: { id },
      data: {
        status,
        // Set completedAt timestamp when booking is marked as completed
        ...(status === "completed" && { completedAt: new Date() }),
      },
    });

    // Send confirmation email when booking is confirmed
    if (status === "confirmed") {
      const clientEmail = existing.client?.email || existing.clientEmail;
      const clientName = existing.client?.fullName || existing.clientName;

      if (clientEmail) {
        // Get organization info for email
        const organization = await prisma.organization.findUnique({
          where: { id: organizationId },
          select: { name: true, publicEmail: true, publicPhone: true },
        });

        // Send confirmation email (non-blocking)
        try {
          await sendBookingConfirmationEmail({
            to: clientEmail,
            clientName: clientName || "there",
            bookingTitle: existing.title,
            bookingDate: existing.startTime,
            bookingTime: existing.startTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            location: existing.location || undefined,
            photographerName: organization?.name || "Your Photographer",
            photographerEmail: organization?.publicEmail || undefined,
            photographerPhone: organization?.publicPhone || undefined,
            notes: existing.notes || undefined,
          });

          console.log(`[Bookings] Confirmation email sent to ${clientEmail}`);
        } catch (emailError) {
          console.error(
            `[Bookings] Failed to send confirmation to ${clientEmail}:`,
            emailError
          );
          // Don't fail the action - status was updated successfully
        }
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          organizationId,
          type: "booking_confirmed",
          description: `Booking "${existing.title}" confirmed for ${clientName || clientEmail || "client"}`,
          bookingId: id,
          clientId: existing.clientId,
          metadata: {
            bookingTitle: existing.title,
            clientEmail,
            clientName,
            startTime: existing.startTime.toISOString(),
          },
        },
      });
    }

    // Send Slack cancellation notification when booking is cancelled
    if (status === "cancelled") {
      const clientEmail = existing.client?.email || existing.clientEmail;
      const clientName = existing.client?.fullName || existing.clientName;

      try {
        await notifySlackCancellation({
          organizationId,
          bookingId: id,
          title: existing.title,
          clientName: clientName || null,
          clientEmail: clientEmail || null,
          startTime: existing.startTime,
        });
      } catch (slackError) {
        console.error("[Booking] Failed to send Slack cancellation notification:", slackError);
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          organizationId,
          type: "booking_cancelled",
          description: `Booking "${existing.title}" was cancelled`,
          bookingId: id,
          clientId: existing.clientId,
          metadata: {
            bookingTitle: existing.title,
            clientEmail,
            clientName,
            startTime: existing.startTime.toISOString(),
          },
        },
      });
    }

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
 * Confirm a booking and send confirmation email
 *
 * This is a convenience action that:
 * 1. Updates the booking status to "confirmed"
 * 2. Sends a confirmation email to the client
 * 3. Logs activity for the organization
 *
 * Use this when explicitly confirming a booking via the UI.
 */
export async function confirmBooking(
  id: string,
  options?: { sendEmail?: boolean }
): Promise<ActionResult> {
  const sendEmail = options?.sendEmail ?? true;

  try {
    const organizationId = await getOrganizationId();

    // Fetch booking with all data needed for email
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status === "confirmed") {
      return { success: false, error: "Booking is already confirmed" };
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return { success: false, error: `Cannot confirm a ${booking.status} booking` };
    }

    // Update status
    await prisma.booking.update({
      where: { id },
      data: { status: "confirmed" },
    });

    // Send confirmation email if requested
    const clientEmail = booking.client?.email || booking.clientEmail;
    const clientName = booking.client?.fullName || booking.clientName;

    if (sendEmail && clientEmail) {
      // Get organization info for email
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true, publicEmail: true, publicPhone: true },
      });

      try {
        await sendBookingConfirmationEmail({
          to: clientEmail,
          clientName: clientName || "there",
          bookingTitle: booking.title,
          bookingDate: booking.startTime,
          bookingTime: booking.startTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: booking.location || undefined,
          photographerName: organization?.name || "Your Photographer",
          photographerEmail: organization?.publicEmail || undefined,
          photographerPhone: organization?.publicPhone || undefined,
          notes: booking.notes || undefined,
        });

        console.log(`[Bookings] Confirmation email sent to ${clientEmail}`);
      } catch (emailError) {
        console.error(
          `[Bookings] Failed to send confirmation to ${clientEmail}:`,
          emailError
        );
        // Don't fail the action - booking was confirmed successfully
      }
    }

    // Send SMS confirmation if client has a phone and SMS is enabled
    const clientPhone = booking.client?.phone || booking.clientPhone;
    if (booking.clientId && clientPhone) {
      try {
        const smsResult = await sendSMSToClient({
          organizationId,
          clientId: booking.clientId,
          templateType: "booking_confirmation",
          bookingId: booking.id,
          variables: {
            clientName: clientName || "there",
            bookingDate: booking.startTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }),
            bookingTime: booking.startTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            serviceName: booking.title,
            locationAddress: booking.location || "TBD",
            photographerName: "Your Photographer",
          },
        });

        if (smsResult.success) {
          console.log(`[Bookings] Confirmation SMS sent to ${clientPhone}`);
        } else {
          console.log(`[Bookings] SMS not sent: ${smsResult.error}`);
        }
      } catch (smsError) {
        console.error(
          `[Bookings] Failed to send SMS to ${clientPhone}:`,
          smsError
        );
        // Don't fail the action - booking was confirmed successfully
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "booking_confirmed",
        description: `Booking "${booking.title}" confirmed for ${clientName || clientEmail || "client"}`,
        bookingId: id,
        clientId: booking.clientId,
        metadata: {
          bookingTitle: booking.title,
          clientEmail,
          clientName,
          startTime: booking.startTime.toISOString(),
          emailSent: sendEmail && !!clientEmail,
        },
      },
    });

    revalidatePath("/scheduling");
    revalidatePath(`/scheduling/${id}`);
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error confirming booking:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to confirm booking" };
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

// ============================================================================
// BOOKING REMINDERS
// ============================================================================

export interface ReminderInput {
  type: "hours_24" | "hours_1" | "custom";
  channel: "email" | "sms";
  recipient: "client" | "photographer" | "both";
  minutesBefore?: number;
}

/**
 * Create reminders for a booking
 */
export async function createBookingReminders(
  bookingId: string,
  reminders: ReminderInput[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the booking belongs to this organization
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId: auth.organizationId,
      },
      select: {
        id: true,
        startTime: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Create reminders
    const createdReminders = await Promise.all(
      reminders.map(async (reminder) => {
        const minutesBefore = reminder.type === "custom"
          ? reminder.minutesBefore ?? 1440
          : reminder.type === "hours_24"
            ? 1440
            : 60;

        const sendAt = new Date(
          booking.startTime.getTime() - minutesBefore * 60 * 1000
        );

        // Don't create reminder if sendAt is in the past
        if (sendAt <= new Date()) {
          return null;
        }

        return prisma.bookingReminder.create({
          data: {
            bookingId,
            sendAt,
            type: reminder.type,
            channel: reminder.channel,
            recipient: reminder.recipient,
            minutesBefore,
          },
        });
      })
    );

    const count = createdReminders.filter(Boolean).length;

    return { success: true, data: { count } };
  } catch (error) {
    console.error("Error creating booking reminders:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create reminders" };
  }
}

/**
 * Get reminders for a booking
 */
export async function getBookingReminders(
  bookingId: string
): Promise<ActionResult<{
  id: string;
  type: string;
  channel: string;
  recipient: string;
  sendAt: Date;
  sent: boolean;
  sentAt: Date | null;
  minutesBefore: number;
}[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the booking belongs to this organization
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId: auth.organizationId,
      },
      select: { id: true },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const reminders = await prisma.bookingReminder.findMany({
      where: { bookingId },
      orderBy: { sendAt: "asc" },
      select: {
        id: true,
        type: true,
        channel: true,
        recipient: true,
        sendAt: true,
        sent: true,
        sentAt: true,
        minutesBefore: true,
      },
    });

    return { success: true, data: reminders };
  } catch (error) {
    console.error("Error fetching booking reminders:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch reminders" };
  }
}

/**
 * Delete a reminder
 */
export async function deleteBookingReminder(
  reminderId: string
): Promise<ActionResult> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the reminder belongs to a booking in this organization
    const reminder = await prisma.bookingReminder.findFirst({
      where: { id: reminderId },
      include: {
        booking: {
          select: { organizationId: true },
        },
      },
    });

    if (!reminder || reminder.booking.organizationId !== auth.organizationId) {
      return { success: false, error: "Reminder not found" };
    }

    await prisma.bookingReminder.delete({
      where: { id: reminderId },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting reminder:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete reminder" };
  }
}

/**
 * Update reminders for a booking (delete existing and create new ones)
 */
export async function updateBookingReminders(
  bookingId: string,
  reminders: ReminderInput[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the booking belongs to this organization
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId: auth.organizationId,
      },
      select: {
        id: true,
        startTime: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Delete existing unsent reminders
    await prisma.bookingReminder.deleteMany({
      where: {
        bookingId,
        sent: false,
      },
    });

    // Create new reminders
    const createdReminders = await Promise.all(
      reminders.map(async (reminder) => {
        const minutesBefore = reminder.type === "custom"
          ? reminder.minutesBefore ?? 1440
          : reminder.type === "hours_24"
            ? 1440
            : 60;

        const sendAt = new Date(
          booking.startTime.getTime() - minutesBefore * 60 * 1000
        );

        // Don't create reminder if sendAt is in the past
        if (sendAt <= new Date()) {
          return null;
        }

        return prisma.bookingReminder.create({
          data: {
            bookingId,
            sendAt,
            type: reminder.type,
            channel: reminder.channel,
            recipient: reminder.recipient,
            minutesBefore,
          },
        });
      })
    );

    const count = createdReminders.filter(Boolean).length;

    return { success: true, data: { count } };
  } catch (error) {
    console.error("Error updating booking reminders:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update reminders" };
  }
}

/**
 * Get pending reminders that need to be sent (for background job/cron)
 */
export async function getPendingReminders(): Promise<ActionResult<{
  id: string;
  bookingId: string;
  type: string;
  channel: string;
  recipient: string;
  sendAt: Date;
  booking: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    location: string | null;
    clientName: string | null;
    client: {
      fullName: string | null;
      email: string;
      phone: string | null;
    } | null;
    assignedUser: {
      fullName: string | null;
      email: string;
    } | null;
    organization: {
      name: string;
    };
  };
}[]>> {
  try {
    const now = new Date();

    const reminders = await prisma.bookingReminder.findMany({
      where: {
        sent: false,
        sendAt: { lte: now },
      },
      include: {
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            location: true,
            clientName: true,
            client: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
            assignedUser: {
              select: {
                fullName: true,
                email: true,
              },
            },
            organization: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { sendAt: "asc" },
      take: 100,
    });

    return { success: true, data: reminders };
  } catch (error) {
    console.error("Error fetching pending reminders:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch pending reminders" };
  }
}

/**
 * Mark a reminder as sent
 */
export async function markReminderSent(
  reminderId: string,
  errorMessage?: string
): Promise<ActionResult> {
  try {
    await prisma.bookingReminder.update({
      where: { id: reminderId },
      data: {
        sent: true,
        sentAt: new Date(),
        errorMessage,
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error marking reminder as sent:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to mark reminder as sent" };
  }
}

// =============================================================================
// Multi-Day Event Functions
// =============================================================================

export interface MultiDaySession {
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  locationNotes?: string;
  notes?: string;
  assignedUserId?: string;
}

export interface CreateMultiDayEventInput {
  eventName: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceId?: string;
  bookingTypeId?: string;
  notes?: string;
  sessions: MultiDaySession[];
}

/**
 * Create a multi-day event with multiple sessions
 * Used for weddings, conferences, and other events spanning multiple days
 */
export async function createMultiDayEvent(
  input: CreateMultiDayEventInput
): Promise<ActionResult<{ parentId: string; sessionIds: string[] }>> {
  try {
    const organizationId = await getOrganizationId();

    if (!input.sessions || input.sessions.length === 0) {
      return { success: false, error: "At least one session is required" };
    }

    // Sort sessions by start time
    const sortedSessions = [...input.sessions].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    // Calculate event start and end from sessions
    const eventStart = sortedSessions[0].startTime;
    const eventEnd = sortedSessions[sortedSessions.length - 1].endTime;

    // Create the parent event and all sessions in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the parent multi-day event
      const parentEvent = await tx.booking.create({
        data: {
          organizationId,
          title: input.eventName,
          isMultiDay: true,
          multiDayName: input.eventName,
          clientId: input.clientId || null,
          clientName: input.clientName || null,
          clientEmail: input.clientEmail || null,
          clientPhone: input.clientPhone || null,
          serviceId: input.serviceId || null,
          bookingTypeId: input.bookingTypeId || null,
          notes: input.notes || null,
          startTime: eventStart,
          endTime: eventEnd,
          status: "confirmed",
        },
      });

      // Create each session linked to the parent
      const sessionIds: string[] = [];
      for (const session of sortedSessions) {
        const sessionBooking = await tx.booking.create({
          data: {
            organizationId,
            title: session.title,
            multiDayParentId: parentEvent.id,
            clientId: input.clientId || null,
            clientName: input.clientName || null,
            clientEmail: input.clientEmail || null,
            clientPhone: input.clientPhone || null,
            serviceId: input.serviceId || null,
            bookingTypeId: input.bookingTypeId || null,
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.location || null,
            locationNotes: session.locationNotes || null,
            notes: session.notes || null,
            assignedUserId: session.assignedUserId || null,
            status: "confirmed",
          },
        });
        sessionIds.push(sessionBooking.id);
      }

      return { parentId: parentEvent.id, sessionIds };
    });

    revalidatePath("/scheduling");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating multi-day event:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create multi-day event" };
  }
}

/**
 * Get a multi-day event with all its sessions
 */
export async function getMultiDayEvent(
  eventId: string
): Promise<ActionResult<{
  parent: Awaited<ReturnType<typeof prisma.booking.findUnique>>;
  sessions: Awaited<ReturnType<typeof prisma.booking.findMany>>;
}>> {
  try {
    const organizationId = await getOrganizationId();

    const parentEvent = await prisma.booking.findUnique({
      where: {
        id: eventId,
        organizationId,
        isMultiDay: true,
      },
      include: {
        client: true,
        service: true,
        bookingType: true,
        assignedUser: true,
      },
    });

    if (!parentEvent) {
      return { success: false, error: "Multi-day event not found" };
    }

    const sessions = await prisma.booking.findMany({
      where: {
        multiDayParentId: eventId,
        organizationId,
      },
      include: {
        assignedUser: true,
        locationRef: true,
      },
      orderBy: { startTime: "asc" },
    });

    return { success: true, data: { parent: parentEvent, sessions } };
  } catch (error) {
    console.error("Error fetching multi-day event:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch multi-day event" };
  }
}

/**
 * Add a new session to an existing multi-day event
 */
export async function addSessionToMultiDayEvent(
  eventId: string,
  session: MultiDaySession
): Promise<ActionResult<{ sessionId: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify parent event exists
    const parentEvent = await prisma.booking.findUnique({
      where: {
        id: eventId,
        organizationId,
        isMultiDay: true,
      },
    });

    if (!parentEvent) {
      return { success: false, error: "Multi-day event not found" };
    }

    // Create the session
    const result = await prisma.$transaction(async (tx) => {
      const sessionBooking = await tx.booking.create({
        data: {
          organizationId,
          title: session.title,
          multiDayParentId: eventId,
          clientId: parentEvent.clientId,
          clientName: parentEvent.clientName,
          clientEmail: parentEvent.clientEmail,
          clientPhone: parentEvent.clientPhone,
          serviceId: parentEvent.serviceId,
          bookingTypeId: parentEvent.bookingTypeId,
          startTime: session.startTime,
          endTime: session.endTime,
          location: session.location || null,
          locationNotes: session.locationNotes || null,
          notes: session.notes || null,
          assignedUserId: session.assignedUserId || null,
          status: "confirmed",
        },
      });

      // Update parent event start/end times if needed
      const needsStartUpdate = session.startTime < parentEvent.startTime;
      const needsEndUpdate = session.endTime > parentEvent.endTime;

      if (needsStartUpdate || needsEndUpdate) {
        await tx.booking.update({
          where: { id: eventId },
          data: {
            ...(needsStartUpdate && { startTime: session.startTime }),
            ...(needsEndUpdate && { endTime: session.endTime }),
          },
        });
      }

      return sessionBooking.id;
    });

    revalidatePath("/scheduling");
    return { success: true, data: { sessionId: result } };
  } catch (error) {
    console.error("Error adding session to multi-day event:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add session" };
  }
}

/**
 * Update a session within a multi-day event
 */
export async function updateMultiDaySession(
  sessionId: string,
  updates: Partial<MultiDaySession>
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify session exists and belongs to a multi-day event
    const session = await prisma.booking.findUnique({
      where: {
        id: sessionId,
        organizationId,
      },
      include: {
        multiDayParent: true,
      },
    });

    if (!session || !session.multiDayParentId) {
      return { success: false, error: "Session not found" };
    }

    await prisma.$transaction(async (tx) => {
      // Update the session
      await tx.booking.update({
        where: { id: sessionId },
        data: {
          ...(updates.title && { title: updates.title }),
          ...(updates.startTime && { startTime: updates.startTime }),
          ...(updates.endTime && { endTime: updates.endTime }),
          ...(updates.location !== undefined && { location: updates.location || null }),
          ...(updates.locationNotes !== undefined && { locationNotes: updates.locationNotes || null }),
          ...(updates.notes !== undefined && { notes: updates.notes || null }),
          ...(updates.assignedUserId !== undefined && { assignedUserId: updates.assignedUserId || null }),
        },
      });

      // Recalculate parent event times
      const allSessions = await tx.booking.findMany({
        where: { multiDayParentId: session.multiDayParentId! },
        orderBy: { startTime: "asc" },
      });

      if (allSessions.length > 0) {
        const eventStart = allSessions[0].startTime;
        const eventEnd = allSessions[allSessions.length - 1].endTime;

        await tx.booking.update({
          where: { id: session.multiDayParentId! },
          data: { startTime: eventStart, endTime: eventEnd },
        });
      }
    });

    revalidatePath("/scheduling");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating multi-day session:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update session" };
  }
}

/**
 * Delete a session from a multi-day event
 */
export async function deleteMultiDaySession(
  sessionId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const session = await prisma.booking.findUnique({
      where: {
        id: sessionId,
        organizationId,
      },
    });

    if (!session || !session.multiDayParentId) {
      return { success: false, error: "Session not found" };
    }

    const parentId = session.multiDayParentId;

    await prisma.$transaction(async (tx) => {
      // Delete the session
      await tx.booking.delete({ where: { id: sessionId } });

      // Check remaining sessions
      const remainingSessions = await tx.booking.findMany({
        where: { multiDayParentId: parentId },
        orderBy: { startTime: "asc" },
      });

      if (remainingSessions.length === 0) {
        // Delete parent if no sessions remain
        await tx.booking.delete({ where: { id: parentId } });
      } else {
        // Update parent times
        const eventStart = remainingSessions[0].startTime;
        const eventEnd = remainingSessions[remainingSessions.length - 1].endTime;

        await tx.booking.update({
          where: { id: parentId },
          data: { startTime: eventStart, endTime: eventEnd },
        });
      }
    });

    revalidatePath("/scheduling");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting multi-day session:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete session" };
  }
}

/**
 * Delete an entire multi-day event and all its sessions
 */
export async function deleteMultiDayEvent(
  eventId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const parentEvent = await prisma.booking.findUnique({
      where: {
        id: eventId,
        organizationId,
        isMultiDay: true,
      },
    });

    if (!parentEvent) {
      return { success: false, error: "Multi-day event not found" };
    }

    await prisma.$transaction(async (tx) => {
      // Delete all sessions
      await tx.booking.deleteMany({
        where: { multiDayParentId: eventId },
      });

      // Delete the parent event
      await tx.booking.delete({ where: { id: eventId } });
    });

    revalidatePath("/scheduling");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting multi-day event:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete multi-day event" };
  }
}

/**
 * Get all multi-day events for the organization
 */
export async function getMultiDayEvents(): Promise<
  ActionResult<
    Array<{
      id: string;
      multiDayName: string | null;
      startTime: Date;
      endTime: Date;
      sessionCount: number;
      client: { id: string; fullName: string | null } | null;
    }>
  >
> {
  try {
    const organizationId = await getOrganizationId();

    const events = await prisma.booking.findMany({
      where: {
        organizationId,
        isMultiDay: true,
      },
      include: {
        client: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { multiDaySessions: true },
        },
      },
      orderBy: { startTime: "desc" },
    });

    const result = events.map((event) => ({
      id: event.id,
      multiDayName: event.multiDayName,
      startTime: event.startTime,
      endTime: event.endTime,
      sessionCount: event._count.multiDaySessions,
      client: event.client,
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching multi-day events:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch multi-day events" };
  }
}

// =============================================================================
// Booking Conflict Detection
// =============================================================================

export interface BookingConflict {
  bookingId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  clientName: string | null;
  overlapMinutes: number;
  conflictType: "full" | "partial_start" | "partial_end" | "contained";
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: BookingConflict[];
  suggestions?: {
    earliestAvailable: Date | null;
    nextAvailable: Date | null;
  };
}

/**
 * Check for booking conflicts in a time range
 * Considers buffer times if configured
 */
export async function checkBookingConflicts(params: {
  startTime: Date;
  endTime: Date;
  excludeBookingId?: string;
  userId?: string;
  serviceId?: string;
  includeBuffers?: boolean;
}): Promise<ActionResult<ConflictCheckResult>> {
  try {
    const organizationId = await getOrganizationId();

    const {
      startTime,
      endTime,
      excludeBookingId,
      userId,
      serviceId,
      includeBuffers = true,
    } = params;

    // Get buffer times if configured
    let bufferBefore = 0;
    let bufferAfter = 0;

    if (includeBuffers && serviceId) {
      const buffer = await prisma.bookingBuffer.findFirst({
        where: {
          organizationId,
          serviceId,
        },
      });
      if (buffer) {
        bufferBefore = buffer.bufferBefore;
        bufferAfter = buffer.bufferAfter;
      }
    }

    // If no service-specific buffer, check org-wide defaults
    if (includeBuffers && bufferBefore === 0 && bufferAfter === 0) {
      const orgBuffer = await prisma.bookingBuffer.findFirst({
        where: {
          organizationId,
          serviceId: null,
        },
      });
      if (orgBuffer) {
        bufferBefore = orgBuffer.bufferBefore;
        bufferAfter = orgBuffer.bufferAfter;
      }
    }

    // Adjust times with buffers (in minutes)
    const bufferedStart = new Date(startTime.getTime() - bufferBefore * 60 * 1000);
    const bufferedEnd = new Date(endTime.getTime() + bufferAfter * 60 * 1000);

    // Find overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        organizationId,
        status: { notIn: ["cancelled"] },
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        ...(userId && { assignedUserId: userId }),
        // Time overlap check: booking starts before our end AND ends after our start
        AND: [
          { startTime: { lt: bufferedEnd } },
          { endTime: { gt: bufferedStart } },
        ],
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        client: {
          select: {
            fullName: true,
          },
        },
        clientName: true,
      },
      orderBy: { startTime: "asc" },
    });

    // Calculate overlap details for each conflict
    const conflicts: BookingConflict[] = overlappingBookings.map((booking) => {
      const overlapStart = new Date(
        Math.max(bufferedStart.getTime(), booking.startTime.getTime())
      );
      const overlapEnd = new Date(
        Math.min(bufferedEnd.getTime(), booking.endTime.getTime())
      );
      const overlapMinutes = Math.ceil(
        (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60)
      );

      // Determine conflict type
      let conflictType: BookingConflict["conflictType"];
      if (
        booking.startTime <= bufferedStart &&
        booking.endTime >= bufferedEnd
      ) {
        conflictType = "contained"; // Existing booking contains the new one
      } else if (
        booking.startTime >= bufferedStart &&
        booking.endTime <= bufferedEnd
      ) {
        conflictType = "full"; // New booking contains existing
      } else if (booking.startTime < bufferedStart) {
        conflictType = "partial_start"; // Existing overlaps at start
      } else {
        conflictType = "partial_end"; // Existing overlaps at end
      }

      return {
        bookingId: booking.id,
        title: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        clientName: booking.client?.fullName || booking.clientName,
        overlapMinutes,
        conflictType,
      };
    });

    // Find next available slot if there are conflicts
    let suggestions: ConflictCheckResult["suggestions"] | undefined;
    if (conflicts.length > 0) {
      const duration = endTime.getTime() - startTime.getTime();

      // Find the earliest available slot after conflicts
      const latestConflictEnd = new Date(
        Math.max(...conflicts.map((c) => c.endTime.getTime())) + bufferAfter * 60 * 1000
      );

      suggestions = {
        earliestAvailable: null,
        nextAvailable: new Date(latestConflictEnd.getTime() + bufferBefore * 60 * 1000),
      };

      // Check if we can find an earlier slot before the first conflict
      const earliestConflictStart = new Date(
        Math.min(...conflicts.map((c) => c.startTime.getTime()))
      );
      const potentialEarlyEnd = new Date(
        earliestConflictStart.getTime() - bufferAfter * 60 * 1000
      );
      const potentialEarlyStart = new Date(potentialEarlyEnd.getTime() - duration);

      if (potentialEarlyStart >= new Date()) {
        suggestions.earliestAvailable = potentialEarlyStart;
      }
    }

    return {
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
        suggestions,
      },
    };
  } catch (error) {
    console.error("Error checking booking conflicts:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to check booking conflicts" };
  }
}

/**
 * Get all conflicts for a specific date range (for calendar display)
 */
export async function getConflictsInRange(params: {
  startDate: Date;
  endDate: Date;
  userId?: string;
}): Promise<ActionResult<{ conflicts: BookingConflict[][] }>> {
  try {
    const organizationId = await getOrganizationId();

    const { startDate, endDate, userId } = params;

    // Get all bookings in the range
    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        status: { notIn: ["cancelled"] },
        ...(userId && { assignedUserId: userId }),
        AND: [
          { startTime: { lt: endDate } },
          { endTime: { gt: startDate } },
        ],
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        client: {
          select: {
            fullName: true,
          },
        },
        clientName: true,
      },
      orderBy: { startTime: "asc" },
    });

    // Find all overlapping pairs
    const conflictPairs: BookingConflict[][] = [];

    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const a = bookings[i];
        const b = bookings[j];

        // Check if they overlap
        if (a.startTime < b.endTime && a.endTime > b.startTime) {
          const overlapStart = new Date(
            Math.max(a.startTime.getTime(), b.startTime.getTime())
          );
          const overlapEnd = new Date(
            Math.min(a.endTime.getTime(), b.endTime.getTime())
          );
          const overlapMinutes = Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60)
          );

          const conflictA: BookingConflict = {
            bookingId: a.id,
            title: a.title,
            startTime: a.startTime,
            endTime: a.endTime,
            clientName: a.client?.fullName || a.clientName,
            overlapMinutes,
            conflictType: a.startTime <= b.startTime ? "partial_end" : "partial_start",
          };

          const conflictB: BookingConflict = {
            bookingId: b.id,
            title: b.title,
            startTime: b.startTime,
            endTime: b.endTime,
            clientName: b.client?.fullName || b.clientName,
            overlapMinutes,
            conflictType: b.startTime <= a.startTime ? "partial_end" : "partial_start",
          };

          conflictPairs.push([conflictA, conflictB]);
        }
      }
    }

    return {
      success: true,
      data: { conflicts: conflictPairs },
    };
  } catch (error) {
    console.error("Error getting conflicts in range:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get conflicts" };
  }
}

/**
 * Validate a booking before creation/update for conflicts
 */
export async function validateBookingTime(params: {
  startTime: Date;
  endTime: Date;
  bookingId?: string;
  userId?: string;
  serviceId?: string;
  allowConflicts?: boolean;
}): Promise<ActionResult<{ valid: boolean; message?: string; conflicts?: BookingConflict[] }>> {
  try {
    const { allowConflicts = false, ...checkParams } = params;

    const result = await checkBookingConflicts({
      ...checkParams,
      excludeBookingId: params.bookingId,
    });

    if (!result.success) {
      return result;
    }

    if (result.data.hasConflicts && !allowConflicts) {
      const conflictMessages = result.data.conflicts.map(
        (c) =>
          `"${c.title}"${c.clientName ? ` with ${c.clientName}` : ""} (${c.overlapMinutes}min overlap)`
      );

      return {
        success: true,
        data: {
          valid: false,
          message: `This time conflicts with: ${conflictMessages.join(", ")}`,
          conflicts: result.data.conflicts,
        },
      };
    }

    return {
      success: true,
      data: { valid: true },
    };
  } catch (error) {
    console.error("Error validating booking time:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to validate booking time" };
  }
}
