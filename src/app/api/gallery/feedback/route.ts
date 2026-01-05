import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { feedbackRatelimit, checkRateLimit, getClientIP } from "@/lib/ratelimit";

/**
 * POST /api/gallery/feedback
 *
 * Submit feedback from a gallery client
 * Body: { galleryId: string, type: string, message: string, clientName?: string, clientEmail?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(feedbackRatelimit, clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(rateLimitResult.remaining || 0),
            "X-RateLimit-Reset": String(rateLimitResult.reset || 0),
          },
        }
      );
    }

    const body = await request.json();
    const { galleryId, type, message, clientName, clientEmail } = body;

    if (!galleryId || !type || !message) {
      return NextResponse.json(
        { error: "Gallery ID, type, and message are required" },
        { status: 400 }
      );
    }

    // Validate feedback type
    const validTypes = ["feedback", "feature", "issue"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 }
      );
    }

    // Verify gallery exists and get organization
    const project = await prisma.project.findUnique({
      where: { id: galleryId },
      select: {
        id: true,
        name: true,
        organizationId: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Create the feedback record
    const feedback = await prisma.galleryFeedback.create({
      data: {
        projectId: galleryId,
        organizationId: project.organizationId,
        type,
        message,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        ipAddress: clientIP,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
    });
  } catch (error) {
    console.error("[Gallery Feedback] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
