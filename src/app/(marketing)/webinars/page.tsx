import { Metadata } from "next";
import Link from "next/link";
import { getMarketingPageContent } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMarketingPageContent("webinars");
  return {
    title: meta.title || "Webinars | PhotoProOS",
    description: meta.description || "Live and on-demand webinars to help you grow your photography business with PhotoProOS.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

const upcomingWebinars = [
  {
    title: "Maximizing Revenue with Pay-to-Unlock Galleries",
    description: "Learn how to set up pay-to-unlock galleries and increase your revenue per client by 40%.",
    date: "January 15, 2025",
    time: "2:00 PM EST",
    host: "Sarah Chen",
    hostRole: "Product Lead",
    duration: "45 min",
    slug: "pay-to-unlock-galleries",
  },
  {
    title: "Automating Your Photography Workflow",
    description: "Discover how to save 10+ hours per week by automating delivery, reminders, and client communication.",
    date: "January 22, 2025",
    time: "1:00 PM EST",
    host: "Marcus Johnson",
    hostRole: "Customer Success",
    duration: "60 min",
    slug: "automating-workflow",
  },
];

const pastWebinars = [
  {
    title: "Getting Started with PhotoProOS",
    description: "A complete walkthrough of PhotoProOS features and how to set up your account for success.",
    date: "December 10, 2024",
    views: "1,247",
    duration: "45 min",
    slug: "getting-started",
  },
  {
    title: "Real Estate Photography Business Masterclass",
    description: "Tips and strategies from top real estate photographers using PhotoProOS.",
    date: "November 28, 2024",
    views: "892",
    duration: "60 min",
    slug: "real-estate-masterclass",
  },
  {
    title: "Holiday Mini Sessions: Planning & Pricing",
    description: "How to plan, price, and deliver profitable mini sessions during the holiday season.",
    date: "November 15, 2024",
    views: "756",
    duration: "45 min",
    slug: "holiday-mini-sessions",
  },
  {
    title: "Building Client Relationships That Last",
    description: "Strategies for turning one-time clients into repeat customers and referral sources.",
    date: "October 30, 2024",
    views: "634",
    duration: "50 min",
    slug: "client-relationships",
  },
];

export default async function WebinarsPage() {
  // Fetch CMS content
  const { content } = await getMarketingPageContent("webinars");

  return (
    <main className="relative min-h-screen bg-background" data-element="webinars-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="webinars-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(236, 72, 153, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-16 lg:px-[124px] lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Webinars
            </h1>
            <p className="text-lg text-foreground-secondary">
              Live and on-demand sessions to help you master PhotoProOS and grow your business
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section className="py-12 lg:py-16" data-element="webinars-upcoming-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mb-8 flex items-center gap-3" data-element="webinars-upcoming-header">
            <span className="flex h-3 w-3 shrink-0 items-center justify-center">
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            <h2 className="text-xl font-semibold text-foreground" data-element="webinars-upcoming-heading">Upcoming Webinars</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2" data-element="webinars-upcoming-grid">
            {upcomingWebinars.map((webinar) => (
              <div
                key={webinar.slug}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
                data-element={`webinars-upcoming-${webinar.slug}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
                    Upcoming
                  </span>
                  <span className="text-sm text-foreground-muted">{webinar.duration}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {webinar.title}
                </h3>
                <p className="mb-4 text-sm text-foreground-secondary">
                  {webinar.description}
                </p>
                <div className="mb-6 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-foreground-muted" />
                    <span className="text-foreground-secondary">{webinar.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-foreground-muted" />
                    <span className="text-foreground-secondary">{webinar.time}</span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary)] text-xs font-medium text-foreground">
                      {webinar.host.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{webinar.host}</p>
                      <p className="text-xs text-foreground-muted">{webinar.hostRole}</p>
                    </div>
                  </div>
                  <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
                    Register Free
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Webinars */}
      <section className="border-t border-[var(--card-border)] py-12 lg:py-16" data-element="webinars-past-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-xl font-semibold text-foreground" data-element="webinars-past-heading">On-Demand Library</h2>

          <div className="grid gap-6 md:grid-cols-2" data-element="webinars-past-grid">
            {pastWebinars.map((webinar) => (
              <Link
                key={webinar.slug}
                href={`/webinars/${webinar.slug}`}
                className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden transition-all hover:border-[var(--border-hover)]"
                data-element={`webinars-past-${webinar.slug}`}
              >
                <div className="aspect-video bg-[var(--background-tertiary)] relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/90 text-white transition-transform group-hover:scale-110">
                      <PlayIcon className="h-6 w-6 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {webinar.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 font-semibold text-foreground group-hover:text-[var(--primary)]">
                    {webinar.title}
                  </h3>
                  <p className="mb-4 text-sm text-foreground-secondary line-clamp-2">
                    {webinar.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-foreground-muted">
                    <span>{webinar.date}</span>
                    <span>·</span>
                    <span>{webinar.views} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Request a Topic */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="webinars-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="webinars-cta-heading">
            Want to see a specific topic?
          </h2>
          <p className="mb-8 text-foreground-secondary" data-element="webinars-cta-description">
            Let us know what webinars would help your photography business.
          </p>
          <Link
            href="/contact?subject=webinar-request"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            data-element="webinars-cta-btn"
          >
            Request a Topic
          </Link>
        </div>
      </section>
    </main>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
  );
}
