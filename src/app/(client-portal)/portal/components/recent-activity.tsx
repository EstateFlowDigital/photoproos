"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import type { PropertyData, GalleryData, InvoiceData, LeadData } from "./types";
import { useHydrated } from "@/hooks/use-hydrated";

interface ActivityItem {
  id: string;
  type: "lead" | "gallery" | "invoice" | "property";
  title: string;
  description: string;
  timestamp: Date;
  icon: "user" | "image" | "receipt" | "home" | "download" | "eye";
  color: "primary" | "success" | "warning" | "error";
  href?: string;
}

interface RecentActivityProps {
  properties: PropertyData[];
  galleries: GalleryData[];
  invoices: InvoiceData[];
  leads: LeadData[];
  maxItems?: number;
}

export function RecentActivity({
  properties,
  galleries,
  invoices,
  leads,
  maxItems = 8,
}: RecentActivityProps) {
  const hydrated = useHydrated();
  const recentActivities = useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add leads as activities
    leads.forEach((lead) => {
      activities.push({
        id: `lead-${lead.id}`,
        type: "lead",
        title: `New lead from ${lead.name}`,
        description: lead.propertyAddress,
        timestamp: new Date(lead.createdAt),
        icon: "user",
        color: lead.temperature === "hot" ? "error" : lead.temperature === "warm" ? "warning" : "primary",
      });
    });

    // Add gallery deliveries as activities
    galleries.forEach((gallery) => {
      if (gallery.deliveredAt) {
        activities.push({
          id: `gallery-${gallery.id}`,
          type: "gallery",
          title: `Gallery delivered: ${gallery.name}`,
          description: `${gallery.photoCount} photos ready to view`,
          timestamp: new Date(gallery.deliveredAt),
          icon: "image",
          color: "success",
        });
      }
    });

    // Add paid invoices as activities
    invoices.forEach((invoice) => {
      if (invoice.paidAt) {
        activities.push({
          id: `invoice-paid-${invoice.id}`,
          type: "invoice",
          title: `Invoice paid: #${invoice.invoiceNumber}`,
          description: `$${(invoice.amount / 100).toFixed(2)}`,
          timestamp: new Date(invoice.paidAt),
          icon: "receipt",
          color: "success",
        });
      } else if (invoice.status === "sent" || invoice.status === "overdue") {
        activities.push({
          id: `invoice-sent-${invoice.id}`,
          type: "invoice",
          title: `Invoice sent: #${invoice.invoiceNumber}`,
          description: `$${(invoice.amount / 100).toFixed(2)} ${invoice.status === "overdue" ? "(overdue)" : "due"}`,
          timestamp: new Date(invoice.createdAt),
          icon: "receipt",
          color: invoice.status === "overdue" ? "error" : "warning",
        });
      }
    });

    // Add properties as activities
    properties.forEach((property) => {
      if (property.status === "published") {
        activities.push({
          id: `property-${property.id}`,
          type: "property",
          title: `Property published`,
          description: property.address,
          timestamp: new Date(property.createdAt),
          icon: "home",
          color: "primary",
        });
      }
    });

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activities.slice(0, maxItems);
  }, [galleries, invoices, leads, maxItems, properties]);

  if (recentActivities.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Recent Activity</h2>
        <span className="text-xs text-[var(--foreground-muted)]">
          Last {recentActivities.length} activities
        </span>
      </div>
      <div className="space-y-3">
        {recentActivities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} hydrated={hydrated} />
        ))}
      </div>
    </div>
  );
}

function ActivityRow({ activity, hydrated }: { activity: ActivityItem; hydrated: boolean }) {
  const iconColors = {
    primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
    success: "bg-[var(--success)]/10 text-[var(--success)]",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
    error: "bg-[var(--error)]/10 text-[var(--error)]",
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${iconColors[activity.color]}`}>
        <ActivityIcon type={activity.icon} className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--foreground)]">{activity.title}</p>
        <p className="truncate text-xs text-[var(--foreground-muted)]">{activity.description}</p>
      </div>
      <span className="flex-shrink-0 text-xs text-[var(--foreground-muted)]" suppressHydrationWarning>
        {hydrated ? formatDistanceToNow(activity.timestamp, { addSuffix: true }) : "—"}
      </span>
    </div>
  );
}

function ActivityIcon({ type, className }: { type: ActivityItem["icon"]; className?: string }) {
  switch (type) {
    case "user":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case "image":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case "receipt":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case "home":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "download":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      );
    case "eye":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
}
