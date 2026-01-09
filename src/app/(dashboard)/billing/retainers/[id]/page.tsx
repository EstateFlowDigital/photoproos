import { PageHeader } from "@/components/dashboard";
import { prisma } from "@/lib/db";
import { requireOrganizationId } from "@/lib/actions/auth-helper";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RetainerActions } from "./retainer-actions";
import type { RetainerTransactionType } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RetainerDetailPage({ params }: Props) {
  const { id } = await params;
  const organizationId = await requireOrganizationId();

  const retainer = await prisma.clientRetainer.findFirst({
    where: { id, organizationId },
    include: {
      client: {
        select: { id: true, fullName: true, company: true, email: true, phone: true },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!retainer) {
    notFound();
  }

  // Get available invoices for applying the retainer
  const availableInvoices = retainer.balanceCents > 0 && retainer.isActive
    ? await prisma.invoice.findMany({
        where: {
          organizationId,
          clientId: retainer.clientId,
          status: { in: ["sent", "overdue"] },
        },
        select: {
          id: true,
          invoiceNumber: true,
          totalCents: true,
          paidAmountCents: true,
          clientName: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const getTransactionBadge = (type: RetainerTransactionType) => {
    const styles: Record<RetainerTransactionType, string> = {
      deposit: "bg-[var(--success)]/10 text-[var(--success)]",
      usage: "bg-[var(--primary)]/10 text-[var(--primary)]",
      refund: "bg-[var(--warning)]/10 text-[var(--warning)]",
      adjustment: "bg-[var(--ai)]/10 text-[var(--ai)]",
    };

    const labels: Record<RetainerTransactionType, string> = {
      deposit: "Deposit",
      usage: "Usage",
      refund: "Refund",
      adjustment: "Adjustment",
    };

    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const isLowBalance = retainer.lowBalanceThresholdCents !== null &&
    retainer.balanceCents <= retainer.lowBalanceThresholdCents;

  return (
    <div className="flex flex-col gap-6 p-6" data-element="billing-retainers-detail-page">
      <PageHeader
        title={`Retainer for ${retainer.client.fullName || retainer.client.company || retainer.client.email}`}
        subtitle="Prepaid balance and transaction history"
        actions={
          <Link
            href="/billing/retainers"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Back to List
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Overview */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Current Balance</p>
                <p className={`text-4xl font-bold ${isLowBalance ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>
                  {formatCurrency(retainer.balanceCents)}
                </p>
                {isLowBalance && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-[var(--warning)]">
                    <AlertIcon className="h-4 w-4" />
                    Below threshold ({formatCurrency(retainer.lowBalanceThresholdCents || 0)})
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {retainer.isActive ? (
                  <span className="rounded-full bg-[var(--success)]/10 px-3 py-1 text-sm font-medium text-[var(--success)]">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-[var(--error)]/10 px-3 py-1 text-sm font-medium text-[var(--error)]">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                <p className="text-sm text-foreground-muted">Total Deposited</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(retainer.totalDepositedCents)}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                <p className="text-sm text-foreground-muted">Total Used</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(retainer.totalUsedCents)}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                <p className="text-sm text-foreground-muted">Low Balance Alert</p>
                <p className="text-lg font-semibold text-foreground">
                  {retainer.lowBalanceThresholdCents
                    ? formatCurrency(retainer.lowBalanceThresholdCents)
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Transaction History</h3>

            {retainer.transactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-foreground-muted">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[var(--card-border)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-foreground-muted">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-foreground-muted">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {retainer.transactions.map((tx) => (
                      <tr key={tx.id} className="transition-colors hover:bg-[var(--background-secondary)]">
                        <td className="px-4 py-3 text-sm text-foreground-muted">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {getTransactionBadge(tx.type)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground">{tx.description || "-"}</p>
                          {tx.invoiceId && (
                            <Link
                              href={`/invoices/${tx.invoiceId}`}
                              className="text-xs text-[var(--primary)] hover:underline"
                            >
                              View Invoice
                            </Link>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${
                            tx.type === "deposit" || tx.type === "adjustment"
                              ? "text-[var(--success)]"
                              : "text-foreground"
                          }`}>
                            {tx.type === "deposit" ? "+" : tx.type === "adjustment" ? "±" : "-"}
                            {formatCurrency(tx.amountCents)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground-muted">
                          {formatCurrency(tx.balanceAfterCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          {retainer.notes && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h3 className="font-semibold text-foreground mb-4">Notes</h3>
              <p className="text-foreground whitespace-pre-wrap">{retainer.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Client</h3>
            <Link
              href={`/clients/${retainer.client.id}`}
              className="block rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 transition-colors hover:bg-[var(--background-hover)]"
            >
              <p className="font-medium text-foreground">
                {retainer.client.fullName || retainer.client.company || "Unknown"}
              </p>
              {retainer.client.company && retainer.client.fullName && (
                <p className="text-sm text-foreground-muted">{retainer.client.company}</p>
              )}
              <p className="text-sm text-foreground-muted">{retainer.client.email}</p>
              {retainer.client.phone && (
                <p className="text-sm text-foreground-muted">{retainer.client.phone}</p>
              )}
            </Link>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Actions</h3>
            <RetainerActions
              retainer={{
                id: retainer.id,
                clientId: retainer.clientId,
                balanceCents: retainer.balanceCents,
                isActive: retainer.isActive,
                lowBalanceThresholdCents: retainer.lowBalanceThresholdCents,
              }}
              availableInvoices={availableInvoices}
            />
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--foreground-muted)]" />
                <div>
                  <p className="text-sm font-medium text-foreground">Created</p>
                  <p className="text-xs text-foreground-muted">
                    {new Date(retainer.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--primary)]" />
                <div>
                  <p className="text-sm font-medium text-foreground">Last Updated</p>
                  <p className="text-xs text-foreground-muted">
                    {new Date(retainer.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {retainer.transactions[0] && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[var(--success)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Last Transaction</p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(retainer.transactions[0].createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}
