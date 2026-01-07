"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// TYPES
// ============================================================================

export type MailchimpConfig = {
  id: string;
  organizationId: string;
  datacenter: string;
  audienceId: string | null;
  audienceName: string | null;
  syncEnabled: boolean;
  autoSyncNewClients: boolean;
  defaultOptIn: boolean;
  welcomeEmailTrigger: boolean;
  tagMappings: Record<string, string> | null;
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  syncedContacts: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MailchimpAudience = {
  id: string;
  name: string;
  memberCount: number;
};

export type MailchimpSyncHistoryItem = {
  id: string;
  action: string;
  description: string;
  contactCount: number;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the API key for the organization (decrypted)
 * In production, you should use proper encryption
 */
async function getApiKey(organizationId: string): Promise<string | null> {
  const config = await prisma.mailchimpIntegration.findUnique({
    where: { organizationId },
    select: { apiKey: true, isActive: true },
  });

  if (!config || !config.isActive) {
    return null;
  }

  // In a real implementation, decrypt the API key here
  return config.apiKey;
}

/**
 * Make an authenticated request to the Mailchimp API
 */
async function mailchimpRequest<T>(
  apiKey: string,
  datacenter: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `https://${datacenter}.api.mailchimp.com/3.0${endpoint}`,
    {
      ...options,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Mailchimp API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getMailchimpConfig(): Promise<ActionResult<MailchimpConfig | null>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.mailchimpIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        organizationId: true,
        datacenter: true,
        audienceId: true,
        audienceName: true,
        syncEnabled: true,
        autoSyncNewClients: true,
        defaultOptIn: true,
        welcomeEmailTrigger: true,
        tagMappings: true,
        lastSyncAt: true,
        lastSyncError: true,
        syncedContacts: true,
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
      tagMappings: config.tagMappings as Record<string, string> | null,
    });
  } catch (error) {
    console.error("Error getting Mailchimp config:", error);
    return fail("Failed to get Mailchimp configuration");
  }
}

export async function getMailchimpAudiences(): Promise<ActionResult<MailchimpAudience[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.mailchimpIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { apiKey: true, datacenter: true, isActive: true },
    });

    if (!config || !config.isActive) {
      return fail("Mailchimp not connected");
    }

    interface MailchimpListsResponse {
      lists: {
        id: string;
        name: string;
        stats: { member_count: number };
      }[];
    }

    const response = await mailchimpRequest<MailchimpListsResponse>(
      config.apiKey,
      config.datacenter,
      "/lists"
    );

    const audiences = response.lists.map((list) => ({
      id: list.id,
      name: list.name,
      memberCount: list.stats.member_count,
    }));

    return success(audiences);
  } catch (error) {
    console.error("Error fetching Mailchimp audiences:", error);
    return fail(error instanceof Error ? error.message : "Failed to fetch audiences");
  }
}

