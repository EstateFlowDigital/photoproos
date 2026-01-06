"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CurrencyIcon } from "@/components/ui/icons";

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

interface Payment {
  id: string;
  status: string;
  amountCents: number;
  description: string | null;
  clientEmail: string | null;
  createdAt: Date;
  project: {
    name: string;
  } | null;
}

interface PaymentsPageClientProps {
  payments: Payment[];
  filter: string;
}

export function PaymentsPageClient({ payments, filter }: PaymentsPageClientProps) {
  const tableParentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: payments.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => 68,
    overscan: 8,
    getItemKey: (index) => payments[index]?.id ?? index,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 0,
  });

  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
        <CurrencyIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No payments found</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          {filter === "all"
            ? "Payments will appear here once clients pay for galleries."
            : `No ${filter} payments found.`}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={tableParentRef}
      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] max-h-[70vh] overflow-auto"
    >
      <table className="w-full min-w-[600px]">
        <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Description
            </th>
            <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Status
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
            const payment = payments[virtualRow.index];
            if (!payment) return null;

            return (
              <tr
                key={payment.id}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                className="table w-full transition-colors hover:bg-[var(--background-hover)]"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">
                    {payment.project?.name || payment.description || "Payment"}
                  </p>
                  {payment.clientEmail && (
                    <p className="text-sm text-foreground-muted">{payment.clientEmail}</p>
                  )}
                </td>
                <td className="hidden px-6 py-4 text-sm text-foreground-muted md:table-cell">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-foreground">
                  {formatCurrency(payment.amountCents)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase",
                      getStatusBadgeClasses(payment.status),
                      payment.status === "refunded" && "line-through"
                    )}
                  >
                    {formatStatusLabel(payment.status)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
