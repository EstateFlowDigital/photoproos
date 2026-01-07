"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  MarketingAssetType,
  MarketingAssetVariant,
  SocialTileStyle,
  Prisma,
} from "@prisma/client";

// ============================================================================
// MARKETING KIT CRUD ACTIONS
// ============================================================================

interface CreateMarketingKitInput {
  propertyWebsiteId?: string;
  name: string;
  description?: string;
  style?: SocialTileStyle;
  includeBranded?: boolean;
  includeUnbranded?: boolean;
  includeCoBranded?: boolean;
  agentName?: string;
  agentTitle?: string;
  agentPhone?: string;
  agentEmail?: string;
  agentPhotoUrl?: string;
  agentLicenseNo?: string;
  brokerageName?: string;
  brokerageLogo?: string;
  brokeragePhone?: string;
  brokerageAddress?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  headingFont?: string;
  bodyFont?: string;
  autoGenerateOnCreate?: boolean;
  autoGenerateTypes?: MarketingAssetType[];
}

/**
 * Creates a new Marketing Kit
 */
export async function createMarketingKit(input: CreateMarketingKitInput) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    // Check if property already has a kit (if propertyWebsiteId provided)
    if (input.propertyWebsiteId) {
      const existing = await prisma.marketingKit.findUnique({
        where: { propertyWebsiteId: input.propertyWebsiteId },
      });
      if (existing) {
        return { error: "Property already has a marketing kit" };
      }
    }

    const marketingKit = await prisma.marketingKit.create({
      data: {
        organizationId: orgId,
        ...input,
        autoGenerateTypes: input.autoGenerateTypes || [],
      },
    });

    // If auto-generate is enabled and property website exists, generate assets
    if (input.autoGenerateOnCreate !== false && input.propertyWebsiteId) {
      await generateMarketingAssets(marketingKit.id);
    }

    revalidatePath("/properties");
    revalidatePath("/marketing");
    return { data: marketingKit };
  } catch (error) {
    console.error("Error creating marketing kit:", error);
    return { error: "Failed to create marketing kit" };
  }
}

/**
 * Gets a marketing kit by ID
 */
