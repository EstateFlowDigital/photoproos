"use client";

import { useState, useEffect } from "react";
import type { NotificationPreferences, ClientData } from "../types";
import type { ClientBookingPreferences } from "@/lib/types/client-preferences";
import { updateClientBookingPreferences } from "@/lib/actions/client-preferences";

interface SettingsTabProps {
  client: ClientData;
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  galleryDelivered: true,
  invoiceSent: true,
  invoiceReminder: true,
  paymentConfirmed: true,
  questionnaireAssigned: true,
  marketingUpdates: false,
};

const NOTIFICATION_OPTIONS: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  category: "essential" | "reminders" | "marketing";
}[] = [
  {
    key: "galleryDelivered",
    label: "Gallery Delivery",
    description: "Get notified when new photo galleries are ready to view",
    category: "essential",
  },
  {
    key: "invoiceSent",
    label: "New Invoices",
    description: "Receive notifications when new invoices are created",
    category: "essential",
  },
  {
    key: "paymentConfirmed",
    label: "Payment Confirmations",
    description: "Get receipts and confirmation when payments are processed",
    category: "essential",
  },
  {
    key: "questionnaireAssigned",
    label: "New Questionnaires",
    description: "Be notified when questionnaires require your input",
    category: "essential",
  },
  {
    key: "invoiceReminder",
    label: "Invoice Reminders",
    description: "Receive reminders for upcoming or overdue invoices",
    category: "reminders",
  },
  {
    key: "marketingUpdates",
    label: "Marketing Updates",
    description: "Occasional updates about new services and special offers",
    category: "marketing",
  },
];

const INDUSTRY_OPTIONS = [
  { value: "real_estate", label: "Real Estate" },
  { value: "commercial", label: "Commercial" },
  { value: "events", label: "Events" },
  { value: "portraits", label: "Portraits" },
  { value: "food", label: "Food" },
  { value: "product", label: "Product" },
];

const THANK_YOU_OPTIONS = [
  { value: "gift_card", label: "Gift card" },
  { value: "discount", label: "Discount on next shoot" },
  { value: "prints", label: "Prints or album" },
  { value: "surprise", label: "Surprise me" },
];

const SHOOT_PREFERENCE_OPTIONS = [
  {
    key: "pref_blinds",
    label: "Blinds",
    options: [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
      { value: "photographer", label: "Photographer decides" },
    ],
  },
  {
    key: "pref_lights",
    label: "Lights",
    options: [
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
      { value: "mixed", label: "Mixed" },
    ],
  },
  {
    key: "pref_background",
    label: "Portrait Background",
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "neutral", label: "Neutral" },
      { value: "custom", label: "Custom" },
    ],
  },
  {
    key: "pref_retouching",
    label: "Retouching",
    options: [
      { value: "light", label: "Light" },
      { value: "standard", label: "Standard" },
      { value: "editorial", label: "Editorial" },
    ],
  },
];

