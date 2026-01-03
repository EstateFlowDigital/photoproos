"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
  type EmailSettings,
} from "@/lib/actions/email-settings";

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
  const { showToast } = useToast();
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const result = await getEmailSettings();
        if (result.success && result.settings) {
          setSettings({
            emailSenderName: result.settings.emailSenderName || "",
            emailReplyTo: result.settings.emailReplyTo || "",
            emailSignature: result.settings.emailSignature || "",
            enableQuestionnaireEmails: result.settings.enableQuestionnaireEmails,
            enableDigestEmails: result.settings.enableDigestEmails,
            digestEmailFrequency: result.settings.digestEmailFrequency as "daily" | "weekly" | "none",
            digestEmailTime: result.settings.digestEmailTime || "08:00",
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        showToast("Failed to load email settings", "error");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [showToast]);

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
    <div className="space-y-6">
      <PageHeader
        title="Email Settings"
        subtitle="Configure how emails are sent from your organization"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      <div className="space-y-6">
        {/* Sender Information */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <MailIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sender Information</h2>
              <p className="text-sm text-foreground-muted">Customize how your emails appear to recipients</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Sender Name
              </label>
              <input
                type="text"
                value={settings.emailSenderName || ""}
                onChange={(e) => handleChange("emailSenderName", e.target.value)}
                placeholder="Your organization name"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                This name will appear in the "From" field of emails
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Reply-To Email
              </label>
              <input
                type="email"
                value={settings.emailReplyTo || ""}
                onChange={(e) => handleChange("emailReplyTo", e.target.value)}
                placeholder="your-email@example.com"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                Replies to your emails will be sent to this address
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Signature
              </label>
              <textarea
                value={settings.emailSignature || ""}
                onChange={(e) => handleChange("emailSignature", e.target.value)}
                placeholder="Best regards,&#10;Your Name&#10;Your Company"
                rows={4}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none resize-none"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                This signature will be added to the end of certain emails
              </p>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <BellIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Email Notifications</h2>
              <p className="text-sm text-foreground-muted">Control which automatic emails are sent</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Questionnaire Emails</p>
                <p className="text-xs text-foreground-muted">
                  Send notifications when questionnaires are assigned, reminded, or completed
                </p>
              </div>
              <ToggleSwitch
                checked={settings.enableQuestionnaireEmails}
                onChange={(checked) => handleChange("enableQuestionnaireEmails", checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Digest Emails</p>
                <p className="text-xs text-foreground-muted">
                  Receive summary emails about pending questionnaires and tasks
                </p>
              </div>
              <ToggleSwitch
                checked={settings.enableDigestEmails}
                onChange={(checked) => handleChange("enableDigestEmails", checked)}
              />
            </div>

            {settings.enableDigestEmails && (
              <div className="ml-4 pl-4 border-l-2 border-[var(--card-border)] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Digest Frequency
                  </label>
                  <select
                    value={settings.digestEmailFrequency}
                    onChange={(e) => handleChange("digestEmailFrequency", e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly (Mondays)</option>
                    <option value="none">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Delivery Time
                  </label>
                  <select
                    value={settings.digestEmailTime || "08:00"}
                    onChange={(e) => handleChange("digestEmailTime", e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                  >
                    {generateTimeOptions().map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-foreground-muted">
                    Time is in your organization's timezone
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Email */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <SendIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Send Test Email</h2>
              <p className="text-sm text-foreground-muted">Verify your email settings are working correctly</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
            <button
              onClick={handleSendTest}
              disabled={sendingTest || !testEmail}
              className="rounded-lg bg-[var(--background-secondary)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingTest ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" />
                  Sending...
                </span>
              ) : (
                "Send Test"
              )}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          {hasChanges && (
            <span className="flex items-center text-sm text-foreground-muted">
              <span className="mr-2 h-2 w-2 rounded-full bg-[var(--warning)]" />
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function generateTimeOptions() {
  const options = [];
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

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer",
        checked ? "bg-[var(--primary)]" : "bg-[var(--background-hover)]"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
