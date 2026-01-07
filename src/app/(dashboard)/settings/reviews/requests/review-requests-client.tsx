"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  Mail,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  MoreHorizontal,
  Send,
  RefreshCw,
  X,
} from "lucide-react";
import type { ReviewRequestStatus, ReviewRequestSource } from "@prisma/client";

interface ReviewRequest {
  id: string;
  token: string;
  status: ReviewRequestStatus;
  source: ReviewRequestSource;
  clientEmail: string | null;
  clientName: string | null;
  emailSentAt: Date | null;
  viewedAt: Date | null;
  createdAt: Date;
  project: {
    id: string;
    name: string;
  } | null;
  response: {
    rating: number;
    feedback: string | null;
    clickedPlatformLink: boolean;
    submittedAt: Date;
  } | null;
}

interface ReviewStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  averageRating: number;
  responseRate: number;
  platformClicks: number;
  ratingDistribution: { rating: number; count: number }[];
  recentResponses: {
    id: string;
    rating: number;
    feedback: string | null;
    submittedAt: Date;
    clientName: string | null;
    projectName: string | null;
  }[];
}

interface ReviewRequestsClientProps {
  initialRequests: ReviewRequest[];
  stats: ReviewStats | null;
}

const STATUS_CONFIG: Record<ReviewRequestStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-amber-500", icon: Clock },
  sent: { label: "Sent", color: "text-blue-500", icon: Mail },
  viewed: { label: "Viewed", color: "text-purple-500", icon: Eye },
  completed: { label: "Completed", color: "text-green-500", icon: CheckCircle },
  expired: { label: "Expired", color: "text-[var(--foreground-muted)]", icon: AlertCircle },
};

const SOURCE_LABELS: Record<ReviewRequestSource, string> = {
  manual: "Manual",
  delivery: "Delivery Email",
  followup: "Follow-up",
  chat: "Chat",
  gallery: "Gallery Prompt",
};

