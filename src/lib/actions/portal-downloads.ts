"use server";

import { prisma } from "@/lib/db";
import { getStripe, DEFAULT_PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { getClientSession } from "./client-auth";

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
    const photos = gallery.assets.map((asset) => ({
      id: asset.id,
      url: asset.mediumUrl || asset.thumbnailUrl || "",
      filename: `web_${asset.filename}`,
    }));

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

    const photos = gallery.assets.map((asset) => ({
      id: asset.id,
      url: asset.originalUrl,
      filename: asset.filename,
      sizeBytes: asset.sizeBytes || 0,
    }));

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
