"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RefreshCw,
  FileText,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Refund {
  id: string;
  invoiceNumber: string;
  client: string;
  email: string;
  originalAmount: number;
  refundAmount: number;
  type: "full" | "partial";
  reason: string;
  status: "pending" | "approved" | "processed" | "declined";
  requestedAt: string;
  processedAt: string | null;
  paymentMethod: string;
}

const statusConfig = {
  pending: { label: "Pending", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", icon: Clock },
  approved: { label: "Approved", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10", icon: CheckCircle },
  processed: { label: "Processed", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", icon: CheckCircle },
  declined: { label: "Declined", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10", icon: XCircle },
};

const mockRefunds: Refund[] = [
  {
    id: "1",
    invoiceNumber: "INV-2025-0042",
    client: "Sarah Mitchell",
    email: "sarah@mitchell.com",
    originalAmount: 2500,
    refundAmount: 2500,
    type: "full",
    reason: "Event cancelled due to weather",
    status: "processed",
    requestedAt: "2025-01-08",
    processedAt: "2025-01-09",
    paymentMethod: "Stripe",
  },
  {
    id: "2",
    invoiceNumber: "INV-2025-0038",
    client: "Mike Johnson",
    email: "mike@email.com",
    originalAmount: 1800,
    refundAmount: 450,
    type: "partial",
    reason: "Service downgrade - removed album",
    status: "pending",
    requestedAt: "2025-01-11",
    processedAt: null,
    paymentMethod: "Stripe",
  },
  {
    id: "3",
    invoiceNumber: "INV-2025-0035",
    client: "Emily Roberts",
    email: "emily@roberts.co",
    originalAmount: 950,
    refundAmount: 950,
    type: "full",
    reason: "Duplicate charge",
    status: "approved",
    requestedAt: "2025-01-10",
    processedAt: null,
    paymentMethod: "Square",
  },
  {
    id: "4",
    invoiceNumber: "INV-2025-0028",
    client: "TechCorp Inc",
    email: "billing@techcorp.com",
    originalAmount: 3200,
    refundAmount: 800,
    type: "partial",
    reason: "Unused session credit",
    status: "processed",
    requestedAt: "2025-01-05",
    processedAt: "2025-01-06",
    paymentMethod: "Stripe",
  },
  {
    id: "5",
    invoiceNumber: "INV-2025-0022",
    client: "James Chen",
    email: "james.chen@email.com",
    originalAmount: 1500,
    refundAmount: 1500,
    type: "full",
    reason: "Outside refund policy window",
    status: "declined",
    requestedAt: "2025-01-03",
    processedAt: "2025-01-04",
    paymentMethod: "Stripe",
  },
];

export function RefundsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredRefunds = mockRefunds.filter((refund) => {
    const matchesSearch =
      refund.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRefunded = mockRefunds
    .filter((r) => r.status === "processed")
    .reduce((sum, r) => sum + r.refundAmount, 0);
  const pendingRefunds = mockRefunds.filter((r) => r.status === "pending" || r.status === "approved");
  const pendingAmount = pendingRefunds.reduce((sum, r) => sum + r.refundAmount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCreate = () => {
    toast({
      title: "Process Refund",
      description: "Opening refund form...",
    });
  };

  const handleAction = (action: string, refund: Refund) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for ${refund.invoiceNumber}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <RefreshCw className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockRefunds.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Refunds</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <DollarSign className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalRefunded)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Refunded</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <Clock className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{pendingRefunds.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <DollarSign className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(pendingAmount)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Pending Amount</p>
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
              placeholder="Search refunds..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processed">Processed</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Process Refund
        </button>
      </div>

      {/* Refunds Table */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Invoice</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground-muted)]">Reason</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground-muted)]">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground-muted)]">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRefunds.map((refund) => {
              const StatusIcon = statusConfig[refund.status].icon;

              return (
                <tr key={refund.id} className="border-b border-[var(--card-border)] hover:bg-[var(--background-secondary)]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{refund.invoiceNumber}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">Requested: {refund.requestedAt}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-[var(--foreground)]">{refund.client}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{refund.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-[var(--foreground)]">{refund.reason}</p>
                      <p className="text-xs text-[var(--foreground-muted)] capitalize">{refund.type} refund</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-semibold text-[var(--foreground)]">{formatCurrency(refund.refundAmount)}</p>
                    {refund.type === "partial" && (
                      <p className="text-xs text-[var(--foreground-muted)]">of {formatCurrency(refund.originalAmount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[refund.status].bg} ${statusConfig[refund.status].color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[refund.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === refund.id ? null : refund.id)}
                        className="rounded p-1 hover:bg-[var(--background-secondary)] transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4 text-[var(--foreground-muted)]" />
                      </button>
                      {openMenuId === refund.id && (
                        <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button
                            onClick={() => handleAction("View Details", refund)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <Eye className="h-4 w-4" /> View Details
                          </button>
                          <button
                            onClick={() => handleAction("View Invoice", refund)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <FileText className="h-4 w-4" /> View Invoice
                          </button>
                          {refund.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction("Approve", refund)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--success)] hover:bg-[var(--background-secondary)]"
                              >
                                <CheckCircle className="h-4 w-4" /> Approve
                              </button>
                              <button
                                onClick={() => handleAction("Decline", refund)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                              >
                                <XCircle className="h-4 w-4" /> Decline
                              </button>
                            </>
                          )}
                          {refund.status === "approved" && (
                            <button
                              onClick={() => handleAction("Process Refund", refund)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--background-secondary)]"
                            >
                              <RefreshCw className="h-4 w-4" /> Process Now
                            </button>
                          )}
                          <button
                            onClick={() => handleAction("Email Client", refund)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <Mail className="h-4 w-4" /> Email Client
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredRefunds.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No refunds found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No refund requests to display"}
          </p>
        </div>
      )}
    </div>
  );
}
