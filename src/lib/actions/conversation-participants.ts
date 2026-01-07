"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ConversationParticipantRole } from "@prisma/client";
import { requireOrganizationId, requireUserId, requireAdmin } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

export interface ParticipantWithDetails {
  id: string;
  conversationId: string;
  userId: string | null;
  clientId: string | null;
  role: ConversationParticipantRole;
  isMuted: boolean;
  isPinned: boolean;
  hasBrokerAccess: boolean;
  lastReadAt: Date | null;
  lastReadMessageId: string | null;
  joinedAt: Date;
  leftAt: Date | null;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
  client: {
    id: string;
    fullName: string | null;
    email: string;
    brokerageId: string | null;
  } | null;
}

// =============================================================================
// Participant Management Actions
// =============================================================================

/**
 * Add a team member to a conversation
 * Requires owner or admin role
 */
export async function addParticipant(
  conversationId: string,
  userIdToAdd: string,
  role: ConversationParticipantRole = "member"
): Promise<ActionResult<ParticipantWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify caller has permission (owner or admin)
    const callerParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        role: { in: ["owner", "admin"] },
      },
      include: {
        conversation: {
          select: {
            organizationId: true,
            type: true,
          },
        },
      },
    });

    if (!callerParticipant) {
      return fail("You don't have permission to add participants");
    }

    if (callerParticipant.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    // Cannot add members to DMs
    if (callerParticipant.conversation.type === "direct") {
      return fail("Cannot add participants to direct messages");
    }

    // Verify user to add is in the organization
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: userIdToAdd,
      },
    });

    if (!member) {
      return fail("User is not a member of this organization");
    }

    // Check if already a participant
    const existingParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: userIdToAdd,
      },
    });

    if (existingParticipant) {
      if (existingParticipant.leftAt) {
        // Re-add participant
        const updated = await prisma.conversationParticipant.update({
          where: { id: existingParticipant.id },
          data: {
            leftAt: null,
            role,
            joinedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                brokerageId: true,
              },
            },
          },
        });

        revalidatePath(`/messages/${conversationId}`);
        return success(updated);
      }
      return fail("User is already a participant");
    }

    // Cannot make someone owner if caller is not owner
    if (role === "owner" && callerParticipant.role !== "owner") {
      return fail("Only owners can add other owners");
    }

    const participant = await prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId: userIdToAdd,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            brokerageId: true,
          },
        },
      },
    });

    revalidatePath(`/messages/${conversationId}`);
    return success(participant);
  } catch (error) {
    console.error("[Participants] Error adding participant:", error);
    return fail("Failed to add participant");
  }
}

/**
 * Add a client to a conversation (for client_support type)
 * Requires owner or admin role
 */
export async function addClientParticipant(
  conversationId: string,
  clientIdToAdd: string,
  hasBrokerAccess: boolean = false
): Promise<ActionResult<ParticipantWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify caller has permission
    const callerParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        role: { in: ["owner", "admin"] },
      },
      include: {
        conversation: {
          select: {
            organizationId: true,
            type: true,
          },
        },
      },
    });

    if (!callerParticipant) {
      return fail("You don't have permission to add participants");
    }

    if (callerParticipant.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    // Verify client belongs to organization
    const client = await prisma.client.findFirst({
      where: {
        id: clientIdToAdd,
        organizationId,
      },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Check if already a participant
    const existingParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        clientId: clientIdToAdd,
      },
    });

    if (existingParticipant && !existingParticipant.leftAt) {
      return fail("Client is already a participant");
    }

    if (existingParticipant?.leftAt) {
      // Re-add participant
      const updated = await prisma.conversationParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          leftAt: null,
          hasBrokerAccess,
          joinedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              brokerageId: true,
            },
          },
        },
      });

      revalidatePath(`/messages/${conversationId}`);
      return success(updated);
    }

    const participant = await prisma.conversationParticipant.create({
      data: {
        conversationId,
        clientId: clientIdToAdd,
        role: "member",
        hasBrokerAccess,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            brokerageId: true,
          },
        },
      },
    });

    revalidatePath(`/messages/${conversationId}`);
    return success(participant);
  } catch (error) {
    console.error("[Participants] Error adding client participant:", error);
    return fail("Failed to add client participant");
  }
}

/**
 * Remove a participant from a conversation
 * Requires owner or admin role (or self-removal)
 */
