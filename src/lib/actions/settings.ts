"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { MemberRole } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/constants";
import { ok, fail, success } from "@/lib/types/action-result";

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

// Provide currencies via async export to satisfy server action constraints
export async function getSupportedCurrencies() {
  return SUPPORTED_CURRENCIES;
}

// ============================================================================
// ORGANIZATION SETTINGS
// ============================================================================

/**
 * Get organization settings
 */
export async function getOrganizationSettings() {
  try {
    const organizationId = await getOrganizationId();

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        homeBaseLocation: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!org) {
      return null;
    }

    return org;
  } catch (error) {
    console.error("Error fetching organization settings:", error);
    return null;
  }
}

/**
 * Update organization profile settings
 */
export async function updateOrganizationProfile(input: {
  name: string;
  timezone?: string;
}) {
  try {
    const organizationId = await getOrganizationId();

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: input.name,
        timezone: input.timezone,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/profile");

    return ok();
  } catch (error) {
    console.error("Error updating organization profile:", error);
    return fail("Failed to update profile");
  }
}

/**
 * Update organization branding settings
 */
export async function updateOrganizationBranding(input: {
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  portalMode?: "light" | "dark" | "auto";
  invoiceLogoUrl?: string | null;
  hidePlatformBranding?: boolean;
  customDomain?: string | null;
  autoArchiveExpiredGalleries?: boolean;
}) {
  try {
    const organizationId = await getOrganizationId();

    // Get organization to check plan for white-label features
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    // Only allow hidePlatformBranding on paid plans
    const canHideBranding =
      org?.plan === "pro" || org?.plan === "studio" || org?.plan === "enterprise";

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        logoUrl: input.logoUrl,
        logoLightUrl: input.logoLightUrl,
        faviconUrl: input.faviconUrl,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        accentColor: input.accentColor,
        portalMode: input.portalMode,
        invoiceLogoUrl: input.invoiceLogoUrl,
        // Only update hidePlatformBranding if user is on a paid plan
        ...(canHideBranding && input.hidePlatformBranding !== undefined
          ? { hidePlatformBranding: input.hidePlatformBranding }
          : {}),
        customDomain: input.customDomain,
        ...(input.autoArchiveExpiredGalleries !== undefined
          ? { autoArchiveExpiredGalleries: input.autoArchiveExpiredGalleries }
          : {}),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/branding");
    revalidatePath("/galleries");
    revalidatePath("/g"); // Revalidate gallery pages

    return ok();
  } catch (error) {
    console.error("Error updating branding:", error);
    return fail("Failed to update branding");
  }
}

/**
 * Update organization travel settings
 */
export async function updateTravelSettings(input: {
  homeBaseLocationId?: string;
  travelFeePerMile?: number;
  travelFeeThreshold?: number;
}) {
  try {
    const organizationId = await getOrganizationId();

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        homeBaseLocationId: input.homeBaseLocationId,
        travelFeePerMile: input.travelFeePerMile,
        travelFeeThreshold: input.travelFeeThreshold,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/travel");

    return ok();
  } catch (error) {
    console.error("Error updating travel settings:", error);
    return fail("Failed to update travel settings");
  }
}

/**
 * Update organization tax settings
 */
export async function updateTaxSettings(input: {
  defaultTaxRate?: number;
  taxLabel?: string;
}) {
  try {
    const organizationId = await getOrganizationId();

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        defaultTaxRate: input.defaultTaxRate ?? 0,
        taxLabel: input.taxLabel ?? "Sales Tax",
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/payments");

    return ok();
  } catch (error) {
    console.error("Error updating tax settings:", error);
    return fail("Failed to update tax settings");
  }
}

/**
 * Get tax settings for the organization
 */
export async function getTaxSettings() {
  try {
    const organizationId = await getOrganizationId();

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        defaultTaxRate: true,
        taxLabel: true,
      },
    });

    return success({
      defaultTaxRate: org?.defaultTaxRate ?? 0,
      taxLabel: org?.taxLabel ?? "Sales Tax",
    });
  } catch (error) {
    console.error("Error getting tax settings:", error);
    return fail("Failed to get tax settings");
  }
}

// ============================================================================
// CURRENCY SETTINGS
// ============================================================================


/**
 * Get currency settings for the organization
 */
