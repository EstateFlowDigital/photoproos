"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import type { ClientIndustry } from "@prisma/client";
import { requireAdmin, requireAuth, requireOrganizationId } from "./auth-helper";
import type {
  AcquisitionStats,
  AcquisitionOverview,
} from "@/lib/constants/acquisition-sources";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

const CLIENT_SESSION_COOKIE = "client_session";
const IMPERSONATION_SESSION_HOURS = 2;

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
      return fail("A client with this email already exists");
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

    return success({ id: client.id });
  } catch (error) {
    console.error("Error creating client:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to create client");
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
      return fail("Client not found");
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
        return fail("A client with this email already exists");
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

    return success({ id: client.id });
  } catch (error) {
    console.error("Error updating client:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update client");
  }
}

/**
 * Create a client portal session for admin impersonation.
 */
export async function impersonateClientPortal(
  clientId: string
): Promise<ActionResult<{ portalUrl: string }>> {
  try {
    const auth = await requireAdmin();

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId: auth.organizationId,
      },
      select: { id: true },
    });

    if (!client) {
      return fail("Client not found");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + IMPERSONATION_SESSION_HOURS);

    await prisma.clientSession.create({
      data: {
        clientId: client.id,
        token,
        expiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(CLIENT_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return success({ portalUrl: "/portal" });
  } catch (error) {
    console.error("Error impersonating client portal:", error);
    return fail("Failed to start client portal session");
  }
}

/**
 * Update client email/communication preferences
 */
export interface UpdateClientPreferencesInput {
  clientId: string;
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  questionnaireEmailsOptIn?: boolean;
  marketingEmailsOptIn?: boolean;
}

export async function updateClientEmailPreferences(
  input: UpdateClientPreferencesInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    // Verify client exists and belongs to organization
    const existing = await prisma.client.findFirst({
      where: {
        id: input.clientId,
        organizationId,
      },
    });

    if (!existing) {
      return fail("Client not found");
    }

    const client = await prisma.client.update({
      where: { id: input.clientId },
      data: {
        ...(input.emailOptIn !== undefined && { emailOptIn: input.emailOptIn }),
        ...(input.smsOptIn !== undefined && { smsOptIn: input.smsOptIn }),
        ...(input.questionnaireEmailsOptIn !== undefined && {
          questionnaireEmailsOptIn: input.questionnaireEmailsOptIn,
        }),
        ...(input.marketingEmailsOptIn !== undefined && {
          marketingEmailsOptIn: input.marketingEmailsOptIn,
        }),
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${input.clientId}`);

    return success({ id: client.id });
  } catch (error) {
    console.error("Error updating client preferences:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update preferences");
  }
}

/**
 * Get client email preferences
 */
export async function getClientEmailPreferences(clientId: string) {
  try {
    const organizationId = await getOrganizationId();

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId,
      },
      select: {
        id: true,
        emailOptIn: true,
        smsOptIn: true,
        questionnaireEmailsOptIn: true,
        marketingEmailsOptIn: true,
      },
    });

    if (!client) {
      return null;
    }

    return client;
  } catch (error) {
    console.error("Error fetching client preferences:", error);
    return null;
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
      return fail("Client not found");
    }

    // Check if client has related data
    if (!force && (existing._count.projects > 0 || existing._count.bookings > 0)) {
      return fail("Cannot delete client with existing projects or bookings. Use force delete to proceed.",);
    }

    // Delete the client (will cascade to related records if configured)
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");

    return ok();
  } catch (error) {
    console.error("Error deleting client:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to delete client");
  }
}

// =============================================================================
// Client Acquisition Tracking
// =============================================================================

/**
 * Update client acquisition source
 */
export async function updateClientSource(
  clientId: string,
  source: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const organizationId = await getOrganizationId();

    await prisma.client.update({
      where: {
        id: clientId,
        organizationId,
      },
      data: {
        source,
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);

    return success({ id: clientId });
  } catch (error) {
    console.error("Error updating client source:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update client source");
  }
}

/**
 * Get acquisition analytics for the organization
 */
export async function getAcquisitionAnalytics(options?: {
  startDate?: Date;
  endDate?: Date;
}): Promise<ActionResult<AcquisitionOverview>> {
  try {
    const organizationId = await getOrganizationId();
    const { startDate, endDate } = options || {};

    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    // Get all clients with their revenue
    const clients = await prisma.client.findMany({
      where: {
        organizationId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      select: {
        id: true,
        source: true,
        lifetimeRevenueCents: true,
        totalProjects: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            projects: true,
          },
        },
      },
    });

    // Calculate totals
    const totalClients = clients.length;
    const totalRevenue = clients.reduce(
      (sum, c) => sum + c.lifetimeRevenueCents,
      0
    );

    // Group by source
    const sourceMap = new Map<
      string,
      {
        clients: typeof clients;
        revenue: number;
      }
    >();

    clients.forEach((client) => {
      const source = client.source || "UNKNOWN";
      const existing = sourceMap.get(source) || { clients: [], revenue: 0 };
      existing.clients.push(client);
      existing.revenue += client.lifetimeRevenueCents;
      sourceMap.set(source, existing);
    });

    // Calculate stats by source
    const bySource: AcquisitionStats[] = Array.from(sourceMap.entries()).map(
      ([source, data]) => {
        const clientCount = data.clients.length;
        const hasBookings = data.clients.filter(
          (c) => c._count.bookings > 0
        ).length;
        const hasMultipleProjects = data.clients.filter(
          (c) => c.totalProjects > 1
        ).length;

        return {
          source,
          clientCount,
          totalRevenue: data.revenue,
          averageRevenue: clientCount > 0 ? data.revenue / clientCount : 0,
          conversionRate: clientCount > 0 ? (hasBookings / clientCount) * 100 : 0,
          repeatRate:
            clientCount > 0 ? (hasMultipleProjects / clientCount) * 100 : 0,
        };
      }
    );

    // Sort by client count
    bySource.sort((a, b) => b.clientCount - a.clientCount);

    // Top sources
    const topSources = bySource.slice(0, 5).map((s) => ({
      source: s.source,
      count: s.clientCount,
    }));

    // Monthly trend (last 12 months)
    const monthlyTrend: { month: string; clients: number; revenue: number }[] =
      [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthClients = clients.filter(
        (c) => c.createdAt >= monthStart && c.createdAt <= monthEnd
      );

      monthlyTrend.push({
        month: monthStart.toISOString().slice(0, 7),
        clients: monthClients.length,
        revenue: monthClients.reduce(
          (sum, c) => sum + c.lifetimeRevenueCents,
          0
        ),
      });
    }

    // Conversion funnel
    const leads = clients.filter(
      (c) => c._count.bookings === 0 && c._count.projects === 0
    ).length;
    const contacted = clients.filter(
      (c) => c._count.bookings > 0 || c._count.projects > 0
    ).length;
    const booked = clients.filter((c) => c._count.bookings > 0).length;
    const completed = clients.filter((c) => c._count.projects > 0).length;
    const repeat = clients.filter((c) => c.totalProjects > 1).length;

    return success({
      totalClients,
      totalRevenue,
      bySource,
      topSources,
      monthlyTrend,
      conversionFunnel: {
        leads,
        contacted,
        booked,
        completed,
        repeat,
      },
    });
  } catch (error) {
    console.error("Error getting acquisition analytics:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get acquisition analytics");
  }
}

/**
 * Get clients by acquisition source
 */
export async function getClientsBySource(
  source: string,
  options?: { limit?: number; offset?: number }
): Promise<
  ActionResult<{
    clients: Array<{
      id: string;
      fullName: string | null;
      email: string;
      company: string | null;
      lifetimeRevenueCents: number;
      totalProjects: number;
      createdAt: Date;
    }>;
    total: number;
  }>
> {
  try {
    const organizationId = await getOrganizationId();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: {
          organizationId,
          source,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          company: true,
          lifetimeRevenueCents: true,
          totalProjects: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.client.count({
        where: {
          organizationId,
          source,
        },
      }),
    ]);

    return success({ clients, total });
  } catch (error) {
    console.error("Error getting clients by source:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get clients by source");
  }
}

/**
 * Get source performance comparison
 */
export async function getSourcePerformance(
  dateRange?: { startDate: Date; endDate: Date }
): Promise<
  ActionResult<{
    sources: Array<{
      source: string;
      newClients: number;
      totalRevenue: number;
      avgRevenuePerClient: number;
      projectsCompleted: number;
      clientRetention: number;
    }>;
  }>
> {
  try {
    const organizationId = await getOrganizationId();

    const dateFilter = dateRange
      ? {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }
      : {};

    // Get all clients grouped by source
    const clients = await prisma.client.groupBy({
      by: ["source"],
      where: {
        organizationId,
        ...dateFilter,
      },
      _count: {
        id: true,
      },
      _sum: {
        lifetimeRevenueCents: true,
        totalProjects: true,
      },
    });

    // Get repeat client counts by source
    const repeatClients = await prisma.client.groupBy({
      by: ["source"],
      where: {
        organizationId,
        totalProjects: { gt: 1 },
        ...dateFilter,
      },
      _count: {
        id: true,
      },
    });

    const repeatMap = new Map(
      repeatClients.map((r) => [r.source || "UNKNOWN", r._count.id])
    );

    const sources = clients.map((c) => {
      const source = c.source || "UNKNOWN";
      const newClients = c._count.id;
      const totalRevenue = c._sum.lifetimeRevenueCents || 0;
      const repeatCount = repeatMap.get(source) || 0;

      return {
        source,
        newClients,
        totalRevenue,
        avgRevenuePerClient: newClients > 0 ? totalRevenue / newClients : 0,
        projectsCompleted: c._sum.totalProjects || 0,
        clientRetention: newClients > 0 ? (repeatCount / newClients) * 100 : 0,
      };
    });

    // Sort by revenue
    sources.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return success({ sources });
  } catch (error) {
    console.error("Error getting source performance:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get source performance");
  }
}
