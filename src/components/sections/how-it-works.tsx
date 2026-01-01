"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  features: string[];
  color: string;
  demo: React.ReactNode;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Upload & Organize",
    description: "Drag and drop your photos, and PhotoProOS handles the rest. Automatic organization, smart albums, and instant delivery-ready galleries.",
    icon: UploadIcon,
    features: ["Bulk upload support", "Auto-organization", "Smart tagging", "RAW + JPEG support"],
    color: "from-blue-500 to-cyan-500",
    demo: <UploadDemo />,
  },
  {
    number: "02",
    title: "Set Pricing & Share",
    description: "Choose free delivery or set your prices. Generate beautiful, branded gallery links to share with clients in seconds.",
    icon: ShareIcon,
    features: ["Custom pricing", "Branded galleries", "Password protection", "Expiration dates"],
    color: "from-purple-500 to-pink-500",
    demo: <ShareDemo />,
  },
  {
    number: "03",
    title: "Get Paid & Deliver",
    description: "Clients pay securely, downloads unlock automatically. Track everything from your dashboard—no chasing invoices.",
    icon: PaymentIcon,
    features: ["Instant payments", "Auto-delivery", "Payment tracking", "Tax reports"],
    color: "from-green-500 to-emerald-500",
    demo: <PaymentDemo />,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = React.useState(0);
  const { ref, isVisible } = useScrollAnimation();

  // Auto-rotate steps
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="relative z-10 py-20 lg:py-32 overflow-hidden">
      {/* Background */}
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
          <p
            className="mb-4 font-mono text-sm uppercase tracking-wider text-[var(--primary)]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(20px)",
              transition: "opacity 600ms ease-out, transform 600ms ease-out",
            }}
          >
            Simple as 1-2-3
          </p>
          <h2
            className="mx-auto max-w-3xl text-4xl font-medium leading-tight tracking-[-1px] text-foreground lg:text-5xl lg:leading-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateY(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "100ms",
            }}
          >
            From shoot to payment in minutes
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
            No more juggling tools. Upload, price, share—and get paid. It really is that simple.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left: Step Cards */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = activeStep === index;

              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "group relative w-full rounded-xl border p-6 text-left transition-all duration-300",
                    isActive
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg shadow-[var(--primary)]/10"
                      : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)] hover:bg-[var(--background-secondary)]"
                  )}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "none" : "translateX(-30px)",
                    transition: "opacity 600ms ease-out, transform 600ms ease-out, background 300ms, border-color 300ms, box-shadow 300ms",
                    transitionDelay: `${300 + index * 100}ms`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number */}
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white transition-transform duration-300",
                        step.color,
                        isActive && "scale-110"
                      )}
                    >
                      {step.number}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                        <IconComponent className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-[var(--primary)]" : "text-foreground-muted"
                        )} />
                      </div>
                      <p className="text-sm text-foreground-secondary">{step.description}</p>

                      {/* Features - always visible but opacity controlled to prevent layout shift */}
                      <div
                        className={cn(
                          "mt-4 transition-opacity duration-300",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <div className="flex flex-wrap gap-2">
                          {step.features.map((feature, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-[var(--background-elevated)] px-3 py-1 text-xs text-foreground-secondary"
                            >
                              <CheckIcon className="h-3 w-3 text-[var(--success)]" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-xl bg-[var(--background-elevated)]">
                        <div
                          className="h-full bg-[var(--primary)] animate-progress-bar"
                          style={{ animationDuration: "5s" }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Interactive Demo */}
          <div
            className="relative"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : "translateX(30px)",
              transition: "opacity 700ms ease-out, transform 700ms ease-out",
              transitionDelay: "500ms",
            }}
          >
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl shadow-black/20">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 rounded-md bg-[var(--background)] px-3 py-1 text-center text-xs text-foreground-muted">
                  app.photoproos.com
                </div>
              </div>

              {/* Demo Content */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      activeStep === index
                        ? "opacity-100 translate-x-0"
                        : activeStep > index
                          ? "opacity-0 -translate-x-full"
                          : "opacity-0 translate-x-full"
                    )}
                  >
                    {step.demo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Demo Components
function UploadDemo() {
  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      {/* Upload Area */}
      <div className="flex-1 p-6">
        <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-visible)] bg-[var(--background-secondary)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10">
            <UploadIcon className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <p className="mb-2 text-sm font-medium text-foreground">Drop photos here</p>
          <p className="text-xs text-foreground-muted">or click to browse</p>
        </div>
      </div>

      {/* Upload Progress */}
      <div className="border-t border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-foreground">Uploading 24 photos...</span>
          <span className="text-[var(--primary)]">67%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--background-elevated)]">
          <div className="h-full w-2/3 rounded-full bg-[var(--primary)] animate-pulse" />
        </div>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-12 rounded-lg bg-[var(--background-secondary)] animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--background-secondary)] text-xs text-foreground-muted">
            +20
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareDemo() {
  return (
    <div className="flex h-full flex-col bg-[var(--background)] p-6">
      {/* Gallery Preview */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">Smith Wedding Gallery</h4>
          <p className="text-xs text-foreground-muted">248 photos • 2.4 GB</p>
        </div>
        <span className="rounded-full bg-[var(--success)]/10 px-2 py-1 text-xs font-medium text-[var(--success)]">
          Ready to share
        </span>
      </div>

      {/* Pricing Options */}
      <div className="mb-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground-muted">Pricing</p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 transition-colors hover:border-[var(--primary)]">
            <div className="h-4 w-4 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]" />
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">Per-photo pricing</span>
              <span className="ml-2 text-sm text-foreground-muted">$5/photo</span>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 opacity-60">
            <div className="h-4 w-4 rounded-full border-2 border-[var(--border-visible)]" />
            <span className="text-sm text-foreground">Full gallery: $299</span>
          </label>
        </div>
      </div>

      {/* Share Link */}
      <div className="mt-auto rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
        <p className="mb-2 text-xs font-medium text-[var(--primary)]">Share link</p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-[var(--background)] px-3 py-2 text-sm text-foreground-muted">
            gallery.photoproos.com/smith-wedding
          </div>
          <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentDemo() {
  return (
    <div className="flex h-full flex-col bg-[var(--background)] p-6">
      {/* Payment Notification */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/5 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--success)]/10">
          <CheckIcon className="h-5 w-5 text-[var(--success)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Payment received!</p>
          <p className="text-xs text-foreground-muted">Sarah Smith paid $299.00</p>
        </div>
        <span className="text-lg font-bold text-[var(--success)]">$299</span>
      </div>

      {/* Recent Activity */}
      <div className="flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground-muted">Today's Activity</p>
        <div className="space-y-3">
          {[
            { name: "Sarah Smith", action: "Paid $299", time: "Just now", icon: PaymentIcon, color: "text-[var(--success)]" },
            { name: "John Davis", action: "Viewed gallery", time: "5m ago", icon: EyeIcon, color: "text-[var(--primary)]" },
            { name: "Emily Chen", action: "Downloaded 12 photos", time: "1h ago", icon: DownloadIcon, color: "text-purple-400" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className={cn("h-4 w-4", item.color)} />
              <div className="flex-1">
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="text-sm text-foreground-muted"> • {item.action}</span>
              </div>
              <span className="text-xs text-foreground-muted">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Revenue", value: "$1,247" },
          { label: "Views", value: "342" },
          { label: "Downloads", value: "89" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-[var(--card)] p-3 text-center">
            <div className="text-lg font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-foreground-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Icons
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
    </svg>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
      <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}
