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
  DollarSign,
  Calendar,
  Crown,
  Gift,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MembershipPlan {
  id: string;
  name: string;
  tier: "basic" | "standard" | "premium" | "elite";
  price: number;
  interval: "monthly" | "yearly";
  activeMembers: number;
  perks: string[];
  revenue: number;
  color: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "active" | "paused" | "cancelled" | "past_due";
  startDate: string;
  nextBilling: string;
  lifetimeValue: number;
}

const tierConfig = {
  basic: { label: "Basic", color: "text-slate-400", bg: "bg-slate-400/10" },
  standard: { label: "Standard", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  premium: { label: "Premium", color: "text-[var(--ai)]", bg: "bg-[var(--ai)]/10" },
  elite: { label: "Elite", color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

const statusConfig = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  paused: { label: "Paused", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  cancelled: { label: "Cancelled", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-secondary)]" },
  past_due: { label: "Past Due", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
};

const mockPlans: MembershipPlan[] = [
  {
    id: "1",
    name: "Photography Club",
    tier: "basic",
    price: 29,
    interval: "monthly",
    activeMembers: 45,
    perks: ["10% off sessions", "Priority booking", "Member newsletter"],
    revenue: 1305,
    color: "slate-400",
  },
  {
    id: "2",
    name: "Portrait Plus",
    tier: "standard",
    price: 79,
    interval: "monthly",
    activeMembers: 28,
    perks: ["20% off sessions", "1 free mini session/year", "Exclusive presets", "Priority support"],
    revenue: 2212,
    color: "var(--primary)",
  },
  {
    id: "3",
    name: "Studio Elite",
    tier: "premium",
    price: 149,
    interval: "monthly",
    activeMembers: 12,
    perks: ["30% off sessions", "2 free sessions/year", "All presets included", "VIP support", "Early access"],
    revenue: 1788,
    color: "var(--ai)",
  },
  {
    id: "4",
    name: "Unlimited",
    tier: "elite",
    price: 499,
    interval: "monthly",
    activeMembers: 5,
    perks: ["Unlimited sessions", "All products 50% off", "Dedicated account manager", "Custom packages"],
    revenue: 2495,
    color: "yellow-500",
  },
];

const mockMembers: Member[] = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@email.com", plan: "Studio Elite", status: "active", startDate: "2024-06-15", nextBilling: "2025-01-15", lifetimeValue: 2235 },
  { id: "2", name: "Mike Johnson", email: "mike@email.com", plan: "Portrait Plus", status: "active", startDate: "2024-09-01", nextBilling: "2025-01-01", lifetimeValue: 632 },
  { id: "3", name: "Emily Roberts", email: "emily@email.com", plan: "Photography Club", status: "paused", startDate: "2024-03-20", nextBilling: "2025-02-20", lifetimeValue: 290 },
  { id: "4", name: "James Chen", email: "james@email.com", plan: "Unlimited", status: "active", startDate: "2024-11-01", nextBilling: "2025-02-01", lifetimeValue: 1497 },
  { id: "5", name: "Lisa Wong", email: "lisa@email.com", plan: "Portrait Plus", status: "past_due", startDate: "2024-07-10", nextBilling: "2025-01-10", lifetimeValue: 474 },
];

export function MembershipsClient() {
  const { toast } = useToast();
  const [view, setView] = React.useState<"plans" | "members">("plans");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const totalMembers = mockPlans.reduce((sum, p) => sum + p.activeMembers, 0);
  const totalMRR = mockPlans.reduce((sum, p) => sum + p.revenue, 0);
  const avgLifetimeValue = mockMembers.reduce((sum, m) => sum + m.lifetimeValue, 0) / mockMembers.length;

  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCreate = () => {
    toast({
      title: view === "plans" ? "Create Plan" : "Add Member",
      description: `Opening ${view === "plans" ? "plan" : "member"} form...`,
    });
  };

  const handleAction = (action: string, item: MembershipPlan | Member) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${item.name}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Users className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalMembers}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Active Members</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <DollarSign className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalMRR)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Monthly Revenue</p>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <Crown className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockPlans.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Membership Tiers</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1">
            <button
              onClick={() => setView("plans")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                view === "plans"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Plans
            </button>
            <button
              onClick={() => setView("members")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                view === "members"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Members
            </button>
          </div>
          {view === "members" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          )}
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {view === "plans" ? "Create Plan" : "Add Member"}
        </button>
      </div>

      {/* Plans View */}
      {view === "plans" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mockPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6 hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierConfig[plan.tier].bg} ${tierConfig[plan.tier].color}`}>
                    {tierConfig[plan.tier].label}
                  </span>
                  <h3 className="mt-2 font-semibold text-[var(--foreground)]">{plan.name}</h3>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === plan.id ? null : plan.id)}
                    className="rounded p-1 hover:bg-[var(--background-secondary)]"
                  >
                    <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                  </button>
                  {openMenuId === plan.id && (
                    <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                      <button
                        onClick={() => handleAction("Edit Plan", plan)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleAction("Delete", plan)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-[var(--foreground-muted)]">/{plan.interval === "monthly" ? "mo" : "yr"}</span>
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {plan.perks.slice(0, 3).map((perk, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                    <Gift className="h-3 w-3 text-[var(--success)]" />
                    {perk}
                  </div>
                ))}
                {plan.perks.length > 3 && (
                  <p className="text-xs text-[var(--foreground-muted)]">+{plan.perks.length - 3} more perks</p>
                )}
              </div>

              <div className="mt-4 border-t border-[var(--card-border)] pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--foreground-muted)]">{plan.activeMembers} members</span>
                  <span className="font-medium text-[var(--success)]">{formatCurrency(plan.revenue)}/mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members View */}
      {view === "members" && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Member</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Next Billing</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground-muted)]">Lifetime Value</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)]">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-[var(--card-border)] hover:bg-[var(--background-secondary)]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{member.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">{member.plan}</td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-muted)]">{member.nextBilling}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground)]">
                    {formatCurrency(member.lifetimeValue)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[member.status].bg} ${statusConfig[member.status].color}`}>
                      {statusConfig[member.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded p-1 hover:bg-[var(--background-secondary)]">
                      <MoreHorizontal className="h-4 w-4 text-[var(--foreground-muted)]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
