export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo client data
const demoClients: Record<string, {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string | null;
  industry: string;
  address: string | null;
  notes: string | null;
  lifetimeRevenueCents: number;
  createdAt: string;
  galleries: { id: string; name: string; status: string; photos: number; revenue: number; date: string }[];
  payments: { id: string; amount: number; status: string; gallery: string; date: string }[];
}> = {
  "1": {
    id: "1",
    fullName: "John Peterson",
    email: "john@premierrealty.com",
    phone: "(555) 123-4567",
    company: "Premier Realty",
    industry: "real_estate",
    address: "123 Main Street, Suite 400\nSan Francisco, CA 94102",
    notes: "VIP client - always delivers on time. Prefers drone shots for luxury listings. Usually books 2-3 properties per month.",
    lifetimeRevenueCents: 4250000,
    createdAt: "2024-03-15",
    galleries: [
      { id: "1", name: "Downtown Luxury Listing", status: "delivered", photos: 48, revenue: 425000, date: "2024-12-15" },
      { id: "10", name: "Sunset Heights Property", status: "delivered", photos: 36, revenue: 320000, date: "2024-11-28" },
      { id: "11", name: "Marina Bay Condo", status: "pending", photos: 24, revenue: 280000, date: "2024-12-22" },
    ],
    payments: [
      { id: "p1", amount: 425000, status: "paid", gallery: "Downtown Luxury Listing", date: "2024-12-18" },
      { id: "p2", amount: 320000, status: "paid", gallery: "Sunset Heights Property", date: "2024-12-01" },
      { id: "p3", amount: 280000, status: "pending", gallery: "Marina Bay Condo", date: "2024-12-22" },
    ],
  },
  "2": {
    id: "2",
    fullName: "Lisa Chen",
    email: "admin@techsolutions.com",
    phone: "(555) 234-5678",
    company: "Tech Solutions Inc",
    industry: "commercial",
    address: "500 Innovation Drive\nPalo Alto, CA 94301",
    notes: "Corporate headshots for their team. Quarterly shoots scheduled.",
    lifetimeRevenueCents: 2180000,
    createdAt: "2024-06-10",
    galleries: [
      { id: "3", name: "Corporate Headshots Q4", status: "pending", photos: 24, revenue: 218000, date: "2024-12-20" },
      { id: "12", name: "Corporate Headshots Q3", status: "delivered", photos: 28, revenue: 245000, date: "2024-09-15" },
    ],
    payments: [
      { id: "p4", amount: 245000, status: "paid", gallery: "Corporate Headshots Q3", date: "2024-09-20" },
    ],
  },
  "3": {
    id: "3",
    fullName: "Marco Rossi",
    email: "info@bellacucina.com",
    phone: "(555) 345-6789",
    company: "Bella Cucina",
    industry: "food_hospitality",
    address: "789 Restaurant Row\nSan Francisco, CA 94108",
    notes: "Italian restaurant chain. Needs menu and interior photos for new locations.",
    lifetimeRevenueCents: 1890000,
    createdAt: "2024-08-01",
    galleries: [
      { id: "4", name: "Restaurant Grand Opening", status: "delivered", photos: 86, revenue: 189000, date: "2024-11-10" },
    ],
    payments: [
      { id: "p5", amount: 189000, status: "paid", gallery: "Restaurant Grand Opening", date: "2024-11-12" },
    ],
  },
  "5": {
    id: "5",
    fullName: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "(555) 456-7890",
    company: null,
    industry: "wedding",
    address: "456 Oak Avenue\nBerkeley, CA 94704",
    notes: "Wedding client - June 2025 wedding. Engagement shoot completed.",
    lifetimeRevenueCents: 3500000,
    createdAt: "2024-09-20",
    galleries: [
      { id: "6", name: "Wedding - Sarah & Michael", status: "delivered", photos: 156, revenue: 350000, date: "2024-10-15" },
    ],
    payments: [
      { id: "p6", amount: 175000, status: "paid", gallery: "Wedding - Sarah & Michael (Deposit)", date: "2024-09-25" },
      { id: "p7", amount: 175000, status: "paid", gallery: "Wedding - Sarah & Michael (Final)", date: "2024-10-20" },
    ],
  },
};

const defaultClient = {
  id: "0",
  fullName: "Demo Client",
  email: "demo@example.com",
  phone: "(555) 000-0000",
  company: null,
  industry: "other",
  address: null,
  notes: null,
  lifetimeRevenueCents: 0,
  createdAt: new Date().toISOString().split("T")[0],
  galleries: [],
  payments: [],
};

