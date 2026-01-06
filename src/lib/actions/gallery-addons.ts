"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getClientSession } from "@/lib/actions/client-auth";
import { ok, fail, success } from "@/lib/types/action-result";
import {
  GalleryAddonCategory,
  GalleryAddonRequestStatus,
  ClientIndustry,
} from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface GalleryAddonInput {
  name: string;
  description?: string | null;
  iconName?: string | null;
  priceCents?: number | null;
  pricePerItem?: boolean;
  category?: GalleryAddonCategory;
  industries?: ClientIndustry[];
  estimatedTurnaround?: string | null;
  sortOrder?: number;
  imageUrl?: string | null;
  isActive?: boolean;
  requiresSelection?: boolean;
  maxPhotos?: number | null;
}

export interface AddonRequestInput {
  addonId: string;
  projectId: string;
  notes?: string | null;
  selectedPhotos?: string[];
}

// ============================================================================
// ADMIN ACTIONS - ADDON CATALOG
// ============================================================================

/**
 * Get all add-ons for the organization
 */
export async function getGalleryAddons() {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const addons = await prisma.galleryAddon.findMany({
      where: { organizationId: org.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return success({ addons });
  } catch (error) {
    console.error("Error fetching gallery add-ons:", error);
    return fail("Failed to fetch add-ons");
  }
}

/**
 * Create a new gallery add-on
 */
export async function createGalleryAddon(data: GalleryAddonInput) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const addon = await prisma.galleryAddon.create({
      data: {
        organizationId: org.id,
        name: data.name,
        description: data.description,
        iconName: data.iconName,
        priceCents: data.priceCents,
        pricePerItem: data.pricePerItem ?? false,
        category: data.category ?? "other",
        industries: data.industries ?? [],
        estimatedTurnaround: data.estimatedTurnaround,
        sortOrder: data.sortOrder ?? 0,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
        requiresSelection: data.requiresSelection ?? false,
        maxPhotos: data.maxPhotos,
      },
    });

    revalidatePath("/settings/addons");

    return success({ addon });
  } catch (error) {
    console.error("Error creating gallery add-on:", error);
    return fail("Failed to create add-on");
  }
}

/**
 * Update a gallery add-on
 */
export async function updateGalleryAddon(id: string, data: Partial<GalleryAddonInput>) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify add-on belongs to this organization
    const existing = await prisma.galleryAddon.findFirst({
      where: { id, organizationId: org.id },
    });

    if (!existing) {
      return fail("Add-on not found");
    }

    const addon = await prisma.galleryAddon.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.iconName !== undefined && { iconName: data.iconName }),
        ...(data.priceCents !== undefined && { priceCents: data.priceCents }),
        ...(data.pricePerItem !== undefined && { pricePerItem: data.pricePerItem }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.industries !== undefined && { industries: data.industries }),
        ...(data.estimatedTurnaround !== undefined && { estimatedTurnaround: data.estimatedTurnaround }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.requiresSelection !== undefined && { requiresSelection: data.requiresSelection }),
        ...(data.maxPhotos !== undefined && { maxPhotos: data.maxPhotos }),
      },
    });

    revalidatePath("/settings/addons");

    return success({ addon });
  } catch (error) {
    console.error("Error updating gallery add-on:", error);
    return fail("Failed to update add-on");
  }
}

/**
 * Delete a gallery add-on
 */
export async function deleteGalleryAddon(id: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify add-on belongs to this organization
    const existing = await prisma.galleryAddon.findFirst({
      where: { id, organizationId: org.id },
    });

    if (!existing) {
      return fail("Add-on not found");
    }

    await prisma.galleryAddon.delete({
      where: { id },
    });

    revalidatePath("/settings/addons");

    return ok();
  } catch (error) {
    console.error("Error deleting gallery add-on:", error);
    return fail("Failed to delete add-on");
  }
}

/**
 * Reorder add-ons
 */
