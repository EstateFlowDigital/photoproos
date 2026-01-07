"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "booking" | "task" | "deadline" | "event";
}

interface CalendarPreviewWidgetProps {
  events?: CalendarEvent[];
  view?: "week" | "month";
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getWeekDays(): Date[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

const EVENT_COLORS: Record<CalendarEvent["type"], string> = {
  booking: "bg-[var(--primary)]",
  task: "bg-[var(--warning)]",
  deadline: "bg-[var(--error)]",
  event: "bg-[var(--success)]",
};

// ============================================================================
// Component
// ============================================================================

export function CalendarPreviewWidget({
  events = [],
  view = "week",
  className,
}: CalendarPreviewWidgetProps) {
  const weekDays = getWeekDays();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get events for a specific day
  const getEventsForDay = (date: Date) =>
    events.filter((event) => isSameDay(event.date, date));

  return (
    <div className={cn("space-y-3", className)}>
      {/* Week View */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={cn(
              "py-1 text-center text-xs font-medium",
              index === 0 || index === 6
                ? "text-foreground-muted"
                : "text-foreground-secondary"
            )}
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {weekDays.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={index}
              className={cn(
                "flex flex-col items-center rounded-lg p-2 transition-colors hover:bg-[var(--background-elevated)]",
                isToday(date) && "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
              )}
              title={
                hasEvents
                  ? `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`
                  : undefined
              }
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  isToday(date) ? "text-[var(--primary)]" : "text-foreground"
                )}
              >
                {date.getDate()}
              </span>
              {hasEvents && (
                <div className="mt-1 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <span
                      key={eventIndex}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        EVENT_COLORS[event.type]
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Today's Events */}
      {events.length > 0 && (
        <div className="border-t border-[var(--card-border)] pt-3">
          <p className="mb-2 text-xs font-medium text-foreground-muted">
            Upcoming
          </p>
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 rounded-md bg-[var(--background-secondary)] px-2 py-1.5"
              >
                <span
                  className={cn(
                    "h-2 w-2 flex-shrink-0 rounded-full",
                    EVENT_COLORS[event.type]
                  )}
                />
                <span className="flex-1 truncate text-xs text-foreground">
                  {event.title}
                </span>
                <span className="text-xs text-foreground-muted">
                  {event.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-foreground-muted">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          Booking
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--warning)]" />
          Task
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--error)]" />
          Deadline
        </span>
      </div>
    </div>
  );
}

export default CalendarPreviewWidget;
