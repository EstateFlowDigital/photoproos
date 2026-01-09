"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
} from "@/components/ui/settings-icons";
import { Search, Copy } from "lucide-react";
import {
  createCannedResponse,
  updateCannedResponse,
  deleteCannedResponse,
  duplicateCannedResponse,
  type CannedResponseInput,
  type CannedResponseWithUser,
} from "@/lib/actions/canned-responses";
import type { CannedResponseCategory } from "@prisma/client";

// =============================================================================
// Constants
// =============================================================================

const CATEGORY_LABELS: Record<CannedResponseCategory, string> = {
  booking: "Booking",
  pricing: "Pricing",
  scheduling: "Scheduling",
  delivery: "Delivery",
  follow_up: "Follow-up",
  greeting: "Greeting",
  objection: "Objection Handling",
  closing: "Closing",
  support: "Support",
  general: "General",
};

const CATEGORY_COLORS: Record<CannedResponseCategory, string> = {
  booking: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pricing: "bg-green-500/10 text-green-400 border-green-500/20",
  scheduling: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivery: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  follow_up: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  greeting: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  objection: "bg-red-500/10 text-red-400 border-red-500/20",
  closing: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  support: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  general: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// =============================================================================
// Types
// =============================================================================

interface CannedResponsesClientProps {
  responses: CannedResponseWithUser[];
}

interface FormData {
  title: string;
  content: string;
  shortcut: string;
  category: CannedResponseCategory;
  isPersonal: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function CannedResponsesClient({ responses: initialResponses }: CannedResponsesClientProps) {
  const { showToast } = useToast();
  const [responses, setResponses] = useState(initialResponses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponseWithUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CannedResponseCategory | "all">("all");
  const [showInactive, setShowInactive] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    shortcut: "",
    category: "general",
    isPersonal: false,
  });

  // Filtered responses
  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      // Category filter
      if (selectedCategory !== "all" && response.category !== selectedCategory) {
        return false;
      }

      // Active filter
      if (!showInactive && !response.isActive) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          response.title.toLowerCase().includes(query) ||
          response.content.toLowerCase().includes(query) ||
          (response.shortcut?.toLowerCase().includes(query) ?? false)
        );
      }

      return true;
    });
  }, [responses, selectedCategory, showInactive, searchQuery]);

  // Group by category
  const groupedResponses = useMemo(() => {
    const groups: Record<CannedResponseCategory, CannedResponseWithUser[]> = {
      greeting: [],
      booking: [],
      pricing: [],
      scheduling: [],
      delivery: [],
      follow_up: [],
      objection: [],
      closing: [],
      support: [],
      general: [],
    };

    filteredResponses.forEach((response) => {
      groups[response.category].push(response);
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0) as [
      CannedResponseCategory,
      CannedResponseWithUser[]
    ][];
  }, [filteredResponses]);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      shortcut: "",
      category: "general",
      isPersonal: false,
    });
    setEditingResponse(null);
  };

  const openModal = (response?: CannedResponseWithUser) => {
    if (response) {
      setEditingResponse(response);
      setFormData({
        title: response.title,
        content: response.content,
        shortcut: response.shortcut || "",
        category: response.category,
        isPersonal: !!response.userId,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a title", "error");
      return;
    }
    if (!formData.content.trim()) {
      showToast("Please enter the response content", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const input: CannedResponseInput = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        shortcut: formData.shortcut.trim() || undefined,
        category: formData.category,
        isPersonal: formData.isPersonal,
      };

      if (editingResponse) {
        const result = await updateCannedResponse(editingResponse.id, {
          title: input.title,
          content: input.content,
          shortcut: input.shortcut,
          category: input.category,
        });
        if (!result.success) {
          showToast(result.error || "Failed to update response", "error");
          return;
        }
        setResponses((prev) =>
          prev.map((r) => (r.id === editingResponse.id ? result.data : r))
        );
        showToast("Response updated successfully", "success");
        setIsModalOpen(false);
        resetForm();
      } else {
        const result = await createCannedResponse(input);
        if (!result.success) {
          showToast(result.error || "Failed to create response", "error");
          return;
        }
        setResponses((prev) => [...prev, result.data]);
        showToast("Response created successfully", "success");
        setIsModalOpen(false);
        resetForm();
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCannedResponse(id);
      if (result.success) {
        setResponses((prev) => prev.filter((r) => r.id !== id));
        showToast("Response deleted successfully", "success");
      } else {
        showToast(result.error || "Failed to delete response", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    }
    setDeleteConfirmId(null);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicateCannedResponse(id);
      if (!result.success) {
        showToast(result.error || "Failed to duplicate response", "error");
        return;
      }
      setResponses((prev) => [...prev, result.data]);
      showToast("Response duplicated successfully", "success");
    } catch {
      showToast("An error occurred", "error");
    }
  };

  const handleToggleActive = async (response: CannedResponseWithUser) => {
    try {
      const result = await updateCannedResponse(response.id, {
        isActive: !response.isActive,
      });
      if (!result.success) {
        showToast(result.error || "Failed to update response", "error");
        return;
      }
      setResponses((prev) =>
        prev.map((r) => (r.id === response.id ? result.data : r))
      );
      showToast(
        response.isActive ? "Response deactivated" : "Response activated",
        "success"
      );
    } catch {
      showToast("An error occurred", "error");
    }
  };

  return (
    <div className="canned-responses-manager space-y-6">
      {/* Toolbar */}
      <div className="canned-responses-toolbar flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="search"
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              aria-label="Search canned responses"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CannedResponseCategory | "all")}
            className="w-full sm:w-48"
            aria-label="Filter by category"
            options={[
              { value: "all", label: "All Categories" },
              ...CATEGORY_OPTIONS,
            ]}
          />

          {/* Show Inactive Toggle */}
          <label className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] cursor-pointer whitespace-nowrap">
            <Switch
              checked={showInactive}
              onCheckedChange={setShowInactive}
              aria-label="Show inactive responses"
            />
            Show Inactive
          </label>
        </div>

        <Button
          onClick={() => openModal()}
          className="flex items-center gap-2"
          aria-label="Add new canned response"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Add Response
        </Button>
      </div>

      {/* Stats */}
      <div className="canned-responses-stats grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="text-2xl font-semibold text-[var(--foreground)]">
            {responses.filter((r) => r.isActive).length}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">Active Responses</div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="text-2xl font-semibold text-[var(--foreground)]">
            {responses.filter((r) => r.userId).length}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">Personal</div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="text-2xl font-semibold text-[var(--foreground)]">
            {responses.reduce((sum, r) => sum + r.usageCount, 0)}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">Total Uses</div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="text-2xl font-semibold text-[var(--foreground)]">
            {new Set(responses.map((r) => r.category)).size}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">Categories</div>
        </div>
      </div>

      {/* Response List */}
      {groupedResponses.length === 0 ? (
        <div className="canned-responses-empty flex flex-col items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <div className="mb-4 rounded-full bg-[var(--background-tertiary)] p-4">
            <svg
              className="h-8 w-8 text-[var(--foreground-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground)]">
            {searchQuery || selectedCategory !== "all"
              ? "No matching responses"
              : "No canned responses yet"}
          </h3>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your filters"
              : "Create quick reply templates to speed up your messaging"}
          </p>
          {!searchQuery && selectedCategory === "all" && (
            <Button onClick={() => openModal()} className="mt-4">
              Create Your First Response
            </Button>
          )}
        </div>
      ) : (
        <div className="canned-responses-list space-y-8">
          {groupedResponses.map(([category, items]) => (
            <div key={category} className="canned-responses-category">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    CATEGORY_COLORS[category]
                  )}
                >
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-sm text-[var(--foreground-muted)]">
                  {items.length} {items.length === 1 ? "response" : "responses"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((response) => (
                  <ResponseCard
                    key={response.id}
                    response={response}
                    onEdit={() => openModal(response)}
                    onDelete={() => setDeleteConfirmId(response.id)}
                    onDuplicate={() => handleDuplicate(response.id)}
                    onToggleActive={() => handleToggleActive(response)}
                    isDeleting={deleteConfirmId === response.id}
                    onConfirmDelete={() => handleDelete(response.id)}
                    onCancelDelete={() => setDeleteConfirmId(null)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingResponse ? "Edit Response" : "Create Response"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="response-title"
                  className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                >
                  Title
                </label>
                <input
                  id="response-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Pricing Request Response"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="response-content"
                  className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                >
                  Message Content
                </label>
                <textarea
                  id="response-content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Enter your canned response message..."
                  rows={6}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                  required
                />
                <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">
                  Use {"{name}"} for client name, {"{date}"} for dates, etc.
                </p>
              </div>

              {/* Category & Shortcut */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="response-category"
                    className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                  >
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value as CannedResponseCategory,
                      }))
                    }
                    options={CATEGORY_OPTIONS}
                  />
                </div>

                <div>
                  <label
                    htmlFor="response-shortcut"
                    className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                  >
                    Shortcut (Optional)
                  </label>
                  <input
                    id="response-shortcut"
                    type="text"
                    value={formData.shortcut}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, shortcut: e.target.value }))
                    }
                    placeholder="/pricing"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Personal Toggle */}
              {!editingResponse && (
                <label className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] p-3 cursor-pointer">
                  <Switch
                    checked={formData.isPersonal}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isPersonal: checked }))
                    }
                  />
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      Personal Response
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      Only visible to you, not shared with team
                    </div>
                  </div>
                </label>
              )}
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingResponse
                    ? "Update Response"
                    : "Create Response"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =============================================================================
