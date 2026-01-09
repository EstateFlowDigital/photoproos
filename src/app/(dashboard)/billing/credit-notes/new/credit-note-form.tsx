"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/select";
import { createCreditNote } from "@/lib/actions/credit-notes";

interface Client {
  id: string;
  fullName: string | null;
  company: string | null;
  email: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalCents: number;
  paidAmountCents: number;
  clientName: string | null;
  client: { id: string; fullName: string | null } | null;
}

interface CreditNoteFormProps {
  clients: Client[];
  invoices: Invoice[];
}

const REASON_OPTIONS = [
  { value: "refund", label: "Refund" },
  { value: "discount", label: "Discount" },
  { value: "pricing_error", label: "Pricing Error" },
  { value: "service_issue", label: "Service Issue" },
  { value: "cancellation", label: "Cancellation" },
  { value: "goodwill", label: "Goodwill Gesture" },
  { value: "other", label: "Other" },
];

export function CreditNoteForm({ clients, invoices }: CreditNoteFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preselectedInvoiceId = searchParams?.get("invoiceId");
  const preselectedClientId = searchParams?.get("clientId");

  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId ?? "");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(preselectedInvoiceId ?? "");
  const [amountCents, setAmountCents] = useState(0);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Filter invoices based on selected client
  const filteredInvoices = selectedClientId
    ? invoices.filter((inv) => inv.client?.id === selectedClientId)
    : invoices;

  // Get max amount based on selected invoice
  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
  const maxAmountCents = selectedInvoice
    ? selectedInvoice.totalCents - selectedInvoice.paidAmountCents
    : Infinity;

  // Auto-select client when invoice is selected
  useEffect(() => {
    if (selectedInvoiceId) {
      const invoice = invoices.find((inv) => inv.id === selectedInvoiceId);
      if (invoice?.client?.id && !selectedClientId) {
        setSelectedClientId(invoice.client.id);
      }
    }
  }, [selectedInvoiceId, invoices, selectedClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountCents <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    if (selectedInvoiceId && amountCents > maxAmountCents) {
      showToast(`Amount cannot exceed the invoice balance of ${formatCurrency(maxAmountCents)}`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCreditNote({
        clientId: selectedClientId || undefined,
        invoiceId: selectedInvoiceId || undefined,
        amountCents,
        reason: reason || undefined,
        description: description || undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        showToast(`Credit note ${result.data.creditNoteNumber} created successfully`, "success");
        router.push(`/billing/credit-notes/${result.data.id}`);
      } else {
        showToast(result.error || "Failed to create credit note", "error");
      }
    } catch {
      showToast("Failed to create credit note", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client & Invoice */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold text-foreground mb-4">Credit Note Details</h3>
        <div className="space-y-4">
          <Select
            name="client"
            label="Client (optional)"
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value);
              // Clear invoice if switching clients
              if (selectedInvoiceId) {
                const invoice = invoices.find((inv) => inv.id === selectedInvoiceId);
                if (invoice?.client?.id !== e.target.value) {
                  setSelectedInvoiceId("");
                }
              }
            }}
            placeholder="Select a client..."
            options={clients.map((client) => ({
              value: client.id,
              label: `${client.fullName || client.email}${client.company ? ` (${client.company})` : ""}`,
            }))}
          />

          <Select
            name="invoice"
            label="Related Invoice (optional)"
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            placeholder="Select an invoice..."
            options={filteredInvoices.map((invoice) => ({
              value: invoice.id,
              label: `${invoice.invoiceNumber} - ${invoice.clientName || "Unknown"} (${formatCurrency(invoice.totalCents)})`,
            }))}
          />

          {selectedInvoice && (
            <div className="rounded-lg bg-[var(--background-secondary)] p-3 text-sm">
              <p className="text-foreground-muted">
                Invoice balance: <span className="font-medium text-foreground">{formatCurrency(selectedInvoice.totalCents - selectedInvoice.paidAmountCents)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Amount & Reason */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold text-foreground mb-4">Amount & Reason</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Amount <span className="text-[var(--error)]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amountCents ? (amountCents / 100).toFixed(2) : ""}
                onChange={(e) => setAmountCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                placeholder="0.00"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            {selectedInvoice && maxAmountCents < Infinity && (
              <p className="mt-1 text-xs text-foreground-muted">
                Maximum: {formatCurrency(maxAmountCents)}
              </p>
            )}
          </div>

          <Select
            name="reason"
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Select a reason..."
            options={REASON_OPTIONS}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the credit..."
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Internal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for internal reference (not shown to client)..."
              rows={2}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <span className="text-lg font-medium text-foreground">Credit Amount</span>
          <span className="text-2xl font-bold text-[var(--success)]">
            {formatCurrency(amountCents)}
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground-muted">
          This credit note will be created as a draft. You can issue it to make it available for use.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || amountCents <= 0}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <LoadingIcon className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Credit Note"
          )}
        </button>
      </div>
    </form>
  );
}

// Icons
function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
