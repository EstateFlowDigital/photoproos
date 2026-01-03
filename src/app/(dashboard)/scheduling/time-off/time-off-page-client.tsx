"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  PageContextNav,
  GoogleIcon,
  ContextCalendarIcon,
  ContextClockIcon,
  TagIcon,
} from "@/components/dashboard";
import {
  submitTimeOffRequest,
  approveTimeOffRequest,
  rejectTimeOffRequest,
  cancelTimeOffRequest,
} from "@/lib/actions/availability";
import type { TimeOffRequestStatus, AvailabilityBlockType } from "@prisma/client";

interface TimeOffRequest {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  requestStatus: TimeOffRequestStatus;
  blockType: AvailabilityBlockType;
  userId: string | null;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
}

interface TimeOffPageClientProps {
  pendingRequests: TimeOffRequest[];
  allRequests: TimeOffRequest[];
  currentUserId: string;
}

type TabType = "my-requests" | "pending-approval" | "all-requests";

export function TimeOffPageClient({
  pendingRequests,
  allRequests,
  currentUserId,
}: TimeOffPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>("my-requests");
  const [showRequestModal, setShowRequestModal] = useState(false);

  const myRequests = allRequests.filter((r) => r.userId === currentUserId);

  const handleApprove = async (id: string) => {
    startTransition(async () => {
      const result = await approveTimeOffRequest(id);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleReject = async (id: string) => {
    startTransition(async () => {
      const result = await rejectTimeOffRequest(id);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleCancel = async (id: string) => {
    startTransition(async () => {
      const result = await cancelTimeOffRequest(id);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const formatDateRange = (start: Date, end: Date, allDay: boolean) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameDay = startDate.toDateString() === endDate.toDateString();

    if (sameDay && allDay) {
      return startDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    if (sameDay) {
      return `${startDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })} ${formatTime(startDate)} - ${formatTime(endDate)}`;
    }

    return `${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const getStatusBadge = (status: TimeOffRequestStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning)]/15 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--error)]/15 px-2 py-0.5 text-xs font-medium text-[var(--error)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--error)]" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Off"
        subtitle="Submit and manage time-off requests"
        actions={
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            <PlusIcon className="h-4 w-4" />
            Request Time Off
          </button>
        }
      />

      <PageContextNav
        items={[
          { label: "Calendar", href: "/scheduling", icon: <ContextCalendarIcon className="h-4 w-4" /> },
          { label: "Availability", href: "/scheduling/availability", icon: <ContextClockIcon className="h-4 w-4" /> },
          { label: "Time Off", href: "/scheduling/time-off", icon: <TimeOffIcon className="h-4 w-4" /> },
          { label: "Booking Types", href: "/scheduling/types", icon: <TagIcon className="h-4 w-4" /> },
        ]}
        integrations={[
          {
            label: "Google Calendar",
            href: "/settings/integrations",
            icon: <GoogleIcon className="h-4 w-4" />,
          },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg bg-[var(--background-tertiary)] p-1 w-fit">
        <button
          onClick={() => setActiveTab("my-requests")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "my-requests"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          My Requests
          {myRequests.filter((r) => r.requestStatus === "pending").length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--warning)] px-1.5 text-xs font-medium text-white">
              {myRequests.filter((r) => r.requestStatus === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("pending-approval")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "pending-approval"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Pending Approval
          {pendingRequests.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-medium text-white">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all-requests")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "all-requests"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          All Requests
        </button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        {activeTab === "my-requests" && (
          <RequestsList
            requests={myRequests}
            showUser={false}
            showActions={true}
            currentUserId={currentUserId}
            onCancel={handleCancel}
            formatDateRange={formatDateRange}
            getStatusBadge={getStatusBadge}
            isPending={isPending}
            emptyTitle="No time-off requests"
            emptyDescription="You haven't submitted any time-off requests yet"
          />
        )}

        {activeTab === "pending-approval" && (
          <RequestsList
            requests={pendingRequests}
            showUser={true}
            showActions={true}
            currentUserId={currentUserId}
            onApprove={handleApprove}
            onReject={handleReject}
            formatDateRange={formatDateRange}
            getStatusBadge={getStatusBadge}
            isPending={isPending}
            emptyTitle="No pending requests"
            emptyDescription="All time-off requests have been processed"
          />
        )}

        {activeTab === "all-requests" && (
          <RequestsList
            requests={allRequests}
            showUser={true}
            showActions={false}
            currentUserId={currentUserId}
            formatDateRange={formatDateRange}
            getStatusBadge={getStatusBadge}
            isPending={isPending}
            emptyTitle="No time-off requests"
            emptyDescription="No time-off requests have been submitted yet"
          />
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <TimeOffRequestModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// Requests List Component
function RequestsList({
  requests,
  showUser,
  showActions,
  currentUserId,
  onCancel,
  onApprove,
  onReject,
  formatDateRange,
  getStatusBadge,
  isPending,
  emptyTitle,
  emptyDescription,
}: {
  requests: TimeOffRequest[];
  showUser: boolean;
  showActions: boolean;
  currentUserId: string;
  onCancel?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  formatDateRange: (start: Date, end: Date, allDay: boolean) => string;
  getStatusBadge: (status: TimeOffRequestStatus) => React.ReactNode;
  isPending: boolean;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-[var(--background-tertiary)] p-4">
          <CalendarIcon className="h-8 w-8 text-foreground-muted" />
        </div>
        <h3 className="text-lg font-medium text-foreground">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--card-border)]">
      {requests.map((request) => {
        const isOwn = request.userId === currentUserId;
        const canCancel = isOwn && request.requestStatus === "pending";
        const canApproveReject = !isOwn && request.requestStatus === "pending" && showActions;

        return (
          <div key={request.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {showUser && request.user && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/15 text-sm font-medium text-[var(--primary)]">
                  {(request.user.fullName || request.user.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{request.title}</span>
                  {getStatusBadge(request.requestStatus)}
                </div>
                {showUser && request.user && (
                  <p className="text-sm text-foreground-muted">
                    {request.user.fullName || request.user.email}
                  </p>
                )}
                <p className="text-sm text-foreground-muted">
                  {formatDateRange(request.startDate, request.endDate, request.allDay)}
                </p>
                {request.description && (
                  <p className="mt-1 text-sm text-foreground-muted">{request.description}</p>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {canApproveReject && onApprove && onReject && (
                  <>
                    <button
                      onClick={() => onApprove(request.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 rounded-lg bg-[var(--success)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(request.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--error)] px-3 py-1.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50"
                    >
                      <XIcon className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
                {canCancel && onCancel && (
                  <button
                    onClick={() => onCancel(request.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Time Off Request Modal
function TimeOffRequestModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a reason for your time off");
      return;
    }

    if (!startDate) {
      setError("Please select a start date");
      return;
    }

    if (!endDate) {
      setError("Please select an end date");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError("End date must be after start date");
      return;
    }

    startTransition(async () => {
      const result = await submitTimeOffRequest({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: start,
        endDate: end,
        allDay,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Request Time Off</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-foreground-muted hover:bg-[var(--background-hover)] transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-[var(--error)] bg-[var(--error)]/10 p-3 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Reason
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Vacation, Personal Day, Doctor's Appointment"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Add any additional details..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
            />
          </div>

          <div className="auto-grid grid-min-200 grid-gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <label htmlFor="allDay" className="text-sm text-foreground">
              All day
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function TimeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM5 3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 17a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM17.25 17a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM9 10a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1 0-1.5h5.5A.75.75 0 0 1 9 10ZM17.25 10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 16.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
