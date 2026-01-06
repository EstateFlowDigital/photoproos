"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getClientSession } from "@/lib/actions/client-auth";
import { ok } from "@/lib/types/action-result";

// Types for selections
export interface Selection {
  id: string;
  assetId: string;
  notes: string | null;
  status: "in_progress" | "submitted" | "approved" | "rejected";
  createdAt: Date;
  submittedAt: Date | null;
  asset: {
    id: string;
    filename: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
  };
}

export interface SelectionSummary {
  total: number;
  limit: number | null;
  submitted: boolean;
  submittedAt: Date | null;
  status: "in_progress" | "submitted" | "approved" | "rejected";
}

// ============== ADMIN ACTIONS ==============

/**
 * Get all selections for a gallery (admin view)
 */
export async function getGallerySelections(projectId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify gallery belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
      select: {
        id: true,
        selectionLimit: true,
        selectionsSubmitted: true,
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Get all selections (type = selection)
    const selections = await prisma.galleryFavorite.findMany({
      where: {
        projectId,
        selectionType: "selection",
      },
      include: {
        asset: {
          select: {
            id: true,
            filename: true,
            thumbnailUrl: true,
            mediumUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by clientEmail
    const selectionsByClient = selections.reduce((acc, sel) => {
      const key = sel.clientEmail || "anonymous";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(sel);
      return acc;
    }, {} as Record<string, typeof selections>);

    return {
      success: true,
      data: {
        selections,
        selectionsByClient,
        limit: gallery.selectionLimit,
        submitted: gallery.selectionsSubmitted,
      },
    };
  } catch (error) {
    console.error("Error fetching gallery selections:", error);
    return { success: false, error: "Failed to fetch selections" };
  }
}

/**
 * Update gallery selection settings (admin)
 */
export async function updateSelectionSettings(
  projectId: string,
  settings: {
    allowSelections?: boolean;
    selectionLimit?: number | null;
    selectionRequired?: boolean;
  }
) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify gallery belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: settings,
    });

    revalidatePath(`/galleries/${projectId}`);

    return ok();
  } catch (error) {
    console.error("Error updating selection settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

/**
 * Approve or reject client selections (admin)
 */
export async function reviewSelections(
  projectId: string,
  status: "approved" | "rejected"
) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify gallery belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Update all submitted selections
    await prisma.galleryFavorite.updateMany({
      where: {
        projectId,
        selectionType: "selection",
        status: "submitted",
      },
      data: { status },
    });

    revalidatePath(`/galleries/${projectId}`);

    return ok();
  } catch (error) {
    console.error("Error reviewing selections:", error);
    return { success: false, error: "Failed to review selections" };
  }
}

/**
 * Export selections as CSV (admin)
 */
export async function exportSelectionsCSV(projectId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify gallery belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
      select: { id: true, name: true },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Get all selections
    const selections = await prisma.galleryFavorite.findMany({
      where: {
        projectId,
        selectionType: "selection",
      },
      include: {
        asset: {
          select: {
            filename: true,
            originalUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Generate CSV
    const headers = ["Filename", "Client Email", "Notes", "Status", "Selected At", "Submitted At"];
    const rows = selections.map((s) => [
      s.asset.filename,
      s.clientEmail || "Anonymous",
      s.notes || "",
      s.status,
      s.createdAt.toISOString(),
      s.submittedAt?.toISOString() || "",
    ]);

    const csv = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    return {
      success: true,
      data: {
        csv,
        filename: `${gallery.name.replace(/[^a-z0-9]/gi, "_")}-selections.csv`,
      },
    };
  } catch (error) {
    console.error("Error exporting selections:", error);
    return { success: false, error: "Failed to export selections" };
  }
}

// ============== CLIENT ACTIONS ==============

/**
 * Get client's selections for a gallery
 */
export async function getClientSelections(projectId: string, deliverySlug?: string) {
  const clientSession = await getClientSession();

  try {
    // Verify gallery access
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        allowSelections: true,
        selectionLimit: true,
        selectionsSubmitted: true,
        status: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
        },
        client: {
          select: { id: true },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Check access
    const hasClientAccess = clientSession && gallery.client?.id === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && gallery.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return { success: false, error: "Unauthorized" };
    }

    if (!gallery.allowSelections) {
      return { success: false, error: "Selections not enabled for this gallery" };
    }

    // Get client's selections
    const clientEmail = clientSession?.client?.email || null;
    const selections = await prisma.galleryFavorite.findMany({
      where: {
        projectId,
        selectionType: "selection",
        ...(clientEmail ? { clientEmail } : {}),
      },
      include: {
        asset: {
          select: {
            id: true,
            filename: true,
            thumbnailUrl: true,
            mediumUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get latest status
    const latestStatus = selections.length > 0 ? selections[0].status : "in_progress";
    const submittedAt = selections.find((s) => s.submittedAt)?.submittedAt || null;

    return {
      success: true,
      data: {
        selections,
        summary: {
          total: selections.length,
          limit: gallery.selectionLimit,
          submitted: gallery.selectionsSubmitted,
          submittedAt,
          status: latestStatus,
        } as SelectionSummary,
      },
    };
  } catch (error) {
    console.error("Error fetching client selections:", error);
    return { success: false, error: "Failed to fetch selections" };
  }
}

/**
 * Toggle a photo selection (client)
 */
export async function toggleSelection(
  projectId: string,
  assetId: string,
  deliverySlug?: string
) {
  const clientSession = await getClientSession();

  try {
    // Verify gallery access
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        allowSelections: true,
        selectionLimit: true,
        selectionsSubmitted: true,
        status: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
        },
        client: {
          select: { id: true },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Check access
    const hasClientAccess = clientSession && gallery.client?.id === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && gallery.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return { success: false, error: "Unauthorized" };
    }

    if (!gallery.allowSelections) {
      return { success: false, error: "Selections not enabled" };
    }

    if (gallery.selectionsSubmitted) {
      return { success: false, error: "Selections already submitted" };
    }

    const clientEmail = clientSession?.client?.email || null;

    // Check if already selected
    const existing = await prisma.galleryFavorite.findFirst({
      where: {
        projectId,
        assetId,
        selectionType: "selection",
        ...(clientEmail ? { clientEmail } : {}),
      },
    });

    if (existing) {
      // Remove selection
      await prisma.galleryFavorite.delete({
        where: { id: existing.id },
      });

      return { success: true, data: { selected: false } };
    }

    // Check limit
    if (gallery.selectionLimit) {
      const currentCount = await prisma.galleryFavorite.count({
        where: {
          projectId,
          selectionType: "selection",
          ...(clientEmail ? { clientEmail } : {}),
        },
      });

      if (currentCount >= gallery.selectionLimit) {
        return {
          success: false,
          error: `Selection limit reached (${gallery.selectionLimit} photos)`,
        };
      }
    }

    // Add selection
    await prisma.galleryFavorite.create({
      data: {
        projectId,
        assetId,
        clientEmail,
        selectionType: "selection",
        status: "in_progress",
      },
    });

    return { success: true, data: { selected: true } };
  } catch (error) {
    console.error("Error toggling selection:", error);
    return { success: false, error: "Failed to update selection" };
  }
}

/**
 * Update selection notes (client)
 */
export async function updateSelectionNotes(
  projectId: string,
  assetId: string,
  notes: string,
  deliverySlug?: string
) {
  const clientSession = await getClientSession();

  try {
    // Verify gallery access (simplified - same pattern as above)
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        allowSelections: true,
        selectionsSubmitted: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
        },
        client: {
          select: { id: true },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    const hasClientAccess = clientSession && gallery.client?.id === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && gallery.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return { success: false, error: "Unauthorized" };
    }

    if (gallery.selectionsSubmitted) {
      return { success: false, error: "Cannot edit notes after submission" };
    }

    const clientEmail = clientSession?.client?.email || null;

    await prisma.galleryFavorite.updateMany({
      where: {
        projectId,
        assetId,
        selectionType: "selection",
        ...(clientEmail ? { clientEmail } : {}),
      },
      data: { notes: notes.trim() || null },
    });

    return ok();
  } catch (error) {
    console.error("Error updating selection notes:", error);
    return { success: false, error: "Failed to update notes" };
  }
}

/**
 * Submit selections for review (client)
 */
export async function submitSelections(projectId: string, deliverySlug?: string) {
  const clientSession = await getClientSession();

  try {
    // Verify gallery access
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        allowSelections: true,
        selectionsSubmitted: true,
        selectionLimit: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
        },
        client: {
          select: { id: true },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    const hasClientAccess = clientSession && gallery.client?.id === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && gallery.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return { success: false, error: "Unauthorized" };
    }

    if (gallery.selectionsSubmitted) {
      return { success: false, error: "Selections already submitted" };
    }

    const clientEmail = clientSession?.client?.email || null;

    // Get current selections count
    const selectionCount = await prisma.galleryFavorite.count({
      where: {
        projectId,
        selectionType: "selection",
        ...(clientEmail ? { clientEmail } : {}),
      },
    });

    if (selectionCount === 0) {
      return { success: false, error: "No selections to submit" };
    }

    const now = new Date();

    // Update all selections to submitted
    await prisma.galleryFavorite.updateMany({
      where: {
        projectId,
        selectionType: "selection",
        ...(clientEmail ? { clientEmail } : {}),
      },
      data: {
        status: "submitted",
        submittedAt: now,
      },
    });

    // Mark gallery as having submitted selections
    await prisma.project.update({
      where: { id: projectId },
      data: { selectionsSubmitted: true },
    });

    // Log activity
    const org = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (org) {
      await prisma.activityLog.create({
        data: {
          organizationId: org.organizationId,
          type: "selections_submitted",
          description: `Client submitted ${selectionCount} photo selections`,
          projectId,
          metadata: {
            selectionCount,
            clientEmail,
          },
        },
      });
    }

    return { success: true, data: { count: selectionCount } };
  } catch (error) {
    console.error("Error submitting selections:", error);
    return { success: false, error: "Failed to submit selections" };
  }
}

/**
 * Reset selections (client - before submission)
 */
export async function resetSelections(projectId: string, deliverySlug?: string) {
  const clientSession = await getClientSession();

  try {
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        allowSelections: true,
        selectionsSubmitted: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
        },
        client: {
          select: { id: true },
        },
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    const hasClientAccess = clientSession && gallery.client?.id === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && gallery.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return { success: false, error: "Unauthorized" };
    }

    if (gallery.selectionsSubmitted) {
      return { success: false, error: "Cannot reset after submission" };
    }

    const clientEmail = clientSession?.client?.email || null;

    await prisma.galleryFavorite.deleteMany({
      where: {
        projectId,
        selectionType: "selection",
        ...(clientEmail ? { clientEmail } : {}),
      },
    });

    return ok();
  } catch (error) {
    console.error("Error resetting selections:", error);
    return { success: false, error: "Failed to reset selections" };
  }
}
