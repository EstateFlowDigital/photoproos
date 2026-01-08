"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  sendSupportMessage,
  markMessagesAsRead,
} from "@/lib/actions/support-tickets";
import type { SupportTicketStatus, SupportTicketCategory } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

// Icons
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SupportAgentIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
      <circle cx="9" cy="14" r="1" />
      <circle cx="15" cy="14" r="1" />
      <path d="M9 18h6" />
    </svg>
  );
}

interface Message {
  id: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: Date;
  readAt: Date | null;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: string;
  createdAt: Date;
  messages: Message[];
}

interface SupportChatProps {
  ticket: SupportTicket;
  onMessageSent?: () => void;
}

const STATUS_STYLES: Record<
  SupportTicketStatus,
  { bg: string; text: string; dot: string }
> = {
  open: {
    bg: "bg-[var(--primary)]/10",
    text: "text-[var(--primary)]",
    dot: "bg-[var(--primary)]",
  },
  in_progress: {
    bg: "bg-[var(--warning)]/10",
    text: "text-[var(--warning)]",
    dot: "bg-[var(--warning)]",
  },
  resolved: {
    bg: "bg-[var(--success)]/10",
    text: "text-[var(--success)]",
    dot: "bg-[var(--success)]",
  },
  closed: {
    bg: "bg-[var(--foreground-muted)]/10",
    text: "text-[var(--foreground-muted)]",
    dot: "bg-[var(--foreground-muted)]",
  },
};

const CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  support_request: "Support",
  report_issue: "Issue",
  billing: "Billing",
  questions: "Question",
  feature_request: "Feature",
  other: "Other",
};

export function SupportChat({ ticket, onMessageSent }: SupportChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [ticket.messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    const unreadMessages = ticket.messages.filter(
      (m) => m.isFromAdmin && !m.readAt
    );
    if (unreadMessages.length > 0) {
      markMessagesAsRead(ticket.id);
    }
  }, [ticket.id, ticket.messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    startTransition(async () => {
      const result = await sendSupportMessage(ticket.id, newMessage.trim());

      if (result.success) {
        setNewMessage("");
        onMessageSent?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusStyle = STATUS_STYLES[ticket.status];
  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-start justify-between gap-4 p-4",
          "border-b border-[var(--border)]"
        )}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] truncate">
            {ticket.subject}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[ticket.category]}
            </Badge>
            <span className="text-xs text-[var(--foreground-muted)]">
              {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
            statusStyle.bg,
            statusStyle.text
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
          {ticket.status.replace("_", " ")}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {ticket.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex gap-3",
                message.isFromAdmin ? "flex-row" : "flex-row-reverse"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  message.isFromAdmin
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                )}
              >
                {message.isFromAdmin ? (
                  <SupportAgentIcon className="w-4 h-4" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={cn(
                  "flex flex-col max-w-[75%]",
                  message.isFromAdmin ? "items-start" : "items-end"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl",
                    message.isFromAdmin
                      ? "bg-[var(--background-tertiary)] rounded-tl-sm"
                      : "bg-[var(--primary)] text-white rounded-tr-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span
                  className={cn(
                    "text-xs text-[var(--foreground-muted)] mt-1 px-1"
                  )}
                >
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isResolved ? (
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isPending}
              rows={1}
              className={cn(
                "resize-none min-h-[40px] max-h-[120px]",
                "focus-visible:ring-[var(--primary)]"
              )}
            />
            <Button
              onClick={handleSend}
              disabled={isPending || !newMessage.trim()}
              size="icon"
              className="flex-shrink-0"
            >
              {isPending ? (
                <LoaderIcon className="w-4 h-4" />
              ) : (
                <SendIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "p-4 border-t border-[var(--border)]",
            "bg-[var(--background-tertiary)]",
            "text-center text-sm text-[var(--foreground-muted)]"
          )}
        >
          This ticket has been {ticket.status}. Please create a new ticket for
          further assistance.
        </div>
      )}
    </div>
  );
}
