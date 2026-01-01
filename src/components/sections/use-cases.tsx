"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  features: string[];
  color: string;
}

const useCases: UseCase[] = [
  {
    id: "real-estate",
    title: "Real Estate",
    description: "Deliver property listings to agents and brokerages with seamless integration into their workflow.",
    icon: HomeIcon,
    features: [
      "MLS-ready delivery",
      "Agent branding options",
      "Virtual tour integration",
      "Bulk listing packages",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "commercial",
    title: "Commercial",
    description: "Brand photography, product shots, and corporate imaging delivered with professional polish.",
    icon: BuildingIcon,
    features: [
      "Brand asset libraries",
      "Usage rights tracking",
      "Revision workflows",
      "Team collaboration",
    ],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "architecture",
    title: "Architecture & Interiors",
    description: "High-end property and design portfolio delivery for architects and designers.",
    icon: ArchitectureIcon,
    features: [
      "Portfolio presentations",
      "Print-ready exports",
      "Project organization",
      "Designer collaboration",
    ],
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "events",
    title: "Events & Corporate",
    description: "Conferences, galas, and corporate event coverage with easy attendee access.",
    icon: CalendarIcon,
    features: [
      "Face recognition search",
      "Attendee self-service",
      "Event landing pages",
      "Social media sharing",
    ],
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "headshots",
    title: "Headshots & Portraits",
    description: "Professional portraits and team photography with individual delivery options.",
    icon: UserIcon,
    features: [
      "Individual links",
      "Retouching add-ons",
      "Corporate packages",
      "LinkedIn-ready sizing",
    ],
    color: "from-rose-500 to-red-500",
  },
  {
    id: "food",
    title: "Food & Hospitality",
    description: "Restaurant, hotel, and culinary photography with menu and marketing integrations.",
    icon: FoodIcon,
    features: [
      "Menu integration",
      "Seasonal collections",
      "Marketing bundles",
      "Social media crops",
    ],
    color: "from-yellow-500 to-amber-500",
  },
];

function UseCaseCard({ useCase, isActive, onClick }: { useCase: UseCase; isActive: boolean; onClick: () => void }) {
  const IconComponent = useCase.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start rounded-xl border p-5 text-left transition-all duration-300",
        "hover:shadow-lg hover:shadow-black/20",
        isActive
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        {/* Icon */}
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-105",
          useCase.color
        )}>
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Plus/Minus indicator */}
        <div className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all duration-200",
          isActive
            ? "bg-[var(--primary)]/10 text-[var(--primary)]"
            : "bg-[var(--background-elevated)] text-foreground-muted"
        )}>
          {isActive ? (
            <MinusIcon className="h-3.5 w-3.5" />
          ) : (
            <PlusIcon className="h-3.5 w-3.5" />
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-base font-semibold text-foreground">{useCase.title}</h3>

      {/* Description */}
      <p className="mt-1 text-sm text-foreground-secondary line-clamp-2">{useCase.description}</p>

      {/* Features - expandable with animation */}
      <div className={cn(
        "w-full grid transition-all duration-300 ease-in-out",
        isActive ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
      )}>
        <div className="overflow-hidden">
          <ul className="space-y-1.5 pt-3 border-t border-[var(--card-border)]">
            {useCase.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-foreground-secondary">
                <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
}

// Icons for expandable state
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" />
    </svg>
  );
}

export function UseCasesSection() {
  const [activeCase, setActiveCase] = React.useState("real-estate");
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="use-cases" ref={ref} className="relative z-10 py-20 lg:py-32">
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-3 py-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--primary)]">For Every Specialty</span>
          </div>
          <h2
            className="mx-auto max-w-3xl text-3xl font-medium leading-tight tracking-[-1px] lg:text-4xl lg:leading-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            <span className="text-foreground-secondary">Built for</span>{" "}
            <span className="text-foreground">your photography vertical</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-base text-foreground-secondary lg:text-lg"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "200ms",
            }}
          >
            PhotoProOS automatically configures the best features and workflows for your industry.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.id}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(40px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: `${300 + index * 100}ms`,
              }}
            >
              <UseCaseCard
                useCase={useCase}
                isActive={activeCase === useCase.id}
                onClick={() => setActiveCase(useCase.id)}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-12 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "900ms",
          }}
        >
          <p className="text-foreground-secondary">
            Don't see your specialty?{" "}
            <a href="/contact" className="font-medium text-[var(--primary)] hover:underline">
              Contact us
            </a>{" "}
            - we're adding new verticals regularly.
          </p>
        </div>
      </div>
    </section>
  );
}

// Icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.43Z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-.75V3.75a.75.75 0 0 0 0-1.5h-15ZM9 6a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm-.75 3.75A.75.75 0 0 1 9 9h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM9 12a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm3.75-5.25A.75.75 0 0 1 13.5 6H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM13.5 9a.75.75 0 0 0 0 1.5H15a.75.75 0 0 0 0-1.5h-1.5Zm-.75 3.75a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM9 19.5v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 19.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ArchitectureIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 3.901 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
      <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74A49.109 49.109 0 0 1 12 9c2.59 0 5.134.202 7.616.592a.75.75 0 0 1 .634.74Zm-7.5 2.418a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Zm3-.75a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75ZM9 12.75a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
}

function FoodIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M15 7.5c0-.828.448-1.5 1-1.5s1 .672 1 1.5v8c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5v-8ZM12 7.5c0-.828.448-1.5 1-1.5s1 .672 1 1.5v8c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5v-8ZM12.75 19.25a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5ZM3.75 6A.75.75 0 0 1 4.5 5.25h4.5a.75.75 0 0 1 0 1.5H6v11.5h3a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75V6Z" />
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
