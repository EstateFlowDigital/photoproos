"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { MessageReactionType } from "@prisma/client";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import {
  generatePresignedUploadUrl,
  getPublicUrl,
  type PresignedUrlResponse,
} from "@/lib/storage/r2";

// =============================================================================
// Types
// =============================================================================

export interface SendMessageInput {
  conversationId: string;
  content: string;
  contentHtml?: string;
  parentId?: string;
  attachments?: MessageAttachment[];
  mentions?: string[];
  clientMessageId?: string;
}

export interface MessageAttachment {
  type: "image" | "file" | "video";
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface MessageWithDetails {
  id: string;
  conversationId: string;
  content: string;
  contentHtml: string | null;
  attachments: MessageAttachment[] | null;
  parentId: string | null;
  threadCount: number;
  mentions: string[] | null;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  clientMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  senderUserId: string | null;
  senderClientId: string | null;
  senderName: string;
  senderAvatar: string | null;
  senderUser: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
  senderClient: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
  reactions: {
    id: string;
    type: MessageReactionType;
    userId: string | null;
    clientId: string | null;
    user: {
      id: string;
      fullName: string | null;
    } | null;
  }[];
  readReceipts: {
    userId: string | null;
    clientId: string | null;
    readAt: Date;
    user?: {
      id: string;
      fullName: string | null;
      avatarUrl: string | null;
    } | null;
    client?: {
      id: string;
      fullName: string | null;
    } | null;
  }[];
}

// =============================================================================
// Message Actions
// =============================================================================

/**
 * Send a new message to a conversation
 */
export async function sendMessage(
  input: SendMessageInput
): Promise<ActionResult<MessageWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: input.conversationId,
        userId,
        leftAt: null,
      },
      include: {
        conversation: {
          select: {
            organizationId: true,
            isArchived: true,
          },
        },
      },
    });

    if (!participant) {
      return fail("You are not a participant of this conversation");
    }

    if (participant.conversation.organizationId !== organizationId) {
      return fail("Conversation not found");
    }

    if (participant.conversation.isArchived) {
      return fail("Cannot send messages to archived conversations");
    }

    // Get user info for cached sender fields
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, avatarUrl: true },
    });

    // If this is a reply, verify parent exists and increment thread count
    if (input.parentId) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: input.parentId,
          conversationId: input.conversationId,
          isDeleted: false,
        },
      });

      if (!parentMessage) {
        return fail("Parent message not found");
      }

      // Increment thread count on parent
      await prisma.message.update({
        where: { id: input.parentId },
        data: { threadCount: { increment: 1 } },
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: input.conversationId,
        senderUserId: userId,
        senderName: user?.fullName || "Unknown",
        senderAvatar: user?.avatarUrl,
        content: input.content,
        contentHtml: input.contentHtml,
        parentId: input.parentId,
        attachments: input.attachments as unknown as undefined,
        mentions: input.mentions,
        clientMessageId: input.clientMessageId,
      },
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
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: input.conversationId },
      data: {
        lastMessageAt: message.createdAt,
        lastMessageId: message.id,
      },
    });

    // Mark as read for sender
    await markConversationAsRead(input.conversationId);

    revalidatePath(`/messages/${input.conversationId}`);
    return success(message as unknown as MessageWithDetails);
  } catch (error) {
    console.error("[Messages] Error sending message:", error);
    return fail("Failed to send message");
  }
}

/**
 * Get messages for a conversation with pagination
 */
export async function getConversationMessages(
  conversationId: string,
  options?: {
    limit?: number;
    cursor?: string;
    parentId?: string | null;
  }
): Promise<
  ActionResult<{
    messages: MessageWithDetails[];
    nextCursor: string | null;
    hasMore: boolean;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        conversation: {
          organizationId,
        },
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
        ...(options?.parentId !== undefined && { parentId: options.parentId }),
      },
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
      messages: resultMessages as unknown as MessageWithDetails[],
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("[Messages] Error fetching messages:", error);
    return fail("Failed to fetch messages");
  }
}

/**
 * Get thread replies for a message
 */
