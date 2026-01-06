"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// INVOICE ANALYTICS
// ============================================================================

export interface RevenueByPeriod {
  period: string;
  invoiced: number;
  collected: number;
  outstanding: number;
  invoiceCount: number;
}

export interface ARAgingBucket {
  bucket: string;
  minDays: number;
  maxDays: number | null;
  count: number;
  totalCents: number;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string | null;
    amountCents: number;
    daysOverdue: number;
  }>;
}

export interface ClientRevenue {
  clientId: string;
  clientName: string | null;
  company: string | null;
  invoiceCount: number;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  avgDaysToPayment: number | null;
}

/**
 * Get revenue summary by month
 */
export async function getRevenueByMonth(options?: {
  months?: number;
}): Promise<ActionResult<RevenueByPeriod[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const monthsToFetch = options?.months || 12;

    // Calculate start date
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToFetch);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { not: "draft" },
        issueDate: { gte: startDate },
      },
      select: {
        id: true,
        totalCents: true,
        paidAmountCents: true,
        lateFeeAppliedCents: true,
        status: true,
        issueDate: true,
      },
    });

    // Group by month
    const monthlyData = new Map<string, {
      invoiced: number;
      collected: number;
      outstanding: number;
      count: number;
    }>();

    // Initialize all months
    for (let i = 0; i < monthsToFetch; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData.set(key, { invoiced: 0, collected: 0, outstanding: 0, count: 0 });
    }

    // Aggregate data
    for (const invoice of invoices) {
      const date = new Date(invoice.issueDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const current = monthlyData.get(key);
      if (current) {
        const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;
        current.invoiced += totalDue;
        current.collected += invoice.paidAmountCents;
        current.outstanding += Math.max(0, totalDue - invoice.paidAmountCents);
        current.count++;
      }
    }

    // Convert to array and sort
    const result: RevenueByPeriod[] = Array.from(monthlyData.entries())
      .map(([period, data]) => ({
        period,
        invoiced: data.invoiced,
        collected: data.collected,
        outstanding: data.outstanding,
        invoiceCount: data.count,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return success(result);
  } catch (error) {
    console.error("Error fetching revenue by month:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch revenue data");
  }
}

/**
 * Get accounts receivable aging report
 */
export async function getARAging(): Promise<ActionResult<ARAgingBucket[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const now = new Date();

    // Get all unpaid/partial paid invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["sent", "overdue"] },
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        totalCents: true,
        paidAmountCents: true,
        lateFeeAppliedCents: true,
        dueDate: true,
        client: {
          select: { fullName: true },
        },
      },
    });

    // Define aging buckets
    const buckets: ARAgingBucket[] = [
      { bucket: "Current", minDays: -Infinity, maxDays: 0, count: 0, totalCents: 0, invoices: [] },
      { bucket: "1-30 Days", minDays: 1, maxDays: 30, count: 0, totalCents: 0, invoices: [] },
      { bucket: "31-60 Days", minDays: 31, maxDays: 60, count: 0, totalCents: 0, invoices: [] },
      { bucket: "61-90 Days", minDays: 61, maxDays: 90, count: 0, totalCents: 0, invoices: [] },
      { bucket: "90+ Days", minDays: 91, maxDays: null, count: 0, totalCents: 0, invoices: [] },
    ];

    for (const invoice of invoices) {
      const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;
      const outstanding = totalDue - invoice.paidAmountCents;

      if (outstanding <= 0) continue;

      const daysOverdue = Math.floor(
        (now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Find the right bucket
      for (const bucket of buckets) {
        const inBucket =
          daysOverdue >= bucket.minDays &&
          (bucket.maxDays === null || daysOverdue <= bucket.maxDays);

        if (inBucket) {
          bucket.count++;
          bucket.totalCents += outstanding;
          bucket.invoices.push({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName || invoice.client?.fullName || "Unknown",
            amountCents: outstanding,
            daysOverdue: Math.max(0, daysOverdue),
          });
          break;
        }
      }
    }

    // Sort invoices within each bucket by days overdue
    for (const bucket of buckets) {
      bucket.invoices.sort((a, b) => b.daysOverdue - a.daysOverdue);
    }

    return success(buckets);
  } catch (error) {
    console.error("Error fetching AR aging:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch AR aging data");
  }
}

/**
 * Get collection rate and payment metrics
 */
