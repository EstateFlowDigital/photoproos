"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
// Note: MessageReaction now uses String emoji instead of enum
import { getClientSession } from "./client-auth";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

export interface ClientConversationWithDetails {
  id: string;
  type: string;
  name: string | null;
  description: string | null;
  avatarUrl: string | null;
  isArchived: boolean;
  lastMessageAt: Date | null;
  createdAt: Date;
  participants: {
    id: string;
    userId: string | null;
    clientId: string | null;
    role: string;
    user: {
      id: string;
      fullName: string | null;
      avatarUrl: string | null;
    } | null;
    client: {
      id: string;
      fullName: string | null;
    } | null;
  }[];
  _count: {
    messages: number;
  };
  unreadCount: number;
}

export interface ClientMessageWithDetails {
  id: string;
  conversationId: string;
  content: string;
  contentHtml: string | null;
  attachments: unknown;
  parentId: string | null;
  threadCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  senderUserId: string | null;
  senderClientId: string | null;
  senderName: string;
  senderAvatar: string | null;
  senderUser: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  senderClient: {
    id: string;
    fullName: string | null;
  } | null;
  reactions: {
    id: string;
    emoji: string;
    userId: string | null;
    clientId: string | null;
  }[];
}

// =============================================================================
// Client Portal Conversation Actions
// =============================================================================

/**
 * Get all conversations for the current client
 */
export async function getClientConversations(): Promise<
  ActionResult<ClientConversationWithDetails[]>
> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in to view conversations");
    }

    const { clientId } = session;

    const conversations = await prisma.conversation.findMany({
      where: {
        isArchived: false,
        participants: {
          some: {
            clientId,
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
        _count: {
          select: { messages: true },
        },
      },
      orderBy: [
        { lastMessageAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
    });

    // Calculate unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.clientId === clientId);
        let unreadCount = 0;

        if (participant?.lastReadAt) {
          unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              createdAt: { gt: participant.lastReadAt },
              senderClientId: { not: clientId },
              isDeleted: false,
            },
          });
        } else {
          // All messages from team are unread
          unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderClientId: { not: clientId },
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
    console.error("[ClientMessages] Error fetching conversations:", error);
    return fail("Failed to fetch conversations");
  }
}

/**
 * Get a single conversation by ID (client)
 */
export async function getClientConversationById(
  conversationId: string
): Promise<ActionResult<ClientConversationWithDetails>> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in to view this conversation");
    }

    const { clientId } = session;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            clientId,
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
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!conversation) {
      return fail("Conversation not found or you don't have access");
    }

    // Calculate unread count
    const participant = conversation.participants.find((p) => p.clientId === clientId);
    let unreadCount = 0;

    if (participant?.lastReadAt) {
      unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          createdAt: { gt: participant.lastReadAt },
          senderClientId: { not: clientId },
          isDeleted: false,
        },
      });
    }

    return success({ ...conversation, unreadCount });
  } catch (error) {
    console.error("[ClientMessages] Error fetching conversation:", error);
    return fail("Failed to fetch conversation");
  }
}

// =============================================================================
// Client Portal Message Actions
// =============================================================================

/**
 * Get messages for a conversation (client)
 */
export async function getClientMessages(
  conversationId: string,
  options?: {
    limit?: number;
    cursor?: string;
  }
): Promise<
  ActionResult<{
    messages: ClientMessageWithDetails[];
    nextCursor: string | null;
    hasMore: boolean;
  }>
> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in to view messages");
    }

    const { clientId } = session;

    // Verify client has access
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        clientId,
        leftAt: null,
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    const limit = options?.limit || 50;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
        parentId: null, // Only top-level messages
      },
      include: {
        senderUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        senderClient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reactions: {
          select: {
            id: true,
            type: true,
            userId: true,
            clientId: true,
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

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? resultMessages[resultMessages.length - 1]?.id : null;

    // Reverse to show oldest first
    resultMessages.reverse();

    return success({
      messages: resultMessages as ClientMessageWithDetails[],
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("[ClientMessages] Error fetching messages:", error);
    return fail("Failed to fetch messages");
  }
}

/**
 * Send a message as a client
 */
export async function sendClientMessage(
  conversationId: string,
  content: string,
  options?: {
    contentHtml?: string;
    parentId?: string;
    clientMessageId?: string;
  }
): Promise<ActionResult<ClientMessageWithDetails>> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in to send messages");
    }

    const { clientId, client } = session;

    // Verify client has access
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        clientId,
        leftAt: null,
      },
      include: {
        conversation: {
          select: {
            isArchived: true,
          },
        },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    if (participant.conversation.isArchived) {
      return fail("This conversation has been archived");
    }

    // If this is a reply, verify parent exists
    if (options?.parentId) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: options.parentId,
          conversationId,
          isDeleted: false,
        },
      });

      if (!parentMessage) {
        return fail("Parent message not found");
      }

      // Increment thread count
      await prisma.message.update({
        where: { id: options.parentId },
        data: { threadCount: { increment: 1 } },
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderClientId: clientId,
        senderName: client.fullName || "Client",
        content,
        contentHtml: options?.contentHtml,
        parentId: options?.parentId,
        clientMessageId: options?.clientMessageId,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        senderClient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reactions: {
          select: {
            id: true,
            type: true,
            userId: true,
            clientId: true,
          },
        },
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: message.createdAt,
        lastMessageId: message.id,
      },
    });

    // Mark as read for sender
    await markClientConversationAsRead(conversationId);

    return success(message as ClientMessageWithDetails);
  } catch (error) {
    console.error("[ClientMessages] Error sending message:", error);
    return fail("Failed to send message");
  }
}

/**
 * Mark a conversation as read (client)
 */
export async function markClientConversationAsRead(
  conversationId: string
): Promise<ActionResult<void>> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in");
    }

    const { clientId } = session;

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        clientId,
        leftAt: null,
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    // Get the latest message
    const latestMessage = await prisma.message.findFirst({
      where: {
        conversationId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId: latestMessage?.id,
      },
    });

    return ok();
  } catch (error) {
    console.error("[ClientMessages] Error marking as read:", error);
    return fail("Failed to mark as read");
  }
}

/**
 * Add a reaction to a message (client)
 */
export async function addClientReaction(
  messageId: string,
  emoji: string
): Promise<ActionResult<void>> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in to react");
    }

    const { clientId } = session;

    // Verify message exists and client has access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          select: {
            allowReactions: true,
            participants: {
              where: { clientId, leftAt: null },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!message) {
      return fail("Message not found");
    }

    if (message.conversation.participants.length === 0) {
      return fail("You don't have access to this conversation");
    }

    if (!message.conversation.allowReactions) {
      return fail("Reactions are disabled for this conversation");
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        clientId,
        emoji,
      },
    });

    if (existingReaction) {
      // Remove if already exists (toggle)
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      // Add new reaction
      await prisma.messageReaction.create({
        data: {
          messageId,
          clientId,
          emoji,
        },
      });
    }

    return ok();
  } catch (error) {
    console.error("[ClientMessages] Error adding reaction:", error);
    return fail("Failed to add reaction");
  }
}

/**
 * Get total unread message count for a client
 */
export async function getClientTotalUnreadCount(): Promise<ActionResult<number>> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in");
    }

    const { clientId } = session;

    // Get all participant records for client
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        clientId,
        leftAt: null,
        conversation: {
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
          senderClientId: { not: clientId },
          isDeleted: false,
        },
      });
      totalUnread += unread;
    }

    return success(totalUnread);
  } catch (error) {
    console.error("[ClientMessages] Error getting unread count:", error);
    return fail("Failed to get unread count");
  }
}
