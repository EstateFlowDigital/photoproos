"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getStripe, DEFAULT_PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import {
  createOrderSchema,
  updateOrderSchema,
  orderFiltersSchema,
  type CreateOrderInput,
  type UpdateOrderInput,
  type OrderFilters,
  type CartItem,
} from "@/lib/validations/orders";
import { requireOrganizationId } from "./auth-helper";
import { nanoid } from "nanoid";
import type Stripe from "stripe";
import { perfStart, perfEnd } from "@/lib/utils/perf-logger";
import type { ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a unique order number for an organization
 * Format: ORD-YYYY-XXXX where XXXX is a sequential number
 */
async function generateOrderNumber(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  // Get the count of orders for this year
  const count = await prisma.order.count({
    where: {
      organizationId,
      orderNumber: { startsWith: prefix },
    },
  });

  // Generate the next number with padding
  const nextNumber = (count + 1).toString().padStart(4, "0");
  return `${prefix}${nextNumber}`;
}

/**
 * Generate a unique session token for guest checkout
 */
function generateSessionToken(): string {
  return nanoid(32);
}

/**
 * Calculate order totals from cart items
 */
function calculateOrderTotals(items: CartItem[]): {
  subtotal: number;
  itemCount: number;
} {
  let subtotal = 0;
  let itemCount = 0;

  for (const item of items) {
    if (item.type === "service") {
      subtotal += item.priceCents * item.quantity;
      itemCount += item.quantity;
    } else {
      subtotal += item.priceCents;
      itemCount += 1;
    }
  }

  return { subtotal, itemCount };
}

// =============================================================================
// Public Order Actions (No Auth Required)
// =============================================================================

/**
 * Create a new order from cart items
 * Called from public order page, no auth required
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<ActionResult<{ orderId: string; sessionToken: string }>> {
  try {
    const validated = createOrderSchema.parse(input);

    // Get the order page and organization info
    const orderPage = await prisma.orderPage.findFirst({
      where: {
        id: validated.orderPageId,
        isPublished: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            defaultTaxRate: true,
          },
        },
      },
    });

    if (!orderPage) {
      return { success: false, error: "Order page not found or not published" };
    }

    const organizationId = orderPage.organizationId;

    // Calculate totals
    const { subtotal } = calculateOrderTotals(validated.items);
    const taxRate = orderPage.organization.defaultTaxRate || 0;
    const taxCents = Math.round(subtotal * (taxRate / 100));
    const totalCents = subtotal + taxCents;

    // Generate order number and session token
    const orderNumber = await generateOrderNumber(organizationId);
    const sessionToken = generateSessionToken();

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          organizationId,
          orderPageId: validated.orderPageId,
          orderNumber,
          status: "pending",
          subtotalCents: subtotal,
          taxCents,
          totalCents,
          clientName: validated.clientName,
          clientEmail: validated.clientEmail,
          clientPhone: validated.clientPhone,
          clientCompany: validated.clientCompany,
          locationNotes: validated.locationNotes,
          preferredDate: validated.preferredDate ? new Date(validated.preferredDate) : null,
          preferredTime: validated.preferredTime,
          flexibleDates: validated.flexibleDates,
          clientNotes: validated.clientNotes,
          sessionToken,
          source: validated.source,
          medium: validated.medium,
          campaign: validated.campaign,
          submittedAt: new Date(),
        },
      });

      // Create order items
      const orderItems = validated.items.map((item, index) => ({
        orderId: newOrder.id,
        itemType: item.type,
        serviceId: item.type === "service" ? item.id : null,
        bundleId: item.type === "bundle" ? item.id : null,
        name: item.name,
        quantity: item.type === "service" ? item.quantity : 1,
        unitCents: item.priceCents,
        totalCents: item.type === "service"
          ? item.priceCents * item.quantity
          : item.priceCents,
        sortOrder: index,
        // Sqft pricing fields for bundles
        sqft: item.type === "bundle" ? item.sqft ?? null : null,
        pricingTierId: item.type === "bundle" ? item.pricingTierId ?? null : null,
        pricingTierName: item.type === "bundle" ? item.pricingTierName ?? null : null,
      }));

      await tx.orderItem.createMany({
        data: orderItems,
      });

      // Increment order count on order page
      await tx.orderPage.update({
        where: { id: validated.orderPageId },
        data: { orderCount: { increment: 1 } },
      });

      return newOrder;
    });

    revalidatePath(`/order/${orderPage.slug}`);

    return {
      success: true,
      data: { orderId: order.id, sessionToken },
    };
  } catch (error) {
    console.error("[Orders] Error creating order:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create order" };
  }
}

/**
 * Create a Stripe checkout session for an order
 * Called after order creation, uses session token for auth
 */
export async function createOrderCheckoutSession(
  orderId: string,
  sessionToken: string
): Promise<ActionResult<{ checkoutUrl: string; sessionId: string }>> {
  try {
    // Get the order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        sessionToken,
        status: "pending",
      },
      include: {
        organization: true,
        orderPage: true,
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found or already processed" };
    }

    if (!order.organization.stripeConnectAccountId) {
      return {
        success: false,
        error: "Payment processing is not set up for this business",
      };
    }

    if (!order.organization.stripeConnectOnboarded) {
      return {
        success: false,
        error: "Payment account is not fully configured",
      };
    }

    // Calculate platform fee
    const platformFeePercent = DEFAULT_PLATFORM_FEE_PERCENT;
    const platformFeeAmount = Math.round(
      (order.totalCents * platformFeePercent) / 100
    );

    // Fetch Stripe IDs for services and bundles in the order
    const serviceIds = order.items
      .filter((item) => item.itemType === "service" && item.serviceId)
      .map((item) => item.serviceId as string);
    const bundleIds = order.items
      .filter((item) => item.itemType === "bundle" && item.bundleId)
      .map((item) => item.bundleId as string);

    const [services, bundles] = await Promise.all([
      serviceIds.length > 0
        ? prisma.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, stripePriceId: true, priceCents: true },
          })
        : [],
      bundleIds.length > 0
        ? prisma.serviceBundle.findMany({
            where: { id: { in: bundleIds } },
            select: { id: true, stripePriceId: true, priceCents: true },
          })
        : [],
    ]);

    const serviceMap = new Map(services.map((s) => [s.id, s] as const));
    const bundleMap = new Map(bundles.map((b) => [b.id, b] as const));

    // Build line items for Stripe
    // Use Stripe Price ID when available and price matches, otherwise use inline price_data
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => {
      // Check if we have a synced Stripe Price ID and the price matches
      let stripePriceId: string | null = null;

      if (item.itemType === "service" && item.serviceId) {
        const service = serviceMap.get(item.serviceId);
        // Only use Stripe Price ID if price matches (order might have different price)
        if (service?.stripePriceId && service.priceCents === item.unitCents) {
          stripePriceId = service.stripePriceId;
        }
      } else if (item.itemType === "bundle" && item.bundleId) {
        const bundle = bundleMap.get(item.bundleId);
        if (bundle?.stripePriceId && bundle.priceCents === item.unitCents) {
          stripePriceId = bundle.stripePriceId;
        }
      }

      // Use Stripe Price ID if available, otherwise use inline price_data
      if (stripePriceId) {
        return {
          price: stripePriceId,
          quantity: item.quantity,
        };
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.itemType === "bundle" ? "Service Bundle" : undefined,
          },
          unit_amount: item.unitCents,
        },
        quantity: item.quantity,
      };
    });

    // Add tax as a separate line item if applicable
    if (order.taxCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Sales Tax",
            description: undefined,
          },
          unit_amount: order.taxCents,
        },
        quantity: 1,
      });
    }

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const orderPageSlug = order.orderPage?.slug || "order";
    const successUrl = `${baseUrl}/order/${orderPageSlug}/confirmation?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/order/${orderPageSlug}?cancelled=true`;

    // Create Stripe checkout session
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: order.clientEmail || undefined,
      payment_intent_data: {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: order.organization.stripeConnectAccountId,
        },
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          organizationId: order.organizationId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        organizationId: order.organizationId,
        orderPageId: order.orderPageId || "",
      },
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    if (!session.url) {
      return { success: false, error: "Failed to create checkout URL" };
    }

    return {
      success: true,
      data: { checkoutUrl: session.url, sessionId: session.id },
    };
  } catch (error) {
    console.error("[Orders] Error creating checkout session:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create checkout session" };
  }
}

