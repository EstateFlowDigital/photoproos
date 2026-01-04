export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav, DocumentIcon, CurrencyIcon, StripeIcon } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import type { InvoiceStatus } from "@prisma/client";

// Helper to format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Status badge classes are centralized in lib/status-badges.ts

interface PageProps {
  searchParams: Promise<{ status?: InvoiceStatus }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
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

  // Fetch invoices with optional status filter
  const invoices = await prisma.invoice.findMany({
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
      lineItems: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate summary metrics
  const allInvoices = await prisma.invoice.findMany({
    where: { organizationId: organization.id },
    select: { status: true, totalCents: true },
  });

  const totalOutstanding = allInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.totalCents, 0);

  const totalPaid = allInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.totalCents, 0);

  const statusCounts = {
    all: allInvoices.length,
    draft: allInvoices.filter((i) => i.status === "draft").length,
    sent: allInvoices.filter((i) => i.status === "sent").length,
    paid: allInvoices.filter((i) => i.status === "paid").length,
    overdue: allInvoices.filter((i) => i.status === "overdue").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
        actions={
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Invoice
          </Link>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "All Invoices", href: "/invoices", icon: <DocumentIcon className="h-4 w-4" /> },
          { label: "Payments", href: "/payments", icon: <CurrencyIcon className="h-4 w-4" /> },
        ]}
        integrations={[
          {
            label: "Stripe",
            href: "/settings/payments",
            icon: <StripeIcon className="h-4 w-4" />,
            isConnected: false,
          },
        ]}
      />

      {/* Summary Cards */}
      <div className="auto-grid grid-min-220 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Outstanding</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Paid This Month</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
            {statusCounts.sent}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Overdue</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--error)]">
            {statusCounts.overdue}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/invoices"
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
          href="/invoices?status=draft"
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
          href="/invoices?status=sent"
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
          href="/invoices?status=paid"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            statusFilter === "paid"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Paid
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-xs",
            statusFilter === "paid" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
          )}>
            {statusCounts.paid}
          </span>
        </Link>
        <Link
          href="/invoices?status=overdue"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            statusFilter === "overdue"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
          )}
        >
          Overdue
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-xs",
            statusFilter === "overdue" ? "bg-white/20" : "bg-[var(--background-tertiary)]"
          )}>
            {statusCounts.overdue}
          </span>
        </Link>
      </div>

      {/* Invoices Table */}
      {invoices.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Invoice
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Client
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {invoices.map((invoice) => {
                const clientName = invoice.client?.fullName || invoice.client?.company || invoice.clientName || "Unknown";
                const isOverdue = invoice.status === "sent" && new Date(invoice.dueDate) < new Date();
                const displayStatus = isOverdue && invoice.status !== "overdue" ? "overdue" : invoice.status;
                const statusLabel = isOverdue && invoice.status !== "overdue"
                  ? "Overdue"
                  : formatStatusLabel(invoice.status);

                return (
                  <tr
                    key={invoice.id}
                    className="transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-foreground-muted md:hidden">
                          {clientName}
                        </p>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 md:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-medium text-white">
                          {clientName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{clientName}</p>
                          {invoice.client?.email && (
                            <p className="text-xs text-foreground-muted">{invoice.client.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 lg:table-cell">
                      <div className="text-sm">
                        <p className="text-foreground">{formatDate(invoice.issueDate)}</p>
                        <p className={cn(
                          "text-xs",
                          isOverdue ? "text-[var(--error)]" : "text-foreground-muted"
                        )}>
                          Due {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        getStatusBadgeClasses(displayStatus),
                        invoice.status === "cancelled" && "line-through"
                      )}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-foreground">
                        {formatCurrency(invoice.totalCents)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-[var(--background-hover)] p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <InvoiceIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {statusFilter ? `No ${statusFilter} invoices` : "No invoices yet"}
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {statusFilter
              ? "Try a different filter or create a new invoice."
              : "Create your first invoice to start billing clients."}
          </p>
          <Link
            href="/invoices/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Invoice
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
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
