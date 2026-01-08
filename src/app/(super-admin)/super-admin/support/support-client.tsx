"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import type { SupportTicketSummary } from "@/lib/actions/support-tickets";

// Icons
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

function CircleDotIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface SupportPageClientProps {
  tickets: SupportTicketSummary[];
  filters: {
    status?: string;
    priority?: string;
    category?: string;
  };
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  open: <CircleDotIcon className="w-4 h-4 text-[var(--warning)]" />,
  in_progress: <ClockIcon className="w-4 h-4 text-[var(--primary)]" />,
  resolved: <CheckCircleIcon className="w-4 h-4 text-[var(--success)]" />,
  closed: <XCircleIcon className="w-4 h-4 text-[var(--foreground-muted)]" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
  medium: "bg-[var(--primary)]/10 text-[var(--primary)]",
  high: "bg-[var(--warning)]/10 text-[var(--warning)]",
  urgent: "bg-[var(--error)]/10 text-[var(--error)]",
};

const CATEGORY_LABELS: Record<string, string> = {
  support_request: "Support",
  report_issue: "Issue",
  billing: "Billing",
  questions: "Question",
  feature_request: "Feature",
  other: "Other",
};

export function SupportPageClient({ tickets, filters }: SupportPageClientProps) {
  const router = useRouter();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams();
    if (key === "status" && value) params.set("status", value);
    else if (filters.status && key !== "status") params.set("status", filters.status);

    if (key === "priority" && value) params.set("priority", value);
    else if (filters.priority && key !== "priority") params.set("priority", filters.priority);

    if (key === "category" && value) params.set("category", value);
    else if (filters.category && key !== "category") params.set("category", filters.category);

    router.push(`/super-admin/support?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/super-admin/support");
  };

  const hasFilters = filters.status || filters.priority || filters.category;

  // Count stats
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const urgentCount = tickets.filter((t) => t.priority === "urgent").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="text-3xl font-bold text-[var(--foreground)]">
            {tickets.length}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            Total Tickets
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="text-3xl font-bold text-[var(--warning)]">
            {openCount}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">Open</div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="text-3xl font-bold text-[var(--primary)]">
            {inProgressCount}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            In Progress
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="text-3xl font-bold text-[var(--error)]">
            {urgentCount}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">Urgent</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => updateFilter("status", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority || "all"}
          onValueChange={(v) => updateFilter("priority", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category || "all"}
          onValueChange={(v) => updateFilter("category", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="support_request">Support Request</SelectItem>
            <SelectItem value="report_issue">Report Issue</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="questions">Questions</SelectItem>
            <SelectItem value="feature_request">Feature Request</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Tickets Table */}
      {tickets.length > 0 ? (
        <div
          className={cn(
            "rounded-xl overflow-hidden",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background-tertiary)]">
                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">
                  Subject
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">
                  Category
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">
                  Priority
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">
                  Messages
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0",
                    "hover:bg-[var(--background-tertiary)]",
                    "focus:bg-[var(--background-tertiary)] focus:outline-none",
                    "transition-colors cursor-pointer"
                  )}
                  onClick={() => router.push(`/super-admin/support/${ticket.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/super-admin/support/${ticket.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ticket: ${ticket.subject}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {STATUS_ICONS[ticket.status]}
                      <span className="text-sm text-[var(--foreground)] capitalize">
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--foreground)]">
                        {ticket.subject}
                      </span>
                      {ticket.unreadCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-[var(--primary)] text-white text-xs"
                        >
                          {ticket.unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[ticket.category] || ticket.category}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs capitalize", PRIORITY_COLORS[ticket.priority])}
                    >
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-[var(--foreground-muted)]">
                      {ticket.messageCount}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-[var(--foreground-muted)]">
                      {ticket.lastMessageAt
                        ? formatDistanceToNow(new Date(ticket.lastMessageAt), {
                            addSuffix: true,
                          })
                        : formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                          })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className={cn(
            "p-12 rounded-xl text-center",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <InboxIcon className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-muted)]" />
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            No tickets found
          </h3>
          <p className="text-[var(--foreground-muted)]">
            {hasFilters
              ? "Try adjusting your filters"
              : "All quiet on the support front"}
          </p>
        </div>
      )}
    </div>
  );
}
