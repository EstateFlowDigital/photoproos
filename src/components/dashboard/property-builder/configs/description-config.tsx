"use client";

interface DescriptionConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function DescriptionConfig({ config, updateConfig }: DescriptionConfigProps) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={(config.showTitle as boolean) ?? true}
          onChange={(e) => updateConfig("showTitle", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
        />
        <span className="text-sm text-foreground">Show Section Title</span>
      </label>

      {(config.showTitle as boolean) !== false && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
          <input
            type="text"
            value={(config.title as string) || "About This Property"}
            onChange={(e) => updateConfig("title", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Text Alignment</label>
        <select
          value={(config.alignment as string) || "left"}
          onChange={(e) => updateConfig("alignment", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={(config.showReadMore as boolean) ?? false}
          onChange={(e) => updateConfig("showReadMore", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
        />
        <span className="text-sm text-foreground">Truncate with "Read More"</span>
      </label>

      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-filled:</span> Description and headline are populated from your property details.
        </p>
      </div>
    </div>
  );
}
