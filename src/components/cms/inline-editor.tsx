"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { saveDraft } from "@/lib/actions/marketing-cms";
import {
  Edit3,
  Check,
  X,
  Loader2,
  Undo2,
  Type,
  AlignLeft,
} from "lucide-react";

interface InlineEditableProps {
  /** Content path in JSON structure (e.g., "hero.headline") */
  path: string;
  /** Page slug for saving */
  pageSlug: string;
  /** Current value */
  value: string;
  /** Type of content - affects editor behavior */
  type?: "text" | "textarea" | "richtext";
  /** Whether editing is enabled (preview mode required) */
  isEnabled?: boolean;
  /** CSS class for the editable element */
  className?: string;
  /** Tag to render (default: span for text, p for textarea) */
  as?: keyof JSX.IntrinsicElements;
  /** Placeholder when empty */
  placeholder?: string;
  /** Callback when content is updated */
  onUpdate?: (value: string) => void;
  /** Children (displayed content) */
  children?: React.ReactNode;
}

interface EditToolbarProps {
  onSave: () => void;
  onCancel: () => void;
  onUndo: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  position: { top: number; left: number };
  type: "text" | "textarea" | "richtext";
}

/**
 * Floating toolbar for inline editing
 */
function EditToolbar({
  onSave,
  onCancel,
  onUndo,
  isSaving,
  hasChanges,
  position,
  type,
}: EditToolbarProps) {
  return (
    <div
      className={cn(
        "fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg shadow-xl",
        "bg-[var(--card)] border border-[var(--border)]",
        "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
      style={{
        top: `${position.top - 50}px`,
        left: `${position.left}px`,
      }}
      role="toolbar"
      aria-label="Editing controls"
    >
      {/* Content type indicator */}
      <div className="flex items-center gap-1 px-2 text-xs text-[var(--foreground-muted)] border-r border-[var(--border)] mr-1">
        {type === "textarea" ? (
          <AlignLeft className="w-3 h-3" aria-hidden="true" />
        ) : (
          <Type className="w-3 h-3" aria-hidden="true" />
        )}
        <span className="capitalize">{type}</span>
      </div>

      {/* Undo button */}
      <button
        onClick={onUndo}
        disabled={!hasChanges}
        className={cn(
          "p-1.5 rounded transition-colors",
          "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
          "hover:bg-[var(--background-elevated)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        )}
        aria-label="Undo changes"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />

      {/* Cancel button */}
      <button
        onClick={onCancel}
        className={cn(
          "p-1.5 rounded transition-colors",
          "text-[var(--foreground-muted)] hover:text-red-500",
          "hover:bg-red-500/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        )}
        aria-label="Cancel editing"
        title="Cancel"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={isSaving || !hasChanges}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
          "bg-[var(--primary)] text-white",
          "hover:bg-[var(--primary)]/90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        )}
        aria-label={isSaving ? "Saving..." : "Save changes"}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            <span>Saving</span>
          </>
        ) : (
          <>
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Inline editable component that enables direct content editing
 * on marketing pages when preview mode is enabled
 */
export function InlineEditable({
  path,
  pageSlug,
  value,
  type = "text",
  isEnabled = false,
  className,
  as: Component = type === "textarea" ? "p" : "span",
  placeholder = "Click to edit...",
  onUpdate,
  children,
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Update toolbar position when editing starts
  const updateToolbarPosition = useCallback(() => {
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, []);

  // Start editing
  const handleStartEdit = useCallback(() => {
    if (!isEnabled) return;
    setIsEditing(true);
    setEditValue(value);
    updateToolbarPosition();
  }, [isEnabled, value, updateToolbarPosition]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
  }, [value]);

  // Undo changes
  const handleUndo = useCallback(() => {
    setEditValue(value);
  }, [value]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      // Build the content update object
      // This creates a deep object from the path (e.g., "hero.headline" -> { hero: { headline: value } })
      const pathParts = path.split(".");
      const contentUpdate: Record<string, unknown> = {};
      let current = contentUpdate;

      for (let i = 0; i < pathParts.length - 1; i++) {
        current[pathParts[i]] = {};
        current = current[pathParts[i]] as Record<string, unknown>;
      }
      current[pathParts[pathParts.length - 1]] = editValue;

      // Save as draft
      const result = await saveDraft(pageSlug, contentUpdate);

      if (result.success) {
        setIsEditing(false);
        onUpdate?.(editValue);
      }
    } catch (error) {
      console.error("Failed to save inline edit:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, path, pageSlug, onUpdate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, handleCancel, handleSave]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      } else {
        const range = document.createRange();
        range.selectNodeContents(inputRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isEditing]);

  // Update toolbar position on scroll/resize
  useEffect(() => {
    if (!isEditing) return;

    const handleUpdate = () => updateToolbarPosition();
    window.addEventListener("scroll", handleUpdate);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isEditing, updateToolbarPosition]);

  const hasChanges = editValue !== value;
  const displayValue = children || value || placeholder;

  // Not in edit mode - show content with edit indicator
  if (!isEditing) {
    return (
      <Component
        ref={contentRef as React.RefObject<HTMLElement>}
        className={cn(
          className,
          isEnabled && [
            "relative group cursor-pointer",
            "outline-2 outline-offset-2 outline-transparent",
            "hover:outline-[var(--primary)]/50",
            "transition-all duration-200",
          ]
        )}
        onClick={handleStartEdit}
        role={isEnabled ? "button" : undefined}
        tabIndex={isEnabled ? 0 : undefined}
        onKeyDown={isEnabled ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleStartEdit();
          }
        } : undefined}
        aria-label={isEnabled ? `Edit ${path}` : undefined}
      >
        {displayValue}
        {isEnabled && (
          <span
            className={cn(
              "absolute -top-2 -right-2 p-1 rounded-full",
              "bg-[var(--primary)] text-white",
              "opacity-0 group-hover:opacity-100",
              "transition-opacity duration-200",
              "shadow-lg"
            )}
            aria-hidden="true"
          >
            <Edit3 className="w-3 h-3" />
          </span>
        )}
      </Component>
    );
  }

  // Edit mode
  return (
    <>
      {/* Edit toolbar */}
      <EditToolbar
        onSave={handleSave}
        onCancel={handleCancel}
        onUndo={handleUndo}
        isSaving={isSaving}
        hasChanges={hasChanges}
        position={toolbarPosition}
        type={type}
      />

      {/* Editable content */}
      {type === "textarea" ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={cn(
            className,
            "block w-full resize-none",
            "bg-transparent border-2 border-[var(--primary)]",
            "rounded-lg p-2",
            "focus:outline-none focus:ring-0",
            "text-inherit font-inherit"
          )}
          style={{ minHeight: contentRef.current?.offsetHeight || 100 }}
          aria-label={`Editing ${path}`}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={cn(
            className,
            "block w-full",
            "bg-transparent border-2 border-[var(--primary)]",
            "rounded-lg px-2 py-1",
            "focus:outline-none focus:ring-0",
            "text-inherit font-inherit"
          )}
          aria-label={`Editing ${path}`}
        />
      )}
    </>
  );
}

/**
 * Context provider for inline editing state
 */
export function InlineEditProvider({
  isEnabled,
  pageSlug,
  children,
}: {
  isEnabled: boolean;
  pageSlug: string;
  children: React.ReactNode;
}) {
  return (
    <div data-inline-edit-enabled={isEnabled} data-page-slug={pageSlug}>
      {children}
    </div>
  );
}

/**
 * Hook to check if inline editing is available
 */
export function useInlineEdit() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [pageSlug, setPageSlug] = useState<string | null>(null);

  useEffect(() => {
    // Check for parent inline edit provider
    const container = document.querySelector("[data-inline-edit-enabled='true']");
    if (container) {
      setIsEnabled(true);
      setPageSlug(container.getAttribute("data-page-slug"));
    }
  }, []);

  return { isEnabled, pageSlug };
}
