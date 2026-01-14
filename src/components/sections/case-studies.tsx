"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { CaseStudyMetricsDemo } from "@/components/landing/interactive-demos";

/**
 * Case Studies Section
 *
 * Showcases real results from photographers using PhotoProOS.
 * Features industry filtering and metric highlights.
 *
 * Accessibility: Keyboard navigation, ARIA labels, focus management
 * Responsive: Grid adjusts from 1 to 3 columns based on viewport
 */

interface CaseStudy {
  id: string;
  name: string;
  business: string;
  industry: string;
  industrySlug: string;
  avatar: string;
  quote: string;
  metrics: {
    label: string;
    value: string;
    change?: string;
  }[];
  href: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: "sarah-real-estate",
    name: "Sarah Chen",
    business: "Chen Real Estate Media",
    industry: "Real Estate",
    industrySlug: "real-estate",
    avatar: "SC",
    quote: "I went from spending 20 hours a week on admin to just 5. PhotoProOS automated everything from delivery to payments.",
    metrics: [
      { label: "Time saved weekly", value: "15 hrs", change: "+75%" },
      { label: "Revenue increase", value: "40%", change: "YoY" },
      { label: "Clients served", value: "200+", change: "/month" },
    ],
    href: "/case-studies/chen-real-estate-media",
  },
  {
    id: "marcus-commercial",
    name: "Marcus Johnson",
    business: "Johnson Commercial Studios",
    industry: "Commercial",
    industrySlug: "commercial",
    avatar: "MJ",
    quote: "The branded client portal made us look 10x more professional. Enterprise clients now see us as a serious partner.",
    metrics: [
      { label: "Contract value", value: "$5K", change: "avg" },
      { label: "Client retention", value: "95%", change: "" },
      { label: "Projects/month", value: "25+", change: "" },
    ],
    href: "/case-studies/johnson-commercial-studios",
  },
  {
    id: "emily-events",
    name: "Emily Rodriguez",
    business: "Rodriguez Event Photography",
    industry: "Events",
    industrySlug: "events",
    avatar: "ER",
    quote: "Collecting payments used to be a nightmare. Now clients pay before downloading. My collection rate went to 100%.",
    metrics: [
      { label: "Collection rate", value: "100%", change: "" },
      { label: "Payment time", value: "< 24hr", change: "avg" },
      { label: "Revenue/event", value: "+35%", change: "" },
    ],
    href: "/case-studies/rodriguez-event-photography",
  },
];

const industries = [
  { label: "All", slug: "all" },
  { label: "Real Estate", slug: "real-estate" },
  { label: "Commercial", slug: "commercial" },
  { label: "Events", slug: "events" },
  { label: "Architecture", slug: "architecture" },
  { label: "Portraits", slug: "portraits" },
];

