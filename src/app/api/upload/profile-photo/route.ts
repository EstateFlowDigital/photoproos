import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  generatePresignedUploadUrl,
  getPublicUrl,
  isAllowedImageType,
  isValidFileSize,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/storage";

// =============================================================================
// Types
// =============================================================================

interface RequestBody {
  filename: string;
  contentType: string;
  size: number;
}

// Max file size for profile photos: 5MB
const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;

// Allowed profile photo types
const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// =============================================================================
// POST /api/upload/profile-photo
// Generate presigned URL for uploading a profile photo to R2
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the internal user from database
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body: RequestBody = await request.json();
    const { filename, contentType, size } = body;

    // Validate inputs
    if (!filename || !contentType || !size) {
      return NextResponse.json(
        { success: false, error: "Missing filename, contentType, or size" },
        { status: 400 }
      );
    }

    // Validate file type (more restrictive for profile photos)
    if (!PROFILE_PHOTO_TYPES.includes(contentType as typeof PROFILE_PHOTO_TYPES[number])) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${contentType}. Allowed types: JPG, PNG, WebP`,
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max for profile photos)
    if (size > MAX_PROFILE_PHOTO_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File exceeds maximum size of 5MB",
        },
        { status: 400 }
      );
    }

    // Generate a unique key for the profile photo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
    const key = `avatars/${user.id}/${timestamp}-${random}.${extension}`;

    // Generate presigned URL
    const { uploadUrl, publicUrl, expiresAt } = await generatePresignedUploadUrl({
      key,
      contentType,
      contentLength: size,
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        publicUrl,
        key,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] Error generating profile photo upload URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
