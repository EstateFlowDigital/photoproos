import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { triggerIntegrationConnected } from "@/lib/gamification/trigger";

interface StatePayload {
  orgId: string;
  userId: string;
  nonce: string;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  email: string;
  name?: string;
  picture?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization code and state from query params
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Gmail OAuth error:", error);
      return NextResponse.redirect(
        new URL(
          `/settings/email?error=${encodeURIComponent(error)}`,
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    // Validate code and state
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          "/settings/email?error=missing_params",
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Decode and validate state
    let statePayload: StatePayload;
    try {
      statePayload = JSON.parse(Buffer.from(state, "base64url").toString());
    } catch {
      return NextResponse.redirect(
        new URL(
          "/settings/email?error=invalid_state",
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    // Verify user matches
    if (statePayload.userId !== userId) {
      return NextResponse.redirect(
        new URL(
          "/settings/email?error=user_mismatch",
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    // Get PKCE verifier from cookie
    const codeVerifier = request.cookies.get("gmail_pkce_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL(
          "/settings/email?error=pkce_missing",
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    // Build the callback URL
    const callbackUrl = new URL(
      "/api/integrations/gmail/callback",
      process.env.NEXT_PUBLIC_APP_URL
    );

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl.toString(),
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Gmail token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL(
          "/settings/email?error=token_exchange_failed",
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Fetch user info to get email address
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      console.error("Failed to fetch Gmail user info");
      return NextResponse.redirect(
        new URL(
          "/settings/email?error=user_info_failed",
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Check if this email account already exists for this organization
    const existingAccount = await prisma.emailAccount.findFirst({
      where: {
        organizationId: statePayload.orgId,
        email: userInfo.email,
      },
    });

    if (existingAccount) {
      // Update existing account with new tokens
      await prisma.emailAccount.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingAccount.refreshToken,
          tokenExpiry,
          isActive: true,
          errorMessage: null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new email account
      await prisma.emailAccount.create({
        data: {
          organizationId: statePayload.orgId,
          provider: "GMAIL",
          email: userInfo.email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || "",
          tokenExpiry,
          isActive: true,
          syncEnabled: true,
        },
      });
    }

    // Log the integration
    await prisma.integrationLog.create({
      data: {
        organizationId: statePayload.orgId,
        provider: "gmail",
        eventType: existingAccount ? "reconnected" : "connected",
        message: `Gmail account ${userInfo.email} ${existingAccount ? "reconnected" : "connected"} successfully`,
        details: {
          email: userInfo.email,
          name: userInfo.name,
        },
      },
    });

    // Fire gamification trigger for integration connection (non-blocking)
    // Only trigger for new connections, not reconnections
    if (!existingAccount) {
      triggerIntegrationConnected(userId, statePayload.orgId, "gmail");
    }

    // Create response with success redirect
    const response = NextResponse.redirect(
      new URL(
        "/settings/email?success=gmail_connected",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );

    // Clear the PKCE cookie
    response.cookies.delete("gmail_pkce_verifier");

    return response;
  } catch (error) {
    console.error("Gmail OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        "/settings/email?error=callback_failed",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
