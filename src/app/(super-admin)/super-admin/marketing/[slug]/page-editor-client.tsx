"use client";

import { useState, useTransition, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Save,
  ExternalLink,
  Eye,
  Settings,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Code,
  LayoutGrid,
  RefreshCw,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Sparkles,
  History,
} from "lucide-react";
import { VersionHistory, SchedulingPanel, ActiveEditors, useAutoSave, AutoSaveBadge } from "@/components/cms";
import type { MarketingPage } from "@prisma/client";
import { updateMarketingPage, publishMarketingPage, deleteMarketingPage, schedulePublish, cancelScheduledPublish, saveDraft } from "@/lib/actions/marketing-cms";

interface Props {
  page: MarketingPage;
}

// Common content sections that can be edited visually
type ContentSection = {
  key: string;
  label: string;
  type: "text" | "textarea" | "array" | "object";
  fields?: Record<string, { type: "text" | "textarea"; label: string }>;
};

// Define common page content structures
const PAGE_CONTENT_SCHEMAS: Record<string, ContentSection[]> = {
  homepage: [
    { key: "hero", label: "Hero Section", type: "object", fields: {
      badge: { type: "text", label: "Badge Text" },
      headline: { type: "text", label: "Headline" },
      subheadline: { type: "textarea", label: "Subheadline" },
      cta: { type: "text", label: "CTA Text" },
      ctaLink: { type: "text", label: "CTA Link" },
    }},
    { key: "features", label: "Features", type: "array", fields: {
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
      icon: { type: "text", label: "Icon" },
    }},
  ],
  about: [
    { key: "hero", label: "Hero Section", type: "object", fields: {
      badge: { type: "text", label: "Badge Text" },
      headline: { type: "text", label: "Headline" },
      subheadline: { type: "textarea", label: "Subheadline" },
    }},
    { key: "mission", label: "Mission Section", type: "object", fields: {
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
    }},
  ],
  pricing: [
    { key: "hero", label: "Hero Section", type: "object", fields: {
      badge: { type: "text", label: "Badge Text" },
      headline: { type: "text", label: "Headline" },
      subheadline: { type: "textarea", label: "Subheadline" },
    }},
    { key: "guarantee", label: "Guarantee Section", type: "object", fields: {
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
    }},
  ],
  features: [
    { key: "hero", label: "Hero Section", type: "object", fields: {
      badge: { type: "text", label: "Badge Text" },
      headline: { type: "text", label: "Headline" },
      subheadline: { type: "textarea", label: "Subheadline" },
    }},
    { key: "features", label: "Feature List", type: "array", fields: {
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
    }},
  ],
  industries: [
    { key: "hero", label: "Hero Section", type: "object", fields: {
      badge: { type: "text", label: "Badge Text" },
      headline: { type: "text", label: "Headline" },
      subheadline: { type: "textarea", label: "Subheadline" },
    }},
    { key: "benefits", label: "Benefits", type: "array", fields: {
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
    }},
  ],
  legal: [
    { key: "title", label: "Page Title", type: "text" },
    { key: "lastUpdated", label: "Last Updated Date", type: "text" },
    { key: "content", label: "Legal Content", type: "textarea" },
  ],
};

// Generate unique IDs for form fields
let fieldIdCounter = 0;
function useFieldId(prefix: string) {
  const [id] = useState(() => `${prefix}-${++fieldIdCounter}`);
  return id;
}

// Input field component with proper accessibility
function InputField({
  label,
  value,
  onChange,
  placeholder,
  description,
  maxLength,
  id: providedId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  maxLength?: number;
  id?: string;
}) {
  const generatedId = useFieldId("input");
  const inputId = providedId || generatedId;
  const descriptionId = `${inputId}-desc`;
  const isOverLimit = maxLength && value.length > maxLength;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--foreground)]"
        >
          {label}
        </label>
        {maxLength && (
          <span
            className={cn("text-xs", isOverLimit ? "text-red-500" : "text-[var(--foreground-muted)]")}
            aria-live="polite"
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {description && (
        <p id={descriptionId} className="text-xs text-[var(--foreground-muted)]">
          {description}
        </p>
      )}
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={description ? descriptionId : undefined}
        aria-invalid={isOverLimit ? "true" : undefined}
        className={cn(
          "w-full px-3 py-2 rounded-lg text-sm",
          "bg-[var(--background)] border border-[var(--border)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
          "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
          isOverLimit && "border-red-500"
        )}
      />
    </div>
  );
}

