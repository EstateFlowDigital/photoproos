"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive?: boolean;
  lastUsedAt?: Date | null;
  expiresAt?: Date | null;
  createdAt?: Date | null;
};

interface ZapierSettingsClientProps {
  apiKeys: ApiKey[];
}

export function ZapierSettingsClient({ apiKeys }: ZapierSettingsClientProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = (prefix: string) => {
    navigator.clipboard.writeText(prefix);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  return (
    <div className="space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Zapier Webhooks</p>
          <p className="text-xs text-foreground-muted">
            Use your API keys to authenticate Zapier webhooks and triggers.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="text-xs"
        >
          <a href="https://zapier.com/apps/photoproos/integrations" target="_blank" rel="noreferrer">
            View Zap templates
          </a>
        </Button>
      </div>

      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Available API keys</p>
          <span className="text-xs text-foreground-muted">
            Manage keys in Integrations &gt; API Keys
          </span>
        </div>

        {apiKeys.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--card-border)] bg-[var(--card)] p-3 text-sm text-foreground-muted">
            No API keys yet. Create one in <span className="font-semibold">Integrations &gt; API Keys</span> then paste the
            full key into your Zap&apos;s authentication step.
          </div>
        ) : (
          <div className="grid gap-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-md border border-[var(--card-border)] bg-[var(--card)] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{key.name}</p>
                  <p className="text-xs text-foreground-muted">
                    Prefix: {key.keyPrefix} • Scopes: {key.scopes.join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {key.expiresAt && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
                      Expires {new Date(key.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(key.keyPrefix)}
                    className={cn("text-xs", showCopied && "ring-2 ring-[var(--primary)]")}
                  >
                    Copy prefix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-md border border-dashed border-[var(--card-border)] bg-[var(--background)] p-3 text-xs text-foreground-muted leading-relaxed">
          <p className="font-semibold text-foreground mb-1">How to use with Zapier</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create an API key in Integrations &gt; API Keys.</li>
            <li>Install the PhotoProOS Zapier app (private/beta).</li>
            <li>When prompted, paste your full API key (prefix shown above).</li>
            <li>Use the Webhook trigger or actions to connect galleries, invoices, and projects.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
