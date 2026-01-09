"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface Booking {
  id: string;
  title: string;
  client: string;
  date: Date;
  time: string;
  location?: string;
  status: "pending" | "confirmed";
  serviceType?: string;
}

interface UpcomingBookingsWidgetProps {
  bookings?: Booking[];
  maxItems?: number;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ============================================================================
// Component
// ============================================================================

export function UpcomingBookingsWidget({
  bookings = [],
  maxItems = 5,
  className,
}: UpcomingBookingsWidgetProps) {
  const displayBookings = bookings.slice(0, maxItems);

  if (displayBookings.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)]">
          <svg
            className="h-5 w-5 text-foreground-muted"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">No upcoming bookings</p>
        <p className="mt-1 text-xs text-foreground-muted">
          Schedule your first session
        </p>
        <Link
          href="/scheduling/new"
          className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          Create booking
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {displayBookings.map((booking) => (
        <Link
          key={booking.id}
          href={`/scheduling/${booking.id}`}
          className="block rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 transition-colors hover:bg-[var(--background-elevated)]"
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {booking.title}
              </p>
              <p className="mt-0.5 truncate text-sm text-foreground-secondary">
                {booking.client}
              </p>
              {booking.location && (
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-foreground-muted">
                  <svg
                    className="h-3 w-3 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {booking.location}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-medium text-foreground">
                {formatDate(booking.date)}
              </span>
              <span className="text-xs text-foreground-muted">
                {booking.time}
              </span>
              <span
                className={cn(
                  "mt-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  booking.status === "confirmed"
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : "bg-[var(--warning)]/10 text-[var(--warning)]"
                )}
              >
                {booking.status === "confirmed" ? "Confirmed" : "Pending"}
              </span>
            </div>
          </div>
        </Link>
      ))}

      {bookings.length > maxItems && (
        <Link
          href="/scheduling"
          className="block text-center text-sm font-medium text-[var(--primary)] hover:underline"
        >
          View all {bookings.length} bookings
        </Link>
      )}
    </div>
  );
}

export default UpcomingBookingsWidget;
