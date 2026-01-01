"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  enterprise?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and trying out PhotoProOS.",
    features: [
      "Up to 3 active galleries",
      "Basic gallery themes",
      "Client portal access",
      "Email support",
      "PhotoProOS branding",
    ],
    cta: "Get started free",
    ctaHref: "/signup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professional photographers ready to grow their business.",
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
    ctaHref: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Studio",
    price: "$79",
    period: "per month",
    description: "For busy studios and photography teams.",
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
    ctaHref: "/signup?plan=studio",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large organizations with custom requirements.",
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
    ctaHref: "/contact",
    enterprise: true,
  },
];

function PricingCard({ tier, isAnnual }: { tier: PricingTier; isAnnual: boolean }) {
  const monthlyPrice = parseInt(tier.price.replace("$", "")) || 0;
  const annualPrice = Math.floor(monthlyPrice * 0.8);
  const displayPrice = tier.enterprise ? tier.price : (isAnnual && monthlyPrice > 0 ? `$${annualPrice}` : tier.price);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-[var(--card)] p-6 transition-all duration-300 lg:p-8",
        "hover:shadow-xl hover:shadow-black/30",
        tier.popular
          ? "border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10"
          : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
      )}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--primary)] px-4 py-1 text-xs font-medium text-white">
          Most Popular
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground">{displayPrice}</span>
          <span className="text-sm text-foreground-muted">/{tier.period}</span>
        </div>
        {isAnnual && monthlyPrice > 0 && !tier.enterprise && (
          <p className="mt-1 text-sm text-[var(--success)]">Save 20% with annual billing</p>
        )}
        <p className="mt-3 text-sm text-foreground-secondary">{tier.description}</p>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
            <span className="text-sm text-foreground-secondary">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={tier.ctaHref}
        className={cn(
          "block w-full rounded-lg py-3 text-center text-sm font-medium transition-all duration-300",
          tier.popular || tier.enterprise
            ? "bg-foreground text-[var(--background)] hover:opacity-90"
            : "border border-[var(--card-border)] bg-transparent text-foreground hover:bg-[var(--background-elevated)]"
        )}
      >
        {tier.cta}
      </Link>
    </div>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = React.useState(true);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="pricing" ref={ref} className="relative z-10 py-20 lg:py-32">
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
            </span>
            <span className="text-sm text-foreground-secondary">
              Start <span className="font-medium text-[var(--primary)]">free</span>, upgrade anytime
            </span>
          </div>
          <h2
            className="mx-auto max-w-3xl text-4xl font-medium leading-tight tracking-[-1px] lg:text-5xl lg:leading-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            <span className="text-foreground-secondary">Simple,</span>{" "}
            <span className="text-foreground">transparent pricing</span>
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "200ms",
            }}
          >
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div
            className="mt-8 inline-flex items-center gap-4 rounded-full border border-[var(--card-border)] bg-[var(--card)] p-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "300ms",
            }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                !isAnnual
                  ? "bg-foreground text-[var(--background)]"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isAnnual
                  ? "bg-foreground text-[var(--background)]"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              Annual
              <span className="ml-1.5 text-xs text-[var(--success)]">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(40px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: `${400 + index * 100}ms`,
              }}
            >
              <PricingCard tier={tier} isAnnual={isAnnual} />
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p
          className="mt-12 text-center text-sm text-foreground-muted"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "800ms",
          }}
        >
          All plans include a 14-day free trial. No credit card required to start.
        </p>

        {/* Feature Comparison Table */}
        <div
          className="mt-20"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "900ms",
          }}
        >
          <h3 className="mb-8 text-center text-2xl font-medium text-foreground">Compare all features</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="py-4 pr-4 text-left text-sm font-medium text-foreground-muted">Feature</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-foreground">Free</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-foreground">Pro</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-foreground">Studio</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-foreground">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-[var(--card-border)]">
                    <td className="py-4 pr-4 text-sm text-foreground-secondary">{feature.name}</td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={feature.free} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={feature.pro} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={feature.studio} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature comparison data
const comparisonFeatures = [
  { name: "Active galleries", free: "3", pro: "Unlimited", studio: "Unlimited", enterprise: "Unlimited" },
  { name: "Storage", free: "2 GB", pro: "100 GB", studio: "500 GB", enterprise: "Unlimited" },
  { name: "Custom branding", free: false, pro: true, studio: true, enterprise: true },
  { name: "Remove PhotoProOS branding", free: false, pro: true, studio: true, enterprise: true },
  { name: "Payment processing", free: false, pro: true, studio: true, enterprise: true },
  { name: "Transaction fee", free: "N/A", pro: "2.9% + 30¢", studio: "2.5% + 30¢", enterprise: "Custom" },
  { name: "Client management CRM", free: false, pro: true, studio: true, enterprise: true },
  { name: "Automated workflows", free: false, pro: true, studio: true, enterprise: true },
  { name: "Analytics dashboard", free: "Basic", pro: "Standard", studio: "Advanced", enterprise: "Custom" },
  { name: "Team members", free: "1", pro: "1", studio: "5", enterprise: "Unlimited" },
  { name: "API access", free: false, pro: false, studio: true, enterprise: true },
  { name: "Custom domain", free: false, pro: true, studio: true, enterprise: true },
  { name: "Priority support", free: false, pro: "Email", studio: "Phone + Email", enterprise: "Dedicated" },
  { name: "SLA guarantee", free: false, pro: false, studio: false, enterprise: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckIcon className="mx-auto h-5 w-5 text-[var(--success)]" />
    ) : (
      <XIcon className="mx-auto h-5 w-5 text-foreground-muted" />
    );
  }
  return <span className="text-sm text-foreground-secondary">{value}</span>;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}
