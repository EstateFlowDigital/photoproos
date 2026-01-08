"use client";

import { useState, useCallback } from "react";
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
import type { FormFieldType, Industry } from "@prisma/client";
import type { BookingFormField } from "@/lib/validations/booking-forms";

// Field type definitions with metadata
const fieldTypes: {
  type: FormFieldType;
  label: string;
  category: "basic" | "contact" | "datetime" | "choice" | "advanced";
  icon: React.ReactNode;
}[] = [
  // Basic
  { type: "text", label: "Short Text", category: "basic", icon: <TextIcon /> },
  { type: "textarea", label: "Long Text", category: "basic", icon: <TextareaIcon /> },
  { type: "number", label: "Number", category: "basic", icon: <NumberIcon /> },
  // Contact
  { type: "email", label: "Email", category: "contact", icon: <EmailIcon /> },
  { type: "phone", label: "Phone", category: "contact", icon: <PhoneIcon /> },
  { type: "address", label: "Address", category: "contact", icon: <AddressIcon /> },
  // Date/Time
  { type: "date", label: "Date", category: "datetime", icon: <DateIcon /> },
  { type: "time", label: "Time", category: "datetime", icon: <TimeIcon /> },
  { type: "datetime", label: "Date & Time", category: "datetime", icon: <DateTimeIcon /> },
  // Choice
  { type: "select", label: "Dropdown", category: "choice", icon: <SelectIcon /> },
  { type: "multiselect", label: "Multi-Select", category: "choice", icon: <MultiSelectIcon /> },
  { type: "radio", label: "Radio Buttons", category: "choice", icon: <RadioIcon /> },
  { type: "checkbox", label: "Checkbox", category: "choice", icon: <CheckboxIcon /> },
  // Advanced
  { type: "file", label: "File Upload", category: "advanced", icon: <FileIcon /> },
  { type: "url", label: "URL", category: "advanced", icon: <UrlIcon /> },
];

const categories = [
  { id: "basic", label: "Basic" },
  { id: "contact", label: "Contact" },
  { id: "datetime", label: "Date & Time" },
  { id: "choice", label: "Choice" },
  { id: "advanced", label: "Advanced" },
];

// Industry-specific default field templates
const industryTemplates: Record<Industry, Partial<BookingFormField>[]> = {
  real_estate: [
    { label: "Property Address", type: "address", isRequired: true },
    { label: "Property Type", type: "select", validation: { options: ["Residential", "Commercial", "Land", "Multi-Family"] } },
    { label: "Square Footage", type: "number", placeholder: "e.g., 2500" },
    { label: "Bedrooms", type: "number" },
    { label: "Bathrooms", type: "number" },
    { label: "Listing Agent Name", type: "text" },
    { label: "Listing Agent Email", type: "email" },
    { label: "Special Instructions", type: "textarea" },
  ],
  commercial: [
    { label: "Business Name", type: "text", isRequired: true },
    { label: "Project Type", type: "select", validation: { options: ["Marketing", "Corporate", "Branding", "Event Coverage"] } },
    { label: "Number of Shots Needed", type: "number" },
    { label: "Brand Guidelines URL", type: "url" },
    { label: "Location Address", type: "address" },
    { label: "Project Brief", type: "textarea" },
  ],
  events: [
    { label: "Event Name", type: "text", isRequired: true },
    { label: "Event Type", type: "select", validation: { options: ["Wedding", "Conference", "Party", "Corporate Event", "Concert", "Other"] } },
    { label: "Venue Name", type: "text" },
    { label: "Venue Address", type: "address" },
    { label: "Event Date", type: "date", isRequired: true },
    { label: "Start Time", type: "time", isRequired: true },
    { label: "End Time", type: "time", isRequired: true },
    { label: "Expected Guest Count", type: "number" },
    { label: "Special Moments to Capture", type: "textarea" },
  ],
  portraits: [
    { label: "Session Type", type: "select", validation: { options: ["Headshot", "Family", "Couple", "Individual", "Group"] } },
    { label: "Number of People", type: "number", isRequired: true },
    { label: "Location Preference", type: "select", validation: { options: ["Studio", "Outdoor", "Client Location", "No Preference"] } },
    { label: "Outfit Changes Needed", type: "number" },
    { label: "Purpose of Photos", type: "text", placeholder: "e.g., LinkedIn, website, personal" },
    { label: "Additional Notes", type: "textarea" },
  ],
  food: [
    { label: "Restaurant/Business Name", type: "text", isRequired: true },
    { label: "Shoot Type", type: "select", validation: { options: ["Menu Items", "Interior/Ambiance", "Staff/Team", "Event", "Full Package"] } },
    { label: "Number of Dishes", type: "number" },
    { label: "Location Address", type: "address" },
    { label: "Food Styling Provided", type: "checkbox" },
    { label: "Specific Dishes to Feature", type: "textarea" },
  ],
  product: [
    { label: "Product Name", type: "text", isRequired: true },
    { label: "Product Category", type: "select", validation: { options: ["Clothing", "Electronics", "Jewelry", "Cosmetics", "Food", "Other"] } },
    { label: "Number of Products", type: "number", isRequired: true },
    { label: "Shot Types Needed", type: "multiselect", validation: { options: ["Hero Shot", "Detail Shots", "Lifestyle", "360° View", "White Background"] } },
    { label: "Product Dimensions", type: "text", placeholder: "e.g., 10x5x3 inches" },
    { label: "Brand Guidelines", type: "file" },
    { label: "Reference Images URL", type: "url" },
  ],
};

