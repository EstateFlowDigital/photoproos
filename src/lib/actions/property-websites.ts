"use server";

import { ok, type VoidActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { PropertyWebsiteTemplate, PropertyType, LeadStatus } from "@prisma/client";
import { sendPropertyLeadEmail } from "@/lib/email/send";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/storage";

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
  metaTitle?: string | null;
  metaDescription?: string | null;
  // Template customization
  accentColor?: string | null;
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
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  accentColor: string | null;
  openHouseDate: Date | null;
  openHouseEndDate: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
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
      return { success: false, error: "Project not found" };
    }

    if (project.propertyWebsite) {
      return { success: false, error: "Property website already exists for this project" };
    }

    // Generate unique slug
    let slug = generateSlug(data.address);
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
    return { success: false, error: "Failed to create property website" };
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
      return { success: false, error: "Property website not found" };
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
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        accentColor: data.accentColor,
        openHouseDate: data.openHouseDate,
        openHouseEndDate: data.openHouseEndDate,
      },
    });

    revalidatePath("/properties");
    revalidatePath(`/properties/${id}`);
    revalidatePath(`/p/${existing.slug}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating property website:", error);
    return { success: false, error: "Failed to update property website" };
  }
}

// Publish/unpublish property website
export async function togglePropertyWebsitePublish(
  id: string
): Promise<{ success: boolean; isPublished?: boolean; error?: string }> {
  try {
    const existing = await prisma.propertyWebsite.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Property website not found" };
    }

    const updated = await prisma.propertyWebsite.update({
      where: { id },
      data: {
        isPublished: !existing.isPublished,
        publishedAt: !existing.isPublished ? new Date() : null,
      },
    });

    revalidatePath("/properties");
    revalidatePath(`/properties/${id}`);
    revalidatePath(`/p/${existing.slug}`);

    return { success: true, isPublished: updated.isPublished };
  } catch (error) {
    console.error("Error toggling publish:", error);
    return { success: false, error: "Failed to toggle publish status" };
  }
}

// Delete property website
export async function deletePropertyWebsite(
  id: string
): Promise<VoidActionResult> {
  try {
    const existing = await prisma.propertyWebsite.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Property website not found" };
    }

    await prisma.propertyWebsite.delete({ where: { id } });

    revalidatePath("/properties");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting property website:", error);
    return { success: false, error: "Failed to delete property website" };
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
      return { success: false, error: "Property website not found" };
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

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error submitting lead:", error);
    return { success: false, error: "Failed to submit inquiry" };
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

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return { success: false, error: "Failed to update lead status" };
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
      return { success: false, error: "Property website not found" };
    }

    // Generate unique slug for the copy
    let baseSlug = generateSlug(existing.address);
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
    return { success: false, error: "Failed to duplicate property website" };
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
