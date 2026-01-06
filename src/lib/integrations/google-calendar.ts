"use server";

import { google, calendar_v3 } from "googleapis";
import { prisma } from "@/lib/db";
import { requireOrganizationId, requireUserId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";
import { ok, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

interface CalendarListItem {
  id: string;
  summary: string;
  primary: boolean;
  backgroundColor: string;
}

interface SyncResult {
  imported: number;
  exported: number;
  errors: string[];
}

// =============================================================================
// OAuth Configuration
// =============================================================================

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
  );
}

// =============================================================================
// OAuth Flow
// =============================================================================

/**
 * Generate the Google OAuth authorization URL
 */
export async function getGoogleAuthUrl(): Promise<ActionResult<{ url: string }>> {
  try {
    const oauth2Client = getOAuth2Client();

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent", // Force consent screen to get refresh token
    });

    return { success: true, data: { url } };
  } catch (error) {
    console.error("[GoogleCalendar] Error generating auth URL:", error);
    return { success: false, error: "Failed to generate authorization URL" };
  }
}

/**
 * Exchange authorization code for tokens and save the integration
 */
export async function handleGoogleCallback(
  code: string
): Promise<ActionResult<{ integrationId: string }>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const oauth2Client = getOAuth2Client();

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.access_token) {
      return { success: false, error: "Failed to obtain access token" };
    }

    // Get user's primary calendar
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();

    const primaryCalendar = calendarList.data.items?.find((cal) => cal.primary);
    if (!primaryCalendar || !primaryCalendar.id) {
      return { success: false, error: "Could not find primary calendar" };
    }

    // Check if integration already exists
    const existing = await prisma.calendarIntegration.findFirst({
      where: {
        organizationId,
        provider: "google",
        externalId: primaryCalendar.id,
      },
    });

    let integrationId: string;

    if (existing) {
      // Update existing integration
      const updated = await prisma.calendarIntegration.update({
        where: { id: existing.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existing.refreshToken,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          name: primaryCalendar.summary || "Primary Calendar",
          color: primaryCalendar.backgroundColor || "#3b82f6",
        },
      });
      integrationId = updated.id;
    } else {
      // Create new integration
      const created = await prisma.calendarIntegration.create({
        data: {
          organizationId,
          userId,
          provider: "google",
          externalId: primaryCalendar.id,
          name: primaryCalendar.summary || "Primary Calendar",
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          color: primaryCalendar.backgroundColor || "#3b82f6",
          syncEnabled: true,
          syncDirection: "both",
        },
      });
      integrationId = created.id;
    }

    revalidatePath("/settings/integrations");

    return { success: true, data: { integrationId } };
  } catch (error) {
    console.error("[GoogleCalendar] Error handling callback:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to connect Google Calendar" };
  }
}

/**
 * Disconnect Google Calendar integration
 */
export async function disconnectGoogleCalendar(
  integrationId: string
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const integration = await prisma.calendarIntegration.findFirst({
      where: { id: integrationId, organizationId },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    // Delete synced events
    await prisma.calendarEvent.deleteMany({
      where: { calendarIntegrationId: integrationId },
    });

    // Delete integration
    await prisma.calendarIntegration.delete({
      where: { id: integrationId },
    });

    revalidatePath("/settings/integrations");

    return ok();
  } catch (error) {
    console.error("[GoogleCalendar] Error disconnecting:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to disconnect calendar" };
  }
}

// =============================================================================
// Token Management
// =============================================================================

/**
 * Get a valid OAuth client for an integration, refreshing tokens if needed
 */
async function getAuthenticatedClient(integrationId: string) {
  const integration = await prisma.calendarIntegration.findUnique({
    where: { id: integrationId },
  });

  if (!integration) {
    throw new Error("Integration not found");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
    expiry_date: integration.tokenExpiresAt?.getTime(),
  });

  // Check if token needs refresh
  if (integration.tokenExpiresAt && integration.tokenExpiresAt < new Date()) {
    if (!integration.refreshToken) {
      throw new Error("Token expired and no refresh token available");
    }

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update stored tokens
    await prisma.calendarIntegration.update({
      where: { id: integrationId },
      data: {
        accessToken: credentials.access_token!,
        tokenExpiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      },
    });

    oauth2Client.setCredentials(credentials);
  }

  return { oauth2Client, integration };
}

