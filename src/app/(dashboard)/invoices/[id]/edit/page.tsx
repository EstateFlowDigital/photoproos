export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { InvoiceEditor } from "./invoice-editor";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

async function getStats(organizationId: string) {
  try {
    const [totalInvoices, paidInvoices, pendingAmount] = await Promise.all([
      prisma.invoice.count({ where: { organizationId } }),
      prisma.invoice.count({ where: { organizationId, status: "paid" } }),
      prisma.invoice.aggregate({
        where: { organizationId, status: { in: ["sent", "overdue"] } },
        _sum: { totalCents: true },
      }),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      pendingAmount: pendingAmount._sum.totalCents || 0,
    };
  } catch {
    return { totalInvoices: 0, paidInvoices: 0, pendingAmount: 0 };
  }
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;

  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  // Fetch invoice with line items
  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      organizationId: auth.organizationId,
    },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          company: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Only allow editing draft invoices
  if (invoice.status !== "draft") {
    redirect(`/invoices/${id}`);
  }

  // Fetch clients, services, and stats
  const [clients, services, stats] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.service.findMany({
      where: {
        organizationId: auth.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
      },
      orderBy: { name: "asc" },
    }),
    getStats(auth.organizationId),
  ]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency || "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6" data-element="invoices-edit-page">
      <PageHeader
        title={`Edit ${invoice.invoiceNumber}`}
        subtitle="Modify invoice details and line items"
        actions={
          <Link
            href={`/invoices/${id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Invoice
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InvoiceEditor
            invoice={{
              id: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              clientId: invoice.clientId,
              clientName: invoice.clientName,
              clientEmail: invoice.clientEmail,
              clientAddress: invoice.clientAddress,
              dueDate: invoice.dueDate.toISOString().split("T")[0],
              notes: invoice.notes,
              terms: invoice.terms,
              currency: invoice.currency,
              subtotalCents: invoice.subtotalCents,
              discountCents: invoice.discountCents,
              taxCents: invoice.taxCents,
              totalCents: invoice.totalCents,
              lateFeeEnabled: invoice.lateFeeEnabled,
              lateFeeType: invoice.lateFeeType,
              lateFeePercent: invoice.lateFeePercent,
              lateFeeFlatCents: invoice.lateFeeFlatCents,
              lineItems: invoice.lineItems.map((item) => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitCents: item.unitCents,
                totalCents: item.totalCents,
                itemType: item.itemType,
                sortOrder: item.sortOrder,
              })),
            }}
            clients={clients}
            services={services}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Add line items from your services or create custom items.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Set a due date to enable automatic late fee calculation.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Preview your invoice before sending to the client.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Invoice Summary</h2>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Status</span>
                <span className="inline-flex items-center rounded-full bg-[var(--background-tertiary)] px-2 py-0.5 text-xs font-medium text-foreground-muted capitalize">
                  {invoice.status}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Client</span>
                <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                  {invoice.client?.fullName || invoice.clientName || "Not set"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Total</span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(invoice.totalCents)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Total Invoices</span>
                <span className="text-sm font-medium text-foreground">{stats.totalInvoices}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Paid Invoices</span>
                <span className="text-sm font-medium text-foreground">{stats.paidInvoices}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Pending Amount</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(stats.pendingAmount)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/invoices"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View All Invoices
              </Link>
              <Link
                href="/invoices/new"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Create New Invoice
              </Link>
              <Link
                href="/services"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Manage Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}
