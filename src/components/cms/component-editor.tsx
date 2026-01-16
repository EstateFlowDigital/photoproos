"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  type PageComponentInstance,
  type ComponentField,
  type ComponentSchema,
} from "@/lib/cms/page-builder-utils";
import { COMPONENT_SCHEMAS } from "@/lib/cms/page-builder-constants";
import type { CMSComponentType } from "@prisma/client";
import {
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Type,
  Hash,
  Mail,
  AlignLeft,
  ToggleLeft,
  Calendar,
  List,
  Settings,
  Layers,
  Check,
} from "lucide-react";
import { MOCKUPS, CATEGORIES, getMockupById, type MockupDefinition, type MockupCategory } from "@/components/mockups";

// ============================================================================
// TYPES
// ============================================================================

interface ComponentEditorProps {
  instance: PageComponentInstance;
  onUpdate: (content: Record<string, unknown>) => void;
  onClose: () => void;
  className?: string;
}

interface FieldEditorProps {
  field: ComponentField;
  value: unknown;
  onChange: (value: unknown) => void;
}

interface ArrayFieldEditorProps {
  field: ComponentField;
  value: unknown[];
  onChange: (value: unknown[]) => void;
}

// ============================================================================
// FIELD TYPE ICONS
// ============================================================================

const FIELD_ICONS: Record<string, React.ElementType> = {
  text: Type,
  textarea: AlignLeft,
  richtext: AlignLeft,
  number: Hash,
  url: LinkIcon,
  email: Mail,
  image: ImageIcon,
  video: ImageIcon,
  icon: Settings,
  color: Settings,
  select: List,
  multiselect: List,
  toggle: ToggleLeft,
  date: Calendar,
  array: List,
  object: Settings,
  mockup: Layers,
};

// ============================================================================
// FIELD EDITORS
// ============================================================================

function TextFieldEditor({ field, value, onChange }: FieldEditorProps) {
  return (
    <input
      type="text"
      value={(value as string) || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
    />
  );
}

function TextareaFieldEditor({ field, value, onChange }: FieldEditorProps) {
  return (
    <textarea
      value={(value as string) || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      rows={3}
      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] resize-none"
    />
  );
}

function RichtextFieldEditor({ field, value, onChange }: FieldEditorProps) {
  // Simplified rich text - in production would use TipTap or similar
  return (
    <textarea
      value={(value as string) || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || "Enter content..."}
      rows={5}
      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] resize-none font-mono"
    />
  );
}

function NumberFieldEditor({ field, value, onChange }: FieldEditorProps) {
  return (
    <input
      type="number"
      value={(value as number) ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      min={field.min}
      max={field.max}
      placeholder={field.placeholder}
      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
    />
  );
}

function UrlFieldEditor({ field, value, onChange }: FieldEditorProps) {
  return (
    <div className="relative">
      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
      <input
        type="url"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || "https://..."}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}

function EmailFieldEditor({ field, value, onChange }: FieldEditorProps) {
  return (
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
      <input
        type="email"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || "email@example.com"}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}

function ImageFieldEditor({ field, value, onChange }: FieldEditorProps) {
  // Simplified image picker - would integrate with MediaPicker in production
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-[var(--background-tertiary)] border border-[var(--border)]">
          <img
            src={value as string}
            alt=""
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 rounded bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <input
        type="url"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || "Image URL..."}
        className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}

