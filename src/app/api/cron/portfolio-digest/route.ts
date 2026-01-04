import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/resend";
import { PortfolioWeeklyDigestEmail } from "@/emails/portfolio-weekly-digest";

// This route sends weekly portfolio analytics digest emails
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

    // Get all organizations with at least one published portfolio
    const organizations = await prisma.organization.findMany({
      where: {
        portfolioWebsites: {
          some: {
            isPublished: true,
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
        portfolioWebsites: {
          where: { isPublished: true },
          select: {
            id: true,
            name: true,
            slug: true,
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

      // Get analytics for each portfolio
      const portfolioStats = await Promise.all(
        org.portfolioWebsites.map(async (portfolio) => {
          const views = await prisma.portfolioWebsiteView.findMany({
            where: {
              portfolioWebsiteId: portfolio.id,
              createdAt: { gte: weekStart },
            },
            select: {
              visitorId: true,
              country: true,
            },
          });

          const inquiries = await prisma.portfolioInquiry.count({
            where: {
              portfolioWebsiteId: portfolio.id,
              createdAt: { gte: weekStart },
            },
          });

          // Get top country
          const countryMap = new Map<string, number>();
          views.forEach((v) => {
            if (v.country) {
              countryMap.set(v.country, (countryMap.get(v.country) || 0) + 1);
            }
          });
          const topCountry = Array.from(countryMap.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0];

          return {
            name: portfolio.name,
            slug: portfolio.slug,
            views: views.length,
            uniqueVisitors: new Set(views.map((v) => v.visitorId).filter(Boolean)).size,
            inquiries,
            topCountry,
          };
        })
      );

      // Calculate totals
      const totalViews = portfolioStats.reduce((sum, p) => sum + p.views, 0);
      const totalVisitors = portfolioStats.reduce((sum, p) => sum + p.uniqueVisitors, 0);
      const totalInquiries = portfolioStats.reduce((sum, p) => sum + p.inquiries, 0);

      // Skip if no activity
      if (totalViews === 0 && totalInquiries === 0) {
        results.skipped++;
        continue;
      }

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
          subject: `Your Portfolio Week: ${totalViews} views, ${totalInquiries} inquiries`,
          react: PortfolioWeeklyDigestEmail({
            userName: ownerUser.fullName || "there",
            portfolios: portfolioStats,
            totalViews,
            totalVisitors,
            totalInquiries,
            weekStartDate,
            weekEndDate,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portfolios`,
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
    console.error("Portfolio digest cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
