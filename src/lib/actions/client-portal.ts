"use server";

import { prisma } from "@/lib/db";
import { getClientSession } from "./client-auth";

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
  const [client, properties, galleries, invoices] = await Promise.all([
    // Get client details
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        phone: true,
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

  return {
    client,
    stats: {
      totalProperties,
      totalViews,
      totalLeads,
      totalPhotos,
    },
    properties: transformedProperties,
    galleries: transformedGalleries,
    invoices: transformedInvoices,
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

  return {
    id: gallery.id,
    name: gallery.name,
    assets: gallery.assets,
    totalSize: gallery.assets.reduce((sum, a) => sum + (a.sizeBytes || 0), 0),
  };
}
