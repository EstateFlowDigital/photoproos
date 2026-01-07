/**
 * Email Sync Service
 *
 * Syncs emails from connected Gmail/Outlook accounts to the database.
 * Handles initial sync, incremental sync, and client auto-linking.
 */

import { prisma } from "@/lib/prisma";
import {
  getGmailAccessToken,
  listGmailThreads,
  getGmailThread,
  getGmailProfile,
  getGmailHistory,
  parseGmailHeaders,
  extractGmailBody,
} from "@/lib/integrations/gmail";

interface SyncResult {
  success: boolean;
  accountId: string;
  email: string;
  threadsProcessed: number;
  messagesProcessed: number;
  newThreads: number;
  updatedThreads: number;
  error?: string;
}

interface SyncOptions {
  /** Maximum number of threads to sync per account */
  maxThreads?: number;
  /** Force full sync instead of incremental */
  fullSync?: boolean;
  /** Only sync specific account */
  accountId?: string;
}

/**
 * Sync emails for all active accounts in an organization
 */
export async function syncOrganizationEmails(
  organizationId: string,
  options: SyncOptions = {}
): Promise<SyncResult[]> {
  const { accountId } = options;

  // Get active email accounts
  const whereClause: Record<string, unknown> = {
    organizationId,
    isActive: true,
    syncEnabled: true,
  };

  if (accountId) {
    whereClause.id = accountId;
  }

  const accounts = await prisma.emailAccount.findMany({
    where: whereClause,
  });

  const results: SyncResult[] = [];

  for (const account of accounts) {
    try {
      const result = await syncEmailAccount(account.id, options);
      results.push(result);
    } catch (error) {
      console.error(`Error syncing account ${account.email}:`, error);
      results.push({
        success: false,
        accountId: account.id,
        email: account.email,
        threadsProcessed: 0,
        messagesProcessed: 0,
        newThreads: 0,
        updatedThreads: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Sync emails for a single account
 */
export async function syncEmailAccount(
  accountId: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const { maxThreads = 50, fullSync = false } = options;

  const account = await prisma.emailAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  // Verify we can get an access token
  const accessToken = await getGmailAccessToken(accountId);
  if (!accessToken) {
    // Mark account as inactive
    await prisma.emailAccount.update({
      where: { id: accountId },
      data: {
        isActive: false,
        errorMessage: "Failed to refresh access token. Please reconnect.",
      },
    });
    throw new Error("Failed to get access token");
  }

  let threadsProcessed = 0;
  let messagesProcessed = 0;
  let newThreads = 0;
  let updatedThreads = 0;

  try {
    // Get current profile to get latest historyId
    const profile = await getGmailProfile(accountId);
    if (!profile) {
      throw new Error("Failed to get Gmail profile");
    }

    // Determine if we should do incremental or full sync
    const shouldDoFullSync = fullSync || !account.syncCursor;

    if (shouldDoFullSync) {
      // Full sync - fetch recent threads
      const threadsResponse = await listGmailThreads(accountId, {
        maxResults: maxThreads,
        labelIds: ["INBOX"],
      });

      if (!threadsResponse?.threads) {
        // No threads found - update last sync time
        await prisma.emailAccount.update({
          where: { id: accountId },
          data: {
            lastSyncAt: new Date(),
            syncCursor: profile.historyId,
            errorMessage: null,
          },
        });

        return {
          success: true,
          accountId,
          email: account.email,
          threadsProcessed: 0,
          messagesProcessed: 0,
          newThreads: 0,
          updatedThreads: 0,
        };
      }

      // Process each thread
      for (const threadSummary of threadsResponse.threads) {
        const result = await processGmailThread(
          accountId,
          account.organizationId,
          threadSummary.id
        );

        if (result) {
          threadsProcessed++;
          messagesProcessed += result.messagesCount;
          if (result.isNew) {
            newThreads++;
          } else {
            updatedThreads++;
          }
        }
      }
    } else {
      // Incremental sync using Gmail history API
      // This efficiently fetches only threads that have changed since last sync
      const historyResponse = await getGmailHistory(accountId, account.syncCursor!);

      if (historyResponse?.history) {
        // Collect unique thread IDs from history changes
        const changedThreadIds = new Set<string>();

        for (const historyRecord of historyResponse.history) {
          // Process messages added (new emails)
          if (historyRecord.messagesAdded) {
            for (const added of historyRecord.messagesAdded) {
              changedThreadIds.add(added.message.threadId);
            }
          }

          // Process messages deleted (to update thread state)
          if (historyRecord.messagesDeleted) {
            for (const deleted of historyRecord.messagesDeleted) {
              changedThreadIds.add(deleted.message.threadId);
            }
          }

          // Note: Label changes (labelsAdded/labelsRemoved) only provide message IDs,
          // not thread IDs. For now, we rely on messagesAdded/messagesDeleted which
          // include thread IDs. A future optimization could fetch message details
          // to get thread IDs for label changes, enabling read/unread state tracking.
        }

        // Process each changed thread (up to maxThreads limit)
        const threadsToProcess = Array.from(changedThreadIds).slice(0, maxThreads);

        for (const threadId of threadsToProcess) {
          const result = await processGmailThread(
            accountId,
            account.organizationId,
            threadId
          );

          if (result) {
            threadsProcessed++;
            messagesProcessed += result.messagesCount;
            if (result.isNew) {
              newThreads++;
            } else {
              updatedThreads++;
            }
          }
        }
      } else {
        // No history available or expired - fall back to limited sync
        // This can happen if historyId is too old (Gmail keeps ~30 days)
        const threadsResponse = await listGmailThreads(accountId, {
          maxResults: Math.min(maxThreads, 20),
          labelIds: ["INBOX"],
        });

        if (threadsResponse?.threads) {
          for (const threadSummary of threadsResponse.threads) {
            const result = await processGmailThread(
              accountId,
              account.organizationId,
              threadSummary.id
            );

            if (result) {
              threadsProcessed++;
              messagesProcessed += result.messagesCount;
              if (result.isNew) {
                newThreads++;
              } else {
                updatedThreads++;
              }
            }
          }
        }
      }
    }

    // Update sync state
    await prisma.emailAccount.update({
      where: { id: accountId },
      data: {
        lastSyncAt: new Date(),
        syncCursor: profile.historyId,
        errorMessage: null,
      },
    });

    return {
      success: true,
      accountId,
      email: account.email,
      threadsProcessed,
      messagesProcessed,
      newThreads,
      updatedThreads,
    };
  } catch (error) {
    // Log error but don't mark account inactive for transient errors
    console.error(`Error during sync for ${account.email}:`, error);

    await prisma.emailAccount.update({
      where: { id: accountId },
      data: {
        errorMessage: error instanceof Error ? error.message : "Sync failed",
      },
    });

    throw error;
  }
}

/**
 * Process a single Gmail thread and store in database
 */
async function processGmailThread(
  accountId: string,
  organizationId: string,
  gmailThreadId: string
): Promise<{ isNew: boolean; messagesCount: number } | null> {
  // Fetch full thread with messages
  const gmailThread = await getGmailThread(accountId, gmailThreadId);
  if (!gmailThread || !gmailThread.messages?.length) {
    return null;
  }

  // Parse the first message to get thread metadata
  const firstMessage = gmailThread.messages[0];
  const lastMessage = gmailThread.messages[gmailThread.messages.length - 1];
  const headers = parseGmailHeaders(firstMessage.payload.headers);

  // Extract participant emails
  const participantEmails = new Set<string>();
  for (const msg of gmailThread.messages) {
    const msgHeaders = parseGmailHeaders(msg.payload.headers);
    if (msgHeaders.from) {
      const email = extractEmailAddress(msgHeaders.from);
      if (email) participantEmails.add(email.toLowerCase());
    }
    if (msgHeaders.to) {
      for (const recipient of msgHeaders.to.split(",")) {
        const email = extractEmailAddress(recipient.trim());
        if (email) participantEmails.add(email.toLowerCase());
      }
    }
  }

  // Try to match a client
  const clientId = await findMatchingClient(
    organizationId,
    Array.from(participantEmails)
  );

  // Extract snippet from last message
  const lastBody = extractGmailBody(lastMessage);
  const snippet =
    lastBody.text?.substring(0, 200) || lastMessage.snippet || "";

  // Check if thread already exists
  const existingThread = await prisma.emailThread.findUnique({
    where: {
      emailAccountId_providerThreadId: {
        emailAccountId: accountId,
        providerThreadId: gmailThreadId,
      },
    },
  });

  // Determine if thread has unread messages
  const hasUnread = gmailThread.messages.some((m) =>
    m.labelIds?.includes("UNREAD")
  );
  const hasStarred = gmailThread.messages.some((m) =>
    m.labelIds?.includes("STARRED")
  );
  const isArchived = !gmailThread.messages.some((m) =>
    m.labelIds?.includes("INBOX")
  );

  // Upsert thread
  const thread = await prisma.emailThread.upsert({
    where: {
      emailAccountId_providerThreadId: {
        emailAccountId: accountId,
        providerThreadId: gmailThreadId,
      },
    },
    create: {
      organizationId,
      emailAccountId: accountId,
      providerThreadId: gmailThreadId,
      subject: headers.subject || "(No subject)",
      snippet,
      participantEmails: Array.from(participantEmails),
      clientId,
      isRead: !hasUnread,
      isStarred: hasStarred,
      isArchived,
      lastMessageAt: new Date(parseInt(lastMessage.internalDate)),
    },
    update: {
      subject: headers.subject || "(No subject)",
      snippet,
      participantEmails: Array.from(participantEmails),
      clientId: clientId || undefined,
      isRead: !hasUnread,
      isStarred: hasStarred,
      isArchived,
      lastMessageAt: new Date(parseInt(lastMessage.internalDate)),
    },
  });

  // Process messages
  let messagesCount = 0;
  for (const gmailMessage of gmailThread.messages) {
    const wasCreated = await processGmailMessage(thread.id, gmailMessage, accountId);
    if (wasCreated) {
      messagesCount++;
    }
  }

  return {
    isNew: !existingThread,
    messagesCount,
  };
}

/**
 * Process a single Gmail message and store in database
 */
async function processGmailMessage(
  threadId: string,
  gmailMessage: {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    payload: {
      headers: Array<{ name: string; value: string }>;
      mimeType: string;
      body?: { data?: string; size: number };
      parts?: Array<{
        mimeType: string;
        body?: { data?: string; size: number; attachmentId?: string };
        parts?: Array<{
          mimeType: string;
          body?: { data?: string; size: number };
        }>;
      }>;
    };
    internalDate: string;
  },
  accountId: string
): Promise<boolean> {
  const headers = parseGmailHeaders(gmailMessage.payload.headers);
  const body = extractGmailBody(gmailMessage);

  // Parse from address
  const fromEmail = extractEmailAddress(headers.from || "") || "";
  const fromName = extractDisplayName(headers.from || "");

  // Parse to addresses
  const toEmails: string[] = [];
  const toNames: string[] = [];
  if (headers.to) {
    for (const recipient of headers.to.split(",")) {
      const email = extractEmailAddress(recipient.trim());
      const name = extractDisplayName(recipient.trim());
      if (email) {
        toEmails.push(email);
        toNames.push(name || "");
      }
    }
  }

  // Parse CC addresses
  const ccEmails: string[] = [];
  if (headers.cc) {
    for (const recipient of headers.cc.split(",")) {
      const email = extractEmailAddress(recipient.trim());
      if (email) ccEmails.push(email);
    }
  }

  // Determine direction - get the account email to compare
  const account = await prisma.emailAccount.findUnique({
    where: { id: accountId },
    select: { email: true },
  });
  const direction =
    fromEmail.toLowerCase() === account?.email.toLowerCase()
      ? "OUTBOUND"
      : "INBOUND";

  // Check for attachments
  const hasAttachments = hasMessageAttachments(gmailMessage.payload);

  // Check if message already exists
  const existingMessage = await prisma.emailMessage.findUnique({
    where: {
      threadId_providerMessageId: {
        threadId,
        providerMessageId: gmailMessage.id,
      },
    },
  });

  if (existingMessage) {
    // Update existing message
    await prisma.emailMessage.update({
      where: { id: existingMessage.id },
      data: {
        isRead: !gmailMessage.labelIds?.includes("UNREAD"),
      },
    });
    return false;
  }

  // Create new message
  await prisma.emailMessage.create({
    data: {
      threadId,
      providerMessageId: gmailMessage.id,
      fromEmail,
      fromName,
      toEmails,
      toNames,
      ccEmails,
      bccEmails: [],
      subject: headers.subject || "(No subject)",
      bodyHtml: body.html,
      bodyText: body.text,
      direction,
      isRead: !gmailMessage.labelIds?.includes("UNREAD"),
      hasAttachments,
      inReplyTo: headers["in-reply-to"],
      references: headers.references ? headers.references.split(/\s+/) : [],
      sentAt: new Date(parseInt(gmailMessage.internalDate)),
    },
  });

  return true;
}

/**
 * Find a matching client by email address
 */
async function findMatchingClient(
  organizationId: string,
  emails: string[]
): Promise<string | null> {
  // Get the account's email to exclude it from matching
  const account = await prisma.emailAccount.findFirst({
    where: { organizationId },
    select: { email: true },
  });

  // Filter out the account email
  const clientEmails = emails.filter(
    (e) => e.toLowerCase() !== account?.email.toLowerCase()
  );

  if (clientEmails.length === 0) {
    return null;
  }

  // Find a client with any of these emails
  const client = await prisma.client.findFirst({
    where: {
      organizationId,
      email: {
        in: clientEmails,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return client?.id || null;
}

/**
 * Extract email address from "Name <email@domain.com>" format
 */
function extractEmailAddress(headerValue: string): string | null {
  const match = headerValue.match(/<([^>]+)>/);
  if (match) {
    return match[1];
  }
  // Check if it's just an email
  if (headerValue.includes("@")) {
    return headerValue.trim();
  }
  return null;
}

/**
 * Extract display name from "Name <email@domain.com>" format
 */
function extractDisplayName(headerValue: string): string | null {
  const match = headerValue.match(/^([^<]+)</);
  if (match) {
    return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

/**
 * Check if message has attachments
 * Uses a permissive type to handle the full Gmail API payload structure
 */
function hasMessageAttachments(payload: {
  body?: { attachmentId?: string; [key: string]: unknown };
  parts?: Array<{
    body?: { attachmentId?: string; [key: string]: unknown };
    parts?: Array<{ body?: { attachmentId?: string; [key: string]: unknown }; [key: string]: unknown }>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}): boolean {
  if (payload.body?.attachmentId) {
    return true;
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.body?.attachmentId) {
        return true;
      }
      if (part.parts) {
        for (const subpart of part.parts) {
          if (subpart.body?.attachmentId) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Get sync status for an organization
 */
export async function getEmailSyncStatus(organizationId: string) {
  const accounts = await prisma.emailAccount.findMany({
    where: { organizationId },
    select: {
      id: true,
      email: true,
      provider: true,
      isActive: true,
      syncEnabled: true,
      lastSyncAt: true,
      errorMessage: true,
      _count: {
        select: { threads: true },
      },
    },
  });

  const totalThreads = await prisma.emailThread.count({
    where: { organizationId },
  });

  const unreadThreads = await prisma.emailThread.count({
    where: { organizationId, isRead: false, isArchived: false },
  });

  return {
    accounts: accounts.map((a) => ({
      id: a.id,
      email: a.email,
      provider: a.provider,
      isActive: a.isActive,
      syncEnabled: a.syncEnabled,
      lastSyncAt: a.lastSyncAt,
      errorMessage: a.errorMessage,
      threadCount: a._count.threads,
    })),
    totalThreads,
    unreadThreads,
  };
}
