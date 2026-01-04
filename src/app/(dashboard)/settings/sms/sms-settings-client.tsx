"use client";

import { useState } from "react";
import { StatCard } from "@/components/dashboard";
import { updateSMSSettings, sendTestSMS, seedDefaultTemplates } from "@/lib/actions/sms";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SMSTemplateType, SMSDeliveryStatus } from "@prisma/client";

interface SMSSettings {
  smsEnabled: boolean;
  twilioAccountSid: string | null;
  twilioAuthToken: string | null;
  twilioPhoneNumber: string | null;
}

interface SMSStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  templateType: SMSTemplateType;
  content: string;
  isActive: boolean;
  isDefault: boolean;
  _count: { smsLogs: number };
}

interface SMSLog {
  id: string;
  toPhone: string;
  content: string;
  deliveryStatus: SMSDeliveryStatus;
  sentAt: Date | null;
  createdAt: Date;
  template: { name: string; templateType: SMSTemplateType } | null;
}

interface Props {
  settings: SMSSettings;
  stats: SMSStats;
  templates: SMSTemplate[];
  recentLogs: SMSLog[];
}

export function SMSSettingsClient({ settings, stats, templates, recentLogs }: Props) {
  const [formData, setFormData] = useState({
    smsEnabled: settings.smsEnabled,
    twilioAccountSid: settings.twilioAccountSid || "",
    twilioAuthToken: settings.twilioAuthToken || "",
    twilioPhoneNumber: settings.twilioPhoneNumber || "",
  });
  const [testPhone, setTestPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSaveSettings() {
    setSaving(true);
    setMessage(null);

    try {
      const result = await updateSMSSettings({
        smsEnabled: formData.smsEnabled,
        twilioAccountSid: formData.twilioAccountSid || null,
        twilioAuthToken: formData.twilioAuthToken || null,
        twilioPhoneNumber: formData.twilioPhoneNumber || null,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Settings saved successfully" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTestSMS() {
    if (!testPhone) return;

    setTesting(true);
    setMessage(null);

    try {
      const result = await sendTestSMS(testPhone);

      if (result.success) {
        setMessage({ type: "success", text: "Test SMS sent successfully" });
        setTestPhone("");
      } else {
        setMessage({ type: "error", text: result.error || "Failed to send test SMS" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setTesting(false);
    }
  }

  async function handleSeedTemplates() {
    setSeeding(true);
    setMessage(null);

    try {
      const result = await seedDefaultTemplates();

      if (result.success) {
        setMessage({ type: "success", text: "Default templates created successfully" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to create templates" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSeeding(false);
    }
  }

  const statusColors: Record<SMSDeliveryStatus, string> = {
    queued: "bg-yellow-500/10 text-yellow-400",
    sent: "bg-blue-500/10 text-blue-400",
    delivered: "bg-green-500/10 text-green-400",
    failed: "bg-red-500/10 text-red-400",
    undelivered: "bg-orange-500/10 text-orange-400",
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="auto-grid grid-min-200 grid-gap-4">
        <StatCard
          label="Total Sent"
          value={stats.totalSent.toLocaleString()}
          icon={<MessageIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Delivered"
          value={stats.delivered.toLocaleString()}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          change={stats.totalSent > 0 ? `${stats.deliveryRate}%` : undefined}
          positive={stats.deliveryRate > 90}
        />
        <StatCard
          label="Failed"
          value={stats.failed.toLocaleString()}
          icon={<XCircleIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Pending"
          value={stats.pending.toLocaleString()}
          icon={<ClockIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Delivery Rate"
          value={`${stats.deliveryRate}%`}
          icon={<ChartIcon className="h-5 w-5" />}
        />
      </div>

      {/* Message */}
      {message && (
        <div
          className={cn(
            "rounded-lg p-4 text-sm",
            message.type === "success"
              ? "bg-[var(--success)]/10 text-[var(--success)]"
              : "bg-[var(--error)]/10 text-[var(--error)]"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Twilio Configuration */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Twilio Configuration</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.smsEnabled}
                  onChange={(e) => setFormData({ ...formData, smsEnabled: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-[var(--background-tertiary)] peer-checked:bg-[var(--primary)] peer-focus:ring-2 peer-focus:ring-[var(--primary)]/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
              <span className="text-sm text-foreground">Enable SMS Notifications</span>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Account SID
              </label>
              <input
                type="text"
                value={formData.twilioAccountSid}
                onChange={(e) => setFormData({ ...formData, twilioAccountSid: e.target.value })}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Auth Token
              </label>
              <input
                type="password"
                value={formData.twilioAuthToken}
                onChange={(e) => setFormData({ ...formData, twilioAuthToken: e.target.value })}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                Leave blank to keep existing token
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.twilioPhoneNumber}
                onChange={(e) => setFormData({ ...formData, twilioPhoneNumber: e.target.value })}
                placeholder="+1234567890"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                Your Twilio phone number in E.164 format
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Test SMS */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Send Test SMS</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>

              <button
                onClick={handleSendTestSMS}
                disabled={testing || !testPhone || !formData.smsEnabled}
                className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {testing ? "Sending..." : "Send Test Message"}
              </button>

              {!formData.smsEnabled && (
                <p className="text-xs text-foreground-muted">
                  Enable SMS notifications to send test messages
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <button
                onClick={handleSeedTemplates}
                disabled={seeding}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                {seeding ? "Creating..." : "Create Default Templates"}
              </button>

              <Link
                href="/settings/sms/templates"
                className="block w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Manage Message Templates
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Overview */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Message Templates</h2>
          <Link
            href="/settings/sms/templates"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            View All
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-foreground-muted">No templates configured</p>
            <button
              onClick={handleSeedTemplates}
              disabled={seeding}
              className="mt-3 text-sm text-[var(--primary)] hover:underline disabled:opacity-50"
            >
              {seeding ? "Creating..." : "Create default templates"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.slice(0, 6).map((template) => (
              <Link
                key={template.id}
                href={`/settings/sms/templates?edit=${template.id}`}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 transition-colors hover:bg-[var(--background-hover)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{template.name}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      template.isActive
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                    )}
                  >
                    {template.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground-muted">
                  {template._count.smsLogs} messages sent
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent SMS Logs */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="border-b border-[var(--card-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Messages</h2>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-foreground-muted">No messages sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--background-tertiary)]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Sent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--background-hover)]">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{log.toPhone}</p>
                      <p className="mt-0.5 text-xs text-foreground-muted line-clamp-1 max-w-xs">
                        {log.content}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {log.template?.name || "Manual"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          statusColors[log.deliveryStatus]
                        )}
                      >
                        {log.deliveryStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground-muted">
                      {log.sentAt
                        ? new Date(log.sentAt).toLocaleString()
                        : new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <InfoIcon className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">About SMS Notifications</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              SMS notifications keep your clients informed about their bookings, galleries, and invoices.
              You can use your own Twilio account for full control over messaging, or use the platform&apos;s
              shared infrastructure. Standard SMS rates apply based on your Twilio plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 0 1-5.183.501.78.78 0 0 0-.528.224l-3.579 3.58A.75.75 0 0 1 6 17.25v-3.443a41.033 41.033 0 0 1-2.57-.33C1.993 13.244 1 11.986 1 10.573V5.426c0-1.413.993-2.67 2.43-2.902Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  );
}