function SelectFieldEditor({ field, value, onChange }: FieldEditorProps) {
  return (
    <select
      value={(value as string) || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
    >
      <option value="">Select...</option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ToggleFieldEditor({ field: _field, value, onChange }: FieldEditorProps) {
  const isChecked = Boolean(value);

  return (
    <button
      type="button"
      onClick={() => onChange(!isChecked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        isChecked ? "bg-[var(--primary)]" : "bg-[var(--background-elevated)]"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          isChecked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function IconFieldEditor({ field, value, onChange }: FieldEditorProps) {
  // Simplified icon selector - would be a proper icon picker in production
  const commonIcons = [
    "check", "star", "heart", "zap", "shield", "users", "settings",
    "mail", "phone", "calendar", "clock", "map", "globe", "search",
  ];

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || "Icon name..."}
        className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
      />
      <div className="flex flex-wrap gap-1">
        {commonIcons.map((icon) => (
          <button
            key={icon}
            onClick={() => onChange(icon)}
            className={cn(
              "px-2 py-1 text-xs rounded",
              value === icon
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)]"
            )}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorFieldEditor({ field: _field, value, onChange }: FieldEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={(value as string) || "#3b82f6"}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded cursor-pointer"
      />
      <input
        type="text"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}

function MockupFieldEditor({ field, value, onChange }: FieldEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<MockupCategory | "all">("all");
  const selectedMockupId = value as string;

  // Filter mockups by category if specified
  const filteredMockups = MOCKUPS.filter((m) => {
    if (field.mockupCategory && m.category !== field.mockupCategory) return false;
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    return true;
  });

  // Get the currently selected mockup
  const selectedMockup = selectedMockupId ? getMockupById(selectedMockupId) : null;

  // Get unique categories from available mockups
  const availableCategories = field.mockupCategory
    ? []
    : [...new Set(MOCKUPS.map((m) => m.category))];

  return (
    <div className="space-y-3">
      {/* Selected mockup preview */}
      {selectedMockup && (
        <div className="p-3 bg-[var(--background-tertiary)] border border-[var(--primary)]/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-medium">{selectedMockup.name}</span>
            </div>
            <button
              onClick={() => onChange("")}
              className="p-1 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">{selectedMockup.description}</p>
        </div>
      )}

      {/* Category filter (only if not restricted by field) */}
      {!field.mockupCategory && availableCategories.length > 1 && (
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-2 py-1 text-xs rounded",
              selectedCategory === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)]"
            )}
          >
            All
          </button>
          {availableCategories.map((cat) => {
            const categoryInfo = CATEGORIES.find((c) => c.id === cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2 py-1 text-xs rounded capitalize",
                  selectedCategory === cat
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)]"
                )}
              >
                {categoryInfo?.name || cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Mockup grid */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {filteredMockups.map((mockup) => {
          const isSelected = selectedMockupId === mockup.id;
          const CategoryIcon = CATEGORIES.find((c) => c.id === mockup.category)?.icon || Layers;

          return (
            <button
              key={mockup.id}
              onClick={() => onChange(mockup.id)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--foreground-muted)] bg-[var(--background-tertiary)]"
              )}
            >
              <div className="flex items-start gap-2">
                <CategoryIcon className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  isSelected ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium truncate">{mockup.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-[var(--primary)]" />}
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)] line-clamp-2 mt-0.5">
                    {mockup.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredMockups.length === 0 && (
        <div className="text-center py-4 text-sm text-[var(--foreground-muted)]">
          No mockups available{field.mockupCategory ? ` in ${field.mockupCategory}` : ""}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ARRAY FIELD EDITOR
// ============================================================================

function ArrayFieldEditor({ field, value, onChange }: ArrayFieldEditorProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  const items = value || [];

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addItem = () => {
    const newItem: Record<string, unknown> = {};
    field.itemSchema?.forEach((subField) => {
      newItem[subField.name] = subField.defaultValue ?? "";
    });
    onChange([...items, newItem]);
    setExpandedItems((prev) => new Set(prev).add(items.length));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, itemValue: Record<string, unknown>) => {
    onChange(items.map((item, i) => (i === index ? itemValue : item)));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const newItems = [...items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const itemValue = item as Record<string, unknown>;
        const isExpanded = expandedItems.has(index);
        const itemTitle =
          (itemValue.title as string) ||
          (itemValue.name as string) ||
          (itemValue.question as string) ||
          (itemValue.label as string) ||
          `Item ${index + 1}`;

        return (
          <div
            key={index}
            className="border border-[var(--border)] rounded-lg overflow-hidden"
          >
            {/* Item Header */}
            <div
              className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] cursor-pointer"
              onClick={() => toggleItem(index)}
            >
              <GripVertical className="w-4 h-4 text-[var(--foreground-muted)]" />
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
              )}
              <span className="text-sm font-medium flex-1 truncate">{itemTitle}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveItem(index, index - 1);
                  }}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-[var(--background-hover)] disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3 rotate-180" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveItem(index, index + 1);
                  }}
                  disabled={index === items.length - 1}
                  className="p-1 rounded hover:bg-[var(--background-hover)] disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(index);
                  }}
                  className="p-1 rounded hover:bg-red-500/10 text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Item Fields */}
            {isExpanded && field.itemSchema && (
              <div className="p-3 bg-[var(--background-tertiary)] space-y-3">
                {field.itemSchema.map((subField) => (
                  <FieldEditor
                    key={subField.name}
                    field={subField}
                    value={itemValue[subField.name]}
                    onChange={(newValue) =>
                      updateItem(index, { ...itemValue, [subField.name]: newValue })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Item Button */}
      <button
        onClick={addItem}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-dashed border-[var(--border)] rounded-lg hover:bg-[var(--background-hover)] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>
  );
}

// ============================================================================
// UNIFIED FIELD EDITOR
// ============================================================================

function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  const Icon = FIELD_ICONS[field.type] || Type;

  const renderEditor = () => {
    switch (field.type) {
      case "text":
        return <TextFieldEditor field={field} value={value} onChange={onChange} />;
      case "textarea":
        return <TextareaFieldEditor field={field} value={value} onChange={onChange} />;
      case "richtext":
        return <RichtextFieldEditor field={field} value={value} onChange={onChange} />;
      case "number":
        return <NumberFieldEditor field={field} value={value} onChange={onChange} />;
      case "url":
        return <UrlFieldEditor field={field} value={value} onChange={onChange} />;
      case "email":
        return <EmailFieldEditor field={field} value={value} onChange={onChange} />;
      case "image":
      case "video":
        return <ImageFieldEditor field={field} value={value} onChange={onChange} />;
      case "select":
      case "multiselect":
        return <SelectFieldEditor field={field} value={value} onChange={onChange} />;
      case "toggle":
        return <ToggleFieldEditor field={field} value={value} onChange={onChange} />;
      case "icon":
        return <IconFieldEditor field={field} value={value} onChange={onChange} />;
      case "color":
        return <ColorFieldEditor field={field} value={value} onChange={onChange} />;
      case "mockup":
        return <MockupFieldEditor field={field} value={value} onChange={onChange} />;
      case "array":
        return (
          <ArrayFieldEditor
            field={field}
            value={(value as unknown[]) || []}
            onChange={onChange}
          />
        );
      default:
        return <TextFieldEditor field={field} value={value} onChange={onChange} />;
    }
  };

  return (
    <div className="field-editor space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[var(--foreground-muted)]" />
        <label className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {renderEditor()}
      {field.helpText && (
        <p className="text-xs text-[var(--foreground-muted)]">{field.helpText}</p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT EDITOR
// ============================================================================

export function ComponentEditor({
  instance,
  onUpdate,
  onClose,
  className,
}: ComponentEditorProps) {
  const [content, setContent] = useState<Record<string, unknown>>(instance.content);
  const [isDirty, setIsDirty] = useState(false);

  // Get schema for this component type
  const componentType = instance.componentSlug.replace(/-/g, "_") as CMSComponentType;
  const schema: ComponentSchema = COMPONENT_SCHEMAS[componentType] || { fields: [] };

  // Sync content when instance changes
  useEffect(() => {
    setContent(instance.content);
    setIsDirty(false);
  }, [instance.id, instance.content]);

  // Debounced update handler
  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      const newContent = { ...content, [fieldName]: value };
      setContent(newContent);
      setIsDirty(true);

      // Debounce the update
      const timer = setTimeout(() => {
        onUpdate(newContent);
        setIsDirty(false);
      }, 500);

      return () => clearTimeout(timer);
    },
    [content, onUpdate]
  );

  return (
    <div className={cn("component-editor flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div>
          <h3 className="font-semibold">{instance.componentSlug}</h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            Edit component content
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-[var(--foreground-muted)]">Saving...</span>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-[var(--background-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {schema.fields.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--foreground-muted)]">
            <p>No editable fields defined for this component.</p>
          </div>
        ) : (
          schema.fields.map((field) => (
            <FieldEditor
              key={field.name}
              field={field}
              value={content[field.name]}
              onChange={(value) => handleFieldChange(field.name, value)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--foreground-muted)] text-center">
          Changes are auto-saved
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  FieldEditor,
  ArrayFieldEditor,
  TextFieldEditor,
  TextareaFieldEditor,
  RichtextFieldEditor,
  NumberFieldEditor,
  UrlFieldEditor,
  EmailFieldEditor,
  ImageFieldEditor,
  SelectFieldEditor,
  ToggleFieldEditor,
  IconFieldEditor,
  ColorFieldEditor,
  MockupFieldEditor,
};
export type { ComponentEditorProps, FieldEditorProps, ArrayFieldEditorProps };
