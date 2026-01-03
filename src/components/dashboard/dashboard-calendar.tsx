"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type DashboardEventType = "task" | "booking" | "open_house";

export type DashboardCalendarEvent = {
  id: string;
  title: string;
  subtitle?: string | null;
  date: string;
  href?: string;
  type: DashboardEventType;
};

type CalendarView = "week" | "month" | "list";

type CalendarEvent = DashboardCalendarEvent & {
  dateObject: Date;
  dateKey: string;
};

const VIEW_OPTIONS: { id: CalendarView; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "list", label: "List" },
];

const FILTER_OPTIONS: { id: DashboardEventType; label: string }[] = [
  { id: "task", label: "Tasks" },
  { id: "booking", label: "Appointments" },
  { id: "open_house", label: "Open Houses" },
];

const EVENT_PILL_STYLES: Record<DashboardEventType, string> = {
  task: "bg-[var(--warning)]/20 border-[var(--warning)]/40 text-[var(--warning)]",
  booking: "bg-[var(--primary)] border-[var(--primary)] text-white",
  open_house: "bg-[var(--success)] border-[var(--success)] text-white",
};

const EVENT_DOT_STYLES: Record<DashboardEventType, string> = {
  task: "bg-[var(--warning)]",
  booking: "bg-[var(--primary)]",
  open_house: "bg-[var(--success)]",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function endOfWeek(date: Date) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function DashboardCalendar({ events }: { events: DashboardCalendarEvent[] }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now);
  const [viewMode, setViewMode] = useState<CalendarView>("month");
  const [isCompact, setIsCompact] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DashboardEventType[]>([
    "task",
    "booking",
    "open_house",
  ]);

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < 640;
      setIsCompact(compact);
      setViewMode((prev) => (compact && prev === "month" ? "list" : prev));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const normalizedEvents = useMemo<CalendarEvent[]>(() => {
    return events
      .map((event) => {
        const dateObject = new Date(event.date);
        if (Number.isNaN(dateObject.getTime())) return null;
        return {
          ...event,
          dateObject,
          dateKey: toDateKey(dateObject),
        };
      })
      .filter((event): event is CalendarEvent => !!event && activeFilters.includes(event.type))
      .sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime());
  }, [events, activeFilters]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    normalizedEvents.forEach((event) => {
      const existing = map.get(event.dateKey) ?? [];
      existing.push(event);
      map.set(event.dateKey, existing);
    });
    return map;
  }, [normalizedEvents]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthStart = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    [currentMonth]
  );
  const monthEnd = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999),
    [currentMonth]
  );

  const gridDays = useMemo(() => {
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    const days: Date[] = [];
    for (let day = new Date(start); day <= end; day = addDays(day, 1)) {
      days.push(new Date(day));
    }
    return days;
  }, [monthStart, monthEnd]);

  const weekRange = useMemo(() => {
    return {
      start: startOfWeek(selectedDate),
      end: endOfWeek(selectedDate),
    };
  }, [selectedDate]);

  const listEvents = useMemo(() => {
    if (viewMode === "week") {
      return normalizedEvents.filter(
        (event) =>
          event.dateObject.getTime() >= weekRange.start.getTime() &&
          event.dateObject.getTime() <= weekRange.end.getTime()
      );
    }

    if (viewMode === "list") {
      return normalizedEvents.filter(
        (event) =>
          event.dateObject.getTime() >= monthStart.getTime() &&
          event.dateObject.getTime() <= monthEnd.getTime()
      );
    }

    return normalizedEvents;
  }, [normalizedEvents, weekRange, viewMode, monthStart, monthEnd]);

  const groupedListEvents = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    listEvents.forEach((event) => {
      const existing = map.get(event.dateKey) ?? [];
      existing.push(event);
      map.set(event.dateKey, existing);
    });
    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        date: items[0].dateObject,
        items,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [listEvents]);

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const toggleFilter = (filter: DashboardEventType) => {
    setActiveFilters((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((item) => item !== filter);
      }
      return [...prev, filter];
    });
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--card-border)] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">{monthLabel}</h3>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20"
          >
            Today
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-0.5">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setViewMode(option.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  viewMode === option.id
                    ? "bg-[var(--primary)] text-white"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => toggleFilter(filter.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                  isActive
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--card-border)] text-foreground-muted hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {viewMode === "month" && (
          <div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-medium text-foreground-muted py-1 sm:text-xs sm:py-2"
                >
                  {isCompact ? day.charAt(0) : day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {gridDays.map((day) => {
                const dateKey = toDateKey(day);
                const dayEvents = eventsByDate.get(dateKey) ?? [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, now);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "min-h-[80px] p-1.5 rounded-lg border text-left transition-all flex flex-col sm:min-h-[100px]",
                      isCurrentMonth
                        ? "bg-[var(--background)] border-[var(--card-border)] hover:border-[var(--primary)]/50"
                        : "bg-[var(--background)]/50 border-transparent",
                      isSelected &&
                        "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--card)]"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium mb-1 sm:text-sm",
                        isCurrentMonth ? "text-foreground" : "text-foreground-muted",
                        isSelected && "text-[var(--primary)]",
                        !isSelected && isToday && "text-[var(--primary)]"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => {
                        const pill = (
                          <span className="truncate flex items-center gap-0.5">
                            {event.title}
                          </span>
                        );
                        const pillClasses = cn(
                          "block rounded px-1.5 py-0.5 text-[10px] font-medium truncate transition-opacity hover:opacity-80 border leading-tight",
                          EVENT_PILL_STYLES[event.type]
                        );

                        return (
                          <div key={event.id} className={pillClasses} title={event.title}>
                            {pill}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-foreground-muted">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {viewMode !== "month" && (
          <div className="space-y-6">
            {groupedListEvents.length === 0 && (
              <div className="rounded-lg border border-dashed border-[var(--card-border)] px-4 py-8 text-center text-sm text-foreground-muted">
                No events in this range.
              </div>
            )}
            {groupedListEvents.map((group) => (
              <div key={group.key} className="space-y-2">
                <div className="text-sm font-semibold text-foreground">
                  {group.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)]/60">
                  <div className="divide-y divide-[var(--card-border)]">
                    {group.items.map((event) => {
                      const timeLabel = event.dateObject.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      });

                      const content = (
                        <div className="flex items-start gap-3 px-4 py-3">
                          <span
                            className={cn(
                              "mt-1 h-2 w-2 rounded-full",
                              EVENT_DOT_STYLES[event.type]
                            )}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">{event.title}</div>
                            {event.subtitle && (
                              <div className="text-xs text-foreground-muted">{event.subtitle}</div>
                            )}
                          </div>
                          <div className="text-xs text-foreground-muted">{timeLabel}</div>
                        </div>
                      );

                      if (event.href) {
                        return (
                          <Link key={event.id} href={event.href} className="block hover:bg-[var(--background-hover)]">
                            {content}
                          </Link>
                        );
                      }

                      return <div key={event.id}>{content}</div>;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
