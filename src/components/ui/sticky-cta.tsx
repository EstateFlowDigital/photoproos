"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StickyCTA() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasScrolledPast, setHasScrolledPast] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 600px (past hero section)
      const scrolled = window.scrollY > 600;
      setHasScrolledPast(scrolled);

      // Small delay to prevent flickering
      if (scrolled && !isVisible) {
        setIsVisible(true);
      } else if (!scrolled && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      {/* Gradient blur backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/95 to-transparent backdrop-blur-sm" />

      <div className="relative mx-auto max-w-[1512px] px-6 py-4 lg:px-[124px]">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Value prop */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
              <span>5 free galleries</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
              <span>No credit card required</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-foreground-secondary">
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
              <span>Set up in minutes</span>
            </div>
          </div>

          {/* Mobile value prop */}
          <div className="flex sm:hidden items-center gap-2 text-sm text-foreground-secondary">
            <span className="font-medium text-foreground">Start free today</span>
            <span className="text-foreground-muted">•</span>
            <span>No credit card</span>
          </div>

          {/* Right side - CTA button */}
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-[#0A0A0A] transition-all duration-200 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start free trial</span>
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />

            {/* Shimmer effect */}
            <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] opacity-0 blur-xl transition-opacity group-hover:opacity-50" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}
