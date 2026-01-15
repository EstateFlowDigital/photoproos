"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData, formatCurrency } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import { Images, CreditCard, Download, Heart, FileText, MessageSquare } from "lucide-react";

export function ClientPortalHomeMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);
  const clientName = (data.clientName as string) || industryData.contactName;
  const businessName = (data.businessName as string) || industryData.businessName;

  const galleries = [
    {
      name: industryData.galleryName,
      photos: 48,
      status: "ready",
      date: "Jan 12, 2026",
    },
    {
      name: industry === "real_estate" ? "Sunset Hills Property" : "Session #2",
      photos: 32,
      status: "pending",
      date: "Jan 8, 2026",
    },
  ];

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  return (
    <div
      className={cn(
        "client-portal-home-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        theme === "light" && "bg-white border-gray-200",
        className
      )}
      style={primaryStyle}
    >
      {/* Header */}
      <div className="border-b border-[var(--card-border)] bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
            {clientName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Welcome back, {clientName.split(" ")[0]}</h2>
            <p className="text-sm text-white/80">{businessName}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border-b border-[var(--card-border)] p-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Images, label: "Galleries", count: 2 },
            { icon: Heart, label: "Favorites", count: 12 },
            { icon: Download, label: "Downloads", count: null },
            { icon: CreditCard, label: "Invoices", count: 1 },
          ].map((action, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-4 hover:bg-[var(--background-hover)] transition-colors"
            >
              <div className="relative">
                <action.icon className="h-5 w-5 text-[var(--primary)]" />
                {action.count !== null && (
                  <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-[var(--primary)] text-[10px] font-medium text-white flex items-center justify-center">
                    {action.count}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent galleries */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Your Galleries</h3>
          <button className="text-xs text-[var(--primary)] hover:underline">View all</button>
        </div>

        <div className="space-y-3">
          {galleries.map((gallery, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-4 hover:bg-[var(--background-hover)] transition-colors cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="h-16 w-24 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center">
                <Images className="h-6 w-6 text-[var(--primary)]/40" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">{gallery.name}</h4>
                <p className="text-xs text-foreground-muted mt-0.5">{gallery.photos} photos • {gallery.date}</p>
              </div>

              {/* Status */}
              <div
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  gallery.status === "ready"
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : "bg-[var(--warning)]/10 text-[var(--warning)]"
                )}
              >
                {gallery.status === "ready" ? "Ready to view" : "Processing"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending invoice */}
      <div className="border-t border-[var(--card-border)] p-4">
        <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[var(--warning)]/10 p-2">
              <FileText className="h-4 w-4 text-[var(--warning)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">You have an outstanding invoice</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                INV-2026-002 • {formatCurrency(850)} due Jan 24
              </p>
            </div>
            <button className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
              Pay Now
            </button>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="border-t border-[var(--card-border)] p-4 bg-[var(--background-secondary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-foreground-muted" />
            <span className="text-xs text-foreground-muted">Need help? Contact us</span>
          </div>
          <button className="text-xs text-[var(--primary)] hover:underline">Send message</button>
        </div>
      </div>
    </div>
  );
}
