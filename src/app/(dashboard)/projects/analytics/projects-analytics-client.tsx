"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TaskAnalytics } from "@/lib/actions/projects";

interface ProjectsAnalyticsClientProps {
  analytics: TaskAnalytics;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatStatus(status: string): string {
  const statusLabels: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    in_review: "In Review",
    completed: "Completed",
    blocked: "Blocked",
  };
  return statusLabels[status] || status;
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  urgent: { bg: "bg-[var(--error)]/10", text: "text-[var(--error)]" },
  high: { bg: "bg-[var(--warning)]/10", text: "text-[var(--warning)]" },
  medium: { bg: "bg-[var(--primary)]/10", text: "text-[var(--primary)]" },
  low: { bg: "bg-[var(--foreground-muted)]/10", text: "text-foreground-muted" },
};

const statusColors: Record<string, string> = {
  todo: "var(--foreground-muted)",
  in_progress: "var(--primary)",
  in_review: "var(--ai)",
  completed: "var(--success)",
  blocked: "var(--error)",
};

export function ProjectsAnalyticsClient({ analytics }: ProjectsAnalyticsClientProps) {
  const { summary, byStatus, byPriority, byAssignee, byColumn, completionTrend, timeTracking } = analytics;

  // Get max values for chart scaling
  const maxTrendValue = useMemo(
    () => Math.max(...completionTrend.map((d) => Math.max(d.completed, d.created)), 1),
    [completionTrend]
  );

  const maxColumnCount = useMemo(
    () => Math.max(...byColumn.map((c) => c.count), 1),
    [byColumn]
  );

  // Only show trend chart if there's data
  const hasTrendData = completionTrend.some((d) => d.completed > 0 || d.created > 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Tasks</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {summary.totalTasks}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {summary.completedTasks} completed
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Completion Rate</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {summary.completionRate}%
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--background-hover)]">
            <div
              className="h-full rounded-full bg-[var(--success)] transition-all"
              style={{ width: `${summary.completionRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Overdue Tasks</p>
          <p className={cn(
            "mt-2 text-2xl font-semibold",
            summary.overdueTasks > 0 ? "text-[var(--error)]" : "text-foreground"
          )}>
            {summary.overdueTasks}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {summary.tasksDueToday} due today
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Due This Week</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
            {summary.tasksDueThisWeek}
          </p>
          {summary.avgCompletionTimeMinutes && (
            <p className="mt-1 text-xs text-foreground-muted">
              Avg completion: {formatMinutes(summary.avgCompletionTimeMinutes)}
            </p>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks by Column */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground">Tasks by Column</h3>
          <div className="mt-4 space-y-3">
            {byColumn.map((column) => (
              <div key={column.columnId} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: column.columnColor || "#6b7280" }}
                    />
                    <span className="text-foreground">{column.columnName}</span>
                  </div>
                  <span className="text-foreground-muted">
                    {column.count} ({column.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--background-hover)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(column.count / maxColumnCount) * 100}%`,
                      backgroundColor: column.columnColor || "#6b7280",
                    }}
                  />
                </div>
              </div>
            ))}
            {byColumn.length === 0 && (
              <p className="py-4 text-center text-sm text-foreground-muted">
                No column data available
              </p>
            )}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground">Tasks by Priority</h3>
          <div className="mt-4 space-y-3">
            {byPriority.map((item) => {
              const colors = priorityColors[item.priority] || { bg: "bg-gray-500/10", text: "text-gray-500" };
              return (
                <div key={item.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      colors.bg,
                      colors.text
                    )}>
                      {formatPriority(item.priority)}
                    </span>
                    <span className="text-sm text-foreground">{item.count} tasks</span>
                  </div>
                  <span className="text-sm text-foreground-muted">{item.percentage}%</span>
                </div>
              );
            })}
            {byPriority.length === 0 && (
              <p className="py-4 text-center text-sm text-foreground-muted">
                No priority data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Completion Trend Chart */}
      {hasTrendData && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">30-Day Activity</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[var(--success)]" />
                <span className="text-foreground-muted">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                <span className="text-foreground-muted">Created</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-end gap-1" style={{ height: "120px" }}>
            {completionTrend.map((day, i) => {
              const completedHeight = (day.completed / maxTrendValue) * 100;
              const createdHeight = (day.created / maxTrendValue) * 100;
              const showLabel = i % 5 === 0 || i === completionTrend.length - 1;

              return (
                <div
                  key={day.date}
                  className="group relative flex-1 min-w-0"
                >
                  <div className="flex h-full flex-col items-center justify-end gap-0.5">
                    {day.completed > 0 && (
                      <div
                        className="w-full rounded-t bg-[var(--success)] opacity-80 transition-opacity group-hover:opacity-100"
                        style={{ height: `${completedHeight}%`, minHeight: day.completed > 0 ? "4px" : "0" }}
                      />
                    )}
                    {day.created > 0 && (
                      <div
                        className="w-full rounded-t bg-[var(--primary)] opacity-60 transition-opacity group-hover:opacity-100"
                        style={{ height: `${createdHeight}%`, minHeight: day.created > 0 ? "4px" : "0" }}
                      />
                    )}
                  </div>
                  {showLabel && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-foreground-muted">
                      {day.dateLabel}
                    </div>
                  )}
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--card)] px-2 py-1 text-xs opacity-0 shadow-lg ring-1 ring-[var(--card-border)] transition-opacity group-hover:opacity-100">
                    <p className="font-medium text-foreground">{day.dateLabel}</p>
                    <p className="text-[var(--success)]">{day.completed} completed</p>
                    <p className="text-[var(--primary)]">{day.created} created</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="h-5" /> {/* Space for labels */}
        </div>
      )}

      {/* Team Performance */}
      {byAssignee.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground">Team Performance</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Assignee
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Total
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Completed
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Rate
                  </th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {byAssignee.map((assignee) => (
                  <tr key={assignee.assigneeId || "unassigned"} className="group">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {assignee.assigneeAvatar ? (
                          <img
                            src={assignee.assigneeAvatar}
                            alt=""
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
                            {assignee.assigneeName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-foreground">{assignee.assigneeName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm text-foreground">
                      {assignee.totalTasks}
                    </td>
                    <td className="py-3 text-right text-sm text-foreground">
                      {assignee.completedTasks}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-[var(--success)]">
                      {assignee.completionRate}%
                    </td>
                    <td className="py-3 pl-4" style={{ width: "120px" }}>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--background-hover)]">
                        <div
                          className="h-full rounded-full bg-[var(--success)] transition-all"
                          style={{ width: `${assignee.completionRate}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Time Tracking Stats */}
      {timeTracking.tasksWithTimeTracking > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground">Time Tracking</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                Estimated
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatMinutes(timeTracking.totalEstimatedMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                Actual
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatMinutes(timeTracking.totalActualMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                Tasks Tracked
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {timeTracking.tasksWithTimeTracking}
              </p>
            </div>
            {timeTracking.averageAccuracy !== null && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Estimation Accuracy
                </p>
                <p className={cn(
                  "mt-1 text-lg font-semibold",
                  timeTracking.averageAccuracy >= 80
                    ? "text-[var(--success)]"
                    : timeTracking.averageAccuracy >= 60
                    ? "text-[var(--warning)]"
                    : "text-[var(--error)]"
                )}>
                  {timeTracking.averageAccuracy}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tasks by Status */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="text-sm font-semibold text-foreground">Tasks by Status</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {byStatus.map((item) => (
            <div
              key={item.status}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: statusColors[item.status] || "#6b7280" }}
              />
              <span className="text-sm text-foreground">{formatStatus(item.status)}</span>
              <span className="rounded-full bg-[var(--background-hover)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                {item.count}
              </span>
            </div>
          ))}
          {byStatus.length === 0 && (
            <p className="py-4 text-center text-sm text-foreground-muted">
              No status data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
