export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/clerk";
import { InboxPageClient } from "./inbox-page-client";
import { prisma } from "@/lib/prisma";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

// Types for email data
export interface EmailAccountData {
  id: string;
  provider: "GMAIL" | "OUTLOOK";
  email: string;
  isActive: boolean;
  lastSyncAt: Date | null;
}

export interface EmailThreadData {
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
  messages: EmailMessageData[];
  _count: {
    messages: number;
  };
}

export interface EmailMessageData {
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
  attachments: {
    id: string;
    filename: string;
    contentType: string;
    size: number;
  }[];
}

async function getEmailAccounts(organizationId: string): Promise<EmailAccountData[]> {
  const accounts = await prisma.emailAccount.findMany({
    where: { organizationId },
    select: {
      id: true,
      provider: true,
      email: true,
      isActive: true,
      lastSyncAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return accounts;
}

async function getEmailThreads(
  organizationId: string,
  options: {
    accountId?: string;
    isArchived?: boolean;
    isStarred?: boolean;
    isRead?: boolean;
    clientId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ threads: EmailThreadData[]; total: number }> {
  const {
    accountId,
    isArchived = false,
    isStarred,
    isRead,
    clientId,
    search,
    limit = 50,
    offset = 0,
  } = options;

  const where: Record<string, unknown> = {
    organizationId,
    isArchived,
  };

  if (accountId) where.emailAccountId = accountId;
  if (isStarred !== undefined) where.isStarred = isStarred;
  if (isRead !== undefined) where.isRead = isRead;
  if (clientId) where.clientId = clientId;
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { snippet: { contains: search, mode: "insensitive" } },
      { participantEmails: { has: search.toLowerCase() } },
    ];
  }

  const [threads, total] = await Promise.all([
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
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.emailThread.count({ where }),
  ]);

  return { threads: threads as unknown as EmailThreadData[], total };
}

export default async function InboxPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch email accounts, threads, and walkthrough preference
  const [accounts, { threads, total }, walkthroughPreferenceResult] = await Promise.all([
    getEmailAccounts(auth.organizationId),
    getEmailThreads(auth.organizationId),
    getWalkthroughPreference("inbox"),
  ]);

  // Calculate stats
  const unreadCount = await prisma.emailThread.count({
    where: {
      organizationId: auth.organizationId,
      isRead: false,
      isArchived: false,
    },
  });

  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div data-element="inbox-page" className="space-y-6">
      <WalkthroughWrapper pageId="inbox" initialState={walkthroughState} />
      <InboxPageClient
        accounts={accounts}
        threads={threads}
        totalThreads={total}
        unreadCount={unreadCount}
        organizationId={auth.organizationId}
      />
    </div>
  );
}
