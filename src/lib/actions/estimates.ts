"use server";

/**
 * Estimates/Quotes - Create quotes that can be converted to invoices
 * Clients can view, approve, or reject estimates which helps with the sales process
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { LineItemType, EstimateStatus, Estimate, EstimateLineItem } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { logActivity } from "@/lib/utils/activity";

// ============================================================================
// Types
// ============================================================================

export interface CreateEstimateLineItem {
  itemType: LineItemType;
  description: string;
  quantity: number;
  unitCents: number;
  sortOrder?: number;
}

export interface CreateEstimateInput {
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  title?: string;
  description?: string;
  notes?: string;
  terms?: string;
  validDays?: number;
  lineItems: CreateEstimateLineItem[];
  discountCents?: number;
}

export interface UpdateEstimateInput {
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  title?: string;
  description?: string;
  notes?: string;
  terms?: string;
  validUntil?: Date;
  lineItems?: CreateEstimateLineItem[];
  discountCents?: number;
}

export type EstimateWithLineItems = Estimate & {
  lineItems: EstimateLineItem[];
  client?: { id: string; fullName: string | null; email: string } | null;
};

// ============================================================================
// Helper Functions
// ============================================================================

async function generateEstimateNumber(organizationId: string): Promise<string> {
  const lastEstimate = await prisma.estimate.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: { estimateNumber: true },
  });

  if (!lastEstimate) {
    return "EST-0001";
  }

  const match = lastEstimate.estimateNumber.match(/(\d+)$/);
  const lastNumber = match ? parseInt(match[1], 10) : 0;
  const nextNumber = lastNumber + 1;

  return "EST-" + nextNumber.toString().padStart(4, "0");
}

function calculateTotals(
  lineItems: CreateEstimateLineItem[],
  discountCents: number = 0,
  taxRate?: number
) {
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCents,
    0
  );
  const taxCents = taxRate ? Math.round((subtotalCents - discountCents) * (taxRate / 100)) : 0;
  const totalCents = subtotalCents - discountCents + taxCents;
  return { subtotalCents, taxCents, totalCents };
}

// ============================================================================
// Estimate CRUD Operations
// ============================================================================

/**
 * Create a new estimate
 */
export async function createEstimate(
  input: CreateEstimateInput
): Promise<ActionResult<EstimateWithLineItems>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  let clientInfo = {
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    clientAddress: input.clientAddress,
  };

  if (input.clientId) {
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, organizationId },
      select: { fullName: true, email: true, address: true },
    });
    if (client) {
      clientInfo = {
        clientName: client.fullName || input.clientName,
        clientEmail: client.email || input.clientEmail,
        clientAddress: client.address || input.clientAddress,
      };
    }
  }

  const estimateNumber = await generateEstimateNumber(organizationId);
  const { subtotalCents, taxCents, totalCents } = calculateTotals(
    input.lineItems,
    input.discountCents
  );

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (input.validDays ?? 30));

  const estimate = await prisma.estimate.create({
    data: {
      organizationId,
      clientId: input.clientId,
      estimateNumber,
      clientName: clientInfo.clientName,
      clientEmail: clientInfo.clientEmail,
      clientAddress: clientInfo.clientAddress,
      title: input.title,
      description: input.description,
      notes: input.notes,
      terms: input.terms,
      validUntil,
      subtotalCents,
      taxCents,
      discountCents: input.discountCents ?? 0,
      totalCents,
      lineItems: {
        create: input.lineItems.map((item, index) => ({
          itemType: item.itemType,
          description: item.description,
          quantity: item.quantity,
          unitCents: item.unitCents,
          totalCents: item.quantity * item.unitCents,
          sortOrder: item.sortOrder ?? index,
        })),
      },
    },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      client: { select: { id: true, fullName: true, email: true } },
    },
  });

  await logActivity({
    organizationId,
    type: "estimate_created",
    description: `Estimate ${estimateNumber} created`,
    metadata: { estimateId: estimate.id, estimateNumber, totalCents },
  });

  revalidatePath("/estimates");

  return success(estimate);
}

/**
 * Get an estimate by ID
 */
export async function getEstimate(
  estimateId: string
): Promise<ActionResult<EstimateWithLineItems>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const estimate = await prisma.estimate.findFirst({
    where: { id: estimateId, organizationId },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      client: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!estimate) {
    return fail("Estimate not found");
  }

  return success(estimate);
}

