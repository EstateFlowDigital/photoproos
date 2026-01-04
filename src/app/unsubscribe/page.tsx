"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface ClientPreferences {
  email: string;
  emailOptIn: boolean;
  questionnaireEmailsOptIn: boolean;
  marketingEmailsOptIn: boolean;
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preferences, setPreferences] = useState<ClientPreferences | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid unsubscribe link");
      setLoading(false);
      return;
    }

    // Fetch current preferences
    fetch(`/api/unsubscribe?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPreferences(data);
        }
      })
      .catch(() => {
        setError("Failed to load preferences");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleSave = async () => {
    if (!token || !preferences) return;

    setSaving(true);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ...preferences,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          emailOptIn: false,
          questionnaireEmailsOptIn: false,
          marketingEmailsOptIn: false,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        setPreferences((prev) =>
          prev
            ? {
                ...prev,
                emailOptIn: false,
                questionnaireEmailsOptIn: false,
                marketingEmailsOptIn: false,
              }
            : null
        );
      }
    } catch {
      setError("Failed to unsubscribe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto text-white" />
          <p className="mt-4 text-white/60">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/10 p-6">
            <AlertIcon className="h-12 w-12 mx-auto text-[var(--error)]" />
            <h1 className="mt-4 text-xl font-semibold text-white">Invalid Link</h1>
            <p className="mt-2 text-white/60">{error}</p>
            <p className="mt-4 text-sm text-white/40">
              This unsubscribe link may have expired or is invalid. If you need to manage your
              email preferences, please contact the photographer directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="rounded-xl border border-[var(--success)]/20 bg-[var(--success)]/10 p-6">
            <CheckIcon className="h-12 w-12 mx-auto text-[var(--success)]" />
            <h1 className="mt-4 text-xl font-semibold text-white">Preferences Updated</h1>
            <p className="mt-2 text-white/60">
              Your email preferences have been saved successfully.
            </p>
            <p className="mt-4 text-sm text-white/40">You can close this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
          <div className="text-center mb-6">
            <MailIcon className="h-12 w-12 mx-auto text-[var(--primary)]" />
            <h1 className="mt-4 text-xl font-semibold text-white">Email Preferences</h1>
            <p className="mt-2 text-sm text-white/60">
              Manage your email notification settings
            </p>
            {preferences?.email && (
              <p className="mt-1 text-xs text-white/40">{preferences.email}</p>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <PreferenceToggle
              label="All Emails"
              description="Receive any email communications"
              checked={preferences?.emailOptIn ?? true}
              onChange={(checked) =>
                setPreferences((prev) => (prev ? { ...prev, emailOptIn: checked } : null))
              }
            />

            <PreferenceToggle
              label="Questionnaire Emails"
              description="Notifications about questionnaires and forms"
              checked={preferences?.questionnaireEmailsOptIn ?? true}
              onChange={(checked) =>
                setPreferences((prev) =>
                  prev ? { ...prev, questionnaireEmailsOptIn: checked } : null
                )
              }
              disabled={!preferences?.emailOptIn}
            />

            <PreferenceToggle
              label="Marketing Emails"
              description="Promotional content and updates"
              checked={preferences?.marketingEmailsOptIn ?? false}
              onChange={(checked) =>
                setPreferences((prev) =>
                  prev ? { ...prev, marketingEmailsOptIn: checked } : null
                )
              }
              disabled={!preferences?.emailOptIn}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>

            <button
              onClick={handleUnsubscribeAll}
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Unsubscribe from All Emails
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          These preferences only affect emails from this photographer. Changes may take up to 24
          hours to take effect.
        </p>
      </div>
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-white/60">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer",
          checked ? "bg-blue-600" : "bg-white/20"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

// Icons
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <LoadingSpinner className="h-8 w-8 text-white" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
