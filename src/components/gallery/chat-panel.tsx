"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import {
  getProjectMessages,
  createProjectMessage,
  updateProjectMessage,
  deleteProjectMessage,
  toggleMessageVisibility,
  type ProjectMessageWithReplies,
} from "@/lib/actions/project-messages";
import type { MessageVisibility } from "@prisma/client";

// ============================================================================
// ICONS
// ============================================================================

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================================
// TYPES
// ============================================================================

interface ChatPanelProps {
  galleryId: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ChatPanel({ galleryId, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<ProjectMessageWithReplies[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [visibility, setVisibility] = useState<MessageVisibility>("client");
  const [error, setError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [galleryId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function loadMessages() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProjectMessages(galleryId, true);
      if (result.success) {
        setMessages(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return;

    setIsSending(true);
    setError(null);
    try {
      const result = await createProjectMessage(galleryId, {
        content: newMessage.trim(),
        visibility,
      });
      if (result.success) {
        setNewMessage("");
        await loadMessages();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleUpdateMessage(messageId: string) {
    if (!editContent.trim()) return;

    setError(null);
    try {
      const result = await updateProjectMessage(messageId, {
        content: editContent.trim(),
      });
      if (result.success) {
        setEditingMessage(null);
        setEditContent("");
        await loadMessages();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to update message");
    }
  }

  async function handleDeleteMessage(messageId: string) {
    setError(null);
    try {
      const result = await deleteProjectMessage(messageId);
      if (result.success) {
        setShowDeleteConfirm(null);
        await loadMessages();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to delete message");
    }
  }

  async function handleToggleVisibility(
    messageId: string,
    currentVisibility: MessageVisibility
  ) {
    setError(null);
    const newVisibility: MessageVisibility =
      currentVisibility === "internal" ? "client" : "internal";
    try {
      const result = await toggleMessageVisibility(messageId, newVisibility);
      if (result.success) {
        await loadMessages();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to update visibility");
    }
  }

  function formatTime(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  function startEdit(message: ProjectMessageWithReplies) {
    setEditingMessage(message.id);
    setEditContent(message.content);
  }

  function cancelEdit() {
    setEditingMessage(null);
    setEditContent("");
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap p-4 border-b border-[var(--card-border)]">
        <div>
          <h3 className="font-semibold text-foreground">Project Chat</h3>
          <p className="text-sm text-foreground-muted">
            Communicate with your team and client
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadMessages} disabled={isLoading}>
          <RefreshIcon className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-foreground-muted">
            <RefreshIcon className="h-5 w-5 animate-spin mr-2" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--background-secondary)] flex items-center justify-center mb-4">
              <SendIcon className="h-6 w-6 text-foreground-muted" />
            </div>
            <p className="text-foreground-muted">No messages yet</p>
            <p className="text-sm text-foreground-muted mt-1">
              Start the conversation below
            </p>
          </div>
        ) : (
          <>
            {[...messages].reverse().map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isEditing={editingMessage === message.id}
                editContent={editContent}
                onEditContentChange={setEditContent}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleUpdateMessage}
                onDelete={() => setShowDeleteConfirm(message.id)}
                onToggleVisibility={handleToggleVisibility}
                formatTime={formatTime}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Compose Area */}
      <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card)]">
        {/* Visibility Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-foreground-muted">Visibility:</span>
          <button
            type="button"
            onClick={() =>
              setVisibility(visibility === "client" ? "internal" : "client")
            }
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
              visibility === "client"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
            )}
          >
            {visibility === "client" ? (
              <>
                <EyeIcon className="h-3 w-3" />
                Visible to Client
              </>
            ) : (
              <>
                <EyeOffIcon className="h-3 w-3" />
                Internal Only
              </>
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap mt-3">
          <span className="text-xs text-foreground-muted">
            {navigator.platform.includes("Mac") ? "Cmd" : "Ctrl"} + Enter to send
          </span>
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            size="sm"
          >
            {isSending ? (
              <RefreshIcon className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <SendIcon className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteConfirm && handleDeleteMessage(showDeleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

interface MessageBubbleProps {
  message: ProjectMessageWithReplies;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onStartEdit: (message: ProjectMessageWithReplies) => void;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string) => void;
  onDelete: () => void;
  onToggleVisibility: (
    messageId: string,
    currentVisibility: MessageVisibility
  ) => void;
  formatTime: (date: Date | string) => string;
}

function MessageBubble({
  message,
  isEditing,
  editContent,
  onEditContentChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onToggleVisibility,
  formatTime,
}: MessageBubbleProps) {
  const isTeam = message.senderType === "team";
  const isInternal = message.visibility === "internal";

  return (
    <div
      className={cn(
        "group relative",
        isTeam ? "ml-8" : "mr-8"
      )}
    >
      <div
        className={cn(
          "rounded-lg p-3",
          isTeam
            ? isInternal
              ? "bg-orange-500/10 border border-orange-500/20"
              : "bg-[var(--primary)]/10 border border-[var(--primary)]/20"
            : "bg-[var(--background-secondary)] border border-[var(--card-border)]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            {message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
                <UserIcon className="h-3 w-3 text-foreground-muted" />
              </div>
            )}
            <span className="font-medium text-sm text-foreground">
              {message.senderName}
            </span>
            {isInternal && (
              <Badge variant="outline" className="text-[10px] bg-orange-500/10 border-orange-500/30 text-orange-400">
                Internal
              </Badge>
            )}
            {message.isEdited && (
              <span className="text-xs text-foreground-muted">(edited)</span>
            )}
          </div>
          <span className="text-xs text-foreground-muted">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => onSaveEdit(message.id)}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>

      {/* Actions (show on hover for team messages) */}
      {isTeam && !isEditing && (
        <div className="absolute -top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onToggleVisibility(message.id, message.visibility)}
            className="p-1 rounded bg-[var(--card)] border border-[var(--card-border)] hover:bg-[var(--background-hover)] transition-colors"
            title={isInternal ? "Make visible to client" : "Make internal only"}
          >
            {isInternal ? (
              <EyeIcon className="h-3 w-3 text-foreground-muted" />
            ) : (
              <EyeOffIcon className="h-3 w-3 text-foreground-muted" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onStartEdit(message)}
            className="p-1 rounded bg-[var(--card)] border border-[var(--card-border)] hover:bg-[var(--background-hover)] transition-colors"
            title="Edit message"
          >
            <EditIcon className="h-3 w-3 text-foreground-muted" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded bg-[var(--card)] border border-[var(--card-border)] hover:bg-[var(--background-hover)] transition-colors"
            title="Delete message"
          >
            <TrashIcon className="h-3 w-3 text-foreground-muted" />
          </button>
        </div>
      )}

      {/* Replies (if any) */}
      {message.replies && message.replies.length > 0 && (
        <div className="mt-2 ml-4 space-y-2 border-l-2 border-[var(--card-border)] pl-3">
          {message.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">
                  {reply.senderName}
                </span>
                <span className="text-xs text-foreground-muted">
                  {formatTime(reply.createdAt)}
                </span>
              </div>
              <p className="text-foreground-muted">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatPanel;
