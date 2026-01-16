"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  getWebhookLogs,
  getWebhookLog,
  retryWebhookDelivery,
} from "@/lib/actions/cms-webhooks";
import { WEBHOOK_EVENTS } from "@/lib/constants/cms-webhook-events";
import type { CMSWebhookLog, CMSWebhookEvent } from "@prisma/client";
import {
  History,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  RotateCcw,
} from "lucide-react";

type WebhookLogWithWebhook = CMSWebhookLog & {
  webhook?: { name: string; url?: string };
};

interface WebhookLogsViewerProps {
  webhookId?: string;
  webhookName?: string;
  className?: string;
}

/**
 * WebhookLogsViewer - Display webhook delivery history with filtering and retry
 */
export function WebhookLogsViewer({
  webhookId,
  webhookName,
  className,
}: WebhookLogsViewerProps) {
  const [logs, setLogs] = useState<WebhookLogWithWebhook[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<CMSWebhookEvent | null>(null);

  // Selected log for detail view
  const [selectedLog, setSelectedLog] = useState<WebhookLogWithWebhook | null>(
    null
  );

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    const result = await getWebhookLogs({
      webhookId,
      status: statusFilter as CMSWebhookLog["status"] | undefined,
      event: eventFilter || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    if (result.ok && result.data) {
      setLogs(result.data.logs as WebhookLogWithWebhook[]);
      setTotal(result.data.total);
    }
    setIsLoading(false);
  }, [webhookId, statusFilter, eventFilter, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleRetry = async (logId: string) => {
    startTransition(async () => {
      const result = await retryWebhookDelivery(logId);
      if (result.ok) {
        loadLogs();
      }
    });
  };

  const handleViewDetails = async (logId: string) => {
    const result = await getWebhookLog(logId);
    if (result.ok && result.data) {
      setSelectedLog(result.data as WebhookLogWithWebhook);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "retrying":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "retrying":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] border-[var(--border)]";
    }
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setEventFilter(null);
    setPage(1);
  };

  const hasFilters = statusFilter || eventFilter;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--foreground-secondary)]" />
          <h3 className="text-lg font-semibold">
            {webhookName ? `${webhookName} Logs` : "Webhook Logs"}
          </h3>
          <span className="text-sm text-[var(--foreground-muted)]">
            ({total} total)
          </span>
        </div>

        <button
          onClick={() => loadLogs()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn("w-4 h-4", isLoading && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--foreground-secondary)]" />
          <span className="text-sm text-[var(--foreground-secondary)]">
            Filters:
          </span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter || ""}
          onChange={(e) => {
            setStatusFilter(e.target.value || null);
            setPage(1);
          }}
          className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="retrying">Retrying</option>
        </select>

        {/* Event Filter */}
        <select
          value={eventFilter || ""}
          onChange={(e) => {
            setEventFilter((e.target.value as CMSWebhookEvent) || null);
            setPage(1);
          }}
          className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <option value="">All Events</option>
          {WEBHOOK_EVENTS.map((event) => (
            <option key={event.value} value={event.value}>
              {event.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--background-tertiary)] border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Event
                </th>
                {!webhookId && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                    Webhook
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Response
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={webhookId ? 7 : 8}
                    className="px-4 py-8 text-center"
                  >
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[var(--foreground-muted)]" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={webhookId ? 7 : 8}
                    className="px-4 py-8 text-center text-[var(--foreground-secondary)]"
                  >
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs rounded-full border",
                            getStatusColor(log.status)
                          )}
                        >
                          {log.status}
                        </span>
                        {log.retryCount > 0 && (
                          <span className="text-xs text-[var(--foreground-muted)]">
                            (retry {log.retryCount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">
                        {WEBHOOK_EVENTS.find((e) => e.value === log.event)
                          ?.label || log.event}
                      </span>
                    </td>
                    {!webhookId && (
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {log.webhook?.name || "Unknown"}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {log.entityName ? (
                        <div className="flex flex-col">
                          <span className="text-sm">{log.entityName}</span>
                          <span className="text-xs text-[var(--foreground-muted)]">
                            {log.entityType}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--foreground-muted)]">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.responseStatus ? (
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs rounded font-mono",
                            log.responseStatus >= 200 &&
                              log.responseStatus < 300
                              ? "bg-green-500/10 text-green-500"
                              : log.responseStatus >= 400
                                ? "bg-red-500/10 text-red-500"
                                : "bg-yellow-500/10 text-yellow-500"
                          )}
                        >
                          {log.responseStatus}
                        </span>
                      ) : log.error ? (
                        <span className="text-xs text-red-500 truncate max-w-[150px] block">
                          {log.error}
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--foreground-muted)]">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.duration ? (
                        <span className="text-sm font-mono">
                          {log.duration}ms
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--foreground-muted)]">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[var(--foreground-secondary)]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(log.id)}
                          className="p-1.5 rounded hover:bg-[var(--background-tertiary)] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[var(--foreground-secondary)]" />
                        </button>
                        {log.status === "failed" && log.retryCount < 3 && (
                          <button
                            onClick={() => handleRetry(log.id)}
                            disabled={isPending}
                            className="p-1.5 rounded hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50"
                            title="Retry"
                          >
                            <RotateCcw className="w-4 h-4 text-[var(--primary)]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--foreground-secondary)]">
            Showing {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

/**
 * LogDetailModal - Full details of a webhook delivery attempt
 */
function LogDetailModal({
  log,
  onClose,
}: {
  log: WebhookLogWithWebhook;
  onClose: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatJson = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <h3 className="font-semibold">Webhook Log Details</h3>
              <p className="text-sm text-[var(--foreground-secondary)]">
                {log.webhook?.name || "Unknown Webhook"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
              <p className="text-xs text-[var(--foreground-muted)] mb-1">
                Status
              </p>
              <p className="font-medium capitalize">{log.status}</p>
            </div>
            <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
              <p className="text-xs text-[var(--foreground-muted)] mb-1">
                Event
              </p>
              <p className="font-medium">
                {WEBHOOK_EVENTS.find((e) => e.value === log.event)?.label ||
                  log.event}
              </p>
            </div>
            <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
              <p className="text-xs text-[var(--foreground-muted)] mb-1">
                Response Code
              </p>
              <p className="font-medium">{log.responseStatus || "N/A"}</p>
            </div>
            <div className="p-3 bg-[var(--background-tertiary)] rounded-lg">
              <p className="text-xs text-[var(--foreground-muted)] mb-1">
                Duration
              </p>
              <p className="font-medium">
                {log.duration ? `${log.duration}ms` : "N/A"}
              </p>
            </div>
          </div>

          {/* URL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--foreground-secondary)]">
                Request URL
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(log.requestUrl, "url")}
                  className="p-1 rounded hover:bg-[var(--background-hover)] transition-colors"
                  title="Copy URL"
                >
                  {copiedField === "url" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--foreground-muted)]" />
                  )}
                </button>
                <a
                  href={log.requestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-[var(--background-hover)] transition-colors"
                  title="Open URL"
                >
                  <ExternalLink className="w-4 h-4 text-[var(--foreground-muted)]" />
                </a>
              </div>
            </div>
            <p className="text-sm font-mono bg-[var(--background-tertiary)] p-3 rounded-lg break-all">
              {log.requestUrl}
            </p>
          </div>

          {/* Error (if any) */}
          {log.error && (
            <div>
              <label className="text-sm font-medium text-red-500 block mb-2">
                Error
              </label>
              <p className="text-sm font-mono bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg">
                {log.error}
              </p>
            </div>
          )}

          {/* Request Headers */}
          {log.requestHeaders && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--foreground-secondary)]">
                  Request Headers
                </label>
                <button
                  onClick={() =>
                    copyToClipboard(formatJson(log.requestHeaders), "headers")
                  }
                  className="p-1 rounded hover:bg-[var(--background-hover)] transition-colors"
                  title="Copy Headers"
                >
                  {copiedField === "headers" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--foreground-muted)]" />
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono bg-[var(--background-tertiary)] p-3 rounded-lg overflow-x-auto">
                {formatJson(log.requestHeaders)}
              </pre>
            </div>
          )}

          {/* Request Body */}
          {log.requestBody && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--foreground-secondary)]">
                  Request Body
                </label>
                <button
                  onClick={() =>
                    copyToClipboard(formatJson(log.requestBody), "body")
                  }
                  className="p-1 rounded hover:bg-[var(--background-hover)] transition-colors"
                  title="Copy Body"
                >
                  {copiedField === "body" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--foreground-muted)]" />
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono bg-[var(--background-tertiary)] p-3 rounded-lg overflow-x-auto max-h-[300px]">
                {formatJson(log.requestBody)}
              </pre>
            </div>
          )}

          {/* Response Body */}
          {log.responseBody && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--foreground-secondary)]">
                  Response Body
                </label>
                <button
                  onClick={() =>
                    copyToClipboard(log.responseBody || "", "response")
                  }
                  className="p-1 rounded hover:bg-[var(--background-hover)] transition-colors"
                  title="Copy Response"
                >
                  {copiedField === "response" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--foreground-muted)]" />
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono bg-[var(--background-tertiary)] p-3 rounded-lg overflow-x-auto max-h-[200px]">
                {log.responseBody}
              </pre>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--foreground-muted)]">Entity Type</p>
              <p>{log.entityType || "N/A"}</p>
            </div>
            <div>
              <p className="text-[var(--foreground-muted)]">Entity ID</p>
              <p className="font-mono text-xs">{log.entityId || "N/A"}</p>
            </div>
            <div>
              <p className="text-[var(--foreground-muted)]">Entity Name</p>
              <p>{log.entityName || "N/A"}</p>
            </div>
            <div>
              <p className="text-[var(--foreground-muted)]">Retry Count</p>
              <p>{log.retryCount}</p>
            </div>
            <div>
              <p className="text-[var(--foreground-muted)]">Created At</p>
              <p>{new Date(log.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[var(--foreground-muted)]">Log ID</p>
              <p className="font-mono text-xs">{log.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * WebhookLogsCompact - Compact log viewer for embedding in webhook cards
 */
export function WebhookLogsCompact({
  webhookId,
  limit = 5,
}: {
  webhookId: string;
  limit?: number;
}) {
  const [logs, setLogs] = useState<WebhookLogWithWebhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      const result = await getWebhookLogs({
        webhookId,
        limit,
      });

      if (result.ok && result.data) {
        setLogs(result.data.logs as WebhookLogWithWebhook[]);
      }
      setIsLoading(false);
    };

    loadLogs();
  }, [webhookId, limit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <RefreshCw className="w-4 h-4 animate-spin text-[var(--foreground-muted)]" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-[var(--foreground-muted)] text-center py-4">
        No recent deliveries
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between py-2 px-3 bg-[var(--background-tertiary)] rounded-lg"
        >
          <div className="flex items-center gap-2">
            {log.status === "success" ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : log.status === "failed" ? (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-yellow-500" />
            )}
            <span className="text-sm">
              {WEBHOOK_EVENTS.find((e) => e.value === log.event)?.label ||
                log.event}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            {log.duration && <span>{log.duration}ms</span>}
            <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
