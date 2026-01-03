"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import type { InvoiceSplitType } from "@prisma/client";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Types
// ============================================================================

export interface InvoiceSplitWithRelations {
  id: string;
  organizationId: string;
  primaryInvoiceId: string;
  secondaryInvoiceId: string | null;
  splitType: InvoiceSplitType;
  brokeragePayPercent: number | null;
  agentPayPercent: number | null;
  brokerageAmountCents: number | null;
  agentAmountCents: number | null;
  lineItemAssignments: Record<string, "brokerage" | "agent"> | null;
  createdAt: Date;
  primaryInvoice?: {
    id: string;
    invoiceNumber: string;
    totalCents: number;
    status: string;
  };
  secondaryInvoice?: {
    id: string;
    invoiceNumber: string;
    totalCents: number;
    status: string;
  } | null;
}

export interface CreateInvoiceSplitInput {
  primaryInvoiceId: string;
  splitType: InvoiceSplitType;
  brokeragePayPercent?: number | null;
  agentPayPercent?: number | null;
  lineItemAssignments?: Record<string, "brokerage" | "agent"> | null;
}

export interface SplitCalculation {
  brokerageAmountCents: number;
  agentAmountCents: number;
  splitDetails: Array<{
    lineItemId?: string;
    description: string;
    amountCents: number;
    assignedTo: "brokerage" | "agent";
  }>;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get invoice split configuration for an invoice
 */
export async function getInvoiceSplit(
  invoiceId: string
): Promise<ActionResult<InvoiceSplitWithRelations | null>> {
  try {
    const organizationId = await requireOrganizationId();

    const split = await prisma.invoiceSplit.findFirst({
      where: {
        organizationId,
        primaryInvoiceId: invoiceId,
      },
      include: {
        primaryInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalCents: true,
            status: true,
          },
        },
        secondaryInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalCents: true,
            status: true,
          },
        },
      },
    });

    if (!split) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ...split,
        lineItemAssignments: split.lineItemAssignments as Record<string, "brokerage" | "agent"> | null,
      },
    };
  } catch (error) {
    console.error("[InvoiceSplits] Error fetching split:", error);
    return { success: false, error: "Failed to fetch invoice split" };
  }
}

/**
 * Get all invoice splits for the organization
 */
export async function getInvoiceSplits(options?: {
  splitType?: InvoiceSplitType;
}): Promise<ActionResult<InvoiceSplitWithRelations[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const splits = await prisma.invoiceSplit.findMany({
      where: {
        organizationId,
        ...(options?.splitType && { splitType: options.splitType }),
      },
      include: {
        primaryInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalCents: true,
            status: true,
          },
        },
        secondaryInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalCents: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: splits.map((s) => ({
        ...s,
        lineItemAssignments: s.lineItemAssignments as Record<string, "brokerage" | "agent"> | null,
      })),
    };
  } catch (error) {
    console.error("[InvoiceSplits] Error fetching splits:", error);
    return { success: false, error: "Failed to fetch invoice splits" };
  }
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create or update an invoice split configuration
 */
