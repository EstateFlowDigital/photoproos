"use client";

import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

    // Validate required fields
    if (!firstName || !lastName || !email || !industry) {
      setError("Please fill in all required fields");
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
        onOpenChange(false);
        onSuccess?.({
          id: result.data.id,
          fullName: fullName,
          company: company || null,
        });
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  required
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
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
                  required
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
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
                required
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
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
                required
                defaultValue={defaultIndustry || ""}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select an industry...</option>
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
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
