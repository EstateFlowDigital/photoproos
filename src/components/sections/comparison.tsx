"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface ComparisonFeature {
  name: string;
  category: string;
  photoproos: boolean | string;
  pixieset: boolean | string;
  pictime: boolean | string;
  honeybook: boolean | string;
}

const comparisonFeatures: ComparisonFeature[] = [
  // Core Features
  { name: "Client Galleries", category: "Core", photoproos: true, pixieset: true, pictime: true, honeybook: false },
  { name: "Pay-to-Unlock Delivery", category: "Core", photoproos: true, pixieset: true, pictime: true, honeybook: false },
  { name: "Payment Processing", category: "Core", photoproos: true, pixieset: true, pictime: true, honeybook: true },
  { name: "Client CRM", category: "Core", photoproos: true, pixieset: "Basic", pictime: "Basic", honeybook: true },
  { name: "Booking & Scheduling", category: "Core", photoproos: true, pixieset: false, pictime: false, honeybook: true },
  { name: "Invoicing", category: "Core", photoproos: true, pixieset: false, pictime: true, honeybook: true },

  // Advanced Features
  { name: "Single Property Websites", category: "Advanced", photoproos: true, pixieset: false, pictime: false, honeybook: false },
  { name: "Marketing Kit Generator", category: "Advanced", photoproos: true, pixieset: false, pictime: false, honeybook: false },
  { name: "Email Marketing", category: "Advanced", photoproos: "Coming Soon", pixieset: false, pictime: false, honeybook: false },
  { name: "Social Media Manager", category: "Advanced", photoproos: "Coming Soon", pixieset: false, pictime: false, honeybook: false },

  // Business Operations
  { name: "Contracts & E-Signatures", category: "Business", photoproos: "Coming Soon", pixieset: false, pictime: false, honeybook: true },
  { name: "Analytics Dashboard", category: "Business", photoproos: true, pixieset: "Basic", pictime: "Basic", honeybook: "Basic" },
  { name: "Custom Branding", category: "Business", photoproos: true, pixieset: true, pictime: true, honeybook: true },
  { name: "Custom Domain", category: "Business", photoproos: true, pixieset: "Paid", pictime: "Paid", honeybook: false },

  // Pricing
  { name: "Free Tier", category: "Pricing", photoproos: "5 galleries", pixieset: "3 galleries", pictime: false, honeybook: false },
  { name: "Starting Price", category: "Pricing", photoproos: "$0/mo", pixieset: "$0/mo", pictime: "$19/mo", honeybook: "$19/mo" },
];

const competitors = [
  { id: "photoproos", name: "PhotoProOS", highlight: true },
  { id: "pixieset", name: "Pixieset", highlight: false },
  { id: "pictime", name: "Pic-Time", highlight: false },
  { id: "honeybook", name: "HoneyBook", highlight: false },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center">
        <CheckIcon className="h-5 w-5 text-[var(--success)]" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center">
        <XIcon className="h-5 w-5 text-foreground-muted/50" />
      </span>
    );
  }
  if (value === "Coming Soon") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
        Coming Soon
      </span>
    );
  }
  return (
    <span className="text-xs text-foreground-muted">{value}</span>
  );
}

export function ComparisonSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const categories = ["all", ...new Set(comparisonFeatures.map(f => f.category))];
  const filteredFeatures = selectedCategory === "all"
    ? comparisonFeatures
    : comparisonFeatures.filter(f => f.category === selectedCategory);

  return (
    <section id="comparison" ref={ref} className="relative z-10 py-20 lg:py-32">
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
              See how we <span className="font-medium text-[var(--primary)]">stack up</span>
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
            <span className="text-foreground">Why photographers</span>{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">choose PhotoProOS</span>
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
            One platform that does it all. No more juggling multiple subscriptions.
          </p>
        </div>

        {/* Category Filter */}
        <div
          className="mb-8 flex flex-wrap justify-center gap-2"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(20px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out",
            transitionDelay: "250ms",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                selectedCategory === category
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)] border border-[var(--card-border)]"
              )}
            >
              {category === "all" ? "All Features" : category}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div
          className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "300ms",
          }}
        >
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground-muted">Feature</th>
                  {competitors.map((comp) => (
                    <th
                      key={comp.id}
                      className={cn(
                        "px-6 py-4 text-center text-sm font-medium",
                        comp.highlight ? "bg-[var(--primary)]/5 text-[var(--primary)]" : "text-foreground-muted"
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{comp.name}</span>
                        {comp.highlight && (
                          <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-medium text-white">
                            Recommended
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredFeatures.map((feature, index) => (
                  <tr key={feature.name} className="hover:bg-[var(--background-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">{feature.name}</span>
                    </td>
                    <td className={cn("px-6 py-4 text-center", "bg-[var(--primary)]/5")}>
                      <FeatureValue value={feature.photoproos} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureValue value={feature.pixieset} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureValue value={feature.pictime} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureValue value={feature.honeybook} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-[var(--card-border)]">
            {filteredFeatures.map((feature) => (
              <div key={feature.name} className="p-4">
                <p className="mb-3 text-sm font-medium text-foreground">{feature.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  {competitors.map((comp) => {
                    const value = feature[comp.id as keyof ComparisonFeature];
                    return (
                      <div
                        key={comp.id}
                        className={cn(
                          "rounded-lg p-2 text-center",
                          comp.highlight ? "bg-[var(--primary)]/10" : "bg-[var(--background-secondary)]"
                        )}
                      >
                        <p className={cn(
                          "mb-1 text-[10px] font-medium uppercase tracking-wider",
                          comp.highlight ? "text-[var(--primary)]" : "text-foreground-muted"
                        )}>
                          {comp.name}
                        </p>
                        <FeatureValue value={value as boolean | string} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-12 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "500ms",
          }}
        >
          <p className="mb-6 text-lg text-foreground-secondary">
            Ready to consolidate your photography tools?
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-base font-medium text-[var(--background)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-foreground/20 motion-reduce:transform-none"
          >
            Start your free trial
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Icons
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
