"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ok, fail, success } from "@/lib/types/action-result";

// =============================================================================
// Lead Scoring Configuration
// =============================================================================

const SCORING_WEIGHTS = {
  pageViews: 2,          // Points per page view
  photoViews: 1,         // Points per photo view
  tourClicks: 10,        // Points per virtual tour click
  timeOnSite: 0.1,       // Points per second on site
  formSubmission: 25,    // Points for submitting inquiry form
  returnVisit: 15,       // Points for returning within 7 days
  mobileView: 5,         // Bonus for mobile viewing (serious buyer)
};

const TEMPERATURE_THRESHOLDS = {
  hot: 70,    // Score >= 70 = Hot lead
  warm: 30,   // Score >= 30 = Warm lead
  cold: 0,    // Score < 30 = Cold lead
};

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

function calculateTemperature(score: number): "hot" | "warm" | "cold" {
  if (score >= TEMPERATURE_THRESHOLDS.hot) return "hot";
  if (score >= TEMPERATURE_THRESHOLDS.warm) return "warm";
  return "cold";
}

function calculateScore(metrics: {
  pageViews: number;
  photoViews: number;
  tourClicks: number;
  totalTimeSeconds: number;
  isReturnVisit?: boolean;
  isMobile?: boolean;
}): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};

  breakdown.pageViews = metrics.pageViews * SCORING_WEIGHTS.pageViews;
  breakdown.photoViews = metrics.photoViews * SCORING_WEIGHTS.photoViews;
  breakdown.tourClicks = metrics.tourClicks * SCORING_WEIGHTS.tourClicks;
  breakdown.timeOnSite = Math.round(metrics.totalTimeSeconds * SCORING_WEIGHTS.timeOnSite);

  if (metrics.isReturnVisit) {
    breakdown.returnVisit = SCORING_WEIGHTS.returnVisit;
  }

  if (metrics.isMobile) {
    breakdown.mobileView = SCORING_WEIGHTS.mobileView;
  }

  const score = Math.min(100, Object.values(breakdown).reduce((a, b) => a + b, 0));

  return { score, breakdown };
}

// =============================================================================
// Lead Scoring Actions
// =============================================================================

/**
 * Track lead engagement event
 */
export async function trackLeadEngagement(
  leadId: string,
  event: "page_view" | "photo_view" | "tour_click" | "time_spent",
  value?: number
) {
  try {
    const lead = await prisma.propertyLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return fail("Lead not found");
    }

    const updates: Record<string, number | Date> = {
      lastActivityAt: new Date(),
    };

    switch (event) {
      case "page_view":
        updates.pageViews = lead.pageViews + 1;
        break;
      case "photo_view":
        updates.photoViews = lead.photoViews + (value || 1);
        break;
      case "tour_click":
        updates.tourClicks = lead.tourClicks + 1;
        break;
      case "time_spent":
        updates.totalTimeSeconds = lead.totalTimeSeconds + (value || 0);
        break;
    }

    // Recalculate score
    const { score, breakdown } = calculateScore({
      pageViews: (updates.pageViews as number) || lead.pageViews,
      photoViews: (updates.photoViews as number) || lead.photoViews,
      tourClicks: (updates.tourClicks as number) || lead.tourClicks,
      totalTimeSeconds: (updates.totalTimeSeconds as number) || lead.totalTimeSeconds,
    });

    await prisma.propertyLead.update({
      where: { id: leadId },
      data: {
        ...updates,
        score,
        scoreBreakdown: breakdown,
        temperature: calculateTemperature(score),
      },
    });

    return ok();
  } catch (error) {
    console.error("[Lead Scoring] Error tracking engagement:", error);
    return fail("Failed to track engagement");
  }
}

/**
 * Get leads by temperature for a property website
 */