export function ReviewRequestsClient({ initialRequests, stats }: ReviewRequestsClientProps) {
  const [requests] = useState<ReviewRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewRequestStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<ReviewRequestSource | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesClient =
          request.clientName?.toLowerCase().includes(query) ||
          request.clientEmail?.toLowerCase().includes(query);
        const matchesProject = request.project?.name.toLowerCase().includes(query);
        if (!matchesClient && !matchesProject) return false;
      }

      // Status filter
      if (statusFilter !== "all" && request.status !== statusFilter) return false;

      // Source filter
      if (sourceFilter !== "all" && request.source !== sourceFilter) return false;

      return true;
    });
  }, [requests, searchQuery, statusFilter, sourceFilter]);

  // Group by date
  const groupedRequests = useMemo(() => {
    const groups: { [key: string]: ReviewRequest[] } = {};

    filteredRequests.forEach((request) => {
      const date = new Date(request.createdAt);
      const key = format(date, "yyyy-MM-dd");
      if (!groups[key]) groups[key] = [];
      groups[key].push(request);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        label: format(new Date(date), "MMMM d, yyyy"),
        requests: items,
      }));
  }, [filteredRequests]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-[var(--foreground-muted)]"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/reviews"
            className="flex items-center justify-center h-10 w-10 rounded-lg border border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--background-hover)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Review Requests</h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              View and manage all review requests and responses
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <div className="text-sm text-[var(--foreground-muted)]">Total Requests</div>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="text-2xl font-bold text-amber-500">{stats.pendingRequests}</div>
            <div className="text-sm text-[var(--foreground-muted)]">Pending</div>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="text-2xl font-bold text-green-500">{stats.completedRequests}</div>
            <div className="text-sm text-[var(--foreground-muted)]">Completed</div>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {stats.averageRating ? stats.averageRating.toFixed(1) : "-"}
              </div>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">Avg Rating</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search by client name, email, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
            showFilters || statusFilter !== "all" || sourceFilter !== "all"
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--background-hover)]"
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {(statusFilter !== "all" || sourceFilter !== "all") && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[var(--primary)] text-white text-xs">
              {(statusFilter !== "all" ? 1 : 0) + (sourceFilter !== "all" ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReviewRequestStatus | "all")}
              className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
              Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as ReviewRequestSource | "all")}
              className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">All Sources</option>
              <option value="manual">Manual</option>
              <option value="delivery">Delivery Email</option>
              <option value="followup">Follow-up</option>
              <option value="gallery">Gallery Prompt</option>
              <option value="chat">Chat</option>
            </select>
          </div>
          {(statusFilter !== "all" || sourceFilter !== "all") && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setSourceFilter("all");
              }}
              className="self-end px-3 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <MessageSquare className="mx-auto h-12 w-12 text-[var(--foreground-muted)] mb-4" />
          <h3 className="text-lg font-medium mb-2">No review requests found</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all" || sourceFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Review requests will appear here when clients are prompted for feedback"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedRequests.map((group) => (
            <div key={group.date}>
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.requests.map((request) => {
                  const statusConfig = STATUS_CONFIG[request.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)] transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(request)}
                    >
                      {/* Status Icon */}
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full bg-current/10 ${statusConfig.color}`}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {request.clientName || request.clientEmail || "Unknown Client"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.color} bg-current/10`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
                          {request.project && (
                            <span className="truncate">{request.project.name}</span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-tertiary)]">
                            {SOURCE_LABELS[request.source]}
                          </span>
                        </div>
                      </div>

                      {/* Rating (if completed) */}
                      {request.response && (
                        <div className="flex items-center gap-2">
                          {renderStars(request.response.rating)}
                          {request.response.feedback && (
                            <MessageSquare className="h-4 w-4 text-[var(--foreground-muted)]" />
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-sm text-[var(--foreground-muted)] hidden sm:block">
                        {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </div>

                      <ChevronDown className="h-5 w-5 text-[var(--foreground-muted)] -rotate-90" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
              <h3 className="font-semibold">Review Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Client Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[var(--foreground-muted)]">Client</h4>
                <div className="p-3 rounded-lg bg-[var(--background-tertiary)]">
                  <div className="font-medium">
                    {selectedRequest.clientName || "Unknown"}
                  </div>
                  {selectedRequest.clientEmail && (
                    <div className="text-sm text-[var(--foreground-muted)]">
                      {selectedRequest.clientEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Project */}
              {selectedRequest.project && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[var(--foreground-muted)]">Project</h4>
                  <Link
                    href={`/galleries/${selectedRequest.project.id}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <span>{selectedRequest.project.name}</span>
                    <ExternalLink className="h-4 w-4 text-[var(--foreground-muted)]" />
                  </Link>
                </div>
              )}

              {/* Status & Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[var(--foreground-muted)]">Status</h4>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${STATUS_CONFIG[selectedRequest.status].color} bg-current/10`}
                  >
                    {(() => {
                      const Icon = STATUS_CONFIG[selectedRequest.status].icon;
                      return <Icon className="h-4 w-4" />;
                    })()}
                    <span className="text-sm font-medium">
                      {STATUS_CONFIG[selectedRequest.status].label}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[var(--foreground-muted)]">Source</h4>
                  <div className="text-sm px-3 py-1.5 rounded-full bg-[var(--background-tertiary)] inline-block">
                    {SOURCE_LABELS[selectedRequest.source]}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[var(--foreground-muted)]">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">Created</span>
                    <span>{format(new Date(selectedRequest.createdAt), "MMM d, yyyy h:mm a")}</span>
                  </div>
                  {selectedRequest.emailSentAt && (
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground-muted)]">Email Sent</span>
                      <span>
                        {format(new Date(selectedRequest.emailSentAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Response (if completed) */}
              {selectedRequest.response && (
                <div className="space-y-3 pt-4 border-t border-[var(--card-border)]">
                  <h4 className="text-sm font-medium text-[var(--foreground-muted)]">Response</h4>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    {renderStars(selectedRequest.response.rating)}
                    <span className="text-lg font-bold">
                      {selectedRequest.response.rating}/5
                    </span>
                    {selectedRequest.response.rating >= 4 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                        High Rating
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                        Needs Attention
                      </span>
                    )}
                  </div>

                  {/* Feedback */}
                  {selectedRequest.response.feedback && (
                    <div className="p-3 rounded-lg bg-[var(--background-tertiary)]">
                      <div className="text-xs font-medium text-[var(--foreground-muted)] mb-1">
                        Feedback
                      </div>
                      <p className="text-sm">{selectedRequest.response.feedback}</p>
                    </div>
                  )}

                  {/* Platform Click */}
                  {selectedRequest.response.clickedPlatformLink && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Clicked through to review platform
                      </span>
                    </div>
                  )}

                  {/* Submitted At */}
                  <div className="text-xs text-[var(--foreground-muted)]">
                    Submitted {format(new Date(selectedRequest.response.submittedAt), "MMM d, yyyy h:mm a")}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--card-border)]">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--background-hover)] transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === "pending" && (
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-lg hover:opacity-90 transition-opacity">
                  <Send className="h-4 w-4" />
                  Send Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
