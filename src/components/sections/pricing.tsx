"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import {
  PLAN_PRICING,
  BETA_SETTINGS,
  LIFETIME_DEAL_INCLUDES,
  type PlanPricing,
} from "@/lib/plan-limits";

type BillingInterval = "monthly" | "annual" | "lifetime";

interface PricingTier {
  name: string;
  planKey: "free" | "pro" | "studio" | "enterprise";
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    planKey: "free",
    description: "Perfect for getting started and trying out PhotoProOS.",
    features: [
      "25 GB storage",
      "Up to 5 active galleries",
      "25 clients",
      "Basic gallery themes",
      "Client portal access",
      "Email support",
    ],
    cta: "Get started free",
    ctaHref: "/dashboard",
  },
  {
    name: "Pro",
    planKey: "pro",
    description: "For growing photographers who need more space.",
    features: [
      "500 GB storage",
      "50 active galleries",
      "100 clients",
      "Custom branding",
      "Payment processing",
      "Priority email support",
      "3 team members",
    ],
    cta: "Start free trial",
    ctaHref: "/dashboard",
    popular: true,
  },
  {
    name: "Studio",
    planKey: "studio",
    description: "For busy studios with unlimited usage needs.",
    features: [
      "1 TB storage",
      "Unlimited galleries",
      "Unlimited clients",
      "White-label portal",
      "API & webhooks access",
      "Advanced analytics",
      "10 team members",
    ],
    cta: "Start free trial",
    ctaHref: "/dashboard",
  },
  {
    name: "Enterprise",
    planKey: "enterprise",
    description: "For agencies with custom requirements.",
    features: [
      "Unlimited storage",
      "Unlimited everything",
      "Unlimited team members",
      "SSO/SAML",
      "SLA guarantee",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact sales",
    ctaHref: "/contact",
  },
];

function getPriceDisplay(
  pricing: PlanPricing,
  interval: BillingInterval,
  isBeta: boolean
): { price: string; originalPrice?: string; period: string; savings?: string } {
  if (pricing.monthlyBeta === 0) {
    return { price: "$0", period: "forever" };
  }

  switch (interval) {
    case "monthly":
      return {
        price: `$${isBeta ? pricing.monthlyBeta : pricing.monthlyRegular}`,
        originalPrice: isBeta ? `$${pricing.monthlyRegular}` : undefined,
        period: "per month",
      };
    case "annual":
      const monthlyEquiv = Math.round(
        (isBeta ? pricing.yearlyBeta : pricing.yearlyRegular) / 12
      );
      const monthlySavings = (isBeta ? pricing.monthlyBeta : pricing.monthlyRegular) - monthlyEquiv;
      return {
        price: `$${monthlyEquiv}`,
        originalPrice: isBeta ? `$${Math.round(pricing.yearlyRegular / 12)}` : undefined,
        period: "per month",
        savings: `Save $${monthlySavings * 12}/year`,
      };
    case "lifetime":
      if (!pricing.lifetime) return { price: "N/A", period: "" };
      return {
        price: `$${isBeta ? pricing.lifetime : pricing.lifetimeRegular}`,
        originalPrice: isBeta && pricing.lifetimeRegular ? `$${pricing.lifetimeRegular}` : undefined,
        period: "one-time",
        savings: "Pay once, use forever",
      };
  }
}

