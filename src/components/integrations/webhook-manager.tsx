"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusIcon,
  CopyIcon,
  TrashIcon,
  CheckIcon,
  WarningIcon,
  RefreshIcon,
  PlugIcon,
  ChevronDownIcon,
} from "@/components/ui/settings-icons";
import {
  createWebhookEndpoint,
  updateWebhookEndpoint,
  deleteWebhookEndpoint,
  testWebhookEndpoint,
  regenerateWebhookSecret,
  WEBHOOK_EVENT_TYPES,
} from "@/lib/actions/webhooks";

// ============================================================================
// Types
// ============================================================================

interface WebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  isActive: boolean;
  lastDeliveryAt: Date | null;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    deliveries: number;
  };
}

// ============================================================================
// Webhook Manager
// ============================================================================

interface WebhookManagerProps {
  webhooks: WebhookEndpoint[];
  onRefresh: () => void;
  className?: string;
}

export function WebhookManager({ webhooks, onRefresh, className }: WebhookManagerProps) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [newWebhookSecret, setNewWebhookSecret] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [testingId, setTestingId] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const handleTest = async (webhookId: string) => {
    setTestingId(webhookId);
    setTestResult(null);

    const result = await testWebhookEndpoint(webhookId);

    if (result.success && result.result) {
      setTestResult({
        id: webhookId,
        success: result.result.delivered,
        message: result.result.delivered
          ? `Success! Response ${result.result.status} in ${result.result.duration}ms`
          : result.result.error || "Delivery failed",
      });
    } else {
      setTestResult({
        id: webhookId,
        success: false,
        message: result.error || "Test failed",
      });
    }

    setTestingId(null);
    onRefresh();
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook endpoint?")) {
      return;
    }

    setIsLoading(true);
    const result = await deleteWebhookEndpoint(webhookId);

    if (result.success) {
      onRefresh();
    } else {
      setError(result.error || "Failed to delete webhook");
    }

    setIsLoading(false);
  };

  const handleToggleActive = async (webhookId: string, isActive: boolean) => {
    setIsLoading(true);
    const result = await updateWebhookEndpoint(webhookId, { isActive: !isActive });

    if (result.success) {
      onRefresh();
    } else {
      setError(result.error || "Failed to update webhook");
    }

    setIsLoading(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Webhooks</h3>
          <p className="text-sm text-foreground-muted">
            Receive real-time notifications when events happen
          </p>
        </div>
        {!isCreating && !newWebhookSecret && (
          <Button variant="secondary" size="sm" onClick={() => setIsCreating(true)}>
            <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
            Add Endpoint
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          <WarningIcon className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-[var(--error)]/70 hover:text-[var(--error)]">
            Dismiss
          </button>
        </div>
      )}

      {/* New Webhook Secret */}
      {newWebhookSecret && (
        <div className="rounded-lg border border-[var(--warning)]/50 bg-[var(--warning)]/5 p-4">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Save your webhook secret</p>
              <p className="mt-1 text-sm text-foreground-muted">
                Use this secret to verify webhook signatures. This is the only time you will see it.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-[var(--background)] px-3 py-2 font-mono text-sm text-foreground">
                  {newWebhookSecret}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(newWebhookSecret, "new-secret")}
                >
                  {copiedId === "new-secret" ? (
                    <>
                      <CheckIcon className="mr-1.5 h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="mr-1.5 h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="default"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setNewWebhookSecret(null);
                  setIsCreating(false);
                }}
              >
                I&apos;ve saved my secret
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Webhook Form */}
      {isCreating && !newWebhookSecret && (
        <WebhookCreateForm
          onSuccess={(secret) => {
            setNewWebhookSecret(secret);
            onRefresh();
          }}
          onCancel={() => setIsCreating(false)}
          onError={setError}
        />
      )}

      {/* Existing Webhooks */}
      {webhooks.length > 0 ? (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <WebhookEndpointCard
              key={webhook.id}
              webhook={webhook}
              onTest={() => handleTest(webhook.id)}
              onDelete={() => handleDelete(webhook.id)}
              onToggleActive={() => handleToggleActive(webhook.id, webhook.isActive)}
              onCopy={(text) => handleCopy(text, webhook.id)}
              isTesting={testingId === webhook.id}
              testResult={testResult?.id === webhook.id ? testResult : null}
              copied={copiedId === webhook.id}
              disabled={isLoading}
            />
          ))}
        </div>
      ) : (
        !isCreating &&
        !newWebhookSecret && (
          <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
            <PlugIcon className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="mt-2 text-sm font-medium text-foreground">No webhook endpoints</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Create an endpoint to receive event notifications
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => setIsCreating(true)}
            >
              <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
              Add your first endpoint
            </Button>
          </div>
        )
      )}
    </div>
  );
}

// ============================================================================
// Webhook Create Form
// ============================================================================

