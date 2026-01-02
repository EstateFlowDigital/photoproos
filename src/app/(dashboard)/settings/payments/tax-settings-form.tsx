"use client";

import { useState } from "react";
import { updateTaxSettings } from "@/lib/actions/settings";

interface TaxSettingsFormProps {
  initialTaxRate: number;
  initialTaxLabel: string;
}

export function TaxSettingsForm({ initialTaxRate, initialTaxLabel }: TaxSettingsFormProps) {
  const [taxRate, setTaxRate] = useState(initialTaxRate.toString());
  const [taxLabel, setTaxLabel] = useState(initialTaxLabel);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const rate = parseFloat(taxRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        setMessage({ type: "error", text: "Tax rate must be between 0 and 100" });
        return;
      }

      const result = await updateTaxSettings({
        defaultTaxRate: rate,
        taxLabel: taxLabel.trim() || "Sales Tax",
      });

      if (result.success) {
        setMessage({ type: "success", text: "Tax settings saved successfully" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save settings" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Default Tax Rate (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              %
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            Applied automatically to new invoices (e.g., 8.25 for 8.25%)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Tax Label
          </label>
          <input
            type="text"
            value={taxLabel}
            onChange={(e) => setTaxLabel(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            placeholder="Sales Tax"
          />
          <p className="mt-1 text-xs text-foreground-muted">
            Label shown on invoices (e.g., &quot;Sales Tax&quot;, &quot;VAT&quot;, &quot;GST&quot;)
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-[var(--success)]/10 text-[var(--success)]"
              : "bg-[var(--error)]/10 text-[var(--error)]"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <LoadingSpinner className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Tax Settings"
          )}
        </button>
      </div>
    </form>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
