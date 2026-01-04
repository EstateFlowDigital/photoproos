import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog | PhotoProOS",
  description: "See what's new in PhotoProOS. Track the latest features, improvements, and fixes.",
};

const releases = [
  {
    version: "1.2.0",
    date: "December 2025",
    type: "feature",
    title: "Property Websites & Client Portal",
    description: "Major release with single property websites, client portal, and marketing kit generation.",
    changes: [
      "Single property websites with multiple templates",
      "Client portal for agents to access all their content",
      "Automatic marketing kit generation (flyers, social graphics)",
      "Property website analytics and traffic tracking",
      "Lead capture forms with email notifications",
    ],
  },
  {
    version: "1.1.0",
    date: "November 2025",
    type: "feature",
    title: "Enhanced Gallery Features",
    description: "New gallery capabilities and client experience improvements.",
    changes: [
      "Gallery password protection",
      "Expiration dates for galleries",
      "Favorites and selections for clients",
      "Improved mobile gallery experience",
      "Bulk download options",
    ],
  },
  {
    version: "1.0.0",
    date: "October 2025",
    type: "major",
    title: "Initial Release",
    description: "The first public release of PhotoProOS with core features.",
    changes: [
      "Client galleries with pay-to-unlock delivery",
      "Stripe payment processing",
      "Client management CRM",
      "Booking and scheduling",
      "Invoice generation",
      "Service packages management",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Changelog
            </h1>
            <p className="text-lg text-foreground-secondary">
              See what&apos;s new in PhotoProOS. Track the latest features, improvements, and fixes.
            </p>
          </div>
        </div>
      </section>

      {/* Releases */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-12">
              {releases.map((release) => (
                <article
                  key={release.version}
                  className="relative border-l-2 border-[var(--card-border)] pl-8"
                >
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full border-2 border-[var(--primary)] bg-background" />
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white">
                      v{release.version}
                    </span>
                    <span className="text-sm text-foreground-secondary">{release.date}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      release.type === "major" ? "bg-[var(--success)]/10 text-[var(--success)]" :
                      release.type === "feature" ? "bg-[var(--primary)]/10 text-[var(--primary)]" :
                      "bg-foreground-secondary/10 text-foreground-secondary"
                    }`}>
                      {release.type === "major" ? "Major Release" : "Feature Update"}
                    </span>
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-foreground">{release.title}</h2>
                  <p className="mb-4 text-foreground-secondary">{release.description}</p>
                  <ul className="space-y-2">
                    {release.changes.map((change, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground-secondary">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Stay updated
          </h2>
          <p className="mb-8 text-foreground-secondary">
            Subscribe to our newsletter to get notified about new features.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            Get started free
          </Link>
        </div>
      </section>
    </main>
  );
}
