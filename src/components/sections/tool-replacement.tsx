"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

/**
 * Tool Replacement Section
 *
 * Shows how PhotoProOS replaces 10+ tools photographers typically use.
 * Includes animated visual comparison and cost savings.
 *
 * Accessibility: ARIA labels, semantic markup, reduced motion support
 * Responsive: Mobile-first with stacked layout on small screens
 */

interface ReplacedTool {
  name: string;
  category: string;
  monthlyPrice: string;
  icon: React.ReactNode;
}

const replacedTools: ReplacedTool[] = [
  {
    name: "Pixieset",
    category: "Gallery Delivery",
    monthlyPrice: "$20",
    icon: <GalleryIcon />,
  },
  {
    name: "HoneyBook",
    category: "CRM & Invoicing",
    monthlyPrice: "$39",
    icon: <CRMIcon />,
  },
  {
    name: "QuickBooks",
    category: "Accounting",
    monthlyPrice: "$30",
    icon: <AccountingIcon />,
  },
  {
    name: "Calendly",
    category: "Scheduling",
    monthlyPrice: "$12",
    icon: <CalendarIcon />,
  },
  {
    name: "Mailchimp",
    category: "Email Marketing",
    monthlyPrice: "$20",
    icon: <EmailIcon />,
  },
  {
    name: "DocuSign",
    category: "Contracts",
    monthlyPrice: "$25",
    icon: <ContractIcon />,
  },
  {
    name: "Stripe",
    category: "Payments",
    monthlyPrice: "2.9%",
    icon: <PaymentIcon />,
  },
  {
    name: "Notion",
    category: "Project Management",
    monthlyPrice: "$10",
    icon: <ProjectIcon />,
  },
  {
    name: "Typeform",
    category: "Questionnaires",
    monthlyPrice: "$25",
    icon: <FormIcon />,
  },
  {
    name: "Zapier",
    category: "Automation",
    monthlyPrice: "$30",
    icon: <AutomationIcon />,
  },
];

// Calculate total monthly cost
const totalMonthlyCost = replacedTools
  .filter((tool) => !tool.monthlyPrice.includes("%"))
  .reduce((sum, tool) => sum + parseInt(tool.monthlyPrice.replace("$", "")), 0);