export async function removeParticipant(
  conversationId: string,
  participantId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Get the participant to remove
    const participantToRemove = await prisma.conversationParticipant.findUnique({
      where: { id: participantId },
      include: {
        conversation: {
          select: {
            organizationId: true,
            type: true,
          },
        },
      },
    });

    if (!participantToRemove) {
      return fail("Participant not found");
    }

    if (participantToRemove.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    // Check if self-removal
    const isSelfRemoval = participantToRemove.userId === userId;

    if (!isSelfRemoval) {
      // Verify caller has permission
      const callerParticipant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId,
          leftAt: null,
          role: { in: ["owner", "admin"] },
        },
      });

      if (!callerParticipant) {
        return fail("You don't have permission to remove participants");
      }

      // Cannot remove owner unless you're also owner
      if (
        participantToRemove.role === "owner" &&
        callerParticipant.role !== "owner"
      ) {
        return fail("Only owners can remove other owners");
      }
    }

    // Cannot remove last owner
    if (participantToRemove.role === "owner") {
      const otherOwners = await prisma.conversationParticipant.count({
        where: {
          conversationId,
          role: "owner",
          leftAt: null,
          id: { not: participantId },
        },
      });

      if (otherOwners === 0) {
        return fail("Cannot remove the last owner. Transfer ownership first.");
      }
    }

    // Soft remove (set leftAt)
    await prisma.conversationParticipant.update({
      where: { id: participantId },
      data: { leftAt: new Date() },
    });

    revalidatePath(`/messages/${conversationId}`);
    return ok();
  } catch (error) {
    console.error("[Participants] Error removing participant:", error);
    return fail("Failed to remove participant");
  }
}

/**
 * Leave a conversation (self-removal)
 */
export async function leaveConversation(
  conversationId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      return fail("You are not a participant of this conversation");
    }

    return removeParticipant(conversationId, participant.id);
  } catch (error) {
    console.error("[Participants] Error leaving conversation:", error);
    return fail("Failed to leave conversation");
  }
}

/**
 * Update a participant's role
 * Requires owner role
 */
export async function updateParticipantRole(
  participantId: string,
  newRole: ConversationParticipantRole
): Promise<ActionResult<ParticipantWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const participantToUpdate = await prisma.conversationParticipant.findUnique({
      where: { id: participantId },
      include: {
        conversation: {
          select: {
            id: true,
            organizationId: true,
          },
        },
      },
    });

    if (!participantToUpdate) {
      return fail("Participant not found");
    }

    if (participantToUpdate.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    // Verify caller is owner
    const callerParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: participantToUpdate.conversationId,
        userId,
        leftAt: null,
        role: "owner",
      },
    });

    if (!callerParticipant) {
      return fail("Only owners can change participant roles");
    }

    // Cannot demote yourself if you're the last owner
    if (participantToUpdate.userId === userId && newRole !== "owner") {
      const otherOwners = await prisma.conversationParticipant.count({
        where: {
          conversationId: participantToUpdate.conversationId,
          role: "owner",
          leftAt: null,
          id: { not: participantId },
        },
      });

      if (otherOwners === 0) {
        return fail("Cannot demote yourself. Transfer ownership first.");
      }
    }

    const updated = await prisma.conversationParticipant.update({
      where: { id: participantId },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            brokerageId: true,
          },
        },
      },
    });

    revalidatePath(`/messages/${participantToUpdate.conversationId}`);
    return success(updated);
  } catch (error) {
    console.error("[Participants] Error updating role:", error);
    return fail("Failed to update participant role");
  }
}

/**
 * Transfer conversation ownership to another participant
 */
export async function transferOwnership(
  conversationId: string,
  newOwnerParticipantId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify caller is current owner
    const callerParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        role: "owner",
      },
      include: {
        conversation: {
          select: { organizationId: true },
        },
      },
    });

    if (!callerParticipant) {
      return fail("Only the conversation owner can transfer ownership");
    }

    if (callerParticipant.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    // Verify new owner is a participant
    const newOwner = await prisma.conversationParticipant.findFirst({
      where: {
        id: newOwnerParticipantId,
        conversationId,
        leftAt: null,
      },
    });

    if (!newOwner) {
      return fail("New owner must be an active participant");
    }

    // Transfer ownership in transaction
    await prisma.$transaction([
      // Demote current owner to admin
      prisma.conversationParticipant.update({
        where: { id: callerParticipant.id },
        data: { role: "admin" },
      }),
      // Promote new owner
      prisma.conversationParticipant.update({
        where: { id: newOwnerParticipantId },
        data: { role: "owner" },
      }),
    ]);

    revalidatePath(`/messages/${conversationId}`);
    return ok();
  } catch (error) {
    console.error("[Participants] Error transferring ownership:", error);
    return fail("Failed to transfer ownership");
  }
}

// =============================================================================
// Participant Preferences
// =============================================================================

/**
 * Mute/unmute a conversation for the current user
 */
export async function toggleMuteConversation(
  conversationId: string
): Promise<ActionResult<boolean>> {
  try {
    const userId = await requireUserId();

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      return fail("You are not a participant of this conversation");
    }

    const updated = await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { isMuted: !participant.isMuted },
    });

    revalidatePath(`/messages/${conversationId}`);
    return success(updated.isMuted);
  } catch (error) {
    console.error("[Participants] Error toggling mute:", error);
    return fail("Failed to toggle mute");
  }
}

