"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import type { CtaContent } from "@/lib/landing-content";

interface CtaVariantProps {
  content: CtaContent;
}

export function CtaVariant({ content }: CtaVariantProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="relative py-20 lg:py-28 bg-gradient-to-br from-[var(--primary)] to-[var(--ai)]"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div
            className={cn(
              "mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {content.badge}
          </div>

          <h2
            className={cn(
              "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl transition-all duration-500 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-white/70">{content.headline.muted}</span>{" "}
            <span className="text-white">{content.headline.emphasis}</span>
          </h2>
          <p
            className={cn(
              "mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80 transition-all duration-500 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {content.subheadline}
          </p>

          {/* CTA Buttons */}
          <div
            className={cn(
              "mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-500 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Button
              size="lg"
              asChild
              className="h-12 w-full bg-white text-[var(--primary)] hover:bg-white/90 px-8 text-base font-medium shadow-lg sm:w-auto"
            >
              <Link href="/sign-up">
                {content.primaryCta}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 w-full border-white/30 text-white hover:bg-white/10 px-8 text-base sm:w-auto"
            >
              <Link href="/demo">{content.secondaryCta}</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div
            className={cn(
              "mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60 transition-all duration-500 delay-400",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-white/80" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-white/80" />
              <span>Free tier forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-white/80" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
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
