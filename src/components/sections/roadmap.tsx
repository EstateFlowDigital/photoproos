"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface RoadmapPhase {
  phase: string;
  title: string;
  status: "completed" | "in-progress" | "upcoming" | "planned";
  description: string;
  items: { title: string; icon: React.FC<{ className?: string }> }[];
}

const roadmapPhases: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    title: "Core Platform",
    status: "completed",
    description: "The foundation of your photography business - galleries, payments, clients, and bookings.",
    items: [
      { title: "Client Galleries & Delivery", icon: GalleryIcon },
      { title: "Payment Processing", icon: PaymentIcon },
      { title: "Client Management", icon: ClientIcon },
      { title: "Booking & Scheduling", icon: CalendarIcon },
      { title: "Services & Pricing", icon: ContractIcon },
    ],
  },
  {
    phase: "Phase 2",
    title: "Property Websites & Client Portal",
    status: "in-progress",
    description: "Single property websites, client portals, and auto-generated marketing materials.",
    items: [
      { title: "Single Property Websites", icon: WebsiteIcon },
      { title: "Client Portal", icon: ClientIcon },
      { title: "Marketing Kit Generator", icon: PipelineIcon },
      { title: "Traffic Analytics", icon: AnalyticsIcon },
    ],
  },
  {
    phase: "Phase 3",
    title: "Marketing Hub",
    status: "upcoming",
    description: "Email campaigns, social media management, and marketing automations.",
    items: [
      { title: "Email Marketing", icon: EmailIcon },
      { title: "Content Calendar", icon: CalendarIcon },
      { title: "Social Media Manager", icon: TeamIcon },
      { title: "Referral Program", icon: LocationIcon },
    ],
  },
  {
    phase: "Phase 4",
    title: "Analytics Hub",
    status: "planned",
    description: "Deep business insights, revenue forecasting, and custom reporting.",
    items: [
      { title: "Business Metrics", icon: AnalyticsIcon },
      { title: "Revenue Forecasting", icon: ExpenseIcon },
      { title: "Client Insights", icon: ClientIcon },
      { title: "Custom Reports", icon: ContractIcon },
    ],
  },
  {
    phase: "Phase 5",
    title: "Website Builder",
    status: "planned",
    description: "Build your photography portfolio and business website without code.",
    items: [
      { title: "Portfolio Builder", icon: GalleryIcon },
      { title: "Blog & Content", icon: ContractIcon },
      { title: "SEO Tools", icon: AnalyticsIcon },
      { title: "Custom Domains", icon: WebsiteIcon },
    ],
  },
];

const statusConfig = {
  "completed": {
    label: "Completed",
    bg: "bg-[var(--success)]/10",
    text: "text-[var(--success)]",
    icon: CheckCircleIcon,
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-[var(--primary)]/10",
    text: "text-[var(--primary)]",
    icon: SpinnerIcon,
  },
  "upcoming": {
    label: "Coming Soon",
    bg: "bg-[var(--warning)]/10",
    text: "text-[var(--warning)]",
    icon: ClockIcon,
  },
  "planned": {
    label: "Planned",
    bg: "bg-[var(--border)]",
    text: "text-foreground-muted",
    icon: CalendarIcon,
  },
};

