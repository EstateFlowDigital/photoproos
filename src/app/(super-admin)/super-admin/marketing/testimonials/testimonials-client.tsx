"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from "@/lib/actions/marketing-cms";
import type { Testimonial, TestimonialIndustry } from "@prisma/client";

const INDUSTRY_LABELS: Record<TestimonialIndustry, string> = {
  real_estate: "Real Estate",
  commercial: "Commercial",
  architecture: "Architecture",
  events: "Events",
  headshots: "Headshots",
  food: "Food",
  general: "General",
};

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsClient({ testimonials: initialTestimonials }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    quote: "",
    authorName: "",
    authorRole: "",
    companyName: "",
    authorImage: "",
    rating: 5,
    targetIndustry: "general" as TestimonialIndustry,
    targetPages: [] as string[],
    showOnAllPages: false,
    isFeatured: false,
    isVisible: true,
  });

  const resetForm = () => {
    setFormData({
      quote: "",
      authorName: "",
      authorRole: "",
      companyName: "",
      authorImage: "",
      rating: 5,
      targetIndustry: "general",
      targetPages: [],
      showOnAllPages: false,
      isFeatured: false,
      isVisible: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      quote: testimonial.quote,
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole || "",
      companyName: testimonial.companyName || "",
      authorImage: testimonial.authorImage || "",
      rating: testimonial.rating || 5,
      targetIndustry: testimonial.targetIndustry,
      targetPages: testimonial.targetPages,
      showOnAllPages: testimonial.showOnAllPages,
      isFeatured: testimonial.isFeatured,
      isVisible: testimonial.isVisible,
    });
    setEditingId(testimonial.id);
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingId) {
        const result = await updateTestimonial({ id: editingId, ...formData });
        if (result.success) {
          toast.success("Testimonial updated");
          router.refresh();
          resetForm();
        } else {
          toast.error(result.error || "Failed to update testimonial");
        }
      } else {
        const result = await createTestimonial(formData);
        if (result.success) {
          toast.success("Testimonial created");
          router.refresh();
          resetForm();
        } else {
          toast.error(result.error || "Failed to create testimonial");
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    startTransition(async () => {
      const result = await deleteTestimonial(id);
      if (result.success) {
        toast.success("Testimonial deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete testimonial");
      }
    });
  };

  const handleToggleVisibility = (testimonial: Testimonial) => {
    startTransition(async () => {
      const result = await updateTestimonial({
        id: testimonial.id,
        isVisible: !testimonial.isVisible,
      });
      if (result.success) {
        toast.success(testimonial.isVisible ? "Hidden" : "Made visible");
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
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Testimonials</h1>
            <p className="text-[var(--foreground-muted)]">{testimonials.length} testimonials</p>
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
          Add Testimonial
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            {editingId ? "Edit Testimonial" : "New Testimonial"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                Quote *
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                placeholder="What the customer said..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                  placeholder="CEO"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                  Industry
                </label>
                <select
                  value={formData.targetIndustry}
                  onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value as TestimonialIndustry })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                >
                  {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showOnAllPages}
                  onChange={(e) => setFormData({ ...formData, showOnAllPages: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-[var(--foreground)]">Show on all pages</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-[var(--foreground)]">Featured</span>
              </label>
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
            <div className="flex items-center gap-3">
              <button type="submit" disabled={isPending} className="btn btn-primary">
                {editingId ? "Save Changes" : "Add Testimonial"}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials Grid */}
      <div className="grid grid-cols-2 gap-4">
        {testimonials.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-[var(--foreground-muted)] rounded-lg border border-[var(--border)]">
            No testimonials yet. Add your first one above.
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={cn(
                "p-6 rounded-lg border transition-all",
                testimonial.isVisible
                  ? "bg-[var(--card)] border-[var(--border)]"
                  : "bg-[var(--background-tertiary)] border-[var(--border)] opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {testimonial.isFeatured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">
                      Featured
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                    {INDUSTRY_LABELS[testimonial.targetIndustry]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleVisibility(testimonial)}
                    disabled={isPending}
                    className="p-1.5 rounded hover:bg-[var(--background-elevated)] transition-colors"
                    title={testimonial.isVisible ? "Hide" : "Show"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", testimonial.isVisible ? "text-[var(--foreground-muted)]" : "text-[var(--foreground-muted)] opacity-50")}>
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-1.5 rounded hover:bg-[var(--background-elevated)] transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[var(--foreground-muted)]">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
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
              <blockquote className="text-[var(--foreground)] mb-4 italic">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                {testimonial.authorImage && (
                  <img
                    src={testimonial.authorImage}
                    alt={testimonial.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-[var(--foreground)]">{testimonial.authorName}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {[testimonial.authorRole, testimonial.companyName].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
