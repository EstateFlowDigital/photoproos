"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface WidgetMessage {
  id: string;
  conversationId: string;
  conversationName: string | null;
  conversationType: string;
  content: string;
  senderName: string;
  senderAvatar: string | null;
  createdAt: Date | string; // Can be Date or ISO string after serialization
  isUnread: boolean;
}

interface MessagesWidgetProps {
  messages?: WidgetMessage[];
  maxItems?: number;
  isCompact?: boolean;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getConversationIcon(type: string) {
  switch (type) {
    case "direct":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
        </svg>
      );
    case "group":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
        </svg>
      );
    case "channel":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M9.493 2.852a.75.75 0 0 0-1.486-.204L7.545 6H4.198a.75.75 0 0 0 0 1.5h3.14l-.69 5H3.302a.75.75 0 0 0 0 1.5h3.14l-.435 3.148a.75.75 0 0 0 1.486.204L7.955 14h4.692l-.435 3.148a.75.75 0 0 0 1.486.204l.461-3.352h3.34a.75.75 0 0 0 0-1.5h-3.14l.69-5h3.346a.75.75 0 0 0 0-1.5h-3.14l.435-3.148a.75.75 0 0 0-1.486-.204L14.045 6H9.353l.435-3.148ZM8.146 7.5l-.69 5h4.692l.69-5H8.146Z" clipRule="evenodd" />
        </svg>
      );
    case "client_support":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      );
  }
}

function getConversationTypeStyle(type: string): string {
  switch (type) {
    case "direct":
      return "bg-[var(--primary)]/10 text-[var(--primary)]";
    case "group":
      return "bg-[var(--ai)]/10 text-[var(--ai)]";
    case "channel":
      return "bg-[var(--warning)]/10 text-[var(--warning)]";
    case "client_support":
      return "bg-[var(--success)]/10 text-[var(--success)]";
    default:
      return "bg-[var(--background-secondary)] text-foreground-muted";
  }
}

// ============================================================================
// Component
// ============================================================================

export function MessagesWidget({
  messages = [],
  maxItems = 5,
  isCompact = false,
  className,
}: MessagesWidgetProps) {
  const displayMessages = messages.slice(0, isCompact ? 3 : maxItems);
  const unreadCount = messages.filter((m) => m.isUnread).length;

  if (displayMessages.length === 0) {
    return (
      <Link
        href="/messages"
        className={cn(
          "flex flex-col items-center justify-center py-8 hover:bg-[var(--background-secondary)] rounded-lg transition-colors",
          className
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background-secondary)]">
          <svg
            className="h-5 w-5 text-foreground-muted"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">No messages yet</p>
        <p className="mt-1 text-xs text-foreground-muted">
          Click to start a conversation
        </p>
      </Link>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with unread badge */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
            </span>
            {unreadCount} unread
          </span>
        </div>
      )}

      {/* Message list */}
      <div className="space-y-1 flex-1 overflow-auto">
        {displayMessages.map((message) => (
          <Link
            key={message.id}
            href={`/messages/${message.conversationId}`}
            className={cn(
              "flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--background-secondary)]",
              message.isUnread && "bg-[var(--primary)]/5"
            )}
          >
            {/* Conversation type icon */}
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                getConversationTypeStyle(message.conversationType)
              )}
            >
              {getConversationIcon(message.conversationType)}
            </span>

            {/* Message content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium truncate",
                  message.isUnread ? "text-foreground" : "text-foreground-secondary"
                )}>
                  {message.senderName}
                </span>
                {message.conversationName && (
                  <span className="text-xs text-foreground-muted truncate">
                    in {message.conversationName}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-sm truncate mt-0.5",
                message.isUnread ? "text-foreground-secondary" : "text-foreground-muted"
              )}>
                {message.content}
              </p>
              <p className="mt-0.5 text-xs text-foreground-muted">
                {formatRelativeTime(message.createdAt)}
              </p>
            </div>

            {/* Unread indicator */}
            {message.isUnread && (
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-[var(--primary)]" aria-label="Unread" />
            )}
          </Link>
        ))}
      </div>

      {/* View all link */}
      <Link
        href="/messages"
        className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
        </svg>
        View all messages
      </Link>
    </div>
  );
}

export default MessagesWidget;
