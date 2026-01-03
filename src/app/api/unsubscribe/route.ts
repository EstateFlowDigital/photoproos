import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

/**
 * GET /api/unsubscribe
 * Fetch current email preferences for a client using their unsubscribe token
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const clientId = verifyUnsubscribeToken(token);

  if (!clientId) {
    return NextResponse.json(
      { error: "Invalid or expired unsubscribe link" },
      { status: 400 }
    );
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        email: true,
        emailOptIn: true,
        questionnaireEmailsOptIn: true,
        marketingEmailsOptIn: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/unsubscribe
 * Update email preferences for a client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, emailOptIn, questionnaireEmailsOptIn, marketingEmailsOptIn } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const clientId = verifyUnsubscribeToken(token);

    if (!clientId) {
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe link" },
        { status: 400 }
      );
    }

    // Update client preferences
    await prisma.client.update({
      where: { id: clientId },
      data: {
        emailOptIn: emailOptIn ?? true,
        questionnaireEmailsOptIn: emailOptIn === false ? false : (questionnaireEmailsOptIn ?? true),
        marketingEmailsOptIn: emailOptIn === false ? false : (marketingEmailsOptIn ?? false),
      },
    });

    // Log the preference change
    console.log(`[Unsubscribe] Client ${clientId} updated preferences:`, {
      emailOptIn,
      questionnaireEmailsOptIn,
      marketingEmailsOptIn,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating client preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
