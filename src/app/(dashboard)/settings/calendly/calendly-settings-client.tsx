"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CalendlyIcon,
  CheckIcon,
  KeyIcon,
  ExternalLinkIcon,
} from "@/components/ui/settings-icons";
import {
  type CalendlyConfig,
  type CalendlyEventType,
  connectCalendly,
  disconnectCalendly,
  updateCalendlySettings,
  getCalendlyEventTypes,
  setupCalendlyWebhook,
} from "@/lib/actions/calendly";
import { toast } from "sonner";

interface CalendlySettingsClientProps {
  initialConfig: CalendlyConfig | null;
}

interface ServiceMapping {
  id: string;
  calendlyEventType: string;
  photoProOSService: string;
}

// Mock data for event type mappings (to be replaced with actual API data)
const MOCK_SERVICES = [
  { value: "headshots", label: "Headshots" },
  { value: "commercial", label: "Commercial Photography" },
  { value: "events", label: "Event Coverage" },
  { value: "product", label: "Product Photography" },
  { value: "architecture", label: "Architecture & Interiors" },
];

export function CalendlySettingsClient({
  initialConfig,
}: CalendlySettingsClientProps) {
  const [config, setConfig] = React.useState<CalendlyConfig | null>(initialConfig);
  const [apiToken, setApiToken] = React.useState("");
  const [showToken, setShowToken] = React.useState(false);
  const [autoCreateBookings, setAutoCreateBookings] = React.useState(
    config?.autoCreateBookings ?? true
  );
  const [notifyOnNewBookings, setNotifyOnNewBookings] = React.useState(
    config?.notifyOnNewBookings ?? true
  );
  const [serviceMappings, setServiceMappings] = React.useState<ServiceMapping[]>([]);
  const [calendlyEventTypes, setCalendlyEventTypes] = React.useState<CalendlyEventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Load event types when connected
  React.useEffect(() => {
    async function loadEventTypes() {
      if (!config?.isActive) return;

      setEventTypesLoading(true);
      const result = await getCalendlyEventTypes();
      if (result.success && result.data) {
        setCalendlyEventTypes(result.data);
      }
      setEventTypesLoading(false);
    }
    loadEventTypes();
  }, [config?.isActive]);

  // Initialize service mappings from config
  React.useEffect(() => {
    if (config?.eventMappings) {
      const mappings = Object.entries(config.eventMappings).map(([eventType, service], i) => ({
        id: `mapping-${i}`,
        calendlyEventType: eventType,
        photoProOSService: service,
      }));
      setServiceMappings(mappings);
    }
  }, [config?.eventMappings]);

  const handleSaveToken = async () => {
    if (!apiToken.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your Calendly API token",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await connectCalendly(apiToken);

      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Failed to connect" });
        return;
      }

      toast.success(`Connected to Calendly as ${result.data?.userName}`);
      setMessage({
        type: "success",
        text: `Connected to Calendly as ${result.data?.userName}. Setting up webhook...`,
      });

      // Setup webhook for real-time sync
      const webhookResult = await setupCalendlyWebhook();
      if (webhookResult.success) {
        toast.success("Webhook configured for real-time booking sync");
      }

      // Reload the page to get fresh config
      window.location.reload();
    } catch {
      setMessage({ type: "error", text: "Failed to save API token" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Convert service mappings to event mappings object
      const eventMappings: Record<string, string> = {};
      for (const mapping of serviceMappings) {
        if (mapping.calendlyEventType && mapping.photoProOSService) {
          eventMappings[mapping.calendlyEventType] = mapping.photoProOSService;
        }
      }

      const result = await updateCalendlySettings({
        autoCreateBookings,
        notifyOnNewBookings,
        eventMappings,
      });

      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Failed to save settings" });
        return;
      }

      toast.success("Settings saved successfully");
      setMessage({
        type: "success",
        text: "Settings saved successfully",
      });
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Calendly? Your saved settings will be removed."
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await disconnectCalendly();

      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Failed to disconnect" });
        return;
      }

      setConfig(null);
      setApiToken("");
      setCalendlyEventTypes([]);
      setServiceMappings([]);
      toast.success("Calendly disconnected");
      setMessage({ type: "success", text: "Calendly disconnected successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to disconnect" });
    } finally {
      setLoading(false);
    }
  };

  const addServiceMapping = () => {
    setServiceMappings((prev) => [
      ...prev,
      {
        id: `mapping-${Date.now()}`,
        calendlyEventType: "",
        photoProOSService: "",
      },
    ]);
  };

  const removeServiceMapping = (id: string) => {
    setServiceMappings((prev) => prev.filter((m) => m.id !== id));
  };

  const updateServiceMapping = (
    id: string,
    field: "calendlyEventType" | "photoProOSService",
    value: string
  ) => {
    setServiceMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {message && (
        <div
          role="alert"
          aria-live="polite"
          className={cn(
            "rounded-lg border px-4 py-3",
            message.type === "success"
              ? "border-[var(--success)]/30 bg-[var(--success)]/10"
              : message.type === "error"
              ? "border-[var(--error)]/30 bg-[var(--error)]/10"
              : "border-[var(--primary)]/30 bg-[var(--primary)]/10"
          )}
        >
          <p
            className={cn(
              "text-sm",
              message.type === "success"
                ? "text-[var(--success)]"
                : message.type === "error"
                ? "text-[var(--error)]"
                : "text-[var(--primary)]"
            )}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Connection Status Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#006BFF]/10">
            <CalendlyIcon className="h-8 w-8 text-[#006BFF]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Calendly Connection
            </h2>
            <p className="text-sm text-foreground-muted">
              {config
                ? `Connected as ${config.userName || config.userEmail || "Unknown"}`
                : "Connect Calendly to import bookings automatically"}
            </p>
            {config?.lastSyncAt && (
              <p className="text-xs text-foreground-muted mt-1">
                Last sync: {new Date(config.lastSyncAt).toLocaleString()}
              </p>
            )}
          </div>
          {config && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1",
                config.isActive
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
              )}
              role="status"
              aria-label={`Calendly connection is ${config.isActive ? "active" : "paused"}`}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  config.isActive ? "bg-[var(--success)]" : "bg-foreground-muted"
                )}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">
                {config.isActive ? "Active" : "Paused"}
              </span>
            </div>
          )}
        </div>

        {/* API Token Input */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Personal Access Token"
                type={showToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Calendly API token"
                leftIcon={<KeyIcon className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-sm text-foreground-muted hover:text-foreground"
                    aria-label={showToken ? "Hide API token" : "Show API token"}
                  >
                    {showToken ? "Hide" : "Show"}
                  </button>
                }
                helperText={
                  <>
                    Get your token from{" "}
                    <a
                      href="https://calendly.com/integrations/api_webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                    >
                      Calendly API Settings
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  </>
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={handleSaveToken}
              disabled={loading || !apiToken}
            >
              {loading ? "Saving..." : "Save API Token"}
            </Button>
            {config && (
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={loading}
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Event Type Mapping */}
      {config?.isActive && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Event Type Mapping
          </h2>
          <p className="text-sm text-foreground-muted mb-6">
            Map your Calendly event types to PhotoProOS services. When a booking is made on Calendly, it will automatically be assigned the correct service.
          </p>

          {eventTypesLoading ? (
            <div className="rounded-lg bg-[var(--background)] p-4 text-center">
              <p className="text-sm text-foreground-muted">
                Loading event types from Calendly...
              </p>
            </div>
          ) : calendlyEventTypes.length === 0 ? (
            <div className="rounded-lg bg-[var(--background)] p-4 text-center">
              <p className="text-sm text-foreground-muted">
                No active event types found in your Calendly account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceMappings.length === 0 ? (
                <div className="rounded-lg bg-[var(--background)] p-4 text-center">
                  <p className="text-sm text-foreground-muted">
                    No event type mappings configured yet. Click &quot;Add Mapping&quot; to get started.
                  </p>
                </div>
              ) : (
                serviceMappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      <Select
                        label="Calendly Event Type"
                        value={mapping.calendlyEventType}
                        onChange={(e) =>
                          updateServiceMapping(
                            mapping.id,
                            "calendlyEventType",
                            e.target.value
                          )
                        }
                        options={[
                          { value: "", label: "Select an event type..." },
                          ...calendlyEventTypes.map((et) => ({
                            value: et.uri,
                            label: `${et.name} (${et.duration} min)`,
                          })),
                        ]}
                      />
                    </div>
                    <div className="flex items-center justify-center text-foreground-muted sm:px-2 sm:mt-6">
                      <svg
                        className="h-4 w-4 rotate-90 sm:rotate-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <Select
                        label="PhotoProOS Service"
                        value={mapping.photoProOSService}
                        onChange={(e) =>
                          updateServiceMapping(
                            mapping.id,
                            "photoProOSService",
                            e.target.value
                          )
                        }
                        options={[
                          { value: "", label: "Select a service..." },
                          ...MOCK_SERVICES,
                        ]}
                      />
                    </div>
                    <button
                      onClick={() => removeServiceMapping(mapping.id)}
                      className="self-end rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-[var(--error)] sm:self-center sm:mt-6"
                      aria-label="Remove mapping"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}

              <Button variant="secondary" onClick={addServiceMapping}>
                Add Mapping
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Sync Settings */}
      {config?.isActive && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Sync Settings
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Auto-Create Bookings
                </p>
                <p className="text-xs text-foreground-muted">
                  Automatically create PhotoProOS bookings when Calendly events are scheduled
                </p>
              </div>
              <Switch
                checked={autoCreateBookings}
                onCheckedChange={setAutoCreateBookings}
              />
            </div>

            <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Notify on New Bookings
                </p>
                <p className="text-xs text-foreground-muted">
                  Receive notifications when new Calendly bookings are imported
                </p>
              </div>
              <Switch
                checked={notifyOnNewBookings}
                onCheckedChange={setNotifyOnNewBookings}
              />
            </div>

            <Button
              variant="primary"
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      )}

      {/* What Gets Imported */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          What Gets Imported
        </h2>
        <ul className="space-y-3 text-sm text-foreground-muted">
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Event Details:</strong> Event name, date, time, and duration
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Client Info:</strong> Invitee name, email, and contact details
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Notes:</strong> Any questions or notes from the booking form
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Cancellations:</strong> Booking status updates when events are cancelled
            </span>
          </li>
        </ul>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          How to Get Your API Token
        </h2>
        <ol className="space-y-3 text-sm text-foreground-muted list-decimal list-inside">
          <li>
            Go to{" "}
            <a
              href="https://calendly.com/integrations/api_webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              Calendly API &amp; Webhooks settings
            </a>
          </li>
          <li>Click &quot;Generate New Token&quot; under Personal Access Tokens</li>
          <li>Give your token a name (e.g., &quot;PhotoProOS Integration&quot;)</li>
          <li>Copy the generated token - you won&apos;t be able to see it again</li>
          <li>Paste the token in the field above and click &quot;Save API Token&quot;</li>
        </ol>
        <div className="mt-4 rounded-lg bg-[var(--background)] p-4">
          <p className="text-sm text-foreground-muted">
            <strong className="text-foreground">Security Note:</strong> Your API token is stored securely and encrypted. Never share your token with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
