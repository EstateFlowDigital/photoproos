"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import {
  getProjectPL,
  getProjectExpenses,
  createProjectExpense,
  updateProjectExpense,
  deleteProjectExpense,
  toggleExpensePaidStatus,
  getTeamMembers,
  bulkUpdateExpenseStatus,
  bulkDeleteExpenses,
  exportExpensesToCSV,
  type ProjectPLSummary,
  type CreateExpenseInput,
} from "@/lib/actions/project-expenses";
import { getExpenseCategories } from "@/lib/utils/expenses";
import type { ProjectExpense, ExpenseCategory } from "@prisma/client";

// ============================================================================
// ICONS
// ============================================================================

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 10h8" />
      <path d="M8 14h4" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ============================================================================
// TYPES
// ============================================================================

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FilterState {
  search: string;
  category: ExpenseCategory | "all";
  status: "all" | "paid" | "unpaid";
  dateFrom: string;
  dateTo: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

interface ProjectPLPanelProps {
  galleryId: string;
  className?: string;
}

const EXPENSE_CATEGORIES = getExpenseCategories();

export function ProjectPLPanel({ galleryId, className }: ProjectPLPanelProps) {
  const [plSummary, setPlSummary] = useState<ProjectPLSummary | null>(null);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ProjectExpense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstExpenseRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreateExpenseInput>({
    description: "",
    category: "other",
    amountCents: 0,
    vendor: "",
    isPaid: true,
    notes: "",
    teamMemberId: "",
    receiptUrl: "",
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [galleryId]);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [plResult, expensesResult, teamResult] = await Promise.all([
        getProjectPL(galleryId),
        getProjectExpenses(galleryId),
        getTeamMembers(),
      ]);

      if (plResult.success) {
        setPlSummary(plResult.data);
      } else {
        setError(plResult.error);
      }

      if (expensesResult.success) {
        setExpenses(expensesResult.data);
      }

      if (teamResult.success) {
        setTeamMembers(teamResult.data);
      }
    } catch {
      setError("Failed to load P&L data");
    } finally {
      setIsLoading(false);
    }
  }

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDescription = expense.description.toLowerCase().includes(searchLower);
        const matchesVendor = expense.vendor?.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesVendor) return false;
      }

      // Category filter
      if (filters.category !== "all" && expense.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status === "paid" && !expense.isPaid) return false;
      if (filters.status === "unpaid" && expense.isPaid) return false;

      // Date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (new Date(expense.expenseDate) < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(expense.expenseDate) > toDate) return false;
      }

      return true;
    });
  }, [expenses, filters]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  function resetForm() {
    setFormData({
      description: "",
      category: "other",
      amountCents: 0,
      vendor: "",
      isPaid: true,
      notes: "",
      teamMemberId: "",
      receiptUrl: "",
    });
    setEditingExpense(null);
  }

  function openAddModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(expense: ProjectExpense) {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      category: expense.category,
      amountCents: expense.amountCents,
      vendor: expense.vendor || "",
      isPaid: expense.isPaid,
      notes: expense.notes || "",
      teamMemberId: expense.teamMemberId || "",
      receiptUrl: expense.receiptUrl || "",
    });
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!formData.description || formData.amountCents <= 0) {
      setError("Description and amount are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingExpense) {
        const result = await updateProjectExpense(editingExpense.id, formData);
        if (!result.success) {
          setError(result.error);
          return;
        }
      } else {
        const result = await createProjectExpense(galleryId, formData);
        if (!result.success) {
          setError(result.error);
          return;
        }
      }

      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch {
      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(expenseId: string) {
    try {
      const result = await deleteProjectExpense(expenseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDeleteConfirmId(null);
      await loadData();
    } catch {
      setError("Failed to delete expense");
    }
  }

  async function handleTogglePaid(expenseId: string) {
    try {
      const result = await toggleExpensePaidStatus(expenseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      await loadData();
    } catch {
      setError("Failed to update expense");
    }
  }

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)));
    }
  }, [filteredExpenses, selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk operations
  async function handleBulkMarkPaid(isPaid: boolean) {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const result = await bulkUpdateExpenseStatus(Array.from(selectedIds), isPaid);
      if (!result.success) {
        setError(result.error);
        return;
      }
      clearSelection();
      await loadData();
    } catch {
      setError("Failed to update expenses");
    } finally {
      setIsBulkProcessing(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const result = await bulkDeleteExpenses(Array.from(selectedIds));
      if (!result.success) {
        setError(result.error);
        return;
      }
      clearSelection();
      setBulkDeleteConfirm(false);
      await loadData();
    } catch {
      setError("Failed to delete expenses");
    } finally {
      setIsBulkProcessing(false);
    }
  }

  // CSV Export
  async function handleExportCSV() {
    try {
      const result = await exportExpensesToCSV(galleryId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      // Download the CSV
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export expenses");
    }
  }

  // Clear filters
  function clearFilters() {
    setFilters({
      search: "",
      category: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
    });
  }

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const getCategoryLabel = (cat: ExpenseCategory) => {
    return EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label || cat;
  };

  const getTeamMemberName = (id: string | null) => {
    if (!id) return null;
    const member = teamMembers.find((m) => m.id === id);
    return member?.name || null;
  };

  // Keyboard navigation for expense list
  const handleExpenseKeyDown = useCallback(
    (e: React.KeyboardEvent, expense: ProjectExpense, index: number) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          toggleSelection(expense.id);
          break;
        case "ArrowDown":
          e.preventDefault();
          const nextElement = document.querySelector(
            `[data-expense-index="${index + 1}"]`
          ) as HTMLElement;
          nextElement?.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          const prevElement = document.querySelector(
            `[data-expense-index="${index - 1}"]`
          ) as HTMLElement;
          prevElement?.focus();
          break;
      }
    },
    [toggleSelection]
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)} role="status" aria-label="Loading expenses">
        <RefreshIcon className="h-6 w-6 animate-spin text-foreground-muted" />
        <span className="sr-only">Loading expense data...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)} role="region" aria-label="Project Profit & Loss">
      {/* Error */}
      {error && (
        <div
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between"
          role="alert"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-500/20 rounded"
            aria-label="Dismiss error"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* P&L Summary Cards */}
      {plSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="group" aria-label="Financial summary">
          {/* Revenue Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
              <DollarIcon className="h-4 w-4" />
              <span>Revenue</span>
            </div>
            <div className="text-2xl font-bold text-[var(--success)]" aria-label={`Total revenue: ${formatCurrency(plSummary.revenue.total)}`}>
              {formatCurrency(plSummary.revenue.total)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              {plSummary.revenue.paid > 0 && (
                <span className="text-[var(--success)]">
                  {formatCurrency(plSummary.revenue.paid)} paid
                </span>
              )}
              {plSummary.revenue.pending > 0 && (
                <span className="ml-2 text-[var(--warning)]">
                  {formatCurrency(plSummary.revenue.pending)} pending
                </span>
              )}
            </div>
          </div>

          {/* Expenses Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
              <TrendDownIcon className="h-4 w-4" />
              <span>Expenses</span>
            </div>
            <div className="text-2xl font-bold text-[var(--error)]" aria-label={`Total expenses: ${formatCurrency(plSummary.expenses.total)}`}>
              {formatCurrency(plSummary.expenses.total)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              {plSummary.expenses.itemCount} expense{plSummary.expenses.itemCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Profit Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
              <TrendUpIcon className="h-4 w-4" />
              <span>Net Profit</span>
            </div>
            <div
              className={cn(
                "text-2xl font-bold",
                plSummary.profit.gross >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
              )}
              aria-label={`Net profit: ${formatCurrency(plSummary.profit.gross)}`}
            >
              {formatCurrency(plSummary.profit.gross)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              {plSummary.profit.margin}% margin
            </div>
          </div>
        </div>
      )}

      {/* Expense Breakdown by Category */}
      {plSummary && plSummary.expenses.byCategory.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h3 className="font-semibold text-foreground mb-4">Expenses by Category</h3>
          <div className="space-y-3" role="list" aria-label="Expense breakdown by category">
            {plSummary.expenses.byCategory.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between" role="listitem">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">
                    {getCategoryLabel(cat.category)}
                  </span>
                  <span className="text-xs text-foreground-muted">
                    ({cat.count})
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        {/* Header with Search, Filters, and Actions */}
        <div className="p-4 border-b border-[var(--card-border)] space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-semibold text-foreground">Expenses</h3>
            <div className="flex items-center gap-2">
              {expenses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportCSV}
                  aria-label="Export expenses to CSV"
                >
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}
              <Button size="sm" onClick={openAddModal} aria-label="Add new expense">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Search and Filter Row */}
          {expenses.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search expenses..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                  aria-label="Search expenses by description or vendor"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="expense-filters"
              >
                <FilterIcon className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--primary)] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && expenses.length > 0 && (
            <div
              id="expense-filters"
              className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[var(--card-border)]"
              role="group"
              aria-label="Filter options"
            >
              {/* Category Filter */}
              <div>
                <label htmlFor="filter-category" className="block text-xs text-foreground-muted mb-1">
                  Category
                </label>
                <select
                  id="filter-category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value as ExpenseCategory | "all" })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                >
                  <option value="all">All Categories</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="filter-status" className="block text-xs text-foreground-muted mb-1">
                  Status
                </label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as "all" | "paid" | "unpaid" })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label htmlFor="filter-date-from" className="block text-xs text-foreground-muted mb-1">
                  From Date
                </label>
                <Input
                  id="filter-date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label htmlFor="filter-date-to" className="block text-xs text-foreground-muted mb-1">
                  To Date
                </label>
                <Input
                  id="filter-date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="text-sm"
                />
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <div className="col-span-2 md:col-span-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div
            className="p-3 bg-[var(--primary)]/10 border-b border-[var(--card-border)] flex items-center justify-between flex-wrap gap-2"
            role="toolbar"
            aria-label="Bulk actions"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{selectedIds.size} selected</span>
              <button
                onClick={clearSelection}
                className="text-foreground-muted hover:text-foreground underline text-xs"
                aria-label="Clear selection"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkMarkPaid(true)}
                disabled={isBulkProcessing}
                aria-label="Mark selected as paid"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Mark Paid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkMarkPaid(false)}
                disabled={isBulkProcessing}
                aria-label="Mark selected as unpaid"
              >
                Mark Unpaid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={isBulkProcessing}
                className="text-[var(--error)] hover:text-[var(--error)]"
                aria-label="Delete selected expenses"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Expense List */}
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            {expenses.length === 0 ? (
              <>
                <DollarIcon className="h-10 w-10 mx-auto text-foreground-muted mb-3" />
                <p className="text-foreground-muted">No expenses recorded yet</p>
                <p className="text-sm text-foreground-muted mt-1">
                  Track project costs to see your true profit
                </p>
              </>
            ) : (
              <>
                <SearchIcon className="h-10 w-10 mx-auto text-foreground-muted mb-3" />
                <p className="text-foreground-muted">No expenses match your filters</p>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div role="list" aria-label="Expense list">
            {/* Select All Header */}
            {filteredExpenses.length > 1 && (
              <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredExpenses.length}
                  onChange={toggleSelectAll}
                  className="rounded border-[var(--card-border)]"
                  aria-label={selectedIds.size === filteredExpenses.length ? "Deselect all expenses" : "Select all expenses"}
                />
                <span className="text-xs text-foreground-muted">
                  {selectedIds.size === filteredExpenses.length ? "Deselect all" : "Select all"} ({filteredExpenses.length})
                </span>
              </div>
            )}

            {/* Expense Items */}
            <div className="divide-y divide-[var(--card-border)]">
              {filteredExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  ref={index === 0 ? firstExpenseRef : undefined}
                  data-expense-index={index}
                  tabIndex={0}
                  role="listitem"
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-[var(--background-hover)] transition-colors group focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-inset",
                    selectedIds.has(expense.id) && "bg-[var(--primary)]/5"
                  )}
                  onKeyDown={(e) => handleExpenseKeyDown(e, expense, index)}
                  aria-selected={selectedIds.has(expense.id)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(expense.id)}
                    onChange={() => toggleSelection(expense.id)}
                    className="rounded border-[var(--card-border)] shrink-0"
                    aria-label={`Select expense: ${expense.description}`}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">
                        {expense.description}
                      </span>
                      {!expense.isPaid && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20">
                          Unpaid
                        </span>
                      )}
                      {expense.receiptUrl && (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-[var(--background-secondary)] text-foreground-muted hover:text-[var(--primary)]"
                          title="View receipt"
                          aria-label={`View receipt for ${expense.description}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ReceiptIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-foreground-muted flex-wrap">
                      <span>{getCategoryLabel(expense.category)}</span>
                      {expense.vendor && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>{expense.vendor}</span>
                        </>
                      )}
                      {expense.teamMemberId && getTeamMemberName(expense.teamMemberId) && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            {getTeamMemberName(expense.teamMemberId)}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">•</span>
                      <span>{formatDate(expense.expenseDate)}</span>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-semibold text-foreground" aria-label={`Amount: ${formatCurrency(expense.amountCents)}`}>
                      {formatCurrency(expense.amountCents)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePaid(expense.id); }}
                        className={cn(
                          "p-1.5 rounded hover:bg-[var(--background-secondary)] transition-colors",
                          expense.isPaid ? "text-[var(--success)]" : "text-foreground-muted"
                        )}
                        title={expense.isPaid ? "Mark as unpaid" : "Mark as paid"}
                        aria-label={expense.isPaid ? "Mark as unpaid" : "Mark as paid"}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(expense); }}
                        className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] transition-colors"
                        title="Edit expense"
                        aria-label={`Edit expense: ${expense.description}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(expense.id); }}
                        className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-[var(--error)] transition-colors"
                        title="Delete expense"
                        aria-label={`Delete expense: ${expense.description}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {filteredExpenses.length > 0 && (filters.search || activeFilterCount > 0) && (
          <div className="px-4 py-2 border-t border-[var(--card-border)] text-xs text-foreground-muted">
            Showing {filteredExpenses.length} of {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label htmlFor="expense-description" className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-[var(--error)]">*</span>
              </label>
              <Input
                id="expense-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Photographer fee, Travel expenses"
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expense-amount" className="block text-sm font-medium text-foreground mb-1.5">
                  Amount <span className="text-[var(--error)]">*</span>
                </label>
                <Input
                  id="expense-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountCents / 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amountCents: Math.round(parseFloat(e.target.value || "0") * 100),
                    })
                  }
                  placeholder="0.00"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="expense-category" className="block text-sm font-medium text-foreground mb-1.5">
                  Category
                </label>
                <select
                  id="expense-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expense-vendor" className="block text-sm font-medium text-foreground mb-1.5">
                  Vendor/Payee
                </label>
                <Input
                  id="expense-vendor"
                  value={formData.vendor || ""}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g., Company name, contractor"
                />
              </div>

              <div>
                <label htmlFor="expense-team-member" className="block text-sm font-medium text-foreground mb-1.5">
                  Team Member
                </label>
                <select
                  id="expense-team-member"
                  value={formData.teamMemberId || ""}
                  onChange={(e) => setFormData({ ...formData, teamMemberId: e.target.value || undefined })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="">No assignment</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="expense-receipt" className="block text-sm font-medium text-foreground mb-1.5">
                Receipt URL
              </label>
              <Input
                id="expense-receipt"
                type="url"
                value={formData.receiptUrl || ""}
                onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-foreground-muted mt-1">
                Paste a link to your uploaded receipt
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  className="rounded"
                  aria-describedby="expense-paid-description"
                />
                <span>Expense has been paid</span>
              </label>
              <p id="expense-paid-description" className="sr-only">
                Check this box if you have already paid this expense
              </p>
            </div>

            <div>
              <label htmlFor="expense-notes" className="block text-sm font-medium text-foreground mb-1.5">
                Notes
              </label>
              <Textarea
                id="expense-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details..."
                rows={2}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingExpense ? "Save Changes" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-foreground-muted">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog
        open={bulkDeleteConfirm}
        onOpenChange={(open) => !open && setBulkDeleteConfirm(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} Expenses</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-foreground-muted">
              Are you sure you want to delete {selectedIds.size} expense{selectedIds.size !== 1 ? "s" : ""}? This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
            >
              {isBulkProcessing ? "Deleting..." : `Delete ${selectedIds.size} Expense${selectedIds.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProjectPLPanel;