// Textarea field component with proper accessibility
function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  description,
  maxLength,
  rows = 3,
  id: providedId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  maxLength?: number;
  rows?: number;
  id?: string;
}) {
  const generatedId = useFieldId("textarea");
  const textareaId = providedId || generatedId;
  const descriptionId = `${textareaId}-desc`;
  const isOverLimit = maxLength && value.length > maxLength;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-[var(--foreground)]"
        >
          {label}
        </label>
        {maxLength && (
          <span
            className={cn("text-xs", isOverLimit ? "text-red-500" : "text-[var(--foreground-muted)]")}
            aria-live="polite"
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {description && (
        <p id={descriptionId} className="text-xs text-[var(--foreground-muted)]">
          {description}
        </p>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        aria-describedby={description ? descriptionId : undefined}
        aria-invalid={isOverLimit ? "true" : undefined}
        className={cn(
          "w-full px-3 py-2 rounded-lg resize-y text-sm",
          "bg-[var(--background)] border border-[var(--border)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
          "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
          isOverLimit && "border-red-500"
        )}
      />
    </div>
  );
}

// Select field component with proper accessibility
function SelectField({
  label,
  value,
  onChange,
  options,
  description,
  id: providedId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
  id?: string;
}) {
  const generatedId = useFieldId("select");
  const selectId = providedId || generatedId;
  const descriptionId = `${selectId}-desc`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>
      {description && (
        <p id={descriptionId} className="text-xs text-[var(--foreground-muted)]">
          {description}
        </p>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "w-full px-3 py-2 rounded-lg text-sm",
          "bg-[var(--background)] border border-[var(--border)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
          "text-[var(--foreground)]"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Tab button component with proper ARIA attributes
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  tabId,
  panelId,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  tabId?: string;
  panelId?: string;
}) {
  return (
    <button
      role="tab"
      id={tabId}
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        active
          ? "bg-[var(--primary)] text-white"
          : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]"
      )}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  );
}

// Collapsible section component with proper accessibility
function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionId = useFieldId("section");
  const contentId = `${sectionId}-content`;

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3",
          "bg-[var(--background-elevated)] hover:bg-[var(--background-tertiary)]",
          "transition-colors text-left",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
        )}
      >
        <span className="font-medium text-sm text-[var(--foreground)]">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
        )}
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={sectionId}
        hidden={!isOpen}
        className={isOpen ? "p-4 space-y-4" : ""}
      >
        {isOpen && children}
      </div>
    </div>
  );
}

