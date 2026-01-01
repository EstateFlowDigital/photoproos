"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhotoProOSLogo } from "@/components/ui/photoproos-logo";
import { cn } from "@/lib/utils";

// Demo sections for the interactive demo
const demoSections = [
  { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "galleries", label: "Galleries", icon: GalleryIcon },
  { id: "clients", label: "Clients", icon: ClientIcon },
  { id: "payments", label: "Payments", icon: PaymentIcon },
];

// Animated grid background component
function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      {/* Accent grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "256px 256px",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}

// Interactive app demo component
function InteractiveDemo({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (id: string) => void }) {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Browser chrome */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl shadow-black/40 overflow-hidden">
        {/* Browser header */}
        <div className="flex items-center gap-2 border-b border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-3">
          {/* Traffic lights */}
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          {/* URL bar */}
          <div className="ml-4 flex flex-1 items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-1.5">
            <LockIcon className="h-3.5 w-3.5 text-[var(--success)]" />
            <span className="text-xs text-foreground-muted">app.photoproos.com</span>
          </div>
        </div>

        {/* App content */}
        <div className="flex h-[400px] lg:h-[480px]">
          {/* Sidebar */}
          <div className="w-14 shrink-0 border-r border-[var(--card-border)] bg-[var(--background-secondary)] py-4 lg:w-48">
            {/* Logo */}
            <div className="mb-6 px-3 lg:px-4">
              <div className="hidden lg:block">
                <PhotoProOSLogo size="sm" />
              </div>
              <div className="flex justify-center lg:hidden">
                <PhotoProOSLogo variant="icon" size="sm" />
              </div>
            </div>
            {/* Nav items */}
            <nav className="space-y-1 px-2">
              {demoSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium transition-colors lg:px-3",
                    activeSection === section.id
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                  )}
                >
                  <section.icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main content area - fixed height with overflow for consistent layout */}
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-0 overflow-y-auto p-4 lg:p-6">
              {activeSection === "dashboard" && <DashboardDemo />}
              {activeSection === "galleries" && <GalleriesDemo />}
              {activeSection === "clients" && <ClientsDemo />}
              {activeSection === "payments" && <PaymentsDemo />}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -right-4 top-1/4 hidden animate-float xl:block" style={{ animationDelay: "0ms" }}>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-xs font-medium text-foreground">Payment received</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--success)]">+$450.00</p>
        </div>
      </div>

      <div className="absolute -left-4 bottom-1/4 hidden animate-float xl:block" style={{ animationDelay: "500ms" }}>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
            <span className="text-xs font-medium text-foreground">Gallery delivered</span>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">24 photos unlocked</p>
        </div>
      </div>
    </div>
  );
}

// Dashboard demo content
function DashboardDemo() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Dashboard</h3>
        <span className="text-xs text-foreground-muted">December 2025</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Monthly Revenue" value="$12,450" change="+23%" positive />
        <StatCard label="Active Galleries" value="18" change="+5" positive />
        <StatCard label="Total Clients" value="47" change="+12" positive />
        <StatCard label="Pending Payments" value="$2,340" />
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">Recent Activity</h4>
        <div className="space-y-3">
          <ActivityItem
            icon={<PaymentIcon className="h-4 w-4" />}
            text="Sarah M. paid $450 for wedding gallery"
            time="2 min ago"
            highlight
          />
          <ActivityItem
            icon={<GalleryIcon className="h-4 w-4" />}
            text="New gallery created: Downtown Loft Shoot"
            time="1 hour ago"
          />
          <ActivityItem
            icon={<ClientIcon className="h-4 w-4" />}
            text="New client added: Berkshire Properties"
            time="3 hours ago"
          />
        </div>
      </div>
    </div>
  );
}

