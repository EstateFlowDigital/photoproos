"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhotoProOSLogo } from "@/components/ui/photoproos-logo";
import { VideoModal } from "@/components/ui/video-modal";
import { cn } from "@/lib/utils";
import { ClientPortalDemo, PaymentDemo, EnhancedGalleryDemo } from "@/components/landing/interactive-demos";

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, startOnMount: boolean = true) {
  const [count, setCount] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);

  React.useEffect(() => {
    if (!startOnMount || hasStarted) return;
    setHasStarted(true);

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, startOnMount, hasStarted]);

  return count;
}

// Demo sections for the interactive demo
const demoSections = [
  { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "galleries", label: "Galleries", icon: GalleryIcon },
  { id: "clients", label: "Clients", icon: ClientIcon },
  { id: "client-portal", label: "Client Portal", icon: PortalIcon },
  { id: "payment-flow", label: "Pay & Deliver", icon: PaymentIcon },
  { id: "scheduling", label: "Scheduling", icon: CalendarIcon },
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

// Interactive app demo component - Full-screen app experience
function InteractiveDemo({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (id: string) => void }) {
  return (
    <div className="relative w-full mx-auto">
      {/* Browser chrome - Full width */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl shadow-black/50 overflow-hidden">
        {/* Browser header */}
        <div className="flex items-center gap-2 border-b border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-3">
          {/* Traffic lights */}
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          {/* URL bar */}
          <div className="ml-4 flex flex-1 items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-1.5 max-w-md">
            <LockIcon className="h-3.5 w-3.5 text-[var(--success)]" />
            <span className="text-xs text-foreground-muted">app.photoproos.com/dashboard</span>
          </div>
          {/* User avatar */}
          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-lg bg-[var(--background-hover)] p-1.5 text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground transition-colors">
              <BellIcon className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
            </button>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center text-[10px] font-medium text-white">
              JD
            </div>
          </div>
        </div>

        {/* App content - Taller for full-screen feel */}
        <div className="flex h-[500px] md:h-[560px] lg:h-[620px]">
          {/* Sidebar */}
          <div className="w-14 shrink-0 border-r border-[var(--card-border)] bg-[var(--background-secondary)] py-4 lg:w-56">
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
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium transition-all duration-200 lg:px-3",
                    activeSection === section.id
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm"
                      : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                  )}
                >
                  <section.icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline">{section.label}</span>
                  {activeSection === section.id && (
                    <div className="ml-auto hidden lg:block h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  )}
                </button>
              ))}
            </nav>

            {/* Bottom nav items */}
            <div className="absolute bottom-4 left-0 right-0 px-2 lg:w-56">
              <div className="border-t border-[var(--card-border)] pt-4 space-y-1">
                <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors lg:px-3">
                  <SettingsIcon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline">Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="relative flex-1 overflow-hidden bg-[var(--background)]">
            <div className="absolute inset-0 overflow-y-auto p-4 lg:p-6">
              {activeSection === "dashboard" && <DashboardDemo />}
              {activeSection === "galleries" && <EnhancedGalleryDemo />}
              {activeSection === "clients" && <ClientsDemo />}
              {activeSection === "client-portal" && <ClientPortalDemo />}
              {activeSection === "payment-flow" && <PaymentDemo />}
              {activeSection === "scheduling" && <SchedulingDemo />}
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification badges */}
      <div className="absolute -right-2 lg:-right-6 top-1/4 hidden animate-float md:block" style={{ animationDelay: "0ms" }}>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-xs font-medium text-foreground">Payment received</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--success)]">+$450.00</p>
        </div>
      </div>

      <div className="absolute -left-2 lg:-left-6 bottom-1/3 hidden animate-float md:block" style={{ animationDelay: "500ms" }}>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
            <span className="text-xs font-medium text-foreground">Gallery delivered</span>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">24 photos • Premier Realty</p>
        </div>
      </div>

      <div className="absolute -right-2 lg:-right-6 bottom-1/4 hidden animate-float lg:block" style={{ animationDelay: "1000ms" }}>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs font-medium text-foreground">Booking confirmed</span>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">Tomorrow, 2:00 PM</p>
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-foreground">Galleries</h3>
        <Button size="sm" variant="default">+ New Gallery</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GalleryCard
          title="Luxury Estate - Twilight"
          client="Premier Realty"
          photos={32}
          status="delivered"
          revenue="$475"
          image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&q=80"
        />
        <GalleryCard
          title="Modern Penthouse Suite"
          client="Berkshire Properties"
          photos={24}
          status="pending"
          revenue="$650"
          image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80"
        />
        <GalleryCard
          title="Beachfront Villa Sunset"
          client="Coastal Living Realty"
          photos={48}
          status="delivered"
          revenue="$890"
          image="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&q=80"
        />
        <GalleryCard
          title="Downtown Loft - Dusk"
          client="Urban Spaces Co"
          photos={36}
          status="draft"
          image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&q=80"
        />
      </div>
    </div>
  );
}