// Visual field editor for structured content
function VisualFieldEditor({
  content,
  onChange,
  schema,
}: {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  schema: ContentSection[];
}) {
  const updateField = (key: string, value: unknown) => {
    onChange({ ...content, [key]: value });
  };

  const updateNestedField = (key: string, field: string, value: string) => {
    const current = (content[key] as Record<string, unknown>) || {};
    onChange({ ...content, [key]: { ...current, [field]: value } });
  };

  const updateArrayItem = (key: string, index: number, field: string, value: string) => {
    const array = [...((content[key] as Record<string, unknown>[]) || [])];
    array[index] = { ...array[index], [field]: value };
    onChange({ ...content, [key]: array });
  };

  const addArrayItem = (key: string, fields: Record<string, { type: string; label: string }>) => {
    const array = [...((content[key] as Record<string, unknown>[]) || [])];
    const newItem: Record<string, string> = {};
    Object.keys(fields).forEach((f) => (newItem[f] = ""));
    array.push(newItem);
    onChange({ ...content, [key]: array });
  };

  const removeArrayItem = (key: string, index: number) => {
    const array = [...((content[key] as Record<string, unknown>[]) || [])];
    array.splice(index, 1);
    onChange({ ...content, [key]: array });
  };

  return (
    <div className="space-y-4">
      {schema.map((section) => (
        <CollapsibleSection key={section.key} title={section.label}>
          {section.type === "text" && (
            <InputField
              label={section.label}
              value={(content[section.key] as string) || ""}
              onChange={(value) => updateField(section.key, value)}
            />
          )}

          {section.type === "textarea" && (
            <TextareaField
              label={section.label}
              value={(content[section.key] as string) || ""}
              onChange={(value) => updateField(section.key, value)}
              rows={6}
            />
          )}

          {section.type === "object" && section.fields && (
            <div className="space-y-4">
              {Object.entries(section.fields).map(([fieldKey, fieldConfig]) => (
                <div key={fieldKey}>
                  {fieldConfig.type === "text" ? (
                    <InputField
                      label={fieldConfig.label}
                      value={((content[section.key] as Record<string, unknown>)?.[fieldKey] as string) || ""}
                      onChange={(value) => updateNestedField(section.key, fieldKey, value)}
                    />
                  ) : (
                    <TextareaField
                      label={fieldConfig.label}
                      value={((content[section.key] as Record<string, unknown>)?.[fieldKey] as string) || ""}
                      onChange={(value) => updateNestedField(section.key, fieldKey, value)}
                      rows={3}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {section.type === "array" && section.fields && (
            <div className="space-y-4">
              {((content[section.key] as Record<string, unknown>[]) || []).map((item, index) => (
                <div key={index} className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)] relative group">
                  <button
                    onClick={() => removeArrayItem(section.key, index)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all"
                    aria-label="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="text-xs font-medium text-[var(--foreground-muted)] mb-3">Item {index + 1}</div>
                  <div className="space-y-3">
                    {Object.entries(section.fields!).map(([fieldKey, fieldConfig]) => (
                      <div key={fieldKey}>
                        {fieldConfig.type === "text" ? (
                          <InputField
                            label={fieldConfig.label}
                            value={(item[fieldKey] as string) || ""}
                            onChange={(value) => updateArrayItem(section.key, index, fieldKey, value)}
                          />
                        ) : (
                          <TextareaField
                            label={fieldConfig.label}
                            value={(item[fieldKey] as string) || ""}
                            onChange={(value) => updateArrayItem(section.key, index, fieldKey, value)}
                            rows={2}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => addArrayItem(section.key, section.fields!)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add {section.label.replace(/s$/, "")}
              </button>
            </div>
          )}
        </CollapsibleSection>
      ))}
    </div>
  );
}

// JSON editor with enhanced features
function JsonEditor({
  value,
  onChange,
  onFormat,
}: {
  value: string;
  onChange: (value: string) => void;
  onFormat: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    try {
      JSON.parse(newValue);
      setError(null);
    } catch (e) {
      setError("Invalid JSON syntax");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--foreground)]">Raw JSON Editor</label>
        <button
          onClick={onFormat}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Format JSON
        </button>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            "w-full min-h-[500px] p-4 rounded-lg font-mono text-sm leading-relaxed",
            "bg-[var(--background)] border",
            error ? "border-red-500" : "border-[var(--border)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--background)]",
            "resize-y"
          )}
          spellCheck={false}
        />
        {error && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-xs text-red-500">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// Unsaved changes warning dialog with proper accessibility
function UnsavedChangesDialog({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
}: {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Focus the save button when dialog opens
    saveButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-dialog-title"
      aria-describedby="unsaved-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <h3
          id="unsaved-dialog-title"
          className="text-lg font-semibold text-[var(--foreground)] mb-2"
        >
          Unsaved Changes
        </h3>
        <p
          id="unsaved-dialog-desc"
          className="text-sm text-[var(--foreground-muted)] mb-6"
        >
          You have unsaved changes. Do you want to save them before leaving?
        </p>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={onDiscard}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] hover:bg-[var(--background-elevated)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Cancel
          </button>
          <button
            ref={saveButtonRef}
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation dialog with proper accessibility
function DeleteConfirmDialog({
  isOpen,
  pageName,
  isProtected,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  pageName: string;
  isProtected: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Reset confirm text when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
    }
  }, [isOpen]);

  // Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Focus the appropriate element when dialog opens
    if (isProtected) {
      cancelRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProtected, onCancel]);

  if (!isOpen) return null;

  const canDelete = confirmText.toLowerCase() === "delete";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-500/10" aria-hidden="true">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3
            id="delete-dialog-title"
            className="text-lg font-semibold text-[var(--foreground)]"
          >
            Delete Page
          </h3>
        </div>

        {isProtected ? (
          <>
            <p
              id="delete-dialog-desc"
              className="text-sm text-[var(--foreground-muted)] mb-6"
            >
              <strong className="text-[var(--foreground)]">{pageName}</strong> is a protected page and cannot be deleted.
              Protected pages include Homepage, Pricing, and About.
            </p>
            <div className="flex items-center justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Got it
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              id="delete-dialog-desc"
              className="text-sm text-[var(--foreground-muted)] mb-4"
            >
              Are you sure you want to delete <strong className="text-[var(--foreground)]">{pageName}</strong>?
              This action cannot be undone.
            </p>
            <div className="mb-6">
              <label
                htmlFor="delete-confirm-input"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Type &quot;delete&quot; to confirm
              </label>
              <input
                ref={inputRef}
                id="delete-confirm-input"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete"
                autoComplete="off"
                spellCheck={false}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-sm",
                  "bg-[var(--background)] border border-[var(--border)]",
                  "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-[var(--background)]",
                  "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
                )}
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] hover:bg-[var(--background-elevated)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!canDelete || isDeleting}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-red-600 text-white hover:bg-red-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                )}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" aria-hidden="true" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete Page"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PageEditorClient({ page }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings" | "history">("content");
  const [editorMode, setEditorMode] = useState<"visual" | "json">("visual");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if this page is protected from deletion
  const isProtectedPage = ["homepage", "pricing", "about"].includes(page.slug);

  // Form state
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(JSON.stringify(page.content, null, 2));
  const [metaTitle, setMetaTitle] = useState(page.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription || "");
  const [ogImage, setOgImage] = useState(page.ogImage || "");
  const [status, setStatus] = useState(page.status);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<Date | null>(
    page.scheduledPublishAt ? new Date(page.scheduledPublishAt) : null
  );

  // Auto-save draft content
  const handleAutoSave = useCallback(async () => {
    try {
      const parsedContent = JSON.parse(content);
      const result = await saveDraft(page.slug, parsedContent);
      return result.success;
    } catch {
      // Invalid JSON, skip auto-save
      return false;
    }
  }, [content, page.slug]);

  const autoSave = useAutoSave({
    content,
    onSave: handleAutoSave,
    debounceDelay: 3000, // Wait 3 seconds after typing stops
    intervalDelay: 30000, // Also save every 30 seconds
    enabled: true,
  });

  // Track original values for dirty checking
  const originalValues = useMemo(() => ({
    title: page.title,
    content: JSON.stringify(page.content, null, 2),
    metaTitle: page.metaTitle || "",
    metaDescription: page.metaDescription || "",
    ogImage: page.ogImage || "",
    status: page.status,
  }), [page]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      title !== originalValues.title ||
      content !== originalValues.content ||
      metaTitle !== originalValues.metaTitle ||
      metaDescription !== originalValues.metaDescription ||
      ogImage !== originalValues.ogImage ||
      status !== originalValues.status
    );
  }, [title, content, metaTitle, metaDescription, ogImage, status, originalValues]);

  // Get schema for current page type
  const schema = PAGE_CONTENT_SCHEMAS[page.pageType] || null;

  // Get public URL
  const publicUrl = page.slug === "homepage" ? "/" : `/${page.slug}`;

  // Parse content for visual editor
  const parsedContent = useMemo(() => {
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return {};
    }
  }, [content]);

  // Handle content change from visual editor
  const handleVisualContentChange = (newContent: Record<string, unknown>) => {
    setContent(JSON.stringify(newContent, null, 2));
  };

  // Format JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, can't format
    }
  };

  // Handle save
  const handleSave = useCallback(() => {
    setSaveStatus("saving");

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      setSaveStatus("error");
      return;
    }

    startTransition(async () => {
      const result = await updateMarketingPage({
        slug: page.slug,
        title,
        content: parsedContent,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        ogImage: ogImage || undefined,
        status: status as "draft" | "published" | "archived",
      });

      if (result.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
        router.refresh();
      } else {
        setSaveStatus("error");
      }
    });
  }, [content, title, metaTitle, metaDescription, ogImage, status, page.slug, router]);

  // Handle publish
  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishMarketingPage(page.slug);
      if (result.success) {
        setStatus("published");
        router.refresh();
      }
    });
  };

  // Handle delete
  const handleDelete = async () => {
    if (isProtectedPage) return;

    setIsDeleting(true);
    const result = await deleteMarketingPage(page.slug);

    if (result.success) {
      router.push("/super-admin/marketing/pages");
    } else {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Handle schedule publish
  const handleSchedulePublish = useCallback(async (date: Date) => {
    const result = await schedulePublish(page.slug, date);
    if (result.success && result.data) {
      setScheduledPublishAt(result.data.scheduledPublishAt ? new Date(result.data.scheduledPublishAt) : null);
      router.refresh();
      return { success: true };
    }
    return { success: false, error: result.error || "Failed to schedule" };
  }, [page.slug, router]);

  // Handle cancel scheduled publish
  const handleCancelScheduledPublish = useCallback(async () => {
    const result = await cancelScheduledPublish(page.slug);
    if (result.success) {
      setScheduledPublishAt(null);
      router.refresh();
      return { success: true };
    }
    return { success: false, error: result.error || "Failed to cancel schedule" };
  }, [page.slug, router]);

  // Keyboard shortcut for save (Cmd/Ctrl + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!isPending && saveStatus !== "saving") {
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, isPending, saveStatus]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation with unsaved changes check
  const handleNavigation = (href: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(href);
      setShowUnsavedDialog(true);
    } else {
      router.push(href);
    }
  };

  return (
    <div className="space-y-6" data-element="page-editor">
      {/* Unsaved changes dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onSave={() => {
          handleSave();
          setShowUnsavedDialog(false);
          if (pendingNavigation) {
            setTimeout(() => router.push(pendingNavigation), 500);
          }
        }}
        onDiscard={() => {
          setShowUnsavedDialog(false);
          if (pendingNavigation) {
            router.push(pendingNavigation);
          }
        }}
        onCancel={() => {
          setShowUnsavedDialog(false);
          setPendingNavigation(null);
        }}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        pageName={page.title}
        isProtected={isProtectedPage}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavigation("/super-admin/marketing/pages")}
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
            aria-label="Back to pages"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--foreground-muted)]" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--foreground)]">{page.title}</h1>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  status === "published"
                    ? "bg-green-500/10 text-green-500"
                    : status === "draft"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-gray-500/10 text-gray-400"
                )}
              >
                {status}
              </span>
              {scheduledPublishAt && status !== "published" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-medium">
                  Scheduled
                </span>
              )}
              {hasUnsavedChanges && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium">
                  Unsaved changes
                </span>
              )}
              <AutoSaveBadge
                status={autoSave.status}
                lastSavedAt={autoSave.lastSavedAt}
                isOnline={autoSave.isOnline}
              />
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">/{page.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Active editors indicator */}
          <ActiveEditors
            entityType="MarketingPage"
            entityId={page.id}
            className="hidden sm:flex"
          />

          <div className="flex items-center gap-2">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
              "text-sm font-medium text-[var(--foreground-muted)]",
              "hover:bg-[var(--background-elevated)] transition-colors"
            )}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {status !== "published" && (
            <button
              onClick={handlePublish}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                "text-sm font-medium",
                "bg-green-600 text-white hover:bg-green-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors"
              )}
            >
              Publish
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isPending || saveStatus === "saving"}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-medium",
              "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors min-w-[100px] justify-center"
            )}
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : saveStatus === "error" ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Error
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-[var(--foreground-muted)]">
        Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-elevated)] font-mono">⌘S</kbd> to save
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
        <TabButton
          active={activeTab === "content"}
          onClick={() => setActiveTab("content")}
          icon={FileText}
          label="Content"
        />
        <TabButton
          active={activeTab === "seo"}
          onClick={() => setActiveTab("seo")}
          icon={Eye}
          label="SEO"
        />
        <TabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={Settings}
          label="Settings"
        />
        <TabButton
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          icon={History}
          label="History"
        />
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        {activeTab === "content" && (
          <div className="space-y-6">
            <InputField
              label="Page Title"
              value={title}
              onChange={setTitle}
              placeholder="Enter page title"
              description="Internal title used in the CMS"
            />

            {/* Editor mode toggle */}
            {schema && (
              <div className="flex items-center gap-2 p-1 bg-[var(--background)] rounded-lg w-fit">
                <button
                  onClick={() => setEditorMode("visual")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    editorMode === "visual"
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Visual Editor
                </button>
                <button
                  onClick={() => setEditorMode("json")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                    editorMode === "json"
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Code className="w-4 h-4" />
                  JSON Editor
                </button>
              </div>
            )}

            {/* Content editor */}
            {schema && editorMode === "visual" ? (
              <VisualFieldEditor
                content={parsedContent}
                onChange={handleVisualContentChange}
                schema={schema}
              />
            ) : (
              <JsonEditor
                value={content}
                onChange={setContent}
                onFormat={handleFormatJson}
              />
            )}
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-6">
            <InputField
              label="Meta Title"
              value={metaTitle}
              onChange={setMetaTitle}
              placeholder="Page title for search engines"
              description="Appears in browser tabs and search results. Recommended: 50-60 characters."
              maxLength={60}
            />

            <TextareaField
              label="Meta Description"
              value={metaDescription}
              onChange={setMetaDescription}
              placeholder="Brief description for search engines"
              description="Appears in search results under the title. Recommended: 150-160 characters."
              maxLength={160}
            />

            <InputField
              label="Open Graph Image URL"
              value={ogImage}
              onChange={setOgImage}
              placeholder="https://example.com/image.jpg"
              description="Image shown when sharing on social media. Recommended: 1200x630px"
            />

            {/* SEO Preview */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">Search Result Preview</h3>
              <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer line-clamp-1">
                  {metaTitle || title || "Page Title"}
                </p>
                <p className="text-[#006621] text-sm mt-1">
                  photoproos.com{publicUrl}
                </p>
                <p className="text-sm text-[var(--foreground-secondary)] mt-1 line-clamp-2">
                  {metaDescription || "Add a meta description to see a preview here..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              description="Draft pages are not visible on the public site"
            />

            {/* Scheduling Section */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">Scheduling</h3>
              <SchedulingPanel
                scheduledAt={scheduledPublishAt}
                scheduledBy={page.scheduledBy}
                onSchedule={handleSchedulePublish}
                onCancelSchedule={handleCancelScheduledPublish}
                isPublished={status === "published"}
                disabled={isPending}
              />
            </div>

            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">Page Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <dt className="text-[var(--foreground-muted)]">Slug</dt>
                  <dd className="text-[var(--foreground)] font-mono text-xs bg-[var(--background)] px-2 py-1 rounded">
                    {page.slug}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[var(--foreground-muted)]">Page Type</dt>
                  <dd className="text-[var(--foreground)] capitalize">{page.pageType.replace("_", " ")}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[var(--foreground-muted)]">Created</dt>
                  <dd className="text-[var(--foreground)]">
                    {new Date(page.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[var(--foreground-muted)]">Last Updated</dt>
                  <dd className="text-[var(--foreground)]">
                    {new Date(page.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                {page.publishedAt && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-[var(--foreground-muted)]">Published</dt>
                    <dd className="text-[var(--foreground)]">
                      {new Date(page.publishedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--background-elevated)] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Live Page
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + publicUrl);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--background-elevated)] transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy URL
                </button>
                <button
                  onClick={() => router.refresh()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--background-elevated)] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-red-500/20 pt-6">
              <h3 className="text-sm font-medium text-red-500 mb-2">Danger Zone</h3>
              <p className="text-sm text-[var(--foreground-muted)] mb-4">
                {isProtectedPage
                  ? "This is a protected page and cannot be deleted."
                  : "Permanently delete this page. This action cannot be undone."}
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={isProtectedPage}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isProtectedPage
                    ? "bg-gray-500/10 text-gray-400 cursor-not-allowed"
                    : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                )}
              >
                <Trash2 className="w-4 h-4" />
                Delete Page
              </button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="min-h-[500px]">
            <VersionHistory
              slug={page.slug}
              currentContent={parsedContent}
              onRestore={() => {
                router.refresh();
                setActiveTab("content");
              }}
              asPanel={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
