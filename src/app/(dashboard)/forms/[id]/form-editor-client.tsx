"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  updateForm,
  addFormField,
  updateFormField,
  deleteFormField,
  reorderFormFields,
  deleteForm,
  type FormFieldInput,
  type FormFieldOption,
} from "@/lib/actions/custom-forms";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { CustomFormFieldType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface FormField {
  id: string;
  name: string;
  label: string;
  type: CustomFormFieldType;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  minLength: number | null;
  maxLength: number | null;
  pattern: string | null;
  patternError: string | null;
  options: unknown; // Prisma JsonValue
  position: number;
  width: string;
  conditionalLogic: unknown | null;
}

// Helper to safely get options as FormFieldOption[]
function getOptionsArray(options: unknown): Array<FormFieldOption> {
  if (!options || !Array.isArray(options)) return [] as Array<FormFieldOption>;
  return options.map((opt: unknown) => ({
    label: String((opt as Record<string, unknown>)?.label || ""),
    value: String((opt as Record<string, unknown>)?.value || ""),
  }));
}

interface Form {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  submitButtonText: string;
  successMessage: string;
  redirectUrl: string | null;
  sendEmailOnSubmission: boolean;
  notificationEmails: string | null;
  maxSubmissions: number | null;
  submissionsPerUser: number | null;
  fields: FormField[];
  _count: { submissions: number };
}

interface FormEditorClientProps {
  form: Form;
}

// ============================================================================
// FIELD TYPE DEFINITIONS
// ============================================================================

const fieldTypes: {
  type: CustomFormFieldType;
  label: string;
  icon: string;
  category: "basic" | "contact" | "datetime" | "choice" | "advanced" | "layout";
}[] = [
  { type: "text", label: "Short Text", icon: "T", category: "basic" },
  { type: "textarea", label: "Long Text", icon: "¶", category: "basic" },
  { type: "number", label: "Number", icon: "#", category: "basic" },
  { type: "email", label: "Email", icon: "@", category: "contact" },
  { type: "phone", label: "Phone", icon: "📞", category: "contact" },
  { type: "url", label: "URL", icon: "🔗", category: "contact" },
  { type: "date", label: "Date", icon: "📅", category: "datetime" },
  { type: "time", label: "Time", icon: "🕐", category: "datetime" },
  { type: "datetime", label: "Date & Time", icon: "📆", category: "datetime" },
  { type: "select", label: "Dropdown", icon: "▼", category: "choice" },
  { type: "multiselect", label: "Multi-Select", icon: "☑", category: "choice" },
  { type: "radio", label: "Radio Buttons", icon: "◉", category: "choice" },
  { type: "checkbox", label: "Checkbox", icon: "✓", category: "choice" },
  { type: "file", label: "File Upload", icon: "📎", category: "advanced" },
  { type: "hidden", label: "Hidden Field", icon: "👁", category: "advanced" },
  { type: "heading", label: "Heading", icon: "H", category: "layout" },
  { type: "paragraph", label: "Paragraph", icon: "📝", category: "layout" },
  { type: "divider", label: "Divider", icon: "—", category: "layout" },
];

const categories = [
  { id: "basic", label: "Basic" },
  { id: "contact", label: "Contact" },
  { id: "datetime", label: "Date & Time" },
  { id: "choice", label: "Choice" },
  { id: "advanced", label: "Advanced" },
  { id: "layout", label: "Layout" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FormEditorClient({ form }: FormEditorClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();

  // Form metadata state
  const [name, setName] = useState(form.name);
  const [description, setDescription] = useState(form.description || "");
  const [isActive, setIsActive] = useState(form.isActive);
  const [submitButtonText, setSubmitButtonText] = useState(form.submitButtonText);
  const [successMessage, setSuccessMessage] = useState(form.successMessage);
  const [redirectUrl, setRedirectUrl] = useState(form.redirectUrl || "");
  const [sendEmailOnSubmission, setSendEmailOnSubmission] = useState(form.sendEmailOnSubmission);
  const [notificationEmails, setNotificationEmails] = useState(form.notificationEmails || "");

  // Fields state
  const [fields, setFields] = useState<FormField[]>(form.fields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"fields" | "settings" | "preview">("fields");

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const markChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(fields, oldIndex, newIndex);
        setFields(newFields.map((f, i) => ({ ...f, position: i })));
        markChanged();

        // Save reorder immediately
        startTransition(async () => {
          const result = await reorderFormFields(
            form.id,
            newFields.map((f) => f.id)
          );
          if (!result.success) {
            showToast("Failed to reorder fields", "error");
          }
        });
      }
    }
  };

  const generateFieldName = (type: CustomFormFieldType) => {
    const base = type.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const existing = fields.filter((f) => f.name.startsWith(base)).length;
    return existing > 0 ? `${base}_${existing + 1}` : base;
  };

  const handleAddField = (type: CustomFormFieldType) => {
    const fieldMeta = fieldTypes.find((f) => f.type === type);
    if (!fieldMeta) return;

    const newField: FormFieldInput = {
      name: generateFieldName(type),
      label: fieldMeta.label,
      type: type,
      placeholder: undefined,
      helpText: undefined,
      isRequired: false,
      position: fields.length,
      width: "full",
    };

    startTransition(async () => {
      const result = await addFormField(form.id, newField);
      if (result.success) {
        setFields([...fields, result.data]);
        setSelectedFieldId(result.data.id);
        showToast("Field added", "success");
      } else {
        showToast(result.error, "error");
      }
    });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
    markChanged();

    // Debounce save
    startTransition(async () => {
      const result = await updateFormField(fieldId, updates as Partial<FormFieldInput>);
      if (!result.success) {
        showToast("Failed to update field", "error");
      }
    });
  };

  const handleDeleteField = async (fieldId: string) => {
    const confirmed = await confirm({
      title: "Delete field",
      description: "Delete this field? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteFormField(fieldId);
      if (result.success) {
        setFields(fields.filter((f) => f.id !== fieldId));
        if (selectedFieldId === fieldId) setSelectedFieldId(null);
        showToast("Field deleted", "success");
      } else {
        showToast(result.error || "Failed to delete field", "error");
      }
    });
  };

  const handleDuplicateField = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newField: FormFieldInput = {
      name: generateFieldName(field.type),
      label: `${field.label} (Copy)`,
      type: field.type,
      placeholder: field.placeholder || undefined,
      helpText: field.helpText || undefined,
      isRequired: field.isRequired,
      minLength: field.minLength || undefined,
      maxLength: field.maxLength || undefined,
      pattern: field.pattern || undefined,
      patternError: field.patternError || undefined,
      options: getOptionsArray(field.options).length > 0 ? getOptionsArray(field.options) : undefined,
      position: fields.length,
      width: field.width as "full" | "half" | "third",
    };

    startTransition(async () => {
      const result = await addFormField(form.id, newField);
      if (result.success) {
        setFields([...fields, result.data]);
        setSelectedFieldId(result.data.id);
        showToast("Field duplicated", "success");
      } else {
        showToast(result.error, "error");
      }
    });
  };

  const handleSaveSettings = async () => {
    startTransition(async () => {
      const result = await updateForm(form.id, {
        name,
        description: description || undefined,
        isActive,
        submitButtonText,
        successMessage,
        redirectUrl: redirectUrl || null,
        sendEmailOnSubmission,
        notificationEmails: notificationEmails || null,
      });

      if (result.success) {
        showToast("Settings saved", "success");
        setHasChanges(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to save settings", "error");
      }
    });
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete form",
      description: "Are you sure you want to delete this form? All submissions will be lost.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteForm(form.id);
      if (result.success) {
        showToast("Form deleted", "success");
        router.push("/forms");
      } else {
        showToast(result.error || "Failed to delete form", "error");
      }
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--background)] px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/forms"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{form.name}</h1>
              <p className="text-sm text-foreground-muted">
                {fields.length} field{fields.length !== 1 && "s"} • {form._count.submissions} submission{form._count.submissions !== 1 && "s"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hasChanges && (
              <span className="text-sm text-yellow-400">Unsaved changes</span>
            )}
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
            >
              <ExternalLinkIcon className="h-4 w-4" />
              View Form
            </a>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)] px-4 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
            {activeTab === "settings" && (
              <button
                onClick={handleSaveSettings}
                disabled={isPending || !hasChanges}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Settings"}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveTab("fields")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === "fields"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)]"
            )}
          >
            Fields ({fields.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === "settings"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)]"
            )}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === "preview"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)]"
            )}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "fields" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 min-h-[calc(100vh-220px)]">
              {/* Left Panel - Field Palette */}
              <div className="w-64 shrink-0 overflow-y-auto">
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 sticky top-0">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Add Fields</h3>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <p className="text-xs text-foreground-muted mb-2">{category.label}</p>
                        <div className="space-y-1.5">
                          {fieldTypes
                            .filter((f) => f.category === category.id)
                            .map((fieldType) => (
                              <button
                                key={fieldType.type}
                                type="button"
                                onClick={() => handleAddField(fieldType.type)}
                                disabled={isPending}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm bg-[var(--background)] text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
                              >
                                <span className="w-5 h-5 flex items-center justify-center text-xs shrink-0 rounded bg-[var(--background-tertiary)]">
                                  {fieldType.icon}
                                </span>
                                {fieldType.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Panel - Form Canvas */}
              <div className="flex-1 overflow-y-auto">
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 min-h-full">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Form Fields</h3>

                  {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-lg bg-[var(--background)] flex items-center justify-center mb-4">
                        <FormIcon className="w-6 h-6 text-foreground-muted" />
                      </div>
                      <p className="text-foreground-muted mb-2">No fields added yet</p>
                      <p className="text-sm text-foreground-muted">
                        Click a field type on the left to add it.
                      </p>
                    </div>
                  ) : (
                    <SortableContext
                      items={fields.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {fields.map((field) => (
                          <SortableField
                            key={field.id}
                            field={field}
                            isSelected={field.id === selectedFieldId}
                            onSelect={() => setSelectedFieldId(field.id)}
                            onDelete={() => handleDeleteField(field.id)}
                            onDuplicate={() => handleDuplicateField(field.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  )}
                </div>
              </div>

              {/* Right Panel - Field Editor */}
              <div className="w-80 shrink-0 overflow-y-auto">
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 sticky top-0">
                  {selectedField ? (
                    <FieldEditor
                      field={selectedField}
                      onUpdate={(updates) => handleUpdateField(selectedField.id, updates)}
                      onClose={() => setSelectedFieldId(null)}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-foreground-muted text-sm">
                        Select a field to edit its properties
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="bg-[var(--card)] border border-[var(--primary)] rounded-lg p-3 shadow-lg opacity-80">
                  <span className="text-sm text-foreground">
                    {fields.find((f) => f.id === activeId)?.label}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            {/* Basic Settings */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Form Settings</h3>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Form Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    markChanged();
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    markChanged();
                  }}
                  rows={3}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Active</p>
                  <p className="text-xs text-foreground-muted">
                    Inactive forms will not accept submissions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsActive(!isActive);
                    markChanged();
                  }}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                    isActive ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                      isActive ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Submission Settings */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Submission Settings</h3>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Submit Button Text
                </label>
                <input
                  type="text"
                  value={submitButtonText}
                  onChange={(e) => {
                    setSubmitButtonText(e.target.value);
                    markChanged();
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Success Message
                </label>
                <textarea
                  value={successMessage}
                  onChange={(e) => {
                    setSuccessMessage(e.target.value);
                    markChanged();
                  }}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Redirect URL (Optional)
                </label>
                <input
                  type="url"
                  value={redirectUrl}
                  onChange={(e) => {
                    setRedirectUrl(e.target.value);
                    markChanged();
                  }}
                  placeholder="https://example.com/thank-you"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Notifications</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-foreground-muted">
                    Send email when form is submitted
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSendEmailOnSubmission(!sendEmailOnSubmission);
                    markChanged();
                  }}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                    sendEmailOnSubmission ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                      sendEmailOnSubmission ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {sendEmailOnSubmission && (
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                    Notification Emails
                  </label>
                  <input
                    type="text"
                    value={notificationEmails}
                    onChange={(e) => {
                      setNotificationEmails(e.target.value);
                      markChanged();
                    }}
                    placeholder="email@example.com, another@example.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                  <p className="text-xs text-foreground-muted mt-1">
                    Separate multiple emails with commas
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Form Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-foreground-muted">
                  <strong>Slug:</strong> {form.slug}
                </p>
                <p className="text-foreground-muted">
                  <strong>Public URL:</strong>{" "}
                  <code className="px-1.5 py-0.5 rounded bg-[var(--background)] text-foreground">
                    /f/{form.slug}
                  </code>
                </p>
                <p className="text-foreground-muted">
                  <strong>Total Submissions:</strong> {form._count.submissions}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">{name}</h2>
              {description && (
                <p className="text-foreground-muted mb-6">{description}</p>
              )}

              <div className="space-y-6">
                {fields.map((field) => (
                  <FieldPreview key={field.id} field={field} />
                ))}
              </div>

              {fields.length > 0 && (
                <button
                  type="button"
                  disabled
                  className="mt-8 w-full py-3 px-4 rounded-lg bg-[var(--primary)] text-white font-medium opacity-50 cursor-not-allowed"
                >
                  {submitButtonText}
                </button>
              )}

              {fields.length === 0 && (
                <div className="text-center py-8 text-foreground-muted">
                  Add some fields to see the preview
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SORTABLE FIELD COMPONENT
// ============================================================================

function SortableField({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fieldMeta = fieldTypes.find((f) => f.type === field.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
        isSelected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab active:cursor-grabbing text-foreground-muted hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripIcon className="w-4 h-4" />
      </button>

      <span className="w-6 h-6 flex items-center justify-center text-xs shrink-0 rounded bg-[var(--background-tertiary)] text-foreground-muted">
        {fieldMeta?.icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {field.label}
          {field.isRequired && <span className="text-[var(--error)] ml-1">*</span>}
        </p>
        <p className="text-xs text-foreground-muted truncate">
          {fieldMeta?.label} • {field.name}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-[var(--background)] transition-colors"
          title="Duplicate"
        >
          <DuplicateIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded-md text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// FIELD EDITOR COMPONENT
// ============================================================================

function FieldEditor({
  field,
  onUpdate,
  onClose,
}: {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
}) {
  const needsOptions = ["select", "multiselect", "radio"].includes(field.type);
  const isLayoutField = ["heading", "paragraph", "divider"].includes(field.type);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Field Settings</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-[var(--background)] transition-colors"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Label */}
      <div>
        <label className="block text-xs font-medium text-foreground-muted mb-1.5">
          {isLayoutField ? "Content" : "Label"}
        </label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {/* Field Name (for non-layout fields) */}
      {!isLayoutField && (
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Field Name
          </label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <p className="text-xs text-foreground-muted mt-1">Used in form data</p>
        </div>
      )}

      {/* Placeholder (for text-like fields) */}
      {["text", "textarea", "email", "phone", "number", "url"].includes(field.type) && (
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value || null })}
            placeholder="Optional placeholder text"
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      )}

      {/* Help Text */}
      {!isLayoutField && (
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Help Text
          </label>
          <input
            type="text"
            value={field.helpText || ""}
            onChange={(e) => onUpdate({ helpText: e.target.value || null })}
            placeholder="Optional help text"
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      )}

      {/* Width */}
      <div>
        <label className="block text-xs font-medium text-foreground-muted mb-1.5">
          Width
        </label>
        <select
          value={field.width}
          onChange={(e) => onUpdate({ width: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="full">Full Width</option>
          <option value="half">Half Width</option>
          <option value="third">One Third</option>
        </select>
      </div>

      {/* Required Toggle (for non-layout fields) */}
      {!isLayoutField && field.type !== "hidden" && (
        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground">Required</label>
          <button
            type="button"
            onClick={() => onUpdate({ isRequired: !field.isRequired })}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              field.isRequired ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                field.isRequired ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      )}

      {/* Options for select/multiselect/radio */}
      {needsOptions && (
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Options (one per line)
          </label>
          <textarea
            value={getOptionsArray(field.options).map((o) => o.label).join("\n")}
            onChange={(e) => {
              const options = e.target.value
                .split("\n")
                .filter(Boolean)
                .map((label) => ({
                  label,
                  value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
                }));
              onUpdate({ options });
            }}
            rows={4}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
          />
        </div>
      )}

      {/* Validation for text-like fields */}
      {["text", "textarea", "email", "phone", "url"].includes(field.type) && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Min Length
              </label>
              <input
                type="number"
                value={field.minLength || ""}
                onChange={(e) => onUpdate({ minLength: e.target.value ? parseInt(e.target.value) : null })}
                min={0}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Max Length
              </label>
              <input
                type="number"
                value={field.maxLength || ""}
                onChange={(e) => onUpdate({ maxLength: e.target.value ? parseInt(e.target.value) : null })}
                min={0}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// FIELD PREVIEW COMPONENT
// ============================================================================

function FieldPreview({ field }: { field: FormField }) {
  const widthClass = {
    full: "w-full",
    half: "w-1/2",
    third: "w-1/3",
  }[field.width] || "w-full";

  // Layout fields
  if (field.type === "heading") {
    return (
      <h3 className="text-lg font-semibold text-foreground pt-4 first:pt-0">
        {field.label}
      </h3>
    );
  }

  if (field.type === "paragraph") {
    return (
      <p className="text-sm text-foreground-muted">{field.label}</p>
    );
  }

  if (field.type === "divider") {
    return <hr className="border-[var(--card-border)]" />;
  }

  // Hidden fields
  if (field.type === "hidden") {
    return null;
  }

  // Form fields
  return (
    <div className={widthClass}>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {field.label}
        {field.isRequired && <span className="text-[var(--error)] ml-1">*</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          placeholder={field.placeholder || ""}
          disabled
          rows={4}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted resize-none opacity-50"
        />
      ) : field.type === "select" ? (
        <select
          disabled
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground opacity-50"
        >
          <option>{field.placeholder || "Select an option"}</option>
          {getOptionsArray(field.options).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "multiselect" ? (
        <div className="space-y-2 opacity-50">
          {getOptionsArray(field.options).map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <Checkbox checked={false} onCheckedChange={() => {}} disabled />
              <span className="text-sm text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      ) : field.type === "radio" ? (
        <div className="space-y-2 opacity-50">
          {getOptionsArray(field.options).map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <input type="radio" disabled name={field.name} />
              <span className="text-sm text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-2 opacity-50">
          <Checkbox checked={false} onCheckedChange={() => {}} disabled />
          <span className="text-sm text-foreground">{field.placeholder || "I agree"}</span>
        </label>
      ) : field.type === "file" ? (
        <div className="flex items-center gap-2 opacity-50">
          <button
            type="button"
            disabled
            className="px-4 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground"
          >
            Choose File
          </button>
          <span className="text-sm text-foreground-muted">No file chosen</span>
        </div>
      ) : (
        <input
          type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "url" ? "url" : field.type === "date" ? "date" : field.type === "time" ? "time" : field.type === "datetime" ? "datetime-local" : "text"}
          placeholder={field.placeholder || ""}
          disabled
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted opacity-50"
        />
      )}

      {field.helpText && (
        <p className="text-xs text-foreground-muted mt-1">{field.helpText}</p>
      )}
    </div>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function FormIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM5 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM6.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM15 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM16.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" clipRule="evenodd" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.44A1.5 1.5 0 0 0 8.378 6H4.5Z" />
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