// Clients demo content
function ClientsDemo() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-foreground">Clients</h3>
        <Button size="sm" variant="default">+ Add Client</Button>
      </div>

      <div className="rounded-lg border border-[var(--card-border)] overflow-x-auto">
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
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
      <div className="rounded-lg border border-[var(--card-border)] overflow-x-auto">
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

// Scheduling demo content
function SchedulingDemo() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDay = 3; // Thursday

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-foreground">Scheduling</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary">Week</Button>
          <Button size="sm" variant="default">+ New Booking</Button>
        </div>
      </div>

      {/* Mini calendar week view */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <span className="text-sm font-medium text-foreground">December 2025</span>
          <div className="flex gap-1">
            <button className="p-1 rounded hover:bg-[var(--background-hover)]">
              <ChevronLeftIcon className="h-4 w-4 text-foreground-muted" />
            </button>
            <button className="p-1 rounded hover:bg-[var(--background-hover)]">
              <ChevronRightIcon className="h-4 w-4 text-foreground-muted" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => (
            <div key={day} className="text-center">
              <p className="text-xs text-foreground-muted mb-1">{day}</p>
              <div className={cn(
                "h-8 w-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium",
                i === currentDay ? "bg-[var(--primary)] text-white" : "text-foreground hover:bg-[var(--background-hover)]"
              )}>
                {23 + i}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming bookings */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Upcoming</p>
        <div className="space-y-2">
          <BookingCard
            time="2:00 PM"
            title="Corporate Headshots"
            client="Tech Solutions Inc"
            duration="2 hours"
            color="bg-blue-500"
          />
          <BookingCard
            time="5:30 PM"
            title="Property Shoot"
            client="Premier Realty"
            duration="1.5 hours"
            color="bg-purple-500"
          />
          <BookingCard
            time="Tomorrow, 10:00 AM"
            title="Restaurant Photography"
            client="Bella Cucina"
            duration="3 hours"
            color="bg-amber-500"
          />
        </div>
      </div>
    </div>
  );
}

// Invoices demo content
function InvoicesDemo() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-foreground">Invoices</h3>
        <Button size="sm" variant="default">+ Create Invoice</Button>
      </div>

      {/* Invoice summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
          <p className="text-xs text-foreground-muted">Draft</p>
          <p className="text-lg font-bold text-foreground">3</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
          <p className="text-xs text-foreground-muted">Sent</p>
          <p className="text-lg font-bold text-[var(--primary)]">5</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
          <p className="text-xs text-foreground-muted">Paid</p>
          <p className="text-lg font-bold text-[var(--success)]">12</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3">
          <p className="text-xs text-foreground-muted">Overdue</p>
          <p className="text-lg font-bold text-[var(--error)]">1</p>
        </div>
      </div>

      {/* Invoice list */}
      <div className="rounded-lg border border-[var(--card-border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--background-secondary)]">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-foreground-muted">Invoice</th>
              <th className="hidden px-4 py-2 text-left font-medium text-foreground-muted lg:table-cell">Client</th>
              <th className="px-4 py-2 text-right font-medium text-foreground-muted">Amount</th>
              <th className="px-4 py-2 text-right font-medium text-foreground-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            <InvoiceRow id="INV-001" client="Premier Realty" amount="$1,250" status="paid" />
            <InvoiceRow id="INV-002" client="Tech Solutions" amount="$680" status="sent" />
            <InvoiceRow id="INV-003" client="Bella Cucina" amount="$890" status="sent" />
            <InvoiceRow id="INV-004" client="Design Studio" amount="$450" status="overdue" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Booking card helper
