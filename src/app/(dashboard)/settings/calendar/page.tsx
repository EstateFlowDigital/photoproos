export const dynamic = "force-dynamic";

import Link from "next/link";
import { getGoogleCalendarConfig } from "@/lib/actions/google-calendar";
import { CalendarSettingsClient } from "./calendar-settings-client";

export default async function CalendarSettingsPage() {
  const configResult = await getGoogleCalendarConfig();
  const config = configResult.success ? configResult.data : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Google Calendar
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Sync your bookings with Google Calendar
          </p>
        </div>
        <Link
          href="/settings/integrations"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Integrations
        </Link>
      </div>

      <CalendarSettingsClient initialConfig={config} />
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
