"use client";

import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  Webhook,
  Plus,
  Settings,
  Trash2,
  Play,
  Pause,
  Copy,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { CMSWebhook, CMSWebhookEvent } from "@prisma/client";
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  toggleWebhookActive,
  testWebhookDelivery,
} from "@/lib/actions/cms-webhooks";
import { WEBHOOK_EVENTS } from "@/lib/constants/cms-webhook-events";

interface WebhookManagerProps {
  className?: string;
}

/**
 * Main webhook manager component
 */
export function WebhookManager({ className }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<CMSWebhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load webhooks
  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setIsLoading(true);
    const result = await getWebhooks();
    if (result.success && result.data) {
      setWebhooks(result.data);
      setError(null);
    } else {
      setError(result.error || "Failed to load webhooks");
    }
    setIsLoading(false);
  };

  const handleCreate = async (data: {
    name: string;
    description?: string;
    url: string;
    events: CMSWebhookEvent[];
    entityTypes?: string[];
  }) => {
    startTransition(async () => {
      const result = await createWebhook(data);
      if (result.success && result.data) {
        setWebhooks((prev) => [result.data!, ...prev]);
        setIsCreating(false);
      } else {
        setError(result.error || "Failed to create webhook");
      }
    });
  };

  const handleUpdate = async (
    id: string,
    data: {
      name?: string;
      description?: string;
      url?: string;
      events?: CMSWebhookEvent[];
      entityTypes?: string[];
    }
  ) => {
    startTransition(async () => {
      const result = await updateWebhook(id, data);
      if (result.success && result.data) {
        setWebhooks((prev) =>
          prev.map((w) => (w.id === id ? result.data! : w))
        );
        setEditingId(null);
      } else {
        setError(result.error || "Failed to update webhook");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    startTransition(async () => {
      const result = await deleteWebhook(id);
      if (result.success) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
      } else {
        setError(result.error || "Failed to delete webhook");
      }
    });
  };

  const handleToggle = async (id: string) => {
    startTransition(async () => {
      const result = await toggleWebhookActive(id);
      if (result.success) {
        setWebhooks((prev) =>
          prev.map((w) => (w.id === id ? { ...w, isActive: result.data! } : w))
        );
      }
    });
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--foreground-muted)]" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Webhooks
          </h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Send notifications to external services when content changes
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90 transition-colors",
            "disabled:opacity-50"
          )}
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-500/10 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {isCreating && (
        <WebhookForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          isLoading={isPending}
        />
      )}

      {/* Webhooks list */}
      <div className="space-y-4">
        {webhooks.length === 0 && !isCreating ? (
          <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-lg">
            <Webhook className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
            <p className="text-[var(--foreground-muted)]">
              No webhooks configured yet
            </p>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Create a webhook to send notifications to external services
            </p>
          </div>
        ) : (
          webhooks.map((webhook) =>
            editingId === webhook.id ? (
              <WebhookForm
                key={webhook.id}
                webhook={webhook}
                onSubmit={(data) => handleUpdate(webhook.id, data)}
                onCancel={() => setEditingId(null)}
                isLoading={isPending}
              />
            ) : (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onEdit={() => setEditingId(webhook.id)}
                onDelete={() => handleDelete(webhook.id)}
                onToggle={() => handleToggle(webhook.id)}
                isLoading={isPending}
              />
            )
          )
        )}
      </div>
    </div>
  );
}

/**
 * Individual webhook card
 */
