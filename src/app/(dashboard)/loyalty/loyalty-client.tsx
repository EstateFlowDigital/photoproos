"use client";

import { useState } from "react";
import {
  Crown,
  Users,
  Gift,
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Star,
  Award,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type TierLevel = "bronze" | "silver" | "gold" | "platinum";

interface LoyaltyMember {
  id: string;
  clientName: string;
  clientEmail: string;
  tier: TierLevel;
  points: number;
  lifetimeSpend: number;
  totalBookings: number;
  referrals: number;
  joinedAt: string;
  lastBookingAt: string | null;
}

const MOCK_MEMBERS: LoyaltyMember[] = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@example.com",
    tier: "platinum",
    points: 15200,
    lifetimeSpend: 12500,
    totalBookings: 8,
    referrals: 5,
    joinedAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
    lastBookingAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    tier: "gold",
    points: 8500,
    lifetimeSpend: 7200,
    totalBookings: 5,
    referrals: 2,
    joinedAt: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000).toISOString(),
    lastBookingAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    clientName: "Emily Davis",
    clientEmail: "emily@example.com",
    tier: "silver",
    points: 4200,
    lifetimeSpend: 3500,
    totalBookings: 3,
    referrals: 1,
    joinedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    lastBookingAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    clientName: "Amanda Wilson",
    clientEmail: "amanda@example.com",
    tier: "bronze",
    points: 1500,
    lifetimeSpend: 1200,
    totalBookings: 1,
    referrals: 0,
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastBookingAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    clientName: "David Thompson",
    clientEmail: "david@example.com",
    tier: "gold",
    points: 7800,
    lifetimeSpend: 6500,
    totalBookings: 4,
    referrals: 3,
    joinedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    lastBookingAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const TIER_CONFIG: Record<TierLevel, { label: string; color: string; bg: string; icon: typeof Crown; minPoints: number }> = {
  bronze: { label: "Bronze", color: "text-[#cd7f32]", bg: "bg-[#cd7f32]/10", icon: Award, minPoints: 0 },
  silver: { label: "Silver", color: "text-[#c0c0c0]", bg: "bg-[#c0c0c0]/10", icon: Award, minPoints: 2500 },
  gold: { label: "Gold", color: "text-[#ffd700]", bg: "bg-[#ffd700]/10", icon: Crown, minPoints: 5000 },
  platinum: { label: "Platinum", color: "text-[#e5e4e2]", bg: "bg-[#e5e4e2]/10", icon: Crown, minPoints: 10000 },
};

export function LoyaltyClient() {
  const { showToast } = useToast();
  const [members, setMembers] = useState<LoyaltyMember[]>(MOCK_MEMBERS);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<TierLevel | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.clientName.toLowerCase().includes(search.toLowerCase()) ||
      member.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "all" || member.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleAwardPoints = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, points: m.points + 500 } : m
      )
    );
    showToast("500 points awarded", "success");
    setOpenMenuId(null);
  };

  const stats = {
    totalMembers: members.length,
    totalPoints: members.reduce((sum, m) => sum + m.points, 0),
    lifetimeValue: members.reduce((sum, m) => sum + m.lifetimeSpend, 0),
    platinumMembers: members.filter((m) => m.tier === "platinum").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Members</p>
            <Users className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalMembers}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Points Issued</p>
            <Star className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.totalPoints.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Lifetime Value</p>
            <TrendingUp className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.lifetimeValue)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Platinum Members</p>
            <Crown className="h-4 w-4 text-[#e5e4e2]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.platinumMembers}</p>
        </div>
      </div>

      {/* Tier Overview */}
      <div className="card p-5">
        <h3 className="font-medium text-foreground mb-4">Tier Distribution</h3>
        <div className="grid grid-cols-4 gap-4">
          {(Object.keys(TIER_CONFIG) as TierLevel[]).map((tier) => {
            const config = TIER_CONFIG[tier];
            const count = members.filter((m) => m.tier === tier).length;
            const TierIcon = config.icon;
            return (
              <div key={tier} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${config.bg}`}>
                  <TierIcon className={`h-6 w-6 ${config.color}`} />
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{config.label}</p>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-foreground-muted">{config.minPoints.toLocaleString()}+ pts</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as TierLevel | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Tiers</option>
            {(Object.keys(TIER_CONFIG) as TierLevel[]).map((tier) => (
              <option key={tier} value={tier}>{TIER_CONFIG[tier].label}</option>
            ))}
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Member
        </Button>
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="card p-12 text-center">
          <Crown className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No members found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || tierFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start your loyalty program by adding members"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((member) => {
            const tierConfig = TIER_CONFIG[member.tier];
            const TierIcon = tierConfig.icon;

            return (
              <div key={member.id} className="card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tierConfig.bg}`}>
                      <TierIcon className={`h-5 w-5 ${tierConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">{member.clientName}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierConfig.bg} ${tierConfig.color}`}>
                          {tierConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-foreground-muted">
                        <span>{member.clientEmail}</span>
                        <span>•</span>
                        <span>{member.totalBookings} bookings</span>
                        <span>•</span>
                        <span>{member.referrals} referrals</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{member.points.toLocaleString()}</p>
                      <p className="text-xs text-foreground-muted">points</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-foreground">{formatCurrency(member.lifetimeSpend)}</p>
                      <p className="text-xs text-foreground-muted">lifetime spend</p>
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === member.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button
                            onClick={() => handleAwardPoints(member.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Zap className="h-4 w-4" />
                            Award Points
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Gift className="h-4 w-4" />
                            Send Reward
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
