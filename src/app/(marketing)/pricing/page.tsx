import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | PhotoProOS",
  description: "Simple, transparent pricing for photographers of all sizes. Start free, upgrade when you're ready.",
};

const plans = [
  {
    name: "Starter",
    description: "Perfect for photographers just getting started",
    price: "Free",
    period: "forever",
    features: [
      "5 active galleries",
      "100 photos per gallery",
      "Basic branding",
      "Email support",
      "Pay-to-unlock delivery",
      "Stripe payments (5% fee)",
    ],
    cta: "Start free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing photography businesses",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited galleries",
      "Unlimited photos",
      "Custom branding & domain",
      "Priority support",
      "Advanced analytics",
      "Stripe payments (2.5% fee)",
      "Client portal",
      "Automated workflows",
      "Contracts & e-signatures",
    ],
    cta: "Start free trial",
    href: "/signup?plan=pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Business",
    description: "For studios and agencies",
    price: "$79",
    period: "/month",
    features: [
      "Everything in Pro",
      "Team members (up to 5)",
      "Multi-location support",
      "White-label client portal",
      "API access",
      "Stripe payments (1.5% fee)",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    href: "/contact?subject=sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Can I try PhotoProOS before committing?",
    answer: "Yes! Our Starter plan is free forever, and Pro comes with a 14-day free trial. No credit card required.",
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
    answer: "We charge a small percentage on payments you collect through galleries. The fee decreases as your plan tier increases.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Annual plans save you 20% compared to monthly billing.",
  },
  {
    question: "Is there a limit on file storage?",
    answer: "Pro and Business plans include unlimited storage for your photos. Starter plan includes 10GB.",
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
              Start free, grow without limits
            </h1>
            <p className="text-lg text-foreground-secondary">
              No hidden fees. No surprise charges. Just powerful tools that grow with your business.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-8 lg:grid-cols-3">
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
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-foreground-secondary">{plan.period}</span>
                </div>
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
            Still have questions?
          </h2>
          <p className="mb-8 text-foreground-secondary">
            Our team is here to help you find the right plan for your business.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Contact sales
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
