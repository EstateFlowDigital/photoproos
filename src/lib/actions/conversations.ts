"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type {
  ConversationType,
  ConversationParticipantRole,
} from "@prisma/client";
import { requireOrganizationId, requireUserId, requireAdmin } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

interface CreateConversationInput {
  type: ConversationType;
  name?: string;
  description?: string;
  clientId?: string;
  projectId?: string;
  participantUserIds?: string[];
}

interface UpdateConversationInput {
  name?: string;
  description?: string;
  isArchived?: boolean;
  isMuted?: boolean;
  allowReactions?: boolean;
  allowThreads?: boolean;
}

interface ConversationWithDetails {
  id: string;
  organizationId: string;
  type: ConversationType;
  name: string | null;
  description: string | null;
  avatarUrl: string | null;
  isArchived: boolean;
  isMuted: boolean;
  allowReactions: boolean;
  allowThreads: boolean;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  clientId: string | null;
  projectId: string | null;
  participants: {
    id: string;
    userId: string | null;
    clientId: string | null;
    role: ConversationParticipantRole;
    isMuted: boolean;
    isPinned: boolean;
    hasBrokerAccess: boolean;
    lastReadAt: Date | null;
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
    } | null;
  }[];
  _count: {
    messages: number;
  };
  unreadCount?: number;
}

// =============================================================================
// Team Member Actions
// =============================================================================

/**
 * Create a new conversation
 * - DM: Between two team members
 * - Group: Multiple team members
 * - Channel: Organization-wide topic channel (admin only)
 * - Client Support: Auto-created via chat request approval
 */
export async function createConversation(
  input: CreateConversationInput
): Promise<ActionResult<ConversationWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Validate input based on type
    if (input.type === "channel") {
      // Channels require admin permission
      await requireAdmin();
      if (!input.name) {
        return fail("Channel name is required");
      }
    }

    if (input.type === "direct") {
      // DMs require exactly one other participant
      if (!input.participantUserIds || input.participantUserIds.length !== 1) {
        return fail("Direct messages require exactly one other participant");
      }
      // Check if DM already exists between these users
      const existingDM = await findExistingDM(
        organizationId,
        userId,
        input.participantUserIds[0]
      );
      if (existingDM) {
        return success(existingDM);
      }
    }

    if (input.type === "client_support") {
      return fail("Client support conversations are created via chat request approval");
    }

    // Verify all participants are in the organization
    if (input.participantUserIds && input.participantUserIds.length > 0) {
      const validUsers = await prisma.organizationMember.findMany({
        where: {
          organizationId,
          userId: { in: input.participantUserIds },
        },
        select: { userId: true },
      });

      const validUserIds = new Set(validUsers.map((u) => u.userId));
      const invalidUsers = input.participantUserIds.filter((id) => !validUserIds.has(id));

      if (invalidUsers.length > 0) {
        return fail("Some users are not members of this organization");
      }
    }

    // Verify project belongs to organization if provided
    if (input.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: input.projectId, organizationId },
        select: { id: true },
      });
      if (!project) {
        return fail("Project not found");
      }
    }

    // Create conversation and add participants in a transaction
    const conversation = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          organizationId,
          type: input.type,
          name: input.name,
          description: input.description,
          clientId: input.clientId,
          projectId: input.projectId,
        },
      });

      // Add creator as owner
      await tx.conversationParticipant.create({
        data: {
          conversationId: conv.id,
          userId,
          role: "owner",
        },
      });

      // Add other participants as members
      if (input.participantUserIds && input.participantUserIds.length > 0) {
        await tx.conversationParticipant.createMany({
          data: input.participantUserIds.map((participantUserId) => ({
            conversationId: conv.id,
            userId: participantUserId,
            role: "member" as ConversationParticipantRole,
          })),
        });
      }

      return conv;
    });

    // Fetch full conversation details
    const fullConversation = await getConversationById(conversation.id);
    if (!fullConversation.success) {
      return fail("Failed to fetch created conversation");
    }

    revalidatePath("/messages");
    return success(fullConversation.data);
  } catch (error) {
    console.error("[Conversations] Error creating conversation:", error);
    return fail("Failed to create conversation");
  }
}

