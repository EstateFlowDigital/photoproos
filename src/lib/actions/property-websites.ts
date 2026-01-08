"use server";

import { ok, fail, type VoidActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { PropertyWebsiteTemplate, PropertyType, LeadStatus, PropertySectionType, Prisma } from "@prisma/client";
import { sendPropertyLeadEmail } from "@/lib/email/send";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/storage";
import {
  getPropertySectionDefinition,
  getDefaultPropertySections,
  generateAutoFilledConfig,
} from "@/lib/property-templates";

// Types
export interface PropertyWebsiteInput {
  projectId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  lotSize?: string | null;
  yearBuilt?: number | null;
  propertyType?: PropertyType | null;
  headline?: string | null;
  description?: string | null;
  features?: string[];
  virtualTourUrl?: string | null;
  videoUrl?: string | null;
  template?: PropertyWebsiteTemplate;
  isBranded?: boolean;
  showPrice?: boolean;
  showAgent?: boolean;
  autoGenerateMarketingKit?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  // Template customization
  accentColor?: string | null;
  fontHeading?: string | null;
  fontBody?: string | null;
  // Open house scheduling
  openHouseDate?: Date | null;
  openHouseEndDate?: Date | null;
}

export interface PropertyWebsiteWithRelations {
  id: string;
  projectId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lotSize: string | null;
  yearBuilt: number | null;
  propertyType: PropertyType | null;
  headline: string | null;
  description: string | null;
  features: string[];
  virtualTourUrl: string | null;
  videoUrl: string | null;
  template: PropertyWebsiteTemplate;
  isPublished: boolean;
  isBranded: boolean;
  showPrice: boolean;
  showAgent: boolean;
  customDomain: string | null;
  customDomainVerified: boolean;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  accentColor: string | null;
  fontHeading: string | null;
  fontBody: string | null;
  openHouseDate: Date | null;
  openHouseEndDate: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  // Access control
  isPasswordProtected: boolean;
  password: string | null;
  // Scheduling
  scheduledPublishAt: Date | null;
  expiresAt: Date | null;
  // Feature toggles
  enableSharing: boolean;
  enableMortgageCalc: boolean;
  enableScheduleTour: boolean;
  enableFavorite: boolean;
  autoGenerateMarketingKit: boolean;
  // Branding
  logoUrl: string | null;
  socialImage: string | null;
  agentPhotoUrl: string | null;
  brokerageName: string | null;
  brokerageLogo: string | null;
  project: {
    id: string;
    name: string;
    coverImageUrl: string | null;
    status: string;
    client: {
      id: string;
      fullName: string | null;
      email: string;
      company: string | null;
      phone: string | null;
    } | null;
    assets: {
      id: string;
      originalUrl: string;
      thumbnailUrl: string | null;
    }[];
  };
  _count: {
    leads: number;
  };
}

// Helper to generate slug
function generateSlug(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

// Create property website
export async function createPropertyWebsite(
  data: PropertyWebsiteInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { propertyWebsite: true },
    });

    if (!project) {
      return fail("Project not found");
    }

    if (project.propertyWebsite) {
      return fail("Property website already exists for this project");
    }

    // Generate unique slug
    const slug = generateSlug(data.address);
    let counter = 0;
    let uniqueSlug = slug;

    while (await prisma.propertyWebsite.findUnique({ where: { slug: uniqueSlug } })) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    const propertyWebsite = await prisma.propertyWebsite.create({
      data: {
        projectId: data.projectId,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        price: data.price,
        beds: data.beds,
        baths: data.baths,
        sqft: data.sqft,
        lotSize: data.lotSize,
        yearBuilt: data.yearBuilt,
        propertyType: data.propertyType,
        headline: data.headline,
        description: data.description,
        features: data.features || [],
        virtualTourUrl: data.virtualTourUrl,
        videoUrl: data.videoUrl,
        template: data.template || "modern",
        isBranded: data.isBranded ?? true,
        showPrice: data.showPrice ?? true,
        showAgent: data.showAgent ?? true,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        slug: uniqueSlug,
      },
    });

    revalidatePath("/properties");
    revalidatePath(`/properties/${propertyWebsite.id}`);

    return { success: true, id: propertyWebsite.id };
  } catch (error) {
    console.error("Error creating property website:", error);
    return fail("Failed to create property website");
  }
}

// Update property website
export async function updatePropertyWebsite(
  id: string,
  data: Partial<PropertyWebsiteInput>
): Promise<VoidActionResult> {
  try {
    const existing = await prisma.propertyWebsite.findUnique({ where: { id } });
    if (!existing) {
      return fail("Property website not found");
    }

    await prisma.propertyWebsite.update({
      where: { id },
      data: {
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        price: data.price,
        beds: data.beds,
        baths: data.baths,
        sqft: data.sqft,
        lotSize: data.lotSize,
        yearBuilt: data.yearBuilt,
        propertyType: data.propertyType,
        headline: data.headline,
        description: data.description,
        features: data.features,
        virtualTourUrl: data.virtualTourUrl,
        videoUrl: data.videoUrl,
        template: data.template,
        isBranded: data.isBranded,
        showPrice: data.showPrice,
        showAgent: data.showAgent,
        autoGenerateMarketingKit: data.autoGenerateMarketingKit,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        accentColor: data.accentColor,
        fontHeading: data.fontHeading,
        fontBody: data.fontBody,
        openHouseDate: data.openHouseDate,
        openHouseEndDate: data.openHouseEndDate,
      },
    });

    revalidatePath("/properties");
    revalidatePath(`/properties/${id}`);
    revalidatePath(`/p/${existing.slug}`);

    return ok();
  } catch (error) {
    console.error("Error updating property website:", error);
    return fail("Failed to update property website");
  }
}

