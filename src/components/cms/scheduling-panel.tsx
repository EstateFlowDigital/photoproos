"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  CalendarClock,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface SchedulingPanelProps {
  /** Current scheduled date (if any) */
  scheduledAt: Date | null;
  /** Scheduled by user name */
  scheduledBy?: string | null;
  /** Callback when schedule is set/updated */
  onSchedule: (date: Date) => Promise<{ success: boolean; error?: string }>;
  /** Callback when schedule is cancelled */
  onCancelSchedule: () => Promise<{ success: boolean; error?: string }>;
  /** Whether the page is already published */
  isPublished?: boolean;
  /** Whether scheduling is disabled */
  disabled?: boolean;
}

/**
 * Format date for datetime-local input
 */
function formatDateForInput(date: Date): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

/**
 * Format date for display
 */
function formatDateForDisplay(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Get time until date
 */
function getTimeUntil(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff < 0) return "Past due";

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `in ${days} day${days !== 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
}

/**
 * Scheduling panel for marketing pages
 */
export function SchedulingPanel({
  scheduledAt,
  scheduledBy,
  onSchedule,
  onCancelSchedule,
  isPublished = false,
  disabled = false,
}: SchedulingPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeUntil, setTimeUntil] = useState<string | null>(null);

  // Initialize selected date when editing starts
  useEffect(() => {
    if (isEditing && scheduledAt) {
      setSelectedDate(formatDateForInput(scheduledAt));
    }
  }, [isEditing, scheduledAt]);

  // Update time until periodically
  useEffect(() => {
    if (!scheduledAt) {
      setTimeUntil(null);
      return;
    }

    const updateTimeUntil = () => {
      setTimeUntil(getTimeUntil(scheduledAt));
    };

    updateTimeUntil();
    const interval = setInterval(updateTimeUntil, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [scheduledAt]);

  // Get minimum date (5 minutes from now)
  const getMinDate = useCallback(() => {
    const minDate = new Date();
    minDate.setMinutes(minDate.getMinutes() + 5);
    return formatDateForInput(minDate);
  }, []);

  // Handle schedule submit
  const handleSchedule = async () => {
    if (!selectedDate) {
      setError("Please select a date and time");
      return;
    }

    const date = new Date(selectedDate);
    const now = new Date();

    if (date <= now) {
      setError("Scheduled time must be in the future");
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await onSchedule(date);

    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
      setSelectedDate("");
    } else {
      setError(result.error || "Failed to schedule");
    }
  };

  // Handle cancel schedule
  const handleCancelSchedule = async () => {
    setIsSaving(true);
    setError(null);

    const result = await onCancelSchedule();

    setIsSaving(false);

    if (!result.success) {
      setError(result.error || "Failed to cancel schedule");
    }
  };

  // If published, show info message
  if (isPublished) {
    return (
      <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-full bg-green-500/10"
            aria-hidden="true"
          >
            <Check className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-500">Page is live</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              This page is already published and visible to visitors
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If has scheduled date and not editing, show scheduled info
  if (scheduledAt && !isEditing) {
    return (
      <div className="p-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-full bg-[var(--primary)]/10 mt-0.5"
              aria-hidden="true"
            >
              <CalendarClock className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Scheduled to publish
              </p>
              <p className="text-sm text-[var(--foreground)] mt-1">
                {formatDateForDisplay(scheduledAt)}
              </p>
              {timeUntil && (
                <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                  {timeUntil}
                </p>
              )}
              {scheduledBy && (
                <p className="text-xs text-[var(--foreground-muted)] mt-2">
                  Scheduled by {scheduledBy}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={disabled}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]",
                "hover:bg-[var(--background-elevated)]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Edit
            </button>
            <button
              onClick={handleCancelSchedule}
              disabled={disabled || isSaving}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                "text-[var(--foreground-muted)] hover:text-red-500",
                "hover:bg-red-500/10",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Cancel scheduled publish"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <X className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {error}
          </div>
        )}
      </div>
    );
  }

  // No scheduled date or editing mode
  return (
    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="p-2 rounded-full bg-[var(--background-elevated)]"
          aria-hidden="true"
        >
          <Calendar className="w-4 h-4 text-[var(--foreground-muted)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            Schedule publish
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">
            Automatically publish this page at a future date
          </p>
        </div>
      </div>

      {isEditing || !scheduledAt ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="schedule-datetime"
              className="block text-xs font-medium text-[var(--foreground-secondary)]"
            >
              Publish date and time
            </label>
            <div className="relative">
              <input
                id="schedule-datetime"
                type="datetime-local"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setError(null);
                }}
                min={getMinDate()}
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-sm",
                  "bg-[var(--card)] border border-[var(--border)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                  "text-[var(--foreground)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  error && "border-red-500"
                )}
              />
              <Clock
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSchedule}
              disabled={disabled || isSaving || !selectedDate}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarClock className="w-4 h-4" aria-hidden="true" />
                  Schedule
                </>
              )}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedDate("");
                  setError(null);
                }}
                disabled={isSaving}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                  "hover:bg-[var(--background-elevated)]"
                )}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Quick scheduling buttons for common times
 */
export function QuickScheduleButtons({
  onSelect,
  disabled = false,
}: {
  onSelect: (date: Date) => void;
  disabled?: boolean;
}) {
  const quickOptions = [
    {
      label: "In 1 hour",
      getDate: () => {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        return date;
      },
    },
    {
      label: "Tomorrow 9am",
      getDate: () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(9, 0, 0, 0);
        return date;
      },
    },
    {
      label: "Next Monday 9am",
      getDate: () => {
        const date = new Date();
        const daysUntilMonday = ((8 - date.getDay()) % 7) || 7;
        date.setDate(date.getDate() + daysUntilMonday);
        date.setHours(9, 0, 0, 0);
        return date;
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickOptions.map((option) => (
        <button
          key={option.label}
          onClick={() => onSelect(option.getDate())}
          disabled={disabled}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            "bg-[var(--background-elevated)] text-[var(--foreground-secondary)]",
            "hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
