import { NextRequest, NextResponse } from "next/server";
import { validateMagicLinkToken } from "@/lib/actions/client-auth";

/**
 * Handle magic link click
 * GET /api/auth/client?token=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  // Redirect URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalUrl = `${baseUrl}/portal`;
  const loginUrl = `${baseUrl}/portal/login`;

  if (!token) {
    // No token provided - redirect to login with error
    const url = new URL(loginUrl);
    url.searchParams.set("error", "missing_token");
    return NextResponse.redirect(url);
  }

  // Validate the token and create session
  const result = await validateMagicLinkToken(token);

  if (!result.success) {
    // Invalid or expired token - redirect to login with error
    const url = new URL(loginUrl);
    url.searchParams.set("error", result.error === "This link has expired. Please request a new one." ? "expired" : "invalid");
    return NextResponse.redirect(url);
  }

  // Success! Redirect to portal
  return NextResponse.redirect(portalUrl);
}
