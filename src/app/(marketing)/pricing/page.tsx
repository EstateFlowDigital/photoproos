import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | PhotoProOS",
  description: "Simple, transparent pricing for photographers of all sizes. Start free, upgrade when you're ready. No hidden fees.",
};

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started and trying out PhotoProOS.",
    monthlyPrice: "$0",
    annualPrice: "$0",
    period: "/forever",
    features: [
      "Up to 5 active galleries",
      "Basic gallery themes",
      "Client portal access",
      "Email support",
      "PhotoProOS branding",
    ],
    cta: "Get started free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For professional photographers ready to grow their business.",
    monthlyPrice: "$29",
    annualPrice: "$23",
    period: "/per month",
    annualNote: "Save 20% with annual billing",
    features: [
      "Unlimited galleries",
      "Custom branding",
      "Payment processing",
      "Automated workflows",
      "Priority email support",
      "Client management CRM",
      "Analytics dashboard",
    ],
    cta: "Start free trial",
    href: "/signup?plan=pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Studio",
    description: "For busy studios and photography teams.",
    monthlyPrice: "$79",
    annualPrice: "$63",
    period: "/per month",
    annualNote: "Save 20% with annual billing",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 5)",
      "Advanced analytics",
      "Custom contracts",
      "Priority phone support",
      "White-label client portal",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Start free trial",
    href: "/signup?plan=studio",
    highlighted: false,
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom requirements.",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    period: "/pricing",
    features: [
      "Everything in Studio",
      "Unlimited team members",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated infrastructure",
      "Onboarding & training",
      "Custom feature development",
    ],
    cta: "Contact sales",
    href: "/contact?subject=enterprise",
    highlighted: false,
  },
];

const featureComparison = [
  { feature: "Active galleries", free: "5", pro: "Unlimited", studio: "Unlimited", enterprise: "Unlimited" },
  { feature: "Storage", free: "2 GB", pro: "100 GB", studio: "500 GB", enterprise: "Unlimited" },
  { feature: "Custom branding", free: false, pro: true, studio: true, enterprise: true },
  { feature: "Remove PhotoProOS branding", free: false, pro: true, studio: true, enterprise: true },
  { feature: "Payment processing", free: false, pro: true, studio: true, enterprise: true },
  { feature: "Transaction fee", free: "N/A", pro: "2.9% + 30¢", studio: "2.5% + 30¢", enterprise: "Custom" },
  { feature: "Client management CRM", free: false, pro: true, studio: true, enterprise: true },
  { feature: "Automated workflows", free: false, pro: true, studio: true, enterprise: true },
  { feature: "Analytics dashboard", free: "Basic", pro: "Standard", studio: "Advanced", enterprise: "Custom" },
  { feature: "Team members", free: "1", pro: "1", studio: "5", enterprise: "Unlimited" },
  { feature: "API access", free: false, pro: false, studio: true, enterprise: true },
  { feature: "Custom domain", free: false, pro: true, studio: true, enterprise: true },
  { feature: "Priority support", free: false, pro: "Email", studio: "Phone + Email", enterprise: "Dedicated" },
  { feature: "SLA guarantee", free: false, pro: false, studio: false, enterprise: true },
];

const faqs = [
  {
    question: "Can I try PhotoProOS before committing?",
    answer: "Yes! Our Free plan is available forever, and Pro comes with a 14-day free trial. No credit card required.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Stripe. Annual plans receive a 20% discount.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Absolutely. You can change your plan at any time. Upgrades take effect immediately, and downgrades at the end of your billing cycle.",
  },
  {
    question: "What are the payment processing fees?",
    answer: "We charge a small percentage on payments you collect through galleries. The fee decreases as your plan tier increases: 2.9% + 30¢ for Pro, 2.5% + 30¢ for Studio, and custom rates for Enterprise.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Annual plans save you 20% compared to monthly billing.",
  },
  {
    question: "Is there a limit on file storage?",
    answer: "Storage limits vary by plan: Free includes 2GB, Pro includes 100GB, Studio includes 500GB, and Enterprise includes unlimited storage.",
  },
];

export default function PricingPage() {
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/5 px-4 py-1.5 text-sm font-medium text-[var(--success)]">
              Simple, transparent pricing
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Start free, upgrade anytime
            </h1>
            <p className="text-lg text-foreground-secondary">
              No hidden fees, no surprises. Start free, upgrade when you&apos;re ready.
            </p>
          </div>
        </div>
      </section>

      {/* Billing Toggle Note */}
      <section className="py-8">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <p className="text-center text-sm text-foreground-secondary">
            All paid plans include a <strong className="text-foreground">14-day free trial</strong>. No credit card required to start.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-[var(--primary)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent"
                    : "border-[var(--card-border)] bg-[var(--card)]"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--primary)] px-4 py-1 text-xs font-medium text-white">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-foreground-secondary">{plan.description}</p>
                </div>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">{plan.annualPrice}</span>
                  <span className="text-foreground-secondary">{plan.period}</span>
                </div>
                {plan.annualNote && (
                  <p className="mb-6 text-xs text-[var(--success)]">{plan.annualNote}</p>
                )}
                {!plan.annualNote && <div className="mb-6" />}
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground-secondary">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full rounded-lg py-3 text-center text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                      : "border border-[var(--card-border)] bg-[var(--background)] text-foreground hover:bg-[var(--background-hover)]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Compare all features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="pb-4 text-left font-medium text-foreground">Feature</th>
                  <th className="pb-4 text-center font-medium text-foreground">Free</th>
                  <th className="pb-4 text-center font-medium text-[var(--primary)]">Pro</th>
                  <th className="pb-4 text-center font-medium text-foreground">Studio</th>
                  <th className="pb-4 text-center font-medium text-foreground">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row) => (
                  <tr key={row.feature} className="border-b border-[var(--card-border)]">
                    <td className="py-4 text-sm text-foreground">{row.feature}</td>
                    <td className="py-4 text-center">
                      <FeatureValue value={row.free} />
                    </td>
                    <td className="py-4 text-center">
                      <FeatureValue value={row.pro} />
                    </td>
                    <td className="py-4 text-center">
                      <FeatureValue value={row.studio} />
                    </td>
                    <td className="py-4 text-center">
                      <FeatureValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-2 font-semibold text-foreground">{faq.question}</h3>
                <p className="text-sm text-foreground-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Ready to streamline your photography business?
          </h2>
          <p className="mb-8 text-foreground-secondary">
            Start free today. No credit card required.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Start free trial
            </Link>
            <Link
              href="/contact?subject=sales"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckIcon className="mx-auto h-5 w-5 text-[var(--success)]" />
    ) : (
      <XIcon className="mx-auto h-5 w-5 text-foreground-secondary/30" />
    );
  }
  return <span className="text-sm text-foreground-secondary">{value}</span>;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
