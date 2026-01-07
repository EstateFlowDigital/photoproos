import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

/**
 * QuickBooks OAuth 2.0 Authorization Endpoint
 *
 * Redirects user to Intuit to authorize the app.
 * Uses PKCE (Proof Key for Code Exchange) for enhanced security.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    if (!clientId) {
      console.error("QUICKBOOKS_CLIENT_ID not configured");
      return NextResponse.redirect(
        new URL("/settings/quickbooks?error=not_configured", request.url)
      );
    }

    // Generate state for CSRF protection (includes org ID for callback)
    const state = Buffer.from(
      JSON.stringify({
        orgId,
        nonce: crypto.randomBytes(16).toString("hex"),
      })
    ).toString("base64url");

    // Build callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`;
    const redirectUri = `${baseUrl}/api/integrations/quickbooks/callback`;

    // Build QuickBooks authorization URL
    // https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0
    const authUrl = new URL("https://appcenter.intuit.com/connect/oauth2");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", "com.intuit.quickbooks.accounting");

    const response = NextResponse.redirect(authUrl.toString());

    return response;
  } catch (error) {
    console.error("Error initiating QuickBooks OAuth:", error);
    return NextResponse.redirect(
      new URL("/settings/quickbooks?error=auth_failed", request.url)
    );
  }
}
