"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  updateBookingForm,
  updateBookingFormFields,
  setBookingFormServices,
  toggleBookingFormStatus,
} from "@/lib/actions/booking-forms";
import { BookingFormBuilder } from "@/components/dashboard/booking-form-builder";
import { IndustrySelector } from "@/components/dashboard/industry-selector";
import type { Industry, Service } from "@prisma/client";
import type { BookingFormField } from "@/lib/validations/booking-forms";

// Extended types to match what we get from the server
interface BookingFormWithRelations {
  id: string;
  organizationId?: string;
  name: string;
  slug: string;
  description: string | null;
  industry: Industry | null;
  isPublished: boolean;
  isDefault: boolean;
  headline: string | null;
  subheadline: string | null;
  heroImageUrl?: string | null;
  logoOverrideUrl?: string | null;
  primaryColor: string | null;
  requireApproval: boolean;
  confirmationEmail: boolean;
  viewCount?: number;
  bookingCount?: number;
  createdAt: Date;
  updatedAt: Date;
  fields: Array<{
    id: string;
    bookingFormId?: string;
    label: string;
    type: string;
    placeholder: string | null;
    helpText: string | null;
    isRequired: boolean;
    sortOrder: number;
    industries: Industry[];
    validation: unknown;
    conditionalOn: string | null;
    conditionalValue: string | null;
  }>;
  services: Array<{
    id?: string;
    serviceId: string;
    serviceName?: string;
    servicePriceCents?: number;
    sortOrder: number;
    isDefault: boolean;
    service?: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    submissions: number;
  };
}

interface BookingFormEditClientProps {
  bookingForm: BookingFormWithRelations;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    isActive: boolean;
    [key: string]: unknown;
  }>;
  organizationIndustries: Industry[];
}

type TabType = "fields" | "settings" | "services" | "branding";

