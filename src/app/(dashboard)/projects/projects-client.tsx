"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { PageContextNav } from "@/components/dashboard";
import {
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  createColumn,
  updateColumn,
  deleteColumn,
  addSubtask,
  toggleSubtask,
} from "@/lib/actions/projects";
import type { TaskPriority } from "@prisma/client";

// Types
interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: TaskPriority;
  position: number;
  dueDate: Date | null;
  tags: string[];
  assignee: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  client: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  booking: {
    id: string;
    title: string;
    startTime: Date;
  } | null;
  subtasks: Subtask[];
  _count: {
    comments: number;
    subtasks: number;
  };
}

interface Column {
  id: string;
  name: string;
  color: string | null;
  position: number;
  limit: number | null;
  tasks: Task[];
}

interface Board {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  columns: Column[];
}

interface ProjectsClientProps {
  board: Board;
}

export function ProjectsClient({ board }: ProjectsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // View state
  const [viewMode, setViewMode] = useState<"board" | "list" | "calendar">("board");
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Filter state
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  // Handlers
  const handleAddTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    startTransition(async () => {
      const result = await createTask({
        boardId: board.id,
        columnId,
        title: newTaskTitle.trim(),
      });

      if (result.success) {
        setNewTaskTitle("");
        setShowAddTask(null);
        showToast("Task created", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to create task", "error");
      }
    });
  };

  const handleMoveTask = async (taskId: string, targetColumnId: string, position: number) => {
    startTransition(async () => {
      const result = await moveTask(taskId, targetColumnId, position);

      if (result.success) {
        router.refresh();
      } else {
        showToast(result.error || "Failed to move task", "error");
      }
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    startTransition(async () => {
      const result = await deleteTask(taskId);

      if (result.success) {
        setSelectedTask(null);
        showToast("Task deleted", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete task", "error");
      }
    });
  };

  const handleUpdatePriority = async (taskId: string, priority: TaskPriority) => {
    startTransition(async () => {
      const result = await updateTask(taskId, { priority });

      if (result.success) {
        router.refresh();
      } else {
        showToast(result.error || "Failed to update priority", "error");
      }
    });
  };

  // Drag and drop handlers
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.id) {
      // Find target column's tasks to determine position
      const targetColumn = board.columns.find((c) => c.id === columnId);
      const position = targetColumn?.tasks.length || 0;
      handleMoveTask(draggedTask.id, columnId, position);
    }

    setDraggedTask(null);
  };

  // Filter tasks
  const filterTasks = (tasks: Task[]) => {
    if (priorityFilter === "all") return tasks;
    return tasks.filter((t) => t.priority === priorityFilter);
  };

  // Calculate stats
  const totalTasks = board.columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const completedTasks = board.columns
    .filter((c) => c.name === "Done")
    .reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[var(--card-border)] bg-[var(--card)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{board.name}</h1>
            <p className="mt-0.5 text-sm text-foreground-secondary">
              {totalTasks} tasks · {completedTasks} completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-[var(--card-border)] bg-background p-1">
              {(["board", "list", "calendar"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-[var(--primary)] text-white"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
              className="h-9 rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Context Navigation */}
      <div className="border-b border-[var(--card-border)] px-6 py-3 bg-[var(--background)]">
        <PageContextNav
          items={[
            { label: "Board", href: "/projects", icon: <BoardIcon className="h-4 w-4" /> },
            { label: "Scheduling", href: "/scheduling", icon: <CalendarIcon className="h-4 w-4" /> },
          ]}
        />
      </div>

      {/* Board View */}
      {viewMode === "board" && (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {board.columns.map((column) => (
              <div
                key={column.id}
                className={`w-80 flex-shrink-0 rounded-xl border bg-[var(--background-secondary)] ${
                  dragOverColumn === column.id
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                    : "border-[var(--card-border)]"
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: column.color || "#6b7280" }}
                    />
                    <h3 className="font-medium text-foreground">{column.name}</h3>
                    <span className="rounded-full bg-[var(--background-hover)] px-2 py-0.5 text-xs text-foreground-muted">
                      {filterTasks(column.tasks).length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAddTask(showAddTask === column.id ? null : column.id)}
                    className="rounded-lg p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Task Cards */}
                <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto p-3">
                  {/* Add Task Form */}
                  {showAddTask === column.id && (
                    <div className="rounded-lg border border-[var(--primary)] bg-[var(--card)] p-3">
                      <input
                        type="text"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTask(column.id);
                          if (e.key === "Escape") {
                            setShowAddTask(null);
                            setNewTaskTitle("");
                          }
                        }}
                        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
                        autoFocus
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleAddTask(column.id)}
                          disabled={!newTaskTitle.trim() || isPending}
                          className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddTask(null);
                            setNewTaskTitle("");
                          }}
                          className="rounded-md px-3 py-1 text-xs font-medium text-foreground-secondary hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Task Cards */}
                  {filterTasks(column.tasks).map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => setSelectedTask(task)}
                      className={`cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 transition-all hover:border-[var(--border-hover)] hover:shadow-sm ${
                        draggedTask?.id === task.id ? "opacity-50" : ""
                      }`}
                    >
                      {/* Priority & Tags */}
                      <div className="mb-2 flex items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        {task.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-[var(--background-hover)] px-1.5 py-0.5 text-xs text-foreground-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-medium text-foreground">{task.title}</h4>

                      {/* Description preview */}
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-foreground-muted">
                          {task.description}
                        </p>
                      )}

                      {/* Links */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.client && (
                          <span className="inline-flex items-center gap-1 rounded bg-[var(--primary)]/10 px-1.5 py-0.5 text-xs text-[var(--primary)]">
                            <UserIcon className="h-3 w-3" />
                            {task.client.fullName || task.client.email}
                          </span>
                        )}
                        {task.project && (
                          <span className="inline-flex items-center gap-1 rounded bg-[var(--ai)]/10 px-1.5 py-0.5 text-xs text-[var(--ai)]">
                            <GalleryIcon className="h-3 w-3" />
                            {task.project.name}
                          </span>
                        )}
                        {task.booking && (
                          <span className="inline-flex items-center gap-1 rounded bg-[var(--success)]/10 px-1.5 py-0.5 text-xs text-[var(--success)]">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(task.booking.startTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-3 flex items-center justify-between text-xs text-foreground-muted">
                        <div className="flex items-center gap-3">
                          {task._count.subtasks > 0 && (
                            <span className="flex items-center gap-1">
                              <ChecklistIcon className="h-3.5 w-3.5" />
                              {task.subtasks.filter((s) => s.isCompleted).length}/
                              {task._count.subtasks}
                            </span>
                          )}
                          {task._count.comments > 0 && (
                            <span className="flex items-center gap-1">
                              <CommentIcon className="h-3.5 w-3.5" />
                              {task._count.comments}
                            </span>
                          )}
                        </div>
                        {task.dueDate && (
                          <span
                            className={`flex items-center gap-1 ${
                              new Date(task.dueDate) < new Date()
                                ? "text-[var(--error)]"
                                : ""
                            }`}
                          >
                            <ClockIcon className="h-3.5 w-3.5" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.assignee && (
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]"
                            title={task.assignee.fullName || undefined}
                          >
                            {task.assignee.fullName?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {filterTasks(column.tasks).length === 0 && showAddTask !== column.id && (
                    <div className="py-8 text-center">
                      <p className="text-sm text-foreground-muted">No tasks</p>
                      <button
                        onClick={() => setShowAddTask(column.id)}
                        className="mt-2 text-sm text-[var(--primary)] hover:underline"
                      >
                        Add a task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Column Button */}
            <button className="flex h-12 w-80 flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--card-border)] text-sm text-foreground-muted transition-colors hover:border-[var(--border-hover)] hover:text-foreground">
              <PlusIcon className="h-4 w-4" />
              Add Column
            </button>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {board.columns.flatMap((column) =>
                  filterTasks(column.tasks).map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="cursor-pointer hover:bg-[var(--background-hover)]"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{task.title}</p>
                          {task.description && (
                            <p className="mt-0.5 line-clamp-1 text-sm text-foreground-muted">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${column.color}20`,
                            color: column.color || "#6b7280",
                          }}
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: column.color || "#6b7280" }}
                          />
                          {column.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground-secondary">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
                              {task.assignee.fullName?.charAt(0) || "?"}
                            </div>
                            <span className="text-sm text-foreground">
                              {task.assignee.fullName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-foreground-muted">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View (Placeholder) */}
      {viewMode === "calendar" && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Calendar View</h3>
            <p className="mt-1 text-sm text-foreground-secondary">
              Calendar view coming soon. View tasks by due date.
            </p>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={() => handleDeleteTask(selectedTask.id)}
          onUpdatePriority={(p) => handleUpdatePriority(selectedTask.id, p)}
        />
      )}
    </div>
  );
}

// Helper Components
function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = {
    urgent: { bg: "bg-red-500/10", text: "text-red-500", label: "Urgent" },
    high: { bg: "bg-orange-500/10", text: "text-orange-500", label: "High" },
    medium: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Medium" },
    low: { bg: "bg-gray-500/10", text: "text-gray-500", label: "Low" },
  };

  const { bg, text, label } = config[priority];

  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function TaskDetailModal({
  task,
  onClose,
  onDelete,
  onUpdatePriority,
}: {
  task: Task;
  onClose: () => void;
  onDelete: () => void;
  onUpdatePriority: (priority: TaskPriority) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--card-border)] p-6">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={task.priority} />
            </div>
            <h2 className="mt-2 text-lg font-semibold text-foreground">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Description</h3>
              <p className="text-sm text-foreground-secondary">{task.description}</p>
            </div>
          )}

          {/* Linked Entities */}
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-medium text-foreground">Links</h3>
            <div className="flex flex-wrap gap-2">
              {task.client && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-sm text-[var(--primary)]">
                  <UserIcon className="h-4 w-4" />
                  {task.client.fullName || task.client.email}
                </span>
              )}
              {task.project && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--ai)]/10 px-3 py-1.5 text-sm text-[var(--ai)]">
                  <GalleryIcon className="h-4 w-4" />
                  {task.project.name}
                </span>
              )}
              {task.booking && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--success)]/10 px-3 py-1.5 text-sm text-[var(--success)]">
                  <CalendarIcon className="h-4 w-4" />
                  {task.booking.title}
                </span>
              )}
              {!task.client && !task.project && !task.booking && (
                <span className="text-sm text-foreground-muted">No linked items</span>
              )}
            </div>
          </div>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Subtasks ({task.subtasks.filter((s) => s.isCompleted).length}/
                {task.subtasks.length})
              </h3>
              <div className="space-y-1">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-[var(--background-hover)]"
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        subtask.isCompleted
                          ? "border-[var(--success)] bg-[var(--success)] text-white"
                          : "border-[var(--card-border)]"
                      }`}
                    >
                      {subtask.isCompleted && <CheckIcon className="h-3 w-3" />}
                    </div>
                    <span
                      className={`text-sm ${
                        subtask.isCompleted
                          ? "text-foreground-muted line-through"
                          : "text-foreground"
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Selector */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-foreground">Priority</h3>
            <div className="flex gap-2">
              {(["urgent", "high", "medium", "low"] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdatePriority(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    task.priority === p
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--background-hover)] text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-foreground">Due Date</h3>
              <p className="text-sm text-foreground-secondary">
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--card-border)] p-4">
          <button
            onClick={onDelete}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10"
          >
            Delete Task
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ChecklistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BoardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25Zm.5 3.25a.5.5 0 0 1 .5-.5h2.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-.5.5h-2.5a.5.5 0 0 1-.5-.5v-8.5Zm5.5-.5a.5.5 0 0 0-.5.5v5.5a.5.5 0 0 0 .5.5h2.5a.5.5 0 0 0 .5-.5v-5.5a.5.5 0 0 0-.5-.5h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}
