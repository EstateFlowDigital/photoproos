"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  Clock,
  Settings,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Checkbox } from "@/components/ui/checkbox";
import type { AvailabilityBlock, BookingBuffer, CalendarProvider } from "@prisma/client";
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  upsertBookingBuffer,
  addWeeklyRecurringBlock,
} from "@/lib/actions/availability";
import { syncGoogleCalendar } from "@/lib/integrations/google-calendar";
import { rrulestr } from "rrule";
import { parseLocalDate } from "@/lib/dates";

interface AvailabilityPageClientProps {
  availabilityBlocks: AvailabilityBlock[];
  defaultBuffer: BookingBuffer | null;
  calendarIntegrations: Array<{
    id: string;
    provider: CalendarProvider;
    name: string;
    color: string;
    lastSyncAt: Date | null;
  }>;
}

const BLOCK_TYPE_COLORS: Record<string, string> = {
  time_off: "var(--error)",
  holiday: "var(--warning)",
  personal: "var(--ai)",
  maintenance: "var(--primary)",
  other: "var(--foreground-muted)",
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  time_off: "Time Off",
  holiday: "Holiday",
  personal: "Personal",
  maintenance: "Maintenance",
  other: "Other",
};

type AvailabilityDisplayBlock = {
  id: string;
  originalBlockId: string;
  title: string;
  blockType: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  isRecurring: boolean;
  isOccurrence: boolean;
};

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

function expandBlocksForRange(
  rawBlocks: AvailabilityBlock[],
  rangeStart: Date,
  rangeEnd: Date
): AvailabilityDisplayBlock[] {
  const expanded: AvailabilityDisplayBlock[] = [];

  for (const block of rawBlocks) {
    const blockStart = toDate(block.startDate);
    const blockEnd = toDate(block.endDate);

    if (!block.isRecurring || !block.recurrenceRule) {
      if (blockStart <= rangeEnd && blockEnd >= rangeStart) {
        expanded.push({
          id: block.id,
          originalBlockId: block.id,
          title: block.title,
          blockType: block.blockType,
          startDate: blockStart,
          endDate: blockEnd,
          allDay: block.allDay,
          isRecurring: false,
          isOccurrence: false,
        });
      }
      continue;
    }

    try {
      const rule = rrulestr(block.recurrenceRule, { dtstart: blockStart });
      const durationMs = blockEnd.getTime() - blockStart.getTime();
      const occurrenceRangeEnd = block.recurrenceEnd
        ? new Date(Math.min(toDate(block.recurrenceEnd).getTime(), rangeEnd.getTime()))
        : rangeEnd;
      const occurrenceRangeStart = new Date(rangeStart.getTime() - durationMs);
      const occurrences = rule.between(occurrenceRangeStart, occurrenceRangeEnd, true);

      for (const occurrence of occurrences) {
        expanded.push({
          id: `${block.id}-${occurrence.getTime()}`,
          originalBlockId: block.id,
          title: block.title,
          blockType: block.blockType,
          startDate: occurrence,
          endDate: new Date(occurrence.getTime() + durationMs),
          allDay: block.allDay,
          isRecurring: true,
          isOccurrence: true,
        });
      }
    } catch {
      // Ignore malformed RRULE strings
    }
  }

  expanded.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  return expanded;
}

