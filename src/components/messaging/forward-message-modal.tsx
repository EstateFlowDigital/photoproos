"use client";

import { useState, useTransition } from "react";
import { X, Forward, Search, Check, MessageSquare, Users, Hash, Headphones } from "lucide-react";
import { forwardMessage } from "@/lib/actions/messages";
import { getUserConversations } from "@/lib/actions/conversations";
import type { ConversationWithDetails } from "@/lib/actions/conversations";
import type { ConversationType } from "@prisma/client";

interface ForwardMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  messagePreview: string;
  currentConversationId: string;
}

const TYPE_ICONS: Record<ConversationType, React.ReactNode> = {
  direct: <MessageSquare className="h-4 w-4" />,
  group: <Users className="h-4 w-4" />,
  channel: <Hash className="h-4 w-4" />,
  client_support: <Headphones className="h-4 w-4" />,
};

export function ForwardMessageModal({
  isOpen,
  onClose,
  messageId,
  messagePreview,
  currentConversationId,
}: ForwardMessageModalProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [includeAttachments, setIncludeAttachments] = useState(true);

  // Load conversations when modal opens
  useState(() => {
    if (isOpen) {
      loadConversations();
    }
  });

  const loadConversations = async () => {
    setIsLoading(true);
    const result = await getUserConversations();
    if (result.success) {
      // Exclude current conversation
      setConversations(
        result.data.filter((c) => c.id !== currentConversationId)
      );
    }
    setIsLoading(false);
  };

  const handleForward = () => {
    if (!selectedConversationId) return;

    startTransition(async () => {
      const result = await forwardMessage(
        messageId,
        selectedConversationId,
        includeAttachments
      );

      if (result.success) {
        onClose();
      }
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.name || conv.participants
      .map((p) => p.user?.fullName || p.client?.fullName)
      .filter(Boolean)
      .join(", ");
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getConversationName = (conversation: ConversationWithDetails): string => {
    if (conversation.name) return conversation.name;

    const names = conversation.participants
      .slice(0, 3)
      .map((p) => p.user?.fullName || p.client?.fullName)
      .filter(Boolean);

    if (names.length === 0) return "Unnamed conversation";
    if (conversation.participants.length > 3) {
      return `${names.join(", ")} +${conversation.participants.length - 3}`;
    }
    return names.join(", ");
  };

  if (!isOpen) return null;

  return (
    <div className="forward-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] p-4">
          <div className="flex items-center gap-2">
            <Forward className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="font-semibold text-[var(--foreground)]">Forward Message</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="border-b border-[var(--card-border)] px-4 py-3">
          <p className="text-xs text-[var(--foreground-muted)] mb-1">Message to forward:</p>
          <p className="text-sm text-[var(--foreground)] line-clamp-2">
            {messagePreview}
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[var(--card-border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="max-h-64 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--foreground-muted)]">
              No conversations found
            </p>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                  selectedConversationId === conversation.id
                    ? "bg-[var(--primary)]/10 border border-[var(--primary)]"
                    : "hover:bg-[var(--background-hover)]"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  selectedConversationId === conversation.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
                }`}>
                  {TYPE_ICONS[conversation.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--foreground)] truncate">
                    {getConversationName(conversation)}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] truncate">
                    {conversation.participants.length} participant{conversation.participants.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {selectedConversationId === conversation.id && (
                  <Check className="h-5 w-5 text-[var(--primary)]" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Options */}
        <div className="border-t border-[var(--card-border)] p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAttachments}
              onChange={(e) => setIncludeAttachments(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <span className="text-sm text-[var(--foreground)]">Include attachments</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-[var(--card-border)] p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={!selectedConversationId || isPending}
            className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
          >
            {isPending ? "Forwarding..." : "Forward"}
          </button>
        </div>
      </div>
    </div>
  );
}