// Publish/unpublish property website
export async function togglePropertyWebsitePublish(
  id: string
): Promise<{ success: boolean; isPublished?: boolean; error?: string }> {
  try {
    const existing = await prisma.propertyWebsite.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            organizationId: true,
          },
        },
        marketingKit: true,
      },
    });
    if (!existing) {
      return fail("Property website not found");
    }

    const willBePublished = !existing.isPublished;

    const updated = await prisma.propertyWebsite.update({
      where: { id },
      data: {
        isPublished: willBePublished,
        publishedAt: willBePublished ? new Date() : null,
      },
    });

    // Auto-generate marketing kit when publishing if enabled
    if (willBePublished && existing.autoGenerateMarketingKit && !existing.marketingKit) {
      try {
        // Create a marketing kit for this property
        await prisma.marketingKit.create({
          data: {
            propertyWebsiteId: id,
            organizationId: existing.project.organizationId,
            name: `${existing.address} Marketing Kit`,
            autoGenerateOnCreate: true,
            autoGenerateTypes: [
              "flyer_portrait",
              "social_square",
              "tile_just_listed",
            ],
          },
        });
        console.log(`[Marketing Kit] Auto-created for property: ${existing.address}`);
      } catch (mkError) {
        // Log but don't fail the publish operation
        console.error("[Marketing Kit] Auto-creation failed:", mkError);
      }
    }

    revalidatePath("/properties");
    revalidatePath(`/properties/${id}`);
    revalidatePath(`/p/${existing.slug}`);

    return { success: true, isPublished: updated.isPublished };
  } catch (error) {
    console.error("Error toggling publish:", error);
    return fail("Failed to toggle publish status");
  }
}

// Delete property website
export async function deletePropertyWebsite(
  id: string
): Promise<VoidActionResult> {
  try {
    const existing = await prisma.propertyWebsite.findUnique({ where: { id } });
    if (!existing) {
      return fail("Property website not found");
    }

    await prisma.propertyWebsite.delete({ where: { id } });

    revalidatePath("/properties");

    return ok();
  } catch (error) {
    console.error("Error deleting property website:", error);
    return fail("Failed to delete property website");
  }
}

// Get all property websites for organization
export async function getPropertyWebsites(
  organizationId: string
): Promise<PropertyWebsiteWithRelations[]> {
  try {
    const websites = await prisma.propertyWebsite.findMany({
      where: {
        project: {
          organizationId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            coverImageUrl: true,
            status: true,
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                company: true,
                phone: true,
              },
            },
            assets: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
              },
              take: 5,
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        _count: {
          select: {
            leads: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return websites as PropertyWebsiteWithRelations[];
  } catch (error) {
    console.error("Error fetching property websites:", error);
    return [];
  }
}

// Get single property website by ID
export async function getPropertyWebsiteById(
  id: string
): Promise<PropertyWebsiteWithRelations | null> {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            coverImageUrl: true,
            status: true,
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                company: true,
                phone: true,
              },
            },
            assets: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        _count: {
          select: {
            leads: true,
          },
        },
      },
    });

    return website as PropertyWebsiteWithRelations | null;
  } catch (error) {
    console.error("Error fetching property website:", error);
    return null;
  }
}

// Get property website by slug (for public page)
export async function getPropertyWebsiteBySlug(slug: string) {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { slug },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            coverImageUrl: true,
            status: true,
            organization: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                primaryColor: true,
              },
            },
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                company: true,
                phone: true,
              },
            },
            assets: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                width: true,
                height: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!website || !website.isPublished) {
      return null;
    }

    // Sign image URLs for short-lived public access
    const signedAssets = await Promise.all(
      website.project.assets.map(async (asset) => {
        const thumbKey = asset.thumbnailUrl ? extractKeyFromUrl(asset.thumbnailUrl) : null;
        const originalKey = asset.originalUrl ? extractKeyFromUrl(asset.originalUrl) : null;

        let signedThumbnailUrl = asset.thumbnailUrl;
        let signedOriginalUrl = asset.originalUrl;

        try {
          if (thumbKey) {
            signedThumbnailUrl = await generatePresignedDownloadUrl(thumbKey, 900);
          }
        } catch (err) {
          console.error("Failed to sign property website thumbnail", { assetId: asset.id, err });
        }

        try {
          if (originalKey) {
            signedOriginalUrl = await generatePresignedDownloadUrl(originalKey, 900);
          }
        } catch (err) {
          console.error("Failed to sign property website original", { assetId: asset.id, err });
        }

        return {
          ...asset,
          thumbnailUrl: signedThumbnailUrl || signedOriginalUrl,
          originalUrl: signedOriginalUrl || "",
        };
      })
    );

    return {
      ...website,
      project: {
        ...website.project,
        assets: signedAssets,
      },
    };
  } catch (error) {
    console.error("Error fetching property website by slug:", error);
    return null;
  }
}

