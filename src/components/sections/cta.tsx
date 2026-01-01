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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
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
            <span className="text-foreground">Ready to run your photography</span>{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">business like a pro?</span>
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
            Stop juggling Dropbox, PayPal, and spreadsheets. Get galleries, payments, clients, and scheduling in one platform.
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
              <Link href="/dashboard">
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

          {/* Trust badges */}
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "500ms",
            }}
          >
            <div className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/50 px-3 py-2">
              <StripeIcon className="h-5 w-5" />
              <span className="text-xs text-foreground-muted">Powered by Stripe</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/50 px-3 py-2">
              <ShieldIcon className="h-5 w-5 text-[var(--success)]" />
              <span className="text-xs text-foreground-muted">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/50 px-3 py-2">
              <LockIcon className="h-5 w-5 text-[var(--primary)]" />
              <span className="text-xs text-foreground-muted">SOC 2 Compliant</span>
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

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" fill="#635BFF"/>
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  );
}
