import { Metadata } from "next";
import Link from "next/link";
import { getMarketingPageContent } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMarketingPageContent("careers");
  return {
    title: meta.title || "Careers | PhotoProOS",
    description: meta.description || "Join our team and help build the future of photography business management.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

const values = [
  {
    title: "Customer First",
    description: "Every decision we make starts with how it benefits photographers and their clients.",
    icon: "🎯",
  },
  {
    title: "Ship Fast, Learn Faster",
    description: "We believe in rapid iteration, gathering feedback, and continuously improving.",
    icon: "🚀",
  },
  {
    title: "Own Your Work",
    description: "Take ownership of your projects from ideation to deployment and beyond.",
    icon: "💪",
  },
  {
    title: "Transparent Communication",
    description: "We share context openly so everyone can make informed decisions.",
    icon: "💬",
  },
];

const benefits = [
  "Competitive salary and equity",
  "Remote-first culture",
  "Unlimited PTO",
  "Health, dental, and vision insurance",
  "Home office stipend",
  "Learning and development budget",
  "Quarterly team retreats",
  "Latest MacBook Pro",
];

const openings = [
  {
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    slug: "senior-fullstack-engineer",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote (US)",
    type: "Full-time",
    slug: "product-designer",
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote (US)",
    type: "Full-time",
    slug: "customer-success-manager",
  },
  {
    title: "Content Marketing Manager",
    department: "Marketing",
    location: "Remote (US)",
    type: "Full-time",
    slug: "content-marketing-manager",
  },
];

export default async function CareersPage() {
  // Fetch CMS content
  const { content } = await getMarketingPageContent("careers");

  return (
    <main className="relative min-h-screen bg-background" data-element="careers-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="careers-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-1.5 text-sm font-medium text-green-400">
              We're hiring
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Build the future of photography
            </h1>
            <p className="text-lg text-foreground-secondary">
              Join a passionate team helping thousands of photographers run better businesses. We're remote-first, move fast, and care deeply about our craft.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24" data-element="careers-values-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="careers-values-heading">Our values</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4" data-element="careers-values-grid">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
                data-element={`careers-value-${value.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="mb-4 text-3xl">{value.icon}</div>
                <h3 className="mb-2 font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm text-foreground-secondary">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="careers-benefits-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16" data-element="careers-benefits-grid">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-foreground" data-element="careers-benefits-heading">Benefits & perks</h2>
              <p className="text-foreground-secondary">
                We take care of our team so they can focus on doing their best work.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="careers-positions-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="careers-positions-heading">Open positions</h2>

          {openings.length > 0 ? (
            <div className="mx-auto max-w-3xl space-y-4" data-element="careers-positions-list">
              {openings.map((job) => (
                <Link
                  key={job.slug}
                  href={`/careers/${job.slug}`}
                  className="group flex items-start justify-between gap-4 flex-wrap rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--border-hover)]"
                  data-element={`careers-position-${job.slug}`}
                >
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground group-hover:text-[var(--primary)]">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-foreground-secondary">
                      <span>{job.department}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                      <span>·</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <ArrowIcon className="h-5 w-5 text-foreground-muted transition-transform group-hover:translate-x-1 group-hover:text-[var(--primary)]" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md text-center">
              <p className="mb-4 text-foreground-secondary">
                No open positions at the moment, but we're always looking for talented people.
              </p>
              <Link
                href="/contact?subject=general-application"
                className="text-[var(--primary)] hover:underline"
              >
                Send us your resume →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Don't See a Fit */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="careers-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="careers-cta-heading">
            Don't see a perfect fit?
          </h2>
          <p className="mb-8 text-foreground-secondary" data-element="careers-cta-description">
            We're always interested in hearing from talented people. Send us a note and tell us how you can contribute.
          </p>
          <Link
            href="/contact?subject=general-application"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            data-element="careers-cta-btn"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </main>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
