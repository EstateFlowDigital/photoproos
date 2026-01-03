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
import type { Industry } from "@prisma/client";

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
    if (!confirm("Are you sure you want to delete this form?")) return;

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
    <>
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
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
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
        <div className="relative max-w-xs flex-1">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden transition-all hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/5"
            >
              {/* Header with status */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
                <div className="flex items-center gap-2">
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
                <div className="relative">
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
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--background)] border-t border-[var(--card-border)]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
              <h2 className="text-lg font-semibold text-foreground">Create Booking Form</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--card-border)]">
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
    </>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function FormIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function TimeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM5 3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 17a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM17.25 17a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM9 10a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1 0-1.5h5.5A.75.75 0 0 1 9 10ZM17.25 10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 16.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM4.332 8.027a6.012 6.012 0 0 1 1.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 0 1 9 7.5V8a2 2 0 0 0 4 0 2 2 0 0 1 1.523-1.943A6.004 6.004 0 0 1 16 10c0 .68-.114 1.334-.324 1.945a2.11 2.11 0 0 1-.876-.186A1.5 1.5 0 0 1 14 10.5V10a1 1 0 0 0-1-1h-2.12a2 2 0 0 0-1.789 1.106l-.455.909a3.998 3.998 0 0 1-3.236 2.143A6 6 0 0 1 4.332 8.027Z" clipRule="evenodd" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 0 1 5.273 3h9.454a2.75 2.75 0 0 1 2.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3.73Zm3.068-5.852A1.25 1.25 0 0 1 5.273 4.5h9.454a1.25 1.25 0 0 1 1.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 0 0-.86.49l-.606 1.02a1 1 0 0 1-.86.49H8.326a1 1 0 0 1-.86-.49l-.606-1.02A1 1 0 0 0 6 11H2.53l.015-.062 1.523-5.52Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
      <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