interface BookingFormBuilderProps {
  fields: BookingFormField[];
  onFieldsChange: (fields: BookingFormField[]) => void;
  industry?: Industry | null;
  organizationIndustries?: Industry[];
}

export function BookingFormBuilder({
  fields,
  onFieldsChange,
  industry,
  organizationIndustries = [],
}: BookingFormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [mobileView, setMobileView] = useState<"palette" | "canvas" | "editor">("canvas");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging from palette
    if (active.id.toString().startsWith("palette-")) {
      const fieldType = active.id.toString().replace("palette-", "") as FormFieldType;
      const fieldMeta = fieldTypes.find((f) => f.type === fieldType);

      if (fieldMeta) {
        const newField: BookingFormField = {
          id: `field-${Date.now()}`,
          label: fieldMeta.label,
          type: fieldType,
          placeholder: null,
          helpText: null,
          isRequired: false,
          sortOrder: fields.length,
          industries: [],
          validation: null,
          conditionalOn: null,
          conditionalValue: null,
        };

        // Insert at the position
        const overIndex = fields.findIndex((f) => f.id === over.id);
        if (overIndex >= 0) {
          const newFields = [...fields];
          newFields.splice(overIndex, 0, newField);
          onFieldsChange(newFields.map((f, i) => ({ ...f, sortOrder: i })));
        } else {
          onFieldsChange([...fields, newField].map((f, i) => ({ ...f, sortOrder: i })));
        }
        setSelectedFieldId(newField.id!);
      }
      return;
    }

    // Reordering existing fields
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(fields, oldIndex, newIndex);
        onFieldsChange(newFields.map((f, i) => ({ ...f, sortOrder: i })));
      }
    }
  };

  const handleAddField = (type: FormFieldType) => {
    const fieldMeta = fieldTypes.find((f) => f.type === type);
    if (!fieldMeta) return;

    const newField: BookingFormField = {
      id: `field-${Date.now()}`,
      label: fieldMeta.label,
      type: type,
      placeholder: null,
      helpText: null,
      isRequired: false,
      sortOrder: fields.length,
      industries: [],
      validation: null,
      conditionalOn: null,
      conditionalValue: null,
    };

    onFieldsChange([...fields, newField].map((f, i) => ({ ...f, sortOrder: i })));
    setSelectedFieldId(newField.id!);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<BookingFormField>) => {
    onFieldsChange(
      fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  const handleDeleteField = (fieldId: string) => {
    onFieldsChange(
      fields.filter((f) => f.id !== fieldId).map((f, i) => ({ ...f, sortOrder: i }))
    );
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleDuplicateField = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newField: BookingFormField = {
      ...field,
      id: `field-${Date.now()}`,
      label: `${field.label} (Copy)`,
    };

    const fieldIndex = fields.findIndex((f) => f.id === fieldId);
    const newFields = [...fields];
    newFields.splice(fieldIndex + 1, 0, newField);
    onFieldsChange(newFields.map((f, i) => ({ ...f, sortOrder: i })));
    setSelectedFieldId(newField.id!);
  };

  const handleLoadTemplate = (templateIndustry: Industry) => {
    const template = industryTemplates[templateIndustry];
    if (!template) return;

    const newFields: BookingFormField[] = template.map((t, i) => ({
      id: `field-${Date.now()}-${i}`,
      label: t.label || "",
      type: t.type || "text",
      placeholder: t.placeholder || null,
      helpText: t.helpText || null,
      isRequired: t.isRequired || false,
      sortOrder: i,
      industries: t.industries || [],
      validation: t.validation || null,
      conditionalOn: null,
      conditionalValue: null,
    }));

    onFieldsChange(newFields);
    setSelectedFieldId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile View Toggle */}
      <div className="lg:hidden mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMobileView("palette")}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            mobileView === "palette"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--card)] text-foreground-muted border border-[var(--card-border)]"
          )}
        >
          Add Fields
        </button>
        <button
          type="button"
          onClick={() => setMobileView("canvas")}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            mobileView === "canvas"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--card)] text-foreground-muted border border-[var(--card-border)]"
          )}
        >
          Form ({fields.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView("editor")}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            mobileView === "editor"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--card)] text-foreground-muted border border-[var(--card-border)]",
            !selectedField && "opacity-50"
          )}
          disabled={!selectedField}
        >
          Edit Field
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-[calc(100vh-280px)] lg:min-h-[500px]">
        {/* Left Panel - Field Palette */}
        <div className={cn(
          "lg:w-64 lg:shrink-0 lg:overflow-y-auto",
          mobileView !== "palette" && "hidden lg:block"
        )}>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Add Fields</h3>

            {/* Industry Templates - Always show if organization has any industries */}
            <div className="mb-4 pb-4 border-b border-[var(--card-border)]">
              <p className="text-xs text-foreground-muted mb-2">Load Template</p>
              <div className="flex flex-wrap gap-1.5">
                {(organizationIndustries.length > 0 ? organizationIndustries : Object.keys(industryTemplates) as Industry[]).slice(0, 6).map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => handleLoadTemplate(ind)}
                    className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors capitalize"
                  >
                    {ind.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Types by Category */}
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id}>
                  <p className="text-xs text-foreground-muted mb-2">{category.label}</p>
                  <div className="space-y-1.5">
                    {fieldTypes
                      .filter((f) => f.category === category.id)
                      .map((fieldType) => (
                        <PaletteField
                          key={fieldType.type}
                          fieldType={fieldType}
                          onAdd={() => {
                            handleAddField(fieldType.type);
                            setMobileView("canvas");
                          }}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Form Canvas */}
        <div className={cn(
          "flex-1 lg:overflow-y-auto min-h-[300px] lg:min-h-0",
          mobileView !== "canvas" && "hidden lg:block"
        )}>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 lg:p-6 min-h-full">
            <h3 className="text-sm font-semibold text-foreground mb-4">Form Fields</h3>

            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 lg:py-12 text-center">
                <div className="w-12 h-12 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center mb-4">
                  <FormIcon className="w-6 h-6 text-foreground-muted" />
                </div>
                <p className="text-foreground-muted mb-2">No fields added yet</p>
                <p className="text-sm text-foreground-muted px-4">
                  {mobileView === "canvas" ? (
                    <>Tap &quot;Add Fields&quot; above to get started, or load an industry template.</>
                  ) : (
                    <>Click a field type on the left to add it, or load an industry template.</>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setMobileView("palette")}
                  className="lg:hidden mt-4 px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white rounded-lg"
                >
                  Add Your First Field
                </button>
              </div>
            ) : (
              <SortableContext
                items={fields.map((f) => f.id!)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      isSelected={field.id === selectedFieldId}
                      onSelect={() => {
                        setSelectedFieldId(field.id!);
                        setMobileView("editor");
                      }}
                      onDelete={() => handleDeleteField(field.id!)}
                      onDuplicate={() => handleDuplicateField(field.id!)}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </div>

        {/* Right Panel - Field Editor */}
        <div className={cn(
          "lg:w-80 lg:shrink-0 lg:overflow-y-auto",
          mobileView !== "editor" && "hidden lg:block"
        )}>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 lg:sticky lg:top-0">
            {selectedField ? (
              <FieldEditor
                field={selectedField}
                onUpdate={(updates) => handleUpdateField(selectedField.id!, updates)}
                onClose={() => {
                  setSelectedFieldId(null);
                  setMobileView("canvas");
                }}
                organizationIndustries={organizationIndustries}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground-muted text-sm">
                  Select a field to edit its properties
                </p>
                <button
                  type="button"
                  onClick={() => setMobileView("canvas")}
                  className="lg:hidden mt-4 px-4 py-2 text-sm font-medium bg-[var(--card-border)] text-foreground rounded-lg"
                >
                  Back to Form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-[var(--card)] border border-[var(--primary)] rounded-lg p-3 shadow-lg opacity-80">
            <span className="text-sm text-foreground">
              {activeId.toString().startsWith("palette-")
                ? fieldTypes.find((f) => f.type === activeId.toString().replace("palette-", ""))?.label
                : fields.find((f) => f.id === activeId)?.label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Palette Field Component
function PaletteField({
  fieldType,
  onAdd,
}: {
  fieldType: typeof fieldTypes[number];
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors"
    >
      <span className="w-4 h-4 shrink-0">{fieldType.icon}</span>
      {fieldType.label}
    </button>
  );
}

// Sortable Field Component
function SortableField({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  field: BookingFormField;
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
  } = useSortable({ id: field.id! });

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

      <span className="w-5 h-5 shrink-0 text-foreground-muted">
        {fieldMeta?.icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {field.label}
          {field.isRequired && <span className="text-[var(--error)] ml-1">*</span>}
        </p>
        <p className="text-xs text-foreground-muted truncate">
          {fieldMeta?.label}
          {field.placeholder && ` • ${field.placeholder}`}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)] transition-colors"
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

// Field Editor Component
function FieldEditor({
  field,
  onUpdate,
  onClose,
  organizationIndustries,
}: {
  field: BookingFormField;
  onUpdate: (updates: Partial<BookingFormField>) => void;
  onClose: () => void;
  organizationIndustries: Industry[];
}) {
  const needsOptions = ["select", "multiselect", "radio"].includes(field.type);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Field Settings</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)] transition-colors"
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
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
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

      {/* Options for select/multiselect/radio */}
      {needsOptions && (
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Options (one per line)
          </label>
          <textarea
            value={(field.validation?.options || []).join("\n")}
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

      {/* Validation for text/textarea/number */}
      {["text", "textarea"].includes(field.type) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Min Length
            </label>
            <input
              type="number"
              value={field.validation?.minLength || ""}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    minLength: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
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
              value={field.validation?.maxLength || ""}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              min={0}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
      )}

      {field.type === "number" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Min Value
            </label>
            <input
              type="number"
              value={field.validation?.min ?? ""}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    min: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1.5">
              Max Value
            </label>
            <input
              type="number"
              value={field.validation?.max ?? ""}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    max: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
      )}

      {/* Industry-specific visibility */}
      {organizationIndustries.length > 1 && (
        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">
            Show only for industries
          </label>
          <p className="text-xs text-foreground-muted mb-2">
            Leave empty to show for all industries
          </p>
          <div className="flex flex-wrap gap-2">
            {organizationIndustries.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => {
                  const current = field.industries || [];
                  const updated = current.includes(ind)
                    ? current.filter((i) => i !== ind)
                    : [...current, ind];
                  onUpdate({ industries: updated });
                }}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  (field.industries || []).includes(ind)
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                )}
              >
                {ind.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function TextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M2.5 3A1.5 1.5 0 0 0 1 4.5v4A1.5 1.5 0 0 0 2.5 10h6A1.5 1.5 0 0 0 10 8.5v-4A1.5 1.5 0 0 0 8.5 3h-6Zm11 2A1.5 1.5 0 0 0 12 6.5v7a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 5h-4Zm-10 7A1.5 1.5 0 0 0 2 13.5v2A1.5 1.5 0 0 0 3.5 17h5A1.5 1.5 0 0 0 10 15.5v-2A1.5 1.5 0 0 0 8.5 12h-5Z" clipRule="evenodd" />
    </svg>
  );
}

function TextareaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h13A1.5 1.5 0 0 1 18 3.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 16.5v-13ZM3.5 3a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-13Zm2 3a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5Z" clipRule="evenodd" />
    </svg>
  );
}

function NumberIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v.25h1.5a.75.75 0 0 1 0 1.5h-1.5v1h1.5a.75.75 0 0 1 0 1.5h-1.5v1h1.5a.75.75 0 0 1 0 1.5h-1.5v1h1.5a.75.75 0 0 1 0 1.5h-1.5v1h1.5a.75.75 0 0 1 0 1.5h-1.5v1h1.5a.75.75 0 0 1 0 1.5h-1.5v.25a.75.75 0 0 1-1.5 0v-.25h-1.5a.75.75 0 0 1 0-1.5h1.5v-1h-1.5a.75.75 0 0 1 0-1.5h1.5v-1h-1.5a.75.75 0 0 1 0-1.5h1.5v-1h-1.5a.75.75 0 0 1 0-1.5h1.5v-1h-1.5a.75.75 0 0 1 0-1.5h1.5v-1h-1.5a.75.75 0 0 1 0-1.5h1.5v-.25A.75.75 0 0 1 10 2Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function AddressIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}

function DateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function TimeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function DateTimeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function SelectIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .55.24l3.25 3.5a.75.75 0 1 1-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 0 1-1.1-1.02l3.25-3.5A.75.75 0 0 1 10 3Zm-3.76 9.2a.75.75 0 0 1 1.06.04l2.7 2.908 2.7-2.908a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0l-3.25-3.5a.75.75 0 0 1 .04-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function MultiSelectIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

function RadioIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.536-9.536a.75.75 0 0 0-1.06-1.06L9 10.879 7.524 9.404a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.012-4Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckboxIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h9.5A2.25 2.25 0 0 1 17 4.25v11.5A2.25 2.25 0 0 1 14.75 18h-9.5A2.25 2.25 0 0 1 3 15.75V4.25Zm9.03 3.22a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 2.97-2.97a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
    </svg>
  );
}

function UrlIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
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
