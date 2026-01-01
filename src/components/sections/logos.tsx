"use client";

import * as React from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { AnimatedCounter } from "@/hooks/use-count-animation";

// Stats to display - Pre-launch messaging
const stats = [
  { value: 5, label: "Free galleries to start", suffix: "" },
  { value: 0, label: "Platform fees on payments", suffix: "%" },
  { value: 1, label: "Platform for everything", suffix: "" },
  { value: 24, label: "Hour gallery setup", suffix: "hr" },
];

// Photography specialties we support
const photographyTypes = [
  "Real Estate",
  "Architecture",
  "Commercial",
  "Events",
  "Portraits",
  "Food & Product",
];

export function LogosSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="relative z-10 border-t border-[var(--card-border)] bg-[var(--background)] py-12 lg:py-16">
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        {/* Stats Row */}
        <div className="mb-10 grid gap-8 border-b border-[var(--card-border)] pb-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(20px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: `${index * 150}ms`,
              }}
            >
              <div className="text-3xl font-bold text-foreground lg:text-4xl">
                <AnimatedCounter
                  end={stat.value}
                  duration={2000}
                  suffix={stat.suffix}
                  isVisible={isVisible}
                />
              </div>
              <div className="mt-1 text-sm text-foreground-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Photography Types */}
        <div className="relative overflow-hidden">
          <p
            className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-foreground-muted"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 500ms ease-out 300ms",
            }}
          >
            Built for every photography specialty
          </p>

          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-10 z-10 hidden h-12 w-24 bg-gradient-to-r from-[var(--background)] to-transparent lg:block" />
          <div className="pointer-events-none absolute right-0 top-10 z-10 hidden h-12 w-24 bg-gradient-to-l from-[var(--background)] to-transparent lg:block" />

          <div
            className="flex flex-wrap items-center justify-center gap-4 lg:flex-nowrap lg:gap-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 700ms ease-out 400ms",
            }}
          >
            {photographyTypes.map((type, index) => (
              <div
                key={type}
                className="group flex shrink-0 items-center rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "none" : "translateY(15px) scale(0.95)",
                  transition: "opacity 500ms ease-out, transform 500ms ease-out",
                  transitionDelay: `${400 + index * 80}ms`,
                }}
              >
                <span className="text-sm font-medium text-foreground-secondary transition-colors duration-300 group-hover:text-foreground">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Benefits */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-[var(--card-border)] pt-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 700ms ease-out 600ms",
          }}
        >
          <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <CheckIcon className="h-4 w-4 text-[var(--success)]" />
            <span className="text-sm text-foreground-secondary">No credit card required</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <CheckIcon className="h-4 w-4 text-[var(--success)]" />
            <span className="text-sm text-foreground-secondary">Free tier forever</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <CheckIcon className="h-4 w-4 text-[var(--success)]" />
            <span className="text-sm text-foreground-secondary">Setup in minutes</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <CheckIcon className="h-4 w-4 text-[var(--success)]" />
            <span className="text-sm text-foreground-secondary">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
