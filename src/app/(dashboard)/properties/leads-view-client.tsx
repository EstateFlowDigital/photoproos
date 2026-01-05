"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updateLeadStatus } from "@/lib/actions/property-websites";
import type { LeadStatus } from "@prisma/client";

// Expandable message state for each lead
type ExpandedState = Record<string, boolean>;

interface PropertyLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  source: string | null;
  score: number | null;
  createdAt: Date;
  propertyWebsite: {
    id: string;
    address: string;
    city: string;
    state: string;
    slug: string;
  };
}

interface LeadsViewClientProps {
  leads: PropertyLead[];
}

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-blue-500/20 text-blue-400" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "qualified", label: "Qualified", color: "bg-purple-500/20 text-purple-400" },
  { value: "closed", label: "Closed", color: "bg-green-500/20 text-green-400" },
];

export function LeadsViewClient({ leads }: LeadsViewClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<ExpandedState>({});

  const toggleMessage = (leadId: string) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [leadId]: !prev[leadId],
    }));
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.propertyWebsite.address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Count by status
  const statusCounts = leads.reduce(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      await updateLeadStatus(leadId, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Total Leads</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{leads.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">New</p>
          <p className="mt-1 text-2xl font-bold text-blue-400">{statusCounts.new || 0}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Contacted</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">{statusCounts.contacted || 0}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <p className="text-sm text-foreground-muted">Closed</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{statusCounts.closed || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-none sm:max-w-md sm:flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-secondary hover:bg-[var(--background-hover)]"
            )}
          >
            All ({leads.length})
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === status.value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-secondary hover:bg-[var(--background-hover)]"
              )}
            >
              {status.label} ({statusCounts[status.value] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length > 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Lead
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                  Property
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredLeads.map((lead) => (
                <React.Fragment key={lead.id}>
                  <tr className="transition-colors hover:bg-[var(--background-hover)]">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-foreground-muted">{lead.email}</p>
                      {lead.phone && (
                        <p className="text-sm text-foreground-muted">{lead.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <Link
                      href={`/properties/${lead.propertyWebsite.id}`}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      {lead.propertyWebsite.address}
                    </Link>
                    <p className="text-xs text-foreground-muted">
                      {lead.propertyWebsite.city}, {lead.propertyWebsite.state}
                    </p>
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-foreground-muted lg:table-cell">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      disabled={updatingId === lead.id}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer",
                        STATUS_OPTIONS.find((s) => s.value === lead.status)?.color,
                        updatingId === lead.id && "opacity-50 cursor-wait"
                      )}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Call Button */}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-foreground-muted transition-colors hover:bg-green-500/20 hover:text-green-400"
                          title={`Call ${lead.phone}`}
                        >
                          <PhoneIcon className="h-4 w-4" />
                        </a>
                      )}
                      {/* Email Button */}
                      <a
                        href={`mailto:${lead.email}?subject=Re: ${lead.propertyWebsite.address}`}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-foreground-muted transition-colors hover:bg-blue-500/20 hover:text-blue-400"
                        title={`Email ${lead.email}`}
                      >
                        <EmailIcon className="h-4 w-4" />
                      </a>
                      {/* Message Toggle */}
                      {lead.message && (
                        <button
                          onClick={() => toggleMessage(lead.id)}
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg p-2 transition-colors",
                            expandedMessages[lead.id]
                              ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                              : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                          )}
                          title={expandedMessages[lead.id] ? "Hide message" : "Show message"}
                        >
                          <MessageIcon className="h-4 w-4" />
                        </button>
                      )}
                      {/* View Property */}
                      <Link
                        href={`/properties/${lead.propertyWebsite.id}`}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                        title="View property"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
                  {/* Expanded Message Row */}
                  {lead.message && expandedMessages[lead.id] && (
                    <tr className="bg-[var(--background-secondary)]/50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <MessageIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground-muted" />
                          <div>
                            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-1">
                              Message from {lead.name}
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {lead.message}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <LeadIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No leads yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {statusFilter !== "all"
              ? `No ${statusFilter} leads found.`
              : "Leads from your property websites will appear here."}
          </p>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function LeadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 0 1-5.183.501.78.78 0 0 0-.528.224l-3.579 3.58A.75.75 0 0 1 6 17.25v-3.443a41.033 41.033 0 0 1-2.57-.33C1.993 13.244 1 11.986 1 10.573V5.426c0-1.413.993-2.67 2.43-2.902Z" clipRule="evenodd" />
    </svg>
  );
}
