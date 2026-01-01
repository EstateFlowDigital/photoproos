"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { LineItemType } from "@prisma/client";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID
async function getOrganizationId(): Promise<string> {
  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!org) {
    throw new Error("No organization found");
  }

  return org.id;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const lineItemSchema = z.object({
  type: z.enum(["service", "travel", "custom", "discount", "tax"]),
  serviceId: z.string().cuid().optional().nullable(),
  bookingId: z.string().cuid().optional().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  unitPriceCents: z.number().int(),
  quantity: z.number().min(0),
  subtotalCents: z.number().int(),
});

const createInvoiceSchema = z.object({
  projectId: z.string().cuid(),
  dueDate: z.date().optional(),
  notes: z.string().max(2000).optional().nullable(),
  lineItems: z.array(lineItemSchema).min(1),
});

const updateInvoiceSchema = z.object({
  invoiceId: z.string().cuid(),
  dueDate: z.date().optional(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  lineItems: z.array(lineItemSchema).optional(),
});

// ============================================================================
// INVOICE OPERATIONS
// ============================================================================

/**
 * Create an invoice for a project
 */
export async function createInvoice(
  input: z.infer<typeof createInvoiceSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createInvoiceSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: validated.projectId,
        organizationId,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Calculate total
    const totalCents = validated.lineItems.reduce(
      (sum, item) => sum + item.subtotalCents,
      0
    );

    // Create invoice with line items
    const invoice = await prisma.invoice.create({
      data: {
        projectId: validated.projectId,
        status: "draft",
        totalCents,
        dueDate: validated.dueDate,
        notes: validated.notes,
        lineItems: {
          create: validated.lineItems.map((item, index) => ({
            type: item.type as LineItemType,
            serviceId: item.serviceId,
            bookingId: item.bookingId,
            name: item.name,
            description: item.description,
            unitPriceCents: item.unitPriceCents,
            quantity: item.quantity,
            subtotalCents: item.subtotalCents,
            order: index,
          })),
        },
      },
    });

    revalidatePath(`/projects/${validated.projectId}`);

    return { success: true, data: { id: invoice.id } };
  } catch (error) {
    console.error("Error creating invoice:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create invoice" };
  }
}

/**
 * Generate an invoice from a booking
 * Includes service and travel fees automatically
 */
export async function generateInvoiceFromBooking(
  bookingId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Get booking with all related data
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
      include: {
        service: true,
        project: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (!booking.projectId) {
      return { success: false, error: "Booking must have a project to generate an invoice" };
    }

    // Get organization travel settings
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        travelFeePerMile: true,
        travelFeeThreshold: true,
      },
    });

    const lineItems: z.infer<typeof lineItemSchema>[] = [];

    // Add service line item if exists
    if (booking.service) {
      lineItems.push({
        type: "service",
        serviceId: booking.service.id,
        bookingId: booking.id,
        name: booking.service.name,
        description: booking.service.description,
        unitPriceCents: booking.service.priceCents,
        quantity: 1,
        subtotalCents: booking.service.priceCents,
      });
    }

    // Add travel fee if applicable
    if (
      booking.distanceMiles &&
      booking.travelFeeCents &&
      booking.travelFeeCents > 0 &&
      org?.travelFeePerMile
    ) {
      const freeThreshold = org.travelFeeThreshold || 0;
      const billableMiles = Math.max(0, booking.distanceMiles - freeThreshold);

      if (billableMiles > 0) {
        lineItems.push({
          type: "travel",
          bookingId: booking.id,
          name: "Travel Fee",
          description: `${booking.distanceMiles.toFixed(1)} miles from home base (${freeThreshold} mi free)`,
          unitPriceCents: org.travelFeePerMile,
          quantity: billableMiles,
          subtotalCents: booking.travelFeeCents,
        });
      }
    }

    if (lineItems.length === 0) {
      return { success: false, error: "No billable items found for this booking" };
    }

    // Create the invoice
    const result = await createInvoice({
      projectId: booking.projectId,
      lineItems,
    });

    return result;
  } catch (error) {
    console.error("Error generating invoice from booking:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to generate invoice" };
  }
}

/**
 * Add a travel fee line item to an existing invoice
 */