// Galleries demo content
function GalleriesDemo() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Galleries</h3>
        <Button size="sm" variant="default">+ New Gallery</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GalleryCard
          title="Coastal Home - 142 Ocean Dr"
          client="Premier Realty"
          photos={32}
          status="delivered"
          revenue="$275"
        />
        <GalleryCard
          title="Corporate Headshots Batch"
          client="Tech Solutions Inc"
          photos={24}
          status="pending"
          revenue="$450"
        />
        <GalleryCard
          title="Restaurant Grand Opening"
          client="Bella Cucina"
          photos={86}
          status="delivered"
          revenue="$680"
        />
        <GalleryCard
          title="Modern Office Space"
          client="Design Studio Pro"
          photos={48}
          status="draft"
        />
      </div>
    </div>
  );
}

// Clients demo content
function ClientsDemo() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Clients</h3>
        <Button size="sm" variant="default">+ Add Client</Button>
      </div>

      <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--background-secondary)]">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-foreground-muted">Client</th>
              <th className="hidden px-4 py-2 text-left font-medium text-foreground-muted lg:table-cell">Industry</th>
              <th className="px-4 py-2 text-right font-medium text-foreground-muted">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            <ClientRow name="Premier Realty" industry="Real Estate" revenue="$4,250" />
            <ClientRow name="Tech Solutions Inc" industry="Corporate" revenue="$2,180" />
            <ClientRow name="Bella Cucina" industry="Food & Hospitality" revenue="$1,890" />
            <ClientRow name="Design Studio Pro" industry="Architecture" revenue="$3,420" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Payments demo content
