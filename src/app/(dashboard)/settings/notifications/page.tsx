export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo notification preferences
const demoPreferences = {
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

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Preferences"
        subtitle="Choose how you want to be notified"
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

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Changes will not be saved. This is a preview of notification settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
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
                defaultChecked={demoPreferences.email[type.id as keyof typeof demoPreferences.email]}
              />
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <BellIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Push Notifications</h2>
              <p className="text-sm text-foreground-muted">Receive notifications on your device</p>
            </div>
          </div>

          <div className="mb-4 p-4 rounded-lg bg-[var(--background)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Push Notifications</p>
                <p className="text-xs text-foreground-muted">Allow notifications in your browser</p>
              </div>
              <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
                Enable
              </button>
            </div>
          </div>

          <div className="space-y-4 opacity-50 pointer-events-none">
            {notificationTypes.slice(0, -1).map((type) => (
              <NotificationToggle
                key={`push-${type.id}`}
                label={type.label}
                description={type.description}
                defaultChecked={demoPreferences.push[type.id as keyof typeof demoPreferences.push]}
              />
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <MoonIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Quiet Hours</h2>
              <p className="text-sm text-foreground-muted">Pause notifications during specific hours</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Quiet Hours</p>
                <p className="text-xs text-foreground-muted">Notifications will be silenced during this period</p>
              </div>
              <ToggleSwitch defaultChecked={false} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 opacity-50">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">From</label>
                <select className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground">
                  <option>10:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">To</label>
                <select className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground">
                  <option>7:00 AM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            disabled
            className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <ToggleSwitch defaultChecked={defaultChecked} />
    </div>
  );
}

function ToggleSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={defaultChecked}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
        defaultChecked ? "bg-[var(--primary)]" : "bg-[var(--background-hover)]"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          defaultChecked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
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
