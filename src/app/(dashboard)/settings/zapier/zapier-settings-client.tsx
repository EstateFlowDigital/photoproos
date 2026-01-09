"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ZapierIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  KeyIcon,
  PlusIcon,
  WarningIcon,
} from "@/components/ui/settings-icons";
import { generateNewApiKey } from "@/lib/actions/api-keys";

// ============================================================================
// Types
// ============================================================================

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface ZapierSettingsClientProps {
  apiKeys: ApiKey[];
}

// ============================================================================
// Triggers and Actions Definitions
// ============================================================================

const ZAPIER_TRIGGERS = [
  {
    id: "new_booking",
    label: "New Booking",
    description: "Triggers when a new booking is created",
  },
  {
    id: "payment_received",
    label: "Payment Received",
    description: "Triggers when a payment is successfully processed",
  },
  {
    id: "gallery_delivered",
    label: "Gallery Delivered",
    description: "Triggers when a gallery is delivered to a client",
  },
  {
    id: "client_message",
    label: "Client Message",
    description: "Triggers when a client sends a new message",
  },
  {
    id: "booking_cancelled",
    label: "Booking Cancelled",
    description: "Triggers when a booking is cancelled",
  },
];

const ZAPIER_ACTIONS = [
  {
    id: "create_booking",
    label: "Create Booking",
    description: "Create a new booking in PhotoProOS",
  },
  {
    id: "update_client",
    label: "Update Client",
    description: "Update client information or create a new client",
  },
  {
    id: "send_notification",
    label: "Send Notification",
    description: "Send an internal notification to your team",
  },
];

// ============================================================================
// Component
// ============================================================================

