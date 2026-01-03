"use server";

/**
 * Team Invitation Actions
 *
 * Handles team invitation lifecycle:
 * - Create and send invitations
 * - Resend expired/pending invitations
 * - Accept invitations (user joins organization)
 * - Revoke invitations
 * - List pending invitations
 *
 * Permissions:
 * - Owner/Admin: Can create, revoke, resend invitations
 * - Members: Cannot manage invitations
 * - Anyone with valid token: Can accept invitations
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { sendTeamInvitationEmail } from "@/lib/email/send";
import { logActivity } from "@/lib/utils/activity";
import type { MemberRole, InvitationStatus } from "@prisma/client";

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// =============================================================================
// Validation Schemas
// =============================================================================

const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]).default("member"),
});

// =============================================================================
// Create Invitation
// =============================================================================

/**
 * Create and send a team invitation
 *
 * Creates an invitation record and sends an email to the invitee.
 * Only owners and admins can create invitations.
 */
export async function createInvitation(
  input: z.infer<typeof createInvitationSchema>
): Promise<ActionResult<{ id: string; email: string }>> {
  try {
    const validated = createInvitationSchema.parse(input);
    const auth = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Check if the current user is an owner or admin
    const currentMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!currentMembership) {
      return { success: false, error: "Only owners and admins can invite team members" };
    }

    // Get organization and inviter details
    const [organization, inviter] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true },
      }),
      prisma.user.findUnique({
        where: { id: auth.userId },
        select: { fullName: true, email: true },
      }),
    ]);

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
      select: { id: true },
    });

    if (existingUser) {
      const existingMembership = await prisma.organizationMember.findFirst({
        where: {
          organizationId,
          userId: existingUser.id,
        },
      });

      if (existingMembership) {
        return { success: false, error: "This user is already a member of your team" };
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organizationId,
        email: validated.email,
        status: "pending",
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "An invitation has already been sent to this email. You can resend it if needed.",
      };
    }

    // Create the invitation
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invitation = await prisma.invitation.create({
      data: {
        organizationId,
        email: validated.email,
        role: validated.role as MemberRole,
        token,
        expiresAt,
        invitedById: auth.userId,
      },
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    const inviterName = inviter?.fullName || inviter?.email || "A team member";

    try {
      await sendTeamInvitationEmail({
        to: validated.email,
        organizationName: organization.name,
        inviterName,
        role: validated.role as "admin" | "member",
        inviteUrl,
        expiresInDays: 7,
      });
    } catch (emailError) {
      console.error("[Invitations] Failed to send invitation email:", emailError);
      // Don't fail the invitation creation if email fails
    }

    // Log activity
    await logActivity({
      organizationId,
      type: "email_sent",
      description: `Team invitation sent to ${validated.email} as ${validated.role}`,
      userId: auth.userId,
      metadata: {
        invitationId: invitation.id,
        email: validated.email,
        role: validated.role,
      },
    });

    revalidatePath("/settings/team");

    return {
      success: true,
      data: { id: invitation.id, email: validated.email },
    };
  } catch (error) {
    console.error("[Invitations] Error creating invitation:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to send invitation" };
  }
}

// =============================================================================
// Resend Invitation
// =============================================================================

/**
 * Resend a pending or expired invitation
 *
 * Generates a new token and expiration, then sends a fresh email.
 */
export async function resendInvitation(
  invitationId: string
): Promise<ActionResult> {
  try {
    const auth = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Check if the current user is an owner or admin
    const currentMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!currentMembership) {
      return { success: false, error: "Only owners and admins can resend invitations" };
    }

    // Get the invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
        status: { in: ["pending", "expired"] },
      },
      include: {
        organization: { select: { name: true } },
      },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    // Get inviter details
    const inviter = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { fullName: true, email: true },
    });

    // Generate new token and expiration
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update the invitation
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token,
        expiresAt,
        status: "pending",
        invitedById: auth.userId,
        updatedAt: new Date(),
      },
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    const inviterName = inviter?.fullName || inviter?.email || "A team member";

    try {
      await sendTeamInvitationEmail({
        to: invitation.email,
        organizationName: invitation.organization.name,
        inviterName,
        role: invitation.role as "admin" | "member",
        inviteUrl,
        expiresInDays: 7,
      });
    } catch (emailError) {
      console.error("[Invitations] Failed to resend invitation email:", emailError);
    }

    revalidatePath("/settings/team");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Invitations] Error resending invitation:", error);
    return { success: false, error: "Failed to resend invitation" };
  }
}