export function AvailabilityPageClient({
  availabilityBlocks: initialBlocks,
  defaultBuffer,
  calendarIntegrations,
}: AvailabilityPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBufferModal, setShowBufferModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form state
  const [newBlock, setNewBlock] = useState({
    title: "",
    blockType: "time_off" as const,
    startDate: "",
    endDate: "",
    allDay: true,
    isRecurring: false,
    recurrenceDay: 0,
  });

  const [bufferSettings, setBufferSettings] = useState({
    bufferBefore: defaultBuffer?.bufferBefore || 0,
    bufferAfter: defaultBuffer?.bufferAfter || 0,
    minAdvanceHours: defaultBuffer?.minAdvanceHours || 24,
    maxAdvanceDays: defaultBuffer?.maxAdvanceDays || 90,
  });

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  useEffect(() => {
    setBufferSettings({
      bufferBefore: defaultBuffer?.bufferBefore || 0,
      bufferAfter: defaultBuffer?.bufferAfter || 0,
      minAdvanceHours: defaultBuffer?.minAdvanceHours || 24,
      maxAdvanceDays: defaultBuffer?.maxAdvanceDays || 90,
    });
  }, [defaultBuffer]);

  // Calendar navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = useMemo(() => generateCalendarDays(), [currentMonth]);

  const calendarRangeStart = useMemo(() => {
    const start = new Date(calendarDays[0].date);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [calendarDays]);

  const calendarRangeEnd = useMemo(() => {
    const end = new Date(calendarDays[calendarDays.length - 1].date);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [calendarDays]);

  const calendarDisplayBlocks = useMemo(() => {
    return expandBlocksForRange(blocks, calendarRangeStart, calendarRangeEnd);
  }, [blocks, calendarRangeStart, calendarRangeEnd]);

  // Get blocks for a specific date
  const getBlocksForDate = (date: Date) => {
    return calendarDisplayBlocks.filter((block) => {
      const blockStart = block.startDate;
      const blockEnd = block.endDate;
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      return blockStart <= dateEnd && blockEnd >= dateStart;
    });
  };

  // Handle form submission
  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (newBlock.isRecurring) {
        const result = await addWeeklyRecurringBlock(
          newBlock.title,
          newBlock.recurrenceDay as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          newBlock.blockType
        );
        if (result.success) {
          showToast("Recurring block added successfully", "success");
          setShowAddModal(false);
          router.refresh();
        } else {
          showToast(result.error || "Failed to add block", "error");
        }
      } else {
        const result = await createAvailabilityBlock({
          title: newBlock.title,
          blockType: newBlock.blockType,
          startDate: parseLocalDate(newBlock.startDate),
          endDate: parseLocalDate(newBlock.endDate, { endOfDay: true }),
          allDay: newBlock.allDay,
        });
        if (result.success) {
          showToast("Availability block added successfully", "success");
          setShowAddModal(false);
          router.refresh();
        } else {
          showToast(result.error || "Failed to add block", "error");
        }
      }
    } catch (error) {
      console.error("Error adding block:", error);
      showToast("An error occurred while adding the block", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (blockId: string, isRecurring?: boolean) => {
    const confirmed = await confirm({
      title: "Delete availability block",
      description: isRecurring
        ? "This is a recurring block. Deleting it will remove the entire series."
        : "Are you sure you want to delete this availability block?",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      const result = await deleteAvailabilityBlock(blockId);
      if (result.success) {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
        showToast("Availability block deleted", "success");
      } else {
        showToast(result.error || "Failed to delete block", "error");
      }
    } catch (error) {
      console.error("Error deleting block:", error);
      showToast("An error occurred while deleting the block", "error");
    }
  };

  const handleSaveBuffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await upsertBookingBuffer({
        bufferBefore: bufferSettings.bufferBefore,
        bufferAfter: bufferSettings.bufferAfter,
        minAdvanceHours: bufferSettings.minAdvanceHours,
        maxAdvanceDays: bufferSettings.maxAdvanceDays,
      });
      if (result.success) {
        setShowBufferModal(false);
        showToast("Booking buffer updated", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to update booking buffer", "error");
      }
    } catch (error) {
      console.error("Error saving buffer:", error);
      showToast("An error occurred while saving buffer settings", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    setIsSyncing(true);
    try {
      await syncGoogleCalendar(integrationId);
      showToast("Calendar synced successfully", "success");
      router.refresh();
    } catch (error) {
      console.error("Error syncing:", error);
      showToast("Failed to sync calendar", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const upcomingDisplayBlocks = useMemo(() => {
    const upcomingEnd = new Date(today);
    upcomingEnd.setDate(today.getDate() + 60);
    upcomingEnd.setHours(23, 59, 59, 999);
    return expandBlocksForRange(blocks, today, upcomingEnd).slice(0, 20);
  }, [blocks, today]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Availability</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage your time off, holidays, and booking settings
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBufferModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg text-white hover:bg-[var(--background-hover)] transition-colors"
          >
            <Settings className="w-4 h-4" />
            Buffer Settings
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Block
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
          {/* Calendar Header */}
          <div className="flex flex-col gap-3 px-6 py-4 border-b border-[var(--card-border)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-[var(--background-hover)] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-lg font-semibold text-white">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-[var(--background-hover)] rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-[var(--foreground-muted)] py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, isCurrentMonth }, i) => {
                const dateBlocks = getBlocksForDate(date);
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={i}
                    className={`min-h-[80px] p-2 rounded-lg border transition-colors ${
                      isCurrentMonth
                        ? "bg-[var(--background-tertiary)] border-[var(--border)]"
                        : "bg-[var(--background)] border-transparent"
                    } ${isToday ? "ring-2 ring-[var(--primary)]" : ""}`}
                  >
                    <span
                      className={`text-sm ${
                        isCurrentMonth ? "text-white" : "text-[var(--foreground-muted)]"
                      } ${isToday ? "font-bold" : ""}`}
                    >
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dateBlocks.slice(0, 2).map((block) => (
                        <div
                          key={block.id}
                          className="text-xs px-1.5 py-0.5 rounded truncate"
                          style={{
                            backgroundColor: `${BLOCK_TYPE_COLORS[block.blockType]}20`,
                            color: BLOCK_TYPE_COLORS[block.blockType],
                          }}
                        >
                          {block.title}
                        </div>
                      ))}
                      {dateBlocks.length > 2 && (
                        <span className="text-xs text-[var(--foreground-muted)]">
                          +{dateBlocks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Blocks */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--card-border)]">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Blocks
              </h3>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {upcomingDisplayBlocks.slice(0, 5).map((block) => (
                  <div
                    key={block.id}
                    className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5"
                        style={{ backgroundColor: BLOCK_TYPE_COLORS[block.blockType] }}
                      />
                      <div>
                        <p className="text-white font-medium">{block.title}</p>
                        <p className="text-[var(--foreground-muted)] text-sm">
                          {block.startDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {block.allDay
                            ? ""
                            : ` at ${block.startDate.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}`}
                        </p>
                        {block.isRecurring && (
                          <span className="text-xs text-blue-500">Recurring</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteBlock(block.originalBlockId, block.isRecurring)}
                      className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              {upcomingDisplayBlocks.length === 0 && (
                <div className="p-4 text-center text-[var(--foreground-muted)] text-sm">
                  No upcoming blocks
                </div>
              )}
            </div>
          </div>

          {/* Buffer Settings Preview */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--card-border)]">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Booking Buffer
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[var(--foreground-muted)] text-sm">Before booking</span>
                <span className="text-white text-sm">
                  {bufferSettings.bufferBefore} min
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[var(--foreground-muted)] text-sm">After booking</span>
                <span className="text-white text-sm">
                  {bufferSettings.bufferAfter} min
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[var(--foreground-muted)] text-sm">Min. advance notice</span>
                <span className="text-white text-sm">
                  {bufferSettings.minAdvanceHours} hours
                </span>
              </div>
            </div>
          </div>

          {/* Calendar Integrations */}
          {calendarIntegrations.length > 0 && (
            <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--card-border)]">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Connected Calendars
                </h3>
              </div>
              <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                {calendarIntegrations.map((integration) => (
                  <div key={integration.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: integration.color }}
                      />
                      <div>
                        <p className="text-white text-sm font-medium">{integration.name}</p>
                        <p className="text-[var(--foreground-muted)] text-xs capitalize">
                          {integration.provider}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={isSyncing}
                      className="p-2 text-[var(--foreground-muted)] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-4">
            <h3 className="text-white font-medium mb-3">Legend</h3>
            <div className="space-y-2">
              {Object.entries(BLOCK_TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: BLOCK_TYPE_COLORS[key] }}
                  />
                  <span className="text-[var(--foreground-secondary)] text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] w-full max-w-md">
            <div className="flex flex-col gap-3 px-6 py-4 border-b border-[var(--card-border)] sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">Add Availability Block</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[var(--background-hover)] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[var(--foreground-muted)]" />
              </button>
            </div>
            <form onSubmit={handleAddBlock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Vacation, Doctor's Appointment"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  Type
                </label>
                <select
                  value={newBlock.blockType}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, blockType: e.target.value as typeof newBlock.blockType })
                  }
                  className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {Object.entries(BLOCK_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="recurring"
                  checked={newBlock.isRecurring}
                  onCheckedChange={(checked) => setNewBlock({ ...newBlock, isRecurring: checked === true })}
                />
                <label htmlFor="recurring" className="text-sm text-[var(--foreground-secondary)]">
                  Repeat weekly
                </label>
              </div>

              {newBlock.isRecurring ? (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newBlock.recurrenceDay}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, recurrenceDay: parseInt(e.target.value) })
                    }
                    className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              ) : (
                <div className="auto-grid grid-min-200 grid-gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newBlock.startDate}
                      onChange={(e) => setNewBlock({ ...newBlock, startDate: e.target.value })}
                      className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newBlock.endDate}
                      onChange={(e) => setNewBlock({ ...newBlock, endDate: e.target.value })}
                      className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[var(--foreground-secondary)] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buffer Settings Modal */}
      {showBufferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] w-full max-w-md">
            <div className="flex flex-col gap-3 px-6 py-4 border-b border-[var(--card-border)] sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">Booking Buffer Settings</h2>
              <button
                onClick={() => setShowBufferModal(false)}
                className="p-2 hover:bg-[var(--background-hover)] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[var(--foreground-muted)]" />
              </button>
            </div>
            <form onSubmit={handleSaveBuffer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  Buffer Before Booking (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bufferSettings.bufferBefore}
                  onChange={(e) =>
                    setBufferSettings({ ...bufferSettings, bufferBefore: parseInt(e.target.value) })
                  }
                  className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Setup time before each booking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  Buffer After Booking (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bufferSettings.bufferAfter}
                  onChange={(e) =>
                    setBufferSettings({ ...bufferSettings, bufferAfter: parseInt(e.target.value) })
                  }
                  className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Teardown/travel time after each booking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  Minimum Advance Notice (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bufferSettings.minAdvanceHours || ""}
                  onChange={(e) =>
                    setBufferSettings({
                      ...bufferSettings,
                      minAdvanceHours: e.target.value ? parseInt(e.target.value) : 0,
                    })
                  }
                  className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Clients must book at least this many hours in advance
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  Maximum Advance Booking (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={bufferSettings.maxAdvanceDays || ""}
                  onChange={(e) =>
                    setBufferSettings({
                      ...bufferSettings,
                      maxAdvanceDays: e.target.value ? parseInt(e.target.value) : 90,
                    })
                  }
                  className="w-full bg-[var(--background-elevated)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Maximum days in advance clients can book
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBufferModal(false)}
                  className="px-4 py-2 text-[var(--foreground-secondary)] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
