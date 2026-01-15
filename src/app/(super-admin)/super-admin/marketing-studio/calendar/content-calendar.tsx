"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { PlatformId } from "@/components/marketing-studio/types";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  Columns,
  Grid3X3,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from "lucide-react";

// Custom TikTok icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.77 1.52 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5-4.88-3.41 0-5.41 2.55-5.41 5.2 0 1.02.39 2.13.89 2.73a.35.35 0 0 1 .08.34l-.33 1.35c-.05.22-.18.27-.41.16-1.53-.72-2.49-2.96-2.49-4.77 0-3.88 2.82-7.45 8.14-7.45 4.28 0 7.6 3.05 7.6 7.12 0 4.25-2.68 7.67-6.4 7.67-1.25 0-2.42-.65-2.82-1.42l-.77 2.93c-.28 1.07-1.03 2.42-1.54 3.24A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

const PLATFORM_NAMES: Record<PlatformId, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
  facebook: "Facebook",
  tiktok: "TikTok",
  pinterest: "Pinterest",
};

const PLATFORM_COLORS: Record<PlatformId, string> = {
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  tiktok: "#000000",
  pinterest: "#E60023",
};

type ViewType = "month" | "week" | "board" | "grid";
type PostStatus = "draft" | "scheduled" | "published" | "failed";

interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  platform: PlatformId;
  scheduledAt: Date;
  status: PostStatus;
  thumbnail?: string;
}

// Sample data for demo
const SAMPLE_POSTS: ScheduledPost[] = [
  {
    id: "1",
    title: "New Portfolio Showcase",
    caption: "Check out our latest work! #photography",
    platform: "instagram",
    scheduledAt: new Date(2026, 0, 15, 9, 0),
    status: "scheduled",
  },
  {
    id: "2",
    title: "Client Testimonial",
    caption: "Thank you to our amazing clients!",
    platform: "linkedin",
    scheduledAt: new Date(2026, 0, 16, 10, 0),
    status: "draft",
  },
  {
    id: "3",
    title: "Behind the Scenes",
    caption: "A sneak peek at today's shoot",
    platform: "instagram",
    scheduledAt: new Date(2026, 0, 17, 14, 0),
    status: "scheduled",
  },
  {
    id: "4",
    title: "Tips Tuesday",
    caption: "5 tips for better real estate photos",
    platform: "twitter",
    scheduledAt: new Date(2026, 0, 18, 11, 0),
    status: "scheduled",
  },
  {
    id: "5",
    title: "Flash Sale",
    caption: "Limited time offer on mini sessions!",
    platform: "facebook",
    scheduledAt: new Date(2026, 0, 20, 12, 0),
    status: "published",
  },
  {
    id: "6",
    title: "Weekend Vibes",
    caption: "Getting ready for the weekend",
    platform: "tiktok",
    scheduledAt: new Date(2026, 0, 21, 16, 0),
    status: "draft",
  },
];

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: "Draft", color: "var(--foreground-muted)", icon: Edit3 },
  scheduled: { label: "Scheduled", color: "var(--warning)", icon: Clock },
  published: { label: "Published", color: "var(--success)", icon: CheckCircle2 },
  failed: { label: "Failed", color: "var(--error)", icon: AlertCircle },
};

