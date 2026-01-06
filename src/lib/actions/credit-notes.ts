"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CreditNoteStatus } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { logActivity } from "@/lib/utils/activity";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// CREDIT NOTE OPERATIONS
// ============================================================================

/**
 * Generate the next credit note number for the organization
 */
async function generateCreditNoteNumber(organizationId: string): Promise<string> {
  const lastCreditNote = await prisma.creditNote.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: { creditNoteNumber: true },
  });

  if (!lastCreditNote) {
    return "CN-0001";
  }

  // Extract number from credit note number (e.g., "CN-0001" -> 1)
  const match = lastCreditNote.creditNoteNumber.match(/(\d+)$/);
  const lastNumber = match ? parseInt(match[1], 10) : 0;
  const nextNumber = lastNumber + 1;

  return `CN-${nextNumber.toString().padStart(4, "0")}`;
}

/**
 * Create a credit note
 */
interface CreateCreditNoteInput {
  clientId?: string;
  invoiceId?: string;
  amountCents: number;
  reason?: string;
  description?: string;
  notes?: string;
}

export async function createCreditNote(
  input: CreateCreditNoteInput
): Promise<ActionResult<{ id: string; creditNoteNumber: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get client info if provided
    let clientName: string | null = null;
    let clientEmail: string | null = null;

    if (input.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: input.clientId,
          organizationId,
        },
        select: { fullName: true, email: true, company: true },
      });

      if (!client) {
        return fail("Client not found");
      }

      clientName = client.company || client.fullName;
      clientEmail = client.email;
    }

    // If invoiceId provided, get invoice info
    if (input.invoiceId) {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: input.invoiceId,
          organizationId,
        },
        select: {
          clientName: true,
          clientEmail: true,
          clientId: true,
          totalCents: true,
        },
      });

      if (!invoice) {
        return fail("Invoice not found");
      }

      // Use invoice client info if not provided
      if (!clientName) clientName = invoice.clientName;
      if (!clientEmail) clientEmail = invoice.clientEmail;
      if (!input.clientId && invoice.clientId) {
        input.clientId = invoice.clientId;
      }

      // Validate amount doesn't exceed invoice total
      if (input.amountCents > invoice.totalCents) {
        return fail("Credit note amount cannot exceed invoice total");
      }
    }

    const creditNoteNumber = await generateCreditNoteNumber(organizationId);

    const creditNote = await prisma.creditNote.create({
      data: {
        organizationId,
        clientId: input.clientId,
        invoiceId: input.invoiceId,
        creditNoteNumber,
        amountCents: input.amountCents,
        reason: input.reason,
        description: input.description,
        notes: input.notes,
        clientName,
        clientEmail,
        status: "draft",
      },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "credit_note_created",
      description: `Credit note ${creditNoteNumber} created for ${clientName || "client"}`,
      metadata: {
        creditNoteId: creditNote.id,
        creditNoteNumber,
        amountCents: input.amountCents,
        invoiceId: input.invoiceId,
      },
    });

    revalidatePath("/credit-notes");
    revalidatePath("/invoices");

    return success({ id: creditNote.id, creditNoteNumber });
  } catch (error) {
    console.error("Error creating credit note:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create credit note");
  }
}

/**
 * Get a credit note by ID
 */