const industryLabels: Record<string, { label: string; color: string }> = {
  real_estate: { label: "Real Estate", color: "bg-blue-500/10 text-blue-400" },
  commercial: { label: "Commercial", color: "bg-purple-500/10 text-purple-400" },
  wedding: { label: "Wedding", color: "bg-pink-500/10 text-pink-400" },
  food_hospitality: { label: "Food & Hospitality", color: "bg-orange-500/10 text-orange-400" },
  architecture: { label: "Architecture", color: "bg-emerald-500/10 text-emerald-400" },
  events: { label: "Events", color: "bg-yellow-500/10 text-yellow-400" },
  other: { label: "Other", color: "bg-gray-500/10 text-gray-400" },
};

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const client = demoClients[id] || { ...defaultClient, id };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const statusStyles = {
    delivered: "bg-[var(--success)]/10 text-[var(--success)]",
    pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
    draft: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
    paid: "bg-[var(--success)]/10 text-[var(--success)]",
    overdue: "bg-[var(--error)]/10 text-[var(--error)]",
  };

  const industryInfo = industryLabels[client.industry] || industryLabels.other;

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.fullName}
        subtitle={client.company || client.email}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/clients/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Link>
            <Link
              href={`/galleries/new?client=${id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              New Gallery
            </Link>
          </div>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Viewing sample client data. Actions are disabled.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Lifetime Revenue</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(client.lifetimeRevenueCents)}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Galleries</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{client.galleries.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Payments</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{client.payments.length}</p>
            </div>
          </div>

          {/* Galleries */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Galleries</h2>
              <Link
                href={`/galleries/new?client=${id}`}
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Create Gallery
              </Link>
            </div>

            {client.galleries.length > 0 ? (
              <div className="space-y-3">
                {client.galleries.map((gallery) => (
                  <Link
                    key={gallery.id}
                    href={`/galleries/${gallery.id}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                        <PhotoIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{gallery.name}</p>
                        <p className="text-xs text-foreground-muted">{gallery.photos} photos • {new Date(gallery.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[gallery.status as keyof typeof statusStyles])}>
                        {gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
                      </span>
                      <span className="text-sm font-medium text-foreground">{formatCurrency(gallery.revenue)}</span>
                      <ChevronRightIcon className="h-4 w-4 text-foreground-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
                <PhotoIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground">No galleries yet</p>
                <Link
                  href={`/galleries/new?client=${id}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create First Gallery
                </Link>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment History</h2>

            {client.payments.length > 0 ? (
              <div className="space-y-3">
                {client.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        payment.status === "paid" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"
                      )}>
                        {payment.status === "paid" ? <CheckIcon className="h-5 w-5" /> : <ClockIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{payment.gallery}</p>
                        <p className="text-xs text-foreground-muted">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[payment.status as keyof typeof statusStyles])}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      <span className="text-sm font-medium text-foreground">{formatCurrency(payment.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
                <CreditCardIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground">No payments yet</p>
                <p className="mt-1 text-xs text-foreground-muted">Payments will appear here when galleries are purchased</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-2xl font-bold">
                {client.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{client.fullName}</p>
                {client.company && (
                  <p className="text-sm text-foreground-secondary">{client.company}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Industry</p>
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", industryInfo.color)}>
                  {industryInfo.label}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Email</p>
                <a href={`mailto:${client.email}`} className="text-sm text-[var(--primary)] hover:underline">
                  {client.email}
                </a>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Phone</p>
                <a href={`tel:${client.phone}`} className="text-sm text-foreground hover:text-[var(--primary)]">
                  {client.phone}
                </a>
              </div>

              {client.address && (
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm text-foreground-secondary whitespace-pre-line">{client.address}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Client Since</p>
                <p className="text-sm text-foreground-secondary">
                  {new Date(client.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>
            {client.notes ? (
              <p className="text-sm text-foreground-secondary">{client.notes}</p>
            ) : (
              <p className="text-sm text-foreground-muted italic">No notes added yet</p>
            )}
            <button className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline">
              {client.notes ? "Edit Notes" : "Add Notes"}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <EmailIcon className="h-4 w-4 text-foreground-muted" />
                Send Email
              </button>
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <InvoiceIcon className="h-4 w-4 text-foreground-muted" />
                Create Invoice
              </button>
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <CalendarIcon className="h-4 w-4 text-foreground-muted" />
                Schedule Shoot
              </button>
              <hr className="border-[var(--card-border)]" />
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--error)] transition-colors hover:bg-[var(--error)]/10">
                <TrashIcon className="h-4 w-4" />
                Delete Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
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

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
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

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}
