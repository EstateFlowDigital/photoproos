"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { markFeedbackAsRead, markFeedbackAsResolved, deleteFeedback, markAllFeedbackAsRead } from "@/lib/actions/gallery-feedback";

interface FeedbackItem {
  id: string;
  projectId: string;
  projectName: string;
  type: string;
  message: string;
  clientName: string | null;
  clientEmail: string | null;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
}

interface FeedbackCounts {
  all: number;
  unread: number;
  resolved: number;
  byType: Record<string, number>;
}

interface FeedbackInboxClientProps {
  feedback: FeedbackItem[];
  counts: FeedbackCounts;
  currentFilter: "all" | "unread" | "resolved";
  currentType?: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  feedback: { label: "Feedback", color: "var(--primary)", bgColor: "var(--primary-muted, rgba(59, 130, 246, 0.1))" },
  feature: { label: "Feature Request", color: "var(--ai)", bgColor: "var(--ai-muted, rgba(139, 92, 246, 0.1))" },
  issue: { label: "Issue", color: "var(--error)", bgColor: "var(--error-muted, rgba(239, 68, 68, 0.1))" },
};

export function FeedbackInboxClient({
  feedback,
  counts,
  currentFilter,
  currentType,
}: FeedbackInboxClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string) => {
    setSelectedId(id);
    const result = await markFeedbackAsRead(id);
    if (result.success) {
      router.refresh();
    }
    setSelectedId(null);
  };

  const handleMarkAsResolved = async (id: string) => {
    setSelectedId(id);
    const result = await markFeedbackAsResolved(id);
    if (result.success) {
      router.refresh();
    }
    setSelectedId(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete feedback",
      description: "Are you sure you want to delete this feedback? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;
    setSelectedId(id);
    const result = await deleteFeedback(id);
    if (result.success) {
      router.refresh();
    }
    setSelectedId(null);
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      await markAllFeedbackAsRead();
      router.refresh();
    });
  };

  const filterTabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "unread", label: "Unread", count: counts.unread },
    { id: "resolved", label: "Resolved", count: counts.resolved },
  ];

  const typeFilters = Object.entries(counts.byType).map(([type, count]) => ({
    type,
    label: TYPE_LABELS[type]?.label || type,
    count,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Feedback</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Feedback and requests from gallery clients
          </p>
        </div>
        {counts.unread > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="rounded-lg bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-card-hover transition-colors border border-border disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        {filterTabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/feedback${tab.id !== "all" ? `?filter=${tab.id}` : ""}${currentType ? `${tab.id !== "all" ? "&" : "?"}type=${currentType}` : ""}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              currentFilter === tab.id
                ? "bg-primary text-white"
                : "bg-card text-foreground-muted hover:bg-card-hover hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                currentFilter === tab.id
                  ? "bg-white/20"
                  : "bg-background-tertiary"
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}

        {/* Type filters */}
        {typeFilters.length > 1 && (
          <>
            <div className="h-4 w-px bg-border mx-2" />
            {typeFilters.map((filter) => (
              <Link
                key={filter.type}
                href={`/feedback?${currentFilter !== "all" ? `filter=${currentFilter}&` : ""}${currentType === filter.type ? "" : `type=${filter.type}`}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  currentType === filter.type
                    ? "ring-2 ring-primary"
                    : ""
                )}
                style={{
                  backgroundColor: TYPE_LABELS[filter.type]?.bgColor || "var(--card)",
                  color: TYPE_LABELS[filter.type]?.color || "var(--foreground)",
                }}
              >
                {filter.label}
                <span className="opacity-70">{filter.count}</span>
              </Link>
            ))}
          </>
        )}
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-card p-4 mb-4">
            <svg className="h-8 w-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">No feedback yet</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            {currentFilter === "unread"
              ? "All caught up! No unread feedback."
              : currentFilter === "resolved"
                ? "No resolved feedback items."
                : "Feedback from gallery clients will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => {
            const typeInfo = TYPE_LABELS[item.type] || { label: item.type, color: "var(--foreground)", bgColor: "var(--card)" };
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border transition-all",
                  item.isRead ? "bg-card border-border" : "bg-card border-primary/30",
                  !item.isRead && "ring-1 ring-primary/20"
                )}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : item.id);
                    if (!item.isRead) handleMarkAsRead(item.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: typeInfo.bgColor, color: typeInfo.color }}
                        >
                          {typeInfo.label}
                        </span>
                        <Link
                          href={`/galleries/${item.projectId}`}
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.projectName}
                        </Link>
                        {item.isResolved && (
                          <span className="inline-flex items-center gap-1 text-xs text-success">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className={cn("mt-2 text-sm", isExpanded ? "" : "line-clamp-2")}>
                        {item.message}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-foreground-muted">
                        <span>{item.clientName || "Anonymous"}</span>
                        {item.clientEmail && (
                          <>
                            <span>•</span>
                            <a
                              href={`mailto:${item.clientEmail}`}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.clientEmail}
                            </a>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <svg
                      className={cn(
                        "h-5 w-5 text-foreground-muted transition-transform flex-shrink-0",
                        isExpanded && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Actions */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 flex items-center gap-2">
                    {!item.isResolved && (
                      <button
                        onClick={() => handleMarkAsResolved(item.id)}
                        disabled={selectedId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-sm font-medium text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Mark Resolved
                      </button>
                    )}
                    {item.clientEmail && (
                      <a
                        href={`mailto:${item.clientEmail}?subject=Re: Your feedback on ${item.projectName}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Reply
                      </a>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={selectedId === item.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-error/10 px-3 py-1.5 text-sm font-medium text-error hover:bg-error/20 transition-colors disabled:opacity-50"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
