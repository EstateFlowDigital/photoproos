export const dynamic = "force-dynamic";

import { PageHeader, PageContextNav, DocumentIcon } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ContractStatus } from "@prisma/client";

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Status badge colors
const statusConfig: Record<ContractStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-[var(--background-secondary)] text-foreground-muted",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-500/10 text-blue-400",
  },
  signed: {
    label: "Signed",
    className: "bg-green-500/10 text-green-400",
  },
  expired: {
    label: "Expired",
    className: "bg-orange-500/10 text-orange-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-[var(--background-secondary)] text-foreground-muted line-through",
  },
};

interface PageProps {
  searchParams: Promise<{ status?: ContractStatus }>;
}

export default async function ContractsPage({ searchParams }: PageProps) {
  const { status: statusFilter } = await searchParams;

  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
      </div>
    );
  }

  // Fetch contracts with optional status filter
  const contracts = await prisma.contract.findMany({
    where: {
      organizationId: organization.id,
      ...(statusFilter && { status: statusFilter }),
    },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          company: true,
          email: true,
        },
      },
      signers: {
        select: {
          id: true,
          email: true,
          name: true,
          signedAt: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch templates for quick reference
  const templates = await prisma.contractTemplate.findMany({
    where: { organizationId: organization.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Calculate summary metrics
  const allContracts = await prisma.contract.findMany({
    where: { organizationId: organization.id },
    select: { status: true },
  });

  const statusCounts = {
    all: allContracts.length,
    draft: allContracts.filter((c) => c.status === "draft").length,
    sent: allContracts.filter((c) => c.status === "sent").length,
    signed: allContracts.filter((c) => c.status === "signed").length,
    expired: allContracts.filter((c) => c.status === "expired").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        subtitle={`${contracts.length} contract${contracts.length !== 1 ? "s" : ""}`}
        actions={
          <Link
            href="/contracts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Contract
          </Link>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Awaiting Signature</p>
          <p className="mt-2 text-2xl font-semibold text-blue-400">
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
          className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground transition-colors"
        >
          <TemplateIcon className="h-4 w-4" />
          Templates
        </Link>
      </div>

      {/* Contracts Table */}
      {contracts.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
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
              {contracts.map((contract) => {
                const status = statusConfig[contract.status];
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
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-medium text-white">
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
                            new Date(contract.expiresAt) < new Date() ? "text-orange-400" : "text-foreground-muted"
                          )}>
                            Expires {formatDate(contract.expiresAt)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "relative z-10 pointer-events-none inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        status.className
                      )}>
                        {status.label}
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
                        <ChevronRightIcon className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
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
              <PlusIcon className="h-4 w-4" />
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
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