function PaymentsDemo() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Payments</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary">Export</Button>
          <Button size="sm" variant="default">Send Invoice</Button>
        </div>
      </div>

      {/* Payment summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
          <p className="text-xs text-foreground-muted">This Month</p>
          <p className="text-xl font-bold text-foreground">$8,940</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
          <p className="text-xs text-foreground-muted">Pending</p>
          <p className="text-xl font-bold text-[var(--warning)]">$2,340</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
          <p className="text-xs text-foreground-muted">Overdue</p>
          <p className="text-xl font-bold text-[var(--error)]">$450</p>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--background-secondary)]">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-foreground-muted">Description</th>
              <th className="px-4 py-2 text-right font-medium text-foreground-muted">Amount</th>
              <th className="hidden px-4 py-2 text-right font-medium text-foreground-muted lg:table-cell">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            <PaymentRow description="Wedding Gallery - Sarah M." amount="$450" status="paid" />
            <PaymentRow description="Real Estate Bundle - Premier Realty" amount="$825" status="paid" />
            <PaymentRow description="Headshots - Tech Solutions" amount="$340" status="pending" />
            <PaymentRow description="Restaurant Shoot - Bella Cucina" amount="$680" status="paid" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper components
function StatCard({ label, value, change, positive }: { label: string; value: string; change?: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
      <p className="text-xs text-foreground-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-bold text-foreground">{value}</span>
        {change && (
          <span className={cn("text-xs font-medium", positive ? "text-[var(--success)]" : "text-foreground-muted")}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ icon, text, time, highlight }: { icon: React.ReactNode; text: string; time: string; highlight?: boolean }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-lg p-2", highlight && "bg-[var(--success)]/5")}>
      <div className={cn("mt-0.5 rounded-md p-1.5", highlight ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--background-elevated)] text-foreground-muted")}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-foreground">{text}</p>
        <p className="text-xs text-foreground-muted">{time}</p>
      </div>
    </div>
  );
}

function GalleryCard({ title, client, photos, status, revenue }: { title: string; client: string; photos: number; status: "delivered" | "pending" | "draft"; revenue?: string }) {
  const statusColors = {
    delivered: "bg-[var(--success)]/10 text-[var(--success)]",
    pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
    draft: "bg-[var(--border)] text-foreground-muted",
  };

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 transition-colors hover:border-[var(--border-hover)]">
      <div className="mb-2 aspect-video rounded-md bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ai)]/20" />
      <h4 className="truncate text-sm font-medium text-foreground">{title}</h4>
      <p className="text-xs text-foreground-muted">{client}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-foreground-muted">{photos} photos</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase", statusColors[status])}>
          {status}
        </span>
      </div>
      {revenue && (
        <p className="mt-1 text-sm font-semibold text-[var(--success)]">{revenue}</p>
      )}
    </div>
  );
}

function ClientRow({ name, industry, revenue }: { name: string; industry: string; revenue: string }) {
  return (
    <tr className="bg-[var(--card)] hover:bg-[var(--background-hover)]">
      <td className="px-4 py-3 font-medium text-foreground">{name}</td>
      <td className="hidden px-4 py-3 text-foreground-muted lg:table-cell">{industry}</td>
      <td className="px-4 py-3 text-right font-medium text-[var(--success)]">{revenue}</td>
    </tr>
  );
}

function PaymentRow({ description, amount, status }: { description: string; amount: string; status: "paid" | "pending" | "overdue" }) {
  const statusColors = {
    paid: "bg-[var(--success)]/10 text-[var(--success)]",
    pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
    overdue: "bg-[var(--error)]/10 text-[var(--error)]",
  };

  return (
    <tr className="bg-[var(--card)] hover:bg-[var(--background-hover)]">
      <td className="px-4 py-3 text-foreground">{description}</td>
      <td className="px-4 py-3 text-right font-medium text-foreground">{amount}</td>
      <td className="hidden px-4 py-3 text-right lg:table-cell">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase", statusColors[status])}>
          {status}
        </span>
      </td>
    </tr>
  );
}

export function HeroSection() {
  const [activeSection, setActiveSection] = React.useState("dashboard");

  // Auto-rotate through demo sections
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((current) => {
        const currentIndex = demoSections.findIndex((s) => s.id === current);
        const nextIndex = (currentIndex + 1) % demoSections.length;
        return demoSections[nextIndex].id;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative z-10 min-h-screen overflow-hidden">
      <GridBackground />

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-[1512px] px-6 pt-32 lg:px-[124px] lg:pt-40">
        {/* Text content */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="hero-animate hero-animate-1 mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
            </span>
            <span className="text-sm text-foreground-secondary">
              Now serving <span className="font-medium text-foreground">2,500+</span> photographers
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-animate hero-animate-2 text-[40px] font-medium leading-[48px] tracking-[-1px] text-foreground md:text-[56px] md:leading-[64px] md:tracking-[-2px] lg:text-[72px] lg:leading-[80px]">
            <span className="block">The Business OS for</span>
            <span className="block bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">
              Professional Photographers
            </span>
          </h1>

          {/* Subheading */}
          <p className="hero-animate hero-animate-3 mx-auto mt-6 max-w-2xl text-lg leading-7 text-foreground-secondary lg:text-xl lg:leading-8">
            Everything you need in one place. Deliver stunning galleries, collect payments automatically, and run your entire photography business with ease.
          </p>

          {/* CTA Buttons */}
          <div className="hero-animate hero-animate-4 mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="default" size="lg" asChild>
              <Link href="/signup">Start free trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#demo" className="flex items-center gap-2">
                <PlayIcon className="h-4 w-4" />
                Watch demo
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="hero-animate hero-animate-5 mt-8 flex flex-wrap items-center justify-center gap-4 lg:gap-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-4 w-4 text-[#fbbf24]" />
              ))}
              <span className="ml-2 text-sm text-foreground-secondary">
                <span className="font-semibold text-foreground">4.9/5</span> from 500+ reviews
              </span>
            </div>
            <div className="hidden h-4 w-px bg-[var(--border)] lg:block" />
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
              <span className="text-sm text-foreground-secondary">No credit card required</span>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="hero-animate hero-animate-6 mt-12 lg:mt-16">
          <InteractiveDemo activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Bottom spacer */}
        <div className="h-16 lg:h-24" />
      </div>
    </section>
  );
}

// Icons
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7a1 1 0 0 0 1.414 1.414L4 10.414V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-7-7Z" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
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

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
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

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9.555 7.168A1 1 0 0 0 8 8v4a1 1 0 0 0 1.555.832l3-2a1 1 0 0 0 0-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  );
}