export function SettingsTab({ client, onPreferencesChange }: SettingsTabProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`portal_notification_prefs_${client.id}`);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    }
    return DEFAULT_PREFERENCES;
  });
  const [saved, setSaved] = useState(false);
  const [bookingPreferences, setBookingPreferences] = useState<ClientBookingPreferences>(() => ({
    profile: {
      birthDate: client.preferences?.booking?.profile?.birthDate || "",
      thankYouPreference: client.preferences?.booking?.profile?.thankYouPreference || "",
      giftPreferenceNotes: client.preferences?.booking?.profile?.giftPreferenceNotes || "",
    },
    preferences: client.preferences?.booking?.preferences || {},
    agreements: client.preferences?.booking?.agreements || {},
    preferredIndustry: client.preferences?.booking?.preferredIndustry || "",
  }));
  const [bookingSaved, setBookingSaved] = useState(false);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Persist preferences to localStorage
  useEffect(() => {
    localStorage.setItem(
      `portal_notification_prefs_${client.id}`,
      JSON.stringify(preferences)
    );
    onPreferencesChange?.(preferences);
  }, [preferences, client.id, onPreferencesChange]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return updated;
    });
  };

  const handleEnableAll = () => {
    setPreferences({
      galleryDelivered: true,
      invoiceSent: true,
      invoiceReminder: true,
      paymentConfirmed: true,
      questionnaireAssigned: true,
      marketingUpdates: true,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDisableNonEssential = () => {
    setPreferences({
      galleryDelivered: true,
      invoiceSent: true,
      invoiceReminder: false,
      paymentConfirmed: true,
      questionnaireAssigned: true,
      marketingUpdates: false,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBookingProfileChange = (key: keyof NonNullable<ClientBookingPreferences["profile"]>, value: string) => {
    setBookingPreferences((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value,
      },
    }));
  };

  const handleBookingPreferenceChange = (key: string, value: string) => {
    setBookingPreferences((prev) => ({
      ...prev,
      preferences: {
        ...(prev.preferences || {}),
        [key]: value,
      },
    }));
  };

  const handleSaveBookingPreferences = async () => {
    setBookingSaving(true);
    setBookingError(null);
    const result = await updateClientBookingPreferences({
      profile: bookingPreferences.profile,
      preferences: bookingPreferences.preferences,
      agreements: bookingPreferences.agreements,
      preferredIndustry: bookingPreferences.preferredIndustry,
    });
    setBookingSaving(false);

    if (result.success) {
      setBookingSaved(true);
      setTimeout(() => setBookingSaved(false), 2000);
    } else {
      setBookingError(result.error || "Could not save preferences. Please try again.");
    }
  };

  const essentialOptions = NOTIFICATION_OPTIONS.filter((o) => o.category === "essential");
  const reminderOptions = NOTIFICATION_OPTIONS.filter((o) => o.category === "reminders");
  const marketingOptions = NOTIFICATION_OPTIONS.filter((o) => o.category === "marketing");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Notification Preferences
            </h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Choose which email notifications you&apos;d like to receive
            </p>
          </div>
          {saved && (
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--success)]/10 px-3 py-1 text-xs font-medium text-[var(--success)]">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleEnableAll}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
          >
            Enable All
          </button>
          <button
            onClick={handleDisableNonEssential}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
          >
            Essential Only
          </button>
        </div>
      </div>

      {/* Essential Notifications */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="border-b border-[var(--card-border)] bg-[var(--background-tertiary)] px-6 py-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Essential Notifications
          </h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            Important updates about your projects and payments
          </p>
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {essentialOptions.map((option) => (
            <NotificationToggle
              key={option.key}
              label={option.label}
              description={option.description}
              enabled={preferences[option.key]}
              onToggle={() => handleToggle(option.key)}
            />
          ))}
        </div>
      </div>

      {/* Reminder Notifications */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="border-b border-[var(--card-border)] bg-[var(--background-tertiary)] px-6 py-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Reminders
          </h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            Helpful reminders to keep you on track
          </p>
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {reminderOptions.map((option) => (
            <NotificationToggle
              key={option.key}
              label={option.label}
              description={option.description}
              enabled={preferences[option.key]}
              onToggle={() => handleToggle(option.key)}
            />
          ))}
        </div>
      </div>

      {/* Marketing Notifications */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="border-b border-[var(--card-border)] bg-[var(--background-tertiary)] px-6 py-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Marketing & Updates
          </h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            Optional promotional content
          </p>
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {marketingOptions.map((option) => (
            <NotificationToggle
              key={option.key}
              label={option.label}
              description={option.description}
              enabled={preferences[option.key]}
              onToggle={() => handleToggle(option.key)}
            />
          ))}
        </div>
      </div>

      {/* Shoot Preferences */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Shoot Preferences
            </h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Save preferences so new booking requests auto-fill for you.
            </p>
          </div>
          {bookingSaved && (
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--success)]/10 px-3 py-1 text-xs font-medium text-[var(--success)]">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SettingsSelect
            label="Preferred Shoot Type"
            value={bookingPreferences.preferredIndustry || ""}
            options={INDUSTRY_OPTIONS}
            onChange={(value) =>
              setBookingPreferences((prev) => ({ ...prev, preferredIndustry: value }))
            }
          />
          <SettingsInput
            label="Birthdate"
            type="date"
            value={bookingPreferences.profile?.birthDate || ""}
            onChange={(value) => handleBookingProfileChange("birthDate", value)}
          />
          <SettingsSelect
            label="Thank You Preference"
            value={bookingPreferences.profile?.thankYouPreference || ""}
            options={THANK_YOU_OPTIONS}
            onChange={(value) => handleBookingProfileChange("thankYouPreference", value)}
          />
          <SettingsInput
            label="Gift Notes"
            value={bookingPreferences.profile?.giftPreferenceNotes || ""}
            placeholder="Anything we should keep in mind?"
            onChange={(value) => handleBookingProfileChange("giftPreferenceNotes", value)}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SHOOT_PREFERENCE_OPTIONS.map((preference) => (
            <SettingsSelect
              key={preference.key}
              label={preference.label}
              value={bookingPreferences.preferences?.[preference.key] || ""}
              options={preference.options}
              onChange={(value) => handleBookingPreferenceChange(preference.key, value)}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveBookingPreferences}
            disabled={bookingSaving}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {bookingSaving ? "Saving..." : "Save Preferences"}
          </button>
          {bookingError && (
            <span className="text-xs text-red-500">{bookingError}</span>
          )}
          {bookingPreferences.agreements?.policyAcceptedAt && (
            <span className="text-xs text-[var(--foreground-muted)]">
              {formatDateLabel(bookingPreferences.agreements.policyAcceptedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Notification Delivery
        </h3>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Notifications will be sent to:
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-[var(--background)] px-4 py-3">
          <MailIcon className="h-5 w-5 text-[var(--foreground-muted)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">
            {client.email}
          </span>
        </div>
        <p className="mt-3 text-xs text-[var(--foreground-muted)]">
          To update your email address, please contact your photographer.
        </p>
      </div>
    </div>
  );
}

// Toggle Component
interface NotificationToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function NotificationToggle({
  label,
  description,
  enabled,
  onToggle,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        <p className="text-xs text-[var(--foreground-muted)]">{description}</p>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        aria-label={`${label} notifications ${enabled ? "enabled" : "disabled"}`}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)] ${
          enabled ? "bg-[var(--primary)]" : "bg-[var(--foreground-muted)]/30"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

function SettingsInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: SettingsInputProps) {
  return (
    <label className="text-sm text-[var(--foreground)]">
      <span className="block mb-1 font-medium">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
    </label>
  );
}

interface SettingsSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function SettingsSelect({
  label,
  value,
  onChange,
  options,
}: SettingsSelectProps) {
  return (
    <label className="text-sm text-[var(--foreground)]">
      <span className="block mb-1 font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatDateLabel(dateString: string | undefined) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return `Policy accepted on ${date.toLocaleDateString()}`;
}

// Icons
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}
