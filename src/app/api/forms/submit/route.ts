import { NextRequest, NextResponse } from "next/server";
import { submitForm } from "@/lib/actions/custom-forms";

// Get client IP from various headers
function getClientIP(request: NextRequest): string | undefined {
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIP = request.headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  return undefined;
}

// Get geolocation from IP
async function getGeoFromIP(ip: string): Promise<{ country?: string; city?: string }> {
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
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      next: { revalidate: 86400 },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, data, visitorId } = body;

    if (!slug || !data) {
      return NextResponse.json(
        { success: false, error: "Slug and data are required" },
        { status: 400 }
      );
    }

    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    let geo: { country?: string; city?: string } = {};
    if (ip) {
      geo = await getGeoFromIP(ip);
    }

    const result = await submitForm(slug, data, {
      visitorId,
      ipAddress: ip,
      userAgent,
      country: geo.country,
      city: geo.city,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
