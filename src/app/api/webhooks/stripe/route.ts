import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

/**
 * Stripe Webhook Handler
 *
 * Handles events from Stripe for:
 * - Checkout session completion (pay-to-unlock galleries)
 * - Connect account updates
 * - Payment intent success
 */

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found in request");
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      default:
        // Log unhandled events for debugging
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 * This is the primary event for pay-to-unlock galleries
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const galleryId = session.metadata?.galleryId;
  const organizationId = session.metadata?.organizationId;
  const clientId = session.metadata?.clientId;

  if (!galleryId || !organizationId) {
    console.error("Missing galleryId or organizationId in session metadata");
    return;
  }

  // Check if we already recorded this payment (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeCheckoutSessionId: session.id,
    },
  });

  if (existingPayment) {
    console.log(`Payment already recorded for session ${session.id}`);
    return;
  }

  // Get the gallery to verify it exists
  const gallery = await prisma.project.findUnique({
    where: { id: galleryId },
  });

  if (!gallery) {
    console.error(`Gallery not found: ${galleryId}`);
    return;
  }

  // Record the payment
  await prisma.payment.create({
    data: {
      organizationId,
      projectId: galleryId,
      clientId: clientId || null,
      amountCents: session.amount_total || 0,
      currency: session.currency?.toUpperCase() || "USD",
      status: "paid",
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      paidAt: new Date(),
    },
  });

  console.log(
    `Payment recorded for gallery ${galleryId}: $${(session.amount_total || 0) / 100}`
  );

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId,
      type: "gallery_paid",
      description: `Gallery "${gallery.name}" was paid for ($${((session.amount_total || 0) / 100).toFixed(2)})`,
      projectId: galleryId,
      clientId: clientId || null,
    },
  });
}

/**
 * Handle Connect account updates
 * Updates the organization's Stripe Connect status
 */
async function handleAccountUpdated(account: Stripe.Account) {
  // Find the organization with this Connect account
  const organization = await prisma.organization.findFirst({
    where: {
      stripeConnectAccountId: account.id,
    },
  });

  if (!organization) {
    console.log(`No organization found for Connect account ${account.id}`);
    return;
  }

  // Determine if the account is fully onboarded
  const isOnboarded =
    account.charges_enabled &&
    account.payouts_enabled &&
    account.details_submitted;

  // Update the organization's Connect status
  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      stripeConnectOnboarded: isOnboarded,
    },
  });

  console.log(
    `Updated Connect status for org ${organization.id}: onboarded=${isOnboarded}`
  );
}

/**
 * Handle successful payment intent
 * This is a backup for checkout.session.completed
 * Also handles direct payment intents (not from Checkout)
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  const galleryId = paymentIntent.metadata?.galleryId;

  if (!galleryId) {
    // Not a gallery payment, skip
    return;
  }

  // Check if we already have a payment recorded for this intent
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  if (existingPayment) {
    // Already recorded, update status if needed
    if (existingPayment.status !== "paid") {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "paid",
          paidAt: new Date(),
        },
      });
    }
    return;
  }

  // If we don't have a record, the checkout.session.completed handler
  // should have created it. Log a warning.
  console.warn(
    `No payment record found for payment intent ${paymentIntent.id} (gallery: ${galleryId})`
  );
}

/**
 * Handle failed payment intent
 * Mark the payment as failed if we have a record
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: "failed",
      },
    });
    console.log(`Payment ${existingPayment.id} marked as failed`);
  }
}
