"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  getGalleryAddonRequestsAdmin,
  sendAddonQuote,
  startAddonRequest,
  completeAddonRequest,
  cancelAddonRequest,
} from "@/lib/actions/gallery-addons";
import type { GalleryAddonRequestStatus } from "@prisma/client";

interface AddonRequest {
  id: string;
  status: GalleryAddonRequestStatus;
  notes: string | null;
  selectedPhotos: string[];
  quoteCents: number | null;
  quoteDescription: string | null;
  quotedAt: Date | null;
  approvedAt: Date | null;
  declinedAt: Date | null;
  completedAt: Date | null;
  deliveryNote: string | null;
  createdAt: Date;
  clientEmail: string | null;
  addon: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number | null;
    category: string;
  };
  client: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
  } | null;
}

interface AddonRequestsPanelProps {
  galleryId: string;
  photos?: Array<{
    id: string;
    thumbnailUrl?: string | null;
    filename: string;
  }>;
}

const STATUS_CONFIG: Record<
  GalleryAddonRequestStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Pending",
    color: "text-[var(--warning)]",
    bgColor: "bg-[var(--warning)]/10",
  },
  quoted: {
    label: "Quote Sent",
    color: "text-[var(--primary)]",
    bgColor: "bg-[var(--primary)]/10",
  },
  approved: {
    label: "Approved",
    color: "text-[var(--success)]",
    bgColor: "bg-[var(--success)]/10",
  },
  in_progress: {
    label: "In Progress",
    color: "text-[var(--ai)]",
    bgColor: "bg-[var(--ai)]/10",
  },
  completed: {
    label: "Completed",
    color: "text-[var(--success)]",
    bgColor: "bg-[var(--success)]/10",
  },
  declined: {
    label: "Declined",
    color: "text-[var(--error)]",
    bgColor: "bg-[var(--error)]/10",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-[var(--foreground-muted)]",
    bgColor: "bg-[var(--background-tertiary)]",
  },
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface TimelineEvent {
  label: string;
  date: Date | string | null;
  status: "completed" | "current" | "upcoming";
  color: string;
}

