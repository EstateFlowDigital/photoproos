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
import type { QuestionnaireTemplateWithRelations } from "@/lib/actions/questionnaire-templates";
import {
  updateQuestionnaireTemplate,
  updateQuestionnaireFields,
  updateQuestionnaireAgreements,
  deleteQuestionnaireTemplate,
} from "@/lib/actions/questionnaire-templates";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { FormFieldType, LegalAgreementType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface TemplateField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  sortOrder: number;
  section: string | null;
  sectionOrder: number;
  validation: Record<string, unknown> | null;
  conditionalOn: string | null;
  conditionalValue: string | null;
}

interface TemplateAgreement {
  id: string;
  agreementType: LegalAgreementType;
  title: string;
  content: string;
  isRequired: boolean;
  requiresSignature: boolean;
  sortOrder: number;
}

interface TemplateEditorClientProps {
  template: QuestionnaireTemplateWithRelations;
}

// ============================================================================
// FIELD TYPE DEFINITIONS
// ============================================================================

const fieldTypes: {
  type: FormFieldType;
  label: string;
  category: "basic" | "contact" | "datetime" | "choice" | "advanced";
}[] = [
  { type: "text", label: "Short Text", category: "basic" },
  { type: "textarea", label: "Long Text", category: "basic" },
  { type: "number", label: "Number", category: "basic" },
  { type: "email", label: "Email", category: "contact" },
  { type: "phone", label: "Phone", category: "contact" },
  { type: "address", label: "Address", category: "contact" },
  { type: "date", label: "Date", category: "datetime" },
  { type: "time", label: "Time", category: "datetime" },
  { type: "datetime", label: "Date & Time", category: "datetime" },
  { type: "select", label: "Dropdown", category: "choice" },
  { type: "multiselect", label: "Multi-Select", category: "choice" },
  { type: "radio", label: "Radio Buttons", category: "choice" },
  { type: "checkbox", label: "Checkbox", category: "choice" },
  { type: "file", label: "File Upload", category: "advanced" },
  { type: "url", label: "URL", category: "advanced" },
];

const categories = [
  { id: "basic", label: "Basic" },
  { id: "contact", label: "Contact" },
  { id: "datetime", label: "Date & Time" },
  { id: "choice", label: "Choice" },
  { id: "advanced", label: "Advanced" },
];

