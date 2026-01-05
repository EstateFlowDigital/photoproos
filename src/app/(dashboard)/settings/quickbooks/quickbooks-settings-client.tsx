"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import {
  QuickBooksIcon,
  CheckIcon,
  InfoIcon,
  RefreshIcon,
} from "@/components/ui/settings-icons";

// Types for QuickBooks configuration (to be implemented when the integration is built)
interface QuickBooksConfig {
  id: string;
  companyId: string;
  companyName: string;
  realmId: string;
  isActive: boolean;
  autoSyncInvoices: boolean;
  syncFrequency: "realtime" | "daily" | "manual";
  defaultIncomeAccount: string;
  taxEnabled: boolean;
  taxRate: string;
  autoCreateCustomers: boolean;
  lastSyncAt: Date | null;
  lastSyncError: string | null;
}

interface SyncHistoryItem {
  id: string;
  type: "invoice" | "payment" | "customer";
  action: "created" | "updated" | "synced";
  description: string;
  timestamp: Date;
  status: "success" | "error";
}

interface QuickBooksSettingsClientProps {
  initialConfig: QuickBooksConfig | null;
}

// Mock income accounts for the select dropdown
const INCOME_ACCOUNTS = [
  { value: "photography-income", label: "Photography Income" },
  { value: "sales-revenue", label: "Sales Revenue" },
  { value: "service-income", label: "Service Income" },
  { value: "consulting-income", label: "Consulting Income" },
];

// Mock sync frequencies
const SYNC_FREQUENCIES = [
  { value: "realtime", label: "Real-time (instant sync)" },
  { value: "daily", label: "Daily (once per day)" },
  { value: "manual", label: "Manual (sync on demand)" },
];

// Mock field mappings for customer sync
const FIELD_MAPPINGS = [
  { photoProField: "Client Name", quickbooksField: "Display Name", synced: true },
  { photoProField: "Email", quickbooksField: "Primary Email", synced: true },
  { photoProField: "Phone", quickbooksField: "Primary Phone", synced: true },
  { photoProField: "Company", quickbooksField: "Company Name", synced: true },
  { photoProField: "Address", quickbooksField: "Billing Address", synced: false },
];

// Mock sync history
const MOCK_SYNC_HISTORY: SyncHistoryItem[] = [];

