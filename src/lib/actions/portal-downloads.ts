"use server";

import { prisma } from "@/lib/db";
import { getStripe, DEFAULT_PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { getClientSession } from "./client-auth";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/storage";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf } from "@/lib/pdf/templates/invoice-pdf";
import React from "react";
import QRCode from "qrcode";

// Type assertion helper for react-pdf
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createPdfElement = (component: any) => component as any;

/**
 * Get a download URL for all photos in a gallery as a ZIP file
 * Returns the gallery info needed to initiate download via API
 */
export async function getGalleryZipDownload(galleryId: string): Promise<{
  success: boolean;
  error?: string;
  gallery?: {
    id: string;
    name: string;
    assetIds: string[];
    totalSize: number;
  };
}> {
  try {
    const session = await getClientSession();

    if (!session) {
      return { success: false, error: "Please log in to download" };
    }

    // Verify gallery belongs to client and is downloadable
    const gallery = await prisma.project.findFirst({
      where: {
        id: galleryId,
        clientId: session.clientId,
        status: "delivered",
        allowDownloads: true,
      },
      include: {
        assets: {
          select: {
            id: true,
            sizeBytes: true,
          },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found or not available for download" };
    }

    const totalSize = gallery.assets.reduce((sum, a) => sum + (a.sizeBytes || 0), 0);

    return {
      success: true,
      gallery: {
        id: gallery.id,
        name: gallery.name,
        assetIds: gallery.assets.map((a) => a.id),
        totalSize,
      },
    };
  } catch (error) {
    console.error("[Portal Download] Error getting gallery info:", error);
    return { success: false, error: "Failed to prepare download" };
  }
}

/**
 * Get web-sized photo URLs for a gallery
 * Uses thumbnail URLs which are smaller/optimized
 */
export async function getWebSizeDownload(galleryId: string): Promise<{
  success: boolean;
  error?: string;
  photos?: {
    id: string;
    url: string;
    filename: string;
  }[];
}> {
  try {
    const session = await getClientSession();

    if (!session) {
      return { success: false, error: "Please log in to download" };
    }

    const gallery = await prisma.project.findFirst({
      where: {
        id: galleryId,
        clientId: session.clientId,
        status: "delivered",
        allowDownloads: true,
      },
      include: {
        assets: {
          select: {
            id: true,
            thumbnailUrl: true,
            mediumUrl: true,
            filename: true,
          },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found or not available for download" };
    }

    // Use medium URL if available, otherwise thumbnail
    const photos = await Promise.all(
      gallery.assets.map(async (asset) => {
        const sourceUrl = asset.mediumUrl || asset.thumbnailUrl || "";
        const key = extractKeyFromUrl(sourceUrl);

        let signedUrl = sourceUrl;
        if (key) {
          try {
            signedUrl = await generatePresignedDownloadUrl(key, 900);
          } catch (err) {
            console.error("[Portal Download] Failed to sign web photo URL", { assetId: asset.id, err });
          }
        }

        return {
          id: asset.id,
          url: signedUrl,
          filename: `web_${asset.filename}`,
        };
      })
    );

    return {
      success: true,
      photos,
    };
  } catch (error) {
    console.error("[Portal Download] Error getting web size photos:", error);
    return { success: false, error: "Failed to prepare download" };
  }
}

/**
 * Get high-res (original) photo URLs for a gallery
 */
export async function getHighResDownload(galleryId: string): Promise<{
  success: boolean;
  error?: string;
  photos?: {
    id: string;
    url: string;
    filename: string;
    sizeBytes: number;
  }[];
}> {
  try {
    const session = await getClientSession();

    if (!session) {
      return { success: false, error: "Please log in to download" };
    }

    const gallery = await prisma.project.findFirst({
      where: {
        id: galleryId,
        clientId: session.clientId,
        status: "delivered",
        allowDownloads: true,
      },
      include: {
        assets: {
          select: {
            id: true,
            originalUrl: true,
            filename: true,
            sizeBytes: true,
          },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found or not available for download" };
    }

    const photos = await Promise.all(
      gallery.assets.map(async (asset) => {
        const key = extractKeyFromUrl(asset.originalUrl);
        let signedUrl = "";

        if (key) {
          try {
            signedUrl = await generatePresignedDownloadUrl(key, 900);
          } catch (err) {
            console.error("[Portal Download] Failed to sign original URL", { assetId: asset.id, err });
          }
        }

        return {
          id: asset.id,
          url: signedUrl,
          filename: asset.filename,
          sizeBytes: asset.sizeBytes || 0,
        };
      })
    );

    return {
      success: true,
      photos,
    };
  } catch (error) {
    console.error("[Portal Download] Error getting high res photos:", error);
    return { success: false, error: "Failed to prepare download" };
  }
}

/**
 * Get marketing kit assets for a property
 * Returns existing generated assets and info to generate missing ones
 */
export async function getMarketingKitDownload(propertyId: string): Promise<{
  success: boolean;
  error?: string;
  marketingKit?: {
    propertyId: string;
    propertyAddress: string;
    assets: {
      id: string;
      type: string;
      name: string;
      fileUrl: string;
    }[];
    photosAvailable: number;
  };
}> {
  try {
    const session = await getClientSession();

    if (!session) {
      return { success: false, error: "Please log in to download" };
    }

    // Get property with marketing assets
    const property = await prisma.propertyWebsite.findFirst({
      where: {
        id: propertyId,
        project: {
          clientId: session.clientId,
        },
      },
      include: {
        project: {
          select: {
            assets: {
              select: { id: true },
            },
          },
        },
        marketingAssets: {
          select: {
            id: true,
            type: true,
            name: true,
            fileUrl: true,
          },
        },
      },
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    return {
      success: true,
      marketingKit: {
        propertyId: property.id,
        propertyAddress: property.address,
        assets: property.marketingAssets.map((a) => ({
          id: a.id,
          type: a.type,
          name: a.name,
          fileUrl: a.fileUrl,
        })),
        photosAvailable: property.project.assets.length,
      },
    };
  } catch (error) {
    console.error("[Portal Download] Error getting marketing kit:", error);
    return { success: false, error: "Failed to prepare marketing kit" };
  }
}

/**
 * Get invoice payment link for client portal
 * Creates a Stripe checkout session for the invoice
 */
export async function getInvoicePaymentLink(invoiceId: string): Promise<{
  success: boolean;
  error?: string;
  paymentUrl?: string;
}> {
  try {
    const session = await getClientSession();

    if (!session) {
      return { success: false, error: "Please log in to pay" };
    }

    // Get invoice for this client
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clientId: session.clientId,
        status: { in: ["draft", "sent", "overdue"] },
      },
      include: {
        organization: {
          select: {
            stripeConnectAccountId: true,
          },
        },
        client: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found or already paid" };
    }

    // Check if Stripe is configured
    if (!invoice.organization.stripeConnectAccountId) {
      return { success: false, error: "Payment not available for this invoice" };
    }

    // Use the existing payment link if available
    if (invoice.paymentLinkUrl) {
      return { success: true, paymentUrl: invoice.paymentLinkUrl };
    }

    // Create Stripe checkout session for invoice payment
    const stripe = getStripe();
    const platformFeeAmount = Math.round(
      (invoice.totalCents * DEFAULT_PLATFORM_FEE_PERCENT) / 100
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: invoice.notes || `Payment for invoice ${invoice.invoiceNumber}`,
            },
            unit_amount: invoice.totalCents,
          },
          quantity: 1,
        },
      ],
      customer_email: invoice.client?.email || undefined,
      payment_intent_data: {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: invoice.organization.stripeConnectAccountId!,
        },
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          organizationId: invoice.organizationId,
          clientId: invoice.clientId || "",
        },
      },
      success_url: `${baseUrl}/portal/invoices/${invoice.id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/portal/invoices/${invoice.id}?payment=cancelled`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        organizationId: invoice.organizationId,
      },
    });

    if (!checkoutSession.url) {
      return { success: false, error: "Failed to create payment link" };
    }

    // Store the payment link URL for future use
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentLinkUrl: checkoutSession.url,
        stripePaymentLinkId: checkoutSession.id,
      },
    });

    return { success: true, paymentUrl: checkoutSession.url };
  } catch (error) {
    console.error("[Portal Payment] Error getting payment link:", error);
    return { success: false, error: "Failed to get payment link" };
  }
}

