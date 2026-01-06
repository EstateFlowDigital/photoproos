"use client";

import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import type { InvoiceStatus } from "@prisma/client";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRightIcon, PlusIcon, DocumentIcon } from "@/components/ui/icons";

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  totalCents: number;
  issueDate: Date;
  dueDate: Date;
  clientName: string | null;
  client: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string | null;
  } | null;
  lineItems: { id: string }[];
}

interface InvoicesPageClientProps {
  invoices: Invoice[];
  statusFilter?: InvoiceStatus;
}

export function InvoicesPageClient({ invoices, statusFilter }: InvoicesPageClientProps) {
  const tableParentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: invoices.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => 76,
    overscan: 8,
    getItemKey: (index) => invoices[index]?.id ?? index,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 0,
  });

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
        <DocumentIcon className="mx-auto h-12 w-12 text-foreground-muted" />
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
    );
  }

  return (
    <div
      ref={tableParentRef}
      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] max-h-[70vh] overflow-auto"
    >
      <table className="w-full min-w-[700px]">
        <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] sticky top-0 z-10">
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
        <tbody
          style={{
            position: "relative",
            height: rowVirtualizer.getTotalSize(),
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const invoice = invoices[virtualRow.index];
            if (!invoice) return null;

            const clientName = invoice.client?.fullName || invoice.client?.company || invoice.clientName || "Unknown";
            const isOverdue = invoice.status === "sent" && new Date(invoice.dueDate) < new Date();
            const displayStatus = isOverdue && invoice.status !== "overdue" ? "overdue" : invoice.status;
            const statusLabel = isOverdue && invoice.status !== "overdue"
              ? "Overdue"
              : formatStatusLabel(invoice.status);

            return (
              <tr
                key={invoice.id}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                className="group relative table w-full cursor-pointer transition-colors hover:bg-[var(--background-hover)]"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="absolute inset-0 z-0"
                    aria-label={`View invoice: ${invoice.invoiceNumber}`}
                  />
                  <div className="pointer-events-none relative z-10">
                    <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-foreground-muted md:hidden">
                      {clientName}
                    </p>
                  </div>
                </td>
                <td className="hidden px-6 py-4 md:table-cell">
                  <div className="pointer-events-none relative z-10 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full avatar-gradient text-xs font-medium text-white">
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
                  <div className="pointer-events-none relative z-10 text-sm">
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
                    "pointer-events-none relative z-10 inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    getStatusBadgeClasses(displayStatus),
                    invoice.status === "cancelled" && "line-through"
                  )}>
                    {statusLabel}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="pointer-events-none relative z-10 font-medium text-foreground">
                    {formatCurrency(invoice.totalCents)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="pointer-events-none relative z-10">
                    <ChevronRightIcon className="h-4 w-4 text-foreground-muted transition-colors group-hover:text-foreground" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