export function ZapierSettingsClient({ apiKeys }: ZapierSettingsClientProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [newKeyValue, setNewKeyValue] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Find an active Zapier-specific API key or any active key
  const activeApiKey = React.useMemo(() => {
    const zapierKey = apiKeys.find(
      (key) => key.isActive && key.name.toLowerCase().includes("zapier")
    );
    return zapierKey || apiKeys.find((key) => key.isActive) || null;
  }, [apiKeys]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setMessage({ type: "error", text: "Failed to copy to clipboard" });
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      setMessage({ type: "error", text: "Please enter a name for the API key" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await generateNewApiKey({ name: newKeyName.trim() });

      if (result.success && result.apiKey) {
        setNewKeyValue(result.apiKey.fullKey);
        setNewKeyName("");
        setMessage({ type: "success", text: "API key created successfully" });
      } else {
        setMessage({ type: "error", text: "error" in result ? result.error : "Failed to create API key" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create API key" });
    } finally {
      setLoading(false);
    }
  };

  const handleDismissNewKey = () => {
    setNewKeyValue(null);
    setIsCreating(false);
  };

  const hasApiKey = apiKeys.some((key) => key.isActive);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {message && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3",
            message.type === "success"
              ? "border-[var(--success)]/30 bg-[var(--success)]/10"
              : "border-[var(--error)]/30 bg-[var(--error)]/10"
          )}
        >
          <p
            className={cn(
              "text-sm",
              message.type === "success"
                ? "text-[var(--success)]"
                : "text-[var(--error)]"
            )}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Connection Status Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#FF4A00]/10">
            <ZapierIcon className="h-8 w-8 text-[#FF4A00]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Zapier Connection
            </h2>
            <p className="text-sm text-foreground-muted">
              {hasApiKey
                ? "Your API key is ready for Zapier integration"
                : "Generate an API key to connect with Zapier"}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1",
              hasApiKey
                ? "bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                hasApiKey ? "bg-[var(--success)]" : "bg-foreground-muted"
              )}
            />
            <span className="text-sm font-medium">
              {hasApiKey ? "Ready" : "Not Connected"}
            </span>
          </div>
        </div>

        {/* API Key Section */}
        <div className="space-y-4">
          {activeApiKey ? (
            <div className="rounded-lg bg-[var(--background)] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground-muted mb-1">
                    Active API Key
                  </p>
                  <div className="flex items-center gap-2">
                    <KeyIcon className="h-4 w-4 text-foreground-muted" />
                    <code className="font-mono text-sm text-foreground">
                      {activeApiKey.keyPrefix}...
                    </code>
                    <span className="text-xs text-foreground-muted">
                      ({activeApiKey.name})
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(activeApiKey.keyPrefix, activeApiKey.id)}
                >
                  {copiedId === activeApiKey.id ? (
                    <>
                      <CheckIcon className="mr-1.5 h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="mr-1.5 h-3.5 w-3.5" />
                      Copy Prefix
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-3 text-xs text-foreground-muted">
                Use this API key when setting up the PhotoProOS integration in Zapier.
                For security, only the key prefix is shown. If you need the full key,
                create a new one below.
              </p>
            </div>
          ) : null}

          {/* New Key Created Display */}
          {newKeyValue && (
            <div className="rounded-lg border border-[var(--warning)]/50 bg-[var(--warning)]/5 p-4">
              <div className="flex items-start gap-3">
                <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Save your API key</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    This is the only time you will see this key. Copy it now and use it in Zapier.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-[var(--background)] px-3 py-2 font-mono text-sm text-foreground break-all">
                      {newKeyValue}
                    </code>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopy(newKeyValue, "new-key")}
                    >
                      {copiedId === "new-key" ? (
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
                    onClick={handleDismissNewKey}
                  >
                    I&apos;ve saved my key
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Create New Key Form */}
          {isCreating && !newKeyValue && (
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
              <div className="space-y-3">
                <Input
                  label="API Key Name"
                  placeholder="e.g., Zapier Integration Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  disabled={loading}
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCreateApiKey}
                    disabled={loading || !newKeyName.trim()}
                  >
                    {loading ? "Creating..." : "Create API Key"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setNewKeyName("");
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Create Key Button */}
          {!isCreating && !newKeyValue && (
            <Button
              variant={hasApiKey ? "secondary" : "primary"}
              onClick={() => setIsCreating(true)}
            >
              <PlusIcon className="mr-1.5 h-4 w-4" />
              {hasApiKey ? "Create New API Key" : "Generate API Key"}
            </Button>
          )}
        </div>
      </div>

      {/* Available Triggers */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Available Triggers
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          These events in PhotoProOS can trigger your Zaps automatically.
        </p>

        <div className="space-y-3">
          {ZAPIER_TRIGGERS.map((trigger) => (
            <div
              key={trigger.id}
              className="flex items-center gap-3 rounded-lg bg-[var(--background)] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF4A00]/10">
                <ZapierIcon className="h-5 w-5 text-[#FF4A00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {trigger.label}
                </p>
                <p className="text-xs text-foreground-muted">
                  {trigger.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Actions */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Available Actions
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Actions that can be performed in PhotoProOS from your Zaps.
        </p>

        <div className="space-y-3">
          {ZAPIER_ACTIONS.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-3 rounded-lg bg-[var(--background)] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <CheckIcon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {action.label}
                </p>
                <p className="text-xs text-foreground-muted">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          How to Connect with Zapier
        </h2>
        <ol className="space-y-4 text-sm text-foreground-muted">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
              1
            </span>
            <span>
              <strong className="text-foreground">Generate an API key</strong> above if you
              haven&apos;t already. Copy and save it securely.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
              2
            </span>
            <span>
              <strong className="text-foreground">Go to Zapier</strong> and create a new Zap
              or edit an existing one.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
              3
            </span>
            <span>
              <strong className="text-foreground">Search for PhotoProOS</strong> in the app
              directory and select it as your trigger or action.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
              4
            </span>
            <span>
              <strong className="text-foreground">Enter your API key</strong> when prompted
              to authenticate your PhotoProOS account.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
              5
            </span>
            <span>
              <strong className="text-foreground">Configure your Zap</strong> by selecting
              the trigger events and actions you want to automate.
            </span>
          </li>
        </ol>
      </div>

      {/* Documentation Links */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Resources
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="https://zapier.com/developer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg bg-[var(--background)] p-4 transition-colors hover:bg-[var(--background-hover)]"
          >
            <ExternalLinkIcon className="h-5 w-5 text-foreground-muted" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Zapier Developer Docs
              </p>
              <p className="text-xs text-foreground-muted">
                Learn more about building Zaps
              </p>
            </div>
          </a>
          <a
            href="https://help.zapier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg bg-[var(--background)] p-4 transition-colors hover:bg-[var(--background-hover)]"
          >
            <ExternalLinkIcon className="h-5 w-5 text-foreground-muted" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Zapier Help Center
              </p>
              <p className="text-xs text-foreground-muted">
                Get help with Zapier integrations
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Popular Zaps */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Popular Automation Ideas
        </h2>
        <ul className="space-y-3 text-sm text-foreground-muted">
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">New booking notification:</strong> Send
              a Slack message or email when a new booking is created
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Payment tracking:</strong> Add a row to
              Google Sheets when a payment is received
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Client follow-up:</strong> Create a task
              in your project management tool when a gallery is delivered
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">CRM sync:</strong> Create or update
              contacts in HubSpot, Salesforce, or other CRMs
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Calendar integration:</strong> Create
              calendar events in Google Calendar or Outlook automatically
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
