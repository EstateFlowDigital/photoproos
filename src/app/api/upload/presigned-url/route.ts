import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  generateFileKey,
  generateBatchPresignedUrls,
  isAllowedImageType,
  isValidFileSize,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/storage";

// =============================================================================
// Types
// =============================================================================

interface FileRequest {
  filename: string;
  contentType: string;
  size: number;
}

interface RequestBody {
  galleryId: string;
  files: FileRequest[];
}

// =============================================================================
// POST /api/upload/presigned-url
// Generate presigned URLs for uploading files to R2
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

    // Require organization ID - no demo mode fallback for security
    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "Organization not found. Please select an organization." },
        { status: 403 }
      );
    }

    const organizationId = orgId;

    // Parse request body
    const body: RequestBody = await request.json();
    const { galleryId, files } = body;

    // Validate inputs
    if (!galleryId) {
      return NextResponse.json(
        { success: false, error: "Gallery ID is required" },
        { status: 400 }
      );
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > 50) {
      return NextResponse.json(
        { success: false, error: "Maximum 50 files per upload" },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of files) {
      if (!file.filename || !file.contentType || !file.size) {
        return NextResponse.json(
          { success: false, error: "Invalid file data: missing filename, contentType, or size" },
          { status: 400 }
        );
      }

      if (!isAllowedImageType(file.contentType)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${file.contentType}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
          },
          { status: 400 }
        );
      }

      if (!isValidFileSize(file.size)) {
        const maxMB = MAX_FILE_SIZE / (1024 * 1024);
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.filename}" exceeds maximum size of ${maxMB}MB`,
          },
          { status: 400 }
        );
      }
    }

    // Verify gallery exists and belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: {
        id: galleryId,
        organizationId,
      },
      select: { id: true },
    });

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: "Gallery not found or access denied" },
        { status: 404 }
      );
    }

    // Generate keys and presigned URLs for each file
    const filesWithKeys = files.map((file) => ({
      ...file,
      key: generateFileKey(organizationId, galleryId, file.filename),
    }));

    const presignedUrls = await generateBatchPresignedUrls(
      filesWithKeys.map((f) => ({
        key: f.key,
        contentType: f.contentType,
        contentLength: f.size,
      })),
      3600 // 1 hour expiration
    );

    // Combine file info with presigned URLs
    const result = filesWithKeys.map((file, index) => ({
      filename: file.filename,
      key: file.key,
      uploadUrl: presignedUrls[index].uploadUrl,
      publicUrl: presignedUrls[index].publicUrl,
      expiresAt: presignedUrls[index].expiresAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: { files: result },
    });
  } catch (error) {
    console.error("[API] Error generating presigned URLs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload URLs" },
      { status: 500 }
    );
  }
}
