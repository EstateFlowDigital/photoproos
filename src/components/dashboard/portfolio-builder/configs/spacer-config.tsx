"use client";

interface SpacerConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

export function SpacerConfigForm({ config, updateConfig }: SpacerConfigFormProps) {
  const height = (config.height as number) || 80;

  const presets = [
    { label: "Small", value: 40 },
    { label: "Medium", value: 80 },
    { label: "Large", value: 120 },
    { label: "Extra Large", value: 200 },
  ];

  return (
    <div className="space-y-5">
      {/* Height Slider */}
      <div>
        <label htmlFor="spacer-height-slider" className="text-sm font-medium text-foreground">
          Spacer Height
        </label>
        <div className="mt-3 space-y-4">
          <input
            id="spacer-height-slider"
            type="range"
            min={20}
            max={300}
            step={10}
            value={height}
            onChange={(e) => updateConfig({ height: parseInt(e.target.value, 10) })}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--background-secondary)]"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground-muted">20px</span>
            <span className="text-sm font-medium text-foreground">{height}px</span>
            <span className="text-xs text-foreground-muted">300px</span>
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Quick Presets
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => updateConfig({ height: preset.value })}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                height === preset.value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground hover:bg-[var(--background-elevated)]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Preview */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Preview
        </label>
        <div className="mt-2 rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
          <div
            className="mx-auto w-full max-w-xs bg-[var(--primary)]/20 transition-all duration-200"
            style={{ height: `${Math.min(height, 150)}px` }}
          >
            <div className="flex h-full items-center justify-center text-xs text-foreground-muted">
              {height}px
            </div>
          </div>
          {height > 150 && (
            <p className="mt-2 text-center text-xs text-foreground-muted">
              (Preview scaled down)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
