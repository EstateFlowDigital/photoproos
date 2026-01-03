"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  getEmailLogs,
  getEmailStats,
  resendEmail,
} from "@/lib/actions/email-logs";
import type { EmailType, EmailStatus } from "@prisma/client";

interface EmailLog {
  id: string;
  toEmail: string;
  toName: string | null;
  emailType: EmailType;
  subject: string;
  status: EmailStatus;
  resendId: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  client: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
}

interface EmailStats {
  totalSent: number;
  sentThisMonth: number;
  failed: number;
  byType: Array<{ type: EmailType; count: number }>;
}

const statusConfig: Record<EmailStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pending", color: "text-foreground-muted", bgColor: "bg-[var(--background)]" },
  sent: { label: "Sent", color: "text-[var(--primary)]", bgColor: "bg-[var(--primary)]/10" },
  delivered: { label: "Delivered", color: "text-[var(--success)]", bgColor: "bg-[var(--success)]/10" },
  failed: { label: "Failed", color: "text-[var(--error)]", bgColor: "bg-[var(--error)]/10" },
  bounced: { label: "Bounced", color: "text-[var(--warning)]", bgColor: "bg-[var(--warning)]/10" },
};

const emailTypeLabels: Record<EmailType, string> = {
  gallery_delivered: "Gallery Delivered",
  payment_receipt: "Payment Receipt",
  booking_confirmation: "Booking Confirmation",
  welcome: "Welcome",
  property_lead: "Property Lead",
  gallery_expiration: "Gallery Expiration",
  order_confirmation: "Order Confirmation",
  contract_signing: "Contract Signing",
  contract_signed: "Contract Signed",
  team_invitation: "Team Invitation",
  questionnaire_assigned: "Questionnaire Assigned",
  questionnaire_reminder: "Questionnaire Reminder",
  questionnaire_completed: "Questionnaire Completed",
  photographer_digest: "Photographer Digest",
  custom: "Custom",
};