// =============================================================================
// Calendar Operations
// =============================================================================

/**
 * Get list of user's calendars
 */
export async function getGoogleCalendars(
  integrationId: string
): Promise<ActionResult<{ calendars: CalendarListItem[] }>> {
  try {
    const organizationId = await requireOrganizationId();

    const integration = await prisma.calendarIntegration.findFirst({
      where: { id: integrationId, organizationId },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    const { oauth2Client } = await getAuthenticatedClient(integrationId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.calendarList.list();
    const calendars: CalendarListItem[] = (response.data.items || []).map((cal) => ({
      id: cal.id!,
      summary: cal.summary || "Unnamed Calendar",
      primary: cal.primary || false,
      backgroundColor: cal.backgroundColor || "#3b82f6",
    }));

    return { success: true, data: { calendars } };
  } catch (error) {
    console.error("[GoogleCalendar] Error fetching calendars:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch calendars" };
  }
}

/**
 * Sync events between PhotoProOS and Google Calendar
 */
export async function syncGoogleCalendar(
  integrationId: string
): Promise<ActionResult<SyncResult>> {
  try {
    const organizationId = await requireOrganizationId();

    const integration = await prisma.calendarIntegration.findFirst({
      where: { id: integrationId, organizationId },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    if (!integration.syncEnabled) {
      return { success: false, error: "Sync is disabled for this calendar" };
    }

    const { oauth2Client } = await getAuthenticatedClient(integrationId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

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
        const response = await calendar.events.list({
          calendarId: integration.externalId,
          timeMin: now.toISOString(),
          timeMax: syncEnd.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 250,
        });

        const googleEvents = response.data.items || [];

        for (const event of googleEvents) {
          if (!event.id || !event.start) continue;

          try {
            // Check if event already exists
            const existing = await prisma.calendarEvent.findFirst({
              where: {
                calendarIntegrationId: integrationId,
                externalEventId: event.id,
              },
            });

            const startTime = event.start.dateTime
              ? new Date(event.start.dateTime)
              : new Date(event.start.date!);
            const endTime = event.end?.dateTime
              ? new Date(event.end.dateTime)
              : event.end?.date
                ? new Date(event.end.date)
                : new Date(startTime.getTime() + 60 * 60 * 1000);

            if (existing) {
              // Update existing event if changed
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
              // Create new synced event
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
          } catch (e) {
            result.errors.push(`Failed to import event: ${event.summary}`);
          }
        }
      } catch (e) {
        result.errors.push("Failed to fetch events from Google Calendar");
      }
    }

    // EXPORT: Send PhotoProOS bookings to Google Calendar
    if (integration.syncDirection === "export_only" || integration.syncDirection === "both") {
      try {
        // Get bookings that aren't yet synced
        const bookings = await prisma.booking.findMany({
          where: {
            organizationId,
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
            // Check if already synced
            const existingSync = await prisma.calendarEvent.findFirst({
              where: {
                calendarIntegrationId: integrationId,
                bookingId: booking.id,
              },
            });

            const eventData: calendar_v3.Schema$Event = {
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
              await calendar.events.update({
                calendarId: integration.externalId,
                eventId: existingSync.externalEventId,
                requestBody: eventData,
              });
            } else {
              // Create new event
              const created = await calendar.events.insert({
                calendarId: integration.externalId,
                requestBody: eventData,
              });

              if (created.data.id) {
                await prisma.calendarEvent.create({
                  data: {
                    calendarIntegrationId: integrationId,
                    externalEventId: created.data.id,
                    title: booking.title,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    bookingId: booking.id,
                    etag: created.data.etag,
                  },
                });
                result.exported++;
              }
            }
          } catch (e) {
            result.errors.push(`Failed to export booking: ${booking.title}`);
          }
        }
      } catch (e) {
        result.errors.push("Failed to export bookings to Google Calendar");
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

    revalidatePath("/scheduling");

    return { success: true, data: result };
  } catch (error) {
    console.error("[GoogleCalendar] Error syncing:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to sync calendar" };
  }
}

// =============================================================================
// Event Management
// =============================================================================

/**
 * Create an event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  integrationId: string,
  event: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    allDay?: boolean;
    bookingId?: string;
  }
): Promise<ActionResult<{ eventId: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    const integration = await prisma.calendarIntegration.findFirst({
      where: { id: integrationId, organizationId },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    const { oauth2Client } = await getAuthenticatedClient(integrationId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventData: calendar_v3.Schema$Event = {
      summary: event.title,
      description: event.description,
      location: event.location,
    };

    if (event.allDay) {
      eventData.start = { date: event.startTime.toISOString().split("T")[0] };
      eventData.end = { date: event.endTime.toISOString().split("T")[0] };
    } else {
      eventData.start = { dateTime: event.startTime.toISOString() };
      eventData.end = { dateTime: event.endTime.toISOString() };
    }

    const response = await calendar.events.insert({
      calendarId: integration.externalId,
      requestBody: eventData,
    });

    if (!response.data.id) {
      return { success: false, error: "Failed to create event" };
    }

    // Store sync record
    await prisma.calendarEvent.create({
      data: {
        calendarIntegrationId: integrationId,
        externalEventId: response.data.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        allDay: event.allDay || false,
        location: event.location,
        bookingId: event.bookingId,
        etag: response.data.etag,
      },
    });

    return { success: true, data: { eventId: response.data.id } };
  } catch (error) {
    console.error("[GoogleCalendar] Error creating event:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create calendar event" };
  }
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  integrationId: string,
  externalEventId: string
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const integration = await prisma.calendarIntegration.findFirst({
      where: { id: integrationId, organizationId },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    const { oauth2Client } = await getAuthenticatedClient(integrationId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: integration.externalId,
      eventId: externalEventId,
    });

    // Remove sync record
    await prisma.calendarEvent.deleteMany({
      where: {
        calendarIntegrationId: integrationId,
        externalEventId,
      },
    });

    return ok();
  } catch (error) {
    console.error("[GoogleCalendar] Error deleting event:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete calendar event" };
  }
}

// =============================================================================
// Integration Management
// =============================================================================

/**
 * Get all calendar integrations for the organization
 */
export async function getCalendarIntegrations() {
  try {
    const organizationId = await requireOrganizationId();

    const integrations = await prisma.calendarIntegration.findMany({
      where: { organizationId },
      select: {
        id: true,
        provider: true,
        name: true,
        color: true,
        syncEnabled: true,
        syncDirection: true,
        lastSyncAt: true,
        lastSyncError: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, data: integrations };
  } catch (error) {
    console.error("[GoogleCalendar] Error fetching integrations:", error);
    return { success: false as const, error: "Failed to fetch integrations" };
  }
}

/**
 * Update integration settings
 */
export async function updateCalendarIntegration(
  integrationId: string,
  settings: {
    syncEnabled?: boolean;
    syncDirection?: "import_only" | "export_only" | "both";
    color?: string;
  }
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const integration = await prisma.calendarIntegration.findFirst({
      where: { id: integrationId, organizationId },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    await prisma.calendarIntegration.update({
      where: { id: integrationId },
      data: {
        ...(settings.syncEnabled !== undefined && { syncEnabled: settings.syncEnabled }),
        ...(settings.syncDirection && { syncDirection: settings.syncDirection }),
        ...(settings.color && { color: settings.color }),
      },
    });

    revalidatePath("/settings/integrations");

    return ok();
  } catch (error) {
    console.error("[GoogleCalendar] Error updating integration:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update integration settings" };
  }
}

/**
 * Get synced events for display in the calendar
 */
export async function getSyncedCalendarEvents(
  fromDate: Date,
  toDate: Date
) {
  try {
    const organizationId = await requireOrganizationId();

    const integrations = await prisma.calendarIntegration.findMany({
      where: { organizationId, syncEnabled: true },
      select: { id: true, name: true, color: true, provider: true },
    });

    const integrationIds = integrations.map((i) => i.id);

    const events = await prisma.calendarEvent.findMany({
      where: {
        calendarIntegrationId: { in: integrationIds },
        startTime: { gte: fromDate },
        endTime: { lte: toDate },
      },
      orderBy: { startTime: "asc" },
    });

    // Map integration info to events
    const integrationMap = new Map(integrations.map((i) => [i.id, i]));

    const enrichedEvents = events.map((event) => ({
      ...event,
      calendar: integrationMap.get(event.calendarIntegrationId),
    }));

    return { success: true as const, data: enrichedEvents };
  } catch (error) {
    console.error("[GoogleCalendar] Error fetching synced events:", error);
    return { success: false as const, error: "Failed to fetch synced events" };
  }
}
