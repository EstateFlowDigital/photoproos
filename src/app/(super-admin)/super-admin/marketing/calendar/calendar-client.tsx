"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MarketingPage } from "@prisma/client";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarClock,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  Eye,
  Edit3,
} from "lucide-react";

interface CalendarSummary {
  scheduled: {
    date: string;
    count: number;
    pages: { slug: string; title: string }[];
  }[];
  drafts: {
    slug: string;
    title: string;
    lastEditedAt: Date | null;
  }[];
  published: {
    date: string;
    count: number;
  }[];
}

interface ContentCalendarClientProps {
  initialMonth: Date;
  calendarSummary: CalendarSummary;
  scheduledPages: MarketingPage[];
  draftPages: MarketingPage[];
}

// Get days in month
function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  // Add all days in the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to fill the last week
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }

  return days;
}

// Format date key for lookup
function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Format relative time
function formatRelativeTime(date: Date | null): string {
  if (!date) return "Unknown";
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// Day cell component
function DayCell({
  date,
  isCurrentMonth,
  isToday,
  scheduledCount,
  publishedCount,
  scheduledPages,
}: {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  scheduledCount: number;
  publishedCount: number;
  scheduledPages: { slug: string; title: string }[];
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hasContent = scheduledCount > 0 || publishedCount > 0;

  return (
    <div
      className={cn(
        "min-h-[100px] p-2 border-b border-r border-[var(--border)]",
        isCurrentMonth
          ? "bg-[var(--card)]"
          : "bg-[var(--background-tertiary)]/50",
        isToday && "ring-2 ring-inset ring-[var(--primary)]"
      )}
      onMouseEnter={() => hasContent && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Date number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm font-medium",
            isCurrentMonth
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground-muted)]",
            isToday && "text-[var(--primary)]"
          )}
        >
          {date.getDate()}
        </span>
        {isToday && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] font-medium">
            Today
          </span>
        )}
      </div>

      {/* Content indicators */}
      <div className="space-y-1">
        {scheduledCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
            <CalendarClock className="w-3 h-3" aria-hidden="true" />
            <span className="text-xs font-medium">
              {scheduledCount} scheduled
            </span>
          </div>
        )}
        {publishedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500">
            <FileText className="w-3 h-3" aria-hidden="true" />
            <span className="text-xs font-medium">
              {publishedCount} published
            </span>
          </div>
        )}
      </div>

      {/* Tooltip with page list */}
      {showTooltip && scheduledPages.length > 0 && (
        <div className="absolute z-50 mt-1 p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl min-w-[200px]">
          <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2">
            Scheduled Pages
          </p>
          <ul className="space-y-1">
            {scheduledPages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/super-admin/marketing/${page.slug}`}
                  className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ContentCalendarClient({
  initialMonth,
  calendarSummary,
  scheduledPages,
  draftPages,
}: ContentCalendarClientProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [view, setView] = useState<"month" | "week">("month");

  // Build lookup maps
  const scheduledByDate = useMemo(() => {
    const map = new Map<
      string,
      { count: number; pages: { slug: string; title: string }[] }
    >();
    calendarSummary.scheduled.forEach((item) => {
      map.set(item.date, { count: item.count, pages: item.pages });
    });
    return map;
  }, [calendarSummary.scheduled]);

  const publishedByDate = useMemo(() => {
    const map = new Map<string, number>();
    calendarSummary.published.forEach((item) => {
      map.set(item.date, item.count);
    });
    return map;
  }, [calendarSummary.published]);

  // Get days for current month view
  const days = useMemo(() => {
    return getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get month name
  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Check if a date is today
  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  // Get upcoming scheduled pages
  const upcomingScheduled = useMemo(() => {
    return scheduledPages
      .filter((page) => page.scheduledPublishAt)
      .sort(
        (a, b) =>
          new Date(a.scheduledPublishAt!).getTime() -
          new Date(b.scheduledPublishAt!).getTime()
      )
      .slice(0, 5);
  }, [scheduledPages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Content Calendar
          </h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            View and manage scheduled content
          </p>
        </div>
        <Link
          href="/super-admin/marketing/pages"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90 transition-colors",
            "text-sm font-medium"
          )}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Page
        </Link>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft
                    className="w-5 h-5 text-[var(--foreground-muted)]"
                    aria-hidden="true"
                  />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight
                    className="w-5 h-5 text-[var(--foreground-muted)]"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {monthName}
              </h2>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] rounded-lg transition-colors"
              >
                Today
              </button>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 bg-[var(--background)] rounded-lg">
              <button
                onClick={() => setView("month")}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded transition-colors",
                  view === "month"
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded transition-colors",
                  view === "week"
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                Week
              </button>
            </div>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dateKey = formatDateKey(date);
              const scheduled = scheduledByDate.get(dateKey) || {
                count: 0,
                pages: [],
              };
              const publishedCount = publishedByDate.get(dateKey) || 0;

              return (
                <DayCell
                  key={index}
                  date={date}
                  isCurrentMonth={date.getMonth() === currentMonth.getMonth()}
                  isToday={isToday(date)}
                  scheduledCount={scheduled.count}
                  publishedCount={publishedCount}
                  scheduledPages={scheduled.pages}
                />
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Scheduled */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <CalendarClock
                  className="w-4 h-4 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <h3 className="font-semibold text-[var(--foreground)]">
                  Upcoming Scheduled
                </h3>
              </div>
            </div>
            <div className="p-2">
              {upcomingScheduled.length === 0 ? (
                <p className="px-2 py-4 text-sm text-[var(--foreground-muted)] text-center">
                  No scheduled content
                </p>
              ) : (
                <ul className="space-y-1">
                  {upcomingScheduled.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={`/super-admin/marketing/${page.slug}`}
                        className={cn(
                          "block px-3 py-2 rounded-lg transition-colors",
                          "hover:bg-[var(--background-elevated)]"
                        )}
                      >
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {page.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock
                            className="w-3 h-3 text-[var(--foreground-muted)]"
                            aria-hidden="true"
                          />
                          <span className="text-xs text-[var(--foreground-muted)]">
                            {page.scheduledPublishAt
                              ? new Date(
                                  page.scheduledPublishAt
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "Unknown"}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Drafts */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText
                    className="w-4 h-4 text-yellow-500"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-[var(--foreground)]">
                    Drafts
                  </h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
                  {draftPages.length}
                </span>
              </div>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {draftPages.length === 0 ? (
                <p className="px-2 py-4 text-sm text-[var(--foreground-muted)] text-center">
                  No drafts
                </p>
              ) : (
                <ul className="space-y-1">
                  {draftPages.slice(0, 10).map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={`/super-admin/marketing/${page.slug}`}
                        className={cn(
                          "block px-3 py-2 rounded-lg transition-colors",
                          "hover:bg-[var(--background-elevated)]",
                          "group"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate flex-1">
                            {page.title}
                          </p>
                          <Edit3
                            className="w-3.5 h-3.5 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                          Edited{" "}
                          {formatRelativeTime(page.lastEditedAt || page.updatedAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {draftPages.length > 10 && (
                <div className="px-3 py-2 border-t border-[var(--border)] mt-2">
                  <Link
                    href="/super-admin/marketing/pages?status=draft"
                    className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                  >
                    View all drafts
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground-secondary)]">
                  Scheduled
                </span>
                <span className="font-medium text-[var(--primary)]">
                  {scheduledPages.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground-secondary)]">
                  Drafts
                </span>
                <span className="font-medium text-yellow-500">
                  {draftPages.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground-secondary)]">
                  This month
                </span>
                <span className="font-medium text-green-500">
                  {calendarSummary.published.reduce(
                    (acc, curr) => acc + curr.count,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
