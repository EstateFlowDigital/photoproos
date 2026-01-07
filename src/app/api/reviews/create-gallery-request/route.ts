/**
 * API Route: Create Review Request from Gallery
 *
 * Creates a review request when a client clicks the review prompt
 * on the public gallery page. Returns the review URL to redirect to.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, projectId, clientId, clientEmail, clientName } = body;

    // Validate required fields
    if (!organizationId || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if review gate is enabled for this organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        reviewGateEnabled: true,
        reviewGateGalleryPromptEnabled: true,
      },
    });

    if (!organization?.reviewGateEnabled || !organization?.reviewGateGalleryPromptEnabled) {
      return NextResponse.json(
        { error: "Review gate not enabled" },
        { status: 400 }
      );
    }

    // Check if a review request already exists for this project
    const existingRequest = await prisma.reviewRequest.findFirst({
      where: {
        organizationId,
        projectId,
        source: "gallery",
      },
      select: { token: true },
    });

    // If exists, return existing token
    if (existingRequest) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
      return NextResponse.json({
        success: true,
        reviewUrl: `${baseUrl}/review/${existingRequest.token}`,
      });
    }

    // Create new review request
    const reviewRequest = await prisma.reviewRequest.create({
      data: {
        organizationId,
        projectId,
        clientId: clientId || null,
        clientEmail: clientEmail || null,
        clientName: clientName || null,
        source: "gallery",
        status: "pending",
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
    const reviewUrl = `${baseUrl}/review/${reviewRequest.token}`;

    return NextResponse.json({
      success: true,
      reviewUrl,
    });
  } catch (error) {
    console.error("[Create Gallery Review Request] Error:", error);
    return NextResponse.json(
      { error: "Failed to create review request" },
      { status: 500 }
    );
  }
}
