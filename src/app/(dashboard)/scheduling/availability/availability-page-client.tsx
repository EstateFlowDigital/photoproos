"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { AvailabilityBlock, BookingBuffer, CalendarProvider } from "@prisma/client";
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  upsertBookingBuffer,
  addWeeklyRecurringBlock,
  addHolidayBlock,
} from "@/lib/actions/availability";
import { syncGoogleCalendar } from "@/lib/integrations/google-calendar";

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
  time_off: "#ef4444",
  holiday: "#f97316",
  personal: "#8b5cf6",
  maintenance: "#3b82f6",
  other: "#6b7280",
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  time_off: "Time Off",
  holiday: "Holiday",
  personal: "Personal",
  maintenance: "Maintenance",
  other: "Other",
};

export function AvailabilityPageClient({
  availabilityBlocks: initialBlocks,
  defaultBuffer,
  calendarIntegrations,
}: AvailabilityPageClientProps) {
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

  const calendarDays = generateCalendarDays();

  // Get blocks for a specific date
  const getBlocksForDate = (date: Date) => {
    return blocks.filter((block) => {
      const blockStart = new Date(block.startDate);
      const blockEnd = new Date(block.endDate);
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
          window.location.reload();
        }
      } else {
        const result = await createAvailabilityBlock({
          title: newBlock.title,
          blockType: newBlock.blockType,
          startDate: new Date(newBlock.startDate),
          endDate: new Date(newBlock.endDate),
          allDay: newBlock.allDay,
        });
        if (result.success) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error adding block:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm("Are you sure you want to delete this availability block?")) {
      return;
    }

    try {
      const result = await deleteAvailabilityBlock(blockId);
      if (result.success) {
        setBlocks(blocks.filter((b) => b.id !== blockId));
      }
    } catch (error) {
      console.error("Error deleting block:", error);
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
      }
    } catch (error) {
      console.error("Error saving buffer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    setIsSyncing(true);
    try {
      await syncGoogleCalendar(integrationId);
      window.location.reload();
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Availability</h1>
          <p className="text-[#7c7c7c] mt-1">
            Manage your time off, holidays, and booking settings
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBufferModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg text-white hover:bg-[#313131] transition-colors"
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
        <div className="lg:col-span-2 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
          {/* Calendar Header */}
          <div className="flex flex-col gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors"
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
                className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors"
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
                  className="text-center text-xs font-medium text-[#7c7c7c] py-2"
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
                        ? "bg-[#1a1a1a] border-[rgba(255,255,255,0.04)]"
                        : "bg-[#0d0d0d] border-transparent"
                    } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <span
                      className={`text-sm ${
                        isCurrentMonth ? "text-white" : "text-[#4a4a4a]"
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
                        <span className="text-xs text-[#7c7c7c]">
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
          <div className="bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Blocks
              </h3>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {blocks
                .filter((b) => new Date(b.startDate) >= today)
                .slice(0, 5)
                .map((block) => (
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
                        <p className="text-[#7c7c7c] text-sm">
                          {new Date(block.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {block.allDay
                            ? ""
                            : ` at ${new Date(block.startDate).toLocaleTimeString("en-US", {
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
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1.5 text-[#7c7c7c] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              {blocks.filter((b) => new Date(b.startDate) >= today).length === 0 && (
                <div className="p-4 text-center text-[#7c7c7c] text-sm">
                  No upcoming blocks
                </div>
              )}
            </div>
          </div>

          {/* Buffer Settings Preview */}
          <div className="bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Booking Buffer
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#7c7c7c] text-sm">Before booking</span>
                <span className="text-white text-sm">
                  {bufferSettings.bufferBefore} min
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#7c7c7c] text-sm">After booking</span>
                <span className="text-white text-sm">
                  {bufferSettings.bufferAfter} min
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#7c7c7c] text-sm">Min. advance notice</span>
                <span className="text-white text-sm">
                  {bufferSettings.minAdvanceHours} hours
                </span>
              </div>
            </div>
          </div>

          {/* Calendar Integrations */}
          {calendarIntegrations.length > 0 && (
            <div className="bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
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
                        <p className="text-[#7c7c7c] text-xs capitalize">
                          {integration.provider}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={isSyncing}
                      className="p-2 text-[#7c7c7c] hover:text-white transition-colors disabled:opacity-50"
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
          <div className="bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] p-4">
            <h3 className="text-white font-medium mb-3">Legend</h3>
            <div className="space-y-2">
              {Object.entries(BLOCK_TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: BLOCK_TYPE_COLORS[key] }}
                  />
                  <span className="text-[#a7a7a7] text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] w-full max-w-md">
            <div className="flex flex-col gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.08)] sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">Add Availability Block</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#7c7c7c]" />
              </button>
            </div>
            <form onSubmit={handleAddBlock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Vacation, Doctor's Appointment"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
                  Type
                </label>
                <select
                  value={newBlock.blockType}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, blockType: e.target.value as typeof newBlock.blockType })
                  }
                  className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
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
                <label htmlFor="recurring" className="text-sm text-[#a7a7a7]">
                  Repeat weekly
                </label>
              </div>

              {newBlock.isRecurring ? (
                <div>
                  <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newBlock.recurrenceDay}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, recurrenceDay: parseInt(e.target.value) })
                    }
                    className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newBlock.startDate}
                      onChange={(e) => setNewBlock({ ...newBlock, startDate: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newBlock.endDate}
                      onChange={(e) => setNewBlock({ ...newBlock, endDate: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[#a7a7a7] hover:text-white transition-colors"
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
          <div className="bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] w-full max-w-md">
            <div className="flex flex-col gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.08)] sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">Booking Buffer Settings</h2>
              <button
                onClick={() => setShowBufferModal(false)}
                className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#7c7c7c]" />
              </button>
            </div>
            <form onSubmit={handleSaveBuffer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
                  Buffer Before Booking (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bufferSettings.bufferBefore}
                  onChange={(e) =>
                    setBufferSettings({ ...bufferSettings, bufferBefore: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-[#7c7c7c] mt-1">
                  Setup time before each booking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
                  Buffer After Booking (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bufferSettings.bufferAfter}
                  onChange={(e) =>
                    setBufferSettings({ ...bufferSettings, bufferAfter: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-[#7c7c7c] mt-1">
                  Teardown/travel time after each booking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
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
                  className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-[#7c7c7c] mt-1">
                  Clients must book at least this many hours in advance
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a7a7a7] mb-1">
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
                  className="w-full bg-[#1e1e1e] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-[#7c7c7c] mt-1">
                  Maximum days in advance clients can book
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBufferModal(false)}
                  className="px-4 py-2 text-[#a7a7a7] hover:text-white transition-colors"
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
