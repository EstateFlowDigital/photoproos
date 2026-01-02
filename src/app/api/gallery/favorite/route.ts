import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "gallery_session";

/**
 * Get or create a session ID for anonymous favorites tracking
 */
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existingSessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existingSessionId) {
    return existingSessionId;
  }

  // Generate new session ID
  return crypto.randomUUID();
}

/**
 * POST /api/gallery/favorite
 *
 * Toggle favorite on a photo.
 * Body: { assetId: string, galleryId: string, email?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, galleryId, email } = body;

    if (!assetId || !galleryId) {
      return NextResponse.json(
        { error: "Asset ID and Gallery ID are required" },
        { status: 400 }
      );
    }

    // Verify the asset belongs to the gallery and gallery is accessible
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        projectId: galleryId,
      },
      include: {
        project: {
          select: {
            expiresAt: true,
            status: true,
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Photo not found in this gallery" },
        { status: 404 }
      );
    }

    // Check if gallery is expired
    if (asset.project.expiresAt && new Date(asset.project.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This gallery has expired" },
        { status: 403 }
      );
    }

    // Get session ID for anonymous tracking
    const sessionId = await getSessionId();

    // Check if already favorited
    const existingFavorite = await prisma.galleryFavorite.findFirst({
      where: {
        projectId: galleryId,
        assetId,
        OR: [
          { clientEmail: email || null },
          { sessionId: email ? undefined : sessionId },
        ],
      },
    });

    let isFavorited: boolean;
    let response: NextResponse;

    if (existingFavorite) {
      // Remove favorite
      await prisma.galleryFavorite.delete({
        where: { id: existingFavorite.id },
      });
      isFavorited = false;
    } else {
      // Add favorite
      await prisma.galleryFavorite.create({
        data: {
          projectId: galleryId,
          assetId,
          clientEmail: email || null,
          sessionId: email ? null : sessionId,
        },
      });
      isFavorited = true;
    }

    // Get updated favorite count for this gallery + session/email
    const favorites = await prisma.galleryFavorite.findMany({
      where: {
        projectId: galleryId,
        OR: [
          { clientEmail: email || null },
          { sessionId: email ? undefined : sessionId },
        ],
      },
      select: { assetId: true },
    });

    response = NextResponse.json({
      success: true,
      isFavorited,
      favoriteCount: favorites.length,
      favoriteAssetIds: favorites.map((f) => f.assetId),
    });

    // Set session cookie if needed
    const cookieStore = await cookies();
    if (!cookieStore.get(SESSION_COOKIE_NAME)) {
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error("[Favorite] Error:", error);
    return NextResponse.json(
      { error: "Failed to update favorite" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gallery/favorite?galleryId=xxx&email=yyy
 *
 * Get favorites for a gallery session/email
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get("galleryId");
    const email = searchParams.get("email");

    if (!galleryId) {
      return NextResponse.json(
        { error: "Gallery ID is required" },
        { status: 400 }
      );
    }

    const sessionId = await getSessionId();

    const favorites = await prisma.galleryFavorite.findMany({
      where: {
        projectId: galleryId,
        OR: [
          { clientEmail: email || null },
          { sessionId: email ? undefined : sessionId },
        ],
      },
      select: { assetId: true },
    });

    const response = NextResponse.json({
      success: true,
      favoriteCount: favorites.length,
      favoriteAssetIds: favorites.map((f) => f.assetId),
    });

    // Set session cookie if needed
    const cookieStore = await cookies();
    if (!cookieStore.get(SESSION_COOKIE_NAME)) {
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error("[Favorite] Error:", error);
    return NextResponse.json(
      { error: "Failed to get favorites" },
      { status: 500 }
    );
  }
}
