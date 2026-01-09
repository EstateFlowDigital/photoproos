"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import { deleteEstimate, sendEstimate } from "@/lib/actions/estimates";

type SortField = "createdAt" | "estimateNumber" | "client" | "totalCents" | "status" | "validUntil";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "draft" | "sent" | "approved" | "rejected" | "expired" | "converted";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
  sent: "bg-[var(--primary)]/10 text-[var(--primary)]",
  viewed: "bg-[var(--ai)]/10 text-[var(--ai)]",
  approved: "bg-[var(--success)]/10 text-[var(--success)]",
  rejected: "bg-[var(--error)]/10 text-[var(--error)]",
  expired: "bg-[var(--warning)]/10 text-[var(--warning)]",
  converted: "bg-[var(--success)]/10 text-[var(--success)]",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  converted: "Converted",
};

interface Estimate {
  id: string;
  estimateNumber: string;
  title: string | null;
  status: string;
  totalCents: number;
  validUntil: Date;
  createdAt: Date;
  clientName: string | null;
  client: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string;
  } | null;
  convertedToInvoice: {
    id: string;
    invoiceNumber: string;
  } | null;
}

interface Stats {
  total: number;
  draft: number;
  sent: number;
  approved: number;
  rejected: number;
  expired: number;
  converted: number;
}

