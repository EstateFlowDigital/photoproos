"use client";

import { useMemo, useState } from "react";
import { isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";

export type DashboardEventType = "task" | "booking" | "open_house";

export interface DashboardCalendarEvent {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  href: string;
  type: DashboardEventType;
  badge?: string;
}

type FilterOption = {
  id: DashboardEventType;
  label: string;
  color: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  { id: "task", label: "Tasks", color: "bg-[var(--primary)]" },
  { id: "booking", label: "Bookings", color: "bg-[var(--success)]" },
  { id: "open_house", label: "Projects", color: "bg-[var(--accent)]" },
];

interface DashboardCalendarProps {
  events: DashboardCalendarEvent[];
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function generateMonthDays(year: number, month: number, events: DashboardCalendarEvent[]): CalendarDay[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();

  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  for (let i = 0; i < startPadding; i++) {
    const paddingDate = new Date(year, month, 1 - (startPadding - i));
    currentWeek.push({
      date: paddingDate,
      dayNumber: paddingDate.getDate(),
      isCurrentMonth: false,
      isToday: isToday(paddingDate),
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    currentWeek.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: isToday(date),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    const remaining = 7 - currentWeek.length;
    for (let i = 1; i <= remaining; i++) {
      const paddingDate = new Date(year, month + 1, i);
      currentWeek.push({
        date: paddingDate,
        dayNumber: paddingDate.getDate(),
        isCurrentMonth: false,
        isToday: isToday(paddingDate),
      });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export function DashboardCalendar({ events }: DashboardCalendarProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const [activeFilters, setActiveFilters] = useState<Record<DashboardEventType, boolean>>(
    FILTER_OPTIONS.reduce((acc, option) => {
      acc[option.id] = true;
      return acc;
    }, {} as Record<DashboardEventType, boolean>)
  );

  const normalizedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        dateObject: new Date(event.date),
      })),
    [events]
  );

  const visibleEvents = useMemo(
    () => normalizedEvents.filter((event) => activeFilters[event.type]),
    [normalizedEvents, activeFilters]
  );

  const monthWeeks = useMemo(
    () => generateMonthDays(currentMonth.year, currentMonth.month, visibleEvents),
    [currentMonth, visibleEvents]
  );

  const dayEvents = useMemo(
    () =>
      visibleEvents.filter((event) =>
        isSameDay(event.dateObject, selectedDate)
      ),
    [selectedDate, visibleEvents]
  );

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      if (direction === "next") {
        if (prev.month === 11) {
          return { year: prev.year + 1, month: 0 };
        }
        return { ...prev, month: prev.month + 1 };
      }
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const filteredCount = useMemo(
    () => monthWeeks.flat().reduce((acc, day) => acc + visibleEvents.filter((event) => isSameDay(event.dateObject, day.date)).length, 0),
    [monthWeeks, visibleEvents]
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(currentMonth.year, currentMonth.month, 1)
      ),
    [currentMonth]
  );

  const filterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground-muted">Scheduler</p>
          <p className="text-lg font-semibold text-foreground">{monthLabel}</p>
          <p className="text-xs text-foreground-muted">
            {filteredCount} events · {filterCount} filter{filterCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() =>
                setActiveFilters((prev) => ({ ...prev, [option.id]: !prev[option.id] }))
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                activeFilters[option.id]
                  ? `${option.color} text-white border-transparent`
                  : "border-[var(--card-border)] text-foreground-muted hover:border-[var(--border-hover)] hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  activeFilters[option.id] ? "bg-white" : `${option.color}`
                )}
              />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="rounded-lg bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-[var(--background-hover)]"
          >
            Prev
          </button>
          <button
            onClick={() =>
              setCurrentMonth({
                year: today.getFullYear(),
                month: today.getMonth(),
              })
            }
            className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs font-medium text-foreground hover:border-[var(--border-hover)]"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="rounded-lg bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-[var(--background-hover)]"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-7 border-b border-[var(--card-border)] bg-[var(--background)] text-xs font-medium text-foreground-muted">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="px-3 py-1.5 text-center">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-[var(--card-border)]">
          {monthWeeks.flatMap((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const eventsForDay = visibleEvents.filter((event) =>
                isSameDay(event.dateObject, day.date)
              );
              const isSelected = isSameDay(day.date, selectedDate);

              return (
                <button
                  key={`${weekIndex}-${dayIndex}-${day.date.toISOString()}`}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    "min-h-[92px] bg-[var(--card)] px-3 py-2 text-left transition-colors hover:bg-[var(--background-hover)]",
                    !day.isCurrentMonth && "text-foreground-muted/60",
                    isSelected && "ring-2 ring-[var(--primary)]/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-medium", day.isToday && "text-[var(--primary)]")}>
                      {day.dayNumber}
                    </span>
                    {eventsForDay.length > 0 && (
                      <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                        {eventsForDay.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Events on {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</h3>
        {dayEvents.length === 0 ? (
          <p className="text-sm text-foreground-muted">No events scheduled for this day.</p>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <a
                key={event.id}
                href={event.href}
                className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
              >
                <div>
                  <p className="font-medium text-foreground">{event.title}</p>
                  {event.subtitle && <p className="text-xs text-foreground-muted">{event.subtitle}</p>}
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-foreground-muted">{event.type}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
