/**
 * Gallery Expiration Warnings Cron Endpoint
 *
 * Sends automated warnings for galleries that are about to expire.
 *
 * Schedule Recommendation: Run once daily (e.g., 9 AM)
 *
 * Features:
 * - Sends warnings at 7 days, 3 days, and 1 day before expiration
 * - Respects client email opt-in preferences
 * - Tracks which warnings have been sent per gallery
 * - Only sends warnings for published galleries with expiration dates
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendGalleryExpirationEmail } from "@/lib/email/send";

const CRON_SECRET = process.env.CRON_SECRET;

// Days before expiration to send warnings
const WARNING_DAYS = [7, 3, 1];

interface ExpirationWarningResult {
  galleryId: string;
  galleryName: string;
  clientEmail: string;
  daysRemaining: number;
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
    const results: ExpirationWarningResult[] = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Find galleries expiring in the next 7 days
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 8); // 7 days + buffer

    const expiringGalleries = await prisma.project.findMany({
      where: {
        status: "delivered",
        expiresAt: {
          gte: now,
          lte: maxDate,
        },
      },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        expirationWarningsSent: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
          take: 1,
        },
        client: {
          select: {
            fullName: true,
            email: true,
            emailOptIn: true,
          },
        },
        organization: {
          select: {
            publicName: true,
            name: true,
            publicEmail: true,
          },
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";

    for (const gallery of expiringGalleries) {
      // Skip if no client email or opted out
      if (!gallery.client?.email || gallery.client.emailOptIn === false) {
        continue;
      }

      // Calculate days remaining
      const expiresAt = gallery.expiresAt as Date;
      const timeDiff = expiresAt.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // Determine if we should send a warning based on days remaining
      const warningDay = WARNING_DAYS.find((day) => daysRemaining <= day);
      if (!warningDay) continue;

      // Check if this warning level has already been sent
      const warningsSent = (gallery.expirationWarningsSent as number[]) || [];
      if (warningsSent.includes(warningDay)) {
        continue;
      }

      // Build gallery URL
      const deliverySlug = gallery.deliveryLinks[0]?.slug;
      const galleryUrl = deliverySlug
        ? `${baseUrl}/g/${deliverySlug}`
        : `${baseUrl}/galleries/${gallery.id}`;

      // Determine urgency level
      const urgency: "reminder" | "warning" | "urgent" =
        daysRemaining <= 1 ? "urgent" : daysRemaining <= 3 ? "warning" : "reminder";

      try {
        // Send the warning email
        const result = await sendGalleryExpirationEmail({
          to: gallery.client.email,
          clientName: gallery.client.fullName || "Valued Client",
          galleryName: gallery.name,
          galleryUrl,
          daysRemaining,
          photographerName:
            gallery.organization.publicName || gallery.organization.name,
          photographerEmail: gallery.organization.publicEmail || undefined,
        });

        if (result.success) {
          // Update the warnings sent array
          await prisma.project.update({
            where: { id: gallery.id },
            data: {
              expirationWarningsSent: [...warningsSent, warningDay],
            },
          });

          totalSent++;
          results.push({
            galleryId: gallery.id,
            galleryName: gallery.name,
            clientEmail: gallery.client.email,
            daysRemaining,
            success: true,
          });
        } else {
          totalFailed++;
          results.push({
            galleryId: gallery.id,
            galleryName: gallery.name,
            clientEmail: gallery.client.email,
            daysRemaining,
            success: false,
            error: result.error,
          });
        }
      } catch (error) {
        totalFailed++;
        results.push({
          galleryId: gallery.id,
          galleryName: gallery.name,
          clientEmail: gallery.client.email,
          daysRemaining,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(
      `[Gallery Expiration] Sent: ${totalSent}, Failed: ${totalFailed}`
    );

    return NextResponse.json({
      success: true,
      totalSent,
      totalFailed,
      galleriesChecked: expiringGalleries.length,
      details: results,
    });
  } catch (error) {
    console.error("Error in gallery-expiration cron:", error);
    return NextResponse.json(
      { error: "Failed to process gallery expiration warnings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
