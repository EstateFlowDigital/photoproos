"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData, formatCurrency } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import { Plus, Search, Filter, MoreHorizontal, Send, Download } from "lucide-react";

export function InvoicesListMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);

  const invoices = [
    {
      number: "INV-2026-001",
      client: industryData.clientName,
      amount: 1250,
      status: "paid",
      date: "Jan 12, 2026",
      dueDate: "Jan 26, 2026",
    },
    {
      number: "INV-2026-002",
      client: industry === "real_estate" ? "Berkshire Realty" : "Johnson Family",
      amount: 850,
      status: "pending",
      date: "Jan 10, 2026",
      dueDate: "Jan 24, 2026",
    },
    {
      number: "INV-2026-003",
      client: industry === "real_estate" ? "Coldwell Banker" : "Tech Corp",
      amount: 2100,
      status: "overdue",
      date: "Jan 5, 2026",
      dueDate: "Jan 19, 2026",
    },
    {
      number: "INV-2026-004",
      client: industry === "real_estate" ? "Sotheby's International" : "Smith Studio",
      amount: 450,
      status: "draft",
      date: "Jan 14, 2026",
      dueDate: "-",
    },
  ];

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  return (
    <div
      className={cn(
        "invoices-list-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        theme === "light" && "bg-white border-gray-200",
        className
      )}
      style={primaryStyle}
    >
      {/* Header */}
      <div className="border-b border-[var(--card-border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
            <p className="text-xs text-foreground-muted">
              {formatCurrency(industryData.metrics.pendingPayments)} pending
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)]">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 mt-4">
          {[
            { label: "All", count: 12 },
            { label: "Paid", count: 6 },
            { label: "Pending", count: 4 },
            { label: "Overdue", count: 1 },
            { label: "Draft", count: 1 },
          ].map((tab, i) => (
            <button
              key={tab.label}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                i === 0
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-foreground-muted hover:bg-[var(--background-hover)]"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  i === 0 ? "bg-[var(--primary)]/20" : "bg-foreground/10"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Invoice table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted">Due Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {invoices.map((invoice) => (
              <tr key={invoice.number} className="hover:bg-[var(--background-hover)] transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{invoice.number}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground">{invoice.client}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(invoice.amount)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      invoice.status === "paid" && "bg-[var(--success)]/10 text-[var(--success)]",
                      invoice.status === "pending" && "bg-[var(--warning)]/10 text-[var(--warning)]",
                      invoice.status === "overdue" && "bg-[var(--error)]/10 text-[var(--error)]",
                      invoice.status === "draft" && "bg-foreground/10 text-foreground-muted"
                    )}
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground-muted">{invoice.dueDate}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-elevated)] hover:text-foreground">
                      <Send className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-elevated)] hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-elevated)] hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
