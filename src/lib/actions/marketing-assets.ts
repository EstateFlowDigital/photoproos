"use server";

import { ok, type VoidActionResult } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { renderToBuffer } from "@react-pdf/renderer";
import { FlyerPortrait } from "@/lib/marketing/templates/flyer-portrait";
import { SocialSquare } from "@/lib/marketing/templates/social-square";
import React from "react";
import { createPdfElement } from "@/lib/pdf/utils";

export type MarketingAssetType =
  | "flyer_portrait"
  | "flyer_landscape"
  | "social_square"
  | "social_story"
  | "postcard";

export type SocialVariant = "listing" | "just_listed" | "just_sold" | "open_house";

interface GenerateFlyerInput {
  propertyWebsiteId: string;
  branded?: boolean;
}

interface GenerateSocialInput {
  propertyWebsiteId: string;
  variant?: SocialVariant;
  openHouseDate?: string;
}

/**
 * Generate a portrait flyer PDF for a property
 */
export async function generatePropertyFlyer(input: GenerateFlyerInput): Promise<{
  success: boolean;
  pdfBuffer?: string; // Base64 encoded
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const propertyWebsite = await prisma.propertyWebsite.findFirst({
      where: {
        id: input.propertyWebsiteId,
        project: {
          organizationId,
        },
      },
      include: {
        project: {
          include: {
            assets: {
              select: {
                originalUrl: true,
                thumbnailUrl: true,
              },
              take: 5,
              orderBy: {
                sortOrder: "asc",
              },
            },
            client: {
              select: {
                fullName: true,
                company: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!propertyWebsite) {
      return { success: false, error: "Property website not found" };
    }

    const client = propertyWebsite.project.client;
    if (!client) {
      return { success: false, error: "No client associated with this property" };
    }

    // Get photo URLs
    const photos = propertyWebsite.project.assets.map(
      (a) => a.thumbnailUrl || a.originalUrl
    );

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      createPdfElement(React.createElement(FlyerPortrait, {
        property: {
          address: propertyWebsite.address,
          city: propertyWebsite.city,
          state: propertyWebsite.state,
          zipCode: propertyWebsite.zipCode,
          price: propertyWebsite.price ? Number(propertyWebsite.price) : null,
          beds: propertyWebsite.beds,
          baths: propertyWebsite.baths ? Number(propertyWebsite.baths) : null,
          sqft: propertyWebsite.sqft,
          description: propertyWebsite.description,
          features: propertyWebsite.features || [],
        },
        photos,
        agent: {
          name: client.fullName || "Agent",
          company: client.company,
          email: client.email,
          phone: client.phone,
        },
        websiteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/p/${propertyWebsite.slug}`,
        branded: input.branded ?? true,
      }))
    );

    // Return as base64 for client-side download
    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBuffer).toString("base64"),
    };
  } catch (error) {
    console.error("Error generating flyer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate flyer",
    };
  }
}

/**
 * Generate a social media square image for a property
 */
export async function generateSocialSquare(input: GenerateSocialInput): Promise<{
  success: boolean;
  pdfBuffer?: string; // Base64 encoded (PDF that can be converted to image)
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const propertyWebsite = await prisma.propertyWebsite.findFirst({
      where: {
        id: input.propertyWebsiteId,
        project: {
          organizationId,
        },
      },
      include: {
        project: {
          include: {
            assets: {
              select: {
                originalUrl: true,
                thumbnailUrl: true,
              },
              take: 1,
              orderBy: {
                sortOrder: "asc",
              },
            },
            client: {
              select: {
                fullName: true,
                company: true,
              },
            },
          },
        },
      },
    });

    if (!propertyWebsite) {
      return { success: false, error: "Property website not found" };
    }

    const client = propertyWebsite.project.client;
    if (!client) {
      return { success: false, error: "No client associated with this property" };
    }

    const photo = propertyWebsite.project.assets[0]?.thumbnailUrl ||
      propertyWebsite.project.assets[0]?.originalUrl ||
      "";

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      createPdfElement(React.createElement(SocialSquare, {
        property: {
          address: propertyWebsite.address,
          city: propertyWebsite.city,
          state: propertyWebsite.state,
          zipCode: propertyWebsite.zipCode,
          price: propertyWebsite.price ? Number(propertyWebsite.price) : null,
          beds: propertyWebsite.beds,
          baths: propertyWebsite.baths ? Number(propertyWebsite.baths) : null,
          sqft: propertyWebsite.sqft,
        },
        photo,
        agent: {
          name: client.fullName || "Agent",
          company: client.company,
        },
        variant: input.variant || "listing",
        openHouseDate: input.openHouseDate,
      }))
    );

    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBuffer).toString("base64"),
    };
  } catch (error) {
    console.error("Error generating social square:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate social graphic",
    };
  }
}

/**
 * Save a generated marketing asset to the database
 */
export async function saveMarketingAsset(input: {
  propertyWebsiteId: string;
  type: MarketingAssetType;
  name: string;
  fileUrl: string;
  thumbnailUrl?: string;
}): Promise<{ success: boolean; assetId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify property belongs to organization
    const propertyWebsite = await prisma.propertyWebsite.findFirst({
      where: {
        id: input.propertyWebsiteId,
        project: {
          organizationId,
        },
      },
    });

    if (!propertyWebsite) {
      return { success: false, error: "Property website not found" };
    }

    const asset = await prisma.marketingAsset.create({
      data: {
        propertyWebsiteId: input.propertyWebsiteId,
        type: input.type,
        name: input.name,
        fileUrl: input.fileUrl,
        thumbnailUrl: input.thumbnailUrl,
      },
    });

    return { success: true, assetId: asset.id };
  } catch (error) {
    console.error("Error saving marketing asset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save marketing asset",
    };
  }
}

/**
 * Get all marketing assets for a property
 */
export async function getPropertyMarketingAssets(propertyWebsiteId: string): Promise<{
  success: boolean;
  assets?: Array<{
    id: string;
    type: string;
    name: string;
    fileUrl: string;
    thumbnailUrl: string | null;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify property belongs to organization
    const propertyWebsite = await prisma.propertyWebsite.findFirst({
      where: {
        id: propertyWebsiteId,
        project: {
          organizationId,
        },
      },
      include: {
        marketingAssets: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!propertyWebsite) {
      return { success: false, error: "Property website not found" };
    }

    return {
      success: true,
      assets: propertyWebsite.marketingAssets,
    };
  } catch (error) {
    console.error("Error fetching marketing assets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch marketing assets",
    };
  }
}

/**
 * Delete a marketing asset
 */
export async function deleteMarketingAsset(assetId: string): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify asset belongs to organization
    const asset = await prisma.marketingAsset.findFirst({
      where: {
        id: assetId,
        propertyWebsite: {
          project: {
            organizationId,
          },
        },
      },
    });

    if (!asset) {
      return { success: false, error: "Marketing asset not found" };
    }

    await prisma.marketingAsset.delete({
      where: { id: assetId },
    });

    return ok();
  } catch (error) {
    console.error("Error deleting marketing asset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete marketing asset",
    };
  }
}
