/**
 * Outlook Integration Library
 *
 * Handles Microsoft Outlook OAuth token management and API operations for the unified inbox.
 */

import { prisma } from "@/lib/prisma";

interface OutlookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

/**
 * Refresh Outlook access token using refresh token
 */
export async function refreshOutlookToken(
  emailAccountId: string
): Promise<string | null> {
  const account = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
  });

  if (!account || !account.refreshToken) {
    console.error("No account or refresh token found");
    return null;
  }

  // Check if token is still valid
  if (account.tokenExpiry && account.tokenExpiry > new Date()) {
    return account.accessToken;
  }

  try {
    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          refresh_token: account.refreshToken,
          grant_type: "refresh_token",
          scope: "https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Outlook token refresh failed:", error);

      // Mark account as inactive if refresh fails
      await prisma.emailAccount.update({
        where: { id: emailAccountId },
        data: {
          isActive: false,
          errorMessage: "Token refresh failed. Please reconnect your account.",
        },
      });

      return null;
    }

    const tokens: OutlookTokenResponse = await response.json();
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Update the stored token
    await prisma.emailAccount.update({
      where: { id: emailAccountId },
      data: {
        accessToken: tokens.access_token,
        tokenExpiry,
        errorMessage: null,
        // Microsoft may return a new refresh token
        ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
      },
    });

    return tokens.access_token;
  } catch (error) {
    console.error("Error refreshing Outlook token:", error);
    return null;
  }
}

/**
 * Get a valid access token for an Outlook account (refreshes if needed)
 */
export async function getOutlookAccessToken(
  emailAccountId: string
): Promise<string | null> {
  const account = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
  });

  if (!account) {
    return null;
  }

  // Check if token is still valid (with 5 minute buffer)
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  if (account.tokenExpiry && account.tokenExpiry.getTime() > Date.now() + bufferTime) {
    return account.accessToken;
  }

  // Token expired or expiring soon, refresh it
  return refreshOutlookToken(emailAccountId);
}

/**
 * Disconnect Outlook account
 */
export async function disconnectOutlookAccount(
  emailAccountId: string
): Promise<boolean> {
  try {
    const account = await prisma.emailAccount.findUnique({
      where: { id: emailAccountId },
    });

    if (!account) {
      return false;
    }

    // Microsoft Graph API doesn't have a direct token revocation endpoint like Google
    // The recommended approach is to:
    // 1. Delete the stored tokens (done by deleting the account record)
    // 2. Optionally call the sign-out endpoint to invalidate session
    // For enterprise scenarios, the user would need to revoke via Azure AD portal

    // Attempt to sign out the user (best effort - may not work for all scenarios)
    if (account.accessToken) {
      try {
        // This endpoint signs out the user from Microsoft
        await fetch(
          `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || "")}`
        );
      } catch {
        // Sign-out can fail, that's okay - we'll still delete the local tokens
      }
    }

    // Delete the account and all related data
    await prisma.emailAccount.delete({
      where: { id: emailAccountId },
    });

    // Log the disconnection
    await prisma.integrationLog.create({
      data: {
        organizationId: account.organizationId,
        provider: "outlook",
        eventType: "disconnected",
        message: `Outlook account ${account.email} disconnected`,
      },
    });

    return true;
  } catch (error) {
    console.error("Error disconnecting Outlook account:", error);
    return false;
  }
}