export async function getThreadReplies(
  messageId: string
): Promise<ActionResult<MessageWithDetails[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Get the parent message to find conversation
    const parentMessage = await prisma.message.findUnique({
      where: { id: messageId },
      select: { conversationId: true },
    });

    if (!parentMessage) {
      return fail("Message not found");
    }

    // Verify access
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: parentMessage.conversationId,
        userId,
        leftAt: null,
        conversation: {
          organizationId,
        },
      },
    });

    if (!participant) {
      return fail("You don't have access to this thread");
    }

    const replies = await prisma.message.findMany({
      where: {
        parentId: messageId,
        isDeleted: false,
      },
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
      orderBy: { createdAt: "asc" },
    });

    return success(replies as unknown as MessageWithDetails[]);
  } catch (error) {
    console.error("[Messages] Error fetching thread replies:", error);
    return fail("Failed to fetch thread replies");
  }
}

/**
 * Edit a message (sender only)
 */
export async function editMessage(
  messageId: string,
  content: string,
  contentHtml?: string
): Promise<ActionResult<MessageWithDetails>> {
  try {
    const userId = await requireUserId();

    // Verify sender
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderUserId: userId,
        isDeleted: false,
      },
    });

    if (!message) {
      return fail("Message not found or you cannot edit it");
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        contentHtml,
        isEdited: true,
      },
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
    });

    revalidatePath(`/messages/${message.conversationId}`);
    return success(updated as unknown as MessageWithDetails);
  } catch (error) {
    console.error("[Messages] Error editing message:", error);
    return fail("Failed to edit message");
  }
}

/**
 * Delete a message (soft delete, sender or admin)
 */
export async function deleteMessage(
  messageId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Get message and verify access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          select: {
            organizationId: true,
            participants: {
              where: { userId, leftAt: null },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!message || message.conversation.organizationId !== organizationId) {
      return fail("Message not found");
    }

    const isOwner = message.senderUserId === userId;
    const isAdmin = message.conversation.participants.some(
      (p) => p.role === "owner" || p.role === "admin"
    );

    if (!isOwner && !isAdmin) {
      return fail("You cannot delete this message");
    }

    // Soft delete
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: "[Message deleted]",
        contentHtml: null,
        attachments: undefined,
      },
    });

    // If this was a thread reply, decrement parent's thread count
    if (message.parentId) {
      await prisma.message.update({
        where: { id: message.parentId },
        data: { threadCount: { decrement: 1 } },
      });
    }

    revalidatePath(`/messages/${message.conversationId}`);
    return ok();
  } catch (error) {
    console.error("[Messages] Error deleting message:", error);
    return fail("Failed to delete message");
  }
}

/**
 * Add a reaction to a message
 */
export async function addReaction(
  messageId: string,
  type: MessageReactionType
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
            allowReactions: true,
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
      return fail("You don't have access to this conversation");
    }

    if (!message.conversation.allowReactions) {
      return fail("Reactions are disabled for this conversation");
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId,
        type,
      },
    });

    if (existingReaction) {
      // Remove if already exists (toggle behavior)
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      // Add new reaction
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          type,
        },
      });
    }

    revalidatePath(`/messages/${message.conversationId}`);
    return ok();
  } catch (error) {
    console.error("[Messages] Error adding reaction:", error);
    return fail("Failed to add reaction");
  }
}

/**
 * Remove a reaction from a message
 */
export async function removeReaction(
  reactionId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    const reaction = await prisma.messageReaction.findFirst({
      where: {
        id: reactionId,
        userId,
      },
    });

    if (!reaction) {
      return fail("Reaction not found");
    }

    await prisma.messageReaction.delete({
      where: { id: reactionId },
    });

    return ok();
  } catch (error) {
    console.error("[Messages] Error removing reaction:", error);
    return fail("Failed to remove reaction");
  }
}

/**
 * Mark a conversation as read
 */
export async function markConversationAsRead(
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
    console.error("[Messages] Error marking as read:", error);
    return fail("Failed to mark as read");
  }
}

/**
 * Pin/unpin a message (admin only)
 */
export async function togglePinMessage(
  messageId: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Get message and verify admin access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          select: {
            organizationId: true,
            participants: {
              where: { userId, leftAt: null },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!message || message.conversation.organizationId !== organizationId) {
      return fail("Message not found");
    }

    const isAdmin = message.conversation.participants.some(
      (p) => p.role === "owner" || p.role === "admin"
    );

    if (!isAdmin) {
      return fail("Only admins can pin messages");
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });

    revalidatePath(`/messages/${message.conversationId}`);
    return ok();
  } catch (error) {
    console.error("[Messages] Error toggling pin:", error);
    return fail("Failed to toggle pin");
  }
}

