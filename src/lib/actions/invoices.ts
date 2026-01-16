"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { LineItemType, InvoiceStatus } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";
import { logActivity } from "@/lib/utils/activity";
import { Resend } from "resend";
import { InvoiceReminderEmail } from "@/emails/invoice-reminder";
import { InvoiceSentEmail } from "@/emails/invoice-sent";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { perfStart, perfEnd } from "@/lib/utils/perf-logger";
import { generateInvoicePdfBuffer } from "@/lib/actions/invoice-pdf";

// Lazy initialize Resend to avoid build errors
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// ============================================================================
// INVOICE OPERATIONS
// ============================================================================

/**
 * Generate the next invoice number for the organization
 */
async function generateInvoiceNumber(organizationId: string): Promise<string> {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  if (!lastInvoice) {
    return "INV-0001";
  }

  // Extract number from invoice number (e.g., "INV-0001" -> 1)
  const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
  const lastNumber = match ? parseInt(match[1], 10) : 0;
  const nextNumber = lastNumber + 1;

  return `INV-${nextNumber.toString().padStart(4, "0")}`;
}

/**
 * Mark sent invoices as overdue if past due date
 * This ensures the database status reflects reality
 */
async function markOverdueInvoices(organizationId: string): Promise<number> {
  const now = new Date();

  const result = await prisma.invoice.updateMany({
    where: {
      organizationId,
      status: "sent",
      dueDate: {
        lt: now,
      },
    },
    data: {
      status: "overdue",
    },
  });

  return result.count;
}

/**
 * Create an invoice for a client
 */
interface CreateInvoiceInput {
  clientId: string;
  dueDate?: Date;
  notes?: string;
  terms?: string;
  lineItems: {
    itemType: LineItemType;
    bookingId?: string;
    description: string;
    quantity: number;
    unitCents: number;
  }[];
}

export async function createInvoice(
  input: CreateInvoiceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Check plan limit for monthly invoices
    const { enforcePlanLimit } = await import("./plan-enforcement");
    const limitCheck = await enforcePlanLimit("invoices_per_month");
    if (!limitCheck.success) {
      return fail(limitCheck.error);
    }

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: {
        id: input.clientId,
        organizationId,
      },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Calculate totals
    const subtotalCents = input.lineItems.reduce(
      (sum, item) => sum + item.unitCents * item.quantity,
      0
    );

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(organizationId);

    // Set due date to 30 days from now if not provided
    const dueDate = input.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create invoice with line items
    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        clientId: input.clientId,
        invoiceNumber,
        status: "draft",
        subtotalCents,
        totalCents: subtotalCents, // Can add tax/discount logic later
        dueDate,
        notes: input.notes,
        terms: input.terms,
        clientName: client.fullName || client.company,
        clientEmail: client.email,
        lineItems: {
          create: input.lineItems.map((item, index) => ({
            itemType: item.itemType,
            bookingId: item.bookingId,
            description: item.description,
            quantity: item.quantity,
            unitCents: item.unitCents,
            totalCents: item.unitCents * item.quantity,
            sortOrder: index,
          })),
        },
      },
    });

    // Log activity
    const auth = await getAuthContext();
    await logActivity({
      organizationId,
      type: "invoice_sent", // Using invoice_sent as closest match
      description: `Invoice ${invoiceNumber} created for ${client.fullName || client.email}`,
      userId: auth?.userId,
      invoiceId: invoice.id,
      clientId: input.clientId,
      metadata: {
        invoiceNumber,
        totalCents: subtotalCents,
        clientName: client.fullName,
      },
    });

    revalidatePath("/invoices");

    return success({ id: invoice.id });
  } catch (error) {
    console.error("Error creating invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create invoice");
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
    const organizationId = await requireOrganizationId();

    // Get booking with all related data
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
      include: {
        service: true,
        client: true,
      },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    if (!booking.clientId) {
      return fail("Booking must have a client to generate an invoice");
    }

    // Get organization travel settings
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        travelFeePerMile: true,
        travelFeeThreshold: true,
      },
    });

    const lineItems: CreateInvoiceInput["lineItems"] = [];

    // Add service line item if exists
    if (booking.service) {
      lineItems.push({
        itemType: "service",
        bookingId: booking.id,
        description: booking.service.name + (booking.service.description ? ` - ${booking.service.description}` : ""),
        quantity: 1,
        unitCents: booking.service.priceCents,
      });
    }

    // Add travel fee if applicable
    if (
      booking.distanceMiles &&
      booking.travelFeeCents &&
      booking.travelFeeCents > 0
    ) {
      const freeThreshold = org?.travelFeeThreshold || 0;

      lineItems.push({
        itemType: "travel",
        bookingId: booking.id,
        description: `Travel Fee - ${booking.distanceMiles.toFixed(1)} miles from home base${freeThreshold > 0 ? ` (${freeThreshold} mi free)` : ""}`,
        quantity: 1,
        unitCents: booking.travelFeeCents,
      });
    }

    if (lineItems.length === 0) {
      return fail("No billable items found for this booking");
    }

    // Create the invoice
    const result = await createInvoice({
      clientId: booking.clientId,
      lineItems,
    });

    return result;
  } catch (error) {
    console.error("Error generating invoice from booking:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to generate invoice");
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
    const organizationId = await requireOrganizationId();

    // Get the invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        lineItems: true,
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    if (invoice.status !== "draft") {
      return fail("Can only modify draft invoices");
    }

    // Check if travel fee already exists for this booking
    const existingTravelFee = invoice.lineItems.find(
      (item) => item.itemType === "travel" && item.bookingId === bookingId
    );

    if (existingTravelFee) {
      return fail("Travel fee already added for this booking");
    }

    // Get booking with travel data
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    if (!booking.distanceMiles || !booking.travelFeeCents || booking.travelFeeCents <= 0) {
      return fail("No travel fee for this booking");
    }

    // Get organization travel settings
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        travelFeeThreshold: true,
      },
    });

    const freeThreshold = org?.travelFeeThreshold || 0;

    // Add travel fee line item
    const maxOrder = Math.max(...invoice.lineItems.map((i) => i.sortOrder), -1);

    await prisma.invoiceLineItem.create({
      data: {
        invoiceId,
        itemType: "travel",
        bookingId: booking.id,
        description: `Travel Fee - ${booking.distanceMiles.toFixed(1)} miles from home base${freeThreshold > 0 ? ` (${freeThreshold} mi free)` : ""}`,
        quantity: 1,
        unitCents: booking.travelFeeCents,
        totalCents: booking.travelFeeCents,
        sortOrder: maxOrder + 1,
      },
    });

    // Update invoice totals
    const newSubtotal = invoice.subtotalCents + booking.travelFeeCents;
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotalCents: newSubtotal,
        totalCents: newSubtotal, // Can add tax/discount logic later
      },
    });

    revalidatePath(`/invoices/${invoiceId}`);

    return ok();
  } catch (error) {
    console.error("Error adding travel fee to invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to add travel fee");
  }
}

/**
 * Get invoice with line items
 */
export async function getInvoice(invoiceId: string) {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        client: true,
        lineItems: {
          orderBy: { sortOrder: "asc" },
          include: {
            booking: {
              select: {
                id: true,
                title: true,
                startTime: true,
              },
            },
          },
        },
      },
    });

    return invoice;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

/**
 * Get all invoices for the organization
 * Automatically marks sent invoices as overdue if past due date
 */
export async function getInvoices(filters?: {
  status?: InvoiceStatus;
  clientId?: string;
}) {
  const perfStartTime = perfStart("invoices:getInvoices");
  try {
    const organizationId = await requireOrganizationId();

    // Auto-update overdue invoices before fetching
    await markOverdueInvoices(organizationId);

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            company: true,
            email: true,
          },
        },
        lineItems: {
          select: {
            id: true,
            itemType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  } finally {
    perfEnd("invoices:getInvoices", perfStartTime);
  }
}