/**
 * Get all conversations for the current user
 */
export async function getUserConversations(filters?: {
  type?: ConversationType;
  isArchived?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResult<ConversationWithDetails[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const conversations = await prisma.conversation.findMany({
      where: {
        organizationId,
        isArchived: filters?.isArchived ?? false,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
        participants: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
      include: {
        participants: {
          where: { leftAt: null },
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
              },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: [
        { lastMessageAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: filters?.limit,
      skip: filters?.offset,
    });

    // Calculate unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        let unreadCount = 0;

        if (participant?.lastReadAt) {
          unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              createdAt: { gt: participant.lastReadAt },
              senderUserId: { not: userId },
              isDeleted: false,
            },
          });
        } else {
          // No lastReadAt means all messages are unread (except own)
          unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderUserId: { not: userId },
              isDeleted: false,
            },
          });
        }

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    return success(conversationsWithUnread);
  } catch (error) {
    console.error("[Conversations] Error fetching conversations:", error);
    return fail("Failed to fetch conversations");
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversationById(
  conversationId: string
): Promise<ActionResult<ConversationWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        organizationId,
        participants: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
      include: {
        participants: {
          where: { leftAt: null },
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
              },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!conversation) {
      return fail("Conversation not found or you don't have access");
    }

    // Calculate unread count
    const participant = conversation.participants.find((p) => p.userId === userId);
    let unreadCount = 0;

    if (participant?.lastReadAt) {
      unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          createdAt: { gt: participant.lastReadAt },
          senderUserId: { not: userId },
          isDeleted: false,
        },
      });
    }

    return success({ ...conversation, unreadCount });
  } catch (error) {
    console.error("[Conversations] Error fetching conversation:", error);
    return fail("Failed to fetch conversation");
  }
}

/**
 * Update conversation settings
 */
export async function updateConversation(
  conversationId: string,
  input: UpdateConversationInput
): Promise<ActionResult<ConversationWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Check if user has permission to update (owner or admin)
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!participant) {
      return fail("You don't have permission to update this conversation");
    }

    // Verify conversation belongs to organization
    const existingConversation = await prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!existingConversation) {
      return fail("Conversation not found");
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
        ...(input.isMuted !== undefined && { isMuted: input.isMuted }),
        ...(input.allowReactions !== undefined && { allowReactions: input.allowReactions }),
        ...(input.allowThreads !== undefined && { allowThreads: input.allowThreads }),
      },
    });

    const updated = await getConversationById(conversationId);
    if (!updated.success) {
      return fail("Failed to fetch updated conversation");
    }

    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);
    return success(updated.data);
  } catch (error) {
    console.error("[Conversations] Error updating conversation:", error);
    return fail("Failed to update conversation");
  }
}

/**
 * Archive a conversation
 */
export async function archiveConversation(
  conversationId: string
): Promise<ActionResult<void>> {
  try {
    const result = await updateConversation(conversationId, { isArchived: true });
    if (!result.success) {
      return fail(result.error);
    }
    return ok();
  } catch (error) {
    console.error("[Conversations] Error archiving conversation:", error);
    return fail("Failed to archive conversation");
  }
}

/**
 * Unarchive a conversation
 */
export async function unarchiveConversation(
  conversationId: string
): Promise<ActionResult<void>> {
  try {
    const result = await updateConversation(conversationId, { isArchived: false });
    if (!result.success) {
      return fail(result.error);
    }
    return ok();
  } catch (error) {
    console.error("[Conversations] Error unarchiving conversation:", error);
    return fail("Failed to unarchive conversation");
  }
}

/**
 * Delete a conversation (owner only)
 */
