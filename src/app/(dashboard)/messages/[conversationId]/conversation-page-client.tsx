"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Users,
  Settings,
  Pin,
  BellOff,
  Trash2,
  Archive,
  UserPlus,
  Hash,
  MessageSquare,
  Headphones,
  Smile,
  Paperclip,
  Reply,
} from "lucide-react";
import type { ConversationWithDetails } from "@/lib/actions/conversations";
import type { MessageWithDetails } from "@/lib/actions/messages";
import {
  sendMessage,
  markConversationAsRead,
  addReaction,
  getConversationMessages,
} from "@/lib/actions/messages";
import {
  archiveConversation,
  deleteConversation,
} from "@/lib/actions/conversations";
import {
  toggleMuteConversation,
  togglePinConversation,
} from "@/lib/actions/conversation-participants";
import type { ConversationType, MessageReactionType } from "@prisma/client";

interface ConversationPageClientProps {
  conversation: ConversationWithDetails;
  initialMessages: MessageWithDetails[];
  currentUserId: string;
}

const TYPE_ICONS: Record<ConversationType, React.ReactNode> = {
  direct: <MessageSquare className="h-5 w-5" />,
  group: <Users className="h-5 w-5" />,
  channel: <Hash className="h-5 w-5" />,
  client_support: <Headphones className="h-5 w-5" />,
};

const REACTION_TYPES: MessageReactionType[] = [
  "thumbs_up",
  "thumbs_down",
  "heart",
  "check",
  "eyes",
  "celebration",
];

const REACTION_EMOJIS: Record<MessageReactionType, string> = {
  thumbs_up: "👍",
  thumbs_down: "👎",
  heart: "❤️",
  check: "✅",
  eyes: "👀",
  celebration: "🎉",
};

export function ConversationPageClient({
  conversation,
  initialMessages,
  currentUserId,
}: ConversationPageClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const displayName = getConversationDisplayName(conversation, currentUserId);
  const icon = TYPE_ICONS[conversation.type];

  // Mark as read on mount and when messages update
  useEffect(() => {
    markConversationAsRead(conversation.id);
  }, [conversation.id, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const result = await getConversationMessages(conversation.id, {
        limit: 50,
        parentId: null,
      });
      if (result.success) {
        setMessages(result.data.messages);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [conversation.id]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    startTransition(async () => {
      const result = await sendMessage({
        conversationId: conversation.id,
        content: messageContent,
      });

      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: string, type: MessageReactionType) => {
    startTransition(async () => {
      await addReaction(messageId, type);
      // Refresh messages
      const result = await getConversationMessages(conversation.id, {
        limit: 50,
        parentId: null,
      });
      if (result.success) {
        setMessages(result.data.messages);
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveConversation(conversation.id);
      router.push("/messages");
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      startTransition(async () => {
        await deleteConversation(conversation.id);
        router.push("/messages");
      });
    }
  };

  const handleToggleMute = () => {
    startTransition(async () => {
      await toggleMuteConversation(conversation.id);
      router.refresh();
    });
  };

  const handleTogglePin = () => {
    startTransition(async () => {
      await togglePinConversation(conversation.id);
      router.refresh();
    });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
            {icon}
          </div>

          <div>
            <h2 className="font-medium text-[var(--foreground)]">{displayName}</h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              {conversation.participants.length} participant
              {conversation.participants.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors">
            <UserPlus className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                  <button
                    onClick={() => {
                      handleTogglePin();
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                  >
                    <Pin className="h-4 w-4" />
                    Pin Conversation
                  </button>
                  <button
                    onClick={() => {
                      handleToggleMute();
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                  >
                    <BellOff className="h-4 w-4" />
                    Mute Notifications
                  </button>
                  <hr className="my-1 border-[var(--card-border)]" />
                  <button
                    onClick={() => {
                      handleArchive();
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10">
                <MessageSquare className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">
                No messages yet
              </h3>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Start the conversation by sending a message below.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderUserId === currentUserId;
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderUserId !== message.senderUserId;
              const showTimestamp =
                index === 0 ||
                new Date(message.createdAt).getTime() -
                  new Date(messages[index - 1].createdAt).getTime() >
                  5 * 60 * 1000; // 5 minutes gap

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  showTimestamp={showTimestamp}
                  onReaction={(type) => handleReaction(message.id, type)}
                  allowReactions={conversation.allowReactions}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--card-border)] p-4">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 pr-24 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              style={{
                minHeight: "48px",
                maxHeight: "200px",
              }}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors">
                <Paperclip className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors">
                <Smile className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isPending}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showTimestamp,
  onReaction,
  allowReactions,
}: {
  message: MessageWithDetails;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  onReaction: (type: MessageReactionType) => void;
  allowReactions: boolean;
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const senderName = message.senderUser?.fullName || message.senderClient?.fullName || message.senderName;

  // Group reactions by type
  const reactionCounts = message.reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    },
    {} as Record<MessageReactionType, number>
  );

  return (
    <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} gap-2`}>
      {/* Avatar */}
      {showAvatar ? (
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
            isOwn
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-tertiary)] text-[var(--foreground)]"
          }`}
        >
          {(senderName || "?").charAt(0).toUpperCase()}
        </div>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {showAvatar && (
          <div className={`mb-1 flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            <span className="text-xs font-medium text-[var(--foreground)]">
              {senderName}
            </span>
          </div>
        )}

        <div
          className={`relative group rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-[var(--primary)] text-white rounded-tr-md"
              : "bg-[var(--background-tertiary)] text-[var(--foreground)] rounded-tl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {message.isEdited && (
            <span className={`text-xs ${isOwn ? "text-white/60" : "text-[var(--foreground-muted)]"}`}>
              (edited)
            </span>
          )}

          {/* Reaction Picker */}
          {allowReactions && (
            <div className="absolute -bottom-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--background-hover)]"
                >
                  <Smile className="h-3 w-3 text-[var(--foreground-muted)]" />
                </button>

                {showReactionPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowReactionPicker(false)}
                    />
                    <div className="absolute bottom-full right-0 z-50 mb-1 flex gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] p-1 shadow-lg">
                      {REACTION_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            onReaction(type);
                            setShowReactionPicker(false);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[var(--background-hover)] transition-colors"
                        >
                          {REACTION_EMOJIS[type]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className={`mt-1 flex gap-1 ${isOwn ? "flex-row-reverse" : ""}`}>
            {(Object.entries(reactionCounts) as [MessageReactionType, number][]).map(
              ([type, count]) => (
                <button
                  key={type}
                  onClick={() => onReaction(type)}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-2 py-0.5 text-xs hover:bg-[var(--background-hover)]"
                >
                  <span>{REACTION_EMOJIS[type]}</span>
                  <span className="text-[var(--foreground-muted)]">{count}</span>
                </button>
              )
            )}
          </div>
        )}

        {/* Timestamp */}
        {showTimestamp && (
          <span
            className={`mt-1 text-xs text-[var(--foreground-muted)] ${
              isOwn ? "text-right" : "text-left"
            }`}
          >
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
        )}
      </div>
    </div>
  );
}

function getConversationDisplayName(
  conversation: ConversationWithDetails,
  currentUserId: string
): string {
  if (conversation.name) {
    return conversation.name;
  }

  if (conversation.type === "direct") {
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== currentUserId
    );
    return (
      otherParticipant?.user?.fullName ||
      otherParticipant?.client?.fullName ||
      "Unknown"
    );
  }

  return `${conversation.type.replace("_", " ")} conversation`;
}
