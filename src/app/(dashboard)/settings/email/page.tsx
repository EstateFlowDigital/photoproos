"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { ArrowLeftIcon, MailIcon, BellIcon, LoadingSpinner } from "@/components/ui/settings-icons";
import {
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
  type EmailSettings,
} from "@/lib/actions/email-settings";
import {
  getConnectedEmailAccounts,
  disconnectEmailAccount,
  type ConnectedEmailAccount,
} from "@/lib/actions/email-accounts";
import {
  Mail,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

const defaultSettings: EmailSettings = {
  emailSenderName: "",
  emailReplyTo: "",
  emailSignature: "",
  enableQuestionnaireEmails: true,
  enableDigestEmails: true,
  digestEmailFrequency: "daily",
  digestEmailTime: "08:00",
};

export default function EmailSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedEmailAccount[]>([]);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  // Handle success/error messages from OAuth callback
  useEffect(() => {
    if (!searchParams) return;

    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "gmail_connected") {
      showToast("Gmail account connected successfully!", "success");
      router.replace("/settings/email");
    } else if (error) {
      const errorMessages: Record<string, string> = {
        oauth_init_failed: "Failed to initiate Gmail connection",
        missing_params: "Invalid OAuth response",
        invalid_state: "Security check failed",
        user_mismatch: "User verification failed",
        pkce_missing: "Security verification failed",
        token_exchange_failed: "Failed to connect Gmail",
        user_info_failed: "Failed to get account info",
        callback_failed: "Connection failed",
        access_denied: "You cancelled the connection",
      };
      showToast(errorMessages[error] || "Failed to connect Gmail", "error");
      router.replace("/settings/email");
    }
  }, [searchParams, showToast, router]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [settingsResult, accountsResult] = await Promise.all([
          getEmailSettings(),
          getConnectedEmailAccounts(),
        ]);

        if (settingsResult.success && settingsResult.settings) {
          setSettings({
            emailSenderName: settingsResult.settings.emailSenderName || "",
            emailReplyTo: settingsResult.settings.emailReplyTo || "",
            emailSignature: settingsResult.settings.emailSignature || "",
            enableQuestionnaireEmails: settingsResult.settings.enableQuestionnaireEmails,
            enableDigestEmails: settingsResult.settings.enableDigestEmails,
            digestEmailFrequency: settingsResult.settings.digestEmailFrequency as "daily" | "weekly" | "none",
            digestEmailTime: settingsResult.settings.digestEmailTime || "08:00",
          });
        }

        if (accountsResult.success && accountsResult.accounts) {
          setConnectedAccounts(accountsResult.accounts);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        showToast("Failed to load email settings", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const handleDisconnect = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this email account? All synced emails will be removed.")) {
      return;
    }

    setDisconnecting(accountId);
    try {
      const result = await disconnectEmailAccount(accountId);
      if (result.success) {
        setConnectedAccounts((prev) => prev.filter((a) => a.id !== accountId));
        showToast("Email account disconnected", "success");
      } else {
        showToast(result.error || "Failed to disconnect account", "error");
      }
    } catch {
      showToast("Failed to disconnect account", "error");
    } finally {
      setDisconnecting(null);
    }
  };

  const handleChange = (field: keyof EmailSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateEmailSettings(settings);
      if (result.success) {
        showToast("Email settings saved successfully", "success");
        setHasChanges(false);
      } else {
        showToast(result.error || "Failed to save settings", "error");
      }
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      showToast("Please enter an email address", "error");
      return;
    }
    setSendingTest(true);
    try {
      const result = await sendTestEmail(testEmail);
      if (result.success) {
        showToast("Test email sent successfully", "success");
      } else {
        showToast(result.error || "Failed to send test email", "error");
      }
    } catch {
      showToast("Failed to send test email", "error");
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Email Settings"
          subtitle="Configure how emails are sent from your organization"
        />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div data-element="settings-email-page" className="space-y-6">
      <PageHeader
        title="Email Settings"
        subtitle="Configure how emails are sent from your organization"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Connected Email Accounts */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Connected Email Accounts</h2>
              <p className="text-sm text-foreground-muted">Connect your email to sync conversations with the dashboard inbox</p>
            </div>
          </div>

          {/* Connected Accounts List */}
          {connectedAccounts.length > 0 && (
            <div className="space-y-3 mb-6">
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-start justify-between gap-4 flex-wrap gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                >
                  <div className="flex items-center gap-3">
                    {account.provider === "GMAIL" ? (
                      <GoogleIcon className="h-6 w-6" />
                    ) : (
                      <MicrosoftIcon className="h-6 w-6" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{account.email}</p>
                      <div className="flex items-center gap-2 text-xs text-foreground-muted">
                        {account.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-[var(--success)]" />
                            <span>Connected</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-[var(--error)]" />
                            <span>Reconnection required</span>
                          </>
                        )}
                        {account.lastSyncAt && (
                          <>
                            <span>&middot;</span>
                            <Clock className="h-3 w-3" />
                            <span>Last sync: {formatTimeAgo(new Date(account.lastSyncAt))}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!account.isActive && (
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                      >
                        <Link href="/api/integrations/gmail/authorize">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reconnect
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                      disabled={disconnecting === account.id}
                      className="text-foreground-muted hover:text-[var(--error)]"
                    >
                      {disconnecting === account.id ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        <Unlink className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Connect Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/api/integrations/gmail/authorize">
                <GoogleIcon className="h-5 w-5" />
                Connect Gmail
              </Link>
            </Button>
            <Button variant="outline" disabled className="gap-2 opacity-50 cursor-not-allowed">
              <MicrosoftIcon className="h-5 w-5" />
              Connect Outlook
              <span className="text-xs bg-[var(--background-tertiary)] px-1.5 py-0.5 rounded">Coming Soon</span>
            </Button>
          </div>

          <p className="mt-4 text-xs text-foreground-muted">
            Your email credentials are encrypted and securely stored. We only access emails to sync with your inbox.
          </p>
        </div>

        {/* Sender Information */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <MailIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sender Information</h2>
              <p className="text-sm text-foreground-muted">Customize how your emails appear to recipients</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Sender Name"
              type="text"
              value={settings.emailSenderName || ""}
              onChange={(e) => handleChange("emailSenderName", e.target.value)}
              placeholder="Your organization name"
              helperText='This name will appear in the "From" field of emails'
            />

            <Input
              label="Reply-To Email"
              type="email"
              value={settings.emailReplyTo || ""}
              onChange={(e) => handleChange("emailReplyTo", e.target.value)}
              placeholder="your-email@example.com"
              helperText="Replies to your emails will be sent to this address"
            />

            <Textarea
              label="Email Signature"
              value={settings.emailSignature || ""}
              onChange={(e) => handleChange("emailSignature", e.target.value)}
              placeholder="Best regards,&#10;Your Name&#10;Your Company"
              rows={4}
              helperText="This signature will be added to the end of certain emails"
            />
          </div>
        </div>

        {/* Email Notifications */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <BellIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Email Notifications</h2>
              <p className="text-sm text-foreground-muted">Control which automatic emails are sent</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Questionnaire Emails</p>
                <p className="text-xs text-foreground-muted">
                  Send notifications when questionnaires are assigned, reminded, or completed
                </p>
              </div>
              <Switch
                checked={settings.enableQuestionnaireEmails}
                onCheckedChange={(checked) => handleChange("enableQuestionnaireEmails", checked)}
              />
            </div>

            <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Digest Emails</p>
                <p className="text-xs text-foreground-muted">
                  Receive summary emails about pending questionnaires and tasks
                </p>
              </div>
              <Switch
                checked={settings.enableDigestEmails}
                onCheckedChange={(checked) => handleChange("enableDigestEmails", checked)}
              />
            </div>

            {settings.enableDigestEmails && (
              <div className="ml-4 pl-4 border-l-2 border-[var(--card-border)] space-y-4">
                <Select
                  label="Digest Frequency"
                  value={settings.digestEmailFrequency}
                  onChange={(e) => handleChange("digestEmailFrequency", e.target.value)}
                  options={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly (Mondays)" },
                    { value: "none", label: "Never" },
                  ]}
                />

                <Select
                  label="Delivery Time"
                  value={settings.digestEmailTime || "08:00"}
                  onChange={(e) => handleChange("digestEmailTime", e.target.value)}
                  options={generateTimeOptions()}
                  helperText="Time is in your organization's timezone"
                />
              </div>
            )}
          </div>
        </div>

        {/* Test Email */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <SendIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Send Test Email</h2>
              <p className="text-sm text-foreground-muted">Verify your email settings are working correctly</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleSendTest}
              disabled={sendingTest || !testEmail}
            >
              {sendingTest ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" />
                  Sending...
                </span>
              ) : (
                "Send Test"
              )}
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {hasChanges && (
            <span className="flex items-center text-sm text-foreground-muted">
              <span className="mr-2 h-2 w-2 rounded-full bg-[var(--warning)]" />
              Unsaved changes
            </span>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function generateTimeOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (let hour = 0; hour < 24; hour++) {
    const h = hour.toString().padStart(2, "0");
    const ampm = hour < 12 ? "AM" : "PM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    options.push({
      value: `${h}:00`,
      label: `${displayHour}:00 ${ampm}`,
    });
  }
  return options;
}

// Helper functions
function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Email-specific icons (not in shared library)
function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

// Google Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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

// Microsoft Icon
function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
