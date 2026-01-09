"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { useToast } from "@/components/ui/toast";
import type {
  EmailAccountData,
  EmailThreadData,
  EmailMessageData,
} from "./page";
import {
  triggerEmailSync,
  getEmailThread,
  markThreadRead,
  toggleThreadStar,
  toggleThreadArchive,
  sendEmailReply,
  sendNewEmail,
} from "@/lib/actions/email-sync";
import { VirtualList } from "@/components/ui/virtual-list";
import {
  Mail,
  Search,
  Star,
  Archive,
  RefreshCw,
  Plus,
  ChevronLeft,
  Paperclip,
  Send,
  MoreHorizontal,
  Link2,
  Settings,
  User,
  Inbox,
  ArchiveRestore,
  Loader2,
} from "lucide-react";

type FilterType = "all" | "unread" | "starred" | "archived";

interface InboxPageClientProps {
  accounts: EmailAccountData[];
  threads: EmailThreadData[];
  totalThreads: number;
  unreadCount: number;
  organizationId: string;
}

export function InboxPageClient({
  accounts,
  threads: initialThreads,
  totalThreads: _totalThreads,
  unreadCount: initialUnreadCount,
  organizationId: _organizationId,
}: InboxPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<EmailThreadData | null>(null);
  const [threads, setThreads] = useState(initialThreads);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [showCompose, setShowCompose] = useState(false);

  // Filter threads based on active filter
  const filteredThreads = threads.filter((thread) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSubject = thread.subject.toLowerCase().includes(query);
      const matchesSnippet = thread.snippet.toLowerCase().includes(query);
      const matchesEmail = thread.participantEmails.some((e) =>
        e.toLowerCase().includes(query)
      );
      if (!matchesSubject && !matchesSnippet && !matchesEmail) return false;
    }

    switch (activeFilter) {
      case "unread":
        return !thread.isRead && !thread.isArchived;
      case "starred":
        return thread.isStarred && !thread.isArchived;
      case "archived":
        return thread.isArchived;
      default:
        return !thread.isArchived;
    }
  });

  const handleRefresh = async () => {
    if (accounts.length === 0) {
      showToast("No email accounts connected", "error");
      return;
    }

    setIsSyncing(true);
    try {
      const result = await triggerEmailSync();
      if (result.success) {
        const totalNew = result.results?.reduce((sum, r) => sum + r.newThreads, 0) || 0;
        if (totalNew > 0) {
          showToast(`Synced ${totalNew} new conversation${totalNew > 1 ? "s" : ""}`, "success");
        } else {
          showToast("Emails are up to date", "success");
        }
        router.refresh();
      } else {
        showToast(result.error || "Sync failed", "error");
      }
    } catch (error) {
      showToast("Failed to sync emails", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleStar = async (threadId: string, currentValue: boolean) => {
    startTransition(async () => {
      const result = await toggleThreadStar(threadId);
      if (result.success) {
        const newValue = result.isStarred ?? !currentValue;
        // Update local state
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, isStarred: newValue } : t
          )
        );
        if (selectedThread?.id === threadId) {
          setSelectedThread((prev) =>
            prev ? { ...prev, isStarred: newValue } : null
          );
        }
        showToast(newValue ? "Conversation starred" : "Star removed", "success");
      } else {
        showToast(result.error || "Failed to update star", "error");
      }
    });
  };

  const handleToggleArchive = async (threadId: string, currentValue: boolean) => {
    startTransition(async () => {
      const result = await toggleThreadArchive(threadId);
      if (result.success) {
        const newValue = result.isArchived ?? !currentValue;
        // Update local state
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, isArchived: newValue } : t
          )
        );
        if (selectedThread?.id === threadId) {
          setSelectedThread(null); // Close the conversation view when archiving
        }
        showToast(newValue ? "Conversation archived" : "Conversation unarchived", "success");
      } else {
        showToast(result.error || "Failed to update archive status", "error");
      }
    });
  };

  const handleSendReply = async (threadId: string, body: string) => {
    startTransition(async () => {
      const result = await sendEmailReply(threadId, body);
      if (result.success) {
        showToast("Reply sent", "success");
        // Refresh the thread to show the new message
        const threadResult = await getEmailThread(threadId);
        if (threadResult.success && threadResult.thread && selectedThread) {
          setSelectedThread({
            ...selectedThread,
            messages: threadResult.thread.messages,
            _count: { messages: threadResult.thread.messages.length },
          });
        }
        router.refresh();
      } else {
        showToast(result.error || "Failed to send reply", "error");
      }
    });
  };

  const handleSendNewEmail = async (toEmail: string, subject: string, body: string, fromAccountId?: string) => {
    startTransition(async () => {
      const accountId = fromAccountId || accounts[0]?.id;
      if (!accountId) {
        showToast("No email account available", "error");
        return;
      }
      const result = await sendNewEmail({
        accountId,
        to: [toEmail],
        subject,
        body,
      });
      if (result.success) {
        showToast("Email sent", "success");
        setShowCompose(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to send email", "error");
      }
    });
  };

  const handleSelectThread = async (thread: EmailThreadData) => {
    // If already selected, do nothing
    if (selectedThread?.id === thread.id) return;

    setIsLoadingThread(true);
    try {
      // Fetch full thread with all messages
      const result = await getEmailThread(thread.id);
      if (result.success && result.thread) {
        // Build the full thread data with all messages
        const fullThread: EmailThreadData = {
          id: result.thread.id,
          subject: result.thread.subject,
          snippet: thread.snippet, // Keep original snippet
          participantEmails: result.thread.participantEmails,
          isRead: true, // Will be marked as read
          isStarred: result.thread.isStarred,
          isArchived: result.thread.isArchived,
          lastMessageAt: thread.lastMessageAt,
          clientId: result.thread.clientId,
          client: result.thread.client,
          messages: result.thread.messages,
          _count: { messages: result.thread.messages.length },
        };
        setSelectedThread(fullThread);

        // Mark as read if unread
        if (!thread.isRead) {
          markThreadRead(thread.id, true).then((readResult) => {
            if (readResult.success) {
              // Update local state
              setThreads((prev) =>
                prev.map((t) =>
                  t.id === thread.id ? { ...t, isRead: true } : t
                )
              );
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          });
        }
      } else {
        showToast("Failed to load conversation", "error");
      }
    } catch {
      showToast("Failed to load conversation", "error");
    } finally {
      setIsLoadingThread(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // If no email accounts connected, show setup UI
  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inbox"
          subtitle="Manage all your client conversations in one place"
        />

        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-20">
          <div className="mb-6 rounded-full bg-[var(--primary)]/10 p-6">
            <Mail className="h-12 w-12 text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Connect Your Email
          </h2>
          <p className="mt-2 max-w-md text-center text-foreground-muted">
            Connect your Gmail or Outlook account to view and respond to client
            emails directly from your dashboard. All conversations sync
            automatically.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/api/integrations/gmail/authorize"
              className="inline-flex items-center gap-3 rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <GoogleIcon className="h-5 w-5" />
              Connect Gmail
            </Link>
            <button
              disabled
              className="inline-flex items-center gap-3 rounded-lg bg-[#0078d4]/50 px-6 py-3 text-sm font-medium text-white cursor-not-allowed"
            >
              <MicrosoftIcon className="h-5 w-5" />
              Connect Outlook
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Soon</span>
            </button>
          </div>
          <p className="mt-6 text-xs text-foreground-muted">
            Your email credentials are encrypted and never stored on our
            servers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
          <p className="text-sm text-foreground-muted">
            {accounts.map((a) => a.email).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync"}
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Compose
          </button>
          <Link
            href="/settings/email"
            aria-label="Email settings"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        {/* Thread List */}
        <div
          className={`flex w-full flex-col border-r border-[var(--card-border)] lg:w-[400px] ${
            selectedThread ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search & Filters */}
          <div className="border-b border-[var(--card-border)] p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="mt-3 flex gap-1">
              <FilterButton
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
                icon={<Inbox className="h-4 w-4" />}
                label="All"
                count={threads.filter((t) => !t.isArchived).length}
              />
              <FilterButton
                active={activeFilter === "unread"}
                onClick={() => setActiveFilter("unread")}
                icon={<Mail className="h-4 w-4" />}
                label="Unread"
                count={unreadCount}
              />
              <FilterButton
                active={activeFilter === "starred"}
                onClick={() => setActiveFilter("starred")}
                icon={<Star className="h-4 w-4" />}
                label="Starred"
                count={threads.filter((t) => t.isStarred && !t.isArchived).length}
              />
              <FilterButton
                active={activeFilter === "archived"}
                onClick={() => setActiveFilter("archived")}
                icon={<Archive className="h-4 w-4" />}
                label="Archived"
                count={threads.filter((t) => t.isArchived).length}
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-[var(--background-tertiary)] p-4">
                  <Mail className="h-8 w-8 text-foreground-muted" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  {searchQuery
                    ? "No matching conversations"
                    : activeFilter === "archived"
                      ? "No archived conversations"
                      : activeFilter === "starred"
                        ? "No starred conversations"
                        : activeFilter === "unread"
                          ? "All caught up!"
                          : "No conversations yet"}
                </h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  {searchQuery
                    ? "Try a different search term"
                    : "New emails will appear here"}
                </p>
              </div>
            ) : (
              <VirtualList
                items={filteredThreads}
                className="divide-y divide-[var(--card-border)]"
                estimateSize={() => 92}
                itemGap={0}
                getItemKey={(thread) => thread.id}
                renderItem={(thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedThread?.id === thread.id}
                    isLoading={isLoadingThread && selectedThread?.id !== thread.id}
                    onClick={() => handleSelectThread(thread)}
                    formatTimeAgo={formatTimeAgo}
                  />
                )}
              />
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div
          className={`flex flex-1 flex-col ${
            selectedThread || isLoadingThread ? "flex" : "hidden lg:flex"
          }`}
        >
          {isLoadingThread && !selectedThread ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
              <p className="mt-4 text-sm text-foreground-muted">Loading conversation...</p>
            </div>
          ) : selectedThread ? (
            <ConversationView
              thread={selectedThread}
              onBack={() => setSelectedThread(null)}
              formatTimeAgo={formatTimeAgo}
              onToggleStar={() => handleToggleStar(selectedThread.id, selectedThread.isStarred)}
              onToggleArchive={() => handleToggleArchive(selectedThread.id, selectedThread.isArchived)}
              onSendReply={(body) => handleSendReply(selectedThread.id, body)}
              isPending={isPending}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-[var(--background-tertiary)] p-6">
                <Mail className="h-10 w-10 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Select a conversation
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Choose a conversation from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          accounts={accounts}
          onSend={handleSendNewEmail}
          isPending={isPending}
        />
      )}
    </div>
  );
}

// Filter Button Component
function FilterButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-[var(--primary)] text-white"
          : "bg-[var(--background-tertiary)] text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
      }`}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs ${
            active
              ? "bg-white/20 text-white"
              : "bg-[var(--primary)]/10 text-[var(--primary)]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Thread Item Component
function ThreadItem({
  thread,
  isSelected,
  isLoading: _isLoading,
  onClick,
  formatTimeAgo,
}: {
  thread: EmailThreadData;
  isSelected: boolean;
  isLoading?: boolean;
  onClick: () => void;
  formatTimeAgo: (date: Date) => string;
}) {
  const latestMessage = thread.messages[0];
  const senderName =
    thread.client?.fullName ||
    latestMessage?.fromName ||
    latestMessage?.fromEmail ||
    thread.participantEmails[0] ||
    "Unknown";

  return (
    <button
      onClick={onClick}
      className={`flex w-full gap-3 p-4 text-left transition-colors hover:bg-[var(--background-hover)] ${
        isSelected
          ? "bg-[var(--primary)]/5 border-l-2 border-[var(--primary)]"
          : !thread.isRead
            ? "bg-[var(--primary)]/5"
            : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            thread.client
              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
              : "bg-[var(--background-tertiary)] text-foreground-muted"
          }`}
        >
          {thread.client ? (
            <User className="h-5 w-5" />
          ) : (
            <span className="text-sm font-medium">
              {senderName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`truncate text-sm ${
                  thread.isRead ? "font-normal text-foreground" : "font-semibold text-foreground"
                }`}
              >
                {senderName}
              </span>
              {thread.client && (
                <span className="flex-shrink-0 rounded bg-[var(--primary)]/10 px-1.5 py-0.5 text-xs text-[var(--primary)]">
                  Client
                </span>
              )}
            </div>
            <p
              className={`mt-0.5 truncate text-sm ${
                thread.isRead ? "font-normal text-foreground" : "font-medium text-foreground"
              }`}
            >
              {thread.subject || "(No subject)"}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            <span className="text-xs text-foreground-muted">
              {formatTimeAgo(thread.lastMessageAt)}
            </span>
            <div className="flex items-center gap-1">
              {thread.isStarred && (
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              )}
              {latestMessage?.hasAttachments && (
                <Paperclip className="h-3.5 w-3.5 text-foreground-muted" />
              )}
              {!thread.isRead && (
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
              )}
            </div>
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-foreground-muted">
          {thread.snippet}
        </p>
      </div>
    </button>
  );
}

// Conversation View Component
function ConversationView({
  thread,
  onBack,
  formatTimeAgo,
  onToggleStar,
  onToggleArchive,
  onSendReply,
  isPending,
}: {
  thread: EmailThreadData;
  onBack: () => void;
  formatTimeAgo: (date: Date) => string;
  onToggleStar: () => void;
  onToggleArchive: () => void;
  onSendReply: (body: string) => void;
  isPending: boolean;
}) {
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when thread opens or new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread.messages.length]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onSendReply(replyText);
    setReplyText("");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back to inbox"
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-medium text-foreground">
              {thread.subject || "(No subject)"}
            </h2>
            <p className="text-sm text-foreground-muted">
              {thread._count.messages} message{thread._count.messages !== 1 ? "s" : ""}
              {thread.client && (
                <>
                  {" "}
                  &middot;{" "}
                  <Link
                    href={`/clients/${thread.client.id}`}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {thread.client.fullName || thread.client.email}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleStar}
            disabled={isPending}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
            title={thread.isStarred ? "Unstar" : "Star"}
            aria-label={thread.isStarred ? "Remove star" : "Star conversation"}
          >
            {thread.isStarred ? (
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            ) : (
              <Star className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={onToggleArchive}
            disabled={isPending}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
            title={thread.isArchived ? "Unarchive" : "Archive"}
            aria-label={thread.isArchived ? "Unarchive conversation" : "Archive conversation"}
          >
            {thread.isArchived ? (
              <ArchiveRestore className="h-5 w-5" />
            ) : (
              <Archive className="h-5 w-5" />
            )}
          </button>
          <button
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
            title="More actions"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {thread.messages.map((message) => (
            <MessageBubble key={message.id} message={message} formatTimeAgo={formatTimeAgo} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply Box */}
      <div className="border-t border-[var(--card-border)] p-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && replyText.trim() && !isPending) {
                e.preventDefault();
                handleSendReply();
              }
            }}
            placeholder="Type your reply... (⌘+Enter to send)"
            rows={3}
            className="w-full resize-none border-0 bg-transparent p-4 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-0"
          />
          <div className="flex items-center justify-between border-t border-[var(--card-border)] px-4 py-2">
            <div className="flex items-center gap-1">
              <button
                aria-label="Attach file"
                className="rounded p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                aria-label="Insert link"
                className="rounded p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              >
                <Link2 className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isPending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Message Bubble Component
function MessageBubble({
  message,
  formatTimeAgo,
}: {
  message: EmailMessageData;
  formatTimeAgo: (date: Date) => string;
}) {
  const isOutbound = message.direction === "OUTBOUND";

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl p-4 ${
          isOutbound
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--background-tertiary)] text-foreground"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <span className={`text-sm font-medium ${isOutbound ? "text-white" : "text-foreground"}`}>
            {message.fromName || message.fromEmail}
          </span>
          <span
            className={`text-xs ${isOutbound ? "text-white/70" : "text-foreground-muted"}`}
          >
            {formatTimeAgo(message.sentAt)}
          </span>
        </div>
        <div
          className={`mt-2 text-sm ${isOutbound ? "text-white/90" : "text-foreground"}`}
          dangerouslySetInnerHTML={{
            __html:
              message.bodyHtml ||
              message.bodyText?.replace(/\n/g, "<br>") ||
              "",
          }}
        />
        {message.hasAttachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-1">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  isOutbound ? "bg-white/10" : "bg-[var(--background)]"
                }`}
              >
                <Paperclip className="h-4 w-4" />
                <span className="text-xs">{att.filename}</span>
                <span className="text-xs opacity-60">
                  ({Math.round(att.size / 1024)}KB)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Compose Modal Component
function ComposeModal({
  onClose,
  accounts,
  onSend,
  isPending,
}: {
  onClose: () => void;
  accounts: EmailAccountData[];
  onSend: (toEmail: string, subject: string, body: string, fromAccountId?: string) => void;
  isPending: boolean;
}) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");

  const handleSend = () => {
    if (!to || !subject) return;
    onSend(to, subject, body, fromAccountId);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isPending]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-modal-title"
        className="w-full max-w-2xl rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
          <h2 id="compose-modal-title" className="font-medium text-foreground">New Message</h2>
          <button
            onClick={onClose}
            aria-label="Close compose dialog"
            className="rounded-lg p-1 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 p-4">
          {accounts.length > 1 && (
            <div>
              <label className="text-sm font-medium text-foreground-muted">From</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground-muted">To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@email.com"
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground-muted">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground-muted">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && to && subject && !isPending) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message... (⌘+Enter to send)"
              rows={8}
              className="mt-1 w-full resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--card-border)] px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              aria-label="Attach file"
              className="rounded p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              aria-label="Insert link"
              className="rounded p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
            >
              <Link2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!to || !subject || isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isPending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Google Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// Microsoft Icon
function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
