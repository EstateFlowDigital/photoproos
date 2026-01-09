"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  WIDGET_LIBRARY,
  type WidgetCategory,
  type WidgetId,
} from "@/lib/widget-types";

// ============================================================================
// Types
// ============================================================================

interface AddWidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeWidgets: WidgetId[];
  onAddWidget: (widgetId: WidgetId) => void;
}

// ============================================================================
// Category Labels
// ============================================================================

const CATEGORY_LABELS: Record<WidgetCategory, string> = {
  analytics: "Analytics & Insights",
  financial: "Financial",
  scheduling: "Scheduling",
  projects: "Projects & Galleries",
  communication: "Communication",
  productivity: "Productivity",
  marketing: "Marketing",
  other: "Other",
};

const CATEGORY_ORDER: WidgetCategory[] = [
  "analytics",
  "financial",
  "scheduling",
  "projects",
  "communication",
  "productivity",
  "marketing",
  "other",
];

// ============================================================================
// Icons
// ============================================================================

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function AddWidgetPanel({
  isOpen,
  onClose,
  activeWidgets,
  onAddWidget,
}: AddWidgetPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close on escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Group widgets by category
  const widgetsByCategory = React.useMemo(() => {
    const filtered = searchQuery
      ? WIDGET_LIBRARY.filter(
          (w) =>
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : WIDGET_LIBRARY;

    const grouped: Record<WidgetCategory, typeof WIDGET_LIBRARY> = {
      analytics: [],
      financial: [],
      scheduling: [],
      projects: [],
      communication: [],
      productivity: [],
      marketing: [],
      other: [],
    };

    filtered.forEach((widget) => {
      grouped[widget.category].push(widget);
    });

    return grouped;
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--card)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Add widget"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--card-border)] px-4">
          <h2 className="text-base font-semibold text-foreground">
            Add Widget
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
            aria-label="Close panel"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[var(--card-border)] p-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search widgets..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-y-auto p-4">
          {CATEGORY_ORDER.map((category) => {
            const widgets = widgetsByCategory[category];
            if (widgets.length === 0) return null;

            return (
              <div key={category} className="mb-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="space-y-2">
                  {widgets.map((widget) => {
                    const isActive = activeWidgets.includes(widget.id);

                    return (
                      <button
                        key={widget.id}
                        type="button"
                        onClick={() => !isActive && onAddWidget(widget.id)}
                        disabled={isActive}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
                          isActive
                            ? "bg-[var(--success)]/10 cursor-default"
                            : "hover:bg-[var(--background-hover)]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            isActive
                              ? "bg-[var(--success)]/20 text-[var(--success)]"
                              : "bg-[var(--background-secondary)] text-foreground-muted"
                          )}
                        >
                          {/* Widget icon placeholder */}
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {widget.name}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs",
                                widget.defaultSize === "small" &&
                                  "bg-blue-500/10 text-blue-400",
                                widget.defaultSize === "medium" &&
                                  "bg-purple-500/10 text-purple-400",
                                widget.defaultSize === "large" &&
                                  "bg-orange-500/10 text-orange-400",
                                widget.defaultSize === "full" &&
                                  "bg-green-500/10 text-green-400"
                              )}
                            >
                              {widget.defaultSize}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-foreground-muted line-clamp-1">
                            {widget.description}
                          </p>
                        </div>
                        {isActive ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-[var(--success)]">
                            <CheckIcon className="h-4 w-4" />
                            Added
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-foreground-muted opacity-0 transition-opacity group-hover:opacity-100">
                            <PlusIcon className="h-4 w-4" />
                            Add
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* No results */}
          {searchQuery &&
            Object.values(widgetsByCategory).every((w) => w.length === 0) && (
              <div className="py-8 text-center">
                <p className="text-sm text-foreground-muted">
                  No widgets found for &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
        </div>
      </div>
    </>
  );
}

export default AddWidgetPanel;
