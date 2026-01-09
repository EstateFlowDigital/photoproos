import { NextRequest, NextResponse } from "next/server";

// Simple password for sitemap access - you can change this
const SITEMAP_PASSWORD = "photopro2024";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === SITEMAP_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Set cookie for 7 days
      response.cookies.set("app-map-access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
