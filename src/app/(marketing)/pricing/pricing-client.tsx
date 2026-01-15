"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  PLAN_PRICING,
  BETA_SETTINGS,
  LIFETIME_DEAL_INCLUDES,
  type PlanPricing,
} from "@/lib/plan-limits";

type BillingInterval = "monthly" | "annual" | "lifetime";

interface PlanData {
  name: string;
  planKey: "free" | "pro" | "studio" | "enterprise";
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}

interface FeatureRow {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
  studio: boolean | string;
  enterprise: boolean | string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface PricingPageClientProps {
  plans: PlanData[];
  featureComparison: FeatureRow[];
  faqs: FAQItem[];
  isBeta: boolean;
}

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
  plan,
  interval,
  isBeta,
  onLifetimeClick,
}: {
  plan: PlanData;
  interval: BillingInterval;
  isBeta: boolean;
  onLifetimeClick: () => void;
}) {
  const pricing = PLAN_PRICING[plan.planKey];
  const { price, originalPrice, period, savings } = getPriceDisplay(pricing, interval, isBeta);
  const hasLifetime = pricing.lifetime !== null && interval !== "lifetime";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-[var(--card)] p-6 transition-all duration-300 lg:p-8",
        "hover:-translate-y-1 motion-reduce:hover:translate-y-0",
        plan.popular
          ? "border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30"
          : "border-[var(--card-border)] hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/20"
      )}
    >
      {/* Glow effect for popular tier */}
      {plan.popular && (
        <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-b from-[var(--primary)]/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* Popular badge */}
      {plan.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--primary)] px-4 py-1 text-xs font-medium text-white shadow-lg shadow-[var(--primary)]/30"
          role="status"
          aria-label="Most popular plan"
        >
          Most Popular
        </div>
      )}

      {/* Beta badge */}
      {isBeta && plan.planKey !== "free" && (
        <div className="absolute -top-3 right-4 rounded-full bg-[var(--success)] px-3 py-1 text-xs font-medium text-white">
          Beta Pricing
        </div>
      )}

      {/* Header */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
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
        <p className="mt-3 text-sm text-foreground-secondary">{plan.description}</p>
      </div>

      {/* Lifetime Deal Link */}
      {hasLifetime && (
        <button
          onClick={onLifetimeClick}
          className="relative z-10 mb-4 flex items-center gap-2 rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/10 px-3 py-2 text-sm text-[var(--ai)] transition-colors hover:bg-[var(--ai)]/20"
        >
          <SparklesIcon className="h-4 w-4" />
          <span>
            Lifetime deal: <strong>${pricing.lifetime}</strong>
          </span>
        </button>
      )}

      {/* Features */}
      <ul className="relative z-10 mb-8 flex-1 space-y-3">
        {plan.features.map((feature, index) => (
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
        href={plan.href}
        className={cn(
          "relative z-10 block w-full rounded-lg py-3 text-center text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
          plan.popular || plan.planKey === "enterprise"
            ? "bg-foreground text-[var(--background)] hover:opacity-90"
            : "border border-[var(--card-border)] bg-transparent text-foreground hover:bg-[var(--background-elevated)] hover:border-[var(--border-emphasis)]"
        )}
      >
        {interval === "lifetime" && pricing.lifetime ? "Get Lifetime Access" : plan.cta}
      </Link>
    </div>
  );
}

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

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const contentId = `pricing-faq-content-${index}`;
  const buttonId = `pricing-faq-button-${index}`;

  return (
    <div className="border-b border-[var(--card-border)]">
      <button
        id={buttonId}
        className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/20 focus-visible:ring-inset"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="pr-4 text-base font-medium text-foreground">{question}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
            isOpen
              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
              : "bg-[var(--background-elevated)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
          )}
          aria-hidden="true"
        >
          {isOpen ? (
            <MinusIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </span>
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-foreground-secondary">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function PricingPageClient({
  plans,
  featureComparison,
  faqs,
  isBeta,
}: PricingPageClientProps) {
  const [interval, setInterval] = React.useState<BillingInterval>("annual");
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  return (
    <>
      {/* Pricing Section */}
      <section className="py-16 lg:py-20" data-element="pricing-plans">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          {/* Billing Toggle */}
          <div className="mb-12 flex justify-center">
            <div
              className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] p-1"
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
            <div className="mb-10 rounded-xl border border-[var(--ai)]/30 bg-gradient-to-r from-[var(--ai)]/10 to-[var(--primary)]/10 p-6">
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
              <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                {LIFETIME_DEAL_INCLUDES.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ai)]/20 px-3 py-1 text-xs text-[var(--ai)]"
                  >
                    <CheckIcon className="h-3 w-3" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                interval={interval}
                isBeta={isBeta}
                onLifetimeClick={() => setInterval("lifetime")}
              />
            ))}
          </div>

          {/* Bottom Note */}
          <p className="mt-12 text-center text-sm text-foreground-muted">
            All plans include a 14-day free trial. No credit card required to start.
            {isBeta && " Beta pricing ends soon — lock in your rate today."}
          </p>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-20" data-element="feature-comparison">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold text-foreground">Compare all features</h2>
            <p className="mt-3 text-foreground-secondary">
              Find the perfect plan for your photography business
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th scope="col" className="py-4 pl-6 pr-4 text-left text-sm font-medium text-foreground-muted">
                    Feature
                  </th>
                  <th scope="col" className="px-4 py-4 text-center text-sm font-medium text-foreground">
                    Free
                  </th>
                  <th scope="col" className="px-4 py-4 text-center text-sm font-medium text-foreground">
                    <span className="inline-flex items-center gap-1">
                      Pro
                      {isBeta && <span className="text-xs text-[var(--success)]">${PLAN_PRICING.pro.monthlyBeta}/mo</span>}
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-4 text-center text-sm font-medium text-foreground">
                    <span className="inline-flex items-center gap-1">
                      Studio
                      {isBeta && <span className="text-xs text-[var(--success)]">${PLAN_PRICING.studio.monthlyBeta}/mo</span>}
                    </span>
                  </th>
                  <th scope="col" className="px-4 py-4 pr-6 text-center text-sm font-medium text-foreground">
                    <span className="inline-flex items-center gap-1">
                      Enterprise
                      {isBeta && <span className="text-xs text-[var(--success)]">${PLAN_PRICING.enterprise.monthlyBeta}/mo</span>}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "border-b border-[var(--card-border)] transition-colors hover:bg-[var(--background-secondary)]",
                      index === featureComparison.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="py-4 pl-6 pr-4 text-sm text-foreground-secondary">{row.feature}</td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={row.free} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={row.pro} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={row.studio} />
                    </td>
                    <td className="px-4 py-4 pr-6 text-center">
                      <FeatureValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-20" data-element="pricing-faq">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
            {/* Left Column */}
            <div>
              <h2 className="text-3xl font-semibold text-foreground">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-foreground-secondary">
                Can&apos;t find the answer you&apos;re looking for?{" "}
                <Link href="/contact" className="text-[var(--primary)] underline decoration-[var(--primary)]/30 underline-offset-4 hover:decoration-[var(--primary)]">
                  Contact our team
                </Link>
              </p>
            </div>

            {/* Right Column - FAQ Items */}
            <div className="border-t border-[var(--card-border)]">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaqIndex === index}
                  onToggle={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-20" data-element="pricing-cta">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="rounded-2xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--card)] to-[var(--background-tertiary)] p-8 text-center lg:p-12">
            <h2 className="text-2xl font-semibold text-foreground lg:text-3xl">
              Ready to grow your photography business?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-foreground-secondary">
              Start free today and see why thousands of photographers trust PhotoProOS to run their business.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-[var(--background)] transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Get started free
              </Link>
              <Link
                href="/contact?subject=demo"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] bg-transparent px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-[var(--background-elevated)] hover:border-[var(--border-emphasis)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Book a demo
              </Link>
            </div>
            {isBeta && (
              <p className="mt-6 text-sm text-[var(--success)]">
                <SparklesIcon className="mr-1 inline-block h-4 w-4" />
                Lock in beta pricing before it increases
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// Icons
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
    </svg>
  );
}
