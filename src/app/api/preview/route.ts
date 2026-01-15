"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * Enable preview mode for a marketing page
 *
 * Usage: GET /api/preview?slug=pricing&redirect=/pricing
 *
 * This route:
 * 1. Validates the user is a super admin
 * 2. Verifies the page exists and has a draft
 * 3. Enables Next.js draft mode
 * 4. Redirects to the page (or returns success)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const redirectUrl = searchParams.get("redirect");

  // Validate slug
  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug parameter" },
      { status: 400 }
    );
  }

  // Check if user is authenticated as super admin
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Check super admin status
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "super_admin") {
    return NextResponse.json(
      { error: "Super admin access required" },
      { status: 403 }
    );
  }

  // Verify the page exists
  const page = await prisma.marketingPage.findUnique({
    where: { slug },
    select: { id: true, slug: true, hasDraft: true },
  });

  if (!page) {
    return NextResponse.json(
      { error: "Page not found" },
      { status: 404 }
    );
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the page or return success
  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return NextResponse.json({
    success: true,
    message: "Preview mode enabled",
    slug: page.slug,
    hasDraft: page.hasDraft,
  });
}
