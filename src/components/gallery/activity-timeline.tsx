"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Eye,
  Download,
  Heart,
  CreditCard,
  Send,
  Image as ImageIcon,
  Package,
  Clock,
  RefreshCw,
  ChevronDown,
  Star,
  Sparkles,
} from "lucide-react";
import {
  getGalleryActivityTimeline,
  getGalleryActivitySummary,
  type ActivityTimelineEvent,
  type ActivityEventType,
} from "@/lib/actions/gallery-activity";

interface ActivityTimelineProps {
  galleryId: string;
  className?: string;
}

const eventIcons: Record<ActivityEventType, typeof Eye> = {
  gallery_created: Sparkles,
  gallery_delivered: Send,
  gallery_viewed: Eye,
  gallery_paid: CreditCard,
  photo_downloaded: ImageIcon,
  batch_downloaded: Package,
  photo_favorited: Heart,
  selection_submitted: Star,
  photo_rated: Star,
  comment_added: Sparkles,
};

const eventColors: Record<ActivityEventType, string> = {
  gallery_created: "text-purple-400 bg-purple-400/10",
  gallery_delivered: "text-blue-400 bg-blue-400/10",
  gallery_viewed: "text-green-400 bg-green-400/10",
  gallery_paid: "text-emerald-400 bg-emerald-400/10",
  photo_downloaded: "text-cyan-400 bg-cyan-400/10",
  batch_downloaded: "text-indigo-400 bg-indigo-400/10",
  photo_favorited: "text-rose-400 bg-rose-400/10",
  selection_submitted: "text-amber-400 bg-amber-400/10",
  photo_rated: "text-yellow-400 bg-yellow-400/10",
  comment_added: "text-violet-400 bg-violet-400/10",
};

export function ActivityTimeline({
  galleryId,
  className,
}: ActivityTimelineProps) {
  const [events, setEvents] = useState<ActivityTimelineEvent[]>([]);
  const [summary, setSummary] = useState<{
    views: number;
    downloads: number;
    favorites: number;
    revenue: number;
    uniqueClients: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchActivity = async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [timelineResult, summaryResult] = await Promise.all([
        getGalleryActivityTimeline(galleryId, {
          limit: 20,
          offset: loadMore ? offset : 0,
        }),
        !loadMore ? getGalleryActivitySummary(galleryId) : Promise.resolve(null),
      ]);

      if (timelineResult.success && timelineResult.data) {
        const newEvents = timelineResult.data.events.map((e) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
        if (loadMore) {
          setEvents((prev) => [...prev, ...newEvents]);
        } else {
          setEvents(newEvents);
        }
        setHasMore(timelineResult.data.hasMore);
        setOffset(loadMore ? offset + 20 : 20);
      }

      if (summaryResult?.success && summaryResult.data) {
        setSummary(summaryResult.data);
      }
    } catch (error) {
      console.error("[Activity Timeline] Error:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [galleryId]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Group events by date
  const groupedEvents = events.reduce(
    (groups, event) => {
      const dateKey = formatDate(event.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    },
    {} as Record<string, ActivityTimelineEvent[]>
  );

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6", className)}>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-[var(--foreground-muted)]" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
              <Eye className="h-4 w-4" />
              <span className="text-xs">Views</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {summary.views}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
              <Download className="h-4 w-4" />
              <span className="text-xs">Downloads</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {summary.downloads}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Favorites</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {summary.favorites}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Revenue</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              ${(summary.revenue / 100).toFixed(0)}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--background-elevated)]">
              <Clock className="h-4 w-4 text-[var(--foreground-muted)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--foreground)]">Activity Timeline</h3>
              <p className="text-xs text-[var(--foreground-muted)]">
                {events.length} events
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchActivity()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-elevated)] hover:text-[var(--foreground)]"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background-elevated)]">
              <Clock className="h-6 w-6 text-[var(--foreground-muted)]" />
            </div>
            <h4 className="mt-4 font-medium text-[var(--foreground)]">No activity yet</h4>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Client interactions will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date}>
                <div className="sticky top-0 z-10 bg-[var(--background-tertiary)] px-6 py-2">
                  <span className="text-xs font-medium text-[var(--foreground-muted)]">
                    {date}
                  </span>
                </div>
                <div className="space-y-1 px-4 py-2">
                  {dateEvents.map((event) => {
                    const Icon = eventIcons[event.type] || Clock;
                    const colorClass = eventColors[event.type] || "text-gray-400 bg-gray-400/10";

                    return (
                      <div
                        key={event.id}
                        className="group flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-[var(--background-elevated)]"
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            colorClass
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {event.title}
                          </p>
                          <p className="text-xs text-[var(--foreground-muted)] truncate">
                            {event.description}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="p-4">
                <button
                  onClick={() => fetchActivity(true)}
                  disabled={isLoadingMore}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--background-elevated)] hover:text-[var(--foreground)] disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
