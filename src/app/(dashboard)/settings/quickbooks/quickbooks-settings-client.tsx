"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuickBooksSettingsClientProps {
  initialConfig: unknown;
}

export function QuickBooksSettingsClient({ initialConfig }: QuickBooksSettingsClientProps) {
  const connected = Boolean(initialConfig);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">QuickBooks Online</p>
          <p className="text-xs text-foreground-muted">Sync invoices, payments, and customers automatically.</p>
        </div>
        <span
          className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold ${
            connected
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
              : "bg-[var(--background-hover)] text-foreground-secondary"
          }`}
        >
          {connected ? "Connected" : "Coming soon"}
        </span>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background)] px-4 py-6 text-center space-y-2">
        <p className="text-sm text-foreground">
          QuickBooks sync is in progress. We&apos;ll support customer sync, invoice export, and payout matching.
        </p>
        <p className="text-xs text-foreground-muted">
          Want to be first in line? Join the beta list and we&apos;ll notify you.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button asChild>
            <Link href="mailto:support@photoproos.com?subject=QuickBooks%20beta%20access">
              Join beta list
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings/integrations">Back to integrations</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