/**
 * Get order by session token (for guest users)
 */
export async function getOrderBySessionToken(
  orderId: string,
  sessionToken: string
): Promise<ActionResult<{
  id: string;
  orderNumber: string;
  status: string;
  totalCents: number;
  clientName: string | null;
  clientEmail: string | null;
  items: Array<{
    id: string;
    name: string;
    itemType: string;
    quantity: number;
    totalCents: number;
    sqft: number | null;
    pricingTierName: string | null;
  }>;
  paidAt: Date | null;
  createdAt: Date;
}>> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        sessionToken,
      },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalCents: order.totalCents,
        clientName: order.clientName,
        clientEmail: order.clientEmail,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          itemType: item.itemType,
          quantity: item.quantity,
          totalCents: item.totalCents,
          sqft: item.sqft,
          pricingTierName: item.pricingTierName,
        })),
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      },
    };
  } catch (error) {
    console.error("[Orders] Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

/**
 * Verify payment was successful and update order status
 * Called after redirect from Stripe Checkout
 */
export async function verifyOrderPayment(
  sessionId: string
): Promise<ActionResult<{ orderId: string; orderNumber: string; paid: boolean }>> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return { success: false, error: "Order ID not found in session" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (session.payment_status === "paid" && order.status !== "paid") {
      // Update order to paid status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          paidAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string,
          paymentMethod: "card",
        },
      });

      revalidatePath("/orders");
    }

    return {
      success: true,
      data: {
        orderId,
        orderNumber: order.orderNumber,
        paid: session.payment_status === "paid",
      },
    };
  } catch (error) {
    console.error("[Orders] Error verifying payment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to verify payment" };
  }
}

