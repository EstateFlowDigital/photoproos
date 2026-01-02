import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/gallery/comment
 *
 * Add a comment to a gallery or specific photo.
 * Body: { galleryId: string, assetId?: string, clientName?: string, clientEmail?: string, content: string }
 */
export async function POST(request: NextRequest) {
  try {
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

    // Create the comment
    const comment = await prisma.galleryComment.create({
      data: {
        projectId: galleryId,
        assetId: assetId || null,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        content,
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        clientName: comment.clientName,
        assetId: comment.assetId,
        createdAt: comment.createdAt,
      },
    });
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
 * Delete a comment (requires matching email).
 * Body: { commentId: string, clientEmail: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, clientEmail } = body;

    if (!commentId || !clientEmail) {
      return NextResponse.json(
        { error: "Comment ID and email are required" },
        { status: 400 }
      );
    }

    // Find the comment and verify ownership
    const comment = await prisma.galleryComment.findFirst({
      where: {
        id: commentId,
        clientEmail: clientEmail,
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
