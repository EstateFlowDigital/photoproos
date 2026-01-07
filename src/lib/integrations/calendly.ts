/**
 * Calendly API Client
 *
 * Calendly uses Personal Access Token (PAT) authentication.
 * API Reference: https://developer.calendly.com/api-docs
 */

const CALENDLY_API_BASE = "https://api.calendly.com";

// ============================================================================
// TYPES
// ============================================================================

export interface CalendlyUser {
  uri: string;
  name: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url?: string;
  current_organization: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  slug: string;
  duration_minutes: number;
  scheduling_url: string;
  active: boolean;
  description_plain?: string;
  color: string;
  type: "StandardEventType" | "AdhocEventType";
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: "active" | "canceled";
  start_time: string;
  end_time: string;
  event_type: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
  event_memberships: Array<{
    user: string;
  }>;
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  status: "active" | "canceled";
  timezone?: string;
  questions_and_answers?: Array<{
    question: string;
    answer: string;
    position: number;
  }>;
  created_at: string;
  updated_at: string;
  cancel_url?: string;
  reschedule_url?: string;
}

export interface CalendlyWebhookPayload {
  event: "invitee.created" | "invitee.canceled";
  created_at: string;
  created_by: string;
  payload: {
    cancel_url?: string;
    created_at: string;
    email: string;
    event: string;
    name: string;
    new_invitee?: string;
    old_invitee?: string;
    questions_and_answers: Array<{
      question: string;
      answer: string;
      position: number;
    }>;
    reschedule_url?: string;
    rescheduled: boolean;
    routing_form_submission?: string;
    status: "active" | "canceled";
    text_reminder_number?: string;
    timezone: string;
    tracking: {
      utm_campaign?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_content?: string;
      utm_term?: string;
      salesforce_uuid?: string;
    };
    updated_at: string;
    uri: string;
    scheduled_event: {
      uri: string;
      name: string;
      status: "active" | "canceled";
      start_time: string;
      end_time: string;
      event_type: string;
      location?: {
        type: string;
        location?: string;
        join_url?: string;
      };
      invitees_counter: {
        total: number;
        active: number;
        limit: number;
      };
      created_at: string;
      updated_at: string;
      event_memberships: Array<{
        user: string;
      }>;
    };
  };
}