export function ContentCalendar() {
  const [view, setView] = React.useState<ViewType>("month");
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 0, 1));
  const [selectedPlatform, setSelectedPlatform] = React.useState<PlatformId | "all">("all");
  const [posts] = React.useState<ScheduledPost[]>(SAMPLE_POSTS);

  // Get days in month
  const getDaysInMonth = React.useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, []);

  // Get posts for a specific day
  const getPostsForDay = React.useCallback((date: Date | null) => {
    if (!date) return [];
    return posts.filter((post) => {
      const postDate = new Date(post.scheduledAt);
      return (
        postDate.getFullYear() === date.getFullYear() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getDate() === date.getDate() &&
        (selectedPlatform === "all" || post.platform === selectedPlatform)
      );
    });
  }, [posts, selectedPlatform]);

  // Get posts by status for board view
  const getPostsByStatus = React.useCallback((status: PostStatus) => {
    return posts.filter(
      (post) =>
        post.status === status &&
        (selectedPlatform === "all" || post.platform === selectedPlatform)
    );
  }, [posts, selectedPlatform]);

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 0, 15));
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="content-calendar min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Top row - Title and main actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/super-admin/marketing-studio"
                className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 rounded"
                aria-label="Back to Marketing Studio"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="h-6 w-px bg-[var(--card-border)] hidden sm:block" aria-hidden="true" />
              <h1 className="text-base sm:text-lg font-semibold text-[var(--foreground)]">
                Content Calendar
              </h1>
            </div>

            {/* New Post button */}
            <Link
              href="/super-admin/marketing-studio/composer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>New Post</span>
            </Link>
          </div>

          {/* Controls row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mt-3">
            {/* Platform Filter */}
            <div
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-1 overflow-x-auto"
              role="group"
              aria-label="Filter by platform"
            >
              <button
                onClick={() => setSelectedPlatform("all")}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  selectedPlatform === "all"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
                aria-pressed={selectedPlatform === "all"}
              >
                All
              </button>
              {(Object.keys(PLATFORM_ICONS) as PlatformId[]).map((platform) => {
                const Icon = PLATFORM_ICONS[platform];
                return (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={cn(
                      "rounded p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      selectedPlatform === platform
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    )}
                    aria-pressed={selectedPlatform === platform}
                    aria-label={`Filter by ${PLATFORM_NAMES[platform]}`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            {/* View Selector */}
            <div
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-1"
              role="tablist"
              aria-label="Calendar view"
            >
              {[
                { id: "month" as ViewType, label: "Month", icon: CalendarIcon },
                { id: "week" as ViewType, label: "Week", icon: Columns },
                { id: "board" as ViewType, label: "Board", icon: LayoutGrid },
                { id: "grid" as ViewType, label: "Grid", icon: Grid3X3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  role="tab"
                  aria-selected={view === id}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-2 sm:px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                    view === id
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-[var(--card-border)]">
            <nav className="flex items-center gap-2" aria-label="Calendar navigation">
              <button
                onClick={goToPrevMonth}
                className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] min-w-[180px] sm:min-w-[200px] text-center">
                {monthName}
              </h2>
              <button
                onClick={goToNextMonth}
                className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={goToToday}
                className="ml-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors"
              >
                Today
              </button>
            </nav>

            {/* Legend */}
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto" aria-label="Status legend">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-[var(--foreground-muted)]">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Month View */}
        {view === "month" && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
            {/* Day Headers - Desktop */}
            <div className="hidden sm:grid grid-cols-7 border-b border-[var(--card-border)]" role="row">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-xs font-medium text-[var(--foreground-muted)]"
                  role="columnheader"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day Headers - Mobile (abbreviated) */}
            <div className="sm:hidden grid grid-cols-7 border-b border-[var(--card-border)]" role="row">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                <div
                  key={idx}
                  className="px-1 py-2 text-center text-[10px] font-medium text-[var(--foreground-muted)]"
                  role="columnheader"
                  aria-label={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][idx]}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7" role="grid">
              {getDaysInMonth(currentDate).map((date, idx) => {
                const dayPosts = getPostsForDay(date);
                const isToday =
                  date?.getDate() === 15 &&
                  date?.getMonth() === 0 &&
                  date?.getFullYear() === 2026;

                return (
                  <div
                    key={idx}
                    role="gridcell"
                    tabIndex={date ? 0 : -1}
                    aria-label={date ? `${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${dayPosts.length} posts` : "Empty"}
                    className={cn(
                      "min-h-[80px] sm:min-h-[120px] border-b border-r border-[var(--card-border)] p-1 sm:p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]",
                      !date && "bg-[var(--background-secondary)]"
                    )}
                  >
                    {date && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-medium",
                              isToday
                                ? "bg-[var(--primary)] text-white"
                                : "text-[var(--foreground)]"
                            )}
                          >
                            {date.getDate()}
                          </span>
                          {dayPosts.length > 0 && (
                            <span className="text-[9px] sm:text-[10px] text-[var(--foreground-muted)] hidden sm:inline">
                              {dayPosts.length} post{dayPosts.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {/* Posts - Desktop */}
                        <div className="hidden sm:block space-y-1">
                          {dayPosts.slice(0, 3).map((post) => (
                            <PostCard key={post.id} post={post} compact />
                          ))}
                          {dayPosts.length > 3 && (
                            <div className="text-[10px] text-[var(--foreground-muted)] text-center">
                              +{dayPosts.length - 3} more
                            </div>
                          )}
                        </div>
                        {/* Posts - Mobile (just dots) */}
                        <div className="sm:hidden flex flex-wrap gap-0.5 mt-1">
                          {dayPosts.slice(0, 4).map((post) => (
                            <span
                              key={post.id}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: PLATFORM_COLORS[post.platform] }}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-8 border-b border-[var(--card-border)]" role="row">
                <div className="px-2 py-3 text-xs font-medium text-[var(--foreground-muted)]" role="columnheader" />
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                  <div
                    key={day}
                    className="px-2 py-3 text-center border-l border-[var(--card-border)]"
                    role="columnheader"
                  >
                    <div className="text-xs font-medium text-[var(--foreground-muted)]">{day}</div>
                    <div className="text-lg font-bold text-[var(--foreground)]">{15 + idx}</div>
                  </div>
                ))}
              </div>

              {/* Time grid */}
              <div className="grid grid-cols-8" role="grid">
                {[9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => (
                  <React.Fragment key={hour}>
                    <div
                      className="px-2 py-4 text-xs text-[var(--foreground-muted)] text-right pr-3 border-b border-[var(--card-border)]"
                      role="rowheader"
                    >
                      {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
                    </div>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                      const dayPosts = posts.filter((post) => {
                        const postDate = new Date(post.scheduledAt);
                        return (
                          postDate.getDate() === 15 + dayOffset &&
                          postDate.getHours() === hour &&
                          (selectedPlatform === "all" || post.platform === selectedPlatform)
                        );
                      });

                      return (
                        <div
                          key={dayOffset}
                          role="gridcell"
                          className="px-1 py-1 border-l border-b border-[var(--card-border)] min-h-[60px]"
                        >
                          {dayPosts.map((post) => (
                            <PostCard key={post.id} post={post} compact />
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Board View */}
        {view === "board" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["draft", "scheduled", "published", "failed"] as PostStatus[]).map((status) => {
              const statusPosts = getPostsByStatus(status);
              const config = STATUS_CONFIG[status];
              const StatusIcon = config.icon;

              return (
                <section
                  key={status}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] flex flex-col"
                  aria-labelledby={`${status}-heading`}
                >
                  <header className="flex items-center gap-2 p-4 border-b border-[var(--card-border)]">
                    <StatusIcon className="h-4 w-4" style={{ color: config.color }} aria-hidden="true" />
                    <h3 id={`${status}-heading`} className="text-sm font-semibold text-[var(--foreground)]">
                      {config.label}
                    </h3>
                    <span className="ml-auto rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--foreground-muted)]" aria-label={`${statusPosts.length} posts`}>
                      {statusPosts.length}
                    </span>
                  </header>
                  <div className="flex-1 p-3 space-y-2 overflow-auto max-h-[400px] sm:max-h-[500px]">
                    {statusPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    {statusPosts.length === 0 && (
                      <p className="py-8 text-center text-xs text-[var(--foreground-muted)]">
                        No posts
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Grid View (Instagram-style) */}
        {view === "grid" && (
          <div>
            <p className="text-sm text-[var(--foreground-muted)] mb-4">
              Instagram grid preview - see how your feed will look
            </p>
            <div className="grid grid-cols-3 gap-1 max-w-[600px] mx-auto" role="list" aria-label="Instagram feed preview">
              {posts
                .filter(
                  (post) =>
                    post.platform === "instagram" &&
                    (selectedPlatform === "all" || selectedPlatform === "instagram")
                )
                .slice(0, 9)
                .map((post) => (
                  <article
                    key={post.id}
                    role="listitem"
                    tabIndex={0}
                    className="aspect-square bg-gradient-to-br from-[var(--primary)]/30 to-[var(--ai)]/30 rounded-lg flex items-center justify-center relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    aria-label={`${post.title}, ${STATUS_CONFIG[post.status].label}, scheduled for ${new Date(post.scheduledAt).toLocaleDateString()}`}
                  >
                    <span className="text-xs text-[var(--foreground-muted)] px-2 text-center">
                      {post.title}
                    </span>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity rounded-lg flex items-center justify-center" aria-hidden="true">
                      <div className="text-center text-white">
                        <p className="text-xs font-medium">{post.title}</p>
                        <p className="text-[10px] opacity-70 mt-1">
                          {new Date(post.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Status indicator */}
                    <span
                      className="absolute top-2 right-2 h-2 w-2 rounded-full"
                      style={{ backgroundColor: STATUS_CONFIG[post.status].color }}
                      aria-hidden="true"
                    />
                  </article>
                ))}
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 9 - posts.filter((p) => p.platform === "instagram").length) }).map(
                (_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-square border border-dashed border-[var(--border)] rounded-lg flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Plus className="h-6 w-6 text-[var(--foreground-muted)]" />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Post Card Component
function PostCard({ post, compact = false }: { post: ScheduledPost; compact?: boolean }) {
  const Icon = PLATFORM_ICONS[post.platform];
  const platformColor = PLATFORM_COLORS[post.platform];
  const statusConfig = STATUS_CONFIG[post.status];

  if (compact) {
    return (
      <article
        className="rounded-md px-2 py-1 text-[10px] font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        style={{ backgroundColor: `${platformColor}20`, color: platformColor }}
        tabIndex={0}
        aria-label={`${post.title} on ${PLATFORM_NAMES[post.platform]}, ${statusConfig.label}`}
      >
        <Icon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">{post.title}</span>
      </article>
    );
  }

  return (
    <article
      className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 cursor-pointer hover:border-[var(--border-hover)] transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      tabIndex={0}
      aria-label={`${post.title} on ${PLATFORM_NAMES[post.platform]}, ${statusConfig.label}, scheduled for ${new Date(post.scheduledAt).toLocaleString()}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${platformColor}20` }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: platformColor }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--foreground)] truncate">{post.title}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">
              <time dateTime={post.scheduledAt.toISOString()}>
                {new Date(post.scheduledAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </p>
          </div>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded p-0.5"
          aria-label={`More options for ${post.title}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2 mb-2">
        {post.caption}
      </p>
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusConfig.color }}
          aria-hidden="true"
        />
        <span className="text-[10px]" style={{ color: statusConfig.color }}>
          {statusConfig.label}
        </span>
      </div>
    </article>
  );
}