export async function getMarketingKit(kitId: string) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const marketingKit = await prisma.marketingKit.findUnique({
      where: { id: kitId },
      include: {
        assets: {
          orderBy: { createdAt: "desc" },
        },
        propertyWebsite: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
            price: true,
            beds: true,
            baths: true,
            sqft: true,
            headline: true,
            project: {
              select: {
                assets: {
                  take: 10,
                  orderBy: { sortOrder: "asc" },
                  select: {
                    originalUrl: true,
                    thumbnailUrl: true,
                    mediumUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!marketingKit || marketingKit.organizationId !== orgId) {
      return { error: "Marketing kit not found" };
    }

    return { data: marketingKit };
  } catch (error) {
    console.error("Error fetching marketing kit:", error);
    return { error: "Failed to fetch marketing kit" };
  }
}

/**
 * Gets marketing kit for a property website
 */
export async function getMarketingKitByPropertyWebsite(
  propertyWebsiteId: string
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const marketingKit = await prisma.marketingKit.findUnique({
      where: { propertyWebsiteId },
      include: {
        assets: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (marketingKit && marketingKit.organizationId !== orgId) {
      return { error: "Marketing kit not found" };
    }

    return { data: marketingKit };
  } catch (error) {
    console.error("Error fetching marketing kit:", error);
    return { error: "Failed to fetch marketing kit" };
  }
}

/**
 * Updates a marketing kit
 */
export async function updateMarketingKit(
  kitId: string,
  updates: Partial<CreateMarketingKitInput>
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const existing = await prisma.marketingKit.findUnique({
      where: { id: kitId },
    });

    if (!existing || existing.organizationId !== orgId) {
      return { error: "Marketing kit not found" };
    }

    const marketingKit = await prisma.marketingKit.update({
      where: { id: kitId },
      data: updates,
    });

    revalidatePath("/properties");
    revalidatePath("/marketing");
    return { data: marketingKit };
  } catch (error) {
    console.error("Error updating marketing kit:", error);
    return { error: "Failed to update marketing kit" };
  }
}

/**
 * Deletes a marketing kit
 */
export async function deleteMarketingKit(kitId: string) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const existing = await prisma.marketingKit.findUnique({
      where: { id: kitId },
    });

    if (!existing || existing.organizationId !== orgId) {
      return { error: "Marketing kit not found" };
    }

    await prisma.marketingKit.delete({
      where: { id: kitId },
    });

    revalidatePath("/properties");
    revalidatePath("/marketing");
    return { success: true };
  } catch (error) {
    console.error("Error deleting marketing kit:", error);
    return { error: "Failed to delete marketing kit" };
  }
}

// ============================================================================
// ASSET GENERATION
// ============================================================================

/**
 * Generate marketing assets for a kit
 */
export async function generateMarketingAssets(
  kitId: string,
  assetTypes?: MarketingAssetType[]
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const kit = await prisma.marketingKit.findUnique({
      where: { id: kitId },
      include: {
        propertyWebsite: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            price: true,
            beds: true,
            baths: true,
            sqft: true,
            headline: true,
            description: true,
            features: true,
            project: {
              select: {
                assets: {
                  take: 20,
                  orderBy: { sortOrder: "asc" },
                  select: {
                    originalUrl: true,
                    thumbnailUrl: true,
                    mediumUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!kit || kit.organizationId !== orgId) {
      return { error: "Marketing kit not found" };
    }

    // Determine which asset types to generate
    const typesToGenerate =
      assetTypes || kit.autoGenerateTypes.length > 0
        ? kit.autoGenerateTypes
        : getDefaultAssetTypes();

    // Determine which variants to generate
    const variants: MarketingAssetVariant[] = [];
    if (kit.includeBranded) variants.push("branded");
    if (kit.includeUnbranded) variants.push("unbranded"); // MLS-compliant
    if (kit.includeCoBranded) variants.push("co_branded");

    const generatedAssets: string[] = [];
    // Get property website from the included relation
    const property = "propertyWebsite" in kit ? (kit as { propertyWebsite?: { id: string; address: string; city: string; state: string; zipCode: string; price: number | null; beds: number | null; baths: number | null; sqft: number | null; headline: string | null; } }).propertyWebsite : null;

    // Generate assets for each type and variant
    for (const assetType of typesToGenerate as MarketingAssetType[]) {
      for (const variant of variants) {
        // Create the asset record
        const asset = await prisma.marketingAsset.create({
          data: {
            propertyWebsiteId: property?.id,
            marketingKitId: kit.id,
            name: generateAssetName(assetType, variant, property),
            type: assetType,
            variant,
            status: "pending",
            fileUrl: "", // Placeholder until generated
            settings: {
              propertyAddress: property
                ? `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`
                : null,
              propertyPrice: property?.price,
              propertyBeds: property?.beds,
              propertyBaths: property?.baths,
              propertySqft: property?.sqft,
              propertyHeadline: property?.headline,
              agentName: variant !== "unbranded" ? kit.agentName : null,
              agentTitle: variant !== "unbranded" ? kit.agentTitle : null,
              agentPhone: variant !== "unbranded" ? kit.agentPhone : null,
              agentEmail: variant !== "unbranded" ? kit.agentEmail : null,
              agentPhotoUrl: variant !== "unbranded" ? kit.agentPhotoUrl : null,
              brokerageName: variant !== "unbranded" ? kit.brokerageName : null,
              brokerageLogo: variant !== "unbranded" ? kit.brokerageLogo : null,
              primaryColor: kit.primaryColor,
              secondaryColor: kit.secondaryColor,
              accentColor: kit.accentColor,
              headingFont: kit.headingFont,
              bodyFont: kit.bodyFont,
              style: kit.style,
            },
          },
        });

        generatedAssets.push(asset.id);

        // Queue the actual rendering (in production, this would go to a job queue)
        // For now, we'll mark it as ready for the frontend to render
        await prisma.marketingAsset.update({
          where: { id: asset.id },
          data: { status: "ready" },
        });
      }
    }

    revalidatePath("/properties");
    revalidatePath("/marketing");
    return { data: { generatedCount: generatedAssets.length, assetIds: generatedAssets } };
  } catch (error) {
    console.error("Error generating marketing assets:", error);
    return { error: "Failed to generate marketing assets" };
  }
}

/**
 * Regenerate a single asset
 */
export async function regenerateAsset(assetId: string) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const asset = await prisma.marketingAsset.findUnique({
      where: { id: assetId },
      include: { marketingKit: { select: { organizationId: true } } },
    });

    if (!asset || asset.marketingKit?.organizationId !== orgId) {
      return { error: "Asset not found" };
    }

    // Reset status to pending
    await prisma.marketingAsset.update({
      where: { id: assetId },
      data: {
        status: "pending",
        fileUrl: "", // Reset to empty placeholder
        thumbnailUrl: null,
      },
    });

    // Queue regeneration (in production, this would go to a job queue)
    await prisma.marketingAsset.update({
      where: { id: assetId },
      data: { status: "ready" },
    });

    revalidatePath("/properties");
    revalidatePath("/marketing");
    return { success: true };
  } catch (error) {
    console.error("Error regenerating asset:", error);
    return { error: "Failed to regenerate asset" };
  }
}

// ============================================================================
// ASSET CRUD
// ============================================================================

/**
 * Get all assets for a marketing kit
 */
export async function getMarketingAssets(kitId: string) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const kit = await prisma.marketingKit.findUnique({
      where: { id: kitId },
    });

    if (!kit || kit.organizationId !== orgId) {
      return { error: "Marketing kit not found" };
    }

    const assets = await prisma.marketingAsset.findMany({
      where: { marketingKitId: kitId },
      orderBy: [{ type: "asc" }, { variant: "asc" }, { createdAt: "desc" }],
    });

    return { data: assets };
  } catch (error) {
    console.error("Error fetching marketing assets:", error);
    return { error: "Failed to fetch marketing assets" };
  }
}

/**
 * Update an asset (e.g., after editing in Canva-style editor)
 */
export async function updateMarketingAsset(
  assetId: string,
  updates: {
    name?: string;
    editData?: Record<string, unknown>;
    settings?: Record<string, unknown>;
  }
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const asset = await prisma.marketingAsset.findUnique({
      where: { id: assetId },
      include: { marketingKit: { select: { organizationId: true } } },
    });

    if (!asset || asset.marketingKit?.organizationId !== orgId) {
      return { error: "Asset not found" };
    }

    const updatedAsset = await prisma.marketingAsset.update({
      where: { id: assetId },
      data: {
        name: updates.name,
        editData: updates.editData as Prisma.InputJsonValue | undefined,
        settings: updates.settings as Prisma.InputJsonValue | undefined,
      },
    });

    revalidatePath("/properties");
    revalidatePath("/marketing");
    return { data: updatedAsset };
  } catch (error) {
    console.error("Error updating marketing asset:", error);
    return { error: "Failed to update marketing asset" };
  }
}

/**
 * Delete a marketing asset
 */
export async function deleteMarketingAsset(assetId: string) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const asset = await prisma.marketingAsset.findUnique({
      where: { id: assetId },
      include: { marketingKit: { select: { organizationId: true } } },
    });

    if (!asset || asset.marketingKit?.organizationId !== orgId) {
      return { error: "Asset not found" };
    }

    await prisma.marketingAsset.delete({
      where: { id: assetId },
    });

    revalidatePath("/properties");
    revalidatePath("/marketing");
    return { success: true };
  } catch (error) {
    console.error("Error deleting marketing asset:", error);
    return { error: "Failed to delete marketing asset" };
  }
}

// ============================================================================
// MARKETING TEMPLATES
// ============================================================================

/**
 * Get available marketing templates
 */
export async function getMarketingTemplates(type?: MarketingAssetType) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const templates = await prisma.marketingTemplate.findMany({
      where: {
        OR: [
          { organizationId: orgId },
          { isSystem: true },
          { isPublic: true },
        ],
        ...(type ? { type } : {}),
      },
      orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
    });

    return { data: templates };
  } catch (error) {
    console.error("Error fetching marketing templates:", error);
    return { error: "Failed to fetch marketing templates" };
  }
}

