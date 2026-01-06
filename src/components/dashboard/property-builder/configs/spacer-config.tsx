"use client";

interface SpacerConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
  sectionType: string;
}

export function SpacerConfig({ config, updateConfig, sectionType }: SpacerConfigProps) {
  const isDivider = sectionType === "divider";

  return (
    <div className="space-y-4">
      {!isDivider && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Height ({(config.height as number) || 80}px)
          </label>
          <input
            type="range"
            min="20"
            max="200"
            step="10"
            value={(config.height as number) || 80}
            onChange={(e) => updateConfig("height", parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {!isDivider && (
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showDivider as boolean) ?? false}
            onChange={(e) => updateConfig("showDivider", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show Divider Line</span>
        </label>
      )}

      {(isDivider || (config.showDivider as boolean)) && (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Divider Style</label>
            <select
              value={(config.style as string) || "solid"}
              onChange={(e) => updateConfig("style", e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Width</label>
            <select
              value={(config.width as string) || "50%"}
              onChange={(e) => updateConfig("width", e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
            >
              <option value="25%">25%</option>
              <option value="50%">50%</option>
              <option value="75%">75%</option>
              <option value="100%">Full Width</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Color</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={(config.color as string) || ""}
                onChange={(e) => updateConfig("color", e.target.value)}
                placeholder="Default (theme color)"
                className="h-10 flex-1 rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
              />
              <input
                type="color"
                value={(config.color as string) || "#454545"}
                onChange={(e) => updateConfig("color", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-[var(--card-border)]"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