/**
 * Get invoices for a client
 */
export async function getClientInvoices(clientId: string) {
  try {
    const organizationId = await requireOrganizationId();

    const invoices = await prisma.invoice.findMany({
      where: {
        clientId,
        organizationId,
      },
      include: {
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching client invoices:", error);
    return [];
  }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    const updateData: { status: InvoiceStatus; paidAt?: Date | null } = { status };

    // Set paidAt when marking as paid
    if (status === "paid" && !invoice.paidAt) {
      updateData.paidAt = new Date();
    }

    // Clear paidAt if moving away from paid status
    if (status !== "paid" && invoice.paidAt) {
      updateData.paidAt = null;
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    });

    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/invoices");

    return ok();
  } catch (error) {
    console.error("Error updating invoice status:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update invoice status");
  }
}

/**
 * Delete a draft invoice
 */
export async function deleteInvoice(invoiceId: string): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    if (invoice.status !== "draft") {
      return fail("Can only delete draft invoices");
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    revalidatePath("/invoices");

    return ok();
  } catch (error) {
    console.error("Error deleting invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete invoice");
  }
}

/**
 * Update an existing draft invoice
 */
interface UpdateInvoiceInput {
  clientId: string;
  dueDate?: Date;
  notes?: string;
  terms?: string;
  discountCents?: number;
  taxCents?: number;
  lateFeeEnabled?: boolean;
  lateFeeType?: string;
  lateFeePercent?: number;
  lateFeeFlatCents?: number;
  lineItems: {
    id?: string;
    itemType: LineItemType;
    bookingId?: string;
    description: string;
    quantity: number;
    unitCents: number;
    sortOrder: number;
  }[];
}

export async function updateInvoice(
  invoiceId: string,
  input: UpdateInvoiceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify invoice exists and belongs to organization
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        lineItems: true,
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    if (invoice.status !== "draft") {
      return fail("Can only edit draft invoices");
    }

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: {
        id: input.clientId,
        organizationId,
      },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Calculate totals
    const subtotalCents = input.lineItems.reduce(
      (sum, item) => sum + item.unitCents * item.quantity,
      0
    );
    const discountCents = input.discountCents || 0;
    const taxCents = input.taxCents || 0;
    const totalCents = subtotalCents - discountCents + taxCents;

    // Get existing line item IDs
    const existingIds = invoice.lineItems.map((item) => item.id);
    const inputIds = input.lineItems.filter((item) => item.id).map((item) => item.id);
    const idsToDelete = existingIds.filter((id) => !inputIds.includes(id));

    // Update invoice with new data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete removed line items
      if (idsToDelete.length > 0) {
        await tx.invoiceLineItem.deleteMany({
          where: {
            id: { in: idsToDelete },
            invoiceId,
          },
        });
      }

      // Upsert line items
      for (const item of input.lineItems) {
        if (item.id && existingIds.includes(item.id)) {
          // Update existing
          await tx.invoiceLineItem.update({
            where: { id: item.id },
            data: {
              description: item.description,
              quantity: item.quantity,
              unitCents: item.unitCents,
              totalCents: item.unitCents * item.quantity,
              itemType: item.itemType,
              sortOrder: item.sortOrder,
            },
          });
        } else {
          // Create new
          await tx.invoiceLineItem.create({
            data: {
              invoiceId,
              description: item.description,
              quantity: item.quantity,
              unitCents: item.unitCents,
              totalCents: item.unitCents * item.quantity,
              itemType: item.itemType,
              sortOrder: item.sortOrder,
            },
          });
        }
      }

      // Update invoice
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          clientId: input.clientId,
          clientName: client.fullName || client.company,
          clientEmail: client.email,
          dueDate: input.dueDate,
          notes: input.notes,
          terms: input.terms,
          subtotalCents,
          discountCents,
          taxCents,
          totalCents,
          lateFeeEnabled: input.lateFeeEnabled ?? false,
          lateFeeType: input.lateFeeType,
          lateFeePercent: input.lateFeePercent,
          lateFeeFlatCents: input.lateFeeFlatCents,
        },
      });
    });

    // Log activity
    const auth = await getAuthContext();
    await logActivity({
      organizationId,
      type: "invoice_sent",
      description: `Invoice ${invoice.invoiceNumber} updated`,
      userId: auth?.userId,
      invoiceId,
      clientId: input.clientId,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        totalCents,
      },
    });

    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/invoices");

    return success({ id: invoiceId });
  } catch (error) {
    console.error("Error updating invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update invoice");
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
    const organizationId = await requireOrganizationId();

    // Get booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId,
      },
    });

    if (!booking) {
      return fail("Booking not found");
    }

    if (!booking.distanceMiles) {
      return fail("No distance calculated for this booking");
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
      return fail("Travel fees not configured");
    }

    const freeThreshold = org.travelFeeThreshold || 0;
    const billableMiles = Math.max(0, booking.distanceMiles - freeThreshold);
    const travelFeeCents = Math.round(billableMiles * org.travelFeePerMile);

    return success({
      distanceMiles: booking.distanceMiles,
      feePerMileCents: org.travelFeePerMile,
      freeThresholdMiles: freeThreshold,
      travelFeeCents,
    });
  } catch (error) {
    console.error("Error calculating travel fee:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to calculate travel fee");
  }
}

// ============================================================================
// INVOICE SENDING
// ============================================================================

/**
 * Send an invoice to a client via email
 */
export async function sendInvoice(
  invoiceId: string
): Promise<ActionResult<{ sent: boolean }>> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        client: {
          select: {
            email: true,
            fullName: true,
          },
        },
        organization: {
          select: {
            name: true,
            publicEmail: true,
          },
        },
        lineItems: {
          select: {
            description: true,
          },
        },
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    if (invoice.status === "paid") {
      return fail("Invoice is already paid");
    }

    const clientEmail = invoice.clientEmail || invoice.client?.email;
    if (!clientEmail) {
      return fail("No email address for client");
    }

    // Format due date
    const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Generate payment URL
    const paymentUrl = invoice.paymentLinkUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoiceId}`;

    // Create line items summary (first 3 items)
    const lineItemsSummary = invoice.lineItems
      .slice(0, 3)
      .map((item) => item.description)
      .join(", ");

    // Generate PDF attachment
    let pdfAttachment: { filename: string; content: Buffer } | null = null;
    try {
      const pdfResult = await generateInvoicePdfBuffer(invoiceId);
      if (pdfResult.success && pdfResult.buffer && pdfResult.filename) {
        pdfAttachment = {
          filename: pdfResult.filename,
          content: pdfResult.buffer,
        };
      }
    } catch (pdfError) {
      // Log but don't fail - sending without PDF is better than not sending
      console.error("Failed to generate invoice PDF:", pdfError);
    }

    // Send email using InvoiceSentEmail template
    const emailResult = await getResend().emails.send({
      from: process.env.EMAIL_FROM || "PhotoProOS <noreply@photoproos.com>",
      to: clientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.organization.name}`,
      react: InvoiceSentEmail({
        clientName: invoice.clientName || invoice.client?.fullName || "there",
        invoiceNumber: invoice.invoiceNumber,
        paymentUrl,
        amountCents: invoice.totalCents,
        currency: invoice.currency,
        photographerName: invoice.organization.name,
        dueDate: formattedDueDate,
        lineItemsSummary: lineItemsSummary + (invoice.lineItems.length > 3 ? "..." : ""),
        hasPdfAttachment: !!pdfAttachment,
      }),
      ...(pdfAttachment && {
        attachments: [pdfAttachment],
      }),
    });

    if (emailResult.error) {
      console.error("Failed to send invoice:", emailResult.error);
      return fail("Failed to send invoice email");
    }

    // Update invoice status to sent if it was draft
    if (invoice.status === "draft") {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "sent",
          issueDate: new Date(),
        },
      });
    }

    // Log activity
    await logActivity({
      organizationId,
      type: "invoice_sent",
      description: `Invoice ${invoice.invoiceNumber} sent to ${clientEmail}`,
      invoiceId,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        clientEmail,
        hasPdfAttachment: !!pdfAttachment,
      },
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);

    return success({ sent: true });
  } catch (error) {
    console.error("Error sending invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to send invoice");
  }
}

