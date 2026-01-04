import { NextRequest, NextResponse } from "next/server";
import { trackPortfolioView, updatePortfolioViewEngagement } from "@/lib/actions/portfolio-websites";

// Get client IP from various headers
function getClientIP(request: NextRequest): string | undefined {
  // Cloudflare
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  // Vercel/standard proxy
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, the first one is the client
    return xForwardedFor.split(",")[0].trim();
  }

  // Railway
  const xRealIP = request.headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  return undefined;
}

// Get geolocation from IP using free API
async function getGeoFromIP(ip: string): Promise<{ country?: string; city?: string }> {
  // Skip for localhost/private IPs
  if (
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip === "::1" ||
    ip === "localhost"
  ) {
    return {};
  }

  try {
    // Use ip-api.com (free, no API key needed, 45 requests/minute limit)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) return {};

    const data = await response.json();

    if (data.status === "success") {
      return {
        country: data.country,
        city: data.city,
      };
    }
  } catch (error) {
    console.error("Error getting geolocation:", error);
  }

  return {};
}

// Track a portfolio view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, visitorId, sessionId, pagePath, referrer, action, viewId, duration, scrollDepth } = body;

    // Handle engagement update (duration, scroll depth)
    if (action === "engagement" && viewId) {
      const result = await updatePortfolioViewEngagement(viewId, {
        duration,
        scrollDepth,
      });
      return NextResponse.json(result);
    }

    // Handle new view tracking
    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug is required" }, { status: 400 });
    }

    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    // Get geolocation data
    let geo: { country?: string; city?: string } = {};
    if (ip) {
      geo = await getGeoFromIP(ip);
    }

    const result = await trackPortfolioView(slug, {
      visitorId,
      sessionId,
      pagePath,
      referrer,
      userAgent,
      ipAddress: ip,
      country: geo.country,
      city: geo.city,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error tracking portfolio view:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track view" },
      { status: 500 }
    );
  }
}
