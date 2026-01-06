"use server";

import type { VoidActionResult } from "@/lib/types/action-result";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth/clerk";
import {
  syncOrganizationEmails,
  syncEmailAccount,
  getEmailSyncStatus,
} from "@/lib/services/email-sync";
import {
  markGmailMessagesRead,
  archiveGmailMessages,
  toggleGmailStar,
  sendGmailEmail,
} from "@/lib/integrations/gmail";

/**
 * Manually trigger email sync for the current organization
 */
export async function triggerEmailSync(options?: {
  accountId?: string;
  fullSync?: boolean;
}): Promise<{
  success: boolean;
  results?: Array<{
    accountId: string;
    email: string;
    threadsProcessed: number;
    messagesProcessed: number;
    newThreads: number;
  }>;
  error?: string;
}> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const results = await syncOrganizationEmails(auth.organizationId, {
      accountId: options?.accountId,
      fullSync: options?.fullSync,
      maxThreads: 100,
    });

    revalidatePath("/inbox");

    return {
      success: true,
      results: results.map((r) => ({
        accountId: r.accountId,
        email: r.email,
        threadsProcessed: r.threadsProcessed,
        messagesProcessed: r.messagesProcessed,
        newThreads: r.newThreads,
      })),
    };
  } catch (error) {
    console.error("Email sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sync failed",
    };
  }
}

/**
 * Get email threads for the inbox
 */
export async function getEmailThreads(options?: {
  filter?: "all" | "unread" | "starred" | "archived";
  search?: string;
  clientId?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  threads?: Array<{
    id: string;
    subject: string;
    snippet: string;
    participantEmails: string[];
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
    lastMessageAt: Date;
    clientId: string | null;
    client: {
      id: string;
      fullName: string | null;
      email: string;
      company: string | null;
    } | null;
    messageCount: number;
    latestMessage: {
      id: string;
      fromEmail: string;
      fromName: string | null;
      direction: "INBOUND" | "OUTBOUND";
      hasAttachments: boolean;
      sentAt: Date;
    } | null;
  }>;
  total?: number;
  unreadCount?: number;
  error?: string;
}> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const {
      filter = "all",
      search,
      clientId,
      limit = 50,
      offset = 0,
    } = options || {};

    // Build where clause
    const where: Record<string, unknown> = {
      organizationId: auth.organizationId,
    };

    switch (filter) {
      case "unread":
        where.isRead = false;
        where.isArchived = false;
        break;
      case "starred":
        where.isStarred = true;
        where.isArchived = false;
        break;
      case "archived":
        where.isArchived = true;
        break;
      default:
        where.isArchived = false;
        break;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { snippet: { contains: search, mode: "insensitive" } },
        { participantEmails: { has: search.toLowerCase() } },
      ];
    }

    const [threads, total, unreadCount] = await Promise.all([
      prisma.emailThread.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              company: true,
            },
          },
          messages: {
            orderBy: { sentAt: "desc" },
            take: 1,
            select: {
              id: true,
              fromEmail: true,
              fromName: true,
              direction: true,
              hasAttachments: true,
              sentAt: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.emailThread.count({ where }),
      prisma.emailThread.count({
        where: {
          organizationId: auth.organizationId,
          isRead: false,
          isArchived: false,
        },
      }),
    ]);

    return {
      success: true,
      threads: threads.map((t) => ({
        id: t.id,
        subject: t.subject,
        snippet: t.snippet,
        participantEmails: t.participantEmails,
        isRead: t.isRead,
        isStarred: t.isStarred,
        isArchived: t.isArchived,
        lastMessageAt: t.lastMessageAt,
        clientId: t.clientId,
        client: t.client,
        messageCount: t._count.messages,
        latestMessage: t.messages[0] || null,
      })),
      total,
      unreadCount,
    };
  } catch (error) {
    console.error("Error fetching email threads:", error);
    return { success: false, error: "Failed to fetch threads" };
  }
}

/**
 * Get a single thread with all messages
 */
