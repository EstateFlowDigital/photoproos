"use client";

import * as React from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

const benefits = [
  {
    title: "Save 10+ hours per week",
    description: "Automate gallery delivery, invoicing, and follow-ups. Spend less time on admin and more time shooting.",
    icon: ClockIcon,
  },
  {
    title: "Get paid faster",
    description: "Integrated payment processing means no chasing invoices. Clients pay when they download their photos.",
    icon: PaymentIcon,
  },
  {
    title: "Impress your clients",
    description: "Beautiful, branded galleries that make you look professional. White-label everything with your own branding.",
    icon: SparkleIcon,
  },
  {
    title: "Never lose a lead",
    description: "Track every inquiry, booking, and client interaction. Your CRM built specifically for photographers.",
    icon: TargetIcon,
  },
  {
    title: "Scale your business",
    description: "Handle more clients without hiring help. Automation handles the busy work while you focus on growth.",
    icon: GrowthIcon,
  },
];

// Original visualization (kept for reference)
function ToolsVisualization() {
  const tools = [
    { name: "Gallery tool", icon: "📸" },
    { name: "Payment app", icon: "💳" },
    { name: "Email service", icon: "📧" },
    { name: "Calendar", icon: "📅" },
    { name: "Spreadsheets", icon: "📊" },
    { name: "Contracts", icon: "📝" },
  ];

  return (
    <div className="relative h-[400px] w-full lg:h-[500px]">
      {/* "Before" - Scattered tools */}
      <div className="absolute left-0 top-0 w-1/2 pr-4">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-wider text-foreground-muted">Before</p>
        <div className="relative h-[300px]">
          {tools.map((tool, index) => (
            <div
              key={tool.name}
              className="absolute animate-float rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-lg transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-xl motion-reduce:animate-none"
              style={{
                left: `${10 + (index % 3) * 30}%`,
                top: `${15 + Math.floor(index / 3) * 40}%`,
                animationDelay: `${index * 200}ms`,
              }}
            >
              <span className="text-lg">{tool.icon}</span>
              <p className="mt-1 text-xs text-foreground-muted">{tool.name}</p>
            </div>
          ))}
          {/* Chaos lines */}
          <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
            <line x1="30%" y1="25%" x2="60%" y2="35%" stroke="currentColor" strokeDasharray="4 4" />
            <line x1="70%" y1="30%" x2="40%" y2="55%" stroke="currentColor" strokeDasharray="4 4" />
            <line x1="25%" y1="60%" x2="55%" y2="45%" stroke="currentColor" strokeDasharray="4 4" />
            <line x1="65%" y1="65%" x2="35%" y2="80%" stroke="currentColor" strokeDasharray="4 4" />
          </svg>
        </div>
        <p className="text-center text-sm text-[var(--error)]">6+ tools to manage</p>
      </div>

      {/* Arrow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white">
          <ArrowRightIcon className="h-5 w-5" />
        </div>
      </div>

      {/* "After" - PhotoProOS */}
      <div className="absolute right-0 top-0 w-1/2 pl-4">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-wider text-foreground-muted">After</p>
        <div className="relative flex h-[300px] items-center justify-center">
          <div className="animate-pulse-glow-primary rounded-xl border border-[var(--primary)] bg-[var(--card)] p-6 shadow-2xl shadow-[var(--primary)]/20 motion-reduce:animate-none">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600">
                <CameraIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">PhotoProOS</p>
                <p className="text-xs text-foreground-muted">All-in-one platform</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--background-secondary)] text-sm"
                >
                  {tool.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-[var(--success)]">1 simple platform</p>
      </div>
    </div>
  );
}

// Improved vertical stacked visualization (cleaner, less cluttered)
function ImprovedToolsVisualization() {
  const tools = [
    { name: "Gallery", icon: "📸", color: "bg-blue-500/10 text-blue-500" },
    { name: "Payments", icon: "💳", color: "bg-green-500/10 text-green-500" },
    { name: "Email", icon: "📧", color: "bg-purple-500/10 text-purple-500" },
    { name: "Calendar", icon: "📅", color: "bg-amber-500/10 text-amber-500" },
    { name: "Analytics", icon: "📊", color: "bg-pink-500/10 text-pink-500" },
    { name: "Contracts", icon: "📝", color: "bg-cyan-500/10 text-cyan-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Before Section */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-[var(--error)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Before</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool, index) => (
            <div
              key={tool.name}
              className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 animate-float"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <span className="text-lg">{tool.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{tool.name}</p>
                <p className="text-xs text-foreground-muted">Separate tool</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-[var(--error)]">
          6 subscriptions · Multiple logins · No integration
        </p>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30">
          <ArrowDownIcon className="h-5 w-5" />
        </div>
      </div>

      {/* After Section */}
      <div className="rounded-2xl border-2 border-[var(--primary)] bg-[var(--card)] p-6 shadow-xl shadow-[var(--primary)]/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-[var(--success)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">After</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-purple-600 shadow-lg">
            <CameraIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">PhotoProOS</p>
            <p className="text-sm text-foreground-muted">All-in-one platform</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-3",
                tool.color
              )}
            >
              <span className="text-xl">{tool.icon}</span>
              <p className="text-xs font-medium">{tool.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-[var(--success)]">
          1 platform · 1 login · Everything connected
        </p>
      </div>
    </div>
  );
}

