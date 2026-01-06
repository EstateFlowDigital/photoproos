"use client";

import React, { useState, useEffect } from "react";
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
  getExpenseCategories,
  type ProjectPLSummary,
  type CreateExpenseInput,
} from "@/lib/actions/project-expenses";
import type { ProjectExpense, ExpenseCategory } from "@prisma/client";

// ============================================================================
// ICONS
// ============================================================================

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ProjectExpense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateExpenseInput>({
    description: "",
    category: "other",
    amountCents: 0,
    vendor: "",
    isPaid: true,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, [galleryId]);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [plResult, expensesResult] = await Promise.all([
        getProjectPL(galleryId),
        getProjectExpenses(galleryId),
      ]);

      if (plResult.success) {
        setPlSummary(plResult.data);
      } else {
        setError(plResult.error);
      }

      if (expensesResult.success) {
        setExpenses(expensesResult.data);
      }
    } catch {
      setError("Failed to load P&L data");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      description: "",
      category: "other",
      amountCents: 0,
      vendor: "",
      isPaid: true,
      notes: "",
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

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <RefreshIcon className="h-6 w-6 animate-spin text-foreground-muted" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* P&L Summary Cards */}
      {plSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Revenue Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
              <DollarIcon className="h-4 w-4" />
              Revenue
            </div>
            <div className="text-2xl font-bold text-[var(--success)]">
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
              Expenses
            </div>
            <div className="text-2xl font-bold text-[var(--error)]">
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
              Net Profit
            </div>
            <div
              className={cn(
                "text-2xl font-bold",
                plSummary.profit.gross >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
              )}
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
          <div className="space-y-3">
            {plSummary.expenses.byCategory.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
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
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h3 className="font-semibold text-foreground">Expenses</h3>
          <Button size="sm" onClick={openAddModal}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center">
            <DollarIcon className="h-10 w-10 mx-auto text-foreground-muted mb-3" />
            <p className="text-foreground-muted">No expenses recorded yet</p>
            <p className="text-sm text-foreground-muted mt-1">
              Track project costs to see your true profit
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 hover:bg-[var(--background-hover)] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {expense.description}
                    </span>
                    {!expense.isPaid && (
                      <span className="px-1.5 py-0.5 text-xs rounded bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20">
                        Unpaid
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-foreground-muted">
                    <span>{getCategoryLabel(expense.category)}</span>
                    {expense.vendor && (
                      <>
                        <span>•</span>
                        <span>{expense.vendor}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatDate(expense.expenseDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(expense.amountCents)}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTogglePaid(expense.id)}
                      className={cn(
                        "p-1.5 rounded hover:bg-[var(--background-secondary)] transition-colors",
                        expense.isPaid ? "text-[var(--success)]" : "text-foreground-muted"
                      )}
                      title={expense.isPaid ? "Mark as unpaid" : "Mark as paid"}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(expense)}
                      className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] transition-colors"
                      title="Edit"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(expense.id)}
                      className="p-1.5 rounded text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-[var(--error)] transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description *
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Photographer fee, Travel expenses"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Amount *
                </label>
                <Input
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Category
                </label>
                <select
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Vendor/Payee
              </label>
              <Input
                value={formData.vendor || ""}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g., Company name, contractor"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  className="rounded"
                />
                <span>Expense has been paid</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Notes
              </label>
              <Textarea
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
    </div>
  );
}

export default ProjectPLPanel;