export function ToolReplacementSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="relative z-10 py-20 lg:py-28 bg-[var(--background-tertiary)]"
      aria-labelledby="tool-replacement-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div
            className={cn(
              "mb-4 inline-flex items-center rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-sm font-medium text-foreground-secondary">
              Simplify Your Stack
            </span>
          </div>
          <h2
            id="tool-replacement-heading"
            className={cn(
              "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl transition-all duration-500 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-foreground/60">Replace</span>{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] bg-clip-text text-transparent">
              10+ tools
            </span>{" "}
            <span className="text-foreground/60">with one.</span>
          </h2>
          <p
            className={cn(
              "mx-auto mt-4 max-w-2xl text-lg text-foreground-secondary transition-all duration-500 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Stop paying for scattered tools that don&apos;t talk to each other.
            PhotoProOS unifies everything in one photography-specific platform.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr,auto,1fr] lg:gap-12 items-center">
          {/* Before - Scattered Tools */}
          <div
            className={cn(
              "relative rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 lg:p-8",
              "transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full bg-[var(--error)]/10 px-3 py-1 text-sm font-medium text-[var(--error)]">
                Before
              </span>
              <h3 className="mt-3 text-xl font-bold text-foreground">
                The Tool Chaos
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                10+ logins, 10+ bills, endless context switching
              </p>
            </div>

            {/* Tool Grid */}
            <div className="grid grid-cols-5 gap-2" role="list" aria-label="Tools replaced by PhotoProOS">
              {replacedTools.map((tool, index) => (
                <div
                  key={tool.name}
                  className={cn(
                    "group relative flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 transition-all",
                    "hover:border-[var(--border-visible)] hover:shadow-sm",
                    isVisible ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                    transitionDuration: "500ms",
                  }}
                  role="listitem"
                >
                  <div className="flex h-8 w-8 items-center justify-center text-foreground-muted" aria-hidden="true">
                    {tool.icon}
                  </div>
                  <span className="mt-1 text-[10px] font-medium text-foreground-muted text-center leading-tight">
                    {tool.name}
                  </span>
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                    <div className="whitespace-nowrap rounded-lg bg-[var(--background-elevated)] px-3 py-2 text-xs shadow-lg border border-[var(--border)]">
                      <span className="font-medium text-foreground">{tool.category}</span>
                      <span className="ml-2 text-foreground-muted">{tool.monthlyPrice}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Summary */}
            <div className="mt-6 rounded-xl bg-[var(--error)]/5 border border-[var(--error)]/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Monthly cost</span>
                <span className="text-2xl font-bold text-[var(--error)]">
                  ${totalMonthlyCost}+
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                Plus hours wasted switching between apps
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div
            className={cn(
              "flex items-center justify-center transition-all duration-700 delay-300",
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}
            aria-hidden="true"
          >
            <div className="flex h-12 w-12 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] text-white shadow-lg shadow-[var(--primary)]/25">
              <ArrowRightIcon className="h-6 w-6 lg:h-8 lg:w-8" />
            </div>
          </div>

          {/* After - PhotoProOS */}
          <div
            className={cn(
              "relative rounded-2xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--primary)]/5 p-6 lg:p-8",
              "transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="mb-6">
              <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-3 py-1 text-sm font-medium text-[var(--success)]">
                After
              </span>
              <h3 className="mt-3 text-xl font-bold text-foreground">
                PhotoProOS
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                One login, one bill, everything connected
              </p>
            </div>

            {/* Unified Platform Visual */}
            <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--background)] p-4" aria-hidden="true">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--ai)]">
                  <PhotoProOSIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">PhotoProOS</div>
                  <div className="text-xs text-foreground-muted">All-in-one platform</div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Galleries",
                  "Payments",
                  "CRM",
                  "Contracts",
                  "Scheduling",
                  "Email",
                  "Analytics",
                  "Automation",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 rounded-lg bg-[var(--primary)]/5 px-3 py-2"
                  >
                    <CheckIcon className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span className="text-xs font-medium text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="mt-6 rounded-xl bg-[var(--success)]/5 border border-[var(--success)]/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Monthly cost</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[var(--success)]">$49</span>
                  <span className="ml-2 text-sm text-foreground-muted line-through">${totalMonthlyCost}+</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-[var(--success)]">
                Save ${totalMonthlyCost - 49}+ per month
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className={cn(
            "mt-12 text-center transition-all duration-700 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-[#0A0A0A] hover:bg-white/90 shadow-lg"
          >
            <Link href="/sign-up">
              Replace Your Stack
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-foreground-muted">
            Start free. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

// Icons
function GalleryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CRMIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function AccountingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.732 6.232a2.5 2.5 0 0 1 3.536 0 .75.75 0 1 0 1.06-1.06A4 4 0 0 0 6.5 8v.165c0 .364.034.728.1 1.085h-.35a.75.75 0 0 0 0 1.5h.737a5.25 5.25 0 0 0 3.477 3.813.75.75 0 1 0 .474-1.423 3.75 3.75 0 0 1-2.486-2.39h2.298a.75.75 0 0 0 0-1.5H8.061A4.26 4.26 0 0 1 8 8.165V8a2.5 2.5 0 0 1 .732-1.768Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function ContractIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6Z" clipRule="evenodd" />
    </svg>
  );
}

function ProjectIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v13A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5V8.914a1.5 1.5 0 0 0-.44-1.06l-4.414-4.415A1.5 1.5 0 0 0 12.086 3H3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function FormIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z" clipRule="evenodd" />
    </svg>
  );
}

function AutomationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function PhotoProOSIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
      <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3H4.5a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
  );
}
