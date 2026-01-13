"use client";

import * as React from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Mail,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FailedPayment {
  id: string;
  invoiceNumber: string;
  client: string;
  email: string;
  amount: number;
  failureReason: string;
  failureCode: string;
  attempts: number;
  lastAttempt: string;
  nextRetry: string | null;
  status: "pending" | "retrying" | "recovered" | "failed";
  cardLast4: string;
  cardBrand: string;
}

const statusConfig = {
  pending: { label: "Pending", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", icon: Clock },
  retrying: { label: "Retrying", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10", icon: RefreshCw },
  recovered: { label: "Recovered", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", icon: CheckCircle },
  failed: { label: "Failed", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10", icon: XCircle },
};

const mockFailedPayments: FailedPayment[] = [
  {
    id: "1",
    invoiceNumber: "INV-2025-0048",
    client: "Sarah Mitchell",
    email: "sarah@mitchell.com",
    amount: 1250,
    failureReason: "Card declined - insufficient funds",
    failureCode: "insufficient_funds",
    attempts: 2,
    lastAttempt: "2025-01-11",
    nextRetry: "2025-01-14",
    status: "pending",
    cardLast4: "4242",
    cardBrand: "Visa",
  },
  {
    id: "2",
    invoiceNumber: "INV-2025-0045",
    client: "Mike Johnson",
    email: "mike@email.com",
    amount: 850,
    failureReason: "Card expired",
    failureCode: "expired_card",
    attempts: 3,
    lastAttempt: "2025-01-10",
    nextRetry: null,
    status: "failed",
    cardLast4: "1234",
    cardBrand: "Mastercard",
  },
  {
    id: "3",
    invoiceNumber: "INV-2025-0042",
    client: "Emily Roberts",
    email: "emily@roberts.co",
    amount: 2100,
    failureReason: "Card declined - do not honor",
    failureCode: "do_not_honor",
    attempts: 1,
    lastAttempt: "2025-01-12",
    nextRetry: "2025-01-13",
    status: "retrying",
    cardLast4: "5678",
    cardBrand: "Visa",
  },
  {
    id: "4",
    invoiceNumber: "INV-2025-0038",
    client: "James Chen",
    email: "james.chen@email.com",
    amount: 750,
    failureReason: "Card declined - insufficient funds",
    failureCode: "insufficient_funds",
    attempts: 2,
    lastAttempt: "2025-01-09",
    nextRetry: null,
    status: "recovered",
    cardLast4: "9012",
    cardBrand: "Amex",
  },
  {
    id: "5",
    invoiceNumber: "INV-2025-0035",
    client: "Lisa Wong",
    email: "lisa@company.com",
    amount: 1800,
    failureReason: "Network error",
    failureCode: "network_error",
    attempts: 1,
    lastAttempt: "2025-01-11",
    nextRetry: "2025-01-12",
    status: "pending",
    cardLast4: "3456",
    cardBrand: "Visa",
  },
];

export function FailedPaymentsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredPayments = mockFailedPayments.filter((payment) => {
    const matchesSearch =
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingAmount = mockFailedPayments
    .filter((p) => p.status === "pending" || p.status === "retrying")
    .reduce((sum, p) => sum + p.amount, 0);
  const recoveredAmount = mockFailedPayments
    .filter((p) => p.status === "recovered")
    .reduce((sum, p) => sum + p.amount, 0);
  const failedAmount = mockFailedPayments
    .filter((p) => p.status === "failed")
    .reduce((sum, p) => sum + p.amount, 0);

  const recoveryRate = Math.round(
    (mockFailedPayments.filter((p) => p.status === "recovered").length /
      mockFailedPayments.filter((p) => p.status === "recovered" || p.status === "failed").length) *
      100
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAction = (action: string, payment: FailedPayment) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for ${payment.invoiceNumber}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(pendingAmount)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Pending Recovery</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <CheckCircle className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(recoveredAmount)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Recovered</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--error)]/10">
              <XCircle className="h-5 w-5 text-[var(--error)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(failedAmount)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Lost</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <RefreshCw className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{recoveryRate}%</p>
              <p className="text-sm text-[var(--foreground-muted)]">Recovery Rate</p>
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
              placeholder="Search failed payments..."
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
            <option value="retrying">Retrying</option>
            <option value="recovered">Recovered</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Failed Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => {
          const StatusIcon = statusConfig[payment.status].icon;

          return (
            <div
              key={payment.id}
              className={`rounded-lg border bg-[var(--card)] p-4 ${
                payment.status === "failed"
                  ? "border-[var(--error)]/30"
                  : payment.status === "pending" || payment.status === "retrying"
                  ? "border-[var(--warning)]/30"
                  : "border-[var(--card-border)]"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Payment Info */}
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${statusConfig[payment.status].bg}`}>
                    <StatusIcon className={`h-5 w-5 ${statusConfig[payment.status].color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--foreground)]">{payment.invoiceNumber}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[payment.status].bg} ${statusConfig[payment.status].color}`}>
                        {statusConfig[payment.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {payment.client} • {payment.email}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {payment.cardBrand} •••• {payment.cardLast4}
                      </span>
                      <span>{payment.attempts} attempts</span>
                      <span>Last: {payment.lastAttempt}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {formatCurrency(payment.amount)}
                    </p>
                    {payment.nextRetry && (
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Next retry: {payment.nextRetry}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === payment.id ? null : payment.id)}
                      className="rounded p-2 hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                    </button>
                    {openMenuId === payment.id && (
                      <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        <button
                          onClick={() => handleAction("View Details", payment)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </button>
                        {(payment.status === "pending" || payment.status === "retrying") && (
                          <button
                            onClick={() => handleAction("Retry Now", payment)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <RefreshCw className="h-4 w-4" /> Retry Now
                          </button>
                        )}
                        <button
                          onClick={() => handleAction("Request Card Update", payment)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <CreditCard className="h-4 w-4" /> Request Card Update
                        </button>
                        <button
                          onClick={() => handleAction("Send Reminder", payment)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Mail className="h-4 w-4" /> Send Reminder
                        </button>
                        <button
                          onClick={() => handleAction("View Invoice", payment)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <DollarSign className="h-4 w-4" /> View Invoice
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Failure Reason */}
              <div className="mt-3 rounded bg-[var(--background-secondary)] p-3">
                <p className="text-sm text-[var(--foreground-muted)]">
                  <span className="font-medium text-[var(--foreground)]">Reason:</span> {payment.failureReason}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPayments.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-[var(--success)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No failed payments</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "All payments are processing successfully"}
          </p>
        </div>
      )}
    </div>
  );
}
