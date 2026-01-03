"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreateBookingModal } from "@/components/modals/create-booking-modal";
import { updateBookingStatus } from "@/lib/actions/bookings";
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

type ViewMode = "upcoming" | "day" | "today";
type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

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
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter bookings by status and search
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Status filter
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const clientName = booking.client?.fullName?.toLowerCase() || booking.clientName?.toLowerCase() || "";
        const company = booking.client?.company?.toLowerCase() || "";
        const title = booking.title.toLowerCase();
        const location = booking.location?.toLowerCase() || "";
        return (
          clientName.includes(query) ||
          company.includes(query) ||
          title.includes(query) ||
          location.includes(query)
        );
      }
      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Get today's bookings
  const todaysBookings = useMemo(() => {
    const today = new Date();
    return bookings
      .filter((b) => new Date(b.startTime).toDateString() === today.toDateString())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const thisWeekBookings = bookings.filter((b) => {
      const startTime = new Date(b.startTime);
      return startTime >= startOfWeek && startTime < endOfWeek && b.status !== "cancelled";
    });

    const totalHours = thisWeekBookings.reduce((acc, booking) => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const hours = (end.getTime() - start.getTime()) / 3600000;
      return acc + hours;
    }, 0);

    const pendingCount = bookings.filter((b) => b.status === "pending").length;
    const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

    return {
      weekBookings: thisWeekBookings.length,
      totalHours: Math.round(totalHours * 10) / 10,
      pending: pendingCount,
      confirmed: confirmedCount,
    };
  }, [bookings]);

  // Status filter counts
  const statusCounts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  // Group upcoming bookings by day
  const bookingsByDay = useMemo(() => {
    const grouped = filteredBookings.reduce((acc, booking) => {
      const dayKey = new Date(booking.startTime).toDateString();
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(booking);
      return acc;
    }, {} as Record<string, typeof filteredBookings>);

    // Sort bookings within each day by time
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    return grouped;
  }, [filteredBookings]);

  const days = Object.keys(bookingsByDay).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Quick action handlers
  const handleConfirm = async (bookingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await updateBookingStatus(bookingId, "confirmed");
      router.refresh();
    });
  };

  const handleCancel = async (bookingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await updateBookingStatus(bookingId, "cancelled");
      router.refresh();
    });
  };

  const handleComplete = async (bookingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await updateBookingStatus(bookingId, "completed");
      router.refresh();
    });
  };

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
  const BookingCard = ({ booking, showQuickActions = true }: { booking: Booking; showQuickActions?: boolean }) => (
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

        {/* Right: Quick Actions & Arrow */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          {showQuickActions && booking.status !== "cancelled" && booking.status !== "completed" && (
            <div className="hidden group-hover:flex items-center gap-1">
              {booking.status === "pending" && (
                <button
                  onClick={(e) => handleConfirm(booking.id, e)}
                  disabled={isPending}
                  className="rounded-lg bg-[var(--success)]/10 px-2.5 py-1.5 text-xs font-medium text-[var(--success)] transition-colors hover:bg-[var(--success)]/20 disabled:opacity-50"
                  title="Confirm booking"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </button>
              )}
              {booking.status === "confirmed" && (
                <button
                  onClick={(e) => handleComplete(booking.id, e)}
                  disabled={isPending}
                  className="rounded-lg bg-[var(--success)]/10 px-2.5 py-1.5 text-xs font-medium text-[var(--success)] transition-colors hover:bg-[var(--success)]/20 disabled:opacity-50"
                  title="Mark as completed"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={(e) => handleCancel(booking.id, e)}
                disabled={isPending}
                className="rounded-lg bg-[var(--error)]/10 px-2.5 py-1.5 text-xs font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 disabled:opacity-50"
                title="Cancel booking"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {/* Arrow */}
          <div className="shrink-0 rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
            <ChevronRightIcon className="h-4 w-4" />
          </div>
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

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.weekBookings}</p>
              <p className="text-xs text-foreground-muted">This Week</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/15 text-[var(--ai)]">
              <ClockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalHours}h</p>
              <p className="text-xs text-foreground-muted">Hours Scheduled</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/15 text-[var(--warning)]">
              <AlertIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-foreground-muted">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/15 text-[var(--success)]">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
              <p className="text-xs text-foreground-muted">Confirmed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Agenda */}
      {todaysBookings.length > 0 && viewMode === "upcoming" && (
        <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                <TodayIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Today's Agenda</h3>
                <p className="text-xs text-foreground-muted">{todaysBookings.length} {todaysBookings.length === 1 ? "booking" : "bookings"}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {todaysBookings.slice(0, 3).map((booking) => (
              <Link
                key={booking.id}
                href={`/scheduling/${booking.id}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 transition-all hover:border-[var(--border-hover)]"
              >
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{formatTime(new Date(booking.startTime))}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{booking.title}</p>
                  <p className="truncate text-xs text-foreground-muted">
                    {booking.client?.fullName || booking.clientName || "No client"}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </Link>
            ))}
            {todaysBookings.length > 3 && (
              <button
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  setViewMode("day");
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--card-border)] p-3 text-sm font-medium text-foreground-muted transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                +{todaysBookings.length - 3} more
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === status
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                statusFilter === status
                  ? "bg-white/20"
                  : "bg-[var(--background)]"
              )}>
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function TodayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
