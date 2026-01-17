import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Analytics tracking endpoint
 * Called from frontend to track component events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, events } = body;

    if (!pageId || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process events in batch
    await prisma.$transaction(
      events.map((event: {
        componentId: string;
        componentType: string;
        type: "impression" | "click" | "scroll";
        scrollDepth?: number;
        timeInView?: number;
      }) =>
        prisma.componentAnalytics.upsert({
          where: {
            pageId_componentId_date: {
              pageId,
              componentId: event.componentId,
              date: today,
            },
          },
          create: {
            pageId,
            componentId: event.componentId,
            componentType: event.componentType,
            date: today,
            impressions: event.type === "impression" ? 1 : 0,
            clicks: event.type === "click" ? 1 : 0,
            scrollDepth: event.scrollDepth || 0,
            timeInView: event.timeInView || 0,
          },
          update: {
            impressions: event.type === "impression" ? { increment: 1 } : undefined,
            clicks: event.type === "click" ? { increment: 1 } : undefined,
            ...(event.scrollDepth && { scrollDepth: event.scrollDepth }),
            ...(event.timeInView && { timeInView: { increment: event.timeInView } }),
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return NextResponse.json(
      { error: "Failed to track analytics" },
      { status: 500 }
    );
  }
}

/**
 * A/B test tracking endpoint
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, event } = body;

    if (!variantId || !event) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Update variant metrics
    const updateData: Record<string, { increment: number }> = {};
    switch (event) {
      case "impression":
        updateData.impressions = { increment: 1 };
        break;
      case "click":
        updateData.clicks = { increment: 1 };
        break;
      case "conversion":
        updateData.conversions = { increment: 1 };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid event type" },
          { status: 400 }
        );
    }

    await prisma.aBTestVariant.update({
      where: { id: variantId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking A/B test event:", error);
    return NextResponse.json(
      { error: "Failed to track A/B test event" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to track component analytics, PUT to track A/B test events",
    endpoints: {
      componentAnalytics: {
        method: "POST",
        body: {
          pageId: "string",
          events: [
            {
              componentId: "string",
              componentType: "string",
              type: "impression | click | scroll",
              scrollDepth: "number (optional)",
              timeInView: "number (optional)",
            },
          ],
        },
      },
      abTestTracking: {
        method: "PUT",
        body: {
          variantId: "string",
          event: "impression | click | conversion",
        },
      },
    },
  });
}
