"use server";

import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ok, fail, success } from "@/lib/types/action-result";
import { Prisma, type MessageVisibility } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface CreateMessageInput {
  content: string;
  visibility: MessageVisibility;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
  parentId?: string;
}

interface UpdateMessageInput {
  content: string;
}

interface ProjectMessageWithReplies {
  id: string;
  organizationId: string;
  projectId: string;
  senderType: string;
  senderUserId: string | null;
  senderName: string;
  senderEmail: string | null;
  senderAvatar: string | null;
  content: string;
  visibility: MessageVisibility;
  attachments: unknown;
  readBy: string[];
  readAt: Date | null;
  parentId: string | null;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  replies: ProjectMessageWithReplies[];
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get all messages for a project
 */
export async function getProjectMessages(
  projectId: string,
  includeInternal: boolean = true
) {
  const { orgId, userId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify the project belongs to this organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!project) {
      return fail("Project not found");
    }

    // Build visibility filter
    const visibilityFilter = includeInternal
      ? undefined // Show all messages
      : { visibility: "client" as MessageVisibility }; // Only show client-visible messages

    const messages = await prisma.projectMessage.findMany({
      where: {
        projectId,
        isDeleted: false,
        parentId: null, // Only top-level messages
        ...visibilityFilter,
      },
      include: {
        replies: {
          where: {
            isDeleted: false,
            ...visibilityFilter,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Mark messages as read for this user
    if (userId && messages.length > 0) {
      const unreadMessageIds = messages
        .filter((m) => !m.readBy.includes(userId))
        .map((m) => m.id);

      if (unreadMessageIds.length > 0) {
        await prisma.projectMessage.updateMany({
          where: { id: { in: unreadMessageIds } },
          data: {
            readBy: { push: userId },
          },
        });
      }
    }

    return success(messages as ProjectMessageWithReplies[]);
  } catch (error) {
    console.error("Error fetching project messages:", error);
    return fail("Failed to fetch messages");
  }
}

/**
 * Create a new message for a project
 */
export async function createProjectMessage(
  projectId: string,
  input: CreateMessageInput
) {
  const { orgId, userId } = await auth();
  if (!orgId || !userId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify the project belongs to this organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!project) {
      return fail("Project not found");
    }

    // Get sender info from Clerk
    const user = await currentUser();
    if (!user) {
      return fail("User not found");
    }

    const senderName =
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.emailAddresses[0]?.emailAddress ||
      "Unknown";
    const senderEmail = user.emailAddresses[0]?.emailAddress || null;
    const senderAvatar = user.imageUrl || null;

    // Verify parent message exists if provided
    if (input.parentId) {
      const parentMessage = await prisma.projectMessage.findFirst({
        where: {
          id: input.parentId,
          projectId,
          isDeleted: false,
        },
      });

      if (!parentMessage) {
        return fail("Parent message not found");
      }
    }

    const message = await prisma.projectMessage.create({
      data: {
        organizationId: org.id,
        projectId,
        senderType: "team",
        senderUserId: userId,
        senderName,
        senderEmail,
        senderAvatar,
        content: input.content,
        visibility: input.visibility,
        attachments: input.attachments
          ? (input.attachments as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        parentId: input.parentId || null,
        readBy: [userId], // Mark as read by sender
      },
      include: {
        replies: true,
      },
    });

    revalidatePath(`/galleries/${projectId}`);

    return success(message);
  } catch (error) {
    console.error("Error creating project message:", error);
    return fail("Failed to create message");
  }
}

/**
 * Create a message from the client portal (unauthenticated)
 */
export async function createClientMessage(
  projectId: string,
  content: string,
  senderName: string,
  senderEmail: string
) {
  try {
    // Get project and its organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: { select: { id: true } },
        client: { select: { id: true, email: true } },
      },
    });

    if (!project) {
      return fail("Project not found");
    }

    // Verify sender email matches the client
    if (project.client?.email !== senderEmail) {
      return fail("Unauthorized - email does not match gallery client");
    }

    const message = await prisma.projectMessage.create({
      data: {
        organizationId: project.organization.id,
        projectId,
        senderType: "client",
        senderUserId: null,
        senderName,
        senderEmail,
        senderAvatar: null,
        content,
        visibility: "client", // Client messages are always visible to both
        readBy: [],
      },
    });

    revalidatePath(`/galleries/${projectId}`);

    return success(message);
  } catch (error) {
    console.error("Error creating client message:", error);
    return fail("Failed to send message");
  }
}

/**
 * Update a message (edit)
 */
export async function updateProjectMessage(
  messageId: string,
  input: UpdateMessageInput
) {
  const { orgId, userId } = await auth();
  if (!orgId || !userId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Get message and verify ownership
    const existing = await prisma.projectMessage.findUnique({
      where: { id: messageId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Message not found");
    }

    // Only the sender can edit their message
    if (existing.senderUserId !== userId) {
      return fail("You can only edit your own messages");
    }

    // Cannot edit deleted messages
    if (existing.isDeleted) {
      return fail("Cannot edit a deleted message");
    }

    const message = await prisma.projectMessage.update({
      where: { id: messageId },
      data: {
        content: input.content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    revalidatePath(`/galleries/${existing.projectId}`);

    return success(message);
  } catch (error) {
    console.error("Error updating project message:", error);
    return fail("Failed to update message");
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteProjectMessage(messageId: string) {
  const { orgId, userId } = await auth();
  if (!orgId || !userId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Get message and verify ownership
    const existing = await prisma.projectMessage.findUnique({
      where: { id: messageId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Message not found");
    }

    // Only the sender or an admin can delete a message
    // For now, allow any org member to delete
    const message = await prisma.projectMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    revalidatePath(`/galleries/${existing.projectId}`);

    return ok();
  } catch (error) {
    console.error("Error deleting project message:", error);
    return fail("Failed to delete message");
  }
}

/**
 * Toggle message visibility (internal/client)
 */
export async function toggleMessageVisibility(
  messageId: string,
  visibility: MessageVisibility
) {
  const { orgId, userId } = await auth();
  if (!orgId || !userId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Get message and verify ownership
    const existing = await prisma.projectMessage.findUnique({
      where: { id: messageId },
    });

    if (!existing || existing.organizationId !== org.id) {
      return fail("Message not found");
    }

    // Only team messages can have visibility toggled
    if (existing.senderType !== "team") {
      return fail("Client messages are always visible");
    }

    const message = await prisma.projectMessage.update({
      where: { id: messageId },
      data: { visibility },
    });

    revalidatePath(`/galleries/${existing.projectId}`);

    return success(message);
  } catch (error) {
    console.error("Error toggling message visibility:", error);
    return fail("Failed to update message visibility");
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(messageIds: string[]) {
  const { orgId, userId } = await auth();
  if (!orgId || !userId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Get messages that belong to this org and aren't already read by this user
    const messages = await prisma.projectMessage.findMany({
      where: {
        id: { in: messageIds },
        organizationId: org.id,
        NOT: {
          readBy: { has: userId },
        },
      },
      select: { id: true },
    });

    if (messages.length > 0) {
      await prisma.projectMessage.updateMany({
        where: { id: { in: messages.map((m) => m.id) } },
        data: {
          readBy: { push: userId },
        },
      });
    }

    return ok();
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return fail("Failed to mark messages as read");
  }
}

/**
 * Get unread message count for a project
 */
export async function getUnreadMessageCount(projectId: string) {
  const { orgId, userId } = await auth();
  if (!orgId || !userId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    const count = await prisma.projectMessage.count({
      where: {
        projectId,
        organizationId: org.id,
        isDeleted: false,
        NOT: {
          readBy: { has: userId },
        },
      },
    });

    return success({ count });
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return fail("Failed to get unread count");
  }
}
