"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ScheduledMessageStatus } from "@prisma/client";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { sendMessage, type MessageAttachment } from "./messages";

// =============================================================================
// Types
// =============================================================================

export interface ScheduledMessageWithDetails {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  contentHtml: string | null;
  attachments: MessageAttachment[] | null;
  mentions: string[] | null;
  parentId: string | null;
  scheduledFor: Date;
  timezone: string;
  status: ScheduledMessageStatus;
  sentAt: Date | null;
  sentMessageId: string | null;
  failedAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  conversation: {
    id: string;
    name: string | null;
    type: string;
  };
}

export interface ScheduleMessageInput {
  conversationId: string;
  content: string;
  contentHtml?: string;
  attachments?: MessageAttachment[];
  mentions?: string[];
  parentId?: string;
  scheduledFor: Date;
  timezone?: string;
}

// =============================================================================
// Scheduled Message Actions
// =============================================================================

/**
 * Schedule a message to be sent at a later time
 */
export async function scheduleMessage(
  input: ScheduleMessageInput
): Promise<ActionResult<ScheduledMessageWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify user has access to conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: input.conversationId,
        userId,
        leftAt: null,
        conversation: {
          organizationId,
          isArchived: false,
        },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    // Validate scheduled time is in the future
    if (input.scheduledFor <= new Date()) {
      return fail("Scheduled time must be in the future");
    }

    // Create scheduled message
    const scheduledMessage = await prisma.scheduledMessage.create({
      data: {
        conversationId: input.conversationId,
        userId,
        content: input.content,
        contentHtml: input.contentHtml,
        attachments: input.attachments as unknown as undefined,
        mentions: input.mentions,
        parentId: input.parentId,
        scheduledFor: input.scheduledFor,
        timezone: input.timezone || "UTC",
      },
      include: {
        conversation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    revalidatePath(`/messages/${input.conversationId}`);
    return success(scheduledMessage as unknown as ScheduledMessageWithDetails);
  } catch (error) {
    console.error("[ScheduledMessages] Error scheduling message:", error);
    return fail("Failed to schedule message");
  }
}

/**
 * Update a scheduled message
 */
export async function updateScheduledMessage(
  id: string,
  updates: Partial<{
    content: string;
    contentHtml: string;
    attachments: MessageAttachment[];
    mentions: string[];
    scheduledFor: Date;
    timezone: string;
  }>
): Promise<ActionResult<ScheduledMessageWithDetails>> {
  try {
    const userId = await requireUserId();

    // Verify ownership and pending status
    const existing = await prisma.scheduledMessage.findFirst({
      where: {
        id,
        userId,
        status: "pending",
      },
    });

    if (!existing) {
      return fail("Scheduled message not found or already sent");
    }

    // Validate scheduled time if updating
    if (updates.scheduledFor && updates.scheduledFor <= new Date()) {
      return fail("Scheduled time must be in the future");
    }

    const updated = await prisma.scheduledMessage.update({
      where: { id },
      data: {
        content: updates.content,
        contentHtml: updates.contentHtml,
        attachments: updates.attachments as unknown as undefined,
        mentions: updates.mentions,
        scheduledFor: updates.scheduledFor,
        timezone: updates.timezone,
      },
      include: {
        conversation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    revalidatePath(`/messages/${existing.conversationId}`);
    return success(updated as unknown as ScheduledMessageWithDetails);
  } catch (error) {
    console.error("[ScheduledMessages] Error updating scheduled message:", error);
    return fail("Failed to update scheduled message");
  }
}

/**
 * Cancel a scheduled message
 */
export async function cancelScheduledMessage(
  id: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    // Verify ownership and pending status
    const existing = await prisma.scheduledMessage.findFirst({
      where: {
        id,
        userId,
        status: "pending",
      },
    });

    if (!existing) {
      return fail("Scheduled message not found or already sent");
    }

    await prisma.scheduledMessage.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });

    revalidatePath(`/messages/${existing.conversationId}`);
    return ok();
  } catch (error) {
    console.error("[ScheduledMessages] Error cancelling scheduled message:", error);
    return fail("Failed to cancel scheduled message");
  }
}

/**
 * Get all pending scheduled messages for a conversation
 */
export async function getScheduledMessages(
  conversationId?: string
): Promise<ActionResult<ScheduledMessageWithDetails[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    const scheduledMessages = await prisma.scheduledMessage.findMany({
      where: {
        userId,
        status: "pending",
        conversation: {
          organizationId,
          ...(conversationId && { id: conversationId }),
        },
      },
      include: {
        conversation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { scheduledFor: "asc" },
    });

    return success(scheduledMessages as unknown as ScheduledMessageWithDetails[]);
  } catch (error) {
    console.error("[ScheduledMessages] Error fetching scheduled messages:", error);
    return fail("Failed to fetch scheduled messages");
  }
}

/**
 * Send a scheduled message immediately (bypass schedule)
 */
export async function sendScheduledMessageNow(
  id: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    // Verify ownership and pending status
    const scheduled = await prisma.scheduledMessage.findFirst({
      where: {
        id,
        userId,
        status: "pending",
      },
    });

    if (!scheduled) {
      return fail("Scheduled message not found or already sent");
    }

    // Send the message
    const result = await sendMessage({
      conversationId: scheduled.conversationId,
      content: scheduled.content,
      contentHtml: scheduled.contentHtml || undefined,
      attachments: scheduled.attachments as MessageAttachment[] | undefined,
      mentions: scheduled.mentions as string[] | undefined,
      parentId: scheduled.parentId || undefined,
    });

    if (!result.success) {
      // Mark as failed
      await prisma.scheduledMessage.update({
        where: { id },
        data: {
          status: "failed",
          failedAt: new Date(),
          failureReason: result.error,
        },
      });
      return fail(result.error);
    }

    // Mark as sent
    await prisma.scheduledMessage.update({
      where: { id },
      data: {
        status: "sent",
        sentAt: new Date(),
        sentMessageId: result.data.id,
      },
    });

    revalidatePath(`/messages/${scheduled.conversationId}`);
    return ok();
  } catch (error) {
    console.error("[ScheduledMessages] Error sending scheduled message:", error);
    return fail("Failed to send scheduled message");
  }
}

