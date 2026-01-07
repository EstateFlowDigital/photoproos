"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import type { MessageWithDetails } from "./messages";

// =============================================================================
// Types
// =============================================================================

export interface StarredMessageWithDetails {
  id: string;
  userId: string;
  messageId: string;
  note: string | null;
  createdAt: Date;
  message: MessageWithDetails;
}

// =============================================================================
// Starred Message Actions
// =============================================================================

/**
 * Star/bookmark a message
 */
export async function starMessage(
  messageId: string,
  note?: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify message exists and user has access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          select: {
            organizationId: true,
            participants: {
              where: { userId, leftAt: null },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!message || message.conversation.organizationId !== organizationId) {
      return fail("Message not found");
    }

    if (message.conversation.participants.length === 0) {
      return fail("You don't have access to this message");
    }

    if (message.isDeleted) {
      return fail("Cannot star deleted message");
    }

    // Check if already starred
    const existing = await prisma.starredMessage.findUnique({
      where: {
        userId_messageId: {
          userId,
          messageId,
        },
      },
    });

    if (existing) {
      return fail("Message already starred");
    }

    // Create starred message
    await prisma.starredMessage.create({
      data: {
        userId,
        messageId,
        note,
      },
    });

    return ok();
  } catch (error) {
    console.error("[StarredMessages] Error starring message:", error);
    return fail("Failed to star message");
  }
}

/**
 * Unstar a message
 */
export async function unstarMessage(
  messageId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    await prisma.starredMessage.deleteMany({
      where: {
        userId,
        messageId,
      },
    });

    return ok();
  } catch (error) {
    console.error("[StarredMessages] Error unstarring message:", error);
    return fail("Failed to unstar message");
  }
}

/**
 * Toggle star status on a message
 */
export async function toggleStarMessage(
  messageId: string
): Promise<ActionResult<{ isStarred: boolean }>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Check if already starred
    const existing = await prisma.starredMessage.findUnique({
      where: {
        userId_messageId: {
          userId,
          messageId,
        },
      },
    });

    if (existing) {
      // Unstar
      await prisma.starredMessage.delete({
        where: { id: existing.id },
      });
      return success({ isStarred: false });
    } else {
      // Verify message access and star
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            select: {
              organizationId: true,
              participants: {
                where: { userId, leftAt: null },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!message || message.conversation.organizationId !== organizationId) {
        return fail("Message not found");
      }

      if (message.conversation.participants.length === 0) {
        return fail("You don't have access to this message");
      }

      if (message.isDeleted) {
        return fail("Cannot star deleted message");
      }

      await prisma.starredMessage.create({
        data: {
          userId,
          messageId,
        },
      });

      return success({ isStarred: true });
    }
  } catch (error) {
    console.error("[StarredMessages] Error toggling star:", error);
    return fail("Failed to toggle star");
  }
}

/**
 * Update note on a starred message
 */
export async function updateStarredMessageNote(
  messageId: string,
  note: string | null
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    await prisma.starredMessage.updateMany({
      where: {
        userId,
        messageId,
      },
      data: { note },
    });

    return ok();
  } catch (error) {
    console.error("[StarredMessages] Error updating note:", error);
    return fail("Failed to update note");
  }
}

/**
 * Get all starred messages for current user
 */
export async function getStarredMessages(options?: {
  conversationId?: string;
  limit?: number;
  cursor?: string;
}): Promise<
  ActionResult<{
    starredMessages: StarredMessageWithDetails[];
    nextCursor: string | null;
    hasMore: boolean;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const limit = options?.limit || 50;

    const starredMessages = await prisma.starredMessage.findMany({
      where: {
        userId,
        message: {
          isDeleted: false,
          conversation: {
            organizationId,
            ...(options?.conversationId && { id: options.conversationId }),
          },
        },
      },
      include: {
        message: {
          include: {
            senderUser: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
            senderClient: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            conversation: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
            readReceipts: {
              select: {
                userId: true,
                clientId: true,
                readAt: true,
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
                client: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(options?.cursor && {
        cursor: { id: options.cursor },
        skip: 1,
      }),
    });

    const hasMore = starredMessages.length > limit;
    const items = hasMore ? starredMessages.slice(0, -1) : starredMessages;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return success({
      starredMessages: items as unknown as StarredMessageWithDetails[],
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("[StarredMessages] Error fetching starred messages:", error);
    return fail("Failed to fetch starred messages");
  }
}

/**
 * Check if a message is starred by the current user
 */
export async function isMessageStarred(
  messageId: string
): Promise<ActionResult<boolean>> {
  try {
    const userId = await requireUserId();

    const starred = await prisma.starredMessage.findUnique({
      where: {
        userId_messageId: {
          userId,
          messageId,
        },
      },
    });

    return success(!!starred);
  } catch (error) {
    console.error("[StarredMessages] Error checking starred status:", error);
    return fail("Failed to check starred status");
  }
}

/**
 * Get starred message IDs for a conversation (for efficient UI rendering)
 */
export async function getStarredMessageIds(
  conversationId: string
): Promise<ActionResult<string[]>> {
  try {
    const userId = await requireUserId();

    const starredMessages = await prisma.starredMessage.findMany({
      where: {
        userId,
        message: {
          conversationId,
        },
      },
      select: {
        messageId: true,
      },
    });

    return success(starredMessages.map((sm) => sm.messageId));
  } catch (error) {
    console.error("[StarredMessages] Error getting starred message IDs:", error);
    return fail("Failed to get starred message IDs");
  }
}
