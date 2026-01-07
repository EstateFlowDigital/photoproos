"use server";

import { fail, success } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
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
// Revenue Widget Data
// =============================================================================

export async function getRevenueWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const yearStart = startOfYear(now);

    const [thisMonthRevenue, lastMonthRevenue, ytdRevenue] =
      await Promise.all([
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
      ]);

    return success({
      currentMonthRevenue: thisMonthRevenue._sum.amountCents || 0,
      previousMonthRevenue: lastMonthRevenue._sum.amountCents || 0,
      yearToDateRevenue: ytdRevenue._sum.amountCents || 0,
      monthlyGoal: undefined,
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching revenue data:", error);
    return fail("Failed to fetch revenue data");
  }
}

// =============================================================================
// Key Metrics Widget Data
// =============================================================================

export async function getKeyMetricsWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [
      thisMonthRevenue,
      lastMonthRevenue,
      activeGalleries,
      totalClients,
      pendingInvoices,
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
      prisma.project.count({
        where: {
          organizationId,
          status: { in: ["delivered", "pending"] },
        },
      }),
      prisma.client.count({ where: { organizationId } }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: { in: ["sent", "overdue"] },
        },
        _sum: { totalCents: true },
        _count: true,
      }),
    ]);

    const thisMonthValue = thisMonthRevenue._sum.amountCents || 0;
    const lastMonthValue = lastMonthRevenue._sum.amountCents || 0;
    const revenueChange =
      lastMonthValue > 0
        ? Math.round(((thisMonthValue - lastMonthValue) / lastMonthValue) * 100)
        : 0;

    return success({
      revenue: {
        current: thisMonthValue,
        change: revenueChange,
      },
      galleries: activeGalleries,
      clients: totalClients,
      pendingInvoices: {
        count: pendingInvoices._count,
        total: pendingInvoices._sum.totalCents || 0,
      },
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching key metrics:", error);
    return fail("Failed to fetch key metrics");
  }
}
