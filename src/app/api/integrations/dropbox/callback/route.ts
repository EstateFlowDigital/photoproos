import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

interface DropboxTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  uid: string;
  account_id: string;
}

interface DropboxAccountInfo {
  account_id: string;
  name: {
    display_name: string;
    given_name: string;
    surname: string;
    familiar_name: string;
  };
  email: string;
  email_verified: boolean;
}

/**
 * Dropbox OAuth 2.0 Callback Handler
 *
 * Exchanges the authorization code for access tokens and saves the integration.
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization code and state from query params
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");
    const errorDescription = request.nextUrl.searchParams.get("error_description");

    // Handle errors from Dropbox
    if (error) {
      console.error("Dropbox OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(`/settings/dropbox?error=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings/dropbox?error=missing_params", request.url)
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
        new URL("/settings/dropbox?error=invalid_state", request.url)
      );
    }

    // Verify org ID matches
    if (stateData.orgId !== orgId) {
      return NextResponse.redirect(
        new URL("/settings/dropbox?error=org_mismatch", request.url)
      );
    }

    // Get code verifier from cookie
    const codeVerifier = request.cookies.get("dropbox_code_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL("/settings/dropbox?error=missing_verifier", request.url)
      );
    }

    const appKey = process.env.DROPBOX_APP_KEY;
    const appSecret = process.env.DROPBOX_APP_SECRET;

    if (!appKey || !appSecret) {
      console.error("Dropbox credentials not configured");
      return NextResponse.redirect(
        new URL("/settings/dropbox?error=not_configured", request.url)
      );
    }

    // Build callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`;
    const redirectUri = `${baseUrl}/api/integrations/dropbox/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        client_id: appKey,
        client_secret: appSecret,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Dropbox token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/settings/dropbox?error=token_exchange_failed", request.url)
      );
    }

    const tokens: DropboxTokenResponse = await tokenResponse.json();

    // Get account info from Dropbox
    const accountResponse = await fetch(
      "https://api.dropboxapi.com/2/users/get_current_account",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!accountResponse.ok) {
      console.error("Failed to get Dropbox account info");
      return NextResponse.redirect(
        new URL("/settings/dropbox?error=account_fetch_failed", request.url)
      );
    }

    const accountInfo: DropboxAccountInfo = await accountResponse.json();

    // Save or update integration in database
    await prisma.dropboxIntegration.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        accountId: accountInfo.account_id,
        email: accountInfo.email,
        displayName: accountInfo.name.display_name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        syncFolder: "/PhotoProOS",
        autoSync: true,
        syncEnabled: true,
        isActive: true,
      },
      update: {
        accountId: accountInfo.account_id,
        email: accountInfo.email,
        displayName: accountInfo.name.display_name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        isActive: true,
      },
    });

    // Create initial folder structure in Dropbox
    try {
      await createInitialFolders(tokens.access_token);
    } catch (folderError) {
      console.error("Failed to create Dropbox folders:", folderError);
      // Don't fail the whole flow for this
    }

    // Clear the code verifier cookie and redirect to success
    const response = NextResponse.redirect(
      new URL("/settings/dropbox?success=connected", request.url)
    );
    response.cookies.delete("dropbox_code_verifier");

    return response;
  } catch (error) {
    console.error("Error in Dropbox OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/settings/dropbox?error=callback_failed", request.url)
    );
  }
}

/**
 * Create initial folder structure in Dropbox
 */
async function createInitialFolders(accessToken: string): Promise<void> {
  const folders = ["/PhotoProOS", "/PhotoProOS/Galleries", "/PhotoProOS/Clients", "/PhotoProOS/Exports"];

  for (const folder of folders) {
    try {
      await fetch("https://api.dropboxapi.com/2/files/create_folder_v2", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: folder, autorename: false }),
      });
    } catch {
      // Folder might already exist, ignore errors
    }
  }
}
