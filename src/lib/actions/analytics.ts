"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  format,
  differenceInMonths,
} from "date-fns";

// =============================================================================
// Helper Functions
// =============================================================================

async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await prisma.organization.findFirst({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  return org?.id || null;
}

// =============================================================================
// Revenue Forecasting
// =============================================================================

/**
 * Get revenue forecast based on pending invoices and payment patterns
 */
export async function getRevenueForecast() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const now = new Date();

    // Get pending invoices
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["sent", "overdue"] },
      },
      select: {
        id: true,
        totalCents: true,
        dueDate: true,
        status: true,
      },
    });

    // Get historical payment rate (% of invoices paid)
    const [totalInvoices, paidInvoices] = await Promise.all([
      prisma.invoice.count({
        where: {
          organizationId,
          createdAt: { gte: subMonths(now, 12) },
        },
      }),
      prisma.invoice.count({
        where: {
          organizationId,
          status: "paid",
          createdAt: { gte: subMonths(now, 12) },
        },
      }),
    ]);

    const paymentRate = totalInvoices > 0 ? paidInvoices / totalInvoices : 0.85;

    // Calculate expected revenue from pending invoices
    const expectedFromPending = pendingInvoices.reduce((sum, inv) => {
      // Adjust expectation based on overdue status
      const adjustedRate = inv.status === "overdue" ? paymentRate * 0.7 : paymentRate;
      return sum + Math.round(inv.totalCents * adjustedRate);
    }, 0);

    // Get monthly revenue trend (last 6 months)
    const monthlyRevenue: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const revenue = await prisma.payment.aggregate({
        where: {
          organizationId,
          status: "paid",
          paidAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { amountCents: true },
      });

      monthlyRevenue.push({
        month: format(monthStart, "MMM yyyy"),
        revenue: revenue._sum.amountCents || 0,
      });
    }

    // Calculate average monthly growth rate
    let growthRate = 0;
    if (monthlyRevenue.length >= 2) {
      const recentMonths = monthlyRevenue.slice(-3);
      const olderMonths = monthlyRevenue.slice(0, 3);

      const recentAvg =
        recentMonths.reduce((a, b) => a + b.revenue, 0) / recentMonths.length;
      const olderAvg =
        olderMonths.reduce((a, b) => a + b.revenue, 0) / olderMonths.length;

      if (olderAvg > 0) {
        growthRate = (recentAvg - olderAvg) / olderAvg;
      }
    }

    // Project next 3 months
    const lastMonthRevenue =
      monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
    const projectedMonths: Array<{ month: string; projected: number; isProjection: boolean }> = [];

    for (let i = 1; i <= 3; i++) {
      const projectedMonth = startOfMonth(subMonths(now, -i));
      const projectedRevenue = Math.round(
        lastMonthRevenue * Math.pow(1 + growthRate, i)
      );

      projectedMonths.push({
        month: format(projectedMonth, "MMM yyyy"),
        projected: projectedRevenue,
        isProjection: true,
      });
    }

    return {
      success: true,
      data: {
        expectedFromPending,
        pendingInvoicesCount: pendingInvoices.length,
        paymentRate: Math.round(paymentRate * 100),
        monthlyRevenue,
        projectedMonths,
        monthlyGrowthRate: Math.round(growthRate * 100),
      },
    };
  } catch (error) {
    console.error("[Analytics] Error forecasting revenue:", error);
    return { success: false, error: "Failed to generate revenue forecast" };
  }
}

// =============================================================================
// Client LTV Metrics
// =============================================================================

/**
 * Calculate lifetime value metrics for all clients
 */