interface EstimatesListClientProps {
  estimates: Estimate[];
  stats: Stats;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function EstimatesListClient({ estimates, stats }: EstimatesListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Use ref for now to avoid recreation on each render
  const nowRef = useRef(new Date());
  const now = nowRef.current;

  const filteredAndSorted = useMemo(() => {
    let result = [...estimates];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.estimateNumber.toLowerCase().includes(query) ||
          e.title?.toLowerCase().includes(query) ||
          e.clientName?.toLowerCase().includes(query) ||
          e.client?.fullName?.toLowerCase().includes(query) ||
          e.client?.company?.toLowerCase().includes(query) ||
          e.client?.email?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "expired") {
        result = result.filter(
          (e) => e.validUntil < now && !["approved", "rejected", "converted"].includes(e.status)
        );
      } else {
        result = result.filter((e) => e.status === statusFilter);
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "estimateNumber":
          comparison = a.estimateNumber.localeCompare(b.estimateNumber);
          break;
        case "client":
          const aName = a.client?.fullName || a.client?.company || a.clientName || "";
          const bName = b.client?.fullName || b.client?.company || b.clientName || "";
          comparison = aName.localeCompare(bName);
          break;
        case "totalCents":
          comparison = a.totalCents - b.totalCents;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "validUntil":
          comparison = new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [estimates, searchQuery, statusFilter, sortField, sortOrder, now]);

  // Pagination calculations
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
      setSelectedIds(new Set(paginatedResults.map((e) => e.id)));
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this estimate?")) return;
    setIsLoading(id);
    const result = await deleteEstimate(id);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(null);
  };

  const handleSend = async (id: string) => {
    setIsLoading(id);
    const result = await sendEstimate(id);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(null);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} estimates?`)) return;
    setIsBulkLoading(true);
    for (const id of selectedIds) {
      await deleteEstimate(id);
    }
    setSelectedIds(new Set());
    router.refresh();
    setIsBulkLoading(false);
  };

  const handleExportCSV = () => {
    const headers = ["Estimate Number", "Title", "Client", "Email", "Status", "Amount", "Valid Until", "Created"];
    const rows = filteredAndSorted.map((e) => {
      const isExpired = e.validUntil < now && !["approved", "rejected", "converted"].includes(e.status);
      const status = isExpired ? "Expired" : STATUS_LABELS[e.status] || e.status;
      return [
        e.estimateNumber,
        e.title || "",
        e.client?.fullName || e.client?.company || e.clientName || "",
        e.client?.email || "",
        status,
        (e.totalCents / 100).toFixed(2),
        new Date(e.validUntil).toLocaleDateString(),
        new Date(e.createdAt).toLocaleDateString(),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estimates-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (estimate: Estimate) => {
    const isExpired = estimate.validUntil < now && !["approved", "rejected", "converted"].includes(estimate.status);
    const status = isExpired ? "expired" : estimate.status;

    return (
      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>
        {STATUS_LABELS[status] || status}
      </span>
    );
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

  const filterTabs = [
    { key: "all" as StatusFilter, label: "All", count: stats.total },
    { key: "draft" as StatusFilter, label: "Draft", count: stats.draft },
    { key: "sent" as StatusFilter, label: "Sent", count: stats.sent },
    { key: "approved" as StatusFilter, label: "Approved", count: stats.approved },
    { key: "rejected" as StatusFilter, label: "Rejected", count: stats.rejected },
    { key: "expired" as StatusFilter, label: "Expired", count: stats.expired },
    { key: "converted" as StatusFilter, label: "Converted", count: stats.converted },
  ];

  if (estimates.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
        <EstimateIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No estimates yet</h3>
        <p className="mt-2 text-foreground-muted">
          Create your first estimate to send professional quotes to clients.
        </p>
        <Link
          href="/billing/estimates/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          <PlusIcon className="h-4 w-4" />
          Create Estimate
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter estimates by status">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={statusFilter === tab.key}
            aria-controls="estimates-table"
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
            placeholder="Search estimates..."
            aria-label="Search estimates"
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
                onClick={handleBulkDelete}
                disabled={isBulkLoading}
                className="rounded-lg bg-[var(--error)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isBulkLoading ? "Deleting..." : "Delete Selected"}
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
      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)]" id="estimates-table" role="tabpanel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]" aria-label="Estimates list">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all estimates"
                    checked={selectedIds.size === paginatedResults.length && paginatedResults.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-[var(--card-border)]"
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("estimateNumber")}
                    aria-label={`Sort by estimate number, currently ${sortField === "estimateNumber" ? sortOrder : "unsorted"}`}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-foreground-muted hover:text-foreground"
                  >
                    Estimate
                    <SortIcon field="estimateNumber" />
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
                    onClick={() => handleSort("totalCents")}
                    aria-label={`Sort by amount, currently ${sortField === "totalCents" ? sortOrder : "unsorted"}`}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-foreground-muted hover:text-foreground"
                  >
                    Amount
                    <SortIcon field="totalCents" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("validUntil")}
                    aria-label={`Sort by valid until date, currently ${sortField === "validUntil" ? sortOrder : "unsorted"}`}
                    className="flex items-center text-xs font-medium uppercase tracking-wide text-foreground-muted hover:text-foreground"
                  >
                    Valid Until
                    <SortIcon field="validUntil" />
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
                  <td colSpan={7} className="px-6 py-8 text-center text-foreground-muted">
                    No estimates match your filters
                  </td>
                </tr>
              ) : (
                paginatedResults.map((estimate) => (
                  <tr
                    key={estimate.id}
                    className={cn(
                      "transition-colors hover:bg-[var(--background-secondary)]",
                      selectedIds.has(estimate.id) && "bg-[var(--primary)]/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select estimate ${estimate.estimateNumber}`}
                        checked={selectedIds.has(estimate.id)}
                        onChange={() => handleSelect(estimate.id)}
                        className="rounded border-[var(--card-border)]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/billing/estimates/${estimate.id}`}
                        className="font-medium text-foreground hover:text-[var(--primary)]"
                      >
                        {estimate.estimateNumber}
                      </Link>
                      {estimate.title && (
                        <p className="text-sm text-foreground-muted">{estimate.title}</p>
                      )}
                      <p className="text-xs text-foreground-muted">
                        {new Date(estimate.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {estimate.client ? (
                        <Link
                          href={`/clients/${estimate.client.id}`}
                          className="font-medium text-foreground hover:text-[var(--primary)]"
                        >
                          {estimate.client.fullName || estimate.client.company || "Unknown"}
                        </Link>
                      ) : (
                        <span className="text-foreground">{estimate.clientName || "No client"}</span>
                      )}
                      {estimate.client?.email && (
                        <p className="text-sm text-foreground-muted">{estimate.client.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(estimate)}
                      {estimate.convertedToInvoice && (
                        <Link
                          href={`/invoices/${estimate.convertedToInvoice.id}`}
                          className="ml-2 text-xs text-[var(--primary)] hover:underline"
                        >
                          → {estimate.convertedToInvoice.invoiceNumber}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(estimate.totalCents)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-sm",
                          estimate.validUntil < now && !["approved", "rejected", "converted"].includes(estimate.status)
                            ? "text-[var(--error)]"
                            : "text-foreground-muted"
                        )}
                      >
                        {new Date(estimate.validUntil).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {estimate.status === "draft" && (
                          <>
                            <button
                              onClick={() => handleSend(estimate.id)}
                              disabled={isLoading === estimate.id}
                              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                            >
                              Send
                            </button>
                            <Link
                              href={`/billing/estimates/${estimate.id}/edit`}
                              className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                              aria-label={`Edit estimate ${estimate.estimateNumber}`}
                            >
                              <EditIcon className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </>
                        )}
                        <Link
                          href={`/billing/estimates/new?duplicate=${estimate.id}`}
                          className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground"
                          aria-label={`Duplicate estimate ${estimate.estimateNumber}`}
                        >
                          <CopyIcon className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        {estimate.status === "draft" && (
                          <button
                            onClick={() => handleDelete(estimate.id)}
                            disabled={isLoading === estimate.id}
                            className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)] disabled:opacity-50"
                            aria-label={`Delete estimate ${estimate.estimateNumber}`}
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
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
          Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} estimates
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function EstimateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v13A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-13ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
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