export function BookingFormEditClient({
  bookingForm,
  services,
  organizationIndustries,
}: BookingFormEditClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>("fields");

  // Form state
  const [name, setName] = useState(bookingForm.name);
  const [slug, setSlug] = useState(bookingForm.slug);
  const [description, setDescription] = useState(bookingForm.description || "");
  const [industry, setIndustry] = useState<Industry | null>(bookingForm.industry);
  const [headline, setHeadline] = useState(bookingForm.headline || "");
  const [subheadline, setSubheadline] = useState(bookingForm.subheadline || "");
  const [primaryColor, setPrimaryColor] = useState(bookingForm.primaryColor || "#3b82f6");
  const [requireApproval, setRequireApproval] = useState(bookingForm.requireApproval);
  const [confirmationEmail, setConfirmationEmail] = useState(bookingForm.confirmationEmail);

  // Fields state
  const [fields, setFields] = useState<BookingFormField[]>(
    bookingForm.fields.map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type as BookingFormField["type"],
      placeholder: f.placeholder,
      helpText: f.helpText,
      isRequired: f.isRequired,
      sortOrder: f.sortOrder,
      industries: f.industries,
      validation: f.validation as BookingFormField["validation"],
      conditionalOn: f.conditionalOn,
      conditionalValue: f.conditionalValue,
    }))
  );

  // Services state
  const [selectedServices, setSelectedServices] = useState<
    { serviceId: string; sortOrder: number; isDefault: boolean }[]
  >(
    bookingForm.services.map((s) => ({
      serviceId: s.serviceId,
      sortOrder: s.sortOrder,
      isDefault: s.isDefault,
    }))
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleFieldsChange = (newFields: BookingFormField[]) => {
    setFields(newFields);
    setHasUnsavedChanges(true);
  };

  const handleSaveFields = () => {
    startTransition(async () => {
      try {
        await updateBookingFormFields({
          bookingFormId: bookingForm.id,
          fields: fields.map((f) => ({
            ...f,
            id: f.id?.startsWith("field-") ? undefined : f.id, // Remove temp IDs
          })),
        });
        toast.success("Form fields saved");
        setHasUnsavedChanges(false);
        router.refresh();
      } catch (error) {
        toast.error("Failed to save fields");
        console.error(error);
      }
    });
  };

  const handleSaveSettings = () => {
    startTransition(async () => {
      try {
        await updateBookingForm({
          id: bookingForm.id,
          name,
          slug,
          description: description || null,
          industry,
          headline: headline || null,
          subheadline: subheadline || null,
          primaryColor: primaryColor || null,
          requireApproval,
          confirmationEmail,
        });
        toast.success("Settings saved");
        router.refresh();
      } catch (error) {
        toast.error("Failed to save settings");
        console.error(error);
      }
    });
  };

  const handleSaveServices = () => {
    startTransition(async () => {
      try {
        await setBookingFormServices({
          bookingFormId: bookingForm.id,
          services: selectedServices,
        });
        toast.success("Services saved");
        router.refresh();
      } catch (error) {
        toast.error("Failed to save services");
        console.error(error);
      }
    });
  };

  const handleTogglePublish = () => {
    startTransition(async () => {
      try {
        const result = await toggleBookingFormStatus(bookingForm.id);
        if (result.success && result.data?.isPublished) {
          toast.success("Form published");
        } else if (result.success) {
          toast.success("Form unpublished");
        } else {
          toast.error(result.error || "Failed to toggle publish status");
        }
        router.refresh();
      } catch (error) {
        toast.error("Failed to toggle publish status");
        console.error(error);
      }
    });
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.serviceId === serviceId);
      if (exists) {
        return prev.filter((s) => s.serviceId !== serviceId);
      }
      return [...prev, { serviceId, sortOrder: prev.length, isDefault: false }];
    });
    setHasUnsavedChanges(true);
  };

  const handleSetDefaultService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.map((s) => ({
        ...s,
        isDefault: s.serviceId === serviceId,
      }))
    );
    setHasUnsavedChanges(true);
  };

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/book/${slug}`;

  const tabs: { id: TabType; label: string }[] = [
    { id: "fields", label: "Form Fields" },
    { id: "services", label: "Services" },
    { id: "settings", label: "Settings" },
    { id: "branding", label: "Branding" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--background)]">
        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/scheduling/booking-forms"
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-secondary)] transition-colors"
            >
              <BackIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{name}</h1>
              <p className="text-sm text-foreground-muted">
                {bookingForm.isPublished ? (
                  <span className="text-[var(--success)]">Published</span>
                ) : (
                  <span>Draft</span>
                )}
                {" • "}
                {bookingForm._count?.submissions ?? 0} submissions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-[var(--warning)]">Unsaved changes</span>
            )}

            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-foreground hover:bg-[var(--background-secondary)] transition-colors"
            >
              <PreviewIcon className="w-4 h-4" />
              Preview
            </Link>

            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                bookingForm.isPublished
                  ? "bg-[var(--background-secondary)] text-foreground hover:bg-[var(--background-tertiary)]"
                  : "bg-[var(--success)] text-white hover:bg-[var(--success)]/90"
              )}
            >
              {bookingForm.isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                activeTab === tab.id
                  ? "bg-[var(--card)] text-foreground border-t border-x border-[var(--card-border)]"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Fields Tab */}
        {activeTab === "fields" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground-muted">
                Drag and drop to reorder fields. Click a field to edit its properties.
              </p>
              <button
                type="button"
                onClick={handleSaveFields}
                disabled={isPending || !hasUnsavedChanges}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-[#0A0A0A] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? "Saving..." : "Save Fields"}
              </button>
            </div>

            <BookingFormBuilder
              fields={fields}
              onFieldsChange={handleFieldsChange}
              industry={industry}
              organizationIndustries={organizationIndustries}
            />
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Available Services</h2>
                <p className="text-sm text-foreground-muted">
                  Select which services can be booked through this form.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveServices}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-[#0A0A0A] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? "Saving..." : "Save Services"}
              </button>
            </div>

            {services.length === 0 ? (
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
                <p className="text-foreground-muted mb-4">No services available.</p>
                <Link
                  href="/services"
                  className="text-[var(--primary)] hover:underline"
                >
                  Create a service
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] divide-y divide-[var(--card-border)]">
                {services.map((service) => {
                  const isSelected = selectedServices.some((s) => s.serviceId === service.id);
                  const isDefault = selectedServices.find((s) => s.serviceId === service.id)?.isDefault;

                  return (
                    <div
                      key={service.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <div>
                          <p className="font-medium text-foreground">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-foreground-muted truncate max-w-md">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultService(service.id)}
                          className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                            isDefault
                              ? "bg-[var(--primary)] text-white"
                              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                          )}
                        >
                          {isDefault ? "Default" : "Set as Default"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground">Form Settings</h2>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-[#0A0A0A] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? "Saving..." : "Save Settings"}
              </button>
            </div>

            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Form Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground-muted">/book/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief description of this form (internal use)"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                />
              </div>

              {/* Industry */}
              {organizationIndustries.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Industry
                  </label>
                  <p className="text-sm text-foreground-muted mb-3">
                    Optionally associate this form with a specific industry.
                  </p>
                  <IndustrySelector
                    industries={organizationIndustries}
                    value={industry}
                    onChange={setIndustry}
                    allowNone
                    noneLabel="All Industries"
                  />
                </div>
              )}

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t border-[var(--card-border)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Require Approval
                    </label>
                    <p className="text-sm text-foreground-muted">
                      Submissions must be approved before becoming bookings.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireApproval(!requireApproval)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      requireApproval ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                        requireApproval ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Confirmation Email
                    </label>
                    <p className="text-sm text-foreground-muted">
                      Send confirmation email to client after submission.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmationEmail(!confirmationEmail)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      confirmationEmail ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                        confirmationEmail ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground">Branding</h2>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-[#0A0A0A] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? "Saving..." : "Save Branding"}
              </button>
            </div>

            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-6">
              {/* Headline */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Book Your Session"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              {/* Subheadline */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Subheadline
                </label>
                <textarea
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  rows={2}
                  placeholder="Fill out the form below and we'll get back to you within 24 hours."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                />
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-16 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="pt-4 border-t border-[var(--card-border)]">
                <p className="text-sm font-medium text-foreground mb-3">Preview</p>
                <div
                  className="rounded-lg p-6 text-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: primaryColor }}
                  >
                    {headline || "Book Your Session"}
                  </h3>
                  <p className="text-foreground-muted">
                    {subheadline || "Fill out the form below and we'll get back to you."}
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function BackIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function PreviewIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}
