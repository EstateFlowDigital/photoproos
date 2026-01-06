/**
 * Gallery Auto-Archive Cron Endpoint
 *
 * Automatically archives galleries that have passed their expiration date.
 *
 * Schedule Recommendation: Run once daily (e.g., midnight or 1 AM)
 *
 * Features:
 * - Archives galleries that have expired
 * - Respects organization's autoArchiveExpiredGalleries setting
 * - Only processes delivered galleries with expiration dates
 * - Logs all actions for audit purposes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CRON_SECRET = process.env.CRON_SECRET;

interface ArchiveResult {
  galleryId: string;
  galleryName: string;
  organizationId: string;
  expiredAt: Date;
  success: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const results: ArchiveResult[] = [];
    let totalArchived = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    // Find all galleries that have expired and are still delivered (not archived)
    const expiredGalleries = await prisma.project.findMany({
      where: {
        status: "delivered",
        expiresAt: {
          lt: now, // Expired before now
        },
      },
      select: {
        id: true,
        name: true,
        organizationId: true,
        expiresAt: true,
        organization: {
          select: {
            autoArchiveExpiredGalleries: true,
          },
        },
      },
    });

    console.log(
      `[Gallery Auto-Archive] Found ${expiredGalleries.length} expired galleries`
    );

    for (const gallery of expiredGalleries) {
      // Check if organization has auto-archive enabled
      if (!gallery.organization.autoArchiveExpiredGalleries) {
        totalSkipped++;
        continue;
      }

      try {
        // Archive the gallery
        await prisma.project.update({
          where: { id: gallery.id },
          data: {
            status: "archived",
            archivedAt: now,
          },
        });

        totalArchived++;
        results.push({
          galleryId: gallery.id,
          galleryName: gallery.name,
          organizationId: gallery.organizationId,
          expiredAt: gallery.expiresAt as Date,
          success: true,
        });

        console.log(
          `[Gallery Auto-Archive] Archived gallery "${gallery.name}" (${gallery.id})`
        );
      } catch (error) {
        totalFailed++;
        results.push({
          galleryId: gallery.id,
          galleryName: gallery.name,
          organizationId: gallery.organizationId,
          expiredAt: gallery.expiresAt as Date,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        console.error(
          `[Gallery Auto-Archive] Failed to archive gallery "${gallery.name}" (${gallery.id}):`,
          error
        );
      }
    }

    console.log(
      `[Gallery Auto-Archive] Archived: ${totalArchived}, Failed: ${totalFailed}, Skipped: ${totalSkipped}`
    );

    return NextResponse.json({
      success: true,
      totalArchived,
      totalFailed,
      totalSkipped,
      galleriesChecked: expiredGalleries.length,
      details: results,
    });
  } catch (error) {
    console.error("Error in gallery-auto-archive cron:", error);
    return NextResponse.json(
      { error: "Failed to process gallery auto-archive" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
