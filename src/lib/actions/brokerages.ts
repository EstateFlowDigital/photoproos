"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";

// ============================================================================
// Types
// ============================================================================

export interface BrokerageWithRelations {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  totalRevenueCents: number;
  activeAgentCount: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    agents: number;
    contracts: number;
    orderPages: number;
  };
}

export interface CreateBrokerageInput {
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface UpdateBrokerageInput extends Partial<CreateBrokerageInput> {
  id: string;
  isActive?: boolean;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all brokerages for the current organization
 */
export async function getBrokerages(options?: {
  includeInactive?: boolean;
  search?: string;
}): Promise<ActionResult<BrokerageWithRelations[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const brokerages = await prisma.brokerage.findMany({
      where: {
        organizationId,
        ...(options?.includeInactive ? {} : { isActive: true }),
        ...(options?.search
          ? {
              OR: [
                { name: { contains: options.search, mode: "insensitive" } },
                { email: { contains: options.search, mode: "insensitive" } },
                { contactName: { contains: options.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            agents: true,
            contracts: true,
            orderPages: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: brokerages };
  } catch (error) {
    console.error("[Brokerages] Error fetching brokerages:", error);
    return { success: false, error: "Failed to fetch brokerages" };
  }
}

/**
 * Get a single brokerage by ID
 */
export async function getBrokerage(
  id: string
): Promise<ActionResult<BrokerageWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    const brokerage = await prisma.brokerage.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: {
            agents: true,
            contracts: true,
            orderPages: true,
          },
        },
      },
    });

    if (!brokerage) {
      return { success: false, error: "Brokerage not found" };
    }

    return { success: true, data: brokerage };
  } catch (error) {
    console.error("[Brokerages] Error fetching brokerage:", error);
    return { success: false, error: "Failed to fetch brokerage" };
  }
}

/**
 * Get a brokerage by slug
 */
export async function getBrokerageBySlug(
  slug: string
): Promise<ActionResult<BrokerageWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    const brokerage = await prisma.brokerage.findFirst({
      where: { slug, organizationId },
      include: {
        _count: {
          select: {
            agents: true,
            contracts: true,
            orderPages: true,
          },
        },
      },
    });

    if (!brokerage) {
      return { success: false, error: "Brokerage not found" };
    }

    return { success: true, data: brokerage };
  } catch (error) {
    console.error("[Brokerages] Error fetching brokerage:", error);
    return { success: false, error: "Failed to fetch brokerage" };
  }
}

/**
 * Get agents (clients) for a brokerage
 */
export async function getBrokerageAgents(brokerageId: string): Promise<
  ActionResult<
    Array<{
      id: string;
      fullName: string | null;
      email: string;
      phone: string | null;
      company: string | null;
      lifetimeRevenueCents: number;
      totalProjects: number;
    }>
  >
> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify brokerage belongs to organization
    const brokerage = await prisma.brokerage.findFirst({
      where: { id: brokerageId, organizationId },
    });

    if (!brokerage) {
      return { success: false, error: "Brokerage not found" };
    }

    const agents = await prisma.client.findMany({
      where: { brokerageId, organizationId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        company: true,
        lifetimeRevenueCents: true,
        totalProjects: true,
      },
      orderBy: { fullName: "asc" },
    });

    return { success: true, data: agents };
  } catch (error) {
    console.error("[Brokerages] Error fetching agents:", error);
    return { success: false, error: "Failed to fetch agents" };
  }
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create a new brokerage
 */
export async function createBrokerage(
  input: CreateBrokerageInput
): Promise<ActionResult<BrokerageWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    // Validate slug uniqueness
    const existing = await prisma.brokerage.findFirst({
      where: { organizationId, slug: input.slug },
    });

    if (existing) {
      return { success: false, error: "A brokerage with this slug already exists" };
    }

    const brokerage = await prisma.brokerage.create({
      data: {
        organizationId,
        name: input.name,
        slug: input.slug,
        email: input.email || null,
        phone: input.phone || null,
        website: input.website || null,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        zipCode: input.zipCode || null,
        logoUrl: input.logoUrl || null,
        primaryColor: input.primaryColor || null,
        contactName: input.contactName || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
      },
      include: {
        _count: {
          select: {
            agents: true,
            contracts: true,
            orderPages: true,
          },
        },
      },
    });

    revalidatePath("/brokerages");
    return { success: true, data: brokerage };
  } catch (error) {
    console.error("[Brokerages] Error creating brokerage:", error);
    return { success: false, error: "Failed to create brokerage" };
  }
}

