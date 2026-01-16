"use server";

import { db } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import {
  getPageAnalytics,
  getAnalyticsSummary,
  getRealTimeVisitors,
  getRecentEvents,
  aggregateDailyAnalytics,
  cleanupOldEvents,
  cleanupOldSessions,
  type PageAnalyticsData,
  type AnalyticsSummary,
} from "@/lib/cms/analytics";
import type { CMSPageEventType } from "@prisma/client";

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get analytics for a specific page
 */
export async function getPageAnalyticsData(
  pageId: string,
  days: number = 30
): Promise<ActionResult<PageAnalyticsData[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await getPageAnalytics(pageId, startDate, endDate);
    return success(analytics);
  } catch (error) {
    console.error("Error fetching page analytics:", error);
    return fail("Failed to fetch page analytics");
  }
}

/**
 * Get analytics summary across all pages
 */
export async function getAnalyticsSummaryData(
  days: number = 30
): Promise<ActionResult<AnalyticsSummary>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summary = await getAnalyticsSummary(startDate, endDate);
    return success(summary);
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    return fail("Failed to fetch analytics summary");
  }
}

/**
 * Get real-time visitor count
 */
export async function getRealTimeVisitorCount(): Promise<ActionResult<number>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const count = await getRealTimeVisitors();
    return success(count);
  } catch (error) {
    console.error("Error fetching real-time visitors:", error);
    return fail("Failed to fetch real-time visitors");
  }
}

/**
 * Get recent events for a page
 */
export async function getPageRecentEvents(
  pageId: string,
  limit: number = 50
): Promise<
  ActionResult<
    Array<{
      id: string;
      eventType: CMSPageEventType;
      eventData: Record<string, unknown> | null;
      timestamp: Date;
      visitorId: string;
    }>
  >
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const events = await getRecentEvents(pageId, limit);
    return success(events);
  } catch (error) {
    console.error("Error fetching recent events:", error);
    return fail("Failed to fetch recent events");
  }
}

/**
 * Get top pages by pageviews
 */
export async function getTopPages(
  days: number = 30,
  limit: number = 10
): Promise<
  ActionResult<
    Array<{
      pageSlug: string;
      pageviews: number;
      uniqueVisitors: number;
      avgTimeOnPage: number;
      bounceRate: number;
    }>
  >
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await db.cMSPageAnalytics.groupBy({
      by: ["pageSlug"],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        pageviews: true,
        uniqueVisitors: true,
      },
      _avg: {
        avgTimeOnPage: true,
        bounceRate: true,
      },
      orderBy: {
        _sum: {
          pageviews: "desc",
        },
      },
      take: limit,
    });

    return success(
      analytics.map((a) => ({
        pageSlug: a.pageSlug,
        pageviews: a._sum.pageviews || 0,
        uniqueVisitors: a._sum.uniqueVisitors || 0,
        avgTimeOnPage: a._avg.avgTimeOnPage || 0,
        bounceRate: a._avg.bounceRate || 0,
      }))
    );
  } catch (error) {
    console.error("Error fetching top pages:", error);
    return fail("Failed to fetch top pages");
  }
}

/**
 * Get traffic sources breakdown
 */
export async function getTrafficSources(
  days: number = 30
): Promise<ActionResult<Record<string, number>>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await db.cMSPageAnalytics.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      select: {
        sources: true,
      },
    });

    // Aggregate all sources
    const sources: Record<string, number> = {};
    analytics.forEach((a) => {
      const pageSources = (a.sources as Record<string, number>) || {};
      Object.entries(pageSources).forEach(([source, count]) => {
        sources[source] = (sources[source] || 0) + count;
      });
    });

    return success(sources);
  } catch (error) {
    console.error("Error fetching traffic sources:", error);
    return fail("Failed to fetch traffic sources");
  }
}

/**
 * Get device breakdown
 */
export async function getDeviceBreakdown(
  days: number = 30
): Promise<ActionResult<Record<string, number>>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await db.cMSPageAnalytics.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      select: {
        devices: true,
      },
    });

    // Aggregate all devices
    const devices: Record<string, number> = {};
    analytics.forEach((a) => {
      const pageDevices = (a.devices as Record<string, number>) || {};
      Object.entries(pageDevices).forEach(([device, count]) => {
        devices[device] = (devices[device] || 0) + count;
      });
    });

    return success(devices);
  } catch (error) {
    console.error("Error fetching device breakdown:", error);
    return fail("Failed to fetch device breakdown");
  }
}

/**
 * Get country breakdown
 */
