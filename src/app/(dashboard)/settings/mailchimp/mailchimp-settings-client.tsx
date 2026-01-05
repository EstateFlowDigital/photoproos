"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  MailchimpIcon,
  CheckIcon,
  InfoIcon,
  RefreshIcon,
  KeyIcon,
  UsersIcon,
  MailIcon,
  SparklesIcon,
} from "@/components/ui/settings-icons";

// Mock data for audiences - in a real implementation, this would come from the Mailchimp API
const MOCK_AUDIENCES = [
  { value: "", label: "Select an audience..." },
  { value: "audience_1", label: "All Clients" },
  { value: "audience_2", label: "Photography Leads" },
  { value: "audience_3", label: "Past Customers" },
];

// Client type tags for mapping
const CLIENT_TYPE_TAGS = [
  { id: "real_estate", label: "Real Estate", mailchimpTag: "real-estate-clients" },
  { id: "commercial", label: "Commercial", mailchimpTag: "commercial-clients" },
  { id: "portrait", label: "Portrait", mailchimpTag: "portrait-clients" },
  { id: "events", label: "Events", mailchimpTag: "event-clients" },
  { id: "architecture", label: "Architecture", mailchimpTag: "architecture-clients" },
];

// Mock sync history data
const MOCK_SYNC_HISTORY = [
  {
    id: "1",
    date: "2024-01-04T10:30:00Z",
    action: "Synced 12 new contacts",
    status: "success",
  },
  {
    id: "2",
    date: "2024-01-03T14:15:00Z",
    action: "Updated 5 contact tags",
    status: "success",
  },
  {
    id: "3",
    date: "2024-01-02T09:00:00Z",
    action: "Initial sync: 48 contacts",
    status: "success",
  },
];

