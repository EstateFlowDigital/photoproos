"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { runAgent, calculateCost } from "@/lib/ai/agent";
import { executeConfirmedAction } from "@/lib/ai/tools/executors";

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationSummary {
  id: string;
  title: string | null;
  status: string;
  messageCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
}

export interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  toolName: string | null;
  toolInput: Record<string, unknown> | null;
  toolOutput: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ConversationDetail {
  id: string;
  title: string | null;
  status: string;
  totalTokens: number;
  estimatedCost: number;
  messages: ConversationMessage[];
  pendingActions: PendingAction[];
  createdAt: Date;
}

export interface PendingAction {
  id: string;
  type: string;
  description: string;
  parameters: Record<string, unknown>;
  status: string;
  createdAt: Date;
}

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<
  ActionResult<ConversationSummary[]>
> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    const conversations = await prisma.aIConversation.findMany({
      where: {
        organizationId,
        userId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        },
        _count: { select: { messages: true } },
      },
    });

    return success(
      conversations.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        messageCount: c._count.messages,
        lastMessageAt: c.messages[0]?.createdAt || null,
        createdAt: c.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error getting conversations:", error);
    return fail("Failed to load conversations");
  }
}

/**
 * Get a single conversation with messages
 */
export async function getConversation(
  conversationId: string
): Promise<ActionResult<ConversationDetail>> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        organizationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        actions: {
          where: { status: "pending" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!conversation) {
      return fail("Conversation not found");
    }

    return success({
      id: conversation.id,
      title: conversation.title,
      status: conversation.status,
      totalTokens: conversation.totalTokens,
      estimatedCost: conversation.estimatedCost,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        toolName: m.toolName,
        toolInput: m.toolInput as Record<string, unknown> | null,
        toolOutput: m.toolOutput as Record<string, unknown> | null,
        createdAt: m.createdAt,
      })),
      pendingActions: conversation.actions.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        parameters: a.parameters as Record<string, unknown>,
        status: a.status,
        createdAt: a.createdAt,
      })),
      createdAt: conversation.createdAt,
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    return fail("Failed to load conversation");
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(): Promise<
  ActionResult<{ id: string }>
> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("User not found in database:", userId);
      return fail("User not found. Please try signing out and back in.");
    }

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      console.error("Organization not found:", organizationId);
      return fail("Organization not found. Please select an organization.");
    }

    const conversation = await prisma.aIConversation.create({
      data: {
        organizationId,
        userId,
        status: "active",
      },
    });

    return success({ id: conversation.id });
  } catch (error) {
    console.error("Error creating conversation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return fail(`Failed to create conversation: ${errorMessage}`);
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ActionResult<{ messageId: string; response: string }>> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify conversation belongs to user
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        organizationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { role: true, content: true },
        },
      },
    });

    if (!conversation) {
      return fail("Conversation not found");
    }

    // Save user message
    const userMessage = await prisma.aIMessage.create({
      data: {
        conversationId,
        userId,
        role: "user",
        content,
      },
    });

    // Build message history for the agent
    const messageHistory = [
      ...conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content },
    ];

    // Run the AI agent
    const agentResponse = await runAgent(messageHistory, {
      organizationId,
      userId,
    });

    // Save assistant message
    const assistantMessage = await prisma.aIMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: agentResponse.message,
      },
    });

    // Save tool calls as separate messages
    if (agentResponse.toolCalls) {
      for (const toolCall of agentResponse.toolCalls) {
        await prisma.aIMessage.create({
          data: {
            conversationId,
            role: "tool",
            content: `Used ${toolCall.name}`,
            toolName: toolCall.name,
            toolInput: toolCall.input,
            toolOutput: toolCall.result as Record<string, unknown>,
          },
        });
      }
    }

    // Save pending action if any
    if (agentResponse.pendingAction) {
      await prisma.aIAction.create({
        data: {
          conversationId,
          type: agentResponse.pendingAction.name,
          description: agentResponse.pendingAction.description,
          parameters: agentResponse.pendingAction.params,
          requiresConfirmation: true,
          status: "pending",
        },
      });
    }

    // Update conversation stats
    const cost = calculateCost(
      agentResponse.inputTokens,
      agentResponse.outputTokens
    );

    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        totalTokens: {
          increment: agentResponse.inputTokens + agentResponse.outputTokens,
        },
        estimatedCost: { increment: cost },
        // Set title from first message if not set
        title: conversation.title || content.slice(0, 50),
      },
    });

    // Log usage
    await prisma.aIUsageLog.create({
      data: {
        organizationId,
        userId,
        endpoint: "chat",
        model: "claude-sonnet-4-20250514",
        inputTokens: agentResponse.inputTokens,
        outputTokens: agentResponse.outputTokens,
        costCents: Math.round(cost * 100),
        latencyMs: 0, // Could track this if needed
      },
    });

    revalidatePath("/ai");
    return success({
      messageId: assistantMessage.id,
      response: agentResponse.message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return fail("Failed to send message");
  }
}

