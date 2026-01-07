"use server";

import { fail, success } from "@/lib/types/action-result";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
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

    const [thisMonthRevenue, lastMonthRevenue, ytdRevenue, organization] =
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
        prisma.organization.findUnique({
          where: { id: organizationId },
          select: { monthlyRevenueGoalCents: true },
        }),
      ]);

    return success({
      currentMonthRevenue: thisMonthRevenue._sum.amountCents || 0,
      previousMonthRevenue: lastMonthRevenue._sum.amountCents || 0,
      yearToDateRevenue: ytdRevenue._sum.amountCents || 0,
      monthlyGoal: organization?.monthlyRevenueGoalCents || undefined,
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching revenue data:", error);
    return fail("Failed to fetch revenue data");
  }
}

// =============================================================================
// Client Growth Widget Data
// =============================================================================

export async function getClientGrowthWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);

    // Get monthly client counts for the last 6 months
    const monthlyData: Array<{ month: string; count: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const count = await prisma.client.count({
        where: {
          organizationId,
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });

      monthlyData.push({
        month: format(monthStart, "MMM"),
        count,
      });
    }

    // Get total clients and new this month
    const [totalClients, newThisMonth] = await Promise.all([
      prisma.client.count({ where: { organizationId } }),
      prisma.client.count({
        where: {
          organizationId,
          createdAt: { gte: startOfMonth(now) },
        },
      }),
    ]);

    // Calculate growth rate
    const previousMonthCount = monthlyData[monthlyData.length - 2]?.count || 0;
    const currentMonthCount = monthlyData[monthlyData.length - 1]?.count || 0;
    const growthRate =
      previousMonthCount > 0
        ? Math.round(
            ((currentMonthCount - previousMonthCount) / previousMonthCount) *
              100
          )
        : currentMonthCount > 0
        ? 100
        : 0;

    return success({
      totalClients,
      newThisMonth,
      growthRate,
      monthlyData,
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching client growth data:", error);
    return fail("Failed to fetch client growth data");
  }
}

// =============================================================================
// Upcoming Bookings Widget Data
// =============================================================================

export async function getUpcomingBookingsWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const now = new Date();
    const nextWeek = addDays(now, 7);

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        startTime: { gte: now, lte: nextWeek },
        status: { in: ["pending", "confirmed"] },
      },
      include: {
        client: { select: { fullName: true, company: true } },
        service: { select: { name: true, category: true } },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    });

    return success({
      bookings: bookings.map((b) => ({
        id: b.id,
        title: b.title,
        client: b.client?.company || b.client?.fullName || b.clientName || "Unknown",
        date: b.startTime.toISOString(),
        time: format(b.startTime, "h:mm a"),
        location: b.location || undefined,
        status: b.status as "confirmed" | "pending",
        serviceType: b.service?.category || b.service?.name || undefined,
      })),
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching bookings data:", error);
    return fail("Failed to fetch bookings data");
  }
}

// =============================================================================
// Calendar Preview Widget Data
// =============================================================================

