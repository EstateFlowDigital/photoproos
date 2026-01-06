"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";
import { logActivity } from "@/lib/utils/activity";
import type { RecurringFrequency, LineItemType } from "@prisma/client";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

export interface RecurringInvoiceLineItem {
  itemType: LineItemType;
  description: string;
  quantity: number;
  unitCents: number;
}

export interface CreateRecurringInvoiceInput {
  clientId: string;
  frequency: RecurringFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  anchorDate: Date;
  lineItems: RecurringInvoiceLineItem[];
  notes?: string;
  terms?: string;
  dueDays?: number;
  taxRate?: number;
  endDate?: Date;
  maxInvoices?: number;
}

export interface UpdateRecurringInvoiceInput {
  id: string;
  frequency?: RecurringFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  lineItems?: RecurringInvoiceLineItem[];
  notes?: string;
  terms?: string;
  dueDays?: number;
  taxRate?: number;
  endDate?: Date;
  maxInvoices?: number;
  isActive?: boolean;
}

/**
 * Calculate the next run date based on frequency and current date
 */
function calculateNextRunDate(
  frequency: RecurringFrequency,
  anchorDate: Date,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null
): Date {
  const now = new Date();
  const nextDate = new Date(anchorDate);

  // If anchor date is in the past, calculate next occurrence
  if (nextDate < now) {
    switch (frequency) {
      case "weekly":
        while (nextDate < now) {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        break;
      case "biweekly":
        while (nextDate < now) {
          nextDate.setDate(nextDate.getDate() + 14);
        }
        break;
      case "monthly":
        while (nextDate < now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
          if (dayOfMonth) {
            // Handle months with fewer days
            const maxDays = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
            nextDate.setDate(Math.min(dayOfMonth, maxDays));
          }
        }
        break;
      case "quarterly":
        while (nextDate < now) {
          nextDate.setMonth(nextDate.getMonth() + 3);
          if (dayOfMonth) {
            const maxDays = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
            nextDate.setDate(Math.min(dayOfMonth, maxDays));
          }
        }
        break;
      case "yearly":
        while (nextDate < now) {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        break;
    }
  }

  return nextDate;
}

/**
 * Map recurring invoice item type to Prisma LineItemType
 */
function mapToLineItemType(itemType: string): LineItemType {
  const mapping: Record<string, LineItemType> = {
    service: "service",
    product: "service", // Map product to service
    addon: "service", // Map addon to service
    custom: "custom",
  };
  return mapping[itemType] || "service";
}

/**
 * Calculate invoice totals from line items
 */
function calculateTotals(
  lineItems: RecurringInvoiceLineItem[],
  taxRate: number = 0
): { subtotalCents: number; taxCents: number; totalCents: number } {
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCents,
    0
  );
  const taxCents = Math.round(subtotalCents * (taxRate / 100));
  const totalCents = subtotalCents + taxCents;

  return { subtotalCents, taxCents, totalCents };
}

/**
 * Create a new recurring invoice
 */
export async function createRecurringInvoice(
  input: CreateRecurringInvoiceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();
    const auth = await getAuthContext();

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, organizationId },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Get organization tax rate if not provided
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultTaxRate: true },
    });

    const taxRate = input.taxRate ?? org?.defaultTaxRate ?? 0;
    const { subtotalCents, taxCents, totalCents } = calculateTotals(
      input.lineItems,
      taxRate
    );

    const nextRunDate = calculateNextRunDate(
      input.frequency,
      input.anchorDate,
      input.dayOfMonth,
      input.dayOfWeek
    );

    const recurring = await prisma.recurringInvoice.create({
      data: {
        organizationId,
        clientId: input.clientId,
        frequency: input.frequency,
        dayOfMonth: input.dayOfMonth,
        dayOfWeek: input.dayOfWeek,
        anchorDate: input.anchorDate,
        nextRunDate,
        lineItems: JSON.parse(JSON.stringify(input.lineItems)),
        notes: input.notes,
        terms: input.terms,
        dueDays: input.dueDays ?? 30,
        subtotalCents,
        taxCents,
        totalCents,
        endDate: input.endDate,
        maxInvoices: input.maxInvoices,
      },
    });

    await logActivity({
      organizationId,
      type: "invoice_sent",
      description: `Created recurring invoice for ${client.fullName || client.email}`,
      userId: auth?.userId,
      metadata: {
        recurringInvoiceId: recurring.id,
        clientId: input.clientId,
        frequency: input.frequency,
        totalCents,
      },
    });

    revalidatePath("/invoices");
    revalidatePath("/invoices/recurring");

    return success({ id: recurring.id });
  } catch (error) {
    console.error("Error creating recurring invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create recurring invoice");
  }
}

