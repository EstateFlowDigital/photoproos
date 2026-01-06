"use client";

interface DetailsConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function DetailsConfig({ config, updateConfig }: DetailsConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Layout</label>
        <select
          value={(config.layout as string) || "grid"}
          onChange={(e) => updateConfig("layout", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="grid">Grid</option>
          <option value="horizontal">Horizontal Row</option>
          <option value="cards">Cards</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Columns</label>
        <select
          value={(config.columns as number) || 6}
          onChange={(e) => updateConfig("columns", parseInt(e.target.value))}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
          <option value={6}>6 Columns</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showIcons as boolean) ?? true}
            onChange={(e) => updateConfig("showIcons", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Icons</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showLabels as boolean) ?? true}
            onChange={(e) => updateConfig("showLabels", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Labels</span>
        </label>
      </div>

      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-filled:</span> Beds, Baths, Sq. Ft., Lot Size, Year Built, and Property Type are automatically populated from your property details.
        </p>
      </div>
    </div>
  );
}