export async function getCurrencySettings() {
  try {
    const organizationId = await getOrganizationId();

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        currency: true,
      },
    });

    return success({
      currency: (org?.currency as SupportedCurrency) ?? "USD",
    });
  } catch (error) {
    console.error("Error getting currency settings:", error);
    return fail("Failed to get currency settings");
  }
}

/**
 * Update organization currency settings
 */
export async function updateCurrencySettings(input: { currency: SupportedCurrency }) {
  try {
    const organizationId = await getOrganizationId();

    // Validate currency is supported
    const isValidCurrency = SUPPORTED_CURRENCIES.some((c) => c.code === input.currency);
    if (!isValidCurrency) {
      return fail("Invalid currency code");
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        currency: input.currency,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/payments");
    revalidatePath("/invoices");
    revalidatePath("/galleries");

    return ok();
  } catch (error) {
    console.error("Error updating currency settings:", error);
    return fail("Failed to update currency settings");
  }
}

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

/**
 * Get team members for the organization
 */
export async function getTeamMembers() {
  try {
    const organizationId = await getOrganizationId();

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return members;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

/**
 * Update team member role
 */
export async function updateMemberRole(memberId: string, role: MemberRole) {
  try {
    const organizationId = await getOrganizationId();

    // Verify member belongs to organization
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      return fail("Member not found");
    }

    // Don't allow demoting the last owner
    if (member.role === "owner" && role !== "owner") {
      const ownerCount = await prisma.organizationMember.count({
        where: { organizationId, role: "owner" },
      });
      if (ownerCount <= 1) {
        return fail("Cannot demote the last owner");
      }
    }

    await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role },
    });

    revalidatePath("/settings/team");

    return ok();
  } catch (error) {
    console.error("Error updating member role:", error);
    return fail("Failed to update role");
  }
}

/**
 * Remove team member from organization
 */
export async function removeMember(memberId: string) {
  try {
    const organizationId = await getOrganizationId();

    // Verify member belongs to organization
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      return fail("Member not found");
    }

    // Don't allow removing the last owner
    if (member.role === "owner") {
      const ownerCount = await prisma.organizationMember.count({
        where: { organizationId, role: "owner" },
      });
      if (ownerCount <= 1) {
        return fail("Cannot remove the last owner");
      }
    }

    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    revalidatePath("/settings/team");

    return ok();
  } catch (error) {
    console.error("Error removing member:", error);
    return fail("Failed to remove member");
  }
}

// ============================================================================
// USER SETTINGS
// ============================================================================

/**
 * Get first user (simplified - would use auth in production)
 */
export async function getCurrentUser() {
  try {
    const organizationId = await getOrganizationId();

    const member = await prisma.organizationMember.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
      include: {
        user: true,
        organization: true,
      },
    });

    if (!member) {
      return null;
    }

    return {
      user: member.user,
      organization: member.organization,
      role: member.role,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(input: {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return fail("User not found");
    }

    await prisma.user.update({
      where: { id: currentUser.user.id },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        avatarUrl: input.avatarUrl,
      },
    });

    revalidatePath("/settings/profile");

    return ok();
  } catch (error) {
    console.error("Error updating user profile:", error);
    return fail("Failed to update profile");
  }
}

// ============================================================================
// BILLING & USAGE
// ============================================================================

/**
 * Export all organization data as JSON
 */
