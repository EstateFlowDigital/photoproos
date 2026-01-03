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
  isRecurring?: boolean;
  isMultiDay?: boolean;
  multiDayName?: string | null;
  multiDayParentId?: string | null;
}

interface CalendarDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  hasBooking: boolean;
  bookingCount: number;
}

interface TimeOffBlock {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  blockType: string;
  userId: string | null;
}

type CalendarViewMode = "week" | "month" | "list";
type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

interface SchedulingPageClientProps {
  clients: Client[];
  bookings: Booking[];
  calendarDays: CalendarDay[];
  isGoogleCalendarConnected?: boolean;
  timeOffBlocks?: TimeOffBlock[];
  pendingTimeOffCount?: number;
}

// Helper to format time
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// Helper to format short time (for calendar blocks)
function formatShortTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
  }).format(date).replace(" ", "").toLowerCase();
}

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Helper to format long date
function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
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

// Helper to check if date is same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// Helper to check if date is tomorrow
function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

// Get relative day label
function getRelativeDay(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return formatDate(date);
}

// Status colors for event blocks
const statusBlockColors: Record<string, string> = {
  pending: "bg-[var(--warning)] border-[var(--warning)]",
  confirmed: "bg-[var(--primary)] border-[var(--primary)]",
  completed: "bg-[var(--success)] border-[var(--success)]",
  cancelled: "bg-[var(--error)]/50 border-[var(--error)]",
};

const statusBadgeColors: Record<string, string> = {
  pending: "bg-[var(--warning)]/15 text-[var(--warning)]",
  confirmed: "bg-[var(--primary)]/15 text-[var(--primary)]",
  completed: "bg-[var(--success)]/15 text-[var(--success)]",
  cancelled: "bg-[var(--error)]/15 text-[var(--error)]",
};

// Helper to calculate duration in hours and minutes
function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Helper to get month label
function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

