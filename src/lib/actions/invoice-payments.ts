"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";
import { logActivity } from "@/lib/utils/activity";
import { ok, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// PARTIAL PAYMENT OPERATIONS
// ============================================================================

/**
 * Record a partial or full payment against an invoice
 */
export async function recordInvoicePayment(input: {
  invoiceId: string;
  amountCents: number;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}): Promise<ActionResult<{ paymentId: string; newBalance: number }>> {
  try {
    const organizationId = await requireOrganizationId();
    const auth = await getAuthContext();

    // Get the invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: input.invoiceId,
        organizationId,
      },
      include: {
        client: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status === "draft") {
      return { success: false, error: "Cannot record payment for draft invoice" };
    }

    if (invoice.status === "cancelled") {
      return { success: false, error: "Cannot record payment for cancelled invoice" };
    }

    // Calculate outstanding balance (including late fees)
    const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;
    const currentBalance = totalDue - invoice.paidAmountCents;

    if (input.amountCents <= 0) {
      return { success: false, error: "Payment amount must be greater than zero" };
    }

    if (input.amountCents > currentBalance) {
      return {
        success: false,
        error: `Payment amount exceeds outstanding balance of $${(currentBalance / 100).toFixed(2)}`,
      };
    }

    // Create the payment record
    const payment = await prisma.payment.create({
      data: {
        organizationId,
        invoiceId: input.invoiceId,
        clientId: invoice.clientId,
        amountCents: input.amountCents,
        currency: invoice.currency,
        status: "paid",
        clientEmail: invoice.clientEmail || invoice.client?.email,
        clientName: invoice.clientName || invoice.client?.fullName,
        description: input.notes || `Payment for Invoice ${invoice.invoiceNumber}`,
        paidAt: new Date(),
      },
    });

    // Update invoice paid amount
    const newPaidAmount = invoice.paidAmountCents + input.amountCents;
    const newBalance = totalDue - newPaidAmount;
    const isFullyPaid = newBalance <= 0;

    await prisma.invoice.update({
      where: { id: input.invoiceId },
      data: {
        paidAmountCents: newPaidAmount,
        status: isFullyPaid ? "paid" : invoice.status === "overdue" ? "overdue" : "sent",
        paidAt: isFullyPaid ? new Date() : null,
      },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: isFullyPaid ? "invoice_paid" : "payment_received",
      description: isFullyPaid
        ? `Invoice ${invoice.invoiceNumber} paid in full`
        : `Partial payment of $${(input.amountCents / 100).toFixed(2)} received for Invoice ${invoice.invoiceNumber}`,
      userId: auth?.userId,
      invoiceId: input.invoiceId,
      clientId: invoice.clientId || undefined,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        amountCents: input.amountCents,
        newBalance,
        isFullyPaid,
      },
    });

    revalidatePath(`/invoices/${input.invoiceId}`);
    revalidatePath("/invoices");

    return {
      success: true,
      data: { paymentId: payment.id, newBalance },
    };
  } catch (error) {
    console.error("Error recording invoice payment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to record payment" };
  }
}

/**
 * Get payment history for an invoice
 */
