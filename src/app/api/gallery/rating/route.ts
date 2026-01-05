import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { favoritesRatelimit, checkRateLimit, getClientIP } from "@/lib/ratelimit";

const SESSION_COOKIE_NAME = "gallery_session";

/**
 * POST /api/gallery/rating
 *
 * Rate a photo (1-5 stars).
 * Body: { galleryId: string, assetId: string, rating: number }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (using favorites rate limiter)
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(favoritesRatelimit, clientIP);
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
    const { galleryId, assetId, rating } = body;

    if (!galleryId || !assetId || rating === undefined) {
      return NextResponse.json(
        { error: "Gallery ID, asset ID, and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating is 1-5
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get or create session ID for tracking
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Verify asset belongs to the gallery
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

    // Upsert the rating (update if exists, create if not)
    const ratingRecord = await prisma.photoRating.upsert({
      where: {
        assetId_sessionId: {
          assetId,
          sessionId,
        },
      },
      update: {
        rating: ratingNum,
      },
      create: {
        projectId: galleryId,
        assetId,
        rating: ratingNum,
        sessionId,
      },
    });

    const response = NextResponse.json({
      success: true,
      rating: {
        id: ratingRecord.id,
        rating: ratingRecord.rating,
        assetId: ratingRecord.assetId,
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
    console.error("[Rating] Error:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gallery/rating?galleryId=xxx&assetId=yyy
 *
 * Get ratings for a gallery or specific photo.
 * Returns average ratings and user's own rating (if session exists).
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

    // Get session ID to return user's own rating
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Get all ratings for the gallery (or specific asset)
    const whereClause: { projectId: string; assetId?: string } = {
      projectId: galleryId,
    };

    if (assetId) {
      whereClause.assetId = assetId;
    }

    const ratings = await prisma.photoRating.findMany({
      where: whereClause,
      select: {
        id: true,
        assetId: true,
        rating: true,
        sessionId: true,
      },
    });

    // Calculate averages per asset and identify user's ratings
    const averages: Record<string, { average: number; count: number }> = {};
    const userRatings: Record<string, number> = {};

    for (const r of ratings) {
      if (!averages[r.assetId]) {
        averages[r.assetId] = { average: 0, count: 0 };
      }
      averages[r.assetId].average += r.rating;
      averages[r.assetId].count += 1;

      if (sessionId && r.sessionId === sessionId) {
        userRatings[r.assetId] = r.rating;
      }
    }

    // Calculate actual averages
    for (const assetId of Object.keys(averages)) {
      averages[assetId].average = Math.round(
        (averages[assetId].average / averages[assetId].count) * 10
      ) / 10;
    }

    return NextResponse.json({
      success: true,
      averages,
      userRatings,
    });
  } catch (error) {
    console.error("[Rating] Error:", error);
    return NextResponse.json(
      { error: "Failed to get ratings" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gallery/rating
 *
 * Remove a rating (requires matching session).
 * Body: { assetId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Get session ID from cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session not found. You can only remove your own ratings." },
        { status: 401 }
      );
    }

    // Delete the rating
    await prisma.photoRating.delete({
      where: {
        assetId_sessionId: {
          assetId,
          sessionId,
        },
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[Rating] Error:", error);
    return NextResponse.json(
      { error: "Failed to remove rating" },
      { status: 500 }
    );
  }
}
