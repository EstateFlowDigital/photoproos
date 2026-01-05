"use client";

import { useState, useEffect } from "react";
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
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Sender Information */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
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

// Email-specific icons (not in shared library)
function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}
