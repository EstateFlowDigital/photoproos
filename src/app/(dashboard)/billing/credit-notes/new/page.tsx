export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import Link from "next/link";
import { CreditNoteForm } from "./credit-note-form";

async function getStats(organizationId: string) {
  try {
    const [totalCreditNotes, totalCredited, pendingInvoices] = await Promise.all([
      prisma.creditNote.count({ where: { organizationId } }),
      prisma.creditNote.aggregate({
        where: { organizationId },
        _sum: { amountCents: true },
      }),
      prisma.invoice.count({
        where: { organizationId, status: { in: ["sent", "overdue"] } },
      }),
    ]);

    return {
      totalCreditNotes,
      totalCredited: totalCredited._sum.amountCents || 0,
      pendingInvoices,
    };
  } catch {
    return { totalCreditNotes: 0, totalCredited: 0, pendingInvoices: 0 };
  }
}

export default async function NewCreditNotePage() {
  const organizationId = await requireOrganizationId();

  const [clients, invoices, stats] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId },
      select: { id: true, fullName: true, company: true, email: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ["sent", "overdue"] },
      },
      select: {
        id: true,
        invoiceNumber: true,
        totalCents: true,
        paidAmountCents: true,
        clientName: true,
        client: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getStats(organizationId),
  ]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6" data-element="billing-credit-notes-new-page">
      <PageHeader
        title="Issue Credit Note"
        subtitle="Create a credit note for a client refund or credit"
        actions={
          <Link
            href="/billing/credit-notes"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Credit Notes
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreditNoteForm clients={clients} invoices={invoices} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tips</h2>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">1</div>
                <p>Credit notes reduce the balance owed on an invoice.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">2</div>
                <p>Link to an invoice for automatic balance adjustment.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium shrink-0">3</div>
                <p>Include a clear reason for your records and the client.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Credit Notes Issued</span>
                <span className="text-sm font-medium text-foreground">{stats.totalCreditNotes}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Total Credited</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(stats.totalCredited)}</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-sm text-foreground-muted">Outstanding Invoices</span>
                <span className="text-sm font-medium text-foreground">{stats.pendingInvoices}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/billing/credit-notes"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View All Credit Notes
              </Link>
              <Link
                href="/invoices"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                View Invoices
              </Link>
              <Link
                href="/invoices/new"
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Create Invoice
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
