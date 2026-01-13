"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Sparkline } from "@/components/landing/revenue-chart";

// ============================================
// TYPES
// ============================================

interface Industry {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  headline: string;
  description: string;
  benefits: string[];
  caseStudy: {
    company: string;
    quote: string;
    metric1: { label: string; value: string; change?: string };
    metric2: { label: string; value: string; change?: string };
    metric3: { label: string; value: string };
  };
  color: string;
  image?: string;
}

// ============================================
// INDUSTRY DATA
// ============================================

const industries: Industry[] = [
  {
    id: "real-estate",
    name: "Real Estate",
    icon: HomeIcon,
    headline: "Built for Real Estate Photographers",
    description: "Streamline property delivery with MLS-ready galleries, agent branding, and automated workflows designed for high-volume real estate photography.",
    benefits: [
      "MLS-ready delivery in one click",
      "Agent branding on every gallery",
      "Virtual tour and video integration",
      "Bulk listing packages with smart pricing",
      "Automated broker notifications",
      "Property detail auto-population",
    ],
    caseStudy: {
      company: "Premier Realty Partners",
      quote: "PhotoProOS cut our delivery time in half and agents love the branded galleries.",
      metric1: { label: "Revenue Increase", value: "+47%", change: "vs last year" },
      metric2: { label: "Hours Saved", value: "15/week", change: "on admin tasks" },
      metric3: { label: "Client Satisfaction", value: "98%" },
    },
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "commercial",
    name: "Commercial",
    icon: BuildingIcon,
    headline: "Professional Corporate Photography",
    description: "Deliver brand photography, headshots, and corporate imagery with usage rights tracking, revision workflows, and enterprise-ready features.",
    benefits: [
      "Usage rights and licensing management",
      "Brand asset organization",
      "Batch headshot delivery",
      "Corporate invoice and PO support",
      "Team collaboration tools",
      "Multi-location management",
    ],
    caseStudy: {
      company: "Tech Solutions Inc.",
      quote: "Managing usage rights was a nightmare before PhotoProOS. Now it's automatic.",
      metric1: { label: "Projects Managed", value: "240+", change: "this year" },
      metric2: { label: "Turnaround Time", value: "-60%", change: "faster delivery" },
      metric3: { label: "Invoice Collection", value: "100%" },
    },
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "architecture",
    name: "Architecture",
    icon: ArchitectureIcon,
    headline: "Showcase Architectural Excellence",
    description: "Present architectural and interior photography with portfolio-grade galleries, print-ready exports, and designer collaboration features.",
    benefits: [
      "Portfolio presentation mode",
      "High-resolution print exports",
      "Project-based organization",
      "Designer collaboration access",
      "Award submission packages",
      "Publication-ready delivery",
    ],
    caseStudy: {
      company: "Modern Design Studio",
      quote: "Our portfolio presentations have never looked better. Clients are impressed.",
      metric1: { label: "Portfolio Views", value: "12K", change: "monthly avg" },
      metric2: { label: "Project Win Rate", value: "+35%", change: "increase" },
      metric3: { label: "Print Orders", value: "$8K/mo" },
    },
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "events",
    name: "Events",
    icon: CalendarIcon,
    headline: "Effortless Event Photography",
    description: "Deliver conference, gala, and corporate event photography with face recognition, attendee self-service, and social-ready sharing.",
    benefits: [
      "AI-powered face recognition search",
      "Attendee self-service portals",
      "Event-branded landing pages",
      "Social media auto-cropping",
      "Bulk download for sponsors",
      "Real-time event galleries",
    ],
    caseStudy: {
      company: "Global Events Group",
      quote: "Attendees finding their own photos saved us 20+ hours per event.",
      metric1: { label: "Events Per Year", value: "85+", change: "and growing" },
      metric2: { label: "Time Saved", value: "20hrs", change: "per event" },
      metric3: { label: "Photo Engagement", value: "92%" },
    },
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "portraits",
    name: "Portraits",
    icon: UserIcon,
    headline: "Beautiful Portrait Delivery",
    description: "Deliver professional headshots and family portraits with individual delivery links, retouching add-ons, and print fulfillment integration.",
    benefits: [
      "Individual delivery links",
      "Retouching add-on upsells",
      "Print lab integration",
      "LinkedIn-ready sizing presets",
      "Mini-session booking pages",
      "Family favorites selection",
    ],
    caseStudy: {
      company: "Portrait Studio Pro",
      quote: "Print sales increased 40% after adding one-click ordering to our galleries.",
      metric1: { label: "Print Revenue", value: "+40%", change: "increase" },
      metric2: { label: "Avg Order Value", value: "$285", change: "+$95" },
      metric3: { label: "5-Star Reviews", value: "147" },
    },
    color: "from-rose-500 to-red-500",
  },
  {
    id: "food",
    name: "Food & Hospitality",
    icon: FoodIcon,
    headline: "Delicious Food Photography",
    description: "Deliver restaurant and culinary photography with menu integration, seasonal collections, and marketing-ready export bundles.",
    benefits: [
      "Menu integration exports",
      "Seasonal collection organization",
      "Marketing bundle templates",
      "Social media crop presets",
      "Recipe step organization",
      "Multi-location management",
    ],
    caseStudy: {
      company: "Bella Cucina Restaurant",
      quote: "Our menu photos are always current and perfectly sized for every platform.",
      metric1: { label: "Dishes Photographed", value: "500+", change: "in library" },
      metric2: { label: "Social Engagement", value: "+85%", change: "increase" },
      metric3: { label: "Menu Updates", value: "Same day" },
    },
    color: "from-yellow-500 to-amber-500",
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function IndustryTabsSection() {
  const [activeIndustry, setActiveIndustry] = React.useState("real-estate");
  const { ref, isVisible } = useScrollAnimation();

  const currentIndustry = industries.find((i) => i.id === activeIndustry) || industries[0];

  return (
    <section id="industries" ref={ref} className="relative z-10 py-20 lg:py-32 bg-background">
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
            <span className="text-sm text-foreground-secondary">
              Optimized for <span className="font-medium text-[var(--primary)]">your industry</span>
            </span>
          </div>
          <h2
            className="mx-auto max-w-3xl text-3xl font-medium leading-tight tracking-[-1px] lg:text-4xl lg:leading-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            <span className="text-foreground-muted">Purpose-built for</span>{" "}
            <span className="text-foreground">every photography vertical</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-base text-foreground-secondary lg:text-lg"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "200ms",
            }}
          >
            Select your specialty to see how PhotoProOS adapts to your workflow
          </p>
        </div>

        {/* Tab Navigation - horizontal scroll on mobile, centered on desktop */}
        <div
          className="mb-8 -mx-6 px-6 lg:mx-0 lg:px-0"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(20px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out",
            transitionDelay: "300ms",
          }}
        >
          <div className="flex lg:flex-wrap lg:justify-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => setActiveIndustry(industry.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0",
                  activeIndustry === industry.id
                    ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                    : "bg-[var(--background-elevated)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground border border-[var(--card-border)]"
                )}
              >
                <industry.icon className="h-4 w-4" />
                <span>{industry.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div
          className="relative"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "400ms",
          }}
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left: Content */}
            <div className="order-2 lg:order-1">
              {/* Headline */}
              <div className={cn(
                "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                currentIndustry.color
              )}>
                <currentIndustry.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-foreground lg:text-3xl">
                {currentIndustry.headline}
              </h3>
              <p className="mt-3 text-foreground-secondary leading-relaxed">
                {currentIndustry.description}
              </p>

              {/* Benefits */}
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {currentIndustry.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm">
                    <CheckCircleIcon className="h-5 w-5 shrink-0 text-[var(--success)] mt-0.5" />
                    <span className="text-foreground-secondary leading-snug">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                <Button asChild>
                  <Link href={`/industries/${currentIndustry.id}`}>
                    See {currentIndustry.name} Features
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Case Study Card */}
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 lg:p-8">
                {/* Case study header */}
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Success Story
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-foreground">
                    {currentIndustry.caseStudy.company}
                  </h4>
                </div>

                {/* Quote */}
                <blockquote className="relative mb-6">
                  <QuoteIcon className="absolute -top-2 -left-2 h-8 w-8 text-[var(--primary)] opacity-20" />
                  <p className="pl-6 text-foreground-secondary italic leading-relaxed">
                    "{currentIndustry.caseStudy.quote}"
                  </p>
                </blockquote>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-[var(--card-border)]">
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {currentIndustry.caseStudy.metric1.value}
                    </p>
                    <p className="text-[11px] sm:text-xs text-foreground-muted mt-1 leading-tight">
                      {currentIndustry.caseStudy.metric1.label}
                    </p>
                    {currentIndustry.caseStudy.metric1.change && (
                      <p className="text-[11px] sm:text-xs text-[var(--success)] font-medium mt-0.5">
                        {currentIndustry.caseStudy.metric1.change}
                      </p>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {currentIndustry.caseStudy.metric2.value}
                    </p>
                    <p className="text-[11px] sm:text-xs text-foreground-muted mt-1 leading-tight">
                      {currentIndustry.caseStudy.metric2.label}
                    </p>
                    {currentIndustry.caseStudy.metric2.change && (
                      <p className="text-[11px] sm:text-xs text-[var(--success)] font-medium mt-0.5">
                        {currentIndustry.caseStudy.metric2.change}
                      </p>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {currentIndustry.caseStudy.metric3.value}
                    </p>
                    <p className="text-[11px] sm:text-xs text-foreground-muted mt-1 leading-tight">
                      {currentIndustry.caseStudy.metric3.label}
                    </p>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">Revenue trend</span>
                    <Sparkline color="purple" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div
          className="mt-12 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(20px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out",
            transitionDelay: "600ms",
          }}
        >
          <p className="text-foreground-secondary">
            Don't see your specialty?{" "}
            <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">
              Contact us
            </Link>{" "}
            — we're adding new verticals regularly.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// ICONS
// ============================================

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.43Z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-.75V3.75a.75.75 0 0 0 0-1.5h-15ZM9 6a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm-.75 3.75A.75.75 0 0 1 9 9h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM9 12a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm3.75-5.25A.75.75 0 0 1 13.5 6H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM13.5 9a.75.75 0 0 0 0 1.5H15a.75.75 0 0 0 0-1.5h-1.5Zm-.75 3.75a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM9 19.5v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 19.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ArchitectureIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 3.901 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
      <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74A49.109 49.109 0 0 1 12 9c2.59 0 5.134.202 7.616.592a.75.75 0 0 1 .634.74Zm-7.5 2.418a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Zm3-.75a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75ZM9 12.75a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
}

function FoodIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM8.547 4.505a8.25 8.25 0 1 0 6.906 0 5.251 5.251 0 0 0-6.906 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
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

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
    </svg>
  );
}