export async function getEmailThread(threadId: string): Promise<{
  success: boolean;
  thread?: {
    id: string;
    subject: string;
    participantEmails: string[];
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
    clientId: string | null;
    client: {
      id: string;
      fullName: string | null;
      email: string;
      company: string | null;
    } | null;
    messages: Array<{
      id: string;
      fromEmail: string;
      fromName: string | null;
      toEmails: string[];
      subject: string;
      bodyHtml: string | null;
      bodyText: string | null;
      direction: "INBOUND" | "OUTBOUND";
      isRead: boolean;
      hasAttachments: boolean;
      sentAt: Date;
      attachments: Array<{
        id: string;
        filename: string;
        contentType: string;
        size: number;
      }>;
    }>;
  };
  error?: string;
}> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const thread = await prisma.emailThread.findFirst({
      where: {
        id: threadId,
        organizationId: auth.organizationId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true,
          },
        },
        messages: {
          orderBy: { sentAt: "asc" },
          include: {
            attachments: {
              select: {
                id: true,
                filename: true,
                contentType: true,
                size: true,
              },
            },
          },
        },
      },
    });

    if (!thread) {
      return { success: false, error: "Thread not found" };
    }

    return {
      success: true,
      thread: {
        id: thread.id,
        subject: thread.subject,
        participantEmails: thread.participantEmails,
        isRead: thread.isRead,
        isStarred: thread.isStarred,
        isArchived: thread.isArchived,
        clientId: thread.clientId,
        client: thread.client,
        messages: thread.messages.map((m) => ({
          id: m.id,
          fromEmail: m.fromEmail,
          fromName: m.fromName,
          toEmails: m.toEmails,
          subject: m.subject,
          bodyHtml: m.bodyHtml,
          bodyText: m.bodyText,
          direction: m.direction as "INBOUND" | "OUTBOUND",
          isRead: m.isRead,
          hasAttachments: m.hasAttachments,
          sentAt: m.sentAt,
          attachments: m.attachments,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching email thread:", error);
    return { success: false, error: "Failed to fetch thread" };
  }
}

/**
 * Mark thread as read/unread
 */
export async function markThreadRead(
  threadId: string,
  read: boolean
): Promise<VoidActionResult> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const thread = await prisma.emailThread.findFirst({
      where: {
        id: threadId,
        organizationId: auth.organizationId,
      },
      include: {
        emailAccount: true,
        messages: {
          select: { providerMessageId: true },
        },
      },
    });

    if (!thread) {
      return { success: false, error: "Thread not found" };
    }

    // Update in Gmail
    if (thread.emailAccount.provider === "GMAIL") {
      const messageIds = thread.messages.map((m) => m.providerMessageId);
      if (read) {
        await markGmailMessagesRead(thread.emailAccount.id, messageIds);
      }
      // Note: Gmail API doesn't have a simple "mark unread" - would need to add UNREAD label
    }

    // Update in database
    await prisma.emailThread.update({
      where: { id: threadId },
      data: { isRead: read },
    });

    await prisma.emailMessage.updateMany({
      where: { threadId },
      data: { isRead: read },
    });

    revalidatePath("/inbox");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error marking thread read:", error);
    return { success: false, error: "Failed to update thread" };
  }
}

/**
 * Star/unstar a thread
 */
export async function toggleThreadStar(
  threadId: string
): Promise<{ success: boolean; isStarred?: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const thread = await prisma.emailThread.findFirst({
      where: {
        id: threadId,
        organizationId: auth.organizationId,
      },
      include: {
        emailAccount: true,
        messages: {
          select: { providerMessageId: true },
        },
      },
    });

    if (!thread) {
      return { success: false, error: "Thread not found" };
    }

    const newStarred = !thread.isStarred;

    // Update in Gmail
    if (thread.emailAccount.provider === "GMAIL") {
      const messageIds = thread.messages.map((m) => m.providerMessageId);
      await toggleGmailStar(thread.emailAccount.id, messageIds, newStarred);
    }

    // Update in database
    await prisma.emailThread.update({
      where: { id: threadId },
      data: { isStarred: newStarred },
    });

    revalidatePath("/inbox");

    return { success: true, isStarred: newStarred };
  } catch (error) {
    console.error("Error toggling star:", error);
    return { success: false, error: "Failed to update thread" };
  }
}

/**
 * Archive/unarchive a thread
 */
