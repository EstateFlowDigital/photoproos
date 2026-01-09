export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb, RelatedItems } from "@/components/dashboard";
import { getBrokerage, getBrokerageAgents } from "@/lib/actions/brokerages";
import { getBrokerageContracts } from "@/lib/actions/brokerage-contracts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrokerageContractsSection } from "./brokerage-contracts-section";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

interface BrokerageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BrokerageDetailPage({ params }: BrokerageDetailPageProps) {
  const { id } = await params;

  const [brokerageResult, agentsResult, contractsResult] = await Promise.all([
    getBrokerage(id),
    getBrokerageAgents(id),
    getBrokerageContracts(id),
  ]);

  if (!brokerageResult.success || !brokerageResult.data) {
    notFound();
  }

  const brokerage = brokerageResult.data;
  const agents = agentsResult.success && agentsResult.data ? agentsResult.data : [];
  const contracts = contractsResult.success && contractsResult.data ? contractsResult.data : [];

  // Calculate totals
  const totalAgentRevenue = agents.reduce((sum, agent) => sum + agent.lifetimeRevenueCents, 0);
  const activeContracts = contracts.filter((c) => c.isActive);

  return (
    <div className="space-y-6" data-element="brokerages-detail-page">
      <Breadcrumb
        items={[
          { label: "Brokerages", href: "/brokerages" },
          { label: brokerage.name },
        ]}
      />

      <PageHeader
        title={brokerage.name}
        subtitle={brokerage.email || brokerage.website || undefined}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/brokerages"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/brokerages/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Link>
            <Link
              href={`/clients/new?brokerage=${id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Add Agent
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="auto-grid grid-min-200 grid-gap-4">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Agents</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{agents.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Contracts</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{activeContracts.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Brokerage Revenue</p>
              <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(brokerage.totalRevenueCents)}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Agent Revenue</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(totalAgentRevenue)}</p>
            </div>
          </div>

          {/* Agents List */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-foreground">Agents</h2>
              <Link
                href={`/clients/new?brokerage=${id}`}
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Add Agent
              </Link>
            </div>

            {agents.length > 0 ? (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/clients/${agent.id}`}
                    className="flex flex-col gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 transition-colors hover:bg-[var(--background-hover)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full avatar-gradient text-sm font-medium text-white">
                        {(agent.fullName || agent.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{agent.fullName || agent.email}</p>
                        {agent.company && (
                          <p className="text-xs text-foreground-muted">{agent.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <span className="text-sm text-foreground-muted">{agent.totalProjects} projects</span>
                      <span className={cn(
                        "font-medium",
                        agent.lifetimeRevenueCents > 0 ? "text-[var(--success)]" : "text-foreground-muted"
                      )}>
                        {formatCurrency(agent.lifetimeRevenueCents)}
                      </span>
                      <ChevronRightIcon className="h-4 w-4 text-foreground-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
                <UsersIcon className="mx-auto h-10 w-10 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground">No agents yet</p>
                <p className="mt-1 text-xs text-foreground-muted">Add agents to this brokerage to track their bookings and revenue.</p>
                <Link
                  href={`/clients/new?brokerage=${id}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add First Agent
                </Link>
              </div>
            )}
          </div>

          {/* Contracts List */}
          <BrokerageContractsSection brokerageId={id} contracts={contracts} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Brokerage Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center gap-4 mb-6">
              {brokerage.logoUrl ? (
                <img
                  src={brokerage.logoUrl}
                  alt={brokerage.name}
                  className="h-16 w-16 rounded-lg object-contain bg-white p-2"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-lg text-2xl font-bold text-white"
                  style={{ backgroundColor: brokerage.primaryColor || "#3b82f6" }}
                >
                  {(brokerage.name || "B").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-foreground">{brokerage.name}</p>
                <span className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                  brokerage.isActive
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                )}>
                  {brokerage.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {brokerage.email && (
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${brokerage.email}`} className="text-sm text-[var(--primary)] hover:underline">
                    {brokerage.email}
                  </a>
                </div>
              )}

              {brokerage.phone && (
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Phone</p>
                  <a href={`tel:${brokerage.phone}`} className="text-sm text-foreground hover:text-[var(--primary)]">
                    {brokerage.phone}
                  </a>
                </div>
              )}

              {brokerage.website && (
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Website</p>
                  <a
                    href={brokerage.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    {brokerage.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}

              {(brokerage.address || brokerage.city) && (
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm text-foreground-secondary">
                    {[brokerage.address, brokerage.city, brokerage.state, brokerage.zipCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Order Page</p>
                <code className="text-xs text-foreground-secondary bg-[var(--background-secondary)] px-2 py-1 rounded">
                  /order/brokerage/{brokerage.slug}
                </code>
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          {(brokerage.contactName || brokerage.contactEmail || brokerage.contactPhone) && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Primary Contact</h2>
              <div className="space-y-3">
                {brokerage.contactName && (
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4 w-4 text-foreground-muted" />
                    <span className="text-sm text-foreground">{brokerage.contactName}</span>
                  </div>
                )}
                {brokerage.contactEmail && (
                  <div className="flex items-center gap-3">
                    <EmailIcon className="h-4 w-4 text-foreground-muted" />
                    <a href={`mailto:${brokerage.contactEmail}`} className="text-sm text-[var(--primary)] hover:underline">
                      {brokerage.contactEmail}
                    </a>
                  </div>
                )}
                {brokerage.contactPhone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-4 w-4 text-foreground-muted" />
                    <a href={`tel:${brokerage.contactPhone}`} className="text-sm text-foreground hover:text-[var(--primary)]">
                      {brokerage.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <RelatedItems
            items={[
              {
                label: "Agents",
                count: agents.length,
                href: `/clients?brokerage=${id}`,
                icon: <UsersIcon className="h-4 w-4" />,
              },
              {
                label: "Contracts",
                count: contracts.length,
                href: `/brokerages/${id}/contracts`,
                icon: <DocumentIcon className="h-4 w-4" />,
              },
              {
                label: "Order Pages",
                count: brokerage._count?.orderPages || 0,
                href: `/order-pages?brokerage=${id}`,
                icon: <GlobeIcon className="h-4 w-4" />,
              },
            ]}
          />
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
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

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
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

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-1.503.204A6.5 6.5 0 1 1 7.95 3.83L6.927 5.62a1.453 1.453 0 0 0 1.91 2.02l.175-.087a.5.5 0 0 1 .224-.053h.146a.5.5 0 0 1 .447.724l-.028.056a.5.5 0 0 0 .09.533l.036.036a.5.5 0 0 1 .146.353v.333a.5.5 0 0 1-.276.447l-.895.447a.5.5 0 0 0-.276.447v.38a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 0-.5.5v1.447a.5.5 0 0 0 .146.354l.854.853a.5.5 0 0 0 .853-.354V15.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 0 .5-.5v-.447a.5.5 0 0 1 .276-.447l.447-.224a.5.5 0 0 1 .671.224l.224.447a.5.5 0 0 0 .894 0l.447-.894a.5.5 0 0 1 .447-.276h.5a.5.5 0 0 0 .354-.147l.354-.353a.5.5 0 0 0 .147-.354v-.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5H17a.5.5 0 0 0 .497-.454Z" clipRule="evenodd" />
    </svg>
  );
}
