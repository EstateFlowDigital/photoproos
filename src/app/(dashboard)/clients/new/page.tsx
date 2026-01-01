export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";

const industries = [
  { value: "real_estate", label: "Real Estate" },
  { value: "commercial", label: "Commercial" },
  { value: "architecture", label: "Architecture & Interiors" },
  { value: "wedding", label: "Wedding" },
  { value: "events", label: "Events & Corporate" },
  { value: "headshots", label: "Headshots & Portraits" },
  { value: "food_hospitality", label: "Food & Hospitality" },
  { value: "other", label: "Other" },
];

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Client"
        subtitle="Create a new client profile"
        actions={
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Clients
          </Link>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Form submissions are disabled. This is a preview of the client creation flow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form className="space-y-6">
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
                    id="email"
                    name="email"
                    placeholder="john@premierrealty.com"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
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

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-1.5">
                    Industry <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    id="industry"
                    name="industry"
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

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1.5">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    placeholder="https://premierrealty.com"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
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
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="createGallery"
                  className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-foreground">Create a gallery for this client</span>
              </label>

              <div className="flex items-center gap-3">
                <Link
                  href="/clients"
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled
                  className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Client
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Add a company name to organize galleries by business.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Select the right industry to help with analytics and reporting.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Use notes to track important details about the relationship.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Clients</span>
                <span className="text-sm font-medium text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Active This Month</span>
                <span className="text-sm font-medium text-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Revenue</span>
                <span className="text-sm font-medium text-[var(--success)]">$47,850</span>
              </div>
            </div>
          </div>

          {/* Industry Breakdown */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client Industries</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Real Estate</span>
                <span className="text-xs text-foreground-muted">12 clients</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Commercial</span>
                <span className="text-xs text-foreground-muted">5 clients</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Events</span>
                <span className="text-xs text-foreground-muted">4 clients</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Other</span>
                <span className="text-xs text-foreground-muted">3 clients</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
