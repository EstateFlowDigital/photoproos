"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

export type FieldBooking = {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string | null;
  address: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  description: string | null;
};

export type CheckInData = {
  bookingId: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
};

export type CheckOutData = {
  bookingId: string;
  latitude?: number;
  longitude?: number;
  photosTaken?: number;
  notes?: string;
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getTodaysBookings(): Promise<ActionResult<FieldBooking[]>> {
  try {
    // Avoid hitting Clerk/headers during static build
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return success([]);
    }

    const auth = await getAuthContext();
    if (!auth?.userId) {
      return fail("Unauthorized");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId: auth.organizationId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ["confirmed"] },
      },
      include: {
        client: true,
        locationRef: true,
      },
      orderBy: { startTime: "asc" },
    });

    const fieldBookings: FieldBooking[] = bookings.map((b) => ({
      id: b.id,
      title: b.title,
      clientName: b.client?.fullName || b.clientName || "Unknown Client",
      clientPhone: b.client?.phone || b.clientPhone || null,
      address: b.locationRef?.formattedAddress || b.location || "No address",
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status as FieldBooking["status"],
      description: b.description,
    }));

    return success(fieldBookings);
  } catch (error) {
    console.error("Error getting today's bookings:", error);
    return fail("Failed to get bookings");
  }
}

export async function getUpcomingBookings(days: number = 7): Promise<ActionResult<FieldBooking[]>> {
  try {
    // Avoid hitting Clerk/headers during static build
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return success([]);
    }

    const auth = await getAuthContext();
    if (!auth?.userId) {
      return fail("Unauthorized");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId: auth.organizationId,
        startTime: {
          gte: today,
          lt: endDate,
        },
        status: { in: ["confirmed"] },
      },
      include: {
        client: true,
        locationRef: true,
      },
      orderBy: { startTime: "asc" },
    });

    const fieldBookings: FieldBooking[] = bookings.map((b) => ({
      id: b.id,
      title: b.title,
      clientName: b.client?.fullName || b.clientName || "Unknown Client",
      clientPhone: b.client?.phone || b.clientPhone || null,
      address: b.locationRef?.formattedAddress || b.location || "No address",
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status as FieldBooking["status"],
      description: b.description,
    }));

    return success(fieldBookings);
  } catch (error) {
    console.error("Error getting upcoming bookings:", error);
    return fail("Failed to get bookings");
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function checkIn(data: CheckInData): Promise<ActionResult<{ checkInTime: Date }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return fail("Unauthorized");
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        organizationId: auth.organizationId,
      },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    const checkInTime = new Date();

    // Create a check-in record using the BookingCheckIn model
    await prisma.bookingCheckIn.create({
      data: {
        bookingId: data.bookingId,
        userId: auth.userId,
        checkInType: "arrival",
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        notes: data.notes,
      },
    });

    revalidatePath("/field");
    return success({ checkInTime });
  } catch (error) {
    console.error("Error checking in:", error);
    return fail("Failed to check in");
  }
}

export async function checkOut(data: CheckOutData): Promise<ActionResult<{ checkOutTime: Date }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return fail("Unauthorized");
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        organizationId: auth.organizationId,
      },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    const checkOutTime = new Date();

    // Create a check-out record
    await prisma.bookingCheckIn.create({
      data: {
        bookingId: data.bookingId,
        userId: auth.userId,
        checkInType: "departure",
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        notes: data.notes,
      },
    });

    // Mark booking as completed
    await prisma.booking.update({
      where: { id: data.bookingId },
      data: { status: "completed" },
    });

    revalidatePath("/field");
    return success({ checkOutTime });
  } catch (error) {
    console.error("Error checking out:", error);
    return fail("Failed to check out");
  }
}

export async function addFieldNote(
  bookingId: string,
  note: string
): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return fail("Unauthorized");
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId: auth.organizationId,
      },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    const existingNotes = booking.description || "";
    const timestamp = new Date().toLocaleTimeString();
    const updatedNotes = existingNotes
      ? existingNotes + "\n[" + timestamp + "] " + note
      : "[" + timestamp + "] " + note;

    await prisma.booking.update({
      where: { id: bookingId },
      data: { description: updatedNotes },
    });

    revalidatePath("/field");
    return ok();
  } catch (error) {
    console.error("Error adding field note:", error);
    return fail("Failed to add note");
  }
}

// ============================================================================
// FIELD NOTES
// ============================================================================

export type FieldNote = {
  id: string;
  content: string;
  createdAt: Date;
  bookingId: string | null;
  bookingTitle: string | null;
  clientName: string | null;
};

export async function getFieldNotes(): Promise<ActionResult<FieldNote[]>> {
  try {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return success([]);
    }

    const auth = await getAuthContext();
    if (!auth?.userId) {
      return fail("Unauthorized");
    }

    // Get recent check-ins with notes
    const checkIns = await prisma.bookingCheckIn.findMany({
      where: {
        userId: auth.userId,
        notes: { not: null },
      },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const notes: FieldNote[] = checkIns
      .filter((c) => c.notes)
      .map((c) => ({
        id: c.id,
        content: c.notes!,
        createdAt: c.createdAt,
        bookingId: c.bookingId,
        bookingTitle: c.booking?.title || null,
        clientName: c.booking?.client?.fullName || c.booking?.clientName || null,
      }));

    return success(notes);
  } catch (error) {
    console.error("Error getting field notes:", error);
    return fail("Failed to get notes");
  }
}

export async function createFieldNote(data: {
  content: string;
  bookingId?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return fail("Unauthorized");
    }

    // If a booking is specified, verify it belongs to the user's organization
    if (data.bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: data.bookingId,
          organizationId: auth.organizationId,
        },
      });

      if (!booking) {
        return fail("Booking not found");
      }
    }

    // Create a check-in record with the note
    const checkIn = await prisma.bookingCheckIn.create({
      data: {
        bookingId: data.bookingId || "",
        userId: auth.userId,
        checkInType: "note",
        latitude: 0,
        longitude: 0,
        notes: data.content,
      },
    });

    revalidatePath("/field/notes");
    return success({ id: checkIn.id });
  } catch (error) {
    console.error("Error creating field note:", error);
    return fail("Failed to create note");
  }
}

export async function deleteFieldNote(noteId: string): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return fail("Unauthorized");
    }

    await prisma.bookingCheckIn.delete({
      where: {
        id: noteId,
        userId: auth.userId,
      },
    });

    revalidatePath("/field/notes");
    return ok();
  } catch (error) {
    console.error("Error deleting field note:", error);
    return fail("Failed to delete note");
  }
}
