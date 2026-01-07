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
} from "@/components/ui/settings-icons";
import {
  type MailchimpConfig,
  type MailchimpAudience,
  type MailchimpSyncHistoryItem,
  connectMailchimp,
  disconnectMailchimp,
  updateMailchimpSettings,
  getMailchimpAudiences,
  getMailchimpSyncHistory,
  syncClientsToMailchimp,
} from "@/lib/actions/mailchimp";
import { toast } from "sonner";

// Client type tags for mapping
const CLIENT_TYPE_TAGS = [
  { id: "real_estate", label: "Real Estate", mailchimpTag: "real-estate-clients" },
  { id: "commercial", label: "Commercial", mailchimpTag: "commercial-clients" },
  { id: "portrait", label: "Portrait", mailchimpTag: "portrait-clients" },
  { id: "events", label: "Events", mailchimpTag: "event-clients" },
  { id: "architecture", label: "Architecture", mailchimpTag: "architecture-clients" },
];

interface MailchimpSettingsClientProps {
  initialConfig: MailchimpConfig | null;
}

export function MailchimpSettingsClient({ initialConfig }: MailchimpSettingsClientProps) {
  // Connection state
  const [config, setConfig] = React.useState<MailchimpConfig | null>(initialConfig);
  const [apiKey, setApiKey] = React.useState("");
  const [selectedAudience, setSelectedAudience] = React.useState(config?.audienceId || "");
  const [audiences, setAudiences] = React.useState<MailchimpAudience[]>([]);
  const [syncHistory, setSyncHistory] = React.useState<MailchimpSyncHistoryItem[]>([]);

  // Sync settings
  const [autoSyncNewClients, setAutoSyncNewClients] = React.useState(
    config?.autoSyncNewClients ?? true
  );
  const [tagMappings, setTagMappings] = React.useState<Record<string, boolean>>(
    CLIENT_TYPE_TAGS.reduce((acc, tag) => ({ ...acc, [tag.id]: true }), {})
  );

  // Marketing preferences
  const [defaultOptIn, setDefaultOptIn] = React.useState(config?.defaultOptIn ?? true);
  const [welcomeEmailTrigger, setWelcomeEmailTrigger] = React.useState(
    config?.welcomeEmailTrigger ?? false
  );

  // UI state
  const [loading, setLoading] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [audiencesLoading, setAudiencesLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Load audiences and sync history when connected
  React.useEffect(() => {
    async function loadData() {
      if (!config?.isActive) return;

      // Load audiences
      setAudiencesLoading(true);
      const audiencesResult = await getMailchimpAudiences();
      if (audiencesResult.success && audiencesResult.data) {
        setAudiences(audiencesResult.data);
      }
      setAudiencesLoading(false);

      // Load sync history
      const historyResult = await getMailchimpSyncHistory();
      if (historyResult.success && historyResult.data) {
        setSyncHistory(historyResult.data);
      }
    }
    loadData();
  }, [config?.isActive]);

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

    try {
      const result = await connectMailchimp(apiKey);

      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Failed to connect" });
        return;
      }

      toast.success("Connected to Mailchimp!");
      setMessage({
        type: "success",
        text: "Connected to Mailchimp successfully!",
      });

      // Reload the page to get fresh config
      window.location.reload();
    } catch {
      setMessage({ type: "error", text: "Failed to connect to Mailchimp" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Mailchimp? Your settings will be removed.")) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await disconnectMailchimp();

      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Failed to disconnect" });
        return;
      }

      setConfig(null);
      setApiKey("");
      setAudiences([]);
      setSyncHistory([]);
      toast.success("Mailchimp disconnected");
      setMessage({ type: "success", text: "Mailchimp disconnected successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to disconnect" });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncExistingClients = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const result = await syncClientsToMailchimp();

      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Failed to sync" });
        return;
      }

      const { synced, errors } = result.data || { synced: 0, errors: 0 };
      toast.success(`Synced ${synced} contacts to Mailchimp`);
      setMessage({
        type: errors > 0 ? "info" : "success",
        text: `Synced ${synced} contacts${errors > 0 ? `, ${errors} failed` : ""}`,
      });

      // Reload sync history
      const historyResult = await getMailchimpSyncHistory();
      if (historyResult.success && historyResult.data) {
        setSyncHistory(historyResult.data);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to sync contacts" });
    } finally {
      setSyncing(false);
    }
  };

  const handleTagMappingToggle = (tagId: string, enabled: boolean) => {
    setTagMappings((prev) => ({ ...prev, [tagId]: enabled }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Build tag mappings
      const tagMappingsData: Record<string, string> = {};
      for (const tag of CLIENT_TYPE_TAGS) {
        if (tagMappings[tag.id]) {
          tagMappingsData[tag.id] = tag.mailchimpTag;
        }
      }

      // Find the selected audience name
      const selectedAudienceData = audiences.find((a) => a.id === selectedAudience);

      const result = await updateMailchimpSettings({
        audienceId: selectedAudience || undefined,
        audienceName: selectedAudienceData?.name,
        autoSyncNewClients,
        defaultOptIn,
        welcomeEmailTrigger,
        tagMappings: tagMappingsData,
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

  return (
    <div className="space-y-6">
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
              {config?.isActive
                ? `Connected (${config.datacenter})`
                : "Connect Mailchimp to sync your clients for email marketing"}
            </p>
            {config?.lastSyncAt && (
              <p className="text-xs text-foreground-muted mt-1">
                Last sync: {new Date(config.lastSyncAt).toLocaleString()} · {config.syncedContacts} contacts synced
              </p>
            )}
          </div>
          {config?.isActive && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1",
                "bg-[var(--success)]/10 text-[var(--success)]"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}
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
                  placeholder={config?.isActive ? "Enter new API key to reconnect" : "Enter your Mailchimp API key"}
                  leftIcon={<KeyIcon className="h-4 w-4" />}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleSaveApiKey}
                disabled={loading || !apiKey.trim()}
              >
                {loading ? "Saving..." : config?.isActive ? "Update Key" : "Connect"}
              </Button>
              {config?.isActive && (
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={loading}
                >
                  Disconnect
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-foreground-muted">
              Your API key is stored securely and used to connect to Mailchimp.
            </p>
          </div>
        </div>
      </div>

      {/* Audience Selection */}
      {config?.isActive && (
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
            {audiencesLoading ? (
              <p className="text-sm text-foreground-muted">Loading audiences...</p>
            ) : (
              <Select
                label="Target Audience"
                options={[
                  { value: "", label: "Select an audience..." },
                  ...audiences.map((a) => ({
                    value: a.id,
                    label: `${a.name} (${a.memberCount.toLocaleString()} contacts)`,
                  })),
                ]}
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                helperText={
                  audiences.length === 0
                    ? "No audiences found in your Mailchimp account"
                    : undefined
                }
              />
            )}
          </div>
        </div>
      )}

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
              disabled={syncing || !config?.isActive || !selectedAudience}
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
      {config?.isActive && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Sync History
          </h2>
          <p className="text-sm text-foreground-muted mb-6">
            Recent sync activity between PhotoProOS and Mailchimp.
          </p>

          {syncHistory.length > 0 ? (
            <div className="space-y-3">
              {syncHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-[var(--background)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckIcon
                      className={cn(
                        "h-4 w-4",
                        item.status === "success"
                          ? "text-[var(--success)]"
                          : item.status === "partial"
                            ? "text-[var(--warning)]"
                            : "text-[var(--error)]"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.description}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {item.contactCount > 0 && ` · ${item.contactCount} contacts`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      item.status === "success"
                        ? "text-[var(--success)] bg-[var(--success)]/10"
                        : item.status === "partial"
                          ? "text-[var(--warning)] bg-[var(--warning)]/10"
                          : "text-[var(--error)] bg-[var(--error)]/10"
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-[var(--background)] p-8 text-center">
              <InfoIcon className="h-8 w-8 text-foreground-muted mx-auto mb-3" />
              <p className="text-sm text-foreground-muted">
                No sync history yet. Use &quot;Sync Now&quot; to sync your clients.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      {config?.isActive && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      )}

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
