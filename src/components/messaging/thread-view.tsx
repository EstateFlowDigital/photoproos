"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { format } from "date-fns";
import {
  X,
  Send,
  MessageSquare,
  ChevronRight,
  Smile,
} from "lucide-react";
import { ReactionPicker } from "./emoji-picker";
import type { MessageWithDetails } from "@/lib/actions/messages";
import {
  sendMessage,
  getThreadReplies,
  addReaction,
} from "@/lib/actions/messages";
interface ThreadViewProps {
  parentMessage: MessageWithDetails;
  conversationId: string;
  currentUserId: string;
  onClose: () => void;
  allowReactions?: boolean;
}

// Available reaction emojis
const REACTION_EMOJIS = ["👍", "👎", "❤️", "✅", "👀", "🎉"];

export function ThreadView({
  parentMessage,
  conversationId,
  currentUserId,
  onClose,
  allowReactions = true,
}: ThreadViewProps) {
  const [replies, setReplies] = useState<MessageWithDetails[]>([]);
  const [newReply, setNewReply] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load thread replies
  useEffect(() => {
    const loadReplies = async () => {
      setIsLoading(true);
      const result = await getThreadReplies(parentMessage.id);
      if (result.success) {
        setReplies(result.data);
      }
      setIsLoading(false);
    };
    loadReplies();
  }, [parentMessage.id]);

  // Poll for new replies
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const result = await getThreadReplies(parentMessage.id);
      if (result.success) {
        setReplies(result.data);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [parentMessage.id]);

  // Scroll to bottom on new replies
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendReply = async () => {
    if (!newReply.trim()) return;

    const replyContent = newReply.trim();
    setNewReply("");

    startTransition(async () => {
      const result = await sendMessage({
        conversationId,
        content: replyContent,
        parentId: parentMessage.id,
      });

      if (result.success) {
        setReplies((prev) => [...prev, result.data]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    startTransition(async () => {
      await addReaction(messageId, emoji);
      // Refresh replies
      const result = await getThreadReplies(parentMessage.id);
      if (result.success) {
        setReplies(result.data);
      }
    });
  };

  const getSenderInfo = (message: MessageWithDetails) => {
    const name = message.senderUser?.fullName || message.senderClient?.fullName || message.senderName;
    const initials = (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    return { name, initials };
  };

  const parentSender = getSenderInfo(parentMessage);

  return (
    <div className="thread-view flex h-full flex-col border-l border-[var(--card-border)] bg-[var(--card)]">
      {/* Thread Header */}
      <header className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Thread</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              {parentMessage.threadCount} {parentMessage.threadCount === 1 ? "reply" : "replies"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
          aria-label="Close thread"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Parent Message */}
      <div className="border-b border-[var(--card-border)] bg-[var(--background-tertiary)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white text-sm font-medium">
            {parentSender.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--foreground)]">{parentSender.name}</span>
              <span className="text-xs text-[var(--foreground-muted)]">
                {format(new Date(parentMessage.createdAt), "MMM d, h:mm a")}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--foreground)] whitespace-pre-wrap break-words">
              {parentMessage.content}
            </p>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <ChevronRight className="h-8 w-8 text-[var(--foreground-muted)] mb-2" />
            <p className="text-sm text-[var(--foreground-muted)]">No replies yet</p>
            <p className="text-xs text-[var(--foreground-muted)]">Be the first to reply!</p>
          </div>
        ) : (
          replies.map((reply) => (
            <ThreadReply
              key={reply.id}
              message={reply}
              currentUserId={currentUserId}
              onReaction={(type) => handleReaction(reply.id, type)}
              allowReactions={allowReactions}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      <div className="border-t border-[var(--card-border)] p-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply to thread..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
            style={{
              minHeight: "42px",
              maxHeight: "100px",
            }}
          />
          <button
            onClick={handleSendReply}
            disabled={!newReply.trim() || isPending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50"
            aria-label="Send reply"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Individual thread reply
function ThreadReply({
  message,
  currentUserId,
  onReaction,
  allowReactions,
}: {
  message: MessageWithDetails;
  currentUserId: string;
  onReaction: (emoji: string) => void;
  allowReactions: boolean;
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const isOwn = message.senderUserId === currentUserId;
  const senderName = message.senderUser?.fullName || message.senderClient?.fullName || message.senderName;
  const senderInitials = (senderName || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Group reactions by emoji
  const reactionCounts = message.reactions.reduce(
    (acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className={`flex items-start gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs font-medium">
        {senderInitials}
      </div>
      <div className={`flex-1 min-w-0 ${isOwn ? "text-right" : ""}`}>
        <div className={`flex items-center gap-2 ${isOwn ? "justify-end" : ""}`}>
          <span className="font-medium text-sm text-[var(--foreground)]">{senderName}</span>
          <span className="text-xs text-[var(--foreground-muted)]">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
        </div>
        <div className="relative group">
          <p
            className={`mt-1 inline-block rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
              isOwn
                ? "bg-[var(--primary)] text-white rounded-br-md"
                : "bg-[var(--background-tertiary)] text-[var(--foreground)] rounded-bl-md"
            }`}
          >
            {message.content}
            {message.isEdited && (
              <span className={`text-xs ${isOwn ? "text-white/60" : "text-[var(--foreground-muted)]"}`}>
                {" "}(edited)
              </span>
            )}
          </p>

          {/* Reaction button on hover */}
          {allowReactions && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"
              }`}
            >
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--background-hover)] transition-colors"
                aria-label="Add reaction"
              >
                <Smile className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
              </button>
              {showReactionPicker && (
                <div className={`absolute ${isOwn ? "left-0" : "right-0"} top-full mt-1`}>
                  <ReactionPicker
                    isOpen={showReactionPicker}
                    onClose={() => setShowReactionPicker(false)}
                    onSelect={(emoji) => {
                      onReaction(emoji);
                      setShowReactionPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reactions Display */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className={`mt-1 flex gap-1 ${isOwn ? "justify-end" : ""}`}>
            {Object.entries(reactionCounts).map(
              ([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(emoji)}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-2 py-0.5 text-xs hover:bg-[var(--background-hover)] shadow-sm"
                >
                  <span>{emoji}</span>
                  <span className="text-[var(--foreground-muted)]">{count}</span>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
