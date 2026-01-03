"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { CheckInType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CheckInData {
  bookingId: string;
  checkInType: CheckInType;
  latitude: number;
  longitude: number;
  accuracy?: number;
  photoUrl?: string;
  notes?: string;
}

interface LocationPingData {
  bookingId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
}

interface BookingWithLocation {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: string;
  location: string | null;
  locationRef: {
    latitude: number | null;
    longitude: number | null;
    formattedAddress: string | null;
  } | null;
  client: {
    id: string;
    fullName: string | null;
    phone: string | null;
  } | null;
  service: {
    id: string;
    name: string;
  } | null;
  checkIns: {
    id: string;
    checkInType: CheckInType;
    latitude: number;
    longitude: number;
    createdAt: Date;
  }[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findFirst({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  return user?.id ?? null;
}

async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id ?? null;
}

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// BOOKING CHECK-IN
// ============================================================================

export async function checkInToBooking(data: CheckInData): Promise<ActionResult<{ id: string; distanceFromLocation: number | null }>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the booking and verify it belongs to this user
    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        OR: [
          { assignedUserId: userId },
          { organization: { members: { some: { id: userId } } } },
        ],
      },
      include: {
        locationRef: {
          select: {
            latitude: true,
            longitude: true,
            formattedAddress: true,
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found or access denied" };
    }

    // Calculate distance from booking location
    let distanceFromLocation: number | null = null;
    if (booking.locationRef?.latitude && booking.locationRef?.longitude) {
      distanceFromLocation = calculateDistance(
        data.latitude,
        data.longitude,
        booking.locationRef.latitude,
        booking.locationRef.longitude
      );
    }

    // Create check-in record
    const checkIn = await prisma.bookingCheckIn.create({
      data: {
        bookingId: data.bookingId,
        userId,
        checkInType: data.checkInType,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        distanceFromLocation,
        photoUrl: data.photoUrl,
        notes: data.notes,
      },
    });

    // Update booking status based on check-in type
    if (data.checkInType === "arrival") {
      await prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: "in_progress" },
      });
    } else if (data.checkInType === "departure") {
      await prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: "completed" },
      });
    }

    revalidatePath("/field");
    revalidatePath(`/scheduling/${data.bookingId}`);

    return {
      success: true,
      data: {
        id: checkIn.id,
        distanceFromLocation,
      },
    };
  } catch (err) {
    console.error("Failed to check in:", err);
    return { success: false, error: "Failed to check in" };
  }
}

// ============================================================================
// LOCATION TRACKING
// ============================================================================

export async function recordLocationPing(data: LocationPingData): Promise<ActionResult<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the booking exists and user is assigned
    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        assignedUserId: userId,
        status: { in: ["confirmed", "in_progress"] },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found or not in progress" };
    }

    // Create location ping
    await prisma.locationPing.create({
      data: {
        bookingId: data.bookingId,
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        altitude: data.altitude,
        speed: data.speed,
        heading: data.heading,
        batteryLevel: data.batteryLevel,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to record location ping:", err);
    return { success: false, error: "Failed to record location" };
  }
}

export async function getLatestLocation(bookingId: string): Promise<ActionResult<{
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: Date;
} | null>> {
  try {
    const ping = await prisma.locationPing.findFirst({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
      select: {
        latitude: true,
        longitude: true,
        accuracy: true,
        speed: true,
        heading: true,
        createdAt: true,
      },
    });

    if (!ping) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        latitude: ping.latitude,
        longitude: ping.longitude,
        accuracy: ping.accuracy,
        speed: ping.speed,
        heading: ping.heading,
        timestamp: ping.createdAt,
      },
    };
  } catch (err) {
    console.error("Failed to get latest location:", err);
    return { success: false, error: "Failed to get location" };
  }
}

// ============================================================================
// TODAY'S SCHEDULE (FOR FIELD APP)
// ============================================================================

