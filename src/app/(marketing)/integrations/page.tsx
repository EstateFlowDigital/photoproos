import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integrations | PhotoProOS",
  description: "Connect PhotoProOS to the tools you already use. Payments, editing, storage, and marketing integrations in one place.",
};

const integrationGroups = [
  {
    title: "Payments",
    description: "Accept payments and automate billing workflows.",
    items: [
      { name: "Stripe", status: "Available" },
      { name: "QuickBooks", status: "Available" },
    ],
  },
  {
    title: "Editing",
    description: "Publish and deliver faster with editing tools.",
    items: [
      { name: "Adobe Lightroom", status: "Coming Soon" },
      { name: "Capture One", status: "Coming Soon" },
    ],
  },
  {
    title: "Storage",
    description: "Back up and sync your galleries automatically.",
    items: [
      { name: "Dropbox", status: "Available" },
      { name: "Google Drive", status: "Coming Soon" },
    ],
  },
  {
    title: "Calendar",
    description: "Keep your schedule in sync across tools.",
    items: [
      { name: "Google Calendar", status: "Available" },
      { name: "Calendly", status: "Available" },
    ],
  },
  {
    title: "Marketing",
    description: "Grow your list and automate follow-ups.",
    items: [
      { name: "Mailchimp", status: "Available" },
      { name: "Zapier", status: "Available" },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="integrations-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="integrations-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[420px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-16 lg:px-[124px] lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm text-foreground-secondary">
              Connect your stack
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Integrations built for photography businesses
            </h1>
            <p className="text-lg text-foreground-secondary">
              Keep payments, storage, and scheduling in sync. Connect PhotoProOS to the tools you already trust.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16 lg:py-24" data-element="integrations-grid-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-6 lg:grid-cols-2" data-element="integrations-grid">
            {integrationGroups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 lg:p-8" data-element={`integrations-group-${group.title.toLowerCase()}`}>
                <h2 className="text-xl font-semibold text-foreground">{group.title}</h2>
                <p className="mt-2 text-sm text-foreground-secondary">{group.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-start justify-between gap-4 flex-wrap rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-3"
                      data-element={`integrations-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.status === "Available"
                            ? "bg-[var(--success)]/15 text-[var(--success)]"
                            : "bg-[var(--warning)]/15 text-[var(--warning)]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="integrations-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center" data-element="integrations-cta-card">
            <div data-element="integrations-cta-content">
              <h2 className="text-2xl font-bold text-foreground" data-element="integrations-cta-heading">Need another integration?</h2>
              <p className="mt-2 text-foreground-secondary" data-element="integrations-cta-description">
                Tell us what you use and we will prioritize it on the roadmap.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end" data-element="integrations-cta-buttons">
              <Link
                href="/contact?subject=integrations"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                data-element="integrations-cta-request-btn"
              >
                Request integration
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                data-element="integrations-cta-partner-btn"
              >
                Partner with us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