export function NoiseToKnowledgeSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { ref, isVisible } = useScrollAnimation();

  // Auto-rotate through benefits
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % benefits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative z-10 py-20 lg:py-32">
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Content */}
          <div>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-3 py-1"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(20px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
              }}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--primary)]">Why PhotoProOS</span>
            </div>
            <h2
              className="mb-6 text-3xl font-medium leading-tight tracking-[-1px] lg:text-4xl lg:leading-tight"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "100ms",
              }}
            >
              <span className="text-foreground">Everything in one place.</span>{" "}
              <span className="text-foreground-secondary">Finally simple.</span>
            </h2>

            <p
              className="mb-6 text-base text-foreground-secondary lg:text-lg"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "200ms",
              }}
            >
              Stop juggling 6 different tools. PhotoProOS brings your galleries, payments,
              clients, and workflows into one beautifully simple platform.
            </p>

            {/* Benefits List with Plus Icons */}
            <div className="space-y-1">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                const isExpanded = index === activeIndex;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full gap-3 rounded-xl p-3 text-left transition-all duration-200",
                      isExpanded
                        ? "bg-[var(--card)] border border-[var(--card-border)]"
                        : "hover:bg-[var(--background-hover)]"
                    )}
                    aria-label={`Learn about ${benefit.title}`}
                    aria-expanded={isExpanded}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "none" : "translateY(20px)",
                      transition: "opacity 500ms ease-out, transform 500ms ease-out, background-color 150ms ease, border-color 150ms ease",
                      transitionDelay: `${300 + index * 100}ms`,
                    }}
                  >
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isExpanded
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "bg-[var(--background-elevated)] text-foreground-muted"
                    )}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={cn(
                          "text-base font-medium transition-colors",
                          isExpanded ? "text-foreground" : "text-foreground-muted hover:text-foreground-secondary"
                        )}>
                          {benefit.title}
                        </h3>
                        {/* Plus/Minus Icon */}
                        <div className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all duration-200",
                          isExpanded
                            ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                            : "bg-[var(--background-elevated)] text-foreground-muted"
                        )}>
                          {isExpanded ? (
                            <MinusIcon className="h-3 w-3" />
                          ) : (
                            <PlusIcon className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-in-out",
                          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="mt-2 text-sm leading-relaxed text-foreground-secondary pr-6">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column - Visualization (Improved Layout) */}
          <div
            className="relative"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(40px)",
              transition: "opacity 800ms ease-out, transform 800ms ease-out",
              transitionDelay: "400ms",
            }}
          >
            <ImprovedToolsVisualization />
          </div>
        </div>
      </div>
    </section>
  );
}

// Icons
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z" clipRule="evenodd" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 8ZM14 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 8ZM7.172 13.889a.75.75 0 0 1-1.061-1.061l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06ZM12.828 10.828a.75.75 0 0 1 1.06 1.06l1.06 1.06a.75.75 0 0 1-1.06 1.062l-1.06-1.061a.75.75 0 0 1 0-1.06ZM10 14a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 14Z" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M17 10a.75.75 0 0 1-.75.75H13.5a.75.75 0 0 1 0-1.5h2.75A.75.75 0 0 1 17 10ZM6.5 10a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.75a.75.75 0 0 1 .75.75ZM10 3a.75.75 0 0 1 .75.75v2.75a.75.75 0 0 1-1.5 0V3.75A.75.75 0 0 1 10 3ZM10 13.5a.75.75 0 0 1 .75.75V17a.75.75 0 0 1-1.5 0v-2.75a.75.75 0 0 1 .75-.75Z" />
      <path fillRule="evenodd" d="M10 4.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM6 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M10 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" clipRule="evenodd" />
    </svg>
  );
}

function GrowthIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    </svg>
  );
}

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
