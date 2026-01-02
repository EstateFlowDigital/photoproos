import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { commentsRatelimit, checkRateLimit, getClientIP } from "@/lib/ratelimit";

const SESSION_COOKIE_NAME = "gallery_session";

/**
 * POST /api/gallery/comment
 *
 * Add a comment to a gallery or specific photo.
 * Body: { galleryId: string, assetId?: string, clientName?: string, clientEmail?: string, content: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(commentsRatelimit, clientIP);
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
    const { galleryId, assetId, clientName, clientEmail, content } = body;

    if (!galleryId || !content) {
      return NextResponse.json(
        { error: "Gallery ID and content are required" },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Comment must be 2000 characters or less" },
        { status: 400 }
      );
    }

    // Get the gallery
    const gallery = await prisma.project.findUnique({
      where: { id: galleryId },
      select: {
        id: true,
        expiresAt: true,
        status: true,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Check if gallery is expired
    if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This gallery has expired" },
        { status: 403 }
      );
    }

    // If assetId is provided, verify it belongs to this gallery
    if (assetId) {
      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          projectId: galleryId,
        },
      });

      if (!asset) {
        return NextResponse.json(
          { error: "Photo not found in this gallery" },
          { status: 404 }
        );
      }
    }

    // Get or create session ID for tracking comment ownership
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Create the comment with session tracking
    const comment = await prisma.galleryComment.create({
      data: {
        projectId: galleryId,
        assetId: assetId || null,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        content,
        sessionId, // Track who created the comment for secure deletion
      },
    });

    const response = NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        clientName: comment.clientName,
        assetId: comment.assetId,
        createdAt: comment.createdAt,
      },
    });

    // Set session cookie if it was newly created
    if (!cookieStore.get(SESSION_COOKIE_NAME)?.value) {
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("[Comment] Error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gallery/comment?galleryId=xxx&assetId=yyy
 *
 * Get comments for a gallery or specific photo.
 * If assetId is provided, returns comments for that specific photo.
 * If assetId is not provided, returns all comments for the gallery.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get("galleryId");
    const assetId = searchParams.get("assetId");

    if (!galleryId) {
      return NextResponse.json(
        { error: "Gallery ID is required" },
        { status: 400 }
      );
    }

    // Build the where clause
    const whereClause: {
      projectId: string;
      assetId?: string | null;
    } = {
      projectId: galleryId,
    };

    // If assetId is provided, filter to that specific photo
    // If assetId is "null" (string), get gallery-level comments
    if (assetId === "null") {
      whereClause.assetId = null;
    } else if (assetId) {
      whereClause.assetId = assetId;
    }

    const comments = await prisma.galleryComment.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        assetId: true,
        clientName: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("[Comment] Error:", error);
    return NextResponse.json(
      { error: "Failed to get comments" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gallery/comment
 *
 * Delete a comment (requires matching session - secure ownership verification).
 * Body: { commentId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(commentsRatelimit, clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    // Get session ID from cookie - this is the ONLY way to verify ownership
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session not found. You can only delete your own comments." },
        { status: 401 }
      );
    }

    // Find the comment and verify ownership via session (not email!)
    const comment = await prisma.galleryComment.findFirst({
      where: {
        id: commentId,
        sessionId: sessionId, // Must match the session that created it
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete the comment
    await prisma.galleryComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[Comment] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
