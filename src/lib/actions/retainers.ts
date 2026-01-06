"use server";

/**
 * Retainer Tracking - Manage prepaid client balances
 * Clients can deposit funds that are applied to future invoices
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ClientRetainer, RetainerTransaction, RetainerTransactionType } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { logActivity } from "@/lib/utils/activity";

// ============================================================================
// Types
// ============================================================================

export type RetainerWithTransactions = ClientRetainer & {
  transactions: RetainerTransaction[];
  client: { id: string; fullName: string | null; email: string };
};

export interface CreateRetainerInput {
  clientId: string;
  initialDepositCents?: number;
  lowBalanceThresholdCents?: number;
  notes?: string;
}

export interface DepositInput {
  amountCents: number;
  description?: string;
  paymentId?: string;
}

export interface ApplyToInvoiceInput {
  invoiceId: string;
  amountCents: number;
  description?: string;
}

// ============================================================================
// Retainer CRUD Operations
// ============================================================================

/**
 * Create a new retainer for a client
 */
export async function createRetainer(
  input: CreateRetainerInput
): Promise<ActionResult<ClientRetainer>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  // Verify client belongs to this organization
  const client = await prisma.client.findFirst({
    where: { id: input.clientId, organizationId },
    select: { id: true, fullName: true },
  });

  if (!client) {
    return fail("Client not found");
  }

  // Check if client already has a retainer
  const existing = await prisma.clientRetainer.findFirst({
    where: { clientId: input.clientId },
  });

  if (existing) {
    return fail("Client already has a retainer account");
  }

  const initialDeposit = input.initialDepositCents ?? 0;

  const retainer = await prisma.clientRetainer.create({
    data: {
      organizationId,
      clientId: input.clientId,
      balanceCents: initialDeposit,
      totalDepositedCents: initialDeposit,
      lowBalanceThresholdCents: input.lowBalanceThresholdCents,
      notes: input.notes,
      ...(initialDeposit > 0 && {
        transactions: {
          create: {
            type: "deposit",
            amountCents: initialDeposit,
            description: "Initial deposit",
            balanceAfterCents: initialDeposit,
          },
        },
      }),
    },
  });

  await logActivity({
    organizationId,
    entityType: "retainer",
    entityId: retainer.id,
    action: "created",
    details: { clientId: input.clientId, initialDeposit },
  });

  revalidatePath("/clients/" + input.clientId);

  return success(retainer);
}

/**
 * Get a retainer by ID or client ID
 */
export async function getRetainer(options: {
  retainerId?: string;
  clientId?: string;
}): Promise<ActionResult<RetainerWithTransactions | null>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  if (!options.retainerId && !options.clientId) {
    return fail("Either retainerId or clientId is required");
  }

  const retainer = await prisma.clientRetainer.findFirst({
    where: {
      organizationId,
      ...(options.retainerId && { id: options.retainerId }),
      ...(options.clientId && { clientId: options.clientId }),
    },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 50 },
      client: { select: { id: true, fullName: true, email: true } },
    },
  });

  return success(retainer);
}

/**
 * List all retainers for the organization
 */
export async function listRetainers(options?: {
  activeOnly?: boolean;
  lowBalanceOnly?: boolean;
}): Promise<ActionResult<RetainerWithTransactions[]>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const retainers = await prisma.clientRetainer.findMany({
    where: {
      organizationId,
      ...(options?.activeOnly && { isActive: true }),
    },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 5 },
      client: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Filter for low balance if needed
  let result = retainers;
  if (options?.lowBalanceOnly) {
    result = retainers.filter(
      (r) =>
        r.lowBalanceThresholdCents !== null &&
        r.balanceCents <= r.lowBalanceThresholdCents
    );
  }

  return success(result);
}

/**
 * Update retainer settings
 */
