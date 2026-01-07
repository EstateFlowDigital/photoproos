"use server";

import { prisma } from "@/lib/db";
import { getClientSession } from "./client-auth";
import {
  extractKeyFromUrl,
  generatePresignedDownloadUrl,
} from "@/lib/storage";

/**
 * Get all data for the client portal dashboard
 */
export async function getClientPortalData() {
  const session = await getClientSession();

  if (!session) {
    return null;
  }

  const clientId = session.clientId;

  // Fetch all data in parallel
  const [client, properties, galleries, invoices, questionnaires, leads] = await Promise.all([
    // Get client details
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        phone: true,
        preferences: true,
      },
    }),

    // Get property websites for this client's projects
    prisma.propertyWebsite.findMany({
      where: {
        project: {
          clientId: clientId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            assets: {
              take: 1,
              select: {
                thumbnailUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            leads: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Get galleries (projects) for this client
    prisma.project.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        assets: {
          select: {
            id: true,
            originalUrl: true,
            thumbnailUrl: true,
            filename: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Get invoices for this client
    prisma.invoice.findMany({
      where: {
        clientId: clientId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Get questionnaires assigned to this client
    prisma.clientQuestionnaire.findMany({
      where: {
        clientId: clientId,
        status: { in: ["pending", "in_progress", "completed", "approved"] },
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            industry: true,
          },
        },
        booking: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    }),

    // Get leads for this client's properties
    prisma.propertyLead.findMany({
      where: {
        propertyWebsite: {
          project: {
            clientId: clientId,
          },
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
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  if (!client) {
    return null;
  }

  // Calculate aggregate stats
  const totalProperties = properties.length;
  const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);
  const totalLeads = properties.reduce((sum, p) => sum + p._count.leads, 0);
  const totalPhotos = galleries.reduce((sum, g) => sum + g.assets.length, 0);

  // Transform data for the portal
  const transformedProperties = properties.map((property) => ({
    id: property.id,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    price: property.price ? Number(property.price) : null,
    beds: property.beds,
    baths: property.baths,
    sqft: property.sqft,
    lotSize: property.lotSize,
    yearBuilt: property.yearBuilt,
    status: property.isPublished ? "published" : "draft",
    template: property.template,
    viewCount: property.viewCount,
    leadCount: property._count.leads,
    photoCount: property.project.assets.length,
    slug: property.slug,
    createdAt: property.createdAt,
    thumbnailUrl: property.project.assets[0]?.thumbnailUrl || null,
  }));

  const transformedGalleries = galleries.map((gallery) => ({
    id: gallery.id,
    name: gallery.name,
    photoCount: gallery.assets.length,
    status: gallery.status,
    downloadable: gallery.status === "delivered" && gallery.allowDownloads,
    deliveredAt: gallery.deliveredAt,
    expiresAt: gallery.expiresAt,
    serviceName: gallery.service?.name || null,
    photos: gallery.assets.slice(0, 4).map((asset) => ({
      id: asset.id,
      url: asset.originalUrl,
      thumbnailUrl: asset.thumbnailUrl,
      filename: asset.filename,
    })),
  }));

  const transformedInvoices = invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.totalCents,
    status: invoice.status,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    createdAt: invoice.createdAt,
  }));

  const transformedQuestionnaires = questionnaires.map((q) => ({
    id: q.id,
    templateId: q.templateId,
    templateName: q.template.name,
    templateDescription: q.template.description,
    industry: q.template.industry,
    status: q.status,
    isRequired: q.isRequired,
    dueDate: q.dueDate,
    startedAt: q.startedAt,
    completedAt: q.completedAt,
    createdAt: q.createdAt,
    bookingTitle: q.booking?.title || null,
    bookingDate: q.booking?.startTime || null,
    responseCount: q._count.responses,
  }));

  const transformedLeads = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    status: lead.status as "new" | "contacted" | "qualified" | "closed",
    temperature: lead.temperature as "hot" | "warm" | "cold",
    score: lead.score,
    propertyAddress: lead.propertyWebsite.address,
    propertyId: lead.propertyWebsite.id,
    pageViews: lead.pageViews,
    photoViews: lead.photoViews,
    tourClicks: lead.tourClicks,
    totalTimeSeconds: lead.totalTimeSeconds,
    createdAt: lead.createdAt,
    lastActivityAt: lead.lastActivityAt,
  }));

  // Count pending questionnaires for the badge
  const pendingQuestionnaires = questionnaires.filter(
    (q) => q.status === "pending" || q.status === "in_progress"
  ).length;

  // Count new leads for the badge
  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  return {
    client,
    stats: {
      totalProperties,
      totalViews,
      totalLeads,
      totalPhotos,
      pendingQuestionnaires,
      newLeads: newLeadsCount,
    },
    properties: transformedProperties,
    galleries: transformedGalleries,
    invoices: transformedInvoices,
    questionnaires: transformedQuestionnaires,
    leads: transformedLeads,
  };
}

/**
 * Get property website details for client portal
 */
export async function getClientPropertyDetails(propertyId: string) {
  const session = await getClientSession();

  if (!session) {
    return null;
  }

  const property = await prisma.propertyWebsite.findFirst({
    where: {
      id: propertyId,
      project: {
        clientId: session.clientId,
      },
    },
    include: {
      project: {
        include: {
          assets: {
            select: {
              id: true,
              originalUrl: true,
              thumbnailUrl: true,
              filename: true,
              sizeBytes: true,
            },
          },
        },
      },
      leads: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      marketingAssets: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!property) {
    return null;
  }

  return {
    ...property,
    project: {
      ...property.project,
      assets: property.project.assets,
    },
  };
}

/**
 * Get gallery download information for client
 */
export async function getClientGalleryDownload(galleryId: string) {
  const session = await getClientSession();

  if (!session) {
    return null;
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
    return null;
  }

  const assetsWithSignedUrls = await Promise.all(
    gallery.assets.map(async (asset) => {
      const key = extractKeyFromUrl(asset.originalUrl);

      if (!key) {
        return asset;
      }

      try {
        const signedUrl = await generatePresignedDownloadUrl(key, 900); // 15 minutes
        return {
          ...asset,
          originalUrl: signedUrl,
        };
      } catch (error) {
        console.error("[ClientPortal] Failed to sign download URL", {
          assetId: asset.id,
          error,
        });
        return asset;
      }
    })
  );

  return {
    id: gallery.id,
    name: gallery.name,
    assets: assetsWithSignedUrls,
    totalSize: assetsWithSignedUrls.reduce((sum, a) => sum + (a.sizeBytes || 0), 0),
  };
}
