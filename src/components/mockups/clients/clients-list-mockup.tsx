"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData, formatCurrency } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone } from "lucide-react";

export function ClientsListMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);

  const clients = [
    {
      name: industryData.contactName,
      company: industryData.clientName,
      email: industryData.contactEmail,
      phone: "(555) 123-4567",
      galleries: 3,
      revenue: 3250,
      status: "active",
    },
    {
      name: industry === "real_estate" ? "Michael Torres" : "David Miller",
      company: industry === "real_estate" ? "Berkshire Realty" : "Miller & Co",
      email: industry === "real_estate" ? "m.torres@berkshire.com" : "david@miller.co",
      phone: "(555) 234-5678",
      galleries: 5,
      revenue: 4800,
      status: "active",
    },
    {
      name: industry === "real_estate" ? "Jessica Williams" : "Amanda Chen",
      company: industry === "real_estate" ? "Coldwell Banker" : "Chen Photography",
      email: industry === "real_estate" ? "j.williams@cb.com" : "amanda@chen.com",
      phone: "(555) 345-6789",
      galleries: 2,
      revenue: 1500,
      status: "inactive",
    },
  ];

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  return (
    <div
      className={cn(
        "clients-list-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        theme === "light" && "bg-white border-gray-200",
        className
      )}
      style={primaryStyle}
    >
      {/* Header */}
      <div className="border-b border-[var(--card-border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Clients</h2>
            <p className="text-xs text-foreground-muted">
              {industryData.metrics.clients} total clients
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)]">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Client list */}
      <div className="divide-y divide-[var(--card-border)]">
        {clients.map((client, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 hover:bg-[var(--background-hover)] transition-colors"
          >
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/60 flex items-center justify-center text-white font-medium text-sm">
              {client.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">{client.name}</h3>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    client.status === "active"
                      ? "bg-[var(--success)]/10 text-[var(--success)]"
                      : "bg-foreground/10 text-foreground-muted"
                  )}
                >
                  {client.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-foreground-muted">{client.company}</p>
            </div>

            {/* Contact */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                <Mail className="h-3.5 w-3.5" />
                {client.email}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                <Phone className="h-3.5 w-3.5" />
                {client.phone}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{client.galleries}</p>
                <p className="text-[10px] text-foreground-muted">Galleries</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(client.revenue)}
                </p>
                <p className="text-[10px] text-foreground-muted">Revenue</p>
              </div>
            </div>

            {/* Actions */}
            <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-elevated)] hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
