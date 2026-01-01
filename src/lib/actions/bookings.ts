"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { BookingStatus } from "@prisma/client";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID (simplified for now - will integrate with auth later)
async function getOrganizationId(): Promise<string> {
  // TODO: Get from Clerk auth context
  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!org) {
    throw new Error("No organization found");
  }

  return org.id;
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
