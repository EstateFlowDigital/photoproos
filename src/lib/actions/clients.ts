"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ClientIndustry } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

// Helper to log activity
async function logActivity(
  organizationId: string,
  type: "client_added",
  description: string,
  metadata?: {
    clientId?: string;
    userId?: string;
  }
) {
  try {
    await prisma.activityLog.create({
      data: {
        organizationId,
        type,
        description,
        clientId: metadata?.clientId,
        userId: metadata?.userId,
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't fail the main operation if activity logging fails
  }
}

// Input types
export interface CreateClientInput {
  email: string;
  fullName?: string;
  company?: string;
  phone?: string;
  address?: string;
  industry?: ClientIndustry;
  notes?: string;
}

export interface UpdateClientInput {
  id: string;
  email?: string;
  fullName?: string;
  company?: string;
  phone?: string;
  address?: string;
  industry?: ClientIndustry;
  notes?: string;
}

/**
 * Get a single client by ID with full details
 */
export async function getClient(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const client = await prisma.client.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        projects: {
          include: {
            _count: {
              select: { assets: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        bookings: {
          orderBy: { startTime: "desc" },
          take: 10,
        },
      },
    });

    if (!client) {
      return null;
    }

    // Get payments for this client
    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        project: {
          clientId: id,
        },
      },
      include: {
        project: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get activity logs for this client
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        organizationId,
        clientId: id,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return {
      ...client,
      payments,
      activityLogs,
    };
  } catch (error) {
    console.error("Error fetching client:", error);
    return null;
  }
}

/**
 * Get all clients for the organization
 */
export async function getClients(filters?: {
  search?: string;
  industry?: ClientIndustry;
}) {
  try {
    const organizationId = await getOrganizationId();

    const clients = await prisma.client.findMany({
      where: {
        organizationId,
        ...(filters?.industry && { industry: filters.industry }),
        ...(filters?.search && {
          OR: [
            { fullName: { contains: filters.search, mode: "insensitive" } },
            { company: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

/**
 * Create a new client
 */
export async function createClient(
  input: CreateClientInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Check if client with email already exists
    const existing = await prisma.client.findFirst({
      where: {
        organizationId,
        email: input.email,
      },
    });

    if (existing) {
      return { success: false, error: "A client with this email already exists" };
    }

    const client = await prisma.client.create({
      data: {
        organizationId,
        email: input.email,
        fullName: input.fullName,
        company: input.company,
        phone: input.phone,
        address: input.address,
        industry: input.industry || "other",
        notes: input.notes,
      },
    });

    // Log activity
    await logActivity(
      organizationId,
      "client_added",
      `Client "${input.fullName || input.email}" was created`,
      { clientId: client.id }
    );

    revalidatePath("/clients");
    revalidatePath("/dashboard");

    return { success: true, data: { id: client.id } };
  } catch (error) {
    console.error("Error creating client:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create client" };
  }
}

/**
 * Update an existing client
 */
export async function updateClient(
  input: UpdateClientInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify client exists and belongs to organization
    const existing = await prisma.client.findFirst({
      where: {
        id: input.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Client not found" };
    }

    // If changing email, check for duplicates
    if (input.email && input.email !== existing.email) {
      const duplicate = await prisma.client.findFirst({
        where: {
          organizationId,
          email: input.email,
          id: { not: input.id },
        },
      });

      if (duplicate) {
        return { success: false, error: "A client with this email already exists" };
      }
    }

    const { id, ...updateData } = input;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(updateData.email && { email: updateData.email }),
        ...(updateData.fullName !== undefined && { fullName: updateData.fullName }),
        ...(updateData.company !== undefined && { company: updateData.company }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.address !== undefined && { address: updateData.address }),
        ...(updateData.industry && { industry: updateData.industry }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    revalidatePath(`/clients/${id}/edit`);
    revalidatePath("/dashboard");

    return { success: true, data: { id: client.id } };
  } catch (error) {
    console.error("Error updating client:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update client" };
  }
}

/**
 * Delete a client
 */
export async function deleteClient(
  id: string,
  force: boolean = false
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify client exists and belongs to organization
    const existing = await prisma.client.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            projects: true,
            bookings: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Client not found" };
    }

    // Check if client has related data
    if (!force && (existing._count.projects > 0 || existing._count.bookings > 0)) {
      return {
        success: false,
        error: "Cannot delete client with existing projects or bookings. Use force delete to proceed.",
      };
    }

    // Delete the client (will cascade to related records if configured)
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting client:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete client" };
  }
}
