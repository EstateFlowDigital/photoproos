"use client";

interface FeaturesConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function FeaturesConfig({ config, updateConfig }: FeaturesConfigProps) {
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
          <option value="list">List</option>
          <option value="categories">Categories</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Columns</label>
        <select
          value={(config.columns as number) || 2}
          onChange={(e) => updateConfig("columns", parseInt(e.target.value))}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Icon Style</label>
        <select
          value={(config.iconStyle as string) || "circle"}
          onChange={(e) => updateConfig("iconStyle", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="circle">Circle Background</option>
          <option value="square">Square Background</option>
          <option value="none">No Background (Icon Only)</option>
          <option value="checkmark">Checkmark</option>
        </select>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={(config.showCategories as boolean) ?? false}
          onChange={(e) => updateConfig("showCategories", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
        />
        <span className="text-sm text-foreground">Group by Categories</span>
      </label>

      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-filled:</span> Features are automatically populated from your property's feature list.
        </p>
      </div>
    </div>
  );
}
