"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// TYPES
// ============================================================================

export type CalendlyConfig = {
  id: string;
  organizationId: string;
  userUri: string | null;
  userName: string | null;
  userEmail: string | null;
  syncEnabled: boolean;
  autoCreateBookings: boolean;
  notifyOnNewBookings: boolean;
  eventMappings: Record<string, string> | null;
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CalendlyEventType = {
  uri: string;
  name: string;
  slug: string;
  duration: number;
  active: boolean;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Make an authenticated request to the Calendly API
 */
async function calendlyRequest<T>(
  apiToken: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `https://api.calendly.com${endpoint}`,
    {
      ...options,
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `Calendly API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getCalendlyConfig(): Promise<ActionResult<CalendlyConfig | null>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.calendlyIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        organizationId: true,
        userUri: true,
        userName: true,
        userEmail: true,
        syncEnabled: true,
        autoCreateBookings: true,
        notifyOnNewBookings: true,
        eventMappings: true,
        lastSyncAt: true,
        lastSyncError: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!config) {
      return success(null);
    }

    return success({
      ...config,
      eventMappings: config.eventMappings as Record<string, string> | null,
    });
  } catch (error) {
    console.error("Error getting Calendly config:", error);
    return fail("Failed to get Calendly configuration");
  }
}

export async function getCalendlyEventTypes(): Promise<ActionResult<CalendlyEventType[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.calendlyIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { apiToken: true, userUri: true, isActive: true },
    });

    if (!config || !config.isActive || !config.userUri) {
      return fail("Calendly not connected");
    }

    interface CalendlyEventTypesResponse {
      collection: {
        uri: string;
        name: string;
        slug: string;
        duration: number;
        active: boolean;
      }[];
    }

    const response = await calendlyRequest<CalendlyEventTypesResponse>(
      config.apiToken,
      `/event_types?user=${encodeURIComponent(config.userUri)}`
    );

    const eventTypes = response.collection.map((et) => ({
      uri: et.uri,
      name: et.name,
      slug: et.slug,
      duration: et.duration,
      active: et.active,
    }));

    return success(eventTypes);
  } catch (error) {
    console.error("Error fetching Calendly event types:", error);
    return fail(error instanceof Error ? error.message : "Failed to fetch event types");
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Connect to Calendly with an API token
 */
export async function connectCalendly(apiToken: string): Promise<ActionResult<{ userName: string }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    // Validate the token by fetching user info
    interface CalendlyUserResponse {
      resource: {
        uri: string;
        name: string;
        email: string;
        scheduling_url: string;
      };
    }

    let userInfo: CalendlyUserResponse;
    try {
      userInfo = await calendlyRequest<CalendlyUserResponse>(
        apiToken,
        "/users/me"
      );
    } catch (error) {
      return fail("Invalid API token. Please check and try again.");
    }

    // Save or update the integration
    await prisma.calendlyIntegration.upsert({
      where: { organizationId: auth.organizationId },
      create: {
        organizationId: auth.organizationId,
        apiToken,
        userUri: userInfo.resource.uri,
        userName: userInfo.resource.name,
        userEmail: userInfo.resource.email,
        isActive: true,
      },
      update: {
        apiToken,
        userUri: userInfo.resource.uri,
        userName: userInfo.resource.name,
        userEmail: userInfo.resource.email,
        isActive: true,
        lastSyncError: null,
      },
    });

    // Log the connection
    await prisma.integrationLog.create({
      data: {
        organizationId: auth.organizationId,
        provider: "calendly",
        eventType: "connected",
        message: `Connected to Calendly as ${userInfo.resource.name}`,
      },
    });

    revalidatePath("/settings/calendly");
    return success({ userName: userInfo.resource.name });
  } catch (error) {
    console.error("Error connecting Calendly:", error);
    return fail("Failed to connect to Calendly");
  }
}

/**
 * Disconnect from Calendly
 */
export async function disconnectCalendly(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.calendlyIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return fail("Calendly not connected");
    }

    // Delete webhook subscription if exists
    if (config.webhookUri) {
      try {
        await calendlyRequest(
          config.apiToken,
          `/webhook_subscriptions/${config.webhookUri.split("/").pop()}`,
          { method: "DELETE" }
        );
      } catch (error) {
        console.error("Error deleting webhook:", error);
        // Continue even if webhook deletion fails
      }
    }

    await prisma.calendlyIntegration.delete({
      where: { id: config.id },
    });

    // Log the disconnection
    await prisma.integrationLog.create({
      data: {
        organizationId: auth.organizationId,
        provider: "calendly",
        eventType: "disconnected",
        message: "Disconnected from Calendly",
      },
    });

    revalidatePath("/settings/calendly");
    return ok();
  } catch (error) {
    console.error("Error disconnecting Calendly:", error);
    return fail("Failed to disconnect");
  }
}

/**
 * Update Calendly settings
 */
export async function updateCalendlySettings(data: {
  syncEnabled?: boolean;
  autoCreateBookings?: boolean;
  notifyOnNewBookings?: boolean;
  eventMappings?: Record<string, string>;
}): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.calendlyIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return fail("Calendly not connected");
    }

    await prisma.calendlyIntegration.update({
      where: { id: config.id },
      data: {
        syncEnabled: data.syncEnabled,
        autoCreateBookings: data.autoCreateBookings,
        notifyOnNewBookings: data.notifyOnNewBookings,
        eventMappings: data.eventMappings,
      },
    });

    revalidatePath("/settings/calendly");
    return ok();
  } catch (error) {
    console.error("Error updating Calendly settings:", error);
    return fail("Failed to update settings");
  }
}

// ============================================================================
// WEBHOOK MANAGEMENT
// ============================================================================

/**
 * Setup webhook subscription for Calendly events
 */
export async function setupCalendlyWebhook(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.calendlyIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config || !config.isActive || !config.userUri) {
      return fail("Calendly not connected");
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      return fail("App URL not configured");
    }

    // Create webhook subscription
    interface CalendlyWebhookResponse {
      resource: {
        uri: string;
      };
    }

    const webhookResponse = await calendlyRequest<CalendlyWebhookResponse>(
      config.apiToken,
      "/webhook_subscriptions",
      {
        method: "POST",
        body: JSON.stringify({
          url: `${baseUrl}/api/webhooks/calendly`,
          events: [
            "invitee.created",
            "invitee.canceled",
          ],
          organization: config.userUri.replace("/users/", "/organizations/").split("/users")[0],
          user: config.userUri,
          scope: "user",
        }),
      }
    );

    await prisma.calendlyIntegration.update({
      where: { id: config.id },
      data: {
        webhookUri: webhookResponse.resource.uri,
      },
    });

    return ok();
  } catch (error) {
    console.error("Error setting up Calendly webhook:", error);
    return fail(error instanceof Error ? error.message : "Failed to setup webhook");
  }
}

// ============================================================================
// BOOKING IMPORT
// ============================================================================

/**
 * Process a Calendly webhook event and create a booking
 */
export async function processCalendlyEvent(
  organizationId: string,
  eventType: string,
  payload: {
    uri: string;
    email: string;
    name: string;
    event: string;
    scheduled_event: {
      uri: string;
      name: string;
      start_time: string;
      end_time: string;
      event_type: string;
      location?: {
        type: string;
        location?: string;
      };
    };
    questions_and_answers?: {
      question: string;
      answer: string;
    }[];
  }
): Promise<ActionResult<{ bookingId: string }>> {
  try {
    const config = await prisma.calendlyIntegration.findUnique({
      where: { organizationId },
    });

    if (!config || !config.isActive || !config.autoCreateBookings) {
      return ok() as ActionResult<{ bookingId: string }>;
    }

    if (eventType === "invitee.canceled") {
      // Handle cancellation - find and update the booking
      const existingBooking = await prisma.booking.findFirst({
        where: {
          organizationId,
          externalId: payload.scheduled_event.uri,
        },
      });

      if (existingBooking) {
        await prisma.booking.update({
          where: { id: existingBooking.id },
          data: { status: "cancelled" },
        });
      }

      return ok() as ActionResult<{ bookingId: string }>;
    }

    // Find or create the client
    let client = await prisma.client.findFirst({
      where: {
        organizationId,
        email: payload.email.toLowerCase(),
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          organizationId,
          email: payload.email.toLowerCase(),
          fullName: payload.name,
        },
      });
    }

    // Get service from event mapping
    let serviceId: string | null = null;
    if (config.eventMappings) {
      const mappings = config.eventMappings as Record<string, string>;
      serviceId = mappings[payload.scheduled_event.event_type] || null;
    }

    // Build notes from questions and answers
    let notes = "";
    if (payload.questions_and_answers && payload.questions_and_answers.length > 0) {
      notes = payload.questions_and_answers
        .map((qa) => `${qa.question}: ${qa.answer}`)
        .join("\n");
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        organizationId,
        clientId: client.id,
        serviceId,
        title: payload.scheduled_event.name,
        startTime: new Date(payload.scheduled_event.start_time),
        endTime: new Date(payload.scheduled_event.end_time),
        status: "confirmed",
        notes,
        externalId: payload.scheduled_event.uri,
        externalSource: "calendly",
        location: payload.scheduled_event.location?.location || null,
      },
    });

    // Update last sync
    await prisma.calendlyIntegration.update({
      where: { id: config.id },
      data: { lastSyncAt: new Date() },
    });

    return success({ bookingId: booking.id });
  } catch (error) {
    console.error("Error processing Calendly event:", error);
    return fail("Failed to process Calendly event");
  }
}
