export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo mode flag
const DEMO_MODE = true;

// Demo client data
const demoClients = [
  { id: "1", fullName: "John Peterson", email: "john@premierrealty.com", company: "Premier Realty", industry: "real_estate", projectCount: 12, lifetimeRevenueCents: 4250000 },
  { id: "2", fullName: "Sarah Mitchell", email: "sarah@email.com", company: null, industry: "wedding", projectCount: 1, lifetimeRevenueCents: 350000 },
  { id: "3", fullName: "Michael Chen", email: "m.chen@techsolutions.com", company: "Tech Solutions Inc", industry: "commercial", projectCount: 8, lifetimeRevenueCents: 2180000 },
  { id: "4", fullName: "Isabella Romano", email: "isabella@bellacucina.com", company: "Bella Cucina", industry: "food_hospitality", projectCount: 3, lifetimeRevenueCents: 189000 },
  { id: "5", fullName: "David Park", email: "david@designstudiopro.com", company: "Design Studio Pro", industry: "architecture", projectCount: 6, lifetimeRevenueCents: 342000 },
  { id: "6", fullName: "Emily Watson", email: "emily@berkshire.com", company: "Berkshire Properties", industry: "real_estate", projectCount: 15, lifetimeRevenueCents: 580000 },
  { id: "7", fullName: "Alex Rivera", email: "alex@innovatetech.io", company: "Innovate Tech", industry: "events", projectCount: 4, lifetimeRevenueCents: 120000 },
  { id: "8", fullName: "Lisa Thompson", email: "lisa@luxuryliving.com", company: "Luxury Living Realty", industry: "real_estate", projectCount: 9, lifetimeRevenueCents: 485000 },
  { id: "9", fullName: "James Wilson", email: "j.wilson@portraits.com", company: "Wilson Portraits", industry: "headshots", projectCount: 22, lifetimeRevenueCents: 156000 },
  { id: "10", fullName: "Rachel Green", email: "rachel@greenweddings.com", company: "Green Weddings", industry: "wedding", projectCount: 5, lifetimeRevenueCents: 425000 },
];

// Helper to format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Industry display names
const industryLabels: Record<string, string> = {
  real_estate: "Real Estate",
  wedding: "Wedding",
  portrait: "Portrait",
  commercial: "Commercial",
  architecture: "Architecture",
  food_hospitality: "Food & Hospitality",
  events: "Events",
  headshots: "Headshots",
  product: "Product",
  other: "Other",
};

export default async function ClientsPage() {
  // Demo mode - use static data
  if (DEMO_MODE) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Clients"
          subtitle={`${demoClients.length} clients in your database`}
          actions={
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Add Client
            </Link>
          }
        />

        {/* Demo Mode Banner */}
        <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
          <p className="text-sm text-[var(--primary)]">
            <strong>Demo Mode:</strong> Viewing sample client data.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search clients..."
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Clients Table */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Client
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Industry
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                  Projects
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {demoClients.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors hover:bg-[var(--background-hover)]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
                        {(client.fullName || client.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {client.fullName || client.email}
                        </p>
                        {client.company && (
                          <p className="text-sm text-foreground-muted">{client.company}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span className="inline-flex rounded-full bg-[var(--background-secondary)] px-2.5 py-1 text-xs font-medium text-foreground-secondary">
                      {industryLabels[client.industry] || client.industry}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-foreground-muted lg:table-cell">
                    {client.projectCount} projects
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "font-medium",
                      client.lifetimeRevenueCents > 0
                        ? "text-[var(--success)]"
                        : "text-foreground-muted"
                    )}>
                      {formatCurrency(client.lifetimeRevenueCents)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Database mode
  const { prisma } = await import("@/lib/db");

  // Get organization (later from auth)
  const organization = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please run the seed script to populate demo data.</p>
      </div>
    );
  }

  // Fetch clients with project count
  const clients = await prisma.client.findMany({
    where: { organizationId: organization.id },
    include: {
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} clients in your database`}
        actions={
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Client
          </Link>
        }
      />

      {/* Search bar */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search clients..."
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        />
      </div>

      {/* Clients Table */}
      {clients.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Client
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Industry
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                  Projects
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors hover:bg-[var(--background-hover)]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
                        {(client.fullName || client.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {client.fullName || client.email}
                        </p>
                        {client.company && (
                          <p className="text-sm text-foreground-muted">{client.company}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span className="inline-flex rounded-full bg-[var(--background-secondary)] px-2.5 py-1 text-xs font-medium text-foreground-secondary">
                      {industryLabels[client.industry] || client.industry}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-foreground-muted lg:table-cell">
                    {client._count.projects} projects
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "font-medium",
                      client.lifetimeRevenueCents > 0
                        ? "text-[var(--success)]"
                        : "text-foreground-muted"
                    )}>
                      {formatCurrency(client.lifetimeRevenueCents)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <ClientsIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No clients yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Add your first client to start managing your photography business.
          </p>
          <Link
            href="/clients/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Client
          </Link>
        </div>
      )}
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
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

function ClientsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}
