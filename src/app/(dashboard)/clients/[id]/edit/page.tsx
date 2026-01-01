export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo client data - reuse from detail page
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
  totalGalleries: number;
  totalPayments: number;
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
    totalGalleries: 3,
    totalPayments: 3,
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
    totalGalleries: 2,
    totalPayments: 1,
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
    totalGalleries: 1,
    totalPayments: 1,
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
    totalGalleries: 1,
    totalPayments: 2,
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
  totalGalleries: 0,
  totalPayments: 0,
};

const industries = [
  { value: "real_estate", label: "Real Estate" },
  { value: "commercial", label: "Commercial" },
  { value: "wedding", label: "Wedding" },
  { value: "food_hospitality", label: "Food & Hospitality" },
  { value: "architecture", label: "Architecture" },
  { value: "events", label: "Events" },
  { value: "portrait", label: "Portrait" },
  { value: "product", label: "Product" },
  { value: "other", label: "Other" },
];

const activityLog = [
  { action: "Client created", date: "Mar 15, 2024", user: "You" },
  { action: "Gallery delivered", date: "Dec 18, 2024", user: "System" },
  { action: "Payment received", date: "Dec 18, 2024", user: "System" },
  { action: "Notes updated", date: "Dec 20, 2024", user: "You" },
];

interface ClientEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientEditPage({ params }: ClientEditPageProps) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${client.fullName}`}
        subtitle="Update client information and settings"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href={`/clients/${id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              form="edit-client-form"
              disabled
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Changes will not be saved. This is a preview of client editing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="edit-client-form" className="space-y-6">
            {/* Basic Information */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Basic Information</h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
                      Full Name <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      defaultValue={client.fullName}
                      placeholder="John Smith"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      defaultValue={client.company || ""}
                      placeholder="Company name (optional)"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-1.5">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    defaultValue={client.industry}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    {industries.map((industry) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Contact Information</h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                      Email <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={client.email}
                      placeholder="client@example.com"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      defaultValue={client.phone}
                      placeholder="(555) 123-4567"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    defaultValue={client.address || ""}
                    placeholder="Street address, city, state, zip"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Notes</h2>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  defaultValue={client.notes || ""}
                  placeholder="Add any notes about this client..."
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                />
                <p className="mt-2 text-xs text-foreground-muted">
                  Notes are private and only visible to you and your team
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Tags</h2>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                  VIP
                  <button type="button" className="hover:text-[var(--primary)]/70">
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success)]/10 px-3 py-1 text-xs font-medium text-[var(--success)]">
                  Repeat Client
                  <button type="button" className="hover:text-[var(--success)]/70">
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--card-border)] px-3 py-1 text-xs font-medium text-foreground-muted hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  <PlusIcon className="h-3 w-3" />
                  Add Tag
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Lifetime Revenue</span>
                <span className="text-sm font-semibold text-[var(--success)]">{formatCurrency(client.lifetimeRevenueCents)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Galleries</span>
                <span className="text-sm font-medium text-foreground">{client.totalGalleries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Total Payments</span>
                <span className="text-sm font-medium text-foreground">{client.totalPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Client Since</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity Log</h2>
            <div className="space-y-3">
              {activityLog.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--background-hover)]">
                    <ActivityIcon className="h-3 w-3 text-foreground-muted" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-foreground-muted">{activity.date} · {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href={`/clients/${id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <UserIcon className="h-4 w-4 text-foreground-muted" />
                View Client Profile
              </Link>
              <Link
                href={`/galleries/new?client=${id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <PhotoIcon className="h-4 w-4 text-foreground-muted" />
                Create Gallery
              </Link>
              <Link
                href={`/scheduling/new?client=${id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <CalendarIcon className="h-4 w-4 text-foreground-muted" />
                Schedule Shoot
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
            <h2 className="text-lg font-semibold text-[var(--error)] mb-4">Danger Zone</h2>
            <p className="text-sm text-foreground-secondary mb-4">
              Deleting this client will also remove all associated galleries and payment history. This action cannot be undone.
            </p>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)] px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="h-4 w-4" />
              Delete Client
            </button>
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

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
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

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
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

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
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
