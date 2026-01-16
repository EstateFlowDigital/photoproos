import { NextRequest, NextResponse } from "next/server";
import {
  trackEvent,
  upsertSession,
  endSession,
  markConversion,
} from "@/lib/cms/analytics";
import { parseUserAgent, parseReferrer } from "@/lib/cms/analytics-utils";
import type { CMSPageEventType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface TrackEventBody {
  type: "event" | "session_start" | "session_end" | "conversion";
  pageId?: string;
  pageSlug?: string;
  eventType?: CMSPageEventType;
  eventData?: Record<string, unknown>;
  visitorId: string;
  sessionId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingUrl?: string;
  duration?: number;
  conversionType?: string;
}

// ============================================================================
// POST - Track Events
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackEventBody;

    // Get user agent and parse device info
    const userAgent = request.headers.get("user-agent") || "";
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // Get country from headers (set by Vercel/CDN) or IP geolocation
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      undefined;

    // Parse referrer source
    const sourceCategory = parseReferrer(body.referrer || null);

    switch (body.type) {
      case "event":
        if (!body.pageId || !body.pageSlug || !body.eventType) {
          return NextResponse.json(
            { error: "Missing required fields: pageId, pageSlug, eventType" },
            { status: 400 }
          );
        }

        await trackEvent({
          pageId: body.pageId,
          pageSlug: body.pageSlug,
          eventType: body.eventType,
          eventData: body.eventData,
          visitorId: body.visitorId,
          sessionId: body.sessionId,
          referrer: body.referrer,
          utmSource: body.utmSource || (sourceCategory !== "direct" ? sourceCategory : undefined),
          utmMedium: body.utmMedium,
          utmCampaign: body.utmCampaign,
          userAgent,
          deviceType,
          browser,
          os,
          country,
        });
        break;

      case "session_start":
        await upsertSession({
          visitorId: body.visitorId,
          sessionId: body.sessionId,
          pageId: body.pageId,
          pageSlug: body.pageSlug,
          landingUrl: body.landingUrl,
          referrer: body.referrer,
          utmSource: body.utmSource || (sourceCategory !== "direct" ? sourceCategory : undefined),
          utmMedium: body.utmMedium,
          utmCampaign: body.utmCampaign,
          utmTerm: body.utmTerm,
          utmContent: body.utmContent,
          deviceType,
          browser,
          os,
          country,
        });
        break;

      case "session_end":
        if (!body.duration) {
          return NextResponse.json(
            { error: "Missing required field: duration" },
            { status: 400 }
          );
        }
        await endSession(body.sessionId, body.duration);
        break;

      case "conversion":
        if (!body.conversionType) {
          return NextResponse.json(
            { error: "Missing required field: conversionType" },
            { status: 400 }
          );
        }
        await markConversion(body.sessionId, body.conversionType);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid event type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS Preflight
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
