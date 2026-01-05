"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { DropboxConfig } from "@/lib/actions/dropbox";
import {
  updateDropboxSettings,
  testDropboxIntegration,
  deleteDropboxIntegration,
  ensureDropboxRootFolder,
} from "@/lib/actions/dropbox";

interface DropboxSettingsClientProps {
  initialConfig: DropboxConfig | null;
}

export function DropboxSettingsClient({
  initialConfig,
}: DropboxSettingsClientProps) {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<DropboxConfig | null>(initialConfig);
  const [syncFolder, setSyncFolder] = useState(
    config?.syncFolder || "/PhotoProOS"
  );
  const [autoSync, setAutoSync] = useState(config?.autoSync ?? true);
  const [loading, setLoading] = useState(false);
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
        text: "Successfully connected to Dropbox!",
      });
      // Refresh config after connection
      window.location.reload();
    } else if (error) {
      const errorMessages: Record<string, string> = {
        not_configured: "Dropbox integration is not configured. Please contact support.",
        auth_failed: "Failed to start authorization. Please try again.",
        missing_params: "Missing required parameters from Dropbox.",
        invalid_state: "Invalid state parameter. Please try again.",
        org_mismatch: "Organization mismatch. Please try again.",
        missing_verifier: "Session expired. Please try again.",
        token_exchange_failed: "Failed to complete authorization. Please try again.",
        account_fetch_failed: "Failed to get account info. Please try again.",
        callback_failed: "Authorization callback failed. Please try again.",
        access_denied: "You denied access to Dropbox.",
      };
      setMessage({
        type: "error",
        text: errorMessages[error] || `Error: ${error}`,
      });
    }
  }, [searchParams]);

  const handleConnect = () => {
    // Redirect to OAuth authorization endpoint
    window.location.href = "/api/integrations/dropbox/authorize";
  };

  const handleTest = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await testDropboxIntegration();
      if (result.success) {
        setMessage({
          type: "success",
          text: `Connected as ${result.data.account.name.display_name} (${result.data.account.email})`,
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

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      const result = await updateDropboxSettings({
        syncFolder,
        autoSync,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Settings updated" });
        if (config) {
          setConfig({ ...config, syncFolder, autoSync });
        }
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
        "Are you sure you want to disconnect Dropbox? This will not delete any files in Dropbox."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteDropboxIntegration();
      if (result.success) {
        setConfig(null);
        setMessage({ type: "success", text: "Dropbox disconnected" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to disconnect" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolders = async () => {
    setLoading(true);
    try {
      const result = await ensureDropboxRootFolder();
      if (result.success) {
        setMessage({
          type: "success",
          text: `Folder structure created at ${result.data.path}`,
        });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create folders" });
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#0061FF]/10">
            <DropboxIcon className="h-8 w-8 text-[#0061FF]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Dropbox Connection
            </h2>
            <p className="text-sm text-foreground-muted">
              {config
                ? `Connected as ${config.displayName}`
                : "Connect your Dropbox account to sync files"}
            </p>
          </div>
          {config && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1",
                config.isActive
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  config.isActive ? "bg-[var(--success)]" : "bg-foreground-muted"
                )}
              />
              <span className="text-sm font-medium">
                {config.isActive ? "Active" : "Inactive"}
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
                  Account
                </p>
                <p className="text-sm text-foreground">{config.displayName}</p>
                <p className="text-xs text-foreground-muted">{config.email}</p>
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
                  <p className="text-xs text-[var(--error)]">
                    {config.lastSyncError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={handleTest}
                disabled={loading}
              >
                {loading ? "Testing..." : "Test Connection"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCreateFolders}
                disabled={loading}
              >
                Create Folder Structure
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
              Click the button below to connect your Dropbox account. You&apos;ll be
              redirected to Dropbox to authorize access.
            </p>

            <button
              onClick={handleConnect}
              className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[#0061FF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0061FF]/90 sm:w-auto"
            >
              <DropboxIcon className="h-5 w-5" />
              Connect with Dropbox
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
            <Input
              label="Sync Folder"
              value={syncFolder}
              onChange={(e) => setSyncFolder(e.target.value)}
              placeholder="/PhotoProOS"
              helperText="Root folder in Dropbox where all files will be synced"
            />

            <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Auto Sync</p>
                <p className="text-xs text-foreground-muted">
                  Automatically sync files when changes are detected
                </p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
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

      {/* Folder Structure Info */}
      {config && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Folder Structure
          </h2>
          <p className="text-sm text-foreground-muted mb-4">
            PhotoProOS creates the following folder structure in your Dropbox:
          </p>

          <div className="rounded-lg bg-[var(--background)] p-4 font-mono text-sm overflow-x-auto">
            <div className="text-foreground">{syncFolder}/</div>
            <div className="text-foreground-muted ml-4">Galleries/</div>
            <div className="text-foreground-muted ml-8">
              [Gallery Name]_[ID]/
            </div>
            <div className="text-foreground-muted ml-4">Clients/</div>
            <div className="text-foreground-muted ml-8">
              [Client Name]_[ID]/
            </div>
            <div className="text-foreground-muted ml-4">Exports/</div>
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
            <span>Gallery photos are automatically backed up when uploaded</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>Client deliverables are synced to their folders</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>Export files are saved to the Exports folder</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>Changes in Dropbox sync back to PhotoProOS (with webhooks enabled)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function DropboxIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M6 2l6 3.75L6 9.5 0 5.75 6 2zm12 0l6 3.75-6 3.75-6-3.75L18 2zM0 13.25L6 9.5l6 3.75-6 3.75-6-3.75zm18-3.75l6 3.75-6 3.75-6-3.75 6-3.75zM6 17.5l6-3.75 6 3.75-6 3.75-6-3.75z" />
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
