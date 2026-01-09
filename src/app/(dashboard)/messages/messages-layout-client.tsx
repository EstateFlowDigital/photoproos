"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import {
  MessageSquare,
  Users,
  Hash,
  Headphones,
  Search,
  Pin,
  BellOff,
  Settings,
  ChevronLeft,
  Edit,
} from "lucide-react";
import type { ConversationWithDetails } from "@/lib/actions/conversations";
import type { ConversationType } from "@prisma/client";
import { useHydrated } from "@/hooks/use-hydrated";

interface MessagesLayoutProps {
  conversations: ConversationWithDetails[];
  children: React.ReactNode;
}

const TYPE_ICONS: Record<ConversationType, React.ReactNode> = {
  direct: <MessageSquare className="h-4 w-4" />,
  group: <Users className="h-4 w-4" />,
  channel: <Hash className="h-4 w-4" />,
  client_support: <Headphones className="h-4 w-4" />,
};

export function MessagesLayout({ conversations, children }: MessagesLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Determine if we're viewing a specific conversation
  const isConversationView = pathname?.includes("/messages/") && pathname !== "/messages/requests";
  const activeConversationId = isConversationView && pathname
    ? pathname.split("/messages/")[1]?.split("/")[0]
    : null;

  // On mobile, collapse sidebar when viewing a conversation
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && isConversationView) {
      setIsSidebarCollapsed(true);
    }
  }, [isConversationView]);

  // Filter conversations by search
  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.participants.some(
            (p) =>
              p.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.client?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : conversations;

  // Separate pinned and regular conversations
  const pinnedConversations = filteredConversations.filter((c) =>
    c.participants.some((p) => p.isPinned && p.userId)
  );
  const regularConversations = filteredConversations.filter(
    (c) => !pinnedConversations.includes(c)
  );

  return (
    <div className="messages-container flex h-[calc(100vh-120px)] overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      {/* Sidebar - Conversation List (iMessage style) */}
      <aside
        className={`messages-sidebar flex flex-col border-r border-[var(--card-border)] bg-[var(--background)] transition-all duration-300 ${
          isSidebarCollapsed ? "w-0 md:w-80" : "w-full md:w-80"
        } ${isConversationView ? "hidden md:flex" : "flex"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] p-4">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">Messages</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/messages/requests"
              className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] transition-colors"
              aria-label="View chat requests"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Link>
            <button
              onClick={() => setShowNewModal(true)}
              className="rounded-lg p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
              aria-label="Start new conversation"
            >
              <Edit className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3" role="search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-0 bg-[var(--background-tertiary)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              aria-label="Search conversations"
            />
          </div>
        </div>

        {/* Conversation List */}
        <nav className="flex-1 overflow-y-auto" aria-label="Conversations">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="h-12 w-12 text-[var(--foreground-muted)] mb-3" aria-hidden="true" />
              <p className="text-sm text-[var(--foreground-muted)]" role="status">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="mt-3 text-sm text-[var(--primary)] hover:underline"
                >
                  Start a new conversation
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedConversations.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Pinned
                  </div>
                  {pinnedConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={activeConversationId === conv.id}
                    />
                  ))}
                </div>
              )}

              {/* Regular Conversations */}
              {regularConversations.length > 0 && (
                <div>
                  {pinnedConversations.length > 0 && (
                    <div className="px-4 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                      All Messages
                    </div>
                  )}
                  {regularConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={activeConversationId === conv.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`messages-content flex-1 flex flex-col min-h-0 bg-[var(--card)] ${
        !isConversationView ? "hidden md:flex p-6" : "flex"
      }`}>
        {/* Back button on mobile */}
        {isConversationView && (
          <div className="md:hidden border-b border-[var(--card-border)] p-2">
            <button
              onClick={() => router.push("/messages")}
              className="flex items-center gap-1 text-[var(--primary)] text-sm font-medium"
              aria-label="Back to messages list"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              Messages
            </button>
          </div>
        )}

        {children}
      </main>

      {/* New Conversation Modal */}
      {showNewModal && (
        <NewConversationModal onClose={() => setShowNewModal(false)} />
      )}
    </div>
  );
}

// Conversation Item Component (iMessage style)
function ConversationItem({
  conversation,
  isActive,
}: {
  conversation: ConversationWithDetails;
  isActive: boolean;
}) {
  const hydrated = useHydrated();
  const displayName = getConversationDisplayName(conversation);
  const icon = TYPE_ICONS[conversation.type];
  const isPinned = conversation.participants.some((p) => p.isPinned && p.userId);
  const isMuted = conversation.participants.some((p) => p.isMuted && p.userId);
  const hasUnread = conversation.unreadCount && conversation.unreadCount > 0;
  const timeDisplay = hydrated ? formatTimeDisplay(conversation.lastMessageAt) : "";

  // Get initials for avatar
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Get avatar color based on conversation type
  const avatarColors: Record<ConversationType, string> = {
    direct: "bg-blue-500",
    group: "bg-green-500",
    channel: "bg-purple-500",
    client_support: "bg-orange-500",
  };

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={`conversation-item flex items-center gap-3 px-4 py-3 transition-colors ${
        isActive
          ? "bg-[var(--primary)] text-white"
          : "hover:bg-[var(--background-hover)]"
      }`}
      aria-current={isActive ? "page" : undefined}
      aria-label={`${displayName}${hasUnread ? `, ${conversation.unreadCount} unread messages` : ""}${isPinned ? ", pinned" : ""}${isMuted ? ", muted" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`conversation-avatar flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white font-medium ${
          isActive ? "bg-white/20" : avatarColors[conversation.type]
        }`}
        aria-hidden="true"
      >
        {conversation.avatarUrl ? (
          <img
            src={conversation.avatarUrl}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : conversation.type === "direct" ? (
          <span className="text-sm">{initials}</span>
        ) : (
          <span className={isActive ? "text-white" : ""}>{icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`font-semibold truncate ${
                hasUnread && !isActive ? "text-[var(--foreground)]" : ""
              }`}
            >
              {displayName}
            </span>
            {isPinned && (
              <Pin
                className={`h-3 w-3 flex-shrink-0 ${
                  isActive ? "text-white/60" : "text-[var(--foreground-muted)]"
                }`}
                aria-hidden="true"
              />
            )}
            {isMuted && (
              <BellOff
                className={`h-3 w-3 flex-shrink-0 ${
                  isActive ? "text-white/60" : "text-[var(--foreground-muted)]"
                }`}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`text-xs ${
                isActive ? "text-white/70" : "text-[var(--foreground-muted)]"
              }`}
              suppressHydrationWarning
            >
              {timeDisplay}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p
            className={`text-sm truncate ${
              isActive
                ? "text-white/80"
                : hasUnread
                  ? "text-[var(--foreground)] font-medium"
                  : "text-[var(--foreground-muted)]"
            }`}
          >
            {conversation.description ||
              conversation.participants
                .slice(0, 2)
                .map((p) => p.user?.fullName || p.client?.fullName)
                .filter(Boolean)
                .join(", ")}
          </p>
          {hasUnread && !isActive && (
            <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-bold text-white">
              {conversation.unreadCount! > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function NewConversationModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"direct" | "group" | "channel">("direct");

  const options = [
    {
      type: "direct" as const,
      icon: <MessageSquare className="h-5 w-5" aria-hidden="true" />,
      label: "Direct Message",
      description: "One-on-one conversation",
    },
    {
      type: "group" as const,
      icon: <Users className="h-5 w-5" aria-hidden="true" />,
      label: "Group Chat",
      description: "Multiple team members",
    },
    {
      type: "channel" as const,
      icon: <Hash className="h-5 w-5" aria-hidden="true" />,
      label: "Channel",
      description: "Topic-based discussion",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-message-title"
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="new-message-title" className="text-lg font-semibold text-[var(--foreground)]">
          New Message
        </h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Choose the type of conversation
        </p>

        <div className="mt-6 space-y-2" role="radiogroup" aria-label="Conversation type">
          {options.map((option) => (
            <button
              key={option.type}
              onClick={() => setType(option.type)}
              className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                type === option.type
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]"
                  : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
              }`}
              role="radio"
              aria-checked={type === option.type}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  type === option.type
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
                }`}
              >
                {option.icon}
              </div>
              <div>
                <div className="font-medium text-[var(--foreground)]">{option.label}</div>
                <div className="text-sm text-[var(--foreground-muted)]">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
          <Link
            href={`/messages/new?type=${type}`}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function getConversationDisplayName(conversation: ConversationWithDetails): string {
  if (conversation.name) {
    return conversation.name;
  }

  if (conversation.type === "direct") {
    const otherParticipant = conversation.participants.find(
      (p) => p.user || p.client
    );
    return (
      otherParticipant?.user?.fullName ||
      otherParticipant?.client?.fullName ||
      "Unknown"
    );
  }

  if (conversation.type === "client_support") {
    return "Client Support";
  }

  return `${conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1)} Chat`;
}

function formatTimeDisplay(date: Date | string | null): string {
  if (!date) return "";

  const d = new Date(date);

  if (isToday(d)) {
    return format(d, "h:mm a");
  }

  if (isYesterday(d)) {
    return "Yesterday";
  }

  if (isThisWeek(d)) {
    return format(d, "EEEE");
  }

  return format(d, "MM/dd/yy");
}