export async function getInvoicePayments(invoiceId: string): Promise<
  ActionResult<{
    payments: Array<{
      id: string;
      amountCents: number;
      status: string;
      paidAt: Date | null;
      description: string | null;
      createdAt: Date;
    }>;
    summary: {
      totalDue: number;
      totalPaid: number;
      balance: number;
      lateFees: number;
    };
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      select: {
        totalCents: true,
        paidAmountCents: true,
        lateFeeAppliedCents: true,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    const payments = await prisma.payment.findMany({
      where: {
        invoiceId,
        organizationId,
      },
      select: {
        id: true,
        amountCents: true,
        status: true,
        paidAt: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;
    const balance = totalDue - invoice.paidAmountCents;

    return {
      success: true,
      data: {
        payments,
        summary: {
          totalDue,
          totalPaid: invoice.paidAmountCents,
          balance,
          lateFees: invoice.lateFeeAppliedCents,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching invoice payments:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch payments" };
  }
}

/**
 * Void/delete a payment (admin only)
 */
export async function voidPayment(paymentId: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();
    const auth = await getAuthContext();

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        organizationId,
      },
      include: {
        invoice: true,
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.stripePaymentIntentId) {
      return {
        success: false,
        error: "Cannot void Stripe payments. Use refund instead.",
      };
    }

    // Update invoice paid amount
    if (payment.invoice) {
      const newPaidAmount = Math.max(0, payment.invoice.paidAmountCents - payment.amountCents);
      const totalDue = payment.invoice.totalCents + payment.invoice.lateFeeAppliedCents;
      const isStillPaid = newPaidAmount >= totalDue;

      await prisma.invoice.update({
        where: { id: payment.invoiceId! },
        data: {
          paidAmountCents: newPaidAmount,
          status: isStillPaid ? "paid" : payment.invoice.status === "paid" ? "sent" : payment.invoice.status,
          paidAt: isStillPaid ? payment.invoice.paidAt : null,
        },
      });
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "payment_failed", // Using as closest match for void
      description: `Payment of $${(payment.amountCents / 100).toFixed(2)} voided`,
      userId: auth?.userId,
      invoiceId: payment.invoiceId || undefined,
      metadata: {
        paymentId,
        amountCents: payment.amountCents,
        reason: "manual_void",
      },
    });

    if (payment.invoiceId) {
      revalidatePath(`/invoices/${payment.invoiceId}`);
    }
    revalidatePath("/invoices");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error voiding payment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to void payment" };
  }
}

// ============================================================================
// LATE FEE OPERATIONS
// ============================================================================

/**
 * Configure late fee settings for an invoice
 */
export async function configureLateFee(input: {
  invoiceId: string;
  enabled: boolean;
  type?: "percentage" | "fixed";
  percent?: number;
  flatCents?: number;
}): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: input.invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status === "paid") {
      return { success: false, error: "Cannot configure late fees for paid invoice" };
    }

    await prisma.invoice.update({
      where: { id: input.invoiceId },
      data: {
        lateFeeEnabled: input.enabled,
        lateFeeType: input.type || invoice.lateFeeType,
        lateFeePercent: input.percent ?? invoice.lateFeePercent,
        lateFeeFlatCents: input.flatCents ?? invoice.lateFeeFlatCents,
      },
    });

    revalidatePath(`/invoices/${input.invoiceId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error configuring late fee:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to configure late fee" };
  }
}

/**
 * Apply late fee to an overdue invoice
 */
export async function applyLateFee(invoiceId: string): Promise<
  ActionResult<{ lateFeeApplied: number; newTotal: number }>
> {
  try {
    const organizationId = await requireOrganizationId();
    const auth = await getAuthContext();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status === "paid") {
      return { success: false, error: "Cannot apply late fee to paid invoice" };
    }

    if (invoice.status === "draft") {
      return { success: false, error: "Cannot apply late fee to draft invoice" };
    }

    if (!invoice.lateFeeEnabled) {
      return { success: false, error: "Late fees are not enabled for this invoice" };
    }

    // Check if invoice is actually overdue
    const now = new Date();
    if (invoice.dueDate > now) {
      return { success: false, error: "Invoice is not overdue yet" };
    }

    // Calculate late fee
    let lateFee = 0;
    if (invoice.lateFeeType === "percentage" && invoice.lateFeePercent) {
      // Calculate percentage of outstanding balance
      const outstandingBalance = invoice.totalCents - invoice.paidAmountCents;
      lateFee = Math.round(outstandingBalance * (invoice.lateFeePercent / 100));
    } else if (invoice.lateFeeType === "fixed" && invoice.lateFeeFlatCents) {
      lateFee = invoice.lateFeeFlatCents;
    }

    if (lateFee <= 0) {
      return { success: false, error: "Late fee amount is zero" };
    }

    // Apply the late fee
    const newLateFeeTotal = invoice.lateFeeAppliedCents + lateFee;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        lateFeeAppliedCents: newLateFeeTotal,
        lastLateFeeAt: now,
        status: "overdue",
      },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "invoice_sent", // Using as closest match
      description: `Late fee of $${(lateFee / 100).toFixed(2)} applied to Invoice ${invoice.invoiceNumber}`,
      userId: auth?.userId,
      invoiceId,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        lateFee,
        totalLateFees: newLateFeeTotal,
      },
    });

    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/invoices");

    return {
      success: true,
      data: {
        lateFeeApplied: lateFee,
        newTotal: invoice.totalCents + newLateFeeTotal,
      },
    };
  } catch (error) {
    console.error("Error applying late fee:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to apply late fee" };
  }
}

/**
 * Apply late fees to all eligible overdue invoices (for cron job)
 * Only applies if:
 * - Invoice is overdue
 * - Late fees are enabled
 * - No late fee applied in last 30 days (to prevent excessive fees)
 */
export async function applyBatchLateFees(): Promise<
  ActionResult<{ processed: number; totalFeesApplied: number }>
> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Find all eligible invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        status: "overdue",
        lateFeeEnabled: true,
        dueDate: { lt: now },
        OR: [
          { lastLateFeeAt: null },
          { lastLateFeeAt: { lt: thirtyDaysAgo } },
        ],
      },
    });

    let processed = 0;
    let totalFeesApplied = 0;

    for (const invoice of invoices) {
      // Calculate late fee
      let lateFee = 0;
      if (invoice.lateFeeType === "percentage" && invoice.lateFeePercent) {
        const outstandingBalance = invoice.totalCents - invoice.paidAmountCents;
        lateFee = Math.round(outstandingBalance * (invoice.lateFeePercent / 100));
      } else if (invoice.lateFeeType === "fixed" && invoice.lateFeeFlatCents) {
        lateFee = invoice.lateFeeFlatCents;
      }

      if (lateFee > 0) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            lateFeeAppliedCents: invoice.lateFeeAppliedCents + lateFee,
            lastLateFeeAt: now,
          },
        });

        processed++;
        totalFeesApplied += lateFee;

        console.log(
          `[Late Fee Cron] Applied $${(lateFee / 100).toFixed(2)} to invoice ${invoice.invoiceNumber}`
        );
      }
    }

    console.log(
      `[Late Fee Cron] Processed ${processed} invoices, total fees: $${(totalFeesApplied / 100).toFixed(2)}`
    );

    return {
      success: true,
      data: { processed, totalFeesApplied },
    };
  } catch (error) {
    console.error("[Late Fee Cron] Error applying batch late fees:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to apply batch late fees" };
  }
}

/**
 * Waive/remove late fees from an invoice
 */
export async function waiveLateFees(
  invoiceId: string,
  reason?: string
): Promise<ActionResult<{ waivedAmount: number }>> {
  try {
    const organizationId = await requireOrganizationId();
    const auth = await getAuthContext();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    const waivedAmount = invoice.lateFeeAppliedCents;

    if (waivedAmount <= 0) {
      return { success: false, error: "No late fees to waive" };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        lateFeeAppliedCents: 0,
        lastLateFeeAt: null,
      },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "settings_updated", // Using as closest match
      description: `Late fees of $${(waivedAmount / 100).toFixed(2)} waived for Invoice ${invoice.invoiceNumber}${reason ? `: ${reason}` : ""}`,
      userId: auth?.userId,
      invoiceId,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        waivedAmount,
        reason,
      },
    });

    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/invoices");

    return { success: true, data: { waivedAmount } };
  } catch (error) {
    console.error("Error waiving late fees:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to waive late fees" };
  }
}

/**
 * Get invoice balance summary with breakdown
 */
export async function getInvoiceBalance(invoiceId: string): Promise<
  ActionResult<{
    subtotal: number;
    tax: number;
    discount: number;
    originalTotal: number;
    lateFees: number;
    totalDue: number;
    totalPaid: number;
    balance: number;
    isFullyPaid: boolean;
    paymentCount: number;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        _count: {
          select: { payments: true },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;
    const balance = totalDue - invoice.paidAmountCents;

    return {
      success: true,
      data: {
        subtotal: invoice.subtotalCents,
        tax: invoice.taxCents,
        discount: invoice.discountCents,
        originalTotal: invoice.totalCents,
        lateFees: invoice.lateFeeAppliedCents,
        totalDue,
        totalPaid: invoice.paidAmountCents,
        balance,
        isFullyPaid: balance <= 0,
        paymentCount: invoice._count.payments,
      },
    };
  } catch (error) {
    console.error("Error fetching invoice balance:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch invoice balance" };
  }
}
