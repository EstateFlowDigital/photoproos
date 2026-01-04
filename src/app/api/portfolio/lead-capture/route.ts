import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, email, name, phone, company, message, extraData } = body;

    if (!slug || !email) {
      return NextResponse.json(
        { success: false, error: "Slug and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Get the portfolio
    const website = await prisma.portfolioWebsite.findUnique({
      where: { slug },
      select: {
        id: true,
        organizationId: true,
        requireLeadCapture: true,
      },
    });

    if (!website) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Get geolocation from request headers
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               request.headers.get("cf-connecting-ip") ||
               request.headers.get("x-real-ip");

    let country: string | undefined;
    let city: string | undefined;

    // Try to get geolocation (skip for local IPs)
    if (ip && !ip.startsWith("127.") && !ip.startsWith("192.168.") && !ip.startsWith("10.") && ip !== "::1") {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === "success") {
            country = geoData.country;
            city = geoData.city;
          }
        }
      } catch {
        // Silently fail geolocation
      }
    }

    // Check if lead already exists (by email for this portfolio)
    const existingLead = await prisma.portfolioLead.findFirst({
      where: {
        portfolioWebsiteId: website.id,
        email: email.toLowerCase(),
      },
    });

    if (!existingLead) {
      // Create new lead
      await prisma.portfolioLead.create({
        data: {
          portfolioWebsiteId: website.id,
          organizationId: website.organizationId,
          email: email.toLowerCase(),
          name: name || null,
          phone: phone || null,
          company: company || null,
          message: message || null,
          extraData: extraData || null,
          referrer: request.headers.get("referer") || null,
          country,
          city,
        },
      });
    }

    // Set cookie to grant access (valid for 30 days)
    const cookieStore = await cookies();
    cookieStore.set(`portfolio-lead-${slug}`, "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error capturing lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit" },
      { status: 500 }
    );
  }
}
