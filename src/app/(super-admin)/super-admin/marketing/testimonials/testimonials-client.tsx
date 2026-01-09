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
  Star,
  X,
} from "lucide-react";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
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

export function TestimonialsClient({ testimonials: initialTestimonials = [] }: Props) {
  const router = useRouter();
  const formId = useId();
  const [isPending, startTransition] = useTransition();
  // Ensure testimonials is always an array
  const [testimonials] = useState(Array.isArray(initialTestimonials) ? initialTestimonials : []);
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
    <div className="space-y-6" data-element="testimonials-page">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-element="testimonials-header">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/super-admin/marketing"
            className={cn(
              "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
              "min-w-[44px] min-h-[44px] flex items-center justify-center"
            )}
            aria-label="Back to Marketing CMS"
            data-element="testimonials-back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--foreground-muted)]" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
              Testimonials
            </h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              {testimonials.length} testimonial{testimonials.length !== 1 ? "s" : ""}
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
          data-element="testimonials-add-btn"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Testimonial</span>
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
          data-element="testimonials-form"
        >
          <h2
            id={`${formId}-title`}
            className="text-lg font-semibold text-[var(--foreground)] mb-4"
          >
            {editingId ? "Edit Testimonial" : "New Testimonial"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor={`${formId}-quote`}
                className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
              >
                Quote <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <textarea
                id={`${formId}-quote`}
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                required
                rows={3}
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg",
                  "bg-[var(--background-elevated)] border border-[var(--border)]",
                  "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
                  "min-h-[100px] resize-y"
                )}
                placeholder="What the customer said..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`${formId}-author`}
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Author Name <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  id={`${formId}-author`}
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  required
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                    "bg-[var(--background-elevated)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label
                  htmlFor={`${formId}-role`}
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Role
                </label>
                <input
                  id={`${formId}-role`}
                  type="text"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                    "bg-[var(--background-elevated)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                  placeholder="CEO"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`${formId}-company`}
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Company
                </label>
                <input
                  id={`${formId}-company`}
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                    "bg-[var(--background-elevated)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label
                  htmlFor={`${formId}-industry`}
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Industry
                </label>
                <select
                  id={`${formId}-industry`}
                  value={formData.targetIndustry}
                  onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value as TestimonialIndustry })}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                    "bg-[var(--background-elevated)] border border-[var(--border)]",
                    "text-[var(--foreground)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                >
                  {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox options */}
            <fieldset className="space-y-3">
              <legend className="sr-only">Display options</legend>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={formData.showOnAllPages}
                    onChange={(e) => setFormData({ ...formData, showOnAllPages: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">Show on all pages</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">Visible</span>
                </label>
              </div>
            </fieldset>

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
                {isPending ? "Saving..." : editingId ? "Save Changes" : "Add Testimonial"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Testimonials Grid */}
      <section aria-label="Testimonials list" data-element="testimonials-grid-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-element="testimonials-grid">
          {testimonials.length === 0 ? (
            <div className="col-span-full p-8 sm:p-12 text-center text-[var(--foreground-muted)] rounded-lg border border-[var(--border)]" data-element="testimonials-empty">
              <p>No testimonials yet. Add your first one above.</p>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className={cn(
                  "p-4 sm:p-6 rounded-lg border transition-all",
                  testimonial.isVisible
                    ? "bg-[var(--card)] border-[var(--border)]"
                    : "bg-[var(--background-tertiary)] border-[var(--border)] opacity-60"
                )}
                aria-label={`Testimonial from ${testimonial.authorName}`}
                data-element={`testimonial-card-${testimonial.id}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {testimonial.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        <Star className="w-3 h-3" aria-hidden="true" />
                        Featured
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                      {INDUSTRY_LABELS[testimonial.targetIndustry]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleVisibility(testimonial)}
                      disabled={isPending}
                      className={cn(
                        "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                        "min-w-[36px] min-h-[36px] flex items-center justify-center"
                      )}
                      aria-label={testimonial.isVisible ? "Hide testimonial" : "Show testimonial"}
                    >
                      {testimonial.isVisible ? (
                        <Eye className="w-4 h-4 text-[var(--foreground-muted)]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[var(--foreground-muted)]" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className={cn(
                        "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                        "min-w-[36px] min-h-[36px] flex items-center justify-center"
                      )}
                      aria-label={`Edit testimonial from ${testimonial.authorName}`}
                    >
                      <Pencil className="w-4 h-4 text-[var(--foreground-muted)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      disabled={isPending}
                      className={cn(
                        "p-2 rounded-lg hover:bg-red-500/10 transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
                        "min-w-[36px] min-h-[36px] flex items-center justify-center"
                      )}
                      aria-label={`Delete testimonial from ${testimonial.authorName}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-[var(--foreground)] mb-4 italic text-sm sm:text-base leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <footer className="flex items-center gap-3">
                  {testimonial.authorImage && (
                    <img
                      src={testimonial.authorImage}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <cite className="font-medium text-[var(--foreground)] not-italic text-sm sm:text-base">
                      {testimonial.authorName}
                    </cite>
                    {(testimonial.authorRole || testimonial.companyName) && (
                      <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                        {[testimonial.authorRole, testimonial.companyName].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </footer>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