export default function EmailLogsPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams?.get("clientId");

  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [bulkResending, setBulkResending] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters
  const [statusFilter, setStatusFilter] = useState<EmailStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<EmailType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set()); // Clear selection on data reload
    try {
      const [logsResult, statsResult] = await Promise.all([
        getEmailLogs({
          status: statusFilter === "all" ? undefined : statusFilter,
          emailType: typeFilter === "all" ? undefined : typeFilter,
          search: searchQuery || undefined,
          clientId: clientIdFromUrl || undefined,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        }),
        getEmailStats(),
      ]);

      if (logsResult.success && logsResult.logs) {
        setLogs(logsResult.logs as EmailLog[]);
        setTotalCount(logsResult.total || 0);
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error("Failed to load email data:", error);
      showToast("Failed to load email data", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery, clientIdFromUrl, page, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResend = async (logId: string) => {
    setResendingId(logId);
    try {
      const result = await resendEmail(logId);
      if (result.success) {
        showToast("Email resent successfully", "success");
        loadData();
      } else {
        showToast(result.error || "Failed to resend email", "error");
      }
    } catch {
      showToast("Failed to resend email", "error");
    } finally {
      setResendingId(null);
    }
  };

  // Toggle selection for a single log
  const toggleSelection = (logId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  // Toggle all visible logs
  const toggleSelectAll = () => {
    if (selectedIds.size === logs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(logs.map((log) => log.id)));
    }
  };

  // Get failed/bounced emails from selection
  const getResendableSelection = () => {
    return logs.filter(
      (log) => selectedIds.has(log.id) && ["failed", "bounced"].includes(log.status)
    );
  };

  // Bulk resend failed emails
  const handleBulkResend = async () => {
    const resendable = getResendableSelection();
    if (resendable.length === 0) {
      showToast("No failed emails selected", "error");
      return;
    }

    setBulkResending(true);
    let successCount = 0;
    let failCount = 0;

    for (const log of resendable) {
      try {
        const result = await resendEmail(log.id);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (failCount === 0) {
      showToast(`Successfully resent ${successCount} email${successCount > 1 ? "s" : ""}`, "success");
    } else {
      showToast(`Resent ${successCount}, failed ${failCount}`, "warning");
    }

    setBulkResending(false);
    loadData();
  };

  // Export selected or all logs to CSV
  const handleExport = () => {
    setExporting(true);
    try {
      const logsToExport = selectedIds.size > 0
        ? logs.filter((log) => selectedIds.has(log.id))
        : logs;

      const headers = ["Date", "Recipient", "Email", "Type", "Subject", "Status", "Error"];
      const rows = logsToExport.map((log) => [
        new Date(log.createdAt).toISOString(),
        log.toName || log.client?.fullName || "",
        log.toEmail,
        emailTypeLabels[log.emailType] || log.emailType,
        log.subject.replace(/"/g, '""'),
        log.status,
        (log.errorMessage || "").replace(/"/g, '""'),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `email-logs-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${logsToExport.length} email${logsToExport.length > 1 ? "s" : ""}`, "success");
    } catch {
      showToast("Failed to export emails", "error");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const resendableCount = getResendableSelection().length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Logs"
        subtitle="Track all emails sent from your organization"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Sent"
            value={stats.totalSent}
            icon={<SendIcon className="h-5 w-5" />}
            color="primary"
          />
          <StatCard
            label="Sent This Month"
            value={stats.sentThisMonth}
            icon={<CalendarIcon className="h-5 w-5" />}
            color="success"
          />
          <StatCard
            label="Failed (30d)"
            value={stats.failed}
            icon={<AlertIcon className="h-5 w-5" />}
            color={stats.failed > 0 ? "error" : "success"}
          />
          <StatCard
            label="Email Types"
            value={stats.byType.length}
            icon={<MailIcon className="h-5 w-5" />}
            color="primary"
          />
        </div>
      )}

      {/* Email Types Breakdown */}
      {stats && stats.byType.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Emails by Type (Last 30 Days)</h3>
          <div className="flex flex-wrap gap-2">
            {stats.byType.map(({ type, count }) => (
              <div
                key={type}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-2"
              >
                <span className="text-sm text-foreground">{emailTypeLabels[type] || type}</span>
                <span className="text-sm font-semibold text-[var(--primary)]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">Search</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by email, name, or subject..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as EmailStatus | "all");
              setPage(1);
            }}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground-muted mb-1.5">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as EmailType | "all");
              setPage(1);
            }}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Types</option>
            {Object.entries(emailTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setStatusFilter("all");
            setTypeFilter("all");
            setSearchQuery("");
            setPage(1);
          }}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          Clear
        </button>

        <button
          onClick={handleExport}
          disabled={exporting || logs.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
        >
          {exporting ? <LoadingSpinner className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
          Export CSV
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3">
          <span className="text-sm text-foreground">
            {selectedIds.size} email{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          {resendableCount > 0 && (
            <button
              onClick={handleBulkResend}
              disabled={bulkResending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              {bulkResending ? <LoadingSpinner className="h-4 w-4" /> : <RefreshIcon className="h-4 w-4" />}
              Resend {resendableCount} Failed
            </button>
          )}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Client Filter Notice */}
      {clientIdFromUrl && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3">
          <span className="text-sm text-foreground">Showing emails for specific client</span>
          <Link
            href="/settings/email-logs"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            View All Emails
          </Link>
        </div>
      )}

      {/* Email Logs Table */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-foreground-muted">
            <LoadingSpinner className="h-6 w-6 mx-auto mb-2" />
            Loading emails...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-foreground-muted">
            <MailIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No email logs found</p>
            <p className="text-sm mt-1">Emails will appear here as they are sent</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)] bg-[var(--background)]">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === logs.length && logs.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted">Recipient</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted">Subject</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted">Date</th>
                    <th className="text-right px-4 py-3 font-medium text-foreground-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className={cn(
                        "border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--background-hover)]",
                        selectedIds.has(log.id) && "bg-[var(--primary)]/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(log.id)}
                          onChange={() => toggleSelection(log.id)}
                          className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {log.toName || log.client?.fullName || "—"}
                          </p>
                          <p className="text-xs text-foreground-muted">{log.toEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-[var(--background)] px-2 py-1 text-xs font-medium text-foreground">
                          {emailTypeLabels[log.emailType] || log.emailType}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-foreground">
                        {log.subject}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            statusConfig[log.status].bgColor,
                            statusConfig[log.status].color
                          )}
                        >
                          {log.status === "pending" && <PendingIcon className="h-3 w-3" />}
                          {log.status === "sent" && <SendIcon className="h-3 w-3" />}
                          {log.status === "delivered" && <CheckIcon className="h-3 w-3" />}
                          {log.status === "failed" && <AlertIcon className="h-3 w-3" />}
                          {log.status === "bounced" && <BounceIcon className="h-3 w-3" />}
                          {statusConfig[log.status].label}
                        </span>
                        {log.errorMessage && (
                          <p className="mt-1 text-xs text-[var(--error)] max-w-xs truncate" title={log.errorMessage}>
                            {log.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <p className="text-foreground">
                            {new Date(log.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-foreground-muted">
                            {new Date(log.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {["failed", "bounced"].includes(log.status) && (
                          <button
                            onClick={() => handleResend(log.id)}
                            disabled={resendingId === log.id}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                              "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20",
                              "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                          >
                            {resendingId === log.id ? (
                              <LoadingSpinner className="h-3 w-3" />
                            ) : (
                              <RefreshIcon className="h-3 w-3" />
                            )}
                            Resend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--card-border)]">
                <p className="text-sm text-foreground-muted">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} emails
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "success" | "error" | "warning";
}) {
  const colorClasses = {
    primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
    success: "bg-[var(--success)]/10 text-[var(--success)]",
    error: "bg-[var(--error)]/10 text-[var(--error)]",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClasses[color])}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
          <p className="text-xs text-foreground-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function PendingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function BounceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.628a5.25 5.25 0 0 1 0 10.5H10.75a.75.75 0 0 1 0-1.5h3.5a3.75 3.75 0 0 0 0-7.5H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z" clipRule="evenodd" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}
