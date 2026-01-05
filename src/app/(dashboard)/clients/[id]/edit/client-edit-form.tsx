"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { updateClient } from "@/lib/actions/clients";
import { Select } from "@/components/ui/select";
import type { ClientIndustry } from "@prisma/client";

interface ClientEditFormProps {
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    industry: ClientIndustry;
    address: string;
    notes: string;
  };
}

interface FieldErrors {
  fullName?: string;
  email?: string;
}

const industries: { value: ClientIndustry; label: string }[] = [
  { value: "real_estate", label: "Real Estate" },
  { value: "commercial", label: "Commercial" },
  { value: "wedding", label: "Wedding" },
  { value: "food_hospitality", label: "Food & Hospitality" },
  { value: "architecture", label: "Architecture" },
  { value: "events", label: "Events" },
  { value: "portrait", label: "Portrait" },
  { value: "product", label: "Product" },
  { value: "headshots", label: "Headshots" },
  { value: "other", label: "Other" },
];

export function ClientEditForm({ client }: ClientEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    fullName: client.fullName,
    email: client.email,
    phone: client.phone,
    company: client.company,
    industry: client.industry,
    address: client.address,
    notes: client.notes,
  });

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "fullName" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, fullName: "Full name is required" }));
    } else if (field === "email") {
      if (!value.trim()) {
        setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
      } else {
        setFieldErrors((prev) => ({ ...prev, email: undefined }));
      }
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getInputClassName = (fieldName: keyof FieldErrors) => {
    const hasError = touched[fieldName] && fieldErrors[fieldName];
    return cn(
      "w-full rounded-lg border bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1",
      hasError
        ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
        : "border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate all fields
    const errors: FieldErrors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ fullName: true, email: true });
      return;
    }

    startTransition(async () => {
      const result = await updateClient({
        id: client.id,
        ...formData,
      });

      if (result.success) {
        setSuccess(true);
        showToast("Client updated successfully", "success");
        setTimeout(() => {
          router.push(`/clients/${client.id}`);
        }, 1000);
      } else {
        setError(result.error);
        showToast(result.error, "error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3">
          <p className="text-sm text-[var(--success)]">Client updated successfully! Redirecting...</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Basic Information</h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
                Full Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                onBlur={(e) => handleBlur("fullName", e.target.value)}
                placeholder="John Smith"
                className={getInputClassName("fullName")}
              />
              {touched.fullName && fieldErrors.fullName && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.fullName}</p>
              )}
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1.5">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name (optional)"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <Select
            name="industry"
            label="Industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value as ClientIndustry })}
            options={industries}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Contact Information</h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={(e) => handleBlur("email", e.target.value)}
                placeholder="client@example.com"
                className={getInputClassName("email")}
              />
              {touched.email && fieldErrors.email && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, city, state, zip"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Notes</h2>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
            Internal Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any notes about this client..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
          />
          <p className="mt-2 text-xs text-foreground-muted">
            Notes are private and only visible to you and your team
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
