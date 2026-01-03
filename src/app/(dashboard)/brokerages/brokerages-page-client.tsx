"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader, StatCard } from "@/components/dashboard";

interface Brokerage {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  contactName: string | null;
  isActive: boolean;
  totalRevenueCents: number;
  activeAgentCount: number;
  _count?: {
    agents: number;
    contracts: number;
    orderPages: number;
  };
}

interface Stats {
  totalBrokerages: number;
  activeBrokerages: number;
  totalAgents: number;
  totalRevenue: number;
}

interface BrokeragesPageClientProps {
  brokerages: Brokerage[];
  stats: Stats;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function BrokeragesPageClient({ brokerages, stats }: BrokeragesPageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(true);

  // Filter brokerages
  const filteredBrokerages = brokerages.filter((brokerage) => {
    const matchesSearch =
      !searchQuery ||
      brokerage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brokerage.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brokerage.contactName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActive = showInactive || brokerage.isActive;

    return matchesSearch && matchesActive;
  });

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Brokerages"
        subtitle="Manage brokerage partnerships and agent accounts"
        actions={
          <Link
            href="/brokerages/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Brokerage
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Brokerages"
          value={stats.totalBrokerages.toString()}
          icon={<BuildingIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Active Brokerages"
          value={stats.activeBrokerages.toString()}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          label="Total Agents"
          value={stats.totalAgents.toString()}
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<CurrencyIcon className="h-5 w-5" />}
          variant="success"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search brokerages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground-secondary">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--card)] text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          Show inactive
        </label>
      </div>

      {/* Brokerages Table */}
      {filteredBrokerages.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Brokerage
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Contact
                </th>
                <th className="hidden px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                  Agents
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Revenue
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredBrokerages.map((brokerage) => (
                <tr
                  key={brokerage.id}
                  className="group relative transition-colors hover:bg-[var(--background-hover)] cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/brokerages/${brokerage.id}`}
                      className="absolute inset-0 z-0"
                      aria-label={`View brokerage: ${brokerage.name}`}
                    />
                    <div className="relative z-10 pointer-events-none flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] font-medium">
                        {brokerage.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{brokerage.name}</p>
                        <p className="text-sm text-foreground-muted">{brokerage.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <div className="relative z-10 pointer-events-none">
                      {brokerage.contactName && (
                        <p className="text-sm text-foreground">{brokerage.contactName}</p>
                      )}
                      {brokerage.email && (
                        <p className="text-sm text-foreground-muted">{brokerage.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 text-center lg:table-cell">
                    <span className="relative z-10 pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-[var(--background-secondary)] px-2.5 py-1 text-xs font-medium text-foreground-secondary">
                      <UsersIcon className="h-3 w-3" />
                      {brokerage._count?.agents || brokerage.activeAgentCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        "relative z-10 pointer-events-none font-medium",
                        brokerage.totalRevenueCents > 0
                          ? "text-[var(--success)]"
                          : "text-foreground-muted"
                      )}
                    >
                      {formatCurrency(brokerage.totalRevenueCents)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        "relative z-10 pointer-events-none inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        brokerage.isActive
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                      )}
                    >
                      {brokerage.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative z-10 pointer-events-none">
                      <ChevronRightIcon className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <BuildingIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No brokerages yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Add your first brokerage partner to start managing agents and contracts.
          </p>
          <Link
            href="/brokerages/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Brokerage
          </Link>
        </div>
      )}
    </>
  );
}

// Icon Components
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

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5h-12.5a.75.75 0 0 1 0-1.5H4Zm3-11a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM7 8.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM7 11.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3.5-2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4Z" clipRule="evenodd" />
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

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152Z" />
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-6a.75.75 0 0 1 .75.75v.316a3.78 3.78 0 0 1 1.653.713c.426.33.744.74.925 1.2a.75.75 0 0 1-1.395.55 1.35 1.35 0 0 0-.447-.563 2.187 2.187 0 0 0-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 1 1-1.5 0v-.3a3.78 3.78 0 0 1-1.653-.713 2.71 2.71 0 0 1-.925-1.199.75.75 0 0 1 1.395-.55c.1.253.27.464.447.563.243.137.518.247.736.363V10.7a5.574 5.574 0 0 1-1.96-.696C4.504 9.49 4 8.735 4 7.875c0-.86.504-1.616 1.29-2.13a5.574 5.574 0 0 1 1.96-.696V4.75A.75.75 0 0 1 10 4Z" clipRule="evenodd" />
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
