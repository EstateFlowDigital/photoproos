import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

/**
 * Disable preview mode
 *
 * Usage: GET /api/preview/disable?redirect=/
 *
 * This route disables Next.js draft mode and optionally redirects.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectUrl = searchParams.get("redirect");

  // Disable draft mode
  const draft = await draftMode();
  draft.disable();

  // Redirect if URL provided
  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return NextResponse.json({
    success: true,
    message: "Preview mode disabled",
  });
}
