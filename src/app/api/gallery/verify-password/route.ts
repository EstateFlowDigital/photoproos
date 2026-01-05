import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * POST /api/gallery/verify-password
 *
 * Verify password for a protected gallery
 * Body: { galleryId: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { galleryId, password } = body;

    if (!galleryId || !password) {
      return NextResponse.json(
        { error: "Gallery ID and password are required" },
        { status: 400 }
      );
    }

    // Find the gallery
    const project = await prisma.project.findUnique({
      where: { id: galleryId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Check if password matches
    // Note: In production, you should use bcrypt to hash and compare passwords
    if (project.password !== password) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Set a cookie to remember the authenticated access
    // Cookie expires in 24 hours
    const cookieStore = await cookies();
    cookieStore.set(`gallery_auth_${galleryId}`, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[Gallery Password] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gallery/verify-password
 *
 * Check if user is authenticated for a gallery
 * Query: galleryId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get("galleryId");

    if (!galleryId) {
      return NextResponse.json(
        { error: "Gallery ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const authCookie = cookieStore.get(`gallery_auth_${galleryId}`);

    return NextResponse.json({
      isAuthenticated: authCookie?.value === "authenticated",
    });
  } catch (error) {
    console.error("[Gallery Password] Error:", error);
    return NextResponse.json(
      { error: "Failed to check authentication" },
      { status: 500 }
    );
  }
}
