"use client";

import { useState } from "react";
import {
  Users,
  Gift,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ReferralStatus = "pending" | "contacted" | "booked" | "completed" | "expired";

interface Referral {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referredName: string;
  referredEmail: string;
  referredPhone: string;
  sessionType: string;
  status: ReferralStatus;
  rewardType: "discount" | "cash" | "credit";
  rewardValue: number;
  rewardPaid: boolean;
  referredAt: string;
  bookedAt: string | null;
  completedAt: string | null;
}

const MOCK_REFERRALS: Referral[] = [
  {
    id: "1",
    referrerName: "Sarah Johnson",
    referrerEmail: "sarah@example.com",
    referredName: "Emma Wilson",
    referredEmail: "emma@example.com",
    referredPhone: "(555) 111-2222",
    sessionType: "Wedding Photography",
    status: "completed",
    rewardType: "cash",
    rewardValue: 100,
    rewardPaid: true,
    referredAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    bookedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    referrerName: "Michael Chen",
    referrerEmail: "michael@example.com",
    referredName: "David Lee",
    referredEmail: "david@example.com",
    referredPhone: "(555) 222-3333",
    sessionType: "Corporate Headshots",
    status: "booked",
    rewardType: "credit",
    rewardValue: 75,
    rewardPaid: false,
    referredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    bookedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: "3",
    referrerName: "Emily Davis",
    referrerEmail: "emily@example.com",
    referredName: "Jessica Brown",
    referredEmail: "jessica@example.com",
    referredPhone: "(555) 333-4444",
    sessionType: "Family Portraits",
    status: "contacted",
    rewardType: "discount",
    rewardValue: 50,
    rewardPaid: false,
    referredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    bookedAt: null,
    completedAt: null,
  },
  {
    id: "4",
    referrerName: "Amanda Wilson",
    referrerEmail: "amanda@example.com",
    referredName: "Rachel Green",
    referredEmail: "rachel@example.com",
    referredPhone: "(555) 444-5555",
    sessionType: "Engagement Session",
    status: "pending",
    rewardType: "cash",
    rewardValue: 100,
    rewardPaid: false,
    referredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    bookedAt: null,
    completedAt: null,
  },
  {
    id: "5",
    referrerName: "Chris Thompson",
    referrerEmail: "chris@example.com",
    referredName: "Monica Taylor",
    referredEmail: "monica@example.com",
    referredPhone: "(555) 555-6666",
    sessionType: "Product Photography",
    status: "expired",
    rewardType: "credit",
    rewardValue: 50,
    rewardPaid: false,
    referredAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    bookedAt: null,
    completedAt: null,
  },
];

const STATUS_CONFIG: Record<ReferralStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  contacted: { label: "Contacted", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  booked: { label: "Booked", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  completed: { label: "Completed", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  expired: { label: "Expired", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function ReferralsClient() {
  const { showToast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | "all">("all");
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

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.referrerName.toLowerCase().includes(search.toLowerCase()) ||
      referral.referredName.toLowerCase().includes(search.toLowerCase()) ||
      referral.sessionType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || referral.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (referralId: string, newStatus: ReferralStatus) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === referralId
          ? {
              ...r,
              status: newStatus,
              bookedAt: newStatus === "booked" ? new Date().toISOString() : r.bookedAt,
              completedAt: newStatus === "completed" ? new Date().toISOString() : r.completedAt,
            }
          : r
      )
    );
    showToast(`Referral marked as ${newStatus}`, "success");
    setOpenMenuId(null);
  };

  const handlePayReward = (referralId: string) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === referralId ? { ...r, rewardPaid: true } : r
      )
    );
    showToast("Reward marked as paid", "success");
    setOpenMenuId(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://example.com/refer/abc123");
    showToast("Referral link copied", "success");
  };

  const stats = {
    totalReferrals: referrals.length,
    successfulReferrals: referrals.filter((r) => r.status === "booked" || r.status === "completed").length,
    pendingRewards: referrals.filter((r) => r.status === "completed" && !r.rewardPaid).length,
    totalPaidOut: referrals.filter((r) => r.rewardPaid).reduce((sum, r) => sum + r.rewardValue, 0),
  };

  const conversionRate = stats.totalReferrals > 0
    ? Math.round((stats.successfulReferrals / stats.totalReferrals) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Referrals</p>
            <Users className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalReferrals}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Conversion Rate</p>
            <TrendingUp className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{conversionRate}%</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Pending Rewards</p>
            <Gift className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.pendingRewards}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Paid Out</p>
            <DollarSign className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{formatCurrency(stats.totalPaidOut)}</p>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-foreground">Your Referral Link</h3>
            <p className="text-sm text-foreground-muted mt-1">Share this link with your clients to earn rewards</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-[var(--background-tertiary)] px-3 py-1.5 rounded font-mono">
              https://example.com/refer/abc123
            </code>
            <Button variant="secondary" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search referrals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReferralStatus | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Referral
        </Button>
      </div>

      {/* Referrals List */}
      {filteredReferrals.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No referrals found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Share your referral link to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReferrals.map((referral) => {
            const statusConfig = STATUS_CONFIG[referral.status];

            return (
              <div key={referral.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-foreground-muted">Referred by</span>
                      <span className="font-medium text-foreground">{referral.referrerName}</span>
                      <span className="text-foreground-muted">→</span>
                      <span className="font-medium text-foreground">{referral.referredName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-foreground-muted">
                      <span>{referral.sessionType}</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {referral.referredEmail}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Referred {formatDate(referral.referredAt)}
                      </span>
                      {referral.bookedAt && (
                        <span>Booked {formatDate(referral.bookedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">{formatCurrency(referral.rewardValue)}</span>
                        <span className="text-xs text-foreground-muted capitalize">{referral.rewardType}</span>
                      </div>
                      {referral.rewardPaid ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="text-xs text-foreground-muted">Unpaid</span>
                      )}
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === referral.id ? null : referral.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === referral.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          {referral.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(referral.id, "contacted")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <Mail className="h-4 w-4" />
                              Mark Contacted
                            </button>
                          )}
                          {referral.status === "contacted" && (
                            <button
                              onClick={() => handleUpdateStatus(referral.id, "booked")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Mark Booked
                            </button>
                          )}
                          {referral.status === "booked" && (
                            <button
                              onClick={() => handleUpdateStatus(referral.id, "completed")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Mark Completed
                            </button>
                          )}
                          {referral.status === "completed" && !referral.rewardPaid && (
                            <button
                              onClick={() => handlePayReward(referral.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <DollarSign className="h-4 w-4" />
                              Mark Reward Paid
                            </button>
                          )}
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <ExternalLink className="h-4 w-4" />
                            View Client
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
