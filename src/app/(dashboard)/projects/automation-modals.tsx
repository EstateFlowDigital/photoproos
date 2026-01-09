"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@prisma/client";
import type {
  AutomationTrigger,
  AutomationAction,
  AutomationTriggerType,
  AutomationActionType,
  RecurringFrequency,
} from "@/lib/actions/projects";

// Types
interface Column {
  id: string;
  name: string;
  color: string | null;
  position: number;
  limit: number | null;
}

interface TeamMember {
  id: string;
  clerkUserId: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface AutomationData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  createdAt: Date;
}

interface RecurringTaskData {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  tags: string[];
  estimatedMinutes: number | null;
  frequency: string;
  interval: number;
  daysOfWeek: number[];
  dayOfMonth: number | null;
  time: string;
  isActive: boolean;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
  column: { id: string; name: string };
  assignee: { id: string; fullName: string | null; avatarUrl: string | null } | null;
}

// ============================================================================
// AUTOMATION RULES MODAL
// ============================================================================

export function AutomationRulesModal({
  automations,
  columns,
  teamMembers,
  loading,
  editingAutomation,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
}: {
  automations: AutomationData[];
  columns: Column[];
  teamMembers: TeamMember[];
  loading: boolean;
  editingAutomation: AutomationData | null;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description?: string;
    trigger: AutomationTrigger;
    actions: AutomationAction[];
  }) => Promise<boolean>;
  onUpdate: (
    id: string,
    data: {
      name?: string;
      description?: string;
      trigger?: AutomationTrigger;
      actions?: AutomationAction[];
      isActive?: boolean;
    }
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onEdit: (automation: AutomationData) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<AutomationTriggerType>("task_moved");
  const [triggerColumnId, setTriggerColumnId] = useState("");
  const [actionType, setActionType] = useState<AutomationActionType>("move_to_column");
  const [actionColumnId, setActionColumnId] = useState("");
  const [actionUserId, setActionUserId] = useState("");
  const [actionPriority, setActionPriority] = useState<TaskPriority>("medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingAutomation) {
      setShowForm(true);
      setName(editingAutomation.name);
      setDescription(editingAutomation.description || "");
      setTriggerType(editingAutomation.trigger.type);
      setTriggerColumnId(editingAutomation.trigger.columnId || "");
      if (editingAutomation.actions[0]) {
        setActionType(editingAutomation.actions[0].type);
        setActionColumnId(editingAutomation.actions[0].columnId || "");
        setActionUserId(editingAutomation.actions[0].userId || "");
        setActionPriority(editingAutomation.actions[0].priority || "medium");
      }
    }
  }, [editingAutomation]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTriggerType("task_moved");
    setTriggerColumnId("");
    setActionType("move_to_column");
    setActionColumnId("");
    setActionUserId("");
    setActionPriority("medium");
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSaving(true);
    const trigger: AutomationTrigger = { type: triggerType };
    if (triggerType === "task_moved" && triggerColumnId) {
      trigger.columnId = triggerColumnId;
    }

    const action: AutomationAction = { type: actionType };
    if (actionType === "move_to_column" && actionColumnId) {
      action.columnId = actionColumnId;
    }
    if (actionType === "assign_to_user") {
      action.userId = actionUserId || undefined;
    }
    if (actionType === "set_priority") {
      action.priority = actionPriority;
    }

    let success: boolean;
    if (editingAutomation) {
      success = await onUpdate(editingAutomation.id, {
        name,
        description: description || undefined,
        trigger,
        actions: [action],
      });
    } else {
      success = await onCreate({
        name,
        description: description || undefined,
        trigger,
        actions: [action],
      });
    }

    setSaving(false);
    if (success) {
      resetForm();
    }
  };

  const triggerLabels: Record<AutomationTriggerType, string> = {
    task_created: "When a task is created",
    task_moved: "When a task is moved to column",
    subtasks_complete: "When all subtasks are complete",
    due_date_reached: "When due date is reached",
    priority_changed: "When priority is changed",
    assignee_changed: "When assignee is changed",
  };

  const actionLabels: Record<AutomationActionType, string> = {
    move_to_column: "Move to column",
    assign_to_user: "Assign to user",
    set_priority: "Set priority",
    add_tag: "Add tag",
    remove_tag: "Remove tag",
    send_notification: "Send notification",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Automation Rules</h2>
            <p className="text-sm text-foreground-muted">Automate task actions based on triggers</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!showForm ? (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background-secondary)] py-3 text-sm font-medium text-foreground-secondary hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <PlusIcon className="h-4 w-4" />
                Add Automation Rule
              </button>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                </div>
              ) : automations.length === 0 ? (
                <p className="py-8 text-center text-sm text-foreground-muted">
                  No automation rules yet. Create one to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {automations.map((automation) => (
                    <div
                      key={automation.id}
                      className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{automation.name}</span>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-xs",
                                automation.isActive
                                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                                  : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                              )}
                            >
                              {automation.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          {automation.description && (
                            <p className="mt-1 text-sm text-foreground-muted">{automation.description}</p>
                          )}
                          <div className="mt-2 text-xs text-foreground-secondary">
                            <span className="font-medium">Trigger:</span> {triggerLabels[automation.trigger.type]}
                            {automation.trigger.columnId &&
                              ` → ${columns.find((c) => c.id === automation.trigger.columnId)?.name || "Unknown"}`}
                          </div>
                          <div className="text-xs text-foreground-secondary">
                            <span className="font-medium">Action:</span>{" "}
                            {automation.actions.map((a) => actionLabels[a.type]).join(", ")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdate(automation.id, { isActive: !automation.isActive })}
                            className="rounded p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                            title={automation.isActive ? "Disable" : "Enable"}
                          >
                            {automation.isActive ? (
                              <ToggleOnIcon className="h-4 w-4" />
                            ) : (
                              <ToggleOffIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => onEdit(automation)}
                            className="rounded p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(automation.id)}
                            className="rounded p-1.5 text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">
                {editingAutomation ? "Edit Automation" : "New Automation"}
              </h3>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Auto-complete on subtasks done"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this automation do?"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">When (Trigger)</label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as AutomationTriggerType)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                >
                  {Object.entries(triggerLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {triggerType === "task_moved" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">To Column</label>
                  <select
                    value={triggerColumnId}
                    onChange={(e) => setTriggerColumnId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="">Any column</option>
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Then (Action)</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as AutomationActionType)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                >
                  <option value="move_to_column">Move to column</option>
                  <option value="assign_to_user">Assign to user</option>
                  <option value="set_priority">Set priority</option>
                </select>
              </div>

              {actionType === "move_to_column" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Target Column</label>
                  <select
                    value={actionColumnId}
                    onChange={(e) => setActionColumnId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="">Select column</option>
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === "assign_to_user" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Assign To</label>
                  <select
                    value={actionUserId}
                    onChange={(e) => setActionUserId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="">Unassign</option>
                    {teamMembers.map((member) => (
                      <option key={member.clerkUserId} value={member.clerkUserId}>
                        {member.fullName || member.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === "set_priority" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Priority</label>
                  <select
                    value={actionPriority}
                    onChange={(e) => setActionPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !name.trim()}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingAutomation ? "Update" : "Create"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RECURRING TASKS MODAL
// ============================================================================

export function RecurringTasksModal({
  recurringTasks,
  columns,
  teamMembers,
  loading,
  editingTask,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
}: {
  recurringTasks: RecurringTaskData[];
  columns: Column[];
  teamMembers: TeamMember[];
  loading: boolean;
  editingTask: RecurringTaskData | null;
  onClose: () => void;
  onCreate: (data: {
    columnId: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
    frequency: RecurringFrequency;
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    time?: string;
  }) => Promise<boolean>;
  onUpdate: (
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      assigneeId?: string | null;
      columnId?: string;
      frequency?: RecurringFrequency;
      interval?: number;
      daysOfWeek?: number[];
      dayOfMonth?: number;
      time?: string;
      isActive?: boolean;
    }
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onEdit: (task: RecurringTaskData) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [columnId, setColumnId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("weekly");
  const [intervalValue, setIntervalValue] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]); // Monday
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [time, setTime] = useState("09:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setShowForm(true);
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setPriority(editingTask.priority);
      setColumnId(editingTask.column.id);
      setAssigneeId(editingTask.assignee?.id || "");
      setFrequency(editingTask.frequency as RecurringFrequency);
      setIntervalValue(editingTask.interval);
      setDaysOfWeek(editingTask.daysOfWeek);
      setDayOfMonth(editingTask.dayOfMonth || 1);
      setTime(editingTask.time);
    } else if (columns[0]) {
      setColumnId(columns[0].id);
    }
  }, [editingTask, columns]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setColumnId(columns[0]?.id || "");
    setAssigneeId("");
    setFrequency("weekly");
    setIntervalValue(1);
    setDaysOfWeek([1]);
    setDayOfMonth(1);
    setTime("09:00");
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !columnId) return;

    setSaving(true);
    let success: boolean;
    if (editingTask) {
      success = await onUpdate(editingTask.id, {
        title,
        description: description || undefined,
        priority,
        columnId,
        assigneeId: assigneeId || null,
        frequency,
        interval: intervalValue,
        daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
        dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
        time,
      });
    } else {
      success = await onCreate({
        title,
        description: description || undefined,
        priority,
        columnId,
        assigneeId: assigneeId || undefined,
        frequency,
        interval: intervalValue,
        daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
        dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
        time,
      });
    }

    setSaving(false);
    if (success) {
      resetForm();
    }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recurring Tasks</h2>
            <p className="text-sm text-foreground-muted">Automatically create tasks on a schedule</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!showForm ? (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background-secondary)] py-3 text-sm font-medium text-foreground-secondary hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <PlusIcon className="h-4 w-4" />
                Add Recurring Task
              </button>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                </div>
              ) : recurringTasks.length === 0 ? (
                <p className="py-8 text-center text-sm text-foreground-muted">
                  No recurring tasks yet. Create one to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {recurringTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{task.title}</span>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-xs",
                                task.isActive
                                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                                  : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                              )}
                            >
                              {task.isActive ? "Active" : "Paused"}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-foreground-muted">
                            <span className="flex items-center gap-1">
                              <RepeatIcon className="h-3.5 w-3.5" />
                              {task.frequency === "daily" && "Daily"}
                              {task.frequency === "weekly" &&
                                `Weekly on ${task.daysOfWeek.map((d) => dayNames[d]).join(", ")}`}
                              {task.frequency === "monthly" && `Monthly on day ${task.dayOfMonth}`}
                              {task.frequency === "custom" && `Every ${task.interval} days`}
                            </span>
                            <span>at {task.time}</span>
                          </div>
                          <div className="mt-1 text-xs text-foreground-secondary">
                            → {task.column.name}
                            {task.assignee && ` · ${task.assignee.fullName}`}
                          </div>
                          {task.nextRunAt && (
                            <div className="mt-1 text-xs text-foreground-secondary">
                              Next: {new Date(task.nextRunAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdate(task.id, { isActive: !task.isActive })}
                            className="rounded p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                            title={task.isActive ? "Pause" : "Resume"}
                          >
                            {task.isActive ? (
                              <ToggleOnIcon className="h-4 w-4" />
                            ) : (
                              <ToggleOffIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => onEdit(task)}
                            className="rounded p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(task.id)}
                            className="rounded p-1.5 text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">
                {editingTask ? "Edit Recurring Task" : "New Recurring Task"}
              </h3>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekly team sync"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task details..."
                  rows={2}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Create In Column</label>
                  <select
                    value={columnId}
                    onChange={(e) => setColumnId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Assign To (optional)
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.clerkUserId} value={member.clerkUserId}>
                      {member.fullName || member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom (every X days)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
              </div>

              {frequency === "weekly" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Days of Week</label>
                  <div className="flex gap-1">
                    {dayNames.map((name, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                          daysOfWeek.includes(index)
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--background-secondary)] text-foreground-muted hover:bg-[var(--background-hover)]"
                        )}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {frequency === "monthly" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Day of Month</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
              )}

              {frequency === "custom" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Every X Days</label>
                  <input
                    type="number"
                    min={1}
                    value={intervalValue}
                    onChange={(e) => setIntervalValue(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !title.trim() || !columnId}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingTask ? "Update" : "Create"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ToggleOnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 7H7a5 5 0 000 10h10a5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z" />
    </svg>
  );
}

function ToggleOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 7h10a5 5 0 010 10H7A5 5 0 017 7zm0 8a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
