"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// TYPES
// ============================================================================

interface QuickBooksTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  x_refresh_token_expires_in: number;
}

// Note: Types moved to avoid "use server" export restrictions.
// For external use, define these types in a separate types file (e.g., @/lib/types/quickbooks.ts)
type QuickBooksConfig = {
  id: string;
  organizationId: string;
  realmId: string;
  companyName: string;
  syncEnabled: boolean;
  autoSyncInvoices: boolean;
  autoCreateCustomers: boolean;
  syncFrequency: string;
  defaultIncomeAccount: string | null;
  defaultExpenseAccount: string | null;
  taxEnabled: boolean;
  defaultTaxCodeId: string | null;
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type QuickBooksSyncHistoryItem = {
  id: string;
  syncType: string;
  action: string;
  entityType: string;
  entityId: string | null;
  qbEntityId: string | null;
  description: string;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
};

// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * Refresh the QuickBooks access token using the refresh token
 */
async function refreshQuickBooksToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; tokenExpiry: Date } | null> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("QuickBooks credentials not configured for token refresh");
    return null;
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to refresh QuickBooks token:", errorText);
      return null;
    }

    const tokens: QuickBooksTokenResponse = await response.json();
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry,
    };
  } catch (error) {
    console.error("Error refreshing QuickBooks token:", error);
    return null;
  }
}

/**
 * Get a valid access token for the organization, refreshing if necessary.
 */
async function getValidAccessToken(
  organizationId: string
): Promise<string | null> {
  const config = await prisma.quickBooksIntegration.findUnique({
    where: { organizationId },
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      tokenExpiry: true,
      isActive: true,
    },
  });

  if (!config || !config.isActive) {
    return null;
  }

  // Check if token is still valid (with 5-minute buffer)
  const now = new Date();
  const expiryBuffer = new Date(config.tokenExpiry.getTime() - 5 * 60 * 1000);

  if (now < expiryBuffer) {
    return config.accessToken;
  }

  // Token is expired or about to expire - refresh it
  const newTokens = await refreshQuickBooksToken(config.refreshToken);
  if (!newTokens) {
    // Refresh failed - mark as inactive
    await prisma.quickBooksIntegration.update({
      where: { id: config.id },
      data: {
        isActive: false,
        lastSyncError: "Session expired. Please reconnect to QuickBooks.",
      },
    });
    return null;
  }

  // Update database with new tokens
  await prisma.quickBooksIntegration.update({
    where: { id: config.id },
    data: {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      tokenExpiry: newTokens.tokenExpiry,
      lastSyncError: null,
    },
  });

  return newTokens.accessToken;
}

/**
 * Get the QuickBooks API base URL based on environment
 */
function getApiBaseUrl(): string {
  const environment = process.env.QUICKBOOKS_ENVIRONMENT || "sandbox";
  return environment === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getQuickBooksConfig(): Promise<ActionResult<QuickBooksConfig | null>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.quickBooksIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        organizationId: true,
        realmId: true,
        companyName: true,
        syncEnabled: true,
        autoSyncInvoices: true,
        autoCreateCustomers: true,
        syncFrequency: true,
        defaultIncomeAccount: true,
        defaultExpenseAccount: true,
        taxEnabled: true,
        defaultTaxCodeId: true,
        lastSyncAt: true,
        lastSyncError: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return success(config);
  } catch (error) {
    console.error("Error getting QuickBooks config:", error);
    return fail("Failed to get QuickBooks configuration");
  }
}

export async function getQuickBooksConnectionStatus(): Promise<
  ActionResult<{ connected: boolean; companyName?: string }>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.quickBooksIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { isActive: true, companyName: true },
    });

    if (!config || !config.isActive) {
      return success({ connected: false });
    }

    // Verify token is still valid
    const accessToken = await getValidAccessToken(auth.organizationId);
    if (!accessToken) {
      return success({ connected: false });
    }

    return success({ connected: true, companyName: config.companyName });
  } catch (error) {
    console.error("Error checking QuickBooks connection:", error);
    return fail("Failed to check connection status");
  }
}

