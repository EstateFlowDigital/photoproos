/**
 * Gmail Integration Library
 *
 * Handles Gmail OAuth token management and API operations for the unified inbox.
 */

import { prisma } from "@/lib/prisma";

interface GmailTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GmailMessage {
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
}

interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessage[];
}

interface GmailListResponse {
  threads?: Array<{ id: string; snippet: string; historyId: string }>;
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

/**
 * Refresh Gmail access token using refresh token
 */
export async function refreshGmailToken(
  emailAccountId: string
): Promise<string | null> {
  const account = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
  });

  if (!account || !account.refreshToken) {
    console.error("No account or refresh token found");
    return null;
  }

  // Check if token is still valid
  if (account.tokenExpiry && account.tokenExpiry > new Date()) {
    return account.accessToken;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: account.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Token refresh failed:", error);

      // Mark account as inactive if refresh fails
      await prisma.emailAccount.update({
        where: { id: emailAccountId },
        data: {
          isActive: false,
          errorMessage: "Token refresh failed. Please reconnect your account.",
        },
      });

      return null;
    }

    const tokens: GmailTokenResponse = await response.json();
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Update the stored token
    await prisma.emailAccount.update({
      where: { id: emailAccountId },
      data: {
        accessToken: tokens.access_token,
        tokenExpiry,
        errorMessage: null,
      },
    });

    return tokens.access_token;
  } catch (error) {
    console.error("Error refreshing Gmail token:", error);
    return null;
  }
}

/**
 * Get a valid access token for a Gmail account (refreshes if needed)
 */
export async function getGmailAccessToken(
  emailAccountId: string
): Promise<string | null> {
  const account = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
  });

  if (!account) {
    return null;
  }

  // Check if token is still valid (with 5 minute buffer)
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  if (account.tokenExpiry && account.tokenExpiry.getTime() > Date.now() + bufferTime) {
    return account.accessToken;
  }

  // Token expired or expiring soon, refresh it
  return refreshGmailToken(emailAccountId);
}

/**
 * Make an authenticated request to the Gmail API
 */
async function gmailApiRequest<T>(
  emailAccountId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const accessToken = await getGmailAccessToken(emailAccountId);
  if (!accessToken) {
    console.error("Failed to get Gmail access token");
    return null;
  }

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1${endpoint}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Gmail API request failed:", error);
    return null;
  }

  return response.json();
}

/**
 * List Gmail threads (conversations)
 */
export async function listGmailThreads(
  emailAccountId: string,
  options: {
    maxResults?: number;
    pageToken?: string;
    query?: string;
    labelIds?: string[];
  } = {}
): Promise<GmailListResponse | null> {
  const params = new URLSearchParams();
  params.set("maxResults", String(options.maxResults || 50));

  if (options.pageToken) {
    params.set("pageToken", options.pageToken);
  }
  if (options.query) {
    params.set("q", options.query);
  }
  if (options.labelIds && options.labelIds.length > 0) {
    params.set("labelIds", options.labelIds.join(","));
  }

  return gmailApiRequest<GmailListResponse>(
    emailAccountId,
    `/users/me/threads?${params.toString()}`
  );
}

/**
 * Get a single Gmail thread with all messages
 */
export async function getGmailThread(
  emailAccountId: string,
  threadId: string
): Promise<GmailThread | null> {
  return gmailApiRequest<GmailThread>(
    emailAccountId,
    `/users/me/threads/${threadId}?format=full`
  );
}

/**
 * Get a single Gmail message
 */
export async function getGmailMessage(
  emailAccountId: string,
  messageId: string
): Promise<GmailMessage | null> {
  return gmailApiRequest<GmailMessage>(
    emailAccountId,
    `/users/me/messages/${messageId}?format=full`
  );
}

/**
 * Parse Gmail message headers
 */
export function parseGmailHeaders(
  headers: Array<{ name: string; value: string }>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const header of headers) {
    result[header.name.toLowerCase()] = header.value;
  }
  return result;
}

/**
 * Extract email body from Gmail message
 */
export function extractGmailBody(message: GmailMessage): {
  html: string | null;
  text: string | null;
} {
  let html: string | null = null;
  let text: string | null = null;

  const decodeBase64 = (data: string): string => {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  };

  const findPart = (
    parts: GmailMessage["payload"]["parts"],
    mimeType: string
  ): string | null => {
    if (!parts) return null;

    for (const part of parts) {
      if (part.mimeType === mimeType && part.body?.data) {
        return decodeBase64(part.body.data);
      }
      if (part.parts) {
        const nested = findPart(part.parts, mimeType);
        if (nested) return nested;
      }
    }
    return null;
  };

  // Check if body is directly in payload
  if (message.payload.body?.data) {
    const decoded = decodeBase64(message.payload.body.data);
    if (message.payload.mimeType === "text/html") {
      html = decoded;
    } else {
      text = decoded;
    }
  }

  // Check parts for multipart messages
  if (message.payload.parts) {
    html = html || findPart(message.payload.parts, "text/html");
    text = text || findPart(message.payload.parts, "text/plain");
  }

  return { html, text };
}

