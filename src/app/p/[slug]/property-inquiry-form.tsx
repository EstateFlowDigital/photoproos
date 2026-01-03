"use client";

import { useState, useTransition } from "react";
import { submitPropertyLead } from "@/lib/actions/property-websites";

interface PropertyInquiryFormProps {
  propertyWebsiteId: string;
  propertyAddress: string;
}

export function PropertyInquiryForm({
  propertyWebsiteId,
  propertyAddress,
}: PropertyInquiryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I'm interested in ${propertyAddress}...`,
    // Honeypot field for spam protection - should remain empty
    website: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Honeypot spam check - if filled, silently reject
    if (formData.website) {
      // Pretend success to not alert bots
      setIsSubmitted(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      const result = await submitPropertyLead({
        propertyWebsiteId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        message: formData.message.trim() || undefined,
        source: "website",
      });

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || "Failed to send inquiry. Please try again.");
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success)]/20">
          <CheckIcon className="h-6 w-6 text-[var(--success)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--success)]">Inquiry Sent!</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          The agent will get back to you shortly.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              message: `I'm interested in ${propertyAddress}...`,
              website: "",
            });
          }}
          className="mt-4 text-sm text-[var(--primary)] hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Request Information</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field - hidden from humans but bots will fill it */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, website: e.target.value }))
            }
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={`h-11 w-full rounded-lg border bg-[var(--background)] px-4 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${
              fieldErrors.name
                ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
                : "border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
            }`}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.name}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            className={`h-11 w-full rounded-lg border bg-[var(--background)] px-4 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${
              fieldErrors.email
                ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
                : "border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="h-11 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div>
          <textarea
            placeholder="I'm interested in this property..."
            rows={3}
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        {error && (
          <p className="text-sm text-[var(--error)]">{error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-lg bg-[var(--primary)] font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner className="h-4 w-4" />
              Sending...
            </span>
          ) : (
            "Send Inquiry"
          )}
        </button>
      </form>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
