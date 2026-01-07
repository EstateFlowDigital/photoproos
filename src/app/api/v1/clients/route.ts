/**
 * Public API - Clients
 *
 * GET /api/v1/clients - List all clients
 * POST /api/v1/clients - Create a new client
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
// GET /api/v1/clients
// ============================================================================

async function getClients(request: NextRequest, context: ApiContext) {
  const { page, limit, offset } = parsePagination(request);
  const url = new URL(request.url);

  // Parse filters
  const search = url.searchParams.get("search");
  const email = url.searchParams.get("email");

  // Build where clause
  const where: Record<string, unknown> = {
    organizationId: context.organizationId,
  };

  if (email) {
    where.email = email;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get total count
  const total = await prisma.client.count({ where });

  // Get clients
  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      company: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          projects: true,
          invoices: true,
        },
      },
    },
  });

  // Transform to API format
  const data = clients.map((client) => ({
    id: client.id,
    name: client.fullName,
    email: client.email,
    phone: client.phone,
    company: client.company,
    notes: client.notes,
    gallery_count: client._count.projects,
    invoice_count: client._count.invoices,
    created_at: client.createdAt.toISOString(),
    updated_at: client.updatedAt.toISOString(),
  }));

  return apiSuccess(paginatedResponse(data, total, { page, limit, offset }));
}

export const GET = withApiAuth(getClients, { requiredScope: "read" });

// ============================================================================
// POST /api/v1/clients
// ============================================================================

async function createClient(request: NextRequest, context: ApiContext) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return apiError(API_ERRORS.BAD_REQUEST, "Invalid JSON body");
  }

  // Validate required fields
  const email = body.email as string | undefined;
  if (!email || typeof email !== "string") {
    return apiError(API_ERRORS.BAD_REQUEST, "Missing required field: email");
  }

  // Check for existing client with same email
  const existing = await prisma.client.findFirst({
    where: {
      organizationId: context.organizationId,
      email,
    },
  });

  if (existing) {
    return apiError(API_ERRORS.BAD_REQUEST, "A client with this email already exists");
  }

  // Create client
  const client = await prisma.client.create({
    data: {
      organizationId: context.organizationId,
      email,
      fullName: (body.name as string) || null,
      phone: (body.phone as string) || null,
      company: (body.company as string) || null,
      notes: (body.notes as string) || null,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      company: true,
      createdAt: true,
    },
  });

  return apiSuccess(
    {
      id: client.id,
      name: client.fullName,
      email: client.email,
      phone: client.phone,
      company: client.company,
      created_at: client.createdAt.toISOString(),
    },
    201
  );
}

export const POST = withApiAuth(createClient, { requiredScope: "write" });
