"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoModal } from "@/components/ui/video-modal";
import { AnalyticsDashboardMockup } from "@/components/landing";
import type { HomepageHeroContent } from "@/lib/validations/marketing-cms";

// ============================================
// HERO CONTENT DEFAULTS
// ============================================

const defaultHeroContent: HomepageHeroContent = {
  badge: "Complete platform",
  badgeHighlight: "Photography-specific, all-in-one",
  titleMuted: "The Business OS for",
  titleMain: "Professional Photographers",
  subtitle: "From booking to delivery to marketing—one platform that handles it all. Operate. Deliver. Get Paid. Grow. Automate.",
  primaryCta: { label: "Start Free", href: "/signup", variant: "primary" },
  secondaryCta: { label: "Take the Tour", href: "#", variant: "outline" },
  socialProof: [
    { id: "1", text: "Replaces 10+ tools" },
    { id: "2", text: "6 photography verticals" },
    { id: "3", text: "AI-powered automation" },
  ],
};

interface HeroAnalyticsSectionProps {
  content?: Partial<HomepageHeroContent>;
}

// ============================================
// ANIMATED GRID BACKGROUND
// Uses CSS variables that automatically switch between dark/light mode
// ============================================

function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid pattern - uses CSS variables for theme-aware colors */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      {/* Accent grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line-accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line-accent) 1px, transparent 1px)
          `,
          backgroundSize: "256px 256px",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}

// ============================================
// HERO ANALYTICS SECTION
// ============================================

export function HeroAnalyticsSection({ content }: HeroAnalyticsSectionProps = {}) {
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);

  // Merge provided content with defaults
  const hero = { ...defaultHeroContent, ...content };

  return (
    <section className="relative z-10 overflow-hidden bg-background pb-8 lg:pb-16">
      <GridBackground />

      {/* Gradient accent - top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px]">
        <div
          className="absolute left-1/2 top-0 h-full w-full max-w-[1600px] -translate-x-1/2"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -10%, var(--grid-gradient-from) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 10%, var(--grid-gradient-to) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-24 lg:px-8 lg:pt-28 xl:px-12">
        {/* Text content */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="hero-animate hero-animate-1 mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
            </span>
            <span className="text-sm text-foreground-secondary">
              <span className="font-medium text-[var(--primary)]">{hero.badge}</span>
              {hero.badgeHighlight && ` — ${hero.badgeHighlight}`}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-animate hero-animate-2 text-[36px] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[44px] md:text-[56px] lg:text-[64px]">
            {hero.titleMuted && (
              <>
                <span className="text-foreground-muted">{hero.titleMuted}</span>
                <br />
              </>
            )}
            <span className="text-foreground">{hero.titleMain}</span>
          </h1>

          {/* Subheadline */}
          <p className="hero-animate hero-animate-3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground-secondary lg:text-xl">
            {hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="hero-animate hero-animate-4 mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button variant="default" size="lg" asChild className="h-12 px-8 text-base w-full sm:w-auto shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/30 transition-shadow">
              <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
            </Button>
            {hero.secondaryCta && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsVideoModalOpen(true)}
                className="h-12 px-8 text-base w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <PlayIcon className="h-4 w-4" aria-hidden="true" />
                {hero.secondaryCta.label}
              </Button>
            )}
          </div>

          {/* Social proof */}
          {hero.socialProof && hero.socialProof.length > 0 && (
            <div className="hero-animate hero-animate-5 mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-foreground-muted">
              {hero.socialProof.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <div className="hidden sm:block h-4 w-px bg-[var(--border)]" />}
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                    <span>{item.text}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard mockup */}
        <div className="hero-animate hero-animate-6 mt-10 lg:mt-14">
          <AnalyticsDashboardMockup animate />
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </section>
  );
}

// ============================================
// ICONS
// ============================================

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9.555 7.168A1 1 0 0 0 8 8v4a1 1 0 0 0 1.555.832l3-2a1 1 0 0 0 0-1.664l-3-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