export async function exportAllData() {
  try {
    const organizationId = await getOrganizationId();

    // Fetch all organization data
    const [
      organization,
      clients,
      projects,
      bookings,
      payments,
      invoices,
      services,
      propertyWebsites,
    ] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  fullName: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      }),
      prisma.client.findMany({
        where: { organizationId },
        include: {
          _count: { select: { projects: true, bookings: true } },
        },
      }),
      prisma.project.findMany({
        where: { organizationId },
        include: {
          client: { select: { fullName: true, company: true, email: true } },
          _count: { select: { assets: true, payments: true } },
        },
      }),
      prisma.booking.findMany({
        where: { organizationId },
        include: {
          client: { select: { fullName: true, company: true, email: true } },
        },
      }),
      prisma.payment.findMany({
        where: { organizationId },
        include: {
          project: { select: { name: true } },
        },
      }),
      prisma.invoice.findMany({
        where: { organizationId },
        include: {
          client: { select: { fullName: true, company: true, email: true } },
          lineItems: true,
        },
      }),
      prisma.service.findMany({
        where: { organizationId },
      }),
      prisma.propertyWebsite.findMany({
        where: { project: { organizationId } },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      organization: {
        id: organization?.id,
        name: organization?.name,
        plan: organization?.plan,
        createdAt: organization?.createdAt,
        members: organization?.members.map((m) => ({
          role: m.role,
          user: m.user,
          joinedAt: m.createdAt,
        })),
      },
      clients: clients.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        company: c.company,
        email: c.email,
        phone: c.phone,
        industry: c.industry,
        lifetimeRevenue: c.lifetimeRevenueCents / 100,
        projectCount: c._count.projects,
        bookingCount: c._count.bookings,
        createdAt: c.createdAt,
      })),
      galleries: projects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        client: p.client,
        price: p.priceCents / 100,
        photoCount: p._count.assets,
        paymentCount: p._count.payments,
        viewCount: p.viewCount,
        downloadCount: p.downloadCount,
        createdAt: p.createdAt,
        deliveredAt: p.deliveredAt,
      })),
      bookings: bookings.map((b) => ({
        id: b.id,
        title: b.title,
        status: b.status,
        client: b.client,
        startTime: b.startTime,
        endTime: b.endTime,
        location: b.location,
        createdAt: b.createdAt,
      })),
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amountCents / 100,
        currency: p.currency,
        status: p.status,
        gallery: p.project?.name,
        description: p.description,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      invoices: invoices.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        status: i.status,
        client: i.client,
        subtotal: i.subtotalCents / 100,
        tax: i.taxCents / 100,
        total: i.totalCents / 100,
        lineItems: i.lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitCents / 100,
          total: li.totalCents / 100,
        })),
        createdAt: i.createdAt,
        dueDate: i.dueDate,
      })),
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        price: s.priceCents / 100,
        duration: s.duration,
        isActive: s.isActive,
      })),
      propertyWebsites: propertyWebsites.map((pw) => ({
        id: pw.id,
        address: pw.address,
        city: pw.city,
        state: pw.state,
        isPublished: pw.isPublished,
        viewCount: pw.viewCount,
        createdAt: pw.createdAt,
      })),
    };

    return success(exportData);
  } catch (error) {
    console.error("Error exporting data:", error);
    return fail("Failed to export data");
  }
}

/**
 * Delete organization account and all associated data
 * This is a destructive action that cannot be undone
 */
export async function deleteAccount(confirmationText: string) {
  try {
    const organizationId = await getOrganizationId();
    const auth = await requireAuth();

    // Verify the user is the owner
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
        role: "owner",
      },
    });

    if (!membership) {
      return fail("Only the owner can delete the account");
    }

    // Verify confirmation text
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (confirmationText !== `delete ${org?.name}`) {
      return fail("Confirmation text does not match");
    }

    // Delete all related data in order (respecting foreign key constraints)
    // Note: In production, you'd also need to:
    // 1. Cancel Stripe subscriptions
    // 2. Delete files from R2/S3
    // 3. Remove from Clerk organization

    await prisma.$transaction(async (tx) => {
      // Delete property-related data
      await tx.propertyLead.deleteMany({ where: { propertyWebsite: { project: { organizationId } } } });
      await tx.propertyAnalytics.deleteMany({ where: { propertyWebsite: { project: { organizationId } } } });
      await tx.marketingAsset.deleteMany({ where: { propertyWebsite: { project: { organizationId } } } });
      await tx.propertyWebsite.deleteMany({ where: { project: { organizationId } } });

      // Delete gallery-related data
      await tx.galleryFavorite.deleteMany({ where: { project: { organizationId } } });
      await tx.galleryComment.deleteMany({ where: { project: { organizationId } } });
      await tx.deliveryLink.deleteMany({ where: { project: { organizationId } } });
      await tx.asset.deleteMany({ where: { project: { organizationId } } });

      // Delete invoice line items
      await tx.invoiceLineItem.deleteMany({ where: { invoice: { organizationId } } });
      await tx.invoice.deleteMany({ where: { organizationId } });

      // Delete payments
      await tx.payment.deleteMany({ where: { organizationId } });

      // Delete booking-related data
      await tx.bookingReminder.deleteMany({ where: { booking: { organizationId } } });
      await tx.booking.deleteMany({ where: { organizationId } });

      // Delete projects
      await tx.project.deleteMany({ where: { organizationId } });

      // Delete clients
      await tx.client.deleteMany({ where: { organizationId } });

      // Delete services
      await tx.service.deleteMany({ where: { organizationId } });

      // Delete activity logs
      await tx.activityLog.deleteMany({ where: { organizationId } });

      // Delete locations
      await tx.location.deleteMany({ where: { organizationId } });

      // Delete equipment
      await tx.equipment.deleteMany({ where: { organizationId } });

      // Delete organization members
      await tx.organizationMember.deleteMany({ where: { organizationId } });

      // Finally, delete the organization
      await tx.organization.delete({ where: { id: organizationId } });
    });

    return ok();
  } catch (error) {
    console.error("Error deleting account:", error);
    return fail("Failed to delete account");
  }
}

