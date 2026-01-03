"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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
      return { success: true, data: [] };
    }

    const auth = await getAuthContext();
    if (!auth?.userId) {
      return { success: false, error: "Unauthorized" };
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

    return { success: true, data: fieldBookings };
  } catch (error) {
    console.error("Error getting today's bookings:", error);
    return { success: false, error: "Failed to get bookings" };
  }
}

export async function getUpcomingBookings(days: number = 7): Promise<ActionResult<FieldBooking[]>> {
  try {
    // Avoid hitting Clerk/headers during static build
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return { success: true, data: [] };
    }

    const auth = await getAuthContext();
    if (!auth?.userId) {
      return { success: false, error: "Unauthorized" };
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

    return { success: true, data: fieldBookings };
  } catch (error) {
    console.error("Error getting upcoming bookings:", error);
    return { success: false, error: "Failed to get bookings" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function checkIn(data: CheckInData): Promise<ActionResult<{ checkInTime: Date }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        organizationId: auth.organizationId,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
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
    return { success: true, data: { checkInTime } };
  } catch (error) {
    console.error("Error checking in:", error);
    return { success: false, error: "Failed to check in" };
  }
}

export async function checkOut(data: CheckOutData): Promise<ActionResult<{ checkOutTime: Date }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        organizationId: auth.organizationId,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
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
    return { success: true, data: { checkOutTime } };
  } catch (error) {
    console.error("Error checking out:", error);
    return { success: false, error: "Failed to check out" };
  }
}

export async function addFieldNote(
  bookingId: string,
  note: string
): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId: auth.organizationId,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
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
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error adding field note:", error);
    return { success: false, error: "Failed to add note" };
  }
}