export async function addTravelFeeToInvoice(
  invoiceId: string,
  bookingId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Get the invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        project: {
          organizationId,
        },
      },
      include: {
        lineItems: true,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status !== "draft") {
      return { success: false, error: "Can only modify draft invoices" };
    }

    // Check if travel fee already exists for this booking
    const existingTravelFee = invoice.lineItems.find(
      (item) => item.type === "travel" && item.bookingId === bookingId
    );

    if (existingTravelFee) {
      return { success: false, error: "Travel fee already added for this booking" };
    }

    // Get booking with travel data
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (!booking.distanceMiles || !booking.travelFeeCents || booking.travelFeeCents <= 0) {
      return { success: false, error: "No travel fee for this booking" };
    }

    // Get organization travel settings
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        travelFeePerMile: true,
        travelFeeThreshold: true,
      },
    });

    if (!org?.travelFeePerMile) {
      return { success: false, error: "Travel fees not configured" };
    }

    const freeThreshold = org.travelFeeThreshold || 0;
    const billableMiles = Math.max(0, booking.distanceMiles - freeThreshold);

    // Add travel fee line item
    const maxOrder = Math.max(...invoice.lineItems.map((i) => i.order), -1);

    await prisma.invoiceLineItem.create({
      data: {
        invoiceId,
        type: "travel",
        bookingId: booking.id,
        name: "Travel Fee",
        description: `${booking.distanceMiles.toFixed(1)} miles from home base (${freeThreshold} mi free)`,
        unitPriceCents: org.travelFeePerMile,
        quantity: billableMiles,
        subtotalCents: booking.travelFeeCents,
        order: maxOrder + 1,
      },
    });

    // Update invoice total
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        totalCents: invoice.totalCents + booking.travelFeeCents,
      },
    });

    revalidatePath(`/invoices/${invoiceId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error adding travel fee to invoice:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add travel fee" };
  }
}

/**
 * Get invoice with line items
 */
export async function getInvoice(invoiceId: string) {
  try {
    const organizationId = await getOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        project: {
          organizationId,
        },
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        lineItems: {
          orderBy: { order: "asc" },
          include: {
            service: true,
            booking: true,
          },
        },
      },
    });

    if (!invoice) {
      return null;
    }

    return {
      ...invoice,
      lineItems: invoice.lineItems.map((item) => ({
        id: item.id,
        type: item.type,
        serviceId: item.serviceId,
        bookingId: item.bookingId,
        name: item.name,
        description: item.description,
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
        subtotalCents: item.subtotalCents,
        service: item.service,
        booking: item.booking,
      })),
    };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

/**
 * Get invoices for a project
 */
export async function getProjectInvoices(projectId: string) {
  try {
    const organizationId = await getOrganizationId();

    const invoices = await prisma.invoice.findMany({
      where: {
        projectId,
        project: {
          organizationId,
        },
      },
      include: {
        lineItems: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching project invoices:", error);
    return [];
  }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        project: {
          organizationId,
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });

    revalidatePath(`/invoices/${invoiceId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating invoice status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update invoice status" };
  }
}

/**
 * Delete a draft invoice
 */
export async function deleteInvoice(invoiceId: string): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        project: {
          organizationId,
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status !== "draft") {
      return { success: false, error: "Can only delete draft invoices" };
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    revalidatePath(`/projects/${invoice.projectId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete invoice" };
  }
}

/**
 * Calculate travel fee preview for invoice builder
 */
export async function calculateTravelFeeForInvoice(
  bookingId: string
): Promise<ActionResult<{
  distanceMiles: number;
  feePerMileCents: number;
  freeThresholdMiles: number;
  travelFeeCents: number;
}>> {
  try {
    const organizationId = await getOrganizationId();

    // Get booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (!booking.distanceMiles) {
      return { success: false, error: "No distance calculated for this booking" };
    }

    // Get organization travel settings
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        travelFeePerMile: true,
        travelFeeThreshold: true,
      },
    });

    if (!org?.travelFeePerMile) {
      return { success: false, error: "Travel fees not configured" };
    }

    const freeThreshold = org.travelFeeThreshold || 0;
    const billableMiles = Math.max(0, booking.distanceMiles - freeThreshold);
    const travelFeeCents = Math.round(billableMiles * org.travelFeePerMile);

    return {
      success: true,
      data: {
        distanceMiles: booking.distanceMiles,
        feePerMileCents: org.travelFeePerMile,
        freeThresholdMiles: freeThreshold,
        travelFeeCents,
      },
    };
  } catch (error) {
    console.error("Error calculating travel fee:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to calculate travel fee" };
  }
}

// Type exports
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;
