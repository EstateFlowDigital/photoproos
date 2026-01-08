"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import type { ContractStatus } from "@prisma/client";
import { Search, X, Plus, ChevronRight } from "lucide-react";
import { BulkExportButton } from "@/components/contracts/bulk-export-button";
import { PageHeader, PageContextNav, DocumentIcon } from "@/components/dashboard";

interface Contract {
  id: string;
  name: string;
  status: ContractStatus;
  createdAt: Date;
  expiresAt: Date | null;
  client: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string | null;
  } | null;
  signers: Array<{
    id: string;
    email: string;
    name: string | null;
    signedAt: Date | null;
  }>;
  template: {
    id: string;
    name: string;
  } | null;
}

interface StatusCounts {
  all: number;
  draft: number;
  sent: number;
  signed: number;
  expired: number;
}

interface ContractsPageClientProps {
  contracts: Contract[];
  templates: Array<{ id: string; name: string }>;
  statusCounts: StatusCounts;
  statusFilter?: ContractStatus;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ContractsPageClient({
  contracts,
  templates,
  statusCounts,
  statusFilter,
}: ContractsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter contracts by search query
  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;
    const query = searchQuery.toLowerCase();
    return contracts.filter((contract) => {
      const contractName = (contract.name || "").toLowerCase();
      const clientName = contract.client?.fullName?.toLowerCase() || "";
      const clientCompany = contract.client?.company?.toLowerCase() || "";
      const clientEmail = contract.client?.email?.toLowerCase() || "";
      const templateName = contract.template?.name?.toLowerCase() || "";
      return (
        contractName.includes(query) ||
        clientName.includes(query) ||
        clientCompany.includes(query) ||
        clientEmail.includes(query) ||
        templateName.includes(query)
      );
    });
  }, [contracts, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        subtitle={`${contracts.length} contract${contracts.length !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-3">
            <BulkExportButton statusFilter={statusFilter} contractCount={contracts.length} />
            <Link
              href="/contracts/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 md:px-4"
              data-tour="create-contract-button"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Create Contract</span>
            </Link>
          </div>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "All Contracts", href: "/contracts", icon: <DocumentIcon className="h-4 w-4" /> },
          { label: "Templates", href: "/contracts/templates", icon: <DocumentIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Summary Cards */}
      <div className="auto-grid grid-min-200 grid-gap-4" data-tour="contract-stats">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Awaiting Signature</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
            {statusCounts.sent}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Signed</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {statusCounts.signed}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Drafts</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {statusCounts.draft}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Templates</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {templates.length}
          </p>
        </div>
      </div>

      {/* Search and Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search contracts, clients, templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/contracts"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              !statusFilter
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            All
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
              {statusCounts.all}
            </span>
          </Link>
          <Link
            href="/contracts?status=draft"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === "draft"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            Draft
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-xs",
              statusFilter === "draft" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
            )}>
              {statusCounts.draft}
            </span>
          </Link>
          <Link
            href="/contracts?status=sent"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === "sent"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            Sent
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-xs",
              statusFilter === "sent" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
            )}>
              {statusCounts.sent}
            </span>
          </Link>
          <Link
            href="/contracts?status=signed"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === "signed"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            Signed
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-xs",
              statusFilter === "signed" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
            )}>
              {statusCounts.signed}
            </span>
          </Link>
          <Link
            href="/contracts?status=expired"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === "expired"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            Expired
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-xs",
              statusFilter === "expired" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
            )}>
              {statusCounts.expired}
            </span>
          </Link>
          <Link
            href="/contracts/templates"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground transition-colors sm:ml-auto"
          >
            <TemplateIcon className="h-4 w-4" />
            Templates
          </Link>
        </div>
      </div>

      {/* Contracts Table */}
      {contracts.length > 0 ? (
        filteredContracts.length > 0 ? (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto" data-tour="contract-list">
            {searchQuery && (
              <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-2 text-sm text-foreground-muted">
                Showing {filteredContracts.length} of {contracts.length} contracts
              </div>
            )}
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Contract
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                    Client
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted sm:table-cell">
                    Signers
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredContracts.map((contract) => {
                  const statusLabel = formatStatusLabel(contract.status);
                  const statusClasses = cn(
                    getStatusBadgeClasses(contract.status),
                    contract.status === "cancelled" && "line-through"
                  );
                  const clientName = contract.client?.fullName || contract.client?.company || "No client";
                  const signedCount = contract.signers.filter(s => s.signedAt).length;
                  const totalSigners = contract.signers.length;

                  return (
                    <tr
                      key={contract.id}
                      className="group relative transition-colors hover:bg-[var(--background-hover)] cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/contracts/${contract.id}`}
                          className="absolute inset-0 z-0"
                          aria-label={`View contract: ${contract.name}`}
                        />
                        <div className="relative z-10 pointer-events-none">
                          <p className="font-medium text-foreground">{contract.name}</p>
                          {contract.template && (
                            <p className="text-xs text-foreground-muted">
                              From: {contract.template.name}
                            </p>
                          )}
                          <p className="text-sm text-foreground-muted md:hidden">
                            {clientName}
                          </p>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 md:table-cell">
                        <div className="relative z-10 pointer-events-none flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full avatar-gradient text-xs font-medium text-white">
                            {clientName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{clientName}</p>
                            {contract.client?.email && (
                              <p className="text-xs text-foreground-muted">{contract.client.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 lg:table-cell">
                        <div className="relative z-10 pointer-events-none text-sm">
                          <p className="text-foreground">{formatDate(contract.createdAt)}</p>
                          {contract.expiresAt && (
                            <p className={cn(
                              "text-xs",
                              new Date(contract.expiresAt) < new Date() ? "text-[var(--warning-text)]" : "text-foreground-muted"
                            )}>
                              Expires {formatDate(contract.expiresAt)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "relative z-10 pointer-events-none inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          statusClasses
                        )}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <div className="relative z-10 pointer-events-none">
                          {totalSigners > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                                <div
                                  className="h-full bg-[var(--success)]"
                                  style={{ width: `${(signedCount / totalSigners) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-foreground-muted">
                                {signedCount}/{totalSigners}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-foreground-muted">No signers</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative z-10 pointer-events-none">
                          <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
            <Search className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No contracts found</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              No contracts match &quot;{searchQuery}&quot;. Try a different search term.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              Clear search
            </button>
          </div>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <ContractIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {statusFilter ? `No ${statusFilter} contracts` : "No contracts yet"}
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {statusFilter
              ? "Try a different filter or create a new contract."
              : "Create your first contract to start getting signatures."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/contracts/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
            >
              <Plus className="h-4 w-4" />
              Create Contract
            </Link>
            {templates.length === 0 && (
              <Link
                href="/contracts/templates/new"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-secondary)]"
              >
                <TemplateIcon className="h-4 w-4" />
                Create Template
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Zm10.857 5.691a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
    </svg>
  );
}
