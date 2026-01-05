import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { syncDropboxChangesForAccount } from "@/lib/actions/dropbox";

// Dropbox webhook verification (GET request)
// Dropbox sends a challenge parameter that we must echo back
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("challenge");

  if (!challenge) {
    return NextResponse.json({ error: "Missing challenge" }, { status: 400 });
  }

  // Echo back the challenge to verify the webhook endpoint
  return new NextResponse(challenge, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// Dropbox webhook notification (POST request)
// Called when files change in the app folder
export async function POST(request: NextRequest) {
  try {
    // Verify the request signature
    const signature = request.headers.get("X-Dropbox-Signature");
    const body = await request.text();

    if (!verifySignature(body, signature)) {
      console.error("Invalid Dropbox webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Parse the notification
    const notification = JSON.parse(body);

    // Get accounts that have changes
    const accounts = notification.list_folder?.accounts || [];

    console.log("Dropbox webhook notification:", {
      accountCount: accounts.length,
    });

    // Process each account that has changes
    // We process in background and return immediately to Dropbox
    // (Dropbox expects quick acknowledgment)
    if (accounts.length > 0) {
      // Fire and forget - sync in background
      Promise.all(
        accounts.map(async (accountId: string) => {
          try {
            const result = await syncDropboxChangesForAccount(accountId);
            if (result.success) {
              console.log(`Dropbox sync completed for account ${accountId}:`, {
                synced: result.synced,
              });
            } else {
              console.error(`Dropbox sync failed for account ${accountId}:`, result.error);
            }
          } catch (error) {
            console.error(`Dropbox sync error for account ${accountId}:`, error);
          }
        })
      ).catch((error) => {
        console.error("Dropbox sync batch error:", error);
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Dropbox webhook:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

function verifySignature(body: string, signature: string | null): boolean {
  const appSecret = process.env.DROPBOX_APP_SECRET;

  // Skip verification in development if no secret configured
  if (!appSecret) {
    console.warn("DROPBOX_APP_SECRET not configured, skipping signature verification");
    return true;
  }

  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