// ============================================================================
// INVOICE REMINDERS
// ============================================================================

/**
 * Send a payment reminder for a specific invoice
 */
export async function sendInvoiceReminder(
  invoiceId: string
): Promise<ActionResult<{ remindersSent: number }>> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        client: true,
        organization: {
          select: {
            name: true,
            publicEmail: true,
          },
        },
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    if (invoice.status === "paid") {
      return fail("Invoice is already paid");
    }

    if (invoice.status === "draft") {
      return fail("Cannot send reminder for draft invoice");
    }

    const clientEmail = invoice.clientEmail || invoice.client?.email;
    if (!clientEmail) {
      return fail("No email address for client");
    }

    // Calculate if overdue
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const isOverdue = now > dueDate;
    const daysOverdue = isOverdue
      ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Format due date
    const formattedDueDate = dueDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Generate payment URL (could be Stripe link or invoice view page)
    const paymentUrl = invoice.paymentLinkUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoiceId}`;

    // Generate PDF attachment for reminder
    let pdfAttachment: { filename: string; content: Buffer } | null = null;
    try {
      const pdfResult = await generateInvoicePdfBuffer(invoiceId);
      if (pdfResult.success && pdfResult.buffer && pdfResult.filename) {
        pdfAttachment = {
          filename: pdfResult.filename,
          content: pdfResult.buffer,
        };
      }
    } catch (pdfError) {
      // Log but don't fail - sending without PDF is better than not sending
      console.error("Failed to generate invoice PDF for reminder:", pdfError);
    }

    // Send email
    const emailResult = await getResend().emails.send({
      from: process.env.EMAIL_FROM || "PhotoProOS <noreply@photoproos.com>",
      to: clientEmail,
      subject: isOverdue
        ? `Payment Overdue: Invoice ${invoice.invoiceNumber}`
        : `Payment Reminder: Invoice ${invoice.invoiceNumber}`,
      react: InvoiceReminderEmail({
        clientName: invoice.clientName || invoice.client?.fullName || "there",
        invoiceNumber: invoice.invoiceNumber,
        paymentUrl,
        amountCents: invoice.totalCents,
        currency: invoice.currency,
        photographerName: invoice.organization.name,
        dueDate: formattedDueDate,
        isOverdue,
        daysOverdue,
        reminderCount: invoice.remindersSent + 1,
      }),
      ...(pdfAttachment && {
        attachments: [pdfAttachment],
      }),
    });

    if (emailResult.error) {
      console.error("Failed to send invoice reminder:", emailResult.error);
      return fail("Failed to send reminder email");
    }

    // Update invoice reminder tracking
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        remindersSent: { increment: 1 },
        lastReminderAt: now,
        // Schedule next reminder in 3 days if still unpaid
        nextReminderAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    // Log activity
    const auth = await getAuthContext();
    await logActivity({
      organizationId,
      type: "invoice_sent",
      description: `Payment reminder #${updatedInvoice.remindersSent} sent for Invoice ${invoice.invoiceNumber}`,
      userId: auth?.userId,
      invoiceId: invoice.id,
      clientId: invoice.clientId || undefined,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        isOverdue,
        daysOverdue,
        reminderCount: updatedInvoice.remindersSent,
      },
    });

    revalidatePath(`/invoices/${invoiceId}`);

    return success({ remindersSent: updatedInvoice.remindersSent });
  } catch (error) {
    console.error("Error sending invoice reminder:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to send reminder");
  }
}

/**
 * Get invoices that need reminders (overdue and haven't received recent reminder)
 */
export async function getInvoicesNeedingReminders(): Promise<ActionResult<{
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string | null;
    clientEmail: string | null;
    totalCents: number;
    dueDate: Date;
    daysOverdue: number;
    remindersSent: number;
    lastReminderAt: Date | null;
  }>;
}>> {
  try {
    const organizationId = await requireOrganizationId();

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Find invoices that are:
    // 1. Sent or overdue status
    // 2. Past due date
    // 3. Auto reminders enabled
    // 4. Haven't had a reminder in last 3 days (or never)
    // 5. Less than 5 reminders sent (prevent spam)
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["sent", "overdue"] },
        dueDate: { lt: now },
        autoReminders: true,
        remindersSent: { lt: 5 },
        OR: [
          { lastReminderAt: null },
          { lastReminderAt: { lt: threeDaysAgo } },
        ],
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        clientEmail: true,
        totalCents: true,
        dueDate: true,
        remindersSent: true,
        lastReminderAt: true,
        client: {
          select: { email: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const enrichedInvoices = invoices
      .filter((inv) => inv.clientEmail || inv.client?.email)
      .map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        clientEmail: inv.clientEmail || inv.client?.email || null,
        totalCents: inv.totalCents,
        dueDate: inv.dueDate,
        daysOverdue: Math.floor(
          (now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
        remindersSent: inv.remindersSent,
        lastReminderAt: inv.lastReminderAt,
      }));

    return success({ invoices: enrichedInvoices });
  } catch (error) {
    console.error("Error getting invoices needing reminders:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get invoices");
  }
}

/**
 * Send batch reminders for all overdue invoices
 * Used by cron job
 */
