"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireOrganizationId } from "./auth-helper";

export interface LeadsAnalytics {
  summary: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    qualifiedLeads: number;
    closedLeads: number;
    convertedToClients: number;
    conversionRate: number;
    avgResponseTimeHours: number | null;
    leadsThisMonth: number;
    leadsLastMonth: number;
    monthOverMonthChange: number;
  };
  bySource: Array<{
    source: string;
    sourceType: "portfolio" | "chat" | "booking";
    count: number;
    converted: number;
    conversionRate: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthly: Array<{
    month: string;
    monthLabel: string;
    portfolio: number;
    chat: number;
    booking: number;
    total: number;
    converted: number;
  }>;
  funnel: {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
  };
  recentConversions: Array<{
    id: string;
    name: string;
    email: string;
    source: string;
    sourceType: "portfolio" | "chat" | "booking";
    convertedAt: Date;
  }>;
}

export async function getLeadsAnalytics(): Promise<{
  success: boolean;
  data?: LeadsAnalytics;
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Fetch all lead types in parallel
    const [portfolioInquiries, chatInquiries, bookingSubmissions, clients] = await Promise.all([
      prisma.portfolioInquiry.findMany({
        where: { organizationId },
        include: {
          portfolioWebsite: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.chatInquiry.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bookingFormSubmission.findMany({
        where: {
          bookingForm: { organizationId },
        },
        include: {
          bookingForm: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Get clients to track conversions
      prisma.client.findMany({
        where: { organizationId },
        select: {
          id: true,
          fullName: true,
          email: true,
          source: true,
          createdAt: true,
        },
      }),
    ]);

    // Combine all leads
    const allLeads = [
      ...portfolioInquiries.map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        status: i.status,
        source: i.portfolioWebsite?.name || "Portfolio",
        sourceType: "portfolio" as const,
        createdAt: i.createdAt,
        convertedAt: i.status === "closed" ? i.updatedAt : null,
      })),
      ...chatInquiries.map((i) => ({
        id: i.id,
        name: i.name || "Anonymous",
        email: i.email || "",
        status: i.status,
        source: i.category || "Chat Widget",
        sourceType: "chat" as const,
        createdAt: i.createdAt,
        convertedAt: i.status === "closed" ? i.updatedAt : null,
      })),
      ...bookingSubmissions.map((s) => ({
        id: s.id,
        name: s.clientName || "Anonymous",
        email: s.clientEmail || "",
        status: s.status === "converted" ? "closed" : s.status === "pending" ? "new" : s.status,
        source: s.bookingForm?.name || "Booking Form",
        sourceType: "booking" as const,
        createdAt: s.createdAt,
        convertedAt: s.convertedAt,
      })),
    ];

    // Calculate summary stats
    const totalLeads = allLeads.length;
    const newLeads = allLeads.filter((l) => l.status === "new" || l.status === "pending").length;
    const contactedLeads = allLeads.filter((l) => l.status === "contacted" || l.status === "approved").length;
    const qualifiedLeads = allLeads.filter((l) => l.status === "qualified").length;
    const closedLeads = allLeads.filter((l) => l.status === "closed" || l.status === "converted").length;

    // Count conversions (leads that became clients)
    const convertedToClients = allLeads.filter((l) => l.convertedAt !== null).length;
    const conversionRate = totalLeads > 0 ? (convertedToClients / totalLeads) * 100 : 0;

    // Calculate leads this month vs last month
    const leadsThisMonth = allLeads.filter((l) => l.createdAt >= thisMonthStart).length;
    const leadsLastMonth = allLeads.filter(
      (l) => l.createdAt >= lastMonthStart && l.createdAt <= lastMonthEnd
    ).length;
    const monthOverMonthChange = leadsLastMonth > 0
      ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100
      : leadsThisMonth > 0 ? 100 : 0;

    // Calculate average response time (for contacted leads)
    const contactedWithTime = portfolioInquiries
      .filter((i) => i.status !== "new" && i.updatedAt > i.createdAt)
      .map((i) => (i.updatedAt.getTime() - i.createdAt.getTime()) / (1000 * 60 * 60));
    const avgResponseTimeHours = contactedWithTime.length > 0
      ? contactedWithTime.reduce((a, b) => a + b, 0) / contactedWithTime.length
      : null;

    // Group by source
    const sourceMap = new Map<string, { count: number; converted: number; sourceType: "portfolio" | "chat" | "booking" }>();
    allLeads.forEach((l) => {
      const existing = sourceMap.get(l.source) || { count: 0, converted: 0, sourceType: l.sourceType };
      existing.count++;
      if (l.convertedAt) existing.converted++;
      sourceMap.set(l.source, existing);
    });
    const bySource = Array.from(sourceMap.entries())
      .map(([source, data]) => ({
        source,
        sourceType: data.sourceType,
        count: data.count,
        converted: data.converted,
        conversionRate: data.count > 0 ? (data.converted / data.count) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Group by status
    const statusMap = new Map<string, number>();
    allLeads.forEach((l) => {
      const normalizedStatus = l.status === "pending" ? "new" : l.status === "approved" ? "contacted" : l.status === "converted" ? "closed" : l.status;
      statusMap.set(normalizedStatus, (statusMap.get(normalizedStatus) || 0) + 1);
    });
    const byStatus = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
      }))
      .sort((a, b) => {
        const order = ["new", "contacted", "qualified", "closed"];
        return order.indexOf(a.status) - order.indexOf(b.status);
      });

    // Monthly data for trend chart
    const monthlyMap = new Map<string, { portfolio: number; chat: number; booking: number; converted: number }>();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, { portfolio: 0, chat: 0, booking: 0, converted: 0 });
    }

    allLeads.forEach((l) => {
      if (l.createdAt >= sixMonthsAgo) {
        const key = `${l.createdAt.getFullYear()}-${String(l.createdAt.getMonth() + 1).padStart(2, "0")}`;
        const existing = monthlyMap.get(key);
        if (existing) {
          existing[l.sourceType]++;
          if (l.convertedAt) existing.converted++;
        }
      }
    });

    const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => {
      const [year, monthNum] = month.split("-");
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      return {
        month,
        monthLabel: date.toLocaleDateString("en-US", { month: "short" }),
        ...data,
        total: data.portfolio + data.chat + data.booking,
      };
    });

    // Funnel data
    const funnel = {
      new: newLeads,
      contacted: contactedLeads,
      qualified: qualifiedLeads,
      converted: convertedToClients,
    };

    // Recent conversions
    const recentConversions = allLeads
      .filter((l) => l.convertedAt !== null)
      .sort((a, b) => (b.convertedAt?.getTime() || 0) - (a.convertedAt?.getTime() || 0))
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        source: l.source,
        sourceType: l.sourceType,
        convertedAt: l.convertedAt!,
      }));

    return {
      success: true,
      data: {
        summary: {
          totalLeads,
          newLeads,
          contactedLeads,
          qualifiedLeads,
          closedLeads,
          convertedToClients,
          conversionRate,
          avgResponseTimeHours,
          leadsThisMonth,
          leadsLastMonth,
          monthOverMonthChange,
        },
        bySource,
        byStatus,
        monthly,
        funnel,
        recentConversions,
      },
    };
  } catch (error) {
    console.error("Failed to get leads analytics:", error);
    return {
      success: false,
      error: "Failed to load leads analytics",
    };
  }
}