export async function getMailchimpSyncHistory(
  limit: number = 20
): Promise<ActionResult<MailchimpSyncHistoryItem[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.mailchimpIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { id: true },
    });

    if (!config) {
      return success([]);
    }

    const history = await prisma.mailchimpSyncHistory.findMany({
      where: { integrationId: config.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return success(history);
  } catch (error) {
    console.error("Error getting sync history:", error);
    return fail("Failed to get sync history");
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Connect to Mailchimp with an API key
 */
export async function connectMailchimp(apiKey: string): Promise<ActionResult<{ datacenter: string }>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    // Validate API key format (should have -dc suffix)
    const dcMatch = apiKey.match(/-([a-z0-9]+)$/);
    if (!dcMatch) {
      return fail("Invalid API key format. Should end with datacenter (e.g., -us21)");
    }

    const datacenter = dcMatch[1];

    // Test the API key by fetching account info
    interface MailchimpAccountResponse {
      account_id: string;
      login_id: string;
      account_name: string;
      email: string;
    }

    try {
      await mailchimpRequest<MailchimpAccountResponse>(
        apiKey,
        datacenter,
        "/"
      );
    } catch (error) {
      return fail("Invalid API key. Please check and try again.");
    }

    // Save or update the integration
    await prisma.mailchimpIntegration.upsert({
      where: { organizationId: auth.organizationId },
      create: {
        organizationId: auth.organizationId,
        apiKey, // In production, encrypt this
        datacenter,
        isActive: true,
      },
      update: {
        apiKey,
        datacenter,
        isActive: true,
        lastSyncError: null,
      },
    });

    // Log the connection
    await prisma.integrationLog.create({
      data: {
        organizationId: auth.organizationId,
        provider: "mailchimp",
        eventType: "connected",
        message: "Connected to Mailchimp",
      },
    });

    revalidatePath("/settings/mailchimp");
    return success({ datacenter });
  } catch (error) {
    console.error("Error connecting Mailchimp:", error);
    return fail("Failed to connect to Mailchimp");
  }
}

/**
 * Disconnect from Mailchimp
 */
export async function disconnectMailchimp(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.mailchimpIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return fail("Mailchimp not connected");
    }

    await prisma.mailchimpIntegration.delete({
      where: { id: config.id },
    });

    // Log the disconnection
    await prisma.integrationLog.create({
      data: {
        organizationId: auth.organizationId,
        provider: "mailchimp",
        eventType: "disconnected",
        message: "Disconnected from Mailchimp",
      },
    });

    revalidatePath("/settings/mailchimp");
    return ok();
  } catch (error) {
    console.error("Error disconnecting Mailchimp:", error);
    return fail("Failed to disconnect");
  }
}

/**
 * Update Mailchimp settings
 */
export async function updateMailchimpSettings(data: {
  audienceId?: string;
  audienceName?: string;
  syncEnabled?: boolean;
  autoSyncNewClients?: boolean;
  defaultOptIn?: boolean;
  welcomeEmailTrigger?: boolean;
  tagMappings?: Record<string, string>;
}): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.mailchimpIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return fail("Mailchimp not connected");
    }

    await prisma.mailchimpIntegration.update({
      where: { id: config.id },
      data: {
        audienceId: data.audienceId,
        audienceName: data.audienceName,
        syncEnabled: data.syncEnabled,
        autoSyncNewClients: data.autoSyncNewClients,
        defaultOptIn: data.defaultOptIn,
        welcomeEmailTrigger: data.welcomeEmailTrigger,
        tagMappings: data.tagMappings,
      },
    });

    revalidatePath("/settings/mailchimp");
    return ok();
  } catch (error) {
    console.error("Error updating Mailchimp settings:", error);
    return fail("Failed to update settings");
  }
}

// ============================================================================
// SYNC OPERATIONS
// ============================================================================

/**
 * Sync all clients to Mailchimp
 */
