"use client";

import * as React from "react";
import Link from "next/link";
import { GradientButton, ShimmerButton } from "@/components/ui/gradient-button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="relative z-10 overflow-hidden py-20 lg:py-32">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Gradient orbs */}
        <div
          className="absolute -right-64 top-0 h-[600px] w-[600px] animate-gradient-shift rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -left-32 bottom-0 h-[400px] w-[400px] animate-gradient-shift rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)`,
            animationDelay: '-4s',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]"></span>
            </span>
            <span className="text-sm text-foreground-secondary">
              <span className="font-medium text-[var(--primary)]">Free plan</span> available
            </span>
          </div>

          <h2
            className="mb-6 text-4xl font-medium leading-tight tracking-[-1px] lg:text-[56px] lg:leading-[64px]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            <span className="text-foreground-secondary">Ready to run your photography</span>{" "}
            <span className="text-[var(--primary)]">business like a pro?</span>
          </h2>

          <p
            className="mb-10 text-lg text-foreground-secondary lg:text-xl"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "200ms",
            }}
          >
            Join 2,500+ photographers who've upgraded from scattered tools to one unified platform.
            Start free, upgrade when you're ready.
          </p>

          <div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "300ms",
            }}
          >
            <ShimmerButton asChild size="lg" className="px-8 py-4 text-base">
              <Link href="/auth/signup">
                Start free trial
                <ArrowIcon className="ml-2 h-4 w-4" />
              </Link>
            </ShimmerButton>
            <GradientButton
              variant="outline"
              size="lg"
              asChild
              gradient="linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)"
              className="px-8 py-4 text-base"
            >
              <Link href="/demo">Watch demo</Link>
            </GradientButton>
          </div>

          {/* Trust indicators */}
          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-foreground-muted"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "450ms",
            }}
          >
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
              <span>2GB storage included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Comparison teaser */}
          <div
            className="mt-16 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "550ms",
            }}
          >
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-foreground">47%</div>
                <div className="text-sm text-foreground-muted">Average revenue increase</div>
              </div>
              <div className="text-center border-x border-[var(--card-border)] px-6">
                <div className="mb-2 text-3xl font-bold text-foreground">15+ hrs</div>
                <div className="text-sm text-foreground-muted">Saved per week</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-foreground">3x</div>
                <div className="text-sm text-foreground-muted">Faster payments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
  );
}
