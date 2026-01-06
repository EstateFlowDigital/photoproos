"use server";

/**
 * Booking Waitlist Management
 *
 * Handles waitlist functionality for when booking slots are full.
 * Allows clients to join a waitlist and be notified when spots open up.
 */

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import { WaitlistStatus, Prisma } from "@prisma/client";
import { sendWaitlistNotificationEmail } from "@/lib/email/send";
import type { ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

export interface WaitlistEntryData {
  id: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  serviceId: string | null;
  serviceName: string | null;
  preferredDate: Date;
  alternateDate: Date | null;
  flexibleDates: boolean;
  notes: string | null;
  status: WaitlistStatus;
  priority: number;
  position: number | null;
  notifiedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface CreateWaitlistInput {
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceId?: string;
  preferredDate: Date;
  alternateDate?: Date;
  flexibleDates?: boolean;
  notes?: string;
  priority?: number;
}

interface WaitlistFilters {
  status?: WaitlistStatus[];
  serviceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get all waitlist entries for the organization
 */
export async function getWaitlistEntries(
  filters?: WaitlistFilters,
  options?: { limit?: number; offset?: number }
): Promise<ActionResult<{ entries: WaitlistEntryData[]; total: number }>> {
  try {
    const organizationId = await requireOrganizationId();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const where: Prisma.BookingWaitlistWhereInput = {
      organizationId,
    };

    if (filters?.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.preferredDate = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    const [entries, total] = await Promise.all([
      prisma.bookingWaitlist.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        take: limit,
        skip: offset,
        include: {
          service: {
            select: { name: true },
          },
        },
      }),
      prisma.bookingWaitlist.count({ where }),
    ]);

    return {
      success: true,
      data: {
        entries: entries.map((e) => ({
          id: e.id,
          clientId: e.clientId,
          clientName: e.clientName,
          clientEmail: e.clientEmail,
          clientPhone: e.clientPhone,
          serviceId: e.serviceId,
          serviceName: e.service?.name || null,
          preferredDate: e.preferredDate,
          alternateDate: e.alternateDate,
          flexibleDates: e.flexibleDates,
          notes: e.notes,
          status: e.status,
          priority: e.priority,
          position: e.position,
          notifiedAt: e.notifiedAt,
          expiresAt: e.expiresAt,
          createdAt: e.createdAt,
        })),
        total,
      },
    };
  } catch (error) {
    console.error("[Waitlist] Error fetching entries:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch waitlist entries" };
  }
}

/**
 * Add a new entry to the waitlist
 */
export async function addToWaitlist(
  input: CreateWaitlistInput
): Promise<ActionResult<{ id: string; position: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Calculate position based on existing entries for this date
    const existingCount = await prisma.bookingWaitlist.count({
      where: {
        organizationId,
        preferredDate: input.preferredDate,
        status: "pending",
      },
    });

    const entry = await prisma.bookingWaitlist.create({
      data: {
        organizationId,
        clientId: input.clientId || null,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone || null,
        serviceId: input.serviceId || null,
        preferredDate: input.preferredDate,
        alternateDate: input.alternateDate || null,
        flexibleDates: input.flexibleDates || false,
        notes: input.notes || null,
        priority: input.priority || 0,
        position: existingCount + 1,
        status: "pending",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "client_added",
        description: `${input.clientName} added to waitlist for ${input.preferredDate.toLocaleDateString()}`,
        clientId: input.clientId || null,
      },
    });

    revalidatePath("/scheduling/waitlist");

    return {
      success: true,
      data: { id: entry.id, position: existingCount + 1 },
    };
  } catch (error) {
    console.error("[Waitlist] Error adding entry:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add to waitlist" };
  }
}

/**
 * Update waitlist entry status
 */
export async function updateWaitlistStatus(
  entryId: string,
  status: WaitlistStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    const existing = await prisma.bookingWaitlist.findFirst({
      where: { id: entryId, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Waitlist entry not found" };
    }

    await prisma.bookingWaitlist.update({
      where: { id: entryId },
      data: {
        status,
        ...(status === "notified" && { notifiedAt: new Date() }),
      },
    });

    revalidatePath("/scheduling/waitlist");

    return { success: true, data: { id: entryId } };
  } catch (error) {
    console.error("[Waitlist] Error updating status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update waitlist status" };
  }
}

/**
 * Update waitlist entry priority
 */
export async function updateWaitlistPriority(
  entryId: string,
  priority: number
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    const existing = await prisma.bookingWaitlist.findFirst({
      where: { id: entryId, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Waitlist entry not found" };
    }

    await prisma.bookingWaitlist.update({
      where: { id: entryId },
      data: { priority },
    });

    revalidatePath("/scheduling/waitlist");

    return { success: true, data: { id: entryId } };
  } catch (error) {
    console.error("[Waitlist] Error updating priority:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update priority" };
  }
}

/**
 * Remove entry from waitlist
 */
export async function removeFromWaitlist(
  entryId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    const existing = await prisma.bookingWaitlist.findFirst({
      where: { id: entryId, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Waitlist entry not found" };
    }

    await prisma.bookingWaitlist.delete({
      where: { id: entryId },
    });

    revalidatePath("/scheduling/waitlist");

    return { success: true, data: { id: entryId } };
  } catch (error) {
    console.error("[Waitlist] Error removing entry:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove from waitlist" };
  }
}

// =============================================================================
// Waitlist Operations
// =============================================================================

/**
 * Notify a client that a spot is available
 */
export async function notifyWaitlistClient(
  entryId: string,
  expiresInHours: number = 24
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Fetch entry with service and organization details for the email
    const entry = await prisma.bookingWaitlist.findFirst({
      where: { id: entryId, organizationId },
      include: {
        service: {
          select: { name: true },
        },
        organization: {
          select: {
            name: true,
            publicEmail: true,
            selfBookingPageSlug: true,
          },
        },
      },
    });

    if (!entry) {
      return { success: false, error: "Waitlist entry not found" };
    }

    if (entry.status !== "pending") {
      return { success: false, error: "Entry is not in pending status" };
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    await prisma.bookingWaitlist.update({
      where: { id: entryId },
      data: {
        status: "notified",
        notifiedAt: new Date(),
        expiresAt,
      },
    });

    // Send notification email to client
    const bookingUrl = entry.organization.selfBookingPageSlug
      ? `${process.env.NEXT_PUBLIC_APP_URL}/book/${entry.organization.selfBookingPageSlug}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/book`;

    await sendWaitlistNotificationEmail({
      to: entry.clientEmail,
      clientName: entry.clientName,
      serviceName: entry.service?.name || undefined,
      preferredDate: entry.preferredDate,
      expiresAt,
      bookingUrl,
      photographerName: entry.organization.name,
      photographerEmail: entry.organization.publicEmail || undefined,
    });

    revalidatePath("/scheduling/waitlist");

    return { success: true, data: { id: entryId } };
  } catch (error) {
    console.error("[Waitlist] Error notifying client:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to notify client" };
  }
}

/**
 * Convert waitlist entry to a booking
 */
export async function convertWaitlistToBooking(
  entryId: string,
  bookingDetails: {
    title: string;
    startTime: Date;
    endTime: Date;
    assignedUserId?: string;
    notes?: string;
  }
): Promise<ActionResult<{ bookingId: string; waitlistId: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    const entry = await prisma.bookingWaitlist.findFirst({
      where: { id: entryId, organizationId },
    });

    if (!entry) {
      return { success: false, error: "Waitlist entry not found" };
    }

    if (entry.status !== "pending" && entry.status !== "notified") {
      return { success: false, error: "Entry cannot be converted (already processed)" };
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        organizationId,
        title: bookingDetails.title,
        clientId: entry.clientId,
        clientName: entry.clientId ? null : entry.clientName,
        clientEmail: entry.clientId ? null : entry.clientEmail,
        clientPhone: entry.clientId ? null : entry.clientPhone,
        serviceId: entry.serviceId,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        assignedUserId: bookingDetails.assignedUserId || null,
        notes: bookingDetails.notes || entry.notes,
        status: "confirmed",
      },
    });

    // Update waitlist entry
    await prisma.bookingWaitlist.update({
      where: { id: entryId },
      data: {
        status: "accepted",
        convertedBookingId: booking.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "booking_created",
        description: `Booking created from waitlist for ${entry.clientName}`,
        bookingId: booking.id,
        clientId: entry.clientId,
      },
    });

    revalidatePath("/scheduling/waitlist");
    revalidatePath("/scheduling");

    return {
      success: true,
      data: { bookingId: booking.id, waitlistId: entryId },
    };
  } catch (error) {
    console.error("[Waitlist] Error converting to booking:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to convert to booking" };
  }
}

/**
 * Process expired waitlist notifications
 */
export async function processExpiredNotifications(): Promise<
  ActionResult<{ expired: number; nextInLine: number }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const now = new Date();

    // Find expired notifications
    const expired = await prisma.bookingWaitlist.findMany({
      where: {
        organizationId,
        status: "notified",
        expiresAt: { lt: now },
      },
    });

    let expiredCount = 0;
    let nextInLineCount = 0;

    for (const entry of expired) {
      // Mark as expired
      await prisma.bookingWaitlist.update({
        where: { id: entry.id },
        data: { status: "expired" },
      });
      expiredCount++;

      // Find next in line for this date
      const next = await prisma.bookingWaitlist.findFirst({
        where: {
          organizationId,
          preferredDate: entry.preferredDate,
          status: "pending",
        },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      });

      if (next) {
        // Notify the next person in line
        await notifyWaitlistClient(next.id);
        nextInLineCount++;
      }
    }

    return {
      success: true,
      data: { expired: expiredCount, nextInLine: nextInLineCount },
    };
  } catch (error) {
    console.error("[Waitlist] Error processing expired:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to process expired notifications" };
  }
}

