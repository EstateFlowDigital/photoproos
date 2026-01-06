"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import type { CreditNoteStatus } from "@prisma/client";
import { voidCreditNote } from "@/lib/actions/credit-notes";

type SortField = "createdAt" | "creditNoteNumber" | "client" | "amountCents" | "status" | "available";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | CreditNoteStatus;

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const STATUS_STYLES: Record<CreditNoteStatus, string> = {
  draft: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
  issued: "bg-[var(--primary)]/10 text-[var(--primary)]",
  applied: "bg-[var(--success)]/10 text-[var(--success)]",
  refunded: "bg-[var(--warning)]/10 text-[var(--warning)]",
  voided: "bg-[var(--error)]/10 text-[var(--error)]",
};

const STATUS_LABELS: Record<CreditNoteStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  applied: "Applied",
  refunded: "Refunded",
  voided: "Voided",
};

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

export function CreditNotesPageClient({ creditNotes, statusFilter: initialStatus }: CreditNotesPageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus || "all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const getAvailableAmount = (cn: CreditNote) => {
    return cn.amountCents - cn.appliedAmountCents - cn.refundedAmountCents;
  };

  // Calculate stats for filter tabs
  const stats = useMemo(() => ({
    total: creditNotes.length,
    draft: creditNotes.filter((cn) => cn.status === "draft").length,
    issued: creditNotes.filter((cn) => cn.status === "issued").length,
    applied: creditNotes.filter((cn) => cn.status === "applied").length,
    refunded: creditNotes.filter((cn) => cn.status === "refunded").length,
    voided: creditNotes.filter((cn) => cn.status === "voided").length,
  }), [creditNotes]);

  const filteredAndSorted = useMemo(() => {
    let result = [...creditNotes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cn) =>
          cn.creditNoteNumber.toLowerCase().includes(query) ||
          cn.client?.fullName?.toLowerCase().includes(query) ||
          cn.client?.company?.toLowerCase().includes(query) ||
          cn.client?.email?.toLowerCase().includes(query) ||
          cn.invoice?.invoiceNumber?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((cn) => cn.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "creditNoteNumber":
          comparison = a.creditNoteNumber.localeCompare(b.creditNoteNumber);
          break;
        case "client":
          const aName = a.client?.fullName || a.client?.company || "";
          const bName = b.client?.fullName || b.client?.company || "";
          comparison = aName.localeCompare(bName);
          break;
        case "amountCents":
          comparison = a.amountCents - b.amountCents;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "available":
          comparison = getAvailableAmount(a) - getAvailableAmount(b);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [creditNotes, searchQuery, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedResults.map((cn) => cn.id)));
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

  const handleBulkVoid = async () => {
    const voidableIds = Array.from(selectedIds).filter((id) => {
      const cn = creditNotes.find((c) => c.id === id);
      return cn?.status === "issued";
    });

    if (voidableIds.length === 0) {
      alert("No issued credit notes selected. Only issued credit notes can be voided.");
      return;
    }

    if (!confirm(`Are you sure you want to void ${voidableIds.length} credit note(s)? This cannot be undone.`)) return;

    setIsBulkLoading(true);
    for (const id of voidableIds) {
      await voidCreditNote(id);
    }
    setSelectedIds(new Set());
    router.refresh();
    setIsBulkLoading(false);
  };

  const handleExportCSV = () => {
    const headers = ["Credit Note Number", "Client", "Email", "Invoice", "Status", "Amount", "Available", "Created"];
    const rows = filteredAndSorted.map((cn) => [
      cn.creditNoteNumber,
      cn.client?.fullName || cn.client?.company || "",
      cn.client?.email || "",
      cn.invoice?.invoiceNumber || "",
      STATUS_LABELS[cn.status],
      (cn.amountCents / 100).toFixed(2),
      (getAvailableAmount(cn) / 100).toFixed(2),
      new Date(cn.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credit-notes-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <SortNeutralIcon className="ml-1 h-4 w-4 text-foreground-muted" />;
    }
    return sortOrder === "asc" ? (
      <SortAscIcon className="ml-1 h-4 w-4 text-foreground" />
    ) : (
      <SortDescIcon className="ml-1 h-4 w-4 text-foreground" />
    );
  };

  const filterTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "draft", label: "Draft", count: stats.draft },
    { key: "issued", label: "Issued", count: stats.issued },
    { key: "applied", label: "Applied", count: stats.applied },
    { key: "refunded", label: "Refunded", count: stats.refunded },
    { key: "voided", label: "Voided", count: stats.voided },
  ];

  if (creditNotes.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
        <CreditIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No credit notes yet</h3>
        <p className="mt-2 text-foreground-muted">
          Issue credit notes to provide refunds or credits to clients.
        </p>
        <Link
          href="/billing/credit-notes/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          <PlusIcon className="h-4 w-4" />
          Issue Credit Note
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter credit notes by status">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={statusFilter === tab.key}
            aria-controls="credit-notes-table"
            onClick={() => handleFilterChange(tab.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === tab.key
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground hover:bg-[var(--background-hover)]"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search credit notes..."
            aria-label="Search credit notes"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-foreground-muted">{selectedIds.size} selected</span>
              <button
                onClick={handleBulkVoid}
                disabled={isBulkLoading}
                className="rounded-lg bg-[var(--error)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isBulkLoading ? "Voiding..." : "Void Selected"}
              </button>
            </>
          )}
          <button
            onClick={handleExportCSV}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            aria-label="Export to CSV"
          >
            <span className="flex items-center gap-1.5">
              <DownloadIcon className="h-4 w-4" />
              Export
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]" id="credit-notes-table" role="tabpanel">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Credit notes list">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all credit notes on this page"
                    checked={selectedIds.size === paginatedResults.length && paginatedResults.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-[var(--card-border)]"
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("creditNoteNumber")}
                    aria-label={`Sort by credit note number, currently ${sortField === "creditNoteNumber" ? sortOrder : "unsorted"}`}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-foreground-muted hover:text-foreground"
                  >
                    Credit Note
                    <SortIcon field="creditNoteNumber" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("client")}
                    aria-label={`Sort by client, currently ${sortField === "client" ? sortOrder : "unsorted"}`}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-foreground-muted hover:text-foreground"
                  >
                    Client
                    <SortIcon field="client" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Invoice
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("status")}
                    aria-label={`Sort by status, currently ${sortField === "status" ? sortOrder : "unsorted"}`}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-foreground-muted hover:text-foreground"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("amountCents")}
                    aria-label={`Sort by amount, currently ${sortField === "amountCents" ? sortOrder : "unsorted"}`}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-foreground-muted hover:text-foreground"
                  >
                    Amount
                    <SortIcon field="amountCents" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("available")}
                    aria-label={`Sort by available amount, currently ${sortField === "available" ? sortOrder : "unsorted"}`}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-foreground-muted hover:text-foreground"
                  >
                    Available
                    <SortIcon field="available" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-foreground-muted">
                    No credit notes match your filters
                  </td>
                </tr>
              ) : (
                paginatedResults.map((creditNote) => (
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
                        aria-label={`Select credit note ${creditNote.creditNoteNumber}`}
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
                        <Link
                          href={`/clients/${creditNote.client.id}`}
                          className="font-medium text-foreground hover:text-[var(--primary)]"
                        >
                          {creditNote.client.fullName || creditNote.client.company || "Unknown"}
                        </Link>
                      ) : (
                        <span className="text-foreground-muted">No client</span>
                      )}
                      {creditNote.client?.email && (
                        <p className="text-sm text-foreground-muted">{creditNote.client.email}</p>
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
                        <span className="text-sm text-foreground-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLES[creditNote.status])}>
                        {STATUS_LABELS[creditNote.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-foreground">{formatCurrency(creditNote.amountCents)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "font-medium",
                          getAvailableAmount(creditNote) > 0 ? "text-[var(--success)]" : "text-foreground-muted"
                        )}
                      >
                        {formatCurrency(getAvailableAmount(creditNote))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {creditNote.status === "issued" && (
                          <Link
                            href={`/billing/credit-notes/${creditNote.id}/apply`}
                            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                            aria-label={`Apply credit note ${creditNote.creditNoteNumber}`}
                          >
                            Apply
                          </Link>
                        )}
                        {creditNote.status === "issued" && (
                          <button
                            onClick={() => handleVoid(creditNote.id)}
                            disabled={isLoading === creditNote.id}
                            className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)] disabled:opacity-50"
                            aria-label={`Void credit note ${creditNote.creditNoteNumber}`}
                          >
                            <XIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground-muted" aria-live="polite" aria-atomic="true">
          Showing {filteredAndSorted.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} credit notes
        </p>

        <div className="flex items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="text-sm text-foreground-muted">
              Per page:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-2 py-1 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Page navigation */}
          {totalPages > 1 && (
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to first page"
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to previous page"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              <span className="px-3 text-sm text-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to next page"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to last page"
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
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
      <path fillRule="evenodd" d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z" clipRule="evenodd" />
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

function SortNeutralIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L2.2 5.74a.75.75 0 0 0 .04 1.06Zm8 6.4a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04Z" clipRule="evenodd" />
    </svg>
  );
}

function SortAscIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    </svg>
  );
}

function SortDescIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
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

function ChevronDoubleLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 0 1-1.06.02l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 1 1 1.04 1.08L11.832 10l3.938 3.71a.75.75 0 0 1 .02 1.06Zm-6 0a.75.75 0 0 1-1.06.02l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 1 1 1.04 1.08L5.832 10l3.938 3.71a.75.75 0 0 1 .02 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronDoubleRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.21 5.23a.75.75 0 0 1 1.06-.02l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 0 1-.02-1.06Zm6 0a.75.75 0 0 1 1.06-.02l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 1 1-1.04-1.08L14.168 10 10.23 6.29a.75.75 0 0 1-.02-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}
