"use server";

import { db } from "@/lib/db";
import type { CMSPageEventType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface PageAnalyticsData {
  pageId: string;
  pageSlug: string;
  date: Date;
  pageviews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  avgScrollDepth: number;
  ctaClicks: number;
  signupClicks: number;
  conversions: number;
  sources: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  countries: Record<string, number>;
}

export interface TrackEventParams {
  pageId: string;
  pageSlug: string;
  eventType: CMSPageEventType;
  eventData?: Record<string, unknown>;
  visitorId: string;
  sessionId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
}

export interface AnalyticsSummary {
  totalPageviews: number;
  totalVisitors: number;
  avgTimeOnPage: number;
  avgBounceRate: number;
  avgScrollDepth: number;
  totalConversions: number;
  conversionRate: number;
  topPages: { slug: string; pageviews: number }[];
  topSources: { source: string; count: number }[];
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track a page event
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    await db.cMSPageEvent.create({
      data: {
        pageId: params.pageId,
        pageSlug: params.pageSlug,
        eventType: params.eventType,
        eventData: params.eventData,
        visitorId: params.visitorId,
        sessionId: params.sessionId,
        referrer: params.referrer,
        utmSource: params.utmSource,
        utmMedium: params.utmMedium,
        utmCampaign: params.utmCampaign,
        userAgent: params.userAgent,
        deviceType: params.deviceType,
        browser: params.browser,
        os: params.os,
        country: params.country,
      },
    });

    // Update session if exists
    if (params.sessionId) {
      await db.cMSVisitorSession.updateMany({
        where: { sessionId: params.sessionId },
        data: {
          lastActiveAt: new Date(),
          eventCount: { increment: 1 },
          ...(params.eventType === "pageview" ? { pageviewCount: { increment: 1 } } : {}),
        },
      });
    }
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}

/**
 * Start or update a visitor session
 */
export async function upsertSession(params: {
  visitorId: string;
  sessionId: string;
  pageId?: string;
  pageSlug?: string;
  landingUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
}): Promise<void> {
  try {
    const existing = await db.cMSVisitorSession.findUnique({
      where: { sessionId: params.sessionId },
    });

    if (existing) {
      // Update existing session
      await db.cMSVisitorSession.update({
        where: { sessionId: params.sessionId },
        data: {
          lastActiveAt: new Date(),
          exitPageId: params.pageId,
          exitPageSlug: params.pageSlug,
        },
      });
    } else {
      // Create new session
      await db.cMSVisitorSession.create({
        data: {
          visitorId: params.visitorId,
          sessionId: params.sessionId,
          entryPageId: params.pageId,
          entryPageSlug: params.pageSlug,
          landingUrl: params.landingUrl,
          referrer: params.referrer,
          utmSource: params.utmSource,
          utmMedium: params.utmMedium,
          utmCampaign: params.utmCampaign,
          utmTerm: params.utmTerm,
          utmContent: params.utmContent,
          deviceType: params.deviceType,
          browser: params.browser,
          os: params.os,
          country: params.country,
        },
      });
    }
  } catch (error) {
    console.error("Error upserting session:", error);
  }
}

/**
 * End a visitor session
 */
export async function endSession(
  sessionId: string,
  duration: number
): Promise<void> {
  try {
    await db.cMSVisitorSession.update({
      where: { sessionId },
      data: {
        endedAt: new Date(),
        totalDuration: duration,
      },
    });
  } catch (error) {
    console.error("Error ending session:", error);
  }
}

/**
 * Mark a session as converted
 */
export async function markConversion(
  sessionId: string,
  conversionType: string
): Promise<void> {
  try {
    await db.cMSVisitorSession.update({
      where: { sessionId },
      data: {
        converted: true,
        conversionType,
        conversionAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error marking conversion:", error);
  }
}

// ============================================================================
// ANALYTICS AGGREGATION
// ============================================================================

/**
 * Aggregate events into daily analytics
 */
export async function aggregateDailyAnalytics(
  pageId: string,
  pageSlug: string,
  date: Date
): Promise<void> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Get all events for this page on this day
    const events = await db.cMSPageEvent.findMany({
      where: {
        pageId,
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    });

    // Count metrics
    const pageviews = events.filter((e) => e.eventType === "pageview").length;
    const uniqueVisitors = new Set(events.map((e) => e.visitorId)).size;

    // Calculate scroll depth from scroll_depth events
    const scrollEvents = events.filter((e) => e.eventType === "scroll_depth");
    const avgScrollDepth =
      scrollEvents.length > 0
        ? scrollEvents.reduce((sum, e) => sum + ((e.eventData as { depth?: number })?.depth || 0), 0) /
          scrollEvents.length
        : 0;

    // Calculate time on page from time_on_page events
    const timeEvents = events.filter((e) => e.eventType === "time_on_page");
    const avgTimeOnPage =
      timeEvents.length > 0
        ? timeEvents.reduce((sum, e) => sum + ((e.eventData as { duration?: number })?.duration || 0), 0) /
          timeEvents.length
        : 0;

    // Count CTA clicks
    const ctaClicks = events.filter((e) => e.eventType === "cta_click").length;
    const signupClicks = events.filter(
      (e) => e.eventType === "cta_click" && (e.eventData as { ctaType?: string })?.ctaType === "signup"
    ).length;
    const conversions = events.filter((e) => e.eventType === "form_submit").length;

    // Calculate bounce rate (sessions with only one pageview)
    const sessionPageviews = new Map<string, number>();
    events
      .filter((e) => e.eventType === "pageview")
      .forEach((e) => {
        sessionPageviews.set(e.sessionId, (sessionPageviews.get(e.sessionId) || 0) + 1);
      });
    const bounceCount = Array.from(sessionPageviews.values()).filter((count) => count === 1).length;
    const bounceRate = sessionPageviews.size > 0 ? (bounceCount / sessionPageviews.size) * 100 : 0;

    // Aggregate sources
    const sources: Record<string, number> = {};
    events.forEach((e) => {
      const source = e.utmSource || (e.referrer ? "referral" : "direct");
      sources[source] = (sources[source] || 0) + 1;
    });

    // Aggregate devices
    const devices: Record<string, number> = {};
    events.forEach((e) => {
      if (e.deviceType) {
        devices[e.deviceType] = (devices[e.deviceType] || 0) + 1;
      }
    });

    // Aggregate browsers
    const browsers: Record<string, number> = {};
    events.forEach((e) => {
      if (e.browser) {
        browsers[e.browser] = (browsers[e.browser] || 0) + 1;
      }
    });

    // Aggregate countries
    const countries: Record<string, number> = {};
    events.forEach((e) => {
      if (e.country) {
        countries[e.country] = (countries[e.country] || 0) + 1;
      }
    });

    // Count entry/exit
    const sessions = await db.cMSVisitorSession.findMany({
      where: {
        OR: [{ entryPageId: pageId }, { exitPageId: pageId }],
        startedAt: { gte: startOfDay, lte: endOfDay },
      },
    });
    const entryCount = sessions.filter((s) => s.entryPageId === pageId).length;
    const exitCount = sessions.filter((s) => s.exitPageId === pageId).length;

    // Upsert daily analytics
    await db.cMSPageAnalytics.upsert({
      where: {
        pageId_date: { pageId, date: startOfDay },
      },
      create: {
        pageId,
        pageSlug,
        date: startOfDay,
        pageviews,
        uniqueVisitors,
        avgTimeOnPage,
        bounceRate,
        avgScrollDepth,
        ctaClicks,
        signupClicks,
        conversions,
        sources,
        devices,
        browsers,
        countries,
        entryCount,
        exitCount,
      },
      update: {
        pageviews,
        uniqueVisitors,
        avgTimeOnPage,
        bounceRate,
        avgScrollDepth,
        ctaClicks,
        signupClicks,
        conversions,
        sources,
        devices,
        browsers,
        countries,
        entryCount,
        exitCount,
      },
    });
  } catch (error) {
    console.error("Error aggregating daily analytics:", error);
  }
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get analytics for a specific page over a date range
 */
export async function getPageAnalytics(
  pageId: string,
  startDate: Date,
  endDate: Date
): Promise<PageAnalyticsData[]> {
  const analytics = await db.cMSPageAnalytics.findMany({
    where: {
      pageId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  return analytics.map((a) => ({
    pageId: a.pageId,
    pageSlug: a.pageSlug,
    date: a.date,
    pageviews: a.pageviews,
    uniqueVisitors: a.uniqueVisitors,
    avgTimeOnPage: a.avgTimeOnPage,
    bounceRate: a.bounceRate,
    avgScrollDepth: a.avgScrollDepth,
    ctaClicks: a.ctaClicks,
    signupClicks: a.signupClicks,
    conversions: a.conversions,
    sources: (a.sources as Record<string, number>) || {},
    devices: (a.devices as Record<string, number>) || {},
    browsers: (a.browsers as Record<string, number>) || {},
    countries: (a.countries as Record<string, number>) || {},
  }));
}

/**
 * Get summary analytics across all pages
 */
export async function getAnalyticsSummary(
  startDate: Date,
  endDate: Date
): Promise<AnalyticsSummary> {
  const analytics = await db.cMSPageAnalytics.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
  });

  const totalPageviews = analytics.reduce((sum, a) => sum + a.pageviews, 0);
  const totalVisitors = analytics.reduce((sum, a) => sum + a.uniqueVisitors, 0);
  const totalConversions = analytics.reduce((sum, a) => sum + a.conversions, 0);

  const avgTimeOnPage =
    analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.avgTimeOnPage, 0) / analytics.length
      : 0;

  const avgBounceRate =
    analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.bounceRate, 0) / analytics.length
      : 0;

  const avgScrollDepth =
    analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.avgScrollDepth, 0) / analytics.length
      : 0;

  const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

  // Aggregate by page
  const pageMap = new Map<string, number>();
  analytics.forEach((a) => {
    pageMap.set(a.pageSlug, (pageMap.get(a.pageSlug) || 0) + a.pageviews);
  });
  const topPages = Array.from(pageMap.entries())
    .map(([slug, pageviews]) => ({ slug, pageviews }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 10);

  // Aggregate sources
  const sourceMap = new Map<string, number>();
  analytics.forEach((a) => {
    const sources = (a.sources as Record<string, number>) || {};
    Object.entries(sources).forEach(([source, count]) => {
      sourceMap.set(source, (sourceMap.get(source) || 0) + count);
    });
  });
  const topSources = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalPageviews,
    totalVisitors,
    avgTimeOnPage,
    avgBounceRate,
    avgScrollDepth,
    totalConversions,
    conversionRate,
    topPages,
    topSources,
  };
}

/**
 * Get real-time visitor count (last 5 minutes)
 */
export async function getRealTimeVisitors(): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const sessions = await db.cMSVisitorSession.count({
    where: {
      lastActiveAt: { gte: fiveMinutesAgo },
      endedAt: null,
    },
  });

  return sessions;
}

/**
 * Get recent events for a page
 */
export async function getRecentEvents(
  pageId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  eventType: CMSPageEventType;
  eventData: Record<string, unknown> | null;
  timestamp: Date;
  visitorId: string;
}>> {
  const events = await db.cMSPageEvent.findMany({
    where: { pageId },
    orderBy: { timestamp: "desc" },
    take: limit,
    select: {
      id: true,
      eventType: true,
      eventData: true,
      timestamp: true,
      visitorId: true,
    },
  });

  return events.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    eventData: e.eventData as Record<string, unknown> | null,
    timestamp: e.timestamp,
    visitorId: e.visitorId,
  }));
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Clean up old events (keep last 90 days of raw events)
 */
export async function cleanupOldEvents(): Promise<{ deleted: number }> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const result = await db.cMSPageEvent.deleteMany({
    where: {
      timestamp: { lt: ninetyDaysAgo },
    },
  });

  return { deleted: result.count };
}

/**
 * Clean up old sessions (keep last 30 days)
 */
export async function cleanupOldSessions(): Promise<{ deleted: number }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await db.cMSVisitorSession.deleteMany({
    where: {
      startedAt: { lt: thirtyDaysAgo },
    },
  });

  return { deleted: result.count };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
// Note: Utility functions (parseUserAgent, parseReferrer, generateVisitorId,
// generateSessionId) are in analytics-utils.ts because "use server" files
// require all exports to be async functions.
