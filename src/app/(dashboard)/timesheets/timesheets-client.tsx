"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Plus,
  Clock,
  Calendar,
  DollarSign,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Project {
  id: string;
  name: string;
  clientName: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  billable: boolean;
}

interface TimesheetsClientProps {
  projects: Project[];
}

export function TimesheetsClient({ projects }: TimesheetsClientProps) {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerProject, setTimerProject] = useState<string>(projects[0]?.id || "");
  const [timerDescription, setTimerDescription] = useState("");
  const [timerBillable, setTimerBillable] = useState(true);

  // Manual entry state
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualProject, setManualProject] = useState(projects[0]?.id || "");
  const [manualDescription, setManualDescription] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualStartTime, setManualStartTime] = useState("09:00");
  const [manualEndTime, setManualEndTime] = useState("10:00");
  const [manualBillable, setManualBillable] = useState(true);

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("timesheet-entries");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        setEntries([]);
      }
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem("timesheet-entries", JSON.stringify(entries));
  }, [entries]);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerStart) {
      interval = setInterval(() => {
        setTimerElapsed(Math.floor((Date.now() - timerStart.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerStart]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const startTimer = () => {
    if (!timerProject) {
      showToast("Please select a project", "error");
      return;
    }
    setTimerStart(new Date());
    setIsTimerRunning(true);
    setTimerElapsed(0);
  };

  const stopTimer = () => {
    if (!timerStart) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timerStart.getTime()) / 60000); // in minutes

    if (duration < 1) {
      showToast("Entry must be at least 1 minute", "error");
      setIsTimerRunning(false);
      setTimerStart(null);
      setTimerElapsed(0);
      return;
    }

    const project = projects.find((p) => p.id === timerProject);

    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      projectId: timerProject,
      projectName: project?.name || "Unknown Project",
      clientName: project?.clientName || "Unknown Client",
      description: timerDescription || "Time entry",
      date: timerStart.toISOString().split("T")[0],
      startTime: timerStart.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      duration,
      billable: timerBillable,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setIsTimerRunning(false);
    setTimerStart(null);
    setTimerElapsed(0);
    setTimerDescription("");
    showToast("Time entry saved", "success");
  };

  const addManualEntry = () => {
    if (!manualProject) {
      showToast("Please select a project", "error");
      return;
    }

    const [startH, startM] = manualStartTime.split(":").map(Number);
    const [endH, endM] = manualEndTime.split(":").map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);

    if (duration <= 0) {
      showToast("End time must be after start time", "error");
      return;
    }

    const project = projects.find((p) => p.id === manualProject);

    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      projectId: manualProject,
      projectName: project?.name || "Unknown Project",
      clientName: project?.clientName || "Unknown Client",
      description: manualDescription || "Time entry",
      date: manualDate,
      startTime: manualStartTime,
      endTime: manualEndTime,
      duration,
      billable: manualBillable,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setShowManualEntry(false);
    setManualDescription("");
    showToast("Time entry added", "success");
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    showToast("Entry deleted", "success");
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekEntries = entries.filter((e) => {
    const entryDate = new Date(e.date);
    return entryDate >= weekDates[0] && entryDate <= weekDates[6];
  });

  const totalMinutes = weekEntries.reduce((sum, e) => sum + e.duration, 0);
  const billableMinutes = weekEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.duration, 0);

  const prevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="space-y-6">
      {/* Timer Card */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-foreground-muted mb-4">Timer</h3>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Timer Display */}
          <div className="flex items-center gap-4">
            <div className="text-4xl font-mono font-bold text-foreground">
              {formatDuration(timerElapsed)}
            </div>
            <Button
              onClick={isTimerRunning ? stopTimer : startTimer}
              className={isTimerRunning ? "bg-[var(--error)] hover:bg-[var(--error)]/90" : ""}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>

          {/* Timer Controls */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <select
              value={timerProject}
              onChange={(e) => setTimerProject(e.target.value)}
              disabled={isTimerRunning}
              className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground disabled:opacity-50"
            >
              <option value="">Select project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.clientName})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              placeholder="What are you working on?"
              className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
            />
            <button
              onClick={() => setTimerBillable(!timerBillable)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                timerBillable
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--background-tertiary)] text-foreground-muted"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              {timerBillable ? "Billable" : "Non-billable"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Clock className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">This Week</p>
              <p className="text-xl font-bold text-foreground">{formatMinutes(totalMinutes)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <DollarSign className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Billable</p>
              <p className="text-xl font-bold text-[var(--success)]">{formatMinutes(billableMinutes)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--foreground-muted)]/10">
              <Briefcase className="h-5 w-5 text-foreground-muted" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Entries</p>
              <p className="text-xl font-bold text-foreground">{weekEntries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-foreground-muted" />
            <span className="text-sm font-medium text-foreground">{formatWeekRange()}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add Entry Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowManualEntry(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-[var(--card)] p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Add Time Entry</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowManualEntry(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Project</label>
                <select
                  value={manualProject}
                  onChange={(e) => setManualProject(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                <input
                  type="text"
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="What did you work on?"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Start Time</label>
                  <input
                    type="time"
                    value={manualStartTime}
                    onChange={(e) => setManualStartTime(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">End Time</label>
                  <input
                    type="time"
                    value={manualEndTime}
                    onChange={(e) => setManualEndTime(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              <button
                onClick={() => setManualBillable(!manualBillable)}
                className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  manualBillable
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : "bg-[var(--background-tertiary)] text-foreground-muted"
                }`}
              >
                <DollarSign className="h-4 w-4" />
                {manualBillable ? "Billable" : "Non-billable"}
              </button>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowManualEntry(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={addManualEntry}>
                  Add Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="card">
        <div className="p-4 border-b border-[var(--card-border)]">
          <h3 className="text-sm font-medium text-foreground">Time Entries</h3>
        </div>

        {weekEntries.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-8 w-8 text-foreground-muted mx-auto" />
            <p className="mt-2 text-sm text-foreground-muted">No entries this week</p>
            <Button onClick={() => setShowManualEntry(true)} className="mt-4" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {weekEntries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <div key={entry.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{entry.projectName}</p>
                      {entry.billable && (
                        <span className="shrink-0 flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs text-[var(--success)]">
                          <DollarSign className="h-3 w-3" />
                          Billable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-muted truncate">{entry.description}</p>
                    <p className="text-xs text-foreground-muted mt-1">
                      {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {" • "}
                      {entry.startTime} - {entry.endTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{formatMinutes(entry.duration)}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                      <Trash2 className="h-4 w-4 text-foreground-muted hover:text-[var(--error)]" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
