import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner Program | PhotoProOS",
  description: "Partner with PhotoProOS to grow your business. Integration partners, referral partners, and technology partners welcome.",
};

const partnerTypes = [
  {
    title: "Integration Partners",
    description: "Build integrations with PhotoProOS to serve our mutual customers better.",
    benefits: [
      "Access to our developer API",
      "Co-marketing opportunities",
      "Technical support and resources",
      "Listing in our integrations marketplace",
    ],
    cta: "Apply for Integration Partnership",
    icon: "🔌",
  },
  {
    title: "Referral Partners",
    description: "Earn commissions by referring photographers to PhotoProOS.",
    benefits: [
      "20% recurring commission",
      "Dedicated partner dashboard",
      "Marketing materials and assets",
      "Priority support for referred customers",
    ],
    cta: "Join Referral Program",
    icon: "🤝",
  },
  {
    title: "Technology Partners",
    description: "Collaborate on technology solutions that benefit the photography industry.",
    benefits: [
      "Joint product development",
      "Revenue sharing opportunities",
      "Access to product roadmap",
      "Executive relationship management",
    ],
    cta: "Explore Technology Partnership",
    icon: "⚡",
  },
];

const existingPartners = [
  { name: "Stripe", category: "Payments" },
  { name: "Cloudflare", category: "Infrastructure" },
  { name: "Clerk", category: "Authentication" },
  { name: "Resend", category: "Email" },
];

export default function PartnersPage() {
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-sm font-medium text-purple-400">
              Partner Program
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Grow together with PhotoProOS
            </h1>
            <p className="text-lg text-foreground-secondary">
              Join our partner ecosystem and help photographers succeed. Whether you're an integration partner, referral partner, or technology partner, there's a place for you.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Partnership Opportunities</h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {partnerTypes.map((type) => (
              <div
                key={type.title}
                className="flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8"
              >
                <div className="mb-4 text-4xl">{type.icon}</div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{type.title}</h3>
                <p className="mb-6 text-foreground-secondary">{type.description}</p>
                <ul className="mb-8 flex-1 space-y-3">
                  {type.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
                      <span className="text-sm text-foreground-secondary">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact?subject=partnership"
                  className="rounded-lg bg-[var(--primary)] px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  {type.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Our Technology Partners</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {existingPartners.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--background-tertiary)] text-lg font-bold text-foreground">
                  {partner.name[0]}
                </div>
                <p className="font-medium text-foreground">{partner.name}</p>
                <p className="text-xs text-foreground-muted">{partner.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              Why partner with PhotoProOS?
            </h2>
            <p className="mb-12 text-foreground-secondary">
              We're building the future of photography business management. Partner with us to reach a growing community of professional photographers.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-[var(--primary)]">Growing</div>
              <p className="text-foreground-secondary">Active photographer community using our platform</p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-[var(--primary)]">Revenue</div>
              <p className="text-foreground-secondary">Processed through our platform annually</p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-[var(--primary)]">Global</div>
              <p className="text-foreground-secondary">Photographers across multiple countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Ready to partner?
          </h2>
          <p className="mb-8 text-foreground-secondary">
            Let's discuss how we can work together to help photographers succeed.
          </p>
          <Link
            href="/contact?subject=partnership"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            Contact Partnership Team
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