export async function getQuickBooksSyncHistory(
  limit: number = 20
): Promise<ActionResult<QuickBooksSyncHistoryItem[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.quickBooksIntegration.findUnique({
      where: { organizationId: auth.organizationId },
      select: { id: true },
    });

    if (!config) {
      return success([]);
    }

    const history = await prisma.quickBooksSyncHistory.findMany({
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

export async function updateQuickBooksSettings(data: {
  syncEnabled?: boolean;
  autoSyncInvoices?: boolean;
  autoCreateCustomers?: boolean;
  syncFrequency?: string;
  defaultIncomeAccount?: string;
  defaultExpenseAccount?: string;
  taxEnabled?: boolean;
  defaultTaxCodeId?: string;
}): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.quickBooksIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return fail("QuickBooks integration not configured");
    }

    await prisma.quickBooksIntegration.update({
      where: { id: config.id },
      data: {
        syncEnabled: data.syncEnabled,
        autoSyncInvoices: data.autoSyncInvoices,
        autoCreateCustomers: data.autoCreateCustomers,
        syncFrequency: data.syncFrequency,
        defaultIncomeAccount: data.defaultIncomeAccount,
        defaultExpenseAccount: data.defaultExpenseAccount,
        taxEnabled: data.taxEnabled,
        defaultTaxCodeId: data.defaultTaxCodeId,
      },
    });

    revalidatePath("/settings/quickbooks");
    return ok();
  } catch (error) {
    console.error("Error updating QuickBooks settings:", error);
    return fail("Failed to update settings");
  }
}

