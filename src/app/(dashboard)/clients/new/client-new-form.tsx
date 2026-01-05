"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/actions/clients";
import { Select } from "@/components/ui/select";
import { Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

export function ClientNewForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createGallery, setCreateGallery] = useState(false);

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
    const address1 = formData.get("address1") as string;
    const address2 = formData.get("address2") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;
    const notes = formData.get("notes") as string;

    // Validate required fields
    if (!firstName || !lastName || !email || !industry) {
      setError("Please fill in all required fields");
      return;
    }

    // Build full name and address
    const fullName = `${firstName} ${lastName}`.trim();
    const addressParts = [address1, address2, city, state, zip].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(", ") : undefined;

    startTransition(async () => {
      const result = await createClient({
        email,
        fullName,
        company: company || undefined,
        phone: phone || undefined,
        address,
        industry,
        notes: notes || undefined,
      });

      if (result.success) {
        if (createGallery) {
          router.push(`/galleries/new?client=${result.data.id}`);
        } else {
          router.push(`/clients/${result.data.id}`);
        }
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      {/* Contact Information */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1.5">
                First Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="John"
                required
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1.5">
                Last Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Peterson"
                required
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email Address <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              id="email"
              name="email"
              placeholder="john@premierrealty.com"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              id="phone"
              name="phone"
              placeholder="(555) 123-4567"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Business Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              name="company"
              placeholder="Premier Realty"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <Select
            name="industry"
            label="Industry"
            required
            placeholder="Select an industry..."
            options={industries}
          />
        </div>
      </div>

      {/* Address */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Address</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="address1" className="block text-sm font-medium text-foreground mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              id="address1"
              name="address1"
              placeholder="123 Main Street"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="address2" className="block text-sm font-medium text-foreground mb-1.5">
              Suite / Unit
            </label>
            <input
              type="text"
              id="address2"
              name="address2"
              placeholder="Suite 400"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1.5">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="San Francisco"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-foreground mb-1.5">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                placeholder="CA"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-foreground mb-1.5">
                ZIP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                id="zip"
                name="zip"
                placeholder="94102"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
            Internal Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Add any notes about this client..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
          />
          <p className="mt-1.5 text-xs text-foreground-muted">
            These notes are only visible to you and your team.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={createGallery}
            onCheckedChange={(checked) => setCreateGallery(checked === true)}
          />
          <span className="text-sm text-foreground">Create a gallery for this client</span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/clients"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </form>
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
