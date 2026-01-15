"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData, formatCurrency } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import { ArrowLeft, Download, Send, MoreHorizontal, CreditCard } from "lucide-react";

export function InvoiceDetailMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);
  const invoiceNumber = (data.invoiceNumber as string) || "INV-2026-001";
  const clientName = (data.clientName as string) || industryData.clientName;
  const amount = (data.amount as number) || 1250;
  const status = (data.status as string) || "pending";

  const lineItems = industryData.services.slice(0, 3).map((service, i) => ({
    description: service,
    quantity: 1,
    rate: i === 0 ? amount * 0.6 : amount * 0.2,
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.rate * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  return (
    <div
      className={cn(
        "invoice-detail-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        theme === "light" && "bg-white border-gray-200",
        className
      )}
      style={primaryStyle}
    >
      {/* Header */}
      <div className="border-b border-[var(--card-border)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)]">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">{invoiceNumber}</h2>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    status === "paid" && "bg-[var(--success)]/10 text-[var(--success)]",
                    status === "pending" && "bg-[var(--warning)]/10 text-[var(--warning)]",
                    status === "overdue" && "bg-[var(--error)]/10 text-[var(--error)]"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <p className="text-xs text-foreground-muted">{clientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </button>
            <button className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send
            </button>
            <button className="rounded-lg border border-[var(--border)] p-2 text-foreground-muted hover:bg-[var(--background-hover)]">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Invoice content */}
      <div className="p-6">
        {/* From/To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-medium text-foreground-muted mb-2">FROM</p>
            <p className="text-sm font-medium text-foreground">{industryData.businessName}</p>
            <p className="text-xs text-foreground-muted mt-1">123 Studio Street</p>
            <p className="text-xs text-foreground-muted">Los Angeles, CA 90210</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground-muted mb-2">BILL TO</p>
            <p className="text-sm font-medium text-foreground">{clientName}</p>
            <p className="text-xs text-foreground-muted mt-1">{industryData.contactName}</p>
            <p className="text-xs text-foreground-muted">{industryData.contactEmail}</p>
          </div>
        </div>

        {/* Invoice details */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-3">
            <p className="text-xs text-foreground-muted">Invoice Date</p>
            <p className="text-sm font-medium text-foreground mt-1">Jan 12, 2026</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-3">
            <p className="text-xs text-foreground-muted">Due Date</p>
            <p className="text-sm font-medium text-foreground mt-1">Jan 26, 2026</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-3">
            <p className="text-xs text-foreground-muted">Amount Due</p>
            <p className="text-sm font-bold text-[var(--primary)] mt-1">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-lg border border-[var(--border)] overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--background-secondary)]">
                <th className="px-4 py-2 text-left text-xs font-medium text-foreground-muted">Description</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-foreground-muted">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-foreground-muted">Rate</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-foreground-muted">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-sm text-foreground">{item.description}</td>
                  <td className="px-4 py-3 text-center text-sm text-foreground-muted">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-sm text-foreground-muted">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {formatCurrency(item.rate * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Subtotal</span>
              <span className="text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Tax (8%)</span>
              <span className="text-foreground">{formatCurrency(tax)}</span>
            </div>
            <div className="border-t border-[var(--border)] pt-2 flex justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-[var(--primary)]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Pay button */}
        {status !== "paid" && (
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <button className="w-full rounded-lg bg-[var(--success)] py-3 text-sm font-medium text-white hover:opacity-90 flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay {formatCurrency(total)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