function PricingCard({
  tier,
  interval,
  onLifetimeClick,
}: {
  tier: PricingTier;
  interval: BillingInterval;
  onLifetimeClick: () => void;
}) {
  const pricing = PLAN_PRICING[tier.planKey];
  const isBeta = BETA_SETTINGS.isBetaActive;
  const { price, originalPrice, period, savings } = getPriceDisplay(pricing, interval, isBeta);
  const hasLifetime = pricing.lifetime !== null && interval !== "lifetime";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-[var(--card)] p-6 transition-all duration-300 lg:p-8",
        "hover:-translate-y-1 motion-reduce:hover:translate-y-0",
        tier.popular
          ? "border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30"
          : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/20"
      )}
    >
      {/* Glow effect for popular tier */}
      {tier.popular && (
        <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-b from-[var(--primary)]/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* Popular badge */}
      {tier.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--primary)] px-4 py-1 text-xs font-medium text-white shadow-lg shadow-[var(--primary)]/30"
          role="status"
          aria-label="Most popular plan"
        >
          Most Popular
        </div>
      )}

      {/* Beta badge */}
      {isBeta && tier.planKey !== "free" && (
        <div className="absolute -top-3 right-4 rounded-full bg-[var(--success)] px-3 py-1 text-xs font-medium text-white">
          Beta Pricing
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          {originalPrice && (
            <span className="text-lg text-foreground-muted line-through">{originalPrice}</span>
          )}
          <span className="text-sm text-foreground-muted">/{period}</span>
        </div>
        {savings && (
          <p className="mt-1 text-sm text-[var(--success)]">{savings}</p>
        )}
        <p className="mt-3 text-sm text-foreground-secondary">{tier.description}</p>
      </div>

      {/* Lifetime Deal Link */}
      {hasLifetime && (
        <button
          onClick={onLifetimeClick}
          className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/10 px-3 py-2 text-sm text-[var(--ai)] transition-colors hover:bg-[var(--ai)]/20"
        >
          <SparklesIcon className="h-4 w-4" />
          <span>
            Lifetime deal: <strong>${pricing.lifetime}</strong>
          </span>
        </button>
      )}

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
            <span className="text-sm text-foreground-secondary">{feature}</span>
          </li>
        ))}
        {interval === "lifetime" && pricing.lifetime && (
          <>
            <li className="flex items-start gap-3">
              <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ai)]" />
              <span className="text-sm text-[var(--ai)]">10% off all in-app purchases</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ai)]" />
              <span className="text-sm text-[var(--ai)]">All future updates included</span>
            </li>
          </>
        )}
      </ul>

      {/* CTA */}
      <Link
        href={tier.ctaHref}
        className={cn(
          "block w-full rounded-lg py-3 text-center text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
          tier.popular || tier.planKey === "enterprise"
            ? "bg-foreground text-[var(--background)] hover:opacity-90"
            : "border border-[var(--card-border)] bg-transparent text-foreground hover:bg-[var(--background-elevated)] hover:border-[var(--border-emphasis)]"
        )}
      >
        {interval === "lifetime" && pricing.lifetime ? "Get Lifetime Access" : tier.cta}
      </Link>
    </div>
  );
}

export function PricingSection() {
  const [interval, setInterval] = React.useState<BillingInterval>("annual");
  const { ref, isVisible } = useScrollAnimation();
  const isBeta = BETA_SETTINGS.isBetaActive;

  return (
    <section id="pricing" ref={ref} className="relative z-10 py-20 lg:py-32">
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        {/* Beta Banner */}
        {isBeta && (
          <div
            className="mb-8 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-4 text-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            <p className="text-sm text-foreground">
              <span className="font-semibold text-[var(--success)]">Beta Exclusive Pricing</span>
              {" — "}Lock in these prices before they increase. Limited time offer.
            </p>
          </div>
        )}

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
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-[var(--primary)] opacity-75" />
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
            <span className="text-foreground">Simple,</span>{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">
              transparent pricing
            </span>
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
            Start free, upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle - Three Options */}
          <div
            className="mt-8 inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] p-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "300ms",
            }}
            role="tablist"
            aria-label="Billing interval"
          >
            <button
              onClick={() => setInterval("monthly")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
                interval === "monthly"
                  ? "bg-foreground text-[var(--background)]"
                  : "text-foreground-muted hover:text-foreground"
              )}
              role="tab"
              aria-selected={interval === "monthly"}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("annual")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
                interval === "annual"
                  ? "bg-foreground text-[var(--background)]"
                  : "text-foreground-muted hover:text-foreground"
              )}
              role="tab"
              aria-selected={interval === "annual"}
            >
              Annual
              <span className="ml-1.5 text-xs text-[var(--success)]">-20%</span>
            </button>
            <button
              onClick={() => setInterval("lifetime")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
                interval === "lifetime"
                  ? "bg-[var(--ai)] text-white"
                  : "text-foreground-muted hover:text-foreground"
              )}
              role="tab"
              aria-selected={interval === "lifetime"}
            >
              <SparklesIcon className="mr-1 inline-block h-3.5 w-3.5" />
              Lifetime
            </button>
          </div>
        </div>

        {/* Lifetime Deal Banner */}
        {interval === "lifetime" && (
          <div
            className="mb-8 rounded-xl border border-[var(--ai)]/30 bg-gradient-to-r from-[var(--ai)]/10 to-[var(--primary)]/10 p-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--ai)]/20">
                <SparklesIcon className="h-6 w-6 text-[var(--ai)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Lifetime Deal — Beta Exclusive</h3>
                <p className="mt-1 text-sm text-foreground-secondary">
                  Pay once, use forever. Includes all current and future features, updates, and 10% off all in-app purchases.
                  {isBeta && (
                    <span className="ml-1 text-[var(--ai)]">
                      Only {BETA_SETTINGS.ltdSlotsRemaining} of {BETA_SETTINGS.ltdSlotsTotal} slots remaining.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

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
              <PricingCard
                tier={tier}
                interval={interval}
                onLifetimeClick={() => setInterval("lifetime")}
              />
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
          {isBeta && " Beta pricing ends soon — lock in your rate today."}
        </p>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h3
            className="mb-8 text-center text-2xl font-medium text-foreground"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
              transitionDelay: "900ms",
            }}
          >
            Compare all features
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className="border-b border-[var(--card-border)]"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "none" : "translateY(20px)",
                    transition: "opacity 500ms ease-out, transform 500ms ease-out",
                    transitionDelay: "950ms",
                  }}
                >
                  <th scope="col" className="py-4 pr-4 text-left text-sm font-medium text-foreground-muted">
                    Feature
                  </th>
                  <th scope="col" className="px-4 py-4 text-center text-sm font-medium text-foreground">
                    Free
                  </th>
                  <th scope="col" className="px-4 py-4 text-center text-sm font-medium text-foreground">
                    Pro
                  </th>
                  <th scope="col" className="px-4 py-4 text-center text-sm font-medium text-foreground">
                    Studio
                  </th>
                  <th scope="col" className="px-4 py-4 text-center text-sm font-medium text-foreground">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--card-border)] transition-colors hover:bg-[var(--background-secondary)]"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "none" : "translateY(20px)",
                      transition: "opacity 500ms ease-out, transform 500ms ease-out, background-color 200ms ease",
                      transitionDelay: `${1000 + index * 50}ms`,
                    }}
                  >
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