export function MailchimpSettingsClient() {
  // Connection state
  const [apiKey, setApiKey] = React.useState("");
  const [isConnected] = React.useState(false);
  const [selectedAudience, setSelectedAudience] = React.useState("");

  // Sync settings
  const [autoSyncNewClients, setAutoSyncNewClients] = React.useState(true);
  const [tagMappings, setTagMappings] = React.useState<Record<string, boolean>>(
    CLIENT_TYPE_TAGS.reduce((acc, tag) => ({ ...acc, [tag.id]: true }), {})
  );

  // Marketing preferences
  const [defaultOptIn, setDefaultOptIn] = React.useState(true);
  const [welcomeEmailTrigger, setWelcomeEmailTrigger] = React.useState(false);

  // UI state
  const [loading, setLoading] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your Mailchimp API key",
      });
      return;
    }

    // Basic validation for Mailchimp API key format (ends with -dc suffix)
    if (!apiKey.includes("-")) {
      setMessage({
        type: "error",
        text: "Invalid API key format. Mailchimp API keys should end with a datacenter suffix (e.g., -us21)",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Since this is coming soon, just show a success message
    setMessage({
      type: "info",
      text: "API key saved. Full Mailchimp integration is coming soon!",
    });
    setLoading(false);
  };

  const handleSyncExistingClients = async () => {
    setSyncing(true);
    setMessage(null);

    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setMessage({
      type: "info",
      text: "Sync functionality is coming soon. Your settings have been saved.",
    });
    setSyncing(false);
  };

  const handleTagMappingToggle = (tagId: string, enabled: boolean) => {
    setTagMappings((prev) => ({ ...prev, [tagId]: enabled }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage(null);

    // Simulate saving settings
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessage({
      type: "success",
      text: "Settings saved successfully. They will be applied when the integration launches.",
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
        <div className="flex items-start gap-3">
          <SparklesIcon className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Coming Soon
            </p>
            <p className="text-sm text-foreground-muted mt-1">
              The Mailchimp integration is currently in development. You can configure your settings
              now, and they will be ready when the full integration launches. Save your API key to
              be notified when it&apos;s available.
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
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#FFE01B]/10">
            <MailchimpIcon className="h-8 w-8 text-[#FFE01B]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Mailchimp Connection
            </h2>
            <p className="text-sm text-foreground-muted">
              {isConnected
                ? "Connected to your Mailchimp account"
                : "Connect Mailchimp to sync your clients for email marketing"}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1",
              "bg-[var(--foreground-muted)]/10 text-foreground-muted"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-foreground-muted" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              API Key
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Mailchimp API key"
                  leftIcon={<KeyIcon className="h-4 w-4" />}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleSaveApiKey}
                disabled={loading || !apiKey.trim()}
              >
                {loading ? "Saving..." : "Save Key"}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-foreground-muted">
              Your API key is stored securely and used to connect to Mailchimp.
            </p>
          </div>
        </div>
      </div>

      {/* Audience Selection */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <UsersIcon className="h-5 w-5 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground">
            Audience Settings
          </h2>
        </div>
        <p className="text-sm text-foreground-muted mb-6">
          Select which Mailchimp audience to sync your contacts with.
        </p>

        <div className="space-y-4">
          <Select
            label="Target Audience"
            options={MOCK_AUDIENCES}
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            disabled={!isConnected}
            helperText={
              !isConnected
                ? "Connect your Mailchimp account to select an audience"
                : undefined
            }
          />
        </div>
      </div>

      {/* Contact Sync Settings */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <RefreshIcon className="h-5 w-5 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground">
            Contact Sync Settings
          </h2>
        </div>
        <p className="text-sm text-foreground-muted mb-6">
          Configure how contacts are synced between PhotoProOS and Mailchimp.
        </p>

        <div className="space-y-6">
          {/* Auto-sync toggle */}
          <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Auto-sync new clients
              </p>
              <p className="text-xs text-foreground-muted">
                Automatically add new clients to Mailchimp when they&apos;re created
              </p>
            </div>
            <Switch
              checked={autoSyncNewClients}
              onCheckedChange={setAutoSyncNewClients}
            />
          </div>

          {/* Sync existing clients button */}
          <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Sync existing clients
              </p>
              <p className="text-xs text-foreground-muted">
                Manually sync all your existing clients to Mailchimp
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleSyncExistingClients}
              disabled={syncing || !isConnected}
            >
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tag Mapping */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Tag Mapping
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Map client types to Mailchimp tags for better segmentation.
        </p>

        <div className="space-y-3">
          {CLIENT_TYPE_TAGS.map((tag) => (
            <div
              key={tag.id}
              className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {tag.label} Clients
                </p>
                <p className="text-xs text-foreground-muted">
                  Tag: <code className="px-1 py-0.5 rounded bg-[var(--background-elevated)] text-xs">{tag.mailchimpTag}</code>
                </p>
              </div>
              <Switch
                checked={tagMappings[tag.id]}
                onCheckedChange={(checked) => handleTagMappingToggle(tag.id, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Marketing Preferences */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <MailIcon className="h-5 w-5 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground">
            Marketing Preferences
          </h2>
        </div>
        <p className="text-sm text-foreground-muted mb-6">
          Configure default marketing preferences for synced contacts.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Default opt-in status
              </p>
              <p className="text-xs text-foreground-muted">
                New contacts will be opted in to receive marketing emails
              </p>
            </div>
            <Switch
              checked={defaultOptIn}
              onCheckedChange={setDefaultOptIn}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-lg bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Welcome email trigger
              </p>
              <p className="text-xs text-foreground-muted">
                Trigger a Mailchimp welcome automation when new contacts are added
              </p>
            </div>
            <Switch
              checked={welcomeEmailTrigger}
              onCheckedChange={setWelcomeEmailTrigger}
            />
          </div>
        </div>
      </div>

      {/* Sync History */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Sync History
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          Recent sync activity between PhotoProOS and Mailchimp.
        </p>

        {isConnected && MOCK_SYNC_HISTORY.length > 0 ? (
          <div className="space-y-3">
            {MOCK_SYNC_HISTORY.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-[var(--background)] p-4"
              >
                <div className="flex items-center gap-3">
                  <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.action}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded-full">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-[var(--background)] p-8 text-center">
            <InfoIcon className="h-8 w-8 text-foreground-muted mx-auto mb-3" />
            <p className="text-sm text-foreground-muted">
              No sync history yet. Connect your Mailchimp account to start syncing.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          How to Get Your Mailchimp API Key
        </h2>
        <ol className="space-y-3 text-sm text-foreground-muted list-decimal list-inside">
          <li>
            Log in to your{" "}
            <a
              href="https://admin.mailchimp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              Mailchimp account
            </a>
          </li>
          <li>Click on your profile icon in the bottom left corner</li>
          <li>Select &quot;Account &amp; billing&quot; from the menu</li>
          <li>Navigate to &quot;Extras&quot; &rarr; &quot;API keys&quot;</li>
          <li>Click &quot;Create A Key&quot; to generate a new API key</li>
          <li>Copy the API key (it will look like: xxxxxxxxxxxxxxxx-us21)</li>
          <li>Paste the API key in the field above and click &quot;Save Key&quot;</li>
        </ol>

        <div className="mt-6 rounded-lg bg-[var(--background)] p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="h-5 w-5 text-foreground-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Keep your API key secure
              </p>
              <p className="text-xs text-foreground-muted mt-1">
                Never share your API key publicly. If you believe your key has been compromised,
                you can regenerate it in your Mailchimp account settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What You Can Do Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          What You&apos;ll Be Able to Do
        </h2>
        <ul className="space-y-3 text-sm text-foreground-muted">
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Automatic Contact Sync:</strong> New clients
              are automatically added to your Mailchimp audience
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Smart Segmentation:</strong> Clients are
              tagged based on their service type for targeted campaigns
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Two-Way Sync:</strong> Keep contact
              information consistent across both platforms
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Automation Triggers:</strong> Trigger
              Mailchimp automations based on PhotoProOS events
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