export async function syncClientsToMailchimp(): Promise<
  ActionResult<{ synced: number; errors: number }>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.mailchimpIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config || !config.isActive) {
      return fail("Mailchimp not connected");
    }

    if (!config.audienceId) {
      return fail("Please select a Mailchimp audience first");
    }

    const apiKey = config.apiKey;

    // Get all clients that opted in to marketing
    const clients = await prisma.client.findMany({
      where: {
        organizationId: auth.organizationId,
        marketingEmailsOptIn: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        company: true,
        phone: true,
        industry: true,
      },
    });

    let synced = 0;
    let errors = 0;

    for (const client of clients) {
      try {
        // Get subscriber hash (MD5 of lowercase email)
        const subscriberHash = await getSubscriberHash(client.email);

        // Build member data
        const memberData = {
          email_address: client.email,
          status: config.defaultOptIn ? "subscribed" : "pending",
          merge_fields: {
            FNAME: client.fullName?.split(" ")[0] || "",
            LNAME: client.fullName?.split(" ").slice(1).join(" ") || "",
            COMPANY: client.company || "",
            PHONE: client.phone || "",
          },
          tags: [] as string[],
        };

        // Add industry tag if mapping exists
        if (config.tagMappings && client.industry) {
          const tagMappings = config.tagMappings as Record<string, string>;
          const tag = tagMappings[client.industry.toLowerCase()];
          if (tag) {
            memberData.tags.push(tag);
          }
        }

        // Upsert the member (PUT creates or updates)
        await mailchimpRequest(
          apiKey,
          config.datacenter,
          `/lists/${config.audienceId}/members/${subscriberHash}`,
          {
            method: "PUT",
            body: JSON.stringify(memberData),
          }
        );

        synced++;
      } catch (error) {
        console.error(`Error syncing client ${client.email}:`, error);
        errors++;
      }
    }

    // Update sync status
    await prisma.mailchimpIntegration.update({
      where: { id: config.id },
      data: {
        lastSyncAt: new Date(),
        syncedContacts: synced,
        lastSyncError: errors > 0 ? `${errors} contact(s) failed to sync` : null,
      },
    });

    // Log the sync
    await prisma.mailchimpSyncHistory.create({
      data: {
        integrationId: config.id,
        action: "synced",
        description: `Synced ${synced} contacts to Mailchimp`,
        contactCount: synced,
        status: errors > 0 ? "partial" : "success",
        errorMessage: errors > 0 ? `${errors} error(s)` : null,
      },
    });

    revalidatePath("/settings/mailchimp");
    return success({ synced, errors });
  } catch (error) {
    console.error("Error syncing to Mailchimp:", error);
    return fail("Failed to sync contacts");
  }
}

/**
 * Sync a single client to Mailchimp (used for auto-sync on client create)
 */
export async function syncSingleClientToMailchimp(
  clientId: string
): Promise<ActionResult<void>> {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { organization: true },
    });

    if (!client) {
      return fail("Client not found");
    }

    const config = await prisma.mailchimpIntegration.findUnique({
      where: { organizationId: client.organizationId },
    });

    if (!config || !config.isActive || !config.autoSyncNewClients) {
      return ok(); // Not an error, just not configured
    }

    if (!config.audienceId) {
      return ok();
    }

    if (!client.marketingEmailsOptIn) {
      return ok(); // Client didn't opt in
    }

    const subscriberHash = await getSubscriberHash(client.email);

    const memberData = {
      email_address: client.email,
      status: config.defaultOptIn ? "subscribed" : "pending",
      merge_fields: {
        FNAME: client.fullName?.split(" ")[0] || "",
        LNAME: client.fullName?.split(" ").slice(1).join(" ") || "",
        COMPANY: client.company || "",
        PHONE: client.phone || "",
      },
      tags: [] as string[],
    };

    // Add industry tag if mapping exists
    if (config.tagMappings && client.industry) {
      const tagMappings = config.tagMappings as Record<string, string>;
      const tag = tagMappings[client.industry.toLowerCase()];
      if (tag) {
        memberData.tags.push(tag);
      }
    }

    await mailchimpRequest(
      config.apiKey,
      config.datacenter,
      `/lists/${config.audienceId}/members/${subscriberHash}`,
      {
        method: "PUT",
        body: JSON.stringify(memberData),
      }
    );

    // Update sync count
    await prisma.mailchimpIntegration.update({
      where: { id: config.id },
      data: {
        syncedContacts: { increment: 1 },
        lastSyncAt: new Date(),
      },
    });

    return ok();
  } catch (error) {
    console.error("Error syncing single client to Mailchimp:", error);
    return fail("Failed to sync client");
  }
}

/**
 * Generate MD5 hash for subscriber email (used by Mailchimp API)
 */
async function getSubscriberHash(email: string): Promise<string> {
  const crypto = await import("crypto");
  return crypto
    .createHash("md5")
    .update(email.toLowerCase())
    .digest("hex");
}
