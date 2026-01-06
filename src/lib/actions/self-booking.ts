"use server";

import { prisma } from "@/lib/db";
import { combineDateAndTime } from "@/lib/dates";
import { validateBookingTime } from "./bookings";
import type { ActionResult } from "@/lib/types/action-result";

// ============================================================================
// TYPES
// ============================================================================

export type PublicService = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  duration: string | null;
  category: string;
};

export type AvailableSlot = {
  date: string;
  time: string;
  datetime: Date;
  timezone: string;
};

export type BookingSubmission = {
  organizationSlug: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  address: string;
  notes?: string;
};

export type BookingConfirmation = {
  id: string;
  serviceName: string;
  scheduledDate: Date;
  address: string;
};

// ============================================================================
// PUBLIC READ OPERATIONS (no auth required)
// ============================================================================

export async function getPublicOrganization(slug: string): Promise<
  ActionResult<{
    id: string;
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
    slug: string;
  }>
> {
  try {
    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        primaryColor: true,
        slug: true,
        timezone: true,
      },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    return { success: true, data: org };
  } catch (error) {
    console.error("Error getting public organization:", error);
    return { success: false, error: "Failed to get organization" };
  }
}

export async function getPublicServices(
  organizationSlug: string
): Promise<ActionResult<PublicService[]>> {
  try {
    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ slug: organizationSlug }, { id: organizationSlug }],
      },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    const services = await prisma.service.findMany({
      where: {
        organizationId: org.id,
        isActive: true,
        isDefault: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        duration: true,
        category: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return { success: true, data: services };
  } catch (error) {
    console.error("Error getting public services:", error);
    return { success: false, error: "Failed to get services" };
  }
}

export async function getAvailableSlots(
  organizationSlug: string,
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<ActionResult<AvailableSlot[]>> {
  try {
    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ slug: organizationSlug }, { id: organizationSlug }],
      },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    const timezone = org.timezone || "America/New_York";

    // Suppress unused variable warning
    void serviceId;

    // Generate available slots (9am - 5pm, hourly)
    const slots: AvailableSlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateStr = date.toISOString().split("T")[0];

      for (const time of times) {
        const slotStart = combineDateAndTime(dateStr, time);
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

        const validation = await validateBookingTime({
          startTime: slotStart,
          endTime: slotEnd,
          serviceId,
          organizationId: org.id,
          allowConflicts: false,
        });

        if (!validation.success || !validation.data.valid) {
          continue;
        }

        slots.push({
          date: dateStr,
          time,
          datetime: slotStart,
          timezone,
        });
      }
    }

    return { success: true, data: slots };
  } catch (error) {
    console.error("Error getting available slots:", error);
    return { success: false, error: "Failed to get available slots" };
  }
}

// ============================================================================
// PUBLIC WRITE OPERATIONS
// ============================================================================

export async function submitBooking(
  data: BookingSubmission
): Promise<ActionResult<BookingConfirmation>> {
  try {
    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ slug: data.organizationSlug }, { id: data.organizationSlug }],
      },
      select: {
        id: true,
        timezone: true,
      },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    const service = await prisma.service.findFirst({
      where: {
        id: data.serviceId,
        organizationId: org.id,
        isActive: true,
      },
    });

    if (!service) {
      return { success: false, error: "Service not found" };
    }

    // Find or create client
    let client = await prisma.client.findFirst({
      where: {
        organizationId: org.id,
        email: data.clientEmail,
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          organizationId: org.id,
          fullName: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone || null,
          source: "self_booking",
        },
      });
    }

    // Parse scheduled date and time into startTime and endTime
    const startTime = combineDateAndTime(data.scheduledDate, data.scheduledTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

    const validation = await validateBookingTime({
      startTime,
      endTime,
      serviceId: data.serviceId,
      organizationId: org.id,
      allowConflicts: false,
    });

    if (!validation.success) {
      return { success: false, error: validation.error || "Failed to validate booking" };
    }

    if (!validation.data.valid) {
      return { success: false, error: validation.data.message || "This time is not available" };
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        organizationId: org.id,
        clientId: client.id,
        title: service.name + " - " + data.clientName,
        startTime,
        endTime,
        location: data.address,
        description: data.notes || null,
        timezone: org.timezone || "America/New_York",
        status: "pending",
      },
    });

    return {
      success: true,
      data: {
        id: booking.id,
        serviceName: service.name,
        scheduledDate: booking.startTime,
        address: booking.location || "",
      },
    };
  } catch (error) {
    console.error("Error submitting booking:", error);
    return { success: false, error: "Failed to submit booking" };
  }
}