export async function updateRetainer(
  retainerId: string,
  input: {
    lowBalanceThresholdCents?: number | null;
    notes?: string;
    isActive?: boolean;
  }
): Promise<ActionResult<ClientRetainer>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.clientRetainer.findFirst({
    where: { id: retainerId, organizationId },
  });

  if (!existing) {
    return fail("Retainer not found");
  }

  const retainer = await prisma.clientRetainer.update({
    where: { id: retainerId },
    data: {
      ...(input.lowBalanceThresholdCents !== undefined && {
        lowBalanceThresholdCents: input.lowBalanceThresholdCents,
      }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });

  revalidatePath("/clients/" + existing.clientId);

  return success(retainer);
}

// ============================================================================
// Retainer Transactions
// ============================================================================

/**
 * Add a deposit to a retainer
 */
export async function addDeposit(
  retainerId: string,
  input: DepositInput
): Promise<ActionResult<RetainerTransaction>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  if (input.amountCents <= 0) {
    return fail("Deposit amount must be positive");
  }

  const retainer = await prisma.clientRetainer.findFirst({
    where: { id: retainerId, organizationId },
  });

  if (!retainer) {
    return fail("Retainer not found");
  }

  if (!retainer.isActive) {
    return fail("Retainer is inactive");
  }

  const newBalance = retainer.balanceCents + input.amountCents;

  const [transaction] = await prisma.$transaction([
    prisma.retainerTransaction.create({
      data: {
        retainerId,
        type: "deposit",
        amountCents: input.amountCents,
        description: input.description ?? "Deposit",
        paymentId: input.paymentId,
        balanceAfterCents: newBalance,
      },
    }),
    prisma.clientRetainer.update({
      where: { id: retainerId },
      data: {
        balanceCents: newBalance,
        totalDepositedCents: { increment: input.amountCents },
      },
    }),
  ]);

  await logActivity({
    organizationId,
    entityType: "retainer",
    entityId: retainerId,
    action: "deposit",
    details: { amountCents: input.amountCents },
  });

  revalidatePath("/clients/" + retainer.clientId);

  return success(transaction);
}

/**
 * Apply retainer balance to an invoice
 */
export async function applyToInvoice(
  retainerId: string,
  input: ApplyToInvoiceInput
): Promise<ActionResult<RetainerTransaction>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  if (input.amountCents <= 0) {
    return fail("Amount must be positive");
  }

  const retainer = await prisma.clientRetainer.findFirst({
    where: { id: retainerId, organizationId },
  });

  if (!retainer) {
    return fail("Retainer not found");
  }

  if (!retainer.isActive) {
    return fail("Retainer is inactive");
  }

  if (retainer.balanceCents < input.amountCents) {
    return fail("Insufficient retainer balance");
  }

  // Verify invoice belongs to this organization and is payable
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: input.invoiceId,
      organizationId,
      status: { in: ["sent", "overdue", "partial"] },
    },
  });

  if (!invoice) {
    return fail("Invoice not found or not payable");
  }

  const balanceDue = invoice.totalCents - invoice.paidAmountCents;
  if (input.amountCents > balanceDue) {
    return fail("Amount exceeds invoice balance due");
  }

  const newRetainerBalance = retainer.balanceCents - input.amountCents;
  const newInvoicePaid = invoice.paidAmountCents + input.amountCents;
  const isFullyPaid = newInvoicePaid >= invoice.totalCents;

  const [transaction] = await prisma.$transaction([
    prisma.retainerTransaction.create({
      data: {
        retainerId,
        type: "usage",
        amountCents: input.amountCents,
        description: input.description ?? "Applied to invoice " + invoice.invoiceNumber,
        invoiceId: input.invoiceId,
        balanceAfterCents: newRetainerBalance,
      },
    }),
    prisma.clientRetainer.update({
      where: { id: retainerId },
      data: {
        balanceCents: newRetainerBalance,
        totalUsedCents: { increment: input.amountCents },
      },
    }),
    prisma.invoice.update({
      where: { id: input.invoiceId },
      data: {
        paidAmountCents: newInvoicePaid,
        status: isFullyPaid ? "paid" : "partial",
        ...(isFullyPaid && { paidAt: new Date() }),
      },
    }),
  ]);

  await logActivity({
    organizationId,
    entityType: "retainer",
    entityId: retainerId,
    action: "applied_to_invoice",
    details: { invoiceId: input.invoiceId, amountCents: input.amountCents },
  });

  revalidatePath("/clients/" + retainer.clientId);
  revalidatePath("/invoices/" + input.invoiceId);

  return success(transaction);
}

/**
 * Refund from retainer back to client
 */
export async function refundFromRetainer(
  retainerId: string,
  amountCents: number,
  description?: string
): Promise<ActionResult<RetainerTransaction>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  if (amountCents <= 0) {
    return fail("Refund amount must be positive");
  }

  const retainer = await prisma.clientRetainer.findFirst({
    where: { id: retainerId, organizationId },
  });

  if (!retainer) {
    return fail("Retainer not found");
  }

  if (retainer.balanceCents < amountCents) {
    return fail("Insufficient retainer balance for refund");
  }

  const newBalance = retainer.balanceCents - amountCents;

  const [transaction] = await prisma.$transaction([
    prisma.retainerTransaction.create({
      data: {
        retainerId,
        type: "refund",
        amountCents: amountCents,
        description: description ?? "Refund to client",
        balanceAfterCents: newBalance,
      },
    }),
    prisma.clientRetainer.update({
      where: { id: retainerId },
      data: {
        balanceCents: newBalance,
      },
    }),
  ]);

  await logActivity({
    organizationId,
    entityType: "retainer",
    entityId: retainerId,
    action: "refund",
    details: { amountCents },
  });

  revalidatePath("/clients/" + retainer.clientId);

  return success(transaction);
}

