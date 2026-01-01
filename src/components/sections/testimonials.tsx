"use client";

import * as React from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  specialty: string;
  avatar: string;
  stats?: {
    label: string;
    value: string;
  };
}

const testimonials: TestimonialProps[] = [
  {
    quote: "PhotoProOS completely transformed my business. I went from juggling Dropbox, PayPal, and spreadsheets to having everything in one place. My clients love the galleries, and I love getting paid on time.",
    author: "Marcus Chen",
    role: "Owner",
    company: "Chen Real Estate Media",
    specialty: "Real Estate Photography",
    avatar: "M",
    stats: {
      label: "Revenue increase",
      value: "+47%",
    },
  },
  {
    quote: "The automated delivery and payment collection has saved me 15+ hours a week. I used to chase invoices for days. Now clients pay before they even download their photos. It's a game-changer.",
    author: "Sarah Mitchell",
    role: "Lead Photographer",
    company: "Mitchell Events Co.",
    specialty: "Events & Corporate",
    avatar: "S",
    stats: {
      label: "Hours saved weekly",
      value: "15+",
    },
  },
  {
    quote: "As an architecture photographer, presentation matters. PhotoProOS galleries are stunning and make my work look even better. My clients think I hired a web designer. I just use PhotoProOS.",
    author: "David Okonkwo",
    role: "Principal",
    company: "Okonkwo Architectural",
    specialty: "Architecture & Interiors",
    avatar: "D",
    stats: {
      label: "Client satisfaction",
      value: "100%",
    },
  },
  {
    quote: "I photograph 20-30 headshot sessions per week. PhotoProOS lets each person get their own private link, pay for their selects, and download instantly. My studio runs itself now.",
    author: "Jennifer Park",
    role: "Studio Owner",
    company: "Park Portraits",
    specialty: "Headshots & Portraits",
    avatar: "J",
    stats: {
      label: "Sessions per week",
      value: "30+",
    },
  },
];

const AUTOPLAY_INTERVAL = 6000; // 6 seconds per testimonial

