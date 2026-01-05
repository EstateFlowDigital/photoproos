import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/clerk";
import { prisma } from "@/lib/db";
import { InvoiceStatus, Prisma } from "@prisma/client";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf } from "@/lib/pdf/templates/invoice-pdf";
import React from "react";
import QRCode from "qrcode";
import JSZip from "jszip";

// Type assertion helper for react-pdf
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createPdfElement = (component: any) => component as any;

/**
 * POST /api/invoices/bulk-pdf
 * Generate a ZIP file containing PDFs for multiple invoices
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { invoiceIds, status: statusFilter } = body as {
      invoiceIds?: string[];
      status?: string;
    };

    // Build query - either specific IDs or filter by status
    const whereClause: Prisma.InvoiceWhereInput = {
      organizationId: auth.organizationId,
    };

    if (invoiceIds && invoiceIds.length > 0) {
      whereClause.id = { in: invoiceIds };
    } else if (statusFilter) {
      const statusValue = Object.values(InvoiceStatus).find((s) => s === statusFilter);
      if (statusValue) {
        whereClause.status = statusValue;
      }
    }

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
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
            logoUrl: true,
            logoLightUrl: true,
            invoiceLogoUrl: true,
            primaryColor: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to 100 invoices to prevent timeout
    });

    if (invoices.length === 0) {
      return NextResponse.json({ error: "No invoices found" }, { status: 404 });
    }

    // Format date helper
    const formatDate = (date: Date): string => {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
    };

    // Create ZIP file
    const zip = new JSZip();

    // Generate PDFs for each invoice
    for (const invoice of invoices) {
      try {
        // Determine display status
        let displayStatus = invoice.status;
        if (invoice.status === "sent" && new Date(invoice.dueDate) < new Date()) {
          displayStatus = "overdue";
        }

        // Build payment URL
        const paymentUrl = invoice.paymentLinkUrl || null;

        // Determine logo URL
        const logoUrl = invoice.organization?.invoiceLogoUrl
          || invoice.organization?.logoLightUrl
          || invoice.organization?.logoUrl
          || null;

        // Generate QR code if needed
        let qrCodeDataUrl: string | null = null;
        if (paymentUrl && displayStatus !== "paid" && displayStatus !== "cancelled") {
          try {
            qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
              width: 200,
              margin: 1,
              color: { dark: "#166534", light: "#ffffff" },
            });
          } catch {
            // Continue without QR code
          }
        }

        // Generate PDF
        const pdfBuffer = await renderToBuffer(
          createPdfElement(
            React.createElement(InvoicePdf, {
              invoiceNumber: invoice.invoiceNumber,
              status: displayStatus,
              issueDate: formatDate(invoice.issueDate),
              dueDate: formatDate(invoice.dueDate),
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
                paidAt: payment.paidAt ? formatDate(payment.paidAt) : null,
                description: payment.description,
              })),
              accentColor: invoice.organization?.primaryColor || "#3b82f6",
            })
          )
        );

        // Add to ZIP
        const filename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "-")}.pdf`;
        zip.file(filename, Buffer.from(pdfBuffer));
      } catch (pdfError) {
        console.error(`Failed to generate PDF for invoice ${invoice.invoiceNumber}:`, pdfError);
        // Continue with other invoices
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Create filename based on filter or date
    const dateStr = new Date().toISOString().split("T")[0];
    const zipFilename = statusFilter
      ? `invoices-${statusFilter}-${dateStr}.zip`
      : `invoices-${dateStr}.zip`;

    // Return ZIP file
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating bulk invoice PDFs:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDFs" },
      { status: 500 }
    );
  }
}