/**
 * Manual adjustment to retainer balance
 */
export async function adjustRetainerBalance(
  retainerId: string,
  amountCents: number,
  description: string
): Promise<ActionResult<RetainerTransaction>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  if (amountCents === 0) {
    return fail("Adjustment amount cannot be zero");
  }

  const retainer = await prisma.clientRetainer.findFirst({
    where: { id: retainerId, organizationId },
  });

  if (!retainer) {
    return fail("Retainer not found");
  }

  const newBalance = retainer.balanceCents + amountCents;
  if (newBalance < 0) {
    return fail("Adjustment would result in negative balance");
  }

  const [transaction] = await prisma.$transaction([
    prisma.retainerTransaction.create({
      data: {
        retainerId,
        type: "adjustment",
        amountCents: Math.abs(amountCents),
        description,
        balanceAfterCents: newBalance,
      },
    }),
    prisma.clientRetainer.update({
      where: { id: retainerId },
      data: {
        balanceCents: newBalance,
      },
    }),
  ]);

  await logActivity({
    organizationId,
    entityType: "retainer",
    entityId: retainerId,
    action: "adjustment",
    details: { amountCents, description },
  });

  revalidatePath("/clients/" + retainer.clientId);

  return success(transaction);
}

/**
 * Get transaction history for a retainer
 */
export async function getRetainerTransactions(
  retainerId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: RetainerTransactionType;
  }
): Promise<ActionResult<{ transactions: RetainerTransaction[]; total: number }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const retainer = await prisma.clientRetainer.findFirst({
    where: { id: retainerId, organizationId },
    select: { id: true },
  });

  if (!retainer) {
    return fail("Retainer not found");
  }

  const where = {
    retainerId,
    ...(options?.type && { type: options.type }),
  };

  const [transactions, total] = await Promise.all([
    prisma.retainerTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }),
    prisma.retainerTransaction.count({ where }),
  ]);

  return success({ transactions, total });
}

// ============================================================================
// Retainer Statistics
// ============================================================================

/**
 * Get retainer statistics for the organization
 */
export async function getRetainerStats(): Promise<
  ActionResult<{
    totalRetainers: number;
    activeRetainers: number;
    totalBalanceCents: number;
    totalDepositedCents: number;
    totalUsedCents: number;
    lowBalanceCount: number;
  }>
> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const [totals, lowBalance] = await Promise.all([
    prisma.clientRetainer.aggregate({
      where: { organizationId },
      _count: { id: true },
      _sum: {
        balanceCents: true,
        totalDepositedCents: true,
        totalUsedCents: true,
      },
    }),
    prisma.clientRetainer.count({
      where: {
        organizationId,
        isActive: true,
        lowBalanceThresholdCents: { not: null },
        balanceCents: { lte: prisma.clientRetainer.fields.lowBalanceThresholdCents },
      },
    }),
  ]);

  const activeCount = await prisma.clientRetainer.count({
    where: { organizationId, isActive: true },
  });

  return success({
    totalRetainers: totals._count.id,
    activeRetainers: activeCount,
    totalBalanceCents: totals._sum.balanceCents ?? 0,
    totalDepositedCents: totals._sum.totalDepositedCents ?? 0,
    totalUsedCents: totals._sum.totalUsedCents ?? 0,
    lowBalanceCount: lowBalance,
  });
}

/**
 * Get clients with low retainer balance
 */
export async function getLowBalanceRetainers(): Promise<ActionResult<RetainerWithTransactions[]>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const retainers = await prisma.clientRetainer.findMany({
    where: {
      organizationId,
      isActive: true,
      lowBalanceThresholdCents: { not: null },
    },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 3 },
      client: { select: { id: true, fullName: true, email: true } },
    },
  });

  // Filter to only include retainers below threshold
  const lowBalance = retainers.filter(
    (r) =>
      r.lowBalanceThresholdCents !== null &&
      r.balanceCents <= r.lowBalanceThresholdCents
  );

  return success(lowBalance);
}
