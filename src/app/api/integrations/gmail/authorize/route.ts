import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAuthContext } from "@/lib/auth/clerk";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Gmail OAuth scopes - read and send emails
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export async function GET() {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
    }

    // Get organization
    const context = await getAuthContext();
    if (!context) {
      return NextResponse.redirect(
        new URL("/onboarding", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: context.organizationId },
    });

    if (!organization) {
      return NextResponse.redirect(
        new URL("/onboarding", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Generate PKCE values
    const { verifier, challenge } = generatePKCE();

    // Create state for callback verification (includes org and user info)
    const state = Buffer.from(
      JSON.stringify({
        orgId: organization.id,
        userId: user.id,
        nonce: crypto.randomBytes(16).toString("hex"),
      })
    ).toString("base64url");

    // Build the callback URL
    const callbackUrl = new URL(
      "/api/integrations/gmail/callback",
      process.env.NEXT_PUBLIC_APP_URL
    );

    // Build the Google OAuth authorization URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
    authUrl.searchParams.set("redirect_uri", callbackUrl.toString());
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", GMAIL_SCOPES.join(" "));
    authUrl.searchParams.set("access_type", "offline"); // Get refresh token
    authUrl.searchParams.set("prompt", "consent"); // Force consent to get refresh token
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    // Create response with redirect
    const response = NextResponse.redirect(authUrl.toString());

    // Store code verifier in secure cookie for PKCE verification
    response.cookies.set("gmail_pkce_verifier", verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Gmail OAuth authorize error:", error);
    return NextResponse.redirect(
      new URL(
        "/settings/email?error=oauth_init_failed",
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
