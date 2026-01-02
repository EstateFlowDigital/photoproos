"use server";

import { auth } from "@clerk/nextjs/server";
import { getStripe, DEFAULT_PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { prisma } from "@/lib/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a checkout session for subscription upgrade
 */
export async function createCheckoutSession(params: {
  organizationId: string;
  priceId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url?: string; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const { organizationId, priceId, planId, successUrl, cancelUrl } = params;

    // Get the organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: {
            user: { clerkUserId: userId },
          },
          include: {
            user: true,
          },
        },
      },
    });

    if (!organization) {
      return { error: "Organization not found" };
    }

    // Verify user is a member
    if (organization.members.length === 0) {
      return { error: "You do not have access to this organization" };
    }

    const user = organization.members[0].user;

    // Get or create Stripe customer
    let customerId = organization.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: organization.name,
        metadata: {
          organizationId,
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Save the customer ID
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          organizationId,
          planId,
        },
      },
      metadata: {
        organizationId,
        planId,
      },
    });

    return { url: session.url || undefined };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create checkout session" };
  }
}

/**
 * Create a checkout session for a gallery (pay-to-unlock)
 * This is called from the public gallery page, so no auth required
 */
export async function createGalleryCheckoutSession(
  galleryId: string,
  customerEmail?: string
): Promise<ActionResult<{ sessionId: string; checkoutUrl: string }>> {
  try {
    // Get the gallery with organization info
    const gallery = await prisma.project.findUnique({
      where: { id: galleryId },
      include: {
        organization: true,
        client: true,
        deliveryLinks: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    if (!gallery.priceCents || gallery.priceCents <= 0) {
      return { success: false, error: "Gallery is free or has no price set" };
    }

    if (!gallery.organization.stripeConnectAccountId) {
      return {
        success: false,
        error: "Photographer has not set up payment processing",
      };
    }

    if (!gallery.organization.stripeConnectOnboarded) {
      return {
        success: false,
        error: "Photographer payment account is not fully set up",
      };
    }

    // Calculate platform fee
    const platformFeePercent = DEFAULT_PLATFORM_FEE_PERCENT;
    const platformFeeAmount = Math.round(
      (gallery.priceCents * platformFeePercent) / 100
    );

    // Get the delivery slug for the success URL
    const deliverySlug = gallery.deliveryLinks[0]?.slug || galleryId;

    // Create the checkout session
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: gallery.currency.toLowerCase(),
            product_data: {
              name: `Photo Gallery: ${gallery.name}`,
              description: gallery.description || "Access to your photo gallery",
              metadata: {
                galleryId: gallery.id,
                organizationId: gallery.organizationId,
              },
            },
            unit_amount: gallery.priceCents,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || gallery.client?.email || undefined,
      payment_intent_data: {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: gallery.organization.stripeConnectAccountId,
        },
        metadata: {
          galleryId: gallery.id,
          galleryName: gallery.name,
          organizationId: gallery.organizationId,
          clientId: gallery.clientId || "",
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/g/${deliverySlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/g/${deliverySlug}?payment=cancelled`,
      metadata: {
        galleryId: gallery.id,
        galleryName: gallery.name,
        organizationId: gallery.organizationId,
        clientId: gallery.clientId || "",
      },
    });

    if (!session.url) {
      return { success: false, error: "Failed to create checkout URL" };
    }

    return {
      success: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create checkout session" };
  }
}

/**
 * Verify a payment was successful and the gallery should be unlocked
 * Called after redirect from Stripe Checkout
 */
export async function verifyPayment(
  sessionId: string
): Promise<ActionResult<{ paid: boolean; galleryId: string }>> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return {
        success: true,
        data: {
          paid: false,
          galleryId: (session.metadata?.galleryId as string) || "",
        },
      };
    }

    const galleryId = session.metadata?.galleryId;
    if (!galleryId) {
      return { success: false, error: "Gallery ID not found in session" };
    }

    // Check if we already recorded this payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        stripeCheckoutSessionId: sessionId,
      },
    });

    // If payment already recorded, just return success
    if (existingPayment) {
      return { success: true, data: { paid: true, galleryId } };
    }

    // Record the payment (webhook usually handles this, but this is a backup)
    const gallery = await prisma.project.findUnique({
      where: { id: galleryId },
    });

    if (gallery) {
      await prisma.payment.create({
        data: {
          organizationId: gallery.organizationId,
          projectId: galleryId,
          clientId: gallery.clientId,
          amountCents: session.amount_total || 0,
          currency: session.currency?.toUpperCase() || "USD",
          status: "paid",
          stripeCheckoutSessionId: sessionId,
          stripePaymentIntentId: session.payment_intent as string,
          paidAt: new Date(),
        },
      });
    }

    return { success: true, data: { paid: true, galleryId } };
  } catch (error) {
    console.error("Error verifying payment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to verify payment" };
  }
}

/**
 * Check if a gallery has been paid for
 */
export async function checkGalleryPaymentStatus(
  galleryId: string
): Promise<ActionResult<{ isPaid: boolean }>> {
  try {
    const gallery = await prisma.project.findUnique({
      where: { id: galleryId },
      include: {
        payments: {
          where: { status: "paid" },
          take: 1,
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Gallery is paid if price is 0 or there's a successful payment
    const isPaid = gallery.priceCents === 0 || gallery.payments.length > 0;

    return { success: true, data: { isPaid } };
  } catch (error) {
    console.error("Error checking payment status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to check payment status" };
  }
}