// Generate calendar days for a month
function generateMonthDays(year: number, month: number, bookings: Booking[]): CalendarDay[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  // Add padding for days before the first of the month
  for (let i = 0; i < startPadding; i++) {
    const paddingDate = new Date(year, month, 1 - (startPadding - i));
    currentWeek.push({
      date: paddingDate,
      dayName: "",
      dayNumber: paddingDate.getDate(),
      isToday: false,
      hasBooking: false,
      bookingCount: 0,
    });
  }

  // Add all days of the month
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dayBookings = bookings.filter((b) => isSameDay(new Date(b.startTime), date));

    currentWeek.push({
      date,
      dayName: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      dayNumber: day,
      isToday: isToday(date),
      hasBooking: dayBookings.length > 0,
      bookingCount: dayBookings.length,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add padding for days after the last of the month
  if (currentWeek.length > 0) {
    const remaining = 7 - currentWeek.length;
    for (let i = 1; i <= remaining; i++) {
      const paddingDate = new Date(year, month + 1, i);
      currentWeek.push({
        date: paddingDate,
        dayName: "",
        dayNumber: paddingDate.getDate(),
        isToday: false,
        hasBooking: false,
        bookingCount: 0,
      });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

// Generate week days
function generateWeekDays(weekOffset: number, bookings: Booking[]): CalendarDay[] {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dayBookings = bookings.filter((b) => isSameDay(new Date(b.startTime), date));
    return {
      date,
      dayName: weekDays[i],
      dayNumber: date.getDate(),
      isToday: isToday(date),
      hasBooking: dayBookings.length > 0,
      bookingCount: dayBookings.length,
    };
  });
}

export function SchedulingPageClient({
  clients,
  bookings,
  calendarDays: initialCalendarDays,
  isGoogleCalendarConnected = false,
  timeOffBlocks = [],
  pendingTimeOffCount = 0,
}: SchedulingPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // For week view navigation
  const [weekOffset, setWeekOffset] = useState(0);

  // For month view navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const handleBookingCreated = () => {
    router.refresh();
  };

  // Week navigation
  const goToPreviousWeek = () => setWeekOffset((prev) => prev - 1);
  const goToNextWeek = () => setWeekOffset((prev) => prev + 1);

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
    setWeekOffset(0);
    setSelectedDate(null);
  };

  // Generate calendar data
  const weekDays = useMemo(() => generateWeekDays(weekOffset, bookings), [weekOffset, bookings]);
  const monthWeeks = useMemo(
    () => generateMonthDays(currentMonth.year, currentMonth.month, bookings),
    [currentMonth.year, currentMonth.month, bookings]
  );

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const clientName = booking.client?.fullName?.toLowerCase() || booking.clientName?.toLowerCase() || "";
        const company = booking.client?.company?.toLowerCase() || "";
        const title = booking.title.toLowerCase();
        const location = booking.location?.toLowerCase() || "";
        return clientName.includes(query) || company.includes(query) || title.includes(query) || location.includes(query);
      }
      return true;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings, statusFilter, searchQuery]);

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter((b) => isSameDay(new Date(b.startTime), date))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  // Get time-off blocks for a specific date
  const getTimeOffForDate = (date: Date) => {
    return timeOffBlocks.filter((block) => {
      const startDate = new Date(block.startDate);
      const endDate = new Date(block.endDate);
      const checkDate = new Date(date);
      // Reset times for date comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      checkDate.setHours(12, 0, 0, 0);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Check if date has time-off
  const hasTimeOff = (date: Date) => getTimeOffForDate(date).length > 0;

  // Selected day bookings
  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    return getBookingsForDate(selectedDate);
  }, [selectedDate, filteredBookings]);

  // Today's bookings
  const todaysBookings = useMemo(() => {
    const today = new Date();
    return bookings.filter((b) => isSameDay(new Date(b.startTime), today))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings]);

  // Stats
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
      return acc + (end.getTime() - start.getTime()) / 3600000;
    }, 0);

    return {
      weekBookings: thisWeekBookings.length,
      totalHours: Math.round(totalHours * 10) / 10,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
    };
  }, [bookings]);

  // Status counts
  const statusCounts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  // Group bookings by day for list view
  const bookingsByDay = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    filteredBookings.forEach((booking) => {
      const dayKey = new Date(booking.startTime).toDateString();
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(booking);
    });
    return grouped;
  }, [filteredBookings]);

  const sortedDays = Object.keys(bookingsByDay).sort(
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

  // Components
  const StatusBadge = ({ status }: { status: string }) => (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusBadgeColors[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  // Event block for calendar
  const EventBlock = ({ booking, compact = false }: { booking: Booking; compact?: boolean }) => (
    <Link
      href={`/scheduling/${booking.id}`}
      className={cn(
        "block rounded px-1.5 py-0.5 text-white text-[10px] font-medium truncate transition-opacity hover:opacity-80",
        statusBlockColors[booking.status],
        compact ? "leading-tight" : ""
      )}
      title={`${formatTime(new Date(booking.startTime))} - ${booking.title}${booking.isRecurring ? " (Recurring)" : ""}`}
    >
      {compact ? (
        <span className="truncate flex items-center gap-0.5">
          {booking.isRecurring && <RepeatIcon className="h-2 w-2 shrink-0" />}
          {formatShortTime(new Date(booking.startTime))}
        </span>
      ) : (
        <span className="truncate flex items-center gap-0.5">
          {booking.isRecurring && <RepeatIcon className="h-2.5 w-2.5 shrink-0" />}
          {formatShortTime(new Date(booking.startTime))} {booking.title}
        </span>
      )}
    </Link>
  );

  // Time-off block for calendar
  const TimeOffBlockDisplay = ({ block, compact = false }: { block: TimeOffBlock; compact?: boolean }) => {
    const blockTypeColors: Record<string, string> = {
      time_off: "bg-[var(--foreground-muted)]/30 border-[var(--foreground-muted)]/50 text-foreground-muted",
      holiday: "bg-[var(--ai)]/20 border-[var(--ai)]/40 text-[var(--ai)]",
      personal: "bg-[var(--warning)]/20 border-[var(--warning)]/40 text-[var(--warning)]",
    };

    const blockTypeIcons: Record<string, string> = {
      time_off: "Off",
      holiday: "Holiday",
      personal: "Personal",
    };

    return (
      <div
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-medium truncate border",
          blockTypeColors[block.blockType] || blockTypeColors.time_off,
          compact ? "leading-tight" : ""
        )}
        title={block.title}
      >
        {compact ? (
          <span className="truncate">{blockTypeIcons[block.blockType] || "Off"}</span>
        ) : (
          <span className="truncate flex items-center gap-1">
            <UnavailableIcon className="h-2.5 w-2.5 shrink-0" />
            {block.title}
          </span>
        )}
      </div>
    );
  };

  // Booking card for list/detail views
  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Link
      href={`/scheduling/${booking.id}`}
      className="group flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/5"
    >
      {/* Status indicator */}
      <div className={cn("w-1 h-12 rounded-full shrink-0", statusBlockColors[booking.status])} />

      {/* Time */}
      <div className="shrink-0 text-center min-w-[70px]">
        <p className="text-sm font-bold text-foreground">{formatTime(new Date(booking.startTime))}</p>
        <p className="text-xs text-foreground-muted">{formatDuration(new Date(booking.startTime), new Date(booking.endTime))}</p>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors truncate flex items-center gap-1.5">
            {booking.isRecurring && (
              <span className="shrink-0 text-[var(--ai)]" title="Recurring booking">
                <RepeatIcon className="h-3.5 w-3.5" />
              </span>
            )}
            {booking.title}
          </h4>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-foreground-muted truncate">
          {booking.client?.company || booking.client?.fullName || booking.clientName || "No client"}
        </p>
        {booking.location && (
          <p className="text-xs text-foreground-muted flex items-center gap-1 mt-1">
            <LocationIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{booking.location}</span>
          </p>
        )}
      </div>

      {/* Quick Actions */}
      {booking.status !== "cancelled" && booking.status !== "completed" && (
        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          {booking.status === "pending" && (
            <button
              onClick={(e) => handleConfirm(booking.id, e)}
              disabled={isPending}
              className="rounded-lg bg-[var(--success)]/10 p-2 text-[var(--success)] hover:bg-[var(--success)]/20 disabled:opacity-50"
              title="Confirm"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          )}
          {booking.status === "confirmed" && (
            <button
              onClick={(e) => handleComplete(booking.id, e)}
              disabled={isPending}
              className="rounded-lg bg-[var(--success)]/10 p-2 text-[var(--success)] hover:bg-[var(--success)]/20 disabled:opacity-50"
              title="Complete"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => handleCancel(booking.id, e)}
            disabled={isPending}
            className="rounded-lg bg-[var(--error)]/10 p-2 text-[var(--error)] hover:bg-[var(--error)]/20 disabled:opacity-50"
            title="Cancel"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <ChevronRightIcon className="h-5 w-5 text-foreground-muted group-hover:text-[var(--primary)] shrink-0" />
    </Link>
  );

  // Compact booking row for list view
  const BookingRow = ({ booking }: { booking: Booking }) => (
    <Link
      href={`/scheduling/${booking.id}`}
      className="group flex items-center gap-3 py-3 px-4 hover:bg-[var(--background-hover)] transition-colors border-b border-[var(--card-border)] last:border-b-0"
    >
      <div className={cn("w-1 h-8 rounded-full shrink-0", statusBlockColors[booking.status])} />
      <span className="text-sm font-medium text-foreground-muted w-20 shrink-0">
        {formatTime(new Date(booking.startTime))}
      </span>
      <span className="font-medium text-foreground truncate flex-1 group-hover:text-[var(--primary)] flex items-center gap-1.5">
        {booking.isRecurring && (
          <RepeatIcon className="h-3.5 w-3.5 text-[var(--ai)] shrink-0" />
        )}
        {booking.title}
      </span>
      <span className="text-sm text-foreground-muted truncate max-w-[150px] hidden sm:block">
        {booking.client?.fullName || booking.clientName || "No client"}
      </span>
      <StatusBadge status={booking.status} />
      <ChevronRightIcon className="h-4 w-4 text-foreground-muted shrink-0" />
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Scheduling"
        subtitle="Manage your upcoming shoots and bookings"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/scheduling/booking-forms"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <FormIcon className="h-4 w-4" />
              Booking Forms
            </Link>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              New Booking
            </button>
          </div>
        }
      />

      <PageContextNav
        items={[
          { label: "Calendar", href: "/scheduling", icon: <ContextCalendarIcon className="h-4 w-4" /> },
          { label: "Availability", href: "/scheduling/availability", icon: <ContextClockIcon className="h-4 w-4" /> },
          { label: "Time Off", href: "/scheduling/time-off", icon: <TimeOffIcon className="h-4 w-4" />, badge: pendingTimeOffCount },
          { label: "Booking Forms", href: "/scheduling/booking-forms", icon: <FormIcon className="h-4 w-4" /> },
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
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.weekBookings}</p>
              <p className="text-xs text-foreground-muted">This Week</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ai)]/15 text-[var(--ai)]">
              <ClockIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalHours}h</p>
              <p className="text-xs text-foreground-muted">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--warning)]/15 text-[var(--warning)]">
              <AlertIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-foreground-muted">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--success)]/15 text-[var(--success)]">
              <CheckCircleIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.confirmed}</p>
              <p className="text-xs text-foreground-muted">Confirmed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Agenda (only when not viewing a specific day) */}
      {!selectedDate && todaysBookings.length > 0 && (
        <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                <TodayIcon className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Today's Agenda</h3>
                <p className="text-xs text-foreground-muted">{todaysBookings.length} booking{todaysBookings.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {todaysBookings.slice(0, 4).map((booking) => (
              <Link
                key={booking.id}
                href={`/scheduling/${booking.id}`}
                className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 shrink-0 hover:border-[var(--border-hover)]"
              >
                <div className={cn("w-1 h-6 rounded-full", statusBlockColors[booking.status])} />
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1">
                    {booking.isRecurring && <RepeatIcon className="h-2.5 w-2.5 text-[var(--ai)]" />}
                    {formatTime(new Date(booking.startTime))}
                  </p>
                  <p className="text-xs text-foreground-muted truncate max-w-[120px]">{booking.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm sm:flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                statusFilter === status
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className={cn(
                "rounded-full px-1.5 text-[10px]",
                statusFilter === status ? "bg-white/20" : "bg-[var(--background)]"
              )}>
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Container */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        {/* Calendar Header */}
        <div className="flex flex-col gap-3 border-b border-[var(--card-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              {calendarView === "month"
                ? getMonthLabel(new Date(currentMonth.year, currentMonth.month))
                : calendarView === "week"
                ? `Week of ${formatDate(weekDays[0].date)}`
                : "All Bookings"
              }
            </h3>
            <button
              onClick={goToToday}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20"
            >
              Today
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-0.5">
              {(["week", "month", "list"] as CalendarViewMode[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    calendarView === view
                      ? "bg-[var(--primary)] text-white"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>

            {/* Navigation */}
            {calendarView !== "list" && (
              <div className="flex gap-1">
                <button
                  onClick={calendarView === "month" ? goToPreviousMonth : goToPreviousWeek}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={calendarView === "month" ? goToNextMonth : goToNextWeek}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-4">
          {calendarView === "month" && !selectedDate && (
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-foreground-muted py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthWeeks.flat().map((day, index) => {
                  const isCurrentMonth = day.date.getMonth() === currentMonth.month;
                  const dayBookings = getBookingsForDate(day.date);
                  const dayTimeOff = getTimeOffForDate(day.date);
                  const hasTimeOffToday = dayTimeOff.length > 0;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={cn(
                        "min-h-[100px] p-1.5 rounded-lg border text-left transition-all flex flex-col",
                        isCurrentMonth
                          ? "bg-[var(--background)] border-[var(--card-border)] hover:border-[var(--primary)]/50"
                          : "bg-[var(--background)]/50 border-transparent",
                        day.isToday && "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--card)]",
                        hasTimeOffToday && "bg-[var(--foreground-muted)]/5"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium mb-1",
                        isCurrentMonth ? "text-foreground" : "text-foreground-muted",
                        day.isToday && "text-[var(--primary)]"
                      )}>
                        {day.dayNumber}
                      </span>

                      {/* Time-off blocks */}
                      {hasTimeOffToday && (
                        <div className="space-y-0.5 mb-0.5">
                          {dayTimeOff.slice(0, 1).map((block) => (
                            <TimeOffBlockDisplay key={block.id} block={block} compact />
                          ))}
                        </div>
                      )}

                      {/* Event blocks */}
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        {dayBookings.slice(0, hasTimeOffToday ? 2 : 3).map((booking) => (
                          <EventBlock key={booking.id} booking={booking} compact={dayBookings.length > 2} />
                        ))}
                        {dayBookings.length > (hasTimeOffToday ? 2 : 3) && (
                          <span className="text-[10px] text-foreground-muted font-medium px-1">
                            +{dayBookings.length - (hasTimeOffToday ? 2 : 3)} more
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              </div>
            </div>
          )}

          {calendarView === "week" && !selectedDate && (
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => {
                    const dayBookings = getBookingsForDate(day.date);
                    const dayTimeOff = getTimeOffForDate(day.date);
                    const hasTimeOffToday = dayTimeOff.length > 0;

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day.date)}
                        className={cn(
                          "min-h-[200px] p-2 rounded-xl border text-left transition-all flex flex-col",
                          "bg-[var(--background)] border-[var(--card-border)] hover:border-[var(--primary)]/50",
                          day.isToday && "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--card)]",
                          hasTimeOffToday && "bg-[var(--foreground-muted)]/5"
                        )}
                      >
                        <div className="text-center mb-2">
                          <span className="text-xs text-foreground-muted">{day.dayName}</span>
                          <span
                            className={cn(
                              "block text-lg font-semibold",
                              day.isToday ? "text-[var(--primary)]" : "text-foreground"
                            )}
                          >
                            {day.dayNumber}
                          </span>
                        </div>

                        {/* Time-off blocks */}
                        {hasTimeOffToday && (
                          <div className="space-y-1 mb-1">
                            {dayTimeOff.map((block) => (
                              <TimeOffBlockDisplay key={block.id} block={block} />
                            ))}
                          </div>
                        )}

                        <div className="flex-1 space-y-1 overflow-hidden">
                          {dayBookings.map((booking) => (
                            <EventBlock key={booking.id} booking={booking} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {calendarView === "list" && !selectedDate && (
            <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
              {sortedDays.length > 0 ? (
                sortedDays.map((dayKey) => (
                  <div key={dayKey}>
                    <div className="bg-[var(--background-secondary)] px-4 py-2 border-b border-[var(--card-border)]">
                      <span className="text-sm font-semibold text-foreground">
                        {getRelativeDay(new Date(dayKey))}
                      </span>
                      <span className="text-xs text-foreground-muted ml-2">
                        {bookingsByDay[dayKey].length} booking{bookingsByDay[dayKey].length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {bookingsByDay[dayKey].map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <CalendarIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                  <p className="mt-3 text-foreground-muted">No bookings found</p>
                </div>
              )}
            </div>
          )}

          {/* Day Detail View */}
          {selectedDate && (
            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{formatLongDate(selectedDate)}</h2>
                  <p className="text-sm text-foreground-muted">
                    {selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Back to calendar
                </button>
              </div>

              {selectedDayBookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--card-border)] py-12 text-center">
                  <CalendarIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                  <h3 className="mt-3 text-base font-medium text-foreground">No bookings</h3>
                  <p className="mt-1 text-sm text-foreground-muted">No shoots scheduled for this day.</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
                  >
                    <PlusIcon className="h-4 w-4" />
                    New Booking
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateBookingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleBookingCreated}
        clients={clients}
      />
    </>
  );
}

// Icons
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

function TimeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM5 3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 17a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM17.25 17a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM9 10a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1 0-1.5h5.5A.75.75 0 0 1 9 10ZM17.25 10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 16.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
    </svg>
  );
}

function UnavailableIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
    </svg>
  );
}

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0v2.43l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389 5.5 5.5 0 0 1 9.2-2.466l.312.311h-2.433a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.22Z" clipRule="evenodd" />
    </svg>
  );
}

function FormIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}
