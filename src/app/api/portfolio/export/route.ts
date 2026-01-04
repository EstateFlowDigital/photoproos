import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Export portfolio analytics as CSV or JSON
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get("portfolioId");
    const format = searchParams.get("format") || "csv";
    const timeRange = searchParams.get("timeRange") || "30d";

    if (!portfolioId) {
      return NextResponse.json({ error: "Portfolio ID is required" }, { status: 400 });
    }

    // Verify portfolio belongs to organization
    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId: orgId },
      select: { id: true, name: true, slug: true },
    });

    if (!website) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // Get all views
    const views = await prisma.portfolioWebsiteView.findMany({
      where: {
        portfolioWebsiteId: portfolioId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") {
      return NextResponse.json({
        portfolio: {
          id: website.id,
          name: website.name,
          slug: website.slug,
        },
        exportedAt: new Date().toISOString(),
        timeRange,
        totalViews: views.length,
        views: views.map((v) => ({
          id: v.id,
          timestamp: v.createdAt.toISOString(),
          visitorId: v.visitorId,
          sessionId: v.sessionId,
          pagePath: v.pagePath,
          referrer: v.referrer,
          country: v.country,
          city: v.city,
          duration: v.duration,
          scrollDepth: v.scrollDepth,
          userAgent: v.userAgent,
        })),
      });
    }

    // Generate CSV
    const csvRows: string[] = [];

    // Header row
    csvRows.push([
      "Timestamp",
      "Visitor ID",
      "Session ID",
      "Page Path",
      "Referrer",
      "Country",
      "City",
      "Duration (seconds)",
      "Scroll Depth (%)",
      "User Agent",
    ].join(","));

    // Data rows
    views.forEach((v) => {
      csvRows.push([
        v.createdAt.toISOString(),
        v.visitorId || "",
        v.sessionId || "",
        v.pagePath || "",
        escapeCSV(v.referrer || ""),
        v.country || "",
        v.city || "",
        v.duration?.toString() || "",
        v.scrollDepth?.toString() || "",
        escapeCSV(v.userAgent || ""),
      ].join(","));
    });

    const csv = csvRows.join("\n");
    const filename = `${website.slug}-analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 });
  }
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