export async function sendBatchInvoiceReminders(
  organizationId: string
): Promise<ActionResult<{ sent: number; failed: number }>> {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Find all invoices needing reminders for this org
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["sent", "overdue"] },
        dueDate: { lt: now },
        autoReminders: true,
        remindersSent: { lt: 5 },
        OR: [
          { lastReminderAt: null },
          { lastReminderAt: { lt: threeDaysAgo } },
        ],
      },
      include: {
        client: true,
        organization: {
          select: { name: true },
        },
      },
    });

    let sent = 0;
    let failed = 0;

    for (const invoice of invoices) {
      const clientEmail = invoice.clientEmail || invoice.client?.email;
      if (!clientEmail) {
        failed++;
        continue;
      }

      try {
        const dueDate = new Date(invoice.dueDate);
        const isOverdue = now > dueDate;
        const daysOverdue = isOverdue
          ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const formattedDueDate = dueDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        const paymentUrl = invoice.paymentLinkUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`;

        const emailResult = await getResend().emails.send({
          from: process.env.EMAIL_FROM || "PhotoProOS <noreply@photoproos.com>",
          to: clientEmail,
          subject: isOverdue
            ? `Payment Overdue: Invoice ${invoice.invoiceNumber}`
            : `Payment Reminder: Invoice ${invoice.invoiceNumber}`,
          react: InvoiceReminderEmail({
            clientName: invoice.clientName || invoice.client?.fullName || "there",
            invoiceNumber: invoice.invoiceNumber,
            paymentUrl,
            amountCents: invoice.totalCents,
            currency: invoice.currency,
            photographerName: invoice.organization.name,
            dueDate: formattedDueDate,
            isOverdue,
            daysOverdue,
            reminderCount: invoice.remindersSent + 1,
          }),
        });

        if (emailResult.error) {
          failed++;
          continue;
        }

        // Update reminder tracking
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            remindersSent: { increment: 1 },
            lastReminderAt: now,
            nextReminderAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            // Also update status to overdue if it was just "sent"
            ...(invoice.status === "sent" && { status: "overdue" }),
          },
        });

        sent++;
      } catch {
        failed++;
      }
    }

    return success({ sent, failed });
  } catch (error) {
    console.error("Error sending batch invoice reminders:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to send batch reminders");
  }
}

/**
 * Toggle auto reminders for an invoice
 */
export async function toggleInvoiceAutoReminders(
  invoiceId: string,
  enabled: boolean
): Promise<ActionResult> {
  try {
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { autoReminders: enabled },
    });

    revalidatePath(`/invoices/${invoiceId}`);

    return ok();
  } catch (error) {
    console.error("Error toggling auto reminders:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update settings");
  }
}

/**
 * Update all overdue invoices across all organizations
 * This is designed to be called by a cron job
 * Returns the count of invoices that were marked as overdue
 */
export async function updateAllOverdueInvoices(): Promise<ActionResult<{ count: number }>> {
  try {
    const now = new Date();

    const result = await prisma.invoice.updateMany({
      where: {
        status: "sent",
        dueDate: {
          lt: now,
        },
      },
      data: {
        status: "overdue",
      },
    });

    console.log(`[Invoice Cron] Marked ${result.count} invoices as overdue`);

    return success({ count: result.count });
  } catch (error) {
    console.error("[Invoice Cron] Error updating overdue invoices:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update overdue invoices");
  }
}

/**
 * Get overdue invoices for dashboard widget
 */
export async function getOverdueInvoicesForDashboard(organizationId: string): Promise<
  ActionResult<{
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      clientName: string;
      totalCents: number;
      balanceCents: number;
      dueDate: string;
      daysOverdue: number;
    }>;
    totalOverdueCents: number;
  }>
> {
  try {
    const now = new Date();

    // First, ensure sent invoices past due date are marked as overdue
    await prisma.invoice.updateMany({
      where: {
        organizationId,
        status: "sent",
        dueDate: { lt: now },
      },
      data: { status: "overdue" },
    });

    // Fetch overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: "overdue",
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        totalCents: true,
        paidAmountCents: true,
        dueDate: true,
        client: {
          select: { fullName: true, company: true },
        },
      },
      orderBy: { dueDate: "asc" }, // Oldest first (most overdue)
      take: 10,
    });

    const invoices = overdueInvoices.map((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const balanceCents = invoice.totalCents - (invoice.paidAmountCents || 0);

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName || invoice.client?.company || invoice.client?.fullName || "Unknown",
        totalCents: invoice.totalCents,
        balanceCents,
        dueDate: invoice.dueDate.toISOString(),
        daysOverdue: Math.max(0, daysOverdue),
      };
    });

    const totalOverdueCents = invoices.reduce((sum, inv) => sum + inv.balanceCents, 0);

    return success({ invoices, totalOverdueCents });
  } catch (error) {
    console.error("Error fetching overdue invoices for dashboard:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch overdue invoices");
  }
}

// ============================================================================
// INVOICE SCHEDULING
// ============================================================================

/**
 * Schedule an invoice to be sent at a future date
 */
export async function scheduleInvoice(
  invoiceId: string,
  scheduledSendAt: Date
): Promise<ActionResult<{ scheduledSendAt: Date }>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify invoice belongs to organization and is in draft status
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        client: { select: { email: true, fullName: true } },
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    if (invoice.status !== "draft") {
      return fail("Only draft invoices can be scheduled");
    }

    // Validate scheduledSendAt is in the future
    if (scheduledSendAt <= new Date()) {
      return fail("Scheduled date must be in the future");
    }

    // Validate client has email
    const clientEmail = invoice.clientEmail || invoice.client?.email;
    if (!clientEmail) {
      return fail("Cannot schedule invoice: client has no email address");
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        scheduledSendAt,
        scheduledSentAt: null, // Reset in case rescheduling
      },
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);

    return success({ scheduledSendAt });
  } catch (error) {
    console.error("Error scheduling invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to schedule invoice");
  }
}

/**
 * Cancel a scheduled invoice send
 */
export async function cancelScheduledInvoice(
  invoiceId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify invoice belongs to organization
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    if (!invoice.scheduledSendAt) {
      return fail("Invoice is not scheduled");
    }

    if (invoice.scheduledSentAt) {
      return fail("Invoice has already been sent");
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        scheduledSendAt: null,
        scheduledSentAt: null,
      },
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);

    return ok();
  } catch (error) {
    console.error("Error cancelling scheduled invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to cancel scheduled invoice");
  }
}

/**
 * Process scheduled invoices (called by cron job)
 * Sends all invoices with scheduledSendAt <= now that haven't been sent yet
 */
export async function processScheduledInvoices(): Promise<
  ActionResult<{ processed: number; errors: number }>
> {
  try {
    const now = new Date();

    // Find all invoices scheduled to be sent
    const scheduledInvoices = await prisma.invoice.findMany({
      where: {
        scheduledSendAt: { lte: now },
        scheduledSentAt: null,
        status: "draft",
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
        client: {
          select: {
            email: true,
            fullName: true,
          },
        },
        lineItems: true,
      },
    });

    let processed = 0;
    let errors = 0;

    for (const invoice of scheduledInvoices) {
      try {
        const clientEmail = invoice.clientEmail || invoice.client?.email;

        if (!clientEmail) {
          console.error(`[Scheduled Invoice] No email for invoice ${invoice.invoiceNumber}`);
          errors++;
          continue;
        }

        // Generate payment link if not exists
        let paymentUrl = invoice.paymentLinkUrl;
        if (!paymentUrl) {
          paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`;
        }

        // Format due date
        const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        // Create line items summary
        const lineItemsSummary = invoice.lineItems
          .slice(0, 3)
          .map((item) => item.description)
          .join(", ");

        // Generate PDF attachment
        let pdfAttachment: { filename: string; content: Buffer } | null = null;
        try {
          const pdfResult = await generateInvoicePdfBuffer(invoice.id);
          if (pdfResult.success && pdfResult.buffer && pdfResult.filename) {
            pdfAttachment = {
              filename: pdfResult.filename,
              content: pdfResult.buffer,
            };
          }
        } catch (pdfError) {
          console.error(`[Scheduled Invoice] Failed to generate PDF for ${invoice.invoiceNumber}:`, pdfError);
        }

        // Send the invoice email using proper InvoiceSentEmail template
        const resend = getResend();
        await resend.emails.send({
          from: `${invoice.organization.name} <invoices@mail.photoproos.com>`,
          to: clientEmail,
          subject: `Invoice ${invoice.invoiceNumber} from ${invoice.organization.name}`,
          react: InvoiceSentEmail({
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName || invoice.client?.fullName || "Customer",
            photographerName: invoice.organization.name,
            amountCents: invoice.totalCents,
            currency: invoice.currency,
            dueDate: formattedDueDate,
            paymentUrl,
            lineItemsSummary: lineItemsSummary + (invoice.lineItems.length > 3 ? "..." : ""),
            hasPdfAttachment: !!pdfAttachment,
          }),
          ...(pdfAttachment && {
            attachments: [pdfAttachment],
          }),
        });

        // Update invoice status and mark as sent
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: "sent",
            scheduledSentAt: now,
            issueDate: now, // Update issue date to actual send date
          },
        });

        // Log activity
        await logActivity({
          organizationId: invoice.organizationId,
          type: "invoice_sent",
          description: `Invoice ${invoice.invoiceNumber} was automatically sent (scheduled)`,
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            clientEmail,
            scheduledSendAt: invoice.scheduledSendAt?.toISOString(),
          },
        });

        processed++;
      } catch (error) {
        console.error(`[Scheduled Invoice] Error processing invoice ${invoice.id}:`, error);
        errors++;
      }
    }

    console.log(`[Scheduled Invoices] Processed ${processed} invoices, ${errors} errors`);

    return success({ processed, errors });
  } catch (error) {
    console.error("Error processing scheduled invoices:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to process scheduled invoices");
  }
}

/**
 * Get scheduled invoices for the organization
 */
