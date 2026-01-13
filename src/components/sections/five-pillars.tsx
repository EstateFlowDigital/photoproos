"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

/**
 * Five Pillars Section
 *
 * Interactive tabbed section showcasing the 5 pillars of PhotoProOS:
 * Operate, Deliver, Get Paid, Grow, Automate
 *
 * Accessibility: Full keyboard navigation, ARIA labels, focus management
 * Responsive: Mobile-first with horizontal scroll on small screens
 */

interface Pillar {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const pillars: Pillar[] = [
  {
    id: "operate",
    title: "Operate",
    description: "Run your photography business with a complete CRM, project management, and client communication tools.",
    icon: <OperateIcon />,
    features: [
      "Client & lead management",
      "Project tracking & workflows",
      "Calendar & scheduling",
      "Team collaboration",
    ],
    color: "var(--primary)",
  },
  {
    id: "deliver",
    title: "Deliver",
    description: "Share stunning galleries with clients through beautiful, branded delivery experiences.",
    icon: <DeliverIcon />,
    features: [
      "Branded client galleries",
      "Pay-to-unlock downloads",
      "Proofing & selections",
      "Bulk download & sharing",
    ],
    color: "var(--ai)",
  },
  {
    id: "get-paid",
    title: "Get Paid",
    description: "Accept payments, send invoices, and collect deposits automatically with Stripe integration.",
    icon: <GetPaidIcon />,
    features: [
      "Stripe payment processing",
      "Automated invoicing",
      "Deposits & payment plans",
      "Financial reporting",
    ],
    color: "var(--success)",
  },
  {
    id: "grow",
    title: "Grow",
    description: "Attract new clients and expand your business with built-in marketing and analytics tools.",
    icon: <GrowIcon />,
    features: [
      "Email marketing campaigns",
      "Client referral tracking",
      "Review collection",
      "Business analytics",
    ],
    color: "var(--warning)",
  },
  {
    id: "automate",
    title: "Automate",
    description: "Save 15+ hours per week by automating repetitive tasks with AI-powered workflows.",
    icon: <AutomateIcon />,
    features: [
      "Automated email sequences",
      "Smart reminders & follow-ups",
      "AI photo culling",
      "Workflow templates",
    ],
    color: "var(--error)",
  },
];

export function FivePillarsSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const tabListRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const { ref, isVisible } = useScrollAnimation();

