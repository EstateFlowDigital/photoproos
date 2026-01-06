"use server";

import { fail } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf } from "@/lib/pdf/templates/invoice-pdf";
import React from "react";
import QRCode from "qrcode";
import { createPdfElement, formatPdfDate, getOrganizationLogoUrl } from "@/lib/pdf/utils";

/**
 * Generate a PDF for an invoice
 */
export async function generateInvoicePdf(invoiceId: string): Promise<{
  success: boolean;
  pdfBuffer?: string; // Base64 encoded
  filename?: string;
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Fetch the invoice with all required data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
        payments: {
          where: { status: "paid" },
          select: {
            id: true,
            amountCents: true,
            paidAt: true,
            description: true,
          },
          orderBy: { paidAt: "asc" },
        },
        organization: {
          select: {
            name: true,
            publicName: true,
            publicEmail: true,
            publicPhone: true,
            website: true,
            logoUrl: true,
            logoLightUrl: true,
            invoiceLogoUrl: true,
            primaryColor: true,
            accentColor: true,
          },
        },
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    // Determine display status (check if overdue)
    let displayStatus = invoice.status;
    if (invoice.status === "sent" && new Date(invoice.dueDate) < new Date()) {
      displayStatus = "overdue";
    }

    // Build payment URL if exists
    const paymentUrl = invoice.paymentLinkUrl || null;

    // Determine logo URL using shared utility
    const logoUrl = getOrganizationLogoUrl(invoice.organization);

    // Generate QR code for payment URL if available and invoice is not paid
    let qrCodeDataUrl: string | null = null;
    if (paymentUrl && displayStatus !== "paid" && displayStatus !== "cancelled") {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: "#166534", // Green color to match theme
            light: "#ffffff",
          },
        });
      } catch (qrError) {
        console.error("Failed to generate QR code:", qrError);
        // Continue without QR code
      }
    }

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      createPdfElement(
        React.createElement(InvoicePdf, {
          invoiceNumber: invoice.invoiceNumber,
          status: displayStatus,
          issueDate: formatPdfDate(invoice.issueDate),
          dueDate: formatPdfDate(invoice.dueDate),
          clientName: invoice.clientName || "Unknown Client",
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          businessName: invoice.organization?.publicName || invoice.organization?.name || "Your Business",
          businessEmail: invoice.organization?.publicEmail || null,
          businessPhone: invoice.organization?.publicPhone || null,
          businessAddress: null, // No address field in Organization model
          logoUrl,
          lineItems: invoice.lineItems.map((item) => ({
            description: item.description,
            itemType: item.itemType,
            quantity: item.quantity,
            unitCents: item.unitCents,
            totalCents: item.totalCents,
          })),
          subtotalCents: invoice.subtotalCents,
          discountCents: invoice.discountCents,
          taxCents: invoice.taxCents,
          totalCents: invoice.totalCents,
          notes: invoice.notes,
          terms: invoice.terms,
          paymentUrl,
          qrCodeDataUrl,
          currency: invoice.currency || "USD",
          payments: invoice.payments.map((payment) => ({
            id: payment.id,
            amountCents: payment.amountCents,
            paidAt: payment.paidAt ? formatPdfDate(payment.paidAt) : null,
            description: payment.description,
          })),
          accentColor: invoice.organization?.primaryColor || "#3b82f6",
        })
      )
    );

    // Generate filename
    const filename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "-")}.pdf`;

    // Return as base64 for client-side download
    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBuffer).toString("base64"),
      filename,
    };
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return fail(error instanceof Error ? error.message : "Failed to generate invoice PDF",);
  }
}

/**
 * Generate a PDF buffer for an invoice (for email attachments)
 * Returns raw Buffer instead of base64 string
 */
export async function generateInvoicePdfBuffer(invoiceId: string): Promise<{
  success: boolean;
  buffer?: Buffer;
  filename?: string;
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Fetch the invoice with all required data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
        payments: {
          where: { status: "paid" },
          select: {
            id: true,
            amountCents: true,
            paidAt: true,
            description: true,
          },
          orderBy: { paidAt: "asc" },
        },
        organization: {
          select: {
            name: true,
            publicName: true,
            publicEmail: true,
            publicPhone: true,
            website: true,
            logoUrl: true,
            logoLightUrl: true,
            invoiceLogoUrl: true,
            primaryColor: true,
            accentColor: true,
          },
        },
      },
    });

    if (!invoice) {
      return fail("Invoice not found");
    }

    // Determine display status (check if overdue)
    let displayStatus = invoice.status;
    if (invoice.status === "sent" && new Date(invoice.dueDate) < new Date()) {
      displayStatus = "overdue";
    }

    // Build payment URL if exists
    const paymentUrl = invoice.paymentLinkUrl || null;

    // Determine logo URL using shared utility
    const logoUrl = getOrganizationLogoUrl(invoice.organization);

    // Generate QR code for payment URL if available and invoice is not paid
    let qrCodeDataUrl: string | null = null;
    if (paymentUrl && displayStatus !== "paid" && displayStatus !== "cancelled") {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: "#166534",
            light: "#ffffff",
          },
        });
      } catch (qrError) {
        console.error("Failed to generate QR code:", qrError);
      }
    }

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      createPdfElement(
        React.createElement(InvoicePdf, {
          invoiceNumber: invoice.invoiceNumber,
          status: displayStatus,
          issueDate: formatPdfDate(invoice.issueDate),
          dueDate: formatPdfDate(invoice.dueDate),
          clientName: invoice.clientName || "Unknown Client",
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          businessName: invoice.organization?.publicName || invoice.organization?.name || "Your Business",
          businessEmail: invoice.organization?.publicEmail || null,
          businessPhone: invoice.organization?.publicPhone || null,
          businessAddress: null,
          logoUrl,
          lineItems: invoice.lineItems.map((item) => ({
            description: item.description,
            itemType: item.itemType,
            quantity: item.quantity,
            unitCents: item.unitCents,
            totalCents: item.totalCents,
          })),
          subtotalCents: invoice.subtotalCents,
          discountCents: invoice.discountCents,
          taxCents: invoice.taxCents,
          totalCents: invoice.totalCents,
          notes: invoice.notes,
          terms: invoice.terms,
          paymentUrl,
          qrCodeDataUrl,
          currency: invoice.currency || "USD",
          payments: invoice.payments.map((payment) => ({
            id: payment.id,
            amountCents: payment.amountCents,
            paidAt: payment.paidAt ? formatPdfDate(payment.paidAt) : null,
            description: payment.description,
          })),
          accentColor: invoice.organization?.primaryColor || "#3b82f6",
        })
      )
    );

    // Generate filename
    const filename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "-")}.pdf`;

    // Return as Buffer for email attachments
    return {
      success: true,
      buffer: Buffer.from(pdfBuffer),
      filename,
    };
  } catch (error) {
    console.error("Error generating invoice PDF buffer:", error);
    return fail(error instanceof Error ? error.message : "Failed to generate invoice PDF",);
  }
}
