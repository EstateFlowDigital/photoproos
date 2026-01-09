import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Real Estate Photography | PhotoProOS",
  description: "Deliver property listings to agents and brokerages with seamless integration. MLS-ready delivery, agent branding, and virtual tour integration.",
};

const features = [
  {
    title: "MLS-Ready Delivery",
    description: "Export photos in MLS-compliant formats with proper dimensions and file sizes.",
    icon: CheckIcon,
  },
  {
    title: "Agent Branding Options",
    description: "Customize galleries with agent logos, colors, and contact information.",
    icon: PaletteIcon,
  },
  {
    title: "Virtual Tour Integration",
    description: "Embed Matterport, iGuide, and other 3D tours directly in galleries.",
    icon: CubeIcon,
  },
  {
    title: "Bulk Listing Packages",
    description: "Create service packages for different property sizes and needs.",
    icon: PackageIcon,
  },
  {
    title: "Single Property Websites",
    description: "Auto-generate beautiful property websites from your photos.",
    icon: GlobeIcon,
  },
  {
    title: "Marketing Kit Generator",
    description: "Create flyers, social graphics, and email banners automatically.",
    icon: SparklesIcon,
  },
];

const testimonial = {
  quote: "PhotoProOS cut our delivery time in half. Agents love the single property websites - they look professional and are ready to share instantly.",
  author: "Jennifer Martinez",
  role: "Real Estate Photographer",
  company: "Premier Property Photos",
};

export default function RealEstateIndustryPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="industries-realestate-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="industries-realestate-hero">
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              For Real Estate Photographers
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Real Estate Photography
            </h1>
            <p className="mb-8 text-lg text-foreground-secondary">
              Deliver property listings to agents and brokerages with seamless integration into their workflow.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                Start free trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12" data-element="industries-realestate-stats-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4" data-element="industries-realestate-stats-grid">
            {[
              { value: "2,500+", label: "RE photographers" },
              { value: "500K+", label: "Properties delivered" },
              { value: "< 2hr", label: "Avg. turnaround" },
              { value: "98%", label: "Client satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-realestate-features-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="industries-realestate-features-heading">
            Built for real estate workflows
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-element="industries-realestate-features-grid">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                  <feature.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-realestate-workflow-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="industries-realestate-workflow-heading">
              Streamlined property delivery
            </h2>
            <div className="space-y-8" data-element="industries-realestate-workflow-steps">
              {[
                { step: "1", title: "Shoot the property", description: "Capture stunning photos and video of the listing." },
                { step: "2", title: "Upload & organize", description: "Drag and drop your edited photos. We auto-organize by room." },
                { step: "3", title: "Generate deliverables", description: "Property website, MLS exports, and marketing kit created automatically." },
                { step: "4", title: "Deliver to agent", description: "Send a beautiful gallery link. Agent gets everything in one place." },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
                    <p className="text-foreground-secondary">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-realestate-testimonial-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-2xl text-center" data-element="industries-realestate-testimonial-card">
            <blockquote className="mb-6 text-xl text-foreground" data-element="industries-realestate-testimonial-quote">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-foreground">{testimonial.author}</p>
              <p className="text-sm text-foreground-secondary">
                {testimonial.role}, {testimonial.company}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-realestate-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="industries-realestate-cta-heading">
            Ready to streamline your real estate photography business?
          </h2>
          <p className="mb-8 text-foreground-secondary">
            Join thousands of real estate photographers using PhotoProOS.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            data-element="industries-realestate-cta-btn"
          >
            Start free trial
          </Link>
        </div>
      </section>
    </main>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 0 0-3.471 2.987 10.04 10.04 0 0 1 4.815 4.815 18.748 18.748 0 0 0 2.987-3.472l3.386-5.079A1.902 1.902 0 0 0 20.599 1.5Zm-8.3 14.025a18.76 18.76 0 0 0 1.896-1.207 8.026 8.026 0 0 0-4.513-4.513A18.75 18.75 0 0 0 8.475 11.7l-.278.5a5.26 5.26 0 0 1 3.601 3.602l.502-.278ZM6.75 13.5A3.75 3.75 0 0 0 3 17.25a1.5 1.5 0 0 1-1.601 1.497.75.75 0 0 0-.7 1.123 5.25 5.25 0 0 0 9.8-2.62 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h8.25c1.035 0 1.875-.84 1.875-1.875V15Z" />
      <path d="M8.25 19.5a3.75 3.75 0 1 0 7.5 0v-15a3.75 3.75 0 1 0-7.5 0v15ZM15.75 6.75a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5h-3.75Zm0 3a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5h-3.75Zm0 3a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5h-3.75Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
    </svg>
  );
}
