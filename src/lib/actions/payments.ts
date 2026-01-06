"use server";

import { ok, type VoidActionResult } from "@/lib/types/action-result";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type { PaymentStatus } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { sendEmail } from "@/lib/email/resend";
import { PaymentReminderEmail } from "@/emails/payment-reminder";
import { getAuthContext } from "@/lib/auth/clerk";
import { logActivity } from "@/lib/utils/activity";
import { perfStart, perfEnd } from "@/lib/utils/perf-logger";

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

/**
 * Get a single payment by ID with full details
 */
export async function getPayment(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                company: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return null;
    }

    return payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    return null;
  }
}

/**
 * Get all payments for the organization
 */
export async function getPayments(filters?: {
  status?: PaymentStatus;
  clientId?: string;
  fromDate?: Date;
  toDate?: Date;
}) {
  const perfStartTime = perfStart("payments:getPayments");
  try {
    const organizationId = await getOrganizationId();

    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.fromDate && { createdAt: { gte: filters.fromDate } }),
        ...(filters?.toDate && { createdAt: { lte: filters.toDate } }),
        ...(filters?.clientId && {
          project: {
            clientId: filters.clientId,
          },
        }),
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                company: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return payments;
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  } finally {
    perfEnd("payments:getPayments", perfStartTime);
  }
}

/**
 * Get payment stats
 */
