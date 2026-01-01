import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/storage";
import { revalidatePath } from "next/cache";

// =============================================================================
// Types
// =============================================================================

interface AssetData {
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

interface RequestBody {
  galleryId: string;
  assets: AssetData[];
}

// =============================================================================
// POST /api/upload/complete
// Create asset records after successful upload to R2
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

    // For now, use a default org ID if not available (demo mode support)
    const organizationId = orgId || "demo-org";

    // Parse request body
    const body: RequestBody = await request.json();
    const { galleryId, assets } = body;

    // Validate inputs
    if (!galleryId) {
      return NextResponse.json(
        { success: false, error: "Gallery ID is required" },
        { status: 400 }
      );
    }

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json(
        { success: false, error: "No assets provided" },
        { status: 400 }
      );
    }

    // Verify gallery exists and get current asset count for sort order
    const gallery = await prisma.project.findFirst({
      where: {
        id: galleryId,
        ...(organizationId !== "demo-org" && { organizationId }),
      },
      select: {
        id: true,
        organizationId: true,
        _count: { select: { assets: true } },
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: "Gallery not found" },
        { status: 404 }
      );
    }

    const startingSortOrder = gallery._count.assets;

    // Create all assets in a transaction
    const createdAssets = await prisma.$transaction(
      assets.map((asset, index) =>
        prisma.asset.create({
          data: {
            projectId: galleryId,
            filename: asset.filename,
            originalUrl: getPublicUrl(asset.key),
            mimeType: asset.mimeType,
            sizeBytes: asset.sizeBytes,
            width: asset.width,
            height: asset.height,
            sortOrder: startingSortOrder + index,
          },
        })
      )
    );

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: gallery.organizationId,
        action: "file_uploaded",
        resourceType: "project",
        resourceId: galleryId,
        userId,
        metadata: {
          count: assets.length,
          filenames: assets.map((a) => a.filename),
        },
      },
    });

    // Revalidate gallery pages
    revalidatePath(`/galleries/${galleryId}`);

    return NextResponse.json({
      success: true,
      data: {
        assets: createdAssets.map((asset) => ({
          id: asset.id,
          originalUrl: asset.originalUrl,
          filename: asset.filename,
        })),
      },
    });
  } catch (error) {
    console.error("[API] Error creating assets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save photos" },
      { status: 500 }
    );
  }
}
