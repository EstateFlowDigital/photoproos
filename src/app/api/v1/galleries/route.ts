/**
 * Public API - Galleries
 *
 * GET /api/v1/galleries - List all galleries
 * POST /api/v1/galleries - Create a new gallery
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withApiAuth,
  apiSuccess,
  apiError,
  API_ERRORS,
  parsePagination,
  paginatedResponse,
  type ApiContext,
} from "@/lib/api/middleware";

// ============================================================================
// GET /api/v1/galleries
// ============================================================================

async function getGalleries(request: NextRequest, context: ApiContext) {
  const { page, limit, offset } = parsePagination(request);
  const url = new URL(request.url);

  // Parse filters
  const status = url.searchParams.get("status");
  const clientId = url.searchParams.get("client_id");
  const search = url.searchParams.get("search");

  // Build where clause
  const where: Record<string, unknown> = {
    organizationId: context.organizationId,
  };

  if (status) {
    where.status = status;
  }

  if (clientId) {
    where.clientId = clientId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get total count
  const total = await prisma.project.count({ where });

  // Get galleries (projects)
  const galleries = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
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
    },
  });

  // Transform to API format
  const data = galleries.map((gallery) => ({
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
  }));

  return apiSuccess(paginatedResponse(data, total, { page, limit, offset }));
}

export const GET = withApiAuth(getGalleries, { requiredScope: "read" });

// ============================================================================
// POST /api/v1/galleries
// ============================================================================

async function createGallery(request: NextRequest, context: ApiContext) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return apiError(API_ERRORS.BAD_REQUEST, "Invalid JSON body");
  }

  // Validate required fields
  const name = body.name as string | undefined;
  if (!name || typeof name !== "string") {
    return apiError(API_ERRORS.BAD_REQUEST, "Missing required field: name");
  }

  // Generate slug from name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Ensure unique slug
  let slug = baseSlug;
  let counter = 1;
  while (
    await prisma.project.findFirst({
      where: { organizationId: context.organizationId, slug },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create gallery (project)
  const gallery = await prisma.project.create({
    data: {
      organizationId: context.organizationId,
      name,
      slug,
      address: (body.address as string) || null,
      clientId: (body.client_id as string) || null,
      status: "draft",
      photoCount: 0,
      viewCount: 0,
      downloadCount: 0,
      shareCount: 0,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      address: true,
      createdAt: true,
    },
  });

  return apiSuccess(
    {
      id: gallery.id,
      name: gallery.name,
      slug: gallery.slug,
      status: gallery.status,
      address: gallery.address,
      created_at: gallery.createdAt.toISOString(),
    },
    201
  );
}

export const POST = withApiAuth(createGallery, { requiredScope: "write" });
