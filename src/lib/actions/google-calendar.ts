"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import type { SyncDirection } from "@prisma/client";
import type { ActionResult } from "@/lib/types/action-result";

export interface GoogleCalendarConfig {
  id: string;
  organizationId: string;
  userId: string | null;
  externalId: string;
  name: string;
  email?: string;
  syncEnabled: boolean;
  syncDirection: SyncDirection;
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarListItem {
  id: string;
  summary: string;
  primary: boolean;
  backgroundColor: string;
  accessRole: string;
  selected: boolean;
}

export interface SyncResult {
  imported: number;
  exported: number;
  errors: string[];
}

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * Refresh the Google access token using the refresh token
 */
async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: Date } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[GoogleCalendar] Credentials not configured for token refresh");
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GoogleCalendar] Failed to refresh token:", errorText);
      return null;
    }

    const tokens: GoogleTokenResponse = await response.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    return {
      accessToken: tokens.access_token,
      expiresAt,
    };
  } catch (error) {
    console.error("[GoogleCalendar] Error refreshing token:", error);
    return null;
  }
}

/**
 * Get a valid access token for the integration, refreshing if necessary.
 */
async function getValidAccessToken(
  integrationId: string
): Promise<string | null> {
  const integration = await prisma.calendarIntegration.findUnique({
    where: { id: integrationId },
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      tokenExpiresAt: true,
    },
  });

  if (!integration) {
    return null;
  }

  // Check if token is still valid (with 5 min buffer)
  const expiryBuffer = 5 * 60 * 1000;
  if (
    integration.tokenExpiresAt &&
    integration.tokenExpiresAt.getTime() > Date.now() + expiryBuffer
  ) {
    return integration.accessToken;
  }

  // Token expired or expiring soon - try to refresh
  if (!integration.refreshToken) {
    console.error("[GoogleCalendar] No refresh token available");
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncError: "Session expired. Please reconnect to Google Calendar.",
      },
    });
    return null;
  }

  // Attempt to refresh the token
  const newTokens = await refreshGoogleToken(integration.refreshToken);
  if (!newTokens) {
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncError: "Failed to refresh session. Please reconnect to Google Calendar.",
      },
    });
    return null;
  }

  // Update database with new tokens
  await prisma.calendarIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: newTokens.accessToken,
      tokenExpiresAt: newTokens.expiresAt,
      lastSyncError: null,
    },
  });

  return newTokens.accessToken;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get the Google Calendar configuration for the organization
 */
export async function getGoogleCalendarConfig(): Promise<
  ActionResult<GoogleCalendarConfig | null>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const config = await prisma.calendarIntegration.findFirst({
      where: {
        organizationId: auth.organizationId,
        provider: "google",
      },
      select: {
        id: true,
        organizationId: true,
        userId: true,
        externalId: true,
        name: true,
        syncEnabled: true,
        syncDirection: true,
        lastSyncAt: true,
        lastSyncError: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: config };
  } catch (error) {
    console.error("[GoogleCalendar] Error getting config:", error);
    return { success: false, error: "Failed to get Google Calendar configuration" };
  }
}

/**
 * Get list of user's Google calendars
 */
export async function getGoogleCalendars(
  integrationId: string
): Promise<ActionResult<CalendarListItem[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const accessToken = await getValidAccessToken(integrationId);
    if (!accessToken) {
      return { success: false, error: "Session expired. Please reconnect." };
    }

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch calendars" };
    }

    const data = await response.json();
    const calendars: CalendarListItem[] = (data.items || []).map(
      (cal: { id: string; summary: string; primary?: boolean; backgroundColor?: string; accessRole: string }) => ({
        id: cal.id,
        summary: cal.summary || "Unnamed Calendar",
        primary: cal.primary || false,
        backgroundColor: cal.backgroundColor || "#4285F4",
        accessRole: cal.accessRole,
        selected: cal.primary || false,
      })
    );

    return { success: true, data: calendars };
  } catch (error) {
    console.error("[GoogleCalendar] Error fetching calendars:", error);
    return { success: false, error: "Failed to fetch calendars" };
  }
}

