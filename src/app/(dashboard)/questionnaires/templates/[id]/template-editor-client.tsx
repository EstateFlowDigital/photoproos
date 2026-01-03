"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { updateQuestionnaireTemplate, updateQuestionnaireFields } from "@/lib/actions/questionnaire-templates";
import type { QuestionnaireTemplateWithRelations } from "@/lib/actions/questionnaire-templates";
import { FormFieldTypeValues, IndustryValues } from "@/lib/validations/questionnaires";

interface TemplateEditorClientProps {
  template: QuestionnaireTemplateWithRelations;
}

type TemplateField = QuestionnaireTemplateWithRelations["fields"][number];

export function TemplateEditorClient({ template }: TemplateEditorClientProps) {
  const router = useRouter();
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || "");
  const [industry, setIndustry] = useState(template.industry);
  const [fields, setFields] = useState<TemplateField[]>(template.fields);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const handleAddField = () => {
    const newField: TemplateField = {
      id: "new-" + String(Math.random()).slice(2),
      label: "New Field",
      type: "text",
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
    setFields([...fields, newField]);
    setExpandedField(newField.id);
  };

  const handleUpdateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleMoveField = (id: string, direction: "up" | "down") => {
    const index = fields.findIndex((f) => f.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const newFields = [...fields];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
    newFields.forEach((field, idx) => {
      field.sortOrder = idx;
    });
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Update template metadata
      const metadataResult = await updateQuestionnaireTemplate({
        id: template.id,
        name,
        description: description || null,
        industry,
      });

      if (!metadataResult.success) {
        setError(metadataResult.error);
        return;
      }

      // Update template fields
      const fieldsResult = await updateQuestionnaireFields({
        templateId: template.id,
        fields: fields.map((f, idx) => ({
          label: f.label,
          type: f.type,
          placeholder: f.placeholder,
          helpText: f.helpText,
          isRequired: f.isRequired,
          sortOrder: idx,
          section: f.section,
          sectionOrder: f.sectionOrder,
          validation: f.validation as { minLength?: number; maxLength?: number; pattern?: string; min?: number; max?: number; options?: string[] } | null | undefined,
          conditionalOn: f.conditionalOn,
          conditionalValue: f.conditionalValue,
        })),
      });

      if (!fieldsResult.success) {
        setError(fieldsResult.error);
        return;
      }

      router.push("/questionnaires/templates");
      router.refresh();
    } catch (err) {
      setError("Failed to save template");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const industryLabels: Record<string, string> = {
    real_estate: "Real Estate",
    commercial: "Commercial",
    events: "Events",
    portraits: "Portraits",
    food: "Food & Beverage",
    product: "Product",
  };

  const fieldTypeLabels: Record<string, string> = {
    text: "Text",
    textarea: "Long Text",
    email: "Email",
    phone: "Phone",
    number: "Number",
    date: "Date",
    time: "Time",
    datetime: "Date & Time",
    select: "Dropdown",
    multiselect: "Multi-select",
    checkbox: "Checkbox",
    radio: "Radio Buttons",
    file: "File Upload",
    address: "Address",
    url: "URL",
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/questionnaires/templates"
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--background-hover)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Edit Template</h1>
                <p className="text-sm text-[var(--foreground-muted)]">{template.name}</p>
              </div>
            </div>
            <button
              type="submit"
              form="template-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 p-4 text-[var(--error)]">
            {error}
          </div>
        )}

        <form id="template-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="mb-4 text-sm font-medium text-[var(--foreground-muted)]">Template Details</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as typeof industry)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  {IndustryValues.map((ind) => (
                    <option key={ind} value={ind}>
                      {industryLabels[ind] || ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--foreground-muted)]">Form Fields</h2>
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--background-elevated)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--background-hover)] transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Field
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-sm text-[var(--foreground-muted)]">No fields yet. Add your first field to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <GripVertical className="h-4 w-4 text-[var(--foreground-muted)] cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{field.label}</span>
                          <span className="rounded bg-[var(--background-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--foreground-muted)]">
                            {fieldTypeLabels[field.type] || field.type}
                          </span>
                          {field.isRequired && (
                            <span className="text-[var(--error)] text-xs">*</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveField(field.id, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded hover:bg-[var(--background-hover)] disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(field.id, "down")}
                          disabled={index === fields.length - 1}
                          className="p-1.5 rounded hover:bg-[var(--background-hover)] disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                          className="p-1.5 rounded hover:bg-[var(--background-hover)] transition-colors text-[var(--foreground-muted)]"
                        >
                          {expandedField === field.id ? "-" : "+"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(field.id)}
                          className="p-1.5 rounded hover:bg-[var(--error)]/10 text-[var(--foreground-muted)] hover:text-[var(--error)] transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {expandedField === field.id && (
                      <div className="border-t border-[var(--border)] bg-[var(--background-tertiary)] px-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-muted)]">Label</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-muted)]">Type</label>
                            <select
                              value={field.type}
                              onChange={(e) => handleUpdateField(field.id, { type: e.target.value as typeof field.type })}
                              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm"
                            >
                              {FormFieldTypeValues.map((type) => (
                                <option key={type} value={type}>
                                  {fieldTypeLabels[type] || type}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-muted)]">Placeholder</label>
                            <input
                              type="text"
                              value={field.placeholder || ""}
                              onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value || null })}
                              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-muted)]">Section</label>
                            <input
                              type="text"
                              value={field.section || ""}
                              onChange={(e) => handleUpdateField(field.id, { section: e.target.value || null })}
                              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm"
                              placeholder="Optional grouping"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-muted)]">Help Text</label>
                            <input
                              type="text"
                              value={field.helpText || ""}
                              onChange={(e) => handleUpdateField(field.id, { helpText: e.target.value || null })}
                              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm"
                              placeholder="Additional instructions for this field"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={"required-" + field.id}
                              checked={field.isRequired}
                              onChange={(e) => handleUpdateField(field.id, { isRequired: e.target.checked })}
                              className="h-4 w-4 rounded border-[var(--input-border)]"
                            />
                            <label htmlFor={"required-" + field.id} className="text-sm">
                              Required field
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
