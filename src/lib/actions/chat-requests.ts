"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { ChatRequestStatus } from "@prisma/client";
import { requireOrganizationId, requireUserId, requireAdmin } from "./auth-helper";
import { getClientSession } from "./client-auth";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

export interface ChatRequestWithDetails {
  id: string;
  organizationId: string;
  clientId: string;
  conversationId: string | null;
  subject: string;
  initialMessage: string;
  status: ChatRequestStatus;
  respondedAt: Date | null;
  respondedByUserId: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    fullName: string | null;
    email: string;
    company: string | null;
    brokerageId: string | null;
  };
  respondedBy: {
    id: string;
    fullName: string | null;
  } | null;
  conversation: {
    id: string;
    name: string | null;
  } | null;
}

export interface CreateChatRequestInput {
  subject: string;
  initialMessage: string;
}

// =============================================================================
// Client Actions (Portal)
// =============================================================================

/**
 * Create a chat request (client action)
 * Clients use this to request a new support conversation
 */
export async function createChatRequest(
  input: CreateChatRequestInput
): Promise<ActionResult<ChatRequestWithDetails>> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in to request a chat");
    }

    const { clientId } = session;

    // Get client details to find organization
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        organizationId: true,
        fullName: true,
        email: true,
        company: true,
        brokerageId: true,
      },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Check for existing pending request
    const existingRequest = await prisma.chatRequest.findFirst({
      where: {
        clientId,
        status: "pending",
      },
    });

    if (existingRequest) {
      return fail("You already have a pending chat request. Please wait for a response.");
    }

    // Create the chat request
    const chatRequest = await prisma.chatRequest.create({
      data: {
        organizationId: client.organizationId,
        clientId,
        subject: input.subject,
        initialMessage: input.initialMessage,
        status: "pending",
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            brokerageId: true,
          },
        },
        respondedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        conversation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // TODO: Send notification to team admins

    return success(chatRequest);
  } catch (error) {
    console.error("[ChatRequests] Error creating chat request:", error);
    return fail("Failed to create chat request");
  }
}

/**
 * Get all chat requests for the current client (portal)
 */
export async function getClientChatRequests(): Promise<
  ActionResult<ChatRequestWithDetails[]>
> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in to view chat requests");
    }

    const chatRequests = await prisma.chatRequest.findMany({
      where: {
        clientId: session.clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            brokerageId: true,
          },
        },
        respondedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        conversation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(chatRequests);
  } catch (error) {
    console.error("[ChatRequests] Error fetching client chat requests:", error);
    return fail("Failed to fetch chat requests");
  }
}

/**
 * Cancel a pending chat request (client action)
 */
export async function cancelChatRequest(
  requestId: string
): Promise<ActionResult<void>> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("You must be logged in to cancel a chat request");
    }

    const chatRequest = await prisma.chatRequest.findFirst({
      where: {
        id: requestId,
        clientId: session.clientId,
        status: "pending",
      },
    });

    if (!chatRequest) {
      return fail("Chat request not found or cannot be cancelled");
    }

    await prisma.chatRequest.delete({
      where: { id: requestId },
    });

    return ok();
  } catch (error) {
    console.error("[ChatRequests] Error cancelling chat request:", error);
    return fail("Failed to cancel chat request");
  }
}

// =============================================================================
// Team Actions (Dashboard)
// =============================================================================

/**
 * Get all pending chat requests for the organization
 */
export async function getPendingChatRequests(): Promise<
  ActionResult<ChatRequestWithDetails[]>
> {
  try {
    const organizationId = await requireOrganizationId();

    const chatRequests = await prisma.chatRequest.findMany({
      where: {
        organizationId,
        status: "pending",
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            brokerageId: true,
          },
        },
        respondedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        conversation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" }, // Oldest first
    });

    return success(chatRequests);
  } catch (error) {
    console.error("[ChatRequests] Error fetching pending requests:", error);
    return fail("Failed to fetch pending chat requests");
  }
}

/**
 * Get all chat requests for the organization with filters
 */
export async function getChatRequests(filters?: {
  status?: ChatRequestStatus;
  clientId?: string;
  limit?: number;
  offset?: number;
}): Promise<ActionResult<ChatRequestWithDetails[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const chatRequests = await prisma.chatRequest.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            brokerageId: true,
          },
        },
        respondedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        conversation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return success(chatRequests);
  } catch (error) {
    console.error("[ChatRequests] Error fetching chat requests:", error);
    return fail("Failed to fetch chat requests");
  }
}

/**
 * Get a single chat request by ID
 */