export async function getCreditNote(creditNoteId: string): Promise<
  ActionResult<{
    id: string;
    creditNoteNumber: string;
    status: CreditNoteStatus;
    amountCents: number;
    appliedAmountCents: number;
    refundedAmountCents: number;
    currency: string;
    reason: string | null;
    description: string | null;
    notes: string | null;
    clientName: string | null;
    clientEmail: string | null;
    issueDate: Date;
    createdAt: Date;
    client: { id: string; fullName: string; company: string | null } | null;
    invoice: { id: string; invoiceNumber: string; totalCents: number } | null;
    appliedToInvoice: { id: string; invoiceNumber: string; totalCents: number } | null;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const creditNote = await prisma.creditNote.findFirst({
      where: {
        id: creditNoteId,
        organizationId,
      },
      include: {
        client: {
          select: { id: true, fullName: true, company: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, totalCents: true },
        },
        appliedToInvoice: {
          select: { id: true, invoiceNumber: true, totalCents: true },
        },
      },
    });

    if (!creditNote) {
      return fail("Credit note not found");
    }

    return success({
      id: creditNote.id,
      creditNoteNumber: creditNote.creditNoteNumber,
      status: creditNote.status,
      amountCents: creditNote.amountCents,
      appliedAmountCents: creditNote.appliedAmountCents,
      refundedAmountCents: creditNote.refundedAmountCents,
      currency: creditNote.currency,
      reason: creditNote.reason,
      description: creditNote.description,
      notes: creditNote.notes,
      clientName: creditNote.clientName,
      clientEmail: creditNote.clientEmail,
      issueDate: creditNote.issueDate,
      createdAt: creditNote.createdAt,
      client: creditNote.client,
      invoice: creditNote.invoice,
      appliedToInvoice: creditNote.appliedToInvoice,
    });
  } catch (error) {
    console.error("Error fetching credit note:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch credit note");
  }
}

/**
 * List credit notes for the organization
 */
export async function listCreditNotes(options?: {
  clientId?: string;
  invoiceId?: string;
  status?: CreditNoteStatus;
  limit?: number;
  offset?: number;
}): Promise<
  ActionResult<{
    creditNotes: Array<{
      id: string;
      creditNoteNumber: string;
      status: CreditNoteStatus;
      amountCents: number;
      appliedAmountCents: number;
      refundedAmountCents: number;
      reason: string | null;
      clientName: string | null;
      issueDate: Date;
      createdAt: Date;
    }>;
    total: number;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const where = {
      organizationId,
      ...(options?.clientId && { clientId: options.clientId }),
      ...(options?.invoiceId && { invoiceId: options.invoiceId }),
      ...(options?.status && { status: options.status }),
    };

    const [creditNotes, total] = await Promise.all([
      prisma.creditNote.findMany({
        where,
        select: {
          id: true,
          creditNoteNumber: true,
          status: true,
          amountCents: true,
          appliedAmountCents: true,
          refundedAmountCents: true,
          reason: true,
          clientName: true,
          issueDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.creditNote.count({ where }),
    ]);

    return success({ creditNotes, total });
  } catch (error) {
    console.error("Error listing credit notes:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to list credit notes");
  }
}

/**
 * Issue a credit note (change status from draft to issued)
 */
export async function issueCreditNote(creditNoteId: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const creditNote = await prisma.creditNote.findFirst({
      where: {
        id: creditNoteId,
        organizationId,
      },
    });

    if (!creditNote) {
      return fail("Credit note not found");
    }

    if (creditNote.status !== "draft") {
      return fail("Only draft credit notes can be issued");
    }

    await prisma.creditNote.update({
      where: { id: creditNoteId },
      data: { status: "issued" },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "credit_note_issued",
      description: `Credit note ${creditNote.creditNoteNumber} was issued`,
      metadata: {
        creditNoteId,
        creditNoteNumber: creditNote.creditNoteNumber,
        amountCents: creditNote.amountCents,
      },
    });

    revalidatePath("/credit-notes");
    revalidatePath(`/credit-notes/${creditNoteId}`);

    return ok();
  } catch (error) {
    console.error("Error issuing credit note:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to issue credit note");
  }
}

/**
 * Apply a credit note to an invoice
 */
export async function applyCreditNoteToInvoice(
  creditNoteId: string,
  invoiceId: string,
  amountCents?: number
): Promise<ActionResult<{ appliedAmountCents: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    const creditNote = await prisma.creditNote.findFirst({
      where: {
        id: creditNoteId,
        organizationId,
      },
    });

    if (!creditNote) {
      return fail("Credit note not found");
    }

    if (creditNote.status !== "issued") {
      return fail("Only issued credit notes can be applied to invoices");
    }

    // Get invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    // Validate invoice can receive credit
    if (invoice.status === "paid") {
      return fail("Cannot apply credit to a paid invoice");
    }

    // Calculate available credit and amount to apply
    const availableCredit = creditNote.amountCents - creditNote.appliedAmountCents - creditNote.refundedAmountCents;
    const invoiceBalance = invoice.totalCents - invoice.paidAmountCents;

    // Use the lesser of: specified amount, available credit, or invoice balance
    const applyAmount = Math.min(
      amountCents || availableCredit,
      availableCredit,
      invoiceBalance
    );

    if (applyAmount <= 0) {
      return fail("No credit available to apply");
    }

    // Apply credit in a transaction
    await prisma.$transaction(async (tx) => {
      // Update credit note
      await tx.creditNote.update({
        where: { id: creditNoteId },
        data: {
          appliedToInvoiceId: invoiceId,
          appliedAmountCents: { increment: applyAmount },
          appliedAt: new Date(),
          status: "applied",
        },
      });

      // Update invoice paid amount
      const newPaidAmount = invoice.paidAmountCents + applyAmount;
      const newStatus = newPaidAmount >= invoice.totalCents ? "paid" : invoice.status;

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmountCents: newPaidAmount,
          status: newStatus,
          ...(newStatus === "paid" && { paidAt: new Date() }),
        },
      });

      // Create payment record for the credit application
      await tx.payment.create({
        data: {
          organizationId,
          invoiceId,
          clientId: invoice.clientId,
          amountCents: applyAmount,
          status: "completed",
          paymentMethod: "credit_note",
          transactionId: `CN-${creditNote.creditNoteNumber}`,
          notes: `Applied from credit note ${creditNote.creditNoteNumber}`,
        },
      });
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "credit_note_applied",
      description: `Credit note ${creditNote.creditNoteNumber} applied to invoice ${invoice.invoiceNumber}`,
      metadata: {
        creditNoteId,
        creditNoteNumber: creditNote.creditNoteNumber,
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        appliedAmountCents: applyAmount,
      },
    });

    revalidatePath("/credit-notes");
    revalidatePath(`/credit-notes/${creditNoteId}`);
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);

    return success({ appliedAmountCents: applyAmount });
  } catch (error) {
    console.error("Error applying credit note:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to apply credit note");
  }
}

