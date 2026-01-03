import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generatePresignedUploadUrl,
} from "@/lib/storage";

// =============================================================================
// Types
// =============================================================================

interface RequestBody {
  bookingFormId: string;
  filename: string;
  contentType: string;
  size: number;
}

// Max file size for booking form uploads: 10MB
const MAX_BOOKING_FORM_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types for booking form uploads
const BOOKING_FORM_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

// =============================================================================
// POST /api/upload/booking-form
// Generate presigned URL for uploading a file for a booking form submission
// This is a public endpoint - no auth required since booking forms are public
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await request.json();
    const { bookingFormId, filename, contentType, size } = body;

    // Validate inputs
    if (!bookingFormId || !filename || !contentType || !size) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the booking form exists and is published
    const bookingForm = await prisma.bookingForm.findFirst({
      where: {
        id: bookingFormId,
        isPublished: true,
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!bookingForm) {
      return NextResponse.json(
        { success: false, error: "Booking form not found" },
        { status: 404 }
      );
    }

    // Validate file type
    if (!BOOKING_FORM_FILE_TYPES.includes(contentType as typeof BOOKING_FORM_FILE_TYPES[number])) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${contentType}. Allowed types: Images (JPG, PNG, WebP, GIF, HEIC), PDF, DOC, DOCX`,
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for booking form files)
    if (size > MAX_BOOKING_FORM_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File exceeds maximum size of 10MB",
        },
        { status: 400 }
      );
    }

    // Generate a unique key for the file
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = filename.split(".").pop()?.toLowerCase() || "file";
    const sanitizedFilename = filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 50);
    const key = `booking-forms/${bookingForm.organizationId}/${bookingFormId}/${timestamp}-${random}-${sanitizedFilename}`;

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
        filename,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] Error generating booking form upload URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