  // Handle tab change with transition
  const handleTabChange = (newIndex: number) => {
    if (newIndex === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        newIndex = (index + 1) % pillars.length;
        break;
      case "ArrowLeft":
        event.preventDefault();
        newIndex = (index - 1 + pillars.length) % pillars.length;
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = pillars.length - 1;
        break;
      default:
        return;
    }

    handleTabChange(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  const activePillar = pillars[activeIndex];

  return (
    <section
      ref={ref}
      className="relative z-10 py-20 lg:py-28 bg-[var(--background)]"
      aria-labelledby="five-pillars-heading"
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
              Complete Platform
            </span>
          </div>
          <h2
            id="five-pillars-heading"
            className={cn(
              "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl transition-all duration-500 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-foreground/60">One platform.</span>{" "}
            <span className="text-foreground">Five pillars.</span>
          </h2>
          <p
            className={cn(
              "mx-auto mt-4 max-w-2xl text-lg text-foreground-secondary transition-all duration-500 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Everything you need to run a successful photography business, organized
            into five integrated pillars.
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Platform pillars"
          className={cn(
            "mb-8 lg:mb-12 flex justify-start lg:justify-center overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 transition-all duration-500 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="flex gap-2">
            {pillars.map((pillar, index) => (
              <button
                key={pillar.id}
                ref={(el) => { tabRefs.current[index] = el; }}
                role="tab"
                id={`pillar-tab-${pillar.id}`}
                aria-selected={activeIndex === index}
                aria-controls={`pillar-panel-${pillar.id}`}
                tabIndex={activeIndex === index ? 0 : -1}
                onClick={() => handleTabChange(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  activeIndex === index
                    ? "bg-white text-[#0A0A0A] shadow-lg"
                    : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-elevated)] border border-[var(--card-border)] hover:border-[var(--border-visible)]"
                )}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center"
                  style={{ color: activeIndex === index ? pillar.color : pillar.color }}
                  aria-hidden="true"
                >
                  {pillar.icon}
                </span>
                {pillar.title}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panels */}
        <div
          className={cn(
            "relative transition-all duration-500 delay-400",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {pillars.map((pillar, index) => (
            <div
              key={pillar.id}
              id={`pillar-panel-${pillar.id}`}
              role="tabpanel"
              aria-labelledby={`pillar-tab-${pillar.id}`}
              hidden={activeIndex !== index}
              tabIndex={0}
              className={cn(
                "rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 lg:p-10 transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isTransitioning ? "opacity-0 scale-[0.99]" : "opacity-100 scale-100"
              )}
            >
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Content */}
                <div className="flex flex-col justify-center">
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${pillar.color}15` }}
                    aria-hidden="true"
                  >
                    <span
                      className="h-6 w-6"
                      style={{ color: pillar.color }}
                    >
                      {pillar.icon}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground lg:text-3xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-foreground-secondary leading-relaxed">
                    {pillar.description}
                  </p>
                  <ul className="mt-6 space-y-3" role="list">
                    {pillar.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3 text-foreground"
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${pillar.color}20` }}
                          aria-hidden="true"
                        >
                          <CheckIcon
                            className="h-3 w-3"
                            style={{ color: pillar.color }}
                          />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Mockup */}
                <div className="relative">
                  <div
                    className="aspect-[4/3] rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] overflow-hidden"
                    aria-hidden="true"
                  >
                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: `linear-gradient(135deg, ${pillar.color} 0%, transparent 60%)`,
                      }}
                    />
                    {/* Mockup content placeholder */}
                    <div className="relative h-full w-full p-4 lg:p-6">
                      <PillarMockup pillar={pillar} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div
          className={cn(
            "mt-8 flex justify-center gap-2 transition-all duration-500 delay-500",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          role="presentation"
        >
          {pillars.map((pillar, index) => (
            <button
              key={pillar.id}
              onClick={() => handleTabChange(index)}
              aria-label={`Go to ${pillar.title}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                activeIndex === index
                  ? "w-8 bg-white"
                  : "w-2 bg-[var(--border-visible)] hover:bg-foreground-muted"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Pillar Mockup Component - Shows relevant UI for each pillar
function PillarMockup({ pillar }: { pillar: Pillar }) {
  const mockupContent = {
    operate: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--primary)]/20" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-24 rounded bg-foreground/20" />
            <div className="h-2 w-32 rounded bg-foreground/10" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg border border-[var(--border)] bg-[var(--card)] p-2"
            >
              <div className="h-2 w-8 rounded bg-foreground/20 mb-2" />
              <div className="h-6 w-full rounded bg-[var(--primary)]/10" />
            </div>
          ))}
        </div>
        <div className="h-24 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="h-2 w-20 rounded bg-foreground/20 mb-2" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[var(--primary)]/30" />
                <div className="h-2 flex-1 rounded bg-foreground/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    deliver: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-gradient-to-br from-[var(--ai)]/20 to-[var(--primary)]/10"
            />
          ))}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="space-y-1">
            <div className="h-2 w-16 rounded bg-foreground/20" />
            <div className="h-3 w-12 rounded bg-[var(--ai)]/30" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-[var(--ai)] flex items-center justify-center">
            <span className="text-[10px] font-medium text-white">Download</span>
          </div>
        </div>
      </div>
    ),
    "get-paid": (
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="h-2 w-16 rounded bg-foreground/20" />
            <div className="h-4 w-12 rounded bg-[var(--success)]/20 flex items-center justify-center">
              <span className="text-[8px] text-[var(--success)]">Paid</span>
            </div>
          </div>
          <div className="text-lg font-bold text-foreground">$2,450.00</div>
        </div>
        <div className="h-20 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="flex h-full items-end gap-1">
            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-[var(--success)]/30"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    grow: (
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="text-xl font-bold text-foreground">847</div>
            <div className="h-2 w-16 rounded bg-foreground/10 mt-1" />
          </div>
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="text-xl font-bold text-[var(--success)]">+23%</div>
            <div className="h-2 w-16 rounded bg-foreground/10 mt-1" />
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="h-2 w-24 rounded bg-foreground/20 mb-3" />
          <div className="space-y-2">
            {[80, 60, 45].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 rounded bg-[var(--warning)]/30" style={{ width: `${w}%` }} />
                <span className="text-[10px] text-foreground-muted">{w}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    automate: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="h-6 w-6 rounded-full bg-[var(--error)]/20 flex items-center justify-center">
            <span className="text-[10px]">1</span>
          </div>
          <div className="h-px flex-1 border-t border-dashed border-[var(--border-visible)]" />
          <div className="h-6 w-6 rounded-full bg-[var(--error)]/20 flex items-center justify-center">
            <span className="text-[10px]">2</span>
          </div>
          <div className="h-px flex-1 border-t border-dashed border-[var(--border-visible)]" />
          <div className="h-6 w-6 rounded-full bg-[var(--error)]/20 flex items-center justify-center">
            <span className="text-[10px]">3</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["Trigger", "Action", "Delay", "Email"].map((label) => (
            <div
              key={label}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-center"
            >
              <span className="text-[10px] text-foreground-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return mockupContent[pillar.id as keyof typeof mockupContent] || null;
}

// Icons
function OperateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
      <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
    </svg>
  );
}

function DeliverIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function GetPaidIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function GrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" />
    </svg>
  );
}

function AutomateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-full w-full">
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} style={style}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