/**
 * Test the Google Calendar connection
 */
export async function testGoogleCalendarConnection(): Promise<
  ActionResult<{ email: string; name: string }>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const integration = await prisma.calendarIntegration.findFirst({
      where: {
        organizationId: auth.organizationId,
        provider: "google",
      },
    });

    if (!integration) {
      return { success: false, error: "No Google Calendar connected" };
    }

    const accessToken = await getValidAccessToken(integration.id);
    if (!accessToken) {
      return { success: false, error: "Session expired. Please reconnect." };
    }

    // Test by fetching user info
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: "Connection test failed" };
    }

    const userInfo = await response.json();
    return {
      success: true,
      data: {
        email: userInfo.email,
        name: userInfo.name || userInfo.email,
      },
    };
  } catch (error) {
    console.error("[GoogleCalendar] Error testing connection:", error);
    return { success: false, error: "Connection test failed" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Update Google Calendar settings
 */
export async function updateGoogleCalendarSettings(data: {
  integrationId: string;
  syncEnabled?: boolean;
  syncDirection?: SyncDirection;
  color?: string;
}): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const integration = await prisma.calendarIntegration.findFirst({
      where: {
        id: data.integrationId,
        organizationId: auth.organizationId,
      },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    await prisma.calendarIntegration.update({
      where: { id: data.integrationId },
      data: {
        ...(data.syncEnabled !== undefined && { syncEnabled: data.syncEnabled }),
        ...(data.syncDirection && { syncDirection: data.syncDirection }),
        ...(data.color && { color: data.color }),
      },
    });

    revalidatePath("/settings/calendar");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[GoogleCalendar] Error updating settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

/**
 * Disconnect Google Calendar
 */
export async function disconnectGoogleCalendar(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const integration = await prisma.calendarIntegration.findFirst({
      where: {
        organizationId: auth.organizationId,
        provider: "google",
      },
    });

    if (!integration) {
      return { success: false, error: "No Google Calendar connected" };
    }

    // Delete synced events
    await prisma.calendarEvent.deleteMany({
      where: { calendarIntegrationId: integration.id },
    });

    // Delete integration
    await prisma.calendarIntegration.delete({
      where: { id: integration.id },
    });

    revalidatePath("/settings/calendar");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[GoogleCalendar] Error disconnecting:", error);
    return { success: false, error: "Failed to disconnect" };
  }
}

/**
 * Sync Google Calendar events
 */
export async function syncGoogleCalendar(
  integrationId: string
): Promise<ActionResult<SyncResult>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return { success: false, error: "Unauthorized" };
    }

    const integration = await prisma.calendarIntegration.findFirst({
      where: {
        id: integrationId,
        organizationId: auth.organizationId,
      },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    if (!integration.syncEnabled) {
      return { success: false, error: "Sync is disabled" };
    }

    const accessToken = await getValidAccessToken(integrationId);
    if (!accessToken) {
      return { success: false, error: "Session expired. Please reconnect." };
    }

    const result: SyncResult = {
      imported: 0,
      exported: 0,
      errors: [],
    };

    // Define sync window (next 90 days)
    const now = new Date();
    const syncEnd = new Date();
    syncEnd.setDate(now.getDate() + 90);

    // IMPORT: Get events from Google Calendar
    if (integration.syncDirection === "import_only" || integration.syncDirection === "both") {
      try {
        const params = new URLSearchParams({
          timeMin: now.toISOString(),
          timeMax: syncEnd.toISOString(),
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "250",
        });

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(integration.externalId)}/events?${params}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const events = data.items || [];

          for (const event of events) {
            if (!event.id || !event.start) continue;

            try {
              const existing = await prisma.calendarEvent.findFirst({
                where: {
                  calendarIntegrationId: integrationId,
                  externalEventId: event.id,
                },
              });

              const startTime = event.start.dateTime
                ? new Date(event.start.dateTime)
                : new Date(event.start.date);
              const endTime = event.end?.dateTime
                ? new Date(event.end.dateTime)
                : event.end?.date
                  ? new Date(event.end.date)
                  : new Date(startTime.getTime() + 60 * 60 * 1000);

              if (existing) {
                if (existing.etag !== event.etag) {
                  await prisma.calendarEvent.update({
                    where: { id: existing.id },
                    data: {
                      title: event.summary || "Untitled Event",
                      description: event.description,
                      startTime,
                      endTime,
                      allDay: !event.start.dateTime,
                      location: event.location,
                      etag: event.etag,
                      lastSyncedAt: new Date(),
                    },
                  });
                  result.imported++;
                }
              } else {
                await prisma.calendarEvent.create({
                  data: {
                    calendarIntegrationId: integrationId,
                    externalEventId: event.id,
                    title: event.summary || "Untitled Event",
                    description: event.description,
                    startTime,
                    endTime,
                    allDay: !event.start.dateTime,
                    location: event.location,
                    etag: event.etag,
                  },
                });
                result.imported++;
              }
            } catch {
              result.errors.push(`Failed to import: ${event.summary}`);
            }
          }
        }
      } catch {
        result.errors.push("Failed to fetch events from Google Calendar");
      }
    }

    // EXPORT: Send PhotoProOS bookings to Google Calendar
    if (integration.syncDirection === "export_only" || integration.syncDirection === "both") {
      try {
        const bookings = await prisma.booking.findMany({
          where: {
            organizationId: auth.organizationId,
            startTime: { gte: now },
            status: { in: ["pending", "confirmed"] },
          },
          include: {
            client: { select: { fullName: true, email: true } },
            service: { select: { name: true } },
          },
        });

        for (const booking of bookings) {
          try {
            const existingSync = await prisma.calendarEvent.findFirst({
              where: {
                calendarIntegrationId: integrationId,
                bookingId: booking.id,
              },
            });

            const eventBody = {
              summary: booking.title,
              description: [
                booking.description,
                booking.client ? `Client: ${booking.client.fullName || booking.client.email}` : null,
                booking.service ? `Service: ${booking.service.name}` : null,
                booking.notes,
              ]
                .filter(Boolean)
                .join("\n\n"),
              start: {
                dateTime: booking.startTime.toISOString(),
                timeZone: booking.timezone,
              },
              end: {
                dateTime: booking.endTime.toISOString(),
                timeZone: booking.timezone,
              },
              location: booking.location || undefined,
            };

            if (existingSync) {
              // Update existing event
              await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(integration.externalId)}/events/${existingSync.externalEventId}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(eventBody),
                }
              );
            } else {
              // Create new event
              const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(integration.externalId)}/events`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(eventBody),
                }
              );

              if (response.ok) {
                const created = await response.json();
                await prisma.calendarEvent.create({
                  data: {
                    calendarIntegrationId: integrationId,
                    externalEventId: created.id,
                    title: booking.title,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    bookingId: booking.id,
                    etag: created.etag,
                  },
                });
                result.exported++;
              }
            }
          } catch {
            result.errors.push(`Failed to export: ${booking.title}`);
          }
        }
      } catch {
        result.errors.push("Failed to export bookings");
      }
    }

    // Update last sync time
    await prisma.calendarIntegration.update({
      where: { id: integrationId },
      data: {
        lastSyncAt: new Date(),
        lastSyncError: result.errors.length > 0 ? result.errors.join("; ") : null,
      },
    });

    revalidatePath("/settings/calendar");
    revalidatePath("/scheduling");

    return { success: true, data: result };
  } catch (error) {
    console.error("[GoogleCalendar] Error syncing:", error);
    return { success: false, error: "Failed to sync calendar" };
  }
}
