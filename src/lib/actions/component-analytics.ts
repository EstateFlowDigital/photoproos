"use server";

import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { success, fail, type ActionResult } from "@/lib/types/action-result";
import type { ComponentAnalytics } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface TrackComponentEventInput {
  pageId: string;
  componentId: string;
  componentType: string;
  event: "impression" | "click" | "scroll_view";
  scrollDepth?: number;
  timeInView?: number;
}

export interface ComponentMetrics {
  componentId: string;
  componentType: string;
  totalImpressions: number;
  totalClicks: number;
  avgScrollDepth: number;
  avgTimeInView: number;
  clickRate: number;
}

export interface PageAnalytics {
  pageId: string;
  totalViews: number;
  uniqueComponents: number;
  componentMetrics: ComponentMetrics[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// TRACKING
// ============================================================================

/**
 * Track a component event
 */
export async function trackComponentEvent(
  input: TrackComponentEventInput
): Promise<ActionResult<void>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert analytics record for today
    await prisma.componentAnalytics.upsert({
      where: {
        pageId_componentId_date: {
          pageId: input.pageId,
          componentId: input.componentId,
          date: today,
        },
      },
      create: {
        pageId: input.pageId,
        componentId: input.componentId,
        componentType: input.componentType,
        date: today,
        impressions: input.event === "impression" ? 1 : 0,
        clicks: input.event === "click" ? 1 : 0,
        scrollDepth: input.scrollDepth || 0,
        timeInView: input.timeInView || 0,
      },
      update: {
        impressions: input.event === "impression" ? { increment: 1 } : undefined,
        clicks: input.event === "click" ? { increment: 1 } : undefined,
        // For scroll depth and time, we average the new value with existing
        ...(input.scrollDepth && {
          scrollDepth: input.scrollDepth, // Will be averaged on read
        }),
        ...(input.timeInView && {
          timeInView: { increment: input.timeInView },
        }),
      },
    });

    return success(undefined);
  } catch (error) {
    console.error("Error tracking component event:", error);
    return fail("Failed to track event");
  }
}

/**
 * Batch track multiple impressions (more efficient for page loads)
 */
export async function trackPageImpression(
  pageId: string,
  components: { componentId: string; componentType: string }[]
): Promise<ActionResult<void>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use transaction for efficiency
    await prisma.$transaction(
      components.map((component) =>
        prisma.componentAnalytics.upsert({
          where: {
            pageId_componentId_date: {
              pageId,
              componentId: component.componentId,
              date: today,
            },
          },
          create: {
            pageId,
            componentId: component.componentId,
            componentType: component.componentType,
            date: today,
            impressions: 1,
          },
          update: {
            impressions: { increment: 1 },
          },
        })
      )
    );

    return success(undefined);
  } catch (error) {
    console.error("Error tracking page impression:", error);
    return fail("Failed to track page impression");
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get analytics for a specific page
 */
export async function getPageAnalytics(
  pageId: string,
  days: number = 30
): Promise<ActionResult<PageAnalytics>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // Get all analytics records for this page in the date range
    const records = await prisma.componentAnalytics.findMany({
      where: {
        pageId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Aggregate by component
    const componentMap = new Map<string, ComponentAnalytics[]>();
    for (const record of records) {
      const existing = componentMap.get(record.componentId) || [];
      existing.push(record);
      componentMap.set(record.componentId, existing);
    }

    // Calculate metrics per component
    const componentMetrics: ComponentMetrics[] = [];
    let totalViews = 0;

    for (const [componentId, componentRecords] of componentMap) {
      const totalImpressions = componentRecords.reduce((sum, r) => sum + r.impressions, 0);
      const totalClicks = componentRecords.reduce((sum, r) => sum + r.clicks, 0);
      const totalScrollDepth = componentRecords.reduce((sum, r) => sum + r.scrollDepth, 0);
      const totalTime = componentRecords.reduce((sum, r) => sum + r.timeInView, 0);

      totalViews = Math.max(totalViews, totalImpressions);

      componentMetrics.push({
        componentId,
        componentType: componentRecords[0].componentType,
        totalImpressions,
        totalClicks,
        avgScrollDepth: componentRecords.length > 0 ? totalScrollDepth / componentRecords.length : 0,
        avgTimeInView: totalImpressions > 0 ? totalTime / totalImpressions : 0,
        clickRate: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      });
    }

    return success({
      pageId,
      totalViews,
      uniqueComponents: componentMetrics.length,
      componentMetrics,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    console.error("Error getting page analytics:", error);
    return fail("Failed to get page analytics");
  }
}

/**
 * Get analytics for a specific component across all pages
 */
export async function getComponentTypeAnalytics(
  componentType: string,
  days: number = 30
): Promise<
  ActionResult<{
    componentType: string;
    totalImpressions: number;
    totalClicks: number;
    avgClickRate: number;
    pages: { pageId: string; impressions: number; clicks: number }[];
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.componentAnalytics.findMany({
      where: {
        componentType,
        date: { gte: startDate },
      },
    });

    // Aggregate totals
    const totalImpressions = records.reduce((sum, r) => sum + r.impressions, 0);
    const totalClicks = records.reduce((sum, r) => sum + r.clicks, 0);

    // Group by page
    const pageMap = new Map<string, { impressions: number; clicks: number }>();
    for (const record of records) {
      const existing = pageMap.get(record.pageId) || { impressions: 0, clicks: 0 };
      existing.impressions += record.impressions;
      existing.clicks += record.clicks;
      pageMap.set(record.pageId, existing);
    }

    const pages = Array.from(pageMap.entries()).map(([pageId, stats]) => ({
      pageId,
      ...stats,
    }));

    return success({
      componentType,
      totalImpressions,
      totalClicks,
      avgClickRate: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      pages,
    });
  } catch (error) {
    console.error("Error getting component type analytics:", error);
    return fail("Failed to get component analytics");
  }
}

/**
 * Get daily analytics for a page
 */
export async function getDailyPageAnalytics(
  pageId: string,
  days: number = 30
): Promise<
  ActionResult<{
    daily: {
      date: Date;
      impressions: number;
      clicks: number;
      clickRate: number;
    }[];
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.componentAnalytics.findMany({
      where: {
        pageId,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    // Group by date
    const dateMap = new Map<string, { impressions: number; clicks: number }>();
    for (const record of records) {
      const dateKey = record.date.toISOString().split("T")[0];
      const existing = dateMap.get(dateKey) || { impressions: 0, clicks: 0 };
      existing.impressions += record.impressions;
      existing.clicks += record.clicks;
      dateMap.set(dateKey, existing);
    }

    const daily = Array.from(dateMap.entries())
      .map(([dateKey, stats]) => ({
        date: new Date(dateKey),
        impressions: stats.impressions,
        clicks: stats.clicks,
        clickRate: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return success({ daily });
  } catch (error) {
    console.error("Error getting daily page analytics:", error);
    return fail("Failed to get daily analytics");
  }
}
