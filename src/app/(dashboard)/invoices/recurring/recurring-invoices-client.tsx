"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  getRecurringInvoices,
  createRecurringInvoice,
  pauseRecurringInvoice,
  resumeRecurringInvoice,
  deleteRecurringInvoice,
  type RecurringInvoiceLineItem,
} from "@/lib/actions/recurring-invoices";
import type { RecurringFrequency } from "@prisma/client";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

interface RecurringInvoice {
  id: string;
  client: { id: string; fullName: string | null; email: string; company: string | null };
  frequency: RecurringFrequency;
  totalCents: number;
  nextRunDate: Date;
  isActive: boolean;
  isPaused: boolean;
  invoicesCreated: number;
  lastInvoiceAt: Date | null;
  createdAt: Date;
}

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  company: string | null;
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatFrequency(frequency: RecurringFrequency): string {
  const labels: Record<RecurringFrequency, string> = {
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };
  return labels[frequency];
}

export function RecurringInvoicesClient() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [recurring, setRecurring] = useState<RecurringInvoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [recurringResult, clientsResponse] = await Promise.all([
        getRecurringInvoices(),
        fetch("/api/clients").then((r) => r.json()),
      ]);

      if (recurringResult.success) {
        setRecurring(recurringResult.data);
      } else {
        setError(recurringResult.error);
      }

      if (clientsResponse.clients) {
        setClients(clientsResponse.clients);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePause = async (id: string) => {
    setActionLoading(id);
    const result = await pauseRecurringInvoice(id);
    if (result.success) {
      showToast("Recurring invoice paused", "success");
      await fetchData();
    } else {
      showToast(result.error || "Failed to pause recurring invoice", "error");
    }
    setActionLoading(null);
  };

  const handleResume = async (id: string) => {
    setActionLoading(id);
    const result = await resumeRecurringInvoice(id);
    if (result.success) {
      showToast("Recurring invoice resumed", "success");
      await fetchData();
    } else {
      showToast(result.error || "Failed to resume recurring invoice", "error");
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete recurring invoice",
      description: "Are you sure you want to delete this recurring invoice? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;
    setActionLoading(id);
    const result = await deleteRecurringInvoice(id);
    if (result.success) {
      showToast("Recurring invoice deleted", "success");
      await fetchData();
    } else {
      showToast(result.error || "Failed to delete recurring invoice", "error");
    }
    setActionLoading(null);
  };

  const handleCreate = async (data: {
    clientId: string;
    frequency: RecurringFrequency;
    dayOfMonth?: number;
    lineItems: RecurringInvoiceLineItem[];
    dueDays: number;
  }) => {
    const result = await createRecurringInvoice({
      ...data,
      anchorDate: new Date(),
    });

    if (result.success) {
      showToast("Recurring invoice created", "success");
      setShowCreateModal(false);
      await fetchData();
    } else {
      showToast(result.error || "Failed to create recurring invoice", "error");
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--background-secondary)] rounded w-1/3" />
          <div className="h-64 bg-[var(--background-secondary)] rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 p-8 text-center">
        <p className="text-[var(--error)]">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchData();
          }}
          className="mt-4 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeCount = recurring.filter((r) => r.isActive && !r.isPaused).length;
  const pausedCount = recurring.filter((r) => r.isPaused).length;
  const totalMonthlyRevenue = recurring
    .filter((r) => r.isActive && !r.isPaused)
    .reduce((sum, r) => {
      const multiplier: Record<RecurringFrequency, number> = {
        weekly: 4.33,
        biweekly: 2.17,
        monthly: 1,
        quarterly: 0.33,
        yearly: 0.083,
      };
      return sum + r.totalCents * multiplier[r.frequency];
    }, 0);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recurring Invoices</h1>
          <p className="mt-1 text-foreground-muted">
            Automate subscription and retainer billing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="rounded-lg bg-[var(--background-secondary)] px-4 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            Back to Invoices
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Recurring
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="auto-grid grid-min-220 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Active Subscriptions</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Paused</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--warning)]">{pausedCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Est. Monthly Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {formatCurrency(Math.round(totalMonthlyRevenue))}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <p className="text-sm font-medium text-foreground-muted">Total Invoices Created</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
            {recurring.reduce((sum, r) => sum + r.invoicesCreated, 0)}
          </p>
        </div>
      </div>

      {/* Recurring Invoices Table */}
      {recurring.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Next Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {recurring.map((item) => {
                const clientName =
                  item.client.fullName || item.client.company || item.client.email;
                const isLoading = actionLoading === item.id;

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full avatar-gradient text-xs font-medium text-white">
                          {clientName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{clientName}</p>
                          <p className="text-xs text-foreground-muted">{item.client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {formatFrequency(item.frequency)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">
                        {formatCurrency(item.totalCents)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {item.isActive && !item.isPaused
                          ? formatDate(item.nextRunDate)
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          !item.isActive &&
                            "bg-[var(--foreground-muted)]/10 text-foreground-muted",
                          item.isActive &&
                            item.isPaused &&
                            "bg-[var(--warning)]/10 text-[var(--warning)]",
                          item.isActive &&
                            !item.isPaused &&
                            "bg-[var(--success)]/10 text-[var(--success)]"
                        )}
                      >
                        {!item.isActive ? "Inactive" : item.isPaused ? "Paused" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-foreground-muted">
                          {item.invoicesCreated} invoices
                        </p>
                        {item.lastInvoiceAt && (
                          <p className="text-xs text-foreground-muted">
                            Last: {formatDate(item.lastInvoiceAt)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.isActive && (
                          <button
                            onClick={() =>
                              item.isPaused
                                ? handleResume(item.id)
                                : handlePause(item.id)
                            }
                            disabled={isLoading}
                            className="rounded-lg bg-[var(--background-hover)] px-3 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:text-foreground disabled:opacity-50"
                          >
                            {isLoading ? "..." : item.isPaused ? "Resume" : "Pause"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={isLoading}
                          className="rounded-lg bg-[var(--error)]/10 px-3 py-1.5 text-xs font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <RepeatIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No recurring invoices yet
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Set up recurring billing for retainers and subscriptions.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create Recurring Invoice
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRecurringModal
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}

interface CreateRecurringModalProps {
  clients: Client[];
  onClose: () => void;
  onCreate: (data: {
    clientId: string;
    frequency: RecurringFrequency;
    dayOfMonth?: number;
    lineItems: RecurringInvoiceLineItem[];
    dueDays: number;
  }) => Promise<void>;
}

function CreateRecurringModal({ clients, onClose, onCreate }: CreateRecurringModalProps) {
  const [clientId, setClientId] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [dueDays, setDueDays] = useState(30);
  const [lineItems, setLineItems] = useState<RecurringInvoiceLineItem[]>([
    { itemType: "service", description: "", quantity: 1, unitCents: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { itemType: "service", description: "", quantity: 1, unitCents: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof RecurringInvoiceLineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCents,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || lineItems.length === 0) return;

    setSubmitting(true);
    await onCreate({
      clientId,
      frequency,
      dayOfMonth: frequency === "monthly" || frequency === "quarterly" ? dayOfMonth : undefined,
      lineItems,
      dueDays,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl">
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Create Recurring Invoice
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-2.5 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName || client.company || client.email}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency & Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-2.5 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {(frequency === "monthly" || frequency === "quarterly") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Day of Month
                </label>
                <select
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-2.5 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  {Array.from({ length: 28 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Due Days */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Payment Due (days after invoice)
            </label>
            <select
              value={dueDays}
              onChange={(e) => setDueDays(parseInt(e.target.value))}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-2.5 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value={7}>Net 7</option>
              <option value={14}>Net 14</option>
              <option value={30}>Net 30</option>
              <option value={45}>Net 45</option>
              <option value={60}>Net 60</option>
            </select>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
              <label className="text-sm font-medium text-foreground">Line Items</label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3"
                >
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(index, "description", e.target.value)
                    }
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(index, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-16 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                    required
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={(item.unitCents / 100).toFixed(2)}
                      onChange={(e) =>
                        updateLineItem(
                          index,
                          "unitCents",
                          Math.round(parseFloat(e.target.value || "0") * 100)
                        )
                      }
                      className="w-28 rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                      required
                    />
                  </div>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="rounded p-1 text-foreground-muted hover:text-[var(--error)]"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 flex items-start justify-between gap-4 flex-wrap rounded-lg bg-[var(--background-secondary)] p-4">
              <span className="font-medium text-foreground">Total per Invoice</span>
              <span className="text-xl font-semibold text-foreground">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[var(--background-secondary)] px-4 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !clientId || lineItems.every((i) => !i.description)}
              className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Recurring Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
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

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}
