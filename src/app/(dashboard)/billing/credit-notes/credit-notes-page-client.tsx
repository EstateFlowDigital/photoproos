"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import type { CreditNoteStatus } from "@prisma/client";
import { voidCreditNote } from "@/lib/actions/credit-notes";

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  status: CreditNoteStatus;
  amountCents: number;
  appliedAmountCents: number;
  refundedAmountCents: number;
  currency: string;
  reason: string | null;
  createdAt: Date;
  client: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string;
  } | null;
  invoice: {
    id: string;
    invoiceNumber: string;
  } | null;
}

interface CreditNotesPageClientProps {
  creditNotes: CreditNote[];
  statusFilter?: CreditNoteStatus;
}

export function CreditNotesPageClient({ creditNotes, statusFilter }: CreditNotesPageClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCreditNotes = creditNotes.filter((cn) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cn.creditNoteNumber.toLowerCase().includes(query) ||
      cn.client?.fullName?.toLowerCase().includes(query) ||
      cn.client?.company?.toLowerCase().includes(query) ||
      cn.client?.email?.toLowerCase().includes(query) ||
      cn.invoice?.invoiceNumber?.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    if (selectedIds.size === filteredCreditNotes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCreditNotes.map((cn) => cn.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleVoid = async (id: string) => {
    if (!confirm("Are you sure you want to void this credit note? This cannot be undone.")) return;
    setIsLoading(id);
    const result = await voidCreditNote(id);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(null);
  };

  const getStatusBadge = (status: CreditNoteStatus) => {
    const styles: Record<CreditNoteStatus, string> = {
      draft: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
      issued: "bg-[var(--primary)]/10 text-[var(--primary)]",
      applied: "bg-[var(--success)]/10 text-[var(--success)]",
      refunded: "bg-[var(--warning)]/10 text-[var(--warning)]",
      voided: "bg-[var(--error)]/10 text-[var(--error)]",
    };

    const labels: Record<CreditNoteStatus, string> = {
      draft: "Draft",
      issued: "Issued",
      applied: "Applied",
      refunded: "Refunded",
      voided: "Voided",
    };

    return (
      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", styles[status])}>
        {labels[status]}
      </span>
    );
  };

  const getAvailableAmount = (cn: CreditNote) => {
    return cn.amountCents - cn.appliedAmountCents - cn.refundedAmountCents;
  };

  if (filteredCreditNotes.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
        <CreditIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {searchQuery ? "No credit notes found" : "No credit notes yet"}
        </h3>
        <p className="mt-2 text-foreground-muted">
          {searchQuery
            ? "Try adjusting your search terms"
            : "Issue credit notes to provide refunds or credits to clients."}
        </p>
        {!searchQuery && (
          <Link
            href="/billing/credit-notes/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Issue Credit Note
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search credit notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredCreditNotes.length && filteredCreditNotes.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-[var(--card-border)]"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Credit Note
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Invoice
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Available
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {filteredCreditNotes.map((creditNote) => (
              <tr
                key={creditNote.id}
                className={cn(
                  "transition-colors hover:bg-[var(--background-secondary)]",
                  selectedIds.has(creditNote.id) && "bg-[var(--primary)]/5"
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(creditNote.id)}
                    onChange={() => handleSelect(creditNote.id)}
                    className="rounded border-[var(--card-border)]"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/billing/credit-notes/${creditNote.id}`}
                    className="font-medium text-foreground hover:text-[var(--primary)]"
                  >
                    {creditNote.creditNoteNumber}
                  </Link>
                  <p className="text-sm text-foreground-muted">
                    {new Date(creditNote.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {creditNote.client ? (
                    <>
                      <p className="font-medium text-foreground">
                        {creditNote.client.fullName || creditNote.client.company || "Unknown"}
                      </p>
                      <p className="text-sm text-foreground-muted">{creditNote.client.email}</p>
                    </>
                  ) : (
                    <p className="text-foreground-muted">No client</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {creditNote.invoice ? (
                    <Link
                      href={`/invoices/${creditNote.invoice.id}`}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      {creditNote.invoice.invoiceNumber}
                    </Link>
                  ) : (
                    <p className="text-sm text-foreground-muted">—</p>
                  )}
                </td>
                <td className="px-4 py-3">{getStatusBadge(creditNote.status)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">{formatCurrency(creditNote.amountCents)}</p>
                </td>
                <td className="px-4 py-3">
                  <p
                    className={cn(
                      "font-medium",
                      getAvailableAmount(creditNote) > 0 ? "text-[var(--success)]" : "text-foreground-muted"
                    )}
                  >
                    {formatCurrency(getAvailableAmount(creditNote))}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {creditNote.status === "issued" && (
                      <Link
                        href={`/billing/credit-notes/${creditNote.id}/apply`}
                        className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                      >
                        Apply
                      </Link>
                    )}
                    {creditNote.status === "issued" && (
                      <button
                        onClick={() => handleVoid(creditNote.id)}
                        disabled={isLoading === creditNote.id}
                        className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)] disabled:opacity-50"
                        title="Void"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function CreditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
