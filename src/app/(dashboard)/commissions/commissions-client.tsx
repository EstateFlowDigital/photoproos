"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Commission {
  id: string;
  associate: string;
  associateEmail: string;
  type: "referral" | "associate" | "affiliate";
  source: string;
  sourceAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  earnedDate: string;
  paidDate: string | null;
}

const mockCommissions: Commission[] = [
  {
    id: "1",
    associate: "Sarah Johnson",
    associateEmail: "sarah@studio.com",
    type: "associate",
    source: "Anderson Wedding - INV-2024-001",
    sourceAmount: 4500,
    commissionRate: 15,
    commissionAmount: 675,
    status: "paid",
    earnedDate: "2024-01-15T00:00:00Z",
    paidDate: "2024-01-31T00:00:00Z",
  },
  {
    id: "2",
    associate: "Mike Chen",
    associateEmail: "mike@referrals.com",
    type: "referral",
    source: "Thompson Portrait Session - INV-2024-012",
    sourceAmount: 850,
    commissionRate: 10,
    commissionAmount: 85,
    status: "approved",
    earnedDate: "2024-01-20T00:00:00Z",
    paidDate: null,
  },
  {
    id: "3",
    associate: "Emily Davis",
    associateEmail: "emily@partner.com",
    type: "affiliate",
    source: "Product Bundle - ORD-2024-045",
    sourceAmount: 299,
    commissionRate: 20,
    commissionAmount: 59.8,
    status: "pending",
    earnedDate: "2024-01-22T00:00:00Z",
    paidDate: null,
  },
  {
    id: "4",
    associate: "James Wilson",
    associateEmail: "james@studio.com",
    type: "associate",
    source: "Corporate Event - INV-2024-008",
    sourceAmount: 3200,
    commissionRate: 15,
    commissionAmount: 480,
    status: "paid",
    earnedDate: "2024-01-10T00:00:00Z",
    paidDate: "2024-01-25T00:00:00Z",
  },
  {
    id: "5",
    associate: "Lisa Brown",
    associateEmail: "lisa@referrals.com",
    type: "referral",
    source: "Williams Family - INV-2024-015",
    sourceAmount: 1200,
    commissionRate: 10,
    commissionAmount: 120,
    status: "rejected",
    earnedDate: "2024-01-18T00:00:00Z",
    paidDate: null,
  },
];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  approved: { label: "Approved", icon: CheckCircle, color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  paid: { label: "Paid", icon: DollarSign, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
};

const typeConfig = {
  referral: { label: "Referral", color: "text-[var(--primary)]" },
  associate: { label: "Associate", color: "text-[var(--success)]" },
  affiliate: { label: "Affiliate", color: "text-[var(--ai)]" },
};

export function CommissionsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredCommissions = mockCommissions.filter((commission) => {
    const matchesSearch =
      commission.associate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalEarned: mockCommissions.reduce((acc, c) => acc + c.commissionAmount, 0),
    totalPaid: mockCommissions.filter((c) => c.status === "paid").reduce((acc, c) => acc + c.commissionAmount, 0),
    pending: mockCommissions.filter((c) => c.status === "pending" || c.status === "approved").reduce((acc, c) => acc + c.commissionAmount, 0),
    partners: new Set(mockCommissions.map((c) => c.associate)).size,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <DollarSign className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Earned</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalEarned)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Paid</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <Clock className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Pending Payout</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.pending)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <Users className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Active Partners</p>
              <p className="text-2xl font-semibold">{stats.partners}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search commissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() =>
              toast({
                title: "Export Report",
                description: "Generating commission report...",
              })
            }
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--background-elevated)] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() =>
              toast({
                title: "Add Commission",
                description: "Opening commission form...",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Manual
          </button>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background-tertiary)] border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Partner</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Source</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Sale Amount</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Rate</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Commission</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredCommissions.map((commission) => {
              const status = statusConfig[commission.status];
              const type = typeConfig[commission.type];
              const StatusIcon = status.icon;

              return (
                <tr key={commission.id} className="hover:bg-[var(--background-tertiary)] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{commission.associate}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{commission.associateEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${type.color}`}>{type.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm">{commission.source}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{formatDate(commission.earnedDate)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm">{formatCurrency(commission.sourceAmount)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm">{commission.commissionRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold">{formatCurrency(commission.commissionAmount)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-end">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === commission.id ? null : commission.id)}
                        className="p-1 hover:bg-[var(--background-elevated)] rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === commission.id && (
                        <div className="absolute right-0 top-8 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              toast({ title: "View Details", description: "Opening commission details..." });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          {commission.status === "pending" && (
                            <button
                              onClick={() => {
                                toast({ title: "Approved", description: "Commission approved for payout" });
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--success)] hover:bg-[var(--success)]/10 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                          )}
                          {commission.status === "approved" && (
                            <button
                              onClick={() => {
                                toast({ title: "Mark Paid", description: "Commission marked as paid" });
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--success)] hover:bg-[var(--success)]/10 transition-colors"
                            >
                              <DollarSign className="w-4 h-4" />
                              Mark Paid
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredCommissions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
            <h3 className="text-lg font-medium mb-2">No commissions found</h3>
            <p className="text-[var(--foreground-muted)]">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Commissions will appear here as referrals and associates earn them"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