export async function getScheduledInvoices(): Promise<
  ActionResult<{
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      clientName: string;
      totalCents: number;
      scheduledSendAt: Date;
    }>;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        scheduledSendAt: { not: null },
        scheduledSentAt: null,
        status: "draft",
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        totalCents: true,
        scheduledSendAt: true,
        client: {
          select: { fullName: true, company: true },
        },
      },
      orderBy: { scheduledSendAt: "asc" },
    });

    return success({
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName || inv.client?.company || inv.client?.fullName || "Unknown",
        totalCents: inv.totalCents,
        scheduledSendAt: inv.scheduledSendAt!,
      })),
    });
  } catch (error) {
    console.error("Error fetching scheduled invoices:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch scheduled invoices");
  }
}

// ============================================================================
// DEPOSIT INVOICES
// ============================================================================

/**
 * Split an invoice into deposit and balance invoices
 * Creates two new invoices: one for the deposit (due immediately) and one for the balance
 */
interface SplitInvoiceInput {
  invoiceId: string;
  depositPercent?: number; // Percentage (0-100), default 50
  depositAmountCents?: number; // Or specify fixed amount
  depositDueDate?: Date; // When deposit is due (default: immediately)
  balanceDueDate?: Date; // When balance is due (default: original due date)
}

