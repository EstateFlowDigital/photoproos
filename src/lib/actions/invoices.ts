"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { LineItemType, InvoiceStatus } from "@prisma/client";
import { requireOrganizationId } from "./auth-helper";
import { getAuthContext } from "@/lib/auth/clerk";
import { logActivity } from "@/lib/utils/activity";
import { Resend } from "resend";
import { InvoiceReminderEmail } from "@/emails/invoice-reminder";

const resend = new Resend(process.env.RESEND_API_KEY);

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: {
        id: input.clientId,
        organizationId,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
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
      return { success: false, error: "Booking not found" };
    }

    if (!booking.clientId) {
      return { success: false, error: "Booking must have a client to generate an invoice" };
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
      return { success: false, error: "No billable items found for this booking" };
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
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status !== "draft") {
      return { success: false, error: "Can only modify draft invoices" };
    }

    // Check if travel fee already exists for this booking
    const existingTravelFee = invoice.lineItems.find(
      (item) => item.itemType === "travel" && item.bookingId === bookingId
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
 */
export async function getInvoices(filters?: {
  status?: InvoiceStatus;
  clientId?: string;
}) {
  try {
    const organizationId = await requireOrganizationId();

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
      return { success: false, error: "Invoice not found" };
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
    const organizationId = await requireOrganizationId();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
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

    revalidatePath("/invoices");

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
    const organizationId = await requireOrganizationId();

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
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status === "paid") {
      return { success: false, error: "Invoice is already paid" };
    }

    if (invoice.status === "draft") {
      return { success: false, error: "Cannot send reminder for draft invoice" };
    }

    const clientEmail = invoice.clientEmail || invoice.client?.email;
    if (!clientEmail) {
      return { success: false, error: "No email address for client" };
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

    // Send email
    const emailResult = await resend.emails.send({
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
      console.error("Failed to send invoice reminder:", emailResult.error);
      return { success: false, error: "Failed to send reminder email" };
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

    return { success: true, data: { remindersSent: updatedInvoice.remindersSent } };
  } catch (error) {
    console.error("Error sending invoice reminder:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to send reminder" };
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

    return { success: true, data: { invoices: enrichedInvoices } };
  } catch (error) {
    console.error("Error getting invoices needing reminders:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to get invoices" };
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

        const emailResult = await resend.emails.send({
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

    return { success: true, data: { sent, failed } };
  } catch (error) {
    console.error("Error sending batch invoice reminders:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to send batch reminders" };
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
      return { success: false, error: "Invoice not found" };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { autoReminders: enabled },
    });

    revalidatePath(`/invoices/${invoiceId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error toggling auto reminders:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update settings" };
  }
}