const agreementTypes: { value: LegalAgreementType; label: string }[] = [
  { value: "terms_of_service", label: "Terms of Service" },
  { value: "licensing_agreement", label: "Licensing Agreement" },
  { value: "model_release", label: "Model Release" },
  { value: "property_release", label: "Property Release" },
  { value: "liability_waiver", label: "Liability Waiver" },
  { value: "shoot_checklist", label: "Shoot Checklist" },
  { value: "custom", label: "Custom Agreement" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TemplateEditorClient({ template }: TemplateEditorClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();

  // Template metadata
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || "");
  const [isActive, setIsActive] = useState(template.isActive);

  // Fields state
  const [fields, setFields] = useState<TemplateField[]>(
    template.fields.map((f) => ({
      ...f,
      validation: f.validation as Record<string, unknown> | null,
    }))
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Agreements state
  const [agreements, setAgreements] = useState<TemplateAgreement[]>(
    template.legalAgreements.map((a) => ({ ...a }))
  );
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"fields" | "agreements" | "settings">("fields");

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const selectedAgreement = agreements.find((a) => a.id === selectedAgreementId);

  // Get unique sections from fields
  const sections = [...new Set(fields.map((f) => f.section || "General"))].sort();

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

    // Reordering existing fields
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(fields, oldIndex, newIndex);
        setFields(newFields.map((f, i) => ({ ...f, sortOrder: i })));
        markChanged();
      }
    }
  };

  const handleAddField = (type: FormFieldType) => {
    const fieldMeta = fieldTypes.find((f) => f.type === type);
    if (!fieldMeta) return;

    const newField: TemplateField = {
      id: `field-${Date.now()}`,
      label: fieldMeta.label,
      type: type,
      placeholder: null,
      helpText: null,
      isRequired: false,
      sortOrder: fields.length,
      section: null,
      sectionOrder: 0,
      validation: null,
      conditionalOn: null,
      conditionalValue: null,
    };

    setFields([...fields, newField].map((f, i) => ({ ...f, sortOrder: i })));
    setSelectedFieldId(newField.id);
    markChanged();
  };

  const handleUpdateField = (fieldId: string, updates: Partial<TemplateField>) => {
    setFields(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
    markChanged();
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId).map((f, i) => ({ ...f, sortOrder: i })));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
    markChanged();
  };

  const handleDuplicateField = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newField: TemplateField = {
      ...field,
      id: `field-${Date.now()}`,
      label: `${field.label} (Copy)`,
    };

    const fieldIndex = fields.findIndex((f) => f.id === fieldId);
    const newFields = [...fields];
    newFields.splice(fieldIndex + 1, 0, newField);
    setFields(newFields.map((f, i) => ({ ...f, sortOrder: i })));
    setSelectedFieldId(newField.id);
    markChanged();
  };

  const handleAddAgreement = () => {
    const newAgreement: TemplateAgreement = {
      id: `agreement-${Date.now()}`,
      agreementType: "custom",
      title: "New Agreement",
      content: "",
      isRequired: true,
      requiresSignature: false,
      sortOrder: agreements.length,
    };
    setAgreements([...agreements, newAgreement]);
    setSelectedAgreementId(newAgreement.id);
    markChanged();
  };

  const handleUpdateAgreement = (agreementId: string, updates: Partial<TemplateAgreement>) => {
    setAgreements(agreements.map((a) => (a.id === agreementId ? { ...a, ...updates } : a)));
    markChanged();
  };

  const handleDeleteAgreement = (agreementId: string) => {
    setAgreements(agreements.filter((a) => a.id !== agreementId));
    if (selectedAgreementId === agreementId) setSelectedAgreementId(null);
    markChanged();
  };

  const handleSave = async () => {
    startTransition(async () => {
      try {
        // Update template metadata
        const templateResult = await updateQuestionnaireTemplate({
          id: template.id,
          name,
          description: description || undefined,
          isActive,
        });

        if (!templateResult.success) {
          showToast(templateResult.error, "error");
          return;
        }

        // Update fields
        const fieldsResult = await updateQuestionnaireFields({
          templateId: template.id,
          fields: fields.map((f) => ({
            label: f.label,
            type: f.type,
            placeholder: f.placeholder,
            helpText: f.helpText,
            isRequired: f.isRequired,
            sortOrder: f.sortOrder,
            section: f.section,
            sectionOrder: f.sectionOrder,
            validation: f.validation,
            conditionalOn: f.conditionalOn,
            conditionalValue: f.conditionalValue,
          })),
        });

        if (!fieldsResult.success) {
          showToast(fieldsResult.error, "error");
          return;
        }

        // Update agreements
        const agreementsResult = await updateQuestionnaireAgreements({
          templateId: template.id,
          agreements: agreements.map((a) => ({
            agreementType: a.agreementType,
            title: a.title,
            content: a.content,
            isRequired: a.isRequired,
            requiresSignature: a.requiresSignature,
            sortOrder: a.sortOrder,
          })),
        });

        if (!agreementsResult.success) {
          showToast(agreementsResult.error, "error");
          return;
        }

        showToast("Template saved successfully", "success");
        setHasChanges(false);
        router.refresh();
      } catch {
        showToast("Failed to save template", "error");
      }
    });
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete template",
      description: "Are you sure you want to delete this template? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteQuestionnaireTemplate({ id: template.id });
      if (result.success) {
        showToast("Template deleted", "success");
        router.push("/questionnaires");
      } else {
        showToast(result.error, "error");
      }
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen" data-element="questionnaires-templates-edit-page">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--background)] px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/questionnaires"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{template.name}</h1>
              <p className="text-sm text-foreground-muted">
                {template.industry.replace(/_/g, " ")} template
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hasChanges && (
              <span className="text-sm text-yellow-400">Unsaved changes</span>
            )}
            <Link
              href={`/questionnaires/templates/${template.id}/preview`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
              Preview
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)] px-4 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
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
            onClick={() => setActiveTab("agreements")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === "agreements"
                ? "bg-[var(--primary)] text-white"
                : "text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)]"
            )}
          >
            Agreements ({agreements.length})
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
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm bg-[var(--background)] text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors"
                              >
                                <PlusIcon className="w-4 h-4 shrink-0" />
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
                      sections={sections}
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

        {activeTab === "agreements" && (
          <div className="flex flex-col gap-6 min-h-[calc(100vh-220px)] lg:flex-row">
            {/* Left Panel - Agreement List */}
            <div className="w-full overflow-y-auto lg:w-80 lg:shrink-0">
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Legal Agreements</h3>
                  <button
                    onClick={handleAddAgreement}
                    className="text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
                  >
                    + Add
                  </button>
                </div>

                {agreements.length === 0 ? (
                  <p className="text-sm text-foreground-muted text-center py-4">
                    No agreements added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {agreements.map((agreement) => (
                      <button
                        key={agreement.id}
                        onClick={() => setSelectedAgreementId(agreement.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-colors",
                          selectedAgreementId === agreement.id
                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                            : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                        )}
                      >
                        <p className="text-sm font-medium text-foreground truncate">
                          {agreement.title}
                        </p>
                        <p className="text-xs text-foreground-muted mt-1">
                          {agreement.agreementType.replace(/_/g, " ")}
                          {agreement.requiresSignature && " • Signature required"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Agreement Editor */}
            <div className="flex-1 overflow-y-auto">
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6">
                {selectedAgreement ? (
                  <AgreementEditor
                    agreement={selectedAgreement}
                    onUpdate={(updates) => handleUpdateAgreement(selectedAgreement.id, updates)}
                    onDelete={() => handleDeleteAgreement(selectedAgreement.id)}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-foreground-muted text-sm">
                      Select an agreement to edit or add a new one
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Template Settings</h3>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Template Name
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
                  placeholder="Brief description of this questionnaire template"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Active</p>
                  <p className="text-xs text-foreground-muted">
                    Inactive templates won&apos;t appear when assigning questionnaires
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

              <div className="pt-4 border-t border-[var(--card-border)]">
                <p className="text-sm text-foreground-muted">
                  <strong>Industry:</strong> {template.industry.replace(/_/g, " ")}
                </p>
                <p className="text-sm text-foreground-muted mt-1">
                  <strong>Usage:</strong> {template._count.questionnaires} questionnaires assigned
                </p>
                <p className="text-sm text-foreground-muted mt-1">
                  <strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}
                </p>
              </div>
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
  field: TemplateField;
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

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {field.label}
          {field.isRequired && <span className="text-[var(--error)] ml-1">*</span>}
        </p>
        <p className="text-xs text-foreground-muted truncate">
          {fieldMeta?.label}
          {field.section && ` • ${field.section}`}
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
  sections,
}: {
  field: TemplateField;
  onUpdate: (updates: Partial<TemplateField>) => void;
  onClose: () => void;
  sections: string[];
}) {
  const needsOptions = ["select", "multiselect", "radio"].includes(field.type);
  const [newSection, setNewSection] = useState("");

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
          Label
        </label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {/* Section */}
      <div>
        <label className="block text-xs font-medium text-foreground-muted mb-1.5">
          Section
        </label>
        <div className="space-y-2">
          <select
            value={field.section || ""}
            onChange={(e) => onUpdate({ section: e.target.value || null })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="">No section (General)</option>
            {sections.filter((s) => s !== "General").map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="New section name"
              className="flex-1 px-3 py-1.5 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <button
              type="button"
              onClick={() => {
                if (newSection.trim()) {
                  onUpdate({ section: newSection.trim() });
                  setNewSection("");
                }
              }}
              disabled={!newSection.trim()}
              className="px-3 py-1.5 text-sm rounded-md bg-[var(--background)] text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder */}
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

      {/* Help Text */}
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

      {/* Required Toggle */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

      {/* Options for select/multiselect/radio */}
      {needsOptions && (
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Options (one per line)
          </label>
          <textarea
            value={((field.validation?.options || []) as string[]).join("\n")}
            onChange={(e) => {
              const options = e.target.value.split("\n").filter(Boolean);
              onUpdate({
                validation: { ...field.validation, options },
              });
            }}
            rows={4}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AGREEMENT EDITOR COMPONENT
// ============================================================================

function AgreementEditor({
  agreement,
  onUpdate,
  onDelete,
}: {
  agreement: TemplateAgreement;
  onUpdate: (updates: Partial<TemplateAgreement>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">Edit Agreement</h3>
        <button
          onClick={onDelete}
          className="text-sm text-[var(--error)] hover:text-[var(--error)]/80 transition-colors"
        >
          Delete
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1.5">
          Agreement Type
        </label>
        <select
          value={agreement.agreementType}
          onChange={(e) => onUpdate({ agreementType: e.target.value as LegalAgreementType })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {agreementTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={agreement.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1.5">
          Content
        </label>
        <textarea
          value={agreement.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={12}
          placeholder="Enter the full text of the agreement..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none font-mono"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Required</p>
          <p className="text-xs text-foreground-muted">
            Client must accept before submitting
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUpdate({ isRequired: !agreement.isRequired })}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            agreement.isRequired ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
              agreement.isRequired ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Requires Signature</p>
          <p className="text-xs text-foreground-muted">
            Client must provide a signature
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUpdate({ requiresSignature: !agreement.requiresSignature })}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            agreement.requiresSignature ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
              agreement.requiresSignature ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
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
