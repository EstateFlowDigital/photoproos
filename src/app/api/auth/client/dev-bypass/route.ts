import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

const CLIENT_SESSION_COOKIE = "client_session";
const SESSION_EXPIRY_DAYS = 7;

/**
 * DEV ONLY: Bypass magic link authentication for testing
 * GET /api/auth/client/dev-bypass?client_id=xxx OR ?email=xxx
 *
 * If no params provided, uses the first client in the database
 */
export async function GET(request: NextRequest) {
  // Only allow in development or when explicitly enabled
  const isDev = process.env.NODE_ENV === "development";
  const bypassEnabled = process.env.ENABLE_DEV_AUTH_BYPASS === "true";

  if (!isDev && !bypassEnabled) {
    return NextResponse.json(
      { error: "Dev bypass is disabled in production" },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get("client_id");
  const email = searchParams.get("email");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalUrl = `${baseUrl}/portal`;

  try {
    // Find client by ID, email, or get first client
    let client;

    if (clientId) {
      client = await prisma.client.findUnique({
        where: { id: clientId },
      });
    } else if (email) {
      client = await prisma.client.findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      });
    } else {
      // Get first client if no params
      client = await prisma.client.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }

    if (!client) {
      return NextResponse.json(
        { error: "No client found. Create a client first." },
        { status: 404 }
      );
    }

    // Delete any existing sessions for this client
    await prisma.clientSession.deleteMany({
      where: { clientId: client.id },
    });

    // Create a new session
    const sessionToken = randomBytes(32).toString("hex");
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + SESSION_EXPIRY_DAYS);

    await prisma.clientSession.create({
      data: {
        clientId: client.id,
        token: sessionToken,
        expiresAt: sessionExpiry,
      },
    });

    // Create redirect response and set cookie on it
    const response = NextResponse.redirect(portalUrl);
    response.cookies.set(CLIENT_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: sessionExpiry,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Dev bypass error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