function PhaseCard({ phase, index }: { phase: RoadmapPhase; index: number }) {
  const config = statusConfig[phase.status];
  const StatusIcon = config.icon;

  return (
    <div className={cn(
      "relative rounded-xl border bg-[var(--card)] p-6 transition-all duration-300",
      "hover:shadow-lg hover:shadow-black/20",
      phase.status === "completed" && "border-[var(--success)]/30",
      phase.status === "in-progress" && "border-[var(--primary)]/30",
      phase.status === "upcoming" && "border-[var(--warning)]/30",
      phase.status === "planned" && "border-[var(--card-border)]"
    )}>
      {/* Timeline connector */}
      {index < roadmapPhases.length - 1 && (
        <div className="absolute bottom-0 left-1/2 top-full h-6 w-px -translate-x-1/2 bg-[var(--card-border)]" />
      )}

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
            config.bg,
            config.text
          )}>
            {index + 1}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">{phase.phase}</p>
            <h3 className="text-lg font-semibold text-foreground">{phase.title}</h3>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium", config.bg, config.text)}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-foreground-secondary">{phase.description}</p>

      {/* Feature Items */}
      <div className="flex flex-wrap gap-2">
        {phase.items.map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--background-secondary)] px-3 py-1.5 text-xs text-foreground-secondary"
            >
              <ItemIcon className="h-3.5 w-3.5" />
              {item.title}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function RoadmapSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="roadmap" ref={ref} className="relative z-10 py-20 lg:py-32">
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
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
              <span className="font-medium text-[var(--primary)]">5 phases</span> to complete business OS
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
            <span className="text-foreground">Our</span>{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">product roadmap</span>
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "200ms",
            }}
          >
            Building the complete business operating system for professional photographers, one phase at a time.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="mx-auto max-w-3xl space-y-6">
          {roadmapPhases.map((phase, index) => (
            <div
              key={phase.phase}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(40px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: `${300 + index * 100}ms`,
              }}
            >
              <PhaseCard phase={phase} index={index} />
            </div>
          ))}
        </div>

        {/* Feature Request CTA */}
        <div
          className="mt-12 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "1000ms",
          }}
        >
          <p className="mb-4 text-foreground-secondary">
            Have a feature request? We'd love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-[var(--background-elevated)] hover:shadow-lg"
          >
            <MessageIcon className="h-4 w-4" />
            Submit a feature request
          </a>
        </div>
      </div>
    </section>
  );
}

// Icons
function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PipelineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h1.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H15.5A1.5 1.5 0 0 1 17 5.5v1.879a1.5 1.5 0 0 1-.44 1.06l-1.12 1.122a1.5 1.5 0 0 0-.44 1.06V15.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 15.5V5a1.5 1.5 0 0 1-1-1.5Z" clipRule="evenodd" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function TeamIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
    </svg>
  );
}

function ExpenseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.798 7.45c.512-.67 1.135-.95 1.702-.95s1.19.28 1.702.95a.75.75 0 0 0 1.192-.91C12.637 5.55 11.596 5 10.5 5s-2.137.55-2.894 1.54A5.205 5.205 0 0 0 6.83 8H6a.75.75 0 0 0 0 1.5h.56a6.143 6.143 0 0 0-.04.5c0 .168.006.335.017.5H6a.75.75 0 0 0 0 1.5h.646a5.205 5.205 0 0 0 .776 1.46c.757.99 1.798 1.54 2.894 1.54s2.137-.55 2.894-1.54a.75.75 0 0 0-1.192-.91c-.512.67-1.135.95-1.702.95s-1.19-.28-1.702-.95a3.505 3.505 0 0 1-.343-.55h1.644a.75.75 0 0 0 0-1.5H8.024a4.645 4.645 0 0 1-.024-.5c0-.168.008-.335.024-.5h2.291a.75.75 0 0 0 0-1.5H8.455c.085-.2.19-.39.343-.55Z" clipRule="evenodd" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.151-.043l4.25-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={cn("animate-spin", className)}>
      <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.681.75.75 0 0 1-1.264-.808 6 6 0 0 1 9.44-.908l.84.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44.908l-.84-.84v1.68a.75.75 0 0 1-1.5 0v-3.182a.75.75 0 0 1 .75-.75h3.182a.75.75 0 0 1 0 1.5h-1.37l.84.84a4.5 4.5 0 0 0 7.08-.681.75.75 0 0 1 1.274.432Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-11.25a.75.75 0 0 0-1.5 0v3.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 0-1.5h-1.75v-2.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 6a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7Z" clipRule="evenodd" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.102 41.102 0 0 1-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 0 1-1.33 0l-1.713-3.293a.783.783 0 0 0-.642-.413 41.108 41.108 0 0 1-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902Z" clipRule="evenodd" />
    </svg>
  );
}

function WebsiteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM4.332 8.027a6.012 6.012 0 0 1 1.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 0 1 9 7.5V8a2 2 0 0 0 4 0 2 2 0 0 1 1.523-1.943 5.977 5.977 0 0 1 .923 3.902 5.97 5.97 0 0 1-1.446.03A2 2 0 0 0 12 12v1a2 2 0 0 0 1.586 1.956c-.092.064-.185.126-.28.186-.94.595-1.974.957-3.057 1.074a6.02 6.02 0 0 1-.748-2.966V12a2 2 0 0 0-2-2H6a5.997 5.997 0 0 1-1.668-1.973Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}
