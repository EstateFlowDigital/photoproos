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

// =============================================================================
// Types
// =============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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

    // Build line items for Stripe
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.itemType === "bundle" ? "Service Bundle" : undefined,
        },
        unit_amount: item.unitCents,
      },
      quantity: item.quantity,
    }));

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

    return orders.map((order) => ({
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
  } catch (error) {
    console.error("[Orders] Error fetching orders:", error);
    return [];
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

    // If paid, would need refund logic here
    if (order.status === "paid") {
      // TODO: Implement refund via Stripe
      return {
        success: false,
        error: "Cannot cancel a paid order. Please process a refund first."
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
  }
}
