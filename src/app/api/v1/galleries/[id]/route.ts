/**
 * Public API - Single Gallery
 *
 * GET /api/v1/galleries/:id - Get gallery details
 * PATCH /api/v1/galleries/:id - Update a gallery
 * DELETE /api/v1/galleries/:id - Delete a gallery
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withApiAuth,
  apiSuccess,
  apiError,
  API_ERRORS,
  type ApiContext,
} from "@/lib/api/middleware";

// ============================================================================
// GET /api/v1/galleries/:id
// ============================================================================

async function getGallery(
  request: NextRequest,
  context: ApiContext,
  { params }: { params: { id: string } }
) {
  const gallery = await prisma.project.findFirst({
    where: {
      id: params.id,
      organizationId: context.organizationId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      coverImageUrl: true,
      priceCents: true,
      currency: true,
      viewCount: true,
      downloadCount: true,
      password: true,
      allowDownloads: true,
      allowFavorites: true,
      allowComments: true,
      showWatermark: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          company: true,
        },
      },
      _count: {
        select: {
          assets: true,
        },
      },
      deliveryLinks: {
        take: 1,
        select: {
          slug: true,
        },
      },
      assets: {
        orderBy: { sortOrder: "asc" },
        take: 100,
        select: {
          id: true,
          filename: true,
          originalUrl: true,
          thumbnailUrl: true,
          width: true,
          height: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!gallery) {
    return apiError(API_ERRORS.NOT_FOUND, "Gallery not found");
  }

  return apiSuccess({
    id: gallery.id,
    name: gallery.name,
    description: gallery.description,
    slug: gallery.deliveryLinks[0]?.slug || null,
    status: gallery.status,
    cover_image_url: gallery.coverImageUrl,
    photo_count: gallery._count.assets,
    price_cents: gallery.priceCents,
    currency: gallery.currency,
    view_count: gallery.viewCount,
    download_count: gallery.downloadCount,
    is_password_protected: !!gallery.password,
    allow_downloads: gallery.allowDownloads,
    allow_favorites: gallery.allowFavorites,
    allow_comments: gallery.allowComments,
    show_watermark: gallery.showWatermark,
    expires_at: gallery.expiresAt?.toISOString() || null,
    created_at: gallery.createdAt.toISOString(),
    updated_at: gallery.updatedAt.toISOString(),
    client: gallery.client
      ? {
          id: gallery.client.id,
          name: gallery.client.fullName,
          email: gallery.client.email,
          company: gallery.client.company,
        }
      : null,
    photos: gallery.assets.map((asset) => ({
      id: asset.id,
      filename: asset.filename,
      url: asset.originalUrl,
      thumbnail_url: asset.thumbnailUrl,
      width: asset.width,
      height: asset.height,
      position: asset.sortOrder,
    })),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const handler = withApiAuth(
    (req, ctx) => getGallery(req, ctx, { params: resolvedParams }),
    { requiredScope: "read" }
  );
  return handler(request);
}

// ============================================================================
// PATCH /api/v1/galleries/:id
// ============================================================================

async function updateGallery(
  request: NextRequest,
  context: ApiContext,
  { params }: { params: { id: string } }
) {
  // Verify gallery belongs to organization
  const existing = await prisma.project.findFirst({
    where: {
      id: params.id,
      organizationId: context.organizationId,
    },
  });

  if (!existing) {
    return apiError(API_ERRORS.NOT_FOUND, "Gallery not found");
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError(API_ERRORS.BAD_REQUEST, "Invalid JSON body");
  }

  // Build update data
  const updateData: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    updateData.name = body.name;
  }
  if (typeof body.description === "string") {
    updateData.description = body.description;
  }
  if (typeof body.status === "string") {
    const validStatuses = ["draft", "active", "delivered", "archived"];
    if (!validStatuses.includes(body.status)) {
      return apiError(
        API_ERRORS.BAD_REQUEST,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }
    updateData.status = body.status;
  }
  if (body.client_id !== undefined) {
    updateData.clientId = body.client_id || null;
  }
  if (body.expires_at !== undefined) {
    updateData.expiresAt = body.expires_at ? new Date(body.expires_at as string) : null;
  }
  if (typeof body.price_cents === "number") {
    updateData.priceCents = body.price_cents;
  }
  if (typeof body.allow_downloads === "boolean") {
    updateData.allowDownloads = body.allow_downloads;
  }
  if (typeof body.allow_favorites === "boolean") {
    updateData.allowFavorites = body.allow_favorites;
  }
  if (typeof body.allow_comments === "boolean") {
    updateData.allowComments = body.allow_comments;
  }
  if (typeof body.show_watermark === "boolean") {
    updateData.showWatermark = body.show_watermark;
  }

  const gallery = await prisma.project.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priceCents: true,
      currency: true,
      allowDownloads: true,
      updatedAt: true,
    },
  });

  return apiSuccess({
    id: gallery.id,
    name: gallery.name,
    description: gallery.description,
    status: gallery.status,
    price_cents: gallery.priceCents,
    currency: gallery.currency,
    allow_downloads: gallery.allowDownloads,
    updated_at: gallery.updatedAt.toISOString(),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const handler = withApiAuth(
    (req, ctx) => updateGallery(req, ctx, { params: resolvedParams }),
    { requiredScope: "write" }
  );
  return handler(request);
}

// ============================================================================
// DELETE /api/v1/galleries/:id
// ============================================================================

async function deleteGallery(
  request: NextRequest,
  context: ApiContext,
  { params }: { params: { id: string } }
) {
  // Verify gallery belongs to organization
  const existing = await prisma.project.findFirst({
    where: {
      id: params.id,
      organizationId: context.organizationId,
    },
  });

  if (!existing) {
    return apiError(API_ERRORS.NOT_FOUND, "Gallery not found");
  }

  await prisma.project.delete({
    where: { id: params.id },
  });

  return apiSuccess({ deleted: true, id: params.id });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const handler = withApiAuth(
    (req, ctx) => deleteGallery(req, ctx, { params: resolvedParams }),
    { requiredScope: "write" }
  );
  return handler(request);
}