export async function deleteConversation(
  conversationId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Check if user is owner
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        role: "owner",
        leftAt: null,
      },
    });

    if (!participant) {
      return fail("Only the conversation owner can delete it");
    }

    // Verify conversation belongs to organization
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      return fail("Conversation not found");
    }

    // Delete conversation (cascades to participants, messages, etc.)
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    revalidatePath("/messages");
    return ok();
  } catch (error) {
    console.error("[Conversations] Error deleting conversation:", error);
    return fail("Failed to delete conversation");
  }
}

/**
 * Get total unread count across all conversations
 */
export async function getTotalUnreadCount(): Promise<ActionResult<number>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Get all participant records for user
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        userId,
        leftAt: null,
        conversation: {
          organizationId,
          isArchived: false,
        },
      },
      select: {
        conversationId: true,
        lastReadAt: true,
      },
    });

    let totalUnread = 0;

    for (const participant of participants) {
      const unread = await prisma.message.count({
        where: {
          conversationId: participant.conversationId,
          ...(participant.lastReadAt && {
            createdAt: { gt: participant.lastReadAt },
          }),
          senderUserId: { not: userId },
          isDeleted: false,
        },
      });
      totalUnread += unread;
    }

    return success(totalUnread);
  } catch (error) {
    console.error("[Conversations] Error getting unread count:", error);
    return fail("Failed to get unread count");
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Find existing DM between two users
 */
async function findExistingDM(
  organizationId: string,
  userId1: string,
  userId2: string
): Promise<ConversationWithDetails | null> {
  // Find conversations where both users are participants
  const conversations = await prisma.conversation.findMany({
    where: {
      organizationId,
      type: "direct",
      isArchived: false,
      AND: [
        {
          participants: {
            some: {
              userId: userId1,
              leftAt: null,
            },
          },
        },
        {
          participants: {
            some: {
              userId: userId2,
              leftAt: null,
            },
          },
        },
      ],
    },
    include: {
      participants: {
        where: { leftAt: null },
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
            },
          },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  // Filter to only DMs with exactly these two participants
  const dm = conversations.find(
    (c) =>
      c.participants.length === 2 &&
      c.participants.some((p) => p.userId === userId1) &&
      c.participants.some((p) => p.userId === userId2)
  );

  return dm || null;
}

/**
 * Get or create a conversation linked to a specific project
 * Creates a group conversation for team discussion about the project
 */
export async function getOrCreateProjectConversation(
  projectId: string
): Promise<ActionResult<ConversationWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
      select: { id: true, name: true },
    });

    if (!project) {
      return fail("Project not found");
    }

    // Check if a conversation already exists for this project
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        organizationId,
        projectId,
        isArchived: false,
      },
      include: {
        participants: {
          where: { leftAt: null },
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
              },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (existingConversation) {
      // Check if user is already a participant
      const isParticipant = existingConversation.participants.some(
        (p) => p.userId === userId
      );

      if (!isParticipant) {
        // Add user to the conversation
        await prisma.conversationParticipant.create({
          data: {
            conversationId: existingConversation.id,
            userId,
            role: "member",
          },
        });
      }

      // Refetch with updated participants
      const updated = await getConversationById(existingConversation.id);
      if (!updated.success) {
        return fail("Failed to fetch conversation");
      }
      return success(updated.data);
    }

    // Create new project conversation
    const conversation = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          organizationId,
          type: "group",
          name: `${project.name} Team`,
          projectId,
          description: `Team discussion for ${project.name}`,
        },
      });

      // Add creator as owner
      await tx.conversationParticipant.create({
        data: {
          conversationId: conv.id,
          userId,
          role: "owner",
        },
      });

      return conv;
    });

    // Fetch full conversation details
    const fullConversation = await getConversationById(conversation.id);
    if (!fullConversation.success) {
      return fail("Failed to fetch created conversation");
    }

    revalidatePath("/messages");
    return success(fullConversation.data);
  } catch (error) {
    console.error("[Conversations] Error getting/creating project conversation:", error);
    return fail("Failed to get or create project conversation");
  }
}
