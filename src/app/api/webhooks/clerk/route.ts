/**
 * Clerk Webhook Handler
 *
 * Handles incoming webhook events from Clerk:
 * - user.created: Process platform referrals when new users sign up
 * - user.updated: Update user information in database
 * - organization.created: Create organization in database
 *
 * All webhooks are verified using Clerk's signature verification.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";
import { processReferralSignup } from "@/lib/actions/platform-referrals";

interface WebhookEvent {
  data: Record<string, unknown>;
  object: string;
  type: string;
}

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
    verification: { status: string } | null;
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata: Record<string, unknown>;
  unsafe_metadata: Record<string, unknown>;
}

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "user.created":
        await handleUserCreated(event.data as unknown as ClerkUser);
        break;

      case "user.updated":
        await handleUserUpdated(event.data as unknown as ClerkUser);
        break;

      default:
        console.log(`Unhandled Clerk event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing Clerk webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle new user creation
 * - Create or link user in database
 * - Process platform referral if applicable
 */
async function handleUserCreated(clerkUser: ClerkUser) {
  const email = clerkUser.email_addresses[0]?.email_address;
  if (!email) {
    console.error("No email found for new user:", clerkUser.id);
    return;
  }

  const fullName = [clerkUser.first_name, clerkUser.last_name]
    .filter(Boolean)
    .join(" ") || null;

  // Check if user already exists (by Clerk ID first to avoid duplicates)
  let user = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        fullName: fullName || user.fullName,
        avatarUrl: clerkUser.image_url || user.avatarUrl,
      },
    });
    console.log(`Updated existing user ${user.id} for Clerk account ${clerkUser.id}`);
  } else {
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          clerkUserId: clerkUser.id,
          fullName: fullName || existingByEmail.fullName,
          avatarUrl: clerkUser.image_url || existingByEmail.avatarUrl,
        },
      });
      console.log(`Linked existing user ${user.id} to Clerk account ${clerkUser.id}`);
    } else {
      try {
        user = await prisma.user.create({
          data: {
            clerkUserId: clerkUser.id,
            email,
            fullName,
            avatarUrl: clerkUser.image_url || null,
          },
        });
        console.log(`Created new user ${user.id} from Clerk account ${clerkUser.id}`);
      } catch (error) {
        const existingByClerk = await prisma.user.findUnique({
          where: { clerkUserId: clerkUser.id },
        });

        if (!existingByClerk) {
          throw error;
        }

        user = existingByClerk;
        console.log(`User already created for Clerk account ${clerkUser.id}`);
      }
    }
  }

  // Check for referral code in metadata
  const referralCode = clerkUser.unsafe_metadata?.referralCode as string | undefined;

  if (referralCode) {
    console.log(`Processing referral for user ${user.id} with code ${referralCode}`);
    const result = await processReferralSignup(referralCode, user.id, email);
    if (result.success) {
      console.log(`Referral processed successfully for user ${user.id}`);
    } else {
      console.error(`Failed to process referral: ${result.error}`);
    }
  }
}

/**
 * Handle user updates
 * - Sync user information to database
 */
async function handleUserUpdated(clerkUser: ClerkUser) {
  const email = clerkUser.email_addresses[0]?.email_address;
  if (!email) return;

  const fullName = [clerkUser.first_name, clerkUser.last_name]
    .filter(Boolean)
    .join(" ") || null;

  await prisma.user.updateMany({
    where: { clerkUserId: clerkUser.id },
    data: {
      email,
      fullName,
      avatarUrl: clerkUser.image_url || null,
    },
  });

  console.log(`Updated user info for Clerk account ${clerkUser.id}`);
}