// =============================================================================
// Revoke Invitation
// =============================================================================

/**
 * Revoke a pending invitation
 *
 * Marks the invitation as revoked so it can no longer be accepted.
 */
export async function revokeInvitation(
  invitationId: string
): Promise<ActionResult> {
  try {
    const auth = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Check if the current user is an owner or admin
    const currentMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: auth.userId,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!currentMembership) {
      return { success: false, error: "Only owners and admins can revoke invitations" };
    }

    // Get the invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
        status: "pending",
      },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    // Revoke the invitation
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });

    revalidatePath("/settings/team");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Invitations] Error revoking invitation:", error);
    return { success: false, error: "Failed to revoke invitation" };
  }
}

// =============================================================================
// Accept Invitation
// =============================================================================

/**
 * Accept an invitation and join the organization
 *
 * This action is called when a user clicks the accept link in their email.
 * It creates a new user (if needed) and adds them to the organization.
 */
export async function acceptInvitation(
  token: string,
  userData: { clerkUserId: string; email: string; fullName?: string }
): Promise<ActionResult<{ organizationId: string; organizationName: string }>> {
  try {
    // Find the invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: { select: { id: true, name: true } },
      },
    });

    if (!invitation) {
      return { success: false, error: "Invalid invitation link" };
    }

    // Check invitation status
    if (invitation.status === "accepted") {
      return { success: false, error: "This invitation has already been accepted" };
    }

    if (invitation.status === "revoked") {
      return { success: false, error: "This invitation has been revoked" };
    }

    if (invitation.status === "expired" || invitation.expiresAt < new Date()) {
      // Update status to expired if it wasn't already
      if (invitation.status !== "expired") {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: "expired" },
        });
      }
      return { success: false, error: "This invitation has expired" };
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== userData.email.toLowerCase()) {
      return {
        success: false,
        error: "This invitation was sent to a different email address",
      };
    }

    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: userData.clerkUserId,
          email: userData.email,
          fullName: userData.fullName,
        },
      });
    }

    // Check if already a member
    const existingMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId: user.id,
      },
    });

    if (existingMembership) {
      // Already a member, just mark the invitation as accepted
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          organizationId: invitation.organization.id,
          organizationName: invitation.organization.name,
        },
      };
    }

    // Create membership and update invitation in a transaction
    await prisma.$transaction([
      prisma.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.id,
          role: invitation.role,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      }),
    ]);

    // Log activity
    await logActivity({
      organizationId: invitation.organizationId,
      type: "settings_updated",
      description: `${userData.fullName || userData.email} joined the team as ${invitation.role}`,
      userId: user.id,
      metadata: {
        invitationId: invitation.id,
        role: invitation.role,
      },
    });

    return {
      success: true,
      data: {
        organizationId: invitation.organization.id,
        organizationName: invitation.organization.name,
      },
    };
  } catch (error) {
    console.error("[Invitations] Error accepting invitation:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}

// =============================================================================
// Get Invitation Details
// =============================================================================

/**
 * Get invitation details by token
 *
 * Used by the accept invitation page to display invitation info.
 */
export async function getInvitationByToken(token: string) {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!invitation) {
      return null;
    }

    // Check if expired
    const isExpired =
      invitation.status === "expired" || invitation.expiresAt < new Date();

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: isExpired && invitation.status === "pending" ? "expired" : invitation.status,
      organizationName: invitation.organization.name,
      organizationLogo: invitation.organization.logoUrl,
      expiresAt: invitation.expiresAt,
    };
  } catch (error) {
    console.error("[Invitations] Error fetching invitation:", error);
    return null;
  }
}

// =============================================================================
// List Pending Invitations
// =============================================================================

/**
 * Get all pending invitations for the organization
 */
export async function getPendingInvitations() {
  try {
    const organizationId = await requireOrganizationId();

    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
    });

    // Check for expired invitations and update them
    const now = new Date();
    const expiredIds = invitations
      .filter((inv) => inv.expiresAt < now)
      .map((inv) => inv.id);

    if (expiredIds.length > 0) {
      await prisma.invitation.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: "expired" },
      });
    }

    // Return only non-expired invitations
    return invitations
      .filter((inv) => inv.expiresAt >= now)
      .map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
      }));
  } catch (error) {
    console.error("[Invitations] Error fetching pending invitations:", error);
    return [];
  }
}

// Type exports
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
