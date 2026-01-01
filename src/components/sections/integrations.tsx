"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface Integration {
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  category: "payment" | "editing" | "storage" | "marketing" | "calendar";
  popular?: boolean;
}

const integrations: Integration[] = [
  {
    name: "Stripe",
    description: "Accept payments securely with instant payouts",
    icon: StripeIcon,
    category: "payment",
    popular: true,
  },
  {
    name: "Adobe Lightroom",
    description: "Publish directly from Lightroom to galleries",
    icon: LightroomIcon,
    category: "editing",
    popular: true,
  },
  {
    name: "Google Drive",
    description: "Backup and sync your galleries automatically",
    icon: GoogleDriveIcon,
    category: "storage",
  },
  {
    name: "Dropbox",
    description: "Import photos directly from your Dropbox",
    icon: DropboxIcon,
    category: "storage",
  },
  {
    name: "Calendly",
    description: "Let clients book shoots directly from galleries",
    icon: CalendlyIcon,
    category: "calendar",
  },
  {
    name: "Mailchimp",
    description: "Sync clients to your email marketing lists",
    icon: MailchimpIcon,
    category: "marketing",
  },
  {
    name: "QuickBooks",
    description: "Automatic invoice sync and accounting",
    icon: QuickBooksIcon,
    category: "payment",
  },
  {
    name: "Zapier",
    description: "Connect to 5,000+ apps with automation",
    icon: ZapierIcon,
    category: "marketing",
    popular: true,
  },
];

const categories = [
  { id: "all", label: "All Integrations" },
  { id: "payment", label: "Payments" },
  { id: "editing", label: "Editing" },
  { id: "storage", label: "Storage" },
  { id: "marketing", label: "Marketing" },
  { id: "calendar", label: "Calendar" },
];

export function IntegrationsSection() {
  const [activeCategory, setActiveCategory] = React.useState("all");
  const { ref, isVisible } = useScrollAnimation();

  const filteredIntegrations = activeCategory === "all"
    ? integrations
    : integrations.filter((i) => i.category === activeCategory);

  return (
    <section id="integrations" ref={ref} className="relative z-10 py-20 lg:py-32">
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
              Connect with <span className="font-medium text-[var(--primary)]">5,000+</span> apps
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
            <span className="text-foreground-secondary">Plays nice with</span>{" "}
            <span className="text-foreground">your favorite tools</span>
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
            Connect PhotoProOS to the apps you already use. No more manual exports or copy-pasting.
          </p>
        </div>

        {/* Category Filter */}
        <div
          className="mb-10 flex flex-wrap justify-center gap-2"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(20px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out",
            transitionDelay: "300ms",
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                activeCategory === category.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-secondary)] hover:text-foreground"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredIntegrations.map((integration, index) => {
            const IconComponent = integration.icon;
            return (
              <div
                key={integration.name}
                className="group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "none" : "translateY(30px)",
                  transition: "opacity 500ms ease-out, transform 500ms ease-out, border-color 300ms, box-shadow 300ms",
                  transitionDelay: `${400 + index * 50}ms`,
                }}
              >
                {integration.popular && (
                  <span className="absolute right-3 top-3 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                    Popular
                  </span>
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--background-secondary)] transition-transform duration-300 group-hover:scale-110">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-foreground">{integration.name}</h3>
                <p className="text-sm text-foreground-secondary">{integration.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className="mt-12 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(20px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out",
            transitionDelay: "800ms",
          }}
        >
          <p className="mb-4 text-foreground-secondary">
            Don't see your favorite tool?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/integrations"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)]"
            >
              View all integrations
              <ArrowIcon className="h-4 w-4" />
            </a>
            <a
              href="/api-docs"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-[var(--border-hover)] hover:text-foreground"
            >
              <CodeIcon className="h-4 w-4" />
              Build with our API
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Integration Icons (simplified branded representations)
function StripeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" fill="#635BFF"/>
    </svg>
  );
}

function LightroomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#31A8FF"/>
      <path d="M6 17V7h2v8h4v2H6zm8-10h2v8.5c0 .3.2.5.5.5s.5-.2.5-.5V7h2v8.5c0 1.4-1.1 2.5-2.5 2.5S14 16.9 14 15.5V7z" fill="white"/>
    </svg>
  );
}

function GoogleDriveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M8.267 14.68l-1.6 2.77H22.2l1.6-2.77H8.267z" fill="#3777E3"/>
      <path d="M15.467 2H8.533L.2 17.45h6.933L15.467 2z" fill="#FFCF63"/>
      <path d="M23.8 17.45L15.467 2l-3.734 6.45 4.133 8.23 7.934.77z" fill="#11A861"/>
    </svg>
  );
}

function DropboxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M6 2L0 6l6 4-6 4 6 4 6-4-6-4 6-4-6-4zm12 0l-6 4 6 4-6 4 6 4 6-4-6-4 6-4-6-4zM6 18l6-4 6 4-6 4-6-4z" fill="#0061FF"/>
    </svg>
  );
}

function CalendlyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect width="24" height="24" rx="4" fill="#006BFF"/>
      <path d="M17 8H7v9h10V8z" fill="white"/>
      <path d="M9 6v2M15 6v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 12h10" stroke="#006BFF" strokeWidth="1.5"/>
    </svg>
  );
}

function MailchimpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="12" fill="#FFE01B"/>
      <path d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#241C15"/>
      <circle cx="10" cy="11" r="1" fill="#241C15"/>
      <circle cx="14" cy="11" r="1" fill="#241C15"/>
      <path d="M10 14c.5.5 1.2.8 2 .8s1.5-.3 2-.8" stroke="#241C15" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

function QuickBooksIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="12" fill="#2CA01C"/>
      <path d="M7 12a5 5 0 0110 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 7v10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ZapierIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="12" fill="#FF4A00"/>
      <path d="M12 6l3 3-3 3-3-3 3-3zm0 6l3 3-3 3-3-3 3-3z" fill="white"/>
      <path d="M6 12l3-3v6l-3-3zm12 0l-3-3v6l3-3z" fill="white"/>
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 0 1 0 1.06L2.56 10l3.72 3.72a.75.75 0 0 1-1.06 1.06L.97 10.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Zm7.44 0a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 0 1 0-1.06ZM11.377 2.011a.75.75 0 0 1 .612.867l-2.5 14.5a.75.75 0 0 1-1.478-.255l2.5-14.5a.75.75 0 0 1 .866-.612Z" clipRule="evenodd" />
    </svg>
  );
}
