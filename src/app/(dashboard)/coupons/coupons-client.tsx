"use client";

import { useState } from "react";
import {
  Ticket,
  DollarSign,
  Percent,
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type CouponType = "percentage" | "fixed" | "free_shipping";
type CouponStatus = "active" | "expired" | "disabled";

interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  description: string;
  minPurchase: number;
  maxUses: number | null;
  usedCount: number;
  status: CouponStatus;
  startsAt: string;
  expiresAt: string | null;
  applicableTo: string[];
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: "1",
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    description: "20% off for new clients",
    minPurchase: 0,
    maxUses: null,
    usedCount: 45,
    status: "active",
    startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: null,
    applicableTo: ["All Services"],
  },
  {
    id: "2",
    code: "SUMMER50",
    type: "fixed",
    value: 50,
    description: "$50 off summer sessions",
    minPurchase: 200,
    maxUses: 100,
    usedCount: 78,
    status: "active",
    startsAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    applicableTo: ["Portrait Sessions", "Family Sessions"],
  },
  {
    id: "3",
    code: "PRINTS15",
    type: "percentage",
    value: 15,
    description: "15% off all print orders",
    minPurchase: 100,
    maxUses: 50,
    usedCount: 23,
    status: "active",
    startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    applicableTo: ["Prints", "Wall Art"],
  },
  {
    id: "4",
    code: "HOLIDAY2024",
    type: "percentage",
    value: 25,
    description: "Holiday special discount",
    minPurchase: 150,
    maxUses: 200,
    usedCount: 200,
    status: "expired",
    startsAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    applicableTo: ["All Services"],
  },
  {
    id: "5",
    code: "VIP100",
    type: "fixed",
    value: 100,
    description: "VIP client exclusive",
    minPurchase: 500,
    maxUses: 10,
    usedCount: 5,
    status: "disabled",
    startsAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: null,
    applicableTo: ["Wedding Packages", "Event Photography"],
  },
];

const STATUS_CONFIG: Record<CouponStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  expired: { label: "Expired", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
  disabled: { label: "Disabled", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
};

const TYPE_CONFIG: Record<CouponType, { label: string; icon: typeof Percent }> = {
  percentage: { label: "Percentage", icon: Percent },
  fixed: { label: "Fixed Amount", icon: DollarSign },
  free_shipping: { label: "Free Shipping", icon: Ticket },
};

export function CouponsClient() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CouponStatus | "all">("all");
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

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(search.toLowerCase()) ||
      coupon.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Coupon code copied", "success");
    setOpenMenuId(null);
  };

  const handleToggleStatus = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === couponId
          ? { ...c, status: c.status === "active" ? "disabled" : "active" }
          : c
      )
    );
    showToast("Coupon status updated", "success");
    setOpenMenuId(null);
  };

  const handleDelete = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    showToast("Coupon deleted", "success");
    setOpenMenuId(null);
  };

  const stats = {
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter((c) => c.status === "active").length,
    totalRedemptions: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    totalSavings: coupons.reduce((sum, c) => {
      const avgValue = c.type === "percentage" ? (c.value / 100) * 200 : c.value;
      return sum + avgValue * c.usedCount;
    }, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Coupons</p>
            <Ticket className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalCoupons}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Active Coupons</p>
            <TrendingUp className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.activeCoupons}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Redemptions</p>
            <Users className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{stats.totalRedemptions}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Savings Given</p>
            <DollarSign className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{formatCurrency(stats.totalSavings)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CouponStatus | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons List */}
      {filteredCoupons.length === 0 ? (
        <div className="card p-12 text-center">
          <Ticket className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No coupons found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first coupon to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCoupons.map((coupon) => {
            const statusConfig = STATUS_CONFIG[coupon.status];
            const typeConfig = TYPE_CONFIG[coupon.type];
            const TypeIcon = typeConfig.icon;
            const usagePercent = coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : null;

            return (
              <div key={coupon.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <code className="text-sm font-mono font-semibold text-foreground bg-[var(--background-tertiary)] px-2 py-1 rounded">
                        {coupon.code}
                      </code>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-foreground-muted">
                        <TypeIcon className="h-3 w-3" />
                        {coupon.type === "percentage"
                          ? `${coupon.value}% off`
                          : coupon.type === "fixed"
                          ? `${formatCurrency(coupon.value)} off`
                          : "Free Shipping"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground-muted">{coupon.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-foreground-muted">
                      {coupon.minPurchase > 0 && (
                        <span>Min: {formatCurrency(coupon.minPurchase)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {coupon.expiresAt ? `Expires ${formatDate(coupon.expiresAt)}` : "No expiry"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {coupon.usedCount}
                        {coupon.maxUses && <span className="text-sm text-foreground-muted font-normal"> / {coupon.maxUses}</span>}
                      </div>
                      <p className="text-xs text-foreground-muted">redemptions</p>
                      {usagePercent !== null && (
                        <div className="mt-1 w-24 h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${usagePercent >= 90 ? "bg-[var(--error)]" : "bg-[var(--primary)]"}`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === coupon.id ? null : coupon.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === coupon.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Code
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(coupon.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Ticket className="h-4 w-4" />
                            {coupon.status === "active" ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
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