/**
 * Mark a credit note as refunded (for when you refund to client directly)
 */
export async function markCreditNoteRefunded(
  creditNoteId: string,
  refundedAmountCents?: number
): Promise<ActionResult<{ refundedAmountCents: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    const creditNote = await prisma.creditNote.findFirst({
      where: {
        id: creditNoteId,
        organizationId,
      },
    });

    if (!creditNote) {
      return fail("Credit note not found");
    }

    if (creditNote.status !== "issued") {
      return fail("Only issued credit notes can be marked as refunded");
    }

    // Calculate available credit
    const availableCredit = creditNote.amountCents - creditNote.appliedAmountCents - creditNote.refundedAmountCents;
    const refundAmount = Math.min(refundedAmountCents || availableCredit, availableCredit);

    if (refundAmount <= 0) {
      return fail("No credit available to refund");
    }

    await prisma.creditNote.update({
      where: { id: creditNoteId },
      data: {
        refundedAmountCents: { increment: refundAmount },
        refundedAt: new Date(),
        status: "refunded",
      },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "credit_note_refunded",
      description: `Credit note ${creditNote.creditNoteNumber} marked as refunded`,
      metadata: {
        creditNoteId,
        creditNoteNumber: creditNote.creditNoteNumber,
        refundedAmountCents: refundAmount,
      },
    });

    revalidatePath("/credit-notes");
    revalidatePath(`/credit-notes/${creditNoteId}`);

    return success({ refundedAmountCents: refundAmount });
  } catch (error) {
    console.error("Error marking credit note as refunded:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to mark credit note as refunded");
  }
}