/**
 * Update a recurring invoice
 */
export async function updateRecurringInvoice(
  input: UpdateRecurringInvoiceInput
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id: input.id, organizationId },
    });

    if (!existing) {
      return fail("Recurring invoice not found");
    }

    const updateData: Record<string, unknown> = {};

    if (input.frequency !== undefined) {
      updateData.frequency = input.frequency;
    }
    if (input.dayOfMonth !== undefined) {
      updateData.dayOfMonth = input.dayOfMonth;
    }
    if (input.dayOfWeek !== undefined) {
      updateData.dayOfWeek = input.dayOfWeek;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }
    if (input.terms !== undefined) {
      updateData.terms = input.terms;
    }
    if (input.dueDays !== undefined) {
      updateData.dueDays = input.dueDays;
    }
    if (input.endDate !== undefined) {
      updateData.endDate = input.endDate;
    }
    if (input.maxInvoices !== undefined) {
      updateData.maxInvoices = input.maxInvoices;
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    if (input.lineItems !== undefined) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { defaultTaxRate: true },
      });

      const taxRate = org?.defaultTaxRate ?? 0;
      const { subtotalCents, taxCents, totalCents } = calculateTotals(
        input.lineItems,
        taxRate
      );

      updateData.lineItems = JSON.parse(JSON.stringify(input.lineItems));
      updateData.subtotalCents = subtotalCents;
      updateData.taxCents = taxCents;
      updateData.totalCents = totalCents;
    }

    // Recalculate next run date if frequency changed
    if (input.frequency !== undefined) {
      const nextRunDate = calculateNextRunDate(
        input.frequency,
        existing.anchorDate,
        input.dayOfMonth ?? existing.dayOfMonth,
        input.dayOfWeek ?? existing.dayOfWeek
      );
      updateData.nextRunDate = nextRunDate;
    }

    await prisma.recurringInvoice.update({
      where: { id: input.id },
      data: updateData,
    });

    revalidatePath("/invoices");
    revalidatePath("/invoices/recurring");
    revalidatePath(`/invoices/recurring/${input.id}`);

    return ok();
  } catch (error) {
    console.error("Error updating recurring invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update recurring invoice");
  }
}

/**
 * Delete a recurring invoice
 */
export async function deleteRecurringInvoice(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return fail("Recurring invoice not found");
    }

    await prisma.recurringInvoice.delete({
      where: { id },
    });

    revalidatePath("/invoices");
    revalidatePath("/invoices/recurring");

    return ok();
  } catch (error) {
    console.error("Error deleting recurring invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete recurring invoice");
  }
}

/**
 * Pause a recurring invoice
 */
export async function pauseRecurringInvoice(
  id: string,
  pauseUntil?: Date
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return fail("Recurring invoice not found");
    }

    await prisma.recurringInvoice.update({
      where: { id },
      data: {
        isPaused: true,
        pausedAt: new Date(),
        pauseUntil,
      },
    });

    revalidatePath("/invoices");
    revalidatePath("/invoices/recurring");

    return ok();
  } catch (error) {
    console.error("Error pausing recurring invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to pause recurring invoice");
  }
}

/**
 * Resume a paused recurring invoice
 */
export async function resumeRecurringInvoice(id: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return fail("Recurring invoice not found");
    }

    // Recalculate next run date from now
    const nextRunDate = calculateNextRunDate(
      existing.frequency,
      new Date(),
      existing.dayOfMonth,
      existing.dayOfWeek
    );

    await prisma.recurringInvoice.update({
      where: { id },
      data: {
        isPaused: false,
        pausedAt: null,
        pauseUntil: null,
        nextRunDate,
      },
    });

    revalidatePath("/invoices");
    revalidatePath("/invoices/recurring");

    return ok();
  } catch (error) {
    console.error("Error resuming recurring invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to resume recurring invoice");
  }
}

