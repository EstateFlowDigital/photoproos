"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { GoogleCalendarConfig } from "@/lib/actions/google-calendar";
import {
  updateGoogleCalendarSettings,
  testGoogleCalendarConnection,
  disconnectGoogleCalendar,
  syncGoogleCalendar,
} from "@/lib/actions/google-calendar";
import type { SyncDirection } from "@prisma/client";

interface CalendarSettingsClientProps {
  initialConfig: GoogleCalendarConfig | null;
}

export function CalendarSettingsClient({
  initialConfig,
}: CalendarSettingsClientProps) {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<GoogleCalendarConfig | null>(initialConfig);
  const [syncDirection, setSyncDirection] = useState<SyncDirection>(
    config?.syncDirection || "both"
  );
  const [syncEnabled, setSyncEnabled] = useState(config?.syncEnabled ?? true);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams?.get("success");
    const error = searchParams?.get("error");

    if (success === "connected") {
      setMessage({
        type: "success",
        text: "Successfully connected to Google Calendar!",
      });
      // Refresh page after connection
      window.location.reload();
    } else if (error) {
      const errorMessages: Record<string, string> = {
        not_configured: "Google Calendar is not configured. Please contact support.",
        auth_failed: "Failed to start authorization. Please try again.",
        missing_params: "Missing required parameters from Google.",
        invalid_state: "Invalid state parameter. Please try again.",
        org_mismatch: "Organization mismatch. Please try again.",
        missing_verifier: "Session expired. Please try again.",
        token_exchange_failed: "Failed to complete authorization. Please try again.",
        calendar_fetch_failed: "Failed to get calendar info. Please try again.",
        no_calendars: "No calendars found in your Google account.",
        callback_failed: "Authorization callback failed. Please try again.",
        access_denied: "You denied access to Google Calendar.",
      };
      setMessage({
        type: "error",
        text: errorMessages[error] || `Error: ${error}`,
      });
    }
  }, [searchParams]);

  const handleConnect = () => {
    // Redirect to OAuth authorization endpoint
    window.location.href = "/api/integrations/google/authorize";
  };

  const handleTest = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await testGoogleCalendarConnection();
      if (result.success) {
        setMessage({
          type: "success",
          text: `Connected as ${result.data.name} (${result.data.email})`,
        });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Connection test failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!config) return;

    setSyncing(true);
    setMessage(null);

    try {
      const result = await syncGoogleCalendar(config.id);
      if (result.success) {
        const { imported, exported, errors } = result.data;
        let text = "";
        if (imported > 0) text += `Imported ${imported} events. `;
        if (exported > 0) text += `Exported ${exported} bookings. `;
        if (errors.length > 0) text += `${errors.length} errors.`;
        if (!text) text = "Calendar is up to date.";

        setMessage({
          type: errors.length > 0 ? "error" : "success",
          text: text.trim(),
        });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!config) return;

    setLoading(true);
    try {
      const result = await updateGoogleCalendarSettings({
        integrationId: config.id,
        syncEnabled,
        syncDirection,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Settings updated" });
        setConfig({ ...config, syncEnabled, syncDirection });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Google Calendar? This will remove all synced events from PhotoProOS."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await disconnectGoogleCalendar();
      if (result.success) {
        setConfig(null);
        setMessage({ type: "success", text: "Google Calendar disconnected" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to disconnect" });
    } finally {
      setLoading(false);
    }
  };

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

      {/* Connection Status */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#4285F4]/10">
            <GoogleCalendarIcon className="h-8 w-8 text-[#4285F4]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Google Calendar Connection
            </h2>
            <p className="text-sm text-foreground-muted">
              {config
                ? `Connected: ${config.name}`
                : "Connect your Google Calendar to sync bookings"}
            </p>
          </div>
          {config && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1",
                config.syncEnabled
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  config.syncEnabled ? "bg-[var(--success)]" : "bg-foreground-muted"
                )}
              />
              <span className="text-sm font-medium">
                {config.syncEnabled ? "Syncing" : "Paused"}
              </span>
            </div>
          )}
        </div>

        {config ? (
          // Connected state
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-[var(--background)] p-4">
                <p className="text-xs font-medium text-foreground-muted mb-1">
                  Calendar
                </p>
                <p className="text-sm text-foreground">{config.name}</p>
              </div>
              <div className="rounded-lg bg-[var(--background)] p-4">
                <p className="text-xs font-medium text-foreground-muted mb-1">
                  Last Sync
                </p>
                <p className="text-sm text-foreground">
                  {config.lastSyncAt
                    ? new Date(config.lastSyncAt).toLocaleString()
                    : "Never"}
                </p>
                {config.lastSyncError && (
                  <p className="text-xs text-[var(--error)] mt-1">
                    {config.lastSyncError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={handleSync}
                disabled={syncing || loading}
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleTest}
                disabled={loading}
              >
                {loading ? "Testing..." : "Test Connection"}
              </Button>
              <Button variant="secondary" onClick={handleConnect}>
                Reconnect
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={loading}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          // Not connected state
          <div className="space-y-4">
            <p className="text-sm text-foreground-muted">
              Connect your Google Calendar to automatically sync your bookings.
              You&apos;ll be redirected to Google to authorize access.
            </p>

            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-3 rounded-lg bg-[#4285F4] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4285F4]/90"
            >
              <GoogleCalendarIcon className="h-5 w-5" />
              Connect with Google
            </button>
          </div>
        )}
      </div>

      {/* Sync Settings */}
      {config && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Sync Settings
          </h2>

          <div className="space-y-4">
            {/* Sync Direction */}
            <Select
              label="Sync Direction"
              value={syncDirection}
              onChange={(e) => setSyncDirection(e.target.value as SyncDirection)}
              options={[
                { value: "both", label: "Two-way sync (import and export)" },
                { value: "import_only", label: "Import only (Google to PhotoProOS)" },
                { value: "export_only", label: "Export only (PhotoProOS to Google)" },
              ]}
              helperText="Choose how events are synced between Google Calendar and PhotoProOS"
            />

            {/* Sync Toggle */}
            <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Auto Sync</p>
                <p className="text-xs text-foreground-muted">
                  Automatically sync when bookings change
                </p>
              </div>
              <button
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                  syncEnabled ? "bg-[var(--primary)]" : "bg-[var(--background-secondary)]"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                    syncEnabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            <Button
              variant="primary"
              onClick={handleUpdateSettings}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      )}

      {/* What Gets Synced */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          What Gets Synced
        </h2>
        <ul className="space-y-3 text-sm text-foreground-muted">
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Import:</strong> Events from Google Calendar appear in your PhotoProOS scheduling view
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Export:</strong> Confirmed bookings are added to your Google Calendar
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Updates:</strong> Changes to bookings are synced automatically
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Availability:</strong> Google Calendar events block time in your availability
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
