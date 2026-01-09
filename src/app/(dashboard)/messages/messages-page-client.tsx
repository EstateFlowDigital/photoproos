"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Users,
  Hash,
  Headphones,
  Plus,
  Search,
  Pin,
  BellOff,
} from "lucide-react";
import type { ConversationWithDetails } from "@/lib/actions/conversations";
import type { ConversationType } from "@prisma/client";

interface MessagesPageClientProps {
  conversations: ConversationWithDetails[];
  typeFilter?: ConversationType;
}

const TYPE_ICONS: Record<ConversationType, React.ReactNode> = {
  direct: <MessageSquare className="h-4 w-4" />,
  group: <Users className="h-4 w-4" />,
  channel: <Hash className="h-4 w-4" />,
  client_support: <Headphones className="h-4 w-4" />,
};

const TYPE_LABELS: Record<ConversationType, string> = {
  direct: "Direct Messages",
  group: "Group Chats",
  channel: "Channels",
  client_support: "Client Support",
};

export function MessagesPageClient({
  conversations,
  typeFilter,
}: MessagesPageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  // Group conversations by type
  const groupedConversations = conversations.reduce(
    (acc, conv) => {
      if (!acc[conv.type]) {
        acc[conv.type] = [];
      }
      acc[conv.type].push(conv);
      return acc;
    },
    {} as Record<ConversationType, ConversationWithDetails[]>
  );

  // Filter conversations
  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.participants.some(
            (p) =>
              p.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.client?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : conversations;

  // Get pinned conversations
  const pinnedConversations = filteredConversations.filter((c) =>
    c.participants.some((p) => p.isPinned && p.userId)
  );

  const unpinnedConversations = filteredConversations.filter(
    (c) => !pinnedConversations.includes(c)
  );

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                router.push(`/messages?type=${value}`);
              } else {
                router.push("/messages");
              }
            }}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="direct">Direct Messages</option>
            <option value="group">Group Chats</option>
            <option value="channel">Channels</option>
            <option value="client_support">Client Support</option>
          </select>

          {/* New Conversation Button */}
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Conversation</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <EmptyState onNewConversation={() => setShowNewModal(true)} />
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedConversations.length > 0 && (
            <ConversationSection
              title="Pinned"
              icon={<Pin className="h-4 w-4" />}
              conversations={pinnedConversations}
            />
          )}

          {/* Regular Conversations */}
          {typeFilter ? (
            <ConversationSection
              title={TYPE_LABELS[typeFilter]}
              icon={TYPE_ICONS[typeFilter]}
              conversations={unpinnedConversations}
            />
          ) : (
            <>
              {(Object.keys(groupedConversations) as ConversationType[]).map(
                (type) => {
                  const convs = groupedConversations[type].filter(
                    (c) => !pinnedConversations.includes(c)
                  );
                  if (convs.length === 0) return null;
                  return (
                    <ConversationSection
                      key={type}
                      title={TYPE_LABELS[type]}
                      icon={TYPE_ICONS[type]}
                      conversations={convs}
                    />
                  );
                }
              )}
            </>
          )}
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewModal && (
        <NewConversationModal onClose={() => setShowNewModal(false)} />
      )}
    </div>
  );
}

function ConversationSection({
  title,
  icon,
  conversations,
}: {
  title: string;
  icon: React.ReactNode;
  conversations: ConversationWithDetails[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--foreground-muted)]">
        {icon}
        <span>{title}</span>
        <span className="text-xs">({conversations.length})</span>
      </div>
      <div className="space-y-2">
        {conversations.map((conversation) => (
          <ConversationCard key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </div>
  );
}

function ConversationCard({
  conversation,
}: {
  conversation: ConversationWithDetails;
}) {
  const displayName = getConversationDisplayName(conversation);
  const icon = TYPE_ICONS[conversation.type];
  const isPinned = conversation.participants.some((p) => p.isPinned && p.userId);
  const isMuted = conversation.participants.some((p) => p.isMuted && p.userId);

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="group flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
    >
      {/* Avatar/Icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--foreground)] truncate">
              {displayName}
            </span>
            {isPinned && <Pin className="h-3 w-3 text-[var(--foreground-muted)]" />}
            {isMuted && <BellOff className="h-3 w-3 text-[var(--foreground-muted)]" />}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {conversation.unreadCount && conversation.unreadCount > 0 ? (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-medium text-white">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </span>
            ) : null}
            {conversation.lastMessageAt && (
              <span className="text-xs text-[var(--foreground-muted)]">
                {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </div>

        {/* Participants or Description */}
        <p className="mt-1 text-sm text-[var(--foreground-muted)] truncate">
          {conversation.description ||
            conversation.participants
              .slice(0, 3)
              .map((p) => p.user?.fullName || p.client?.fullName || "Unknown")
              .join(", ") +
              (conversation.participants.length > 3
                ? ` +${conversation.participants.length - 3} more`
                : "")}
        </p>
      </div>
    </Link>
  );
}

function EmptyState({ onNewConversation }: { onNewConversation: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10">
        <MessageSquare className="h-8 w-8 text-[var(--primary)]" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">
        No conversations yet
      </h3>
      <p className="mt-2 text-center text-sm text-[var(--foreground-muted)] max-w-sm">
        Start a conversation with a team member, create a group chat, or set up
        a channel for your team.
      </p>
      <button
        onClick={onNewConversation}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
      >
        <Plus className="h-4 w-4" />
        New Conversation
      </button>
    </div>
  );
}

function NewConversationModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"direct" | "group" | "channel">("direct");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          New Conversation
        </h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Select the type of conversation you want to create.
        </p>

        <div className="mt-6 space-y-3">
          <TypeOption
            type="direct"
            selected={type === "direct"}
            onSelect={() => setType("direct")}
            icon={<MessageSquare className="h-5 w-5" />}
            label="Direct Message"
            description="One-on-one conversation with a team member"
          />
          <TypeOption
            type="group"
            selected={type === "group"}
            onSelect={() => setType("group")}
            icon={<Users className="h-5 w-5" />}
            label="Group Chat"
            description="Conversation with multiple team members"
          />
          <TypeOption
            type="channel"
            selected={type === "channel"}
            onSelect={() => setType("channel")}
            icon={<Hash className="h-5 w-5" />}
            label="Channel"
            description="Topic-based channel for the team"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors"
          >
            Cancel
          </button>
          <Link
            href={`/messages/new?type=${type}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}

function TypeOption({
  type: _type,
  selected,
  onSelect,
  icon,
  label,
  description,
}: {
  type: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
        selected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
          selected ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="font-medium text-[var(--foreground)]">{label}</div>
        <div className="text-sm text-[var(--foreground-muted)]">{description}</div>
      </div>
    </button>
  );
}

function getConversationDisplayName(conversation: ConversationWithDetails): string {
  if (conversation.name) {
    return conversation.name;
  }

  if (conversation.type === "direct") {
    // Find the other participant
    const otherParticipant = conversation.participants.find(
      (p) => p.user || p.client
    );
    return (
      otherParticipant?.user?.fullName ||
      otherParticipant?.client?.fullName ||
      "Unknown"
    );
  }

  return `${conversation.type.replace("_", " ")} conversation`;
}