export async function reorderGalleryAddons(orderedIds: string[]) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.galleryAddon.updateMany({
          where: { id, organizationId: org.id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/settings/addons");

    return ok();
  } catch (error) {
    console.error("Error reordering gallery add-ons:", error);
    return fail("Failed to reorder add-ons");
  }
}

// ============================================================================
// ADMIN ACTIONS - REQUEST MANAGEMENT
// ============================================================================

/**
 * Get all add-on requests for a gallery (admin view)
 */
export async function getGalleryAddonRequestsAdmin(projectId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify gallery belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    const requests = await prisma.galleryAddonRequest.findMany({
      where: { projectId },
      include: {
        addon: true,
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return success({ requests });
  } catch (error) {
    console.error("Error fetching add-on requests:", error);
    return fail("Failed to fetch add-on requests");
  }
}

/**
 * Get all add-on requests across the organization (admin dashboard)
 */
export async function getAllAddonRequests(status?: GalleryAddonRequestStatus) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const requests = await prisma.galleryAddonRequest.findMany({
      where: {
        organizationId: org.id,
        ...(status && { status }),
      },
      include: {
        addon: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return success({ requests });
  } catch (error) {
    console.error("Error fetching all add-on requests:", error);
    return fail("Failed to fetch add-on requests");
  }
}

/**
 * Send a quote for an add-on request
 */
export async function sendAddonQuote(
  requestId: string,
  quoteCents: number,
  quoteDescription?: string
) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true, name: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify request belongs to this organization with full details
    const request = await prisma.galleryAddonRequest.findFirst({
      where: { id: requestId, organizationId: org.id },
      include: {
        addon: { select: { name: true } },
        project: {
          select: {
            id: true,
            name: true,
            deliveryLinks: {
              where: { isActive: true },
              select: { slug: true },
              take: 1,
            },
          }
        },
        client: { select: { fullName: true, email: true } },
      },
    });

    if (!request) {
      return fail("Request not found");
    }

    if (request.status !== "pending") {
      return fail("Request has already been quoted or processed");
    }

    const updated = await prisma.galleryAddonRequest.update({
      where: { id: requestId },
      data: {
        status: "quoted",
        quoteCents,
        quoteDescription,
        quotedAt: new Date(),
      },
    });

    // Send quote notification email to client
    const clientEmail = request.clientEmail || request.client?.email;
    if (clientEmail) {
      try {
        const deliverySlug = request.project.deliveryLinks[0]?.slug;
        const galleryUrl = deliverySlug
          ? `${process.env.NEXT_PUBLIC_APP_URL}/g/${deliverySlug}`
          : `${process.env.NEXT_PUBLIC_APP_URL}/galleries/${request.projectId}`;

        const { sendAddonQuoteEmailToClient } = await import("@/lib/email/send");
        await sendAddonQuoteEmailToClient({
          to: clientEmail,
          clientName: request.client?.fullName || request.clientEmail?.split("@")[0] || "Client",
          photographerName: org.name || "Your Photographer",
          galleryName: request.project.name || "Gallery",
          addonName: request.addon.name,
          quoteCents,
          quoteDescription: quoteDescription || null,
          galleryUrl,
        });
      } catch (emailError) {
        console.error("Failed to send quote notification email:", emailError);
      }
    }

    revalidatePath(`/galleries/${request.projectId}`);

    return success({ request: updated });
  } catch (error) {
    console.error("Error sending add-on quote:", error);
    return fail("Failed to send quote");
  }
}

/**
 * Mark an add-on request as in progress
 */
export async function startAddonRequest(requestId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const request = await prisma.galleryAddonRequest.findFirst({
      where: { id: requestId, organizationId: org.id },
    });

    if (!request) {
      return fail("Request not found");
    }

    if (request.status !== "approved" && request.status !== "pending") {
      return fail("Request cannot be started");
    }

    const updated = await prisma.galleryAddonRequest.update({
      where: { id: requestId },
      data: { status: "in_progress" },
    });

    revalidatePath(`/galleries/${request.projectId}`);

    return success({ request: updated });
  } catch (error) {
    console.error("Error starting add-on request:", error);
    return fail("Failed to start request");
  }
}

/**
 * Complete an add-on request
 */
export async function completeAddonRequest(requestId: string, deliveryNote?: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true, name: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Get request with full details for email
    const request = await prisma.galleryAddonRequest.findFirst({
      where: { id: requestId, organizationId: org.id },
      include: {
        addon: { select: { name: true } },
        project: {
          select: {
            id: true,
            name: true,
            deliveryLinks: {
              where: { isActive: true },
              select: { slug: true },
              take: 1,
            },
          }
        },
        client: { select: { fullName: true, email: true } },
      },
    });

    if (!request) {
      return fail("Request not found");
    }

    const updated = await prisma.galleryAddonRequest.update({
      where: { id: requestId },
      data: {
        status: "completed",
        completedAt: new Date(),
        deliveryNote,
      },
    });

    // Send completion notification email to client
    const clientEmail = request.clientEmail || request.client?.email;
    if (clientEmail) {
      try {
        const deliverySlug = request.project.deliveryLinks[0]?.slug;
        const galleryUrl = deliverySlug
          ? `${process.env.NEXT_PUBLIC_APP_URL}/g/${deliverySlug}`
          : `${process.env.NEXT_PUBLIC_APP_URL}/galleries/${request.projectId}`;

        const { sendAddonCompletedEmailToClient } = await import("@/lib/email/send");
        await sendAddonCompletedEmailToClient({
          to: clientEmail,
          clientName: request.client?.fullName || request.clientEmail?.split("@")[0] || "Client",
          photographerName: org.name || "Your Photographer",
          galleryName: request.project.name || "Gallery",
          addonName: request.addon.name,
          deliveryNote: deliveryNote || null,
          galleryUrl,
        });
      } catch (emailError) {
        console.error("Failed to send completion notification email:", emailError);
      }
    }

    revalidatePath(`/galleries/${request.projectId}`);

    return success({ request: updated });
  } catch (error) {
    console.error("Error completing add-on request:", error);
    return fail("Failed to complete request");
  }
}