export async function getCollectionMetrics(options?: {
  days?: number;
}): Promise<
  ActionResult<{
    collectionRate: number;
    averageDaysToPayment: number;
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
    overdueCount: number;
    overdueAmount: number;
    paidOnTimeRate: number;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();
    const days = options?.days || 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { not: "draft" },
        issueDate: { gte: startDate },
      },
      select: {
        totalCents: true,
        paidAmountCents: true,
        lateFeeAppliedCents: true,
        status: true,
        dueDate: true,
        paidAt: true,
        issueDate: true,
      },
    });

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let paidOnTimeCount = 0;
    let paidCount = 0;
    let totalDaysToPayment = 0;

    const now = new Date();

    for (const invoice of invoices) {
      const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;
      const outstanding = totalDue - invoice.paidAmountCents;

      totalInvoiced += totalDue;
      totalCollected += invoice.paidAmountCents;
      totalOutstanding += Math.max(0, outstanding);

      if (invoice.status === "overdue") {
        overdueCount++;
        overdueAmount += outstanding;
      }

      // Calculate days to payment for paid invoices
      if (invoice.status === "paid" && invoice.paidAt) {
        paidCount++;
        const daysToPayment = Math.floor(
          (new Date(invoice.paidAt).getTime() - new Date(invoice.issueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        totalDaysToPayment += daysToPayment;

        // Check if paid on time
        if (new Date(invoice.paidAt) <= new Date(invoice.dueDate)) {
          paidOnTimeCount++;
        }
      }
    }

    const collectionRate = totalInvoiced > 0
      ? Math.round((totalCollected / totalInvoiced) * 100)
      : 0;

    const averageDaysToPayment = paidCount > 0
      ? Math.round(totalDaysToPayment / paidCount)
      : 0;

    const paidOnTimeRate = paidCount > 0
      ? Math.round((paidOnTimeCount / paidCount) * 100)
      : 0;

    return success({
      collectionRate,
      averageDaysToPayment,
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      overdueCount,
      overdueAmount,
      paidOnTimeRate,
    });
  } catch (error) {
    console.error("Error fetching collection metrics:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch collection metrics");
  }
}

/**
 * Get revenue breakdown by client
 */
export async function getRevenueByClient(options?: {
  limit?: number;
  sortBy?: "revenue" | "outstanding";
}): Promise<ActionResult<ClientRevenue[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const limit = options?.limit || 20;
    const sortBy = options?.sortBy || "revenue";

    // Get all non-draft invoices grouped by client
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { not: "draft" },
        clientId: { not: null },
      },
      select: {
        clientId: true,
        totalCents: true,
        paidAmountCents: true,
        lateFeeAppliedCents: true,
        paidAt: true,
        issueDate: true,
        client: {
          select: {
            id: true,
            fullName: true,
            company: true,
          },
        },
      },
    });

    // Aggregate by client
    const clientMap = new Map<string, {
      clientId: string;
      clientName: string | null;
      company: string | null;
      invoiceCount: number;
      totalInvoiced: number;
      totalPaid: number;
      outstanding: number;
      totalDaysToPayment: number;
      paidInvoiceCount: number;
    }>();

    for (const invoice of invoices) {
      if (!invoice.clientId || !invoice.client) continue;

      const current = clientMap.get(invoice.clientId) || {
        clientId: invoice.clientId,
        clientName: invoice.client.fullName,
        company: invoice.client.company,
        invoiceCount: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        outstanding: 0,
        totalDaysToPayment: 0,
        paidInvoiceCount: 0,
      };

      const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;

      current.invoiceCount++;
      current.totalInvoiced += totalDue;
      current.totalPaid += invoice.paidAmountCents;
      current.outstanding += Math.max(0, totalDue - invoice.paidAmountCents);

      // Track days to payment
      if (invoice.paidAt && invoice.paidAmountCents >= totalDue) {
        const days = Math.floor(
          (new Date(invoice.paidAt).getTime() - new Date(invoice.issueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        current.totalDaysToPayment += days;
        current.paidInvoiceCount++;
      }

      clientMap.set(invoice.clientId, current);
    }

    // Convert to array and calculate averages
    let result: ClientRevenue[] = Array.from(clientMap.values()).map((c) => ({
      clientId: c.clientId,
      clientName: c.clientName,
      company: c.company,
      invoiceCount: c.invoiceCount,
      totalInvoiced: c.totalInvoiced,
      totalPaid: c.totalPaid,
      outstanding: c.outstanding,
      avgDaysToPayment: c.paidInvoiceCount > 0
        ? Math.round(c.totalDaysToPayment / c.paidInvoiceCount)
        : null,
    }));

    // Sort by specified field
    if (sortBy === "outstanding") {
      result.sort((a, b) => b.outstanding - a.outstanding);
    } else {
      result.sort((a, b) => b.totalInvoiced - a.totalInvoiced);
    }

    // Limit results
    result = result.slice(0, limit);

    return success(result);
  } catch (error) {
    console.error("Error fetching revenue by client:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch client revenue data");
  }
}

/**
 * Get invoice summary statistics
 */
export async function getInvoiceSummary(): Promise<
  ActionResult<{
    total: number;
    draft: number;
    sent: number;
    overdue: number;
    paid: number;
    cancelled: number;
    totalAmountCents: number;
    paidAmountCents: number;
    overdueAmountCents: number;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      select: {
        status: true,
        totalCents: true,
        paidAmountCents: true,
        lateFeeAppliedCents: true,
      },
    });

    const summary = {
      total: invoices.length,
      draft: 0,
      sent: 0,
      overdue: 0,
      paid: 0,
      cancelled: 0,
      totalAmountCents: 0,
      paidAmountCents: 0,
      overdueAmountCents: 0,
    };

    for (const invoice of invoices) {
      const totalDue = invoice.totalCents + invoice.lateFeeAppliedCents;
      const outstanding = totalDue - invoice.paidAmountCents;

      summary.totalAmountCents += totalDue;
      summary.paidAmountCents += invoice.paidAmountCents;

      switch (invoice.status) {
        case "draft":
          summary.draft++;
          break;
        case "sent":
          summary.sent++;
          break;
        case "overdue":
          summary.overdue++;
          summary.overdueAmountCents += outstanding;
          break;
        case "paid":
          summary.paid++;
          break;
        case "cancelled":
          summary.cancelled++;
          break;
      }
    }

    return success(summary);
  } catch (error) {
    console.error("Error fetching invoice summary:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch invoice summary");
  }
}

