import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/resend";
import { PropertyWeeklyDigestEmail } from "@/emails/property-weekly-digest";

// This route sends weekly property website analytics digest emails
// Recommended schedule: Run once per week (e.g., Monday at 9 AM)

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all organizations with at least one published property website
    const organizations = await prisma.organization.findMany({
      where: {
        projects: {
          some: {
            propertyWebsite: {
              isPublished: true,
            },
          },
        },
      },
      include: {
        members: {
          where: { role: "owner" },
          include: {
            user: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
          take: 1,
        },
        projects: {
          where: {
            propertyWebsite: {
              isPublished: true,
            },
          },
          select: {
            propertyWebsite: {
              select: {
                id: true,
                address: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
    });

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const org of organizations) {
      results.processed++;

      const ownerUser = org.members[0]?.user;
      if (!ownerUser?.email) {
        results.skipped++;
        continue;
      }

      // Get property websites for this org
      const propertyWebsites = org.projects
        .map((p) => p.propertyWebsite)
        .filter((pw): pw is NonNullable<typeof pw> => pw !== null);

      if (propertyWebsites.length === 0) {
        results.skipped++;
        continue;
      }

      // Get analytics for each property website
      const propertyStats = await Promise.all(
        propertyWebsites.map(async (property) => {
          // Get views from this week
          const views = await prisma.propertyWebsiteView.findMany({
            where: {
              propertyWebsiteId: property.id,
              viewedAt: { gte: weekStart },
            },
            select: {
              visitorId: true,
              referrer: true,
            },
          });

          // Get leads from this week
          const leads = await prisma.propertyLead.count({
            where: {
              propertyWebsiteId: property.id,
              createdAt: { gte: weekStart },
            },
          });

          // Get top referrer
          const referrerMap = new Map<string, number>();
          views.forEach((v) => {
            if (v.referrer) {
              // Extract domain from referrer
              try {
                const domain = new URL(v.referrer).hostname.replace("www.", "");
                referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1);
              } catch {
                // Invalid URL, skip
              }
            }
          });
          const topReferrer = Array.from(referrerMap.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0];

          return {
            id: property.id,
            address: property.address,
            city: property.city,
            state: property.state,
            views: views.length,
            uniqueVisitors: new Set(views.map((v) => v.visitorId).filter(Boolean)).size,
            leads,
            topReferrer,
          };
        })
      );

      // Calculate totals
      const totalViews = propertyStats.reduce((sum, p) => sum + p.views, 0);
      const totalVisitors = propertyStats.reduce((sum, p) => sum + p.uniqueVisitors, 0);
      const totalLeads = propertyStats.reduce((sum, p) => sum + p.leads, 0);

      // Skip if no activity
      if (totalViews === 0 && totalLeads === 0) {
        results.skipped++;
        continue;
      }

      // Calculate views change from previous week
      const previousWeekViews = await prisma.propertyWebsiteView.count({
        where: {
          propertyWebsiteId: {
            in: propertyWebsites.map((p) => p.id),
          },
          viewedAt: {
            gte: previousWeekStart,
            lt: weekStart,
          },
        },
      });

      const viewsChange = previousWeekViews > 0
        ? Math.round(((totalViews - previousWeekViews) / previousWeekViews) * 100)
        : totalViews > 0
        ? 100
        : 0;

      // Format dates
      const weekStartDate = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const weekEndDate = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      try {
        await sendEmail({
          to: ownerUser.email,
          subject: `Your Property Websites: ${totalViews} views, ${totalLeads} leads this week`,
          react: PropertyWeeklyDigestEmail({
            userName: ownerUser.fullName || "there",
            properties: propertyStats,
            totalViews,
            totalVisitors,
            totalLeads,
            viewsChange,
            weekStartDate,
            weekEndDate,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/properties`,
          }),
        });
        results.sent++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Failed to send to ${ownerUser.email}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} organizations`,
      results,
    });
  } catch (error) {
    console.error("Property digest cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
