"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { AnimatedCounter } from "@/hooks/use-count-animation";
import type { HomepageLogosContent } from "@/lib/validations/marketing-cms";

// ============================================
// LOGOS SECTION DEFAULTS
// ============================================

const defaultLogosContent: HomepageLogosContent = {
  stats: [
    { id: "1", value: 10, label: "Tools replaced", suffix: "+" },
    { id: "2", value: 0, label: "Platform fees", suffix: "%" },
    { id: "3", value: 5, label: "Free galleries", suffix: "" },
    { id: "4", value: 24, label: "Hour support", suffix: "/7" },
  ],
  typesLabel: "Built for every photography specialty",
  photographyTypes: [
    { id: "1", name: "Real Estate", icon: "home" },
    { id: "2", name: "Architecture", icon: "building" },
    { id: "3", name: "Commercial", icon: "briefcase" },
    { id: "4", name: "Events", icon: "calendar" },
    { id: "5", name: "Portraits", icon: "user" },
    { id: "6", name: "Food & Product", icon: "camera" },
  ],
  benefits: [
    "No credit card required",
    "Free tier forever",
    "Setup in minutes",
    "Cancel anytime",
  ],
};

// Icon mapping for photography types
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  home: HomeIcon,
  building: BuildingIcon,
  briefcase: BriefcaseIcon,
  calendar: CalendarIcon,
  user: UserIcon,
  camera: CameraIcon,
};

interface LogosSectionProps {
  content?: Partial<HomepageLogosContent>;
}

export function LogosSection({ content }: LogosSectionProps = {}) {
  // Merge provided content with defaults
  const logos = {
    ...defaultLogosContent,
    ...content,
    stats: content?.stats || defaultLogosContent.stats,
    photographyTypes: content?.photographyTypes || defaultLogosContent.photographyTypes,
    benefits: content?.benefits || defaultLogosContent.benefits,
  };
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      aria-label="Platform benefits and supported photography types"
      className="relative z-10 border-t border-[var(--card-border)] bg-[var(--background)] py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div
          role="list"
          aria-label="Platform statistics"
          className="mb-12 grid gap-8 border-b border-[var(--card-border)] pb-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {logos.stats.map((stat, index) => (
            <div
              key={stat.id}
              role="listitem"
              className={cn(
                "text-center transition-all duration-500",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl font-bold text-foreground lg:text-5xl">
                <AnimatedCounter
                  end={stat.value}
                  duration={2000}
                  suffix={stat.suffix || ""}
                  isVisible={isVisible}
                />
              </div>
              <div className="mt-2 text-sm font-medium text-foreground-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Photography Types */}
        <div className="relative">
          <p
            className={cn(
              "mb-6 text-center text-xs font-medium uppercase tracking-widest text-foreground-muted transition-all duration-500 delay-300",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            {logos.typesLabel}
          </p>

          <div
            role="list"
            aria-label="Supported photography specialties"
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {logos.photographyTypes.map((type, index) => {
              const IconComponent = iconMap[type.icon || "camera"] || CameraIcon;
              return (
                <div
                  key={type.id}
                  role="listitem"
                  className={cn(
                    "group flex shrink-0 items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 transition-all duration-300",
                    "hover:border-[var(--border-visible)] hover:bg-[var(--background-elevated)]",
                    isVisible
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-4 scale-95"
                  )}
                  style={{ transitionDelay: `${400 + index * 60}ms` }}
                >
                  <IconComponent className="h-4 w-4 text-foreground-muted transition-colors duration-200 group-hover:text-[var(--primary)]" />
                  <span className="text-sm font-medium text-foreground-secondary transition-colors duration-200 group-hover:text-foreground">
                    {type.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Launch Benefits */}
        <div
          role="list"
          aria-label="Getting started benefits"
          className={cn(
            "mt-12 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--card-border)] pt-10 transition-all duration-500",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: "700ms" }}
        >
          {logos.benefits.map((benefit, index) => (
            <div
              key={benefit}
              role="listitem"
              className={cn(
                "flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 transition-all duration-300",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              )}
              style={{ transitionDelay: `${750 + index * 50}ms` }}
            >
              <CheckIcon className="h-4 w-4 text-[var(--success)]" />
              <span className="text-sm text-foreground-secondary">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// ICONS
// ============================================

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1 0-1.5H4Zm3-11a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-5 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-5 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z" clipRule="evenodd" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
      <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}
