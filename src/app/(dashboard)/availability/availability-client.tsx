"use client";

import { useState } from "react";
import {
  Clock,
  Calendar,
  CalendarOff,
  Plus,
  Trash2,
  Save,
  RefreshCcw,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface WorkingHours {
  enabled: boolean;
  start: string;
  end: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

interface AvailabilitySettings {
  weeklyHours: Record<string, WorkingHours>;
  blockedDates: BlockedDate[];
  bufferTime: number;
  minLeadTime: number;
  maxAdvanceBooking: number;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_SETTINGS: AvailabilitySettings = {
  weeklyHours: {
    Monday: { enabled: true, start: "09:00", end: "17:00" },
    Tuesday: { enabled: true, start: "09:00", end: "17:00" },
    Wednesday: { enabled: true, start: "09:00", end: "17:00" },
    Thursday: { enabled: true, start: "09:00", end: "17:00" },
    Friday: { enabled: true, start: "09:00", end: "17:00" },
    Saturday: { enabled: false, start: "10:00", end: "14:00" },
    Sunday: { enabled: false, start: "10:00", end: "14:00" },
  },
  blockedDates: [
    { id: "1", date: "2025-01-20", reason: "Personal Day" },
    { id: "2", date: "2025-01-25", reason: "Team Retreat" },
    { id: "3", date: "2025-02-14", reason: "Vacation" },
  ],
  bufferTime: 30,
  minLeadTime: 24,
  maxAdvanceBooking: 90,
};

export function AvailabilityClient() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AvailabilitySettings>(DEFAULT_SETTINGS);
  const [newBlockedDate, setNewBlockedDate] = useState({ date: "", reason: "" });
  const [showAddBlock, setShowAddBlock] = useState(false);

  const handleToggleDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      weeklyHours: {
        ...prev.weeklyHours,
        [day]: {
          ...prev.weeklyHours[day],
          enabled: !prev.weeklyHours[day].enabled,
        },
      },
    }));
  };

  const handleTimeChange = (day: string, field: "start" | "end", value: string) => {
    setSettings((prev) => ({
      ...prev,
      weeklyHours: {
        ...prev.weeklyHours,
        [day]: {
          ...prev.weeklyHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate.date) return;

    setSettings((prev) => ({
      ...prev,
      blockedDates: [
        ...prev.blockedDates,
        {
          id: Date.now().toString(),
          date: newBlockedDate.date,
          reason: newBlockedDate.reason || "Blocked",
        },
      ],
    }));
    setNewBlockedDate({ date: "", reason: "" });
    setShowAddBlock(false);
    showToast("Blocked date added", "success");
  };

  const handleRemoveBlockedDate = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d.id !== id),
    }));
    showToast("Blocked date removed", "success");
  };

  const handleSave = () => {
    showToast("Availability settings saved", "success");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const enabledDaysCount = Object.values(settings.weeklyHours).filter((d) => d.enabled).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Working Days</p>
            <Calendar className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{enabledDaysCount}</p>
          <p className="text-xs text-foreground-muted">per week</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Blocked Dates</p>
            <CalendarOff className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{settings.blockedDates.length}</p>
          <p className="text-xs text-foreground-muted">upcoming</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Buffer Time</p>
            <Clock className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{settings.bufferTime} min</p>
          <p className="text-xs text-foreground-muted">between sessions</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Lead Time</p>
            <RefreshCcw className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{settings.minLeadTime}h</p>
          <p className="text-xs text-foreground-muted">minimum notice</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Hours */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Weekly Working Hours</h3>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const hours = settings.weeklyHours[day];
              return (
                <div
                  key={day}
                  className="flex items-center justify-between gap-4 py-2 border-b border-[var(--card-border)] last:border-0"
                >
                  <div className="flex items-center gap-3 w-28">
                    <button
                      onClick={() => handleToggleDay(day)}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                        hours.enabled
                          ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                          : "border-[var(--card-border)] text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <span className={`text-sm ${hours.enabled ? "text-foreground" : "text-foreground-muted"}`}>
                      {day}
                    </span>
                  </div>
                  {hours.enabled ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={hours.start}
                        onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                        className="rounded border border-[var(--card-border)] bg-[var(--card)] px-2 py-1 text-sm text-foreground"
                      />
                      <span className="text-foreground-muted">to</span>
                      <input
                        type="time"
                        value={hours.end}
                        onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                        className="rounded border border-[var(--card-border)] bg-[var(--card)] px-2 py-1 text-sm text-foreground"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-foreground-muted">Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Blocked Dates */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Blocked Dates</h3>
            <Button variant="outline" size="sm" onClick={() => setShowAddBlock(!showAddBlock)}>
              {showAddBlock ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showAddBlock ? "Cancel" : "Add Block"}
            </Button>
          </div>

          {showAddBlock && (
            <div className="mb-4 p-4 rounded-lg bg-[var(--background-tertiary)] space-y-3">
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Date</label>
                <input
                  type="date"
                  value={newBlockedDate.date}
                  onChange={(e) => setNewBlockedDate((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-muted mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={newBlockedDate.reason}
                  onChange={(e) => setNewBlockedDate((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Vacation, Personal Day"
                  className="w-full rounded border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                />
              </div>
              <Button onClick={handleAddBlockedDate} size="sm">
                Add Blocked Date
              </Button>
            </div>
          )}

          {settings.blockedDates.length === 0 ? (
            <p className="text-sm text-foreground-muted text-center py-8">No blocked dates set</p>
          ) : (
            <div className="space-y-2">
              {settings.blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-tertiary)]"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatDate(blocked.date)}</p>
                    <p className="text-xs text-foreground-muted">{blocked.reason}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedDate(blocked.id)}
                    className="p-1 text-foreground-muted hover:text-[var(--error)] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Settings */}
      <div className="card p-6">
        <h3 className="font-medium text-foreground mb-4">Booking Settings</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Buffer Time Between Sessions
            </label>
            <select
              value={settings.bufferTime}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, bufferTime: parseInt(e.target.value) }))
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
            >
              <option value="0">No buffer</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
            <p className="mt-1 text-xs text-foreground-muted">Time between back-to-back bookings</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Minimum Lead Time
            </label>
            <select
              value={settings.minLeadTime}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, minLeadTime: parseInt(e.target.value) }))
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
            >
              <option value="0">No minimum</option>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="4">4 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours (1 day)</option>
              <option value="48">48 hours (2 days)</option>
              <option value="72">72 hours (3 days)</option>
              <option value="168">1 week</option>
            </select>
            <p className="mt-1 text-xs text-foreground-muted">Advance notice required for bookings</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Max Advance Booking
            </label>
            <select
              value={settings.maxAdvanceBooking}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, maxAdvanceBooking: parseInt(e.target.value) }))
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
            >
              <option value="7">1 week</option>
              <option value="14">2 weeks</option>
              <option value="30">1 month</option>
              <option value="60">2 months</option>
              <option value="90">3 months</option>
              <option value="180">6 months</option>
              <option value="365">1 year</option>
            </select>
            <p className="mt-1 text-xs text-foreground-muted">How far in advance clients can book</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" />
          Save Availability
        </Button>
      </div>
    </div>
  );
}
