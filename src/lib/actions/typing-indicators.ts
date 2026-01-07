"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

export interface TypingUser {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  startedAt: Date;
}

// Typing indicators expire after 5 seconds of no updates
const TYPING_EXPIRY_MS = 5000;

// =============================================================================
// Typing Indicator Actions
// =============================================================================

/**
 * Update typing status for the current user in a conversation
 * Called when user is actively typing
 */
export async function updateTypingStatus(
  conversationId: string,
  isTyping: boolean
): Promise<ActionResult<void>> {
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

    if (isTyping) {
      // Update or create typing indicator
      await prisma.typingIndicator.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        update: {
          updatedAt: new Date(),
        },
        create: {
          conversationId,
          userId,
          updatedAt: new Date(),
        },
      });
    } else {
      // Remove typing indicator
      await prisma.typingIndicator.deleteMany({
        where: {
          conversationId,
          userId,
        },
      });
    }

    return ok();
  } catch (error) {
    console.error("[TypingIndicators] Error updating typing status:", error);
    return fail("Failed to update typing status");
  }
}

/**
 * Get users currently typing in a conversation
 */
export async function getTypingUsers(
  conversationId: string
): Promise<ActionResult<TypingUser[]>> {
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

    // Get active typing indicators (not expired)
    const expiryThreshold = new Date(Date.now() - TYPING_EXPIRY_MS);

    const typingIndicators = await prisma.typingIndicator.findMany({
      where: {
        conversationId,
        userId: { not: userId }, // Exclude current user
        updatedAt: { gt: expiryThreshold },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Clean up expired indicators in the background
    prisma.typingIndicator.deleteMany({
      where: {
        updatedAt: { lt: expiryThreshold },
      },
    }).catch(() => {
      // Ignore cleanup errors
    });

    const typingUsers: TypingUser[] = typingIndicators.map((indicator) => ({
      userId: indicator.userId,
      userName: indicator.user.fullName || "Unknown",
      avatarUrl: indicator.user.avatarUrl,
      startedAt: indicator.updatedAt,
    }));

    return success(typingUsers);
  } catch (error) {
    console.error("[TypingIndicators] Error getting typing users:", error);
    return fail("Failed to get typing users");
  }
}

/**
 * Clear typing status when user leaves conversation or stops typing
 */
export async function clearTypingStatus(
  conversationId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    await prisma.typingIndicator.deleteMany({
      where: {
        conversationId,
        userId,
      },
    });

    return ok();
  } catch (error) {
    console.error("[TypingIndicators] Error clearing typing status:", error);
    return fail("Failed to clear typing status");
  }
}