export async function getLeadsByTemperature(propertyWebsiteId: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    // Verify property belongs to org
    const property = await prisma.propertyWebsite.findFirst({
      where: {
        id: propertyWebsiteId,
        project: { organizationId },
      },
    });

    if (!property) {
      return fail("Property website not found");
    }

    const leads = await prisma.propertyLead.findMany({
      where: { propertyWebsiteId },
      orderBy: { score: "desc" },
    });

    const grouped = {
      hot: leads.filter((l) => l.temperature === "hot"),
      warm: leads.filter((l) => l.temperature === "warm"),
      cold: leads.filter((l) => l.temperature === "cold"),
    };

    return success({
      leads,
      grouped,
      summary: {
        total: leads.length,
        hot: grouped.hot.length,
        warm: grouped.warm.length,
        cold: grouped.cold.length,
      },
    });
  } catch (error) {
    console.error("[Lead Scoring] Error fetching leads:", error);
    return fail("Failed to fetch leads");
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  status: "new" | "contacted" | "qualified" | "closed"
) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const lead = await prisma.propertyLead.findFirst({
      where: { id: leadId },
      include: {
        propertyWebsite: {
          include: { project: true },
        },
      },
    });

    if (!lead || lead.propertyWebsite.project.organizationId !== organizationId) {
      return fail("Lead not found");
    }

    const updateData: Record<string, Date | string> = { status };

    if (status === "contacted" && !lead.contactedAt) {
      updateData.contactedAt = new Date();
    }

    await prisma.propertyLead.update({
      where: { id: leadId },
      data: updateData,
    });

    return ok();
  } catch (error) {
    console.error("[Lead Scoring] Error updating status:", error);
    return fail("Failed to update lead status");
  }
}

/**
 * Add notes to a lead
 */
export async function addLeadNotes(leadId: string, notes: string) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const lead = await prisma.propertyLead.findFirst({
      where: { id: leadId },
      include: {
        propertyWebsite: {
          include: { project: true },
        },
      },
    });

    if (!lead || lead.propertyWebsite.project.organizationId !== organizationId) {
      return fail("Lead not found");
    }

    await prisma.propertyLead.update({
      where: { id: leadId },
      data: { notes },
    });

    return ok();
  } catch (error) {
    console.error("[Lead Scoring] Error adding notes:", error);
    return fail("Failed to add notes");
  }
}

/**
 * Set follow-up date for a lead
 */
export async function setLeadFollowUp(leadId: string, followUpDate: Date) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const lead = await prisma.propertyLead.findFirst({
      where: { id: leadId },
      include: {
        propertyWebsite: {
          include: { project: true },
        },
      },
    });

    if (!lead || lead.propertyWebsite.project.organizationId !== organizationId) {
      return fail("Lead not found");
    }

    await prisma.propertyLead.update({
      where: { id: leadId },
      data: { followUpDate },
    });

    return ok();
  } catch (error) {
    console.error("[Lead Scoring] Error setting follow-up:", error);
    return fail("Failed to set follow-up date");
  }
}

/**
 * Get leads needing follow-up today
 */
export async function getLeadsForFollowUp() {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leads = await prisma.propertyLead.findMany({
      where: {
        propertyWebsite: {
          project: { organizationId },
        },
        followUpDate: {
          gte: today,
          lt: tomorrow,
        },
        status: { not: "closed" },
      },
      include: {
        propertyWebsite: {
          select: { address: true, slug: true },
        },
      },
      orderBy: { followUpDate: "asc" },
    });

    return success(leads);
  } catch (error) {
    console.error("[Lead Scoring] Error fetching follow-ups:", error);
    return fail("Failed to fetch follow-ups");
  }
}

/**
 * Get lead analytics for dashboard
 */
export async function getLeadAnalytics(dateRange?: { from: Date; to: Date }) {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return fail("Organization not found");
  }

  try {
    const where = {
      propertyWebsite: {
        project: { organizationId },
      },
      ...(dateRange && {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      }),
    };

    const [total, byTemperature, byStatus, recentLeads] = await Promise.all([
      prisma.propertyLead.count({ where }),
      prisma.propertyLead.groupBy({
        by: ["temperature"],
        where,
        _count: true,
      }),
      prisma.propertyLead.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      prisma.propertyLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          propertyWebsite: {
            select: { address: true },
          },
        },
      }),
    ]);

    const temperatureMap = Object.fromEntries(
      byTemperature.map((t) => [t.temperature, t._count])
    );

    const statusMap = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count])
    );

    return success({
      total,
      byTemperature: {
        hot: temperatureMap["hot"] || 0,
        warm: temperatureMap["warm"] || 0,
        cold: temperatureMap["cold"] || 0,
      },
      byStatus: {
        new: statusMap["new"] || 0,
        contacted: statusMap["contacted"] || 0,
        qualified: statusMap["qualified"] || 0,
        closed: statusMap["closed"] || 0,
      },
      recentLeads,
    });
  } catch (error) {
    console.error("[Lead Scoring] Error fetching analytics:", error);
    return fail("Failed to fetch lead analytics");
  }
}
