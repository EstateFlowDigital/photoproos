"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { ArrowLeftIcon, MailIcon, BellIcon, MoonIcon, CheckIcon } from "@/components/ui/settings-icons";
import {
  getNotificationPreferences,
  updateAllNotificationSettings,
} from "@/lib/actions/notification-preferences";
import {
  type NotificationPreferences,
  type DigestSettings,
  type QuietHoursSettings,
  defaultNotificationPreferences,
  defaultDigestSettings,
  defaultQuietHours,
} from "@/lib/constants/notification-preferences";

const notificationTypes = [
  {
    id: "galleryDelivered",
    label: "Gallery Delivered",
    description: "When a gallery is delivered to a client",
  },
  {
    id: "galleryViewed",
    label: "Gallery Viewed",
    description: "When a client views their gallery",
  },
  {
    id: "paymentReceived",
    label: "Payment Received",
    description: "When a payment is successfully processed",
  },
  {
    id: "newBooking",
    label: "New Booking",
    description: "When a new booking is created or confirmed",
  },
  {
    id: "bookingReminder",
    label: "Booking Reminder",
    description: "24 hours before a scheduled shoot",
  },
  {
    id: "bookingCanceled",
    label: "Booking Canceled",
    description: "When a booking is canceled",
  },
  {
    id: "invoiceOverdue",
    label: "Invoice Overdue",
    description: "When an invoice becomes overdue",
  },
  {
    id: "contractSigned",
    label: "Contract Signed",
    description: "When a client signs a contract",
  },
  {
    id: "clientFeedback",
    label: "Client Feedback",
    description: "When a client leaves feedback on a gallery",
  },
  {
    id: "questionnaireCompleted",
    label: "Questionnaire Completed",
    description: "When a client completes a questionnaire",
  },
];

const digestFrequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "none", label: "Never" },
];

const dayOfWeekOptions = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function NotificationsSettingsPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [digest, setDigest] = useState<DigestSettings>(defaultDigestSettings);
  const [quietHours, setQuietHours] = useState<QuietHoursSettings>(defaultQuietHours);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences on mount
  const loadPreferences = useCallback(async () => {
    try {
      const result = await getNotificationPreferences();
      if (result.success && result.data) {
        setPreferences(result.data.preferences);
        setDigest(result.data.digest);
        setQuietHours(result.data.quietHours);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
      showToast("Failed to load notification preferences", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPreferences();
    // Check if push notifications are enabled
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, [loadPreferences]);

  const updateEmailPreference = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
    setHasChanges(true);
  };

  const updatePushPreference = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      push: { ...prev.push, [key]: value },
    }));
    setHasChanges(true);
  };

  const updateDigest = (updates: Partial<DigestSettings>) => {
    setDigest((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateQuietHours = (updates: Partial<QuietHoursSettings>) => {
    setQuietHours((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleEnablePush = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushEnabled(true);
        showToast("Push notifications enabled", "success");
      } else {
        showToast("Push notifications were denied. Please enable them in your browser settings.", "error");
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateAllNotificationSettings({
        preferences,
        digest,
        quietHours,
      });

      if (result.success) {
        showToast("Notification preferences saved", "success");
        setHasChanges(false);
      } else {
        showToast(result.error || "Failed to save preferences", "error");
      }
    } catch {
      showToast("Failed to save preferences", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Notification Preferences"
          subtitle="Choose how you want to be notified"
        />
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div data-element="settings-notifications-page" className="space-y-6">
      <PageHeader
        title="Notification Preferences"
        subtitle="Choose how you want to be notified"
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
        {/* Email Notifications */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <EmailIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Email Notifications</h2>
              <p className="text-sm text-foreground-muted">Receive notifications via email</p>
            </div>
          </div>

          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <NotificationToggle
                key={`email-${type.id}`}
                label={type.label}
                description={type.description}
                checked={preferences.email[type.id as keyof typeof preferences.email] ?? true}
                onChange={(checked) => updateEmailPreference(type.id, checked)}
              />
            ))}
          </div>
        </div>

        {/* Email Digest Configuration */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <DigestIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Email Digest</h2>
              <p className="text-sm text-foreground-muted">Receive a summary of your activity</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Digest Emails</p>
                <p className="text-xs text-foreground-muted">Get a summary of activity sent to your email</p>
              </div>
              <Switch
                checked={digest.enabled}
                onCheckedChange={(checked) => updateDigest({ enabled: checked })}
              />
            </div>

            <div className={cn("grid gap-4 sm:grid-cols-3", !digest.enabled && "opacity-50 pointer-events-none")}>
              <Select
                label="Frequency"
                value={digest.frequency}
                onChange={(e) => updateDigest({ frequency: e.target.value as DigestSettings["frequency"] })}
                options={digestFrequencyOptions}
              />

              <Select
                label="Send At"
                value={digest.time}
                onChange={(e) => updateDigest({ time: e.target.value })}
                options={generateTimeOptions()}
              />

              {digest.frequency === "weekly" && (
                <Select
                  label="Day of Week"
                  value={String(digest.dayOfWeek)}
                  onChange={(e) => updateDigest({ dayOfWeek: parseInt(e.target.value) })}
                  options={dayOfWeekOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
                />
              )}
            </div>

            <div className="rounded-lg bg-[var(--background)] p-4 mt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">What&apos;s included in the digest?</h4>
              <ul className="text-xs text-foreground-muted space-y-1">
                <li>• Summary of galleries delivered and viewed</li>
                <li>• Payments received and pending invoices</li>
                <li>• Upcoming bookings for the week</li>
                <li>• New contracts signed</li>
                <li>• Client feedback and questionnaire responses</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <BellIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Push Notifications</h2>
              <p className="text-sm text-foreground-muted">Receive real-time notifications on your device</p>
            </div>
          </div>

          {!pushEnabled ? (
            <div className="mb-4 p-4 rounded-lg bg-[var(--background)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable Push Notifications</p>
                  <p className="text-xs text-foreground-muted">Allow notifications in your browser</p>
                </div>
                <Button variant="primary" onClick={handleEnablePush}>
                  Enable
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
              <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                <CheckIcon className="h-4 w-4" />
                Push notifications are enabled
              </div>
            </div>
          )}

          <div className={cn("space-y-4", !pushEnabled && "opacity-50 pointer-events-none")}>
            {notificationTypes.map((type) => (
              <NotificationToggle
                key={`push-${type.id}`}
                label={type.label}
                description={type.description}
                checked={preferences.push[type.id as keyof typeof preferences.push] ?? false}
                onChange={(checked) => updatePushPreference(type.id, checked)}
              />
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--card-border)] bg-[var(--primary)]/10 text-[var(--primary)]">
              <MoonIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Quiet Hours</h2>
              <p className="text-sm text-foreground-muted">Pause notifications during specific hours</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Quiet Hours</p>
                <p className="text-xs text-foreground-muted">Push notifications will be silenced during this period</p>
              </div>
              <Switch
                checked={quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours({ enabled: checked })}
              />
            </div>

            <div className={cn("grid gap-4 sm:grid-cols-2", !quietHours.enabled && "opacity-50 pointer-events-none")}>
              <Select
                label="From"
                value={quietHours.from}
                onChange={(e) => updateQuietHours({ from: e.target.value })}
                options={generateTimeOptions()}
              />
              <Select
                label="To"
                value={quietHours.to}
                onChange={(e) => updateQuietHours({ to: e.target.value })}
                options={generateTimeOptions()}
              />
            </div>
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
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? "Saving..." : "Save Preferences"}
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

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Notifications-specific icons (not in shared library)
function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function DigestIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}