export async function getClientLTVMetrics() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    // Get all clients with their payment history
    const clients = await prisma.client.findMany({
      where: { organizationId },
      include: {
        payments: {
          where: { status: "paid" },
          select: { amountCents: true, paidAt: true },
        },
        projects: {
          select: { id: true, createdAt: true },
        },
        bookings: {
          select: { id: true, status: true },
        },
      },
    });

    // Calculate metrics for each client
    const clientMetrics = clients.map((client) => {
      const totalRevenue = client.payments.reduce(
        (sum, p) => sum + p.amountCents,
        0
      );
      const projectCount = client.projects.length;
      const bookingCount = client.bookings.length;

      // Calculate average order value
      const avgOrderValue =
        client.payments.length > 0
          ? totalRevenue / client.payments.length
          : 0;

      // Calculate customer tenure (months since first project)
      const firstProject = client.projects.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      )[0];
      const tenureMonths = firstProject
        ? differenceInMonths(new Date(), firstProject.createdAt)
        : 0;

      // Calculate repeat rate
      const isRepeat = projectCount > 1;

      return {
        id: client.id,
        name: client.fullName || client.email,
        email: client.email,
        totalRevenue,
        avgOrderValue,
        projectCount,
        bookingCount,
        tenureMonths,
        isRepeat,
        lastPayment: client.payments.sort(
          (a, b) => (b.paidAt?.getTime() || 0) - (a.paidAt?.getTime() || 0)
        )[0]?.paidAt,
      };
    });

    // Sort by total revenue
    clientMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate aggregate metrics
    const totalClients = clients.length;
    const totalRevenue = clientMetrics.reduce((a, b) => a + b.totalRevenue, 0);
    const avgLTV = totalClients > 0 ? totalRevenue / totalClients : 0;
    const repeatClients = clientMetrics.filter((c) => c.isRepeat).length;
    const repeatRate = totalClients > 0 ? repeatClients / totalClients : 0;

    // Segment clients
    const topClients = clientMetrics.slice(0, 10);
    const atRiskClients = clientMetrics.filter((c) => {
      // At risk: Had revenue but no activity in 6+ months
      if (!c.lastPayment) return false;
      const monthsSincePayment = differenceInMonths(new Date(), c.lastPayment);
      return monthsSincePayment >= 6 && c.totalRevenue > 0;
    });

    return {
      success: true,
      data: {
        summary: {
          totalClients,
          totalRevenue,
          avgLTV,
          repeatRate: Math.round(repeatRate * 100),
          repeatClients,
        },
        topClients,
        atRiskClients: atRiskClients.slice(0, 10),
        allClients: clientMetrics,
      },
    };
  } catch (error) {
    console.error("[Analytics] Error calculating LTV:", error);
    return { success: false, error: "Failed to calculate client LTV metrics" };
  }
}

// =============================================================================
// Dashboard Analytics
// =============================================================================

/**
 * Get comprehensive dashboard analytics
 */
export async function getDashboardAnalytics() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const yearStart = startOfYear(now);

    // Current month metrics
    const [
      thisMonthRevenue,
      lastMonthRevenue,
      ytdRevenue,
      thisMonthProjects,
      lastMonthProjects,
      thisMonthClients,
      pendingInvoices,
      overdueInvoices,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          organizationId,
          status: "paid",
          paidAt: { gte: thisMonthStart },
        },
        _sum: { amountCents: true },
      }),
      prisma.payment.aggregate({
        where: {
          organizationId,
          status: "paid",
          paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { amountCents: true },
      }),
      prisma.payment.aggregate({
        where: {
          organizationId,
          status: "paid",
          paidAt: { gte: yearStart },
        },
        _sum: { amountCents: true },
      }),
      prisma.project.count({
        where: {
          organizationId,
          createdAt: { gte: thisMonthStart },
        },
      }),
      prisma.project.count({
        where: {
          organizationId,
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
      prisma.client.count({
        where: {
          organizationId,
          createdAt: { gte: thisMonthStart },
        },
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: "sent",
        },
        _sum: { totalCents: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: "overdue",
        },
        _sum: { totalCents: true },
        _count: true,
      }),
    ]);

    // Calculate changes
    const thisMonthRevenueValue = thisMonthRevenue._sum.amountCents || 0;
    const lastMonthRevenueValue = lastMonthRevenue._sum.amountCents || 0;
    const revenueChange =
      lastMonthRevenueValue > 0
        ? Math.round(
            ((thisMonthRevenueValue - lastMonthRevenueValue) /
              lastMonthRevenueValue) *
              100
          )
        : 0;

    const projectsChange =
      lastMonthProjects > 0
        ? Math.round(
            ((thisMonthProjects - lastMonthProjects) / lastMonthProjects) * 100
          )
        : 0;

    return {
      success: true,
      data: {
        revenue: {
          thisMonth: thisMonthRevenueValue,
          lastMonth: lastMonthRevenueValue,
          ytd: ytdRevenue._sum.amountCents || 0,
          change: revenueChange,
        },
        projects: {
          thisMonth: thisMonthProjects,
          lastMonth: lastMonthProjects,
          change: projectsChange,
        },
        clients: {
          newThisMonth: thisMonthClients,
        },
        invoices: {
          pending: {
            count: pendingInvoices._count,
            total: pendingInvoices._sum.totalCents || 0,
          },
          overdue: {
            count: overdueInvoices._count,
            total: overdueInvoices._sum.totalCents || 0,
          },
        },
      },
    };
  } catch (error) {
    console.error("[Analytics] Error fetching dashboard:", error);
    return { success: false, error: "Failed to fetch dashboard analytics" };
  }
}