export async function getChatRequestById(
  requestId: string
): Promise<ActionResult<ChatRequestWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();

    const chatRequest = await prisma.chatRequest.findFirst({
      where: {
        id: requestId,
        organizationId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
            brokerageId: true,
          },
        },
        respondedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        conversation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!chatRequest) {
      return fail("Chat request not found");
    }

    return success(chatRequest);
  } catch (error) {
    console.error("[ChatRequests] Error fetching chat request:", error);
    return fail("Failed to fetch chat request");
  }
}

/**
 * Approve a chat request and create the conversation
 * Requires admin role
 */
export async function approveChatRequest(
  requestId: string,
  options?: {
    conversationName?: string;
    additionalParticipantUserIds?: string[];
  }
): Promise<ActionResult<{ conversationId: string }>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();
    await requireAdmin();

    const chatRequest = await prisma.chatRequest.findFirst({
      where: {
        id: requestId,
        organizationId,
        status: "pending",
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!chatRequest) {
      return fail("Chat request not found or already processed");
    }

    // Create conversation and update request in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the client support conversation
      const conversation = await tx.conversation.create({
        data: {
          organizationId,
          type: "client_support",
          name:
            options?.conversationName ||
            `Support: ${chatRequest.client.fullName || chatRequest.client.email}`,
          description: chatRequest.subject,
          clientId: chatRequest.clientId,
        },
      });

      // Add the approving user as owner
      await tx.conversationParticipant.create({
        data: {
          conversationId: conversation.id,
          userId,
          role: "owner",
        },
      });

      // Add additional team members if specified
      if (options?.additionalParticipantUserIds?.length) {
        await tx.conversationParticipant.createMany({
          data: options.additionalParticipantUserIds.map((participantUserId) => ({
            conversationId: conversation.id,
            userId: participantUserId,
            role: "member" as const,
          })),
        });
      }

      // Add the client as a participant
      await tx.conversationParticipant.create({
        data: {
          conversationId: conversation.id,
          clientId: chatRequest.clientId,
          role: "member",
        },
      });

      // Create the initial message from the client
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { fullName: true, avatarUrl: true },
      });

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderClientId: chatRequest.clientId,
          senderName: chatRequest.client.fullName || "Client",
          content: chatRequest.initialMessage,
        },
      });

      // Update the chat request
      await tx.chatRequest.update({
        where: { id: requestId },
        data: {
          status: "approved",
          conversationId: conversation.id,
          respondedAt: new Date(),
          respondedByUserId: userId,
        },
      });

      // Update conversation's last message timestamp
      await tx.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });

      return conversation;
    });

    // TODO: Send notification to client that their request was approved

    revalidatePath("/messages");
    revalidatePath("/messages/requests");
    return success({ conversationId: result.id });
  } catch (error) {
    console.error("[ChatRequests] Error approving chat request:", error);
    return fail("Failed to approve chat request");
  }
}

/**
 * Reject a chat request
 * Requires admin role
 */
export async function rejectChatRequest(
  requestId: string,
  rejectionReason?: string
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();
    await requireAdmin();

    const chatRequest = await prisma.chatRequest.findFirst({
      where: {
        id: requestId,
        organizationId,
        status: "pending",
      },
    });

    if (!chatRequest) {
      return fail("Chat request not found or already processed");
    }

    await prisma.chatRequest.update({
      where: { id: requestId },
      data: {
        status: "rejected",
        respondedAt: new Date(),
        respondedByUserId: userId,
        rejectionReason,
      },
    });

    // TODO: Send notification to client that their request was rejected

    revalidatePath("/messages/requests");
    return ok();
  } catch (error) {
    console.error("[ChatRequests] Error rejecting chat request:", error);
    return fail("Failed to reject chat request");
  }
}

/**
 * Get count of pending chat requests
 */
export async function getPendingChatRequestCount(): Promise<ActionResult<number>> {
  try {
    const organizationId = await requireOrganizationId();

    const count = await prisma.chatRequest.count({
      where: {
        organizationId,
        status: "pending",
      },
    });

    return success(count);
  } catch (error) {
    console.error("[ChatRequests] Error getting pending count:", error);
    return fail("Failed to get pending request count");
  }
}

// =============================================================================
// Expiration Management
// =============================================================================

/**
 * Expire old pending chat requests (can be called by a cron job)
 * Requests older than 7 days are automatically expired
 */
export async function expireOldChatRequests(): Promise<ActionResult<number>> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await prisma.chatRequest.updateMany({
      where: {
        status: "pending",
        createdAt: { lt: sevenDaysAgo },
      },
      data: {
        status: "expired",
      },
    });

    return success(result.count);
  } catch (error) {
    console.error("[ChatRequests] Error expiring old requests:", error);
    return fail("Failed to expire old chat requests");
  }
}
