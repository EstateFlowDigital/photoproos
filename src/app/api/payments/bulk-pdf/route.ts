import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/clerk";
import { prisma } from "@/lib/db";
import { PaymentStatus, Prisma } from "@prisma/client";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptPdf } from "@/lib/pdf/templates/receipt-pdf";
import React from "react";
import JSZip from "jszip";
import { format } from "date-fns";

// Type assertion helper for react-pdf
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createPdfElement = (component: any) => component as any;

/**
 * POST /api/payments/bulk-pdf
 * Generate a ZIP file containing receipt PDFs for multiple payments
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentIds, status: statusFilter } = body as {
      paymentIds?: string[];
      status?: string;
    };

    // Build query - either specific IDs or filter by status
    const whereClause: Prisma.PaymentWhereInput = {
      organizationId: auth.organizationId,
      status: "paid", // Only generate receipts for paid payments
    };

    if (paymentIds && paymentIds.length > 0) {
      whereClause.id = { in: paymentIds };
    } else if (statusFilter) {
      const statusValue = Object.values(PaymentStatus).find((s) => s === statusFilter);
      if (statusValue) {
        whereClause.status = statusValue;
      }
    }

    // Fetch payments
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
            company: true,
          },
        },
        project: {
          select: {
            name: true,
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
            primaryColor: true,
          },
        },
      },
      orderBy: { paidAt: "desc" },
      take: 100, // Limit to prevent timeout
    });

    if (payments.length === 0) {
      return NextResponse.json({ error: "No payments found" }, { status: 404 });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Generate PDFs for each payment
    for (const payment of payments) {
      try {
        // Generate receipt number
        const receiptNumber = `REC-${payment.id.substring(0, 8).toUpperCase()}`;

        // Format date
        const paidDate = payment.paidAt
          ? format(payment.paidAt, "MMMM d, yyyy")
          : format(new Date(), "MMMM d, yyyy");

        // Determine logo URL
        const logoUrl = payment.organization?.logoLightUrl
          || payment.organization?.logoUrl
          || null;

        // Generate PDF
        const pdfBuffer = await renderToBuffer(
          createPdfElement(
            React.createElement(ReceiptPdf, {
              receiptNumber,
              paidDate,
              clientName: payment.client?.fullName || payment.clientName || "Client",
              clientEmail: payment.client?.email || payment.clientEmail || null,
              clientCompany: payment.client?.company || null,
              businessName: payment.organization?.publicName || payment.organization?.name || "Business",
              businessEmail: payment.organization?.publicEmail || null,
              businessPhone: payment.organization?.publicPhone || null,
              logoUrl,
              description: payment.description || payment.project?.name || "Payment",
              amountCents: payment.amountCents,
              transactionId: payment.stripePaymentIntentId || null,
              accentColor: payment.organization?.primaryColor || "#22c55e",
            })
          )
        );

        // Add to ZIP
        const filename = `receipt-${receiptNumber}.pdf`;
        zip.file(filename, Buffer.from(pdfBuffer));
      } catch (pdfError) {
        console.error(`Failed to generate PDF for payment ${payment.id}:`, pdfError);
        // Continue with other payments
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Create filename based on date
    const dateStr = new Date().toISOString().split("T")[0];
    const zipFilename = `receipts-${dateStr}.zip`;

    // Return ZIP file
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating bulk receipt PDFs:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt PDFs" },
      { status: 500 }
    );
  }
}
