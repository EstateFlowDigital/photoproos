"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { PageContextNav, PageHeader } from "@/components/dashboard";
import { VirtualList } from "@/components/ui/virtual-list";
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
import { isSameDay, isToday } from "date-fns";
import { useVirtualizer } from "@tanstack/react-virtual";

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

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  taskCount: number;
}

interface TeamMember {
  id: string;
  clerkUserId: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  company: string | null;
}

interface Gallery {
  id: string;
  name: string;
}

type SortOption = "newest" | "oldest" | "dueDate" | "priority" | "updated";
type DueDateFilter = "all" | "overdue" | "today" | "thisWeek" | "thisMonth" | "noDueDate";

interface ProjectsClientProps {
  board: Board;
  teamMembers: TeamMember[];
  clients: Client[];
  galleries: Gallery[];
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function generateMonthDays(
  year: number,
  month: number,
  tasks: Task[]
): CalendarDay[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  for (let i = 0; i < startPadding; i++) {
    const paddingDate = new Date(year, month, 1 - (startPadding - i));
    const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), paddingDate));
    currentWeek.push({
      date: paddingDate,
      dayNumber: paddingDate.getDate(),
      isToday: isToday(paddingDate),
      isCurrentMonth: false,
      taskCount: dayTasks.length,
    });
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));
    currentWeek.push({
      date,
      dayNumber: day,
      isToday: isToday(date),
      isCurrentMonth: true,
      taskCount: dayTasks.length,
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
      const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), paddingDate));
      currentWeek.push({
        date: paddingDate,
        dayNumber: paddingDate.getDate(),
        isToday: isToday(paddingDate),
        isCurrentMonth: false,
        taskCount: dayTasks.length,
      });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export function ProjectsClient({ board, teamMembers, clients, galleries }: ProjectsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();

  // View state
  const [viewMode, setViewMode] = useState<"board" | "list" | "calendar">("board");
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("all");

  // Sort state
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Expanded task creation
  const [showExpandedCreate, setShowExpandedCreate] = useState(false);
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const allTasks = useMemo(
    () => board.columns.flatMap((column) => column.tasks),
    [board.columns]
  );

  // Comprehensive filtering
  const filteredTasks = useMemo(() => {
    let tasks = allTasks;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.client?.fullName?.toLowerCase().includes(query) ||
          task.client?.email?.toLowerCase().includes(query) ||
          task.project?.name?.toLowerCase().includes(query) ||
          task.assignee?.fullName?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      tasks = tasks.filter((task) => task.priority === priorityFilter);
    }

    // Assignee filter
    if (assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned") {
        tasks = tasks.filter((task) => !task.assignee);
      } else {
        tasks = tasks.filter((task) => task.assignee?.id === assigneeFilter);
      }
    }

    // Client filter
    if (clientFilter !== "all") {
      if (clientFilter === "noClient") {
        tasks = tasks.filter((task) => !task.client);
      } else {
        tasks = tasks.filter((task) => task.client?.id === clientFilter);
      }
    }

    // Due date filter
    if (dueDateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
      const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      tasks = tasks.filter((task) => {
        if (dueDateFilter === "noDueDate") return !task.dueDate;
        if (!task.dueDate) return false;

        const dueDate = new Date(task.dueDate);
        switch (dueDateFilter) {
          case "overdue":
            return dueDate < today;
          case "today":
            return dueDate >= today && dueDate <= endOfToday;
          case "thisWeek":
            return dueDate >= today && dueDate <= endOfWeek;
          case "thisMonth":
            return dueDate >= today && dueDate <= endOfMonth;
          default:
            return true;
        }
      });
    }

    return tasks;
  }, [allTasks, searchQuery, priorityFilter, assigneeFilter, clientFilter, dueDateFilter]);

  // Sorting
  const sortedTasks = useMemo(() => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...filteredTasks].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return -1; // Keep original order (newest first based on position)
        case "oldest":
          return 1;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "updated":
          return 0; // Would need updatedAt field
        default:
          return 0;
      }
    });
  }, [filteredTasks, sortOption]);

  const tasksWithDueDate = useMemo(
    () => sortedTasks.filter((task) => task.dueDate),
    [sortedTasks]
  );

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all" ||
    clientFilter !== "all" ||
    dueDateFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setClientFilter("all");
    setDueDateFilter("all");
  };

  // Handlers
  const handleAddTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    startTransition(async () => {
      const taskData: {
        boardId: string;
        columnId: string;
        title: string;
        priority?: TaskPriority;
        dueDate?: Date;
        assigneeId?: string;
      } = {
        boardId: board.id,
        columnId,
        title: newTaskTitle.trim(),
      };

      // Add expanded fields if in expanded mode
      if (showExpandedCreate) {
        if (newTaskPriority) taskData.priority = newTaskPriority;
        if (newTaskDueDate) taskData.dueDate = new Date(newTaskDueDate);
        if (newTaskAssignee) taskData.assigneeId = newTaskAssignee;
      }

      const result = await createTask(taskData);

      if (result.success) {
        setNewTaskTitle("");
        setNewTaskDueDate("");
        setNewTaskPriority("medium");
        setNewTaskAssignee("");
        setShowAddTask(null);
        setShowExpandedCreate(false);
        showToast("Task created", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to create task", "error");
      }
    });
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    startTransition(async () => {
      const result = await createColumn(board.id, {
        name: newColumnName.trim(),
      });

      if (result.success) {
        setNewColumnName("");
        setShowAddColumn(false);
        showToast("Column created", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to create column", "error");
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
    const confirmed = await confirm({
      title: "Delete task",
      description: "Are you sure you want to delete this task? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

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

  const handleUpdateTaskField = async (
    taskId: string,
    field: string,
    value: string | Date | null
  ) => {
    startTransition(async () => {
      const data: Record<string, unknown> = {};

      if (field === "title" || field === "description") {
        data[field] = value;
      } else if (field === "dueDate") {
        data.dueDate = value ? new Date(value as string) : null;
      } else if (field === "assigneeId" || field === "clientId" || field === "projectId") {
        data[field] = value || null;
      }

      const result = await updateTask(taskId, data);

      if (result.success) {
        // Update local state to reflect changes
        setSelectedTask((prev) => {
          if (!prev || prev.id !== taskId) return prev;
          if (field === "title") return { ...prev, title: value as string };
          if (field === "description") return { ...prev, description: value as string | null };
          if (field === "dueDate") return { ...prev, dueDate: value ? new Date(value as string) : null };
          return prev;
        });
        router.refresh();
      } else {
        showToast(result.error || "Failed to update task", "error");
      }
    });
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    startTransition(async () => {
      const result = await toggleSubtask(subtaskId);

      if (result.success) {
        setSelectedTask((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            subtasks: prev.subtasks.map((subtask) =>
              subtask.id === subtaskId
                ? { ...subtask, isCompleted: !subtask.isCompleted }
                : subtask
            ),
          };
        });
        router.refresh();
      } else {
        showToast(result.error || "Failed to update subtask", "error");
      }
    });
  };

  const handleAddSubtask = async (taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await addSubtask(taskId, trimmed);

    if (!result.success || !result.subtaskId) {
        showToast(result.error || "Failed to add subtask", "error");
        return;
      }

      const newSubtask: Subtask = {
        id: result.subtaskId,
        title: trimmed,
        isCompleted: false,
        position: 0,
      };

      setSelectedTask((prev) => {
        if (!prev || prev.id !== taskId) return prev;
        const nextPosition = prev.subtasks.length;
        return {
          ...prev,
          subtasks: [...prev.subtasks, { ...newSubtask, position: nextPosition }],
          _count: {
            ...prev._count,
            subtasks: prev._count.subtasks + 1,
          },
        };
      });
      showToast("Subtask added", "success");
      router.refresh();
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
  // Filter tasks for a specific column using the comprehensive filter
  const filterColumnTasks = (tasks: Task[]) => {
    // Get the IDs of filtered tasks
    const filteredIds = new Set(filteredTasks.map((t) => t.id));
    return tasks.filter((t) => filteredIds.has(t.id));
  };

  const columnsWithFilteredTasks = useMemo(
    () =>
      board.columns.map((column) => ({
        ...column,
        filteredTasks: filterColumnTasks(column.tasks),
      })),
    [board.columns, filteredTasks]
  );

  const listTasks = useMemo(
    () =>
      board.columns.flatMap((column) =>
        filterColumnTasks(column.tasks).map((task) => ({
          task,
          column,
        }))
      ),
    [board.columns, filteredTasks]
  );

  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const listVirtualizer = useVirtualizer({
    count: listTasks.length,
    getScrollElement: () => listContainerRef.current,
    estimateSize: () => 76,
    overscan: 8,
    getItemKey: (index) => listTasks[index].task.id,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 0,
  });

  // Calculate stats
  const totalTasks = board.columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const completedTasks = board.columns
    .filter((c) => c.name === "Done")
    .reduce((sum, col) => sum + col.tasks.length, 0);
  const monthWeeks = useMemo(
    () => generateMonthDays(calendarMonth.year, calendarMonth.month, tasksWithDueDate),
    [calendarMonth, tasksWithDueDate]
  );
  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasksWithDueDate
      .filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate))
      .sort((a, b) => {
        const aTime = new Date(a.dueDate || 0).getTime();
        const bTime = new Date(b.dueDate || 0).getTime();
        return aTime - bTime;
      });
  }, [selectedDate, tasksWithDueDate]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-4 sm:px-6">
        <PageHeader
          title={board.name}
          subtitle={`${filteredTasks.length}${hasActiveFilters ? ` of ${totalTasks}` : ""} tasks · ${completedTasks} completed`}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex flex-wrap rounded-lg border border-[var(--card-border)] bg-background p-1">
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
            </div>
          }
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="border-b border-[var(--card-border)] bg-[var(--background)] px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search tasks by title, description, client, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
              className="h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 text-sm text-foreground"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 text-sm text-foreground"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.clerkUserId} value={member.clerkUserId}>
                  {member.fullName || member.email}
                </option>
              ))}
            </select>

            {/* Client Filter */}
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 text-sm text-foreground"
            >
              <option value="all">All Clients</option>
              <option value="noClient">No Client</option>
              {clients.slice(0, 50).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName || client.email}
                </option>
              ))}
            </select>

            {/* Due Date Filter */}
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value as DueDateFilter)}
              className="h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 text-sm text-foreground"
            >
              <option value="all">All Due Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="thisWeek">Due This Week</option>
              <option value="thisMonth">Due This Month</option>
              <option value="noDueDate">No Due Date</option>
            </select>

            {/* Sort (for list/calendar views) */}
            {viewMode !== "board" && (
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 text-sm text-foreground"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="h-9 rounded-lg bg-[var(--background-hover)] px-3 text-sm font-medium text-foreground-secondary hover:text-foreground"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Context Navigation */}
      <div className="border-b border-[var(--card-border)] bg-[var(--background)] px-4 py-3 sm:px-6">
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
          <div className="grid auto-rows-min gap-4 lg:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
            {columnsWithFilteredTasks.map((column) => (
              <div
                key={column.id}
                className={cn(
                  "flex h-full flex-col min-w-[220px] flex-1 rounded-xl border bg-[var(--background-secondary)]",
                  dragOverColumn === column.id
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                    : "border-[var(--card-border)]"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex flex-col gap-2 border-b border-[var(--card-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: column.color || "#6b7280" }}
                    />
                    <h3 className="font-medium text-foreground">{column.name}</h3>
                    <span className="rounded-full bg-[var(--background-hover)] px-2 py-0.5 text-xs text-foreground-muted">
                      {column.filteredTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAddTask(showAddTask === column.id ? null : column.id)}
                    aria-label={`Add task to ${column.name}`}
                    className="rounded-lg bg-[var(--background-hover)] p-1.5 text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                <VirtualList
                  items={column.filteredTasks}
                  className="max-h-[calc(100vh-280px)] overflow-y-auto p-3"
                  estimateSize={() => 220}
                  itemGap={12}
                  getItemKey={(task) => task.id}
                  prepend={
                    showAddTask === column.id ? (
                      <div className="rounded-lg border border-[var(--primary)] bg-[var(--card)] p-3">
                        <input
                          type="text"
                          placeholder="Task title..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !showExpandedCreate) handleAddTask(column.id);
                            if (e.key === "Escape") {
                              setShowAddTask(null);
                              setNewTaskTitle("");
                              setShowExpandedCreate(false);
                            }
                          }}
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
                          autoFocus
                        />

                        {/* Expanded Creation Fields */}
                        {showExpandedCreate && (
                          <div className="mt-3 space-y-2 border-t border-[var(--card-border)] pt-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="mb-1 block text-xs text-foreground-muted">Due Date</label>
                                <input
                                  type="date"
                                  value={newTaskDueDate}
                                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                                  className="w-full rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-xs text-foreground"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-foreground-muted">Priority</label>
                                <select
                                  value={newTaskPriority}
                                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                                  className="w-full rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-xs text-foreground"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="urgent">Urgent</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-foreground-muted">Assignee</label>
                              <select
                                value={newTaskAssignee}
                                onChange={(e) => setNewTaskAssignee(e.target.value)}
                                className="w-full rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-xs text-foreground"
                              >
                                <option value="">Unassigned</option>
                                {teamMembers.map((member) => (
                                  <option key={member.clerkUserId} value={member.clerkUserId}>
                                    {member.fullName || member.email}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setShowExpandedCreate(!showExpandedCreate)}
                            className="text-xs text-foreground-muted hover:text-foreground"
                          >
                            {showExpandedCreate ? "− Less options" : "+ More options"}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setShowAddTask(null);
                                setNewTaskTitle("");
                                setShowExpandedCreate(false);
                                setNewTaskDueDate("");
                                setNewTaskPriority("medium");
                                setNewTaskAssignee("");
                              }}
                              className="rounded-md px-3 py-1 text-xs font-medium text-foreground-secondary hover:text-foreground"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddTask(column.id)}
                              disabled={!newTaskTitle.trim() || isPending}
                              className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null
                  }
                  emptyPlaceholder={
                    showAddTask === column.id ? null : (
                      <div className="py-8 text-center">
                        <p className="text-sm text-foreground-muted">No tasks</p>
                        <button
                          onClick={() => setShowAddTask(column.id)}
                          className="mt-2 text-sm text-[var(--primary)] hover:underline"
                        >
                          Add a task
                        </button>
                      </div>
                    )
                  }
                  renderItem={(task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 transition-all hover:border-[var(--border-hover)] hover:shadow-sm",
                        draggedTask?.id === task.id && "opacity-50"
                      )}
                    >
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

                      <h4 className="text-sm font-medium text-foreground">{task.title}</h4>

                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-foreground-muted">
                          {task.description}
                        </p>
                      )}

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

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-muted">
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
                            className={cn(
                              "flex items-center gap-1",
                              new Date(task.dueDate) < new Date() && "text-[var(--error)]"
                            )}
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
                  )}
                />
              </div>
            ))}

            {/* Add Column Button */}
            {showAddColumn ? (
              <div className="w-80 flex-shrink-0 rounded-xl border border-[var(--primary)] bg-[var(--card)] p-3">
                <input
                  type="text"
                  placeholder="Column name..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") {
                      setShowAddColumn(false);
                      setNewColumnName("");
                    }
                  }}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
                  autoFocus
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleAddColumn}
                    disabled={!newColumnName.trim() || isPending}
                    className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnName("");
                    }}
                    className="rounded-md px-3 py-1 text-xs font-medium text-foreground-secondary hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="flex h-12 w-80 flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--card-border)] text-sm text-foreground-muted transition-colors hover:border-[var(--border-hover)] hover:text-foreground"
              >
                <PlusIcon className="h-4 w-4" />
                Add Column
              </button>
            )}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <div ref={listContainerRef} className="max-h-[70vh] overflow-auto">
              <table className="min-w-full">
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
                <tbody
                  style={{
                    position: "relative",
                    height: listVirtualizer.getTotalSize(),
                  }}
                >
                  {listVirtualizer.getVirtualItems().map((virtualItem) => {
                    const { task, column } = listTasks[virtualItem.index] || {};
                    if (!task || !column) return null;

                    return (
                      <tr
                        key={task.id}
                        ref={listVirtualizer.measureElement}
                        onClick={() => setSelectedTask(task)}
                        className="absolute left-0 right-0 table w-full cursor-pointer border-b border-[var(--card-border)] bg-transparent hover:bg-[var(--background-hover)]"
                        style={{ transform: `translateY(${virtualItem.start}px)` }}
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
                              backgroundColor: `${column.color || "#6b7280"}20`,
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
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <div className="flex flex-col gap-3 border-b border-[var(--card-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Task Calendar</p>
                <p className="text-lg font-semibold text-foreground">
                  {getMonthLabel(new Date(calendarMonth.year, calendarMonth.month, 1))}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCalendarMonth((prev) => ({
                    year: prev.month === 0 ? prev.year - 1 : prev.year,
                    month: prev.month === 0 ? 11 : prev.month - 1,
                  }))}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground hover:bg-[var(--background-hover)]"
                >
                  Prev
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setCalendarMonth({ year: now.getFullYear(), month: now.getMonth() });
                    setSelectedDate(now);
                  }}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground hover:bg-[var(--background-hover)]"
                >
                  Today
                </button>
                <button
                  onClick={() => setCalendarMonth((prev) => ({
                    year: prev.month === 11 ? prev.year + 1 : prev.year,
                    month: prev.month === 11 ? 0 : prev.month + 1,
                  }))}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground hover:bg-[var(--background-hover)]"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-7 border-b border-[var(--card-border)] bg-[var(--background)] text-xs font-medium text-foreground-muted">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="px-4 py-2 text-center">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-px bg-[var(--card-border)]">
                  {monthWeeks.flatMap((week, weekIndex) =>
                    week.map((day, dayIndex) => {
                      const isSelected = selectedDate && isSameDay(day.date, selectedDate);
                      return (
                        <button
                          key={`${weekIndex}-${dayIndex}-${day.date.toISOString()}`}
                          onClick={() => setSelectedDate(day.date)}
                          className={cn(
                            "min-h-[90px] bg-[var(--card)] px-3 py-2 text-left transition-colors hover:bg-[var(--background-hover)]",
                            !day.isCurrentMonth && "text-foreground-muted/60",
                            isSelected && "ring-2 ring-[var(--primary)]/40"
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                day.isToday && "text-[var(--primary)]"
                              )}
                            >
                              {day.dayNumber}
                            </span>
                            {day.taskCount > 0 && (
                              <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)]">
                                {day.taskCount}
                              </span>
                            )}
                          </div>
                          {day.taskCount === 0 && (
                            <p className="mt-3 text-xs text-foreground-muted">No tasks</p>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <div className="flex flex-col gap-2 border-b border-[var(--card-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Tasks Due</p>
                <p className="text-lg font-semibold text-foreground">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Select a date"}
                </p>
              </div>
              <span className="text-sm text-foreground-muted">
                {selectedDate ? `${selectedDayTasks.length} tasks` : `${tasksWithDueDate.length} total`}
              </span>
            </div>

            <div className="divide-y divide-[var(--card-border)]">
              {selectedDate && selectedDayTasks.length === 0 && (
                <div className="p-5 text-sm text-foreground-muted">
                  No tasks due this day.
                </div>
              )}
              {!selectedDate && (
                <div className="p-5 text-sm text-foreground-muted">
                  Choose a date to see tasks due.
                </div>
              )}
              {selectedDayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--background-hover)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                      {task.project && <span>{task.project.name}</span>}
                      {task.client && <span>{task.client.fullName || task.client.email}</span>}
                      {task.assignee && <span>Assigned to {task.assignee.fullName}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-foreground-muted">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No due date"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          teamMembers={teamMembers}
          clients={clients}
          galleries={galleries}
          onClose={() => setSelectedTask(null)}
          onDelete={() => handleDeleteTask(selectedTask.id)}
          onUpdatePriority={(p) => handleUpdatePriority(selectedTask.id, p)}
          onUpdateField={(field, value) => handleUpdateTaskField(selectedTask.id, field, value)}
          onAddSubtask={(title) => handleAddSubtask(selectedTask.id, title)}
          onToggleSubtask={handleToggleSubtask}
        />
      )}
    </div>
  );
}

// Helper Components
function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = {
    urgent: { bg: "bg-[var(--error)]/10", text: "text-[var(--error-text)]", label: "Urgent" },
    high: { bg: "bg-[var(--warning)]/10", text: "text-[var(--warning-text)]", label: "High" },
    medium: { bg: "bg-[var(--primary)]/10", text: "text-[var(--primary)]", label: "Medium" },
    low: { bg: "bg-[var(--foreground-muted)]/10", text: "text-foreground-muted", label: "Low" },
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
  teamMembers,
  clients,
  galleries,
  onClose,
  onDelete,
  onUpdatePriority,
  onUpdateField,
  onAddSubtask,
  onToggleSubtask,
}: {
  task: Task;
  teamMembers: TeamMember[];
  clients: Client[];
  galleries: Gallery[];
  onClose: () => void;
  onDelete: () => void;
  onUpdatePriority: (priority: TaskPriority) => void;
  onUpdateField: (field: string, value: string | Date | null) => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
}) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [localTitle, setLocalTitle] = useState(task.title);
  const [localDescription, setLocalDescription] = useState(task.description || "");

  const handleSubmitSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(newSubtaskTitle);
    setNewSubtaskTitle("");
  };

  const handleSaveTitle = () => {
    if (localTitle.trim() && localTitle !== task.title) {
      onUpdateField("title", localTitle.trim());
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (localDescription !== (task.description || "")) {
      onUpdateField("description", localDescription || null);
    }
    setEditingDescription(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="relative max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[var(--card-border)] p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={task.priority} />
            </div>
            {editingTitle ? (
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setLocalTitle(task.title);
                    setEditingTitle(false);
                  }
                }}
                className="mt-2 w-full rounded border border-[var(--primary)] bg-transparent px-2 py-1 text-lg font-semibold text-foreground outline-none"
                autoFocus
              />
            ) : (
              <h2
                id="task-modal-title"
                onClick={() => setEditingTitle(true)}
                className="mt-2 cursor-pointer rounded px-2 py-1 text-lg font-semibold text-foreground hover:bg-[var(--background-hover)]"
              >
                {task.title}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close task details"
            className="self-end rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground sm:self-auto"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-foreground">Description</h3>
            {editingDescription ? (
              <textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                onBlur={handleSaveDescription}
                placeholder="Add a description..."
                rows={3}
                className="w-full rounded border border-[var(--primary)] bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground-muted"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setEditingDescription(true)}
                className="min-h-[60px] cursor-pointer rounded border border-transparent px-3 py-2 text-sm text-foreground-secondary hover:border-[var(--card-border)] hover:bg-[var(--background-hover)]"
              >
                {task.description || <span className="text-foreground-muted">Click to add description...</span>}
              </div>
            )}
          </div>

          {/* Due Date & Assignee */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Due Date</h3>
              <input
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => onUpdateField("dueDate", e.target.value || null)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Assignee</h3>
              <select
                value={task.assignee?.id || ""}
                onChange={(e) => onUpdateField("assigneeId", e.target.value || null)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.clerkUserId} value={member.clerkUserId}>
                    {member.fullName || member.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linked Entities */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Client</h3>
              <select
                value={task.client?.id || ""}
                onChange={(e) => onUpdateField("clientId", e.target.value || null)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              >
                <option value="">No client</option>
                {clients.slice(0, 50).map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName || client.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Gallery</h3>
              <select
                value={task.project?.id || ""}
                onChange={(e) => onUpdateField("projectId", e.target.value || null)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              >
                <option value="">No gallery</option>
                {galleries.slice(0, 50).map((gallery) => (
                  <option key={gallery.id} value={gallery.id}>
                    {gallery.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Links Display */}
          {(task.client || task.project || task.booking) && (
            <div className="mb-6">
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
              </div>
            </div>
          )}

          {/* Subtasks */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-foreground">
              Subtasks ({task.subtasks.filter((s) => s.isCompleted).length}/
              {task.subtasks.length})
            </h3>
            {task.subtasks.length > 0 ? (
              <div className="space-y-1">
                {task.subtasks.map((subtask) => (
                  <button
                    key={subtask.id}
                    onClick={() => onToggleSubtask(subtask.id)}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-[var(--background-hover)]"
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
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No subtasks yet.</p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmitSubtask();
                }}
                placeholder="Add a subtask..."
                className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              />
              <button
                onClick={handleSubmitSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

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
        <div className="flex flex-col gap-2 border-t border-[var(--card-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
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