export async function splitInvoiceForDeposit(
  input: SplitInvoiceInput
): Promise<
  ActionResult<{
    depositInvoice: { id: string; invoiceNumber: string; totalCents: number };
    balanceInvoice: { id: string; invoiceNumber: string; totalCents: number };
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Get the original invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: input.invoiceId,
        organizationId,
      },
      include: {
        lineItems: true,
        client: true,
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    if (invoice.status !== "draft") {
      return fail("Only draft invoices can be split into deposit/balance");
    }

    if (invoice.isDeposit || invoice.isBalance) {
      return fail("This invoice is already part of a deposit/balance split");
    }

    // Calculate deposit and balance amounts
    let depositAmountCents: number;
    let depositPercent: number;

    if (input.depositAmountCents !== undefined) {
      depositAmountCents = input.depositAmountCents;
      depositPercent = (depositAmountCents / invoice.totalCents) * 100;
    } else {
      depositPercent = input.depositPercent || 50;
      depositAmountCents = Math.round((invoice.totalCents * depositPercent) / 100);
    }

    const balanceAmountCents = invoice.totalCents - depositAmountCents;

    if (depositAmountCents <= 0 || balanceAmountCents <= 0) {
      return fail("Both deposit and balance must be greater than zero");
    }

    // Generate invoice numbers
    const depositNumber = await generateInvoiceNumber(organizationId);
    // Skip one number for balance
    const balanceNumber = `${depositNumber.replace(/\d+$/, "")}${(parseInt(depositNumber.match(/\d+$/)?.[0] || "0", 10) + 1).toString().padStart(4, "0")}`;

    // Dates
    const depositDueDate = input.depositDueDate || new Date();
    const balanceDueDate = input.balanceDueDate || invoice.dueDate;

    // Create deposit and balance invoices in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create deposit invoice
      const depositInvoice = await tx.invoice.create({
        data: {
          organizationId,
          clientId: invoice.clientId,
          invoiceNumber: depositNumber,
          status: "draft",
          subtotalCents: depositAmountCents,
          taxCents: 0, // Tax typically goes on full invoice or balance
          totalCents: depositAmountCents,
          currency: invoice.currency,
          issueDate: new Date(),
          dueDate: depositDueDate,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          notes: `Deposit payment (${depositPercent.toFixed(0)}%) for ${invoice.invoiceNumber}`,
          terms: invoice.terms,
          isDeposit: true,
          depositPercent,
          parentInvoiceId: invoice.id,
          autoReminders: invoice.autoReminders,
        },
      });

      // Create deposit line item
      await tx.invoiceLineItem.create({
        data: {
          invoiceId: depositInvoice.id,
          itemType: "service",
          description: `Deposit (${depositPercent.toFixed(0)}%) - ${invoice.lineItems.map(li => li.description).join(", ") || "Services"}`,
          quantity: 1,
          unitCents: depositAmountCents,
          totalCents: depositAmountCents,
        },
      });

      // Create balance invoice
      const balanceInvoice = await tx.invoice.create({
        data: {
          organizationId,
          clientId: invoice.clientId,
          invoiceNumber: balanceNumber,
          status: "draft",
          subtotalCents: balanceAmountCents,
          taxCents: invoice.taxCents, // Tax on balance
          totalCents: balanceAmountCents + invoice.taxCents,
          currency: invoice.currency,
          issueDate: new Date(),
          dueDate: balanceDueDate,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          notes: `Balance payment for ${invoice.invoiceNumber}. Deposit of ${depositPercent.toFixed(0)}% due separately.`,
          terms: invoice.terms,
          isBalance: true,
          depositPercent,
          parentInvoiceId: invoice.id,
          autoReminders: invoice.autoReminders,
          lateFeeEnabled: invoice.lateFeeEnabled,
          lateFeeType: invoice.lateFeeType,
          lateFeePercent: invoice.lateFeePercent,
          lateFeeFlatCents: invoice.lateFeeFlatCents,
        },
      });

      // Create balance line item
      await tx.invoiceLineItem.create({
        data: {
          invoiceId: balanceInvoice.id,
          itemType: "service",
          description: `Balance (${(100 - depositPercent).toFixed(0)}%) - ${invoice.lineItems.map(li => li.description).join(", ") || "Services"}`,
          quantity: 1,
          unitCents: balanceAmountCents,
          totalCents: balanceAmountCents,
        },
      });

      // If there's tax, add it as a line item on the balance invoice
      if (invoice.taxCents > 0) {
        await tx.invoiceLineItem.create({
          data: {
            invoiceId: balanceInvoice.id,
            itemType: "tax",
            description: "Tax",
            quantity: 1,
            unitCents: invoice.taxCents,
            totalCents: invoice.taxCents,
          },
        });
      }

      // Mark original invoice as voided/cancelled (it's been split)
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "void",
          notes: `${invoice.notes || ""}\n\n[Split into deposit ${depositNumber} and balance ${balanceNumber}]`.trim(),
        },
      });

      return { depositInvoice, balanceInvoice };
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "invoice_split",
      description: `Invoice ${invoice.invoiceNumber} split into deposit ${result.depositInvoice.invoiceNumber} and balance ${result.balanceInvoice.invoiceNumber}`,
      metadata: {
        originalInvoiceId: invoice.id,
        originalInvoiceNumber: invoice.invoiceNumber,
        depositInvoiceId: result.depositInvoice.id,
        depositInvoiceNumber: result.depositInvoice.invoiceNumber,
        depositAmountCents,
        balanceInvoiceId: result.balanceInvoice.id,
        balanceInvoiceNumber: result.balanceInvoice.invoiceNumber,
        balanceAmountCents,
        depositPercent,
      },
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoice.id}`);

    return success({
      depositInvoice: {
        id: result.depositInvoice.id,
        invoiceNumber: result.depositInvoice.invoiceNumber,
        totalCents: result.depositInvoice.totalCents,
      },
      balanceInvoice: {
        id: result.balanceInvoice.id,
        invoiceNumber: result.balanceInvoice.invoiceNumber,
        totalCents: result.balanceInvoice.totalCents,
      },
    });
  } catch (error) {
    console.error("Error splitting invoice for deposit:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to split invoice for deposit");
  }
}

/**
 * Create an invoice with deposit option directly
 * This creates both deposit and balance invoices at once
 */
interface CreateInvoiceWithDepositInput {
  clientId: string;
  depositPercent: number; // 0-100
  depositDueDate?: Date;
  balanceDueDate: Date;
  notes?: string;
  terms?: string;
  lineItems: {
    itemType: LineItemType;
    description: string;
    quantity: number;
    unitCents: number;
  }[];
  taxCents?: number;
}

export async function createInvoiceWithDeposit(
  input: CreateInvoiceWithDepositInput
): Promise<
  ActionResult<{
    depositInvoice: { id: string; invoiceNumber: string; totalCents: number };
    balanceInvoice: { id: string; invoiceNumber: string; totalCents: number };
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Validate client
    const client = await prisma.client.findFirst({
      where: {
        id: input.clientId,
        organizationId,
      },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Calculate totals
    const subtotalCents = input.lineItems.reduce((sum, item) => sum + item.quantity * item.unitCents, 0);
    const taxCents = input.taxCents || 0;

    // Calculate deposit and balance
    const depositPercent = input.depositPercent;
    const depositAmountCents = Math.round((subtotalCents * depositPercent) / 100);
    const balanceAmountCents = subtotalCents - depositAmountCents;

    if (depositAmountCents <= 0 || balanceAmountCents <= 0) {
      return fail("Both deposit and balance must be greater than zero");
    }

    // Generate invoice numbers
    const depositNumber = await generateInvoiceNumber(organizationId);
    const balanceNumber = `${depositNumber.replace(/\d+$/, "")}${(parseInt(depositNumber.match(/\d+$/)?.[0] || "0", 10) + 1).toString().padStart(4, "0")}`;

    // Dates
    const depositDueDate = input.depositDueDate || new Date();
    const balanceDueDate = input.balanceDueDate;

    // Create both invoices in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create deposit invoice
      const depositInvoice = await tx.invoice.create({
        data: {
          organizationId,
          clientId: input.clientId,
          invoiceNumber: depositNumber,
          status: "draft",
          subtotalCents: depositAmountCents,
          taxCents: 0,
          totalCents: depositAmountCents,
          currency: "USD",
          issueDate: new Date(),
          dueDate: depositDueDate,
          clientName: client.company || client.fullName,
          clientEmail: client.email,
          notes: `Deposit payment (${depositPercent.toFixed(0)}%)\n${input.notes || ""}`.trim(),
          terms: input.terms,
          isDeposit: true,
          depositPercent,
        },
      });

      // Create deposit line item
      const itemDescriptions = input.lineItems.map(li => li.description).join(", ");
      await tx.invoiceLineItem.create({
        data: {
          invoiceId: depositInvoice.id,
          itemType: "service",
          description: `Deposit (${depositPercent.toFixed(0)}%) - ${itemDescriptions}`,
          quantity: 1,
          unitCents: depositAmountCents,
          totalCents: depositAmountCents,
        },
      });

      // Create balance invoice
      const balanceInvoice = await tx.invoice.create({
        data: {
          organizationId,
          clientId: input.clientId,
          invoiceNumber: balanceNumber,
          status: "draft",
          subtotalCents: balanceAmountCents,
          taxCents,
          totalCents: balanceAmountCents + taxCents,
          currency: "USD",
          issueDate: new Date(),
          dueDate: balanceDueDate,
          clientName: client.company || client.fullName,
          clientEmail: client.email,
          notes: `Balance payment (${(100 - depositPercent).toFixed(0)}%). Deposit invoice: ${depositNumber}\n${input.notes || ""}`.trim(),
          terms: input.terms,
          isBalance: true,
          depositPercent,
        },
      });

      // Create balance line item
      await tx.invoiceLineItem.create({
        data: {
          invoiceId: balanceInvoice.id,
          itemType: "service",
          description: `Balance (${(100 - depositPercent).toFixed(0)}%) - ${itemDescriptions}`,
          quantity: 1,
          unitCents: balanceAmountCents,
          totalCents: balanceAmountCents,
        },
      });

      // If there's tax, add it as a line item on the balance invoice
      if (taxCents > 0) {
        await tx.invoiceLineItem.create({
          data: {
            invoiceId: balanceInvoice.id,
            itemType: "tax",
            description: "Tax",
            quantity: 1,
            unitCents: taxCents,
            totalCents: taxCents,
          },
        });
      }

      // Link the invoices together
      await tx.invoice.update({
        where: { id: depositInvoice.id },
        data: { parentInvoiceId: balanceInvoice.id },
      });
      await tx.invoice.update({
        where: { id: balanceInvoice.id },
        data: { parentInvoiceId: depositInvoice.id },
      });

      return { depositInvoice, balanceInvoice };
    });

    // Log activity
    await logActivity({
      organizationId,
      type: "invoice_created",
      description: `Created deposit invoice ${result.depositInvoice.invoiceNumber} and balance invoice ${result.balanceInvoice.invoiceNumber}`,
      metadata: {
        depositInvoiceId: result.depositInvoice.id,
        depositInvoiceNumber: result.depositInvoice.invoiceNumber,
        depositAmountCents,
        balanceInvoiceId: result.balanceInvoice.id,
        balanceInvoiceNumber: result.balanceInvoice.invoiceNumber,
        balanceAmountCents,
        depositPercent,
        clientId: input.clientId,
      },
    });

    revalidatePath("/invoices");

    return success({
      depositInvoice: {
        id: result.depositInvoice.id,
        invoiceNumber: result.depositInvoice.invoiceNumber,
        totalCents: result.depositInvoice.totalCents,
      },
      balanceInvoice: {
        id: result.balanceInvoice.id,
        invoiceNumber: result.balanceInvoice.invoiceNumber,
        totalCents: result.balanceInvoice.totalCents,
      },
    });
  } catch (error) {
    console.error("Error creating invoice with deposit:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create invoice with deposit");
  }
}

/**
 * Get deposit/balance pair for an invoice
 */
export async function getDepositBalancePair(invoiceId: string): Promise<
  ActionResult<{
    depositInvoice: {
      id: string;
      invoiceNumber: string;
      totalCents: number;
      status: InvoiceStatus;
      paidAmountCents: number;
    } | null;
    balanceInvoice: {
      id: string;
      invoiceNumber: string;
      totalCents: number;
      status: InvoiceStatus;
      paidAmountCents: number;
    } | null;
    parentInvoice: {
      id: string;
      invoiceNumber: string;
      totalCents: number;
    } | null;
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
        parentInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalCents: true,
            isDeposit: true,
            isBalance: true,
          },
        },
        childInvoices: {
          select: {
            id: true,
            invoiceNumber: true,
            totalCents: true,
            status: true,
            paidAmountCents: true,
            isDeposit: true,
            isBalance: true,
          },
        },
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    type InvoiceSummary = {
      id: string;
      invoiceNumber: string;
      totalCents: number;
      status: InvoiceStatus;
      paidAmountCents: number;
    } | null;
    type ParentInvoiceSummary = {
      id: string;
      invoiceNumber: string;
      totalCents: number;
    } | null;
    let depositInvoice: InvoiceSummary = null;
    let balanceInvoice: InvoiceSummary = null;
    let parentInvoice: ParentInvoiceSummary = null;

    // Check if this invoice is part of a deposit/balance pair
    if (invoice.isDeposit || invoice.isBalance) {
      // This invoice is either a deposit or balance
      if (invoice.isDeposit) {
        depositInvoice = {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalCents: invoice.totalCents,
          status: invoice.status,
          paidAmountCents: invoice.paidAmountCents,
        };
        // Find the balance sibling
        const sibling = invoice.childInvoices.find(i => i.isBalance) ||
                       (invoice.parentInvoice?.isBalance ? invoice.parentInvoice : null);
        if (sibling) {
          balanceInvoice = {
            id: sibling.id,
            invoiceNumber: sibling.invoiceNumber,
            totalCents: sibling.totalCents,
            status: ("status" in sibling ? sibling.status : "draft") as InvoiceStatus,
            paidAmountCents: ("paidAmountCents" in sibling ? sibling.paidAmountCents : 0) as number,
          };
        }
      } else {
        balanceInvoice = {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalCents: invoice.totalCents,
          status: invoice.status,
          paidAmountCents: invoice.paidAmountCents,
        };
        // Find the deposit sibling
        const sibling = invoice.childInvoices.find(i => i.isDeposit) ||
                       (invoice.parentInvoice?.isDeposit ? invoice.parentInvoice : null);
        if (sibling) {
          depositInvoice = {
            id: sibling.id,
            invoiceNumber: sibling.invoiceNumber,
            totalCents: sibling.totalCents,
            status: ("status" in sibling ? sibling.status : "draft") as InvoiceStatus,
            paidAmountCents: ("paidAmountCents" in sibling ? sibling.paidAmountCents : 0) as number,
          };
        }
      }
    } else {
      // This might be a parent invoice that was split
      const depositChild = invoice.childInvoices.find(i => i.isDeposit);
      const balanceChild = invoice.childInvoices.find(i => i.isBalance);

      if (depositChild) {
        depositInvoice = {
          id: depositChild.id,
          invoiceNumber: depositChild.invoiceNumber,
          totalCents: depositChild.totalCents,
          status: depositChild.status,
          paidAmountCents: depositChild.paidAmountCents,
        };
      }
      if (balanceChild) {
        balanceInvoice = {
          id: balanceChild.id,
          invoiceNumber: balanceChild.invoiceNumber,
          totalCents: balanceChild.totalCents,
          status: balanceChild.status,
          paidAmountCents: balanceChild.paidAmountCents,
        };
      }
      parentInvoice = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalCents: invoice.totalCents,
      };
    }

    return success({
      depositInvoice,
      balanceInvoice,
      parentInvoice,
    });
  } catch (error) {
    console.error("Error fetching deposit/balance pair:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch deposit/balance pair");
  }
}

// ============================================================================
// INVOICE CLONING
// ============================================================================

/**
 * Clone/duplicate an invoice with all its line items
 */
export async function cloneInvoice(
  invoiceId: string,
  options?: {
    clientId?: string;
    dueDays?: number;
  }
): Promise<ActionResult<{ id: string; invoiceNumber: string }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const original = await prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: { lineItems: { orderBy: { sortOrder: "asc" } } },
    });

    if (!original) {
      return fail("Invoice not found");
    }

    const invoiceNumber = await generateInvoiceNumber(organizationId);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (options?.dueDays ?? 30));

    // Clone client info from original unless a different client is specified
    let clientInfo = {
      clientId: options?.clientId ?? original.clientId,
      clientName: original.clientName,
      clientEmail: original.clientEmail,
      clientAddress: original.clientAddress,
    };

    if (options?.clientId && options.clientId !== original.clientId) {
      const newClient = await prisma.client.findFirst({
        where: { id: options.clientId, organizationId },
        select: { fullName: true, email: true, address: true },
      });
      if (newClient) {
        clientInfo = {
          clientId: options.clientId,
          clientName: newClient.fullName,
          clientEmail: newClient.email,
          clientAddress: newClient.address,
        };
      }
    }

    const cloned = await prisma.invoice.create({
      data: {
        organizationId,
        clientId: clientInfo.clientId,
        invoiceNumber,
        status: "draft",
        clientName: clientInfo.clientName,
        clientEmail: clientInfo.clientEmail,
        clientAddress: clientInfo.clientAddress,
        notes: original.notes,
        terms: original.terms,
        dueDate,
        subtotalCents: original.subtotalCents,
        taxCents: original.taxCents,
        discountCents: original.discountCents,
        totalCents: original.totalCents,
        lineItems: {
          create: original.lineItems.map((item) => ({
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

    await logActivity({
      organizationId,
      type: "invoice_created",
      description: `Invoice ${invoiceNumber} cloned from ${invoiceId}`,
      invoiceId: cloned.id,
      metadata: { clonedFrom: invoiceId, invoiceNumber },
    });

    revalidatePath("/invoices");

    return success({ id: cloned.id, invoiceNumber: cloned.invoiceNumber });
  } catch (error) {
    console.error("Error cloning invoice:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to clone invoice");
  }
}

// ============================================================================
// BATCH/BULK OPERATIONS
// ============================================================================

/**
 * Send multiple invoices at once
 */
export async function bulkSendInvoices(
  invoiceIds: string[]
): Promise<ActionResult<{ sent: number; failed: number; errors: string[] }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const invoiceId of invoiceIds) {
    try {
      // Use the sendInvoice function which handles email and status update
      const result = await sendInvoice(invoiceId);

      if (!result.success) {
        failed++;
        errors.push(result.error || "Failed to send invoice " + invoiceId);
        continue;
      }

      sent++;
    } catch (error) {
      failed++;
      errors.push("Failed to send invoice " + invoiceId);
    }
  }

  await logActivity({
    organizationId,
    type: "invoice_sent",
    description: `Bulk sent ${sent} invoices (${failed} failed)`,
    metadata: { sent, failed, invoiceIds },
  });

  revalidatePath("/invoices");

  return success({ sent, failed, errors });
}

/**
 * Mark multiple invoices as paid
 */
export async function bulkMarkPaid(
  invoiceIds: string[],
  paidAt?: Date
): Promise<ActionResult<{ updated: number; failed: number; errors: string[] }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const invoiceId of invoiceIds) {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, organizationId, status: { in: ["sent", "overdue", "partial"] } },
      });

      if (!invoice) {
        failed++;
        errors.push("Invoice " + invoiceId + " not found or already paid");
        continue;
      }

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "paid",
          paidAt: paidAt ?? new Date(),
          paidAmountCents: invoice.totalCents,
        },
      });

      // Update client revenue
      if (invoice.clientId) {
        await prisma.client.update({
          where: { id: invoice.clientId },
          data: {
            lifetimeRevenueCents: { increment: invoice.totalCents - invoice.paidAmountCents },
          },
        });
      }

      updated++;
    } catch (error) {
      failed++;
      errors.push("Failed to update invoice " + invoiceId);
    }
  }

  await logActivity({
    organizationId,
    type: "invoice_paid",
    description: `Bulk marked ${updated} invoices as paid (${failed} failed)`,
    metadata: { updated, failed, invoiceIds },
  });

  revalidatePath("/invoices");

  return success({ updated, failed, errors });
}

/**
 * Delete multiple draft invoices
 */
export async function bulkDeleteInvoices(
  invoiceIds: string[]
): Promise<ActionResult<{ deleted: number; failed: number; errors: string[] }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  let deleted = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const invoiceId of invoiceIds) {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, organizationId, status: "draft" },
      });

      if (!invoice) {
        failed++;
        errors.push("Invoice " + invoiceId + " not found or not in draft status");
        continue;
      }

      await prisma.invoice.delete({
        where: { id: invoiceId },
      });

      deleted++;
    } catch (error) {
      failed++;
      errors.push("Failed to delete invoice " + invoiceId);
    }
  }

  await logActivity({
    organizationId,
    type: "settings_updated",
    description: `Bulk deleted ${deleted} invoices (${failed} failed)`,
    metadata: { deleted, failed },
  });

  revalidatePath("/invoices");

  return success({ deleted, failed, errors });
}

// ============================================================================
// INVOICE AGING REPORT
// ============================================================================

interface AgingBucket {
  label: string;
  count: number;
  totalCents: number;
  invoices: {
    id: string;
    invoiceNumber: string;
    clientName: string | null;
    totalCents: number;
    balanceCents: number;
    daysOverdue: number;
    dueDate: Date;
  }[];
}

/**
 * Get invoice aging report (30/60/90+ day buckets)
 */
export async function getInvoiceAgingReport(): Promise<
  ActionResult<{
    current: AgingBucket;
    thirtyDays: AgingBucket;
    sixtyDays: AgingBucket;
    ninetyDays: AgingBucket;
    overNinetyDays: AgingBucket;
    totalOverdueCents: number;
    totalOverdueCount: number;
  }>
> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Get all unpaid invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      status: { in: ["sent", "overdue", "partial"] },
    },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      totalCents: true,
      paidAmountCents: true,
      dueDate: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const buckets = {
    current: { label: "Current", count: 0, totalCents: 0, invoices: [] as AgingBucket["invoices"] },
    thirtyDays: { label: "1-30 Days", count: 0, totalCents: 0, invoices: [] as AgingBucket["invoices"] },
    sixtyDays: { label: "31-60 Days", count: 0, totalCents: 0, invoices: [] as AgingBucket["invoices"] },
    ninetyDays: { label: "61-90 Days", count: 0, totalCents: 0, invoices: [] as AgingBucket["invoices"] },
    overNinetyDays: { label: "Over 90 Days", count: 0, totalCents: 0, invoices: [] as AgingBucket["invoices"] },
  };

  let totalOverdueCents = 0;
  let totalOverdueCount = 0;

  for (const invoice of invoices) {
    const balanceCents = invoice.totalCents - invoice.paidAmountCents;
    const daysOverdue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));

    const invoiceData = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      totalCents: invoice.totalCents,
      balanceCents,
      daysOverdue: Math.max(0, daysOverdue),
      dueDate: invoice.dueDate,
    };

    if (daysOverdue <= 0) {
      buckets.current.count++;
      buckets.current.totalCents += balanceCents;
      buckets.current.invoices.push(invoiceData);
    } else if (daysOverdue <= 30) {
      buckets.thirtyDays.count++;
      buckets.thirtyDays.totalCents += balanceCents;
      buckets.thirtyDays.invoices.push(invoiceData);
      totalOverdueCents += balanceCents;
      totalOverdueCount++;
    } else if (daysOverdue <= 60) {
      buckets.sixtyDays.count++;
      buckets.sixtyDays.totalCents += balanceCents;
      buckets.sixtyDays.invoices.push(invoiceData);
      totalOverdueCents += balanceCents;
      totalOverdueCount++;
    } else if (daysOverdue <= 90) {
      buckets.ninetyDays.count++;
      buckets.ninetyDays.totalCents += balanceCents;
      buckets.ninetyDays.invoices.push(invoiceData);
      totalOverdueCents += balanceCents;
      totalOverdueCount++;
    } else {
      buckets.overNinetyDays.count++;
      buckets.overNinetyDays.totalCents += balanceCents;
      buckets.overNinetyDays.invoices.push(invoiceData);
      totalOverdueCents += balanceCents;
      totalOverdueCount++;
    }
  }

  return success({
    ...buckets,
    totalOverdueCents,
    totalOverdueCount,
  });
}

// ============================================================================
// INVOICE BUNDLING
// ============================================================================

/**
 * Bundle multiple invoices into a single consolidated invoice
 */
export async function bundleInvoices(
  invoiceIds: string[],
  options?: {
    notes?: string;
    terms?: string;
    dueDays?: number;
  }
): Promise<ActionResult<{ id: string; invoiceNumber: string }>> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  if (invoiceIds.length < 2) {
    return fail("At least 2 invoices are required to bundle");
  }

  try {
    // Get all invoices to bundle
    const invoices = await prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds },
        organizationId,
        status: "draft",
      },
      include: { lineItems: { orderBy: { sortOrder: "asc" } } },
    });

    if (invoices.length !== invoiceIds.length) {
      return fail("Some invoices not found or not in draft status");
    }

    // Verify all invoices are for the same client
    const clientIds = new Set(invoices.map((i) => i.clientId));
    if (clientIds.size > 1) {
      return fail("All invoices must be for the same client");
    }

    const firstInvoice = invoices[0];
    const invoiceNumber = await generateInvoiceNumber(organizationId);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (options?.dueDays ?? 30));

    // Combine all line items
    const allLineItems: {
      itemType: LineItemType;
      description: string;
      quantity: number;
      unitCents: number;
      totalCents: number;
      sortOrder: number;
    }[] = [];

    let sortOrder = 0;
    for (const invoice of invoices) {
      // Add a header line item indicating the source invoice
      allLineItems.push({
        itemType: "other" as LineItemType,
        description: "--- From Invoice " + invoice.invoiceNumber + " ---",
        quantity: 1,
        unitCents: 0,
        totalCents: 0,
        sortOrder: sortOrder++,
      });

      for (const item of invoice.lineItems) {
        allLineItems.push({
          itemType: item.itemType,
          description: item.description,
          quantity: item.quantity,
          unitCents: item.unitCents,
          totalCents: item.totalCents,
          sortOrder: sortOrder++,
        });
      }
    }

    // Calculate totals
    const subtotalCents = invoices.reduce((sum, i) => sum + i.subtotalCents, 0);
    const taxCents = invoices.reduce((sum, i) => sum + i.taxCents, 0);
    const discountCents = invoices.reduce((sum, i) => sum + i.discountCents, 0);
    const totalCents = invoices.reduce((sum, i) => sum + i.totalCents, 0);

    // Create bundled invoice
    const bundled = await prisma.invoice.create({
      data: {
        organizationId,
        clientId: firstInvoice.clientId,
        invoiceNumber,
        status: "draft",
        clientName: firstInvoice.clientName,
        clientEmail: firstInvoice.clientEmail,
        clientAddress: firstInvoice.clientAddress,
        notes: options?.notes ?? "Bundled from invoices: " + invoices.map((i) => i.invoiceNumber).join(", "),
        terms: options?.terms ?? firstInvoice.terms,
        dueDate,
        subtotalCents,
        taxCents,
        discountCents,
        totalCents,
        lineItems: {
          create: allLineItems,
        },
      },
    });

    // Delete original draft invoices
    await prisma.invoice.deleteMany({
      where: { id: { in: invoiceIds } },
    });

    await logActivity({
      organizationId,
      type: "invoice_created",
      description: `Invoice ${invoiceNumber} created by bundling ${invoices.length} invoices`,
      invoiceId: bundled.id,
      metadata: {
        sourceInvoices: invoices.map((i) => i.invoiceNumber),
        invoiceNumber,
      },
    });

    revalidatePath("/invoices");

    return success({ id: bundled.id, invoiceNumber: bundled.invoiceNumber });
  } catch (error) {
    console.error("Error bundling invoices:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to bundle invoices");
  }
}

// ============================================================================
// TAX REPORTING
// ============================================================================

/**
 * Get tax summary for a date range
 */
export async function getTaxSummary(
  startDate: Date,
  endDate: Date
): Promise<
  ActionResult<{
    totalRevenueCents: number;
    totalTaxCollectedCents: number;
    invoiceCount: number;
    byMonth: {
      month: string;
      revenueCents: number;
      taxCents: number;
      invoiceCount: number;
    }[];
  }>
> {
  const organizationId = await requireOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      status: "paid",
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      totalCents: true,
      taxCents: true,
      paidAt: true,
    },
  });

  const totalRevenueCents = invoices.reduce((sum, i) => sum + i.totalCents, 0);
  const totalTaxCollectedCents = invoices.reduce((sum, i) => sum + i.taxCents, 0);

  // Group by month
  const monthlyData: Record<string, { revenueCents: number; taxCents: number; invoiceCount: number }> = {};

  for (const invoice of invoices) {
    if (!invoice.paidAt) continue;
    const monthKey = invoice.paidAt.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenueCents: 0, taxCents: 0, invoiceCount: 0 };
    }
    monthlyData[monthKey].revenueCents += invoice.totalCents;
    monthlyData[monthKey].taxCents += invoice.taxCents;
    monthlyData[monthKey].invoiceCount++;
  }

  const byMonth = Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return success({
    totalRevenueCents,
    totalTaxCollectedCents,
    invoiceCount: invoices.length,
    byMonth,
  });
}