function WebhookCard({
  webhook,
  onEdit,
  onDelete,
  onToggle,
  isLoading,
}: {
  webhook: CMSWebhook;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isLoading: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status?: number;
    duration?: number;
    error?: string;
  } | null>(null);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhook.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testWebhookDelivery(webhook.id);
    if (result.success && result.data) {
      setTestResult(result.data);
    } else {
      setTestResult({ success: false, error: result.error });
    }
    setIsTesting(false);
  };

  const eventsByCategory = WEBHOOK_EVENTS.filter((e) =>
    webhook.events.includes(e.value)
  ).reduce(
    (acc, event) => {
      if (!acc[event.category]) acc[event.category] = [];
      acc[event.category].push(event);
      return acc;
    },
    {} as Record<string, typeof WEBHOOK_EVENTS>
  );

  return (
    <div
      className={cn(
        "bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden",
        !webhook.isActive && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "p-2 rounded-lg",
                webhook.isActive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]"
              )}
            >
              <Webhook className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[var(--foreground)] truncate">
                  {webhook.name}
                </h3>
                {webhook.isActive ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]">
                    Paused
                  </span>
                )}
              </div>
              {webhook.description && (
                <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
                  {webhook.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-[var(--foreground-muted)]">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="truncate">{webhook.url}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleTest}
              disabled={isTesting || !webhook.isActive}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                "hover:bg-[var(--background-elevated)]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title="Test webhook"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onToggle}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                "hover:bg-[var(--background-elevated)]"
              )}
              title={webhook.isActive ? "Pause webhook" : "Enable webhook"}
            >
              {webhook.isActive ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onEdit}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                "hover:bg-[var(--background-elevated)]"
              )}
              title="Edit webhook"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "text-[var(--foreground-muted)] hover:text-red-500",
                "hover:bg-red-500/10"
              )}
              title="Delete webhook"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div
            className={cn(
              "mt-3 p-3 rounded-lg text-sm",
              testResult.success
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-500"
            )}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>
                {testResult.success ? "Test successful" : "Test failed"}
              </span>
              {testResult.status && (
                <span className="text-xs opacity-75">
                  (HTTP {testResult.status})
                </span>
              )}
              {testResult.duration && (
                <span className="text-xs opacity-75">
                  {testResult.duration}ms
                </span>
              )}
            </div>
            {testResult.error && (
              <p className="mt-1 text-xs opacity-75">{testResult.error}</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-xs text-[var(--foreground-muted)]">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>{webhook.successCount} success</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            <span>{webhook.failureCount} failed</span>
          </div>
          {webhook.lastTriggeredAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Last:{" "}
                {new Date(webhook.lastTriggeredAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expandable details */}
      <div className="border-t border-[var(--border)]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full px-4 py-2 flex items-center gap-2",
            "text-sm text-[var(--foreground-muted)]",
            "hover:bg-[var(--background-elevated)] transition-colors"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span>
            {webhook.events.length} event
            {webhook.events.length !== 1 ? "s" : ""} configured
          </span>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-4">
            {/* Events */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                Events
              </h4>
              <div className="space-y-2">
                {Object.entries(eventsByCategory).map(([category, events]) => (
                  <div key={category}>
                    <p className="text-xs text-[var(--foreground-muted)] mb-1">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {events.map((event) => (
                        <span
                          key={event.value}
                          className="px-2 py-0.5 text-xs rounded bg-[var(--background-elevated)] text-[var(--foreground)]"
                        >
                          {event.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secret */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                Signing Secret
              </h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 text-sm rounded bg-[var(--background)] border border-[var(--border)] font-mono">
                  {showSecret ? webhook.secret : "•".repeat(40)}
                </code>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 rounded hover:bg-[var(--background-elevated)]"
                  title={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? (
                    <EyeOff className="w-4 h-4 text-[var(--foreground-muted)]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[var(--foreground-muted)]" />
                  )}
                </button>
                <button
                  onClick={handleCopySecret}
                  className="p-2 rounded hover:bg-[var(--background-elevated)]"
                  title="Copy secret"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--foreground-muted)]" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">
                Use this secret to verify webhook signatures. The signature is
                sent in the X-Webhook-Signature header.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Webhook form for create/edit
 */
function WebhookForm({
  webhook,
  onSubmit,
  onCancel,
  isLoading,
}: {
  webhook?: CMSWebhook;
  onSubmit: (data: {
    name: string;
    description?: string;
    url: string;
    events: CMSWebhookEvent[];
    entityTypes?: string[];
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(webhook?.name || "");
  const [description, setDescription] = useState(webhook?.description || "");
  const [url, setUrl] = useState(webhook?.url || "");
  const [events, setEvents] = useState<CMSWebhookEvent[]>(
    webhook?.events || []
  );
  const [error, setError] = useState<string | null>(null);

  const eventsByCategory = WEBHOOK_EVENTS.reduce(
    (acc, event) => {
      if (!acc[event.category]) acc[event.category] = [];
      acc[event.category].push(event);
      return acc;
    },
    {} as Record<string, typeof WEBHOOK_EVENTS>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Invalid URL format");
      return;
    }

    if (events.length === 0) {
      setError("Select at least one event");
      return;
    }

    onSubmit({ name, description: description || undefined, url, events });
  };

  const toggleEvent = (event: CMSWebhookEvent) => {
    setEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  const toggleCategory = (category: string) => {
    const categoryEvents = eventsByCategory[category].map((e) => e.value);
    const allSelected = categoryEvents.every((e) => events.includes(e));

    if (allSelected) {
      setEvents((prev) => prev.filter((e) => !categoryEvents.includes(e)));
    } else {
      setEvents((prev) => [...new Set([...prev, ...categoryEvents])]);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[var(--foreground)]">
          {webhook ? "Edit Webhook" : "Create Webhook"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded hover:bg-[var(--background-elevated)]"
        >
          <X className="w-4 h-4 text-[var(--foreground-muted)]" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Webhook"
          className={cn(
            "w-full px-3 py-2 rounded-lg",
            "bg-[var(--background)] border border-[var(--border)]",
            "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
          )}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className={cn(
            "w-full px-3 py-2 rounded-lg",
            "bg-[var(--background)] border border-[var(--border)]",
            "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
          )}
        />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Endpoint URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/webhooks"
          className={cn(
            "w-full px-3 py-2 rounded-lg",
            "bg-[var(--background)] border border-[var(--border)]",
            "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
          )}
        />
      </div>

      {/* Events */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Events <span className="text-red-500">*</span>
        </label>
        <div className="space-y-4">
          {Object.entries(eventsByCategory).map(([category, categoryEvents]) => {
            const allSelected = categoryEvents.every((e) =>
              events.includes(e.value)
            );
            const someSelected = categoryEvents.some((e) =>
              events.includes(e.value)
            );

            return (
              <div key={category} className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {category}
                  </span>
                </label>
                <div className="ml-6 grid grid-cols-2 gap-2">
                  {categoryEvents.map((event) => (
                    <label
                      key={event.value}
                      className="flex items-start gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={events.includes(event.value)}
                        onChange={() => toggleEvent(event.value)}
                        className="w-4 h-4 mt-0.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <div>
                        <span className="text-sm text-[var(--foreground)]">
                          {event.label}
                        </span>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {event.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
            "hover:bg-[var(--background-elevated)] transition-colors"
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90 transition-colors",
            "disabled:opacity-50"
          )}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {webhook ? "Update Webhook" : "Create Webhook"}
        </button>
      </div>
    </form>
  );
}

/**
 * Compact badge showing webhook count
 */
export function WebhookBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        count > 0
          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
          : "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
        className
      )}
    >
      <Webhook className="w-3.5 h-3.5" />
      <span>
        {count} webhook{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
