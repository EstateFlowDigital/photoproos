"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createInvoice } from "@/lib/actions/invoices";
import { cn } from "@/lib/utils";
import type { LineItemType } from "@prisma/client";

interface Client {
  id: string;
  fullName: string | null;
  company: string | null;
  email: string;
}

interface Service {
  id: string;
  name: string;
  priceCents: number;
  description: string | null;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitCents: number;
  itemType: LineItemType;
}

interface InvoiceFormProps {
  clients: Client[];
  services: Service[];
}

export function InvoiceForm({ clients, services }: InvoiceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment is due within 30 days of invoice date.");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitCents: 0, itemType: "service" },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: crypto.randomUUID(), description: "", quantity: 1, unitCents: 0, itemType: "service" },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const addServiceAsLineItem = (service: Service) => {
    setLineItems([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        description: service.name + (service.description ? ` - ${service.description}` : ""),
        quantity: 1,
        unitCents: service.priceCents,
        itemType: "service",
      },
    ]);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.unitCents * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      showToast("Please select a client", "error");
      return;
    }

    const validLineItems = lineItems.filter((item) => item.description && item.unitCents > 0);
    if (validLineItems.length === 0) {
      showToast("Please add at least one line item", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createInvoice({
        clientId: selectedClientId,
        dueDate: new Date(dueDate),
        notes: notes || undefined,
        terms: terms || undefined,
        lineItems: validLineItems.map((item) => ({
          itemType: item.itemType,
          description: item.description,
          quantity: item.quantity,
          unitCents: item.unitCents,
        })),
      });

      if (result.success) {
        showToast("Invoice created successfully", "success");
        router.push(`/invoices/${result.data.id}`);
      } else {
        showToast(result.error || "Failed to create invoice", "error");
      }
    } catch {
      showToast("Failed to create invoice", "error");
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
      {/* Client Selection */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold text-foreground mb-4">Client</h3>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          required
        >
          <option value="">Select a client...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName || client.email}
              {client.company && ` (${client.company})`}
            </option>
          ))}
        </select>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Line Items</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
          >
            <PlusIcon className="h-4 w-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <div className="flex gap-2">
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unitCents ? (item.unitCents / 100).toFixed(2) : ""}
                        onChange={(e) => updateLineItem(item.id, { unitCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-4 py-2 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                  <select
                    value={item.itemType}
                    onChange={(e) => updateLineItem(item.id, { itemType: e.target.value as LineItemType })}
                    className="w-28 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-2 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="service">Service</option>
                    <option value="travel">Travel</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm font-medium text-foreground w-20 text-right">
                  {formatCurrency(item.unitCents * item.quantity)}
                </span>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="p-1 text-foreground-muted hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add Services */}
        {services.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <p className="text-sm text-foreground-muted mb-2">Quick add from services:</p>
            <div className="flex flex-wrap gap-2">
              {services.slice(0, 5).map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => addServiceAsLineItem(service)}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--background-secondary)] px-3 py-1 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  <PlusIcon className="h-3 w-3" />
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex justify-between">
          <span className="font-medium text-foreground">Subtotal</span>
          <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      {/* Due Date & Notes */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold text-foreground mb-4">Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes for the client..."
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Terms & Conditions</label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <LoadingIcon className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Invoice"
          )}
        </button>
      </div>
    </form>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
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

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
