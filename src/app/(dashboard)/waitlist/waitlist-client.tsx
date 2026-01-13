"use client";

import { useState } from "react";
import {
  Clock,
  Users,
  Bell,
  Mail,
  Phone,
  Calendar,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type WaitlistStatus = "waiting" | "contacted" | "booked" | "cancelled";

interface WaitlistEntry {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  sessionType: string;
  preferredDates: string[];
  priority: number;
  status: WaitlistStatus;
  notes: string;
  addedAt: string;
  lastContactedAt: string | null;
}

const MOCK_WAITLIST: WaitlistEntry[] = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@example.com",
    clientPhone: "(555) 123-4567",
    sessionType: "Wedding Photography",
    preferredDates: ["June 2025", "July 2025"],
    priority: 1,
    status: "waiting",
    notes: "Very flexible with dates, weekend preferred",
    addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactedAt: null,
  },
  {
    id: "2",
    clientName: "Michael Chen",
    clientEmail: "michael@company.com",
    clientPhone: "(555) 234-5678",
    sessionType: "Corporate Headshots",
    preferredDates: ["Any weekday"],
    priority: 2,
    status: "contacted",
    notes: "Team of 15, needs 2-hour block",
    addedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    clientName: "Emily Davis",
    clientEmail: "emily@email.com",
    clientPhone: "(555) 345-6789",
    sessionType: "Family Portraits",
    preferredDates: ["March 2025"],
    priority: 3,
    status: "waiting",
    notes: "Family of 5, outdoor preferred",
    addedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactedAt: null,
  },
  {
    id: "4",
    clientName: "David Thompson",
    clientEmail: "david@email.com",
    clientPhone: "(555) 456-7890",
    sessionType: "Engagement Session",
    preferredDates: ["February 2025"],
    priority: 4,
    status: "booked",
    notes: "Booked for Feb 14th",
    addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    clientName: "Jessica Martinez",
    clientEmail: "jessica@email.com",
    clientPhone: "(555) 567-8901",
    sessionType: "Maternity Session",
    preferredDates: ["April 2025"],
    priority: 5,
    status: "cancelled",
    notes: "No longer needs session",
    addedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_CONFIG: Record<WaitlistStatus, { label: string; color: string; bg: string }> = {
  waiting: { label: "Waiting", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  contacted: { label: "Contacted", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  booked: { label: "Booked", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  cancelled: { label: "Cancelled", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function WaitlistClient() {
  const { showToast } = useToast();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(MOCK_WAITLIST);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WaitlistStatus | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const filteredWaitlist = waitlist
    .filter((entry) => {
      const matchesSearch =
        entry.clientName.toLowerCase().includes(search.toLowerCase()) ||
        entry.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
        entry.sessionType.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.priority - b.priority);

  const handleMarkContacted = (entryId: string) => {
    setWaitlist((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, status: "contacted" as WaitlistStatus, lastContactedAt: new Date().toISOString() }
          : e
      )
    );
    showToast("Marked as contacted", "success");
    setOpenMenuId(null);
  };

  const handleMarkBooked = (entryId: string) => {
    setWaitlist((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, status: "booked" as WaitlistStatus } : e
      )
    );
    showToast("Marked as booked", "success");
    setOpenMenuId(null);
  };

  const handleRemove = (entryId: string) => {
    setWaitlist((prev) => prev.filter((e) => e.id !== entryId));
    showToast("Removed from waitlist", "success");
    setOpenMenuId(null);
  };

  const handleMovePriority = (entryId: string, direction: "up" | "down") => {
    setWaitlist((prev) => {
      const index = prev.findIndex((e) => e.id === entryId);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updated = [...prev];
      const temp = updated[index].priority;
      updated[index].priority = updated[newIndex].priority;
      updated[newIndex].priority = temp;

      return updated;
    });
  };

  const stats = {
    total: waitlist.length,
    waiting: waitlist.filter((e) => e.status === "waiting").length,
    contacted: waitlist.filter((e) => e.status === "contacted").length,
    booked: waitlist.filter((e) => e.status === "booked").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total on Waitlist</p>
            <Users className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Waiting</p>
            <Clock className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.waiting}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Contacted</p>
            <Bell className="h-4 w-4 text-[var(--info)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--info)]">{stats.contacted}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Booked</p>
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.booked}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search waitlist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WaitlistStatus | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="contacted">Contacted</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add to Waitlist
        </Button>
      </div>

      {/* Waitlist */}
      {filteredWaitlist.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No entries found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Your waitlist is empty"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWaitlist.map((entry, index) => {
            const statusConfig = STATUS_CONFIG[entry.status];

            return (
              <div key={entry.id} className="card p-4">
                <div className="flex items-start gap-4">
                  {/* Priority controls */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleMovePriority(entry.id, "up")}
                      disabled={index === 0}
                      className="p-1 text-foreground-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-foreground-muted">#{entry.priority}</span>
                    <button
                      onClick={() => handleMovePriority(entry.id, "down")}
                      disabled={index === filteredWaitlist.length - 1}
                      className="p-1 text-foreground-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground">{entry.clientName}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-muted mt-1">{entry.sessionType}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {entry.clientEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {entry.clientPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {entry.preferredDates.join(", ")}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="mt-2 text-sm text-foreground-muted italic">{entry.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right text-xs text-foreground-muted hidden sm:block">
                      <p>Added {formatRelativeTime(entry.addedAt)}</p>
                      {entry.lastContactedAt && (
                        <p>Contacted {formatRelativeTime(entry.lastContactedAt)}</p>
                      )}
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === entry.id ? null : entry.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === entry.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button
                            onClick={() => handleMarkContacted(entry.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Bell className="h-4 w-4" />
                            Mark Contacted
                          </button>
                          <button
                            onClick={() => handleMarkBooked(entry.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark Booked
                          </button>
                          <button
                            onClick={() => handleRemove(entry.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                          >
                            <X className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
