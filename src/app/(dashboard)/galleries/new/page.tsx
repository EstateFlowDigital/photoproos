export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";

// Demo clients for the dropdown
const demoClients = [
  { id: "1", name: "Premier Realty", email: "contact@premierrealty.com" },
  { id: "2", name: "Tech Solutions Inc", email: "admin@techsolutions.com" },
  { id: "3", name: "Bella Cucina", email: "info@bellacucina.com" },
  { id: "4", name: "Design Studio Pro", email: "hello@designstudiopro.com" },
  { id: "5", name: "Sarah Mitchell", email: "sarah.m@email.com" },
  { id: "6", name: "Berkshire Properties", email: "listings@berkshire.com" },
  { id: "7", name: "Innovate Tech", email: "events@innovatetech.com" },
  { id: "8", name: "Luxury Living Realty", email: "info@luxuryliving.com" },
];

export default function NewGalleryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Gallery"
        subtitle="Set up a new photo gallery for your client"
        actions={
          <Link
            href="/galleries"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Galleries
          </Link>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Form submissions are disabled. This is a preview of the gallery creation flow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form className="space-y-6">
            {/* Gallery Details Section */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Details</h2>

              <div className="space-y-4">
                {/* Gallery Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                    Gallery Name <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g., Downtown Luxury Listing"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Add a description for this gallery..."
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                  />
                </div>

                {/* Client Selection */}
                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-foreground mb-1.5">
                    Client <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    id="client"
                    name="clientId"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="">Select a client...</option>
                    {demoClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-foreground-muted">
                    Or{" "}
                    <Link href="/clients/new" className="text-[var(--primary)] hover:underline">
                      create a new client
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>

              <div className="space-y-4">
                {/* Gallery Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
                    Gallery Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-foreground-muted">
                    Leave at $0 for free galleries. Paid galleries require payment before download.
                  </p>
                </div>

                {/* Access Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Access Type
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="accessType"
                        value="public"
                        defaultChecked
                        className="mt-0.5 h-4 w-4 border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <div>
                        <span className="text-sm font-medium text-foreground">Public Link</span>
                        <p className="text-xs text-foreground-muted">Anyone with the link can view (and pay to download)</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="accessType"
                        value="password"
                        className="mt-0.5 h-4 w-4 border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <div>
                        <span className="text-sm font-medium text-foreground">Password Protected</span>
                        <p className="text-xs text-foreground-muted">Require a password to view the gallery</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Image Section */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Cover Image</h2>

              <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
                <UploadIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground">
                  <span className="text-[var(--primary)] font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  PNG, JPG, or WebP up to 10MB
                </p>
              </div>
            </div>

            {/* Gallery Settings Section */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-foreground">Allow Downloads</span>
                    <p className="text-xs text-foreground-muted">Let clients download photos after payment</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked="true"
                    className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-[var(--primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-foreground">Allow Favorites</span>
                    <p className="text-xs text-foreground-muted">Let clients mark their favorite photos</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked="true"
                    className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-[var(--primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-foreground">Show Watermarks</span>
                    <p className="text-xs text-foreground-muted">Display watermarks on photos until purchased</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked="false"
                    className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-[var(--background-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                  >
                    <span className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-foreground">Email Notifications</span>
                    <p className="text-xs text-foreground-muted">Get notified when clients view or purchase</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked="true"
                    className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-[var(--primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/galleries"
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled
                className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Gallery
              </button>
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
                <p>Choose a descriptive name that your client will recognize.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Set a price to require payment before clients can download photos.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Upload a cover image that represents the gallery best.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Galleries</span>
                <span className="text-sm font-medium text-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Delivered This Month</span>
                <span className="text-sm font-medium text-foreground">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Revenue This Month</span>
                <span className="text-sm font-medium text-[var(--success)]">$8,420</span>
              </div>
            </div>
          </div>

          {/* Recent Clients */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Clients</h2>
            <div className="space-y-3">
              {demoClients.slice(0, 4).map((client) => (
                <div key={client.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-xs text-foreground-muted truncate">{client.email}</p>
                  </div>
                </div>
              ))}
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

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}
