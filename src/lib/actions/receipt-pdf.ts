"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptPdf } from "@/lib/pdf/templates/receipt-pdf";
import React from "react";

// Type assertion helper for react-pdf
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createPdfElement = (component: any) => component as any;

/**
 * Generate a PDF receipt for a payment
 */
export async function generateReceiptPdf(paymentId: string): Promise<{
  success: boolean;
  pdfBuffer?: string; // Base64 encoded
  filename?: string;
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Fetch the payment with all required data
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        organizationId,
        status: "paid", // Only generate receipts for paid payments
      },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
            company: true,
          },
        },
        organization: {
          select: {
            name: true,
            publicName: true,
            publicEmail: true,
            publicPhone: true,
            logoUrl: true,
            logoLightUrl: true,
            invoiceLogoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found or not yet paid" };
    }

    if (!payment.paidAt) {
      return { success: false, error: "Payment has no paid date" };
    }

    // Format date
    const formatDate = (date: Date): string => {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
    };

    // Generate receipt number if not exists
    const receiptNumber = `REC-${payment.id.slice(0, 8).toUpperCase()}`;

    // Determine logo URL (prefer invoice-specific, then light variant, then default)
    const logoUrl = payment.organization?.invoiceLogoUrl
      || payment.organization?.logoLightUrl
      || payment.organization?.logoUrl
      || null;

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      createPdfElement(
        React.createElement(ReceiptPdf, {
          receiptNumber,
          paidDate: formatDate(payment.paidAt),
          clientName: payment.client?.fullName || "Unknown Client",
          clientEmail: payment.client?.email || null,
          clientCompany: payment.client?.company || null,
          businessName: payment.organization?.publicName || payment.organization?.name || "Your Business",
          businessEmail: payment.organization?.publicEmail || null,
          businessPhone: payment.organization?.publicPhone || null,
          logoUrl,
          description: payment.description || "Payment",
          amountCents: payment.amountCents,
          transactionId: payment.stripePaymentIntentId || null,
          accentColor: payment.organization?.primaryColor || "#22c55e",
        })
      )
    );

    // Generate filename
    const filename = `receipt-${receiptNumber}.pdf`;

    // Return as base64 for client-side download
    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBuffer).toString("base64"),
      filename,
    };
  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate receipt PDF",
    };
  }
}
