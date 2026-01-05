"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendlySettingsClientProps {
  initialConfig: unknown;
}

export function CalendlySettingsClient({ initialConfig }: CalendlySettingsClientProps) {
  const connected = Boolean(initialConfig);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Calendly sync</p>
          <p className="text-xs text-foreground-muted">
            Import bookings automatically from your Calendly scheduling pages.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
            connected
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
              : "bg-[var(--background-hover)] text-foreground-secondary"
          )}
        >
          {connected ? "Connected" : "Not connected"}
        </span>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background)] px-4 py-6 text-center space-y-2">
        <p className="text-sm text-foreground">
          Calendly integration is coming soon. You&apos;ll be able to map events to services and sync guests automatically.
        </p>
        <p className="text-xs text-foreground-muted">
          In the meantime, you can share your public booking pages or connect ICS feeds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button asChild variant="outline">
            <Link href="/settings/calendar">Go to Calendar Settings</Link>
          </Button>
          <Button asChild>
            <Link href="mailto:support@photoproos.com?subject=Calendly%20beta%20access">
              Request Beta Access
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
