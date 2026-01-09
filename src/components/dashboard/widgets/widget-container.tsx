"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface WidgetContainerProps {
  id: string;
  title: string;
  description?: string;
  size?: "small" | "medium" | "large" | "full";
  children: React.ReactNode;
  isDraggable?: boolean;
  onRemove?: () => void;
  onConfigure?: () => void;
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

function DragHandleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 4.25a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM3 10a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM3 15.75a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DotsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function WidgetContainer({
  id,
  title,
  description,
  size = "medium",
  children,
  isDraggable = true,
  onRemove,
  onConfigure,
  className,
}: WidgetContainerProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Close menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  // Size classes
  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-1 md:col-span-2",
    large: "col-span-1 md:col-span-2 lg:col-span-3",
    full: "col-span-full",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)]",
        "transition-shadow",
        isDragging && "shadow-lg shadow-black/20 ring-2 ring-[var(--primary)]",
        sizeClasses[size],
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Drag Handle */}
          {isDraggable && (
            <button
              {...attributes}
              {...listeners}
              className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-foreground-muted opacity-0 transition-all hover:bg-[var(--background-hover)] hover:text-foreground group-hover:opacity-100 active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <DragHandleIcon className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-foreground-muted truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Menu */}
        {(onRemove || onConfigure) && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-foreground-muted opacity-0 transition-all hover:bg-[var(--background-hover)] hover:text-foreground group-hover:opacity-100"
              aria-label="Widget options"
              aria-expanded={showMenu}
            >
              <DotsIcon className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                {onConfigure && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onConfigure();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.294 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.294A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.294-1.473Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Configure
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onRemove();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-[var(--error)] hover:bg-[var(--error)]/10"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}

// ============================================================================
// Skeleton Component
// ============================================================================

interface WidgetContainerSkeletonProps {
  title?: string;
  size?: "small" | "medium" | "large" | "full";
  className?: string;
}

export function WidgetContainerSkeleton({
  title,
  size = "medium",
  className,
}: WidgetContainerSkeletonProps) {
  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-1 md:col-span-2",
    large: "col-span-1 md:col-span-2 lg:col-span-3",
    full: "col-span-full",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)]",
        sizeClasses[size],
        className
      )}
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-pulse rounded bg-[var(--background-secondary)]" />
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--background-secondary)]" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-8 w-32 animate-pulse rounded bg-[var(--background-secondary)]" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--background-secondary)]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--background-secondary)]" />
      </div>
    </div>
  );
}

export default WidgetContainer;