function BookingCard({ time, title, client, duration, color }: { time: string; title: string; client: string; duration: string; color: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 hover:border-[var(--border-hover)] transition-colors">
      <div className={cn("w-1 rounded-full", color)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground-muted">{time}</p>
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-foreground-muted">{client} • {duration}</p>
      </div>
    </div>
  );
}

// Invoice row helper
function InvoiceRow({ id, client, amount, status }: { id: string; client: string; amount: string; status: "paid" | "sent" | "draft" | "overdue" }) {
  const statusColors = {
    paid: "bg-[var(--success)]/10 text-[var(--success)]",
    sent: "bg-[var(--primary)]/10 text-[var(--primary)]",
    draft: "bg-[var(--border)] text-foreground-muted",
    overdue: "bg-[var(--error)]/10 text-[var(--error)]",
  };

  return (
    <tr className="bg-[var(--card)] hover:bg-[var(--background-hover)]">
      <td className="px-4 py-3 font-medium text-foreground">{id}</td>
      <td className="hidden px-4 py-3 text-foreground-muted lg:table-cell">{client}</td>
      <td className="px-4 py-3 text-right font-medium text-foreground">{amount}</td>
      <td className="px-4 py-3 text-right">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase", statusColors[status])}>
          {status}
        </span>
      </td>
    </tr>
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

function GalleryCard({ title, client, photos, status, revenue, image }: { title: string; client: string; photos: number; status: "delivered" | "pending" | "draft"; revenue?: string; image?: string }) {
  const statusColors = {
    delivered: "bg-[var(--success)]/10 text-[var(--success)]",
    pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
    draft: "bg-[var(--border)] text-foreground-muted",
  };

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 transition-all duration-200 hover:border-[var(--border-hover)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="mb-2 aspect-video rounded-md overflow-hidden bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ai)]/20">
        {image && (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
      </div>
      <h4 className="truncate text-sm font-medium text-foreground">{title}</h4>
      <p className="text-xs text-foreground-muted">{client}</p>
      <div className="mt-2 flex items-start justify-between gap-4 flex-wrap">
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
  const [isPaused, setIsPaused] = React.useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const photographerCount = useAnimatedCounter(2500, 2000);

  // Auto-rotate through demo sections (pause on hover)
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSection((current) => {
        const currentIndex = demoSections.findIndex((s) => s.id === current);
        const nextIndex = (currentIndex + 1) % demoSections.length;
        return demoSections[nextIndex].id;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="relative z-10 min-h-screen overflow-hidden">
      <GridBackground />

      {/* Content Container - Tighter spacing for more demo visibility */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-24 lg:px-8 lg:pt-28 xl:px-12">
        {/* Text content - Compact */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="hero-animate hero-animate-1 mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
            </span>
            <span className="text-sm text-foreground-secondary">
              <span className="font-medium text-[var(--success)]">Now in beta</span> — Start free today
            </span>
          </div>

          {/* Main Heading - Two-tone style */}
          <h1 className="hero-animate hero-animate-2 text-[36px] font-medium leading-[42px] tracking-[-1px] md:text-[48px] md:leading-[54px] md:tracking-[-2px] lg:text-[56px] lg:leading-[62px]">
            <span className="text-foreground">The Business OS for</span>{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--ai)] to-[var(--primary)] bg-[length:200%_auto] bg-clip-text text-transparent text-shimmer">
              Professional Photographers
            </span>
          </h1>

          {/* Subheading */}
          <p className="hero-animate hero-animate-3 mx-auto mt-4 max-w-2xl text-base leading-6 text-foreground-secondary lg:text-lg lg:leading-7">
            Deliver galleries, collect payments, manage clients, and run your entire business from one platform.
          </p>

          {/* CTA Buttons */}
          <div className="hero-animate hero-animate-4 mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="default" size="lg" asChild>
              <Link href="/dashboard">Start free trial</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-2"
            >
              <PlayIcon className="h-4 w-4" />
              Watch demo
            </Button>
          </div>

          {/* Social proof - Compact */}
          <div className="hero-animate hero-animate-5 mt-5 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3.5 w-3.5 text-[var(--success)]" />
              <span className="text-xs text-foreground-secondary">No credit card required</span>
            </div>
            <div className="hidden h-3 w-px bg-[var(--border)] sm:block" />
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3.5 w-3.5 text-[var(--success)]" />
              <span className="text-xs text-foreground-secondary">5 free galleries included</span>
            </div>
            <div className="hidden h-3 w-px bg-[var(--border)] sm:block" />
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3.5 w-3.5 text-[var(--success)]" />
              <span className="text-xs text-foreground-secondary">Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Interactive Demo - Full width, taller */}
        <div
          className="hero-animate hero-animate-6 mt-8 lg:mt-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <InteractiveDemo activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Bottom spacer - Minimal */}
        <div className="h-8 lg:h-12" />
      </div>

      {/* Video Demo Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        // videoUrl="https://www.youtube.com/embed/your-video-id" // Add video URL when ready
      />
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.993 6.993 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function PortalIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25ZM3.5 4.25a.75.75 0 0 1 .75-.75h2.5v5h-3.25V4.25ZM6.75 10h-3.25v5.75c0 .414.336.75.75.75h2.5V10Zm1.5-6.5h7.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75h-7.5v-13Z" clipRule="evenodd" />
    </svg>
  );
}
