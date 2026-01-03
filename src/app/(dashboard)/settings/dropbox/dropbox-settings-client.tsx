"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DropboxConfig } from "@/lib/actions/dropbox";
import {
  saveDropboxConfig,
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
  const [config, setConfig] = useState<DropboxConfig | null>(initialConfig);
  const [accessToken, setAccessToken] = useState("");
  const [syncFolder, setSyncFolder] = useState(
    config?.syncFolder || "/PhotoProOS"
  );
  const [autoSync, setAutoSync] = useState(config?.autoSync ?? true);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      setTestResult({ success: false, message: "Please enter an access token" });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const result = await saveDropboxConfig({
        accessToken,
        syncFolder,
        autoSync,
      });

      if (result.success) {
        setConfig(result.data);
        setAccessToken("");
        setTestResult({
          success: true,
          message: `Connected to Dropbox as ${result.data.displayName}`,
        });

        // Create folder structure
        await ensureDropboxRootFolder();
      } else {
        setTestResult({ success: false, message: result.error });
      }
    } catch {
      setTestResult({ success: false, message: "Failed to connect" });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const result = await testDropboxIntegration();
      if (result.success) {
        setTestResult({
          success: true,
          message: `Connected as ${result.data.account.name.display_name} (${result.data.account.email})`,
        });
      } else {
        setTestResult({ success: false, message: result.error });
      }
    } catch {
      setTestResult({ success: false, message: "Connection test failed" });
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
        setTestResult({ success: true, message: "Settings updated" });
        // Update local config
        if (config) {
          setConfig({ ...config, syncFolder, autoSync });
        }
      } else {
        setTestResult({ success: false, message: result.error });
      }
    } catch {
      setTestResult({ success: false, message: "Failed to update settings" });
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
        setTestResult({ success: true, message: "Dropbox disconnected" });
      } else {
        setTestResult({ success: false, message: result.error });
      }
    } catch {
      setTestResult({ success: false, message: "Failed to disconnect" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolders = async () => {
    setLoading(true);
    try {
      const result = await ensureDropboxRootFolder();
      if (result.success) {
        setTestResult({
          success: true,
          message: `Folder structure created at ${result.data.path}`,
        });
      } else {
        setTestResult({ success: false, message: result.error });
      }
    } catch {
      setTestResult({ success: false, message: "Failed to create folders" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {testResult && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3",
            testResult.success
              ? "border-[var(--success)]/30 bg-[var(--success)]/10"
              : "border-[var(--error)]/30 bg-[var(--error)]/10"
          )}
        >
          <p
            className={cn(
              "text-sm",
              testResult.success
                ? "text-[var(--success)]"
                : "text-[var(--error)]"
            )}
          >
            {testResult.message}
          </p>
        </div>
      )}

      {/* Connection Status */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--background-secondary)]">
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

            <div className="flex gap-3">
              <button
                onClick={handleTest}
                disabled={loading}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                {loading ? "Testing..." : "Test Connection"}
              </button>
              <button
                onClick={handleCreateFolders}
                disabled={loading}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Create Folder Structure
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          // Not connected state
          <div className="space-y-4">
            <div>
              <label
                htmlFor="accessToken"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Access Token
              </label>
              <input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="sl.xxxxx..."
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <p className="mt-1.5 text-xs text-foreground-muted">
                Get your access token from the{" "}
                <a
                  href="https://www.dropbox.com/developers/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >
                  Dropbox App Console
                </a>
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={loading || !accessToken.trim()}
              className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Connect Dropbox"}
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
            <div>
              <label
                htmlFor="syncFolder"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Sync Folder
              </label>
              <input
                id="syncFolder"
                type="text"
                value={syncFolder}
                onChange={(e) => setSyncFolder(e.target.value)}
                placeholder="/PhotoProOS"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <p className="mt-1.5 text-xs text-foreground-muted">
                Root folder in Dropbox where all files will be synced
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[var(--background)] p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Auto Sync</p>
                <p className="text-xs text-foreground-muted">
                  Automatically sync files when changes are detected
                </p>
              </div>
              <button
                onClick={() => setAutoSync(!autoSync)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                  autoSync ? "bg-[var(--primary)]" : "bg-[var(--background-secondary)]"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                    autoSync ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            <button
              onClick={handleUpdateSettings}
              disabled={loading}
              className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
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

          <div className="rounded-lg bg-[var(--background)] p-4 font-mono text-sm">
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

      {/* Help Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Setup Instructions
        </h2>
        <ol className="space-y-3 text-sm text-foreground-muted">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
              1
            </span>
            <span>
              Go to the{" "}
              <a
                href="https://www.dropbox.com/developers/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                Dropbox App Console
              </a>{" "}
              and create or select your app
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
              2
            </span>
            <span>
              In the Settings tab, generate an access token with full Dropbox
              access
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
              3
            </span>
            <span>Paste the access token above and click Connect</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
              4
            </span>
            <span>
              Optional: Set up a webhook in the Dropbox App Console with URL:{" "}
              <code className="rounded bg-[var(--background-secondary)] px-1.5 py-0.5">
                https://app.photoproos.com/api/integrations/dropbox/webhook
              </code>
            </span>
          </li>
        </ol>
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