/**
 * Approve a pending action and execute it
 */
export async function approveAction(
  actionId: string
): Promise<ActionResult<{ success: boolean; result?: unknown }>> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    const action = await prisma.aIAction.findFirst({
      where: {
        id: actionId,
        conversation: {
          organizationId,
          userId,
        },
        status: "pending",
      },
    });

    if (!action) {
      return fail("Action not found");
    }

    // Execute the action
    const executionResult = await executeConfirmedAction(
      action.type,
      action.parameters as Record<string, unknown>,
      { organizationId, userId }
    );

    if (!executionResult.success) {
      // Mark as failed with error
      await prisma.aIAction.update({
        where: { id: actionId },
        data: {
          status: "failed",
          result: { error: executionResult.error },
        },
      });

      return fail(executionResult.error || "Action execution failed");
    }

    // Mark as completed with result
    await prisma.aIAction.update({
      where: { id: actionId },
      data: {
        status: "completed",
        confirmedAt: new Date(),
        result: executionResult.data as Record<string, unknown> | null,
      },
    });

    // Add a message to the conversation about the completed action
    await prisma.aIMessage.create({
      data: {
        conversationId: action.conversationId,
        role: "assistant",
        content: typeof executionResult.data === "object" &&
                 executionResult.data !== null &&
                 "message" in executionResult.data
          ? (executionResult.data as { message: string }).message
          : `Action "${action.type}" completed successfully.`,
        toolName: action.type,
        toolOutput: executionResult.data as Record<string, unknown> | null,
      },
    });

    revalidatePath("/ai");
    return success({ success: true, result: executionResult.data });
  } catch (error) {
    console.error("Error approving action:", error);
    return fail("Failed to approve action");
  }
}

/**
 * Cancel a pending action
 */
export async function cancelAction(
  actionId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    const action = await prisma.aIAction.findFirst({
      where: {
        id: actionId,
        conversation: {
          organizationId,
          userId,
        },
        status: "pending",
      },
    });

    if (!action) {
      return fail("Action not found");
    }

    await prisma.aIAction.update({
      where: { id: actionId },
      data: { status: "cancelled" },
    });

    revalidatePath("/ai");
    return success();
  } catch (error) {
    console.error("Error cancelling action:", error);
    return fail("Failed to cancel action");
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    await prisma.aIConversation.deleteMany({
      where: {
        id: conversationId,
        organizationId,
        userId,
      },
    });

    revalidatePath("/ai");
    return success();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return fail("Failed to delete conversation");
  }
}

/**
 * Get AI usage statistics
 */
export async function getAIUsageStats(): Promise<
  ActionResult<{
    totalConversations: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    thisMonth: {
      conversations: number;
      tokens: number;
      cost: number;
    };
  }>
> {
  try {
    const { userId } = await requireAuth();
    const organizationId = await requireOrganizationId();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [totalStats, monthStats, messageCount] = await Promise.all([
      prisma.aIConversation.aggregate({
        where: { organizationId, userId },
        _count: true,
        _sum: { totalTokens: true, estimatedCost: true },
      }),
      prisma.aIConversation.aggregate({
        where: {
          organizationId,
          userId,
          createdAt: { gte: monthStart },
        },
        _count: true,
        _sum: { totalTokens: true, estimatedCost: true },
      }),
      prisma.aIMessage.count({
        where: {
          conversation: { organizationId, userId },
        },
      }),
    ]);

    return success({
      totalConversations: totalStats._count,
      totalMessages: messageCount,
      totalTokens: totalStats._sum.totalTokens || 0,
      totalCost: totalStats._sum.estimatedCost || 0,
      thisMonth: {
        conversations: monthStats._count,
        tokens: monthStats._sum.totalTokens || 0,
        cost: monthStats._sum.estimatedCost || 0,
      },
    });
  } catch (error) {
    console.error("Error getting AI usage stats:", error);
    return fail("Failed to load usage stats");
  }
}
