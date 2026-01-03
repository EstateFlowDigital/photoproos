/**
 * Stripe Webhook Handler
 *
 * Handles incoming webhook events from Stripe:
 * - checkout.session.completed: Gallery payments and order payments
 * - account.updated: Connect account onboarding status
 * - payment_intent.succeeded: Backup for checkout completion
 * - payment_intent.payment_failed: Mark payments as failed
 *
 * All webhooks are verified using Stripe's signature verification.
 * Emails are sent asynchronously to avoid blocking webhook response.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendPaymentReceiptEmail, sendOrderConfirmationEmail } from "@/lib/email/send";
import { notifySlackPayment } from "@/lib/actions/slack";
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
    event = getStripe().webhooks.constructEvent(
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
 * This handles both gallery payments and order payments
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const orderId = session.metadata?.orderId;
  const galleryId = session.metadata?.galleryId;
  const organizationId = session.metadata?.organizationId;
  const clientId = session.metadata?.clientId;

  // Handle order payments
  if (orderId) {
    await handleOrderPaymentCompleted(session, orderId);
    return;
  }

  // Handle gallery payments
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

  // Send Slack notification (non-blocking)
  try {
    await notifySlackPayment({
      organizationId,
      paymentId: session.id,
      amountCents: session.amount_total || 0,
      clientName: session.customer_details?.name || null,
      clientEmail: session.customer_email || null,
      description: `Gallery: ${gallery.name}`,
    });
  } catch (slackError) {
    console.error("[Stripe Webhook] Failed to send Slack notification:", slackError);
  }

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

  // Send payment receipt email (non-blocking - don't fail webhook if email fails)
  if (session.customer_email) {
    try {
      // Get organization for photographer name
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true },
      });

      // Get delivery link for gallery URL
      const deliveryLink = await prisma.deliveryLink.findFirst({
        where: { projectId: galleryId, isActive: true },
        select: { slug: true },
      });

      const galleryUrl = deliveryLink
        ? `${process.env.NEXT_PUBLIC_APP_URL}/g/${deliveryLink.slug}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/g/${galleryId}`;

      await sendPaymentReceiptEmail({
        to: session.customer_email,
        clientName: session.customer_details?.name || "there",
        galleryName: gallery.name,
        galleryUrl,
        amountCents: session.amount_total || 0,
        currency: session.currency?.toUpperCase() || "USD",
        photographerName: organization?.name || "Your Photographer",
        transactionId: session.id,
      });
    } catch (emailError) {
      // Log email failure but don't fail the webhook - payment was already recorded
      console.error("[Stripe Webhook] Failed to send payment receipt email:", emailError);
    }
  }
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

/**
 * Handle order payment completed
 * Updates order status and logs activity
 */
async function handleOrderPaymentCompleted(
  session: Stripe.Checkout.Session,
  orderId: string
) {
  // Find the order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      organization: { select: { name: true } },
      items: true,
    },
  });

  if (!order) {
    console.error(`Order not found: ${orderId}`);
    return;
  }

  // Check if already paid (idempotency)
  if (order.status === "paid") {
    console.log(`Order ${orderId} already marked as paid`);
    return;
  }

  // Update order to paid status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      paidAt: new Date(),
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      paymentMethod: "card",
    },
  });

  console.log(
    `Order ${order.orderNumber} marked as paid: $${(order.totalCents / 100).toFixed(2)}`
  );

  // Send Slack notification (non-blocking)
  try {
    await notifySlackPayment({
      organizationId: order.organizationId,
      paymentId: session.id,
      amountCents: order.totalCents,
      clientName: order.clientName || null,
      clientEmail: order.clientEmail || null,
      description: `Order #${order.orderNumber}`,
    });
  } catch (slackError) {
    console.error("[Order Webhook] Failed to send Slack notification:", slackError);
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: order.organizationId,
      type: "order_paid",
      description: `Order ${order.orderNumber} was paid ($${(order.totalCents / 100).toFixed(2)})`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        clientEmail: order.clientEmail,
        totalCents: order.totalCents,
        itemCount: order.items.length,
      },
    },
  });

  // Send order confirmation email (non-blocking - don't fail webhook if email fails)
  const customerEmail = session.customer_email || order.clientEmail;
  if (customerEmail) {
    try {
      await sendOrderConfirmationEmail({
        to: customerEmail,
        clientName: order.clientName || "there",
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.name,
          itemType: item.itemType as "bundle" | "service",
          quantity: item.quantity,
          totalCents: item.totalCents,
        })),
        subtotalCents: order.subtotalCents,
        taxCents: order.taxCents,
        totalCents: order.totalCents,
        photographerName: order.organization.name,
        preferredTime: order.preferredTime,
        clientNotes: order.clientNotes,
      });
      console.log(`[Order Email] Confirmation sent to ${customerEmail}`);
    } catch (emailError) {
      // Log email failure but don't fail the webhook - order was already processed
      console.error("[Order Email] Failed to send confirmation:", emailError);
    }
  }
}
