"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
} from "@/lib/actions/contract-templates";

interface TemplateFormData {
  name: string;
  description: string;
  content: string;
  isDefault: boolean;
}

interface TemplateFormClientProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    content: string;
    isDefault: boolean;
    _count?: { contracts: number };
  };
}

// Template variables that can be inserted
const TEMPLATE_VARIABLES = [
  { key: "{{client_name}}", label: "Client Name" },
  { key: "{{client_email}}", label: "Client Email" },
  { key: "{{photographer_name}}", label: "Photographer Name" },
  { key: "{{session_date}}", label: "Session Date" },
  { key: "{{session_location}}", label: "Location" },
  { key: "{{total_amount}}", label: "Total Amount" },
  { key: "{{deposit_amount}}", label: "Deposit Amount" },
  { key: "{{current_date}}", label: "Current Date" },
];

export function TemplateFormClient({ mode, initialData }: TemplateFormClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    content: initialData?.content || getDefaultContent(),
    isDefault: initialData?.isDefault || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Template name is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Template content is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result =
        mode === "create"
          ? await createContractTemplate({
              name: formData.name,
              description: formData.description || "",
              content: formData.content,
              isDefault: formData.isDefault,
            })
          : await updateContractTemplate(initialData!.id, {
              name: formData.name,
              description: formData.description || "",
              content: formData.content,
              isDefault: formData.isDefault,
            });

      if (result.success) {
        router.push("/contracts/templates");
        router.refresh();
      } else {
        setError(result.error || "Failed to save template");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;

    const contractCount = initialData._count?.contracts || 0;
    if (contractCount > 0) {
      showToast(`Cannot delete template. It is used by ${contractCount} contract(s).`, "error");
      return;
    }

    const confirmed = await confirm({
      title: "Delete template",
      description: "Are you sure you want to delete this template? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteContractTemplate(initialData.id);
      if (result.success) {
        router.push("/contracts/templates");
        router.refresh();
      } else {
        setError(result.error || "Failed to delete template");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        formData.content.slice(0, start) + variable + formData.content.slice(end);
      setFormData({ ...formData, content: newContent });

      // Reset cursor position after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Template Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  Template Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Photography Contract"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this template"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked === true })}
                />
                <label htmlFor="isDefault" className="text-sm text-foreground">
                  Set as default template
                </label>
              </div>
            </div>
          </div>

          {/* Content Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Contract Content</h2>
              <span className="text-xs text-foreground-muted">
                Use variables like {"{{client_name}}"} for dynamic content
              </span>
            </div>

            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              placeholder="Enter your contract content here..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-foreground font-mono placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Insert Variable</h3>
            <p className="text-xs text-foreground-muted mb-4">
              Click to insert at cursor position
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_VARIABLES.map((variable) => (
                <button
                  key={variable.key}
                  type="button"
                  onClick={() => insertVariable(variable.key)}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-[var(--background-hover)] hover:border-[var(--border-hover)]"
                >
                  {variable.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Template" : "Save Changes"}
              </button>

              {mode === "edit" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || (initialData?._count?.contracts || 0) > 0}
                  className={cn(
                    "w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                    (initialData?._count?.contracts || 0) > 0
                      ? "border-[var(--card-border)] text-foreground-muted cursor-not-allowed"
                      : "border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/10"
                  )}
                >
                  {isDeleting ? "Deleting..." : "Delete Template"}
                </button>
              )}

              {mode === "edit" && (initialData?._count?.contracts || 0) > 0 && (
                <p className="text-xs text-foreground-muted text-center">
                  Used by {initialData?._count?.contracts} contract(s)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function getDefaultContent(): string {
  return `PHOTOGRAPHY SERVICES AGREEMENT

This Photography Services Agreement ("Agreement") is entered into between:

Photographer: {{photographer_name}}
Client: {{client_name}}

1. SERVICES
The Photographer agrees to provide photography services as described below.

2. DATE AND LOCATION
Date: {{session_date}}
Location: {{session_location}}

3. PAYMENT
Total Fee: {{total_amount}}

4. TERMS AND CONDITIONS
[Add your terms and conditions here]

5. CANCELLATION POLICY
[Add your cancellation policy here]

6. COPYRIGHT & USAGE
The Photographer retains copyright to all images. Client receives a license for personal use.


SIGNATURES

Photographer: ______________________ Date: __________

Client: ______________________ Date: __________`;
}