export function CaseStudiesSection() {
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const filterRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const { ref, isVisible } = useScrollAnimation();

  const filteredStudies =
    activeFilter === "all"
      ? caseStudies
      : caseStudies.filter((study) => study.industrySlug === activeFilter);

  // Handle keyboard navigation for filters
  const handleFilterKeyDown = (event: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        newIndex = (index + 1) % industries.length;
        break;
      case "ArrowLeft":
        event.preventDefault();
        newIndex = (index - 1 + industries.length) % industries.length;
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = industries.length - 1;
        break;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    filterRefs.current[newIndex]?.focus();
  };

  return (
    <section
      ref={ref}
      className="relative z-10 py-20 lg:py-28 bg-[var(--background)]"
      aria-labelledby="case-studies-heading"
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
              Success Stories
            </span>
          </div>
          <h2
            id="case-studies-heading"
            className={cn(
              "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl transition-all duration-500 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-foreground/60">Real results from</span>{" "}
            <span className="text-foreground">real photographers.</span>
          </h2>
          <p
            className={cn(
              "mx-auto mt-4 max-w-2xl text-lg text-foreground-secondary transition-all duration-500 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            See how photographers across every vertical are growing their business
            with PhotoProOS.
          </p>
        </div>

        {/* Industry Filters */}
        <div
          role="tablist"
          aria-label="Filter case studies by industry"
          className={cn(
            "mb-10 flex justify-center overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 transition-all duration-500 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="flex gap-2">
            {industries.map((industry, index) => {
              const count =
                industry.slug === "all"
                  ? caseStudies.length
                  : caseStudies.filter((s) => s.industrySlug === industry.slug).length;

              return (
                <button
                  key={industry.slug}
                  ref={(el) => { filterRefs.current[index] = el; }}
                  role="tab"
                  aria-selected={activeFilter === industry.slug}
                  aria-controls="case-studies-grid"
                  tabIndex={activeFilter === industry.slug ? 0 : -1}
                  onClick={() => setActiveFilter(industry.slug)}
                  onKeyDown={(e) => handleFilterKeyDown(e, index)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    activeFilter === industry.slug
                      ? "bg-foreground text-background shadow-md"
                      : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-elevated)] border border-[var(--card-border)] hover:border-[var(--border-visible)]"
                  )}
                >
                  {industry.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs",
                        activeFilter === industry.slug
                          ? "bg-background/10 text-background"
                          : "bg-foreground/10 text-foreground-muted"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Case Study with Interactive Metrics */}
        <div
          className={cn(
            "mb-10 transition-all duration-500 delay-350",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <p className="text-sm font-medium text-foreground-muted mb-4 text-center">Featured Success Story</p>
          <CaseStudyMetricsDemo
            photographer={{
              name: "Sarah Chen",
              business: "Chen Real Estate Media",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
              beforeMetrics: { revenue: "$4.2K", hours: "20/wk", tools: "7 apps" },
              afterMetrics: { revenue: "$7.1K", hours: "5/wk", tools: "1 app" },
              quote: "PhotoProOS transformed my entire workflow. I went from juggling 7 different tools to running everything from one dashboard.",
            }}
          />
        </div>

        {/* Case Studies Grid */}
        <div
          id="case-studies-grid"
          role="tabpanel"
          aria-label={`${activeFilter === "all" ? "All" : industries.find((i) => i.slug === activeFilter)?.label} case studies`}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredStudies.length > 0 ? (
            filteredStudies.map((study, index) => (
              <CaseStudyCard
                key={study.id}
                study={study}
                index={index}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-foreground-muted">
                No case studies found for this industry yet.
              </p>
              <p className="mt-2 text-sm text-foreground-muted">
                Check back soon or view all case studies.
              </p>
            </div>
          )}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            View all case studies
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

interface CaseStudyCardProps {
  study: CaseStudy;
  index: number;
}

function CaseStudyCard({ study, index }: CaseStudyCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6",
        "transition-all duration-300 hover:border-[var(--border-visible)] hover:shadow-lg",
        "focus-within:ring-2 focus-within:ring-[var(--ring)]"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Industry Badge */}
      <span className="absolute right-6 top-6 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
        {study.industry}
      </span>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] text-sm font-bold text-white"
          aria-hidden="true"
        >
          {study.avatar}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{study.name}</h3>
          <p className="text-sm text-foreground-muted">{study.business}</p>
        </div>
      </div>

      {/* Quote */}
      <blockquote className="mt-4 flex-1">
        <p className="text-foreground-secondary leading-relaxed">
          &ldquo;{study.quote}&rdquo;
        </p>
      </blockquote>

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-6">
        {study.metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <div className="text-lg font-bold text-foreground">
              {metric.value}
            </div>
            <div className="mt-0.5 text-xs text-foreground-muted">
              {metric.label}
            </div>
            {metric.change && (
              <div className="mt-1 text-xs font-medium text-[var(--success)]">
                {metric.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Read More Link */}
      <Link
        href={study.href}
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline focus:outline-none"
        aria-label={`Read ${study.name}'s full case study`}
      >
        Read full story
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

// Icons
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
