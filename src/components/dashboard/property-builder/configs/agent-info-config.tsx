"use client";

interface AgentInfoConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function AgentInfoConfig({ config, updateConfig }: AgentInfoConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Layout</label>
        <select
          value={(config.layout as string) || "card"}
          onChange={(e) => updateConfig("layout", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="card">Card (Centered)</option>
          <option value="horizontal">Horizontal</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showPhoto as boolean) ?? true}
            onChange={(e) => updateConfig("showPhoto", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Photo</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showPhone as boolean) ?? true}
            onChange={(e) => updateConfig("showPhone", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Phone Number</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showEmail as boolean) ?? true}
            onChange={(e) => updateConfig("showEmail", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Email</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showBrokerage as boolean) ?? true}
            onChange={(e) => updateConfig("showBrokerage", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Brokerage Info</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showSocial as boolean) ?? true}
            onChange={(e) => updateConfig("showSocial", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Social Links</span>
        </label>
      </div>

      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-filled:</span> Agent name, email, phone, and brokerage info are populated from your property settings.
        </p>
      </div>
    </div>
  );
}
