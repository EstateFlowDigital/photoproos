"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Building,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ChatRequestWithDetails } from "@/lib/actions/chat-requests";
import { approveChatRequest, rejectChatRequest } from "@/lib/actions/chat-requests";
import type { ChatRequestStatus } from "@prisma/client";

interface ChatRequestsPageClientProps {
  requests: ChatRequestWithDetails[];
  statusFilter?: ChatRequestStatus;
}

const STATUS_CONFIG: Record<
  ChatRequestStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-4 w-4" />,
    color: "text-[var(--warning)] bg-[var(--warning)]/10",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-[var(--success)] bg-[var(--success)]/10",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-4 w-4" />,
    color: "text-[var(--error)] bg-[var(--error)]/10",
  },
  expired: {
    label: "Expired",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-[var(--foreground-muted)] bg-[var(--background-tertiary)]",
  },
};

export function ChatRequestsPageClient({
  requests,
  statusFilter,
}: ChatRequestsPageClientProps) {
  const router = useRouter();

  // Count by status
  const statusCounts = requests.reduce(
    (acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    },
    {} as Record<ChatRequestStatus, number>
  );

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const otherRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <StatusTab
          status={undefined}
          label="All"
          count={requests.length}
          active={!statusFilter}
          onClick={() => router.push("/messages/requests")}
        />
        {(["pending", "approved", "rejected", "expired"] as const).map((status) => (
          <StatusTab
            key={status}
            status={status}
            label={STATUS_CONFIG[status].label}
            count={statusCounts[status] || 0}
            active={statusFilter === status}
            onClick={() => router.push(`/messages/requests?status=${status}`)}
          />
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <EmptyState statusFilter={statusFilter} />
      ) : (
        <div className="space-y-6">
          {/* Pending Section (Priority) */}
          {!statusFilter && pendingRequests.length > 0 && (
            <RequestSection
              title="Pending Approval"
              requests={pendingRequests}
              showActions
            />
          )}

          {/* Other Requests */}
          {statusFilter ? (
            <RequestSection
              title={`${STATUS_CONFIG[statusFilter].label} Requests`}
              requests={requests}
              showActions={statusFilter === "pending"}
            />
          ) : (
            otherRequests.length > 0 && (
              <RequestSection
                title="History"
                requests={otherRequests}
                showActions={false}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function StatusTab({
  status,
  label,
  count,
  active,
  onClick,
}: {
  status?: ChatRequestStatus;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const config = status ? STATUS_CONFIG[status] : null;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--primary)] text-white"
          : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--background-hover)]"
      }`}
    >
      {config?.icon}
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active
            ? "bg-white/20 text-white"
            : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function RequestSection({
  title,
  requests,
  showActions,
}: {
  title: string;
  requests: ChatRequestWithDetails[];
  showActions: boolean;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-[var(--foreground-muted)]">
        {title} ({requests.length})
      </h3>
      <div className="space-y-3">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} showActions={showActions} />
        ))}
      </div>
    </div>
  );
}

function RequestCard({
  request,
  showActions,
}: {
  request: ChatRequestWithDetails;
  showActions: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[request.status];

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveChatRequest(request.id);
      if (result.success) {
        router.push(`/messages/${result.data.conversationId}`);
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await rejectChatRequest(request.id);
      router.refresh();
    });
  };

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
      {/* Header */}
      <div
        className="flex items-start gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Client Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
          <User className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--foreground)]">
                  {request.client.fullName || request.client.email}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              {request.client.company && (
                <div className="flex items-center gap-1 mt-0.5 text-sm text-[var(--foreground-muted)]">
                  <Building className="h-3 w-3" />
                  {request.client.company}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-[var(--foreground-muted)]">
                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-[var(--foreground-muted)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--foreground-muted)]" />
              )}
            </div>
          </div>

          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {request.subject}
          </p>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-[var(--card-border)] p-4 bg-[var(--background-tertiary)]">
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">
              Message
            </label>
            <p className="mt-1 text-sm text-[var(--foreground)] whitespace-pre-wrap">
              {request.initialMessage}
            </p>
          </div>

          {request.status !== "pending" && (
            <div className="mb-4 text-sm text-[var(--foreground-muted)]">
              {request.respondedBy && (
                <span>
                  {request.status === "approved" ? "Approved" : "Rejected"} by{" "}
                  {request.respondedBy.fullName}{" "}
                  {request.respondedAt &&
                    formatDistanceToNow(new Date(request.respondedAt), {
                      addSuffix: true,
                    })}
                </span>
              )}
              {request.rejectionReason && (
                <p className="mt-1 text-[var(--error)]">
                  Reason: {request.rejectionReason}
                </p>
              )}
            </div>
          )}

          {showActions && (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject();
                }}
                disabled={isPending}
                className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove();
                }}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--success)]/90 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve & Open Chat
              </button>
            </div>
          )}

          {request.status === "approved" && request.conversationId && (
            <div className="flex justify-end">
              <a
                href={`/messages/${request.conversationId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Open Conversation
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ statusFilter }: { statusFilter?: ChatRequestStatus }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
        <MessageSquare className="h-8 w-8 text-[var(--primary)]" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">
        No {statusFilter ? `${STATUS_CONFIG[statusFilter].label.toLowerCase()} ` : ""}
        chat requests
      </h3>
      <p className="mt-2 text-center text-sm text-[var(--foreground-muted)] max-w-sm">
        {statusFilter === "pending"
          ? "All caught up! There are no pending chat requests to review."
          : "When clients request to chat with your team, their requests will appear here."}
      </p>
    </div>
  );
}
