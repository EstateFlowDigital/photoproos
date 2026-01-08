"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SupportChat } from "./support-chat";
import type { SupportTicketStatus, SupportTicketCategory } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

// Icons
function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
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
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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

interface TicketHistoryProps {
  tickets: SupportTicket[];
  onRefresh?: () => void;
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

export function TicketHistory({ tickets, onRefresh }: TicketHistoryProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );

  const getUnreadCount = (ticket: SupportTicket) => {
    return ticket.messages.filter((m) => m.isFromAdmin && !m.readAt).length;
  };

  const getLastMessage = (ticket: SupportTicket) => {
    if (ticket.messages.length === 0) return null;
    return ticket.messages[ticket.messages.length - 1];
  };

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            "bg-[var(--foreground)]/5"
          )}
        >
          <InboxIcon className="w-8 h-8 text-[var(--foreground-muted)]" />
        </div>
        <h3 className="font-medium text-[var(--foreground)] mb-1">
          No support tickets
        </h3>
        <p className="text-sm text-[var(--foreground-muted)]">
          You haven&apos;t created any support tickets yet
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {selectedTicket ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedTicket(null)}
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "text-sm text-[var(--foreground-muted)]",
                "hover:text-[var(--foreground)]",
                "border-b border-[var(--border)]",
                "transition-colors"
              )}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Back to tickets
            </button>

            {/* Chat */}
            <div className="flex-1 min-h-0">
              <SupportChat ticket={selectedTicket} onMessageSent={onRefresh} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-[var(--border)]"
          >
            {tickets.map((ticket) => {
              const unreadCount = getUnreadCount(ticket);
              const lastMessage = getLastMessage(ticket);
              const statusStyle = STATUS_STYLES[ticket.status];

              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 text-left",
                    "hover:bg-[var(--background-tertiary)]",
                    "transition-colors",
                    "group"
                  )}
                >
                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        statusStyle.dot,
                        ticket.status === "in_progress" && "animate-pulse"
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-[var(--foreground)] truncate">
                        {ticket.subject}
                      </h4>
                      {unreadCount > 0 && (
                        <span
                          className={cn(
                            "flex-shrink-0 min-w-[20px] h-5 px-1.5",
                            "flex items-center justify-center",
                            "rounded-full text-xs font-medium",
                            "bg-[var(--primary)] text-white"
                          )}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[ticket.category]}
                      </Badge>
                      <span>•</span>
                      <span
                        className={cn(
                          "capitalize",
                          statusStyle.text
                        )}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {lastMessage && (
                      <p className="text-sm text-[var(--foreground-secondary)] mt-1 truncate">
                        {lastMessage.isFromAdmin ? "Support: " : "You: "}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRightIcon
                    className={cn(
                      "flex-shrink-0 w-5 h-5",
                      "text-[var(--foreground-muted)]",
                      "group-hover:text-[var(--foreground)]",
                      "transition-colors"
                    )}
                  />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
