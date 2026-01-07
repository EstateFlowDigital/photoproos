"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface Deadline {
  id: string;
  title: string;
  dueDate: Date;
  type: "gallery" | "contract" | "invoice" | "task" | "project";
  href: string;
  priority?: "low" | "medium" | "high";
}

interface DeadlinesWidgetProps {
  deadlines?: Deadline[];
  maxItems?: number;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDueDate(date: Date): string {
  const daysUntil = getDaysUntil(date);

  if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
  if (daysUntil === 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";
  if (daysUntil <= 7) return `Due in ${daysUntil} days`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getUrgencyStyle(date: Date): string {
  const daysUntil = getDaysUntil(date);

  if (daysUntil < 0) return "text-[var(--error)] bg-[var(--error)]/10";
  if (daysUntil === 0) return "text-[var(--error)] bg-[var(--error)]/10";
  if (daysUntil <= 2) return "text-[var(--warning)] bg-[var(--warning)]/10";
  if (daysUntil <= 7) return "text-[var(--primary)] bg-[var(--primary)]/10";
  return "text-foreground-muted bg-[var(--background-secondary)]";
}

const TYPE_ICONS: Record<Deadline["type"], React.ReactNode> = {
  gallery: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  ),
  contract: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
    </svg>
  ),
  invoice: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  ),
  task: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  ),
  project: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v3.26a3.235 3.235 0 0 1 1.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0 0 16.25 5h-4.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H3.75ZM3.75 9A1.75 1.75 0 0 0 2 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 15.25v-4.5A1.75 1.75 0 0 0 16.25 9H3.75Z" />
    </svg>
  ),
};

// ============================================================================
// Component
// ============================================================================

export function DeadlinesWidget({
  deadlines = [],
  maxItems = 5,
  className,
}: DeadlinesWidgetProps) {
  // Sort by due date (earliest first) and filter to upcoming/overdue
  const sortedDeadlines = [...deadlines]
    .filter((d) => getDaysUntil(d.dueDate) <= 14)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, maxItems);

  if (sortedDeadlines.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--success)]/10">
          <svg
            className="h-5 w-5 text-[var(--success)]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">No upcoming deadlines</p>
        <p className="mt-1 text-xs text-foreground-muted">You're all caught up!</p>
      </div>
    );
  }

  // Count urgent items
  const urgentCount = sortedDeadlines.filter((d) => getDaysUntil(d.dueDate) <= 2).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Urgent alert */}
      {urgentCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--error)]/10 px-3 py-2">
          <svg
            className="h-4 w-4 text-[var(--error)]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium text-[var(--error)]">
            {urgentCount} deadline{urgentCount > 1 ? "s" : ""} need attention
          </span>
        </div>
      )}

      {/* Deadlines list */}
      <ul className="space-y-2">
        {sortedDeadlines.map((deadline) => (
          <li key={deadline.id}>
            <Link
              href={deadline.href}
              className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 transition-colors hover:bg-[var(--background-elevated)]"
            >
              <span className="flex-shrink-0 text-foreground-muted">
                {TYPE_ICONS[deadline.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {deadline.title}
                </p>
                <p className="text-xs capitalize text-foreground-muted">
                  {deadline.type}
                </p>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  getUrgencyStyle(deadline.dueDate)
                )}
              >
                {formatDueDate(deadline.dueDate)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeadlinesWidget;
