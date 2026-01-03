"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreateBookingModal } from "@/components/modals/create-booking-modal";
import {
  PageHeader,
  PageContextNav,
  GoogleIcon,
  ContextCalendarIcon,
  ContextClockIcon,
  TagIcon,
} from "@/components/dashboard";

interface Client {
  id: string;
  fullName: string | null;
  company: string | null;
  email: string;
}

interface Booking {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: string;
  location: string | null;
  client: {
    fullName: string | null;
    company: string | null;
  } | null;
  clientName: string | null;
}

interface CalendarDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  hasBooking: boolean;
  bookingCount: number;
}

type ViewMode = "upcoming" | "day";

interface SchedulingPageClientProps {
  clients: Client[];
  bookings: Booking[];
  calendarDays: CalendarDay[];
  isGoogleCalendarConnected?: boolean;
}

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

// Helper to generate calendar days for a given week offset
function generateCalendarDays(weekOffset: number, bookings: Booking[]): CalendarDay[] {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dayBookings = bookings.filter(
      (b) => new Date(b.startTime).toDateString() === date.toDateString()
    );
    return {
      date,
      dayName: weekDays[i],
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      hasBooking: dayBookings.length > 0,
      bookingCount: dayBookings.length,
    };
  });
}

// Helper to format full date
function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Helper to calculate duration in hours and minutes
function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Helper to get week label
function getWeekLabel(weekOffset: number): string {
  if (weekOffset === 0) return "This Week";
  if (weekOffset === 1) return "Next Week";
  if (weekOffset === -1) return "Last Week";

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatMonth = (date: Date) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  const formatDay = (date: Date) => date.getDate();

  if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
    return `${formatMonth(startOfWeek)} ${formatDay(startOfWeek)} - ${formatDay(endOfWeek)}`;
  }
  return `${formatMonth(startOfWeek)} ${formatDay(startOfWeek)} - ${formatMonth(endOfWeek)} ${formatDay(endOfWeek)}`;
}