// Increment view count
export async function incrementPropertyWebsiteViews(id: string): Promise<void> {
  try {
    await prisma.propertyWebsite.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Also log to analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.propertyAnalytics.upsert({
      where: {
        propertyWebsiteId_date: {
          propertyWebsiteId: id,
          date: today,
        },
      },
      update: {
        pageViews: { increment: 1 },
      },
      create: {
        propertyWebsiteId: id,
        date: today,
        pageViews: 1,
      },
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
}

// Submit lead from property website
export async function submitPropertyLead(data: {
  propertyWebsiteId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
}): Promise<VoidActionResult> {
  try {
    // Get property website with organization info for email
    const propertyWebsite = await prisma.propertyWebsite.findUnique({
      where: { id: data.propertyWebsiteId },
      include: {
        project: {
          include: {
            organization: {
              select: {
                name: true,
                publicEmail: true,
              },
            },
          },
        },
      },
    });

    if (!propertyWebsite) {
      return fail("Property website not found");
    }

    // Create the lead
    await prisma.propertyLead.create({
      data: {
        propertyWebsiteId: data.propertyWebsiteId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source || "website",
      },
    });

    // Send email notification to photographer
    const organizationEmail = propertyWebsite.project.organization?.publicEmail;
    if (organizationEmail) {
      const propertyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://photoproos.com"}/p/${propertyWebsite.slug}`;

      try {
        await sendPropertyLeadEmail({
          to: organizationEmail,
          photographerName: propertyWebsite.project.organization?.name || "Photographer",
          propertyAddress: propertyWebsite.address,
          propertyUrl,
          leadName: data.name,
          leadEmail: data.email,
          leadPhone: data.phone,
          leadMessage: data.message,
        });
      } catch (emailError) {
        // Log email error but don't fail the lead submission
        console.error("Error sending lead notification email:", emailError);
      }
    }

    revalidatePath("/properties");

    return ok();
  } catch (error) {
    console.error("Error submitting lead:", error);
    return fail("Failed to submit inquiry");
  }
}

// Get leads for property website
export async function getPropertyLeads(propertyWebsiteId: string) {
  try {
    const leads = await prisma.propertyLead.findMany({
      where: { propertyWebsiteId },
      orderBy: { createdAt: "desc" },
    });

    return leads;
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

// Update lead status
export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<VoidActionResult> {
  try {
    await prisma.propertyLead.update({
      where: { id: leadId },
      data: { status },
    });

    revalidatePath("/properties");

    return ok();
  } catch (error) {
    console.error("Error updating lead status:", error);
    return fail("Failed to update lead status");
  }
}

// Get analytics for property website
export async function getPropertyAnalytics(
  propertyWebsiteId: string,
  days: number = 30
) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await prisma.propertyAnalytics.findMany({
      where: {
        propertyWebsiteId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Aggregate totals
    const totals = analytics.reduce(
      (acc, day) => ({
        pageViews: acc.pageViews + day.pageViews,
        uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
        tourClicks: acc.tourClicks + day.tourClicks,
        photoViews: acc.photoViews + day.photoViews,
        socialShares: acc.socialShares + day.socialShares,
      }),
      {
        pageViews: 0,
        uniqueVisitors: 0,
        tourClicks: 0,
        photoViews: 0,
        socialShares: 0,
      }
    );

    return { dailyData: analytics, totals };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { dailyData: [], totals: { pageViews: 0, uniqueVisitors: 0, tourClicks: 0, photoViews: 0, socialShares: 0 } };
  }
}

// Get ALL leads across all properties for organization
export async function getAllPropertyLeads(organizationId: string) {
  try {
    const leads = await prisma.propertyLead.findMany({
      where: {
        propertyWebsite: {
          project: {
            organizationId,
          },
        },
      },
      include: {
        propertyWebsite: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return leads;
  } catch (error) {
    console.error("Error fetching all leads:", error);
    return [];
  }
}

// Get aggregate analytics across all properties
export async function getAggregateAnalytics(organizationId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all property websites for the organization
    const websites = await prisma.propertyWebsite.findMany({
      where: {
        project: {
          organizationId,
        },
      },
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
        slug: true,
        viewCount: true,
        isPublished: true,
        _count: {
          select: {
            leads: true,
          },
        },
      },
    });

    // Get analytics data for all properties
    const analytics = await prisma.propertyAnalytics.findMany({
      where: {
        propertyWebsite: {
          project: {
            organizationId,
          },
        },
        date: {
          gte: startDate,
        },
      },
      include: {
        propertyWebsite: {
          select: {
            id: true,
            address: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Aggregate totals
    const totals = analytics.reduce(
      (acc, day) => ({
        pageViews: acc.pageViews + day.pageViews,
        uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
        tourClicks: acc.tourClicks + day.tourClicks,
        photoViews: acc.photoViews + day.photoViews,
        socialShares: acc.socialShares + day.socialShares,
      }),
      {
        pageViews: 0,
        uniqueVisitors: 0,
        tourClicks: 0,
        photoViews: 0,
        socialShares: 0,
      }
    );

    // Group analytics by date for chart
    const dailyTotals = analytics.reduce((acc, day) => {
      const dateKey = day.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, pageViews: 0, uniqueVisitors: 0, tourClicks: 0, photoViews: 0, socialShares: 0 };
      }
      acc[dateKey].pageViews += day.pageViews;
      acc[dateKey].uniqueVisitors += day.uniqueVisitors;
      acc[dateKey].tourClicks += day.tourClicks;
      acc[dateKey].photoViews += day.photoViews;
      acc[dateKey].socialShares += day.socialShares;
      return acc;
    }, {} as Record<string, { date: string; pageViews: number; uniqueVisitors: number; tourClicks: number; photoViews: number; socialShares: number }>);

    // Calculate per-property stats
    const propertyStats = websites.map((website) => ({
      id: website.id,
      address: website.address,
      city: website.city,
      state: website.state,
      slug: website.slug,
      viewCount: website.viewCount,
      leadCount: website._count.leads,
      isPublished: website.isPublished,
    }));

    // Sort by views descending
    propertyStats.sort((a, b) => b.viewCount - a.viewCount);

    return {
      totals,
      dailyData: Object.values(dailyTotals).sort((a, b) => a.date.localeCompare(b.date)),
      propertyStats,
      totalProperties: websites.length,
      publishedProperties: websites.filter((w) => w.isPublished).length,
      totalLeads: websites.reduce((sum, w) => sum + w._count.leads, 0),
    };
  } catch (error) {
    console.error("Error fetching aggregate analytics:", error);
    return {
      totals: { pageViews: 0, uniqueVisitors: 0, tourClicks: 0, photoViews: 0, socialShares: 0 },
      dailyData: [],
      propertyStats: [],
      totalProperties: 0,
      publishedProperties: 0,
      totalLeads: 0,
    };
  }
}

// Duplicate property website
export async function duplicatePropertyWebsite(
  id: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const existing = await prisma.propertyWebsite.findUnique({
      where: { id },
    });

    if (!existing) {
      return fail("Property website not found");
    }

    // Generate unique slug for the copy
    const baseSlug = generateSlug(existing.address);
    let counter = 1;
    let uniqueSlug = `${baseSlug}-copy`;

    while (await prisma.propertyWebsite.findUnique({ where: { slug: uniqueSlug } })) {
      counter++;
      uniqueSlug = `${baseSlug}-copy-${counter}`;
    }

    // Create duplicate with key fields copied
    const duplicate = await prisma.propertyWebsite.create({
      data: {
        projectId: existing.projectId,
        address: `${existing.address} (Copy)`,
        city: existing.city,
        state: existing.state,
        zipCode: existing.zipCode,
        price: existing.price,
        beds: existing.beds,
        baths: existing.baths,
        sqft: existing.sqft,
        lotSize: existing.lotSize,
        yearBuilt: existing.yearBuilt,
        propertyType: existing.propertyType,
        headline: existing.headline,
        description: existing.description,
        features: existing.features,
        virtualTourUrl: existing.virtualTourUrl,
        videoUrl: existing.videoUrl,
        template: existing.template,
        accentColor: existing.accentColor,
        isBranded: existing.isBranded,
        showPrice: existing.showPrice,
        showAgent: existing.showAgent,
        metaTitle: existing.metaTitle,
        metaDescription: existing.metaDescription,
        openHouseDate: existing.openHouseDate,
        openHouseEndDate: existing.openHouseEndDate,
        slug: uniqueSlug,
        isPublished: false, // Always start unpublished
      },
    });

    revalidatePath("/properties");

    return { success: true, id: duplicate.id };
  } catch (error) {
    console.error("Error duplicating property website:", error);
    return fail("Failed to duplicate property website");
  }
}

// Delete multiple property websites
export async function deletePropertyWebsites(
  ids: string[]
): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    const result = await prisma.propertyWebsite.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/properties");

    return { success: true, deleted: result.count };
  } catch (error) {
    console.error("Error deleting property websites:", error);
    return { success: false, deleted: 0, error: "Failed to delete property websites" };
  }
}

// Publish multiple property websites
export async function publishPropertyWebsites(
  ids: string[],
  publish: boolean
): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    const result = await prisma.propertyWebsite.updateMany({
      where: { id: { in: ids } },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });

    revalidatePath("/properties");

    return { success: true, updated: result.count };
  } catch (error) {
    console.error("Error updating property websites:", error);
    return { success: false, updated: 0, error: "Failed to update property websites" };
  }
}

// Get projects without property websites (for creating new ones)
export async function getProjectsWithoutPropertyWebsite(organizationId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        propertyWebsite: null,
        status: { in: ["draft", "pending", "delivered"] },
      },
      select: {
        id: true,
        name: true,
        status: true,
        coverImageUrl: true,
        client: {
          select: {
            fullName: true,
            company: true,
          },
        },
        location: {
          select: {
            formattedAddress: true,
            city: true,
            state: true,
            postalCode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

// ============================================================================
// SECTION MANAGEMENT (New section-based layout system)
// ============================================================================

// Get property website with sections
export async function getPropertyWebsiteWithSections(id: string) {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { position: "asc" },
        },
        project: {
          select: {
            id: true,
            name: true,
            coverImageUrl: true,
            status: true,
            organization: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                primaryColor: true,
                publicEmail: true,
                publicPhone: true,
              },
            },
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                company: true,
                phone: true,
              },
            },
            assets: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                width: true,
                height: true,
                filename: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        _count: {
          select: {
            leads: true,
            views: true,
          },
        },
      },
    });

    return website;
  } catch (error) {
    console.error("Error fetching property website with sections:", error);
    return null;
  }
}

// Initialize default sections for a property website
export async function initializePropertySections(
  propertyWebsiteId: string
): Promise<VoidActionResult> {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id: propertyWebsiteId },
      include: {
        sections: true,
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!website) {
      return fail("Property website not found");
    }

    // Don't reinitialize if sections already exist
    if (website.sections.length > 0) {
      return ok();
    }

    // Get default sections for this template
    const defaultSectionTypes = getDefaultPropertySections(website.template);

    // Create sections with auto-filled configs
    const sectionsToCreate = defaultSectionTypes.map((sectionType, index) => {
      const definition = getPropertySectionDefinition(sectionType);
      const autoFilledConfig = generateAutoFilledConfig(sectionType, {
        address: website.address,
        city: website.city,
        state: website.state,
        zipCode: website.zipCode,
        price: website.price,
        beds: website.beds,
        baths: website.baths,
        sqft: website.sqft,
        lotSize: website.lotSize,
        yearBuilt: website.yearBuilt,
        propertyType: website.propertyType,
        headline: website.headline,
        description: website.description,
        features: website.features,
        virtualTourUrl: website.virtualTourUrl,
        videoUrl: website.videoUrl,
        floorPlanUrls: website.floorPlanUrls,
        openHouseDate: website.openHouseDate,
        openHouseEndDate: website.openHouseEndDate,
        agentName: website.agentName || website.project.organization?.name,
        agentEmail: website.agentEmail || website.project.organization?.publicEmail,
        agentPhone: website.agentPhone || website.project.organization?.publicPhone,
        agentPhotoUrl: website.agentPhotoUrl,
        brokerageName: website.brokerageName,
        brokerageLogo: website.brokerageLogo,
      });

      return {
        propertyWebsiteId,
        sectionType,
        position: index,
        isVisible: true,
        config: { ...definition?.defaultConfig, ...autoFilledConfig } as Prisma.InputJsonValue,
      };
    });

    await prisma.propertyWebsiteSection.createMany({
      data: sectionsToCreate,
    });

    // Enable section layout mode
    await prisma.propertyWebsite.update({
      where: { id: propertyWebsiteId },
      data: { useSectionLayout: true },
    });

    revalidatePath(`/properties/${propertyWebsiteId}`);

    return ok();
  } catch (error) {
    console.error("Error initializing property sections:", error);
    return fail("Failed to initialize sections");
  }
}

