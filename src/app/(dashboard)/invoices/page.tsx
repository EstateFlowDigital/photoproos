export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav, DocumentIcon, CurrencyIcon, StripeIcon } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@prisma/client";
import { BulkExportButton } from "@/components/invoices/bulk-export-button";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { InvoicesPageClient } from "./invoices-page-client";


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
          <div className="flex items-center gap-3">
            <BulkExportButton statusFilter={statusFilter} invoiceCount={invoices.length} />
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 md:px-4"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden md:inline">Create Invoice</span>
            </Link>
          </div>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "All Invoices", href: "/invoices", icon: <DocumentIcon className="h-4 w-4" /> },
          { label: "Recurring", href: "/invoices/recurring", icon: <RepeatIcon className="h-4 w-4" /> },
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
      <InvoicesPageClient invoices={invoices} statusFilter={statusFilter} />
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

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}