// =============================================================================
// Analytics
// =============================================================================

interface WaitlistStats {
  totalPending: number;
  totalNotified: number;
  totalConverted: number;
  totalExpired: number;
  conversionRate: number;
  averageWaitDays: number;
  byService: { serviceId: string; serviceName: string; count: number }[];
  byMonth: { month: string; added: number; converted: number }[];
}

/**
 * Get waitlist statistics
 */
export async function getWaitlistStats(
  dateRange?: { startDate: Date; endDate: Date }
): Promise<ActionResult<WaitlistStats>> {
  try {
    const organizationId = await requireOrganizationId();

    const dateFilter = dateRange
      ? {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }
      : {};

    const [byStatus, byService, all] = await Promise.all([
      // Count by status
      prisma.bookingWaitlist.groupBy({
        by: ["status"],
        where: { organizationId, ...dateFilter },
        _count: { id: true },
      }),
      // Count by service
      prisma.bookingWaitlist.groupBy({
        by: ["serviceId"],
        where: { organizationId, ...dateFilter, serviceId: { not: null } },
        _count: { id: true },
      }),
      // All entries for calculations
      prisma.bookingWaitlist.findMany({
        where: { organizationId, ...dateFilter },
        select: {
          status: true,
          createdAt: true,
          notifiedAt: true,
        },
      }),
    ]);

    // Get service names
    const serviceIds = byService.map((s) => s.serviceId).filter((id): id is string => id !== null);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true },
    });
    const serviceMap = new Map(services.map((s) => [s.id, s.name]));

    // Calculate stats
    const statusCounts = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count.id])
    );

    const totalPending = statusCounts["pending"] || 0;
    const totalNotified = statusCounts["notified"] || 0;
    const totalConverted = statusCounts["accepted"] || 0;
    const totalExpired = statusCounts["expired"] || 0;
    const totalProcessed = totalConverted + statusCounts["declined"] || 0 + totalExpired;

    // Average wait time for converted entries
    const convertedEntries = all.filter(
      (e) => e.status === "accepted" && e.notifiedAt
    );
    const avgWaitMs =
      convertedEntries.length > 0
        ? convertedEntries.reduce(
            (sum, e) =>
              sum + (e.notifiedAt!.getTime() - e.createdAt.getTime()),
            0
          ) / convertedEntries.length
        : 0;
    const averageWaitDays = Math.round(avgWaitMs / (1000 * 60 * 60 * 24));

    // Group by month
    const byMonth = new Map<string, { added: number; converted: number }>();
    all.forEach((e) => {
      const month = e.createdAt.toISOString().slice(0, 7); // "2025-01"
      if (!byMonth.has(month)) {
        byMonth.set(month, { added: 0, converted: 0 });
      }
      const data = byMonth.get(month)!;
      data.added++;
      if (e.status === "accepted") {
        data.converted++;
      }
    });

    return {
      success: true,
      data: {
        totalPending,
        totalNotified,
        totalConverted,
        totalExpired,
        conversionRate:
          totalProcessed > 0
            ? Math.round((totalConverted / totalProcessed) * 100)
            : 0,
        averageWaitDays,
        byService: byService.map((s) => ({
          serviceId: s.serviceId!,
          serviceName: serviceMap.get(s.serviceId!) || "Unknown",
          count: s._count.id,
        })),
        byMonth: Array.from(byMonth.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, data]) => ({ month, ...data })),
      },
    };
  } catch (error) {
    console.error("[Waitlist] Error getting stats:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get waitlist stats" };
  }
}