export async function disconnectQuickBooks(): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.quickBooksIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config) {
      return fail("QuickBooks integration not configured");
    }

    // Revoke the token with QuickBooks
    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

    if (clientId && clientSecret) {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      try {
        await fetch("https://developer.api.intuit.com/v2/oauth2/tokens/revoke", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`,
          },
          body: new URLSearchParams({
            token: config.refreshToken,
          }),
        });
      } catch (revokeError) {
        console.error("Error revoking QuickBooks token:", revokeError);
        // Continue with deletion even if revoke fails
      }
    }

    // Delete the integration
    await prisma.quickBooksIntegration.delete({
      where: { id: config.id },
    });

    // Log the disconnection
    await prisma.integrationLog.create({
      data: {
        organizationId: auth.organizationId,
        provider: "quickbooks",
        eventType: "disconnected",
        message: `Disconnected from QuickBooks company: ${config.companyName}`,
      },
    });

    revalidatePath("/settings/quickbooks");
    return ok();
  } catch (error) {
    console.error("Error disconnecting QuickBooks:", error);
    return fail("Failed to disconnect");
  }
}

// ============================================================================
// SYNC OPERATIONS
// ============================================================================

/**
 * Sync all invoices to QuickBooks
 */
export async function syncInvoicesToQuickBooks(): Promise<
  ActionResult<{ synced: number; errors: number }>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.quickBooksIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config || !config.isActive) {
      return fail("QuickBooks integration not active");
    }

    const accessToken = await getValidAccessToken(auth.organizationId);
    if (!accessToken) {
      return fail("QuickBooks session expired. Please reconnect.");
    }

    // Get invoices that haven't been synced or were updated since last sync
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: auth.organizationId,
        status: { in: ["sent", "paid", "partial"] },
        OR: [
          { qbInvoiceId: null },
          { updatedAt: { gt: config.lastInvoiceSyncAt || new Date(0) } },
        ],
      },
      include: {
        client: true,
        lineItems: true,
      },
      take: 100, // Process in batches
    });

    let synced = 0;
    let errors = 0;

    for (const invoice of invoices) {
      try {
        // Map to the expected format
        const invoiceData = {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          dueDate: invoice.dueDate,
          totalCents: invoice.totalCents,
          qbInvoiceId: invoice.qbInvoiceId,
          client: invoice.client ? {
            id: invoice.client.id,
            name: invoice.client.fullName || invoice.client.email,
            email: invoice.client.email,
            qbCustomerId: invoice.client.qbCustomerId,
          } : null,
          lineItems: invoice.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: item.unitCents,
          })),
        };
        await syncSingleInvoiceToQuickBooks(
          accessToken,
          config.realmId,
          invoiceData,
          config.id
        );
        synced++;
      } catch (error) {
        console.error(`Error syncing invoice ${invoice.id}:`, error);
        errors++;

        // Log the error
        await prisma.quickBooksSyncHistory.create({
          data: {
            integrationId: config.id,
            syncType: "invoice",
            action: "synced",
            entityType: "Invoice",
            entityId: invoice.id,
            description: `Failed to sync invoice ${invoice.invoiceNumber || invoice.id}`,
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    }

    // Update last sync timestamp
    await prisma.quickBooksIntegration.update({
      where: { id: config.id },
      data: {
        lastInvoiceSyncAt: new Date(),
        lastSyncAt: new Date(),
        lastSyncError: errors > 0 ? `${errors} invoice(s) failed to sync` : null,
      },
    });

    revalidatePath("/settings/quickbooks");
    return success({ synced, errors });
  } catch (error) {
    console.error("Error syncing invoices:", error);
    return fail("Failed to sync invoices");
  }
}

/**
 * Sync a single invoice to QuickBooks
 */
async function syncSingleInvoiceToQuickBooks(
  accessToken: string,
  realmId: string,
  invoice: {
    id: string;
    invoiceNumber: string;
    dueDate: Date | null;
    totalCents: number;
    qbInvoiceId: string | null;
    client: { id: string; name: string; email: string; qbCustomerId: string | null } | null;
    lineItems: { description: string | null; quantity: number; unitPriceCents: number }[];
  },
  integrationId: string
): Promise<void> {
  const apiBase = getApiBaseUrl();

  // First, ensure the customer exists in QuickBooks
  let qbCustomerId = invoice.client?.qbCustomerId;
  if (!qbCustomerId && invoice.client) {
    qbCustomerId = await ensureQuickBooksCustomer(
      accessToken,
      realmId,
      invoice.client,
      integrationId
    );
  }

  if (!qbCustomerId) {
    throw new Error("Could not create or find customer in QuickBooks");
  }

  // Build the invoice payload
  const qbInvoice = {
    CustomerRef: { value: qbCustomerId },
    DueDate: invoice.dueDate?.toISOString().split("T")[0],
    DocNumber: invoice.invoiceNumber,
    Line: invoice.lineItems.map((item, index) => ({
      Id: String(index + 1),
      LineNum: index + 1,
      Description: item.description || "Photography Services",
      Amount: (item.quantity * item.unitPriceCents) / 100,
      DetailType: "SalesItemLineDetail",
      SalesItemLineDetail: {
        Qty: item.quantity,
        UnitPrice: item.unitPriceCents / 100,
      },
    })),
  };

  let response: Response;
  let qbInvoiceId = invoice.qbInvoiceId;

  if (qbInvoiceId) {
    // Update existing invoice - first get the current SyncToken
    const getResponse = await fetch(
      `${apiBase}/v3/company/${realmId}/invoice/${qbInvoiceId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (getResponse.ok) {
      const existingInvoice = await getResponse.json();
      const syncToken = existingInvoice.Invoice.SyncToken;

      response = await fetch(
        `${apiBase}/v3/company/${realmId}/invoice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...qbInvoice,
            Id: qbInvoiceId,
            SyncToken: syncToken,
          }),
        }
      );
    } else {
      // Invoice doesn't exist anymore, create new
      qbInvoiceId = null;
      response = await fetch(
        `${apiBase}/v3/company/${realmId}/invoice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(qbInvoice),
        }
      );
    }
  } else {
    // Create new invoice
    response = await fetch(
      `${apiBase}/v3/company/${realmId}/invoice`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(qbInvoice),
      }
    );
  }

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`QuickBooks API error: ${errorData}`);
  }

  const result = await response.json();
  const newQbInvoiceId = result.Invoice.Id;

  // Update the invoice with the QuickBooks ID
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { qbInvoiceId: newQbInvoiceId },
  });

  // Log success
  await prisma.quickBooksSyncHistory.create({
    data: {
      integrationId,
      syncType: "invoice",
      action: qbInvoiceId ? "updated" : "created",
      entityType: "Invoice",
      entityId: invoice.id,
      qbEntityId: newQbInvoiceId,
      description: `${qbInvoiceId ? "Updated" : "Created"} invoice ${invoice.invoiceNumber || invoice.id} in QuickBooks`,
      status: "success",
    },
  });
}

/**
 * Ensure a customer exists in QuickBooks, creating if necessary
 */
