"use server";

/**
 * Revenue Forecasting
 *
 * Predicts future revenue based on bookings, historical trends,
 * and seasonal patterns. Provides insights for business planning.
 */

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

interface RevenueForecast {
  period: string; // "2025-01" or "2025-Q1" or "2025"
  predictedRevenueCents: number;
  confirmedRevenueCents: number; // From confirmed bookings
  pendingRevenueCents: number; // From pending bookings
  invoicedRevenueCents: number; // From unpaid invoices
  confidence: number; // 0-100
  factors: ForecastFactor[];
}

interface ForecastFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
  weight: number; // -1 to 1
}

interface HistoricalTrend {
  period: string;
  revenueCents: number;
  bookingCount: number;
  averageOrderValueCents: number;
  growthRate: number; // percentage vs previous period
}

interface SeasonalPattern {
  month: number; // 1-12
  seasonalIndex: number; // 1.0 = average, >1 = above average
  historicalAverage: number;
}

// =============================================================================
// Forecasting Functions
// =============================================================================

/**
 * Get revenue forecast for upcoming months
 */
export async function getRevenueForecast(
  months: number = 6
): Promise<ActionResult<RevenueForecast[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const now = new Date();
    const forecasts: RevenueForecast[] = [];

    // Get historical data for trend analysis (last 12 months)
    const historicalStart = new Date(now);
    historicalStart.setMonth(historicalStart.getMonth() - 12);

    const historicalPayments = await prisma.payment.findMany({
      where: {
        organizationId,
        status: "paid",
        paidAt: { gte: historicalStart },
      },
      select: {
        amountCents: true,
        paidAt: true,
      },
    });

    // Calculate seasonal indices
    const monthlyTotals = new Map<number, number[]>();
    historicalPayments.forEach((p) => {
      const month = p.paidAt!.getMonth() + 1;
      if (!monthlyTotals.has(month)) {
        monthlyTotals.set(month, []);
      }
      monthlyTotals.get(month)!.push(p.amountCents);
    });

    const overallAverage =
      historicalPayments.reduce((sum, p) => sum + p.amountCents, 0) /
      Math.max(historicalPayments.length, 1);

    const seasonalIndices = new Map<number, number>();
    monthlyTotals.forEach((amounts, month) => {
      const monthAvg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      seasonalIndices.set(month, monthAvg / Math.max(overallAverage, 1));
    });

    // Calculate average monthly growth rate
    const monthlyRevenue = new Map<string, number>();
    historicalPayments.forEach((p) => {
      const key = `${p.paidAt!.getFullYear()}-${String(p.paidAt!.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue.set(key, (monthlyRevenue.get(key) || 0) + p.amountCents);
    });

    const sortedMonths = Array.from(monthlyRevenue.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    let totalGrowthRate = 0;
    let growthCount = 0;
    for (let i = 1; i < sortedMonths.length; i++) {
      const prevRevenue = sortedMonths[i - 1][1];
      const currRevenue = sortedMonths[i][1];
      if (prevRevenue > 0) {
        totalGrowthRate += (currRevenue - prevRevenue) / prevRevenue;
        growthCount++;
      }
    }
    const avgMonthlyGrowth = growthCount > 0 ? totalGrowthRate / growthCount : 0;

    // Get confirmed/pending bookings for future months
    const futureStart = new Date(now.getFullYear(), now.getMonth(), 1);

    for (let i = 0; i < months; i++) {
      const forecastMonth = new Date(futureStart);
      forecastMonth.setMonth(forecastMonth.getMonth() + i);
      const periodKey = `${forecastMonth.getFullYear()}-${String(forecastMonth.getMonth() + 1).padStart(2, "0")}`;

      const monthStart = new Date(forecastMonth);
      const monthEnd = new Date(forecastMonth);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      // Get confirmed bookings
      const confirmedBookings = await prisma.booking.findMany({
        where: {
          organizationId,
          startTime: { gte: monthStart, lte: monthEnd },
          status: "confirmed",
        },
        include: {
          service: { select: { priceCents: true } },
        },
      });

      const confirmedRevenue = confirmedBookings.reduce(
        (sum, b) => sum + (b.service?.priceCents || 0),
        0
      );

      // Get pending bookings
      const pendingBookings = await prisma.booking.findMany({
        where: {
          organizationId,
          startTime: { gte: monthStart, lte: monthEnd },
          status: "pending",
        },
        include: {
          service: { select: { priceCents: true } },
        },
      });

      const pendingRevenue = pendingBookings.reduce(
        (sum, b) => sum + (b.service?.priceCents || 0),
        0
      );

      // Get unpaid invoices due in this month
      const unpaidInvoices = await prisma.invoice.findMany({
        where: {
          organizationId,
          dueDate: { gte: monthStart, lte: monthEnd },
          status: { in: ["sent", "overdue"] },
        },
        select: { totalCents: true },
      });

      const invoicedRevenue = unpaidInvoices.reduce(
        (sum, inv) => sum + inv.totalCents,
        0
      );

      // Calculate predicted revenue
      const baselineMonthly =
        sortedMonths.length > 0
          ? sortedMonths[sortedMonths.length - 1][1]
          : overallAverage * 30;

      const seasonalIndex =
        seasonalIndices.get(forecastMonth.getMonth() + 1) || 1;
      const growthFactor = Math.pow(1 + avgMonthlyGrowth, i);

      // Blend confirmed data with predictions
      const predictedFromHistory = baselineMonthly * seasonalIndex * growthFactor;
      const knownRevenue = confirmedRevenue + pendingRevenue * 0.7; // 70% conversion rate for pending

      // Weight more towards confirmed data as we have more of it
      const knownWeight = Math.min(
        (confirmedBookings.length + pendingBookings.length) / 10,
        0.8
      );
      const predictedRevenue = Math.round(
        knownRevenue * knownWeight + predictedFromHistory * (1 - knownWeight)
      );

      // Calculate confidence based on data quality
      const monthsAhead = i;
      const dataQuality = Math.min(sortedMonths.length / 12, 1);
      const confidence = Math.max(
        20,
        Math.round(100 - monthsAhead * 10 - (1 - dataQuality) * 20)
      );

      // Identify factors
      const factors: ForecastFactor[] = [];

      if (seasonalIndex > 1.1) {
        factors.push({
          name: "Seasonal High",
          impact: "positive",
          description: "This is historically a strong month",
          weight: seasonalIndex - 1,
        });
      } else if (seasonalIndex < 0.9) {
        factors.push({
          name: "Seasonal Low",
          impact: "negative",
          description: "This is historically a slower month",
          weight: seasonalIndex - 1,
        });
      }

      if (avgMonthlyGrowth > 0.05) {
        factors.push({
          name: "Growth Trend",
          impact: "positive",
          description: `${Math.round(avgMonthlyGrowth * 100)}% average monthly growth`,
          weight: avgMonthlyGrowth,
        });
      } else if (avgMonthlyGrowth < -0.05) {
        factors.push({
          name: "Declining Trend",
          impact: "negative",
          description: "Revenue has been declining",
          weight: avgMonthlyGrowth,
        });
      }

      if (confirmedBookings.length > 5) {
        factors.push({
          name: "Strong Pipeline",
          impact: "positive",
          description: `${confirmedBookings.length} confirmed bookings`,
          weight: 0.2,
        });
      }

      forecasts.push({
        period: periodKey,
        predictedRevenueCents: predictedRevenue,
        confirmedRevenueCents: confirmedRevenue,
        pendingRevenueCents: pendingRevenue,
        invoicedRevenueCents: invoicedRevenue,
        confidence,
        factors,
      });
    }

    return success(forecasts);
  } catch (error) {
    console.error("[RevenueForecast] Error:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to generate forecast");
  }
}

/**
 * Get historical revenue trends
 */
export async function getHistoricalTrends(
  months: number = 12
): Promise<ActionResult<HistoricalTrend[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        status: "paid",
        paidAt: { gte: startDate },
      },
      select: {
        amountCents: true,
        paidAt: true,
      },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId,
        startTime: { gte: startDate },
        status: { in: ["confirmed", "completed"] },
      },
      select: {
        startTime: true,
      },
    });

    // Group by month
    const monthlyData = new Map<
      string,
      { revenue: number; bookings: number }
    >();

    payments.forEach((p) => {
      if (p.paidAt) {
        const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, "0")}`;
        const existing = monthlyData.get(key) || { revenue: 0, bookings: 0 };
        existing.revenue += p.amountCents;
        monthlyData.set(key, existing);
      }
    });

    bookings.forEach((b) => {
      const key = `${b.startTime.getFullYear()}-${String(b.startTime.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyData.get(key) || { revenue: 0, bookings: 0 };
      existing.bookings++;
      monthlyData.set(key, existing);
    });

    // Convert to array and calculate growth rates
    const sortedPeriods = Array.from(monthlyData.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    const trends: HistoricalTrend[] = sortedPeriods.map(([period, data], index) => {
      const prevData = index > 0 ? sortedPeriods[index - 1][1] : null;
      const growthRate = prevData && prevData.revenue > 0
        ? ((data.revenue - prevData.revenue) / prevData.revenue) * 100
        : 0;

      return {
        period,
        revenueCents: data.revenue,
        bookingCount: data.bookings,
        averageOrderValueCents:
          data.bookings > 0 ? Math.round(data.revenue / data.bookings) : 0,
        growthRate: Math.round(growthRate * 10) / 10,
      };
    });

    return success(trends);
  } catch (error) {
    console.error("[RevenueForecast] Error getting trends:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get historical trends");
  }
}

/**
 * Get seasonal patterns
 */
export async function getSeasonalPatterns(): Promise<
  ActionResult<SeasonalPattern[]>
> {
  try {
    const organizationId = await requireOrganizationId();

    // Get all historical payments
    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        status: "paid",
        paidAt: { not: null },
      },
      select: {
        amountCents: true,
        paidAt: true,
      },
    });

    // Group by month
    const monthlyTotals = new Map<number, number[]>();
    payments.forEach((p) => {
      if (p.paidAt) {
        const month = p.paidAt.getMonth() + 1;
        if (!monthlyTotals.has(month)) {
          monthlyTotals.set(month, []);
        }
        monthlyTotals.get(month)!.push(p.amountCents);
      }
    });

    // Calculate overall average
    const totalRevenue = payments.reduce((sum, p) => sum + p.amountCents, 0);
    const monthCount = new Set(
      payments.map((p) => `${p.paidAt?.getFullYear()}-${p.paidAt?.getMonth()}`)
    ).size;
    const overallMonthlyAverage = monthCount > 0 ? totalRevenue / monthCount : 0;

    // Calculate seasonal indices
    const patterns: SeasonalPattern[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthAmounts = monthlyTotals.get(month) || [];
      const monthTotal = monthAmounts.reduce((a, b) => a + b, 0);
      const monthAverage =
        monthAmounts.length > 0 ? monthTotal / monthAmounts.length : 0;

      const seasonalIndex =
        overallMonthlyAverage > 0 ? monthAverage / overallMonthlyAverage : 1;

      patterns.push({
        month,
        seasonalIndex: Math.round(seasonalIndex * 100) / 100,
        historicalAverage: Math.round(monthAverage),
      });
    }

    return success(patterns);
  } catch (error) {
    console.error("[RevenueForecast] Error getting patterns:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get seasonal patterns");
  }
}

/**
 * Get revenue goals and progress
 */
export async function getRevenueGoals(
  year?: number
): Promise<
  ActionResult<{
    annualGoal: number;
    currentRevenue: number;
    projectedRevenue: number;
    percentComplete: number;
    monthlyBreakdown: {
      month: string;
      goalCents: number;
      actualCents: number;
      projectedCents: number;
    }[];
  }>
> {
  try {
    const organizationId = await requireOrganizationId();
    const targetYear = year || new Date().getFullYear();

    // Get organization settings for annual goal (or calculate from last year)
    const lastYearStart = new Date(targetYear - 1, 0, 1);
    const lastYearEnd = new Date(targetYear - 1, 11, 31, 23, 59, 59);

    const lastYearPayments = await prisma.payment.findMany({
      where: {
        organizationId,
        status: "paid",
        paidAt: { gte: lastYearStart, lte: lastYearEnd },
      },
      select: { amountCents: true },
    });

    const lastYearRevenue = lastYearPayments.reduce(
      (sum, p) => sum + p.amountCents,
      0
    );

    // Set goal as 20% growth over last year (or $100k if no history)
    const annualGoal =
      lastYearRevenue > 0
        ? Math.round(lastYearRevenue * 1.2)
        : 10000000; // $100k default

    // Get current year's revenue
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);
    const now = new Date();

    const currentPayments = await prisma.payment.findMany({
      where: {
        organizationId,
        status: "paid",
        paidAt: { gte: yearStart, lte: now },
      },
      select: { amountCents: true, paidAt: true },
    });

    const currentRevenue = currentPayments.reduce(
      (sum, p) => sum + p.amountCents,
      0
    );

    // Get forecast for remaining months
    const forecastResult = await getRevenueForecast(
      12 - now.getMonth()
    );
    const projectedRemaining = forecastResult.success
      ? forecastResult.data.reduce((sum, f) => sum + f.predictedRevenueCents, 0)
      : 0;

    const projectedRevenue = currentRevenue + projectedRemaining;

    // Calculate monthly breakdown
    const monthlyGoal = annualGoal / 12;
    const monthlyBreakdown: {
      month: string;
      goalCents: number;
      actualCents: number;
      projectedCents: number;
    }[] = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(targetYear, month, 1);
      const monthEnd = new Date(targetYear, month + 1, 0, 23, 59, 59);
      const monthKey = `${targetYear}-${String(month + 1).padStart(2, "0")}`;

      const monthPayments = currentPayments.filter(
        (p) => p.paidAt && p.paidAt >= monthStart && p.paidAt <= monthEnd
      );
      const actualCents = monthPayments.reduce(
        (sum, p) => sum + p.amountCents,
        0
      );

      const projected =
        month > now.getMonth() && forecastResult.success
          ? forecastResult.data.find((f) => f.period === monthKey)
              ?.predictedRevenueCents || 0
          : actualCents;

      monthlyBreakdown.push({
        month: monthKey,
        goalCents: Math.round(monthlyGoal),
        actualCents,
        projectedCents: projected,
      });
    }

    return {
      success: true,
      data: {
        annualGoal,
        currentRevenue,
        projectedRevenue,
        percentComplete: Math.round((currentRevenue / annualGoal) * 100),
        monthlyBreakdown,
      },
    };
  } catch (error) {
    console.error("[RevenueForecast] Error getting goals:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get revenue goals");
  }
}

/**
 * Get revenue insights and recommendations
 */
export async function getRevenueInsights(): Promise<
  ActionResult<{
    insights: {
      type: "opportunity" | "warning" | "info";
      title: string;
      description: string;
      actionable: boolean;
      action?: string;
    }[];
  }>
> {
  try {
    const organizationId = await requireOrganizationId();

    const insights: {
      type: "opportunity" | "warning" | "info";
      title: string;
      description: string;
      actionable: boolean;
      action?: string;
    }[] = [];

    // Check for upcoming slow period
    const patterns = await getSeasonalPatterns();
    if (patterns.success) {
      const nextMonth = (new Date().getMonth() + 2) % 12 || 12;
      const nextPattern = patterns.data.find((p) => p.month === nextMonth);
      if (nextPattern && nextPattern.seasonalIndex < 0.8) {
        insights.push({
          type: "warning",
          title: "Slow Period Ahead",
          description: `Next month is historically ${Math.round((1 - nextPattern.seasonalIndex) * 100)}% slower than average. Consider running promotions.`,
          actionable: true,
          action: "Create a special offer",
        });
      }
    }

    // Check for pending bookings that need follow-up
    const pendingCount = await prisma.booking.count({
      where: {
        organizationId,
        status: "pending",
        startTime: { gte: new Date() },
      },
    });

    if (pendingCount > 5) {
      insights.push({
        type: "opportunity",
        title: "Pending Bookings",
        description: `You have ${pendingCount} pending bookings. Following up could increase conversions.`,
        actionable: true,
        action: "Review pending bookings",
      });
    }

    // Check for overdue invoices
    const overdueCount = await prisma.invoice.count({
      where: {
        organizationId,
        status: "overdue",
      },
    });

    if (overdueCount > 0) {
      insights.push({
        type: "warning",
        title: "Overdue Invoices",
        description: `You have ${overdueCount} overdue invoice(s). Collecting these could improve cash flow.`,
        actionable: true,
        action: "Send payment reminders",
      });
    }

    // Check for returning client opportunities
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const inactiveClients = await prisma.client.count({
      where: {
        organizationId,
        lastActivityAt: { lt: threeMonthsAgo },
        bookings: { some: { status: "completed" } },
      },
    });

    if (inactiveClients > 10) {
      insights.push({
        type: "opportunity",
        title: "Re-engage Past Clients",
        description: `${inactiveClients} clients haven't booked in 3+ months. Consider a re-engagement campaign.`,
        actionable: true,
        action: "Send follow-up emails",
      });
    }

    return success({ insights });
  } catch (error) {
    console.error("[RevenueForecast] Error getting insights:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to get insights");
  }
}