function RequestTimeline({ request }: { request: AddonRequest }) {
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Request created - always present
    events.push({
      label: "Request Submitted",
      date: request.createdAt,
      status: "completed",
      color: "var(--primary)",
    });

    // Quoted
    if (request.quotedAt || ["quoted", "approved", "in_progress", "completed"].includes(request.status)) {
      events.push({
        label: "Quote Sent",
        date: request.quotedAt,
        status: request.quotedAt ? "completed" : request.status === "pending" ? "upcoming" : "current",
        color: "var(--primary)",
      });
    }

    // Approved/Declined
    if (request.approvedAt || ["approved", "in_progress", "completed"].includes(request.status)) {
      events.push({
        label: "Approved",
        date: request.approvedAt,
        status: request.approvedAt ? "completed" : request.status === "quoted" ? "upcoming" : "current",
        color: "var(--success)",
      });
    } else if (request.declinedAt || request.status === "declined") {
      events.push({
        label: "Declined",
        date: request.declinedAt,
        status: request.declinedAt ? "completed" : "current",
        color: "var(--error)",
      });
    }

    // In Progress
    if (["in_progress", "completed"].includes(request.status)) {
      events.push({
        label: "Work Started",
        date: request.approvedAt, // Use approvedAt as proxy since we don't have startedAt
        status: request.status === "in_progress" ? "current" : "completed",
        color: "var(--ai)",
      });
    }

    // Completed
    if (request.completedAt || request.status === "completed") {
      events.push({
        label: "Completed",
        date: request.completedAt,
        status: request.completedAt ? "completed" : "upcoming",
        color: "var(--success)",
      });
    }

    // Cancelled
    if (request.status === "cancelled") {
      events.push({
        label: "Cancelled",
        date: null,
        status: "completed",
        color: "var(--foreground-muted)",
      });
    }

    return events;
  };

  const events = getTimelineEvents();

  return (
    <div className="relative">
      <p className="text-xs font-medium text-foreground-muted mb-3">Timeline</p>
      <div className="relative pl-4">
        {/* Vertical line */}
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[var(--card-border)]" />

        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="relative flex items-start gap-3">
              {/* Dot */}
              <div
                className={cn(
                  "absolute -left-4 mt-1.5 h-2.5 w-2.5 rounded-full border-2 transition-all",
                  event.status === "completed"
                    ? "border-transparent"
                    : event.status === "current"
                    ? "border-transparent animate-pulse"
                    : "border-[var(--card-border)] bg-[var(--background)]"
                )}
                style={{
                  backgroundColor: event.status !== "upcoming" ? event.color : undefined,
                }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    event.status === "upcoming"
                      ? "text-foreground-muted"
                      : "text-foreground"
                  )}
                >
                  {event.label}
                </p>
                {event.date && (
                  <p className="text-xs text-foreground-muted">
                    {formatDateTime(event.date)}
                  </p>
                )}
              </div>

              {/* Status indicator for current step */}
              {event.status === "current" && (
                <span
                  className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${event.color} 15%, transparent)`,
                    color: event.color,
                  }}
                >
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type StatusFilter = "all" | "active" | "completed";

const STATUS_FILTERS: { value: StatusFilter; label: string; statuses: GalleryAddonRequestStatus[] }[] = [
  { value: "all", label: "All", statuses: [] },
  { value: "active", label: "Active", statuses: ["pending", "quoted", "approved", "in_progress"] },
  { value: "completed", label: "Completed", statuses: ["completed", "declined", "cancelled"] },
];

export function AddonRequestsPanel({ galleryId, photos = [] }: AddonRequestsPanelProps) {
  const [requests, setRequests] = useState<AddonRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<string>("");
  const [quoteDescription, setQuoteDescription] = useState<string>("");
  const [deliveryNote, setDeliveryNote] = useState<string>("");
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Filter requests based on selected status
  const filteredRequests = requests.filter((r) => {
    if (statusFilter === "all") return true;
    const filter = STATUS_FILTERS.find((f) => f.value === statusFilter);
    return filter?.statuses.includes(r.status) ?? true;
  });

  // Count requests by filter category
  const counts = {
    all: requests.length,
    active: requests.filter((r) => ["pending", "quoted", "approved", "in_progress"].includes(r.status)).length,
    completed: requests.filter((r) => ["completed", "declined", "cancelled"].includes(r.status)).length,
  };

  useEffect(() => {
    loadRequests();
  }, [galleryId]);

  async function loadRequests() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getGalleryAddonRequestsAdmin(galleryId);
      if (result.success && result.data) {
        setRequests(result.data.requests as AddonRequest[]);
      } else if (!result.success) {
        setError(result.error || "Failed to load requests");
      }
    } catch {
      setError("Failed to load add-on requests");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendQuote(requestId: string) {
    if (!quoteAmount) return;

    setIsSendingQuote(true);
    try {
      const cents = Math.round(parseFloat(quoteAmount) * 100);
      const result = await sendAddonQuote(requestId, cents, quoteDescription || undefined);
      if (result.success) {
        await loadRequests();
        setExpandedRequest(null);
        setQuoteAmount("");
        setQuoteDescription("");
      }
    } finally {
      setIsSendingQuote(false);
    }
  }

  async function handleStartWork(requestId: string) {
    setIsUpdating(requestId);
    try {
      const result = await startAddonRequest(requestId);
      if (result.success) {
        await loadRequests();
      }
    } finally {
      setIsUpdating(null);
    }
  }

  async function handleComplete(requestId: string) {
    setIsUpdating(requestId);
    try {
      const result = await completeAddonRequest(requestId, deliveryNote || undefined);
      if (result.success) {
        await loadRequests();
        setExpandedRequest(null);
        setDeliveryNote("");
      }
    } finally {
      setIsUpdating(null);
    }
  }

  async function handleCancel(requestId: string) {
    if (!confirm("Are you sure you want to cancel this request?")) return;

    setIsUpdating(requestId);
    try {
      const result = await cancelAddonRequest(requestId);
      if (result.success) {
        await loadRequests();
      }
    } finally {
      setIsUpdating(null);
    }
  }

  function getPhotoThumbnail(photoId: string): string | null {
    const photo = photos.find((p) => p.id === photoId);
    return photo?.thumbnailUrl || null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6 text-center">
        <p className="text-sm text-[var(--error)]">{error}</p>
        <button
          onClick={loadRequests}
          className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary)]">
          <svg
            className="h-6 w-6 text-[var(--foreground-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-foreground">No add-on requests yet</h3>
        <p className="mt-1 text-xs text-foreground-muted">
          Clients can request add-on services from their gallery view
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === filter.value
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-tertiary)] text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)]"
            )}
          >
            {filter.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                statusFilter === filter.value
                  ? "bg-white/20"
                  : "bg-[var(--background)]"
              )}
            >
              {counts[filter.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state for filtered results */}
      {filteredRequests.length === 0 && requests.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
          <p className="text-sm text-foreground-muted">
            No {statusFilter === "active" ? "active" : statusFilter === "completed" ? "completed" : ""} requests
          </p>
        </div>
      )}

      {filteredRequests.map((request) => {
        const statusConfig = STATUS_CONFIG[request.status];
        const isExpanded = expandedRequest === request.id;
        const isCurrentlyUpdating = isUpdating === request.id;

        return (
          <div
            key={request.id}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-start justify-between gap-4 flex-wrap p-4 cursor-pointer hover:bg-[var(--background-hover)] transition-colors"
              onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {request.addon.name}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {request.client?.fullName || request.clientEmail || "Unknown client"}
                    {" • "}
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {request.quoteCents && (
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(request.quoteCents)}
                  </span>
                )}
                <svg
                  className={cn(
                    "h-5 w-5 text-foreground-muted transition-transform",
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

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-[var(--card-border)] p-4 space-y-4 bg-[var(--background)]">
                {/* Request Timeline */}
                <RequestTimeline request={request} />

                {/* Client Notes */}
                {request.notes && (
                  <div>
                    <p className="text-xs font-medium text-foreground-muted mb-1">Client Notes</p>
                    <p className="text-sm text-foreground bg-[var(--card)] rounded-lg p-3 border border-[var(--card-border)]">
                      {request.notes}
                    </p>
                  </div>
                )}

                {/* Selected Photos */}
                {request.selectedPhotos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground-muted mb-2">
                      Selected Photos ({request.selectedPhotos.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {request.selectedPhotos.map((photoId) => {
                        const thumbnail = getPhotoThumbnail(photoId);
                        return (
                          <button
                            key={photoId}
                            onClick={() => thumbnail && setLightboxPhoto(thumbnail)}
                            className="relative h-16 w-16 rounded-lg overflow-hidden bg-[var(--background-tertiary)] hover:ring-2 hover:ring-[var(--primary)] transition-all"
                          >
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt="Requested photo"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-foreground-muted">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quote Info */}
                {request.quoteCents && request.quoteDescription && (
                  <div>
                    <p className="text-xs font-medium text-foreground-muted mb-1">Quote Details</p>
                    <p className="text-sm text-foreground">{request.quoteDescription}</p>
                  </div>
                )}

                {/* Delivery Note */}
                {request.deliveryNote && (
                  <div>
                    <p className="text-xs font-medium text-foreground-muted mb-1">Delivery Note</p>
                    <p className="text-sm text-foreground bg-[var(--success)]/5 rounded-lg p-3 border border-[var(--success)]/20">
                      {request.deliveryNote}
                    </p>
                  </div>
                )}

                {/* Actions based on status */}
                {request.status === "pending" && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-medium text-foreground-muted">Send Quote</p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Amount ($)"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        />
                      </div>
                    </div>
                    <textarea
                      placeholder="Quote description (optional)"
                      value={quoteDescription}
                      onChange={(e) => setQuoteDescription(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendQuote(request.id)}
                        disabled={!quoteAmount || isSendingQuote}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingQuote ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                        Send Quote
                      </button>
                      <button
                        onClick={() => handleStartWork(request.id)}
                        disabled={isCurrentlyUpdating}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start Without Quote
                      </button>
                    </div>
                  </div>
                )}

                {request.status === "approved" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleStartWork(request.id)}
                      disabled={isCurrentlyUpdating}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ai)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ai)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCurrentlyUpdating ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      Start Work
                    </button>
                  </div>
                )}

                {request.status === "in_progress" && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-medium text-foreground-muted">Complete Request</p>
                    <textarea
                      placeholder="Delivery note (optional) - e.g., 'Photos have been added to the gallery'"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                    />
                    <button
                      onClick={() => handleComplete(request.id)}
                      disabled={isCurrentlyUpdating}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCurrentlyUpdating ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      Mark Complete
                    </button>
                  </div>
                )}

                {/* Cancel button for non-terminal states */}
                {["pending", "quoted", "approved", "in_progress"].includes(request.status) && (
                  <div className="pt-2 border-t border-[var(--card-border)]">
                    <button
                      onClick={() => handleCancel(request.id)}
                      disabled={isCurrentlyUpdating}
                      className="text-xs text-[var(--error)] hover:underline disabled:opacity-50"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Simple photo lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:text-white/80 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxPhoto}
            alt="Selected photo"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
