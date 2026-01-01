"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface SecurityFeature {
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

const securityFeatures: SecurityFeature[] = [
  {
    title: "256-bit SSL Encryption",
    description: "All data is encrypted in transit using bank-level TLS 1.3 encryption.",
    icon: LockIcon,
  },
  {
    title: "SOC 2 Type II Certified",
    description: "Independently audited security controls and data protection practices.",
    icon: ShieldIcon,
  },
  {
    title: "GDPR Compliant",
    description: "Full compliance with EU data protection regulations and privacy laws.",
    icon: GlobeIcon,
  },
  {
    title: "99.9% Uptime SLA",
    description: "Enterprise-grade infrastructure with redundancy across multiple regions.",
    icon: ServerIcon,
  },
  {
    title: "Automated Backups",
    description: "Your galleries are backed up daily with 30-day retention and instant recovery.",
    icon: CloudIcon,
  },
  {
    title: "Two-Factor Auth",
    description: "Protect your account with TOTP or SMS-based two-factor authentication.",
    icon: KeyIcon,
  },
];

const certifications = [
  { name: "SOC 2", badge: "Type II" },
  { name: "GDPR", badge: "Compliant" },
  { name: "CCPA", badge: "Compliant" },
  { name: "ISO 27001", badge: "Certified" },
];

export function SecuritySection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="security" ref={ref} className="relative z-10 py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/3 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
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
                <span className="font-medium text-[var(--primary)]">SOC 2</span> certified security
              </span>
            </div>
            <h2
              className="mb-6 text-4xl font-medium leading-tight tracking-[-1px] lg:text-5xl lg:leading-tight"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "100ms",
              }}
            >
              <span className="text-foreground">Your photos are</span>{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">safe with us</span>
            </h2>
            <p
              className="mb-8 text-lg text-foreground-secondary"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "200ms",
              }}
            >
              We take security seriously. Your images are encrypted, backed up, and protected by the same infrastructure used by Fortune 500 companies.
            </p>

            {/* Certifications */}
            <div
              className="mb-8 flex flex-wrap gap-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(20px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: "300ms",
              }}
            >
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="flex items-center gap-2 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/5 px-4 py-2"
                >
                  <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
                  <span className="text-sm font-medium text-foreground">{cert.name}</span>
                  <span className="rounded bg-[var(--success)]/20 px-1.5 py-0.5 text-xs font-medium text-[var(--success)]">
                    {cert.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-4"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(20px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
                transitionDelay: "400ms",
              }}
            >
              {[
                { value: "0", label: "Data breaches" },
                { value: "99.9%", label: "Uptime" },
                { value: "24/7", label: "Monitoring" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground lg:text-3xl">{stat.value}</div>
                  <div className="text-sm text-foreground-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Features Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all duration-300 hover:border-[var(--success)]/30 hover:bg-[var(--success)]/5"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "none" : "translateY(30px)",
                    transition: "opacity 500ms ease-out, transform 500ms ease-out, background 300ms, border-color 300ms",
                    transitionDelay: `${300 + index * 80}ms`,
                  }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10 transition-colors group-hover:bg-[var(--success)]/20">
                    <IconComponent className="h-5 w-5 text-[var(--success)]" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-foreground-secondary">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Banner */}
        <div
          className="mt-16 rounded-2xl border border-[var(--card-border)] bg-gradient-to-r from-[var(--card)] to-[var(--background-secondary)] p-8 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            transitionDelay: "800ms",
          }}
        >
          <p className="mb-4 text-lg text-foreground">
            <strong className="text-foreground">2,500+ photographers</strong> trust PhotoProOS with their work
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-foreground-muted">
            <span className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-[var(--success)]" />
              Your photos are never sold or shared
            </span>
            <span className="flex items-center gap-2">
              <LockIcon className="h-4 w-4 text-[var(--success)]" />
              You retain 100% ownership
            </span>
            <span className="flex items-center gap-2">
              <TrashIcon className="h-4 w-4 text-[var(--success)]" />
              Delete anytime, we'll remove everything
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Icons
function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z" />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.08 5.227A3 3 0 0 1 6.979 3H17.02a3 3 0 0 1 2.9 2.227l2.113 7.926A5.228 5.228 0 0 0 18.75 12H5.25a5.228 5.228 0 0 0-3.284 1.153L4.08 5.227Z" />
      <path fillRule="evenodd" d="M5.25 13.5a3.75 3.75 0 1 0 0 7.5h13.5a3.75 3.75 0 1 0 0-7.5H5.25Zm10.5 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm3.75-.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0 1 11.573-2.226 3.75 3.75 0 0 1 4.133 4.303A4.5 4.5 0 0 1 18 20.25H6.75a5.25 5.25 0 0 1-2.23-10.004 6.072 6.072 0 0 1-.02-.496Z" clipRule="evenodd" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
    </svg>
  );
}
