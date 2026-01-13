"use client";

import * as React from "react";
import {
  Search,
  MoreHorizontal,
  Crown,
  DollarSign,
  Calendar,
  Gift,
  Mail,
  Eye,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VipClient {
  id: string;
  name: string;
  email: string;
  tier: "gold" | "platinum" | "diamond";
  lifetimeValue: number;
  totalProjects: number;
  avgProjectValue: number;
  memberSince: string;
  lastProject: string;
  nextMilestone: {
    name: string;
    progress: number;
    target: number;
  };
  perks: string[];
  avatar: string;
}

const tierConfig = {
  gold: {
    label: "Gold",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    icon: Star,
    minSpend: 5000,
  },
  platinum: {
    label: "Platinum",
    color: "text-slate-300",
    bg: "bg-slate-300/10",
    icon: Award,
    minSpend: 15000,
  },
  diamond: {
    label: "Diamond",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    icon: Crown,
    minSpend: 50000,
  },
};

const mockVipClients: VipClient[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    email: "sarah@mitchell.com",
    tier: "diamond",
    lifetimeValue: 78500,
    totalProjects: 24,
    avgProjectValue: 3271,
    memberSince: "2021-03-15",
    lastProject: "2025-01-05",
    nextMilestone: { name: "$100K Club", progress: 78500, target: 100000 },
    perks: ["Priority Booking", "20% Discount", "Free Rush Delivery", "Dedicated Support"],
    avatar: "/api/placeholder/100/100",
  },
  {
    id: "2",
    name: "Corporate Solutions Inc",
    email: "events@corpsolutions.com",
    tier: "platinum",
    lifetimeValue: 42300,
    totalProjects: 15,
    avgProjectValue: 2820,
    memberSince: "2022-06-20",
    lastProject: "2025-01-08",
    nextMilestone: { name: "Diamond Status", progress: 42300, target: 50000 },
    perks: ["Priority Booking", "15% Discount", "Dedicated Support"],
    avatar: "/api/placeholder/100/100",
  },
  {
    id: "3",
    name: "James Chen",
    email: "james.chen@email.com",
    tier: "platinum",
    lifetimeValue: 28900,
    totalProjects: 12,
    avgProjectValue: 2408,
    memberSince: "2022-11-10",
    lastProject: "2024-12-20",
    nextMilestone: { name: "Diamond Status", progress: 28900, target: 50000 },
    perks: ["Priority Booking", "15% Discount"],
    avatar: "/api/placeholder/100/100",
  },
  {
    id: "4",
    name: "Amanda White",
    email: "amanda@whiteco.com",
    tier: "gold",
    lifetimeValue: 12400,
    totalProjects: 6,
    avgProjectValue: 2067,
    memberSince: "2023-05-15",
    lastProject: "2025-01-10",
    nextMilestone: { name: "Platinum Status", progress: 12400, target: 15000 },
    perks: ["Priority Booking", "10% Discount"],
    avatar: "/api/placeholder/100/100",
  },
  {
    id: "5",
    name: "Tech Innovations Ltd",
    email: "media@techinnovations.io",
    tier: "gold",
    lifetimeValue: 8200,
    totalProjects: 4,
    avgProjectValue: 2050,
    memberSince: "2024-02-01",
    lastProject: "2024-12-15",
    nextMilestone: { name: "Platinum Status", progress: 8200, target: 15000 },
    perks: ["Priority Booking"],
    avatar: "/api/placeholder/100/100",
  },
];

export function VipClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredClients = mockVipClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || client.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const totalLifetimeValue = mockVipClients.reduce((sum, c) => sum + c.lifetimeValue, 0);
  const avgLifetimeValue = totalLifetimeValue / mockVipClients.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAction = (action: string, client: VipClient) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for ${client.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Crown className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockVipClients.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">VIP Clients</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <DollarSign className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalLifetimeValue)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Lifetime Value</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <TrendingUp className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(avgLifetimeValue)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Lifetime Value</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10">
              <Crown className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {mockVipClients.filter((c) => c.tier === "diamond").length}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">Diamond Members</p>
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
              placeholder="Search VIP clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
      </div>

      {/* VIP Client Cards */}
      <div className="space-y-4">
        {filteredClients.map((client) => {
          const TierIcon = tierConfig[client.tier].icon;
          const progressPercent = (client.nextMilestone.progress / client.nextMilestone.target) * 100;

          return (
            <div
              key={client.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--background-secondary)]">
                    <span className="text-xl font-semibold text-[var(--foreground)]">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--foreground)]">{client.name}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tierConfig[client.tier].bg} ${tierConfig[client.tier].color}`}>
                        <TierIcon className="h-3 w-3" />
                        {tierConfig[client.tier].label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)]">{client.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 lg:flex lg:items-center lg:gap-8">
                  <div className="text-center lg:text-left">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {formatCurrency(client.lifetimeValue)}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">Lifetime Value</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {client.totalProjects}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">Projects</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {formatCurrency(client.avgProjectValue)}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">Avg Project</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                    className="rounded p-2 hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                  </button>
                  {openMenuId === client.id && (
                    <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                      <button
                        onClick={() => handleAction("View Profile", client)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Eye className="h-4 w-4" /> View Profile
                      </button>
                      <button
                        onClick={() => handleAction("Send Message", client)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Mail className="h-4 w-4" /> Send Message
                      </button>
                      <button
                        onClick={() => handleAction("Add Perk", client)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Gift className="h-4 w-4" /> Add Perk
                      </button>
                      <button
                        onClick={() => handleAction("Schedule Meeting", client)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Calendar className="h-4 w-4" /> Schedule Meeting
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress & Perks */}
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Milestone Progress */}
                <div className="rounded-lg bg-[var(--background-secondary)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      Next: {client.nextMilestone.name}
                    </span>
                    <span className="text-sm text-[var(--foreground-muted)]">
                      {formatCurrency(client.nextMilestone.progress)} / {formatCurrency(client.nextMilestone.target)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--background)]">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)]"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Active Perks */}
                <div className="flex flex-wrap gap-2">
                  {client.perks.map((perk, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-3 py-1 text-xs font-medium text-[var(--success)]"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Crown className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No VIP clients found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || tierFilter !== "all"
              ? "Try adjusting your filters"
              : "Clients automatically become VIP when they reach $5,000 in lifetime value"}
          </p>
        </div>
      )}
    </div>
  );
}