// =============================================================================
// Authenticated Order Actions (Org Members Only)
// =============================================================================

/**
 * Get orders for the organization (admin view)
 */
export async function getOrders(filters?: OrderFilters) {
  const perfStartTime = perfStart("orders:getOrders");
  try {
    const organizationId = await requireOrganizationId();
    const validatedFilters = filters ? orderFiltersSchema.parse(filters) : {};

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        ...(validatedFilters.status && { status: validatedFilters.status }),
        ...(validatedFilters.orderPageId && { orderPageId: validatedFilters.orderPageId }),
        ...(validatedFilters.clientId && { clientId: validatedFilters.clientId }),
        ...(validatedFilters.search && {
          OR: [
            { orderNumber: { contains: validatedFilters.search, mode: "insensitive" } },
            { clientName: { contains: validatedFilters.search, mode: "insensitive" } },
            { clientEmail: { contains: validatedFilters.search, mode: "insensitive" } },
          ],
        }),
        ...(validatedFilters.fromDate && {
          createdAt: { gte: new Date(validatedFilters.fromDate) },
        }),
        ...(validatedFilters.toDate && {
          createdAt: { lte: new Date(validatedFilters.toDate) },
        }),
      },
      include: {
        orderPage: {
          select: { id: true, name: true, slug: true },
        },
        client: {
          select: { id: true, fullName: true, email: true },
        },
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalCents: order.subtotalCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,
      clientName: order.clientName,
      clientEmail: order.clientEmail,
      clientPhone: order.clientPhone,
      clientCompany: order.clientCompany,
      orderPage: order.orderPage,
      client: order.client,
      itemCount: order.items.length,
      preferredDate: order.preferredDate,
      preferredTime: order.preferredTime,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      submittedAt: order.submittedAt,
    }));
    return mapped;
  } catch (error) {
    console.error("[Orders] Error fetching orders:", error);
    return [];
  } finally {
    perfEnd("orders:getOrders", perfStartTime);
  }
}

/**
 * Get a single order by ID (admin view)
 */
export async function getOrder(id: string) {
  try {
    const organizationId = await requireOrganizationId();

    const order = await prisma.order.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        orderPage: {
          select: { id: true, name: true, slug: true },
        },
        client: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        location: true,
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            service: { select: { id: true, name: true } },
            bundle: { select: { id: true, name: true } },
            addon: { select: { id: true, name: true } },
          },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, status: true },
        },
        booking: {
          select: { id: true, title: true, startTime: true, status: true },
        },
      },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,
      clientName: order.clientName,
      clientEmail: order.clientEmail,
      clientPhone: order.clientPhone,
      clientCompany: order.clientCompany,
      orderPage: order.orderPage,
      client: order.client,
      location: order.location,
      locationNotes: order.locationNotes,
      preferredDate: order.preferredDate,
      preferredTime: order.preferredTime,
      flexibleDates: order.flexibleDates,
      clientNotes: order.clientNotes,
      internalNotes: order.internalNotes,
      items: order.items.map((item) => ({
        id: item.id,
        itemType: item.itemType,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitCents: item.unitCents,
        totalCents: item.totalCents,
        sqft: item.sqft,
        pricingTierId: item.pricingTierId,
        pricingTierName: item.pricingTierName,
        service: item.service,
        bundle: item.bundle,
        addon: item.addon,
      })),
      invoice: order.invoice,
      booking: order.booking,
      paidAt: order.paidAt,
      paymentMethod: order.paymentMethod,
      source: order.source,
      medium: order.medium,
      campaign: order.campaign,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      submittedAt: order.submittedAt,
    };
  } catch (error) {
    console.error("[Orders] Error fetching order:", error);
    return null;
  }
}

