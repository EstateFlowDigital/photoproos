"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "../empty-state";
import type { LeadData } from "../types";
import { useHydrated } from "@/hooks/use-hydrated";

interface LeadsTabProps {
  leads: LeadData[];
}

const STATUS_CONFIG = {
  new: {
    label: "New",
    bgClass: "bg-[var(--primary)]/10",
    textClass: "text-[var(--primary)]",
  },
  contacted: {
    label: "Contacted",
    bgClass: "bg-[var(--warning)]/10",
    textClass: "text-[var(--warning)]",
  },
  qualified: {
    label: "Qualified",
    bgClass: "bg-[var(--success)]/10",
    textClass: "text-[var(--success)]",
  },
  closed: {
    label: "Closed",
    bgClass: "bg-[var(--foreground-muted)]/10",
    textClass: "text-[var(--foreground-muted)]",
  },
};

const TEMPERATURE_CONFIG = {
  hot: {
    label: "Hot",
    bgClass: "bg-[var(--error)]/10",
    textClass: "text-[var(--error)]",
    icon: "🔥",
  },
  warm: {
    label: "Warm",
    bgClass: "bg-[var(--warning)]/10",
    textClass: "text-[var(--warning)]",
    icon: "☀️",
  },
  cold: {
    label: "Cold",
    bgClass: "bg-[var(--primary)]/10",
    textClass: "text-[var(--primary)]",
    icon: "❄️",
  },
};

type FilterStatus = "all" | LeadData["status"];
type SortOption = "newest" | "oldest" | "score" | "temperature";

export function LeadsTab({ leads }: LeadsTabProps) {
  const hydrated = useHydrated();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  // Filter leads
  const filteredLeads = useMemo(() => {
    if (statusFilter === "all") return leads;
    return leads.filter((lead) => lead.status === statusFilter);
  }, [leads, statusFilter]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "score":
          return b.score - a.score;
        case "temperature": {
          const tempOrder = { hot: 0, warm: 1, cold: 2 };
          return tempOrder[a.temperature] - tempOrder[b.temperature];
        }
        default:
          return 0;
      }
    });
  }, [filteredLeads, sortBy]);

  // Count by status
  const statusCounts = useMemo(
    () =>
      leads.reduce(
        (acc, lead) => {
          acc[lead.status]++;
          acc.all++;
          return acc;
        },
        { all: 0, new: 0, contacted: 0, qualified: 0, closed: 0 }
      ),
    [leads]
  );

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={<InboxIcon className="h-12 w-12" />}
        illustration="property"
        title="No leads yet"
        description="When visitors inquire about your properties, their information will appear here. Share your property websites to start receiving leads."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--foreground-muted)]">Total Leads</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{leads.length}</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--foreground-muted)]">New</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{statusCounts.new}</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--foreground-muted)]">Hot Leads</p>
          <p className="text-2xl font-bold text-[var(--error)]">
            {leads.filter((l) => l.temperature === "hot").length}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--foreground-muted)]">Avg Score</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0}
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "new", "contacted", "qualified", "closed"] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)]"
              }`}
            >
              {status === "all" ? "All" : STATUS_CONFIG[status].label} ({statusCounts[status]})
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="score">Highest score</option>
          <option value="temperature">Hottest first</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {sortedLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            isExpanded={expandedLead === lead.id}
            onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
            hydrated={hydrated}
          />
        ))}
      </div>

      {sortedLeads.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--foreground-muted)]">No leads match your filters</p>
        </div>
      )}
    </div>
  );
}

interface LeadCardProps {
  lead: LeadData;
  isExpanded: boolean;
  onToggle: () => void;
  hydrated: boolean;
}

function LeadCard({ lead, isExpanded, onToggle, hydrated }: LeadCardProps) {
  const statusConfig = STATUS_CONFIG[lead.status];
  const tempConfig = TEMPERATURE_CONFIG[lead.temperature];
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }),
    []
  );

  const formatDate = (date: Date | string) => dateFormatter.format(new Date(date));

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--background-hover)]"
      >
        <div className="flex items-center gap-4">
          {/* Score circle */}
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
              lead.score >= 70
                ? "bg-[var(--success)]/20 text-[var(--success)]"
                : lead.score >= 40
                ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                : "bg-[var(--foreground-muted)]/20 text-[var(--foreground-muted)]"
            }`}
          >
            <span className="text-lg font-bold">{lead.score}</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-[var(--foreground)]">{lead.name}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${tempConfig.bgClass} ${tempConfig.textClass}`}
              >
                {tempConfig.icon} {tempConfig.label}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">{lead.email}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{lead.propertyAddress}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}>
            {statusConfig.label}
          </span>
          <span className="text-sm text-[var(--foreground-muted)]" suppressHydrationWarning>
            {hydrated ? formatDate(lead.createdAt) : ""}
          </span>
          <ChevronIcon className={`h-5 w-5 text-[var(--foreground-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--card-border)] p-4">
          {/* Contact Info */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-[var(--foreground-muted)]">Contact Information</p>
              <div className="space-y-1">
                <p className="text-sm text-[var(--foreground)]">
                  <EmailIcon className="mr-2 inline-block h-4 w-4 text-[var(--foreground-muted)]" />
                  {lead.email}
                </p>
                {lead.phone && (
                  <p className="text-sm text-[var(--foreground)]">
                    <PhoneIcon className="mr-2 inline-block h-4 w-4 text-[var(--foreground-muted)]" />
                    {lead.phone}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-[var(--foreground-muted)]">Engagement</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[var(--foreground-muted)]">Page Views:</span>{" "}
                  <span className="font-medium text-[var(--foreground)]">{lead.pageViews}</span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)]">Photo Views:</span>{" "}
                  <span className="font-medium text-[var(--foreground)]">{lead.photoViews}</span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)]">Tour Clicks:</span>{" "}
                  <span className="font-medium text-[var(--foreground)]">{lead.tourClicks}</span>
                </div>
                <div>
                  <span className="text-[var(--foreground-muted)]">Time on Site:</span>{" "}
                  <span className="font-medium text-[var(--foreground)]">{formatTime(lead.totalTimeSeconds)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div>
              <p className="mb-1 text-sm font-medium text-[var(--foreground-muted)]">Message</p>
              <p className="rounded-lg bg-[var(--background-tertiary)] p-3 text-sm text-[var(--foreground)]">
                {lead.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <EmailIcon className="h-4 w-4" />
              Send Email
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--input-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background-hover)]"
              >
                <PhoneIcon className="h-4 w-4" />
                Call
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple icons
function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}