/**
 * Get upcoming availability matches for waitlist entries
 */
export async function getWaitlistMatches(): Promise<
  ActionResult<{
    matches: {
      waitlistEntry: WaitlistEntryData;
      availableSlots: { date: Date; timeSlots: string[] }[];
    }[];
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Get pending waitlist entries
    const pendingEntries = await prisma.bookingWaitlist.findMany({
      where: {
        organizationId,
        status: "pending",
        preferredDate: { gte: new Date() },
      },
      include: {
        service: { select: { name: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: 20,
    });

    // For each entry, check if there are any available slots
    // This is a simplified version - in production, you'd check actual calendar availability
    const matches = await Promise.all(
      pendingEntries.map(async (entry) => {
        // Check for cancellations or openings on the preferred date
        const existingBookings = await prisma.booking.count({
          where: {
            organizationId,
            startTime: {
              gte: new Date(entry.preferredDate.setHours(0, 0, 0, 0)),
              lt: new Date(entry.preferredDate.setHours(23, 59, 59, 999)),
            },
            status: { notIn: ["cancelled"] },
          },
        });

        // Simple availability check (assuming max 8 bookings per day)
        const hasAvailability = existingBookings < 8;

        return {
          waitlistEntry: {
            id: entry.id,
            clientId: entry.clientId,
            clientName: entry.clientName,
            clientEmail: entry.clientEmail,
            clientPhone: entry.clientPhone,
            serviceId: entry.serviceId,
            serviceName: entry.service?.name || null,
            preferredDate: entry.preferredDate,
            alternateDate: entry.alternateDate,
            flexibleDates: entry.flexibleDates,
            notes: entry.notes,
            status: entry.status,
            priority: entry.priority,
            position: entry.position,
            notifiedAt: entry.notifiedAt,
            expiresAt: entry.expiresAt,
            createdAt: entry.createdAt,
          },
          availableSlots: hasAvailability
            ? [
                {
                  date: entry.preferredDate,
                  timeSlots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
                },
              ]
            : [],
        };
      })
    );

    return {
      success: true,
      data: {
        matches: matches.filter((m) => m.availableSlots.length > 0),
      },
    };
  } catch (error) {
    console.error("[Waitlist] Error getting matches:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get waitlist matches" };
  }
}