interface WebhookCreateFormProps {
  onSuccess: (secret: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

function WebhookCreateForm({ onSuccess, onCancel, onError }: WebhookCreateFormProps) {
  const [url, setUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAllEvents, setShowAllEvents] = React.useState(false);

  // Group events by category
  const eventsByCategory = React.useMemo(() => {
    const grouped: Record<string, typeof WEBHOOK_EVENT_TYPES[number][]> = {};
    for (const event of WEBHOOK_EVENT_TYPES) {
      if (!grouped[event.category]) {
        grouped[event.category] = [];
      }
      grouped[event.category].push(event);
    }
    return grouped;
  }, []);

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      onError("Please enter a URL");
      return;
    }

    if (selectedEvents.length === 0) {
      onError("Please select at least one event");
      return;
    }

    setIsLoading(true);

    const result = await createWebhookEndpoint({
      url: url.trim(),
      description: description.trim() || undefined,
      events: selectedEvents,
    });

    if (result.success && result.webhook?.secret) {
      onSuccess(result.webhook.secret);
    } else {
      onError(result.error || "Failed to create webhook");
    }

    setIsLoading(false);
  };

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="space-y-4">
        <Input
          label="Endpoint URL"
          placeholder="https://example.com/webhooks/photoproos"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />

        <Input
          label="Description (optional)"
          placeholder="e.g., Production webhook"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />

        {/* Event Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Events</label>
          <div className="space-y-2">
            {Object.entries(eventsByCategory)
              .slice(0, showAllEvents ? undefined : 2)
              .map(([category, events]) => (
                <div key={category}>
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    {category}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => toggleEvent(event.id)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          selectedEvents.includes(event.id)
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--background-secondary)] text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                        )}
                      >
                        {event.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {Object.keys(eventsByCategory).length > 2 && (
            <button
              type="button"
              onClick={() => setShowAllEvents(!showAllEvents)}
              className="mt-2 flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
            >
              {showAllEvents ? "Show less" : "Show all event types"}
              <ChevronDownIcon
                className={cn("h-3 w-3 transition-transform", showAllEvents && "rotate-180")}
              />
            </button>
          )}

          {selectedEvents.length > 0 && (
            <p className="mt-2 text-xs text-foreground-muted">
              {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"} selected
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading || !url.trim() || selectedEvents.length === 0}
          >
            {isLoading ? "Creating..." : "Create Endpoint"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Webhook Endpoint Card
// ============================================================================

interface WebhookEndpointCardProps {
  webhook: WebhookEndpoint;
  onTest: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onCopy: (text: string) => void;
  isTesting: boolean;
  testResult: { success: boolean; message: string } | null;
  copied: boolean;
  disabled: boolean;
}

function WebhookEndpointCard({
  webhook,
  onTest,
  onDelete,
  onToggleActive,
  onCopy,
  isTesting,
  testResult,
  copied,
  disabled,
}: WebhookEndpointCardProps) {
  const hasRecentFailures = webhook.failureCount > 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4",
        !webhook.isActive && "opacity-60",
        hasRecentFailures && "border-[var(--warning)]/50"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            webhook.isActive
              ? hasRecentFailures
                ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                : "bg-[var(--success)]/10 text-[var(--success)]"
              : "bg-[var(--background-secondary)] text-foreground-muted"
          )}
        >
          <PlugIcon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <code className="truncate text-sm font-medium text-foreground">{webhook.url}</code>
            {!webhook.isActive && (
              <span className="shrink-0 rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-[10px] font-medium text-foreground-muted">
                Disabled
              </span>
            )}
            {hasRecentFailures && (
              <span className="shrink-0 rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--warning)]">
                {webhook.failureCount} failures
              </span>
            )}
          </div>

          {webhook.description && (
            <p className="mt-1 text-sm text-foreground-muted">{webhook.description}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-1">
            {webhook.events.slice(0, 3).map((event) => (
              <span
                key={event}
                className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-[10px] font-medium text-foreground-muted"
              >
                {event}
              </span>
            ))}
            {webhook.events.length > 3 && (
              <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-[10px] font-medium text-foreground-muted">
                +{webhook.events.length - 3} more
              </span>
            )}
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={cn(
                "mt-2 rounded-lg px-3 py-2 text-xs",
                testResult.success
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--error)]/10 text-[var(--error)]"
              )}
            >
              {testResult.message}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTest}
            disabled={disabled || isTesting || !webhook.isActive}
            title="Send test webhook"
          >
            {isTesting ? (
              <RefreshIcon className="h-4 w-4 animate-spin" />
            ) : (
              "Test"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(webhook.url)}
            title="Copy URL"
          >
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleActive}
            disabled={disabled}
            className="text-foreground-muted"
          >
            {webhook.isActive ? "Disable" : "Enable"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={disabled}
            className="text-foreground-muted hover:text-[var(--error)]"
            title="Delete endpoint"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