/**
 * Update an order (admin)
 */
export async function updateOrder(
  input: UpdateOrderInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateOrderSchema.parse(input);
    const organizationId = await requireOrganizationId();

    // Verify order exists and belongs to organization
    const existing = await prisma.order.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Order not found" };
    }

    const { id, ...updateData } = validated;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(updateData.clientName && { clientName: updateData.clientName }),
        ...(updateData.clientEmail && { clientEmail: updateData.clientEmail }),
        ...(updateData.clientPhone !== undefined && { clientPhone: updateData.clientPhone }),
        ...(updateData.clientCompany !== undefined && { clientCompany: updateData.clientCompany }),
        ...(updateData.locationNotes !== undefined && { locationNotes: updateData.locationNotes }),
        ...(updateData.preferredDate !== undefined && {
          preferredDate: updateData.preferredDate ? new Date(updateData.preferredDate) : null,
        }),
        ...(updateData.preferredTime !== undefined && { preferredTime: updateData.preferredTime }),
        ...(updateData.flexibleDates !== undefined && { flexibleDates: updateData.flexibleDates }),
        ...(updateData.clientNotes !== undefined && { clientNotes: updateData.clientNotes }),
        ...(updateData.internalNotes !== undefined && { internalNotes: updateData.internalNotes }),
        ...(updateData.status && { status: updateData.status }),
      },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);

    return { success: true, data: { id: order.id } };
  } catch (error) {
    console.error("[Orders] Error updating order:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update order" };
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const order = await prisma.order.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status === "completed") {
      return { success: false, error: "Cannot cancel a completed order" };
    }

    // If paid, process refund via Stripe first
    if (order.status === "paid" && order.stripePaymentIntentId) {
      const stripe = getStripe();
      try {
        await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          reason: "requested_by_customer",
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            organizationId,
          },
        });
      } catch (stripeError) {
        console.error("[Orders] Stripe refund failed:", stripeError);
        return {
          success: false,
          error: stripeError instanceof Error
            ? `Refund failed: ${stripeError.message}`
            : "Failed to process refund",
        };
      }
    } else if (order.status === "paid") {
      // Paid but no Stripe payment intent - manual refund required
      return {
        success: false,
        error: "Cannot cancel a paid order without Stripe payment. Manual refund required.",
      };
    }

    await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    });

    revalidatePath("/orders");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Orders] Error cancelling order:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to cancel order" };
  }
}

/**
 * Get order statistics for the organization
 */