export async function getCalendarPreviewWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const [bookings, tasks] = await Promise.all([
      prisma.booking.findMany({
        where: {
          organizationId,
          startTime: { gte: weekStart, lte: weekEnd },
          status: { in: ["pending", "confirmed"] },
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.task.findMany({
        where: {
          organizationId,
          dueDate: { gte: weekStart, lte: weekEnd },
          status: { not: "completed" },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    return success({
      events: [
        ...bookings.map((b) => ({
          id: b.id,
          title: b.title,
          date: b.startTime.toISOString(),
          type: "booking" as const,
        })),
        ...tasks.map((t) => ({
          id: t.id,
          title: t.title,
          date: t.dueDate?.toISOString() || now.toISOString(),
          type: "task" as const,
        })),
      ],
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching calendar data:", error);
    return fail("Failed to fetch calendar data");
  }
}

// =============================================================================
// Contract Status Widget Data
// =============================================================================

export async function getContractStatusWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const [draft, pending, signed, expired] = await Promise.all([
      prisma.contract.count({
        where: { organizationId, status: "draft" },
      }),
      prisma.contract.count({
        where: { organizationId, status: "sent" },
      }),
      prisma.contract.count({
        where: { organizationId, status: "signed" },
      }),
      prisma.contract.count({
        where: { organizationId, status: "expired" },
      }),
    ]);

    const pendingContracts = await prisma.contract.findMany({
      where: {
        organizationId,
        status: "sent",
      },
      include: {
        client: { select: { fullName: true } },
      },
      orderBy: { sentAt: "desc" },
      take: 5,
    });

    return success({
      counts: { draft, pending, signed, expired },
      pendingContracts: pendingContracts.map((c) => ({
        id: c.id,
        title: c.title,
        clientName: c.client?.fullName || "Unknown",
        sentAt: c.sentAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching contract data:", error);
    return fail("Failed to fetch contract data");
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

// =============================================================================
// Recent Activity Widget Data
// =============================================================================

export async function getRecentActivityWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const activities = await prisma.activityLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return success({
      activities: activities.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
        metadata: a.metadata,
      })),
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching activity data:", error);
    return fail("Failed to fetch activity data");
  }
}

// =============================================================================
// Recent Galleries Widget Data
// =============================================================================

export async function getRecentGalleriesWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const galleries = await prisma.project.findMany({
      where: { organizationId },
      include: {
        client: { select: { fullName: true, company: true } },
        _count: { select: { assets: true } },
        assets: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { thumbnailUrl: true, originalUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return success({
      galleries: galleries.map((g) => ({
        id: g.id,
        name: g.name,
        client: g.client?.company || g.client?.fullName || "No client",
        photoCount: g._count.assets,
        status: g.status,
        thumbnailUrl:
          g.coverImageUrl ||
          g.assets[0]?.thumbnailUrl ||
          g.assets[0]?.originalUrl ||
          undefined,
        createdAt: g.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching galleries data:", error);
    return fail("Failed to fetch galleries data");
  }
}

// =============================================================================
// Deadlines Widget Data
// =============================================================================

export async function getDeadlinesWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const now = new Date();
    const twoWeeksFromNow = addDays(now, 14);

    const [tasks, invoices] = await Promise.all([
      prisma.task.findMany({
        where: {
          organizationId,
          dueDate: { gte: now, lte: twoWeeksFromNow },
          status: { not: "completed" },
        },
        include: {
          project: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: {
          organizationId,
          dueDate: { gte: now, lte: twoWeeksFromNow },
          status: { in: ["sent", "overdue"] },
        },
        include: {
          client: { select: { fullName: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ]);

    return success({
      deadlines: [
        ...tasks.map((t) => ({
          id: t.id,
          title: t.title,
          type: "task" as const,
          dueDate: t.dueDate?.toISOString() || now.toISOString(),
          project: t.project?.name,
        })),
        ...invoices.map((i) => ({
          id: i.id,
          title: `Invoice #${i.invoiceNumber}`,
          type: "invoice" as const,
          dueDate: i.dueDate?.toISOString() || now.toISOString(),
          client: i.client?.fullName,
        })),
      ].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching deadlines data:", error);
    return fail("Failed to fetch deadlines data");
  }
}

// =============================================================================
// Todo List Widget Data
// =============================================================================

export async function getTodoListWidgetData() {
  const { userId } = await auth();
  if (!userId) {
    return fail("Not authenticated");
  }

  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        organizationId,
        assignedToId: userId,
        status: { not: "completed" },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 10,
    });

    return success({
      todos: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.status === "completed",
        dueDate: t.dueDate?.toISOString(),
        priority: t.priority,
      })),
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching todo data:", error);
    return fail("Failed to fetch todo data");
  }
}

// =============================================================================
// Notes Widget Data
// =============================================================================

export async function getNotesWidgetData() {
  const { userId } = await auth();
  if (!userId) {
    return fail("Not authenticated");
  }

  try {
    // Get user's dashboard notes from preferences
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { dashboardNotes: true },
    });

    return success({
      notes: (user?.dashboardNotes as string) || "",
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching notes:", error);
    return fail("Failed to fetch notes");
  }
}

export async function saveNotesWidgetData(notes: string) {
  const { userId } = await auth();
  if (!userId) {
    return fail("Not authenticated");
  }

  try {
    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { dashboardNotes: notes },
    });

    return success({ saved: true });
  } catch (error) {
    console.error("[WidgetData] Error saving notes:", error);
    return fail("Failed to save notes");
  }
}

// =============================================================================
// All Widget Data (Batch fetch)
// =============================================================================

export async function getAllWidgetData() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const [revenue, clientGrowth, keyMetrics] = await Promise.all([
      getRevenueWidgetData(),
      getClientGrowthWidgetData(),
      getKeyMetricsWidgetData(),
    ]);

    return success({
      revenue: revenue.success ? revenue.data : null,
      clientGrowth: clientGrowth.success ? clientGrowth.data : null,
      keyMetrics: keyMetrics.success ? keyMetrics.data : null,
    });
  } catch (error) {
    console.error("[WidgetData] Error fetching all widget data:", error);
    return fail("Failed to fetch widget data");
  }
}
