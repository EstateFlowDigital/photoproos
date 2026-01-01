export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Helper to format time
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Helper to check if date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Helper to check if date is tomorrow
function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

// Get relative day label
function getRelativeDay(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return formatDate(date);
}

// Status colors
const statusColors: Record<string, string> = {
  pending: "bg-[var(--warning)]/10 border-[var(--warning)]/30",
  confirmed: "bg-[var(--primary)]/10 border-[var(--primary)]/30",
  completed: "bg-[var(--success)]/10 border-[var(--success)]/30",
  cancelled: "bg-[var(--error)]/10 border-[var(--error)]/30",
};

const statusDotColors: Record<string, string> = {
  pending: "bg-[var(--warning)]",
  confirmed: "bg-[var(--primary)]",
  completed: "bg-[var(--success)]",
  cancelled: "bg-[var(--error)]",
};

export default async function SchedulingPage() {
  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
      </div>
    );
  }

  // Fetch upcoming bookings
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      organizationId: organization.id,
      startTime: { gte: now },
      status: { not: "cancelled" },
    },
    include: {
      client: { select: { fullName: true, company: true } },
    },
    orderBy: { startTime: "asc" },
    take: 20,
  });

  // Group bookings by day
  const bookingsByDay = bookings.reduce((acc, booking) => {
    const dayKey = booking.startTime.toDateString();
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(booking);
    return acc;
  }, {} as Record<string, typeof bookings>);

  const days = Object.keys(bookingsByDay);

  // Generate mini calendar for current week
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return {
      date,
      dayName: weekDays[i],
      dayNumber: date.getDate(),
      isToday: isToday(date),
      hasBooking: bookings.some(
        (b) => b.startTime.toDateString() === date.toDateString()
      ),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduling"
        subtitle="Manage your upcoming shoots and bookings"
        actions={
          <Link
            href="/scheduling/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            New Booking
          </Link>
        }
      />

      {/* Week View */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">This Week</h3>
          <div className="flex gap-1">
            <button className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => (
            <div key={day.dayNumber} className="text-center">
              <p className="mb-2 text-xs font-medium text-foreground-muted">
                {day.dayName}
              </p>
              <div
                className={cn(
                  "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  day.isToday
                    ? "bg-[var(--primary)] text-white"
                    : day.hasBooking
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-foreground hover:bg-[var(--background-hover)]"
                )}
              >
                {day.dayNumber}
              </div>
              {day.hasBooking && !day.isToday && (
                <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-[var(--primary)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Upcoming Bookings</h2>

        {days.length > 0 ? (
          <div className="space-y-6">
            {days.map((dayKey) => (
              <div key={dayKey}>
                <h3 className="mb-3 text-sm font-medium text-foreground-muted">
                  {getRelativeDay(new Date(dayKey))}
                </h3>
                <div className="space-y-3">
                  {bookingsByDay[dayKey].map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border-l-4 bg-[var(--card)] p-4 transition-all hover:shadow-md",
                        statusColors[booking.status]
                      )}
                    >
                      {/* Time */}
                      <div className="shrink-0 text-center">
                        <p className="text-lg font-semibold text-foreground">
                          {formatTime(booking.startTime)}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {Math.round(
                            (booking.endTime.getTime() - booking.startTime.getTime()) /
                              3600000
                          )}h
                        </p>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              statusDotColors[booking.status]
                            )}
                          />
                          <p className="font-medium text-foreground truncate">
                            {booking.title}
                          </p>
                        </div>
                        <p className="mt-0.5 text-sm text-foreground-muted truncate">
                          {booking.client?.company ||
                            booking.client?.fullName ||
                            booking.clientName}
                        </p>
                        {booking.location && (
                          <p className="mt-1 text-xs text-foreground-muted flex items-center gap-1">
                            <LocationIcon className="h-3 w-3" />
                            {booking.location}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <Link
                        href={`/scheduling/${booking.id}`}
                        className="shrink-0 rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No upcoming bookings
            </h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Create a booking to start scheduling your photo shoots.
            </p>
            <Link
              href="/scheduling/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              New Booking
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
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

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}