export async function getCountryBreakdown(
  days: number = 30
): Promise<ActionResult<Record<string, number>>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await db.cMSPageAnalytics.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      select: {
        countries: true,
      },
    });

    // Aggregate all countries
    const countries: Record<string, number> = {};
    analytics.forEach((a) => {
      const pageCountries = (a.countries as Record<string, number>) || {};
      Object.entries(pageCountries).forEach(([country, count]) => {
        countries[country] = (countries[country] || 0) + count;
      });
    });

    return success(countries);
  } catch (error) {
    console.error("Error fetching country breakdown:", error);
    return fail("Failed to fetch country breakdown");
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(
  pageId: string,
  days: number = 30
): Promise<
  ActionResult<{
    visitors: number;
    engaged: number;
    ctaClicks: number;
    conversions: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await db.cMSPageAnalytics.aggregate({
      where: {
        pageId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        uniqueVisitors: true,
        ctaClicks: true,
        conversions: true,
      },
    });

    // Calculate "engaged" as visitors who scrolled > 50% or spent > 30 seconds
    const engagedAnalytics = await db.cMSPageAnalytics.findMany({
      where: {
        pageId,
        date: { gte: startDate, lte: endDate },
        OR: [{ avgScrollDepth: { gte: 50 } }, { avgTimeOnPage: { gte: 30 } }],
      },
    });
    const engaged = engagedAnalytics.reduce((sum, a) => sum + a.uniqueVisitors, 0);

    return success({
      visitors: analytics._sum.uniqueVisitors || 0,
      engaged,
      ctaClicks: analytics._sum.ctaClicks || 0,
      conversions: analytics._sum.conversions || 0,
    });
  } catch (error) {
    console.error("Error fetching conversion funnel:", error);
    return fail("Failed to fetch conversion funnel");
  }
}

/**
 * Get daily trend data
 */
export async function getDailyTrend(
  days: number = 30
): Promise<
  ActionResult<
    Array<{
      date: string;
      pageviews: number;
      uniqueVisitors: number;
      conversions: number;
    }>
  >
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await db.cMSPageAnalytics.groupBy({
      by: ["date"],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        pageviews: true,
        uniqueVisitors: true,
        conversions: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return success(
      analytics.map((a) => ({
        date: a.date.toISOString().split("T")[0],
        pageviews: a._sum.pageviews || 0,
        uniqueVisitors: a._sum.uniqueVisitors || 0,
        conversions: a._sum.conversions || 0,
      }))
    );
  } catch (error) {
    console.error("Error fetching daily trend:", error);
    return fail("Failed to fetch daily trend");
  }
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

/**
 * Trigger daily analytics aggregation for a page
 */
export async function triggerAggregation(
  pageId: string,
  pageSlug: string,
  date?: Date
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await aggregateDailyAnalytics(pageId, pageSlug, date || new Date());
    return success(undefined);
  } catch (error) {
    console.error("Error triggering aggregation:", error);
    return fail("Failed to trigger aggregation");
  }
}

/**
 * Clean up old analytics data
 */
export async function cleanupAnalyticsData(): Promise<
  ActionResult<{ events: number; sessions: number }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const [events, sessions] = await Promise.all([
      cleanupOldEvents(),
      cleanupOldSessions(),
    ]);

    return success({
      events: events.deleted,
      sessions: sessions.deleted,
    });
  } catch (error) {
    console.error("Error cleaning up analytics data:", error);
    return fail("Failed to clean up analytics data");
  }
}

/**
 * Get analytics dashboard data (all-in-one)
 */
export async function getAnalyticsDashboardData(
  days: number = 30
): Promise<
  ActionResult<{
    summary: AnalyticsSummary;
    dailyTrend: Array<{
      date: string;
      pageviews: number;
      uniqueVisitors: number;
    }>;
    topPages: Array<{ pageSlug: string; pageviews: number }>;
    sources: Record<string, number>;
    devices: Record<string, number>;
    realTimeVisitors: number;
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all data in parallel
    const [summary, topPagesResult, sourcesResult, devicesResult, realTime] =
      await Promise.all([
        getAnalyticsSummary(startDate, endDate),
        getTopPages(days, 5),
        getTrafficSources(days),
        getDeviceBreakdown(days),
        getRealTimeVisitors(),
      ]);

    // Get daily trend
    const dailyTrendResult = await getDailyTrend(days);

    // Extract data from results
    const topPages = topPagesResult.success && topPagesResult.data
      ? topPagesResult.data.map((p) => ({
          pageSlug: p.pageSlug,
          pageviews: p.pageviews,
        }))
      : [];

    const sources = sourcesResult.success && sourcesResult.data
      ? sourcesResult.data
      : {};

    const devices = devicesResult.success && devicesResult.data
      ? devicesResult.data
      : {};

    const dailyTrend = dailyTrendResult.success && dailyTrendResult.data
      ? dailyTrendResult.data.map((d) => ({
          date: d.date,
          pageviews: d.pageviews,
          uniqueVisitors: d.uniqueVisitors,
        }))
      : [];

    return success({
      summary,
      dailyTrend,
      topPages,
      sources,
      devices,
      realTimeVisitors: realTime,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return fail("Failed to fetch dashboard data");
  }
}
