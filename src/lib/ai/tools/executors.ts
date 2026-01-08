/**
 * AI Tool Executors
 *
 * Execute the actual logic for each tool.
 */

import { prisma } from "@/lib/db";

interface ToolContext {
  organizationId: string;
  userId: string;
}

type ToolResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

// ============================================================================
// READ TOOLS
// ============================================================================

export async function executeListGalleries(
  ctx: ToolContext,
  params: { status?: string; limit?: number }
): Promise<ToolResult> {
  try {
    const where: Record<string, unknown> = {
      organizationId: ctx.organizationId,
    };
    if (params.status) {
      where.status = params.status;
    }

    const galleries = await prisma.gallery.findMany({
      where,
      take: params.limit || 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        deliveredAt: true,
        viewCount: true,
        _count: {
          select: { assets: true },
        },
      },
    });

    return {
      success: true,
      data: galleries.map((g) => ({
        id: g.id,
        name: g.name,
        status: g.status,
        createdAt: g.createdAt,
        deliveredAt: g.deliveredAt,
        viewCount: g.viewCount,
        photoCount: g._count.assets,
      })),
    };
  } catch (error) {
    return { success: false, error: "Failed to list galleries" };
  }
}

export async function executeListClients(
  ctx: ToolContext,
  params: { limit?: number; search?: string }
): Promise<ToolResult> {
  try {
    const where: Record<string, unknown> = {
      organizationId: ctx.organizationId,
    };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      take: params.limit || 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        createdAt: true,
        _count: {
          select: { galleries: true, bookings: true },
        },
      },
    });

    return {
      success: true,
      data: clients.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        createdAt: c.createdAt,
        galleryCount: c._count.galleries,
        bookingCount: c._count.bookings,
      })),
    };
  } catch (error) {
    return { success: false, error: "Failed to list clients" };
  }
}

export async function executeGetRevenueSummary(
  ctx: ToolContext,
  params: { period?: string }
): Promise<ToolResult> {
  try {
    const now = new Date();
    let startDate: Date;

    switch (params.period) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const result = await prisma.payment.aggregate({
      where: {
        organizationId: ctx.organizationId,
        status: "succeeded",
        createdAt: { gte: startDate },
      },
      _sum: { amountCents: true },
      _count: true,
    });

    return {
      success: true,
      data: {
        totalRevenue: (result._sum.amountCents || 0) / 100,
        transactionCount: result._count,
        period: params.period || "all",
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to get revenue summary" };
  }
}

export async function executeListUpcomingBookings(
  ctx: ToolContext,
  params: { days?: number }
): Promise<ToolResult> {
  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (params.days || 30));

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId: ctx.organizationId,
        startDateTime: {
          gte: new Date(),
          lte: endDate,
        },
      },
      orderBy: { startDateTime: "asc" },
      select: {
        id: true,
        startDateTime: true,
        endDateTime: true,
        status: true,
        notes: true,
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: bookings.map((b) => ({
        id: b.id,
        startDateTime: b.startDateTime,
        endDateTime: b.endDateTime,
        status: b.status,
        notes: b.notes,
        clientName: b.client?.name,
        clientEmail: b.client?.email,
      })),
    };
  } catch (error) {
    return { success: false, error: "Failed to list bookings" };
  }
}

export async function executeListPendingInvoices(
  ctx: ToolContext,
  params: { limit?: number }
): Promise<ToolResult> {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: ctx.organizationId,
        status: { in: ["draft", "sent", "overdue"] },
      },
      take: params.limit || 20,
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        totalCents: true,
        dueDate: true,
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        total: (inv.totalCents || 0) / 100,
        dueDate: inv.dueDate,
        clientName: inv.client?.name,
        clientEmail: inv.client?.email,
      })),
    };
  } catch (error) {
    return { success: false, error: "Failed to list invoices" };
  }
}