async function ensureQuickBooksCustomer(
  accessToken: string,
  realmId: string,
  client: { id: string; name: string; email: string; qbCustomerId: string | null },
  integrationId: string
): Promise<string | null> {
  const apiBase = getApiBaseUrl();

  // First, try to find existing customer by email
  const queryResponse = await fetch(
    `${apiBase}/v3/company/${realmId}/query?query=SELECT * FROM Customer WHERE PrimaryEmailAddr = '${client.email}'`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (queryResponse.ok) {
    const queryResult = await queryResponse.json();
    if (queryResult.QueryResponse?.Customer?.length > 0) {
      const existingCustomer = queryResult.QueryResponse.Customer[0];

      // Update client with QB ID
      await prisma.client.update({
        where: { id: client.id },
        data: { qbCustomerId: existingCustomer.Id },
      });

      return existingCustomer.Id;
    }
  }

  // Create new customer
  const createResponse = await fetch(
    `${apiBase}/v3/company/${realmId}/customer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        DisplayName: client.name,
        PrimaryEmailAddr: { Address: client.email },
      }),
    }
  );

  if (!createResponse.ok) {
    console.error("Failed to create QuickBooks customer:", await createResponse.text());
    return null;
  }

  const createResult = await createResponse.json();
  const qbCustomerId = createResult.Customer.Id;

  // Update client with QB ID
  await prisma.client.update({
    where: { id: client.id },
    data: { qbCustomerId },
  });

  // Log success
  await prisma.quickBooksSyncHistory.create({
    data: {
      integrationId,
      syncType: "customer",
      action: "created",
      entityType: "Customer",
      entityId: client.id,
      qbEntityId: qbCustomerId,
      description: `Created customer ${client.name} in QuickBooks`,
      status: "success",
    },
  });

  return qbCustomerId;
}

/**
 * Sync all customers to QuickBooks
 */
export async function syncCustomersToQuickBooks(): Promise<
  ActionResult<{ synced: number; errors: number }>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.quickBooksIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config || !config.isActive) {
      return fail("QuickBooks integration not active");
    }

    const accessToken = await getValidAccessToken(auth.organizationId);
    if (!accessToken) {
      return fail("QuickBooks session expired. Please reconnect.");
    }

    // Get clients that haven't been synced
    const clients = await prisma.client.findMany({
      where: {
        organizationId: auth.organizationId,
        qbCustomerId: null,
      },
      take: 100,
    });

    let synced = 0;
    let errors = 0;

    for (const client of clients) {
      try {
        // Map client to expected format
        const clientData = {
          id: client.id,
          name: client.fullName || client.email,
          email: client.email,
          qbCustomerId: client.qbCustomerId,
        };
        const qbCustomerId = await ensureQuickBooksCustomer(
          accessToken,
          config.realmId,
          clientData,
          config.id
        );
        if (qbCustomerId) {
          synced++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error(`Error syncing client ${client.id}:`, error);
        errors++;
      }
    }

    // Update last sync timestamp
    await prisma.quickBooksIntegration.update({
      where: { id: config.id },
      data: {
        lastCustomerSyncAt: new Date(),
        lastSyncAt: new Date(),
      },
    });

    revalidatePath("/settings/quickbooks");
    return success({ synced, errors });
  } catch (error) {
    console.error("Error syncing customers:", error);
    return fail("Failed to sync customers");
  }
}

/**
 * Manual full sync - sync all invoices and customers
 */
export async function runFullQuickBooksSync(): Promise<
  ActionResult<{ invoices: { synced: number; errors: number }; customers: { synced: number; errors: number } }>
> {
  try {
    const customersResult = await syncCustomersToQuickBooks();
    const invoicesResult = await syncInvoicesToQuickBooks();

    if (!customersResult.success || !invoicesResult.success) {
      return fail("Sync partially failed");
    }

    return success({
      customers: customersResult.data,
      invoices: invoicesResult.data,
    });
  } catch (error) {
    console.error("Error running full sync:", error);
    return fail("Failed to run full sync");
  }
}

// ============================================================================
// QUICKBOOKS DATA FETCHING
// ============================================================================

/**
 * Get income accounts from QuickBooks for mapping
 */
export async function getQuickBooksIncomeAccounts(): Promise<
  ActionResult<{ id: string; name: string }[]>
> {
  try {
    const auth = await getAuthContext();
    if (!auth?.organizationId) {
      return fail("Unauthorized");
    }

    const config = await prisma.quickBooksIntegration.findUnique({
      where: { organizationId: auth.organizationId },
    });

    if (!config || !config.isActive) {
      return fail("QuickBooks integration not active");
    }

    const accessToken = await getValidAccessToken(auth.organizationId);
    if (!accessToken) {
      return fail("QuickBooks session expired. Please reconnect.");
    }

    const apiBase = getApiBaseUrl();
    const response = await fetch(
      `${apiBase}/v3/company/${config.realmId}/query?query=SELECT * FROM Account WHERE AccountType = 'Income'`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return fail("Failed to fetch accounts from QuickBooks");
    }

    const result = await response.json();
    const accounts = result.QueryResponse?.Account || [];

    return success(
      accounts.map((account: { Id: string; Name: string }) => ({
        id: account.Id,
        name: account.Name,
      }))
    );
  } catch (error) {
    console.error("Error fetching QuickBooks accounts:", error);
    return fail("Failed to fetch accounts");
  }
}