/**
 * Send an email via Gmail
 */
export async function sendGmailEmail(
  emailAccountId: string,
  options: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType?: "text" | "html";
    replyTo?: string;
    inReplyTo?: string;
    references?: string;
    threadId?: string;
  }
): Promise<{ id: string; threadId: string } | null> {
  const { to, cc, bcc, subject, body, bodyType = "html", replyTo, inReplyTo, references, threadId } = options;

  // Build RFC 2822 email message
  const messageParts: string[] = [];
  messageParts.push(`To: ${to.join(", ")}`);
  if (cc && cc.length > 0) {
    messageParts.push(`Cc: ${cc.join(", ")}`);
  }
  if (bcc && bcc.length > 0) {
    messageParts.push(`Bcc: ${bcc.join(", ")}`);
  }
  messageParts.push(`Subject: ${subject}`);
  if (replyTo) {
    messageParts.push(`Reply-To: ${replyTo}`);
  }
  if (inReplyTo) {
    messageParts.push(`In-Reply-To: ${inReplyTo}`);
  }
  if (references) {
    messageParts.push(`References: ${references}`);
  }
  messageParts.push(`Content-Type: ${bodyType === "html" ? "text/html" : "text/plain"}; charset=utf-8`);
  messageParts.push("");
  messageParts.push(body);

  const rawMessage = messageParts.join("\r\n");
  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const requestBody: Record<string, unknown> = { raw: encodedMessage };
  if (threadId) {
    requestBody.threadId = threadId;
  }

  return gmailApiRequest<{ id: string; threadId: string }>(
    emailAccountId,
    "/users/me/messages/send",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );
}

/**
 * Mark messages as read
 */
export async function markGmailMessagesRead(
  emailAccountId: string,
  messageIds: string[]
): Promise<boolean> {
  const result = await gmailApiRequest(
    emailAccountId,
    "/users/me/messages/batchModify",
    {
      method: "POST",
      body: JSON.stringify({
        ids: messageIds,
        removeLabelIds: ["UNREAD"],
      }),
    }
  );
  return result !== null;
}

/**
 * Archive messages (remove from inbox)
 */
export async function archiveGmailMessages(
  emailAccountId: string,
  messageIds: string[]
): Promise<boolean> {
  const result = await gmailApiRequest(
    emailAccountId,
    "/users/me/messages/batchModify",
    {
      method: "POST",
      body: JSON.stringify({
        ids: messageIds,
        removeLabelIds: ["INBOX"],
      }),
    }
  );
  return result !== null;
}

/**
 * Star/unstar messages
 */
export async function toggleGmailStar(
  emailAccountId: string,
  messageIds: string[],
  starred: boolean
): Promise<boolean> {
  const result = await gmailApiRequest(
    emailAccountId,
    "/users/me/messages/batchModify",
    {
      method: "POST",
      body: JSON.stringify({
        ids: messageIds,
        ...(starred
          ? { addLabelIds: ["STARRED"] }
          : { removeLabelIds: ["STARRED"] }),
      }),
    }
  );
  return result !== null;
}

/**
 * Get Gmail history for incremental sync
 */
export async function getGmailHistory(
  emailAccountId: string,
  startHistoryId: string
): Promise<{
  history: Array<{
    id: string;
    messagesAdded?: Array<{ message: { id: string; threadId: string } }>;
    messagesDeleted?: Array<{ message: { id: string; threadId: string } }>;
    labelsAdded?: Array<{ message: { id: string }; labelIds: string[] }>;
    labelsRemoved?: Array<{ message: { id: string }; labelIds: string[] }>;
  }>;
  historyId: string;
  nextPageToken?: string;
} | null> {
  return gmailApiRequest(
    emailAccountId,
    `/users/me/history?startHistoryId=${startHistoryId}&historyTypes=messageAdded&historyTypes=messageDeleted&historyTypes=labelAdded&historyTypes=labelRemoved`
  );
}

/**
 * Get the current history ID for starting incremental sync
 */
export async function getGmailProfile(
  emailAccountId: string
): Promise<{ emailAddress: string; messagesTotal: number; threadsTotal: number; historyId: string } | null> {
  return gmailApiRequest(emailAccountId, "/users/me/profile");
}

/**
 * Disconnect Gmail account
 */
export async function disconnectGmailAccount(
  emailAccountId: string
): Promise<boolean> {
  try {
    const account = await prisma.emailAccount.findUnique({
      where: { id: emailAccountId },
    });

    if (!account) {
      return false;
    }

    // Revoke the OAuth token
    try {
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${account.accessToken}`,
        { method: "POST" }
      );
    } catch {
      // Token revocation can fail if already invalid, that's okay
    }

    // Delete the account and all related data
    await prisma.emailAccount.delete({
      where: { id: emailAccountId },
    });

    // Log the disconnection
    await prisma.integrationLog.create({
      data: {
        organizationId: account.organizationId,
        provider: "gmail",
        eventType: "disconnected",
        message: `Gmail account ${account.email} disconnected`,
      },
    });

    return true;
  } catch (error) {
    console.error("Error disconnecting Gmail account:", error);
    return false;
  }
}