// =============================================================================
// Custom Reports
// =============================================================================

/**
 * Generate a custom revenue report
 */
export async function generateRevenueReport(options: {
  startDate: Date;
  endDate: Date;
  groupBy: "day" | "week" | "month";
  includeProjected?: boolean;
}) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: "Organization not found" };
  }

  try {
    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        status: "paid",
        paidAt: {
          gte: options.startDate,
          lte: options.endDate,
        },
      },
      include: {
        project: { select: { name: true } },
        client: { select: { fullName: true, email: true } },
      },
      orderBy: { paidAt: "asc" },
    });

    // Group by the specified period
    const grouped: Record<string, { revenue: number; count: number }> = {};

    for (const payment of payments) {
      if (!payment.paidAt) continue;

      let key: string;
      switch (options.groupBy) {
        case "day":
          key = format(payment.paidAt, "yyyy-MM-dd");
          break;
        case "week":
          key = format(payment.paidAt, "yyyy-'W'ww");
          break;
        case "month":
        default:
          key = format(payment.paidAt, "yyyy-MM");
          break;
      }

      if (!grouped[key]) {
        grouped[key] = { revenue: 0, count: 0 };
      }
      grouped[key].revenue += payment.amountCents;
      grouped[key].count += 1;
    }

    const data = Object.entries(grouped).map(([period, values]) => ({
      period,
      revenue: values.revenue,
      transactionCount: values.count,
    }));

    // Calculate totals
    const totalRevenue = payments.reduce((a, b) => a + b.amountCents, 0);
    const avgTransaction =
      payments.length > 0 ? totalRevenue / payments.length : 0;

    return {
      success: true,
      data: {
        periods: data,
        summary: {
          totalRevenue,
          transactionCount: payments.length,
          avgTransaction,
          dateRange: {
            from: options.startDate,
            to: options.endDate,
          },
        },
      },
    };
  } catch (error) {
    console.error("[Analytics] Error generating report:", error);
    return { success: false, error: "Failed to generate revenue report" };
  }
}

/**
 * Export report as CSV
 */
export async function exportReportAsCSV(reportData: {
  periods: { period: string; revenue: number; transactionCount: number }[];
  summary: { totalRevenue: number; transactionCount: number };
}) {
  const headers = ["Period", "Revenue", "Transactions"];
  const rows = reportData.periods.map((p) => [
    p.period,
    `$${(p.revenue / 100).toFixed(2)}`,
    p.transactionCount.toString(),
  ]);

  // Add summary row
  rows.push([]);
  rows.push(["TOTAL", `$${(reportData.summary.totalRevenue / 100).toFixed(2)}`, reportData.summary.transactionCount.toString()]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return { success: true, data: csv };
}
