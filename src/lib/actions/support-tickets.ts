"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { requireOrganizationId, requireAuth, requireUserId } from "./auth-helper";
import type {
  SupportTicketCategory,
  SupportTicketStatus,
  SupportTicketPriority,
} from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface SupportTicketSummary {
  id: string;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  messageCount: number;
  unreadCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SupportTicketWithMessages {
  id: string;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  resolvedAt: Date | null;
  xpAwarded: number;
  createdAt: Date;
  messages: SupportMessageData[];
}

interface SupportMessageData {
  id: string;
  content: string;
  isFromAdmin: boolean;
  attachments: { filename: string; url: string }[] | null;
  readAt: Date | null;
  createdAt: Date;
  senderName?: string;
  senderAvatar?: string;
}

// ============================================================================
// USER-FACING ACTIONS
// ============================================================================

/**
 * Get all support tickets for the current user's organization
 */
export async function getSupportTickets(): Promise<
  ActionResult<SupportTicketSummary[]>
> {
  try {
    const auth = await requireAuth();
    const { organizationId, userId } = auth;

    const tickets = await prisma.supportTicket.findMany({
      where: {
        organizationId,
        userId, // Only show user's own tickets
      },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          select: {
            id: true,
            readAt: true,
            isFromAdmin: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return ok(
      tickets.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        messageCount: ticket.messages.length,
        unreadCount: ticket.messages.filter(
          (m) => m.isFromAdmin && !m.readAt
        ).length,
        lastMessageAt: ticket.messages[0]?.createdAt || null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Error getting support tickets:", error);
    return fail("Failed to get support tickets");
  }
}

/**
 * Get a single support ticket with all messages
 */
export async function getSupportTicket(
  ticketId: string
): Promise<ActionResult<SupportTicketWithMessages>> {
  try {
    const auth = await requireAuth();
    const { organizationId, userId } = auth;

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        organizationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return fail("Ticket not found");
    }

    // Mark admin messages as read
    await prisma.supportMessage.updateMany({
      where: {
        ticketId,
        isFromAdmin: true,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return ok({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      resolvedAt: ticket.resolvedAt,
      xpAwarded: ticket.xpAwarded,
      createdAt: ticket.createdAt,
      messages: ticket.messages.map((m) => ({
        id: m.id,
        content: m.content,
        isFromAdmin: m.isFromAdmin,
        attachments: m.attachments as { filename: string; url: string }[] | null,
        readAt: m.readAt,
        createdAt: m.createdAt,
        senderName: m.sender?.fullName || (m.isFromAdmin ? "Support Team" : undefined),
        senderAvatar: m.sender?.avatarUrl || undefined,
      })),
    });
  } catch (error) {
    console.error("Error getting support ticket:", error);
    return fail("Failed to get ticket");
  }
}

/**
 * Create a new support ticket
 */
export async function createSupportTicket(data: {
  subject: string;
  category: SupportTicketCategory;
  message: string;
  priority?: SupportTicketPriority;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const auth = await requireAuth();
    const { organizationId, userId } = auth;

    const ticket = await prisma.supportTicket.create({
      data: {
        organizationId,
        userId,
        subject: data.subject,
        category: data.category,
        priority: data.priority || "medium",
        status: "open",
        messages: {
          create: {
            senderUserId: userId,
            content: data.message,
            isFromAdmin: false,
          },
        },
      },
    });

    // Send Slack notification (fire and forget)
    notifySlackNewTicket(ticket.id, data.subject, data.category).catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[SupportTickets] Slack notification failed:", err);
      }
    });

    revalidatePath("/support");
    return ok({ id: ticket.id });
  } catch (error) {
    console.warn("[SupportTickets] Error creating support ticket:", error);
    return fail("Failed to create ticket");
  }
}

/**
 * Send a message to a support ticket
 */
export async function sendSupportMessage(
  ticketId: string,
  content: string,
  attachments?: { filename: string; url: string }[]
): Promise<ActionResult<{ id: string }>> {
  try {
    const auth = await requireAuth();
    const { organizationId, userId } = auth;

    // Verify ticket belongs to user
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        organizationId,
        userId,
      },
    });

    if (!ticket) {
      return fail("Ticket not found");
    }

    // Can't send messages to resolved/closed tickets
    if (ticket.status === "closed" || ticket.status === "resolved") {
      return fail("Cannot send messages to closed tickets");
    }

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderUserId: userId,
        content,
        isFromAdmin: false,
        attachments: attachments || null,
      },
    });

    // Update ticket status if it was resolved (re-open)
    if (ticket.status === "resolved") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "open" },
      });
    }

    // Update ticket timestamp
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    // Notify Slack
    notifySlackNewMessage(ticketId, content).catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[SupportTickets] Slack message notification failed:", err);
      }
    });

    revalidatePath("/support");
    revalidatePath(`/support/${ticketId}`);
    return ok({ id: message.id });
  } catch (error) {
    console.warn("[SupportTickets] Error sending message:", error);
    return fail("Failed to send message");
  }
}