export async function createInvoiceSplit(
  input: CreateInvoiceSplitInput
): Promise<ActionResult<InvoiceSplitWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify invoice exists and belongs to organization
    const invoice = await prisma.invoice.findFirst({
      where: { id: input.primaryInvoiceId, organizationId },
      include: {
        lineItems: true,
        client: {
          select: {
            brokerageId: true,
            brokerage: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    // Validate that client has a brokerage for split invoices
    if (input.splitType !== "single" && !invoice.client?.brokerageId) {
      return {
        success: false,
        error: "Cannot create split invoice for client without a brokerage",
      };
    }

    // Calculate split amounts based on type
    const calculation = calculateSplitAmounts(
      invoice.totalCents,
      invoice.lineItems,
      input.splitType,
      input.brokeragePayPercent ?? null,
      input.lineItemAssignments ?? null
    );

    // Check for existing split
    const existing = await prisma.invoiceSplit.findUnique({
      where: { primaryInvoiceId: input.primaryInvoiceId },
    });

    let split;
    let secondaryInvoiceId: string | null = null;

    // For dual invoices, we need to create a second invoice
    if (input.splitType === "dual" && !existing?.secondaryInvoiceId) {
      // Create the secondary invoice for brokerage
      const brokerageLineItems = invoice.lineItems.filter((item) => {
        if (!input.lineItemAssignments) return false;
        return input.lineItemAssignments[item.id] === "brokerage";
      });

      const secondaryInvoice = await prisma.invoice.create({
        data: {
          organizationId,
          clientId: invoice.clientId,
          invoiceNumber: `${invoice.invoiceNumber}-B`, // Brokerage suffix
          status: "draft",
          totalCents: calculation.brokerageAmountCents,
          subtotalCents: calculation.brokerageAmountCents,
          dueDate: invoice.dueDate,
          notes: `Split invoice from ${invoice.invoiceNumber} - Brokerage portion`,
          lineItems: {
            create: brokerageLineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
              totalCents: item.totalCents,
            })),
          },
        },
      });

      secondaryInvoiceId = secondaryInvoice.id;
    }

    if (existing) {
      // Update existing split
      split = await prisma.invoiceSplit.update({
        where: { id: existing.id },
        data: {
          splitType: input.splitType,
          brokeragePayPercent: input.brokeragePayPercent ?? null,
          agentPayPercent: input.splitType === "split"
            ? (100 - (input.brokeragePayPercent ?? 0))
            : null,
          brokerageAmountCents: calculation.brokerageAmountCents,
          agentAmountCents: calculation.agentAmountCents,
          lineItemAssignments: input.lineItemAssignments ?? undefined,
          ...(secondaryInvoiceId && { secondaryInvoiceId }),
        },
        include: {
          primaryInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalCents: true,
              status: true,
            },
          },
          secondaryInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalCents: true,
              status: true,
            },
          },
        },
      });
    } else {
      // Create new split
      split = await prisma.invoiceSplit.create({
        data: {
          organizationId,
          primaryInvoiceId: input.primaryInvoiceId,
          secondaryInvoiceId,
          splitType: input.splitType,
          brokeragePayPercent: input.brokeragePayPercent ?? null,
          agentPayPercent: input.splitType === "split"
            ? (100 - (input.brokeragePayPercent ?? 0))
            : null,
          brokerageAmountCents: calculation.brokerageAmountCents,
          agentAmountCents: calculation.agentAmountCents,
          lineItemAssignments: input.lineItemAssignments ?? undefined,
        },
        include: {
          primaryInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalCents: true,
              status: true,
            },
          },
          secondaryInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalCents: true,
              status: true,
            },
          },
        },
      });
    }

    revalidatePath(`/invoices/${input.primaryInvoiceId}`);
    return {
      success: true,
      data: {
        ...split,
        lineItemAssignments: split.lineItemAssignments as Record<string, "brokerage" | "agent"> | null,
      },
    };
  } catch (error) {
    console.error("[InvoiceSplits] Error creating split:", error);
    return { success: false, error: "Failed to create invoice split" };
  }
}

/**
 * Delete an invoice split configuration
 */
export async function deleteInvoiceSplit(invoiceId: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const split = await prisma.invoiceSplit.findFirst({
      where: {
        organizationId,
        primaryInvoiceId: invoiceId,
      },
    });

    if (!split) {
      return { success: false, error: "Invoice split not found" };
    }

    // If there's a secondary invoice, delete it first
    if (split.secondaryInvoiceId) {
      await prisma.invoice.delete({
        where: { id: split.secondaryInvoiceId },
      });
    }

    await prisma.invoiceSplit.delete({
      where: { id: split.id },
    });

    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[InvoiceSplits] Error deleting split:", error);
    return { success: false, error: "Failed to delete invoice split" };
  }
}

// ============================================================================
// Calculation Helpers
// ============================================================================

/**
 * Calculate split amounts based on the split type
 */
