"use server";

/**
 * Calendar Feed Management Actions
 *
 * Manages iCal feed tokens for external calendar subscriptions.
 * Allows users to subscribe to their bookings from Google Calendar,
 * Apple Calendar, Outlook, and other calendar applications.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

// =============================================================================
// Calendar Feed Management
// =============================================================================

export interface CalendarFeedInfo {
  id: string;
  name: string;
  token: string;
  feedUrl: string;
  isActive: boolean;
  userId: string | null;
  userName: string | null;
  timezone: string;
  lastAccessedAt: Date | null;
  accessCount: number;
  createdAt: Date;
}

/**
 * Get all calendar feeds for the organization
 */
export async function getCalendarFeeds(): Promise<
  ActionResult<CalendarFeedInfo[]>
> {
  try {
    const organizationId = await getOrganizationId();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";

    const feeds = await prisma.calendarFeed.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: feeds.map((feed) => ({
        id: feed.id,
        name: feed.name,
        token: feed.token,
        feedUrl: `${baseUrl}/api/calendar/ical/${feed.token}`,
        isActive: feed.isActive,
        userId: feed.userId,
        userName: feed.user?.fullName || null,
        timezone: feed.timezone,
        lastAccessedAt: feed.lastAccessedAt,
        accessCount: feed.accessCount,
        createdAt: feed.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching calendar feeds:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch calendar feeds" };
  }
}

/**
 * Create a new calendar feed
 */
export async function createCalendarFeed(params: {
  name?: string;
  userId?: string;
  timezone?: string;
}): Promise<ActionResult<CalendarFeedInfo>> {
  try {
    const organizationId = await getOrganizationId();
    const auth = await getAuthContext();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";

    const { name = "Bookings", userId, timezone = "America/New_York" } = params;

    // Generate a unique token
    const token = nanoid(32);

    const feed = await prisma.calendarFeed.create({
      data: {
        organizationId,
        userId: userId || null,
        name,
        token,
        timezone,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    revalidatePath("/settings/calendar");

    return {
      success: true,
      data: {
        id: feed.id,
        name: feed.name,
        token: feed.token,
        feedUrl: `${baseUrl}/api/calendar/ical/${feed.token}`,
        isActive: feed.isActive,
        userId: feed.userId,
        userName: feed.user?.fullName || null,
        timezone: feed.timezone,
        lastAccessedAt: feed.lastAccessedAt,
        accessCount: feed.accessCount,
        createdAt: feed.createdAt,
      },
    };
  } catch (error) {
    console.error("Error creating calendar feed:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create calendar feed" };
  }
}

/**
 * Regenerate a calendar feed token (for security)
 */
export async function regenerateCalendarFeedToken(
  feedId: string
): Promise<ActionResult<{ token: string; feedUrl: string }>> {
  try {
    const organizationId = await getOrganizationId();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";

    // Verify ownership
    const existing = await prisma.calendarFeed.findFirst({
      where: { id: feedId, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Calendar feed not found" };
    }

    // Generate new token
    const newToken = nanoid(32);

    await prisma.calendarFeed.update({
      where: { id: feedId },
      data: { token: newToken },
    });

    revalidatePath("/settings/calendar");

    return {
      success: true,
      data: {
        token: newToken,
        feedUrl: `${baseUrl}/api/calendar/ical/${newToken}`,
      },
    };
  } catch (error) {
    console.error("Error regenerating calendar feed token:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to regenerate token" };
  }
}

/**
 * Update calendar feed settings
 */
export async function updateCalendarFeed(
  feedId: string,
  params: {
    name?: string;
    timezone?: string;
    isActive?: boolean;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify ownership
    const existing = await prisma.calendarFeed.findFirst({
      where: { id: feedId, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Calendar feed not found" };
    }

    await prisma.calendarFeed.update({
      where: { id: feedId },
      data: {
        ...(params.name !== undefined && { name: params.name }),
        ...(params.timezone !== undefined && { timezone: params.timezone }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
      },
    });

    revalidatePath("/settings/calendar");

    return { success: true, data: { id: feedId } };
  } catch (error) {
    console.error("Error updating calendar feed:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update calendar feed" };
  }
}

/**
 * Delete a calendar feed
 */
export async function deleteCalendarFeed(
  feedId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify ownership
    const existing = await prisma.calendarFeed.findFirst({
      where: { id: feedId, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Calendar feed not found" };
    }

    await prisma.calendarFeed.delete({
      where: { id: feedId },
    });

    revalidatePath("/settings/calendar");

    return { success: true, data: { id: feedId } };
  } catch (error) {
    console.error("Error deleting calendar feed:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete calendar feed" };
  }
}

/**
 * Create a personal calendar feed for the current user
 */
export async function createMyCalendarFeed(params?: {
  name?: string;
  timezone?: string;
}): Promise<ActionResult<CalendarFeedInfo>> {
  try {
    const organizationId = await getOrganizationId();
    const auth = await getAuthContext();

    if (!auth?.userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user ID from org membership
    const user = await prisma.user.findFirst({
      where: { clerkUserId: auth.userId },
      select: { id: true, fullName: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if user already has a feed
    const existingFeed = await prisma.calendarFeed.findFirst({
      where: {
        organizationId,
        userId: user.id,
      },
    });

    if (existingFeed) {
      return { success: false, error: "You already have a calendar feed. Delete it first to create a new one." };
    }

    return createCalendarFeed({
      name: params?.name || `${user.fullName || "My"} Bookings`,
      userId: user.id,
      timezone: params?.timezone,
    });
  } catch (error) {
    console.error("Error creating personal calendar feed:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create personal calendar feed" };
  }
}

/**
 * Get the current user's calendar feed
 */
export async function getMyCalendarFeed(): Promise<
  ActionResult<CalendarFeedInfo | null>
> {
  try {
    const organizationId = await getOrganizationId();
    const auth = await getAuthContext();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";

    if (!auth?.userId) {
      return { success: false, error: "User not authenticated" };
    }

    const user = await prisma.user.findFirst({
      where: { clerkUserId: auth.userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const feed = await prisma.calendarFeed.findFirst({
      where: {
        organizationId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!feed) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: feed.id,
        name: feed.name,
        token: feed.token,
        feedUrl: `${baseUrl}/api/calendar/ical/${feed.token}`,
        isActive: feed.isActive,
        userId: feed.userId,
        userName: feed.user?.fullName || null,
        timezone: feed.timezone,
        lastAccessedAt: feed.lastAccessedAt,
        accessCount: feed.accessCount,
        createdAt: feed.createdAt,
      },
    };
  } catch (error) {
    console.error("Error getting personal calendar feed:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get personal calendar feed" };
  }
}
