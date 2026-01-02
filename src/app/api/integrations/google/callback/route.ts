import { NextRequest, NextResponse } from "next/server";
import { handleGoogleCallback } from "@/lib/integrations/google-calendar";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Handle error from Google
  if (error) {
    console.error("[GoogleCalendar] OAuth error:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=google_auth_denied", request.url)
    );
  }

  // Validate code
  if (!code) {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=missing_code", request.url)
    );
  }

  try {
    const result = await handleGoogleCallback(code);

    if (result.success) {
      return NextResponse.redirect(
        new URL("/settings/integrations?success=google_connected", request.url)
      );
    } else {
      console.error("[GoogleCalendar] Callback error:", result.error);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(result.error)}`, request.url)
      );
    }
  } catch (error) {
    console.error("[GoogleCalendar] Callback exception:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=connection_failed", request.url)
    );
  }
}
