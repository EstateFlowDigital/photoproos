"use client";

import { useState, useTransition, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TicketHistory } from "@/components/support/ticket-history";
import { SupportDialog } from "@/components/support/support-dialog";
import { getSupportTicket } from "@/lib/actions/support-tickets";
import type { SupportTicketStatus, SupportTicketCategory } from "@prisma/client";

// Icons
function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
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
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
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

interface SupportPageClientProps {
  initialTickets: SupportTicket[];
}

export function SupportPageClient({ initialTickets }: SupportPageClientProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  const refreshTickets = useCallback(() => {
    startRefresh(async () => {
      // Reload the page to get fresh data
      window.location.reload();
    });
  }, []);

  // Load full ticket details when needed
  const loadTicketDetails = useCallback(async (ticketId: string) => {
    const result = await getSupportTicket(ticketId);
    if (result.success && result.data) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                messages: result.data!.messages.map((m) => ({
                  id: m.id,
                  content: m.content,
                  isFromAdmin: m.isFromAdmin,
                  createdAt: m.createdAt,
                  readAt: m.readAt,
                })),
              }
            : t
        )
      );
    }
  }, []);

  // Transform tickets with lazy-loaded messages
  const ticketsWithMessages = tickets.map((ticket) => ({
    ...ticket,
    messages: ticket.messages || [],
  }));

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--foreground-muted)]">
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTickets}
            disabled={isRefreshing}
          >
            <RefreshIcon
              className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Ticket List */}
      <div
        className={cn(
          "rounded-lg border border-[var(--border)]",
          "bg-[var(--card)]",
          "overflow-hidden"
        )}
      >
        <TicketHistory tickets={ticketsWithMessages} onRefresh={refreshTickets} />
      </div>

      {/* Help Section */}
      <div
        className={cn(
          "rounded-lg border border-[var(--border)]",
          "bg-[var(--background-tertiary)]",
          "p-6"
        )}
      >
        <h3 className="font-medium text-[var(--foreground)] mb-2">
          Need help?
        </h3>
        <p className="text-sm text-[var(--foreground-muted)] mb-4">
          Our support team typically responds within 24 hours. For faster
          assistance, please include as much detail as possible in your message.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="mailto:support@listinglens.com"
            className="text-[var(--primary)] hover:underline"
          >
            support@listinglens.com
          </a>
          <span className="text-[var(--foreground-muted)]">•</span>
          <a
            href="/docs"
            className="text-[var(--primary)] hover:underline"
          >
            Documentation
          </a>
        </div>
      </div>

      {/* Dialog */}
      <SupportDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
