"use client";

import * as React from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { AnimatedCounter } from "@/hooks/use-count-animation";

// Stats to display
const stats = [
  { value: 2500, label: "Professional photographers", suffix: "+" },
  { value: 150000, label: "Galleries delivered", suffix: "+" },
  { value: 12, label: "Million in payments processed", prefix: "$", suffix: "M+" },
  { value: 98, label: "Customer satisfaction", suffix: "%" },
];

// Featured photography studios/businesses (placeholder names)
const featuredStudios = [
  "Chen Real Estate Media",
  "Mitchell Events Co.",
  "Okonkwo Architectural",
  "Park Portraits",
  "Studio Lumina",
  "Apex Visual",
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
                {stat.prefix && <span>{stat.prefix}</span>}
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

        {/* Featured Studios */}
        <div className="relative overflow-hidden">
          <p
            className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-foreground-muted"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 500ms ease-out 300ms",
            }}
          >
            Trusted by photographers at
          </p>

          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-10 z-10 hidden h-12 w-24 bg-gradient-to-r from-[var(--background)] to-transparent lg:block" />
          <div className="pointer-events-none absolute right-0 top-10 z-10 hidden h-12 w-24 bg-gradient-to-l from-[var(--background)] to-transparent lg:block" />

          <div
            className="flex flex-wrap items-center justify-center gap-6 lg:flex-nowrap lg:gap-12"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 700ms ease-out 400ms",
            }}
          >
            {featuredStudios.map((studio, index) => (
              <div
                key={studio}
                className="group flex shrink-0 items-center"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "none" : "translateY(15px) scale(0.95)",
                  transition: "opacity 500ms ease-out, transform 500ms ease-out",
                  transitionDelay: `${400 + index * 80}ms`,
                }}
              >
                <span className="text-lg font-medium text-foreground-muted transition-colors duration-300 group-hover:text-foreground">
                  {studio}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Awards / Recognition */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-[var(--card-border)] pt-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 700ms ease-out 600ms",
          }}
        >
          <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-foreground-secondary">4.9/5 on G2</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-foreground-secondary">4.8/5 on Capterra</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <AwardIcon className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-sm text-foreground-secondary">Best Photo Delivery Software 2024</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
    </svg>
  );
}

function AwardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1c-1.828 0-3.623.149-5.371.435a.75.75 0 0 0-.629.74v.387c-.827.157-1.642.345-2.445.564a.75.75 0 0 0-.552.698 5 5 0 0 0 4.503 5.152 6 6 0 0 0 2.946 1.822A6.451 6.451 0 0 1 7.768 13H7.5A1.5 1.5 0 0 0 6 14.5V17h-.75a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5H14v-2.5a1.5 1.5 0 0 0-1.5-1.5h-.268a6.453 6.453 0 0 1-.684-2.202 6 6 0 0 0 2.946-1.822 5 5 0 0 0 4.503-5.152.75.75 0 0 0-.552-.698A31.804 31.804 0 0 0 16 2.562v-.387a.75.75 0 0 0-.629-.74A33.227 33.227 0 0 0 10 1ZM2.525 4.422a30.324 30.324 0 0 1 1.475-.29V6.63a3.5 3.5 0 0 1-1.475-2.208Zm14.95 0a3.5 3.5 0 0 1-1.475 2.208V4.132c.507.085 1 .181 1.475.29Z" clipRule="evenodd" />
    </svg>
  );
}
