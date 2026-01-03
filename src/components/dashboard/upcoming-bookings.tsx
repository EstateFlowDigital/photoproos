"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type BookingStatus = "confirmed" | "pending" | "cancelled";

interface Booking {
  id: string;
  title: string;
  client: string;
  date: Date;
  time: string;
  location?: string;
  status: BookingStatus;
  serviceType?: string;
}

interface UpcomingBookingsProps {
  bookings: Booking[];
  className?: string;
}

const statusColors: Record<BookingStatus, string> = {
  confirmed: "bg-[var(--success)]/10 text-[var(--success)]",
  pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
  cancelled: "bg-[var(--error)]/10 text-[var(--error)]",
};

const statusLabels: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
};

function formatDate(date: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}

export function UpcomingBookings({ bookings, className }: UpcomingBookingsProps) {
  if (bookings.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-6 text-center", className)}>
        <CalendarIcon className="mx-auto h-10 w-10 text-foreground-muted" />
        <h3 className="mt-3 text-sm font-medium text-foreground">No upcoming bookings</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Schedule your next photo session.
        </p>
        <Link
          href="/scheduling/new"
          className="mt-4 inline-flex items-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
        >
          New Booking
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] divide-y divide-[var(--card-border)]", className)}>
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          href={`/scheduling/${booking.id}`}
          className="block p-4 transition-colors hover:bg-[var(--background-hover)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="line-clamp-2 text-sm font-semibold text-foreground sm:line-clamp-1">
                  {booking.title}
                </h4>
                <span className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                  statusColors[booking.status]
                )}>
                  {statusLabels[booking.status]}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-foreground-muted sm:line-clamp-1">
                {booking.client}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-1 text-xs text-foreground-muted">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-foreground-muted">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>{booking.time}</span>
                </div>
                {booking.location && (
                  <div className="flex items-center gap-1 text-xs text-foreground-muted">
                    <LocationIcon className="h-3.5 w-3.5" />
                    <span className="line-clamp-1 max-w-[160px] sm:max-w-none">
                      {booking.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {booking.serviceType && (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-md bg-[var(--background-elevated)] px-2 py-1 text-[10px] font-medium text-foreground-muted">
                {booking.serviceType}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