/**
 * Update an existing brokerage
 */
export async function updateBrokerage(
  input: UpdateBrokerageInput
): Promise<ActionResult<BrokerageWithRelations>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify brokerage exists and belongs to organization
    const existing = await prisma.brokerage.findFirst({
      where: { id: input.id, organizationId },
    });

    if (!existing) {
      return { success: false, error: "Brokerage not found" };
    }

    // Check slug uniqueness if being changed
    if (input.slug && input.slug !== existing.slug) {
      const slugExists = await prisma.brokerage.findFirst({
        where: { organizationId, slug: input.slug, id: { not: input.id } },
      });

      if (slugExists) {
        return { success: false, error: "A brokerage with this slug already exists" };
      }
    }

    const brokerage = await prisma.brokerage.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.website !== undefined && { website: input.website }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.state !== undefined && { state: input.state }),
        ...(input.zipCode !== undefined && { zipCode: input.zipCode }),
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor }),
        ...(input.contactName !== undefined && { contactName: input.contactName }),
        ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail }),
        ...(input.contactPhone !== undefined && { contactPhone: input.contactPhone }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: {
          select: {
            agents: true,
            contracts: true,
            orderPages: true,
          },
        },
      },
    });

    revalidatePath("/brokerages");
    revalidatePath(`/brokerages/${input.id}`);
    return { success: true, data: brokerage };
  } catch (error) {
    console.error("[Brokerages] Error updating brokerage:", error);
    return { success: false, error: "Failed to update brokerage" };
  }
}

/**
 * Delete a brokerage
 */
export async function deleteBrokerage(id: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify brokerage exists and belongs to organization
    const brokerage = await prisma.brokerage.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { agents: true },
        },
      },
    });

    if (!brokerage) {
      return { success: false, error: "Brokerage not found" };
    }

    // Check if brokerage has agents
    if (brokerage._count.agents > 0) {
      return {
        success: false,
        error: "Cannot delete brokerage with active agents. Remove or reassign agents first.",
      };
    }

    await prisma.brokerage.delete({
      where: { id },
    });

    revalidatePath("/brokerages");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Brokerages] Error deleting brokerage:", error);
    return { success: false, error: "Failed to delete brokerage" };
  }
}

/**
 * Assign a client (agent) to a brokerage
 */
export async function assignAgentToBrokerage(
  clientId: string,
  brokerageId: string | null
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // If assigning to a brokerage, verify it exists
    if (brokerageId) {
      const brokerage = await prisma.brokerage.findFirst({
        where: { id: brokerageId, organizationId },
      });

      if (!brokerage) {
        return { success: false, error: "Brokerage not found" };
      }
    }

    // Update client
    await prisma.client.update({
      where: { id: clientId },
      data: { brokerageId },
    });

    // Update agent counts
    if (client.brokerageId) {
      await updateBrokerageAgentCount(client.brokerageId);
    }
    if (brokerageId) {
      await updateBrokerageAgentCount(brokerageId);
    }

    revalidatePath("/brokerages");
    revalidatePath("/clients");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Brokerages] Error assigning agent:", error);
    return { success: false, error: "Failed to assign agent to brokerage" };
  }
}

/**
 * Helper to update brokerage agent count
 */
async function updateBrokerageAgentCount(brokerageId: string): Promise<void> {
  const count = await prisma.client.count({
    where: { brokerageId },
  });

  await prisma.brokerage.update({
    where: { id: brokerageId },
    data: { activeAgentCount: count },
  });
}

// ============================================================================
// Stats
// ============================================================================

/**
 * Get brokerage statistics
 */
export async function getBrokerageStats(): Promise<
  ActionResult<{
    totalBrokerages: number;
    activeBrokerages: number;
    totalAgents: number;
    totalRevenue: number;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const [totalBrokerages, activeBrokerages, agentCount, revenueSum] = await Promise.all([
      prisma.brokerage.count({ where: { organizationId } }),
      prisma.brokerage.count({ where: { organizationId, isActive: true } }),
      prisma.client.count({ where: { organizationId, brokerageId: { not: null } } }),
      prisma.brokerage.aggregate({
        where: { organizationId },
        _sum: { totalRevenueCents: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalBrokerages,
        activeBrokerages,
        totalAgents: agentCount,
        totalRevenue: revenueSum._sum.totalRevenueCents || 0,
      },
    };
  } catch (error) {
    console.error("[Brokerages] Error fetching stats:", error);
    return {
      success: false,
      error: "Failed to fetch brokerage statistics",
    };
  }
}
