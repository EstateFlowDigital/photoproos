import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { triggerIntegrationConnected } from "@/lib/gamification/trigger";

interface QuickBooksTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  x_refresh_token_expires_in: number;
}

interface QuickBooksCompanyInfo {
  CompanyInfo: {
    CompanyName: string;
    LegalName?: string;
    CompanyAddr?: {
      Line1?: string;
      City?: string;
      CountrySubDivisionCode?: string;
      PostalCode?: string;
    };
    Email?: {
      Address?: string;
    };
  };
}

/**
 * QuickBooks OAuth 2.0 Callback Handler
 *
 * Exchanges the authorization code for access tokens and saves the integration.
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization code and state from query params
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const realmId = request.nextUrl.searchParams.get("realmId");
    const error = request.nextUrl.searchParams.get("error");
    const errorDescription = request.nextUrl.searchParams.get("error_description");

    // Handle errors from QuickBooks
    if (error) {
      console.error("QuickBooks OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(`/settings/quickbooks?error=${error}`, request.url)
      );
    }

    if (!code || !state || !realmId) {
      return NextResponse.redirect(
        new URL("/settings/quickbooks?error=missing_params", request.url)
      );
    }

    // Verify user is authenticated
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Decode and verify state
    let stateData: { orgId: string; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64url").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/settings/quickbooks?error=invalid_state", request.url)
      );
    }

    // Verify org ID matches
    if (stateData.orgId !== orgId) {
      return NextResponse.redirect(
        new URL("/settings/quickbooks?error=org_mismatch", request.url)
      );
    }

    // Look up the organization by Clerk ID
    let organization = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
    });

    if (!organization) {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        include: {
          memberships: {
            include: {
              organization: true,
            },
          },
        },
      });

      const fallbackOrg = user?.memberships.find(
        (membership) =>
          membership.organization.clerkOrganizationId === orgId ||
          !membership.organization.clerkOrganizationId
      )?.organization;

      if (!fallbackOrg) {
        console.error("Organization not found for Clerk ID:", orgId);
        return NextResponse.redirect(
          new URL("/settings/quickbooks?error=org_not_found", request.url)
        );
      }

      organization = fallbackOrg;
    }

    if (!organization.clerkOrganizationId) {
      organization = await prisma.organization.update({
        where: { id: organization.id },
        data: { clerkOrganizationId: orgId },
      });
    }

    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("QuickBooks credentials not configured");
      return NextResponse.redirect(
        new URL("/settings/quickbooks?error=not_configured", request.url)
      );
    }

    // Build callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`;
    const redirectUri = `${baseUrl}/api/integrations/quickbooks/callback`;

    // Exchange code for tokens
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("QuickBooks token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/settings/quickbooks?error=token_exchange_failed", request.url)
      );
    }

    const tokens: QuickBooksTokenResponse = await tokenResponse.json();

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Get company info from QuickBooks
    const environment = process.env.QUICKBOOKS_ENVIRONMENT;
    if (!environment) {
      console.warn("QUICKBOOKS_ENVIRONMENT not set, defaulting to sandbox. Set to 'production' for live data.");
    }
    const qbEnvironment = environment === "production" ? "production" : "sandbox";
    const apiBase = qbEnvironment === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

    const companyResponse = await fetch(
      `${apiBase}/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokens.access_token}`,
          "Accept": "application/json",
        },
      }
    );

    let companyName = "Unknown Company";
    if (companyResponse.ok) {
      const companyData: QuickBooksCompanyInfo = await companyResponse.json();
      companyName = companyData.CompanyInfo.CompanyName || companyData.CompanyInfo.LegalName || "Unknown Company";
    } else {
      console.error("Failed to get QuickBooks company info");
    }

    // Save or update integration in database
    await prisma.quickBooksIntegration.upsert({
      where: { organizationId: organization.id },
      create: {
        organizationId: organization.id,
        realmId,
        companyName,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry,
        syncEnabled: true,
        autoSyncInvoices: true,
        autoCreateCustomers: true,
        syncFrequency: "realtime",
        isActive: true,
      },
      update: {
        realmId,
        companyName,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry,
        isActive: true,
        lastSyncError: null,
      },
    });

    // Log the connection
    await prisma.integrationLog.create({
      data: {
        organizationId: organization.id,
        provider: "quickbooks",
        eventType: "connected",
        message: `Connected to QuickBooks company: ${companyName}`,
        details: {
          realmId,
          companyName,
        },
      },
    });

    // Fire gamification trigger for integration connection (non-blocking)
    triggerIntegrationConnected(userId, organization.id, "quickbooks");

    return NextResponse.redirect(
      new URL("/settings/quickbooks?success=connected", request.url)
    );
  } catch (error) {
    console.error("Error in QuickBooks OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/settings/quickbooks?error=callback_failed", request.url)
    );
  }
}
