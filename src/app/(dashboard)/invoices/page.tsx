export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav, DocumentIcon, CurrencyIcon, StripeIcon, StatCard } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { InvoiceStatus } from "@prisma/client";
import { BulkExportButton } from "@/components/invoices/bulk-export-button";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { InvoicesPageClient } from "./invoices-page-client";
import { FilterPills } from "@/components/ui/filter-pills";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";


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

  // Fetch walkthrough preference
  const walkthroughPreferenceResult = await getWalkthroughPreference("invoices");
  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <div className="space-y-6">
      {/* Page Walkthrough */}
      <WalkthroughWrapper
        pageId="invoices"
        initialState={walkthroughState}
      />

      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-3">
            <BulkExportButton statusFilter={statusFilter} invoiceCount={invoices.length} />
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 md:px-4"
              data-tour="create-invoice-button"
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
      <div className="auto-grid grid-min-220 grid-gap-4" data-tour="invoice-stats">
        <StatCard label="Total Outstanding" value={formatCurrency(totalOutstanding)} />
        <StatCard label="Paid This Month" value={formatCurrency(totalPaid)} valueVariant="success" />
        <StatCard label="Pending" value={String(statusCounts.sent)} valueVariant="primary" />
        <StatCard label="Overdue" value={String(statusCounts.overdue)} valueVariant="error" />
      </div>

      {/* Status Filter Tabs */}
      <FilterPills
        options={[
          { value: "all", label: "All", count: statusCounts.all, href: "/invoices" },
          { value: "draft", label: "Draft", count: statusCounts.draft, href: "/invoices?status=draft" },
          { value: "sent", label: "Sent", count: statusCounts.sent, href: "/invoices?status=sent" },
          { value: "paid", label: "Paid", count: statusCounts.paid, href: "/invoices?status=paid" },
          { value: "overdue", label: "Overdue", count: statusCounts.overdue, href: "/invoices?status=overdue" },
        ]}
        value={statusFilter || "all"}
        asLinks
      />

      {/* Invoices Table */}
      <div data-tour="invoice-list">
        <InvoicesPageClient invoices={invoices} statusFilter={statusFilter} />
      </div>
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