/**
 * Get billing and usage stats
 * Uses the centralized plan-limits system for consistent limit enforcement
 */
export async function getBillingStats() {
  try {
    const organizationId = await getOrganizationId();

    // Import plan limits
    const { getLimit, isUnlimited } = await import("@/lib/plan-limits");
    const { PlanName } = await import("@prisma/client");

    const [org, galleryCount, clientCount, memberCount, storageResult] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          plan: true,
          hasLifetimeLicense: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          createdAt: true,
        },
      }),
      prisma.gallery.count({
        where: {
          project: { organizationId },
          status: { in: ["draft", "published"] },
        },
      }),
      prisma.client.count({ where: { organizationId } }),
      prisma.organizationMember.count({ where: { organizationId } }),
      // Calculate actual storage usage from gallery photos
      prisma.galleryPhoto.aggregate({
        where: {
          gallery: { project: { organizationId } },
        },
        _sum: { fileSize: true },
      }),
    ]);

    if (!org) {
      return null;
    }

    // Lifetime license holders get enterprise-level access
    const effectivePlan = (org.hasLifetimeLicense ? "enterprise" : org.plan) as typeof PlanName[keyof typeof PlanName];

    // Calculate storage in GB
    const storageBytes = storageResult._sum.fileSize || 0;
    const storageGB = Math.ceil(Number(storageBytes) / (1024 * 1024 * 1024));

    // Get limits from centralized system
    const storageLimit = getLimit(effectivePlan, "storage_gb");
    const galleriesLimit = getLimit(effectivePlan, "galleries_active");
    const clientsLimit = getLimit(effectivePlan, "clients_total");
    const membersLimit = getLimit(effectivePlan, "team_members");

    return {
      plan: effectivePlan,
      hasLifetimeLicense: org.hasLifetimeLicense,
      stripeCustomerId: org.stripeCustomerId,
      stripeSubscriptionId: org.stripeSubscriptionId,
      memberSince: org.createdAt,
      usage: {
        storage: { used: storageGB, limit: storageLimit },
        galleries: { used: galleryCount, limit: galleriesLimit },
        clients: { used: clientCount, limit: clientsLimit },
        members: { used: memberCount, limit: membersLimit },
      },
    };
  } catch (error) {
    console.error("Error fetching billing stats:", error);
    return null;
  }
}

/**
 * Get invoice history from Stripe
 */
export async function getInvoiceHistory(limit: number = 10) {
  try {
    const organizationId = await getOrganizationId();

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { stripeCustomerId: true },
    });

    if (!org?.stripeCustomerId) {
      return { invoices: [], hasMore: false };
    }

    // Import Stripe dynamically to avoid issues if not configured
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();

    const invoices = await stripe.invoices.list({
      customer: org.stripeCustomerId,
      limit: limit + 1, // Fetch one extra to check if there are more
    });

    const hasMore = invoices.data.length > limit;
    const invoiceData = invoices.data.slice(0, limit).map((invoice) => ({
      id: invoice.id,
      number: invoice.number || "—",
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      created: new Date(invoice.created * 1000),
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      description: invoice.lines.data[0]?.description || "Subscription",
    }));

    return { invoices: invoiceData, hasMore };
  } catch (error) {
    console.error("Error fetching invoice history:", error);
    return { invoices: [], hasMore: false };
  }
}