/**
 * Generate and download invoice PDF for client portal
 * Returns base64 encoded PDF for client-side download
 */
export async function getInvoicePdfDownload(invoiceId: string): Promise<{
  success: boolean;
  error?: string;
  pdfBuffer?: string; // Base64 encoded
  filename?: string;
}> {
  try {
    const session = await getClientSession();

    if (!session) {
      return { success: false, error: "Please log in to download" };
    }

    // Get invoice for this client
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clientId: session.clientId,
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
            logoUrl: true,
            logoLightUrl: true,
            invoiceLogoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    // Format dates
    const formatDate = (date: Date): string => {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
    };

    // Determine display status (check if overdue)
    let displayStatus = invoice.status;
    if (invoice.status === "sent" && new Date(invoice.dueDate) < new Date()) {
      displayStatus = "overdue";
    }

    // Build payment URL if exists
    const paymentUrl = invoice.paymentLinkUrl || null;

    // Determine logo URL
    const logoUrl = invoice.organization?.invoiceLogoUrl
      || invoice.organization?.logoLightUrl
      || invoice.organization?.logoUrl
      || null;

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

    // Generate filename
    const filename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "-")}.pdf`;

    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBuffer).toString("base64"),
      filename,
    };
  } catch (error) {
    console.error("[Portal Download] Error generating invoice PDF:", error);
    return { success: false, error: "Failed to generate invoice PDF" };
  }
}
