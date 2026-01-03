"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  createClientTag,
  updateClientTag,
  deleteClientTag,
} from "@/lib/actions/client-tags";

interface Tag {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  clientCount: number;
}

interface TagsManagementClientProps {
  tags: Tag[];
}

// Predefined color options
const TAG_COLORS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6b7280", label: "Gray" },
];

export function TagsManagementClient({ tags }: TagsManagementClientProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    description: "",
  });

  const resetForm = () => {
    setFormData({ name: "", color: "#3b82f6", description: "" });
    setIsCreating(false);
    setEditingTag(null);
    setError(null);
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || "#3b82f6",
      description: tag.description || "",
    });
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Tag name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = editingTag
        ? await updateClientTag({
            id: editingTag.id,
            name: formData.name,
            color: formData.color,
            description: formData.description || undefined,
          })
        : await createClientTag({
            name: formData.name,
            color: formData.color,
            description: formData.description || undefined,
          });

      if (result.success) {
        resetForm();
        router.refresh();
      } else {
        setError(result.error || "Failed to save tag");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tagId: string, clientCount: number) => {
    if (clientCount > 0) {
      if (!confirm(`This tag is assigned to ${clientCount} client(s). Are you sure you want to delete it?`)) {
        return;
      }
    } else if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    try {
      const result = await deleteClientTag(tagId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to delete tag");
      }
    } catch {
      alert("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Client Tags</h2>
          <p className="text-sm text-foreground-muted">
            Organize your clients with custom tags
          </p>
        </div>
        {!isCreating && !editingTag && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Tag
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingTag) && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {editingTag ? "Edit Tag" : "Create New Tag"}
          </h3>

          {error && (
            <div className="mb-4 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
              <p className="text-sm text-[var(--error)]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tag Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., VIP Client"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        formData.color === color.value
                          ? "border-white ring-2 ring-offset-2 ring-offset-[var(--card)]"
                          : "border-transparent hover:scale-110"
                      )}
                      style={{
                        backgroundColor: color.value,
                        // @ts-expect-error - Tailwind CSS custom property
                        "--tw-ring-color": color.value,
                      }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingTag ? "Save Changes" : "Create Tag"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags List */}
      {tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <TagIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No tags yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Create your first tag to start organizing clients.
          </p>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Your First Tag
            </button>
          )}
        </div>
      ) : (
        <div className="auto-grid grid-min-240 grid-gap-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={cn(
                "rounded-xl border bg-[var(--card)] p-5 transition-all",
                editingTag?.id === tag.id
                  ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
                  : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: tag.color || "#6b7280" }}
                  />
                  <div>
                    <h3 className="font-medium text-foreground">{tag.name}</h3>
                    {tag.description && (
                      <p className="text-sm text-foreground-muted">{tag.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(tag)}
                    className="rounded-lg bg-[var(--background-hover)] p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                    title="Edit"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id, tag.clientCount)}
                    className="rounded-lg bg-[var(--background-hover)] p-1.5 text-foreground-muted transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-foreground-muted">
                  {tag.clientCount} client{tag.clientCount !== 1 ? "s" : ""}
                </span>
                {tag.clientCount > 0 && (
                  <Link
                    href={`/clients?tag=${tag.id}`}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    View clients →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.379 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
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