/**
 * Void a credit note
 */
export async function voidCreditNote(creditNoteId: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const creditNote = await prisma.creditNote.findFirst({
      where: {
        id: creditNoteId,
        organizationId,
      },
    });

    if (!creditNote) {
      return fail("Credit note not found");
    }

    if (creditNote.status === "voided") {
      return fail("Credit note is already voided");
    }

    if (creditNote.appliedAmountCents > 0 || creditNote.refundedAmountCents > 0) {
      return fail("Cannot void a credit note that has been applied or refunded");
    }

    await prisma.creditNote.update({
      where: { id: creditNoteId },
      data: { status: "voided" },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "credit_note_voided",
      description: `Credit note ${creditNote.creditNoteNumber} was voided`,
      metadata: {
        creditNoteId,
        creditNoteNumber: creditNote.creditNoteNumber,
      },
    });

    revalidatePath("/credit-notes");
    revalidatePath(`/credit-notes/${creditNoteId}`);

    return ok();
  } catch (error) {
    console.error("Error voiding credit note:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to void credit note");
  }
}

/**
 * Delete a draft credit note
 */
export async function deleteCreditNote(creditNoteId: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const creditNote = await prisma.creditNote.findFirst({
      where: {
        id: creditNoteId,
        organizationId,
      },
    });

    if (!creditNote) {
      return fail("Credit note not found");
    }

    if (creditNote.status !== "draft") {
      return fail("Only draft credit notes can be deleted. Use void for issued credit notes.");
    }

    await prisma.creditNote.delete({
      where: { id: creditNoteId },
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "credit_note_deleted",
      description: `Credit note ${creditNote.creditNoteNumber} was deleted`,
      metadata: {
        creditNoteId,
        creditNoteNumber: creditNote.creditNoteNumber,
      },
    });

    revalidatePath("/credit-notes");

    return ok();
  } catch (error) {
    console.error("Error deleting credit note:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete credit note");
  }
}

/**
 * Get available credit for a client
 */
export async function getClientAvailableCredit(clientId: string): Promise<
  ActionResult<{
    totalCreditCents: number;
    appliedCreditCents: number;
    refundedCreditCents: number;
    availableCreditCents: number;
    creditNotes: Array<{
      id: string;
      creditNoteNumber: string;
      availableAmountCents: number;
    }>;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const creditNotes = await prisma.creditNote.findMany({
      where: {
        organizationId,
        clientId,
        status: "issued",
      },
      select: {
        id: true,
        creditNoteNumber: true,
        amountCents: true,
        appliedAmountCents: true,
        refundedAmountCents: true,
      },
    });

    let totalCreditCents = 0;
    let appliedCreditCents = 0;
    let refundedCreditCents = 0;
    const availableCreditNotes: Array<{
      id: string;
      creditNoteNumber: string;
      availableAmountCents: number;
    }> = [];

    for (const cn of creditNotes) {
      totalCreditCents += cn.amountCents;
      appliedCreditCents += cn.appliedAmountCents;
      refundedCreditCents += cn.refundedAmountCents;

      const available = cn.amountCents - cn.appliedAmountCents - cn.refundedAmountCents;
      if (available > 0) {
        availableCreditNotes.push({
          id: cn.id,
          creditNoteNumber: cn.creditNoteNumber,
          availableAmountCents: available,
        });
      }
    }

    return success({
      totalCreditCents,
      appliedCreditCents,
      refundedCreditCents,
      availableCreditCents: totalCreditCents - appliedCreditCents - refundedCreditCents,
      creditNotes: availableCreditNotes,
    });
  } catch (error) {
    console.error("Error fetching client available credit:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch client available credit");
  }
}