export async function toggleThreadArchive(
  threadId: string
): Promise<{ success: boolean; isArchived?: boolean; error?: string }> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const thread = await prisma.emailThread.findFirst({
      where: {
        id: threadId,
        organizationId: auth.organizationId,
      },
      include: {
        emailAccount: true,
        messages: {
          select: { providerMessageId: true },
        },
      },
    });

    if (!thread) {
      return { success: false, error: "Thread not found" };
    }

    const newArchived = !thread.isArchived;

    // Update in Gmail
    if (thread.emailAccount.provider === "GMAIL" && newArchived) {
      const messageIds = thread.messages.map((m) => m.providerMessageId);
      await archiveGmailMessages(thread.emailAccount.id, messageIds);
    }

    // Update in database
    await prisma.emailThread.update({
      where: { id: threadId },
      data: { isArchived: newArchived },
    });

    revalidatePath("/inbox");

    return { success: true, isArchived: newArchived };
  } catch (error) {
    console.error("Error toggling archive:", error);
    return { success: false, error: "Failed to update thread" };
  }
}

/**
 * Send a reply to a thread
 */
export async function sendEmailReply(
  threadId: string,
  body: string
): Promise<VoidActionResult> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const thread = await prisma.emailThread.findFirst({
      where: {
        id: threadId,
        organizationId: auth.organizationId,
      },
      include: {
        emailAccount: true,
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
    });

    if (!thread) {
      return { success: false, error: "Thread not found" };
    }

    const lastMessage = thread.messages[0];
    if (!lastMessage) {
      return { success: false, error: "No messages in thread" };
    }

    // Determine recipient (reply to sender or original recipients)
    const recipients =
      lastMessage.direction === "INBOUND"
        ? [lastMessage.fromEmail]
        : lastMessage.toEmails;

    // Send via Gmail
    if (thread.emailAccount.provider === "GMAIL") {
      const result = await sendGmailEmail(thread.emailAccount.id, {
        to: recipients,
        subject: thread.subject.startsWith("Re:")
          ? thread.subject
          : `Re: ${thread.subject}`,
        body,
        bodyType: "html",
        threadId: thread.providerThreadId,
        inReplyTo: lastMessage.providerMessageId,
      });

      if (!result) {
        return { success: false, error: "Failed to send email" };
      }

      // Trigger a sync to get the sent message
      await syncEmailAccount(thread.emailAccount.id, { maxThreads: 10 });
    }

    revalidatePath("/inbox");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error sending reply:", error);
    return { success: false, error: "Failed to send reply" };
  }
}

/**
 * Send a new email
 */
export async function sendNewEmail(options: {
  accountId: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
}): Promise<VoidActionResult> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify account belongs to organization
    const account = await prisma.emailAccount.findFirst({
      where: {
        id: options.accountId,
        organizationId: auth.organizationId,
      },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Send via Gmail
    if (account.provider === "GMAIL") {
      const result = await sendGmailEmail(account.id, {
        to: options.to,
        cc: options.cc,
        subject: options.subject,
        body: options.body,
        bodyType: "html",
      });

      if (!result) {
        return { success: false, error: "Failed to send email" };
      }

      // Trigger a sync to get the sent message
      await syncEmailAccount(account.id, { maxThreads: 10 });
    }

    revalidatePath("/inbox");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Get sync status for the current organization
 */
export async function getOrganizationSyncStatus() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    const status = await getEmailSyncStatus(auth.organizationId);
    return { success: true, ...status };
  } catch (error) {
    console.error("Error getting sync status:", error);
    return { success: false, error: "Failed to get sync status" };
  }
}

/**
 * Link a thread to a client
 */
export async function linkThreadToClient(
  threadId: string,
  clientId: string | null
): Promise<VoidActionResult> {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify thread belongs to organization
    const thread = await prisma.emailThread.findFirst({
      where: {
        id: threadId,
        organizationId: auth.organizationId,
      },
    });

    if (!thread) {
      return { success: false, error: "Thread not found" };
    }

    // If linking to a client, verify client exists
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          organizationId: auth.organizationId,
        },
      });

      if (!client) {
        return { success: false, error: "Client not found" };
      }
    }

    await prisma.emailThread.update({
      where: { id: threadId },
      data: { clientId },
    });

    revalidatePath("/inbox");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error linking thread to client:", error);
    return { success: false, error: "Failed to link thread" };
  }
}