/**
 * Create a custom template from an asset
 */
export async function createTemplateFromAsset(
  assetId: string,
  name: string,
  description?: string
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const asset = await prisma.marketingAsset.findUnique({
      where: { id: assetId },
      include: { marketingKit: { select: { organizationId: true } } },
    });

    if (!asset || asset.marketingKit?.organizationId !== orgId) {
      return { error: "Asset not found" };
    }

    const template = await prisma.marketingTemplate.create({
      data: {
        organizationId: orgId,
        name,
        description,
        type: asset.type,
        canvasWidth: getAssetDimensions(asset.type).width,
        canvasHeight: getAssetDimensions(asset.type).height,
        templateData: asset.editData || {},
        thumbnailUrl: asset.thumbnailUrl,
      },
    });

    revalidatePath("/marketing");
    return { data: template };
  } catch (error) {
    console.error("Error creating template:", error);
    return { error: "Failed to create template" };
  }
}

// ============================================================================
// AUDIO TRACKS
// ============================================================================

/**
 * Get available audio tracks for video generation
 */
export async function getAudioTracks(filters?: {
  genre?: string;
  mood?: string;
  minDuration?: number;
  maxDuration?: number;
}) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const tracks = await prisma.audioTrack.findMany({
      where: {
        OR: [
          { organizationId: orgId },
          { isSystem: true },
          { isPublic: true },
        ],
        ...(filters?.genre ? { genre: filters.genre } : {}),
        ...(filters?.mood ? { mood: filters.mood } : {}),
        ...(filters?.minDuration ? { duration: { gte: filters.minDuration } } : {}),
        ...(filters?.maxDuration ? { duration: { lte: filters.maxDuration } } : {}),
      },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });

    return { data: tracks };
  } catch (error) {
    console.error("Error fetching audio tracks:", error);
    return { error: "Failed to fetch audio tracks" };
  }
}