/**
 * Process due scheduled messages (called by cron job)
 * This function should be called periodically to send messages that are due
 */
export async function processDueScheduledMessages(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const now = new Date();
  let processed = 0;
  let sent = 0;
  let failed = 0;

  try {
    // Get all pending messages that are due
    const dueMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: "pending",
        scheduledFor: { lte: now },
      },
    });

    for (const scheduled of dueMessages) {
      processed++;

      try {
        // Verify conversation still exists and isn't archived
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: scheduled.conversationId,
            isArchived: false,
          },
        });

        if (!conversation) {
          await prisma.scheduledMessage.update({
            where: { id: scheduled.id },
            data: {
              status: "failed",
              failedAt: now,
              failureReason: "Conversation not found or archived",
            },
          });
          failed++;
          continue;
        }

        // Verify user still has access
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId: scheduled.conversationId,
            userId: scheduled.userId,
            leftAt: null,
          },
        });

        if (!participant) {
          await prisma.scheduledMessage.update({
            where: { id: scheduled.id },
            data: {
              status: "failed",
              failedAt: now,
              failureReason: "User no longer has access to conversation",
            },
          });
          failed++;
          continue;
        }

        // Get user info
        const user = await prisma.user.findUnique({
          where: { id: scheduled.userId },
          select: { fullName: true, avatarUrl: true },
        });

        // Create the message directly (bypass normal auth checks since this is a background job)
        const message = await prisma.message.create({
          data: {
            conversationId: scheduled.conversationId,
            senderUserId: scheduled.userId,
            senderName: user?.fullName || "Unknown",
            senderAvatar: user?.avatarUrl,
            content: scheduled.content,
            contentHtml: scheduled.contentHtml,
            parentId: scheduled.parentId,
            attachments: scheduled.attachments as unknown as undefined,
            mentions: scheduled.mentions as unknown as undefined,
          },
        });

        // Update conversation's lastMessageAt
        await prisma.conversation.update({
          where: { id: scheduled.conversationId },
          data: {
            lastMessageAt: message.createdAt,
            lastMessageId: message.id,
          },
        });

        // Mark scheduled message as sent
        await prisma.scheduledMessage.update({
          where: { id: scheduled.id },
          data: {
            status: "sent",
            sentAt: now,
            sentMessageId: message.id,
          },
        });

        sent++;
      } catch (error) {
        console.error(`[ScheduledMessages] Error processing scheduled message ${scheduled.id}:`, error);

        await prisma.scheduledMessage.update({
          where: { id: scheduled.id },
          data: {
            status: "failed",
            failedAt: now,
            failureReason: error instanceof Error ? error.message : "Unknown error",
          },
        });

        failed++;
      }
    }
  } catch (error) {
    console.error("[ScheduledMessages] Error in processDueScheduledMessages:", error);
  }

  return { processed, sent, failed };
}