export interface CalendlyWebhookSubscription {
  uri: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  retry_started_at?: string;
  state: "active" | "disabled";
  events: string[];
  scope: "user" | "organization";
  organization: string;
  user?: string;
  creator: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export class CalendlyClient {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${CALENDLY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(
        error.message || error.title || `Calendly API error: ${response.status}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<CalendlyUser> {
    const response = await this.request<{ resource: CalendlyUser }>("/users/me");
    return response.resource;
  }

  /**
   * Get event types for an organization
   */
  async getEventTypes(organizationUri: string): Promise<CalendlyEventType[]> {
    const params = new URLSearchParams({
      organization: organizationUri,
      active: "true",
    });
    const response = await this.request<{ collection: CalendlyEventType[] }>(
      `/event_types?${params.toString()}`
    );
    return response.collection;
  }

  /**
   * Get event types for a specific user
   */
  async getUserEventTypes(userUri: string): Promise<CalendlyEventType[]> {
    const params = new URLSearchParams({
      user: userUri,
      active: "true",
    });
    const response = await this.request<{ collection: CalendlyEventType[] }>(
      `/event_types?${params.toString()}`
    );
    return response.collection;
  }

  /**
   * Get scheduled events for a user
   */
  async getScheduledEvents(
    userUri: string,
    params?: {
      minStartTime?: string;
      maxStartTime?: string;
      status?: "active" | "canceled";
      count?: number;
    }
  ): Promise<CalendlyScheduledEvent[]> {
    const queryParams = new URLSearchParams({ user: userUri });
    if (params?.minStartTime) queryParams.set("min_start_time", params.minStartTime);
    if (params?.maxStartTime) queryParams.set("max_start_time", params.maxStartTime);
    if (params?.status) queryParams.set("status", params.status);
    if (params?.count) queryParams.set("count", String(params.count));

    const response = await this.request<{ collection: CalendlyScheduledEvent[] }>(
      `/scheduled_events?${queryParams.toString()}`
    );
    return response.collection;
  }

  /**
   * Get a specific scheduled event by URI
   */
  async getScheduledEvent(eventUri: string): Promise<CalendlyScheduledEvent> {
    const eventUuid = eventUri.split("/").pop();
    const response = await this.request<{ resource: CalendlyScheduledEvent }>(
      `/scheduled_events/${eventUuid}`
    );
    return response.resource;
  }

  /**
   * Get invitees for a scheduled event
   */
  async getEventInvitees(eventUri: string): Promise<CalendlyInvitee[]> {
    const eventUuid = eventUri.split("/").pop();
    const response = await this.request<{ collection: CalendlyInvitee[] }>(
      `/scheduled_events/${eventUuid}/invitees`
    );
    return response.collection;
  }

  /**
   * Create a webhook subscription
   */
  async createWebhookSubscription(data: {
    url: string;
    events: ("invitee.created" | "invitee.canceled")[];
    organizationUri: string;
    userUri?: string;
    scope: "user" | "organization";
    signingKey?: string;
  }): Promise<CalendlyWebhookSubscription> {
    const body: Record<string, unknown> = {
      url: data.url,
      events: data.events,
      organization: data.organizationUri,
      scope: data.scope,
    };

    if (data.userUri && data.scope === "user") {
      body.user = data.userUri;
    }

    if (data.signingKey) {
      body.signing_key = data.signingKey;
    }

    const response = await this.request<{ resource: CalendlyWebhookSubscription }>(
      "/webhook_subscriptions",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    return response.resource;
  }

  /**
   * List webhook subscriptions
   */
  async listWebhookSubscriptions(
    organizationUri: string,
    scope: "user" | "organization"
  ): Promise<CalendlyWebhookSubscription[]> {
    const params = new URLSearchParams({
      organization: organizationUri,
      scope,
    });
    const response = await this.request<{ collection: CalendlyWebhookSubscription[] }>(
      `/webhook_subscriptions?${params.toString()}`
    );
    return response.collection;
  }

  /**
   * Delete a webhook subscription
   */
  async deleteWebhookSubscription(webhookUri: string): Promise<void> {
    const webhookUuid = webhookUri.split("/").pop();
    await this.request(`/webhook_subscriptions/${webhookUuid}`, {
      method: "DELETE",
    });
  }

  /**
   * Get a specific event type by URI
   */
  async getEventType(eventTypeUri: string): Promise<CalendlyEventType> {
    const eventTypeUuid = eventTypeUri.split("/").pop();
    const response = await this.request<{ resource: CalendlyEventType }>(
      `/event_types/${eventTypeUuid}`
    );
    return response.resource;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Test Calendly connection with an API token
 */
export async function testCalendlyConnection(apiToken: string): Promise<{
  success: boolean;
  error?: string;
  user?: CalendlyUser;
}> {
  try {
    const client = new CalendlyClient(apiToken);
    const user = await client.getCurrentUser();
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verify Calendly webhook signature
 * Calendly uses HMAC-SHA256 for webhook signatures
 */
export function verifyCalendlyWebhookSignature(
  payload: string,
  signature: string,
  signingKey: string
): boolean {
  const crypto = require("crypto");
  const computedSignature = crypto
    .createHmac("sha256", signingKey)
    .update(payload, "utf8")
    .digest("hex");

  // Calendly sends signature in format: v1,<timestamp>,<signature>
  const parts = signature.split(",");
  if (parts.length >= 3) {
    const receivedSignature = parts[2];
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(receivedSignature)
    );
  }

  return false;
}

/**
 * Extract UUID from Calendly URI
 */
export function extractUuidFromUri(uri: string): string {
  const parts = uri.split("/");
  return parts[parts.length - 1];
}
