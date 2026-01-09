"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { updateTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask } from "@/lib/actions/projects";

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

interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
}

interface Comment {
  id: string;
  content: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: Date;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  tags: string[];
  dueDate: Date | null;
  startDate: Date | null;
  completedAt: Date | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
  board: { id: string; name: string };
  column: { id: string; name: string };
  assignee: { id: string; fullName: string | null; email: string; avatarUrl: string | null } | null;
  client: { id: string; fullName: string | null; email: string } | null;
  project: { id: string; name: string } | null;
  booking: { id: string } | null;
  invoice: { id: string } | null;
  propertyWebsite: { id: string } | null;
  subtasks: Subtask[];
  comments: Comment[];
}

interface TaskDetailClientProps {
  task: Task;
  teamMembers: TeamMember[];
  clients: Client[];
  galleries: Gallery[];
}

export function TaskDetailClient({ task: initialTask, teamMembers, clients, galleries }: TaskDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [task, setTask] = useState(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    assigneeId: task.assignee?.id || "",
    clientId: task.client?.id || "",
    projectId: task.project?.id || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateTask(task.id, {
        title: editForm.title,
        description: editForm.description || undefined,
        priority: editForm.priority as "urgent" | "high" | "medium" | "low",
        dueDate: editForm.dueDate ? new Date(editForm.dueDate) : null,
        assigneeId: editForm.assigneeId || null,
        clientId: editForm.clientId || null,
        projectId: editForm.projectId || null,
      });

      if (result.success) {
        showToast("Task updated successfully", "success");
        setIsEditing(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to update task", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setIsDeleting(true);
    try {
      const result = await deleteTask(task.id);
      if (result.success) {
        showToast("Task deleted", "success");
        router.push("/projects");
      } else {
        showToast(result.error || "Failed to delete task", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;

    try {
      const result = await addSubtask(task.id, newSubtask.trim());
      if (result.success && result.subtaskId) {
        const newSubtaskItem: Subtask = {
          id: result.subtaskId,
          title: newSubtask.trim(),
          isCompleted: false,
          position: task.subtasks.length,
        };
        setTask((prev) => ({
          ...prev,
          subtasks: [...prev.subtasks, newSubtaskItem],
        }));
        setNewSubtask("");
        showToast("Subtask added", "success");
      }
    } catch {
      showToast("Failed to add subtask", "error");
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    try {
      await toggleSubtask(subtaskId);
      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, isCompleted: !isCompleted } : s
        ),
      }));
    } catch {
      showToast("Failed to update subtask", "error");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask(subtaskId);
      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.filter((s) => s.id !== subtaskId),
      }));
    } catch {
      showToast("Failed to delete subtask", "error");
    }
  };

  const priorityColors = {
    urgent: "bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/30",
    high: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30",
    medium: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30",
    low: "bg-[var(--foreground-muted)]/10 text-foreground-muted border-[var(--foreground-muted)]/30",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description Card */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <h2 className="text-lg font-semibold text-foreground">Details</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Assignee</label>
                <select
                  value={editForm.assigneeId}
                  onChange={(e) => setEditForm({ ...editForm, assigneeId: e.target.value })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName || m.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Client</label>
                  <select
                    value={editForm.clientId}
                    onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                  >
                    <option value="">No client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName || c.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Gallery</label>
                  <select
                    value={editForm.projectId}
                    onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                  >
                    <option value="">No gallery</option>
                    {galleries.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {task.description ? (
                <p className="text-sm text-foreground-muted whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-sm text-foreground-muted italic">No description</p>
              )}
            </div>
          )}
        </div>

        {/* Subtasks Card */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Subtasks ({task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length})
          </h2>

          <div className="space-y-2 mb-4">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--background-hover)] group"
              >
                <button
                  onClick={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                  className={cn(
                    "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                    subtask.isCompleted
                      ? "bg-[var(--success)] border-[var(--success)] text-white"
                      : "border-[var(--card-border)] hover:border-[var(--primary)]"
                  )}
                >
                  {subtask.isCompleted && <CheckIcon className="h-3 w-3" />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    subtask.isCompleted && "line-through text-foreground-muted"
                  )}
                >
                  {subtask.title}
                </span>
                <button
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-foreground-muted hover:text-[var(--error)] transition-opacity"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              placeholder="Add a subtask..."
              className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted"
            />
            <button
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Properties Card */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Properties</h2>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</span>
              <p className="mt-1 text-sm text-foreground">{task.column.name}</p>
            </div>

            <div>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Priority</span>
              <p className="mt-1">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium border", priorityColors[task.priority as keyof typeof priorityColors])}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </p>
            </div>

            {task.assignee && (
              <div>
                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Assignee</span>
                <div className="mt-1 flex items-center gap-2">
                  {task.assignee.avatarUrl ? (
                    <img src={task.assignee.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs text-white font-medium">
                      {(task.assignee.fullName || task.assignee.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-foreground">{task.assignee.fullName || task.assignee.email}</span>
                </div>
              </div>
            )}

            {task.client && (
              <div>
                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Client</span>
                <p className="mt-1 text-sm text-foreground">{task.client.fullName || task.client.email}</p>
              </div>
            )}

            {task.project && (
              <div>
                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Gallery</span>
                <p className="mt-1 text-sm text-foreground">{task.project.name}</p>
              </div>
            )}

            {task.dueDate && (
              <div>
                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Due Date</span>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Created</span>
              <p className="mt-1 text-sm text-foreground">
                {new Date(task.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error)]/5 p-6">
          <h2 className="text-lg font-semibold text-[var(--error)] mb-2">Danger Zone</h2>
          <p className="text-sm text-foreground-muted mb-4">
            Permanently delete this task and all its subtasks.
          </p>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full rounded-lg border border-[var(--error)] bg-[var(--error)]/10 px-4 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/20 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}