/**
 * Export invoice data to CSV
 */
export async function exportInvoicesToCSV(options?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<ActionResult<string>> {
  try {
    const organizationId = await requireOrganizationId();

    const where: Record<string, unknown> = { organizationId };

    if (options?.status && options.status !== "all") {
      where.status = options.status;
    }

    if (options?.startDate || options?.endDate) {
      where.issueDate = {};
      if (options?.startDate) {
        (where.issueDate as Record<string, Date>).gte = options.startDate;
      }
      if (options?.endDate) {
        (where.issueDate as Record<string, Date>).lte = options.endDate;
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: { fullName: true, company: true, email: true },
        },
      },
      orderBy: { issueDate: "desc" },
    });

    // Build CSV
    const headers = [
      "Invoice Number",
      "Client Name",
      "Client Email",
      "Status",
      "Issue Date",
      "Due Date",
      "Paid Date",
      "Subtotal",
      "Tax",
      "Discount",
      "Late Fees",
      "Total",
      "Paid Amount",
      "Balance",
      "Currency",
    ];

    const rows = invoices.map((inv) => {
      const totalDue = inv.totalCents + inv.lateFeeAppliedCents;
      const balance = totalDue - inv.paidAmountCents;

      return [
        inv.invoiceNumber,
        inv.clientName || inv.client?.fullName || "",
        inv.clientEmail || inv.client?.email || "",
        inv.status,
        inv.issueDate.toISOString().split("T")[0],
        inv.dueDate.toISOString().split("T")[0],
        inv.paidAt ? inv.paidAt.toISOString().split("T")[0] : "",
        (inv.subtotalCents / 100).toFixed(2),
        (inv.taxCents / 100).toFixed(2),
        (inv.discountCents / 100).toFixed(2),
        (inv.lateFeeAppliedCents / 100).toFixed(2),
        (totalDue / 100).toFixed(2),
        (inv.paidAmountCents / 100).toFixed(2),
        (balance / 100).toFixed(2),
        inv.currency,
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return success(csv);
  } catch (error) {
    console.error("Error exporting invoices to CSV:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to export invoices");
  }
}
