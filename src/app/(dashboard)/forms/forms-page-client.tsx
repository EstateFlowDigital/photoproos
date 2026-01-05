"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { createForm, deleteForm, duplicateForm } from "@/lib/actions/custom-forms";
import { FileInput, Plus, MoreVertical, Copy, Trash2, ExternalLink, Edit } from "lucide-react";

interface Form {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  portfolioWebsite: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    fields: number;
    submissions: number;
  };
}

interface FormsPageClientProps {
  forms: Form[];
}

export function FormsPageClient({ forms }: FormsPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  function handleCreateForm() {
    if (!newFormName.trim()) {
      showToast("Please enter a form name", "error");
      return;
    }

    startTransition(async () => {
      const result = await createForm({
        name: newFormName.trim(),
        description: newFormDescription.trim() || undefined,
      });

      if (result.success && result.form) {
        showToast("Form created", "success");
        setShowCreateModal(false);
        setNewFormName("");
        setNewFormDescription("");
        router.push(`/forms/${result.form.id}`);
      } else {
        showToast(result.error || "Failed to create form", "error");
      }
    });
  }

  function handleDuplicate(formId: string) {
    startTransition(async () => {
      const result = await duplicateForm(formId);
      if (result.success) {
        showToast("Form duplicated", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to duplicate form", "error");
      }
    });
    setActiveDropdown(null);
  }

  async function handleDelete(formId: string) {
    const confirmed = await confirm({
      title: "Delete form",
      description: "Are you sure you want to delete this form? All submissions will be lost.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteForm(formId);
      if (result.success) {
        showToast("Form deleted", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete form", "error");
      }
    });
    setActiveDropdown(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Forms</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Create custom forms for leads, inquiries, and feedback
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          <Plus className="h-4 w-4" />
          Create Form
        </button>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] py-16 text-center">
          <FileInput className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No forms yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Create your first form to start collecting leads and inquiries
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--primary)]/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{form.name}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        form.isActive
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {form.description && (
                    <p className="mt-1 text-sm text-foreground-muted line-clamp-2">{form.description}</p>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === form.id ? null : form.id)}
                    className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {activeDropdown === form.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveDropdown(null)}
                      />
                      <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1 shadow-lg">
                        <Link
                          href={`/forms/${form.id}`}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Form
                        </Link>
                        <Link
                          href={`/f/${form.slug}`}
                          target="_blank"
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Form
                        </Link>
                        <button
                          onClick={() => handleDuplicate(form.id)}
                          disabled={isPending}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(form.id)}
                          disabled={isPending}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-foreground-muted">
                <span>{form._count.fields} fields</span>
                <span className="h-1 w-1 rounded-full bg-[var(--card-border)]" />
                <span>{form._count.submissions} submissions</span>
              </div>

              {form.portfolioWebsite && (
                <div className="mt-3 rounded-lg bg-[var(--background-secondary)] px-3 py-2 text-xs text-foreground-muted">
                  Linked to: {form.portfolioWebsite.name}
                </div>
              )}

              <Link
                href={`/forms/${form.id}`}
                className="mt-4 block w-full rounded-lg border border-[var(--card-border)] py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Manage Form
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground">Create New Form</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Form Name</label>
                <input
                  type="text"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="e.g., Contact Form"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Description (optional)</label>
                <textarea
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                  placeholder="What is this form for?"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg border border-[var(--card-border)] py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateForm}
                disabled={isPending || !newFormName.trim()}
                className="flex-1 rounded-lg bg-[var(--primary)] py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                Create Form
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
