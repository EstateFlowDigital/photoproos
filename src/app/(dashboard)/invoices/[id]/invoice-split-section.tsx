"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  getInvoiceSplit,
  createInvoiceSplit,
  deleteInvoiceSplit,
  previewInvoiceSplit,
  type InvoiceSplitWithRelations,
  type SplitCalculation,
} from "@/lib/actions/invoice-splits";
import type { InvoiceSplitType } from "@prisma/client";
import { cn } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  totalCents: number;
}

interface InvoiceSplitSectionProps {
  invoiceId: string;
  invoiceTotal: number;
  lineItems: LineItem[];
  clientHasBrokerage: boolean;
  brokerageName?: string | null;
}

const splitTypeOptions: { value: InvoiceSplitType; label: string; description: string }[] = [
  {
    value: "single",
    label: "Single Invoice",
    description: "Standard invoice - no split needed",
  },
  {
    value: "split",
    label: "Percentage Split",
    description: "Single invoice with amounts tracked by recipient",
  },
  {
    value: "dual",
    label: "Dual Invoices",
    description: "Creates separate invoices for agent and brokerage",
  },
];

export function InvoiceSplitSection({
  invoiceId,
  invoiceTotal,
  lineItems,
  clientHasBrokerage,
  brokerageName,
}: InvoiceSplitSectionProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingSplit, setExistingSplit] = useState<InvoiceSplitWithRelations | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [splitType, setSplitType] = useState<InvoiceSplitType>("single");
  const [brokeragePercent, setBrokeragePercent] = useState(30);
  const [lineItemAssignments, setLineItemAssignments] = useState<Record<string, "brokerage" | "agent">>({});
  const [preview, setPreview] = useState<SplitCalculation | null>(null);

  // Load existing split
  useEffect(() => {
    async function loadSplit() {
      const result = await getInvoiceSplit(invoiceId);
      if (result.success && result.data) {
        setExistingSplit(result.data);
        setSplitType(result.data.splitType);
        if (result.data.lineItemAssignments) {
          setLineItemAssignments(result.data.lineItemAssignments);
        }
        // Calculate percentage from amounts if it's a split type
        if (result.data.splitType === "split" && invoiceTotal > 0) {
          const percent = Math.round((result.data.brokerageAmountCents / invoiceTotal) * 100);
          setBrokeragePercent(percent);
        }
      }
      setIsLoading(false);
    }
    loadSplit();
  }, [invoiceId, invoiceTotal]);

  // Initialize line item assignments
  useEffect(() => {
    if (Object.keys(lineItemAssignments).length === 0) {
      const initial: Record<string, "brokerage" | "agent"> = {};
      lineItems.forEach((item) => {
        initial[item.id] = "agent";
      });
      setLineItemAssignments(initial);
    }
  }, [lineItems, lineItemAssignments]);

  // Update preview when settings change
  useEffect(() => {
    async function loadPreview() {
      if (!isEditing) return;
      const result = await previewInvoiceSplit(
        invoiceId,
        splitType,
        splitType === "split" ? brokeragePercent : null,
        splitType === "dual" ? lineItemAssignments : null
      );
      if (result.success) {
        setPreview(result.data);
      }
    }
    loadPreview();
  }, [invoiceId, splitType, brokeragePercent, lineItemAssignments, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await createInvoiceSplit({
        primaryInvoiceId: invoiceId,
        splitType,
        brokeragePayPercent: splitType === "split" ? brokeragePercent : null,
        lineItemAssignments: splitType === "dual" ? lineItemAssignments : null,
      });

      if (result.success) {
        setExistingSplit(result.data);
        setIsEditing(false);
        showToast("Invoice split saved", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to save split", "error");
      }
    } catch {
      showToast("Failed to save split", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSplit = async () => {
    setIsSaving(true);
    try {
      const result = await deleteInvoiceSplit(invoiceId);
      if (result.success) {
        setExistingSplit(null);
        setSplitType("single");
        setIsEditing(false);
        showToast("Invoice split removed", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to remove split", "error");
      }
    } catch {
      showToast("Failed to remove split", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--background-secondary)] rounded w-1/3" />
          <div className="h-8 bg-[var(--background-secondary)] rounded w-full" />
        </div>
      </div>
    );
  }

  // If client doesn't have a brokerage, show info message
  if (!clientHasBrokerage) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
            <SplitIcon className="h-4 w-4 text-foreground-muted" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Invoice Splitting</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Split invoicing is available when the client is associated with a brokerage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Display mode - show existing split
  if (existingSplit && !isEditing) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <SplitIcon className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Invoice Split Active</h3>
              <p className="text-sm text-foreground-muted">
                {existingSplit.splitType === "split" && "Percentage split"}
                {existingSplit.splitType === "dual" && "Dual invoices"}
                {brokerageName && ` with ${brokerageName}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="rounded-lg bg-[var(--background-secondary)] p-4">
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Agent Portion</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(existingSplit.agentAmountCents)}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--background-secondary)] p-4">
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Brokerage Portion</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(existingSplit.brokerageAmountCents)}
            </p>
          </div>
        </div>

        {existingSplit.secondaryInvoice && (
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <p className="text-sm text-foreground-muted mb-2">Secondary Invoice Created</p>
            <a
              href={`/invoices/${existingSplit.secondaryInvoice.id}`}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              {existingSplit.secondaryInvoice.invoiceNumber} →
            </a>
          </div>
        )}
      </div>
    );
  }

  // Edit/Create mode
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
            <SplitIcon className="h-4 w-4 text-foreground-muted" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Invoice Splitting</h3>
            <p className="text-sm text-foreground-muted">
              Split this invoice between agent and {brokerageName || "brokerage"}
            </p>
          </div>
        </div>
        {isEditing && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Split Type Selection */}
      <div className="space-y-3 mt-4">
        {splitTypeOptions.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
              splitType === option.value
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
            )}
          >
            <input
              type="radio"
              name="splitType"
              value={option.value}
              checked={splitType === option.value}
              onChange={(e) => setSplitType(e.target.value as InvoiceSplitType)}
              className="mt-1 accent-[var(--primary)]"
            />
            <div>
              <p className="font-medium text-foreground">{option.label}</p>
              <p className="text-sm text-foreground-muted">{option.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Percentage Split Options */}
      {splitType === "split" && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
          <label className="block text-sm font-medium text-foreground mb-2">
            Brokerage Percentage
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={brokeragePercent}
              onChange={(e) => setBrokeragePercent(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="w-16 text-right">
              <span className="text-lg font-semibold text-foreground">{brokeragePercent}%</span>
            </div>
          </div>
          <div className="flex justify-between text-sm text-foreground-muted mt-2">
            <span>Agent: {100 - brokeragePercent}%</span>
            <span>Brokerage: {brokeragePercent}%</span>
          </div>
        </div>
      )}

      {/* Line Item Assignment for Dual */}
      {splitType === "dual" && lineItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
          <p className="text-sm font-medium text-foreground mb-3">
            Assign Line Items
          </p>
          <div className="space-y-2">
            {lineItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-lg bg-[var(--background-secondary)] p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.description}</p>
                  <p className="text-xs text-foreground-muted">{formatCurrency(item.totalCents)}</p>
                </div>
                <select
                  value={lineItemAssignments[item.id] || "agent"}
                  onChange={(e) =>
                    setLineItemAssignments({
                      ...lineItemAssignments,
                      [item.id]: e.target.value as "brokerage" | "agent",
                    })
                  }
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                >
                  <option value="agent">Agent</option>
                  <option value="brokerage">Brokerage</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && splitType !== "single" && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
          <p className="text-sm font-medium text-foreground-muted mb-3">Split Preview</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[var(--background-secondary)] p-4">
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Agent</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(preview.agentAmountCents)}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--background-secondary)] p-4">
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Brokerage</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(preview.brokerageAmountCents)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[var(--card-border)]">
        {existingSplit && (
          <button
            onClick={handleRemoveSplit}
            disabled={isSaving}
            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            Remove Split
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : existingSplit ? "Update Split" : "Apply Split"}
        </button>
      </div>
    </div>
  );
}

function SplitIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.75 3a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h3.5v-6h-3V4.5h11.5v5.25h-3v6h3.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75H3.75ZM8.75 10.5v5.25h2.5V10.5h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}
