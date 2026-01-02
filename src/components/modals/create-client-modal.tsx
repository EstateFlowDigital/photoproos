"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/actions/clients";
import type { ClientIndustry } from "@prisma/client";

const industries: { value: ClientIndustry; label: string }[] = [
  { value: "real_estate", label: "Real Estate" },
  { value: "commercial", label: "Commercial" },
  { value: "architecture", label: "Architecture & Interiors" },
  { value: "wedding", label: "Wedding" },
  { value: "events", label: "Events & Corporate" },
  { value: "headshots", label: "Headshots & Portraits" },
  { value: "food_hospitality", label: "Food & Hospitality" },
  { value: "portrait", label: "Portrait" },
  { value: "product", label: "Product" },
  { value: "other", label: "Other" },
];

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  industry?: string;
}

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: { id: string; fullName: string | null; company: string | null }) => void;
  defaultIndustry?: ClientIndustry;
}

export function CreateClientModal({
  open,
  onOpenChange,
  onSuccess,
  defaultIndustry,
}: CreateClientModalProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "email") {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (field === "firstName" && !value) {
      setFieldErrors((prev) => ({ ...prev, firstName: "First name is required" }));
    } else if (field === "lastName" && !value) {
      setFieldErrors((prev) => ({ ...prev, lastName: "Last name is required" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string;
    const industry = formData.get("industry") as ClientIndustry;

    // Validate all fields
    const errors: FieldErrors = {};
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    if (!industry) errors.industry = "Please select an industry";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ firstName: true, lastName: true, email: true, industry: true });
      return;
    }

    // Build full name
    const fullName = `${firstName} ${lastName}`.trim();

    startTransition(async () => {
      const result = await createClient({
        email,
        fullName,
        company: company || undefined,
        phone: phone || undefined,
        industry,
      });

      if (result.success) {
        handleOpenChange(false);
        showToast(`Client "${fullName}" created successfully`, "success");
        onSuccess?.({
          id: result.data.id,
          fullName: fullName,
          company: company || null,
        });
      } else {
        setError(result.error);
        showToast(result.error, "error");
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
      setFieldErrors({});
      setTouched({});
    }
    onOpenChange(newOpen);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client to associate with galleries and bookings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
                <p className="text-sm text-[var(--error)]">{error}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="modal-firstName" className="block text-sm font-medium text-foreground mb-1.5">
                  First Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="modal-firstName"
                  name="firstName"
                  placeholder="John"
                  onBlur={(e) => handleBlur("firstName", e.target.value)}
                  className={getInputClassName("firstName")}
                />
                {touched.firstName && fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="modal-lastName" className="block text-sm font-medium text-foreground mb-1.5">
                  Last Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="modal-lastName"
                  name="lastName"
                  placeholder="Peterson"
                  onBlur={(e) => handleBlur("lastName", e.target.value)}
                  className={getInputClassName("lastName")}
                />
                {touched.lastName && fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="modal-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email Address <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="email"
                id="modal-email"
                name="email"
                placeholder="john@example.com"
                onBlur={(e) => handleBlur("email", e.target.value)}
                className={getInputClassName("email")}
              />
              {touched.email && fieldErrors.email && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="modal-phone" className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="modal-phone"
                name="phone"
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="modal-company" className="block text-sm font-medium text-foreground mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                id="modal-company"
                name="company"
                placeholder="Premier Realty"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="modal-industry" className="block text-sm font-medium text-foreground mb-1.5">
                Industry <span className="text-[var(--error)]">*</span>
              </label>
              <select
                id="modal-industry"
                name="industry"
                defaultValue={defaultIndustry || ""}
                onBlur={(e) => handleBlur("industry", e.target.value)}
                className={cn(
                  "w-full rounded-lg border bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1",
                  touched.industry && fieldErrors.industry
                    ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
                    : "border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                )}
              >
                <option value="">Select an industry...</option>
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
              {touched.industry && fieldErrors.industry && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.industry}</p>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Create Client"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