// Response Card Component
// =============================================================================

interface ResponseCardProps {
  response: CannedResponseWithUser;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  isDeleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function ResponseCard({
  response,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
}: ResponseCardProps) {
  return (
    <div
      className={cn(
        "response-card group relative flex flex-col rounded-lg border bg-[var(--card)] p-4 transition-all",
        response.isActive
          ? "border-[var(--card-border)] hover:border-[var(--border-hover)]"
          : "border-dashed border-[var(--card-border)] opacity-60"
      )}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[var(--foreground)] truncate">
            {response.title}
          </h3>
          {response.shortcut && (
            <span className="inline-block mt-1 rounded bg-[var(--background-tertiary)] px-1.5 py-0.5 text-xs font-mono text-[var(--foreground-muted)]">
              {response.shortcut}
            </span>
          )}
        </div>

        {/* Personal badge */}
        {response.userId && (
          <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400">
            Personal
          </span>
        )}
      </div>

      {/* Content Preview */}
      <p className="mb-3 flex-1 text-sm text-[var(--foreground-muted)] line-clamp-3">
        {response.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--card-border)] pt-3">
        <div className="text-xs text-[var(--foreground-muted)]">
          Used {response.usageCount} {response.usageCount === 1 ? "time" : "times"}
        </div>

        {/* Actions */}
        {isDeleting ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--error)]">Delete?</span>
            <button
              onClick={onConfirmDelete}
              className="rounded p-1 text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
              aria-label="Confirm delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={onCancelDelete}
              className="rounded p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
              aria-label="Cancel delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onToggleActive}
              className={cn(
                "rounded p-1.5 transition-colors",
                response.isActive
                  ? "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
                  : "text-[var(--success)] hover:bg-[var(--success)]/10"
              )}
              aria-label={response.isActive ? "Deactivate response" : "Activate response"}
              title={response.isActive ? "Deactivate" : "Activate"}
            >
              {response.isActive ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <button
              onClick={onDuplicate}
              className="rounded p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
              aria-label="Duplicate response"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="rounded p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
              aria-label="Edit response"
              title="Edit"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-colors"
              aria-label="Delete response"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
