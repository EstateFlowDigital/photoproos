"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { updateClientEmailPreferences } from "@/lib/actions/clients";

interface ClientEmailPreferencesProps {
  clientId: string;
  initialPreferences: {
    emailOptIn: boolean;
    smsOptIn: boolean;
    questionnaireEmailsOptIn: boolean;
    marketingEmailsOptIn: boolean;
  };
}

interface PreferenceOption {
  key: "emailOptIn" | "smsOptIn" | "questionnaireEmailsOptIn" | "marketingEmailsOptIn";
  label: string;
  description: string;
  icon: React.ReactNode;
}

const preferenceOptions: PreferenceOption[] = [
  {
    key: "emailOptIn",
    label: "Transactional Emails",
    description: "Gallery deliveries, invoices, receipts",
    icon: <EmailIcon className="h-4 w-4" />,
  },
  {
    key: "smsOptIn",
    label: "SMS Notifications",
    description: "Text messages for bookings & reminders",
    icon: <PhoneIcon className="h-4 w-4" />,
  },
  {
    key: "questionnaireEmailsOptIn",
    label: "Questionnaire Emails",
    description: "Pre-shoot questionnaires & reminders",
    icon: <QuestionnaireIcon className="h-4 w-4" />,
  },
  {
    key: "marketingEmailsOptIn",
    label: "Marketing Emails",
    description: "Promotions, newsletters, updates",
    icon: <MarketingIcon className="h-4 w-4" />,
  },
];

export function ClientEmailPreferences({
  clientId,
  initialPreferences,
}: ClientEmailPreferencesProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [preferences, setPreferences] = useState(initialPreferences);

  const handleToggle = async (key: PreferenceOption["key"]) => {
    const newValue = !preferences[key];

    // Optimistically update
    setPreferences((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    startTransition(async () => {
      const result = await updateClientEmailPreferences({
        clientId,
        [key]: newValue,
      });

      if (result.success) {
        showToast(
          `${preferenceOptions.find((p) => p.key === key)?.label} ${newValue ? "enabled" : "disabled"}`,
          "success"
        );
        router.refresh();
      } else {
        // Revert on error
        setPreferences((prev) => ({
          ...prev,
          [key]: !newValue,
        }));
        showToast(result.error || "Failed to update preference", "error");
      }
    });
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Communication Preferences</h2>
        {isPending && (
          <span className="text-xs text-foreground-muted">Saving...</span>
        )}
      </div>

      <div className="space-y-3">
        {preferenceOptions.map((option) => (
          <div
            key={option.key}
            className={cn(
              "flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between",
              preferences[option.key]
                ? "border-[var(--primary)]/20 bg-[var(--primary)]/5"
                : "border-[var(--card-border)] bg-[var(--background)]"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  preferences[option.key]
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                )}
              >
                {option.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-foreground-muted">{option.description}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences[option.key]}
              disabled={isPending}
              onClick={() => handleToggle(option.key)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] disabled:cursor-not-allowed disabled:opacity-50",
                preferences[option.key] ? "bg-[var(--primary)]" : "bg-[var(--foreground-muted)]/30"
              )}
            >
              <span className="sr-only">Toggle {option.label}</span>
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  preferences[option.key] ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-foreground-muted">
        These preferences control which communications this client receives. Disabling transactional emails may affect gallery delivery and invoice notifications.
      </p>
    </div>
  );
}

// Icon Components
function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function QuestionnaireIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function MarketingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13.92 3.845a19.361 19.361 0 0 1-6.3 1.98c-.626.095-.998.695-.863 1.31l1.576 7.18a.999.999 0 0 0 1.482.64l.103-.058c.446-.25.815-.603 1.065-1.034l2.207 1.103a.75.75 0 0 0 1.098-.572l1.128-5.018c.24-1.071.136-2.2-.344-3.192a4.492 4.492 0 0 0-1.152-1.339ZM4.594 14.534l.69-3.069 3.47-.612-1.004 4.58a1 1 0 0 1-1.964-.212l-1.192-.687ZM14 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
    </svg>
  );
}
