"use client";

import Link from "next/link";
import { formatCurrencyWhole } from "@/lib/utils/units";

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalCents: number;
  balanceCents: number;
  dueDate: string;
  daysOverdue: number;
}

interface OverdueInvoicesWidgetProps {
  invoices: OverdueInvoice[];
  totalOverdueCents: number;
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
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

function getUrgencyColor(daysOverdue: number): string {
  if (daysOverdue > 30) return "text-red-500";
  if (daysOverdue > 14) return "text-orange-500";
  return "text-yellow-500";
}

function getUrgencyBg(daysOverdue: number): string {
  if (daysOverdue > 30) return "bg-red-500/10";
  if (daysOverdue > 14) return "bg-orange-500/10";
  return "bg-yellow-500/10";
}

export function OverdueInvoicesWidget({ invoices, totalOverdueCents }: OverdueInvoicesWidgetProps) {
  if (invoices.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
            <AlertIcon className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Overdue Invoices</h3>
            <p className="text-xs text-foreground-muted">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} need attention</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-red-500">{formatCurrencyWhole(totalOverdueCents)}</div>
          <div className="text-xs text-foreground-muted">total overdue</div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="divide-y divide-[var(--card-border)]">
        {invoices.slice(0, 5).map((invoice) => (
          <Link
            key={invoice.id}
            href={`/invoices/${invoice.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-[var(--background-secondary)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {invoice.clientName}
                </span>
                <span className="text-xs text-foreground-muted">
                  #{invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getUrgencyBg(invoice.daysOverdue)} ${getUrgencyColor(invoice.daysOverdue)}`}>
                  {invoice.daysOverdue} day{invoice.daysOverdue !== 1 ? "s" : ""} overdue
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {formatCurrencyWhole(invoice.balanceCents)}
              </span>
              <ChevronRightIcon className="h-4 w-4 text-foreground-muted" />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      {invoices.length > 5 && (
        <div className="border-t border-[var(--card-border)] px-4 py-2">
          <Link
            href="/invoices?status=overdue"
            className="flex items-center justify-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            View all {invoices.length} overdue invoices
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}

      {invoices.length <= 5 && (
        <div className="border-t border-[var(--card-border)] px-4 py-2">
          <Link
            href="/invoices?status=overdue"
            className="flex items-center justify-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            View all overdue invoices
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
