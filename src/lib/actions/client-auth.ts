"use server";

import { fail } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email/resend";
import { ClientMagicLinkEmail } from "@/emails/client-magic-link";

// Cookie name for client session
const CLIENT_SESSION_COOKIE = "client_session";

// Session expires in 7 days
const SESSION_EXPIRY_DAYS = 7;

// Magic link expires in 15 minutes
const MAGIC_LINK_EXPIRY_MINUTES = 15;

/**
 * Generate and send a magic link to a client email
 */
export async function sendClientMagicLink(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Find client by email
    const client = await prisma.client.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!client) {
      // Don't reveal if email exists or not for security
      return { success: true };
    }

    // Generate a secure token
    const token = randomBytes(32).toString("hex");

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + MAGIC_LINK_EXPIRY_MINUTES);

    // SECURITY FIX: Delete ALL existing sessions for this client
    // This ensures single-session model and prevents token accumulation
    await prisma.clientSession.deleteMany({
      where: {
        clientId: client.id,
      },
    });

    // Create a new session with the magic link token
    await prisma.clientSession.create({
      data: {
        clientId: client.id,
        token,
        expiresAt,
      },
    });

    // Build the magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const magicLinkUrl = `${baseUrl}/api/auth/client?token=${token}`;

    // Send the email
    const emailResult = await sendEmail({
      to: client.email,
      subject: "Your Client Portal Login Link",
      react: ClientMagicLinkEmail({
        clientName: client.fullName || "there",
        magicLinkUrl,
        expiresInMinutes: MAGIC_LINK_EXPIRY_MINUTES,
      }),
    });

    if (!emailResult.success) {
      console.error("Failed to send magic link email:", emailResult.error);
      return fail("Failed to send email. Please try again.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending magic link:", error);
    return fail("An unexpected error occurred");
  }
}

/**
 * Validate a magic link token and create a session
 */
export async function validateMagicLinkToken(token: string): Promise<{
  success: boolean;
  clientId?: string;
  error?: string;
}> {
  try {
    // Find the session by token
    const session = await prisma.clientSession.findUnique({
      where: { token },
      include: { client: true },
    });

    if (!session) {
      return fail("Invalid or expired link");
    }

    // Check if token is expired
    if (session.expiresAt < new Date()) {
      // Delete the expired session
      await prisma.clientSession.delete({ where: { id: session.id } });
      return fail("This link has expired. Please request a new one.");
    }

    // Generate a new long-lived session token
    const sessionToken = randomBytes(32).toString("hex");
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + SESSION_EXPIRY_DAYS);

    // SECURITY FIX: Delete the magic link token (one-time use) and create a new session
    // This prevents token reuse if intercepted
    await prisma.$transaction([
      // Delete the magic link session (one-time use)
      prisma.clientSession.delete({
        where: { id: session.id },
      }),
      // Create a new long-lived session
      prisma.clientSession.create({
        data: {
          clientId: session.clientId,
          token: sessionToken,
          expiresAt: sessionExpiry,
        },
      }),
    ]);

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set(CLIENT_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: sessionExpiry,
      path: "/",
    });

    return { success: true, clientId: session.clientId };
  } catch (error) {
    console.error("Error validating magic link:", error);
    return fail("An unexpected error occurred");
  }
}

/**
 * Get the current client session from cookies
 */
export async function getClientSession(): Promise<{
  clientId: string;
  client: {
    id: string;
    fullName: string | null;
    email: string;
    company: string | null;
  };
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await prisma.clientSession.findUnique({
      where: { token: sessionToken },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clear invalid/expired cookie
      cookieStore.delete(CLIENT_SESSION_COOKIE);
      return null;
    }

    return {
      clientId: session.clientId,
      client: session.client,
    };
  } catch (error) {
    console.error("Error getting client session:", error);
    return null;
  }
}

/**
 * Log out the current client session
 */
export async function logoutClient(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

    if (sessionToken) {
      // Delete the session from database
      await prisma.clientSession.deleteMany({
        where: { token: sessionToken },
      });

      // Clear the cookie
      cookieStore.delete(CLIENT_SESSION_COOKIE);
    }

    return { success: true };
  } catch (error) {
    console.error("Error logging out client:", error);
    return { success: true }; // Still return success to clear local state
  }
}

/**
 * Require client authentication - throws redirect if not authenticated
 */
export async function requireClientAuth(): Promise<{
  clientId: string;
  client: {
    id: string;
    fullName: string | null;
    email: string;
    company: string | null;
  };
}> {
  const session = await getClientSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}
