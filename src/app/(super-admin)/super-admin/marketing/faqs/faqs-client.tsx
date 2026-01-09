"use client";

import { useState, useTransition, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Filter,
} from "lucide-react";
import { createFAQ, updateFAQ, deleteFAQ } from "@/lib/actions/marketing-cms";
import type { FAQ, FAQCategory } from "@prisma/client";

const CATEGORY_LABELS: Record<FAQCategory, string> = {
  general: "General",
  pricing: "Pricing",
  features: "Features",
  billing: "Billing",
  getting_started: "Getting Started",
  technical: "Technical",
};

const CATEGORY_COLORS: Record<FAQCategory, string> = {
  general: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  pricing: "bg-green-500/10 text-green-600 dark:text-green-400",
  features: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  billing: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  getting_started: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  technical: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

interface Props {
  faqs: FAQ[];
}

export function FAQsClient({ faqs: initialFaqs = [] }: Props) {
  const router = useRouter();
  const formId = useId();
  const filterId = useId();
  const [isPending, startTransition] = useTransition();
  // Ensure faqs is always an array
  const [faqs] = useState(Array.isArray(initialFaqs) ? initialFaqs : []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<FAQCategory | "all">("all");

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general" as FAQCategory,
    targetPages: [] as string[],
    isVisible: true,
  });

  const filteredFaqs = faqs.filter((faq) => {
    if (categoryFilter !== "all" && faq.category !== categoryFilter) return false;
    return true;
  });

  // Group FAQs by category for better organization
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<FAQCategory, FAQ[]>);

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "general",
      targetPages: [],
      isVisible: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      targetPages: faq.targetPages,
      isVisible: faq.isVisible,
    });
    setEditingId(faq.id);
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingId) {
        const result = await updateFAQ({ id: editingId, ...formData });
        if (result.success) {
          toast.success("FAQ updated");
          router.refresh();
          resetForm();
        } else {
          toast.error(result.error || "Failed to update FAQ");
        }
      } else {
        const result = await createFAQ(formData);
        if (result.success) {
          toast.success("FAQ created");
          router.refresh();
          resetForm();
        } else {
          toast.error(result.error || "Failed to create FAQ");
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    startTransition(async () => {
      const result = await deleteFAQ(id);
      if (result.success) {
        toast.success("FAQ deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete FAQ");
      }
    });
  };

  const handleToggleVisibility = (faq: FAQ) => {
    startTransition(async () => {
      const result = await updateFAQ({ id: faq.id, isVisible: !faq.isVisible });
      if (result.success) {
        toast.success(faq.isVisible ? "Hidden" : "Made visible");
        router.refresh();
      } else {
        toast.error("Failed to update visibility");
      }
    });
  };

  return (
    <div className="space-y-6" data-element="faqs-page">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-element="faqs-header">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/super-admin/marketing"
            className={cn(
              "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
              "min-w-[44px] min-h-[44px] flex items-center justify-center"
            )}
            aria-label="Back to Marketing CMS"
            data-element="faqs-back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--foreground-muted)]" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
              FAQs
            </h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              {faqs.length} question{faqs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "btn btn-primary inline-flex items-center justify-center gap-2",
            "min-h-[44px] px-4 self-start sm:self-auto"
          )}
          aria-expanded={showAddForm}
          aria-controls={`${formId}-form`}
          data-element="faqs-add-btn"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add FAQ</span>
            </>
          )}
        </button>
      </header>

      {/* Add/Edit Form */}
      {showAddForm && (
        <section
          id={`${formId}-form`}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6"
          aria-labelledby={`${formId}-title`}
          data-element="faqs-form"
        >
          <h2
            id={`${formId}-title`}
            className="text-lg font-semibold text-[var(--foreground)] mb-4"
          >
            {editingId ? "Edit FAQ" : "New FAQ"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor={`${formId}-question`}
                className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
              >
                Question <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id={`${formId}-question`}
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                  "bg-[var(--background-elevated)] border border-[var(--border)]",
                  "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                )}
                placeholder="What is the question?"
              />
            </div>

            <div>
              <label
                htmlFor={`${formId}-answer`}
                className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
              >
                Answer <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <textarea
                id={`${formId}-answer`}
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows={4}
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg",
                  "bg-[var(--background-elevated)] border border-[var(--border)]",
                  "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
                  "min-h-[120px] resize-y"
                )}
                placeholder="The answer to the question..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`${formId}-category`}
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Category
                </label>
                <select
                  id={`${formId}-category`}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FAQCategory })}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                    "bg-[var(--background-elevated)] border border-[var(--border)]",
                    "text-[var(--foreground)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">Visible on website</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary min-h-[44px] px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary min-h-[44px] px-4"
              >
                {isPending ? "Saving..." : editingId ? "Save Changes" : "Add FAQ"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap" data-element="faqs-filters">
        <label htmlFor={filterId} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
          <Filter className="w-4 h-4" aria-hidden="true" />
          <span>Category:</span>
        </label>
        <select
          id={filterId}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FAQCategory | "all")}
          className={cn(
            "px-3 py-2 rounded-lg min-h-[44px]",
            "bg-[var(--background-elevated)] border border-[var(--border)]",
            "text-[var(--foreground)] text-sm",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          )}
          data-element="faqs-category-filter"
        >
          <option value="all">All Categories ({faqs.length})</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
            const count = faqs.filter((f) => f.category === value).length;
            return (
              <option key={value} value={value}>
                {label} ({count})
              </option>
            );
          })}
        </select>
        {categoryFilter !== "all" && (
          <button
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "text-sm text-[var(--primary)] hover:underline",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded px-1",
              "min-h-[44px] inline-flex items-center"
            )}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* FAQs List */}
      <section aria-label="FAQs list" data-element="faqs-list-section">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-[var(--foreground-muted)] rounded-lg border border-[var(--border)]" data-element="faqs-empty">
            <p>
              {categoryFilter === "all"
                ? "No FAQs yet. Add your first one above."
                : `No FAQs in the "${CATEGORY_LABELS[categoryFilter]}" category.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-element="faqs-list">
            {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
              <div key={category} data-element={`faqs-category-${category}`}>
                {categoryFilter === "all" && (
                  <h2 className="text-sm font-medium text-[var(--foreground-muted)] mb-2 px-1">
                    {CATEGORY_LABELS[category as FAQCategory]} ({categoryFaqs.length})
                  </h2>
                )}
                <div className="space-y-3">
                  {categoryFaqs.map((faq) => (
                    <article
                      key={faq.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        faq.isVisible
                          ? "bg-[var(--card)] border-[var(--border)]"
                          : "bg-[var(--background-tertiary)] border-[var(--border)] opacity-60"
                      )}
                      data-element={`faq-card-${faq.id}`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[faq.category])}>
                              {CATEGORY_LABELS[faq.category]}
                            </span>
                            {!faq.isVisible && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500">
                                Hidden
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium text-[var(--foreground)] mb-2 text-sm sm:text-base">
                            {faq.question}
                          </h3>
                          <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleToggleVisibility(faq)}
                            disabled={isPending}
                            className={cn(
                              "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                              "min-w-[36px] min-h-[36px] flex items-center justify-center"
                            )}
                            aria-label={faq.isVisible ? "Hide FAQ" : "Show FAQ"}
                          >
                            {faq.isVisible ? (
                              <Eye className="w-4 h-4 text-[var(--foreground-muted)]" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-[var(--foreground-muted)]" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(faq)}
                            className={cn(
                              "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                              "min-w-[36px] min-h-[36px] flex items-center justify-center"
                            )}
                            aria-label="Edit FAQ"
                          >
                            <Pencil className="w-4 h-4 text-[var(--foreground-muted)]" />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            disabled={isPending}
                            className={cn(
                              "p-2 rounded-lg hover:bg-red-500/10 transition-colors",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
                              "min-w-[36px] min-h-[36px] flex items-center justify-center"
                            )}
                            aria-label="Delete FAQ"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