/**
 * Pin/unpin a conversation for the current user
 */
export async function togglePinConversation(
  conversationId: string
): Promise<ActionResult<boolean>> {
  try {
    const userId = await requireUserId();

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      return fail("You are not a participant of this conversation");
    }

    const updated = await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { isPinned: !participant.isPinned },
    });

    revalidatePath("/messages");
    return success(updated.isPinned);
  } catch (error) {
    console.error("[Participants] Error toggling pin:", error);
    return fail("Failed to toggle pin");
  }
}

// =============================================================================
// Broker Access Management
// =============================================================================

/**
 * Grant broker access to a participant
 * This allows a broker to see all messages in the conversation
 * and add their agents
 */
export async function grantBrokerAccess(
  participantId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const participantToUpdate = await prisma.conversationParticipant.findUnique({
      where: { id: participantId },
      include: {
        conversation: {
          select: {
            id: true,
            organizationId: true,
          },
        },
        client: {
          select: {
            brokerageId: true,
          },
        },
      },
    });

    if (!participantToUpdate) {
      return fail("Participant not found");
    }

    if (participantToUpdate.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    // Verify caller has admin permission
    const callerParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: participantToUpdate.conversationId,
        userId,
        leftAt: null,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!callerParticipant) {
      return fail("You don't have permission to grant broker access");
    }

    // Must be a client participant with a brokerage
    if (!participantToUpdate.clientId || !participantToUpdate.client?.brokerageId) {
      return fail("Broker access can only be granted to clients with a brokerage");
    }

    await prisma.conversationParticipant.update({
      where: { id: participantId },
      data: { hasBrokerAccess: true },
    });

    revalidatePath(`/messages/${participantToUpdate.conversationId}`);
    return ok();
  } catch (error) {
    console.error("[Participants] Error granting broker access:", error);
    return fail("Failed to grant broker access");
  }
}

/**
 * Revoke broker access from a participant
 */
export async function revokeBrokerAccess(
  participantId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const participantToUpdate = await prisma.conversationParticipant.findUnique({
      where: { id: participantId },
      include: {
        conversation: {
          select: {
            id: true,
            organizationId: true,
          },
        },
      },
    });

    if (!participantToUpdate) {
      return fail("Participant not found");
    }

    if (participantToUpdate.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    // Verify caller has admin permission
    const callerParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: participantToUpdate.conversationId,
        userId,
        leftAt: null,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!callerParticipant) {
      return fail("You don't have permission to revoke broker access");
    }

    await prisma.conversationParticipant.update({
      where: { id: participantId },
      data: { hasBrokerAccess: false },
    });

    revalidatePath(`/messages/${participantToUpdate.conversationId}`);
    return ok();
  } catch (error) {
    console.error("[Participants] Error revoking broker access:", error);
    return fail("Failed to revoke broker access");
  }
}

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Get all participants of a conversation
 */
export async function getConversationParticipants(
  conversationId: string,
  includeLeft: boolean = false
): Promise<ActionResult<ParticipantWithDetails[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify caller has access
    const callerParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
      include: {
        conversation: {
          select: { organizationId: true },
        },
      },
    });

    if (!callerParticipant) {
      return fail("You don't have access to this conversation");
    }

    if (callerParticipant.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        ...(includeLeft ? {} : { leftAt: null }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            brokerageId: true,
          },
        },
      },
      orderBy: [
        { role: "asc" }, // owners first
        { joinedAt: "asc" },
      ],
    });

    return success(participants);
  } catch (error) {
    console.error("[Participants] Error fetching participants:", error);
    return fail("Failed to fetch participants");
  }
}

/**
 * Get available team members to add to a conversation
 */
export async function getAvailableTeamMembers(
  conversationId: string
): Promise<
  ActionResult<
    {
      userId: string;
      fullName: string | null;
      email: string;
      avatarUrl: string | null;
      role: string;
    }[]
  >
> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify caller has access
    const callerParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        role: { in: ["owner", "admin"] },
      },
      include: {
        conversation: {
          select: { organizationId: true },
        },
      },
    });

    if (!callerParticipant) {
      return fail("You don't have permission to add participants");
    }

    // Get current participants
    const currentParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        leftAt: null,
        userId: { not: null },
      },
      select: { userId: true },
    });

    const participantUserIds = new Set(
      currentParticipants.map((p) => p.userId).filter(Boolean)
    );

    // Get all org members not in the conversation
    const availableMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId,
        userId: { notIn: Array.from(participantUserIds) as string[] },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return success(
      availableMembers.map((m) => ({
        userId: m.userId,
        fullName: m.user.fullName,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
      }))
    );
  } catch (error) {
    console.error("[Participants] Error fetching available members:", error);
    return fail("Failed to fetch available team members");
  }
}
