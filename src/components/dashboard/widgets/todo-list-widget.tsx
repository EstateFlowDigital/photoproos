"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
}

interface TodoListWidgetProps {
  items?: TodoItem[];
  onToggle?: (id: string, completed: boolean) => void;
  onAdd?: (title: string) => void;
  showCompleted?: boolean;
  maxItems?: number;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TodoListWidget({
  items = [],
  onToggle,
  onAdd,
  showCompleted = false,
  maxItems = 10,
  className,
}: TodoListWidgetProps) {
  const [newTodo, setNewTodo] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter and sort items
  const displayItems = items
    .filter((item) => showCompleted || !item.completed)
    .slice(0, maxItems);

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;

  // Handle adding new todo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() && onAdd) {
      onAdd(newTodo.trim());
      setNewTodo("");
    }
  };

  // Priority styles
  const priorityStyles = {
    low: "border-l-[var(--success)]",
    medium: "border-l-[var(--warning)]",
    high: "border-l-[var(--error)]",
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground-muted">
            {completedCount} of {totalCount} complete
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--background-secondary)]">
            <div
              className="h-full rounded-full bg-[var(--success)] transition-all"
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Add new todo */}
      {onAdd && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={!newTodo.trim()}
            className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {/* Todo list */}
      {displayItems.length === 0 ? (
        <div className="py-6 text-center">
          <svg
            className="mx-auto h-8 w-8 text-foreground-muted"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p className="mt-2 text-sm text-foreground-muted">
            {totalCount > 0 ? "All tasks completed!" : "No tasks yet"}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {displayItems.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 transition-colors",
                item.priority && `border-l-2 ${priorityStyles[item.priority]}`
              )}
            >
              <button
                onClick={() => onToggle?.(item.id, !item.completed)}
                className={cn(
                  "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
                  item.completed
                    ? "border-[var(--success)] bg-[var(--success)]"
                    : "border-[var(--border-visible)] hover:border-[var(--primary)]"
                )}
                aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {item.completed && (
                  <svg
                    className="h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm",
                    item.completed
                      ? "text-foreground-muted line-through"
                      : "text-foreground"
                  )}
                >
                  {item.title}
                </p>
                {item.dueDate && !item.completed && (
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    Due{" "}
                    {item.dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Show more link */}
      {items.length > maxItems && (
        <p className="text-center text-sm text-foreground-muted">
          +{items.length - maxItems} more tasks
        </p>
      )}
    </div>
  );
}

export default TodoListWidget;