export function SchedulingPageClient({
  clients,
  bookings,
  calendarDays: initialCalendarDays,
  isGoogleCalendarConnected = false,
}: SchedulingPageClientProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");

  // Generate calendar days based on week offset
  const calendarDays = useMemo(() => {
    const days = generateCalendarDays(weekOffset, bookings);
    return days;
  }, [weekOffset, bookings]);

  const handleBookingCreated = (booking: { id: string }) => {
    router.refresh();
  };

  const goToPreviousWeek = () => setWeekOffset((prev) => prev - 1);
  const goToNextWeek = () => setWeekOffset((prev) => prev + 1);
  const goToCurrentWeek = () => {
    setWeekOffset(0);
    setSelectedDate(null);
    setViewMode("upcoming");
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setViewMode("day");
  };

  // Get bookings for selected day
  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookings
      .filter((b) => new Date(b.startTime).toDateString() === selectedDate.toDateString())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [selectedDate, bookings]);

  // Group upcoming bookings by day
  const bookingsByDay = useMemo(() => {
    const grouped = bookings.reduce((acc, booking) => {
      const dayKey = new Date(booking.startTime).toDateString();
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(booking);
      return acc;
    }, {} as Record<string, typeof bookings>);

    // Sort bookings within each day by time
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    return grouped;
  }, [bookings]);

  const days = Object.keys(bookingsByDay).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusLabels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    const statusBadgeColors: Record<string, string> = {
      pending: "bg-[var(--warning)]/15 text-[var(--warning)]",
      confirmed: "bg-[var(--primary)]/15 text-[var(--primary)]",
      completed: "bg-[var(--success)]/15 text-[var(--success)]",
      cancelled: "bg-[var(--error)]/15 text-[var(--error)]",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusBadgeColors[status])}>
        {statusLabels[status] || status}
      </span>
    );
  };

  // Booking Card Component
  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Link
      href={`/scheduling/${booking.id}`}
      className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Time & Status */}
        <div className="flex items-start gap-4">
          {/* Time Block */}
          <div className="shrink-0 rounded-lg bg-[var(--background)] border border-[var(--card-border)] px-3 py-2 text-center min-w-[80px]">
            <p className="text-lg font-bold text-foreground">
              {formatTime(new Date(booking.startTime))}
            </p>
            <p className="text-xs text-foreground-muted">
              {formatDuration(new Date(booking.startTime), new Date(booking.endTime))}
            </p>
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors">
                {booking.title}
              </h4>
              <StatusBadge status={booking.status} />
            </div>
            <p className="mt-1 text-sm text-foreground-muted">
              {booking.client?.company || booking.client?.fullName || booking.clientName || "No client"}
            </p>
            {booking.location && (
              <p className="mt-2 text-xs text-foreground-muted flex items-center gap-1.5">
                <LocationIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{booking.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Arrow */}
        <div className="shrink-0 rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
          <ChevronRightIcon className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Scheduling"
        subtitle="Manage your upcoming shoots and bookings"
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            New Booking
          </button>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Calendar", href: "/scheduling", icon: <ContextCalendarIcon className="h-4 w-4" /> },
          { label: "Availability", href: "/scheduling/availability", icon: <ContextClockIcon className="h-4 w-4" /> },
          { label: "Booking Types", href: "/scheduling/types", icon: <TagIcon className="h-4 w-4" /> },
        ]}
        integrations={[
          {
            label: "Google Calendar",
            href: "/settings/integrations",
            icon: <GoogleIcon className="h-4 w-4" />,
            isConnected: isGoogleCalendarConnected,
          },
        ]}
      />

      {/* Week Calendar */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">{getWeekLabel(weekOffset)}</h3>
            {(weekOffset !== 0 || viewMode === "day") && (
              <button
                onClick={goToCurrentWeek}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 transition-colors hover:bg-[var(--primary)]/20"
              >
                Today
              </button>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={goToPreviousWeek}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
              title="Previous week"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextWeek}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
              title="Next week"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const isSelected = selectedDate?.toDateString() === day.date.toDateString();
            return (
              <button
                key={`${weekOffset}-${index}`}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative flex flex-col items-center rounded-xl p-3 transition-all",
                  isSelected
                    ? "bg-[var(--primary)] text-white"
                    : day.isToday
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20"
                    : "hover:bg-[var(--background-hover)]"
                )}
              >
                <span className={cn(
                  "text-xs font-medium mb-1",
                  isSelected ? "text-white/80" : "text-foreground-muted"
                )}>
                  {day.dayName}
                </span>
                <span className={cn(
                  "text-lg font-semibold",
                  isSelected ? "text-white" : day.isToday ? "text-[var(--primary)]" : "text-foreground"
                )}>
                  {day.dayNumber}
                </span>
                {day.bookingCount > 0 && (
                  <span className={cn(
                    "mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[var(--primary)]/10 text-[var(--primary)]"
                  )}>
                    {day.bookingCount} {day.bookingCount === 1 ? "booking" : "bookings"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings Section */}
      <div className="space-y-4">
        {viewMode === "day" && selectedDate ? (
          <>
            {/* Selected Day Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {formatFullDate(selectedDate)}
                </h2>
                <p className="text-sm text-foreground-muted">
                  {selectedDayBookings.length} {selectedDayBookings.length === 1 ? "booking" : "bookings"}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewMode("upcoming");
                  setSelectedDate(null);
                }}
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                View all upcoming
              </button>
            </div>

            {/* Selected Day Bookings */}
            {selectedDayBookings.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {selectedDayBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-12 text-center">
                <CalendarIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                <h3 className="mt-3 text-base font-medium text-foreground">
                  No bookings on this day
                </h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Click below to schedule a shoot for this date.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Booking
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Upcoming Bookings Header */}
            <h2 className="text-lg font-semibold text-foreground">Upcoming Bookings</h2>

            {days.length > 0 ? (
              <div className="space-y-6">
                {days.map((dayKey) => (
                  <div key={dayKey}>
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {getRelativeDay(new Date(dayKey))}
                      </h3>
                      <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs text-foreground-muted">
                        {bookingsByDay[dayKey].length} {bookingsByDay[dayKey].length === 1 ? "booking" : "bookings"}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {bookingsByDay[dayKey].map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
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
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Booking
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Booking Modal */}
      <CreateBookingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleBookingCreated}
        clients={clients}
      />
    </>
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