/**
 * Close a support ticket (by user)
 */
export async function closeSupportTicket(
  ticketId: string
): Promise<ActionResult<void>> {
  try {
    const auth = await requireAuth();
    const { organizationId, userId } = auth;

    await prisma.supportTicket.update({
      where: {
        id: ticketId,
        organizationId,
        userId,
      },
      data: {
        status: "closed",
      },
    });

    revalidatePath("/support");
    return success();
  } catch (error) {
    console.error("Error closing ticket:", error);
    return fail("Failed to close ticket");
  }
}

// ============================================================================
// SLACK NOTIFICATIONS
// ============================================================================

async function notifySlackNewTicket(
  ticketId: string,
  subject: string,
  category: SupportTicketCategory
): Promise<void> {
  const webhookUrl = process.env.SLACK_SUPPORT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    // Get ticket details
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
        organization: {
          select: { name: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "asc" },
          select: { content: true },
        },
      },
    });

    if (!ticket) return;

    const categoryLabels: Record<SupportTicketCategory, string> = {
      support_request: "Support Request",
      report_issue: "Report Issue",
      billing: "Billing",
      questions: "Questions",
      feature_request: "Feature Request",
      other: "Other",
    };

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "New Support Ticket",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*From:* ${ticket.user?.fullName || "Unknown"} (${ticket.organization?.name || "Unknown"})`,
          },
          {
            type: "mrkdwn",
            text: `*Category:* ${categoryLabels[category]}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Subject:* ${subject}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Message:*\n${ticket.messages[0]?.content || "No message"}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Ticket",
              emoji: true,
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/super-admin/support/${ticketId}`,
            style: "primary",
          },
        ],
      },
    ];

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}

async function notifySlackNewMessage(
  ticketId: string,
  content: string
): Promise<void> {
  const webhookUrl = process.env.SLACK_SUPPORT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });

    if (!ticket) return;

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*New reply from ${ticket.user?.fullName || "User"}* on ticket: ${ticket.subject}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: content.length > 200 ? `${content.substring(0, 200)}...` : content,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Reply",
              emoji: true,
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/super-admin/support/${ticketId}`,
          },
        ],
      },
    ];

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}

// ============================================================================
// ADMIN ACTIONS (for Super Admin dashboard)
// ============================================================================

/**
 * Get all support tickets (admin view)
 */
export async function getAllSupportTickets(filters?: {
  status?: SupportTicketStatus;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
}): Promise<ActionResult<SupportTicketSummary[]>> {
  // Note: This should check for super admin role
  // For now, we'll implement the basic functionality
  try {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.priority) where.priority = filters.priority;

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
        organization: {
          select: { name: true },
        },
        messages: {
          select: {
            id: true,
            readAt: true,
            isFromAdmin: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return ok(
      tickets.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        messageCount: ticket.messages.length,
        unreadCount: ticket.messages.filter(
          (m) => !m.isFromAdmin && !m.readAt
        ).length,
        lastMessageAt: ticket.messages[0]?.createdAt || null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Error getting all support tickets:", error);
    return fail("Failed to get tickets");
  }
}

/**
 * Send an admin reply to a support ticket
 */
export async function sendAdminReply(
  ticketId: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  // Note: This should check for super admin role
  try {
    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderUserId: null, // Admin messages don't have a user
        content,
        isFromAdmin: true,
      },
    });

    // Update ticket to in_progress if it was open
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: "in_progress",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/super-admin/support");
    revalidatePath(`/super-admin/support/${ticketId}`);
    return ok({ id: message.id });
  } catch (error) {
    console.error("Error sending admin reply:", error);
    return fail("Failed to send reply");
  }
}

