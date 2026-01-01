"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { MemberRole } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
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

    return { success: true };
  } catch (error) {
    console.error("Error updating organization profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Update organization branding settings
 */
export async function updateOrganizationBranding(input: {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
}) {
  try {
    const organizationId = await getOrganizationId();

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        logoUrl: input.logoUrl,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        customDomain: input.customDomain,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/branding");

    return { success: true };
  } catch (error) {
    console.error("Error updating branding:", error);
    return { success: false, error: "Failed to update branding" };
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

    return { success: true };
  } catch (error) {
    console.error("Error updating travel settings:", error);
    return { success: false, error: "Failed to update travel settings" };
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
      return { success: false, error: "Member not found" };
    }

    // Don't allow demoting the last owner
    if (member.role === "owner" && role !== "owner") {
      const ownerCount = await prisma.organizationMember.count({
        where: { organizationId, role: "owner" },
      });
      if (ownerCount <= 1) {
        return { success: false, error: "Cannot demote the last owner" };
      }
    }

    await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role },
    });

    revalidatePath("/settings/team");

    return { success: true };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { success: false, error: "Failed to update role" };
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
      return { success: false, error: "Member not found" };
    }

    // Don't allow removing the last owner
    if (member.role === "owner") {
      const ownerCount = await prisma.organizationMember.count({
        where: { organizationId, role: "owner" },
      });
      if (ownerCount <= 1) {
        return { success: false, error: "Cannot remove the last owner" };
      }
    }

    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    revalidatePath("/settings/team");

    return { success: true };
  } catch (error) {
    console.error("Error removing member:", error);
    return { success: false, error: "Failed to remove member" };
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
      return { success: false, error: "User not found" };
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

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// ============================================================================
// BILLING & USAGE
// ============================================================================

/**
 * Get billing and usage stats
 */
export async function getBillingStats() {
  try {
    const organizationId = await getOrganizationId();

    const [org, galleryCount, clientCount, memberCount, storageUsage] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          plan: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          createdAt: true,
        },
      }),
      prisma.project.count({ where: { organizationId } }),
      prisma.client.count({ where: { organizationId } }),
      prisma.organizationMember.count({ where: { organizationId } }),
      // In production, this would query actual storage usage from S3/etc
      Promise.resolve(0),
    ]);

    if (!org) {
      return null;
    }

    // Plan limits (in production, these would come from a config or Stripe)
    const planLimits = {
      free: { storage: 2, galleries: 5, clients: 25, members: 1 },
      pro: { storage: 50, galleries: -1, clients: -1, members: 3 },
      studio: { storage: 500, galleries: -1, clients: -1, members: -1 },
    };

    const limits = planLimits[org.plan] || planLimits.free;

    return {
      plan: org.plan,
      stripeCustomerId: org.stripeCustomerId,
      stripeSubscriptionId: org.stripeSubscriptionId,
      memberSince: org.createdAt,
      usage: {
        storage: { used: storageUsage, limit: limits.storage },
        galleries: { used: galleryCount, limit: limits.galleries },
        clients: { used: clientCount, limit: limits.clients },
        members: { used: memberCount, limit: limits.members },
      },
    };
  } catch (error) {
    console.error("Error fetching billing stats:", error);
    return null;
  }
}
