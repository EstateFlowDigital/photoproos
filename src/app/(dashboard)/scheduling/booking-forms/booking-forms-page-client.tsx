"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  PageContextNav,
  GoogleIcon,
  ContextCalendarIcon,
  ContextClockIcon,
  TagIcon,
} from "@/components/dashboard";
import { IndustrySelector, industryLabels } from "@/components/dashboard/industry-selector";
import {
  createBookingForm,
  toggleBookingFormStatus,
  deleteBookingForm,
  duplicateBookingForm,
} from "@/lib/actions/booking-forms";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { Industry } from "@prisma/client";
import {
  PlusIcon,
  FormIcon,
  TimeOffIcon,
  GlobeIcon,
  InboxIcon,
  EyeIcon,
  EyeOffIcon,
  SearchIcon,
  MoreIcon,
  EditIcon,
  ExternalLinkIcon,
  CopyIcon,
  TrashIcon,
  XIcon,
} from "@/components/ui/icons";

interface BookingFormData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: Industry | null;
  headline: string | null;
  subheadline: string | null;
  heroImageUrl: string | null;
  isPublished: boolean;
  isDefault: boolean;
  fieldCount: number;
  serviceCount: number;
  submissionCount: number;
  viewCount: number;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceData {
  id: string;
  name: string;
  priceCents: number;
}

interface BookingFormsPageClientProps {
  bookingForms: BookingFormData[];
  services: ServiceData[];
  organizationIndustries: Industry[];
  primaryIndustry: Industry;
}