export async function getTodaysBookings(): Promise<ActionResult<BookingWithLocation[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        assignedUserId: userId,
        startTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: { notIn: ["cancelled"] },
      },
      include: {
        locationRef: {
          select: {
            latitude: true,
            longitude: true,
            formattedAddress: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        checkIns: {
          select: {
            id: true,
            checkInType: true,
            latitude: true,
            longitude: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return {
      success: true,
      data: bookings.map((b) => ({
        id: b.id,
        title: b.title,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        location: b.location,
        locationRef: b.locationRef,
        client: b.client,
        service: b.service,
        checkIns: b.checkIns,
      })),
    };
  } catch (err) {
    console.error("Failed to get today's bookings:", err);
    return { success: false, error: "Failed to get bookings" };
  }
}

export async function getBookingForField(bookingId: string): Promise<ActionResult<BookingWithLocation>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        assignedUserId: userId,
      },
      include: {
        locationRef: {
          select: {
            latitude: true,
            longitude: true,
            formattedAddress: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        checkIns: {
          select: {
            id: true,
            checkInType: true,
            latitude: true,
            longitude: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    return {
      success: true,
      data: {
        id: booking.id,
        title: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        location: booking.location,
        locationRef: booking.locationRef,
        client: booking.client,
        service: booking.service,
        checkIns: booking.checkIns,
      },
    };
  } catch (err) {
    console.error("Failed to get booking:", err);
    return { success: false, error: "Failed to get booking" };
  }
}

// ============================================================================
// EN ROUTE NOTIFICATION
// ============================================================================

export async function markEnRoute(bookingId: string): Promise<ActionResult<void>> {
  try {
    const userId = await getCurrentUserId();
    const organizationId = await getOrganizationId();
    if (!userId || !organizationId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get booking with client info
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        assignedUserId: userId,
      },
      include: {
        client: true,
        assignedUser: true,
        organization: {
          select: { smsEnabled: true },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "confirmed" },
    });

    // Send SMS notification if enabled
    if (booking.organization.smsEnabled && (booking.clientPhone || booking.client?.phone)) {
      // Import dynamically to avoid circular deps
      const { sendPhotographerEnRouteSMS } = await import("./sms");
      await sendPhotographerEnRouteSMS(bookingId, 15); // Default 15 min ETA
    }

    revalidatePath("/field");
    return { success: true };
  } catch (err) {
    console.error("Failed to mark en route:", err);
    return { success: false, error: "Failed to mark en route" };
  }
}

// ============================================================================
// PUBLIC TRACKING (FOR CLIENTS)
// ============================================================================

export async function getPublicTrackingData(bookingId: string): Promise<ActionResult<{
  photographerName: string;
  photographerPhone: string | null;
  companyName: string;
  companyLogo: string | null;
  status: string;
  estimatedArrival: Date | null;
  location: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  } | null;
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}>> {
  try {
    // Get booking without auth (public endpoint)
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        status: { in: ["confirmed", "in_progress"] },
      },
      include: {
        assignedUser: {
          select: {
            fullName: true,
            phone: true,
          },
        },
        organization: {
          select: {
            name: true,
            publicName: true,
            logoUrl: true,
          },
        },
        locationRef: {
          select: {
            latitude: true,
            longitude: true,
            formattedAddress: true,
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found or not active" };
    }

    // Get latest location
    const latestPing = await prisma.locationPing.findFirst({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
      select: {
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: {
        photographerName: booking.assignedUser?.fullName || "Your photographer",
        photographerPhone: booking.assignedUser?.phone || null,
        companyName: booking.organization.publicName || booking.organization.name,
        companyLogo: booking.organization.logoUrl,
        status: booking.status,
        estimatedArrival: booking.startTime,
        location: latestPing
          ? {
              latitude: latestPing.latitude,
              longitude: latestPing.longitude,
              timestamp: latestPing.createdAt,
            }
          : null,
        destination: booking.locationRef?.latitude && booking.locationRef?.longitude
          ? {
              latitude: booking.locationRef.latitude,
              longitude: booking.locationRef.longitude,
              address: booking.locationRef.formattedAddress || "",
            }
          : null,
      },
    };
  } catch (err) {
    console.error("Failed to get tracking data:", err);
    return { success: false, error: "Failed to get tracking data" };
  }
}