export async function executeGetExpenseSummary(
  ctx: ToolContext,
  params: { year?: number }
): Promise<ToolResult> {
  try {
    const year = params.year || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const expenses = await prisma.expense.groupBy({
      by: ["category"],
      where: {
        organizationId: ctx.organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amountCents: true },
      _count: true,
    });

    const total = expenses.reduce(
      (sum, e) => sum + (e._sum.amountCents || 0),
      0
    );

    return {
      success: true,
      data: {
        year,
        totalExpenses: total / 100,
        byCategory: expenses.map((e) => ({
          category: e.category,
          total: (e._sum.amountCents || 0) / 100,
          count: e._count,
        })),
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to get expense summary" };
  }
}

export async function executeSearchEverything(
  ctx: ToolContext,
  params: { query: string; type?: string }
): Promise<ToolResult> {
  try {
    const results: Record<string, unknown[]> = {};
    const searchTerm = params.query.toLowerCase();

    if (!params.type || params.type === "all" || params.type === "gallery") {
      const galleries = await prisma.gallery.findMany({
        where: {
          organizationId: ctx.organizationId,
          name: { contains: searchTerm, mode: "insensitive" },
        },
        take: 10,
        select: { id: true, name: true, status: true },
      });
      results.galleries = galleries;
    }

    if (!params.type || params.type === "all" || params.type === "client") {
      const clients = await prisma.client.findMany({
        where: {
          organizationId: ctx.organizationId,
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: { id: true, name: true, email: true },
      });
      results.clients = clients;
    }

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: "Search failed" };
  }
}

export async function executeGetGalleryDetails(
  ctx: ToolContext,
  params: { galleryId: string }
): Promise<ToolResult> {
  try {
    const gallery = await prisma.gallery.findFirst({
      where: {
        id: params.galleryId,
        organizationId: ctx.organizationId,
      },
      include: {
        client: {
          select: { name: true, email: true },
        },
        _count: {
          select: { assets: true, favorites: true },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    return {
      success: true,
      data: {
        id: gallery.id,
        name: gallery.name,
        description: gallery.description,
        status: gallery.status,
        viewCount: gallery.viewCount,
        createdAt: gallery.createdAt,
        deliveredAt: gallery.deliveredAt,
        clientName: gallery.client?.name,
        clientEmail: gallery.client?.email,
        photoCount: gallery._count.assets,
        favoriteCount: gallery._count.favorites,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to get gallery details" };
  }
}

export async function executeGetClientDetails(
  ctx: ToolContext,
  params: { clientId: string }
): Promise<ToolResult> {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: params.clientId,
        organizationId: ctx.organizationId,
      },
      include: {
        _count: {
          select: { galleries: true, bookings: true, invoices: true },
        },
      },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // Get total spent
    const totalSpent = await prisma.payment.aggregate({
      where: {
        organizationId: ctx.organizationId,
        clientId: client.id,
        status: "succeeded",
      },
      _sum: { amountCents: true },
    });

    return {
      success: true,
      data: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        createdAt: client.createdAt,
        galleryCount: client._count.galleries,
        bookingCount: client._count.bookings,
        invoiceCount: client._count.invoices,
        totalSpent: (totalSpent._sum.amountCents || 0) / 100,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to get client details" };
  }
}

// ============================================================================
// ANALYSIS TOOLS
// ============================================================================

export async function executeAnalyzeClientValue(
  ctx: ToolContext,
  params: { clientId: string }
): Promise<ToolResult> {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: params.clientId,
        organizationId: ctx.organizationId,
      },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // Get all payments
    const payments = await prisma.payment.findMany({
      where: {
        clientId: params.clientId,
        status: "succeeded",
      },
      orderBy: { createdAt: "asc" },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amountCents || 0), 0);
    const avgTransaction = payments.length > 0 ? totalRevenue / payments.length : 0;
    const firstPurchase = payments[0]?.createdAt;
    const lastPurchase = payments[payments.length - 1]?.createdAt;

    // Get gallery count
    const galleryCount = await prisma.gallery.count({
      where: { clientId: params.clientId },
    });

    // Determine value tier
    let valueTier = "New";
    if (totalRevenue >= 500000) valueTier = "VIP";
    else if (totalRevenue >= 200000) valueTier = "High Value";
    else if (totalRevenue >= 50000) valueTier = "Regular";
    else if (payments.length > 0) valueTier = "Starter";

    return {
      success: true,
      data: {
        clientName: client.name,
        totalRevenue: totalRevenue / 100,
        transactionCount: payments.length,
        averageTransaction: avgTransaction / 100,
        galleryCount,
        firstPurchase,
        lastPurchase,
        valueTier,
        recommendation:
          valueTier === "VIP"
            ? "This is a VIP client. Consider offering exclusive perks or early access to new services."
            : valueTier === "High Value"
              ? "Great client! Consider reaching out with special offers to maintain the relationship."
              : "Consider ways to increase engagement with this client.",
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to analyze client" };
  }
}

export async function executeForecastRevenue(
  ctx: ToolContext,
  params: { months?: number }
): Promise<ToolResult> {
  try {
    const months = params.months || 3;

    // Get historical data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const historicalPayments = await prisma.payment.groupBy({
      by: ["createdAt"],
      where: {
        organizationId: ctx.organizationId,
        status: "succeeded",
        createdAt: { gte: sixMonthsAgo },
      },
      _sum: { amountCents: true },
    });

    // Get upcoming bookings for forecast
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);

    const upcomingBookings = await prisma.booking.count({
      where: {
        organizationId: ctx.organizationId,
        startDateTime: {
          gte: new Date(),
          lte: futureDate,
        },
        status: { not: "cancelled" },
      },
    });

    // Simple forecast calculation
    const totalHistorical = historicalPayments.reduce(
      (sum, p) => sum + (p._sum.amountCents || 0),
      0
    );
    const avgMonthlyRevenue = totalHistorical / 6 / 100;
    const forecastedRevenue = avgMonthlyRevenue * months;

    return {
      success: true,
      data: {
        forecastPeriodMonths: months,
        averageMonthlyRevenue: avgMonthlyRevenue,
        forecastedRevenue,
        upcomingBookings,
        confidence: historicalPayments.length > 10 ? "High" : "Low",
        note:
          historicalPayments.length < 10
            ? "Limited historical data. Forecast may be less accurate."
            : "Based on 6 months of historical data.",
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to generate forecast" };
  }
}

// ============================================================================
// MAIN EXECUTOR
// ============================================================================

export async function executeTool(
  toolName: string,
  params: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  switch (toolName) {
    // Read tools
    case "list_galleries":
      return executeListGalleries(ctx, params as { status?: string; limit?: number });
    case "list_clients":
      return executeListClients(ctx, params as { limit?: number; search?: string });
    case "get_revenue_summary":
      return executeGetRevenueSummary(ctx, params as { period?: string });
    case "list_upcoming_bookings":
      return executeListUpcomingBookings(ctx, params as { days?: number });
    case "list_pending_invoices":
      return executeListPendingInvoices(ctx, params as { limit?: number });
    case "get_expense_summary":
      return executeGetExpenseSummary(ctx, params as { year?: number });
    case "search_everything":
      return executeSearchEverything(ctx, params as { query: string; type?: string });
    case "get_gallery_details":
      return executeGetGalleryDetails(ctx, params as { galleryId: string });
    case "get_client_details":
      return executeGetClientDetails(ctx, params as { clientId: string });

    // Analysis tools
    case "analyze_client_value":
      return executeAnalyzeClientValue(ctx, params as { clientId: string });
    case "forecast_revenue":
      return executeForecastRevenue(ctx, params as { months?: number });

    // Create/Update tools require confirmation - return pending status
    case "create_gallery":
    case "create_client":
    case "create_booking":
    case "create_invoice":
    case "deliver_gallery":
    case "update_gallery":
    case "update_settings":
      return {
        success: true,
        data: {
          requiresConfirmation: true,
          action: toolName,
          params,
        },
      };

    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}