export function BookingFormsPageClient({
  bookingForms,
  services,
  organizationIndustries,
  primaryIndustry,
}: BookingFormsPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Create form state
  const [newFormName, setNewFormName] = useState("");
  const [newFormSlug, setNewFormSlug] = useState("");
  const [newFormIndustry, setNewFormIndustry] = useState<Industry | null>(
    organizationIndustries.length === 1 ? organizationIndustries[0] : null
  );

  // Filter forms
  const filteredForms = bookingForms.filter((form) => {
    if (statusFilter === "published" && !form.isPublished) return false;
    if (statusFilter === "draft" && form.isPublished) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        form.name.toLowerCase().includes(query) ||
        form.slug.toLowerCase().includes(query) ||
        form.headline?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setNewFormName(name);
    if (!newFormSlug || newFormSlug === generateSlug(newFormName)) {
      setNewFormSlug(generateSlug(name));
    }
  };

  const handleCreateForm = async () => {
    if (!newFormName.trim() || !newFormSlug.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    startTransition(async () => {
      const result = await createBookingForm({
        name: newFormName,
        slug: newFormSlug,
        description: null,
        industry: newFormIndustry,
        isPublished: false,
        isDefault: false,
        headline: null,
        subheadline: null,
        heroImageUrl: null,
        logoOverrideUrl: null,
        primaryColor: null,
        requireApproval: true,
        confirmationEmail: true,
      });

      if (result.success) {
        showToast("Booking form created", "success");
        router.push(`/scheduling/booking-forms/${result.data.id}`);
      } else {
        showToast(result.error || "Failed to create form", "error");
      }
    });
  };

  const handleToggleStatus = async (id: string) => {
    startTransition(async () => {
      const result = await toggleBookingFormStatus(id);
      if (result.success) {
        showToast(
          result.data.isPublished ? "Form published" : "Form unpublished",
          "success"
        );
        router.refresh();
      } else {
        showToast(result.error || "Failed to update status", "error");
      }
    });
    setMenuOpenId(null);
  };

  const handleDuplicate = async (id: string) => {
    startTransition(async () => {
      const result = await duplicateBookingForm(id);
      if (result.success) {
        showToast("Form duplicated", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to duplicate form", "error");
      }
    });
    setMenuOpenId(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete booking form",
      description: "Are you sure you want to delete this form? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteBookingForm(id);
      if (result.success) {
        showToast("Form deleted", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete form", "error");
      }
    });
    setMenuOpenId(null);
  };

  // Stats
  const stats = {
    total: bookingForms.length,
    published: bookingForms.filter((f) => f.isPublished).length,
    totalSubmissions: bookingForms.reduce((acc, f) => acc + f.submissionCount, 0),
    totalViews: bookingForms.reduce((acc, f) => acc + f.viewCount, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Forms"
        subtitle="Create public booking forms for clients to request appointments"
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            New Form
          </button>
        }
      />

      <PageContextNav
        items={[
          { label: "Calendar", href: "/scheduling", icon: <ContextCalendarIcon className="h-4 w-4" /> },
          { label: "Availability", href: "/scheduling/availability", icon: <ContextClockIcon className="h-4 w-4" /> },
          { label: "Time Off", href: "/scheduling/time-off", icon: <TimeOffIcon className="h-4 w-4" /> },
          { label: "Booking Forms", href: "/scheduling/booking-forms", icon: <FormIcon className="h-4 w-4" /> },
          { label: "Booking Types", href: "/scheduling/types", icon: <TagIcon className="h-4 w-4" /> },
        ]}
        integrations={[
          {
            label: "Google Calendar",
            href: "/settings/integrations",
            icon: <GoogleIcon className="h-4 w-4" />,
            isConnected: false,
          },
        ]}
      />

      {/* Stats Summary */}
      <div className="auto-grid grid-min-200 grid-gap-3">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
              <FormIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-foreground-muted">Total Forms</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--success)]/15 text-[var(--success)]">
              <GlobeIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.published}</p>
              <p className="text-xs text-foreground-muted">Published</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ai)]/15 text-[var(--ai)]">
              <InboxIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalSubmissions}</p>
              <p className="text-xs text-foreground-muted">Submissions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--warning)]/15 text-[var(--warning)]">
              <EyeIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalViews}</p>
              <p className="text-xs text-foreground-muted">Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "published", "draft"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                statusFilter === status
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length > 0 ? (
        <div className="auto-grid grid-min-240 grid-gap-4">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden transition-all hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/5"
            >
              {/* Header with status */}
              <div className="flex flex-col gap-2 p-4 border-b border-[var(--card-border)] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {form.industry && (
                    <span className="inline-flex items-center rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                      {industryLabels[form.industry]}
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      form.isPublished
                        ? "bg-[var(--success)]/15 text-[var(--success)]"
                        : "bg-[var(--foreground-muted)]/15 text-foreground-muted"
                    )}
                  >
                    {form.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Actions Menu */}
                <div className="relative self-end sm:self-auto">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === form.id ? null : form.id)}
                    className="rounded-lg p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                  >
                    <MoreIcon className="h-4 w-4" />
                  </button>
                  {menuOpenId === form.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1 shadow-xl">
                        <Link
                          href={`/scheduling/booking-forms/${form.id}`}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                        >
                          <EditIcon className="h-4 w-4" />
                          Edit
                        </Link>
                        {form.isPublished && (
                          <Link
                            href={`/book/${form.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                            View Live
                          </Link>
                        )}
                        <button
                          onClick={() => handleToggleStatus(form.id)}
                          disabled={isPending}
                          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50"
                        >
                          {form.isPublished ? (
                            <>
                              <EyeOffIcon className="h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <GlobeIcon className="h-4 w-4" />
                              Publish
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDuplicate(form.id)}
                          disabled={isPending}
                          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50"
                        >
                          <CopyIcon className="h-4 w-4" />
                          Duplicate
                        </button>
                        <hr className="my-1 border-[var(--card-border)]" />
                        <button
                          onClick={() => handleDelete(form.id)}
                          disabled={isPending}
                          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <Link href={`/scheduling/booking-forms/${form.id}`} className="block p-4">
                <h3 className="font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors">
                  {form.name}
                </h3>
                <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                  {form.headline || form.description || "No description"}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 text-xs text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <FormIcon className="h-3.5 w-3.5" />
                    {form.fieldCount} fields
                  </span>
                  <span className="flex items-center gap-1">
                    <InboxIcon className="h-3.5 w-3.5" />
                    {form.submissionCount} submissions
                  </span>
                </div>
              </Link>

              {/* Footer */}
              <div className="flex flex-col gap-2 px-4 py-3 bg-[var(--background)] border-t border-[var(--card-border)] sm:flex-row sm:items-center sm:justify-between">
                <code className="text-xs text-foreground-muted">/book/{form.slug}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/book/${form.slug}`);
                    showToast("Link copied", "success");
                  }}
                  className="rounded p-1 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] py-12 text-center">
          <FormIcon className="mx-auto h-10 w-10 text-foreground-muted" />
          <h3 className="mt-3 text-base font-medium text-foreground">
            {searchQuery || statusFilter !== "all" ? "No forms found" : "No booking forms yet"}
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create a public form to let clients book appointments"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Your First Form
            </button>
          )}
        </div>
      )}

      {/* Create Form Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl animate-in zoom-in-95 fade-in duration-200 max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex flex-col gap-3 p-6 border-b border-[var(--card-border)] sm:flex-row sm:items-center sm:justify-between shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Create Booking Form</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground self-end sm:self-auto"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Form Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={newFormName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Real Estate Photography Inquiry"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  URL Slug <span className="text-[var(--error)]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground-muted">/book/</span>
                  <input
                    type="text"
                    value={newFormSlug}
                    onChange={(e) => setNewFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="real-estate-inquiry"
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {organizationIndustries.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Industry (optional)
                  </label>
                  <p className="text-xs text-foreground-muted mb-3">
                    Select an industry to show relevant form fields
                  </p>
                  <IndustrySelector
                    industries={organizationIndustries}
                    value={newFormIndustry}
                    onChange={setNewFormIndustry}
                    allowNone
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--card-border)] shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateForm}
                disabled={isPending || !newFormName.trim() || !newFormSlug.trim()}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isPending ? "Creating..." : "Create Form"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
