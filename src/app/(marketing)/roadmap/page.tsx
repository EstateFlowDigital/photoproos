import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product Roadmap | PhotoProOS",
  description: "See what's coming next for PhotoProOS. Our roadmap for building the complete business OS for photographers.",
};

const phases = [
  {
    phase: "Phase 1",
    title: "Core Platform",
    status: "completed",
    description: "The foundation of your photography business.",
    features: [
      { name: "Client Galleries & Delivery", status: "done" },
      { name: "Payment Processing", status: "done" },
      { name: "Client Management CRM", status: "done" },
      { name: "Booking & Scheduling", status: "done" },
      { name: "Services & Pricing", status: "done" },
      { name: "Invoice Generation", status: "done" },
    ],
  },
  {
    phase: "Phase 2",
    title: "Property Websites & Client Portal",
    status: "in_progress",
    description: "Single property websites, client portals, and marketing materials.",
    features: [
      { name: "Single Property Websites", status: "in_progress" },
      { name: "Client Portal", status: "in_progress" },
      { name: "Marketing Kit Generator", status: "planned" },
      { name: "Traffic Analytics", status: "planned" },
      { name: "Lead Capture", status: "planned" },
    ],
  },
  {
    phase: "Phase 3",
    title: "Marketing Hub",
    status: "planned",
    description: "Email campaigns, social media, and marketing automations.",
    features: [
      { name: "Email Marketing", status: "planned" },
      { name: "Content Calendar", status: "planned" },
      { name: "Social Media Manager", status: "planned" },
      { name: "Referral Program", status: "planned" },
      { name: "Marketing Automations", status: "planned" },
    ],
  },
  {
    phase: "Phase 4",
    title: "Analytics Hub",
    status: "planned",
    description: "Deep business insights and custom reporting.",
    features: [
      { name: "Business Metrics Dashboard", status: "planned" },
      { name: "Revenue Forecasting", status: "planned" },
      { name: "Client Insights", status: "planned" },
      { name: "Custom Reports", status: "planned" },
    ],
  },
  {
    phase: "Phase 5",
    title: "Website Builder",
    status: "planned",
    description: "Build your photography portfolio without code.",
    features: [
      { name: "Portfolio Builder", status: "planned" },
      { name: "Blog & Content", status: "planned" },
      { name: "SEO Tools", status: "planned" },
      { name: "Custom Domains", status: "planned" },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ai)]/20 bg-[var(--ai)]/5 px-4 py-1.5 text-sm font-medium text-[var(--ai)]">
              5 phases to complete business OS
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Product Roadmap
            </h1>
            <p className="text-lg text-foreground-secondary">
              Building the complete business operating system for professional photographers, one phase at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-8">
              {phases.map((phase, index) => (
                <div
                  key={phase.phase}
                  className={`rounded-2xl border p-6 md:p-8 ${
                    phase.status === "in_progress"
                      ? "border-[var(--primary)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent"
                      : "border-[var(--card-border)] bg-[var(--card)]"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                        phase.status === "completed" ? "bg-[var(--success)]" :
                        phase.status === "in_progress" ? "bg-[var(--primary)]" :
                        "bg-foreground-secondary/30"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm text-foreground-secondary">{phase.phase}</p>
                        <h2 className="text-xl font-bold text-foreground">{phase.title}</h2>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      phase.status === "completed" ? "bg-[var(--success)]/10 text-[var(--success)]" :
                      phase.status === "in_progress" ? "bg-[var(--primary)]/10 text-[var(--primary)]" :
                      "bg-foreground-secondary/10 text-foreground-secondary"
                    }`}>
                      {phase.status === "completed" ? "Completed" :
                       phase.status === "in_progress" ? "In Progress" : "Planned"}
                    </span>
                  </div>
                  <p className="mb-6 text-foreground-secondary">{phase.description}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {phase.features.map((feature) => (
                      <div
                        key={feature.name}
                        className="flex items-center gap-3 rounded-lg bg-[var(--background-tertiary)] px-4 py-3"
                      >
                        <div className={`h-2 w-2 rounded-full ${
                          feature.status === "done" ? "bg-[var(--success)]" :
                          feature.status === "in_progress" ? "bg-[var(--primary)]" :
                          "bg-foreground-secondary/30"
                        }`} />
                        <span className="text-sm text-foreground">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Request */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Have a feature request?
          </h2>
          <p className="mb-8 text-foreground-secondary">
            We&apos;d love to hear from you. Let us know what features would help your business.
          </p>
          <Link
            href="/contact?subject=feature-request"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            Submit a feature request
          </Link>
        </div>
      </section>
    </main>
  );
}
