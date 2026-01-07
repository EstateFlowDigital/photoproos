"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface NotesWidgetProps {
  initialNotes?: string;
  onSave?: (notes: string) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function NotesWidget({
  initialNotes = "",
  onSave,
  className,
}: NotesWidgetProps) {
  const [notes, setNotes] = React.useState(initialNotes);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-save debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== initialNotes && onSave) {
        setIsSaving(true);
        onSave(notes);
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
        }, 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [notes, initialNotes, onSave]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [notes]);

  return (
    <div className={cn("space-y-2", className)}>
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add quick notes, reminders, or to-dos..."
        className="min-h-[120px] w-full resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        aria-label="Quick notes"
      />
      <div className="flex items-center justify-between text-xs text-foreground-muted">
        <span>
          {notes.length} characters
        </span>
        <span className="flex items-center gap-1.5">
          {isSaving && (
            <>
              <svg
                className="h-3 w-3 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          )}
          {!isSaving && lastSaved && (
            <>
              <svg
                className="h-3 w-3 text-[var(--success)]"
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
              Saved
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export default NotesWidget;