// Animation directions for testimonial transitions
type Direction = "left" | "right";

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [direction, setDirection] = React.useState<Direction>("right");
  const [isAnimating, setIsAnimating] = React.useState(false);
  const { ref, isVisible } = useScrollAnimation();

  // Handle slide transition with animation
  const handleSlideChange = React.useCallback((newIndex: number, slideDirection: Direction) => {
    if (isAnimating || newIndex === activeIndex) return;

    setIsAnimating(true);
    setDirection(slideDirection);
    setActiveIndex(newIndex);
    setProgress(0);

    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 500);
  }, [activeIndex, isAnimating]);

  // Auto-cycle testimonials
  React.useEffect(() => {
    if (isPaused || isAnimating) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleSlideChange((activeIndex + 1) % testimonials.length, "right");
          return 0;
        }
        return prev + (100 / (AUTOPLAY_INTERVAL / 50));
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isPaused, activeIndex, isAnimating, handleSlideChange]);

  // Reset progress when manually changing testimonial
  const handleSelect = (index: number) => {
    const newDirection = index > activeIndex ? "right" : "left";
    handleSlideChange(index, newDirection);
    setIsPaused(true);
    // Resume after 8 seconds of inactivity
    setTimeout(() => setIsPaused(false), 8000);
  };

  // Avatar gradient colors for each testimonial
  const avatarGradients = [
    "from-blue-400 to-cyan-400",
    "from-purple-400 to-pink-400",
    "from-amber-400 to-orange-400",
    "from-green-400 to-emerald-400",
  ];

  const current = testimonials[activeIndex];

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative z-10 py-20 lg:py-32"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0">
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
      </div>

      <div className="relative mx-auto max-w-[1512px] px-6 lg:px-[124px]">
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
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
            </span>
            <span className="text-sm text-foreground-secondary">
              Trusted by <span className="font-medium text-[var(--primary)]">2,500+</span> photographers
            </span>
          </div>
          <h2
            className="mx-auto max-w-3xl text-4xl font-medium leading-tight tracking-[-1px] lg:text-5xl lg:leading-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            <span className="text-foreground">Real photographers.</span>{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">Real results.</span>
          </h2>
        </div>

        {/* Main testimonial */}
        <div
          className="flex flex-col items-start gap-8 lg:flex-row lg:gap-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(40px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "200ms",
          }}
        >
          {/* Left side - Avatar and stats */}
          <div className="shrink-0 flex flex-col items-center lg:items-start gap-4">
            {/* Avatar with animated gradient */}
            <div
              className={`h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br ${avatarGradients[activeIndex]} lg:h-32 lg:w-32`}
              style={{
                transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isAnimating ? "scale(0.9)" : "scale(1)",
                opacity: isAnimating ? 0.7 : 1,
              }}
            >
              <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-white lg:text-5xl">
                {current.avatar}
              </div>
            </div>

            {/* Stats badge */}
            {current.stats && (
              <div
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-center"
                style={{
                  opacity: isAnimating ? 0 : 1,
                  transform: isAnimating ? "translateY(10px)" : "translateY(0)",
                  transition: "opacity 300ms ease-out, transform 300ms ease-out",
                }}
              >
                <div className="text-2xl font-bold text-[var(--primary)]">{current.stats.value}</div>
                <div className="text-xs text-foreground-muted">{current.stats.label}</div>
              </div>
            )}
          </div>

          {/* Quote content with slide animation - fixed height to prevent layout shift */}
          <div className="relative flex-1 overflow-hidden min-h-[320px] lg:min-h-[280px]">
            <div
              key={activeIndex}
              className="absolute inset-0"
              style={{
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating
                  ? direction === "right"
                    ? "translateX(30px)"
                    : "translateX(-30px)"
                  : "translateX(0)",
                transition: "opacity 400ms ease-out, transform 400ms ease-out",
              }}
            >
              {/* Quote icon */}
              <div className="mb-4 text-[var(--primary)]/20">
                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <blockquote className="mb-8 text-2xl font-medium leading-relaxed text-foreground lg:text-3xl lg:leading-relaxed">
                "{current.quote}"
              </blockquote>

              {/* Author info */}
              <div
                className="flex flex-col gap-2"
                style={{
                  opacity: isAnimating ? 0 : 1,
                  transform: isAnimating ? "translateY(10px)" : "translateY(0)",
                  transition: "opacity 300ms ease-out 100ms, transform 300ms ease-out 100ms",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-foreground">{current.author}</span>
                  <span className="text-foreground-muted">·</span>
                  <span className="text-foreground-secondary">{current.role}, {current.company}</span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm text-foreground-muted">
                  <SpecialtyIcon className="h-4 w-4" />
                  {current.specialty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation with progress indicator */}
        <div className="mt-12 flex items-center justify-center gap-6 lg:justify-end">
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`group relative flex flex-col items-center gap-2 transition-all ${
                index === activeIndex ? 'text-foreground' : 'text-[var(--border-visible)] hover:text-foreground-muted'
              }`}
              aria-label={`View testimonial from ${testimonial.author}`}
            >
              {/* Mini avatar */}
              <div
                className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarGradients[index]} flex items-center justify-center text-sm font-medium text-white transition-all ${
                  index === activeIndex ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]' : 'opacity-50 group-hover:opacity-75'
                }`}
              >
                {testimonial.avatar}
              </div>

              {/* Progress bar for active */}
              {index === activeIndex && (
                <div className="relative h-1 w-10 overflow-hidden rounded-full bg-[var(--border-visible)]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[var(--primary)] transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Trust indicators */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-[var(--card-border)] pt-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "400ms",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-[var(--background)] bg-gradient-to-br from-blue-400 to-purple-400"
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-foreground-secondary">2,500+ photographers</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground-secondary">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span><strong className="text-foreground">4.9/5</strong> from 500+ reviews</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground-secondary">
            <ShieldIcon className="h-5 w-5 text-green-400" />
            <span>SOC 2 Type II Certified</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Icons
function SpecialtyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}
