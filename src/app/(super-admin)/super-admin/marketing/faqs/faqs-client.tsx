"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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

interface Props {
  faqs: FAQ[];
}

export function FAQsClient({ faqs: initialFaqs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [faqs, setFaqs] = useState(initialFaqs);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/super-admin/marketing"
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--foreground-muted)]">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">FAQs</h1>
            <p className="text-[var(--foreground-muted)]">{faqs.length} questions</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add FAQ
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            {editingId ? "Edit FAQ" : "New FAQ"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                Question *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                placeholder="What is the question?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                Answer *
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                placeholder="The answer to the question..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FAQCategory })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-[var(--foreground)]">Visible</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={isPending} className="btn btn-primary">
                {editingId ? "Save Changes" : "Add FAQ"}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--foreground-muted)]">Category:</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FAQCategory | "all")}
          className="px-3 py-1.5 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] text-sm"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center text-[var(--foreground-muted)] rounded-lg border border-[var(--border)]">
            No FAQs found. Add your first one above.
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={cn(
                "p-4 rounded-lg border transition-all",
                faq.isVisible
                  ? "bg-[var(--card)] border-[var(--border)]"
                  : "bg-[var(--background-tertiary)] border-[var(--border)] opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                      {CATEGORY_LABELS[faq.category]}
                    </span>
                  </div>
                  <h4 className="font-medium text-[var(--foreground)] mb-2">{faq.question}</h4>
                  <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(faq)}
                    disabled={isPending}
                    className="p-1.5 rounded hover:bg-[var(--background-elevated)] transition-colors"
                    title={faq.isVisible ? "Hide" : "Show"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", faq.isVisible ? "text-[var(--foreground-muted)]" : "text-[var(--foreground-muted)] opacity-50")}>
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(faq)}
                    className="p-1.5 rounded hover:bg-[var(--background-elevated)] transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[var(--foreground-muted)]">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    disabled={isPending}
                    className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-500">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