/**
 * List estimates with optional filters
 */
export async function listEstimates(options?: {
  clientId?: string;
  status?: EstimateStatus | EstimateStatus[];
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  sortBy?: "createdAt" | "validUntil" | "totalCents";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}): Promise<ActionResult<{ estimates: EstimateWithLineItems[]; total: number }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const where = {
    organizationId,
    ...(options?.clientId && { clientId: options.clientId }),
    ...(options?.status && {
      status: Array.isArray(options.status)
        ? { in: options.status }
        : options.status,
    }),
    ...(options?.fromDate && { createdAt: { gte: options.fromDate } }),
    ...(options?.toDate && { createdAt: { lte: options.toDate } }),
    ...(options?.search && {
      OR: [
        { estimateNumber: { contains: options.search, mode: "insensitive" as const } },
        { clientName: { contains: options.search, mode: "insensitive" as const } },
        { title: { contains: options.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [estimates, total] = await Promise.all([
    prisma.estimate.findMany({
      where,
      include: {
        lineItems: { orderBy: { sortOrder: "asc" } },
        client: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { [options?.sortBy ?? "createdAt"]: options?.sortOrder ?? "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }),
    prisma.estimate.count({ where }),
  ]);

  return success({ estimates, total });
}

/**
 * Update an estimate (only draft estimates can be updated)
 */
export async function updateEstimate(
  estimateId: string,
  input: UpdateEstimateInput
): Promise<ActionResult<EstimateWithLineItems>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.estimate.findFirst({
    where: { id: estimateId, organizationId },
  });

  if (!existing) {
    return fail("Estimate not found");
  }

  if (existing.status !== "draft") {
    return fail("Only draft estimates can be edited");
  }

  let totals = {};
  if (input.lineItems) {
    totals = calculateTotals(input.lineItems, input.discountCents ?? existing.discountCents);
  }

  const estimate = await prisma.estimate.update({
    where: { id: estimateId },
    data: {
      ...(input.clientId !== undefined && { clientId: input.clientId }),
      ...(input.clientName !== undefined && { clientName: input.clientName }),
      ...(input.clientEmail !== undefined && { clientEmail: input.clientEmail }),
      ...(input.clientAddress !== undefined && { clientAddress: input.clientAddress }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.terms !== undefined && { terms: input.terms }),
      ...(input.validUntil !== undefined && { validUntil: input.validUntil }),
      ...(input.discountCents !== undefined && { discountCents: input.discountCents }),
      ...totals,
      ...(input.lineItems && {
        lineItems: {
          deleteMany: {},
          create: input.lineItems.map((item, index) => ({
            itemType: item.itemType,
            description: item.description,
            quantity: item.quantity,
            unitCents: item.unitCents,
            totalCents: item.quantity * item.unitCents,
            sortOrder: item.sortOrder ?? index,
          })),
        },
      }),
    },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      client: { select: { id: true, fullName: true, email: true } },
    },
  });

  await logActivity({
    organizationId,
    type: "estimate_updated",
    description: `Estimate ${estimate.estimateNumber} updated`,
    metadata: { estimateId },
  });

  revalidatePath("/estimates");
  revalidatePath("/estimates/" + estimateId);

  return success(estimate);
}

/**
 * Delete an estimate (only draft estimates can be deleted)
 */
export async function deleteEstimate(
  estimateId: string
): Promise<ActionResult<void>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.estimate.findFirst({
    where: { id: estimateId, organizationId },
  });

  if (!existing) {
    return fail("Estimate not found");
  }

  if (existing.status !== "draft") {
    return fail("Only draft estimates can be deleted");
  }

  await prisma.estimate.delete({
    where: { id: estimateId },
  });

  await logActivity({
    organizationId,
    type: "estimate_updated",
    description: `Estimate ${existing.estimateNumber} deleted`,
    metadata: { estimateId, estimateNumber: existing.estimateNumber },
  });

  revalidatePath("/estimates");

  return ok();
}

// ============================================================================
// Estimate Status Transitions
// ============================================================================

/**
 * Send an estimate to the client
 */
export async function sendEstimate(
  estimateId: string
): Promise<ActionResult<Estimate>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const estimate = await prisma.estimate.findFirst({
    where: { id: estimateId, organizationId },
    include: { client: true },
  });

  if (!estimate) {
    return fail("Estimate not found");
  }

  if (estimate.status !== "draft") {
    return fail("Only draft estimates can be sent");
  }

  if (estimate.validUntil < new Date()) {
    return fail("Estimate has expired. Please update the validity date.");
  }

  const updated = await prisma.estimate.update({
    where: { id: estimateId },
    data: { status: "sent" },
  });

  await logActivity({
    organizationId,
    type: "estimate_sent",
    description: `Estimate ${estimate.estimateNumber} sent to ${estimate.clientEmail}`,
    metadata: { estimateId, clientEmail: estimate.clientEmail },
  });

  revalidatePath("/estimates");
  revalidatePath("/estimates/" + estimateId);

  return success(updated);
}

/**
 * Mark estimate as viewed (called when client views the estimate)
 */
export async function markEstimateViewed(
  estimateId: string
): Promise<ActionResult<Estimate>> {
  const estimate = await prisma.estimate.findUnique({
    where: { id: estimateId },
  });

  if (!estimate) {
    return fail("Estimate not found");
  }

  if (estimate.viewedAt) {
    return success(estimate);
  }

  const updated = await prisma.estimate.update({
    where: { id: estimateId },
    data: {
      status: estimate.status === "sent" ? "viewed" : estimate.status,
      viewedAt: new Date(),
    },
  });

  return success(updated);
}

/**
 * Client approves the estimate
 */
export async function approveEstimate(
  estimateId: string
): Promise<ActionResult<Estimate>> {
  const estimate = await prisma.estimate.findUnique({
    where: { id: estimateId },
  });

  if (!estimate) {
    return fail("Estimate not found");
  }

  if (!["sent", "viewed"].includes(estimate.status)) {
    return fail("Estimate cannot be approved in its current state");
  }

  if (estimate.validUntil < new Date()) {
    return fail("Estimate has expired");
  }

  const updated = await prisma.estimate.update({
    where: { id: estimateId },
    data: {
      status: "approved",
      approvedAt: new Date(),
    },
  });

  await logActivity({
    organizationId: estimate.organizationId,
    type: "estimate_approved",
    description: `Estimate ${estimate.estimateNumber} approved`,
    metadata: { estimateId },
  });

  revalidatePath("/estimates");

  return success(updated);
}

/**
 * Client rejects the estimate
 */
export async function rejectEstimate(
  estimateId: string,
  reason?: string
): Promise<ActionResult<Estimate>> {
  const estimate = await prisma.estimate.findUnique({
    where: { id: estimateId },
  });

  if (!estimate) {
    return fail("Estimate not found");
  }

  if (!["sent", "viewed"].includes(estimate.status)) {
    return fail("Estimate cannot be rejected in its current state");
  }

  const updated = await prisma.estimate.update({
    where: { id: estimateId },
    data: {
      status: "rejected",
      rejectedAt: new Date(),
      rejectionReason: reason,
    },
  });

  await logActivity({
    organizationId: estimate.organizationId,
    type: "estimate_rejected",
    description: `Estimate ${estimate.estimateNumber} rejected${reason ? `: ${reason}` : ""}`,
    metadata: { estimateId, reason },
  });

  revalidatePath("/estimates");

  return success(updated);
}

// ============================================================================
// Convert Estimate to Invoice
// ============================================================================

/**
 * Convert an approved estimate to an invoice
 */
export async function convertEstimateToInvoice(
  estimateId: string,
  options?: {
    dueDays?: number;
    notes?: string;
    terms?: string;
  }
): Promise<ActionResult<{ invoiceId: string }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const estimate = await prisma.estimate.findFirst({
    where: { id: estimateId, organizationId },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });

  if (!estimate) {
    return fail("Estimate not found");
  }

  if (estimate.status !== "approved") {
    return fail("Only approved estimates can be converted to invoices");
  }

  if (estimate.convertedToInvoiceId) {
    return fail("Estimate has already been converted to an invoice");
  }

  const lastInvoice = await prisma.invoice.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  let invoiceNumber = "INV-0001";
  if (lastInvoice) {
    const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
    const lastNumber = match ? parseInt(match[1], 10) : 0;
    invoiceNumber = "INV-" + (lastNumber + 1).toString().padStart(4, "0");
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (options?.dueDays ?? 30));

  const invoice = await prisma.invoice.create({
    data: {
      organizationId,
      clientId: estimate.clientId,
      invoiceNumber,
      status: "draft",
      clientName: estimate.clientName,
      clientEmail: estimate.clientEmail,
      clientAddress: estimate.clientAddress,
      notes: options?.notes ?? estimate.notes,
      terms: options?.terms ?? estimate.terms,
      dueDate,
      subtotalCents: estimate.subtotalCents,
      taxCents: estimate.taxCents,
      discountCents: estimate.discountCents,
      totalCents: estimate.totalCents,
      lineItems: {
        create: estimate.lineItems.map((item) => ({
          itemType: item.itemType,
          description: item.description,
          quantity: item.quantity,
          unitCents: item.unitCents,
          totalCents: item.totalCents,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  await prisma.estimate.update({
    where: { id: estimateId },
    data: {
      status: "converted",
      convertedToInvoiceId: invoice.id,
      convertedAt: new Date(),
    },
  });

  await logActivity({
    organizationId,
    type: "estimate_converted",
    description: `Estimate ${estimate.estimateNumber} converted to invoice ${invoiceNumber}`,
    invoiceId: invoice.id,
    metadata: { estimateId, invoiceId: invoice.id, invoiceNumber },
  });

  revalidatePath("/estimates");
  revalidatePath("/invoices");

  return success({ invoiceId: invoice.id });
}

/**
 * Duplicate an estimate
 */
export async function duplicateEstimate(
  estimateId: string
): Promise<ActionResult<EstimateWithLineItems>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const existing = await prisma.estimate.findFirst({
    where: { id: estimateId, organizationId },
    include: { lineItems: true },
  });

  if (!existing) {
    return fail("Estimate not found");
  }

  const estimateNumber = await generateEstimateNumber(organizationId);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  const duplicate = await prisma.estimate.create({
    data: {
      organizationId,
      clientId: existing.clientId,
      estimateNumber,
      status: "draft",
      clientName: existing.clientName,
      clientEmail: existing.clientEmail,
      clientAddress: existing.clientAddress,
      title: existing.title,
      description: existing.description,
      notes: existing.notes,
      terms: existing.terms,
      validUntil,
      subtotalCents: existing.subtotalCents,
      taxCents: existing.taxCents,
      discountCents: existing.discountCents,
      totalCents: existing.totalCents,
      lineItems: {
        create: existing.lineItems.map((item) => ({
          itemType: item.itemType,
          description: item.description,
          quantity: item.quantity,
          unitCents: item.unitCents,
          totalCents: item.totalCents,
          sortOrder: item.sortOrder,
        })),
      },
    },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      client: { select: { id: true, fullName: true, email: true } },
    },
  });

  await logActivity({
    organizationId,
    type: "estimate_created",
    description: `Estimate ${duplicate.estimateNumber} created (duplicated from ${estimateNumber})`,
    metadata: { estimateId: duplicate.id, duplicatedFrom: estimateId },
  });

  revalidatePath("/estimates");

  return success(duplicate);
}

/**
 * Get estimate statistics
 */
export async function getEstimateStats(): Promise<
  ActionResult<{
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
    converted: number;
    expired: number;
    totalValueCents: number;
    approvedValueCents: number;
    conversionRate: number;
  }>
> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const [statusCounts, totalValue, approvedValue] = await Promise.all([
    prisma.estimate.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { id: true },
    }),
    prisma.estimate.aggregate({
      where: { organizationId },
      _sum: { totalCents: true },
    }),
    prisma.estimate.aggregate({
      where: { organizationId, status: "approved" },
      _sum: { totalCents: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const item of statusCounts) {
    counts[item.status] = item._count.id;
  }

  const totalSentOrViewed = (counts.sent || 0) + (counts.viewed || 0) + (counts.approved || 0) + (counts.rejected || 0);
  const conversionRate = totalSentOrViewed > 0
    ? ((counts.approved || 0) / totalSentOrViewed) * 100
    : 0;

  return success({
    draft: counts.draft || 0,
    sent: (counts.sent || 0) + (counts.viewed || 0),
    approved: counts.approved || 0,
    rejected: counts.rejected || 0,
    converted: counts.converted || 0,
    expired: counts.expired || 0,
    totalValueCents: totalValue._sum.totalCents || 0,
    approvedValueCents: approvedValue._sum.totalCents || 0,
    conversionRate: Math.round(conversionRate * 10) / 10,
  });
}