export async function getOrderStats() {
  const perfStartTime = perfStart("orders:getOrderStats");
  try {
    const organizationId = await requireOrganizationId();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalOrders, pendingOrders, paidOrders, recentRevenue] = await Promise.all([
      prisma.order.count({
        where: { organizationId },
      }),
      prisma.order.count({
        where: { organizationId, status: "pending" },
      }),
      prisma.order.count({
        where: { organizationId, status: "paid" },
      }),
      prisma.order.aggregate({
        where: {
          organizationId,
          status: "paid",
          paidAt: { gte: thirtyDaysAgo },
        },
        _sum: { totalCents: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      recentRevenue: recentRevenue._sum.totalCents || 0,
    };
  } catch (error) {
    console.error("[Orders] Error fetching order stats:", error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      paidOrders: 0,
      recentRevenue: 0,
    };
  } finally {
    perfEnd("orders:getOrderStats", perfStartTime);
  }
}

/**
 * Get sqft analytics for orders
 * Provides metrics on square footage-based pricing
 */
export async function getSqftAnalytics() {
  try {
    const organizationId = await requireOrganizationId();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get all order items with sqft data from paid orders
    const sqftItems = await prisma.orderItem.findMany({
      where: {
        sqft: { not: null },
        order: {
          organizationId,
          status: { in: ["paid", "completed"] },
        },
      },
      include: {
        order: {
          select: {
            paidAt: true,
            createdAt: true,
          },
        },
      },
    });

    // Recent sqft items (last 30 days)
    const recentSqftItems = sqftItems.filter(
      (item) => item.order.paidAt && item.order.paidAt >= thirtyDaysAgo
    );

    // Previous period (30-60 days ago) for trend calculation
    const previousSqftItems = sqftItems.filter(
      (item) =>
        item.order.paidAt &&
        item.order.paidAt >= sixtyDaysAgo &&
        item.order.paidAt < thirtyDaysAgo
    );

    // Calculate totals
    const totalSqft = sqftItems.reduce((sum, item) => sum + (item.sqft || 0), 0);
    const totalRevenue = sqftItems.reduce((sum, item) => sum + item.totalCents, 0);
    const recentSqft = recentSqftItems.reduce((sum, item) => sum + (item.sqft || 0), 0);
    const recentRevenue = recentSqftItems.reduce((sum, item) => sum + item.totalCents, 0);
    const previousSqft = previousSqftItems.reduce((sum, item) => sum + (item.sqft || 0), 0);

    // Calculate averages
    const avgSqftPerOrder = sqftItems.length > 0 ? Math.round(totalSqft / sqftItems.length) : 0;
    const revenuePerSqft = totalSqft > 0 ? Math.round(totalRevenue / totalSqft) : 0;

    // Calculate trend (percentage change in sqft from previous period)
    const sqftTrend = previousSqft > 0
      ? Math.round(((recentSqft - previousSqft) / previousSqft) * 100)
      : recentSqft > 0 ? 100 : 0;

    // Group by pricing tier
    const tierBreakdown: Record<string, { count: number; sqft: number; revenue: number }> = {};
    for (const item of sqftItems) {
      const tierName = item.pricingTierName || "Standard";
      if (!tierBreakdown[tierName]) {
        tierBreakdown[tierName] = { count: 0, sqft: 0, revenue: 0 };
      }
      tierBreakdown[tierName].count += 1;
      tierBreakdown[tierName].sqft += item.sqft || 0;
      tierBreakdown[tierName].revenue += item.totalCents;
    }

    // Convert to array and sort by revenue
    const tiers = Object.entries(tierBreakdown)
      .map(([name, data]) => ({
        name,
        ...data,
        avgPricePerSqft: data.sqft > 0 ? Math.round(data.revenue / data.sqft) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Calculate distribution by sqft range
    const sqftRanges = [
      { label: "Under 1,000", min: 0, max: 1000 },
      { label: "1,000 - 2,499", min: 1000, max: 2500 },
      { label: "2,500 - 4,999", min: 2500, max: 5000 },
      { label: "5,000 - 9,999", min: 5000, max: 10000 },
      { label: "10,000+", min: 10000, max: Infinity },
    ];

    const distribution = sqftRanges.map((range) => {
      const items = sqftItems.filter(
        (item) => (item.sqft || 0) >= range.min && (item.sqft || 0) < range.max
      );
      return {
        label: range.label,
        count: items.length,
        sqft: items.reduce((sum, item) => sum + (item.sqft || 0), 0),
        revenue: items.reduce((sum, item) => sum + item.totalCents, 0),
      };
    }).filter((range) => range.count > 0);

    // Monthly breakdown (last 6 months)
    const monthlyData: Record<string, { sqft: number; revenue: number; count: number }> = {};
    for (const item of sqftItems) {
      const date = item.order.paidAt || item.order.createdAt;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sqft: 0, revenue: 0, count: 0 };
      }
      monthlyData[monthKey].sqft += item.sqft || 0;
      monthlyData[monthKey].revenue += item.totalCents;
      monthlyData[monthKey].count += 1;
    }

    // Convert to sorted array (last 6 months)
    const monthly = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, data]) => ({
        month,
        monthLabel: new Date(`${month}-01`).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        ...data,
      }));

    return {
      success: true,
      data: {
        summary: {
          totalSqft,
          totalRevenue,
          totalOrders: sqftItems.length,
          avgSqftPerOrder,
          revenuePerSqft,
          recentSqft,
          recentRevenue,
          sqftTrend,
        },
        tiers,
        distribution,
        monthly,
      },
    };
  } catch (error) {
    console.error("[Orders] Error fetching sqft analytics:", error);
    return {
      success: false,
      error: "Failed to fetch sqft analytics",
      data: null,
    };
  }
}