/**
 * Get all recurring invoices for the organization
 */
export async function getRecurringInvoices(): Promise<
  ActionResult<
    Array<{
      id: string;
      client: { id: string; fullName: string | null; email: string; company: string | null };
      frequency: RecurringFrequency;
      totalCents: number;
      nextRunDate: Date;
      isActive: boolean;
      isPaused: boolean;
      invoicesCreated: number;
      lastInvoiceAt: Date | null;
      createdAt: Date;
    }>
  >
> {
  try {
    const organizationId = await requireOrganizationId();

    const recurring = await prisma.recurringInvoice.findMany({
      where: { organizationId },
      include: {
        client: {
          select: { id: true, fullName: true, email: true, company: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(
      recurring.map((r) => ({
        id: r.id,
        client: r.client,
        frequency: r.frequency,
        totalCents: r.totalCents,
        nextRunDate: r.nextRunDate,
        isActive: r.isActive,
        isPaused: r.isPaused,
        invoicesCreated: r.invoicesCreated,
        lastInvoiceAt: r.lastInvoiceAt,
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching recurring invoices:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch recurring invoices");
  }
}

/**
 * Get a single recurring invoice by ID
 */
export async function getRecurringInvoice(id: string): Promise<
  ActionResult<{
    id: string;
    client: { id: string; fullName: string | null; email: string; company: string | null };
    frequency: RecurringFrequency;
    dayOfMonth: number | null;
    dayOfWeek: number | null;
    anchorDate: Date;
    nextRunDate: Date;
    isActive: boolean;
    isPaused: boolean;
    pausedAt: Date | null;
    pauseUntil: Date | null;
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
    currency: string;
    notes: string | null;
    terms: string | null;
    dueDays: number;
    lineItems: RecurringInvoiceLineItem[];
    invoicesCreated: number;
    lastInvoiceAt: Date | null;
    lastInvoiceId: string | null;
    endDate: Date | null;
    maxInvoices: number | null;
    createdAt: Date;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const recurring = await prisma.recurringInvoice.findFirst({
      where: { id, organizationId },
      include: {
        client: {
          select: { id: true, fullName: true, email: true, company: true },
        },
      },
    });

    if (!recurring) {
      return fail("Recurring invoice not found");
    }

    return success({
      ...recurring,
      lineItems: recurring.lineItems as unknown as RecurringInvoiceLineItem[],
    });
  } catch (error) {
    console.error("Error fetching recurring invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch recurring invoice");
  }
}

/**
 * Get recurring invoices that are due to run (for cron job)
 */
export async function getRecurringInvoicesDueToRun(): Promise<
  ActionResult<
    Array<{
      id: string;
      organizationId: string;
      clientId: string;
      client: { id: string; fullName: string | null; email: string };
      frequency: RecurringFrequency;
      dayOfMonth: number | null;
      dayOfWeek: number | null;
      anchorDate: Date;
      subtotalCents: number;
      taxCents: number;
      totalCents: number;
      currency: string;
      notes: string | null;
      terms: string | null;
      dueDays: number;
      lineItems: RecurringInvoiceLineItem[];
      invoicesCreated: number;
      endDate: Date | null;
      maxInvoices: number | null;
    }>
  >
> {
  try {
    const now = new Date();

    const recurring = await prisma.recurringInvoice.findMany({
      where: {
        isActive: true,
        isPaused: false,
        nextRunDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gt: now } },
        ],
      },
      include: {
        client: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Filter out those that have reached maxInvoices
    const eligible = recurring.filter((r) => {
      if (r.maxInvoices === null) return true;
      return r.invoicesCreated < r.maxInvoices;
    });

    return success(
      eligible.map((r) => ({
        id: r.id,
        organizationId: r.organizationId,
        clientId: r.clientId,
        client: r.client,
        frequency: r.frequency,
        dayOfMonth: r.dayOfMonth,
        dayOfWeek: r.dayOfWeek,
        anchorDate: r.anchorDate,
        subtotalCents: r.subtotalCents,
        taxCents: r.taxCents,
        totalCents: r.totalCents,
        currency: r.currency,
        notes: r.notes,
        terms: r.terms,
        dueDays: r.dueDays,
        lineItems: r.lineItems as unknown as RecurringInvoiceLineItem[],
        invoicesCreated: r.invoicesCreated,
        endDate: r.endDate,
        maxInvoices: r.maxInvoices,
      }))
    );
  } catch (error) {
    console.error("Error fetching due recurring invoices:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch due recurring invoices");
  }
}

/**
 * Create an invoice from a recurring invoice template
 */
export async function createInvoiceFromRecurring(
  recurringId: string
): Promise<ActionResult<{ invoiceId: string }>> {
  try {
    const recurring = await prisma.recurringInvoice.findUnique({
      where: { id: recurringId },
      include: {
        client: true,
        organization: {
          select: { defaultTaxRate: true, currency: true },
        },
      },
    });

    if (!recurring) {
      return fail("Recurring invoice not found");
    }

    const lineItems = recurring.lineItems as unknown as RecurringInvoiceLineItem[];

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + recurring.dueDays);

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { organizationId: recurring.organizationId },
      orderBy: { invoiceNumber: "desc" },
    });
    const invoiceNumber = String((parseInt(lastInvoice?.invoiceNumber ?? "0", 10) || 0) + 1);

    // Create the invoice
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: recurring.organizationId,
        clientId: recurring.clientId,
        invoiceNumber,
        status: "sent",
        subtotalCents: recurring.subtotalCents,
        taxCents: recurring.taxCents,
        totalCents: recurring.totalCents,
        currency: recurring.currency,
        notes: recurring.notes,
        terms: recurring.terms,
        dueDate,
        lineItems: {
          create: lineItems.map((item, index) => ({
            itemType: mapToLineItemType(item.itemType),
            description: item.description,
            quantity: item.quantity,
            unitCents: item.unitCents,
            totalCents: item.quantity * item.unitCents,
            sortOrder: index,
          })),
        },
      },
    });

    // Calculate next run date
    const nextRunDate = calculateNextRunDate(
      recurring.frequency,
      new Date(),
      recurring.dayOfMonth,
      recurring.dayOfWeek
    );

    // Check if we should deactivate (reached max invoices or end date)
    let shouldDeactivate = false;
    if (recurring.maxInvoices !== null && recurring.invoicesCreated + 1 >= recurring.maxInvoices) {
      shouldDeactivate = true;
    }
    if (recurring.endDate && nextRunDate > recurring.endDate) {
      shouldDeactivate = true;
    }

    // Update the recurring invoice
    await prisma.recurringInvoice.update({
      where: { id: recurringId },
      data: {
        invoicesCreated: { increment: 1 },
        lastInvoiceAt: new Date(),
        lastInvoiceId: invoice.id,
        nextRunDate,
        isActive: shouldDeactivate ? false : undefined,
      },
    });

    await logActivity({
      organizationId: recurring.organizationId,
      type: "invoice_sent",
      description: `Auto-generated invoice #${invoiceNumber} from recurring template for ${recurring.client.fullName || recurring.client.email}`,
      metadata: {
        invoiceId: invoice.id,
        recurringInvoiceId: recurringId,
        totalCents: recurring.totalCents,
      },
    });

    return success({ invoiceId: invoice.id });
  } catch (error) {
    console.error("Error creating invoice from recurring:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create invoice from recurring");
  }
}

/**
 * Process all due recurring invoices (for cron job)
 */
export async function processRecurringInvoices(): Promise<
  ActionResult<{ processed: number; failed: number }>
> {
  try {
    const dueResult = await getRecurringInvoicesDueToRun();
    if (!dueResult.success) {
      return fail(dueResult.error);
    }

    let processed = 0;
    let failed = 0;

    for (const recurring of dueResult.data) {
      const result = await createInvoiceFromRecurring(recurring.id);
      if (result.success) {
        processed++;
      } else {
        failed++;
        console.error(`Failed to process recurring invoice ${recurring.id}:`, result.error);
      }
    }

    return success({ processed, failed });
  } catch (error) {
    console.error("Error processing recurring invoices:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to process recurring invoices");
  }
}