/**
 * Cancel an add-on request (admin)
 */
export async function cancelAddonRequest(requestId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const request = await prisma.galleryAddonRequest.findFirst({
      where: { id: requestId, organizationId: org.id },
    });

    if (!request) {
      return fail("Request not found");
    }

    if (request.status === "completed") {
      return fail("Cannot cancel a completed request");
    }

    const updated = await prisma.galleryAddonRequest.update({
      where: { id: requestId },
      data: { status: "cancelled" },
    });

    revalidatePath(`/galleries/${request.projectId}`);

    return success({ request: updated });
  } catch (error) {
    console.error("Error cancelling add-on request:", error);
    return fail("Failed to cancel request");
  }
}

// ============================================================================
// CLIENT ACTIONS
// ============================================================================

/**
 * Get available add-ons for a gallery (client view)
 */
export async function getAvailableAddons(projectId: string, deliverySlug?: string) {
  const clientSession = await getClientSession();

  try {
    // Get gallery with organization and client info
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        organizationId: true,
        clientId: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
        },
        client: {
          select: {
            id: true,
            industry: true,
          },
        },
      },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Check access
    const hasClientAccess = clientSession && gallery.clientId === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && gallery.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return fail("Unauthorized");
    }

    // Get organization's active add-ons
    const allAddons = await prisma.galleryAddon.findMany({
      where: {
        organizationId: gallery.organizationId,
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    // Filter by client industry (if applicable)
    const clientIndustry = gallery.client?.industry;
    const filteredAddons = allAddons.filter((addon) => {
      // If no industries specified, show to all
      if (!addon.industries || addon.industries.length === 0) {
        return true;
      }
      // If client has an industry, check if it matches
      if (clientIndustry && addon.industries.includes(clientIndustry)) {
        return true;
      }
      // If no client industry, show addons with no industry restriction
      return !clientIndustry && addon.industries.length === 0;
    });

    // Get existing requests for this gallery from this client
    const clientEmail = clientSession?.client?.email || null;
    const existingRequests = await prisma.galleryAddonRequest.findMany({
      where: {
        projectId,
        ...(clientEmail ? { clientEmail } : {}),
        status: { notIn: ["cancelled", "declined"] },
      },
      select: {
        addonId: true,
        status: true,
      },
    });

    const requestedAddonIds = new Set(existingRequests.map((r) => r.addonId));

    // Add request status to each addon
    const addonsWithStatus = filteredAddons.map((addon) => ({
      ...addon,
      alreadyRequested: requestedAddonIds.has(addon.id),
      requestStatus: existingRequests.find((r) => r.addonId === addon.id)?.status || null,
    }));

    return success({ addons: addonsWithStatus });
  } catch (error) {
    console.error("Error fetching available add-ons:", error);
    return fail("Failed to fetch add-ons");
  }
}

/**
 * Request an add-on (client action)
 */
export async function requestAddon(data: AddonRequestInput, deliverySlug?: string) {
  const clientSession = await getClientSession();

  try {
    // Get gallery with organization info
    const gallery = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: {
        id: true,
        organizationId: true,
        clientId: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
        },
        client: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Check access
    const hasClientAccess = clientSession && gallery.clientId === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && gallery.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return fail("Unauthorized");
    }

    // Verify add-on exists and belongs to the same organization
    const addon = await prisma.galleryAddon.findFirst({
      where: {
        id: data.addonId,
        organizationId: gallery.organizationId,
        isActive: true,
      },
    });

    if (!addon) {
      return fail("Add-on not found or unavailable");
    }

    // Check if add-on requires photo selection
    if (addon.requiresSelection) {
      if (!data.selectedPhotos || data.selectedPhotos.length === 0) {
        return fail("Please select photos for this add-on");
      }
      if (addon.maxPhotos && data.selectedPhotos.length > addon.maxPhotos) {
        return fail(`Maximum ${addon.maxPhotos} photos allowed for this add-on`);
      }
    }

    const clientEmail = clientSession?.client?.email || null;

    // Check for existing pending/in-progress request
    const existing = await prisma.galleryAddonRequest.findFirst({
      where: {
        projectId: data.projectId,
        addonId: data.addonId,
        ...(clientEmail ? { clientEmail } : {}),
        status: { in: ["pending", "quoted", "approved", "in_progress"] },
      },
    });

    if (existing) {
      return fail("You already have an active request for this add-on");
    }

    // Create the request
    const request = await prisma.galleryAddonRequest.create({
      data: {
        organizationId: gallery.organizationId,
        projectId: data.projectId,
        addonId: data.addonId,
        clientEmail,
        clientId: gallery.clientId,
        notes: data.notes,
        selectedPhotos: data.selectedPhotos || [],
      },
      include: {
        addon: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: gallery.organizationId,
        type: "order_created",
        description: `Client requested add-on: ${addon.name}`,
        projectId: data.projectId,
        metadata: {
          addonId: addon.id,
          addonName: addon.name,
          clientEmail,
          selectedPhotoCount: data.selectedPhotos?.length || 0,
        },
      },
    });

    // Send notification to photographer
    try {
      const org = await prisma.organization.findUnique({
        where: { id: gallery.organizationId },
        select: {
          name: true,
        },
      });

      // Get the organization owner via OrganizationMember
      const ownerMember = await prisma.organizationMember.findFirst({
        where: {
          organizationId: gallery.organizationId,
          role: "owner",
        },
        select: {
          user: {
            select: { email: true, firstName: true },
          },
        },
      });

      const galleryDetails = await prisma.project.findUnique({
        where: { id: data.projectId },
        select: { name: true },
      });

      const clientDetails = clientSession?.client || null;
      const photographerEmail = ownerMember?.user?.email;

      if (photographerEmail) {
        const { sendAddonRequestEmail } = await import("@/lib/email/send");
        await sendAddonRequestEmail({
          to: photographerEmail,
          photographerName: ownerMember?.user?.firstName || org?.name || "Photographer",
          clientName: clientDetails?.fullName || clientEmail?.split("@")[0] || "Client",
          clientEmail: clientEmail || "unknown@email.com",
          galleryName: galleryDetails?.name || "Gallery",
          addonName: addon.name,
          addonCategory: addon.category,
          priceCents: addon.priceCents,
          selectedPhotoCount: data.selectedPhotos?.length || 0,
          notes: data.notes,
          galleryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/galleries/${data.projectId}`,
        });
      }
    } catch (emailError) {
      // Don't fail the request if email fails - just log it
      console.error("Failed to send add-on request notification:", emailError);
    }

    return success({ request });
  } catch (error) {
    console.error("Error requesting add-on:", error);
    return fail("Failed to request add-on");
  }
}

/**
 * Get client's add-on requests for a gallery
 */
export async function getClientAddonRequests(projectId: string, deliverySlug?: string) {
  const clientSession = await getClientSession();

  try {
    const gallery = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        clientId: true,
        deliveryLinks: {
          where: { isActive: true },
          select: { slug: true },
        },
      },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Check access
    const hasClientAccess = clientSession && gallery.clientId === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && gallery.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return fail("Unauthorized");
    }

    const clientEmail = clientSession?.client?.email || null;

    const requests = await prisma.galleryAddonRequest.findMany({
      where: {
        projectId,
        ...(clientEmail ? { clientEmail } : {}),
      },
      include: {
        addon: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return success({ requests });
  } catch (error) {
    console.error("Error fetching client add-on requests:", error);
    return fail("Failed to fetch your add-on requests");
  }
}

/**
 * Approve a quoted add-on (client action)
 */
export async function approveAddonQuote(requestId: string, deliverySlug?: string) {
  const clientSession = await getClientSession();

  try {
    // Get the request
    const request = await prisma.galleryAddonRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          select: {
            id: true,
            clientId: true,
            deliveryLinks: {
              where: { isActive: true },
              select: { slug: true },
            },
          },
        },
      },
    });

    if (!request) {
      return fail("Request not found");
    }

    // Check access
    const hasClientAccess = clientSession && request.project.clientId === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && request.project.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return fail("Unauthorized");
    }

    if (request.status !== "quoted") {
      return fail("This request is not awaiting approval");
    }

    const updated = await prisma.galleryAddonRequest.update({
      where: { id: requestId },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    // TODO: Create invoice, send notification to photographer

    return success({ request: updated });
  } catch (error) {
    console.error("Error approving add-on quote:", error);
    return fail("Failed to approve quote");
  }
}

/**
 * Decline a quoted add-on (client action)
 */
export async function declineAddonQuote(requestId: string, deliverySlug?: string) {
  const clientSession = await getClientSession();

  try {
    // Get the request
    const request = await prisma.galleryAddonRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          select: {
            id: true,
            clientId: true,
            deliveryLinks: {
              where: { isActive: true },
              select: { slug: true },
            },
          },
        },
      },
    });

    if (!request) {
      return fail("Request not found");
    }

    // Check access
    const hasClientAccess = clientSession && request.project.clientId === clientSession.clientId;
    const hasDeliveryAccess = deliverySlug && request.project.deliveryLinks.some((l) => l.slug === deliverySlug);

    if (!hasClientAccess && !hasDeliveryAccess) {
      return fail("Unauthorized");
    }

    if (request.status !== "quoted") {
      return fail("This request is not awaiting approval");
    }

    const updated = await prisma.galleryAddonRequest.update({
      where: { id: requestId },
      data: {
        status: "declined",
        declinedAt: new Date(),
      },
    });

    return success({ request: updated });
  } catch (error) {
    console.error("Error declining add-on quote:", error);
    return fail("Failed to decline quote");
  }
}

// ============================================================================
// SEED DATA HELPERS
// ============================================================================

/**
 * Create default add-ons for the organization based on selected industries
 */
export async function createDefaultAddons(industries: ClientIndustry[] = []) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Check if org already has add-ons
    const existingCount = await prisma.galleryAddon.count({
      where: { organizationId: org.id },
    });

    if (existingCount > 0) {
      return fail("Your catalog already has add-ons. Delete them first to reset.");
    }

    // Collect all default add-ons for selected industries
    const allDefaults: GalleryAddonInput[] = [];
    const seenNames = new Set<string>();

    // Add common add-ons first (available to all)
    const commonAddons: GalleryAddonInput[] = [
      {
        name: "Rush Delivery",
        description: "Get your photos delivered within 24 hours",
        iconName: "Zap",
        priceCents: 4900,
        category: "other",
        estimatedTurnaround: "24 hours",
      },
      {
        name: "Additional Retouching",
        description: "Professional retouching for selected photos",
        iconName: "Sparkles",
        priceCents: 1500,
        pricePerItem: true,
        category: "enhancement",
        requiresSelection: true,
      },
    ];

    for (const addon of commonAddons) {
      if (!seenNames.has(addon.name)) {
        seenNames.add(addon.name);
        allDefaults.push(addon);
      }
    }

    // Add industry-specific add-ons
    for (const industry of industries) {
      const industryAddons = await getDefaultAddonsForIndustry(industry);
      for (const addon of industryAddons) {
        if (!seenNames.has(addon.name)) {
          seenNames.add(addon.name);
          allDefaults.push(addon);
        }
      }
    }

    // If no industries selected, add a popular default set
    if (industries.length === 0) {
      const popularDefaults: GalleryAddonInput[] = [
        {
          name: "Virtual Staging",
          description: "Transform empty rooms with virtual furniture",
          iconName: "Sofa",
          priceCents: 2500,
          pricePerItem: true,
          category: "virtual_staging",
          estimatedTurnaround: "24-48 hours",
          requiresSelection: true,
        },
        {
          name: "Day to Dusk Conversion",
          description: "Transform daytime exterior photos to twilight",
          iconName: "Moon",
          priceCents: 3500,
          pricePerItem: true,
          category: "enhancement",
          estimatedTurnaround: "24-48 hours",
          requiresSelection: true,
          maxPhotos: 5,
        },
        {
          name: "Item Removal",
          description: "Remove unwanted items from photos",
          iconName: "Trash2",
          priceCents: 1000,
          pricePerItem: true,
          category: "removal",
          requiresSelection: true,
        },
        {
          name: "Sky Replacement",
          description: "Replace overcast skies with beautiful blue sky",
          iconName: "Cloud",
          priceCents: 1500,
          pricePerItem: true,
          category: "enhancement",
          requiresSelection: true,
        },
      ];

      for (const addon of popularDefaults) {
        if (!seenNames.has(addon.name)) {
          seenNames.add(addon.name);
          allDefaults.push(addon);
        }
      }
    }

    // Create all add-ons
    const createdAddons = await prisma.$transaction(
      allDefaults.map((addon, index) =>
        prisma.galleryAddon.create({
          data: {
            organizationId: org.id,
            name: addon.name,
            description: addon.description,
            iconName: addon.iconName,
            priceCents: addon.priceCents,
            pricePerItem: addon.pricePerItem ?? false,
            category: addon.category ?? "other",
            industries: addon.industries ?? [],
            estimatedTurnaround: addon.estimatedTurnaround,
            sortOrder: index,
            imageUrl: addon.imageUrl,
            isActive: addon.isActive ?? true,
            requiresSelection: addon.requiresSelection ?? false,
            maxPhotos: addon.maxPhotos,
          },
        })
      )
    );

    revalidatePath("/settings/addons");

    return success({ addons: createdAddons, count: createdAddons.length });
  } catch (error) {
    console.error("Error creating default add-ons:", error);
    return fail("Failed to create default add-ons");
  }
}

/**
 * Get default add-ons for an industry (for seeding/onboarding)
 */
export async function getDefaultAddonsForIndustry(industry: ClientIndustry): Promise<GalleryAddonInput[]> {
  const commonAddons: GalleryAddonInput[] = [
    {
      name: "Rush Delivery",
      description: "Get your photos delivered within 24 hours",
      iconName: "Zap",
      priceCents: 4900,
      category: "other",
      estimatedTurnaround: "24 hours",
    },
    {
      name: "Additional Retouching",
      description: "Professional retouching for selected photos",
      iconName: "Sparkles",
      priceCents: 1500,
      pricePerItem: true,
      category: "enhancement",
      requiresSelection: true,
    },
  ];

  const industryAddons: Record<ClientIndustry, GalleryAddonInput[]> = {
    real_estate: [
      {
        name: "Virtual Staging",
        description: "Transform empty rooms with virtual furniture",
        iconName: "Sofa",
        priceCents: 2500,
        pricePerItem: true,
        category: "virtual_staging",
        industries: ["real_estate"],
        estimatedTurnaround: "24-48 hours",
        requiresSelection: true,
      },
      {
        name: "Virtual Decluttering",
        description: "Remove furniture and personal items digitally",
        iconName: "Eraser",
        priceCents: 1500,
        pricePerItem: true,
        category: "removal",
        industries: ["real_estate"],
        estimatedTurnaround: "24-48 hours",
        requiresSelection: true,
      },
      {
        name: "Day to Dusk Conversion",
        description: "Transform daytime exterior photos to twilight",
        iconName: "Moon",
        priceCents: 3500,
        pricePerItem: true,
        category: "enhancement",
        industries: ["real_estate"],
        estimatedTurnaround: "24-48 hours",
        requiresSelection: true,
        maxPhotos: 5,
      },
      {
        name: "Single Property Website",
        description: "Dedicated marketing website for the listing",
        iconName: "Globe",
        priceCents: 4900,
        category: "marketing",
        industries: ["real_estate"],
        estimatedTurnaround: "24 hours",
      },
      {
        name: "Social Media Kit",
        description: "Optimized images for Instagram, Facebook, and more",
        iconName: "Share2",
        priceCents: 2900,
        category: "marketing",
        industries: ["real_estate"],
        estimatedTurnaround: "24 hours",
      },
      {
        name: "Floor Plan",
        description: "Professional 2D floor plan of the property",
        iconName: "LayoutDashboard",
        category: "marketing",
        industries: ["real_estate"],
        estimatedTurnaround: "2-3 business days",
      },
      {
        name: "Item Removal",
        description: "Remove unwanted items from photos",
        iconName: "Trash2",
        priceCents: 1000,
        pricePerItem: true,
        category: "removal",
        industries: ["real_estate"],
        requiresSelection: true,
      },
    ],
    wedding: [
      {
        name: "Album Design",
        description: "Professional wedding album design",
        iconName: "BookOpen",
        category: "print",
        industries: ["wedding"],
        estimatedTurnaround: "2-3 weeks",
      },
      {
        name: "Canvas Prints",
        description: "Gallery-quality canvas prints",
        iconName: "Frame",
        priceCents: 7500,
        category: "print",
        industries: ["wedding"],
        requiresSelection: true,
      },
      {
        name: "Highlight Video",
        description: "3-5 minute highlight video from your photos",
        iconName: "Film",
        category: "video",
        industries: ["wedding"],
        estimatedTurnaround: "2-3 weeks",
      },
    ],
    portrait: [
      {
        name: "Professional Retouching",
        description: "Skin smoothing, blemish removal, and color correction",
        iconName: "Wand2",
        priceCents: 2500,
        pricePerItem: true,
        category: "enhancement",
        industries: ["portrait", "headshots"],
        requiresSelection: true,
      },
      {
        name: "Background Replacement",
        description: "Replace background with solid color or custom image",
        iconName: "Image",
        priceCents: 1500,
        pricePerItem: true,
        category: "enhancement",
        industries: ["portrait", "headshots"],
        requiresSelection: true,
      },
    ],
    commercial: [
      {
        name: "Product Photo Enhancement",
        description: "Color correction and background optimization",
        iconName: "Palette",
        priceCents: 1000,
        pricePerItem: true,
        category: "enhancement",
        industries: ["commercial", "product"],
        requiresSelection: true,
      },
      {
        name: "360° Product View",
        description: "Interactive 360-degree product viewer",
        iconName: "RotateCw",
        category: "other",
        industries: ["commercial", "product"],
      },
    ],
    architecture: [
      {
        name: "Sky Replacement",
        description: "Replace overcast skies with beautiful blue sky",
        iconName: "Cloud",
        priceCents: 1500,
        pricePerItem: true,
        category: "enhancement",
        industries: ["architecture", "real_estate"],
        requiresSelection: true,
      },
      {
        name: "HDR Processing",
        description: "Advanced HDR processing for interior shots",
        iconName: "SunMedium",
        priceCents: 800,
        pricePerItem: true,
        category: "editing",
        industries: ["architecture", "real_estate"],
        requiresSelection: true,
      },
    ],
    food_hospitality: [
      {
        name: "Menu Design",
        description: "Professional menu design with your food photos",
        iconName: "FileText",
        category: "marketing",
        industries: ["food_hospitality"],
      },
      {
        name: "Social Media Graphics",
        description: "Branded social media templates with your photos",
        iconName: "Instagram",
        priceCents: 4900,
        category: "marketing",
        industries: ["food_hospitality"],
      },
    ],
    events: [
      {
        name: "Same-Day Edits",
        description: "Receive a selection of edited photos the same day",
        iconName: "Clock",
        priceCents: 9900,
        category: "other",
        industries: ["events"],
        estimatedTurnaround: "Same day",
      },
      {
        name: "Slideshow Video",
        description: "Animated slideshow with music",
        iconName: "PlayCircle",
        priceCents: 14900,
        category: "video",
        industries: ["events"],
        estimatedTurnaround: "1 week",
      },
    ],
    headshots: [
      {
        name: "LinkedIn Optimization",
        description: "Cropped and optimized for LinkedIn profile",
        iconName: "Linkedin",
        priceCents: 500,
        pricePerItem: true,
        category: "enhancement",
        industries: ["headshots"],
        requiresSelection: true,
      },
    ],
    product: [
      {
        name: "White Background",
        description: "Pure white background for e-commerce",
        iconName: "Square",
        priceCents: 500,
        pricePerItem: true,
        category: "enhancement",
        industries: ["product"],
        requiresSelection: true,
      },
      {
        name: "Shadow Enhancement",
        description: "Add natural or reflection shadow",
        iconName: "CircleDot",
        priceCents: 300,
        pricePerItem: true,
        category: "enhancement",
        industries: ["product"],
        requiresSelection: true,
      },
    ],
    other: [],
  };

  return [...commonAddons, ...(industryAddons[industry] || [])];
}