// Create a new section
export async function createPropertySection(data: {
  propertyWebsiteId: string;
  sectionType: PropertySectionType;
  position?: number;
  config?: Record<string, unknown>;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id: data.propertyWebsiteId },
      include: { sections: true },
    });

    if (!website) {
      return fail("Property website not found");
    }

    // Calculate position if not provided
    const position = data.position ?? website.sections.length;

    // Shift existing sections if inserting in the middle
    if (data.position !== undefined && data.position < website.sections.length) {
      await prisma.propertyWebsiteSection.updateMany({
        where: {
          propertyWebsiteId: data.propertyWebsiteId,
          position: { gte: data.position },
        },
        data: {
          position: { increment: 1 },
        },
      });
    }

    // Get default config for this section type
    const definition = getPropertySectionDefinition(data.sectionType);
    const autoFilledConfig = generateAutoFilledConfig(data.sectionType, {
      address: website.address,
      city: website.city,
      state: website.state,
      zipCode: website.zipCode,
      price: website.price,
      beds: website.beds,
      baths: website.baths,
      sqft: website.sqft,
      lotSize: website.lotSize,
      yearBuilt: website.yearBuilt,
      propertyType: website.propertyType,
      headline: website.headline,
      description: website.description,
      features: website.features,
      virtualTourUrl: website.virtualTourUrl,
      videoUrl: website.videoUrl,
      floorPlanUrls: website.floorPlanUrls,
      openHouseDate: website.openHouseDate,
      openHouseEndDate: website.openHouseEndDate,
      agentName: website.agentName,
      agentEmail: website.agentEmail,
      agentPhone: website.agentPhone,
      agentPhotoUrl: website.agentPhotoUrl,
      brokerageName: website.brokerageName,
      brokerageLogo: website.brokerageLogo,
    });

    const section = await prisma.propertyWebsiteSection.create({
      data: {
        propertyWebsiteId: data.propertyWebsiteId,
        sectionType: data.sectionType,
        position,
        isVisible: true,
        config: (data.config || { ...definition?.defaultConfig, ...autoFilledConfig }) as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/properties/${data.propertyWebsiteId}`);

    return { success: true, id: section.id };
  } catch (error) {
    console.error("Error creating property section:", error);
    return fail("Failed to create section");
  }
}

// Update a section
export async function updatePropertySection(
  sectionId: string,
  data: {
    config?: Record<string, unknown>;
    customTitle?: string | null;
    isVisible?: boolean;
    backgroundColor?: string | null;
    paddingTop?: string | null;
    paddingBottom?: string | null;
  }
): Promise<VoidActionResult> {
  try {
    const section = await prisma.propertyWebsiteSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return fail("Section not found");
    }

    await prisma.propertyWebsiteSection.update({
      where: { id: sectionId },
      data: {
        config: data.config !== undefined ? (data.config as Prisma.InputJsonValue) : undefined,
        customTitle: data.customTitle,
        isVisible: data.isVisible,
        backgroundColor: data.backgroundColor,
        paddingTop: data.paddingTop,
        paddingBottom: data.paddingBottom,
      },
    });

    revalidatePath(`/properties/${section.propertyWebsiteId}`);

    return ok();
  } catch (error) {
    console.error("Error updating property section:", error);
    return fail("Failed to update section");
  }
}

// Delete a section
export async function deletePropertySection(sectionId: string): Promise<VoidActionResult> {
  try {
    const section = await prisma.propertyWebsiteSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return fail("Section not found");
    }

    await prisma.propertyWebsiteSection.delete({
      where: { id: sectionId },
    });

    // Reorder remaining sections
    const remainingSections = await prisma.propertyWebsiteSection.findMany({
      where: { propertyWebsiteId: section.propertyWebsiteId },
      orderBy: { position: "asc" },
    });

    await Promise.all(
      remainingSections.map((s, index) =>
        prisma.propertyWebsiteSection.update({
          where: { id: s.id },
          data: { position: index },
        })
      )
    );

    revalidatePath(`/properties/${section.propertyWebsiteId}`);

    return ok();
  } catch (error) {
    console.error("Error deleting property section:", error);
    return fail("Failed to delete section");
  }
}

// Reorder sections
export async function reorderPropertySections(
  propertyWebsiteId: string,
  sectionIds: string[]
): Promise<VoidActionResult> {
  try {
    await Promise.all(
      sectionIds.map((id, index) =>
        prisma.propertyWebsiteSection.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    revalidatePath(`/properties/${propertyWebsiteId}`);

    return ok();
  } catch (error) {
    console.error("Error reordering property sections:", error);
    return fail("Failed to reorder sections");
  }
}

// Toggle section visibility
export async function togglePropertySectionVisibility(
  sectionId: string
): Promise<{ success: boolean; isVisible?: boolean; error?: string }> {
  try {
    const section = await prisma.propertyWebsiteSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return fail("Section not found");
    }

    const updated = await prisma.propertyWebsiteSection.update({
      where: { id: sectionId },
      data: { isVisible: !section.isVisible },
    });

    revalidatePath(`/properties/${section.propertyWebsiteId}`);

    return { success: true, isVisible: updated.isVisible };
  } catch (error) {
    console.error("Error toggling section visibility:", error);
    return fail("Failed to toggle visibility");
  }
}

// Duplicate a section
export async function duplicatePropertySection(
  sectionId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const section = await prisma.propertyWebsiteSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return fail("Section not found");
    }

    // Shift sections below the current one
    await prisma.propertyWebsiteSection.updateMany({
      where: {
        propertyWebsiteId: section.propertyWebsiteId,
        position: { gt: section.position },
      },
      data: {
        position: { increment: 1 },
      },
    });

    // Create duplicate at position + 1
    const duplicate = await prisma.propertyWebsiteSection.create({
      data: {
        propertyWebsiteId: section.propertyWebsiteId,
        sectionType: section.sectionType,
        position: section.position + 1,
        isVisible: section.isVisible,
        config: section.config as Prisma.InputJsonValue,
        customTitle: section.customTitle ? `${section.customTitle} (Copy)` : null,
        backgroundColor: section.backgroundColor,
        paddingTop: section.paddingTop,
        paddingBottom: section.paddingBottom,
      },
    });

    revalidatePath(`/properties/${section.propertyWebsiteId}`);

    return { success: true, id: duplicate.id };
  } catch (error) {
    console.error("Error duplicating property section:", error);
    return fail("Failed to duplicate section");
  }
}

// Toggle between classic template and section-based layout
export async function togglePropertyLayoutMode(
  propertyWebsiteId: string
): Promise<{ success: boolean; useSectionLayout?: boolean; error?: string }> {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id: propertyWebsiteId },
      include: { sections: true },
    });

    if (!website) {
      return fail("Property website not found");
    }

    // If switching to section layout and no sections exist, initialize them
    if (!website.useSectionLayout && website.sections.length === 0) {
      const initResult = await initializePropertySections(propertyWebsiteId);
      if (!initResult.success) {
        return fail(initResult.error || "Failed to initialize sections");
      }
    }

    const updated = await prisma.propertyWebsite.update({
      where: { id: propertyWebsiteId },
      data: { useSectionLayout: !website.useSectionLayout },
    });

    revalidatePath(`/properties/${propertyWebsiteId}`);

    return { success: true, useSectionLayout: updated.useSectionLayout };
  } catch (error) {
    console.error("Error toggling layout mode:", error);
    return fail("Failed to toggle layout mode");
  }
}

// Refresh auto-fill data for all sections
export async function refreshPropertySectionAutoFill(
  propertyWebsiteId: string
): Promise<VoidActionResult> {
  try {
    const website = await prisma.propertyWebsite.findUnique({
      where: { id: propertyWebsiteId },
      include: {
        sections: true,
        project: {
          include: { organization: true },
        },
      },
    });

    if (!website) {
      return fail("Property website not found");
    }

    // Update each section with refreshed auto-fill data
    await Promise.all(
      website.sections.map(async (section) => {
        const autoFilledConfig = generateAutoFilledConfig(section.sectionType, {
          address: website.address,
          city: website.city,
          state: website.state,
          zipCode: website.zipCode,
          price: website.price,
          beds: website.beds,
          baths: website.baths,
          sqft: website.sqft,
          lotSize: website.lotSize,
          yearBuilt: website.yearBuilt,
          propertyType: website.propertyType,
          headline: website.headline,
          description: website.description,
          features: website.features,
          virtualTourUrl: website.virtualTourUrl,
          videoUrl: website.videoUrl,
          floorPlanUrls: website.floorPlanUrls,
          openHouseDate: website.openHouseDate,
          openHouseEndDate: website.openHouseEndDate,
          agentName: website.agentName || website.project.organization?.name,
          agentEmail: website.agentEmail || website.project.organization?.publicEmail,
          agentPhone: website.agentPhone || website.project.organization?.publicPhone,
          agentPhotoUrl: website.agentPhotoUrl,
          brokerageName: website.brokerageName,
          brokerageLogo: website.brokerageLogo,
        });

        // Merge with existing config (don't override user customizations)
        const currentConfig = section.config as Record<string, unknown>;
        const mergedConfig = { ...autoFilledConfig, ...currentConfig };

        await prisma.propertyWebsiteSection.update({
          where: { id: section.id },
          data: { config: mergedConfig as Prisma.InputJsonValue },
        });
      })
    );

    revalidatePath(`/properties/${propertyWebsiteId}`);

    return ok();
  } catch (error) {
    console.error("Error refreshing auto-fill data:", error);
    return fail("Failed to refresh auto-fill data");
  }
}

// ============================================================================
// PROPERTY WEBSITE VIEW TRACKING
// ============================================================================

// Track a property website view with detailed analytics
export async function trackPropertyView(data: {
  propertyWebsiteId: string;
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}): Promise<{ success: boolean; viewId?: string }> {
  try {
    // Create the view record
    const view = await prisma.propertyWebsiteView.create({
      data: {
        propertyWebsiteId: data.propertyWebsiteId,
        visitorId: data.visitorId,
        sessionId: data.sessionId,
        referrer: data.referrer,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        userAgent: data.userAgent,
        deviceType: data.deviceType,
        browser: data.browser,
        os: data.os,
      },
    });

    // Also increment the quick-access view count
    await prisma.propertyWebsite.update({
      where: { id: data.propertyWebsiteId },
      data: { viewCount: { increment: 1 } },
    });

    return { success: true, viewId: view.id };
  } catch (error) {
    console.error("Error tracking property view:", error);
    return { success: false };
  }
}

// Update view engagement data (scroll depth, time on page, actions)
export async function updatePropertyViewEngagement(
  viewId: string,
  data: {
    scrollDepth?: number;
    timeOnPage?: number;
    sectionsViewed?: string[];
    actionsPerformed?: string[];
  }
): Promise<VoidActionResult> {
  try {
    await prisma.propertyWebsiteView.update({
      where: { id: viewId },
      data: {
        scrollDepth: data.scrollDepth,
        timeOnPage: data.timeOnPage,
        sectionsViewed: data.sectionsViewed,
        actionsPerformed: data.actionsPerformed,
      },
    });

    return ok();
  } catch (error) {
    console.error("Error updating view engagement:", error);
    return fail("Failed to update engagement data");
  }
}

// Get detailed view analytics for a property website
export async function getPropertyViewAnalytics(
  propertyWebsiteId: string,
  days: number = 30
) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await prisma.propertyWebsiteView.findMany({
      where: {
        propertyWebsiteId,
        viewedAt: { gte: startDate },
      },
      orderBy: { viewedAt: "desc" },
    });

    // Aggregate by day
    const dailyViews: Record<string, number> = {};
    const uniqueVisitors = new Set<string>();
    const deviceBreakdown: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
    const referrerCounts: Record<string, number> = {};
    const avgScrollDepth: number[] = [];
    const avgTimeOnPage: number[] = [];

    views.forEach((view) => {
      const dateKey = view.viewedAt.toISOString().split("T")[0];
      dailyViews[dateKey] = (dailyViews[dateKey] || 0) + 1;

      if (view.visitorId) {
        uniqueVisitors.add(view.visitorId);
      }

      if (view.deviceType) {
        deviceBreakdown[view.deviceType] = (deviceBreakdown[view.deviceType] || 0) + 1;
      }

      if (view.referrer) {
        try {
          const url = new URL(view.referrer);
          const domain = url.hostname;
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
        } catch {
          referrerCounts["direct"] = (referrerCounts["direct"] || 0) + 1;
        }
      } else {
        referrerCounts["direct"] = (referrerCounts["direct"] || 0) + 1;
      }

      if (view.scrollDepth) {
        avgScrollDepth.push(view.scrollDepth);
      }

      if (view.timeOnPage) {
        avgTimeOnPage.push(view.timeOnPage);
      }
    });

    return {
      totalViews: views.length,
      uniqueVisitors: uniqueVisitors.size,
      dailyViews: Object.entries(dailyViews)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      deviceBreakdown,
      topReferrers: Object.entries(referrerCounts)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      avgScrollDepth:
        avgScrollDepth.length > 0
          ? Math.round(avgScrollDepth.reduce((a, b) => a + b, 0) / avgScrollDepth.length)
          : 0,
      avgTimeOnPage:
        avgTimeOnPage.length > 0
          ? Math.round(avgTimeOnPage.reduce((a, b) => a + b, 0) / avgTimeOnPage.length)
          : 0,
    };
  } catch (error) {
    console.error("Error fetching view analytics:", error);
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      dailyViews: [],
      deviceBreakdown: {},
      topReferrers: [],
      avgScrollDepth: 0,
      avgTimeOnPage: 0,
    };
  }
}

// ============================================================================
// ADVANCED PROPERTY WEBSITE SETTINGS
// ============================================================================

// Update advanced settings (password, custom domain, scheduling, etc.)
export async function updatePropertyWebsiteSettings(
  id: string,
  data: {
    customDomain?: string | null;
    isPasswordProtected?: boolean;
    password?: string | null;
    scheduledPublishAt?: Date | null;
    expiresAt?: Date | null;
    customCss?: string | null;
    fontHeading?: string | null;
    fontBody?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    socialImage?: string | null;
    enableSharing?: boolean;
    enableMortgageCalc?: boolean;
    enableScheduleTour?: boolean;
    enableFavorite?: boolean;
  },
  options?: {
    bypassPurchaseCheck?: boolean; // Set to true after payment is confirmed
  }
): Promise<VoidActionResult> {
  try {
    const existing = await prisma.propertyWebsite.findUnique({ where: { id } });
    if (!existing) {
      return fail("Property website not found");
    }

    // If custom domain is being set, check plan access
    if (data.customDomain && data.customDomain !== existing.customDomain) {
      const { checkPropertyDomainAccess } = await import("./plan-enforcement");
      const domainAccess = await checkPropertyDomainAccess(id);

      if (!domainAccess.success) {
        return fail(domainAccess.error);
      }

      // If purchase is required and not bypassed, return info about purchase
      if (domainAccess.data.requiresPurchase && !options?.bypassPurchaseCheck) {
        return fail(
          "PURCHASE_REQUIRED:Custom domains for property websites require a one-time purchase. " +
            "Click 'Purchase Domain' to continue."
        );
      }

      // Verify domain is unique
      const domainExists = await prisma.propertyWebsite.findUnique({
        where: { customDomain: data.customDomain },
      });
      if (domainExists) {
        return fail("Custom domain is already in use");
      }
    }

    await prisma.propertyWebsite.update({
      where: { id },
      data: {
        customDomain: data.customDomain,
        customDomainVerified: data.customDomain ? false : undefined, // Reset verification when domain changes
        isPasswordProtected: data.isPasswordProtected,
        password: data.password, // Should be hashed before calling this
        scheduledPublishAt: data.scheduledPublishAt,
        expiresAt: data.expiresAt,
        customCss: data.customCss,
        fontHeading: data.fontHeading,
        fontBody: data.fontBody,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        socialImage: data.socialImage,
        enableSharing: data.enableSharing,
        enableMortgageCalc: data.enableMortgageCalc,
        enableScheduleTour: data.enableScheduleTour,
        enableFavorite: data.enableFavorite,
      },
    });

    revalidatePath(`/properties/${id}`);
    revalidatePath(`/p/${existing.slug}`);

    return ok();
  } catch (error) {
    console.error("Error updating property website settings:", error);
    return fail("Failed to update settings");
  }
}

// Update agent info
export async function updatePropertyAgentInfo(
  id: string,
  data: {
    agentName?: string | null;
    agentEmail?: string | null;
    agentPhone?: string | null;
    agentPhotoUrl?: string | null;
    brokerageName?: string | null;
    brokerageLogo?: string | null;
  }
): Promise<VoidActionResult> {
  try {
    const existing = await prisma.propertyWebsite.findUnique({ where: { id } });
    if (!existing) {
      return fail("Property website not found");
    }

    await prisma.propertyWebsite.update({
      where: { id },
      data,
    });

    revalidatePath(`/properties/${id}`);
    revalidatePath(`/p/${existing.slug}`);

    return ok();
  } catch (error) {
    console.error("Error updating agent info:", error);
    return fail("Failed to update agent info");
  }
}
