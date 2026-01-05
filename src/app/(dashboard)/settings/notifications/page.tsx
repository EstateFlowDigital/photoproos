"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";

interface NotificationPreferences {
  email: {
    galleryDelivered: boolean;
    paymentReceived: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
    invoiceOverdue: boolean;
    weeklyDigest: boolean;
    marketingUpdates: boolean;
  };
  push: {
    galleryDelivered: boolean;
    paymentReceived: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
    invoiceOverdue: boolean;
    weeklyDigest: boolean;
    marketingUpdates: boolean;
  };
  quietHours: {
    enabled: boolean;
    from: string;
    to: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  email: {
    galleryDelivered: true,
    paymentReceived: true,
    newBooking: true,
    bookingReminder: true,
    invoiceOverdue: true,
    weeklyDigest: true,
    marketingUpdates: false,
  },
  push: {
    galleryDelivered: true,
    paymentReceived: true,
    newBooking: true,
    bookingReminder: false,
    invoiceOverdue: true,
    weeklyDigest: false,
    marketingUpdates: false,
  },
  quietHours: {
    enabled: false,
    from: "22:00",
    to: "07:00",
  },
};

const notificationTypes = [
  {
    id: "galleryDelivered",
    label: "Gallery Delivered",
    description: "When a client views or downloads their gallery",
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
    id: "invoiceOverdue",
    label: "Invoice Overdue",
    description: "When an invoice becomes overdue",
  },
  {
    id: "weeklyDigest",
    label: "Weekly Digest",
    description: "Summary of your week's activity every Sunday",
  },
  {
    id: "marketingUpdates",
    label: "Product Updates",
    description: "News about new features and improvements",
  },
];

const STORAGE_KEY = "photoproos_notification_preferences";

export default function NotificationsSettingsPage() {
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch {
        // Use defaults if parsing fails
      }
    }
  }, []);

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

  const updateQuietHours = (updates: Partial<NotificationPreferences["quietHours"]>) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: { ...prev.quietHours, ...updates },
    }));
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
      // Save to localStorage (simulating DB persistence)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      showToast("Notification preferences saved", "success");
      setHasChanges(false);
    } catch {
      showToast("Failed to save preferences", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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
                checked={preferences.email[type.id as keyof typeof preferences.email]}
                onChange={(checked) => updateEmailPreference(type.id, checked)}
              />
            ))}
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
              <p className="text-sm text-foreground-muted">Receive notifications on your device</p>
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
            {notificationTypes.slice(0, -1).map((type) => (
              <NotificationToggle
                key={`push-${type.id}`}
                label={type.label}
                description={type.description}
                checked={preferences.push[type.id as keyof typeof preferences.push]}
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
                <p className="text-xs text-foreground-muted">Notifications will be silenced during this period</p>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours({ enabled: checked })}
              />
            </div>

            <div className={cn("grid gap-4 sm:grid-cols-2", !preferences.quietHours.enabled && "opacity-50 pointer-events-none")}>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">From</label>
                <select
                  value={preferences.quietHours.from}
                  onChange={(e) => updateQuietHours({ from: e.target.value })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                >
                  {generateTimeOptions().map((time) => (
                    <option key={`from-${time.value}`} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">To</label>
                <select
                  value={preferences.quietHours.to}
                  onChange={(e) => updateQuietHours({ to: e.target.value })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                >
                  {generateTimeOptions().map((time) => (
                    <option key={`to-${time.value}`} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
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

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