// Clock icon for sync history empty state
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function QuickBooksSettingsClient({
  initialConfig,
}: QuickBooksSettingsClientProps) {
  const [config, setConfig] = React.useState<QuickBooksConfig | null>(initialConfig);
  const [loading, setLoading] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Form state (for when the integration is available)
  const [autoSyncInvoices, setAutoSyncInvoices] = React.useState(
    config?.autoSyncInvoices ?? true
  );
  const [syncFrequency, setSyncFrequency] = React.useState<string>(
    config?.syncFrequency ?? "realtime"
  );
  const [defaultIncomeAccount, setDefaultIncomeAccount] = React.useState(
    config?.defaultIncomeAccount ?? "photography-income"
  );
  const [taxEnabled, setTaxEnabled] = React.useState(config?.taxEnabled ?? false);
  const [autoCreateCustomers, setAutoCreateCustomers] = React.useState(
    config?.autoCreateCustomers ?? true
  );

  // Suppress unused variable warnings for now (these will be used when integration is built)
  void setConfig;

  const handleConnect = () => {
    // This will trigger OAuth flow when implemented
    setMessage({
      type: "info",
      text: "QuickBooks integration is coming soon! OAuth connection will be available in a future update.",
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);

    // Simulate sync action
    setTimeout(() => {
      setMessage({
        type: "info",
        text: "Manual sync will be available once the integration is connected.",
      });
      setSyncing(false);
    }, 1000);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage(null);

    // Simulate saving settings
    setTimeout(() => {
      setMessage({
        type: "info",
        text: "Settings will be saved once the integration is connected.",
      });
      setLoading(false);
    }, 500);
  };

  const handleDisconnect = async () => {
    // Will disconnect when implemented
    setMessage({
      type: "info",
      text: "Disconnect will be available once the integration is connected.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="h-5 w-5 text-[var(--warning)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--warning)]">
              Coming Soon
            </p>
            <p className="text-sm text-foreground-muted mt-1">
              QuickBooks integration is currently under development. OAuth
              connection and full sync functionality will be available in a future
              update. You can preview the settings below.
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {message && (
        <div
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
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#2CA01C]/10">
            <QuickBooksIcon className="h-8 w-8 text-[#2CA01C]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              QuickBooks Connection
            </h2>
            <p className="text-sm text-foreground-muted">
              {config
                ? `Connected to ${config.companyName}`
                : "Connect QuickBooks to sync invoices and payments"}
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
                {config.isActive ? "Active" : "Paused"}
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
                  Company Name
                </p>
                <p className="text-sm text-foreground">{config.companyName}</p>
              </div>
              <div className="rounded-lg bg-[var(--background)] p-4">
                <p className="text-xs font-medium text-foreground-muted mb-1">
                  Realm ID
                </p>
                <p className="text-sm text-foreground font-mono">{config.realmId}</p>
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
              <div className="rounded-lg bg-[var(--background)] p-4">
                <p className="text-xs font-medium text-foreground-muted mb-1">
                  Status
                </p>
                <p className="text-sm text-foreground">
                  {config.isActive ? "Syncing active" : "Syncing paused"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={handleSync}
                disabled={syncing || loading}
              >
                <RefreshIcon className="h-4 w-4" />
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleConnect}
                disabled={loading}
              >
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
              Connect your QuickBooks Online account to automatically sync
              invoices, payments, and customer records. You&apos;ll be redirected to
              Intuit to authorize access.
            </p>

            <button
              onClick={handleConnect}
              disabled
              className="inline-flex items-center gap-3 rounded-lg bg-[#2CA01C] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2CA01C]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QuickBooksIcon className="h-5 w-5" />
              Connect with QuickBooks
            </button>
            <p className="text-xs text-foreground-muted">
              OAuth connection coming soon
            </p>
          </div>
        )}
      </div>

      {/* Invoice Sync Settings */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Invoice Sync Settings
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Configure how invoices are synced to QuickBooks.
        </p>

        <div className="space-y-6">
          {/* Auto-sync toggle */}
          <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Auto-Sync Invoices
              </p>
              <p className="text-xs text-foreground-muted">
                Automatically create invoices in QuickBooks when created in
                PhotoProOS
              </p>
            </div>
            <Switch
              checked={autoSyncInvoices}
              onCheckedChange={setAutoSyncInvoices}
              disabled={!config}
            />
          </div>

          {/* Sync Frequency */}
          <Select
            label="Sync Frequency"
            value={syncFrequency}
            onChange={(e) => setSyncFrequency(e.target.value)}
            options={SYNC_FREQUENCIES}
            helperText="How often invoices and payments should sync to QuickBooks"
            disabled={!config}
          />

          {/* Default Income Account */}
          <Select
            label="Default Income Account"
            value={defaultIncomeAccount}
            onChange={(e) => setDefaultIncomeAccount(e.target.value)}
            options={INCOME_ACCOUNTS}
            helperText="The QuickBooks account where photography income will be recorded"
            disabled={!config}
          />

          {/* Tax Settings */}
          <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Enable Tax Tracking
              </p>
              <p className="text-xs text-foreground-muted">
                Include tax information when syncing invoices
              </p>
            </div>
            <Switch
              checked={taxEnabled}
              onCheckedChange={setTaxEnabled}
              disabled={!config}
            />
          </div>
        </div>
      </div>

      {/* Customer Sync Settings */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Customer Sync Settings
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Configure how clients are synced to QuickBooks as customers.
        </p>

        <div className="space-y-6">
          {/* Auto-create customers toggle */}
          <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Auto-Create Customers
              </p>
              <p className="text-xs text-foreground-muted">
                Automatically create customers in QuickBooks when new clients are
                added
              </p>
            </div>
            <Switch
              checked={autoCreateCustomers}
              onCheckedChange={setAutoCreateCustomers}
              disabled={!config}
            />
          </div>

          {/* Field Mappings */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              Field Mappings
            </p>
            <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--background)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-foreground-muted">
                      PhotoProOS Field
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-foreground-muted">
                      QuickBooks Field
                    </th>
                    <th className="px-4 py-2 text-center font-medium text-foreground-muted">
                      Synced
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {FIELD_MAPPINGS.map((mapping, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-foreground">
                        {mapping.photoProField}
                      </td>
                      <td className="px-4 py-3 text-foreground-muted">
                        {mapping.quickbooksField}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {mapping.synced ? (
                          <CheckIcon className="h-5 w-5 text-[var(--success)] mx-auto" />
                        ) : (
                          <span className="text-foreground-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-foreground-muted mt-2">
              Field mappings will be configurable once the integration is
              connected.
            </p>
          </div>
        </div>
      </div>

      {/* Sync History */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Sync History</h2>
          <Button variant="secondary" size="sm" disabled={!config}>
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {MOCK_SYNC_HISTORY.length > 0 ? (
          <div className="space-y-3">
            {MOCK_SYNC_HISTORY.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-[var(--background)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      item.status === "success"
                        ? "bg-[var(--success)]"
                        : "bg-[var(--error)]"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.description}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {item.type} - {item.action}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-foreground-muted">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-[var(--background)] p-8 text-center">
            <ClockIcon className="h-8 w-8 text-foreground-muted mx-auto mb-3" />
            <p className="text-sm text-foreground-muted">
              No sync history yet. Sync activity will appear here once the
              integration is connected.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          disabled={loading || !config}
        >
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Setup Instructions
        </h2>
        <ol className="space-y-3 text-sm text-foreground-muted list-decimal list-inside">
          <li>
            Ensure you have a{" "}
            <a
              href="https://quickbooks.intuit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              QuickBooks Online
            </a>{" "}
            account (Simple Start, Essentials, or Plus)
          </li>
          <li>
            Click &quot;Connect with QuickBooks&quot; above to start the OAuth
            authorization
          </li>
          <li>Sign in to your Intuit account and authorize PhotoProOS access</li>
          <li>Select your QuickBooks company if you have multiple</li>
          <li>Configure sync settings according to your preferences</li>
          <li>
            Map your PhotoProOS client fields to QuickBooks customer fields
          </li>
          <li>Run an initial sync to import existing data</li>
        </ol>

        <div className="mt-6 rounded-lg bg-[var(--background)] p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            What Gets Synced
          </p>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-3">
              <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Invoices:</strong> Automatically
                create invoices in QuickBooks when invoices are created or paid in
                PhotoProOS
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Payments:</strong> Record
                payments when clients pay their invoices
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Customers:</strong> Create and
                update customer records from your client database
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Tax:</strong> Optionally include
                tax calculations on invoices
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Need Help?
        </h2>
        <p className="text-sm text-foreground-muted mb-4">
          Learn more about the QuickBooks integration and troubleshoot common
          issues.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://developer.intuit.com/app/developer/qbo/docs/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            QuickBooks API Documentation
          </a>
          <a
            href="https://quickbooks.intuit.com/learn-support/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            QuickBooks Support Center
          </a>
        </div>
      </div>
    </div>
  );
}