// Feature comparison data - aligned with plan-limits.ts
const comparisonFeatures = [
  { name: "Storage", free: "25 GB", pro: "500 GB", studio: "1 TB", enterprise: "Unlimited" },
  { name: "Active galleries", free: "5", pro: "50", studio: "Unlimited", enterprise: "Unlimited" },
  { name: "Clients", free: "25", pro: "100", studio: "Unlimited", enterprise: "Unlimited" },
  { name: "Team members", free: "1", pro: "3", studio: "10", enterprise: "Unlimited" },
  { name: "Custom branding", free: true, pro: true, studio: true, enterprise: true },
  { name: "White-label (remove branding)", free: false, pro: false, studio: true, enterprise: true },
  { name: "Payment processing", free: false, pro: true, studio: true, enterprise: true },
  { name: "Transaction fee", free: "N/A", pro: "2.9% + 30¢", studio: "2.5% + 30¢", enterprise: "Custom" },
  { name: "Invoices per month", free: "10", pro: "50", studio: "Unlimited", enterprise: "Unlimited" },
  { name: "API & webhooks", free: false, pro: false, studio: true, enterprise: true },
  { name: "Analytics dashboard", free: "Basic", pro: "Standard", studio: "Advanced", enterprise: "Custom" },
  { name: "Custom domain", free: false, pro: true, studio: true, enterprise: true },
  { name: "AI credits/month", free: "10", pro: "100", studio: "1,000", enterprise: "Unlimited" },
  { name: "SSO/SAML", free: false, pro: false, studio: false, enterprise: true },
  { name: "Priority support", free: false, pro: "Email", studio: "Phone + Email", enterprise: "Dedicated" },
  { name: "SLA guarantee", free: false, pro: false, studio: false, enterprise: true },
  { name: "Additional storage", free: "Upgrade required", pro: "$199/10 TB", studio: "$199/10 TB", enterprise: "$199/10 TB" },
  { name: "Gallery sleep mode", free: false, pro: true, studio: true, enterprise: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <>
        <CheckIcon className="mx-auto h-5 w-5 text-[var(--success)]" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    ) : (
      <>
        <XIcon className="mx-auto h-5 w-5 text-foreground-muted" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm text-foreground-secondary">{value}</span>;
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
