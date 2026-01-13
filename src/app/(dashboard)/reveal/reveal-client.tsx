"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Sparkles,
  Image,
  ShoppingCart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RevealSession {
  id: string;
  title: string;
  client: string;
  project: string;
  status: "scheduled" | "in-progress" | "completed" | "draft";
  scheduledDate: string | null;
  scheduledTime: string | null;
  imageCount: number;
  duration: number | null;
  salesTotal: number | null;
  itemsSold: number | null;
}

const statusConfig = {
  draft: { label: "Draft", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-secondary)]" },
  scheduled: { label: "Scheduled", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  "in-progress": { label: "In Progress", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  completed: { label: "Completed", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
};

const mockSessions: RevealSession[] = [
  {
    id: "1",
    title: "Mitchell Wedding Reveal",
    client: "Sarah Mitchell",
    project: "Mitchell Wedding",
    status: "completed",
    scheduledDate: "2025-01-08",
    scheduledTime: "2:00 PM",
    imageCount: 450,
    duration: 75,
    salesTotal: 3200,
    itemsSold: 12,
  },
  {
    id: "2",
    title: "Roberts Family Session",
    client: "Emily Roberts",
    project: "Roberts Family Photos",
    status: "scheduled",
    scheduledDate: "2025-01-15",
    scheduledTime: "10:00 AM",
    imageCount: 180,
    duration: null,
    salesTotal: null,
    itemsSold: null,
  },
  {
    id: "3",
    title: "Johnson Portrait Reveal",
    client: "Mike Johnson",
    project: "Senior Portraits 2025",
    status: "in-progress",
    scheduledDate: "2025-01-12",
    scheduledTime: "3:00 PM",
    imageCount: 95,
    duration: 45,
    salesTotal: 850,
    itemsSold: 4,
  },
  {
    id: "4",
    title: "Chen Maternity Session",
    client: "Lisa Chen",
    project: "Maternity Photos",
    status: "draft",
    scheduledDate: null,
    scheduledTime: null,
    imageCount: 120,
    duration: null,
    salesTotal: null,
    itemsSold: null,
  },
  {
    id: "5",
    title: "Corporate Headshots Presentation",
    client: "TechCorp Inc",
    project: "Team Headshots 2025",
    status: "completed",
    scheduledDate: "2025-01-05",
    scheduledTime: "11:00 AM",
    imageCount: 85,
    duration: 60,
    salesTotal: 4500,
    itemsSold: 25,
  },
];

export function RevealClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredSessions = mockSessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSales = mockSessions.reduce((sum, s) => sum + (s.salesTotal || 0), 0);
  const completedSessions = mockSessions.filter((s) => s.status === "completed").length;
  const scheduledSessions = mockSessions.filter((s) => s.status === "scheduled").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCreate = () => {
    toast({
      title: "Create Reveal Session",
      description: "Opening reveal session wizard...",
    });
  };

  const handleAction = (action: string, session: RevealSession) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${session.title}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockSessions.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Sessions</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <DollarSign className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Sales</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <Calendar className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{scheduledSessions}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <ShoppingCart className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {formatCurrency(totalSales / (completedSessions || 1))}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Per Session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search reveal sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Reveal Session
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/30 transition-colors"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Main Info */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
                  <Sparkles className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--foreground)]">{session.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[session.status].bg} ${statusConfig[session.status].color}`}>
                      {statusConfig[session.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {session.client} • {session.project}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                    <span className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      {session.imageCount} images
                    </span>
                    {session.scheduledDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {session.scheduledDate} at {session.scheduledTime}
                      </span>
                    )}
                    {session.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration} min
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sales Info */}
              <div className="flex items-center gap-6">
                {session.status === "completed" && session.salesTotal !== null && (
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--success)]">
                      {formatCurrency(session.salesTotal)}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {session.itemsSold} items sold
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === session.id ? null : session.id)}
                    className="rounded p-2 hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                  </button>
                  {openMenuId === session.id && (
                    <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                      {(session.status === "scheduled" || session.status === "draft") && (
                        <button
                          onClick={() => handleAction("Start Reveal", session)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Play className="h-4 w-4" /> Start Reveal
                        </button>
                      )}
                      <button
                        onClick={() => handleAction("Edit Session", session)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Edit className="h-4 w-4" /> Edit Session
                      </button>
                      {session.status === "draft" && (
                        <button
                          onClick={() => handleAction("Schedule", session)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Calendar className="h-4 w-4" /> Schedule
                        </button>
                      )}
                      {session.status === "completed" && (
                        <button
                          onClick={() => handleAction("View Sales Report", session)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <DollarSign className="h-4 w-4" /> View Sales Report
                        </button>
                      )}
                      <hr className="my-1 border-[var(--card-border)]" />
                      <button
                        onClick={() => handleAction("Delete", session)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No reveal sessions found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create a reveal session to start selling wall art and products"}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            New Reveal Session
          </button>
        </div>
      )}
    </div>
  );
}
