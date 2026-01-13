"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Mail,
  TrendingUp,
  Filter,
  Zap,
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Segment {
  id: string;
  name: string;
  description: string;
  type: "dynamic" | "static";
  clientCount: number;
  criteria: string[];
  lastUpdated: string;
  avgLifetimeValue: number;
  openRate: number | null;
  color: string;
}

const mockSegments: Segment[] = [
  {
    id: "1",
    name: "High-Value Clients",
    description: "Clients with lifetime value over $5,000",
    type: "dynamic",
    clientCount: 28,
    criteria: ["Lifetime value > $5,000", "At least 2 projects"],
    lastUpdated: "2025-01-12",
    avgLifetimeValue: 12450,
    openRate: 68,
    color: "var(--success)",
  },
  {
    id: "2",
    name: "Wedding Clients",
    description: "Clients who booked wedding photography",
    type: "dynamic",
    clientCount: 45,
    criteria: ["Project type = Wedding", "Booked in last 24 months"],
    lastUpdated: "2025-01-12",
    avgLifetimeValue: 4200,
    openRate: 72,
    color: "var(--primary)",
  },
  {
    id: "3",
    name: "Inactive Clients",
    description: "No activity in 12+ months",
    type: "dynamic",
    clientCount: 67,
    criteria: ["Last project > 12 months ago", "No recent emails opened"],
    lastUpdated: "2025-01-12",
    avgLifetimeValue: 1850,
    openRate: 15,
    color: "var(--warning)",
  },
  {
    id: "4",
    name: "Corporate Accounts",
    description: "Business and corporate clients",
    type: "dynamic",
    clientCount: 18,
    criteria: ["Client type = Business", "Has company name"],
    lastUpdated: "2025-01-12",
    avgLifetimeValue: 8900,
    openRate: 58,
    color: "var(--info)",
  },
  {
    id: "5",
    name: "Newsletter Subscribers",
    description: "Opted into marketing emails",
    type: "static",
    clientCount: 234,
    criteria: ["Email subscribed = true"],
    lastUpdated: "2025-01-10",
    avgLifetimeValue: 2100,
    openRate: 42,
    color: "var(--ai)",
  },
  {
    id: "6",
    name: "Repeat Customers",
    description: "3+ projects completed",
    type: "dynamic",
    clientCount: 52,
    criteria: ["Project count >= 3", "Active in last 18 months"],
    lastUpdated: "2025-01-12",
    avgLifetimeValue: 7800,
    openRate: 75,
    color: "var(--success)",
  },
];

export function SegmentsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredSegments = mockSegments.filter((segment) => {
    const matchesSearch =
      segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || segment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalClients = new Set(mockSegments.flatMap(() => [])).size || 450; // Simulated unique count

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreate = () => {
    toast({
      title: "Create Segment",
      description: "Opening segment builder...",
    });
  };

  const handleAction = (action: string, segment: Segment) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${segment.name}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Target className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockSegments.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Segments</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <Users className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalClients}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Clients</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <Zap className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {mockSegments.filter((s) => s.type === "dynamic").length}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">Dynamic Segments</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <Mail className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">52%</p>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Open Rate</p>
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
              placeholder="Search segments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="dynamic">Dynamic</option>
            <option value="static">Static</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Segment
        </button>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSegments.map((segment) => (
          <div
            key={segment.id}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-5 hover:border-[var(--primary)]/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">{segment.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-xs ${
                    segment.type === "dynamic" ? "text-[var(--info)]" : "text-[var(--foreground-muted)]"
                  }`}>
                    {segment.type === "dynamic" ? <Zap className="h-3 w-3" /> : <Filter className="h-3 w-3" />}
                    {segment.type === "dynamic" ? "Auto-updates" : "Static list"}
                  </span>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === segment.id ? null : segment.id)}
                  className="rounded p-1 hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                </button>
                {openMenuId === segment.id && (
                  <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                    <button
                      onClick={() => handleAction("View Clients", segment)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                    >
                      <Eye className="h-4 w-4" /> View Clients
                    </button>
                    <button
                      onClick={() => handleAction("Edit Segment", segment)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                    >
                      <Edit className="h-4 w-4" /> Edit Segment
                    </button>
                    <button
                      onClick={() => handleAction("Send Campaign", segment)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                    >
                      <Mail className="h-4 w-4" /> Send Campaign
                    </button>
                    <hr className="my-1 border-[var(--card-border)]" />
                    <button
                      onClick={() => handleAction("Delete", segment)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">{segment.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {segment.criteria.map((criterion, index) => (
                <span
                  key={index}
                  className="rounded bg-[var(--background-secondary)] px-2 py-1 text-xs text-[var(--foreground-muted)]"
                >
                  {criterion}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--card-border)] pt-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-[var(--foreground)]">{segment.clientCount}</p>
                <p className="text-xs text-[var(--foreground-muted)]">Clients</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {formatCurrency(segment.avgLifetimeValue)}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">Avg LTV</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {segment.openRate !== null ? `${segment.openRate}%` : "—"}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">Open Rate</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSegments.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No segments found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Create segments to target specific client groups"}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Create Segment
          </button>
        </div>
      )}
    </div>
  );
}