function calculateSplitAmounts(
  totalCents: number,
  lineItems: Array<{ id: string; totalCents: number; description: string }>,
  splitType: InvoiceSplitType,
  brokeragePayPercent: number | null,
  lineItemAssignments: Record<string, "brokerage" | "agent"> | null
): SplitCalculation {
  switch (splitType) {
    case "single":
      // No split - everything goes to agent
      return {
        brokerageAmountCents: 0,
        agentAmountCents: totalCents,
        splitDetails: lineItems.map((item) => ({
          lineItemId: item.id,
          description: item.description,
          amountCents: item.totalCents,
          assignedTo: "agent",
        })),
      };

    case "split":
      // Percentage-based split
      const brokeragePercent = brokeragePayPercent ?? 0;
      const brokerageAmount = Math.round(totalCents * (brokeragePercent / 100));
      return {
        brokerageAmountCents: brokerageAmount,
        agentAmountCents: totalCents - brokerageAmount,
        splitDetails: lineItems.map((item) => {
          const itemBrokerageAmount = Math.round(item.totalCents * (brokeragePercent / 100));
          return {
            lineItemId: item.id,
            description: item.description,
            amountCents: item.totalCents,
            assignedTo: "agent" as const, // Primary invoice shows agent portion
          };
        }),
      };

    case "dual":
      // Line-item based split
      let brokerageTotal = 0;
      let agentTotal = 0;
      const details: SplitCalculation["splitDetails"] = [];

      for (const item of lineItems) {
        const assignment = lineItemAssignments?.[item.id] ?? "agent";
        if (assignment === "brokerage") {
          brokerageTotal += item.totalCents;
        } else {
          agentTotal += item.totalCents;
        }
        details.push({
          lineItemId: item.id,
          description: item.description,
          amountCents: item.totalCents,
          assignedTo: assignment,
        });
      }

      return {
        brokerageAmountCents: brokerageTotal,
        agentAmountCents: agentTotal,
        splitDetails: details,
      };

    default:
      return {
        brokerageAmountCents: 0,
        agentAmountCents: totalCents,
        splitDetails: [],
      };
  }
}

/**
 * Preview split calculation without saving
 */
export async function previewInvoiceSplit(
  invoiceId: string,
  splitType: InvoiceSplitType,
  brokeragePayPercent?: number | null,
  lineItemAssignments?: Record<string, "brokerage" | "agent"> | null
): Promise<ActionResult<SplitCalculation>> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: {
        lineItems: {
          select: {
            id: true,
            description: true,
            totalCents: true,
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    const calculation = calculateSplitAmounts(
      invoice.totalCents,
      invoice.lineItems,
      splitType,
      brokeragePayPercent ?? null,
      lineItemAssignments ?? null
    );

    return { success: true, data: calculation };
  } catch (error) {
    console.error("[InvoiceSplits] Error previewing split:", error);
    return { success: false, error: "Failed to calculate split preview" };
  }
}

/**
 * Get split summary for an invoice (useful for display)
 */
export async function getInvoiceSplitSummary(invoiceId: string): Promise<
  ActionResult<{
    hasSplit: boolean;
    splitType: InvoiceSplitType | null;
    brokerageName: string | null;
    brokerageAmount: number;
    agentAmount: number;
    primaryInvoiceNumber: string;
    secondaryInvoiceNumber: string | null;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: {
        client: {
          select: {
            brokerage: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    const split = await prisma.invoiceSplit.findUnique({
      where: { primaryInvoiceId: invoiceId },
      include: {
        secondaryInvoice: {
          select: { invoiceNumber: true },
        },
      },
    });

    if (!split) {
      return {
        success: true,
        data: {
          hasSplit: false,
          splitType: null,
          brokerageName: invoice.client?.brokerage?.name ?? null,
          brokerageAmount: 0,
          agentAmount: invoice.totalCents,
          primaryInvoiceNumber: invoice.invoiceNumber,
          secondaryInvoiceNumber: null,
        },
      };
    }

    return {
      success: true,
      data: {
        hasSplit: true,
        splitType: split.splitType,
        brokerageName: invoice.client?.brokerage?.name ?? null,
        brokerageAmount: split.brokerageAmountCents ?? 0,
        agentAmount: split.agentAmountCents ?? 0,
        primaryInvoiceNumber: invoice.invoiceNumber,
        secondaryInvoiceNumber: split.secondaryInvoice?.invoiceNumber ?? null,
      },
    };
  } catch (error) {
    console.error("[InvoiceSplits] Error fetching split summary:", error);
    return { success: false, error: "Failed to fetch split summary" };
  }
}
