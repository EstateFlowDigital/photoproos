"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { PhoneMockup } from "@/components/landing/device-mockup";

// ============================================
// CLIENT EXPERIENCE SECTION
// ============================================

export function ClientExperienceSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="relative z-10 py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 30% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
              radial-gradient(ellipse 60% 50% at 70% 60%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Phone mockup with gallery UI */}
          <div
            className="relative flex justify-center lg:justify-start"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateX(-40px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
            }}
          >
            <PhoneMockup>
              <ClientGalleryDemo />
            </PhoneMockup>

            {/* Floating badges */}
            <div
              className={cn(
                "absolute -right-4 top-20 hidden lg:block transition-all duration-700 delay-300",
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              )}
            >
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <HeartIcon className="h-4 w-4 text-[var(--error)]" />
                  <span className="text-xs font-medium text-foreground">Favorited</span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "absolute -left-4 bottom-32 hidden lg:block transition-all duration-700 delay-500",
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              )}
            >
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <DownloadIcon className="h-4 w-4 text-[var(--success)]" />
                  <span className="text-xs font-medium text-foreground">Downloaded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(20px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: "100ms",
              }}
            >
              <span className="text-sm text-foreground-secondary">
                Built for <span className="font-medium text-[var(--primary)]">your clients</span>
              </span>
            </div>

            <h2
              className="text-3xl font-medium leading-tight tracking-[-1px] lg:text-4xl lg:leading-tight"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "200ms",
              }}
            >
              <span className="text-foreground">Your clients will</span>{" "}
              <span className="text-foreground-muted">love it too</span>
            </h2>

            <p
              className="mt-4 text-foreground-secondary leading-relaxed lg:text-lg"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "300ms",
              }}
            >
              Beautiful, branded galleries that make it easy for clients to browse, favorite,
              pay, and download their photos—all in one seamless experience.
            </p>

            {/* Steps */}
            <div
              className="mt-8 space-y-4"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "400ms",
              }}
            >
              {journeySteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all duration-200 hover:border-[var(--border-hover)]"
                >
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    step.color
                  )}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                    <p className="mt-0.5 text-sm text-foreground-secondary">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div
              className="mt-8 flex items-center gap-8"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "500ms",
              }}
            >
              <div>
                <p className="text-3xl font-bold text-foreground">98%</p>
                <p className="text-sm text-foreground-muted">Client satisfaction</p>
              </div>
              <div className="h-12 w-px bg-[var(--border)]" />
              <div>
                <p className="text-3xl font-bold text-foreground">&lt;2min</p>
                <p className="text-sm text-foreground-muted">Average checkout time</p>
              </div>
              <div className="h-12 w-px bg-[var(--border)] hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-3xl font-bold text-foreground">4.9/5</p>
                <p className="text-sm text-foreground-muted">Gallery rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// CLIENT GALLERY DEMO (Phone Screen Content)
// ============================================

function ClientGalleryDemo() {
  return (
    <div className="h-full bg-[var(--background)] text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <div>
          <p className="text-[10px] text-foreground-muted uppercase tracking-wider">Gallery</p>
          <p className="text-sm font-medium">Sunset Wedding</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-[var(--background-elevated)] p-1.5">
            <HeartIcon className="h-4 w-4 text-foreground-muted" />
          </button>
          <button className="rounded-md bg-[var(--background-elevated)] p-1.5">
            <ShareIcon className="h-4 w-4 text-foreground-muted" />
          </button>
        </div>
      </div>

      {/* Photo grid */}
      <div className="p-2">
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-md overflow-hidden relative",
                i === 0 && "col-span-2 row-span-2"
              )}
            >
              <div
                className="h-full w-full bg-gradient-to-br"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${getGradientColor(i)} 0%, ${getGradientColor(i + 3)} 100%)`,
                }}
              />
              {/* Favorite indicator on some */}
              {[0, 3, 5].includes(i) && (
                <div className="absolute bottom-1 right-1 rounded bg-black/50 p-0.5">
                  <HeartIcon className="h-3 w-3 text-[var(--error)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--card-border)] bg-[var(--card)] p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-foreground-muted">Selected</p>
            <p className="text-sm font-medium">3 photos</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground-muted">Total</p>
            <p className="text-sm font-bold text-[var(--success)]">$45.00</p>
          </div>
        </div>
        <button className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-white">
          Download Selected
        </button>
      </div>
    </div>
  );
}

function getGradientColor(index: number): string {
  const colors = [
    "rgba(139, 92, 246, 0.6)",
    "rgba(59, 130, 246, 0.6)",
    "rgba(236, 72, 153, 0.6)",
    "rgba(34, 197, 94, 0.6)",
    "rgba(249, 115, 22, 0.6)",
    "rgba(6, 182, 212, 0.6)",
  ];
  return colors[index % colors.length];
}

// ============================================
// JOURNEY STEPS DATA
// ============================================

const journeySteps = [
  {
    icon: MailIcon,
    title: "Receive gallery link",
    description: "Clients get a beautiful, branded email with their gallery link",
    color: "bg-gradient-to-br from-[var(--primary)] to-blue-600",
  },
  {
    icon: HeartIcon,
    title: "Browse & favorite",
    description: "Easy-to-use gallery with favorites, search, and filtering",
    color: "bg-gradient-to-br from-[var(--error)] to-rose-600",
  },
  {
    icon: CreditCardIcon,
    title: "Pay securely",
    description: "One-click checkout with Stripe—no account required",
    color: "bg-gradient-to-br from-[var(--ai)] to-purple-600",
  },
  {
    icon: DownloadIcon,
    title: "Download instantly",
    description: "High-resolution downloads ready immediately after payment",
    color: "bg-gradient-to-br from-[var(--success)] to-emerald-600",
  },
];

// ============================================
// ICONS
// ============================================

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}
