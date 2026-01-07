import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { triggerIntegrationConnected } from "@/lib/gamification/trigger";

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface GoogleUserInfo {
  email: string;
  name?: string;
  picture?: string;
}

interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  accessRole: string;
}

interface GoogleCalendarListResponse {
  items: GoogleCalendar[];
}

/**
 * Google Calendar OAuth 2.0 Callback Handler
 *
 * Exchanges the authorization code for access tokens and saves the integration.
 * Uses PKCE verification for enhanced security.
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization code, state, and error from query params
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");
    const errorDescription = request.nextUrl.searchParams.get("error_description");

    // Handle errors from Google
    if (error) {
      console.error("[GoogleCalendar] OAuth error:", error, errorDescription);
      if (error === "access_denied") {
        return NextResponse.redirect(
          new URL("/settings/calendar?error=access_denied", request.url)
        );
      }
      return NextResponse.redirect(
        new URL(`/settings/calendar?error=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings/calendar?error=missing_params", request.url)
      );
    }

    // Verify user is authenticated
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Decode and verify state
    let stateData: { orgId: string; userId: string; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64url").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/settings/calendar?error=invalid_state", request.url)
      );
    }

    // Verify org ID matches
    if (stateData.orgId !== orgId) {
      return NextResponse.redirect(
        new URL("/settings/calendar?error=org_mismatch", request.url)
      );
    }

    // Look up the organization by Clerk ID
    const organization = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
    });

    if (!organization) {
      console.error("[GoogleCalendar] Organization not found for Clerk ID:", orgId);
      return NextResponse.redirect(
        new URL("/settings/calendar?error=org_not_found", request.url)
      );
    }

    // Get code verifier from cookie
    const codeVerifier = request.cookies.get("google_code_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL("/settings/calendar?error=missing_verifier", request.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[GoogleCalendar] Credentials not configured");
      return NextResponse.redirect(
        new URL("/settings/calendar?error=not_configured", request.url)
      );
    }

    // Build callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`;
    const redirectUri = `${baseUrl}/api/integrations/google/callback`;

    // Exchange code for tokens with PKCE
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[GoogleCalendar] Token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/settings/calendar?error=token_exchange_failed", request.url)
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    let userEmail = "";
    if (userInfoResponse.ok) {
      const userInfo: GoogleUserInfo = await userInfoResponse.json();
      userEmail = userInfo.email;
    }

    // Get user's primary calendar
    const calendarsResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!calendarsResponse.ok) {
      console.error("[GoogleCalendar] Failed to get calendars");
      return NextResponse.redirect(
        new URL("/settings/calendar?error=calendar_fetch_failed", request.url)
      );
    }

    const calendarsData: GoogleCalendarListResponse = await calendarsResponse.json();
    const primaryCalendar = calendarsData.items.find((cal) => cal.primary) || calendarsData.items[0];

    if (!primaryCalendar) {
      return NextResponse.redirect(
        new URL("/settings/calendar?error=no_calendars", request.url)
      );
    }

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Save or update integration in database
    await prisma.calendarIntegration.upsert({
      where: {
        organizationId_provider_externalId: {
          organizationId: organization.id,
          provider: "google",
          externalId: primaryCalendar.id,
        },
      },
      create: {
        organizationId: organization.id,
        userId: userId,
        provider: "google",
        externalId: primaryCalendar.id,
        name: primaryCalendar.summary || userEmail || "Google Calendar",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiresAt,
        syncEnabled: true,
        syncDirection: "both",
        color: primaryCalendar.backgroundColor || "#4285F4",
      },
      update: {
        userId: userId,
        name: primaryCalendar.summary || userEmail || "Google Calendar",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiresAt,
        lastSyncError: null,
      },
    });

    // Fire gamification trigger for integration connection (non-blocking)
    triggerIntegrationConnected(userId, organization.id, "google_calendar");

    // Clear the code verifier cookie and redirect to success
    const response = NextResponse.redirect(
      new URL("/settings/calendar?success=connected", request.url)
    );
    response.cookies.delete("google_code_verifier");

    return response;
  } catch (error) {
    console.error("[GoogleCalendar] Error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/settings/calendar?error=callback_failed", request.url)
    );
  }
}
