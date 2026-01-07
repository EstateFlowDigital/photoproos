"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import type { RetainerTransactionType } from "@prisma/client";
import { updateRetainer, addDeposit } from "@/lib/actions/retainers";

interface RetainerTransaction {
  id: string;
  type: RetainerTransactionType;
  amountCents: number;
  description: string | null;
  balanceAfterCents: number;
  createdAt: Date;
}

interface Retainer {
  id: string;
  clientId: string;
  balanceCents: number;
  totalDepositedCents: number;
  totalUsedCents: number;
  lowBalanceThresholdCents: number | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string;
  };
  transactions: RetainerTransaction[];
}

interface RetainersPageClientProps {
  retainers: Retainer[];
  filter: string;
}

type SortField = "client" | "balanceCents" | "totalDepositedCents" | "totalUsedCents" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "table";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function RetainersPageClient({ retainers, filter: _filter }: RetainersPageClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [depositModal, setDepositModal] = useState<{ id: string; clientName: string } | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  // View mode (grid or table)
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Filtered and sorted retainers
  const filteredAndSorted = useMemo(() => {
    const result = retainers.filter((r) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        r.client.fullName?.toLowerCase().includes(query) ||
        r.client.company?.toLowerCase().includes(query) ||
        r.client.email.toLowerCase().includes(query)
      );
    });

    // Sort
    result.sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;

      switch (sortField) {
        case "client":
          aVal = a.client.fullName || a.client.company || a.client.email;
          bVal = b.client.fullName || b.client.company || b.client.email;
          break;
        case "balanceCents":
          aVal = a.balanceCents;
          bVal = b.balanceCents;
          break;
        case "totalDepositedCents":
          aVal = a.totalDepositedCents;
          bVal = b.totalDepositedCents;
          break;
        case "totalUsedCents":
          aVal = a.totalUsedCents;
          bVal = b.totalUsedCents;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case "updatedAt":
          aVal = new Date(a.updatedAt);
          bVal = new Date(b.updatedAt);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [retainers, searchQuery, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ["Client Name", "Email", "Company", "Status", "Balance", "Total Deposited", "Total Used", "Low Balance Threshold", "Created", "Updated"];
    const rows = filteredAndSorted.map((r) => [
      r.client.fullName || "",
      r.client.email,
      r.client.company || "",
      r.isActive ? "Active" : "Inactive",
      (r.balanceCents / 100).toFixed(2),
      (r.totalDepositedCents / 100).toFixed(2),
      (r.totalUsedCents / 100).toFixed(2),
      r.lowBalanceThresholdCents ? (r.lowBalanceThresholdCents / 100).toFixed(2) : "",
      new Date(r.createdAt).toLocaleDateString(),
      new Date(r.updatedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `retainers-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up to prevent memory leak
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    setIsLoading(id);
    const result = await updateRetainer(id, { isActive: !currentlyActive });
    if (result.success) {
      router.refresh();
    }
    setIsLoading(null);
  };

  const handleAddDeposit = async () => {
    if (!depositModal || !depositAmount) return;
    const amountCents = Math.round(parseFloat(depositAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) return;

    setIsLoading(depositModal.id);
    const result = await addDeposit(depositModal.id, {
      amountCents,
      description: "Manual deposit",
    });
    if (result.success) {
      router.refresh();
      setDepositModal(null);
      setDepositAmount("");
    }
    setIsLoading(null);
  };

  const isLowBalance = (r: Retainer) => {
    return r.lowBalanceThresholdCents !== null && r.balanceCents <= r.lowBalanceThresholdCents;
  };

  const getTransactionIcon = (type: RetainerTransactionType) => {
    switch (type) {
      case "deposit":
        return <ArrowDownIcon className="h-3 w-3 text-[var(--success)]" />;
      case "usage":
        return <ArrowUpIcon className="h-3 w-3 text-[var(--primary)]" />;
      case "refund":
        return <ArrowUpIcon className="h-3 w-3 text-[var(--warning)]" />;
      case "adjustment":
        return <AdjustIcon className="h-3 w-3 text-foreground-muted" />;
      default:
        return null;
    }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => {
    const isSorted = sortField === field;
    const ariaSort = isSorted ? (sortOrder === "asc" ? "ascending" : "descending") : undefined;
    return (
      <button
        onClick={() => handleSort(field)}
        aria-sort={ariaSort}
        aria-label={`Sort by ${label}${isSorted ? `, currently ${sortOrder === "asc" ? "ascending" : "descending"}` : ""}`}
        className="inline-flex items-center gap-1 font-medium text-foreground-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 rounded"
      >
        {label}
        {isSorted && (
          <span className="text-[var(--primary)]" aria-hidden="true">{sortOrder === "asc" ? "↑" : "↓"}</span>
        )}
      </button>
    );
  };

  if (retainers.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
        <WalletIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No retainer accounts yet
        </h3>
        <p className="mt-2 text-foreground-muted">
          Create retainer accounts to track prepaid client balances.
        </p>
        <Link
          href="/billing/retainers/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          <PlusIcon className="h-4 w-4" />
          New Retainer
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search, View Toggle, and Export */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search retainers..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div
              className="flex rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-0.5"
              role="group"
              aria-label="View mode"
            >
              <button
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-inset",
                  viewMode === "grid"
                    ? "bg-[var(--card)] text-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                )}
                aria-label="Grid view"
              >
                <GridIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-inset",
                  viewMode === "table"
                    ? "bg-[var(--card)] text-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                )}
                aria-label="Table view"
              >
                <TableIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-tertiary)]"
            >
              <DownloadIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-foreground-muted">
          <span>
            Showing {paginatedResults.length} of {filteredAndSorted.length} retainers
          </span>
        </div>

        {/* No search results */}
        {filteredAndSorted.length === 0 && searchQuery && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
            <SearchIcon className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No retainers found</h3>
            <p className="mt-2 text-foreground-muted">Try adjusting your search terms</p>
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && filteredAndSorted.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <SortHeader field="client" label="Client" />
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="balanceCents" label="Balance" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="totalDepositedCents" label="Deposited" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="totalUsedCents" label="Used" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader field="updatedAt" label="Updated" />
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] bg-[var(--card)]">
                {paginatedResults.map((retainer) => (
                  <tr key={retainer.id} className={cn("hover:bg-[var(--background-secondary)]", !retainer.isActive && "opacity-60")}>
                    <td className="px-4 py-3">
                      <Link href={`/clients/${retainer.client.id}`} className="font-medium text-foreground hover:text-[var(--primary)]">
                        {retainer.client.fullName || retainer.client.company || "Unknown"}
                      </Link>
                      <p className="text-xs text-foreground-muted">{retainer.client.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isLowBalance(retainer) && (
                          <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                            Low
                          </span>
                        )}
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          retainer.isActive
                            ? "bg-[var(--success)]/10 text-[var(--success)]"
                            : "bg-[var(--background-tertiary)] text-foreground-muted"
                        )}>
                          {retainer.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("font-medium", isLowBalance(retainer) ? "text-[var(--warning)]" : "text-foreground")}>
                        {formatCurrency(retainer.balanceCents)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--success)]">
                      {formatCurrency(retainer.totalDepositedCents)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCurrency(retainer.totalUsedCents)}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {new Date(retainer.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDepositModal({ id: retainer.id, clientName: retainer.client.fullName || "Client" })}
                          disabled={!retainer.isActive || isLoading === retainer.id}
                          className="rounded-lg bg-[var(--success)] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
                        >
                          Deposit
                        </button>
                        <Link
                          href={`/billing/retainers/${retainer.id}`}
                          className="rounded-lg bg-[var(--background-secondary)] px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-tertiary)]"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleToggleActive(retainer.id, retainer.isActive)}
                          disabled={isLoading === retainer.id}
                          className="rounded-lg p-1 text-foreground-muted transition-colors hover:bg-[var(--background-tertiary)] hover:text-foreground disabled:opacity-50"
                          title={retainer.isActive ? "Deactivate" : "Activate"}
                        >
                          {retainer.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filteredAndSorted.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedResults.map((retainer) => (
            <div
              key={retainer.id}
              className={cn(
                "rounded-xl border bg-[var(--card)] p-5 transition-colors",
                isLowBalance(retainer)
                  ? "border-[var(--warning)]/50"
                  : "border-[var(--card-border)]",
                !retainer.isActive && "opacity-60"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/clients/${retainer.client.id}`}
                    className="font-semibold text-foreground hover:text-[var(--primary)]"
                  >
                    {retainer.client.fullName || retainer.client.company || "Unknown"}
                  </Link>
                  <p className="text-sm text-foreground-muted">{retainer.client.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isLowBalance(retainer) && (
                    <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                      Low
                    </span>
                  )}
                  {!retainer.isActive && (
                    <span className="rounded-full bg-[var(--background-tertiary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Balance */}
              <div className="mt-4">
                <p className="text-sm text-foreground-muted">Current Balance</p>
                <p className={cn(
                  "text-2xl font-bold",
                  isLowBalance(retainer) ? "text-[var(--warning)]" : "text-foreground"
                )}>
                  {formatCurrency(retainer.balanceCents)}
                </p>
                {retainer.lowBalanceThresholdCents && (
                  <p className="text-xs text-foreground-muted">
                    Alert below {formatCurrency(retainer.lowBalanceThresholdCents)}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--card-border)] pt-4">
                <div>
                  <p className="text-xs text-foreground-muted">Deposited</p>
                  <p className="font-medium text-[var(--success)]">
                    {formatCurrency(retainer.totalDepositedCents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">Used</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(retainer.totalUsedCents)}
                  </p>
                </div>
              </div>

              {/* Recent Transactions */}
              {retainer.transactions.length > 0 && (
                <div className="mt-4 border-t border-[var(--card-border)] pt-4">
                  <p className="mb-2 text-xs font-medium text-foreground-muted">Recent Activity</p>
                  <div className="space-y-1">
                    {retainer.transactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          {getTransactionIcon(tx.type)}
                          <span className="text-foreground-muted capitalize">
                            {tx.type.replace("_", " ")}
                          </span>
                        </div>
                        <span className={cn(
                          "font-medium",
                          tx.type === "deposit" ? "text-[var(--success)]" : "text-foreground"
                        )}>
                          {tx.type === "deposit" ? "+" : "-"}{formatCurrency(tx.amountCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-[var(--card-border)] pt-4">
                <button
                  onClick={() => setDepositModal({ id: retainer.id, clientName: retainer.client.fullName || "Client" })}
                  disabled={!retainer.isActive || isLoading === retainer.id}
                  className="flex-1 rounded-lg bg-[var(--success)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
                >
                  Add Deposit
                </button>
                <Link
                  href={`/billing/retainers/${retainer.id}`}
                  className="flex-1 rounded-lg bg-[var(--background-secondary)] px-3 py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-tertiary)]"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleToggleActive(retainer.id, retainer.isActive)}
                  disabled={isLoading === retainer.id}
                  className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-tertiary)] hover:text-foreground disabled:opacity-50"
                  title={retainer.isActive ? "Deactivate" : "Activate"}
                >
                  {retainer.isActive ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-2 py-1 text-foreground"
              >
                {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground disabled:opacity-50"
                aria-label="First page"
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "min-w-[32px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        currentPage === pageNum
                          ? "bg-[var(--primary)] text-white"
                          : "text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-secondary)] hover:text-foreground disabled:opacity-50"
                aria-label="Last page"
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm text-foreground-muted">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {depositModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-modal-title"
          aria-describedby="deposit-modal-description"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDepositModal(null);
              setDepositAmount("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDepositModal(null);
              setDepositAmount("");
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 id="deposit-modal-title" className="text-lg font-semibold text-foreground">Add Deposit</h3>
            <p id="deposit-modal-description" className="mt-1 text-sm text-foreground-muted">
              Add funds to {depositModal.clientName}&apos;s retainer account
            </p>
            <div className="mt-4">
              <label htmlFor="deposit-amount" className="block text-sm font-medium text-foreground">Amount</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" aria-hidden="true">$</span>
                <input
                  id="deposit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  aria-describedby="deposit-currency"
                  autoFocus
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] py-2 pl-8 pr-4 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <span id="deposit-currency" className="sr-only">Amount in US dollars</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setDepositModal(null);
                  setDepositAmount("");
                }}
                className="flex-1 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDeposit}
                disabled={!depositAmount || isLoading === depositModal.id}
                aria-disabled={!depositAmount || isLoading === depositModal.id}
                className="flex-1 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--success)]"
              >
                Add Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M1 4.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 2H3.25A2.25 2.25 0 0 0 1 4.25ZM1 7.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 5H3.25A2.25 2.25 0 0 0 1 7.25ZM7 8a1 1 0 0 1 1 1 2 2 0 1 0 4 0 1 1 0 0 1 1-1h3.75A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5A2.25 2.25 0 0 1 3.25 8H7Z" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    </svg>
  );
}

function AdjustIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M17 10a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 .75.75Z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function TableIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M.99 5.24A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.5v4.01c0 .414.336.75.75.75h6.25v-4.76H2.49Zm7.75 4.76v-4.76h7.26v4.01a.75.75 0 0 1-.75.75h-6.51Zm7.26-6.26H2.49V5.25a.75.75 0 0 1 .75-.75h13.51a.75.75 0 0 1 .75.75v3.99Z" clipRule="evenodd" />
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
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
      <path fillRule="evenodd" d="M10.21 14.77a.75.75 0 0 1 .02-1.06L14.168 10 10.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Zm-6 0a.75.75 0 0 1 .02-1.06L8.168 10 4.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
    </svg>
  );
}