/**
 * Get pinned messages for a conversation
 */
export async function getPinnedMessages(
  conversationId: string
): Promise<ActionResult<MessageWithDetails[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify access
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        conversation: {
          organizationId,
        },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    const pinnedMessages = await prisma.message.findMany({
      where: {
        conversationId,
        isPinned: true,
        isDeleted: false,
      },
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
      orderBy: { createdAt: "desc" },
    });

    return success(pinnedMessages as unknown as MessageWithDetails[]);
  } catch (error) {
    console.error("[Messages] Error fetching pinned messages:", error);
    return fail("Failed to fetch pinned messages");
  }
}

/**
 * Search messages within a conversation
 */
export async function searchMessages(
  conversationId: string,
  query: string
): Promise<ActionResult<MessageWithDetails[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify access
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        conversation: {
          organizationId,
        },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
        content: {
          contains: query,
          mode: "insensitive",
        },
      },
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
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return success(messages as unknown as MessageWithDetails[]);
  } catch (error) {
    console.error("[Messages] Error searching messages:", error);
    return fail("Failed to search messages");
  }
}

// =============================================================================
// Attachment Upload Actions
// =============================================================================

export interface AttachmentUploadRequest {
  conversationId: string;
  fileName: string;
  contentType: string;
  size: number;
}

export interface AttachmentUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Generate a presigned URL for uploading a message attachment
 */
export async function getMessageAttachmentUploadUrl(
  request: AttachmentUploadRequest
): Promise<ActionResult<AttachmentUploadResponse>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify user has access to conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: request.conversationId,
        userId,
        leftAt: null,
        conversation: {
          organizationId,
        },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    // Validate file size (max 25MB for attachments)
    const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;
    if (request.size > MAX_ATTACHMENT_SIZE) {
      return fail("File size exceeds 25MB limit");
    }

    // Validate content type
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "video/mp4",
      "video/quicktime",
    ];

    if (!ALLOWED_TYPES.includes(request.contentType)) {
      return fail("File type not allowed");
    }

    // Generate unique key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = request.fileName.split(".").pop()?.toLowerCase() || "";
    const key = `${organizationId}/messages/${request.conversationId}/${timestamp}-${random}.${extension}`;

    // Generate presigned URL
    const presignedResult = await generatePresignedUploadUrl({
      key,
      contentType: request.contentType,
      contentLength: request.size,
      expiresIn: 3600, // 1 hour
    });

    return success({
      uploadUrl: presignedResult.uploadUrl,
      publicUrl: presignedResult.publicUrl,
      key: presignedResult.key,
    });
  } catch (error) {
    console.error("[Messages] Error generating upload URL:", error);
    return fail("Failed to generate upload URL");
  }
}

/**
 * Generate presigned URLs for multiple attachments at once
 */
export async function getBatchAttachmentUploadUrls(
  conversationId: string,
  files: Array<{
    fileName: string;
    contentType: string;
    size: number;
  }>
): Promise<ActionResult<AttachmentUploadResponse[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify user has access to conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        conversation: {
          organizationId,
        },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    // Validate all files
    const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "video/mp4",
      "video/quicktime",
    ];

    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        return fail(`File "${file.fileName}" exceeds 25MB limit`);
      }
      if (!ALLOWED_TYPES.includes(file.contentType)) {
        return fail(`File type for "${file.fileName}" not allowed`);
      }
    }

    // Generate presigned URLs for all files
    const results: AttachmentUploadResponse[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const random = Math.random().toString(36).substring(2, 8);
      const extension = file.fileName.split(".").pop()?.toLowerCase() || "";
      const key = `${organizationId}/messages/${conversationId}/${timestamp}-${i}-${random}.${extension}`;

      const presignedResult = await generatePresignedUploadUrl({
        key,
        contentType: file.contentType,
        contentLength: file.size,
        expiresIn: 3600,
      });

      results.push({
        uploadUrl: presignedResult.uploadUrl,
        publicUrl: presignedResult.publicUrl,
        key: presignedResult.key,
      });
    }

    return success(results);
  } catch (error) {
    console.error("[Messages] Error generating batch upload URLs:", error);
    return fail("Failed to generate upload URLs");
  }
}