export async function getPaymentStats() {
  const perfStartTime = perfStart("payments:getPaymentStats");
  try {
    const organizationId = await getOrganizationId();

    const [totalPaid, totalPending, totalOverdue] = await Promise.all([
      prisma.payment.aggregate({
        where: { organizationId, status: "paid" },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { organizationId, status: "pending" },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { organizationId, status: "overdue" },
        _sum: { amountCents: true },
        _count: true,
      }),
    ]);

    return {
      paid: {
        count: totalPaid._count || 0,
        amountCents: totalPaid._sum.amountCents || 0,
      },
      pending: {
        count: totalPending._count || 0,
        amountCents: totalPending._sum.amountCents || 0,
      },
      overdue: {
        count: totalOverdue._count || 0,
        amountCents: totalOverdue._sum.amountCents || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return {
      paid: { count: 0, amountCents: 0 },
      pending: { count: 0, amountCents: 0 },
      overdue: { count: 0, amountCents: 0 },
    };
  } finally {
    perfEnd("payments:getPaymentStats", perfStartTime);
  }
}

/**
 * Mark payment as paid (for testing - in production this would come from Stripe webhook)
 */
export async function markPaymentAsPaid(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.payment.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Payment not found" };
    }

    await prisma.payment.update({
      where: { id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    // Log activity
    const auth = await getAuthContext();
    await logActivity({
      organizationId,
      type: "payment_received",
      description: `Payment of $${(existing.amountCents / 100).toFixed(2)} marked as paid`,
      userId: auth?.userId,
      paymentId: id,
      clientId: existing.clientId || undefined,
      metadata: {
        amountCents: existing.amountCents,
        currency: existing.currency,
      },
    });

    revalidatePath("/payments");
    revalidatePath(`/payments/${id}`);
    revalidatePath("/dashboard");

    return ok();
  } catch (error) {
    console.error("Error marking payment as paid:", error);
    return { success: false, error: "Failed to update payment" };
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(id: string, status: PaymentStatus) {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.payment.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Payment not found" };
    }

    const updateData: { status: PaymentStatus; paidAt?: Date | null } = { status };

    // Set or clear paidAt based on status
    if (status === "paid" && !existing.paidAt) {
      updateData.paidAt = new Date();
    } else if (status !== "paid" && existing.paidAt) {
      updateData.paidAt = null;
    }

    await prisma.payment.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/payments");
    revalidatePath(`/payments/${id}`);
    revalidatePath("/dashboard");

    return ok();
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

/**
 * Get payment link URL
 */
export async function getPaymentLinkUrl(id: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const organizationId = await getOrganizationId();

    const payment = await prisma.payment.findFirst({
      where: { id, organizationId },
      select: { id: true, stripeCheckoutSessionId: true },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    // Generate a client-facing payment URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
    const url = `${baseUrl}/pay/${id}`;

    return { success: true, url };
  } catch (error) {
    console.error("Error getting payment link:", error);
    return { success: false, error: "Failed to get payment link" };
  }
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminder(id: string): Promise<VoidActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const payment = await prisma.payment.findFirst({
      where: { id, organizationId },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    const clientEmail = payment.project?.client?.email;
    if (!clientEmail) {
      return { success: false, error: "No client email address found" };
    }

    if (payment.status === "paid") {
      return { success: false, error: "Payment has already been paid" };
    }

    // Get organization name for the email
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    // Generate payment URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
    const paymentUrl = `${baseUrl}/pay/${id}`;

    // Check if payment is overdue
    const isOverdue = payment.status === "overdue";

    // Send the payment reminder email
    const emailResult = await sendEmail({
      to: clientEmail,
      subject: isOverdue
        ? `Payment Overdue: ${payment.project?.name || "Your Gallery"}`
        : `Payment Reminder: ${payment.project?.name || "Your Gallery"}`,
      react: PaymentReminderEmail({
        clientName: payment.project?.client?.fullName || "there",
        galleryName: payment.project?.name || "Your Gallery",
        paymentUrl,
        amountCents: payment.amountCents,
        currency: "USD",
        photographerName: organization?.name || "Your Photographer",
        isOverdue,
      }),
    });

    if (!emailResult.success) {
      console.error("Failed to send payment reminder email:", emailResult.error);
      return { success: false, error: "Failed to send reminder email" };
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "email_sent",
        description: `Payment reminder sent to ${clientEmail}`,
        projectId: payment.projectId,
        metadata: {
          emailType: "payment_reminder",
          paymentId: id,
          amountCents: payment.amountCents,
          clientEmail,
          isOverdue,
        },
      },
    });

    return ok();
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    return { success: false, error: "Failed to send reminder" };
  }
}

/**
 * Get payment receipt data for download/email
 */
export async function getPaymentReceiptData(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const payment = await prisma.payment.findFirst({
      where: { id, organizationId },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.status !== "paid") {
      return { success: false, error: "Payment has not been completed" };
    }

    const client = payment.project?.client;
    const receiptData = {
      receiptNumber: `REC-${payment.id.slice(0, 8).toUpperCase()}`,
      paymentId: payment.id,
      organization: payment.organization.name,
      client: {
        name: client?.fullName || client?.company || "Unknown Client",
        email: client?.email || "",
        company: client?.company || "",
      },
      amount: payment.amountCents,
      description: payment.description || payment.project?.name || "Payment",
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      stripePaymentIntentId: payment.stripePaymentIntentId,
    };

    return { success: true, data: receiptData };
  } catch (error) {
    console.error("Error getting receipt data:", error);
    return { success: false, error: "Failed to get receipt data" };
  }
}

/**
 * Export payments to CSV format
 */
export async function exportPaymentsToCSV(paymentIds?: string[]): Promise<{ success: boolean; csv?: string; error?: string }> {
  try {
    const organizationId = await getOrganizationId();

    const whereClause = paymentIds && paymentIds.length > 0
      ? { organizationId, id: { in: paymentIds } }
      : { organizationId };

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = [
      "Payment ID",
      "Date",
      "Client",
      "Email",
      "Description",
      "Amount",
      "Status",
      "Paid Date",
      "Stripe ID",
    ];

    const rows = payments.map((p) => {
      const client = p.project?.client;
      return [
        p.id,
        new Date(p.createdAt).toISOString().split("T")[0],
        client?.fullName || client?.company || "",
        client?.email || "",
        p.description || p.project?.name || "",
        (p.amountCents / 100).toFixed(2),
        p.status,
        p.paidAt ? new Date(p.paidAt).toISOString().split("T")[0] : "",
        p.stripePaymentIntentId || "",
      ];
    });

    // Escape CSV fields
    const escapeField = (field: string | number) => {
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [
      headers.map(escapeField).join(","),
      ...rows.map((row) => row.map(escapeField).join(",")),
    ].join("\n");

    return { success: true, csv };
  } catch (error) {
    console.error("Error exporting payments:", error);
    return { success: false, error: "Failed to export payments" };
  }
}

/**
 * Issue a refund for a payment
 * Note: This requires Stripe integration to actually process the refund
 */
export async function issueRefund(
  id: string,
  amountCents?: number,
  reason?: string
): Promise<VoidActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const payment = await prisma.payment.findFirst({
      where: { id, organizationId },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.status !== "paid") {
      return { success: false, error: "Can only refund paid payments" };
    }

    if (!payment.stripePaymentIntentId) {
      return { success: false, error: "No Stripe payment to refund. Manual refund required." };
    }

    // Process refund via Stripe
    const refundAmount = amountCents || payment.amountCents;
    const stripe = getStripe();

    try {
      await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmount,
        reason: reason === "duplicate" || reason === "fraudulent" || reason === "requested_by_customer"
          ? reason
          : undefined,
        metadata: {
          paymentId: id,
          organizationId,
          reason: reason || "not_specified",
        },
      });
    } catch (stripeError) {
      console.error("[Refund] Stripe refund failed:", stripeError);
      return {
        success: false,
        error: stripeError instanceof Error ? stripeError.message : "Stripe refund failed",
      };
    }

    // Update payment status in database
    await prisma.payment.update({
      where: { id },
      data: {
        status: "refunded",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        type: "payment_received", // Using closest available type
        description: `Refund processed: $${(refundAmount / 100).toFixed(2)}${reason ? ` - ${reason}` : ""}`,
        paymentId: id,
      },
    });

    revalidatePath("/payments");
    revalidatePath(`/payments/${id}`);
    revalidatePath("/dashboard");

    console.log(`[Refund] Processed refund for payment ${id}. Amount: ${refundAmount} cents. Reason: ${reason || "Not specified"}`);

    return ok();
  } catch (error) {
    console.error("Error issuing refund:", error);
    return { success: false, error: "Failed to process refund" };
  }
}
