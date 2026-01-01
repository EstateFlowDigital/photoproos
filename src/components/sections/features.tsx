"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  highlight?: boolean;
  badge?: string;
  className?: string;
}

function FeatureCard({ title, description, icon, features, highlight, badge, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-[var(--card)] p-6 transition-all duration-300 ease-out lg:p-8",
        "hover:shadow-xl hover:shadow-black/30",
        "hover:-translate-y-1",
        "motion-reduce:transition-none motion-reduce:transform-none",
        highlight
          ? "border-[var(--primary)]/50 hover:border-[var(--primary)]"
          : "border-[var(--card-border)] hover:border-[var(--border-hover)]",
        className
      )}
    >
      {/* Gradient glow on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Popular badge */}
      {highlight && (
        <div className="absolute -top-3 left-6 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white">
          Most Popular
        </div>
      )}

      {/* Custom badge (e.g., Coming Soon) */}
      {badge && !highlight && (
        <div className="absolute -top-3 left-6 rounded-full bg-[var(--warning)] px-3 py-1 text-xs font-medium text-white">
          {badge}
        </div>
      )}

      {/* Icon */}
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--primary)]/20 motion-reduce:transform-none" aria-hidden="true">
        {icon}
      </div>

      {/* Title */}
      <h3 className="relative mb-2 text-xl font-semibold text-foreground lg:text-2xl">{title}</h3>

      {/* Description */}
      <p className="relative mb-6 text-base leading-relaxed text-foreground-secondary">
        {description}
      </p>

      {/* Feature list */}
      <ul className="relative mt-auto space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
            <span className="text-sm text-foreground-secondary">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const mainFeatures = [
  {
    title: "Client Galleries",
    description: "Create beautiful, branded galleries that impress clients and drive sales with pay-to-unlock photo delivery.",
    icon: <GalleryIcon className="h-6 w-6" />,
    features: [
      "Customizable gallery themes",
      "Pay-per-photo or gallery pricing",
      "Password protection options",
      "Bulk download for clients",
      "Mobile-optimized viewing",
    ],
    highlight: true,
  },
  {
    title: "Payment Processing",
    description: "Get paid faster with integrated payment processing. Collect deposits, final payments, and tips seamlessly.",
    icon: <PaymentIcon className="h-6 w-6" />,
    features: [
      "Stripe & PayPal integration",
      "Automatic invoicing",
      "Deposit collection",
      "Payment tracking dashboard",
      "Multi-currency support",
    ],
  },
  {
    title: "Client Management",
    description: "Keep all your client information organized in one place. Track leads, manage bookings, and nurture relationships.",
    icon: <ClientIcon className="h-6 w-6" />,
    features: [
      "Contact management",
      "Booking calendar sync",
      "Client communication history",
      "Lead tracking pipeline",
      "Custom client notes",
    ],
  },
  {
    title: "Workflow Automation",
    description: "Save hours every week by automating repetitive tasks. Focus on what you do best - taking amazing photos.",
    icon: <AutomationIcon className="h-6 w-6" />,
    features: [
      "Automated email sequences",
      "Booking confirmations",
      "Payment reminders",
      "Gallery delivery triggers",
      "Follow-up automation",
    ],
  },
  {
    title: "Analytics & Reports",
    description: "Understand your business with powerful analytics. Track revenue, identify trends, and make data-driven decisions.",
    icon: <AnalyticsIcon className="h-6 w-6" />,
    features: [
      "Revenue tracking",
      "Client insights",
      "Gallery performance metrics",
      "Financial reports",
      "Export to accounting software",
    ],
  },
  {
    title: "Contracts & E-Sign",
    description: "Send and sign contracts digitally. Keep everything organized with legally-binding electronic signatures.",
    icon: <ContractIcon className="h-6 w-6" />,
    features: [
      "Contract templates",
      "Electronic signatures",
      "Automatic reminders",
      "Signed document storage",
      "Legal compliance",
    ],
    badge: "Coming Soon",
  },
];

export function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" ref={ref} className="relative z-10 py-20 lg:py-32">
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <p
            className="mb-4 font-mono text-sm uppercase tracking-wider text-[var(--primary)]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            Platform Features
          </p>
          <h2
            className="mx-auto max-w-3xl text-4xl font-medium leading-tight tracking-[-1px] text-foreground lg:text-5xl lg:leading-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            Everything you need to run your photography business
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
            One platform to manage clients, deliver photos, collect payments, and grow your business. No more juggling multiple tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mainFeatures.map((feature, index) => (
            <div
              key={feature.title}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(40px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: `${300 + index * 100}ms`,
              }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-16 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "900ms",
          }}
        >
          <p className="mb-6 text-lg text-foreground-secondary">
            Ready to streamline your photography business?
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-base font-medium text-[var(--background)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-foreground/20 motion-reduce:transform-none"
          >
            Get started free
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Icon Components
function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
      <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
      <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
    </svg>
  );
}

function AutomationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z" clipRule="evenodd" />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
