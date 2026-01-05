"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MailchimpSettingsClient() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Mailchimp sync</p>
          <p className="text-xs text-foreground-muted">
            Automatically sync clients and segments to Mailchimp audiences.
          </p>
        </div>
        <span className="inline-flex h-7 items-center rounded-full bg-[var(--background-hover)] px-3 text-xs font-semibold text-foreground-secondary">
          Coming soon
        </span>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background)] px-4 py-6 text-center space-y-2">
        <p className="text-sm text-foreground">
          Mailchimp integration is coming soon. We&apos;ll let you map tags, sync segments, and trigger automations.
        </p>
        <p className="text-xs text-foreground-muted">
          Want early access? Let us know and we&apos;ll enable it for your workspace.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button asChild>
            <Link href="mailto:support@photoproos.com?subject=Mailchimp%20beta%20access">
              Request beta
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
