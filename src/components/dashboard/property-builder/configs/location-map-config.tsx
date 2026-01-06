"use client";

interface LocationMapConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function LocationMapConfig({ config, updateConfig }: LocationMapConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Map Style</label>
        <select
          value={(config.style as string) || "streets"}
          onChange={(e) => updateConfig("style", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="streets">Streets</option>
          <option value="satellite">Satellite</option>
          <option value="hybrid">Hybrid</option>
          <option value="terrain">Terrain</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Zoom Level ({(config.zoom as number) || 15})
        </label>
        <input
          type="range"
          min="10"
          max="20"
          value={(config.zoom as number) || 15}
          onChange={(e) => updateConfig("zoom", parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Height</label>
        <select
          value={(config.height as string) || "400px"}
          onChange={(e) => updateConfig("height", e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
        >
          <option value="300px">Small (300px)</option>
          <option value="400px">Medium (400px)</option>
          <option value="500px">Large (500px)</option>
          <option value="600px">Extra Large (600px)</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showMarker as boolean) ?? true}
            onChange={(e) => updateConfig("showMarker", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Property Marker</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showDirections as boolean) ?? true}
            onChange={(e) => updateConfig("showDirections", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Directions Link</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showStreetView as boolean) ?? true}
            onChange={(e) => updateConfig("showStreetView", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Street View Option</span>
        </label>
      </div>

      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-filled:</span> Address and location are populated from your property details.
        </p>
      </div>
    </div>
  );
}
