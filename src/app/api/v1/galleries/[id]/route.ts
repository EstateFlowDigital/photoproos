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
      slug: true,
      status: true,
      address: true,
      coverImageUrl: true,
      photoCount: true,
      viewCount: true,
      downloadCount: true,
      shareCount: true,
      isPasswordProtected: true,
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
      photos: {
        orderBy: { position: "asc" },
        take: 100,
        select: {
          id: true,
          filename: true,
          originalUrl: true,
          thumbnailUrl: true,
          width: true,
          height: true,
          position: true,
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
    slug: gallery.slug,
    status: gallery.status,
    address: gallery.address,
    cover_image_url: gallery.coverImageUrl,
    photo_count: gallery.photoCount,
    view_count: gallery.viewCount,
    download_count: gallery.downloadCount,
    share_count: gallery.shareCount,
    is_password_protected: gallery.isPasswordProtected,
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
    photos: gallery.photos.map((photo) => ({
      id: photo.id,
      filename: photo.filename,
      url: photo.originalUrl,
      thumbnail_url: photo.thumbnailUrl,
      width: photo.width,
      height: photo.height,
      position: photo.position,
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
  if (typeof body.address === "string") {
    updateData.address = body.address;
  }
  if (typeof body.status === "string") {
    const validStatuses = ["draft", "published", "archived"];
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

  const gallery = await prisma.project.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      address: true,
      updatedAt: true,
    },
  });

  return apiSuccess({
    id: gallery.id,
    name: gallery.name,
    slug: gallery.slug,
    status: gallery.status,
    address: gallery.address,
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