/**
 * Resolve a support ticket with optional XP reward
 */
export async function resolveTicket(
  ticketId: string,
  xpAward?: number,
  resolutionNote?: string
): Promise<ActionResult<void>> {
  // Note: This should check for super admin role
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return fail("Ticket not found");
    }

    // Add resolution note as message
    if (resolutionNote) {
      await prisma.supportMessage.create({
        data: {
          ticketId,
          content: `**Ticket Resolved**\n\n${resolutionNote}`,
          isFromAdmin: true,
        },
      });
    }

    // Update ticket
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: "resolved",
        resolvedAt: new Date(),
        xpAwarded: xpAward || 0,
      },
    });

    // Award XP if specified
    if (xpAward && xpAward > 0) {
      // Update user's gamification profile
      await prisma.gamificationProfile.upsert({
        where: { userId: ticket.userId },
        create: {
          userId: ticket.userId,
          totalXp: xpAward,
        },
        update: {
          totalXp: {
            increment: xpAward,
          },
        },
      });

      // Log the XP award
      await prisma.adminXpAward.create({
        data: {
          userId: ticket.userId,
          amount: xpAward,
          reason: "Support ticket resolution",
          ticketId,
        },
      });
    }

    revalidatePath("/super-admin/support");
    return success();
  } catch (error) {
    console.error("Error resolving ticket:", error);
    return fail("Failed to resolve ticket");
  }
}

/**
 * Update ticket priority
 */
export async function updateTicketPriority(
  ticketId: string,
  priority: SupportTicketPriority
): Promise<ActionResult<void>> {
  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { priority },
    });

    revalidatePath("/super-admin/support");
    return success();
  } catch (error) {
    console.error("Error updating priority:", error);
    return fail("Failed to update priority");
  }
}

/**
 * Admin interface for a support ticket with messages and user info
 */
interface AdminSupportTicketDetail {
  id: string;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  resolvedAt: Date | null;
  xpAwarded: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
  } | null;
  messages: SupportMessageData[];
}

/**
 * Get a single support ticket for admin view (no user restrictions)
 */
export async function getAdminSupportTicket(
  ticketId: string
): Promise<ActionResult<AdminSupportTicketDetail>> {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return fail("Ticket not found");
    }

    // Mark user messages as read (admin viewing)
    await prisma.supportMessage.updateMany({
      where: {
        ticketId,
        isFromAdmin: false,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return ok({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      resolvedAt: ticket.resolvedAt,
      xpAwarded: ticket.xpAwarded,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      user: {
        id: ticket.user.id,
        fullName: ticket.user.fullName,
        email: ticket.user.email,
        avatarUrl: ticket.user.avatarUrl,
      },
      organization: ticket.organization
        ? {
            id: ticket.organization.id,
            name: ticket.organization.name,
          }
        : null,
      messages: ticket.messages.map((m) => ({
        id: m.id,
        content: m.content,
        isFromAdmin: m.isFromAdmin,
        attachments: m.attachments as { filename: string; url: string }[] | null,
        readAt: m.readAt,
        createdAt: m.createdAt,
        senderName: m.sender?.fullName || (m.isFromAdmin ? "Support Team" : undefined),
        senderAvatar: m.sender?.avatarUrl || undefined,
      })),
    });
  } catch (error) {
    console.error("Error getting admin support ticket:", error);
    return fail("Failed to get ticket");
  }
}

/**
 * Mark all admin messages in a ticket as read
 */
export async function markMessagesAsRead(
  ticketId: string
): Promise<ActionResult<void>> {
  try {
    const auth = await requireAuth();
    const { organizationId, userId } = auth;

    // Verify ticket belongs to user
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        organizationId,
        userId,
      },
    });

    if (!ticket) {
      return fail("Ticket not found");
    }

    // Mark all admin messages as read
    await prisma.supportMessage.updateMany({
      where: {
        ticketId,
        isFromAdmin: true,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return success();
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return fail("Failed to mark messages as read");
  }
}