// ============================================================================
// PURCHASE & PRICING
// ============================================================================

/**
 * Purchase a marketing kit
 */
export async function purchaseMarketingKit(
  kitId: string,
  purchaseType: "bundled" | "separate" | "subscription" | "credits",
  priceCents: number
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const kit = await prisma.marketingKit.findUnique({
      where: { id: kitId },
    });

    if (!kit || kit.organizationId !== orgId) {
      return { error: "Marketing kit not found" };
    }

    // Update the kit as purchased
    const updatedKit = await prisma.marketingKit.update({
      where: { id: kitId },
      data: {
        isPurchased: true,
        purchasedAt: new Date(),
        purchaseType,
        pricePaidCents: priceCents,
      },
    });

    // Generate assets if not already generated
    const existingAssets = await prisma.marketingAsset.count({
      where: { marketingKitId: kitId },
    });

    if (existingAssets === 0) {
      await generateMarketingAssets(kitId);
    }

    revalidatePath("/properties");
    revalidatePath("/marketing");
    return { data: updatedKit };
  } catch (error) {
    console.error("Error purchasing marketing kit:", error);
    return { error: "Failed to purchase marketing kit" };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDefaultAssetTypes(): MarketingAssetType[] {
  return [
    "tile_just_listed",
    "tile_just_sold",
    "tile_open_house",
    "social_square",
    "social_story",
    "social_landscape",
    "flyer_portrait",
    "feature_sheet",
  ];
}

function generateAssetName(
  type: MarketingAssetType,
  variant: MarketingAssetVariant,
  property?: {
    address: string;
    city: string;
    state: string;
  } | null
): string {
  const typeLabels: Record<MarketingAssetType, string> = {
    flyer_portrait: "Portrait Flyer",
    flyer_landscape: "Landscape Flyer",
    postcard_4x6: "4x6 Postcard",
    postcard_5x7: "5x7 Postcard",
    feature_sheet: "Feature Sheet",
    brochure: "Brochure",
    window_sign: "Window Sign",
    yard_sign_rider: "Yard Sign Rider",
    door_hanger: "Door Hanger",
    social_square: "Square Social Post",
    social_landscape: "Landscape Social Post",
    social_pinterest: "Pinterest Pin",
    social_linkedin: "LinkedIn Post",
    social_twitter: "Twitter/X Post",
    social_story: "Story Format",
    tile_just_listed: "Just Listed",
    tile_just_sold: "Just Sold",
    tile_open_house: "Open House",
    tile_price_reduced: "Price Reduced",
    tile_coming_soon: "Coming Soon",
    tile_under_contract: "Under Contract",
    tile_back_on_market: "Back on Market",
    tile_new_price: "New Price",
    tile_virtual_tour: "Virtual Tour",
    tile_featured: "Featured Property",
    video_slideshow: "Photo Slideshow",
    video_reel: "Instagram Reel",
    video_tour_teaser: "Tour Teaser",
    video_neighborhood: "Neighborhood Tour",
    video_stats_animation: "Stats Animation",
    email_banner: "Email Banner",
    email_template: "Email Template",
    qr_code: "QR Code",
    virtual_tour_poster: "Virtual Tour Poster",
  };

  const variantLabels: Record<MarketingAssetVariant, string> = {
    branded: "Branded",
    unbranded: "MLS",
    co_branded: "Co-Branded",
    photographer_only: "Photo Credit",
  };

  const typeName = typeLabels[type] || type;
  const variantName = variantLabels[variant] || variant;
  const propertyName = property ? `${property.address}` : "";

  return `${typeName} - ${variantName}${propertyName ? ` - ${propertyName}` : ""}`;
}

function getAssetDimensions(type: MarketingAssetType): {
  width: number;
  height: number;
} {
  const dimensions: Record<MarketingAssetType, { width: number; height: number }> = {
    // Print Materials
    flyer_portrait: { width: 2550, height: 3300 }, // 8.5x11 @ 300dpi
    flyer_landscape: { width: 3300, height: 2550 },
    postcard_4x6: { width: 1800, height: 1200 }, // 6x4 @ 300dpi
    postcard_5x7: { width: 2100, height: 1500 }, // 7x5 @ 300dpi
    feature_sheet: { width: 2550, height: 3300 },
    brochure: { width: 2550, height: 3300 },
    window_sign: { width: 2400, height: 3600 }, // 8x12
    yard_sign_rider: { width: 1800, height: 600 },
    door_hanger: { width: 1200, height: 3300 },
    // Social Media - Static
    social_square: { width: 1080, height: 1080 },
    social_landscape: { width: 1200, height: 630 },
    social_pinterest: { width: 1000, height: 1500 },
    social_linkedin: { width: 1200, height: 627 },
    social_twitter: { width: 1200, height: 675 },
    social_story: { width: 1080, height: 1920 },
    // Social Tiles
    tile_just_listed: { width: 1080, height: 1080 },
    tile_just_sold: { width: 1080, height: 1080 },
    tile_open_house: { width: 1080, height: 1080 },
    tile_price_reduced: { width: 1080, height: 1080 },
    tile_coming_soon: { width: 1080, height: 1080 },
    tile_under_contract: { width: 1080, height: 1080 },
    tile_back_on_market: { width: 1080, height: 1080 },
    tile_new_price: { width: 1080, height: 1080 },
    tile_virtual_tour: { width: 1080, height: 1080 },
    tile_featured: { width: 1080, height: 1080 },
    // Video
    video_slideshow: { width: 1920, height: 1080 },
    video_reel: { width: 1080, height: 1920 },
    video_tour_teaser: { width: 1920, height: 1080 },
    video_neighborhood: { width: 1920, height: 1080 },
    video_stats_animation: { width: 1080, height: 1080 },
    // Email & Other
    email_banner: { width: 600, height: 200 },
    email_template: { width: 600, height: 800 },
    qr_code: { width: 500, height: 500 },
    virtual_tour_poster: { width: 2550, height: 3300 },
  };

  return dimensions[type] || { width: 1080, height: 1080 };
}
