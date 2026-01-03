import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

/**
 * Dropbox OAuth 2.0 Authorization Endpoint
 *
 * Redirects user to Dropbox to authorize the app.
 * Uses PKCE (Proof Key for Code Exchange) for enhanced security.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const appKey = process.env.DROPBOX_APP_KEY;
    if (!appKey) {
      console.error("DROPBOX_APP_KEY not configured");
      return NextResponse.redirect(
        new URL("/settings/dropbox?error=not_configured", request.url)
      );
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    // Generate state for CSRF protection (includes org ID for callback)
    const state = Buffer.from(
      JSON.stringify({
        orgId,
        nonce: crypto.randomBytes(16).toString("hex"),
      })
    ).toString("base64url");

    // Build callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`;
    const redirectUri = `${baseUrl}/api/integrations/dropbox/callback`;

    // Build Dropbox authorization URL
    const authUrl = new URL("https://www.dropbox.com/oauth2/authorize");
    authUrl.searchParams.set("client_id", appKey);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("token_access_type", "offline"); // Get refresh token

    // Store code verifier in a cookie for the callback
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set("dropbox_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error initiating Dropbox OAuth:", error);
    return NextResponse.redirect(
      new URL("/settings/dropbox?error=auth_failed", request.url)
    );
  }
}
